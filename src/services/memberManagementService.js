import { supabase } from '../lib/supabase';

/**
 * Member Management Service
 * Provides methods for managing company members, roles, and permissions
 */
export const memberManagementService = {
  /**
   * Get all company members with detailed information
   */
  getCompanyMembers: async (companyId) => {
    const { data, error } = await supabase?.from('user_profiles')?.select(`
        id,
        email,
        username,
        full_name,
        avatar_url,
        role,
        team_id,
        is_active,
        last_login_at,
        created_at,
        snippets_count,
        bugs_fixed_count,
        contributor_level
      `)?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company members:', error);
      throw error;
    }

    // Convert to camelCase
    return (data || [])?.map(member => ({
      id: member?.id,
      email: member?.email,
      username: member?.username,
      fullName: member?.full_name,
      avatarUrl: member?.avatar_url,
      role: member?.role,
      teamId: member?.team_id,
      isActive: member?.is_active,
      lastLoginAt: member?.last_login_at,
      createdAt: member?.created_at,
      snippetsCount: member?.snippets_count,
      bugsFixedCount: member?.bugs_fixed_count,
      contributorLevel: member?.contributor_level
    }));
  },

  /**
   * Search members by name, email, or username
   */
  searchMembers: async (companyId, searchTerm) => {
    if (!searchTerm || searchTerm?.trim() === '') {
      return await memberManagementService?.getCompanyMembers(companyId);
    }

    const searchLower = searchTerm?.toLowerCase();
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('company_id', companyId)?.or(`full_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%,username.ilike.%${searchLower}%`);

    if (error) {
      console.error('Error searching members:', error);
      throw error;
    }

    return (data || [])?.map(member => ({
      id: member?.id,
      email: member?.email,
      username: member?.username,
      fullName: member?.full_name,
      avatarUrl: member?.avatar_url,
      role: member?.role,
      teamId: member?.team_id,
      isActive: member?.is_active,
      lastLoginAt: member?.last_login_at,
      createdAt: member?.created_at,
      snippetsCount: member?.snippets_count,
      bugsFixedCount: member?.bugs_fixed_count,
      contributorLevel: member?.contributor_level
    }));
  },

  /**
   * Filter members by role
   */
  filterMembersByRole: async (companyId, role) => {
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('company_id', companyId)?.eq('role', role);

    if (error) {
      console.error('Error filtering members by role:', error);
      throw error;
    }

    return (data || [])?.map(member => ({
      id: member?.id,
      email: member?.email,
      username: member?.username,
      fullName: member?.full_name,
      avatarUrl: member?.avatar_url,
      role: member?.role,
      teamId: member?.team_id,
      isActive: member?.is_active,
      lastLoginAt: member?.last_login_at,
      createdAt: member?.created_at,
      snippetsCount: member?.snippets_count,
      bugsFixedCount: member?.bugs_fixed_count,
      contributorLevel: member?.contributor_level
    }));
  },

  /**
   * Update member role
   */
  updateMemberRole: async (userId, newRole) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ role: newRole })?.eq('id', userId)?.select()?.single();

    if (error) {
      console.error('Error updating member role:', error);
      throw error;
    }

    return {
      id: data?.id,
      role: data?.role
    };
  },

  /**
   * Update member team assignment
   */
  updateMemberTeam: async (userId, teamId) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ team_id: teamId })?.eq('id', userId)?.select()?.single();

    if (error) {
      console.error('Error updating member team:', error);
      throw error;
    }

    return {
      id: data?.id,
      teamId: data?.team_id
    };
  },

  /**
   * Deactivate member account
   */
  deactivateMember: async (userId) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ is_active: false })?.eq('id', userId)?.select()?.single();

    if (error) {
      console.error('Error deactivating member:', error);
      throw error;
    }

    return {
      id: data?.id,
      isActive: data?.is_active
    };
  },

  /**
   * Reactivate member account
   */
  reactivateMember: async (userId) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ is_active: true })?.eq('id', userId)?.select()?.single();

    if (error) {
      console.error('Error reactivating member:', error);
      throw error;
    }

    return {
      id: data?.id,
      isActive: data?.is_active
    };
  },

  /**
   * Remove member from company
   */
  removeMember: async (userId) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ 
        company_id: null,
        team_id: null,
        role: 'user'
      })?.eq('id', userId)?.select()?.single();

    if (error) {
      console.error('Error removing member from company:', error);
      throw error;
    }

    return {
      id: data?.id,
      companyId: data?.company_id
    };
  },

  /**
   * Bulk update member roles
   */
  bulkUpdateRoles: async (userIds, newRole) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ role: newRole })?.in('id', userIds)?.select();

    if (error) {
      console.error('Error bulk updating roles:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Bulk deactivate members
   */
  bulkDeactivateMembers: async (userIds) => {
    const { data, error } = await supabase?.from('user_profiles')?.update({ is_active: false })?.in('id', userIds)?.select();

    if (error) {
      console.error('Error bulk deactivating members:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get member activity summary
   */
  getMemberActivity: async (userId) => {
    try {
      // Get recent snippets
      const { data: snippets, error: snippetsError } = await supabase?.from('snippets')?.select('id, title, created_at')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(5);

      if (snippetsError) throw snippetsError;

      // Get recent bug fixes
      const { data: bugs, error: bugsError } = await supabase?.from('bugs')?.select('id, title, created_at')?.eq('assigned_to', userId)?.eq('status', 'resolved')?.order('created_at', { ascending: false })?.limit(5);

      if (bugsError) throw bugsError;

      return {
        recentSnippets: (snippets || [])?.map(s => ({
          id: s?.id,
          title: s?.title,
          createdAt: s?.created_at
        })),
        recentBugFixes: (bugs || [])?.map(b => ({
          id: b?.id,
          title: b?.title,
          createdAt: b?.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching member activity:', error);
      return {
        recentSnippets: [],
        recentBugFixes: []
      };
    }
  },

  /**
   * Check if can add more users to company
   */
  canAddMembers: async (companyId) => {
    const { data, error } = await supabase?.rpc('can_add_company_user', { p_company_id: companyId });

    if (error) {
      console.error('Error checking user limit:', error);
      return false;
    }

    return data;
  }
};

export default memberManagementService;