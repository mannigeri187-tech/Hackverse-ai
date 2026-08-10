import { Conversation, Message } from '../types/chat';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class ChatStorageService {
  private static STORAGE_KEY_SESSIONS = 'hv_enterprise_chat_sessions';
  private static STORAGE_KEY_MESSAGES_PREFIX = 'hv_enterprise_chat_msgs_';

  // Fetch or fallback conversations
  static async getConversations(): Promise<Conversation[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .order('updatedAt', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Conversation[];
        }
      } catch (err) {
        console.warn('[ChatStorageService] Supabase read failed, using localStorage:', err);
      }
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save conversation
  static async saveConversation(conversation: Conversation): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('conversations').upsert(conversation);
      } catch (err) {
        console.warn('[ChatStorageService] Supabase conversation upsert failed:', err);
      }
    }

    try {
      const conversations = await this.getConversations();
      const existingIdx = conversations.findIndex(c => c.id === conversation.id);
      if (existingIdx >= 0) {
        conversations[existingIdx] = conversation;
      } else {
        conversations.unshift(conversation);
      }
      localStorage.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(conversations));
    } catch (err) {
      console.error('[ChatStorageService] LocalStorage conversation save failed:', err);
    }
  }

  // Fetch messages for a conversation
  static async getMessages(conversationId: string): Promise<Message[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversationId', conversationId)
          .order('createdAt', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Message[];
        }
      } catch (err) {
        console.warn('[ChatStorageService] Supabase messages read failed, using localStorage:', err);
      }
    }

    try {
      const saved = localStorage.getItem(`${this.STORAGE_KEY_MESSAGES_PREFIX}${conversationId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save messages for a conversation
  static async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('messages').upsert(messages);
      } catch (err) {
        console.warn('[ChatStorageService] Supabase messages upsert failed:', err);
      }
    }

    try {
      localStorage.setItem(`${this.STORAGE_KEY_MESSAGES_PREFIX}${conversationId}`, JSON.stringify(messages));
    } catch (err) {
      console.error('[ChatStorageService] LocalStorage save messages failed:', err);
    }
  }

  // Delete conversation
  static async deleteConversation(conversationId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('messages').delete().eq('conversationId', conversationId);
        await supabase.from('conversations').delete().eq('id', conversationId);
      } catch (err) {
        console.warn('[ChatStorageService] Supabase delete failed:', err);
      }
    }

    try {
      const conversations = await this.getConversations();
      const filtered = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem(this.STORAGE_KEY_SESSIONS, JSON.stringify(filtered));
      localStorage.removeItem(`${this.STORAGE_KEY_MESSAGES_PREFIX}${conversationId}`);
    } catch (err) {
      console.error('[ChatStorageService] LocalStorage delete failed:', err);
    }
  }
}
