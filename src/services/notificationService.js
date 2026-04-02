import { supabase } from '../lib/supabase';

class NotificationService {
  // Get unread notification count
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        ?.from('notifications')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('user_id', user?.id)
        ?.eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  }

  // Get all notifications for current user
  async getNotifications(limit = 50) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('notifications')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('notifications')
        ?.update({ 
          is_read: true,
          read_at: new Date()?.toISOString()
        })
        ?.eq('id', notificationId)
        ?.eq('user_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('notifications')
        ?.update({ 
          is_read: true,
          read_at: new Date()?.toISOString()
        })
        ?.eq('user_id', user?.id)
        ?.eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Subscribe to real-time notification changes
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      ?.channel('notifications_changes')
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      ?.subscribe();

    return channel;
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }

  async deleteNotification(notificationId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        ?.from('notifications')
        ?.delete()
        ?.eq('id', notificationId)
        ?.eq('user_id', user?.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async deleteMultiple(notificationIds) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        ?.from('notifications')
        ?.delete()
        ?.in('id', notificationIds)
        ?.eq('user_id', user?.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw error;
    }
  }

  async getPreferences() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return {};
      const { data, error } = await supabase
        ?.from('notification_preferences')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.maybeSingle();
      if (error) throw error;
      return data || {
        email_comments: true, email_likes: true, email_follows: true,
        email_mentions: true, email_bugs: true, email_teams: true,
        push_comments: true, push_likes: true, push_follows: true,
        push_mentions: true, push_bugs: true, push_teams: true,
        inapp_comments: true, inapp_likes: true, inapp_follows: true,
        inapp_mentions: true, inapp_bugs: true, inapp_teams: true,
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return {};
    }
  }

  async updatePreferences(preferences) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        ?.from('notification_preferences')
        ?.upsert({ user_id: user?.id, ...preferences }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  async createNotification(userId, type, title, message, metadata = {}) {
    try {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          priority: metadata?.priority || 'medium',
          metadata: JSON.stringify(metadata),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Failed to create notification:', error);
      return null;
    }
  }
}

// Create single instance
const notificationServiceInstance = new NotificationService();

// Export as both default and named export with correct name 'notificationService'
export default notificationServiceInstance;
export const notificationService = notificationServiceInstance;