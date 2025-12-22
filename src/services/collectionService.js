import { supabase } from '../lib/supabase';

class CollectionService {
  /**
   * Get all collections for authenticated user
   */
  async getUserCollections() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('snippet_collections')?.select(`
        *,
        user:user_profiles!snippet_collections_user_id_fkey(id, full_name, username, avatar_url)
      `)?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(collection => ({
        id: collection?.id,
        title: collection?.title,
        description: collection?.description,
        isPublic: collection?.is_public,
        snippetsCount: collection?.snippets_count || 0,
        tags: collection?.tags || [],
        createdAt: collection?.created_at,
        updatedAt: collection?.updated_at,
        user: {
          id: collection?.user?.id,
          name: collection?.user?.full_name,
          username: collection?.user?.username,
          avatar: collection?.user?.avatar_url || '/assets/images/no_image.png'
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw error;
    }
  }

  /**
   * Get public collections
   */
  async getPublicCollections() {
    try {
      const { data, error } = await supabase?.from('snippet_collections')?.select(`
        *,
        user:user_profiles!snippet_collections_user_id_fkey(id, full_name, username, avatar_url)
      `)?.eq('is_public', true)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(collection => ({
        id: collection?.id,
        title: collection?.title,
        description: collection?.description,
        isPublic: collection?.is_public,
        snippetsCount: collection?.snippets_count || 0,
        tags: collection?.tags || [],
        createdAt: collection?.created_at,
        user: {
          id: collection?.user?.id,
          name: collection?.user?.full_name,
          username: collection?.user?.username,
          avatar: collection?.user?.avatar_url || '/assets/images/no_image.png'
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching public collections:', error);
      throw error;
    }
  }

  /**
   * Get collection by ID with snippets
   */
  async getCollectionById(collectionId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      // Get collection details
      const { data: collection, error: collectionError } = await supabase?.from('snippet_collections')?.select(`
        *,
        user:user_profiles!snippet_collections_user_id_fkey(id, full_name, username, avatar_url)
      `)?.eq('id', collectionId)?.single();

      if (collectionError) throw collectionError;

      // Check if user has access (owner or public collection)
      if (!collection?.is_public && (!user || collection?.user_id !== user?.id)) {
        throw new Error('Access denied to private collection');
      }

      // Get snippets in collection
      const { data: snippets, error: snippetsError } = await supabase?.from('collection_snippets')?.select(`
        *,
        snippet:snippets(
          *,
          user:user_profiles!snippets_user_id_fkey(id, full_name, username, avatar_url)
        )
      `)?.eq('collection_id', collectionId)?.order('added_at', { ascending: false });

      if (snippetsError) throw snippetsError;

      return {
        id: collection?.id,
        title: collection?.title,
        description: collection?.description,
        isPublic: collection?.is_public,
        snippetsCount: collection?.snippets_count || 0,
        tags: collection?.tags || [],
        createdAt: collection?.created_at,
        updatedAt: collection?.updated_at,
        user: {
          id: collection?.user?.id,
          name: collection?.user?.full_name,
          username: collection?.user?.username,
          avatar: collection?.user?.avatar_url || '/assets/images/no_image.png'
        },
        snippets: snippets?.map(item => ({
          id: item?.id,
          snippetId: item?.snippet_id,
          addedAt: item?.added_at,
          position: item?.position,
          snippet: {
            id: item?.snippet?.id,
            title: item?.snippet?.title,
            description: item?.snippet?.description,
            code: item?.snippet?.code,
            language: item?.snippet?.language,
            likesCount: item?.snippet?.likes_count || 0,
            commentsCount: item?.snippet?.comments_count || 0,
            viewsCount: item?.snippet?.views_count || 0,
            createdAt: item?.snippet?.created_at,
            user: {
              id: item?.snippet?.user?.id,
              name: item?.snippet?.user?.full_name,
              username: item?.snippet?.user?.username,
              avatar: item?.snippet?.user?.avatar_url || '/assets/images/no_image.png'
            }
          }
        })) || []
      };
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  }

  /**
   * Alias for getCollectionById - for frontend compatibility
   */
  async getById(collectionId) {
    return this.getCollectionById(collectionId);
  }

  /**
   * Get collection snippets only - for frontend compatibility
   */
  async getCollectionSnippets(collectionId) {
    const collection = await this.getCollectionById(collectionId);
    return collection?.snippets || [];
  }

  /**
   * Create new collection
   */
  async createCollection(collectionData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('snippet_collections')?.insert({
        user_id: user?.id,
        title: collectionData?.title,
        description: collectionData?.description,
        is_public: collectionData?.isPublic || false,
        tags: collectionData?.tags || []
      })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        isPublic: data?.is_public,
        tags: data?.tags || [],
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Update collection
   */
  async updateCollection(collectionId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {};
      if (updates?.title) updateData.title = updates?.title;
      if (updates?.description !== undefined) updateData.description = updates?.description;
      if (updates?.isPublic !== undefined) updateData.is_public = updates?.isPublic;
      if (updates?.tags) updateData.tags = updates?.tags;

      const { data, error } = await supabase?.from('snippet_collections')?.update(updateData)?.eq('id', collectionId)?.eq('user_id', user?.id)?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        title: data?.title,
        description: data?.description,
        isPublic: data?.is_public,
        tags: data?.tags || [],
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase?.from('snippet_collections')?.delete()?.eq('id', collectionId)?.eq('user_id', user?.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  /**
   * Add snippet to collection
   */
  async addSnippetToCollection(collectionId, snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user owns the collection
      const { data: collection, error: collectionError } = await supabase?.from('snippet_collections')?.select('user_id')?.eq('id', collectionId)?.single();

      if (collectionError) throw collectionError;

      if (collection?.user_id !== user?.id) {
        throw new Error('You do not have permission to modify this collection');
      }

      // Check if snippet already exists in collection
      const { data: existingSnippet, error: checkError } = await supabase?.from('collection_snippets')?.select('id')?.eq('collection_id', collectionId)?.eq('snippet_id', snippetId)?.maybeSingle();

      if (checkError) throw checkError;

      if (existingSnippet) {
        // Snippet already exists in collection
        return {
          alreadyExists: true,
          message: 'Snippet is already in this collection',
          id: existingSnippet?.id,
          collectionId: collectionId,
          snippetId: snippetId
        };
      }

      // Insert new snippet into collection
      const { data, error } = await supabase?.from('collection_snippets')?.insert({
        collection_id: collectionId,
        snippet_id: snippetId,
        added_by: user?.id
      })?.select()?.single();

      if (error) throw error;

      return {
        alreadyExists: false,
        id: data?.id,
        collectionId: data?.collection_id,
        snippetId: data?.snippet_id,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error adding snippet to collection:', error);
      throw error;
    }
  }

  /**
   * Remove snippet from collection
   */
  async removeSnippetFromCollection(collectionId, snippetId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user owns the collection
      const { data: collection, error: collectionError } = await supabase?.from('snippet_collections')?.select('user_id')?.eq('id', collectionId)?.single();

      if (collectionError) throw collectionError;

      if (collection?.user_id !== user?.id) {
        throw new Error('You do not have permission to modify this collection');
      }

      const { error } = await supabase?.from('collection_snippets')?.delete()?.eq('collection_id', collectionId)?.eq('snippet_id', snippetId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing snippet from collection:', error);
      throw error;
    }
  }
}

const collectionServiceInstance = new CollectionService();

export const collectionService = collectionServiceInstance;
export default collectionServiceInstance;