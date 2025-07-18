import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SwapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  preferredItems: string[];
  location: string | null;
  status: string;
  createdAt: string;
  user_id: string;
  owner: {
    name: string;
    avatar: string;
  };
}

export const useSwapItems = () => {
  const [items, setItems] = useState<SwapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('swap_items')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      const userIds = [...new Set(data.map(item => item.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const formattedItems = data.map(item => {
        const profile = profiles?.find(p => p.user_id === item.user_id);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.categories?.name || 'Other',
          images: item.images || [],
          preferredItems: item.preferred_items || [],
          location: item.location,
          status: item.status,
          createdAt: item.created_at,
          user_id: item.user_id,
          owner: {
            name: profile?.display_name || 'Unknown User',
            avatar: profile?.avatar_url || '',
          }
        };
      });

      setItems(formattedItems);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, refetch: fetchItems };
};