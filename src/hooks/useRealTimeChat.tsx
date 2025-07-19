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

export const useRealTimeChat = (user: User, otherUserId?: string, swapItemId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createChatRoom = async () => {
    if (!otherUserId || !swapItemId) return null;

    try {
      // First create a swap request
      const { data: swapRequest, error: swapError } = await supabase
        .from('swap_requests')
        .insert({
          requester_id: user.id,
          owner_id: otherUserId,
          requested_item_id: swapItemId,
          offered_item_id: swapItemId, // TODO: Should be selected by user
          status: 'pending',
          message: `Hi! I'm interested in swapping for your item.`
        })
        .select()
        .single();

      if (swapError) throw swapError;

      // Then create chat room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          swap_request_id: swapRequest.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      setChatRoom(room);
      return room;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      });
      console.error('Error creating chat room:', error);
      return null;
    }
  };

  const findOrCreateChatRoom = async () => {
    if (!otherUserId) return;

    try {
      // Check if chat room already exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();

      if (existingRoom) {
        setChatRoom(existingRoom);
      } else {
        await createChatRoom();
      }
    } catch (error) {
      console.error('Error finding chat room:', error);
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

      // Don't add to local state here - let real-time subscription handle it
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!chatRoom) return;

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
          const newMessage = {
            ...payload.new,
            status: 'delivered' as const
          } as ChatMessage;
          
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
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

    if (otherUserId) {
      init();
    }
  }, [otherUserId]);

  // Load messages when chat room is set
  useEffect(() => {
    if (chatRoom) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom]);

  return {
    messages,
    chatRoom,
    loading,
    sendMessage
  };
};