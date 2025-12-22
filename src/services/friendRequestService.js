import { supabase } from '../lib/supabase';

class FriendRequestService {
  // Send friend request
  async sendFriendRequest(receiverId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('friend_requests')?.insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending'
        })?.select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey(id, full_name, avatar_url, username),
          receiver:user_profiles!friend_requests_receiver_id_fkey(id, full_name, avatar_url, username)
        `)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Get pending friend requests (received)
  async getPendingRequests() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('friend_requests')?.select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey(id, full_name, avatar_url, username, bio)
        `)?.eq('receiver_id', user?.id)?.eq('status', 'pending')?.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  // Get sent friend requests
  async getSentRequests() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('friend_requests')?.select(`
          *,
          receiver:user_profiles!friend_requests_receiver_id_fkey(id, full_name, avatar_url, username)
        `)?.eq('sender_id', user?.id)?.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      throw error;
    }
  }

  // Accept friend request
  async acceptFriendRequest(requestId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update friend request status
      const { data: request, error: updateError } = await supabase?.from('friend_requests')?.update({ status: 'accepted' })?.eq('id', requestId)?.eq('receiver_id', user?.id)?.select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey(id)
        `)?.single();

      if (updateError) throw updateError;

      // Create mutual follow relationship
      const { error: followError1 } = await supabase?.from('follows')?.insert({
          follower_id: user?.id,
          following_id: request?.sender?.id
        });

      const { error: followError2 } = await supabase?.from('follows')?.insert({
          follower_id: request?.sender?.id,
          following_id: user?.id
        });

      if (followError1 || followError2) {
        console.warn('Error creating follow relationship:', followError1 || followError2);
      }

      return request;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  // Reject friend request
  async rejectFriendRequest(requestId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('friend_requests')?.update({ status: 'rejected' })?.eq('id', requestId)?.eq('receiver_id', user?.id)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  // Cancel sent friend request
  async cancelFriendRequest(requestId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase?.from('friend_requests')?.delete()?.eq('id', requestId)?.eq('sender_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      throw error;
    }
  }

  // Get all friends (accepted requests)
  async getFriends() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get requests where user is sender and status is accepted
      const { data: sentRequests, error: error1 } = await supabase?.from('friend_requests')?.select(`
          receiver:user_profiles!friend_requests_receiver_id_fkey(id, full_name, avatar_url, username, bio)
        `)?.eq('sender_id', user?.id)?.eq('status', 'accepted');

      // Get requests where user is receiver and status is accepted
      const { data: receivedRequests, error: error2 } = await supabase?.from('friend_requests')?.select(`
          sender:user_profiles!friend_requests_sender_id_fkey(id, full_name, avatar_url, username, bio)
        `)?.eq('receiver_id', user?.id)?.eq('status', 'accepted');

      if (error1 || error2) throw error1 || error2;

      // Combine both lists
      const friends = [
        ...(sentRequests?.map(r => r?.receiver) || []),
        ...(receivedRequests?.map(r => r?.sender) || [])
      ];

      return friends;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  // Check if friend request exists
  async checkFriendRequestStatus(userId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('friend_requests')?.select('id, status, sender_id, receiver_id')?.or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)?.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error checking friend request status:', error);
      return null;
    }
  }

  // Search users by username or full name
  async searchUsers(searchQuery) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!searchQuery || searchQuery?.trim()?.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, username, avatar_url, bio, contributor_level')
        ?.neq('id', user?.id)
        ?.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        ?.limit(10)
        ?.order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get suggested users (users with most followers)
  async getSuggestedUsers(limit = 5) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, username, avatar_url, bio, contributor_level, followers_count')
        ?.neq('id', user?.id)
        ?.order('followers_count', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      throw error;
    }
  }

  // Follow a user
  async followUser(followingId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('follows')
        ?.insert({
          follower_id: user?.id,
          following_id: followingId
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // Create notification for the followed user
      await supabase?.from('notifications')?.insert({
        user_id: followingId,
        actor_id: user?.id,
        notification_type: 'follow',
        title: 'New Follower',
        message: 'started following you',
        priority: 'medium'
      });

      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // Unfollow a user
  async unfollowUser(followingId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        ?.from('follows')
        ?.delete()
        ?.eq('follower_id', user?.id)
        ?.eq('following_id', followingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Get followers
  async getFollowers(userId = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetUserId = userId || user?.id;

      const { data, error } = await supabase
        ?.from('follows')
        ?.select(`
          follower:user_profiles!follows_follower_id_fkey(id, full_name, username, avatar_url, bio, contributor_level, followers_count)
        `)
        ?.eq('following_id', targetUserId)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(f => f?.follower) || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  // Get following
  async getFollowing(userId = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const targetUserId = userId || user?.id;

      const { data, error } = await supabase
        ?.from('follows')
        ?.select(`
          following:user_profiles!follows_following_id_fkey(id, full_name, username, avatar_url, bio, contributor_level, followers_count)
        `)
        ?.eq('follower_id', targetUserId)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(f => f?.following) || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }

  // Check if following a user
  async isFollowing(followingId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('follows')
        ?.select('id')
        ?.eq('follower_id', user?.id)
        ?.eq('following_id', followingId)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  // Send friend request with notification (UPDATED)
  async sendFriendRequestWithNotification(receiverId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // CRITICAL FIX: The trigger now handles notification creation
      // We just need to insert the friend request
      const { data, error } = await supabase?.from('friend_requests')?.insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending'
        })?.select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey(id, full_name, avatar_url, username),
          receiver:user_profiles!friend_requests_receiver_id_fkey(id, full_name, avatar_url, username)
        `)?.single();

      if (error) throw error;

      // Note: Notification is automatically created by database trigger
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }
}

export default new FriendRequestService();