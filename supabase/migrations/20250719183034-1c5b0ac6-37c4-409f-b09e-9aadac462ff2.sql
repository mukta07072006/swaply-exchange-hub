-- Fix database relationships and add storage
-- Add foreign key constraint for swap_items to profiles via user_id
ALTER TABLE public.swap_items 
ADD CONSTRAINT swap_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true);

-- Create storage policies for item images
CREATE POLICY "Item images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'item-images');

CREATE POLICY "Users can upload item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);