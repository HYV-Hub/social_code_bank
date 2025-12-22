import { supabase } from '../lib/supabase';

/**
 * Company Dashboard Service
 * Provides methods for company admin dashboard data
 */
export const companyDashboardService = {
  /**
   * Get companies associated with the current user
   * Returns companies where user is either the creator or a member
   */
  getUserCompanies: async () => {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user?.id) throw new Error('Not authenticated');

    try {
      // Get user profile to check company_id
      const { data: profile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('company_id')
        ?.eq('id', user?.id)
        ?.single();

      if (profileError) throw profileError;

      // Get companies where user is creator OR member
      const { data, error } = await supabase
        ?.from('companies')
        ?.select('*')
        ?.or(`created_by.eq.${user?.id},id.eq.${profile?.company_id || 'null'}`)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user companies:', error);
      throw error;
    }
  },

  /**
   * Get company details
   */
  getCompanyDetails: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined' || companyId === 'null') {
      console.error('Invalid company ID provided:', companyId);
      throw new Error('Valid company ID is required');
    }

    console.log('🔍 Fetching company details for company_id:', companyId);

    try {
      // FIXED: Changed .single() to .maybeSingle() to handle cases where company doesn't exist
      const { data, error } = await supabase
        ?.from('companies')?.select('*')?.eq('id', companyId)
        ?.maybeSingle();

      if (error) {
        console.error('Supabase error fetching company details:', {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint
        });
        throw new Error(`Database error: ${error?.message}`);
      }

      if (!data) {
        console.error('No company found with ID:', companyId);
        throw new Error('Company not found');
      }

      console.log('✅ Company details fetched successfully:', {
        id: data?.id,
        name: data?.name,
        slug: data?.slug
      });

      return data;
    } catch (error) {
      console.error('Error in getCompanyDetails:', {
        message: error?.message,
        stack: error?.stack,
        companyId
      });
      
      // Re-throw with more context
      throw new Error(`Failed to fetch company details: ${error?.message}`);
    }
  },

  /**
   * Get company metrics
   */
  getCompanyMetrics: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      // Get team member count
      const { data: membersData, error: membersError } = await supabase?.from('user_profiles')?.select('id', { count: 'exact' })?.eq('company_id', companyId);

      if (membersError) throw membersError;

      // Get snippets count
      const { data: snippetsData, error: snippetsError } = await supabase?.from('snippets')?.select('id', { count: 'exact' })?.eq('company_id', companyId);

      if (snippetsError) throw snippetsError;

      // Get bugs resolved count - FIXED: Changed 'status' to 'bug_status'
      const { data: bugsData, error: bugsError } = await supabase?.from('bugs')?.select('id', { count: 'exact' })?.eq('company_id', companyId)?.eq('bug_status', 'resolved');

      if (bugsError) throw bugsError;

      return {
        teamMembers: membersData?.length || 0,
        snippets: snippetsData?.length || 0,
        bugsResolved: bugsData?.length || 0
      };
    } catch (error) {
      console.error('Error fetching company metrics:', error);
      throw error;
    }
  },

  /**
   * Get company teams
   */
  getCompanyTeams: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    const { data, error } = await supabase?.from('teams')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company teams:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Get team members
   */
  getTeamMembers: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Get activity feed
   */
  getActivityFeed: async (companyId, limit = 10) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      const { data, error } = await supabase?.rpc('get_company_activity', {
        p_company_id: companyId,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      // Return empty array if function doesn't exist yet
      return [];
    }
  },

  /**
   * Get trending snippets
   */
  getTrendingSnippets: async (companyId, limit = 4) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    const { data, error } = await supabase?.from('snippets')?.select('*')?.eq('company_id', companyId)?.order('likes_count', { ascending: false })?.order('views_count', { ascending: false })?.limit(limit);

    if (error) {
      console.error('Error fetching trending snippets:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Get company snippets feed - NEW METHOD
   * Similar to explore page but filtered by company_id
   */
  getCompanySnippetsFeed: async (companyId, filters = {}) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      let query = supabase
        ?.from('snippets')
        ?.select(`
          id,
          title,
          description,
          code,
          language,
          visibility,
          snippet_type,
          likes_count,
          comments_count,
          views_count,
          ai_tags,
          created_at,
          user_profiles!snippets_user_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        ?.eq('company_id', companyId);

      // Apply visibility filter - show company and public snippets
      if (filters?.visibility && filters?.visibility !== 'all') {
        query = query?.eq('visibility', filters?.visibility);
      } else {
        // Default: Show company and public snippets
        query = query?.in('visibility', ['company', 'public']);
      }

      // Language filter
      if (filters?.language && filters?.language !== 'all') {
        query = query?.eq('language', filters?.language);
      }

      // Snippet type filter
      if (filters?.snippetType && filters?.snippetType?.length > 0) {
        query = query?.in('snippet_type', filters?.snippetType);
      }

      // AI tags filter
      if (filters?.aiTags && filters?.aiTags?.length > 0) {
        query = query?.overlaps('ai_tags', filters?.aiTags);
      }

      // Date range filter
      if (filters?.dateRange && filters?.dateRange !== 'all') {
        const dateFilter = getDateFilter(filters?.dateRange);
        if (dateFilter) {
          query = query?.gte('created_at', dateFilter);
        }
      }

      // Engagement filters
      if (filters?.minLikes) {
        query = query?.gte('likes_count', filters?.minLikes);
      }

      if (filters?.hasComments) {
        query = query?.gt('comments_count', 0);
      }

      // Sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      query = query?.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching company snippets feed:', error);
        throw error;
      }

      return {
        snippets: data?.map(snippet => ({
          id: snippet?.id,
          title: snippet?.title,
          description: snippet?.description,
          code: snippet?.code,
          language: snippet?.language,
          snippetType: snippet?.snippet_type,
          visibility: snippet?.visibility,
          likesCount: snippet?.likes_count || 0,
          commentsCount: snippet?.comments_count || 0,
          viewsCount: snippet?.views_count || 0,
          aiTags: snippet?.ai_tags || [],
          createdAt: snippet?.created_at,
          type: 'snippet',
          author: snippet?.user_profiles ? {
            id: snippet?.user_profiles?.id,
            name: snippet?.user_profiles?.full_name || snippet?.user_profiles?.username,
            username: snippet?.user_profiles?.username,
            avatar: snippet?.user_profiles?.avatar_url
          } : null,
          codePreview: snippet?.code?.substring(0, 200)
        })) || [],
        totalCount: count || 0,
        hasMore: (offset + limit) < (count || 0)
      };
    } catch (error) {
      console.error('Error fetching company snippets feed:', error);
      throw error;
    }
  },

  /**
   * Calculate user limit information
   */
  getUserLimitInfo: (company) => {
    if (!company) return null;

    const limit = company?.user_limit || 10;
    const current = company?.users_count || 0;
    const remaining = Math.max(0, limit - current);
    const canAdd = remaining > 0;

    return {
      limit,
      current,
      remaining,
      canAdd
    };
  },

  /**
   * Request user limit increase
   */
  requestUserLimitIncrease: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    const { data, error } = await supabase?.from('companies')?.update({
      upgrade_requested: true,
      upgrade_requested_at: new Date()?.toISOString()
    })?.eq('id', companyId)?.select()?.single();

    if (error) {
      console.error('Error requesting upgrade:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get top collaborators - NEW METHOD
   * Returns members with highest contribution (snippets + bugs fixed)
   */
  getTopCollaborators: async (companyId, limit = 5) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, username, full_name, avatar_url, snippets_count, bugs_fixed_count, contributor_level, role')
        ?.eq('company_id', companyId)
        ?.order('snippets_count', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data?.map(user => ({
        id: user?.id,
        name: user?.full_name || user?.username,
        username: user?.username,
        avatar: user?.avatar_url,
        snippetsCount: user?.snippets_count || 0,
        bugsFixed: user?.bugs_fixed_count || 0,
        contributorLevel: user?.contributor_level,
        role: user?.role,
        totalContributions: (user?.snippets_count || 0) + (user?.bugs_fixed_count || 0)
      })) || [];
    } catch (error) {
      console.error('Error fetching top collaborators:', error);
      throw error;
    }
  },

  /**
   * Get top posts - NEW METHOD
   * Returns most engaging company snippets
   */
  getTopPosts: async (companyId, limit = 5) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      const { data, error } = await supabase
        ?.from('snippets')
        ?.select(`
          id,
          title,
          description,
          language,
          snippet_type,
          likes_count,
          comments_count,
          views_count,
          created_at,
          user_profiles!snippets_user_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        ?.eq('company_id', companyId)
        ?.order('likes_count', { ascending: false })
        ?.order('views_count', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data?.map(snippet => ({
        id: snippet?.id,
        title: snippet?.title,
        description: snippet?.description,
        language: snippet?.language,
        snippetType: snippet?.snippet_type,
        likesCount: snippet?.likes_count || 0,
        commentsCount: snippet?.comments_count || 0,
        viewsCount: snippet?.views_count || 0,
        createdAt: snippet?.created_at,
        author: snippet?.user_profiles ? {
          id: snippet?.user_profiles?.id,
          name: snippet?.user_profiles?.full_name || snippet?.user_profiles?.username,
          username: snippet?.user_profiles?.username,
          avatar: snippet?.user_profiles?.avatar_url
        } : null,
        engagementScore: (snippet?.likes_count || 0) * 3 + (snippet?.comments_count || 0) * 2 + (snippet?.views_count || 0)
      })) || [];
    } catch (error) {
      console.error('Error fetching top posts:', error);
      throw error;
    }
  },

  /**
   * Get team collaboration metrics - NEW METHOD
   * Returns metrics about team collaboration and activity
   */
  getTeamCollaborationMetrics: async (companyId) => {
    // Validate companyId parameter
    if (!companyId || companyId === 'undefined') {
      throw new Error('Valid company ID is required');
    }

    try {
      // Get teams with member counts and snippet counts
      const { data: teams, error: teamsError } = await supabase
        ?.from('teams')
        ?.select(`
          id,
          name,
          description,
          created_at
        `)
        ?.eq('company_id', companyId);

      if (teamsError) throw teamsError;

      // Get member counts and snippet counts for each team
      const teamsWithMetrics = await Promise.all(teams?.map(async (team) => {
        // Get team member count
        const { data: members, error: membersError } = await supabase
          ?.from('team_members')
          ?.select('id', { count: 'exact' })
          ?.eq('team_id', team?.id);

        if (membersError) {
          console.error(`Error fetching members for team ${team?.id}:`, membersError);
        }

        // Get team snippet count
        const { data: snippets, error: snippetsError } = await supabase
          ?.from('snippets')
          ?.select('id', { count: 'exact' })
          ?.eq('team_id', team?.id);

        if (snippetsError) {
          console.error(`Error fetching snippets for team ${team?.id}:`, snippetsError);
        }

        return {
          id: team?.id,
          name: team?.name,
          description: team?.description,
          memberCount: members?.length || 0,
          snippetCount: snippets?.length || 0,
          createdAt: team?.created_at
        };
      }));

      // Sort teams by snippet count for top collaborating teams
      const topCollaboratingTeams = teamsWithMetrics
        ?.sort((a, b) => b?.snippetCount - a?.snippetCount)
        ?.slice(0, 5);

      // Calculate overall metrics
      const totalTeams = teams?.length || 0;
      const totalMembers = teamsWithMetrics?.reduce((sum, team) => sum + team?.memberCount, 0) || 0;
      const totalSnippets = teamsWithMetrics?.reduce((sum, team) => sum + team?.snippetCount, 0) || 0;
      const avgSnippetsPerTeam = totalTeams > 0 ? Math.round(totalSnippets / totalTeams) : 0;

      return {
        totalTeams,
        totalMembers,
        totalSnippets,
        avgSnippetsPerTeam,
        topCollaboratingTeams
      };
    } catch (error) {
      console.error('Error fetching team collaboration metrics:', error);
      throw error;
    }
  }
};

// Helper function for date filtering
const getDateFilter = (dateRange) => {
  const now = new Date();
  switch (dateRange) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0))?.toISOString();
    case 'week':
      return new Date(now.setDate(now.getDate() - 7))?.toISOString();
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1))?.toISOString();
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1))?.toISOString();
    default:
      return null;
  }
};

export default companyDashboardService;