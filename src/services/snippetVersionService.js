import { supabase } from './supabaseClient';

/**
 * Service for managing snippet version history
 * Handles diff-based version control for code snippets
 */
export const snippetVersionService = {
  /**
   * Get version history for a snippet
   * @param {string} snippetId - Snippet ID
   * @param {number} limit - Maximum number of versions to retrieve
   * @returns {Promise<Array>} Version history with diff stats
   */
  async getVersionHistory(snippetId, limit = 50) {
    try {
      const { data, error } = await supabase?.rpc('get_snippet_version_history', {
        snippet_uuid: snippetId,
        limit_count: limit
      });

      if (error) throw error;

      return data?.map(version => ({
        id: version?.version_id,
        versionNumber: version?.version_number,
        codeDiff: version?.code_diff,
        changeDescription: version?.change_description,
        changedBy: {
          id: version?.changed_by_id,
          username: version?.changed_by_username,
          fullName: version?.changed_by_full_name,
          avatarUrl: version?.changed_by_avatar_url
        },
        createdAt: version?.created_at,
        stats: {
          linesAdded: version?.lines_added || 0,
          linesRemoved: version?.lines_removed || 0,
          totalChanges: (version?.lines_added || 0) + (version?.lines_removed || 0)
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching version history:', error);
      throw error;
    }
  },

  /**
   * Get a specific version
   * @param {string} versionId - Version ID
   * @returns {Promise<Object>} Version details
   */
  async getVersion(versionId) {
    try {
      const { data, error } = await supabase
        ?.from('snippet_versions')
        ?.select('*, changed_by_user:user_profiles!snippet_versions_changed_by_fkey(id, username, full_name, avatar_url)')
        ?.eq('id', versionId)
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        snippetId: data?.snippet_id,
        versionNumber: data?.version_number,
        codeDiff: data?.code_diff,
        changeDescription: data?.change_description,
        changedBy: {
          id: data?.changed_by_user?.id,
          username: data?.changed_by_user?.username,
          fullName: data?.changed_by_user?.full_name,
          avatarUrl: data?.changed_by_user?.avatar_url
        },
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error fetching version:', error);
      throw error;
    }
  },

  /**
   * Compare two versions
   * @param {string} snippetId - Snippet ID
   * @param {number} fromVersion - Starting version number
   * @param {number} toVersion - Ending version number
   * @returns {Promise<Object>} Comparison result
   */
  async compareVersions(snippetId, fromVersion, toVersion) {
    try {
      const { data, error } = await supabase
        ?.from('snippet_versions')
        ?.select('*')
        ?.eq('snippet_id', snippetId)
        ?.gte('version_number', Math.min(fromVersion, toVersion))
        ?.lte('version_number', Math.max(fromVersion, toVersion))
        ?.order('version_number', { ascending: true });

      if (error) throw error;

      // Combine diffs
      const combinedDiff = data?.map(v => v?.code_diff)?.join('\n---\n');

      return {
        fromVersion,
        toVersion,
        combinedDiff,
        versions: data
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw error;
    }
  },

  /**
   * Parse diff format for display
   * @param {string} diff - Unified diff string
   * @returns {Array} Parsed diff lines with metadata
   */
  parseDiff(diff) {
    if (!diff) return [];

    const lines = diff?.split('\n');
    return lines?.map(line => {
      if (line?.startsWith('+ ')) {
        return { type: 'added', content: line?.substring(2), original: line };
      } else if (line?.startsWith('- ')) {
        return { type: 'removed', content: line?.substring(2), original: line };
      } else {
        return { type: 'unchanged', content: line?.substring(2), original: line };
      }
    });
  },

  /**
   * Get version statistics
   * @param {string} snippetId - Snippet ID
   * @returns {Promise<Object>} Version stats
   */
  async getVersionStats(snippetId) {
    try {
      const { data, error } = await supabase
        ?.from('snippet_versions')
        ?.select('version_number, created_at, changed_by')
        ?.eq('snippet_id', snippetId)
        ?.order('version_number', { ascending: false });

      if (error) throw error;

      return {
        totalVersions: data?.length || 0,
        latestVersion: data?.[0]?.version_number || 1,
        firstCreated: data?.[data?.length - 1]?.created_at,
        lastModified: data?.[0]?.created_at,
        contributors: [...new Set(data?.map(v => v?.changed_by))]?.length
      };
    } catch (error) {
      console.error('Error fetching version stats:', error);
      throw error;
    }
  }
};

export default snippetVersionService;