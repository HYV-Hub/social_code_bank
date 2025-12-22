import { supabase } from './supabaseClient';

/**
 * Service for managing hive collections
 */

// Get all collections for a specific hive
export const getHiveCollections = async (hiveId) => {
  try {
    const { data, error } = await supabase?.from('hive_collections')?.select(`
        *,
        created_by_profile:user_profiles!hive_collections_created_by_fkey(
          id,
          username,
          avatar_url,
          full_name
        )
      `)?.eq('hive_id', hiveId)?.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching hive collections:', error);
    return { data: null, error };
  }
};

// Get a single collection with its snippets
export const getHiveCollectionById = async (collectionId) => {
  try {
    const { data, error } = await supabase?.from('hive_collections')?.select(`
        *,
        created_by_profile:user_profiles!hive_collections_created_by_fkey(
          id,
          username,
          avatar_url,
          full_name
        ),
        hive:hives(
          id,
          name,
          description
        )
      `)?.eq('id', collectionId)?.single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { data: null, error };
  }
};

// Get snippets in a collection with proper filtering
export const getCollectionSnippets = async (collectionId, filters = {}) => {
  try {
    let query = supabase?.from('hive_collection_snippets')?.select(`
        id,
        added_at,
        added_by,
        snippet:snippets(
          id,
          title,
          description,
          code,
          language,
          visibility,
          created_at,
          updated_at,
          likes_count,
          views_count,
          comments_count,
          user_id,
          author:user_profiles!snippets_user_id_fkey(
            id,
            username,
            avatar_url,
            full_name
          )
        )
      `)?.eq('collection_id', collectionId)?.order('added_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Apply filters in JavaScript after fetching
    let filteredData = data || [];

    // Apply language filter
    if (filters?.language && filters?.language !== 'all') {
      filteredData = filteredData?.filter(
        item => item?.snippet?.language === filters?.language
      );
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filteredData = filteredData?.filter(item => {
        const title = item?.snippet?.title?.toLowerCase() || '';
        const description = item?.snippet?.description?.toLowerCase() || '';
        return title?.includes(searchLower) || description?.includes(searchLower);
      });
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching collection snippets:', error);
    return { data: null, error };
  }
};

// Create a new collection
export const createHiveCollection = async (collectionData) => {
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase?.from('hive_collections')?.insert({
        hive_id: collectionData?.hiveId,
        created_by: user?.id,
        name: collectionData?.name,
        description: collectionData?.description
      })?.select()?.single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating collection:', error);
    return { data: null, error };
  }
};

// Update a collection
export const updateHiveCollection = async (collectionId, updates) => {
  try {
    const { data, error } = await supabase?.from('hive_collections')?.update({
        name: updates?.name,
        description: updates?.description
      })?.eq('id', collectionId)?.select()?.single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating collection:', error);
    return { data: null, error };
  }
};

// Delete a collection
export const deleteHiveCollection = async (collectionId) => {
  try {
    const { error } = await supabase?.from('hive_collections')?.delete()?.eq('id', collectionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { error };
  }
};

// Add a snippet to a collection
export const addSnippetToCollection = async (collectionId, snippetId) => {
  try {
    const { data: { user } } = await supabase?.auth?.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase?.from('hive_collection_snippets')?.insert({
        collection_id: collectionId,
        snippet_id: snippetId,
        added_by: user?.id
      })?.select()?.single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding snippet to collection:', error);
    return { data: null, error };
  }
};

// Remove a snippet from a collection
export const removeSnippetFromCollection = async (collectionId, snippetId) => {
  try {
    const { error } = await supabase?.from('hive_collection_snippets')?.delete()?.eq('collection_id', collectionId)?.eq('snippet_id', snippetId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing snippet from collection:', error);
    return { error };
  }
};

// Check if a snippet is in a collection
export const isSnippetInCollection = async (collectionId, snippetId) => {
  try {
    const { data, error } = await supabase?.from('hive_collection_snippets')?.select('id')?.eq('collection_id', collectionId)?.eq('snippet_id', snippetId)?.maybeSingle();

    if (error) throw error;
    return { exists: !!data, error: null };
  } catch (error) {
    console.error('Error checking snippet in collection:', error);
    return { exists: false, error };
  }
};

// Get collections that contain a specific snippet
export const getCollectionsWithSnippet = async (hiveId, snippetId) => {
  try {
    const { data, error } = await supabase?.from('hive_collection_snippets')?.select(`
        collection:hive_collections(
          id,
          name,
          description
        )
      `)?.eq('snippet_id', snippetId)?.eq('collection.hive_id', hiveId);

    if (error) throw error;
    return { data: data?.map(item => item?.collection) || [], error: null };
  } catch (error) {
    console.error('Error fetching collections with snippet:', error);
    return { data: [], error };
  }
};
function hiveCollectionService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: hiveCollectionService is not implemented yet.', args);
  return null;
}

export { hiveCollectionService };