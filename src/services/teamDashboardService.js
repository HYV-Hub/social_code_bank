import { supabase } from '../lib/supabase';

/**
 * Team Dashboard Service
 * Provides methods for team-specific dashboard data
 */
export const teamDashboardService = {
  /**
   * Get team details
   */
  getTeamDetails: async (teamId) => {
    // Validate teamId before making request
    if (!teamId || teamId === 'undefined' || teamId === 'null') {
      throw new Error('Invalid team ID provided');
    }

    const { data, error } = await supabase
      ?.from('teams')
      ?.select('*')
      ?.eq('id', teamId)
      ?.single();

    if (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get team metrics - FIXED: Count through team_members junction table
   */
  getTeamMetrics: async (teamId) => {
    try {
      // Get team member count through junction table
      const { count: membersCount, error: membersError } = await supabase
        ?.from('team_members')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('team_id', teamId);

      if (membersError) throw membersError;

      // Get snippets count
      const { count: snippetsCount, error: snippetsError } = await supabase
        ?.from('snippets')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('team_id', teamId);

      if (snippetsError) throw snippetsError;

      // Get bugs assigned to team
      const { count: bugsCount, error: bugsError } = await supabase
        ?.from('bugs')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('team_id', teamId);

      if (bugsError) throw bugsError;

      // Get bugs resolved by team
      const { count: bugsResolvedCount, error: bugsResolvedError } = await supabase
        ?.from('bugs')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('team_id', teamId)
        ?.eq('bug_status', 'resolved');

      if (bugsResolvedError) throw bugsResolvedError;

      // Get pending code reviews
      const { count: reviewsCount, error: reviewsError } = await supabase
        ?.from('snippet_reviews')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('team_id', teamId)
        ?.eq('status', 'pending');

      if (reviewsError) throw reviewsError;

      return {
        teamMembers: membersCount || 0,
        snippets: snippetsCount || 0,
        bugs: bugsCount || 0,
        bugsResolved: bugsResolvedCount || 0,
        pendingReviews: reviewsCount || 0
      };
    } catch (error) {
      console.error('Error fetching team metrics:', error);
      throw error;
    }
  },

  /**
   * Get team members - FIXED: Use team_members junction table
   */
  getTeamMembers: async (teamId) => {
    try {
      const { data, error } = await supabase
        ?.from('team_members')
        ?.select(`
          id,
          role,
          joined_at,
          user_profiles!inner(
            id,
            full_name,
            username,
            email,
            avatar_url,
            bio,
            contributor_level,
            snippets_count,
            bugs_fixed_count,
            bugs_reported_count
          )
        `)
        ?.eq('team_id', teamId)
        ?.order('joined_at', { ascending: false });

      if (error) throw error;

      // Transform to flat structure for easier use
      return (data || [])?.map(member => ({
        membershipId: member?.id,
        role: member?.role,
        joinedAt: member?.joined_at,
        id: member?.user_profiles?.id,
        fullName: member?.user_profiles?.full_name,
        username: member?.user_profiles?.username,
        email: member?.user_profiles?.email,
        avatarUrl: member?.user_profiles?.avatar_url,
        bio: member?.user_profiles?.bio,
        contributorLevel: member?.user_profiles?.contributor_level,
        snippetsCount: member?.user_profiles?.snippets_count,
        bugsFixedCount: member?.user_profiles?.bugs_fixed_count,
        bugsReportedCount: member?.user_profiles?.bugs_reported_count,
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Get team activity feed
   */
  getTeamActivityFeed: async (teamId, limit = 20) => {
    try {
      // Get recent snippets
      const { data: snippets, error: snippetsError } = await supabase
        ?.from('snippets')
        ?.select('id, title, created_at, user_id, user_profiles!snippets_user_id_fkey(full_name, username, avatar_url)')
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: false })
        ?.limit(Math.floor(limit / 2));

      if (snippetsError) throw snippetsError;

      // Get recent bugs - FIXED: Specify exact foreign key relationship
      const { data: bugs, error: bugsError } = await supabase
        ?.from('bugs')
        ?.select('id, title, created_at, bug_status, priority, user_id, user_profiles!bugs_user_id_fkey(full_name, username, avatar_url)')
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: false })
        ?.limit(Math.floor(limit / 2));

      if (bugsError) throw bugsError;

      // Combine and format activities
      const activities = [];

      snippets?.forEach(snippet => {
        activities?.push({
          id: `snippet-${snippet?.id}`,
          type: 'snippet',
          title: snippet?.title,
          user: snippet?.user_profiles?.full_name || snippet?.user_profiles?.username,
          avatar: snippet?.user_profiles?.avatar_url,
          timestamp: snippet?.created_at,
          entityId: snippet?.id
        });
      });

      bugs?.forEach(bug => {
        activities?.push({
          id: `bug-${bug?.id}`,
          type: 'bug',
          title: bug?.title,
          user: bug?.user_profiles?.full_name || bug?.user_profiles?.username,
          avatar: bug?.user_profiles?.avatar_url,
          status: bug?.bug_status,
          priority: bug?.priority,
          timestamp: bug?.created_at,
          entityId: bug?.id
        });
      });

      // Sort by timestamp
      activities?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp));

      return activities?.slice(0, limit);
    } catch (error) {
      console.error('Error fetching team activity:', error);
      return [];
    }
  },

  /**
   * Get ALL team snippets for feed - ENHANCED: Better validation and error handling
   */
  getTeamSnippetsFeed: async (teamId, limit = 20, offset = 0) => {
    try {
      console.log('🔍 [ENHANCED] Fetching team snippets for team:', teamId);
      console.log('📊 Request parameters:', { limit, offset });
      
      // CRITICAL FIX: Validate teamId is a valid UUID before proceeding
      if (!teamId || typeof teamId !== 'string' || teamId === 'undefined' || teamId === 'null') {
        throw new Error('Invalid team ID: Team ID is required and must be a valid string');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex?.test(teamId)) {
        throw new Error(`Invalid team ID format: "${teamId}" is not a valid UUID`);
      }

      // CRITICAL FIX: Get auth session with proper null checks and validation
      const { data: sessionData, error: sessionError } = await supabase?.auth?.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Authentication session error. Please refresh the page and try again.');
      }

      const session = sessionData?.session;
      const user = session?.user;
      
      if (!session || !user?.id) {
        console.error('❌ No authenticated user found');
        throw new Error('Authentication required: Please log in to view team snippets');
      }

      // Validate user ID format to prevent "undefined" being passed
      if (typeof user?.id !== 'string' || user?.id === 'undefined' || user?.id === 'null') {
        console.error('❌ Invalid user ID in session:', user?.id);
        throw new Error('Invalid user session. Please log out and log in again.');
      }

      if (!uuidRegex?.test(user?.id)) {
        console.error('❌ Invalid user ID format:', user?.id);
        throw new Error('Invalid user session format. Please log out and log in again.');
      }

      console.log('✅ Authenticated user:', user?.id);
      console.log('✅ Team ID validated:', teamId);

      // STRATEGY 1: Try database function first (preferred method)
      try {
        console.log('🎯 [STRATEGY 1] Attempting database function call...');
        const { data: functionData, error: functionError } = await supabase
          ?.rpc('get_team_snippets_feed', {
            p_team_id: teamId,
            p_limit: limit,
            p_offset: offset
          });

        if (functionError) {
          console.error('⚠️ Function error:', functionError);
          console.error('Function error details:', {
            message: functionError?.message,
            code: functionError?.code,
            details: functionError?.details,
            hint: functionError?.hint
          });
          
          // Check for specific error types
          if (functionError?.message?.includes('not a member') || functionError?.message?.includes('not a creator')) {
            throw new Error('Access denied: You must be a team member to view snippets');
          }
          if (functionError?.message?.includes('Authentication required')) {
            throw new Error('Authentication required: Please log in to view team snippets');
          }
          if (functionError?.message?.includes('invalid input syntax for type uuid')) {
            throw new Error('Invalid team or user ID format. Please refresh the page.');
          }
          
          // If function fails for other reasons, try fallback
          console.warn('⚠️ Database function failed, will try fallback method...');
          throw functionError;
        }

        if (functionData && Array.isArray(functionData) && functionData?.length > 0) {
          console.log('✅ [STRATEGY 1 SUCCESS] Function returned:', functionData?.length, 'snippets');
          
          // Transform the data to match expected format with proper nested structure
          const transformedData = functionData?.map(snippet => ({
            // Copy all original fields
            ...snippet,
            // Create nested user_profiles structure for UI compatibility
            user_profiles: {
              id: snippet?.user_id,
              full_name: snippet?.user_full_name,
              username: snippet?.user_username,
              avatar_url: snippet?.user_avatar_url
            }
          }));

          console.log('✅ Transformed data sample:', transformedData?.[0] ? {
            id: transformedData?.[0]?.id,
            title: transformedData?.[0]?.title,
            has_user_profiles: !!transformedData?.[0]?.user_profiles,
            user_name: transformedData?.[0]?.user_profiles?.full_name
          } : 'no data');

          return transformedData;
        }
        
        console.warn('⚠️ [STRATEGY 1] Function returned empty array, trying fallback...');
      } catch (funcError) {
        console.warn('⚠️ [STRATEGY 1 FAILED] Function call error:', funcError?.message);
        // Continue to fallback strategy
      }

      // STRATEGY 2: Direct query fallback with proper access control
      console.log('🔄 [STRATEGY 2] Using fallback direct query method...');
      
      // CRITICAL: Validate user ID again before access check
      if (!user?.id || user?.id === 'undefined') {
        throw new Error('Cannot verify team access: Invalid user session');
      }

      // First verify user has access to this team
      const { data: memberCheck, error: memberError } = await supabase
        ?.from('team_members')
        ?.select('id')
        ?.eq('team_id', teamId)
        ?.eq('user_id', user?.id)
        ?.maybeSingle();

      if (memberError) {
        console.error('❌ Member check error:', memberError);
        // Don't throw - check creator access next
      }

      const { data: creatorCheck, error: creatorError } = await supabase
        ?.from('teams')
        ?.select('id')
        ?.eq('id', teamId)
        ?.eq('created_by', user?.id)
        ?.maybeSingle();

      if (creatorError) {
        console.error('❌ Creator check error:', creatorError);
        // Don't throw yet - evaluate access after both checks
      }

      const hasAccess = !!(memberCheck || creatorCheck);
      
      console.log('🔐 Access check results:', {
        userId: user?.id,
        teamId: teamId,
        isMember: !!memberCheck,
        isCreator: !!creatorCheck,
        hasAccess
      });
      
      if (!hasAccess) {
        throw new Error('Access denied: You must be a team member to view snippets. Please join the team first.');
      }

      console.log('✅ User has team access, fetching snippets directly...');

      // Now fetch snippets directly with proper join
      const { data: snippetsData, error: snippetsError } = await supabase
        ?.from('snippets')
        ?.select(`
          *,
          user_profiles!inner(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: false })
        ?.range(offset, offset + limit - 1);

      if (snippetsError) {
        console.error('❌ Direct query failed:', snippetsError);
        console.error('Query error details:', {
          message: snippetsError?.message,
          code: snippetsError?.code,
          details: snippetsError?.details,
          hint: snippetsError?.hint
        });
        throw new Error(`Failed to fetch snippets: ${snippetsError?.message}`);
      }

      console.log('✅ [STRATEGY 2 SUCCESS] Direct query returned:', snippetsData?.length || 0, 'snippets');
      
      if (snippetsData && snippetsData?.length > 0) {
        console.log('✅ Sample snippet:', {
          id: snippetsData?.[0]?.id,
          title: snippetsData?.[0]?.title,
          team_id: snippetsData?.[0]?.team_id,
          user: snippetsData?.[0]?.user_profiles?.full_name,
          has_code: !!snippetsData?.[0]?.code,
          code_length: snippetsData?.[0]?.code?.length
        });
      } else {
        console.warn('⚠️ [STRATEGY 2] Query succeeded but returned no snippets');
        console.warn('This means the team exists and you have access, but there are no snippets yet');
      }

      return snippetsData || [];

    } catch (error) {
      console.error('💥 Critical error in getTeamSnippetsFeed:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack?.substring(0, 500)
      });
      
      // Re-throw with user-friendly message
      if (error?.message?.includes('Invalid team ID')) {
        throw error;
      } else if (error?.message?.includes('Invalid user session')) {
        throw error;
      } else if (error?.message?.includes('Authentication')) {
        throw error;
      } else if (error?.message?.includes('Access denied')) {
        throw error;
      } else if (error?.message?.includes('invalid input syntax for type uuid')) {
        throw new Error('Invalid team or user ID. Please refresh the page and try again.');
      } else {
        throw new Error(`Failed to load team snippets: ${error?.message || 'Unknown error'}. Please try again or contact support.`);
      }
    }
  },

  /**
   * Get ALL team bugs for bug board - NEW METHOD
   */
  getTeamBugs: async (teamId, limit = 50) => {
    try {
      const { data, error } = await supabase
        ?.from('bugs')
        ?.select(`
          *,
          user_profiles!bugs_user_id_fkey(full_name, username, avatar_url),
          assigned_to_profile:user_profiles!bugs_assigned_to_fkey(full_name, username)
        `)
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team bugs:', error);
      throw error;
    }
  },

  /**
   * Get trending snippets for team
   */
  getTrendingSnippets: async (teamId, limit = 4) => {
    const { data, error } = await supabase
      ?.from('snippets')
      ?.select('*, user_profiles!inner(full_name, username, avatar_url)')
      ?.eq('team_id', teamId)
      ?.order('likes_count', { ascending: false })
      ?.order('views_count', { ascending: false })
      ?.limit(limit);

    if (error) {
      console.error('Error fetching trending snippets:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Get team messages from main channel
   */
  getTeamMessages: async (teamId, limit = 10) => {
    try {
      // First get the main channel for this team
      const { data: channels, error: channelError } = await supabase
        ?.from('team_channels')
        ?.select('id')
        ?.eq('team_id', teamId)
        ?.order('created_at', { ascending: true })
        ?.limit(1);

      if (channelError) throw channelError;
      if (!channels || channels?.length === 0) return [];

      const channelId = channels?.[0]?.id;

      // Get messages from that channel
      const { data: messages, error: messagesError } = await supabase
        ?.from('team_messages')
        ?.select('*, user_profiles!inner(full_name, username, avatar_url)')
        ?.eq('channel_id', channelId)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (messagesError) throw messagesError;

      return messages || [];
    } catch (error) {
      console.error('Error fetching team messages:', error);
      return [];
    }
  },

  /**
   * Get red flags (high priority or blocked bugs)
   */
  getRedFlags: async (teamId) => {
    try {
      const { data, error } = await supabase
        ?.from('bugs')
        ?.select('*, user_profiles!bugs_user_id_fkey(full_name, username, avatar_url), assigned_to_profile:user_profiles!bugs_assigned_to_fkey(full_name, username)')
        ?.eq('team_id', teamId)
        ?.in('bug_status', ['open', 'in_progress'])
        ?.in('priority', ['high', 'critical'])
        ?.order('priority', { ascending: false })
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching red flags:', error);
      return [];
    }
  },

  /**
   * Get team performance analytics
   */
  getTeamAnalytics: async (teamId) => {
    try {
      const { data: snippets, error: snippetsError } = await supabase
        ?.from('snippets')
        ?.select('created_at, likes_count')
        ?.eq('team_id', teamId)
        ?.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString());

      if (snippetsError) throw snippetsError;

      const { data: bugs, error: bugsError } = await supabase
        ?.from('bugs')
        ?.select('created_at, bug_status')
        ?.eq('team_id', teamId)
        ?.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString());

      if (bugsError) throw bugsError;

      return {
        snippetTrend: snippets || [],
        bugResolution: bugs || []
      };
    } catch (error) {
      console.error('Error fetching team analytics:', error);
      return { snippetTrend: [], bugResolution: [] };
    }
  },

  /**
   * Update bug status (for workflow management)
   */
  updateBugStatus: async (bugId, newStatus) => {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('bugs')
      ?.update({ bug_status: newStatus })
      ?.eq('id', bugId)
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  }
};

export default teamDashboardService;