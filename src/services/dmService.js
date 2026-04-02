import { supabase } from './supabaseClient';

export const dmService = {
  async getConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('dm_conversations')
        .select(`
          *,
          participant1:user_profiles!dm_conversations_participant1_id_fkey(id, username, full_name, avatar_url),
          participant2:user_profiles!dm_conversations_participant2_id_fkey(id, username, full_name, avatar_url)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(conv => {
        const otherUser = conv.participant1_id === user.id ? conv.participant2 : conv.participant1;
        return {
          id: conv.id,
          otherUser,
          lastMessage: conv.last_message,
          lastMessageAt: conv.updated_at,
          unreadCount: conv.participant1_id === user.id ? conv.unread_count_1 : conv.unread_count_2,
        };
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getOrCreateConversation(otherUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      // Check existing
      const { data: existing } = await supabase
        .from('dm_conversations')
        .select('id')
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) return existing.id;

      const { data, error } = await supabase
        .from('dm_conversations')
        .insert({ participant1_id: user.id, participant2_id: otherUserId })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .select(`
          *,
          sender:user_profiles!dm_messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(conversationId, content) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('dm_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select(`*, sender:user_profiles!dm_messages_sender_id_fkey(id, username, full_name, avatar_url)`)
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('dm_conversations')
        .update({ last_message: content, updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('dm_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.warn('Error marking messages read:', error);
    }
  },

  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`dm_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => callback(payload.new))
      .subscribe();
  },

  async getUnreadTotal() {
    try {
      const conversations = await this.getConversations();
      return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    } catch (error) {
      console.warn('Error fetching unread total:', error);
      return 0;
    }
  },

  subscribeToAllMessages(userId, callback) {
    return supabase
      .channel('dm_global')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
      }, (payload) => {
        if (payload.new?.sender_id !== userId) callback(payload.new);
      })
      .subscribe();
  },

  unsubscribe(channel) {
    if (channel) supabase.removeChannel(channel);
  },
};

export default dmService;
