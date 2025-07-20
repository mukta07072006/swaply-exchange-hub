-- Fix the user profile creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, location, rating, total_swaps)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'Location not set',
    5.0,
    0
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add location-based filtering to swap_items table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_location') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_location text DEFAULT 'all';
  END IF;
END $$;

-- Create a table for user ratings
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rated_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rater_user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  swap_request_id uuid REFERENCES public.swap_requests(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(rated_user_id, rater_user_id, swap_request_id)
);

-- Enable RLS on user_ratings
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ratings
CREATE POLICY "Users can view all ratings" ON public.user_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for completed swaps" ON public.user_ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_user_id AND
    EXISTS (
      SELECT 1 FROM public.swap_requests 
      WHERE id = swap_request_id 
      AND status = 'completed'
      AND (requester_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- Create a function to calculate average rating
CREATE OR REPLACE FUNCTION public.calculate_user_rating(user_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating), 5.0)
  FROM public.user_ratings
  WHERE rated_user_id = user_uuid;
$$;

-- Create function to update user rating when new rating is added
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET rating = public.calculate_user_rating(NEW.rated_user_id)
  WHERE user_id = NEW.rated_user_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update rating
CREATE TRIGGER update_profile_rating
  AFTER INSERT ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Add 'completed' status to swap_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%swap_requests_status_check%' 
    AND check_clause LIKE '%completed%'
  ) THEN
    ALTER TABLE public.swap_requests 
    DROP CONSTRAINT IF EXISTS swap_requests_status_check;
    
    ALTER TABLE public.swap_requests 
    ADD CONSTRAINT swap_requests_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));
  END IF;
END $$;

-- Create notification system
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean DEFAULT false,
  related_id uuid, -- Can reference swap_request, item, etc.
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to send notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text DEFAULT 'info',
  related_item_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (target_user_id, notification_title, notification_message, notification_type, related_item_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger function for swap request notifications
CREATE OR REPLACE FUNCTION public.notify_swap_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify the owner of the requested item
  PERFORM public.create_notification(
    NEW.owner_id,
    'New Swap Request',
    'Someone wants to swap with your item!',
    'swap_request',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for swap request notifications
DROP TRIGGER IF EXISTS notify_new_swap_request ON public.swap_requests;
CREATE TRIGGER notify_new_swap_request
  AFTER INSERT ON public.swap_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_swap_request();