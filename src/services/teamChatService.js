import { supabase } from '../lib/supabase';

/**
 * Team Chat Service - ENHANCED VERSION
 * Real-time team communication with typing indicators and presence
 */
export const teamChatService = {
  // Create a new channel
  async createChannel(teamId, name, description = '', isPrivate = false) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('team_channels')
        ?.insert({
          team_id: teamId,
          name: name,
          description: description,
          is_private: isPrivate,
          created_by: user?.id
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // Add creator as member
      await supabase
        ?.from('team_channel_members')
        ?.insert({
          channel_id: data?.id,
          user_id: user?.id,
          role: 'admin'
        });

      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  },

  // Get channels for a team - ENHANCED with caching
  async getTeamChannels(teamId) {
    try {
      const cacheKey = `team_channels_${teamId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        ?.from('team_channels')
        ?.select(`
          *,
          team_channel_members(count),
          user_profiles!team_channels_created_by_fkey(full_name, username, avatar_url)
        `)
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      // Cache for 2 minutes
      this.setCache(cacheKey, data, 120000);

      return data || [];
    } catch (error) {
      console.error('Error fetching team channels:', error);
      return [];
    }
  },

  // Get messages for a channel - ENHANCED with pagination
  async getChannelMessages(channelId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        ?.from('team_messages')
        ?.select(`
          *,
          user_profiles!team_messages_user_id_fkey(id, full_name, username, avatar_url),
          message_reactions(
            id,
            reaction,
            user_id
          )
        `)
        ?.eq('channel_id', channelId)
        ?.is('parent_message_id', null)
        ?.order('created_at', { ascending: false })
        ?.range(offset, offset + limit - 1);

      if (error) throw error;

      // Return in correct order (oldest first)
      return (data || [])?.reverse();
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      return [];
    }
  },

  // Send a message - ENHANCED with optimistic updates
  async sendMessage(channelId, content, messageType = 'text', metadata = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Stop typing indicator
      this.stopTyping(channelId, user?.id);

      const { data, error } = await supabase
        ?.from('team_messages')
        ?.insert({
          channel_id: channelId,
          user_id: user?.id,
          content: content,
          message_type: messageType,
          metadata: metadata
        })
        ?.select(`
          *,
          user_profiles!team_messages_user_id_fkey(id, full_name, username, avatar_url)
        `)
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('team_messages')
        ?.delete()
        ?.eq('id', messageId)
        ?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Edit a message - NEW
  async editMessage(messageId, newContent) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('team_messages')
        ?.update({
          content: newContent,
          is_edited: true,
          edited_at: new Date()?.toISOString()
        })
        ?.eq('id', messageId)
        ?.eq('user_id', user?.id)
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  // Add reaction to message
  async addReaction(messageId, reaction) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if reaction already exists
      const { data: existing } = await supabase
        ?.from('message_reactions')
        ?.select('id')
        ?.eq('message_id', messageId)
        ?.eq('user_id', user?.id)
        ?.eq('reaction', reaction)
        ?.maybeSingle();

      if (existing) {
        // Remove reaction if already exists
        await this.removeReaction(existing?.id);
        return null;
      }

      const { data, error } = await supabase
        ?.from('message_reactions')
        ?.insert({
          message_id: messageId,
          user_id: user?.id,
          reaction: reaction
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  // Remove reaction from message
  async removeReaction(reactionId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('message_reactions')
        ?.delete()
        ?.eq('id', reactionId)
        ?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  // Get channel members
  async getChannelMembers(channelId) {
    try {
      const { data, error } = await supabase
        ?.from('team_channel_members')
        ?.select(`
          *,
          user_profiles(id, full_name, username, avatar_url, role)
        `)
        ?.eq('channel_id', channelId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching channel members:', error);
      return [];
    }
  },

  // Add member to channel
  async addChannelMember(channelId, userId, role = 'member') {
    try {
      const { data, error } = await supabase
        ?.from('team_channel_members')
        ?.insert({
          channel_id: channelId,
          user_id: userId,
          role: role
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // Clear channel cache
      this.clearChannelCache(channelId);

      return data;
    } catch (error) {
      console.error('Error adding channel member:', error);
      throw error;
    }
  },

  // Remove member from channel
  async removeChannelMember(channelId, userId) {
    try {
      const { error } = await supabase
        ?.from('team_channel_members')
        ?.delete()
        ?.eq('channel_id', channelId)
        ?.eq('user_id', userId);

      if (error) throw error;

      // Clear channel cache
      this.clearChannelCache(channelId);
    } catch (error) {
      console.error('Error removing channel member:', error);
      throw error;
    }
  },

  // Subscribe to new messages in a channel - ENHANCED
  subscribeToChannel(channelId, callbacks = {}) {
    if (!supabase) {
      console.error('Supabase client not available');
      return { unsubscribe: () => {} };
    }

    const channel = supabase?.channel(`channel-${channelId}`);

    // Subscribe to new messages
    if (callbacks?.onMessage) {
      channel?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_messages',
        filter: `channel_id=eq.${channelId}`
      }, callbacks?.onMessage);
    }

    // Subscribe to message updates (edits)
    if (callbacks?.onMessageUpdate) {
      channel?.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'team_messages',
        filter: `channel_id=eq.${channelId}`
      }, callbacks?.onMessageUpdate);
    }

    // Subscribe to message deletions
    if (callbacks?.onMessageDelete) {
      channel?.on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'team_messages',
        filter: `channel_id=eq.${channelId}`
      }, callbacks?.onMessageDelete);
    }

    // Subscribe to reactions
    if (callbacks?.onReaction) {
      channel?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions'
      }, callbacks?.onReaction);
    }

    // Subscribe to the channel
    channel?.subscribe();

    // Return an object with unsubscribe method
    return {
      unsubscribe: () => {
        if (channel) {
          supabase?.removeChannel(channel);
        }
      }
    };
  },

  // Typing indicator - NEW
  typingTimeouts: new Map(),

  startTyping(channelId, userId) {
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts?.get(`${channelId}_${userId}`);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Broadcast typing status
    const channel = supabase?.channel(`typing-${channelId}`);
    channel?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: true }
    });

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      this.stopTyping(channelId, userId);
    }, 3000);

    this.typingTimeouts?.set(`${channelId}_${userId}`, timeout);
  },

  stopTyping(channelId, userId) {
    const existingTimeout = this.typingTimeouts?.get(`${channelId}_${userId}`);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts?.delete(`${channelId}_${userId}`);
    }

    // Broadcast stopped typing
    const channel = supabase?.channel(`typing-${channelId}`);
    channel?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping: false }
    });
  },

  // Subscribe to typing indicators - NEW
  subscribeToTyping(channelId, callback) {
    const channel = supabase?.channel(`typing-${channelId}`);
    channel?.on('broadcast', { event: 'typing' }, callback);
    return channel?.subscribe();
  },

  // Mark messages as read - NEW
  async markAsRead(channelId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Implementation depends on whether you have a read_receipts table
      // For now, we'll just update last_seen timestamp on channel member
      const { error } = await supabase
        ?.from('team_channel_members')
        ?.update({ last_seen: new Date()?.toISOString() })
        ?.eq('channel_id', channelId)?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Get unread message count - NEW
  async getUnreadCount(channelId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's last_seen timestamp
      const { data: member } = await supabase
        ?.from('team_channel_members')
        ?.select('last_seen')
        ?.eq('channel_id', channelId)
        ?.eq('user_id', user?.id)
        ?.single();

      if (!member?.last_seen) return 0;

      // Count messages since last_seen
      const { count, error } = await supabase
        ?.from('team_messages')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('channel_id', channelId)
        ?.gt('created_at', member?.last_seen);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Search messages in channel - NEW
  async searchMessages(channelId, query) {
    try {
      const { data, error } = await supabase
        ?.from('team_messages')
        ?.select(`
          *,
          user_profiles!team_messages_user_id_fkey(id, full_name, username, avatar_url)
        `)
        ?.eq('channel_id', channelId)
        ?.ilike('content', `%${query}%`)
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  },

  // Cache management
  cache: new Map(),

  getFromCache(key) {
    const item = this.cache?.get(key);
    if (!item) return null;

    if (Date.now() > item?.expiry) {
      this.cache?.delete(key);
      return null;
    }

    return item?.data;
  },

  setCache(key, data, ttl) {
    this.cache?.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  },

  clearChannelCache(channelId) {
    const keys = Array.from(this.cache?.keys());
    keys?.forEach(key => {
      if (key?.includes(`channel_${channelId}`) || key?.includes(`team_channels_`)) {
        this.cache?.delete(key);
      }
    });
  }
};
