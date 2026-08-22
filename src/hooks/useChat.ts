import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url: string;
    username: string;
  };
}

export interface ChatChannel {
  id: string;
  type: 'direct' | 'team';
  team_id?: string;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

export function useChat(channelId?: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all channels the user is part of
  const fetchChannels = useCallback(async () => {
    if (!user) return;
    try {
      const { data: participants, error: pError } = await supabase
        .from('chat_participants')
        .select('channel_id')
        .eq('user_id', user.id);

      if (pError || !participants?.length) {
        setChannels([]);
        return;
      }

      const channelIds = participants.map(p => p.channel_id);

      // Fetch channel details and the "other" participants for direct chats
      const { data: channelData, error: cError } = await supabase
        .from('chat_channels')
        .select('id, type, team_id, created_at')
        .in('id', channelIds);

      if (cError) throw cError;

      const formattedChannels: ChatChannel[] = [];
      for (const ch of channelData) {
        let other_user;
        if (ch.type === 'direct') {
          // find the other participant
          const { data: others } = await supabase
            .from('chat_participants')
            .select('user_id, profiles!chat_participants_user_id_fkey(name, avatar_url, username)')
            .eq('channel_id', ch.id)
            .neq('user_id', user.id)
            .single();
            
          if (others && others.profiles) {
            const profileData: any = Array.isArray(others.profiles) ? others.profiles[0] : others.profiles;
            other_user = {
              id: others.user_id,
              name: profileData?.name || profileData?.username,
              avatar_url: profileData?.avatar_url
            };
          }
        }
        formattedChannels.push({ ...ch, other_user });
      }

      // Sort by latest created
      formattedChannels.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setChannels(formattedChannels);
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  }, [user]);

  // Load messages for a specific channel
  const fetchMessages = useCallback(async (cId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles!chat_messages_sender_id_fkey(name, avatar_url, username)')
        .eq('channel_id', cId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!channelId || !user) {
      setMessages([]);
      return;
    }

    fetchMessages(channelId);

    const subscription = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch sender profile info to append to the realtime message
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url, username')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage = { ...payload.new, profiles: profile } as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId, user, fetchMessages]);

  const sendMessage = async (cId: string, content: string) => {
    if (!user || !content.trim()) return null;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: cId,
          sender_id: user.id,
          content: content.trim()
        });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const getOrCreateDirectChannel = async (otherUserId: string) => {
    if (!user) return null;
    try {
      // 1. Check if a direct channel already exists
      // Find all channels where current user is a participant
      const { data: myChannels } = await supabase
        .from('chat_participants')
        .select('channel_id')
        .eq('user_id', user.id);
        
      if (myChannels && myChannels.length > 0) {
        const cIds = myChannels.map(c => c.channel_id);
        // Find if other user is in any of these channels
        const { data: sharedChannels } = await supabase
          .from('chat_participants')
          .select('channel_id')
          .eq('user_id', otherUserId)
          .in('channel_id', cIds);
          
        if (sharedChannels && sharedChannels.length > 0) {
          // Verify it's a direct channel
          const { data: channelDef } = await supabase
            .from('chat_channels')
            .select('id')
            .eq('id', sharedChannels[0].channel_id)
            .eq('type', 'direct')
            .single();
            
          if (channelDef) return channelDef.id;
        }
      }

      // 2. If not, create a new direct channel
      const { data: newChannel, error: channelError } = await supabase
        .from('chat_channels')
        .insert({ type: 'direct' })
        .select()
        .single();
        
      if (channelError) throw channelError;

      // 3. Add both participants
      const { error: partError } = await supabase
        .from('chat_participants')
        .insert([
          { channel_id: newChannel.id, user_id: user.id },
          { channel_id: newChannel.id, user_id: otherUserId }
        ]);

      if (partError) throw partError;
      
      return newChannel.id;
    } catch (err) {
      console.error('Error creating direct channel:', err);
      return null;
    }
  };

  return {
    messages,
    channels,
    isLoading,
    fetchChannels,
    sendMessage,
    getOrCreateDirectChannel
  };
}
