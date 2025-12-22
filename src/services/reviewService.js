import { supabase } from '../lib/supabase';

export const reviewService = {
  /**
   * Get all reviews visible to current user
   */
  async getAll(filters = {}) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        ?.from('snippet_reviews')
        ?.select(`
          *,
          snippets(
            id,
            title,
            description,
            language,
            code,
            snippet_type,
            visibility
          ),
          reviewer:user_profiles!snippet_reviews_reviewer_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          teams(
            id,
            name
          )
        `)
        ?.order('created_at', { ascending: false });

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.teamId) {
        query = query?.eq('team_id', filters?.teamId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(review => ({
        id: review?.id,
        snippetId: review?.snippet_id,
        teamId: review?.team_id,
        reviewerId: review?.reviewer_id,
        status: review?.status,
        reviewNotes: review?.review_notes,
        completedAt: review?.completed_at,
        createdAt: review?.created_at,
        updatedAt: review?.updated_at,
        snippet: review?.snippets ? {
          id: review?.snippets?.id,
          title: review?.snippets?.title,
          description: review?.snippets?.description,
          language: review?.snippets?.language,
          code: review?.snippets?.code,
          snippetType: review?.snippets?.snippet_type,
          visibility: review?.snippets?.visibility
        } : null,
        reviewer: review?.reviewer ? {
          id: review?.reviewer?.id,
          fullName: review?.reviewer?.full_name,
          email: review?.reviewer?.email,
          avatarUrl: review?.reviewer?.avatar_url
        } : null,
        team: review?.teams ? {
          id: review?.teams?.id,
          name: review?.teams?.name
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  /**
   * Get a single review by ID
   */
  async getById(reviewId) {
    try {
      const { data, error } = await supabase
        ?.from('snippet_reviews')
        ?.select(`
          *,
          snippets(
            id,
            title,
            description,
            language,
            code,
            snippet_type,
            visibility,
            user_id
          ),
          reviewer:user_profiles!snippet_reviews_reviewer_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          ),
          teams(
            id,
            name
          )
        `)
        ?.eq('id', reviewId)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        snippetId: data?.snippet_id,
        teamId: data?.team_id,
        reviewerId: data?.reviewer_id,
        status: data?.status,
        reviewNotes: data?.review_notes,
        completedAt: data?.completed_at,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        snippet: data?.snippets ? {
          id: data?.snippets?.id,
          title: data?.snippets?.title,
          description: data?.snippets?.description,
          language: data?.snippets?.language,
          code: data?.snippets?.code,
          snippetType: data?.snippets?.snippet_type,
          visibility: data?.snippets?.visibility,
          userId: data?.snippets?.user_id
        } : null,
        reviewer: data?.reviewer ? {
          id: data?.reviewer?.id,
          fullName: data?.reviewer?.full_name,
          email: data?.reviewer?.email,
          avatarUrl: data?.reviewer?.avatar_url
        } : null,
        team: data?.teams ? {
          id: data?.teams?.id,
          name: data?.teams?.name
        } : null
      };
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  /**
   * Create a new review assignment
   */
  async create(reviewData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('snippet_reviews')
        ?.insert({
          snippet_id: reviewData?.snippetId,
          team_id: reviewData?.teamId,
          reviewer_id: reviewData?.reviewerId || user?.id,
          status: 'pending',
          review_notes: reviewData?.reviewNotes || null
        })
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        snippetId: data?.snippet_id,
        teamId: data?.team_id,
        reviewerId: data?.reviewer_id,
        status: data?.status,
        reviewNotes: data?.review_notes,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  /**
   * Update review status and notes
   */
  async updateReview(reviewId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const updateData = {};
      if (updates?.status) updateData.status = updates?.status;
      if (updates?.reviewNotes) updateData.review_notes = updates?.reviewNotes;
      
      if (updates?.status === 'approved' || updates?.status === 'rejected') {
        updateData.completed_at = new Date()?.toISOString();
      }

      const { data, error } = await supabase
        ?.from('snippet_reviews')
        ?.update(updateData)
        ?.eq('id', reviewId)
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        status: data?.status,
        reviewNotes: data?.review_notes,
        completedAt: data?.completed_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Get reviews by snippet ID
   */
  async getBySnippetId(snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('snippet_reviews')
        ?.select(`
          *,
          reviewer:user_profiles!snippet_reviews_reviewer_id_fkey(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        ?.eq('snippet_id', snippetId)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(review => ({
        id: review?.id,
        snippetId: review?.snippet_id,
        teamId: review?.team_id,
        reviewerId: review?.reviewer_id,
        status: review?.status,
        reviewNotes: review?.review_notes,
        completedAt: review?.completed_at,
        createdAt: review?.created_at,
        updatedAt: review?.updated_at,
        reviewer: review?.reviewer ? {
          id: review?.reviewer?.id,
          fullName: review?.reviewer?.full_name,
          email: review?.reviewer?.email,
          avatarUrl: review?.reviewer?.avatar_url
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching snippet reviews:', error);
      throw error;
    }
  },

  /**
   * Get reviews assigned to current user
   */
  async getMyAssignedReviews() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        ?.from('snippet_reviews')
        ?.select(`
          *,
          snippets(
            id,
            title,
            description,
            language
          ),
          teams(
            id,
            name
          )
        `)
        ?.eq('reviewer_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(review => ({
        id: review?.id,
        snippetId: review?.snippet_id,
        teamId: review?.team_id,
        status: review?.status,
        reviewNotes: review?.review_notes,
        completedAt: review?.completed_at,
        createdAt: review?.created_at,
        snippet: review?.snippets ? {
          id: review?.snippets?.id,
          title: review?.snippets?.title,
          description: review?.snippets?.description,
          language: review?.snippets?.language
        } : null,
        team: review?.teams ? {
          id: review?.teams?.id,
          name: review?.teams?.name
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching assigned reviews:', error);
      throw error;
    }
  }
};