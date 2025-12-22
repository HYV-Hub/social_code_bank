import { supabase } from '../lib/supabase';

class DashboardService {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async getDashboardStats(userId) {
    try {
      // Get accurate snippet count
      const { count: snippetsCount, error: snippetsError } = await supabase?.from('snippets')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId);

      // Get accurate followers count
      const { count: followersCount, error: followersError } = await supabase?.from('follows')?.select('*', { count: 'exact', head: true })?.eq('following_id', userId);

      // Get accurate following count
      const { count: followingCount, error: followingError } = await supabase?.from('follows')?.select('*', { count: 'exact', head: true })?.eq('follower_id', userId);

      // Get total likes across all user snippets
      const { data: likesData, error: likesError } = await supabase?.from('snippet_likes')?.select('snippet_id', { count: 'exact' })?.in('snippet_id', 
          supabase?.from('snippets')?.select('id')?.eq('user_id', userId)
        );

      // Get accurate bugs count - FIXED: Use correct column name bug_status
      const { count: bugsReportedCount, error: bugsReportedError } = await supabase?.from('bugs')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId);

      const { count: bugsFixedCount, error: bugsFixedError } = await supabase?.from('bugs')?.select('*', { count: 'exact', head: true })?.eq('assigned_to', userId)?.eq('bug_status', 'resolved');

      if (snippetsError || followersError || followingError || likesError || 
          bugsReportedError || bugsFixedError) {
        throw snippetsError || followersError || followingError || likesError ||
              bugsReportedError || bugsFixedError;
      }

      return {
        snippetsCount: snippetsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        likesCount: likesData?.length || 0,
        bugsReportedCount: bugsReportedCount || 0,
        bugsFixedCount: bugsFixedCount || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getUserSnippets(userId, limit = 5) {
    try {
      const { data, error } = await supabase?.from('snippets')?.select(`
          *,
          user:user_profiles!snippets_user_id_fkey(id, full_name, avatar_url, username)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      throw error;
    }
  }

  async getRecentActivity(userId, limit = 10) {
    try {
      // Get recent snippet activities
      const { data: snippetActivities, error: snippetError } = await supabase?.from('snippets')?.select('id, title, created_at')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      // Get recent likes received
      const { data: likesReceived, error: likesError } = await supabase?.from('snippet_likes')?.select(`
          id,
          created_at,
          snippet:snippets(id, title),
          user:user_profiles!snippet_likes_user_id_fkey(id, full_name, username)
        `)?.in('snippet_id',
          supabase?.from('snippets')?.select('id')?.eq('user_id', userId)
        )?.order('created_at', { ascending: false })?.limit(limit);

      // Get recent comments received
      const { data: commentsReceived, error: commentsError } = await supabase?.from('snippet_comments')?.select(`
          id,
          content,
          created_at,
          snippet:snippets(id, title),
          user:user_profiles!snippet_comments_user_id_fkey(id, full_name, username)
        `)?.in('snippet_id',
          supabase?.from('snippets')?.select('id')?.eq('user_id', userId)
        )?.order('created_at', { ascending: false })?.limit(limit);

      if (snippetError || likesError || commentsError) {
        throw snippetError || likesError || commentsError;
      }

      // Combine and sort all activities
      const activities = [
        ...(snippetActivities?.map(s => ({
          type: 'snippet_created',
          timestamp: s?.created_at,
          data: s
        })) || []),
        ...(likesReceived?.map(l => ({
          type: 'like_received',
          timestamp: l?.created_at,
          data: l
        })) || []),
        ...(commentsReceived?.map(c => ({
          type: 'comment_received',
          timestamp: c?.created_at,
          data: c
        })) || [])
      ]?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.slice(0, limit);

      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  async getSavedSnippets(userId, limit = 5, offset = 0) {
    try {
      const { data, error, count } = await supabase
        ?.from('collection_snippets')
        ?.select(`
          *,
          snippet:snippets!collection_snippets_snippet_id_fkey(
            *,
            user:user_profiles!snippets_user_id_fkey(
              id,
              full_name,
              avatar_url,
              username
            )
          ),
          collection:snippet_collections!collection_snippets_collection_id_fkey(
            id,
            title
          )
        `, { count: 'exact' })
        ?.eq('added_by', userId)
        ?.order('created_at', { ascending: false })
        ?.range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching saved snippets:', error);
      throw error;
    }
  }
}

export default new DashboardService();