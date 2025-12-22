import { supabase } from '../lib/supabase';

/**
 * Bug Service - ENHANCED VERSION
 * Complete bug tracking with workflow automation and analytics
 */
export const bugService = {
  /**
   * Fetch all bugs for a user or company - ENHANCED with context-aware filtering
   */
  async getBugs(userId, companyId = null, filters = {}) {
    try {
      let query = supabase
        ?.from('bugs')
        ?.select(`
          *,
          user_profiles!bugs_user_id_fkey(id, full_name, email, avatar_url, username),
          assignee:user_profiles!bugs_assigned_to_fkey(id, full_name, email, avatar_url, username)
        `);

      // CRITICAL: Context-aware filtering based on current view
      const context = filters?.context || 'user'; // 'global', 'company', 'team', 'user'

      if (context === 'global') {
        // Global dashboard - show only public bugs
        query = query?.eq('visibility', 'public');
      } else if (context === 'company' && (companyId || filters?.companyId)) {
        // FIXED: Company dashboard - show ONLY company and team bugs, EXCLUDE private
        // Company bugs should be:
        // 1. Bugs with visibility='company' OR visibility='team'
        // 2. AND company_id matches the user's company
        const targetCompanyId = companyId || filters?.companyId;
        query = query
          ?.eq('company_id', targetCompanyId)?.in('visibility', ['company', 'team']);
      } else if (context === 'team' && filters?.teamId) {
        // Team dashboard - show team-specific bugs ONLY
        query = query
          ?.eq('team_id', filters?.teamId)?.eq('visibility', 'team');
      } else {
        // FIXED: User dashboard - show ONLY user's own private bugs
        // NEVER show company or team bugs on personal profile
        query = query
          ?.eq('user_id', userId)
          ?.eq('visibility', 'private');
      }

      // Apply additional filters
      if (filters?.status && filters?.status?.length > 0) {
        query = query?.in('bug_status', filters?.status);
      }

      if (filters?.priority && filters?.priority?.length > 0) {
        query = query?.in('priority', filters?.priority);
      }

      if (filters?.language && filters?.language !== 'all') {
        query = query?.eq('language', filters?.language);
      }

      if (filters?.assignedTo) {
        query = query?.eq('assigned_to', filters?.assignedTo);
      }

      if (filters?.isBugFix !== undefined) {
        query = query?.eq('is_bug_fix', filters?.isBugFix);
      }

      // Sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 100;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(bug => ({
        id: bug?.id,
        title: bug?.title,
        description: bug?.description,
        code: bug?.code,
        fixedCode: bug?.fixed_code,
        previousCode: bug?.previous_code,
        fixExplanation: bug?.fix_explanation,
        isBugFix: bug?.is_bug_fix || false,
        language: bug?.language,
        priority: bug?.priority,
        status: bug?.bug_status,
        visibility: bug?.visibility,
        likesCount: bug?.likes_count || 0,
        commentsCount: bug?.comments_count || 0,
        viewsCount: bug?.views_count || 0,
        createdAt: bug?.created_at,
        updatedAt: bug?.updated_at,
        teamId: bug?.team_id,
        companyId: bug?.company_id,
        aiReport: bug?.ai_report,
        user: {
          id: bug?.user_profiles?.id,
          name: bug?.user_profiles?.full_name,
          username: bug?.user_profiles?.username,
          email: bug?.user_profiles?.email,
          avatar: bug?.user_profiles?.avatar_url
        },
        assignee: bug?.assignee ? {
          id: bug?.assignee?.id,
          name: bug?.assignee?.full_name,
          username: bug?.assignee?.username,
          email: bug?.assignee?.email,
          avatar: bug?.assignee?.avatar_url
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching bugs:', error);
      throw new Error(error?.message || 'Failed to fetch bugs');
    }
  },

  /**
   * Get bugs for global feed - public visibility only
   */
  async getPublicBugs(filters = {}) {
    try {
      let query = supabase
        ?.from('bugs')?.select(`*,user_profiles!bugs_user_id_fkey(id, full_name, email, avatar_url, username),assignee:user_profiles!bugs_assigned_to_fkey(id, full_name, email, avatar_url, username),teams(id, name)`)?.eq('visibility', 'public');

      // Apply filters
      if (filters?.status && filters?.status?.length > 0) {
        query = query?.in('bug_status', filters?.status);
      }

      if (filters?.priority && filters?.priority?.length > 0) {
        query = query?.in('priority', filters?.priority);
      }

      if (filters?.language && filters?.language !== 'all') {
        query = query?.eq('language', filters?.language);
      }

      // Sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(bug => ({
        id: bug?.id,
        title: bug?.title,
        description: bug?.description,
        code: bug?.code,
        language: bug?.language,
        priority: bug?.priority,
        status: bug?.bug_status,
        visibility: bug?.visibility,
        likesCount: bug?.likes_count || 0,
        commentsCount: bug?.comments_count || 0,
        viewsCount: bug?.views_count || 0,
        createdAt: bug?.created_at,
        updatedAt: bug?.updated_at,
        teamId: bug?.team_id,
        teamName: bug?.teams?.name,
        aiReport: bug?.ai_report, // CRITICAL: Include AI report in response
        user: {
          id: bug?.user_profiles?.id,
          name: bug?.user_profiles?.full_name,
          username: bug?.user_profiles?.username,
          email: bug?.user_profiles?.email,
          avatar: bug?.user_profiles?.avatar_url
        },
        assignee: bug?.assignee ? {
          id: bug?.assignee?.id,
          name: bug?.assignee?.full_name,
          username: bug?.assignee?.username,
          email: bug?.assignee?.email,
          avatar: bug?.assignee?.avatar_url
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching public bugs:', error);
      throw new Error(error?.message || 'Failed to fetch public bugs');
    }
  },

  /**
   * Create a new bug - ENHANCED with bug fix workflow support
   */
  async createBug(bugData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile for company context
      const { data: userProfile } = await supabase
        ?.from('user_profiles')?.select('company_id')?.eq('id', user?.id)
        ?.single();

      const { data, error } = await supabase
        ?.from('bugs')
        ?.insert({
          user_id: user?.id,
          title: bugData?.title,
          description: bugData?.description,
          code: bugData?.code,
          fixed_code: bugData?.fixedCode || null,
          previous_code: bugData?.previousCode || null,
          fix_explanation: bugData?.fixExplanation || null,
          is_bug_fix: bugData?.isBugFix || false,
          language: bugData?.language,
          priority: bugData?.priority || 'medium',bug_status: 'open',visibility: bugData?.visibility || 'private',
          company_id: bugData?.companyId || userProfile?.company_id || null,
          team_id: bugData?.teamId || null,
          assigned_to: bugData?.assignedTo || null
        })
        ?.select()
        ?.single();

      if (error) throw error;

      // Send notification to assignee if assigned
      if (bugData?.assignedTo) {
        await this.notifyBugAssignment(data?.id, bugData?.assignedTo, user?.id);
      }

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        fixedCode: data?.fixed_code,
        previousCode: data?.previous_code,
        fixExplanation: data?.fix_explanation,
        isBugFix: data?.is_bug_fix,
        language: data?.language,
        bugStatus: data?.bug_status,
        priority: data?.priority,
        visibility: data?.visibility,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating bug:', error);
      throw new Error(error?.message || 'Failed to create bug');
    }
  },

  /**
   * Update a bug - ENHANCED with workflow automation
   */
  async updateBug(bugId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current bug state
      const { data: currentBug } = await supabase
        ?.from('bugs')
        ?.select('*')
        ?.eq('id', bugId)
        ?.single();

      const updateData = {};
      if (updates?.title) updateData.title = updates?.title;
      if (updates?.description) updateData.description = updates?.description;
      if (updates?.code) updateData.code = updates?.code;
      if (updates?.fixedCode !== undefined) updateData.fixed_code = updates?.fixedCode;
      if (updates?.language) updateData.language = updates?.language;
      if (updates?.priority) updateData.priority = updates?.priority;
      if (updates?.bugStatus) updateData.bug_status = updates?.bugStatus;
      if (updates?.visibility !== undefined) updateData.visibility = updates?.visibility;
      if (updates?.assignedTo !== undefined) updateData.assigned_to = updates?.assignedTo;

      const { data, error } = await supabase
        ?.from('bugs')
        ?.update(updateData)
        ?.eq('id', bugId)
        ?.select()
        ?.single();

      if (error) throw error;

      // Workflow automation: Send notifications on status changes
      if (updates?.bugStatus && currentBug?.bug_status !== updates?.bugStatus) {
        await this.notifyStatusChange(bugId, currentBug?.bug_status, updates?.bugStatus, user?.id);
      }

      // Notify new assignee if changed
      if (updates?.assignedTo && currentBug?.assigned_to !== updates?.assignedTo) {
        await this.notifyBugAssignment(bugId, updates?.assignedTo, user?.id);
      }

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        fixedCode: data?.fixed_code,
        bugStatus: data?.bug_status,
        priority: data?.priority,
        visibility: data?.visibility,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating bug:', error);
      throw new Error(error?.message || 'Failed to update bug');
    }
  },

  /**
   * Update bug with AI report - NEW
   */
  async updateBugAIReport(bugId, aiReport) {
    try {
      const { data, error } = await supabase
        ?.from('bugs')
        ?.update({ ai_report: aiReport })
        ?.eq('id', bugId)
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating bug AI report:', error);
      throw new Error(error?.message || 'Failed to update bug AI report');
    }
  },

  /**
   * Get bug with AI report - NEW
   */
  async getBugWithAIReport(bugId) {
    try {
      const { data, error } = await supabase
        ?.from('bugs')
        ?.select(`
          *,
          user_profiles!bugs_user_id_fkey(id, full_name, email, avatar_url, username),
          assignee:user_profiles!bugs_assigned_to_fkey(id, full_name, email, avatar_url, username)
        `)
        ?.eq('id', bugId)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        language: data?.language,
        priority: data?.priority,
        status: data?.bug_status,
        visibility: data?.visibility,
        aiReport: data?.ai_report,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        user: {
          id: data?.user_profiles?.id,
          name: data?.user_profiles?.full_name,
          username: data?.user_profiles?.username,
        },
        assignee: data?.assignee ? {
          id: data?.assignee?.id,
          name: data?.assignee?.full_name,
          username: data?.assignee?.username,
        } : null
      };
    } catch (error) {
      console.error('Error fetching bug with AI report:', error);
      throw new Error(error?.message || 'Failed to fetch bug');
    }
  },

  /**
   * Update bug status with workflow rules
   */
  async updateBugStatus(bugId, status) {
    try {
      const { data, error } = await supabase
        ?.from('bugs')
        ?.update({ bug_status: status })
        ?.eq('id', bugId)
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating bug status:', error);
      throw new Error(error?.message || 'Failed to update bug status');
    }
  },

  /**
   * Toggle bug like
   */
  async toggleLike(bugId, userId) {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        ?.from('bug_likes')
        ?.select('id')
        ?.eq('bug_id', bugId)
        ?.eq('user_id', userId)
        ?.maybeSingle();

      if (checkError && checkError?.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // Unlike
        await supabase
          ?.from('bug_likes')
          ?.delete()
          ?.eq('id', existingLike?.id);

        return { liked: false };
      } else {
        // Like
        await supabase
          ?.from('bug_likes')
          ?.insert([{ bug_id: bugId, user_id: userId }]);

        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling bug like:', error);
      throw new Error(error?.message || 'Failed to toggle bug like');
    }
  },

  /**
   * Add comment to bug
   */
  async addComment(bugId, content, parentId = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        ?.from('bug_comments')
        ?.insert([{
          bug_id: bugId,
          user_id: user?.id,
          content,
          parent_id: parentId
        }])
        ?.select(`
          *,
          user_profiles(id, full_name, email, avatar_url)
        `)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        content: data?.content,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        parentId: data?.parent_id,
        user: {
          id: data?.user_profiles?.id,
          name: data?.user_profiles?.full_name,
          email: data?.user_profiles?.email,
          avatar: data?.user_profiles?.avatar_url
        }
      };
    } catch (error) {
      console.error('Error adding bug comment:', error);
      throw new Error(error?.message || 'Failed to add comment');
    }
  },

  /**
   * Fetch comments for a bug
   */
  async getComments(bugId) {
    try {
      const { data, error } = await supabase
        ?.from('bug_comments')
        ?.select(`
          *,
          user_profiles(id, full_name, email, avatar_url)
        `)
        ?.eq('bug_id', bugId)
        ?.order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(comment => ({
        id: comment?.id,
        content: comment?.content,
        createdAt: comment?.created_at,
        updatedAt: comment?.updated_at,
        parentId: comment?.parent_id,
        user: {
          id: comment?.user_profiles?.id,
          name: comment?.user_profiles?.full_name,
          email: comment?.user_profiles?.email,
          avatar: comment?.user_profiles?.avatar_url
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching bug comments:', error);
      throw new Error(error?.message || 'Failed to fetch comments');
    }
  },

  /**
   * Check if user has liked a bug
   */
  async checkUserLiked(bugId, userId) {
    try {
      const { data, error } = await supabase
        ?.from('bug_likes')
        ?.select('id')
        ?.eq('bug_id', bugId)
        ?.eq('user_id', userId)
        ?.maybeSingle();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking bug like:', error);
      return false;
    }
  },

  /**
   * Get bug analytics - NEW
   */
  async getBugAnalytics(companyId = null, teamId = null) {
    try {
      let query = supabase
        ?.from('bugs')
        ?.select('bug_status, priority, language, created_at');

      if (companyId) {
        query = query?.eq('company_id', companyId);
      }

      if (teamId) {
        query = query?.eq('team_id', teamId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        totalBugs: data?.length || 0,
        byStatus: {},
        byPriority: {},
        byLanguage: {},
        avgResolutionTime: 0,
        openBugs: 0,
        resolvedBugs: 0
      };

      data?.forEach(bug => {
        // Count by status
        analytics.byStatus[bug?.bug_status] = (analytics?.byStatus?.[bug?.bug_status] || 0) + 1;
        
        // Count by priority
        analytics.byPriority[bug?.priority] = (analytics?.byPriority?.[bug?.priority] || 0) + 1;
        
        // Count by language
        analytics.byLanguage[bug?.language] = (analytics?.byLanguage?.[bug?.language] || 0) + 1;

        // Count open vs resolved
        if (bug?.bug_status === 'open' || bug?.bug_status === 'in_progress') {
          analytics.openBugs++;
        } else if (bug?.bug_status === 'resolved' || bug?.bug_status === 'closed') {
          analytics.resolvedBugs++;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching bug analytics:', error);
      return null;
    }
  },

  /**
   * Send notification for bug assignment - NEW
   */
  async notifyBugAssignment(bugId, assigneeId, assignerId) {
    try {
      await supabase
        ?.from('notifications')
        ?.insert({
          user_id: assigneeId,
          actor_id: assignerId,
          type: 'bug_assignment',
          reference_id: bugId,
          message: 'assigned you a bug',
          priority: 'medium'
        });
    } catch (error) {
      console.error('Error sending bug assignment notification:', error);
    }
  },

  /**
   * Send notification for status change - NEW
   */
  async notifyStatusChange(bugId, oldStatus, newStatus, actorId) {
    try {
      // Get bug details to notify reporter
      const { data: bug } = await supabase
        ?.from('bugs')
        ?.select('user_id')
        ?.eq('id', bugId)
        ?.single();

      if (bug && bug?.user_id !== actorId) {
        await supabase
          ?.from('notifications')
          ?.insert({
            user_id: bug?.user_id,
            actor_id: actorId,
            type: 'bug_assignment',
            reference_id: bugId,
            message: `changed bug status from ${oldStatus} to ${newStatus}`,
            priority: newStatus === 'resolved' ? 'high' : 'medium'
          });
      }
    } catch (error) {
      console.error('Error sending status change notification:', error);
    }
  },

  /**
   * Increment bug view count - NEW
   */
  async incrementViewCount(bugId) {
    try {
      await supabase?.rpc('increment_count', {
        table_name: 'bugs',
        row_id: bugId,
        column_name: 'views_count'
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }
};

// Add default export for compatibility with default imports
export default bugService;