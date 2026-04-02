import { supabase } from '../lib/supabase';
import aiSnippetEnhancementService from './aiSnippetEnhancementService';

/**
 * Snippet Service
 * Handles all snippet-related operations
 */
export const snippetService = {
  /**
   * Fetch all snippets with proper user filtering
   */
  async getAllSnippets(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      let query = supabase?.from('snippets')?.select(`
        *,
        user:user_profiles!snippets_user_id_fkey(id, full_name, username, avatar_url, email),
        recent_comments:snippet_comments(id, content, created_at, user:user_profiles!snippet_comments_user_id_fkey(id, full_name, username, avatar_url))
      `);

      // CRITICAL: Filter by authenticated user if provided
      if (filters?.userId) {
        query = query?.eq('user_id', filters?.userId);
      }

      // Apply visibility filters - show only public or user's own snippets
      if (user) {
        query = query?.or(`visibility.eq.public,user_id.eq.${user?.id}`);
      } else {
        query = query?.eq('visibility', 'public');
      }

      if (filters?.language) {
        query = query?.eq('language', filters?.language);
      }

      if (filters?.snippetType) {
        query = query?.eq('snippet_type', filters?.snippetType);
      }

      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(snippet => {
        const latestComment = snippet?.recent_comments
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))?.[0];

        return {
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
          reuseCount: snippet?.reuse_count || 0,
          forkCount: snippet?.fork_count || 0,
          aiTags: snippet?.ai_tags || [],
          aiQualityScore: snippet?.ai_quality_score,
          aiAnalysisData: snippet?.ai_analysis_data,
          aiReport: snippet?.ai_report,
          createdAt: snippet?.created_at,
          updatedAt: snippet?.updated_at,
          user: {
            id: snippet?.user?.id,
            name: snippet?.user?.full_name,
            username: snippet?.user?.username,
            avatar: snippet?.user?.avatar_url || '/assets/images/no_image.png',
            email: snippet?.user?.email
          },
          recentComment: latestComment ? {
            id: latestComment.id,
            content: latestComment.content,
            createdAt: latestComment.created_at,
            user: {
              name: latestComment.user?.full_name,
              username: latestComment.user?.username,
              avatar: latestComment.user?.avatar_url,
            }
          } : null,
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching snippets:', error);
      throw error;
    }
  },

  /**
   * Get snippet details by ID
   */
  async getSnippetById(snippetId) {
    try {
      const { data, error } = await supabase?.from('snippets')?.select(`*,user:user_profiles!snippets_user_id_fkey(id, full_name, username, avatar_url, email)`)?.eq('id', snippetId)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        language: data?.language,
        snippetType: data?.snippet_type,
        visibility: data?.visibility,
        version: data?.version,
        likesCount: data?.likes_count || 0,
        commentsCount: data?.comments_count || 0,
        viewsCount: data?.views_count || 0,
        reuseCount: data?.reuse_count || 0,
        forkCount: data?.fork_count || 0,
        aiTags: data?.ai_tags || [],
        aiQualityScore: data?.ai_quality_score,
        aiAnalysisData: data?.ai_analysis_data,
        aiReport: data?.ai_report,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        user: {
          id: data?.user?.id,
          name: data?.user?.full_name,
          username: data?.user?.username,
          avatar: data?.user?.avatar_url || '/assets/images/no_image.png',
          email: data?.user?.email
        }
      };
    } catch (error) {
      console.error('Error fetching snippet:', error);
      throw error;
    }
  },

  /**
   * Get snippets for authenticated user only
   */
  async getUserSnippets(limit = 10) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('snippets')?.select(`
        *,
        user:user_profiles!snippets_user_id_fkey(id, full_name, username, avatar_url, email),
        recent_comments:snippet_comments(id, content, created_at, user:user_profiles!snippet_comments_user_id_fkey(id, full_name, username, avatar_url))
      `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(snippet => {
        const latestComment = snippet?.recent_comments
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))?.[0];

        return {
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
          reuseCount: snippet?.reuse_count || 0,
          aiTags: snippet?.ai_tags || [],
          aiQualityScore: snippet?.ai_quality_score,
          aiReport: snippet?.ai_report,
          createdAt: snippet?.created_at,
          updatedAt: snippet?.updated_at,
          user: {
            id: snippet?.user?.id,
            name: snippet?.user?.full_name,
            username: snippet?.user?.username,
            avatar: snippet?.user?.avatar_url || '/assets/images/no_image.png'
          },
          recentComment: latestComment ? {
            id: latestComment.id,
            content: latestComment.content,
            createdAt: latestComment.created_at,
            user: {
              name: latestComment.user?.full_name,
              username: latestComment.user?.username,
              avatar: latestComment.user?.avatar_url,
            }
          } : null,
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      throw error;
    }
  },

  /**
   * Create new snippet with optional AI enhancement
   */
  async createSnippet(snippetData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // CRITICAL FIX: Get user profile to automatically detect company_id and team_id
      const { data: userProfile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('company_id, team_id')
        ?.eq('id', user?.id)
        ?.single();

      if (profileError) {
        console.warn('Could not fetch user profile for company/team context:', profileError);
      }

      // Prepare insert data with automatic company/team routing
      const insertData = {
        user_id: user?.id,
        title: snippetData?.title,
        description: snippetData?.description,
        code: snippetData?.code,
        language: snippetData?.language,
        snippet_type: snippetData?.snippetType || 'code',
        ai_tags: snippetData?.aiTags || [],
        ai_quality_score: snippetData?.aiQualityScore,
        ai_analysis_data: snippetData?.aiAnalysisData
      };

      // CRITICAL: Auto-detect company_id and team_id for routing
      // Priority: Explicit snippetData > User profile context
      if (snippetData?.companyId) {
        insertData.company_id = snippetData?.companyId;
      } else if (userProfile?.company_id) {
        insertData.company_id = userProfile?.company_id;
      }

      if (snippetData?.teamId) {
        insertData.team_id = snippetData?.teamId;
      } else if (userProfile?.team_id && !snippetData?.skipTeamAssignment) {
        // Only auto-assign team if not explicitly skipped
        insertData.team_id = userProfile?.team_id;
      }

      // CRITICAL: Set visibility based on context
      // If company context, default to 'company' unless explicitly set
      if (insertData?.company_id && !snippetData?.visibility) {
        insertData.visibility = 'company';
      } else {
        insertData.visibility = snippetData?.visibility || 'public';
      }

      const { data, error } = await supabase
        ?.from('snippets')
        ?.insert(insertData)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        language: data?.language,
        snippetType: data?.snippet_type,
        visibility: data?.visibility,
        companyId: data?.company_id,
        teamId: data?.team_id,
        aiTags: data?.ai_tags || [],
        aiQualityScore: data?.ai_quality_score,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating snippet:', error);
      throw error;
    }
  },

  /**
   * Update snippet
   */
  async updateSnippet(snippetId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {};
      if (updates?.title) updateData.title = updates?.title;
      if (updates?.description) updateData.description = updates?.description;
      if (updates?.code) updateData.code = updates?.code;
      if (updates?.language) updateData.language = updates?.language;
      if (updates?.snippetType) updateData.snippet_type = updates?.snippetType;
      if (updates?.visibility !== undefined) updateData.visibility = updates?.visibility;
      if (updates?.aiTags) updateData.ai_tags = updates?.aiTags;
      if (updates?.aiQualityScore !== undefined) updateData.ai_quality_score = updates?.aiQualityScore;
      if (updates?.aiAnalysisData) updateData.ai_analysis_data = updates?.aiAnalysisData;

      const { data, error } = await supabase?.from('snippets')?.update(updateData)?.eq('id', snippetId)?.eq('user_id', user?.id)?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        visibility: data?.visibility,
        aiTags: data?.ai_tags || [],
        aiQualityScore: data?.ai_quality_score,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating snippet:', error);
      throw error;
    }
  },

  /**
   * Delete snippet
   */
  async deleteSnippet(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('snippets')?.delete()?.eq('id', snippetId)?.eq('user_id', user?.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting snippet:', error);
      throw error;
    }
  },

  /**
   * Toggle snippet like
   */
  async toggleLike(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user already liked
      const { data: existingLike, error: checkError } = await supabase
        ?.from('snippet_likes')
        ?.select('id')
        ?.eq('snippet_id', snippetId)
        ?.eq('user_id', user?.id)
        ?.single();

      if (checkError && checkError?.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // Unlike: delete the like
        const { error: deleteError } = await supabase
          ?.from('snippet_likes')
          ?.delete()
          ?.eq('id', existingLike?.id);

        if (deleteError) throw deleteError;

        return { liked: false };
      } else {
        // Like: insert new like
        const { error: insertError } = await supabase
          ?.from('snippet_likes')
          ?.insert([{ 
            snippet_id: snippetId, 
            user_id: user?.id 
          }]);

        if (insertError) throw insertError;

        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling snippet like:', error);
      throw error;
    }
  },

  /**
   * Add comment to snippet
   */
  async addComment(snippetId, content, parentId = null) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        ?.from('snippet_comments')
        ?.insert([{
          snippet_id: snippetId,
          user_id: user?.id,
          content: content?.trim(),
          parent_id: parentId
        }])
        ?.select(`
          *,
          user:user_profiles!snippet_comments_user_id_fkey(
            id, 
            full_name, 
            username, 
            avatar_url, 
            email
          )
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
          id: data?.user?.id,
          name: data?.user?.full_name,
          username: data?.user?.username,
          avatar: data?.user?.avatar_url || '/assets/images/no_image.png',
          email: data?.user?.email
        }
      };
    } catch (error) {
      console.error('Error adding snippet comment:', error);
      throw error;
    }
  },

  /**
   * Get comments for snippet
   */
  async getComments(snippetId) {
    try {
      const { data, error } = await supabase
        ?.from('snippet_comments')
        ?.select(`
          *,
          user:user_profiles!snippet_comments_user_id_fkey(
            id, 
            full_name, 
            username, 
            avatar_url, 
            email
          )
        `)
        ?.eq('snippet_id', snippetId)
        ?.order('created_at', { ascending: true });

      if (error) throw error;

      return (data || [])?.map(comment => ({
        id: comment?.id,
        content: comment?.content,
        createdAt: comment?.created_at,
        updatedAt: comment?.updated_at,
        parentId: comment?.parent_id,
        user: {
          id: comment?.user?.id,
          name: comment?.user?.full_name,
          username: comment?.user?.username,
          avatar: comment?.user?.avatar_url || '/assets/images/no_image.png',
          email: comment?.user?.email
        }
      }));
    } catch (error) {
      console.error('Error fetching snippet comments:', error);
      throw error;
    }
  },

  /**
   * Check if user has liked a snippet
   */
  async checkUserLiked(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        ?.from('snippet_likes')
        ?.select('id')
        ?.eq('snippet_id', snippetId)
        ?.eq('user_id', user?.id)
        ?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking snippet like:', error);
      return false;
    }
  },

  /**
   * Like a snippet - convenience method
   */
  async likeSnippet(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        ?.from('snippet_likes')
        ?.insert([{ 
          snippet_id: snippetId, 
          user_id: user?.id 
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error liking snippet:', error);
      throw error;
    }
  },

  /**
   * Unlike a snippet - convenience method
   */
  async unlikeSnippet(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        ?.from('snippet_likes')
        ?.delete()
        ?.eq('snippet_id', snippetId)
        ?.eq('user_id', user?.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error unliking snippet:', error);
      throw error;
    }
  },

  /**
   * Update snippet with AI report - NEW
   */
  async updateSnippetAIReport(snippetId, aiReport) {
    try {
      const { data, error } = await supabase
        ?.from('snippets')
        ?.update({ ai_report: aiReport })
        ?.eq('id', snippetId)
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating snippet AI report:', error);
      throw new Error(error?.message || 'Failed to update snippet AI report');
    }
  },

  /**
   * Get snippet with AI report - NEW
   */
  async getSnippetWithAIReport(snippetId) {
    try {
      const { data, error } = await supabase
        ?.from('snippets')
        ?.select(`
          *,
          user_profiles!inner(id, full_name, email, avatar_url, username)
        `)
        ?.eq('id', snippetId)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        code: data?.code,
        language: data?.language,
        aiReport: data?.ai_report,
        aiTags: data?.ai_tags,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        user: {
          id: data?.user_profiles?.id,
          name: data?.user_profiles?.full_name,
          username: data?.user_profiles?.username,
        }
      };
    } catch (error) {
      console.error('Error fetching snippet with AI report:', error);
      throw new Error(error?.message || 'Failed to fetch snippet');
    }
  },

  /**
   * Generate AI-enhanced preview for snippet - NEW
   * @param {string} snippetId - The snippet ID
   * @returns {Promise<Object>} Enhanced preview with engaging title, description, and tags
   */
  async generateSnippetPreview(snippetId) {
    try {
      // Fetch snippet data
      const snippet = await this.getSnippetById(snippetId);
      
      // Generate preview using AI service
      const previewData = await aiSnippetEnhancementService?.generateSnippetPreview({
        title: snippet?.title,
        description: snippet?.description,
        code: snippet?.code,
        language: snippet?.language,
      });

      return previewData;
    } catch (error) {
      console.error('Error generating snippet preview:', error);
      throw error;
    }
  },

  /**
   * Generate social media descriptions for snippet - NEW
   * @param {string} snippetId - The snippet ID
   * @param {Array<string>} platforms - Target platforms
   * @returns {Promise<Object>} Platform-specific descriptions
   */
  async generateSocialDescriptions(snippetId, platforms = ['twitter', 'linkedin', 'slack']) {
    try {
      // Fetch snippet data
      const snippet = await this.getSnippetById(snippetId);
      
      // Generate social descriptions using AI service
      const socialData = await aiSnippetEnhancementService?.generateSocialDescriptions(
        {
          title: snippet?.title,
          description: snippet?.description,
          code: snippet?.code,
          language: snippet?.language,
        },
        platforms
      );

      return socialData;
    } catch (error) {
      console.error('Error generating social descriptions:', error);
      throw error;
    }
  },

  /**
   * Generate complete sharing package for snippet - NEW
   * @param {string} snippetId - The snippet ID
   * @returns {Promise<Object>} Complete sharing package with preview and social descriptions
   */
  async generateSharingPackage(snippetId) {
    try {
      // Fetch snippet data
      const snippet = await this.getSnippetById(snippetId);
      
      // Generate complete sharing package using AI service
      const sharingPackage = await aiSnippetEnhancementService?.generateSharingPackage({
        title: snippet?.title,
        description: snippet?.description,
        code: snippet?.code,
        language: snippet?.language,
      });

      return sharingPackage;
    } catch (error) {
      console.error('Error generating sharing package:', error);
      throw error;
    }
  },

  /**
   * Generate SEO metadata for snippet - NEW
   * @param {string} snippetId - The snippet ID
   * @returns {Promise<Object>} SEO-optimized metadata
   */
  async generateSEOMetadata(snippetId) {
    try {
      // Fetch snippet data
      const snippet = await this.getSnippetById(snippetId);
      
      // Generate SEO metadata using AI service
      const seoData = await aiSnippetEnhancementService?.generateSEOMetadata({
        title: snippet?.title,
        description: snippet?.description,
        code: snippet?.code,
        language: snippet?.language,
      });

      return seoData;
    } catch (error) {
      console.error('Error generating SEO metadata:', error);
      throw error;
    }
  },

  /**
   * Update snippet with AI-enhanced metadata - NEW
   * Convenience method to generate and store AI enhancements
   * @param {string} snippetId - The snippet ID
   * @returns {Promise<Object>} Updated snippet with AI enhancements
   */
  async enhanceSnippetWithAI(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate AI enhancements
      const sharingPackage = await this.generateSharingPackage(snippetId);
      
      // Store enhancements in snippet's ai_analysis_data field
      const enhancementData = {
        preview: sharingPackage?.preview,
        socialDescriptions: sharingPackage?.socialDescriptions,
        generatedAt: sharingPackage?.generatedAt,
      };

      // Update snippet with enhancements
      const { data, error } = await supabase
        ?.from('snippets')
        ?.update({ 
          ai_analysis_data: enhancementData,
          ai_tags: sharingPackage?.preview?.suggestedTags || []
        })
        ?.eq('id', snippetId)
        ?.eq('user_id', user?.id)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        aiAnalysisData: data?.ai_analysis_data,
        aiTags: data?.ai_tags,
        updatedAt: data?.updated_at,
      };
    } catch (error) {
      console.error('Error enhancing snippet with AI:', error);
      throw error;
    }
  },

  /**
   * Log a reuse event (copy, fork, reference)
   * The database trigger auto-increments snippets.reuse_count
   */
  async logReuse(snippetId, reuseType = 'copy') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('snippet_reuse_log').insert({
        snippet_id: snippetId,
        user_id: user?.id || null,
        reuse_type: reuseType,
      });
    } catch (error) {
      // Non-blocking — don't fail the copy/fork if logging fails
      console.warn('Failed to log reuse:', error.message);
    }
  },

  /**
   * Search snippets using full-text search with ranking
   */
  async searchSnippets(searchTerm, filters = {}) {
    try {
      if (!searchTerm || !searchTerm.trim()) {
        return this.getAllSnippets(filters);
      }

      const tsQuery = searchTerm.trim().split(/\s+/).filter(Boolean).join(' & ');

      const { data, error } = await supabase
        .rpc('search_snippets_fts', { search_query: tsQuery })
        .limit(filters.limit || 50);

      if (error) {
        // Fallback to ilike if RPC doesn't exist yet
        console.warn('FTS search failed, falling back to ilike:', error.message);
        let query = supabase.from('snippets').select(`
          *,
          user:user_profiles!snippets_user_id_fkey(id, full_name, username, avatar_url)
        `).eq('visibility', 'public');

        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        query = query.order('created_at', { ascending: false }).limit(50);

        const { data: fallbackData, error: fallbackError } = await query;
        if (fallbackError) throw fallbackError;
        return this.transformSnippetList(fallbackData);
      }

      return this.transformSnippetList(data);
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  /**
   * Helper to transform raw snippet rows to app format
   */
  transformSnippetList(data) {
    return (data || []).map(snippet => ({
      id: snippet?.id,
      title: snippet?.title,
      description: snippet?.description,
      code: snippet?.code,
      language: snippet?.language,
      visibility: snippet?.visibility,
      likesCount: snippet?.likes_count || 0,
      commentsCount: snippet?.comments_count || 0,
      viewsCount: snippet?.views_count || 0,
      reuseCount: snippet?.reuse_count || 0,
      forkCount: snippet?.fork_count || 0,
      aiTags: snippet?.ai_tags || [],
      aiQualityScore: snippet?.ai_quality_score,
      createdAt: snippet?.created_at,
      user: snippet?.user ? {
        id: snippet.user.id,
        name: snippet.user.full_name,
        username: snippet.user.username,
        avatar: snippet.user.avatar_url || '/assets/images/no_image.png',
      } : null
    }));
  },

  async forkSnippet(snippetId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to fork');

      // Get original snippet
      const { data: original, error: fetchError } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .single();
      if (fetchError) throw fetchError;

      // Create forked copy
      const { data: forked, error: forkError } = await supabase
        .from('snippets')
        .insert({
          user_id: user.id,
          title: `${original.title} (fork)`,
          description: original.description,
          code: original.code,
          language: original.language,
          snippet_type: original.snippet_type,
          visibility: 'public',
          forked_from: snippetId,
          ai_tags: original.ai_tags,
          version: 1,
        })
        .select()
        .single();
      if (forkError) throw forkError;

      // Log reuse
      this.logReuse(snippetId, 'fork');

      // Notify original author
      if (original.user_id !== user.id) {
        try {
          const { data: profile } = await supabase.from('user_profiles').select('username').eq('id', user.id).single();
          await supabase.from('notifications').insert({
            user_id: original.user_id,
            type: 'fork',
            title: 'Your snippet was forked',
            message: `@${profile?.username || 'Someone'} forked your snippet "${original.title}"`,
            priority: 'medium',
            metadata: JSON.stringify({ snippet_id: snippetId, forked_id: forked.id, actor_id: user.id }),
          });
        } catch (e) { console.warn('Fork notification failed:', e); }
      }

      return { id: forked.id, title: forked.title, forkedFrom: snippetId };
    } catch (error) {
      console.error('Error forking snippet:', error);
      throw error;
    }
  },

  async getSimilarSnippets(snippetId, limit = 5) {
    try {
      // Get the target snippet's tags
      const { data: target } = await supabase
        .from('snippets')
        .select('ai_tags, language')
        .eq('id', snippetId)
        .single();

      if (!target?.ai_tags?.length) return [];

      // Find snippets with overlapping tags
      const { data: similar } = await supabase
        .from('snippets')
        .select('id, title, language, ai_tags, ai_quality_score, likes_count, views_count, user_id, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
        .eq('visibility', 'public')
        .neq('id', snippetId)
        .overlaps('ai_tags', target.ai_tags)
        .order('likes_count', { ascending: false })
        .limit(limit);

      return similar || [];
    } catch (error) {
      console.error('Error getting similar snippets:', error);
      return [];
    }
  },
};

export default snippetService;