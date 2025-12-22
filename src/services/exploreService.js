import { supabase } from '../lib/supabase';

/**
 * Explore Service - ENHANCED VERSION
 * Handles global search and exploration of public content with advanced features
 */
export const exploreService = {
  /**
   * 🎯 SEMANTIC TAG MAPPING - Maps user queries to relevant AI tags
   * This allows smart searching: "gallery\" → finds snippets tagged with \"gallery", "image", "photo", "slideshow"
   */
  getRelevantTags(searchQuery) {
    if (!searchQuery) return [];
    
    let query = searchQuery?.toLowerCase()?.trim();
    
    // Define semantic tag relationships
    const tagMappings = {
      // Gallery/Image related
      'gallery': ['gallery', 'image', 'photo', 'slideshow', 'carousel', 'lightbox', 'grid', 'masonry'],
      'image': ['image', 'photo', 'picture', 'gallery', 'media', 'upload'],
      'photo': ['photo', 'image', 'picture', 'gallery', 'camera'],
      
      // Auth related
      'auth': ['authentication', 'login', 'signup', 'oauth', 'jwt', 'session'],
      'login': ['login', 'authentication', 'signin', 'auth'],
      'signup': ['signup', 'register', 'authentication', 'auth'],
      
      // UI Components
      'modal': ['modal', 'dialog', 'popup', 'overlay'],
      'form': ['form', 'input', 'validation', 'submit'],
      'button': ['button', 'cta', 'action', 'click'],
      'navigation': ['navigation', 'menu', 'navbar', 'sidebar', 'header'],
      
      // Data operations
      'crud': ['crud', 'create', 'read', 'update', 'delete', 'database'],
      'api': ['api', 'rest', 'endpoint', 'fetch', 'axios'],
      'database': ['database', 'sql', 'query', 'schema', 'crud'],
      
      // Common features
      'search': ['search', 'filter', 'query', 'find'],
      'table': ['table', 'grid', 'datatable', 'list'],
      'chart': ['chart', 'graph', 'visualization', 'analytics'],
      'dashboard': ['dashboard', 'analytics', 'metrics', 'overview'],
      
      // React specific
      'hook': ['hook', 'usestate', 'useeffect', 'react'],
      'component': ['component', 'react', 'jsx', 'ui'],
      
      // State management
      'redux': ['redux', 'state', 'store', 'reducer', 'action'],
      'context': ['context', 'provider', 'state', 'react']
    };
    
    // Find matching tags
    const relevantTags = [];
    
    // Direct match
    if (tagMappings?.[query]) {
      relevantTags?.push(...tagMappings?.[query]);
    }
    
    // Partial match - search in keys and values
    Object.entries(tagMappings)?.forEach(([key, tags]) => {
      if (query?.includes(key) || key?.includes(query)) {
        relevantTags?.push(...tags);
      }
      
      // Check if query matches any tag in the array
      tags?.forEach(tag => {
        if (query?.includes(tag) || tag?.includes(query)) {
          relevantTags?.push(...tags);
        }
      });
    });
    
    // Remove duplicates and return
    return [...new Set(relevantTags)];
  },

  /**
   * 🎯 NEW METHOD: Get tag suggestions based on search query
   * Helps users discover related tags they can filter by
   */
  async getTagSuggestions(searchQuery = '', limit = 10) {
    try {
      if (!searchQuery || !searchQuery?.trim()) {
        // Return most popular tags when no query
        const { data, error } = await supabase
          ?.from('snippets')
          ?.select('ai_tags')
          ?.eq('visibility', 'public')
          ?.not('ai_tags', 'is', null)
          ?.limit(500);

        if (error) throw error;

        // Flatten and count all tags
        const tagCounts = {};
        data?.forEach(snippet => {
          snippet?.ai_tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts?.[tag] || 0) + 1;
          });
        });

        // Sort by frequency and return top results
        return Object.entries(tagCounts)?.sort((a, b) => b?.[1] - a?.[1])?.slice(0, limit)?.map(([tag, count]) => ({ tag, count }));
      }

      // Get relevant tags from semantic mapping
      const relevantTags = this.getRelevantTags(searchQuery);

      // Get actual tags from snippets matching the query
      const { data, error } = await supabase
        ?.from('snippets')
        ?.select('ai_tags')
        ?.eq('visibility', 'public')
        ?.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        ?.not('ai_tags', 'is', null)
        ?.limit(100);

      if (error) throw error;

      // Count tag occurrences
      const tagCounts = {};
      data?.forEach(snippet => {
        snippet?.ai_tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts?.[tag] || 0) + 1;
        });
      });

      // Combine semantic tags with actual tags
      const combinedTags = [...new Set([...relevantTags, ...Object.keys(tagCounts)])];

      // Create result with counts (0 for semantic tags not found)
      const results = combinedTags?.map(tag => ({
        tag,
        count: tagCounts?.[tag] || 0,
        isSuggested: relevantTags?.includes(tag) // Mark semantic suggestions
      }));

      // Sort by count (actual matches first) then alphabetically
      results?.sort((a, b) => {
        if (b?.count !== a?.count) return b?.count - a?.count;
        return a?.tag?.localeCompare(b?.tag);
      });

      return results?.slice(0, limit);
    } catch (error) {
      console.error('Error getting tag suggestions:', error);
      return [];
    }
  },

  /**
   * Search across all public content (snippets, bugs, users, teams) - ENHANCED WITH SEMANTIC TAG SEARCH
   */
  async searchAll(searchQuery = '', filters = {}) {
    try {
      const results = {
        snippets: [],
        bugs: [],
        users: [],
        teams: [],
        totalResults: 0,
        hasMore: false
      };

      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      // 🎯 SMART TAG DETECTION - Get relevant tags from search query
      const relevantTags = this.getRelevantTags(searchQuery);

      // Search snippets - FIXED: Only truly public snippets (no team/company association)
      if (!filters?.contentType || filters?.contentType === 'all' || filters?.contentType === 'snippets') {
        let snippetQuery = supabase?.from('snippets')?.select(`
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
          ?.eq('visibility', 'public')
          ?.is('team_id', null)
          ?.is('company_id', null);

        // 🎯 TEXT SEARCH - Apply only if query exists
        if (searchQuery && searchQuery?.trim()) {
          snippetQuery = snippetQuery?.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
        }
        
        // 🚀 SEMANTIC TAG SEARCH - Apply tag filtering separately
        if (relevantTags?.length > 0) {
          snippetQuery = snippetQuery?.overlaps('ai_tags', relevantTags);
        }

        if (filters?.language && filters?.language !== 'all') {
          snippetQuery = snippetQuery?.eq('language', filters?.language);
        }

        if (filters?.snippetType && filters?.snippetType?.length > 0) {
          snippetQuery = snippetQuery?.in('snippet_type', filters?.snippetType);
        }

        // 🎯 USER-SELECTED AI TAG FILTERING
        if (filters?.aiTags && filters?.aiTags?.length > 0) {
          snippetQuery = snippetQuery?.overlaps('ai_tags', filters?.aiTags);
        }

        if (filters?.dateRange && filters?.dateRange !== 'all') {
          const dateFilter = this.getDateFilter(filters?.dateRange);
          if (dateFilter) {
            snippetQuery = snippetQuery?.gte('created_at', dateFilter);
          }
        }

        if (filters?.minLikes) {
          snippetQuery = snippetQuery?.gte('likes_count', filters?.minLikes);
        }

        if (filters?.hasComments) {
          snippetQuery = snippetQuery?.gt('comments_count', 0);
        }

        // 🎯 SORTING - Use ONLY existing database columns
        let sortBy = filters?.sortBy || 'created_at';
        const sortOrder = filters?.sortOrder || 'desc';
        
        // Map frontend sortBy values to actual database columns
        let dbSortColumn = 'created_at';
        if (sortBy === 'likes' || sortBy === 'popular') {
          dbSortColumn = 'likes_count';
        } else if (sortBy === 'views') {
          dbSortColumn = 'views_count';
        } else if (sortBy === 'comments') {
          dbSortColumn = 'comments_count';
        } else if (sortBy === 'newest' || sortBy === 'recent') {
          dbSortColumn = 'created_at';
        }
        
        snippetQuery = snippetQuery?.order(dbSortColumn, { ascending: sortOrder === 'asc' });

        // Pagination
        snippetQuery = snippetQuery?.range(offset, offset + limit - 1);

        const { data: snippets, error: snippetError, count } = await snippetQuery;

        if (snippetError) {
          console.error('Error fetching snippets:', snippetError);
          throw new Error(snippetError?.message || 'Failed to fetch snippets');
        }
        
        results.snippets = snippets?.map(s => ({
          ...s,
          type: 'snippet',
          author: s?.user_profiles,
          codePreview: s?.code?.substring(0, 200)
        })) || [];
        results.totalResults += count || 0;
        results.hasMore = (offset + limit) < (count || 0);
      }

      // Search bugs with enhanced filtering
      if (!filters?.contentType || filters?.contentType === 'all' || filters?.contentType === 'bugs') {
        let bugQuery = supabase
          ?.from('bugs')
          ?.select(`
            id,
            title,
            description,
            code,
            language,
            visibility,
            bug_status,
            priority,
            likes_count,
            comments_count,
            views_count,
            created_at,
            user_profiles!bugs_user_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `, { count: 'exact' })
          ?.eq('visibility', 'public');

        // Only apply text search if query exists
        if (searchQuery && searchQuery?.trim()) {
          bugQuery = bugQuery?.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`);
        }

        if (filters?.language && filters?.language !== 'all') {
          bugQuery = bugQuery?.eq('language', filters?.language);
        }

        if (filters?.bugStatus && filters?.bugStatus?.length > 0) {
          bugQuery = bugQuery?.in('bug_status', filters?.bugStatus);
        }

        if (filters?.priority && filters?.priority?.length > 0) {
          bugQuery = bugQuery?.in('priority', filters?.priority);
        }

        if (filters?.dateRange && filters?.dateRange !== 'all') {
          const dateFilter = this.getDateFilter(filters?.dateRange);
          if (dateFilter) {
            bugQuery = bugQuery?.gte('created_at', dateFilter);
          }
        }

        // 🎯 SORTING - Use ONLY existing database columns
        let sortBy = filters?.sortBy || 'created_at';
        const sortOrder = filters?.sortOrder || 'desc';
        
        // Map frontend sortBy values to actual database columns
        let dbSortColumn = 'created_at';
        if (sortBy === 'likes' || sortBy === 'popular') {
          dbSortColumn = 'likes_count';
        } else if (sortBy === 'views') {
          dbSortColumn = 'views_count';
        } else if (sortBy === 'comments') {
          dbSortColumn = 'comments_count';
        } else if (sortBy === 'newest' || sortBy === 'recent') {
          dbSortColumn = 'created_at';
        } else if (sortBy === 'priority') {
          dbSortColumn = 'priority';
        }
        
        bugQuery = bugQuery?.order(dbSortColumn, { ascending: sortOrder === 'asc' });

        // Pagination
        bugQuery = bugQuery?.range(offset, offset + limit - 1);

        const { data: bugs, error: bugError, count } = await bugQuery;

        if (bugError) {
          console.error('Error fetching bugs:', bugError);
          throw new Error(bugError?.message || 'Failed to fetch bugs');
        } else {
          results.bugs = bugs?.map(b => ({
            ...b,
            type: 'bug',
            reporter: b?.user_profiles,
            status: b?.bug_status,
            errorPreview: b?.code?.substring(0, 200)
          })) || [];
          results.totalResults += count || 0;
          results.hasMore = results?.hasMore || ((offset + limit) < (count || 0));
        }
      }

      // Search users with enhanced filtering
      if (!filters?.contentType || filters?.contentType === 'all' || filters?.contentType === 'users') {
        let userQuery = supabase
          ?.from('user_profiles')
          ?.select(`
            id,
            username,
            full_name,
            avatar_url,
            bio,
            role,
            contributor_level,
            snippets_count,
            followers_count,
            following_count
          `, { count: 'exact' });

        // Only apply text search if query exists
        if (searchQuery && searchQuery?.trim()) {
          userQuery = userQuery?.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
        }

        if (filters?.contributorLevel && filters?.contributorLevel?.length > 0) {
          userQuery = userQuery?.in('contributor_level', filters?.contributorLevel);
        }

        // 🎯 FIXED SORTING - Map frontend sortBy values BEFORE validation
        let sortBy = filters?.sortBy || 'snippets_count';
        
        // 🚨 CRITICAL FIX: Map 'relevance' BEFORE validation
        if (sortBy === 'relevance') {
          sortBy = 'snippets_count';
        }
        
        // Define valid database columns for user_profiles table
        const validColumns = ['id', 'username', 'full_name', 'bio', 'role', 'contributor_level', 
                              'snippets_count', 'followers_count', 'following_count', 'created_at', 'points'];
        
        // Fallback if sortBy is still not valid
        if (!validColumns?.includes(sortBy)) {
          sortBy = 'snippets_count';
        }
        
        const sortOrder = filters?.sortOrder || 'desc';
        userQuery = userQuery?.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        userQuery = userQuery?.range(offset, offset + limit - 1);

        const { data: users, error: userError, count } = await userQuery;

        if (userError) {
          console.error('Error fetching users:', userError);
          throw new Error(userError?.message || 'Failed to fetch users');
        } else {
          results.users = users?.map(u => ({
            ...u,
            type: 'user',
            name: u?.full_name || u?.username,
            snippets: u?.snippets_count,
            followers: u?.followers_count,
            following: u?.following_count
          })) || [];
          results.totalResults += count || 0;
          results.hasMore = results?.hasMore || ((offset + limit) < (count || 0));
        }
      }

      // Search teams with enhanced filtering
      if (!filters?.contentType || filters?.contentType === 'all' || filters?.contentType === 'teams') {
        let teamQuery = supabase
          ?.from('teams')
          ?.select(`
            id,
            name,
            description,
            created_at,
            companies(
              id,
              name
            ),
            user_profiles!teams_created_by_fkey(
              id,
              username,
              full_name
            )
          `, { count: 'exact' });

        // Only apply text search if query exists
        if (searchQuery && searchQuery?.trim()) {
          teamQuery = teamQuery?.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        // 🎯 FIXED SORTING - Map frontend sortBy values to actual database columns
        let sortBy = filters?.sortBy || 'created_at';
        
        // Map frontend sortBy values that don't exist in database to valid columns
        if (sortBy === 'relevance') {
          // When sorting by relevance in search context, prioritize created_at (newest first)
          sortBy = 'created_at';
        }
        
        // Define valid database columns for teams table
        const validColumns = ['id', 'name', 'company_id', 'created_at', 'created_by', 'updated_at', 'description'];
        
        // If sortBy is still not in validColumns after mapping, default to created_at
        if (!validColumns?.includes(sortBy)) {
          sortBy = 'created_at';
        }
        
        const sortOrder = filters?.sortOrder || 'desc';
        teamQuery = teamQuery?.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        teamQuery = teamQuery?.range(offset, offset + limit - 1);

        const { data: teams, error: teamError, count } = await teamQuery;

        if (teamError) {
          console.error('Error fetching teams:', teamError);
          throw new Error(teamError?.message || 'Failed to fetch teams');
        } else {
          results.teams = teams?.map(t => ({
            ...t,
            type: 'team',
            company: t?.companies?.name,
            teamLead: t?.user_profiles?.full_name || t?.user_profiles?.username
          })) || [];
          results.totalResults += count || 0;
          results.hasMore = results?.hasMore || ((offset + limit) < (count || 0));
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching explore:', error);
      throw new Error(error?.message || 'Failed to search');
    }
  },

  /**
   * Get date filter for queries
   */
  getDateFilter(dateRange) {
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
  },

  /**
   * Search snippets with advanced filters - COMPLETELY FIXED
   */
  async searchSnippets(searchTerm = '', filters = {}) {
    try {
      // 🎯 SMART TAG DETECTION
      const relevantTags = this.getRelevantTags(searchTerm);
      
      let query = supabase?.from('snippets')?.select(`
          *,
          user_profiles!inner(id, full_name, username, avatar_url)
        `)
        ?.eq('visibility', 'public')
        ?.is('team_id', null)
        ?.is('company_id', null);

      // 🎯 TEXT SEARCH - Apply only if searchTerm exists
      if (searchTerm && searchTerm?.trim()) {
        query = query?.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`);
      }
      
      // 🚀 SEMANTIC TAG SEARCH - Apply tag filtering separately
      if (relevantTags?.length > 0) {
        query = query?.overlaps('ai_tags', relevantTags);
      }

      if (filters?.language) {
        query = query?.eq('language', filters?.language);
      }

      // 🎯 USER-SELECTED AI TAG FILTERING
      if (filters?.aiTags && filters?.aiTags?.length > 0) {
        query = query?.overlaps('ai_tags', filters?.aiTags);
      }

      if (filters?.dateRange) {
        const now = new Date();
        let startDate;
        
        switch (filters?.dateRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (startDate) {
          query = query?.gte('created_at', startDate?.toISOString());
        }
      }

      if (filters?.minLikes) {
        query = query?.gte('likes_count', filters?.minLikes);
      }

      if (filters?.hasComments) {
        query = query?.gt('comments_count', 0);
      }

      // 🎯 SORTING - Use ONLY existing database columns
      let dbSortColumn = 'created_at';
      let sortBy = filters?.sortBy || 'created_at';
      
      if (sortBy === 'likes' || sortBy === 'popular') {
        dbSortColumn = 'likes_count';
      } else if (sortBy === 'views') {
        dbSortColumn = 'views_count';
      } else if (sortBy === 'comments') {
        dbSortColumn = 'comments_count';
      } else if (sortBy === 'newest' || sortBy === 'recent') {
        dbSortColumn = 'created_at';
      }
      
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(dbSortColumn, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error searching snippets:', error);
        throw error;
      }

      return data?.map(snippet => ({
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
        updatedAt: snippet?.updated_at,
        author: {
          id: snippet?.user_profiles?.id,
          name: snippet?.user_profiles?.full_name || snippet?.user_profiles?.username,
          username: snippet?.user_profiles?.username,
          avatar: snippet?.user_profiles?.avatar_url
        }
      })) || [];
    } catch (error) {
      console.error('Error searching snippets:', error);
      throw new Error(error?.message || 'Failed to search snippets');
    }
  },

  /**
   * Search users
   */
  async searchUsers(searchTerm = '', filters = {}) {
    try {
      let query = supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          role,
          contributor_level,
          snippets_count,
          followers_count,
          following_count
        `);

      // Text search
      if (searchTerm) {
        query = query?.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      // Contributor level filter
      if (filters?.contributorLevel && filters?.contributorLevel?.length > 0) {
        query = query?.in('contributor_level', filters?.contributorLevel);
      }

      // 🎯 FIXED SORTING - Map frontend sortBy values to actual database columns
      let sortBy = filters?.sortBy || 'snippets_count';
      
      // Map frontend sortBy values that don't exist in database to valid columns
      if (sortBy === 'relevance') {
        // When sorting by relevance in search context, prioritize snippets_count
        sortBy = 'snippets_count';
      }
      
      // Define valid database columns for user_profiles table
      const validColumns = ['id', 'username', 'full_name', 'bio', 'role', 'contributor_level', 
                            'snippets_count', 'followers_count', 'following_count', 'created_at', 'points'];
      
      // If sortBy is still not in validColumns after mapping, default to snippets_count
      if (!validColumns?.includes(sortBy)) {
        sortBy = 'snippets_count';
      }
      
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(user => ({
        id: user?.id,
        username: user?.username,
        fullName: user?.full_name,
        avatarUrl: user?.avatar_url,
        bio: user?.bio,
        role: user?.role,
        contributorLevel: user?.contributor_level,
        snippetsCount: user?.snippets_count || 0,
        followersCount: user?.followers_count || 0,
        followingCount: user?.following_count || 0,
        type: 'user'
      })) || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error(error?.message || 'Failed to search users');
    }
  },

  /**
   * Search teams
   */
  async searchTeams(searchTerm = '', filters = {}) {
    try {
      let query = supabase
        ?.from('teams')
        ?.select(`
          id,
          name,
          description,
          created_at,
          companies(
            id,
            name
          ),
          user_profiles!teams_created_by_fkey(
            id,
            username,
            full_name
          )
        `);

      // Text search
      if (searchTerm) {
        query = query?.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // 🎯 FIXED SORTING - Map frontend sortBy values to actual database columns
      let sortBy = filters?.sortBy || 'created_at';
      
      // Map frontend sortBy values that don't exist in database to valid columns
      if (sortBy === 'relevance') {
        // When sorting by relevance in search context, prioritize created_at (newest first)
        sortBy = 'created_at';
      }
      
      // Define valid database columns for teams table
      const validColumns = ['id', 'name', 'company_id', 'created_at', 'created_by', 'updated_at', 'description'];
      
      // If sortBy is still not in validColumns after mapping, default to created_at
      if (!validColumns?.includes(sortBy)) {
        sortBy = 'created_at';
      }
      
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(team => ({
        id: team?.id,
        name: team?.name,
        description: team?.description,
        createdAt: team?.created_at,
        company: team?.companies?.name,
        companyId: team?.companies?.id,
        teamLead: team?.user_profiles?.full_name || team?.user_profiles?.username,
        teamLeadId: team?.user_profiles?.id,
        type: 'team'
      })) || [];
    } catch (error) {
      console.error('Error searching teams:', error);
      throw new Error(error?.message || 'Failed to search teams');
    }
  },

  /**
   * Get trending snippets - ENHANCED with caching
   */
  async getTrendingSnippets(limit = 10) {
    try {
      // Check cache first
      const cacheKey = `trending_snippets_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        ?.from('snippets')
        ?.select(`
          id,
          title,
          description,
          language,
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
        `)
        ?.eq('visibility', 'public')
        ?.is('team_id', null)
        ?.is('company_id', null)
        ?.order('views_count', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      const result = data?.map(s => ({
        ...s,
        author: s?.user_profiles
      })) || [];

      // Cache for 5 minutes
      this.setCache(cacheKey, result, 300000);

      return result;
    } catch (error) {
      console.error('Error fetching trending snippets:', error);
      return [];
    }
  },

  /**
   * Get top users by contribution - ENHANCED with caching
   */
  async getTopUsers(limit = 10) {
    try {
      // Check cache first
      const cacheKey = `top_users_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select(`
          id,
          username,
          full_name,
          avatar_url,
          contributor_level,
          snippets_count,
          followers_count
        `)
        ?.order('snippets_count', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      // Cache for 5 minutes
      this.setCache(cacheKey, data, 300000);

      return data || [];
    } catch (error) {
      console.error('Error fetching top users:', error);
      return [];
    }
  },

  /**
   * Get popular languages - NEW
   */
  async getPopularLanguages(limit = 10) {
    try {
      const cacheKey = 'popular_languages';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        ?.from('snippets')
        ?.select('language')
        ?.eq('visibility', 'public');

      if (error) throw error;

      // Count occurrences
      const languageCounts = {};
      data?.forEach(item => {
        const lang = item?.language;
        languageCounts[lang] = (languageCounts?.[lang] || 0) + 1;
      });

      // Convert to array and sort
      const result = Object.entries(languageCounts)?.map(([language, count]) => ({ language, count }))?.sort((a, b) => b?.count - a?.count)?.slice(0, limit);

      // Cache for 10 minutes
      this.setCache(cacheKey, result, 600000);

      return result;
    } catch (error) {
      console.error('Error fetching popular languages:', error);
      return [];
    }
  },

  /**
   * Get global open bugs - PUBLIC visibility only, open status, no team/company
   */
  async getGlobalOpenBugs(filters = {}) {
    try {
      let query = supabase
        ?.from('bugs')
        ?.select(`
          id,
          title,
          description,
          code,
          language,
          priority,
          bug_status,
          visibility,
          likes_count,
          comments_count,
          views_count,
          created_at,
          updated_at,
          user_profiles!bugs_user_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        ?.eq('visibility', 'public')
        ?.eq('bug_status', 'open')
        ?.is('team_id', null)
        ?.is('company_id', null);

      // Apply additional filters
      if (filters?.language && filters?.language !== 'all') {
        query = query?.eq('language', filters?.language);
      }

      if (filters?.priority && filters?.priority?.length > 0) {
        query = query?.in('priority', filters?.priority);
      }

      // Sorting
      let sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        bugs: data?.map(bug => ({
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
          type: 'bug',
          reporter: {
            id: bug?.user_profiles?.id,
            name: bug?.user_profiles?.full_name || bug?.user_profiles?.username,
            username: bug?.user_profiles?.username,
            avatar: bug?.user_profiles?.avatar_url
          }
        })) || [],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching global open bugs:', error);
      throw new Error(error?.message || 'Failed to fetch global bugs');
    }
  },

  /**
   * Get user's global bugs - bugs posted by user with public visibility
   */
  async getUserGlobalBugs(userId, filters = {}) {
    try {
      let query = supabase
        ?.from('bugs')
        ?.select(`
          id,
          title,
          description,
          code,
          language,
          priority,
          bug_status,
          visibility,
          likes_count,
          comments_count,
          views_count,
          created_at,
          updated_at
        `, { count: 'exact' })
        ?.eq('user_id', userId)
        ?.eq('visibility', 'public')
        ?.is('team_id', null)
        ?.is('company_id', null);

      // Apply status filter
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
      let sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query?.order(sortBy, { ascending: sortOrder === 'asc' });

      // Pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      query = query?.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        bugs: data?.map(bug => ({
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
          type: 'bug'
        })) || [],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching user global bugs:', error);
      throw new Error(error?.message || 'Failed to fetch user bugs');
    }
  },

  /**
   * Get recent followers' posts - NEW
   */
  async getRecentFollowersPosts(userId, limit = 20) {
    try {
      // Get user's following list
      const { data: followingData, error: followingError } = await supabase
        ?.from('follows')
        ?.select('following_id')
        ?.eq('follower_id', userId);

      if (followingError) throw followingError;

      const followingIds = followingData?.map(f => f?.following_id) || [];

      if (followingIds?.length === 0) {
        return [];
      }

      // Get recent snippets from followed users - only personal public snippets
      const { data, error } = await supabase
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
        `)
        ?.in('user_id', followingIds)
        ?.eq('visibility', 'public')
        ?.is('team_id', null)
        ?.is('company_id', null)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data?.map(s => ({
        ...s,
        type: 'snippet',
        author: s?.user_profiles,
        codePreview: s?.code?.substring(0, 200)
      })) || [];
    } catch (error) {
      console.error('Error fetching recent followers posts:', error);
      return [];
    }
  },

  /**
   * Get trending posts with enhanced analytics - NEW
   */
  async getTrendingPosts(filters = {}) {
    try {
      const timeRange = filters?.timeRange || '7d';
      let startDate;
      
      const now = new Date();
      switch (timeRange) {
        case '24h':
          startDate = new Date(now?.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now?.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now?.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now?.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Calculate engagement score: (likes * 3 + comments * 5 + views) - only personal public snippets
      const { data, error } = await supabase
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
        `)
        ?.eq('visibility', 'public')
        ?.is('team_id', null)
        ?.is('company_id', null)
        ?.gte('created_at', startDate?.toISOString())
        ?.order('likes_count', { ascending: false })
        ?.limit(filters?.limit || 20);

      if (error) throw error;

      // Calculate engagement score and sort
      const postsWithScore = data?.map(post => ({
        ...post,
        type: 'snippet',
        author: post?.user_profiles,
        codePreview: post?.code?.substring(0, 200),
        engagementScore: (post?.likes_count * 3) + (post?.comments_count * 5) + (post?.views_count || 0)
      }));

      postsWithScore?.sort((a, b) => b?.engagementScore - a?.engagementScore);

      return postsWithScore;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  },

  /**
   * Get user activity analytics - NEW
   */
  async getUserActivityAnalytics(userId) {
    try {
      const { data: profile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('snippets_count, followers_count, following_count')
        ?.eq('id', userId)
        ?.single();

      if (profileError) throw profileError;

      // Get recent activity counts
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { count: recentSnippets } = await supabase
        ?.from('snippets')
        ?.select('id', { count: 'exact', head: true })
        ?.eq('user_id', userId)
        ?.gte('created_at', sevenDaysAgo?.toISOString());

      const { count: recentLikes } = await supabase
        ?.from('snippet_likes')
        ?.select('id', { count: 'exact', head: true })
        ?.eq('user_id', userId)
        ?.gte('created_at', sevenDaysAgo?.toISOString());

      return {
        totalSnippets: profile?.snippets_count || 0,
        totalFollowers: profile?.followers_count || 0,
        totalFollowing: profile?.following_count || 0,
        recentSnippets: recentSnippets || 0,
        recentLikes: recentLikes || 0
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  },

  /**
   * Simple in-memory cache implementation
   */
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

  clearCache() {
    this.cache?.clear();
  }
};