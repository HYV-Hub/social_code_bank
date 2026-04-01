import { supabase } from './supabaseClient';

export const hiveService = {
  // List and search hives with filters
  async searchHives(filters = {}) {
    const { q, privacy, sort = 'trending', page = 1, limit = 12 } = filters;
    
    let query = supabase?.from('hives')?.select('*, owner:user_profiles!hives_owner_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' });

    // Search query
    if (q) {
      query = query?.or(`name.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    }

    // Privacy filter
    if (privacy && privacy !== 'all') {
      query = query?.eq('privacy', privacy);
    }

    // Sorting
    switch (sort) {
      case 'newest':
        query = query?.order('created_at', { ascending: false });
        break;
      case 'members':
        query = query?.order('member_count', { ascending: false });
        break;
      case 'trending':
      default:
        // Trending could be based on recent activity, for now use member count
        query = query?.order('member_count', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query?.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get user's membership status for each hive
    const { data: { user } } = await supabase?.auth?.getUser();
    
    if (user) {
      const hiveIds = data?.map(h => h?.id);
      const { data: memberships } = await supabase?.from('hive_members')?.select('hive_id')?.in('hive_id', hiveIds)?.eq('user_id', user?.id);

      const { data: joinRequests } = await supabase?.from('hive_join_requests')?.select('hive_id, status')?.in('hive_id', hiveIds)?.eq('user_id', user?.id)?.eq('status', 'pending');

      const membershipMap = new Set(memberships?.map(m => m.hive_id) || []);
      const requestMap = new Set(joinRequests?.map(r => r.hive_id) || []);

      return {
        hives: data?.map(hive => ({
          ...hive,
          isMember: membershipMap?.has(hive?.id),
          hasPendingRequest: requestMap?.has(hive?.id)
        })),
        total: count,
        page,
        limit
      };
    }

    return { hives: data, total: count, page, limit };
  },

  // Get user's joined hives - FIXED METHOD NAME
  async getUserHives() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // CRITICAL FIX: Only return global hives (exclude company hives)
    const { data, error } = await supabase
      ?.from('hive_members')
      ?.select('*, hive:hives!hive_members_hive_id_fkey(*)')
      ?.eq('user_id', user?.id)
      ?.is('hive.company_id', null) // CRITICAL: Filter out company hives
      ?.order('joined_at', { ascending: false });

    if (error) throw error;

    return data?.map(m => ({ 
      ...m?.hive, 
      role: m?.role,
      memberCount: m?.hive?.member_count,
      privacy: m?.hive?.privacy 
    }));
  },

  // Create a new hive
  async createHive(hiveData) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // CRITICAL FIX: Generate unique slug with collision handling
    let baseSlug = hiveData?.name?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;

    // Check if slug exists and generate unique one if needed
    while (attempts < maxAttempts) {
      const { data: existingHive, error: checkError } = await supabase
        ?.from('hives')
        ?.select('id')
        ?.eq('slug', slug)
        ?.single();

      // If no existing hive found, this slug is available
      if (checkError?.code === 'PGRST116' || !existingHive) {
        break;
      }

      // Slug exists, append timestamp-based suffix
      attempts++;
      const timestamp = Date.now();
      slug = `${baseSlug}-${timestamp}`;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique slug for hive. Please try a different name.');
    }

    const { data, error } = await supabase?.from('hives')?.insert({
        name: hiveData?.name,
        slug,
        description: hiveData?.description,
        privacy: hiveData?.privacy || 'public',
        owner_id: user?.id,
        tags: hiveData?.tags || []
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Get hive details
  async getHiveDetails(hiveId) {
    const { data, error } = await supabase?.from('hives')?.select('*, owner:user_profiles!hives_owner_id_fkey(id, username, full_name, avatar_url)')?.eq('id', hiveId)?.single();

    if (error) throw error;

    // Get user's membership
    const { data: { user } } = await supabase?.auth?.getUser();
    
    if (user) {
      const { data: membership } = await supabase?.from('hive_members')?.select('role')?.eq('hive_id', hiveId)?.eq('user_id', user?.id)?.single();

      const { data: joinRequest } = await supabase?.from('hive_join_requests')?.select('status')?.eq('hive_id', hiveId)?.eq('user_id', user?.id)?.eq('status', 'pending')?.single();

      return {
        ...data,
        userRole: membership?.role || null,
        hasPendingRequest: !!joinRequest
      };
    }

    return data;
  },

  // Join a public hive
  async joinHive(hiveId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if hive is public
    const { data: hive, error: hiveError } = await supabase?.from('hives')?.select('privacy')?.eq('id', hiveId)?.single();

    if (hiveError) throw hiveError;

    if (hive?.privacy !== 'public') {
      throw new Error('Cannot join private hive directly. Request to join instead.');
    }

    const { data, error } = await supabase?.from('hive_members')?.insert({
        hive_id: hiveId,
        user_id: user?.id,
        role: 'member'
      })?.select()?.single();

    if (error) {
      // Check if already a member
      if (error?.code === '23505') {
        throw new Error('You are already a member of this hive');
      }
      throw error;
    }
    return data;
  },

  // Request to join a private hive
  async requestJoin(hiveId, message = '') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if already requested
    const { data: existingRequest } = await supabase
      ?.from('hive_join_requests')
      ?.select('id, status')
      ?.eq('hive_id', hiveId)
      ?.eq('user_id', user?.id)
      ?.eq('status', 'pending')
      ?.single();

    if (existingRequest) {
      throw new Error('You already have a pending request for this hive');
    }

    const { data, error } = await supabase?.from('hive_join_requests')?.insert({
        hive_id: hiveId,
        user_id: user?.id,
        status: 'pending',
        message
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Cancel join request
  async cancelJoinRequest(hiveId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('hive_join_requests')?.delete()?.eq('hive_id', hiveId)?.eq('user_id', user?.id)?.eq('status', 'pending');

    if (error) throw error;
  },

  // Get join requests for a hive (admin/owner only)
  async getJoinRequests(hiveId) {
    const { data, error } = await supabase?.from('hive_join_requests')?.select('*, user:user_profiles!hive_join_requests_user_id_fkey(id, username, full_name, avatar_url)')?.eq('hive_id', hiveId)?.eq('status', 'pending')?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Approve join request
  async approveJoinRequest(requestId, hiveId, userId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update request status
    const { error: updateError } = await supabase?.from('hive_join_requests')?.update({
        status: 'approved',
        responded_at: new Date()?.toISOString()
      })?.eq('id', requestId);

    if (updateError) throw updateError;

    // Add as member
    const { data, error: memberError } = await supabase?.from('hive_members')?.insert({
        hive_id: hiveId,
        user_id: userId,
        role: 'member'
      })?.select()?.single();

    if (memberError) throw memberError;
    return data;
  },

  // Reject join request
  async rejectJoinRequest(requestId) {
    const { error } = await supabase?.from('hive_join_requests')?.update({
        status: 'rejected',
        responded_at: new Date()?.toISOString()
      })?.eq('id', requestId);

    if (error) throw error;
  },

  // Get hive members
  async getHiveMembers(hiveId) {
    const { data, error } = await supabase?.from('hive_members')?.select('*, user:user_profiles!hive_members_user_id_fkey(id, username, full_name, avatar_url)')?.eq('hive_id', hiveId)?.order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get hive collections
  async getHiveCollections(hiveId) {
    const { data, error } = await supabase?.from('hive_collections')?.select('*')?.eq('hive_id', hiveId)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get hive snippets - CRITICAL FIX: Query hive_snippets junction table instead of team_id
  async getHiveSnippets(hiveId, filters = {}) {
    const { q, language, tags, page = 1, limit = 20 } = filters;

    // CRITICAL FIX: First get snippet IDs from hive_snippets junction table
    const { data: hiveSnippetLinks, error: linkError } = await supabase
      ?.from('hive_snippets')
      ?.select('snippet_id')
      ?.eq('hive_id', hiveId);

    if (linkError) throw linkError;

    // If no snippets in this hive, return empty result
    if (!hiveSnippetLinks || hiveSnippetLinks?.length === 0) {
      return { snippets: [], total: 0, page, limit };
    }

    // Extract snippet IDs
    const snippetIds = hiveSnippetLinks?.map(link => link?.snippet_id);

    // Now fetch actual snippet data using these IDs
    let query = supabase
      ?.from('snippets')
      ?.select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' })
      ?.in('id', snippetIds); // CRITICAL: Use .in() to match snippet IDs

    if (q) {
      query = query?.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (language) {
      query = query?.eq('language', language);
    }

    if (tags && tags?.length > 0) {
      query = query?.contains('ai_tags', tags);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query?.range(from, to)?.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return { snippets: data, total: count, page, limit };
  },

  // Get hive insights (for right sidebar)
  async getHiveInsights(hiveId) {
    // Get top collections
    const { data: collections } = await supabase?.from('hive_collections')?.select('id, name')?.eq('hive_id', hiveId)?.limit(5);

    // Get trending snippets (most viewed/liked in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);

    const { data: trendingSnippets } = await supabase?.from('snippets')?.select('id, title, views_count, likes_count')?.eq('team_id', hiveId)?.gte('created_at', sevenDaysAgo?.toISOString())?.order('views_count', { ascending: false })?.limit(5);

    // Get recent activity
    const { data: recentSnippets } = await supabase?.from('snippets')?.select('id, title, created_at, author:user_profiles!snippets_user_id_fkey(username)')?.eq('team_id', hiveId)?.order('created_at', { ascending: false })?.limit(5);

    // Get member count
    const { count: memberCount } = await supabase?.from('hive_members')?.select('*', { count: 'exact', head: true })?.eq('hive_id', hiveId);

    // Get snippet count
    const { count: snippetCount } = await supabase?.from('snippets')?.select('*', { count: 'exact', head: true })?.eq('team_id', hiveId);

    return {
      collections: collections || [],
      trendingSnippets: trendingSnippets || [],
      recentActivity: recentSnippets || [],
      totalMembers: memberCount || 0,
      totalSnippets: snippetCount || 0
    };
  },

  /**
   * Get hive activity timeline
   * @param {string} hiveId - Hive ID
   * @returns {Promise<Array>} Activity items
   */
  async getHiveActivity(hiveId) {
    try {
      // Fetch multiple activity sources and combine them
      const [snippetActivity, memberActivity, commentActivity] = await Promise.all([
        // Recent snippet additions - FIXED: Use correct foreign key column name 'added_by'
        supabase
          ?.from('hive_snippets')
          ?.select(`
            *,
            snippet:snippets(id, title, created_at, user_id),
            added_by_user:user_profiles!hive_snippets_added_by_fkey(id, username, full_name, avatar_url)
          `)
          ?.eq('hive_id', hiveId)
          ?.order('created_at', { ascending: false })
          ?.limit(20),
        
        // Recent member joins
        supabase
          ?.from('hive_members')
          ?.select('*, user:user_profiles!hive_members_user_id_fkey(id, username, full_name, avatar_url)')
          ?.eq('hive_id', hiveId)
          ?.order('joined_at', { ascending: false })
          ?.limit(20),
        
        // Recent comments on hive snippets
        supabase
          ?.from('snippet_comments')
          ?.select('*, user:user_profiles!snippet_comments_user_id_fkey(id, username, full_name, avatar_url), snippet:snippets!snippet_comments_snippet_id_fkey(id, title)')
          ?.in('snippet_id', 
            supabase
              ?.from('hive_snippets')
              ?.select('snippet_id')
              ?.eq('hive_id', hiveId)
          )
          ?.order('created_at', { ascending: false })
          ?.limit(20)
      ]);

      // Combine and format activities
      const activities = [];

      // Add snippet activities - FIXED: Access user data from added_by_user relationship
      if (snippetActivity?.data) {
        snippetActivity?.data?.forEach(item => {
          activities?.push({
            id: `snippet-${item?.id}`,
            type: 'snippet_added',
            created_at: item?.created_at,
            user: item?.added_by_user, // FIXED: Use added_by_user instead of item.user
            snippet: { id: item?.snippet?.id, title: item?.snippet?.title }
          });
        });
      }

      // Add member activities
      if (memberActivity?.data) {
        memberActivity?.data?.forEach(item => {
          activities?.push({
            id: `member-${item?.id}`,
            type: 'member_joined',
            created_at: item?.joined_at,
            user: item?.user
          });
        });
      }

      // Add comment activities
      if (commentActivity?.data) {
        commentActivity?.data?.forEach(item => {
          activities?.push({
            id: `comment-${item?.id}`,
            type: 'comment_added',
            created_at: item?.created_at,
            user: item?.user,
            snippet: { id: item?.snippet?.id, title: item?.snippet?.title }
          });
        });
      }

      // Sort by created_at descending
      activities?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Format time ago
      return activities?.slice(0, 50)?.map(activity => {
        const now = new Date();
        const activityDate = new Date(activity?.created_at);
        const diffMs = now - activityDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo;
        if (diffMins < 1) {
          timeAgo = 'Just now';
        } else if (diffMins < 60) {
          timeAgo = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          timeAgo = `${diffHours}h ago`;
        } else if (diffDays < 7) {
          timeAgo = `${diffDays}d ago`;
        } else {
          timeAgo = activityDate?.toLocaleDateString();
        }

        return {
          ...activity,
          timeAgo
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching hive activity:', error);
      throw error;
    }
  },

  /**
   * Update hive settings
   * @param {string} hiveId - Hive ID
   * @param {Object} updates - Settings to update
   * @returns {Promise<Object>} Updated hive
   */
  async updateHiveSettings(hiveId, updates) {
    try {
      const { data, error } = await supabase?.from('hives')?.update({
          name: updates?.name,
          description: updates?.description,
          privacy: updates?.privacy,
          tags: updates?.tags,
          updated_at: new Date()?.toISOString()
        })?.eq('id', hiveId)?.select()?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating hive settings:', error);
      throw error;
    }
  },

  /**
   * Get global explore feed with trending content
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Feed items with pagination
   */
  async getGlobalExploreFeed(filters = {}) {
    try {
      const { contentType = 'all', language, recency = 'all', page = 1, limit = 20, sortBy = 'trending', category, tagFilter } = filters;

      let feedItems = [];

      // Fetch snippets
      if (contentType === 'all' || contentType === 'snippets') {
        let query = supabase
          ?.from('snippets')
          ?.select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
          ?.eq('visibility', 'public');

        // Tag filter
        if (tagFilter) {
          query = query?.contains('ai_tags', [tagFilter]);
        }

        // Category filter (maps to snippet_type)
        const categoryTypeMap = { 'Algorithms': 'algorithm', 'API Patterns': 'function', 'Database': 'query', 'Config': 'config', 'UI Components': 'class' };
        if (category && categoryTypeMap[category]) {
          query = query?.eq('snippet_type', categoryTypeMap[category]);
        } else if (category) {
          query = query?.contains('ai_tags', [category.toLowerCase()]);
        }

        // Sort
        if (sortBy === 'newest') {
          query = query?.order('created_at', { ascending: false });
        } else if (sortBy === 'most_reused') {
          query = query?.order('views_count', { ascending: false });
        } else if (sortBy === 'top_rated') {
          query = query?.order('ai_quality_score', { ascending: false, nullsFirst: false });
        } else {
          query = query?.order('views_count', { ascending: false })?.order('likes_count', { ascending: false });
        }

        const { data: snippets, error: snippetsError } = await query?.limit(contentType === 'snippets' ? limit : 10);
        if (snippetsError) console.error('Snippets query error:', snippetsError);

        snippets?.forEach(snippet => {
          feedItems?.push({
            id: `snippet-${snippet?.id}`,
            type: 'snippet',
            created_at: snippet?.created_at,
            data: snippet
          });
        });
      }

      // Fetch popular discussions (bug fixes with comments)
      if (contentType === 'all' || contentType === 'discussions') {
        const { data: bugs } = await supabase
          ?.from('bugs')
          ?.select('*, reporter:user_profiles!bugs_reporter_id_fkey(id, username, full_name, avatar_url)')
          ?.eq('visibility', 'public')
          ?.order('created_at', { ascending: false })
          ?.limit(contentType === 'discussions' ? limit : 10);

        bugs?.forEach(bug => {
          feedItems?.push({
            id: `discussion-${bug?.id}`,
            type: 'discussion',
            created_at: bug?.created_at,
            data: bug
          });
        });
      }

      // Fetch featured collections
      if (contentType === 'all' || contentType === 'collections') {
        const { data: collections } = await supabase
          ?.from('hive_collections')
          ?.select('*, hive:hives!hive_collections_hive_id_fkey(id, name), creator:user_profiles!hive_collections_created_by_fkey(id, username, full_name, avatar_url)')
          ?.order('created_at', { ascending: false })
          ?.limit(contentType === 'collections' ? limit : 10);

        collections?.forEach(collection => {
          feedItems?.push({
            id: `collection-${collection?.id}`,
            type: 'collection',
            created_at: collection?.created_at,
            data: collection
          });
        });
      }

      // Apply language filter
      if (language && language !== 'all') {
        feedItems = feedItems?.filter(item => {
          if (item?.type === 'snippet') {
            return item?.data?.language === language;
          }
          return true;
        });
      }

      // Apply recency filter
      if (recency !== 'all') {
        const cutoffDate = new Date();
        switch (recency) {
          case '24h': cutoffDate?.setHours(cutoffDate?.getHours() - 24); break;
          case '7d': cutoffDate?.setDate(cutoffDate?.getDate() - 7); break;
          case '30d': cutoffDate?.setDate(cutoffDate?.getDate() - 30); break;
        }
        feedItems = feedItems?.filter(item => new Date(item?.created_at) >= cutoffDate);
      }

      // Sort by created_at descending (for mixed feeds)
      if (sortBy === 'newest' || contentType === 'all') {
        feedItems?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit;
      const paginatedItems = feedItems?.slice(from, to);

      return {
        items: paginatedItems,
        total: feedItems?.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching explore feed:', error);
      throw error;
    }
  },

  async getTrendingTags(limit = 15) {
    try {
      const { data } = await supabase
        ?.from('snippets')
        ?.select('ai_tags')
        ?.eq('visibility', 'public')
        ?.not('ai_tags', 'is', null)
        ?.limit(500);

      const tagCounts = {};
      data?.forEach(s => s?.ai_tags?.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      return [];
    }
  },

  async getTopContributors(limit = 5) {
    try {
      const { data } = await supabase
        ?.from('snippets')
        ?.select('user_id, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
        ?.eq('visibility', 'public')
        ?.limit(1000);

      const userCounts = {};
      const userProfiles = {};
      data?.forEach(s => {
        const uid = s?.user_id;
        if (!uid) return;
        userCounts[uid] = (userCounts[uid] || 0) + 1;
        if (!userProfiles[uid] && s?.author) userProfiles[uid] = s.author;
      });
      return Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id, count]) => ({ ...userProfiles[id], snippet_count: count }));
    } catch (error) {
      console.error('Error fetching top contributors:', error);
      return [];
    }
  },

  async getExploreStats() {
    try {
      const { count: total } = await supabase
        ?.from('snippets')?.select('*', { count: 'exact', head: true })?.eq('visibility', 'public');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newToday } = await supabase
        ?.from('snippets')?.select('*', { count: 'exact', head: true })
        ?.eq('visibility', 'public')?.gte('created_at', today.toISOString());

      return { totalSnippets: total || 0, newToday: newToday || 0 };
    } catch (error) {
      console.error('Error fetching explore stats:', error);
      return { totalSnippets: 0, newToday: 0 };
    }
  },

  async getCategoryCounts() {
    try {
      const { data } = await supabase
        ?.from('snippets')
        ?.select('snippet_type, ai_analysis_data')
        ?.eq('visibility', 'public')
        ?.limit(1000);

      const typeLabels = { code: 'Code', function: 'Functions', class: 'Classes', algorithm: 'Algorithms', config: 'Config', query: 'Database' };
      const counts = {};
      data?.forEach(s => {
        if (s?.snippet_type) {
          const label = typeLabels[s.snippet_type] || s.snippet_type;
          counts[label] = (counts[label] || 0) + 1;
        }
        const tags = s?.ai_analysis_data?.purposeTags || [];
        tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([category, count]) => ({ category, count }));
    } catch (error) {
      console.error('Error fetching category counts:', error);
      return [];
    }
  },

  /**
   * Advanced search across hives, snippets, and collections
   * @param {Object} searchParams - Advanced search parameters
   * @returns {Promise<Object>} Search results
   */
  async advancedSearch(searchParams = {}) {
    try {
      const {
        query = '',
        contentType = 'all',
        language,
        tags = [],
        authorName,
        dateRange = { from: null, to: null },
        engagementMin = { views: 0, likes: 0, comments: 0 },
        page = 1,
        limit = 20
      } = searchParams;

      let results = {
        snippets: [],
        hives: [],
        collections: [],
        bugs: []
      };

      // Search snippets
      if (contentType === 'all' || contentType === 'snippets') {
        let snippetQuery = supabase
          ?.from('snippets')
          ?.select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' })
          ?.eq('visibility', 'public');

        if (query) {
          snippetQuery = snippetQuery?.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        }

        if (language) {
          snippetQuery = snippetQuery?.eq('language', language);
        }

        if (tags?.length > 0) {
          snippetQuery = snippetQuery?.contains('ai_tags', tags);
        }

        if (authorName) {
          const { data: authorProfile } = await supabase
            ?.from('user_profiles')
            ?.select('id')
            ?.or(`username.ilike.%${authorName}%,full_name.ilike.%${authorName}%`)
            ?.limit(1)
            ?.single();

          if (authorProfile) {
            snippetQuery = snippetQuery?.eq('user_id', authorProfile?.id);
          }
        }

        if (dateRange?.from) {
          snippetQuery = snippetQuery?.gte('created_at', dateRange?.from);
        }

        if (dateRange?.to) {
          snippetQuery = snippetQuery?.lte('created_at', dateRange?.to);
        }

        if (engagementMin?.views > 0) {
          snippetQuery = snippetQuery?.gte('views_count', engagementMin?.views);
        }

        if (engagementMin?.likes > 0) {
          snippetQuery = snippetQuery?.gte('likes_count', engagementMin?.likes);
        }

        const { data: snippets, count: snippetCount } = await snippetQuery
          ?.order('created_at', { ascending: false })
          ?.range((page - 1) * limit, page * limit - 1);

        results.snippets = snippets || [];
        results.snippetCount = snippetCount || 0;
      }

      // Search hives
      if (contentType === 'all' || contentType === 'hives') {
        let hiveQuery = supabase
          ?.from('hives')
          ?.select('*, owner:user_profiles!hives_owner_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' });

        if (query) {
          hiveQuery = hiveQuery?.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        if (tags?.length > 0) {
          hiveQuery = hiveQuery?.contains('tags', tags);
        }

        const { data: hives, count: hiveCount } = await hiveQuery
          ?.order('member_count', { ascending: false })
          ?.range((page - 1) * limit, page * limit - 1);

        results.hives = hives || [];
        results.hiveCount = hiveCount || 0;
      }

      // Search collections
      if (contentType === 'all' || contentType === 'collections') {
        let collectionQuery = supabase
          ?.from('hive_collections')
          ?.select('*, hive:hives!hive_collections_hive_id_fkey(id, name), creator:user_profiles!hive_collections_created_by_fkey(id, username, full_name, avatar_url)', { count: 'exact' });

        if (query) {
          collectionQuery = collectionQuery?.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        const { data: collections, count: collectionCount } = await collectionQuery
          ?.order('created_at', { ascending: false })
          ?.range((page - 1) * limit, page * limit - 1);

        results.collections = collections || [];
        results.collectionCount = collectionCount || 0;
      }

      // Search bugs/discussions
      if (contentType === 'all' || contentType === 'bugs') {
        let bugQuery = supabase
          ?.from('bugs')
          ?.select('*, reporter:user_profiles!bugs_reporter_id_fkey(id, username, full_name, avatar_url)', { count: 'exact' })
          ?.eq('visibility', 'public');

        if (query) {
          bugQuery = bugQuery?.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        }

        const { data: bugs, count: bugCount } = await bugQuery
          ?.order('created_at', { ascending: false })
          ?.range((page - 1) * limit, page * limit - 1);

        results.bugs = bugs || [];
        results.bugCount = bugCount || 0;
      }

      return {
        ...results,
        page,
        limit,
        totalResults: (results?.snippetCount || 0) + (results?.hiveCount || 0) + (results?.collectionCount || 0) + (results?.bugCount || 0)
      };
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  },

  /**
   * Save a search query for later
   * @param {Object} searchData - Search query data
   * @returns {Promise<Object>} Saved search
   */
  async saveSearch(searchData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('saved_searches')
        ?.insert({
          user_id: user?.id,
          name: searchData?.name,
          query: searchData?.query,
          filters: searchData?.filters,
          notification_enabled: searchData?.notificationEnabled || false
        })
        ?.select()
        ?.single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  },

  /**
   * Get user's saved searches
   * @returns {Promise<Array>} Saved searches
   */
  async getSavedSearches() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('saved_searches')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw error;
    }
  },

  /**
   * Delete a saved search
   * @param {string} searchId - Search ID
   */
  async deleteSavedSearch(searchId) {
    try {
      const { error } = await supabase
        ?.from('saved_searches')
        ?.delete()
        ?.eq('id', searchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  },

  // ✅ NEW: Update member role (admin/owner only)
  async updateMemberRole(hiveId, userId, newRole) {
    const { data, error } = await supabase?.from('hive_members')?.update({ role: newRole })?.eq('hive_id', hiveId)?.eq('user_id', userId)?.select(`
        *,
        user:user_profiles!hive_members_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)?.single();

    if (error) {
      console.error('Error updating member role:', error);
      throw error;
    }

    return {
      id: data?.id,
      role: data?.role,
      joinedAt: data?.joined_at,
      user: {
        id: data?.user?.id,
        username: data?.user?.username,
        fullName: data?.user?.full_name,
        avatarUrl: data?.user?.avatar_url
      }
    };
  },

  // ✅ NEW: Remove member from hive (owner only)
  async removeMember(hiveId, userId) {
    const { error } = await supabase?.from('hive_members')?.delete()?.eq('hive_id', hiveId)?.eq('user_id', userId);

    if (error) {
      console.error('Error removing member:', error);
      throw error;
    }

    return { success: true };
  },

  // ✅ NEW: Get available roles for role picker
  getAvailableRoles() {
    return [
      { 
        value: 'admin', 
        label: 'Admin',
        icon: '⭐',
        description: 'Manage members, moderate content, manage settings',
        color: 'blue'
      },
      { 
        value: 'editor', 
        label: 'Editor',
        icon: '✏️',
        description: 'Create/edit snippets and collections',
        color: 'green'
      },
      { 
        value: 'member', 
        label: 'Member',
        icon: '👤',
        description: 'Contribute snippets and participate',
        color: 'gray'
      },
      { 
        value: 'viewer', 
        label: 'Viewer',
        icon: '👁️',
        description: 'Read-only access, can view and comment',
        color: 'purple'
      }
    ];
  },

  // ✅ NEW: Check if user can manage roles
  getRoleCapabilities(userRole) {
    const capabilities = {
      owner: {
        canUpdateRoles: true,
        canRemoveMembers: true,
        canManageRoles: ['admin', 'editor', 'member', 'viewer'],
        canDeleteHive: true,
        canUpdateSettings: true
      },
      admin: {
        canUpdateRoles: true,
        canRemoveMembers: false,
        canManageRoles: ['editor', 'member', 'viewer'], // Cannot manage owner/admin
        canDeleteHive: false,
        canUpdateSettings: true
      },
      editor: {
        canUpdateRoles: false,
        canRemoveMembers: false,
        canManageRoles: [],
        canDeleteHive: false,
        canUpdateSettings: false
      },
      member: {
        canUpdateRoles: false,
        canRemoveMembers: false,
        canManageRoles: [],
        canDeleteHive: false,
        canUpdateSettings: false
      },
      viewer: {
        canUpdateRoles: false,
        canRemoveMembers: false,
        canManageRoles: [],
        canDeleteHive: false,
        canUpdateSettings: false
      }
    };

    return capabilities?.[userRole] || capabilities?.viewer;
  },

  /**
   * Get company-specific hives (excludes global hives)
   */
  async getCompanyHives(userId) {
    try {
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('company_id')?.eq('id', userId)?.single();

      if (profileError) throw profileError;
      if (!profile?.company_id) return [];

      // CRITICAL FIX: Use hive_snippets junction table instead of direct snippets relationship
      const { data, error } = await supabase?.from('hives')?.select(`
          *,
          hive_members!inner(role),
          member_count:hive_members(count),
          snippet_count:hive_snippets(count)
        `)?.eq('company_id', profile?.company_id)?.eq('is_global', false)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(hive => ({
        ...hive,
        member_count: hive?.member_count?.[0]?.count || 0,
        snippet_count: hive?.snippet_count?.[0]?.count || 0,
        is_owner: hive?.hive_members?.[0]?.role === 'owner',
        collection_count: 0 // Will be updated with actual count
      })) || [];
    } catch (error) {
      console.error('Error fetching company hives:', error);
      throw error;
    }
  },

  /**
   * Create a company-specific hive
   */
  async createCompanyHive(hiveData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company
      const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('company_id, role')?.eq('id', user?.id)?.single();

      if (profileError) throw profileError;

      // Only company_admin/team_admin can create company hives (FIXED: Use correct enum values)
      if (!['company_admin', 'team_admin']?.includes(profile?.role)) {
        throw new Error('Only company admins and team admins can create company hives');
      }

      // CRITICAL FIX: Generate unique slug with collision handling
      let baseSlug = hiveData?.name?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let attempts = 0;
      const maxAttempts = 10;

      // Check if slug exists and generate unique one if needed
      while (attempts < maxAttempts) {
        const { data: existingHive, error: checkError } = await supabase
          ?.from('hives')
          ?.select('id')
          ?.eq('slug', slug)
          ?.single();

        // If no existing hive found, this slug is available
        if (checkError?.code === 'PGRST116' || !existingHive) {
          break;
        }

        // Slug exists, append timestamp-based suffix
        attempts++;
        const timestamp = Date.now();
        slug = `${baseSlug}-${timestamp}`;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique slug for hive. Please try a different name.');
      }

      // CRITICAL FIX: Create the hive - trigger automatically adds owner to hive_members
      const { data: newHive, error: hiveError } = await supabase?.from('hives')?.insert({
          name: hiveData?.name,
          slug,
          description: hiveData?.description,
          privacy: 'company_only', // FIXED: Company hives are always company_only
          company_id: profile?.company_id,
          is_global: false,
          owner_id: user?.id
        })?.select()?.single();

      if (hiveError) throw hiveError;

      return {
        ...newHive,
        member_count: 1,
        snippet_count: 0,
        collection_count: 0,
        is_owner: true
      };
    } catch (error) {
      console.error('Error creating company hive:', error);
      throw error;
    }
  },

  /**
   * Get user profile with company info
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          *,
          companies(name)
        `)?.eq('id', userId)?.single();

      if (error) throw error;

      return {
        ...data,
        company_name: data?.companies?.name
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async shareSnippetToHive(snippetId, hiveId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      // Check membership
      const { data: membership } = await supabase
        .from('hive_members')
        .select('id')
        .eq('hive_id', hiveId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!membership) throw new Error('You must be a member of this hive');

      // Check if already shared
      const { data: existing } = await supabase
        .from('hive_snippets')
        .select('id')
        .eq('hive_id', hiveId)
        .eq('snippet_id', snippetId)
        .maybeSingle();
      if (existing) throw new Error('Snippet already shared to this hive');

      const { data, error } = await supabase
        .from('hive_snippets')
        .insert({ hive_id: hiveId, snippet_id: snippetId, added_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sharing snippet to hive:', error);
      throw error;
    }
  },
};