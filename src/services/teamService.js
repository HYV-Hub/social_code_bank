import { supabase } from '../lib/supabase';

/**
 * Team Service - Handles all team-related operations with Supabase
 * Converts between snake_case (DB) and camelCase (React)
 */

export const teamService = {
  /**
   * Get all teams user is a member of or created
   * CRITICAL: This method is required for visibility control in snippet creation
   */
  async getUserTeams(userId) {
    try {
      // ENHANCED FIX: If no userId provided, get from current session
      let effectiveUserId = userId;
      
      if (!effectiveUserId) {
        const { data: { user } } = await supabase?.auth?.getUser();
        effectiveUserId = user?.id;
      }
      
      // Validate userId
      if (!effectiveUserId || effectiveUserId === 'undefined' || effectiveUserId === 'null') {
        throw new Error('Invalid user ID');
      }

      // Get teams user is a member of via junction table
      const { data: memberTeams, error: memberError } = await supabase
        ?.from('team_members')
        ?.select(`
          team_id,
          teams!inner(
            id,
            name,
            description,
            created_at,
            created_by
          )
        `)
        ?.eq('user_id', effectiveUserId);

      if (memberError) throw memberError;

      // Get teams user created (they might not be in team_members yet)
      const { data: createdTeams, error: createdError } = await supabase
        ?.from('teams')
        ?.select('*')
        ?.eq('created_by', effectiveUserId);

      if (createdError) throw createdError;

      // Combine and deduplicate teams
      const memberTeamIds = new Set(memberTeams?.map(mt => mt?.teams?.id));
      const allTeams = [
        ...(memberTeams?.map(mt => mt?.teams) || []),
        ...(createdTeams?.filter(t => !memberTeamIds?.has(t?.id)) || [])
      ];

      // Sort by name
      allTeams?.sort((a, b) => a?.name?.localeCompare(b?.name));

      console.log('✅ Found', allTeams?.length, 'teams for user:', effectiveUserId);
      return allTeams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      throw error;
    }
  },

  /**
   * Get company teams - NEW METHOD
   * Returns only teams that belong to a specific company
   */
  async getCompanyTeams(companyId) {
    try {
      // Validate companyId
      if (!companyId || companyId === 'undefined' || companyId === 'null') {
        throw new Error('Valid company ID is required');
      }

      // Get teams filtered by company_id
      const { data, error } = await supabase
        ?.from('teams')
        ?.select(`
          id,
          name,
          description,
          company_id,
          created_at,
          created_by,
          companies:company_id (
            id,
            name,
            slug
          ),
          creator:created_by (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        ?.eq('company_id', companyId)
        ?.order('name', { ascending: true });

      if (error) throw error;

      const teams = data?.map(team => ({
        id: team?.id,
        name: team?.name,
        description: team?.description,
        companyId: team?.company_id,
        createdAt: team?.created_at,
        createdBy: team?.created_by,
        company: team?.companies ? {
          id: team?.companies?.id,
          name: team?.companies?.name,
          slug: team?.companies?.slug
        } : null,
        creator: team?.creator ? {
          id: team?.creator?.id,
          fullName: team?.creator?.full_name,
          username: team?.creator?.username,
          avatarUrl: team?.creator?.avatar_url
        } : null
      })) || [];

      console.log('✅ Found', teams?.length, 'teams for company:', companyId);
      return teams;
    } catch (error) {
      console.error('Error fetching company teams:', error);
      throw error;
    }
  },

  /**
   * Get team members for a specific team
   */
  async getTeamMembers(teamId) {
    try {
      const { data, error } = await supabase
        ?.from('team_members')
        ?.select(`
          id,
          role,
          joined_at,
          user_profiles!team_members_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            role as user_role
          )
        `)
        ?.eq('team_id', teamId)
        ?.order('joined_at', { ascending: false });

      if (error) throw error;

      return data?.map(member => ({
        id: member?.id,
        role: member?.role,
        joinedAt: member?.joined_at,
        user: member?.user_profiles ? {
          id: member?.user_profiles?.id,
          username: member?.user_profiles?.username,
          fullName: member?.user_profiles?.full_name,
          avatarUrl: member?.user_profiles?.avatar_url,
          userRole: member?.user_profiles?.user_role
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  /**
   * Add a user to a team
   */
  async addTeamMember(teamId, userId, role = 'member') {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify user is team creator
      const { data: team } = await supabase
        ?.from('teams')
        ?.select('created_by')
        ?.eq('id', teamId)
        ?.single();

      if (!team || team?.created_by !== user?.id) {
        throw new Error('Only team creators can add members');
      }

      const { data, error } = await supabase
        ?.from('team_members')
        ?.insert({
          team_id: teamId,
          user_id: userId,
          role: role
        })
        ?.select()
        ?.single();

      if (error) throw error;

      return {
        id: data?.id,
        teamId: data?.team_id,
        userId: data?.user_id,
        role: data?.role,
        joinedAt: data?.joined_at
      };
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  /**
   * Remove a user from a team
   */
  async removeTeamMember(teamId, userId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify user is team creator
      const { data: team } = await supabase
        ?.from('teams')
        ?.select('created_by')
        ?.eq('id', teamId)
        ?.single();

      if (!team || team?.created_by !== user?.id) {
        throw new Error('Only team creators can remove members');
      }

      const { error } = await supabase
        ?.from('team_members')
        ?.delete()
        ?.eq('team_id', teamId)
        ?.eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  },

  /**
   * Get a specific team by ID
   */
  async getTeamById(teamId) {
    try {
      const { data, error } = await supabase?.from('teams')?.select(`*,companies:company_id (id,name,slug,description),creator:created_by (id,full_name,username,avatar_url)`)?.eq('id', teamId)?.single();

      if (error) throw error;

      // Convert to camelCase
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        companyId: data?.company_id,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        company: data?.companies ? {
          id: data?.companies?.id,
          name: data?.companies?.name,
          slug: data?.companies?.slug,
          description: data?.companies?.description
        } : null,
        creator: data?.creator ? {
          id: data?.creator?.id,
          fullName: data?.creator?.full_name,
          username: data?.creator?.username,
          avatarUrl: data?.creator?.avatar_url
        } : null
      };
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  /**
   * Create a new team
   */
  async createTeam(teamData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate company if provided
      if (teamData?.companyId) {
        const { data: company, error: companyError } = await supabase?.from('companies')?.select('id')?.eq('id', teamData?.companyId)?.single();

        if (companyError || !company) {
          throw new Error('Company not found or no access');
        }
      }

      // Convert to snake_case for DB
      const { data, error } = await supabase?.from('teams')?.insert({
          name: teamData?.name,
          description: teamData?.description || null,
          company_id: teamData?.companyId || null,
          created_by: user?.id
        })?.select(`
          *,
          companies:company_id (
            id,
            name,
            slug
          )
        `)?.single();

      if (error) throw error;

      // Convert to camelCase
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        companyId: data?.company_id,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        company: data?.companies ? {
          id: data?.companies?.id,
          name: data?.companies?.name,
          slug: data?.companies?.slug
        } : null
      };
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  /**
   * Update a team
   */
  async updateTeam(teamId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert to snake_case for DB
      const dbUpdates = {};
      if (updates?.name !== undefined) dbUpdates.name = updates?.name;
      if (updates?.description !== undefined) dbUpdates.description = updates?.description;
      if (updates?.companyId !== undefined) dbUpdates.company_id = updates?.companyId;

      const { data, error } = await supabase?.from('teams')?.update(dbUpdates)?.eq('id', teamId)?.eq('created_by', user?.id)?.select()?.single();

      if (error) throw error;

      // Convert to camelCase
      return {
        id: data?.id,
        name: data?.name,
        description: data?.description,
        companyId: data?.company_id,
        createdBy: data?.created_by,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  /**
   * Delete a team
   */
  async deleteTeam(teamId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase?.from('teams')?.delete()?.eq('id', teamId)?.eq('created_by', user?.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  /**
   * Get team members count
   */
  async getTeamMembersCount(teamId) {
    try {
      const { count, error } = await supabase?.from('user_profiles')?.select('*', { count: 'exact', head: true })?.eq('team_id', teamId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting team members count:', error);
      throw error;
    }
  },

  /**
   * Get team activity/recent updates
   */
  async getTeamActivity(teamId, limit = 10) {
    try {
      // Get recent snippets created by team members
      const { data, error } = await supabase?.from('snippets')?.select(`
          id,
          title,
          created_at,
          user_profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `)?.eq('team_id', teamId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(item => ({
        id: item?.id,
        title: item?.title,
        createdAt: item?.created_at,
        user: item?.user_profiles ? {
          fullName: item?.user_profiles?.full_name,
          username: item?.user_profiles?.username,
          avatarUrl: item?.user_profiles?.avatar_url
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching team activity:', error);
      throw error;
    }
  },

  /**
   * Search teams by name
   */
  async searchTeams(searchQuery) {
    try {
      const { data, error } = await supabase?.from('teams')?.select(`
          *,
          companies:company_id (
            id,
            name,
            slug
          ),
          creator:created_by (
            id,
            full_name,
            username
          )
        `)?.ilike('name', `%${searchQuery}%`)?.order('created_at', { ascending: false })?.limit(20);

      if (error) throw error;

      return data?.map(team => ({
        id: team?.id,
        name: team?.name,
        description: team?.description,
        companyId: team?.company_id,
        createdAt: team?.created_at,
        company: team?.companies ? {
          id: team?.companies?.id,
          name: team?.companies?.name,
          slug: team?.companies?.slug
        } : null,
        creator: team?.creator ? {
          id: team?.creator?.id,
          fullName: team?.creator?.full_name,
          username: team?.creator?.username
        } : null
      })) || [];
    } catch (error) {
      console.error('Error searching teams:', error);
      throw error;
    }
  }
};

export default teamService;