import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export const useFavorites = (user: User | null) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data.map(fav => fav.item_id));
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;

    try {
      const isFavorited = favorites.includes(itemId);

      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== itemId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, item_id: itemId });

        if (error) throw error;

        setFavorites(prev => [...prev, itemId]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return { favorites, toggleFavorite };
};