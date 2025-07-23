
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  chat_room_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'system';
  image_url?: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatRoom {
  id: string;
  participant_1: string;
  participant_2: string;
  swap_request_id: string;
  created_at: string;
  updated_at: string;
}

export const useRealTimeChat = (user: User, swapRequestId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const findOrCreateChatRoom = async () => {
    if (!swapRequestId) return;

    try {
      // Get swap request details
      const { data: swapRequest, error: swapError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', swapRequestId)
        .single();

      if (swapError) throw swapError;

      // Check if chat room already exists for this swap request
      const { data: existingRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('swap_request_id', swapRequestId)
        .single();

      if (existingRoom) {
        setChatRoom(existingRoom);
      } else {
        // Create new chat room
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            participant_1: swapRequest.requester_id,
            participant_2: swapRequest.owner_id,
            swap_request_id: swapRequestId
          })
          .select()
          .single();

        if (createError) throw createError;

        setChatRoom(newRoom);
      }
    } catch (error: any) {
      console.error('Error finding/creating chat room:', error);
      toast({
        title: "Error",
        description: "Failed to load chat room",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        ...msg,
        status: 'delivered' as const,
        message_type: (msg.message_type as 'text' | 'image' | 'system') || 'text'
      })) as ChatMessage[];

      setMessages(formattedMessages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' = 'text', imageUrl?: string) => {
    if (!chatRoom || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoom.id,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          image_url: imageUrl,
          status: 'sent'
        });

      if (error) throw error;

      // Message will be added via real-time subscription
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    }
  };

  const sendImage = async (imageFile: File) => {
    if (!chatRoom) return;

    try {
      // Upload image to Supabase storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      // Send message with image
      await sendMessage('Image', 'image', publicUrl);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send image",
        variant: "destructive",
      });
      console.error('Error sending image:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!chatRoom) return;

    console.log('Setting up real-time subscription for chat room:', chatRoom.id);

    const channel = supabase
      .channel(`chat_room_${chatRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = {
            ...payload.new,
            status: 'delivered' as const,
            message_type: (payload.new.message_type as 'text' | 'image' | 'system') || 'text'
          } as ChatMessage;
          
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.find(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('Adding new message to list:', newMessage);
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [chatRoom]);

  // Initialize chat room and load messages
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await findOrCreateChatRoom();
      setLoading(false);
    };

    if (swapRequestId) {
      init();
    }
  }, [swapRequestId]);

  // Load messages when chat room is set
  useEffect(() => {
    if (chatRoom) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom]);

  const submitRating = async (ratedUserId: string, rating: number, comment: string, swapRequestId: string) => {
    try {
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          rater_user_id: user.id,
          rated_user_id: ratedUserId,
          rating,
          comment,
          swap_request_id: swapRequestId
        });

      if (error) throw error;

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
      console.error('Error submitting rating:', error);
    }
  };

  return {
    messages,
    chatRoom,
    loading,
    sendMessage,
    sendImage,
    submitRating
  };
};
