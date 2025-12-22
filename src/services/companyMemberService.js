import { supabase } from '../lib/supabase';

/**
 * Company Member Management Service
 * Handles company member operations including invites, removal, role updates
 */
export const companyMemberService = {
  /**
   * Get all company members with detailed info
   */
  async getCompanyMembers(companyId) {
    const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])?.map(member => ({
      id: member?.id,
      fullName: member?.full_name,
      email: member?.email,
      role: member?.role,
      avatarUrl: member?.avatar_url,
      teamId: member?.team_id,
      isActive: member?.is_active,
      lastLoginAt: member?.last_login_at,
      createdAt: member?.created_at,
      snippetsCount: member?.snippets_count,
      bugsFixed: member?.bugs_fixed_count,
      points: member?.points
    }));
  },

  /**
   * Remove user from company
   */
  async removeMember(userId, companyId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify current user is company admin
    const { data: currentUser } = await supabase?.from('user_profiles')?.select('role, company_id')?.eq('id', user?.id)?.single();

    if (currentUser?.company_id !== companyId || currentUser?.role !== 'company_admin') {
      throw new Error('Only company admins can remove members');
    }

    // Remove company and team associations
    const { error } = await supabase?.from('user_profiles')?.update({ 
        company_id: null,
        team_id: null,
        role: 'user'
      })?.eq('id', userId)?.eq('company_id', companyId);

    if (error) throw error;

    return { success: true };
  },

  /**
   * Update member role
   */
  async updateMemberRole(userId, companyId, newRole) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify current user is company admin
    const { data: currentUser } = await supabase?.from('user_profiles')?.select('role, company_id')?.eq('id', user?.id)?.single();

    if (currentUser?.company_id !== companyId || currentUser?.role !== 'company_admin') {
      throw new Error('Only company admins can update roles');
    }

    const { data, error } = await supabase?.from('user_profiles')?.update({ role: newRole })?.eq('id', userId)?.eq('company_id', companyId)?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      role: data?.role
    };
  },

  /**
   * Assign member to team
   */
  async assignToTeam(userId, companyId, teamId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify team belongs to company
    const { data: team } = await supabase?.from('teams')?.select('id, company_id')?.eq('id', teamId)?.eq('company_id', companyId)?.single();

    if (!team) throw new Error('Team not found or does not belong to company');

    const { data, error } = await supabase?.from('user_profiles')?.update({ team_id: teamId })?.eq('id', userId)?.eq('company_id', companyId)?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      teamId: data?.team_id
    };
  },

  /**
   * Search users to invite to company (not already members)
   */
  async searchUsersToInvite(companyId, searchQuery = '') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get existing company member IDs
    const { data: existingMembers } = await supabase?.from('user_profiles')?.select('id')?.eq('company_id', companyId);

    const excludedIds = (existingMembers || [])?.map(m => m?.id);
    excludedIds?.push(user?.id);

    // Search for users not in company
    let query = supabase?.from('user_profiles')?.select('id, full_name, email, avatar_url, role')?.is('company_id', null)?.not('id', 'in', `(${excludedIds?.join(',')})`)?.limit(20);

    if (searchQuery) {
      query = query?.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || [])?.map(user => ({
      id: user?.id,
      fullName: user?.full_name,
      email: user?.email,
      avatarUrl: user?.avatar_url,
      currentRole: user?.role
    }));
  },

  /**
   * Invite user to company
   * CRITICAL FIX: Proper team handling, error recovery, and notification system
   */
  async inviteToCompany(companyId, userId, teamId = null, message = '') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user is company admin
    const { data: currentUser } = await supabase?.from('user_profiles')?.select('role, company_id, full_name')?.eq('id', user?.id)?.single();

    if (currentUser?.company_id !== companyId || currentUser?.role !== 'company_admin') {
      throw new Error('Only company admins can invite members');
    }

    // CRITICAL FIX: Get company name for notification
    const { data: company, error: companyError } = await supabase?.from('companies')?.select('name, user_limit, users_count')?.eq('id', companyId)?.single();

    if (companyError) {
      console.error('❌ Error fetching company:', companyError);
      throw new Error('Failed to fetch company details');
    }

    // Check company user limit
    if (company && company?.users_count >= company?.user_limit) {
      throw new Error(`Company has reached maximum user limit (${company?.user_limit} users)`);
    }

    // CRITICAL FIX: Validate that invited user exists and isn't already in a company
    const { data: inviteeProfile, error: inviteeError } = await supabase?.from('user_profiles')?.select('id, company_id, email, full_name')?.eq('id', userId)?.single();

    if (inviteeError || !inviteeProfile) {
      throw new Error('User not found or invalid');
    }

    if (inviteeProfile?.company_id) {
      throw new Error('User is already part of a company');
    }

    // CRITICAL FIX: Team handling - use provided teamId or create invitation without team requirement
    let finalTeamId = teamId;

    // If no team specified, try to find or create a default "General" team
    if (!finalTeamId) {
      // Try to find existing "General" team
      const { data: existingTeam } = await supabase?.from('teams')?.select('id')?.eq('company_id', companyId)?.ilike('name', 'General')?.limit(1)?.single();

      if (existingTeam) {
        finalTeamId = existingTeam?.id;
        console.log('✅ Using existing General team:', finalTeamId);
      } else {
        // Create a default "General" team for company invitations
        const { data: newTeam, error: teamError } = await supabase?.from('teams')?.insert({
            name: 'General',
            description: 'Default team for company members',
            company_id: companyId,
            created_by: user?.id
          })?.select()?.single();

        if (teamError) {
          console.error('❌ Error creating default team:', teamError);
          // Don't fail the invitation - we'll handle team assignment later
          console.warn('⚠️ Proceeding with invitation without team assignment');
        } else {
          finalTeamId = newTeam?.id;
          console.log('✅ Created new General team:', finalTeamId);
        }
      }
    } else {
      // Verify provided teamId belongs to company
      const { data: team, error: teamError } = await supabase?.from('teams')?.select('id, company_id')?.eq('id', teamId)?.eq('company_id', companyId)?.single();

      if (teamError || !team) {
        throw new Error('Team not found or does not belong to this company');
      }
    }

    // CRITICAL FIX: Only create team_invite if we have a valid team
    let inviteData = null;
    if (finalTeamId) {
      const { data, error: inviteError } = await supabase?.from('team_invites')?.insert({
          team_id: finalTeamId,
          inviter_id: user?.id,
          invitee_id: userId,
          message: message || `Join ${company?.name || 'our company'}!`,
          status: 'pending'
        })?.select()?.single();

      if (inviteError) {
        console.error('❌ Error creating team invite:', inviteError);
        throw new Error(`Failed to create invitation: ${inviteError?.message}`);
      }

      inviteData = data;
      console.log('✅ Created team invite:', inviteData?.id);
    } else {
      // Create a direct company invitation record (without team requirement)
      console.warn('⚠️ Creating company invitation without team assignment');
      
      // For now, we'll still throw an error to maintain data integrity
      throw new Error('Unable to process invitation: No team available. Please create a team first.');
    }

    // CRITICAL FIX: Create notification with proper error handling
    try {
      const { error: notifError } = await supabase?.from('notifications')?.insert({
          user_id: userId,
          actor_id: user?.id,
          notification_type: 'team_invite',
          title: `${company?.name || 'Company'} Invitation`,
          message: `${currentUser?.full_name || 'Someone'} invited you to join ${company?.name || 'their company'}${finalTeamId ? ' and assigned you to a team' : ''}`,
          priority: 'high',
          is_read: false
        });

      if (notifError) {
        console.error('❌ Error creating notification:', notifError);
        // Don't fail the invitation if notification fails - log it for debugging
        console.warn('⚠️ Invitation created but notification failed');
      } else {
        console.log('✅ Notification sent successfully');
      }
    } catch (notifError) {
      console.error('❌ Exception creating notification:', notifError);
      // Continue - invitation is still valid even if notification fails
    }

    return {
      id: inviteData?.id,
      status: inviteData?.status || 'pending',
      teamId: finalTeamId,
      createdAt: inviteData?.created_at || new Date()?.toISOString()
    };
  },

  /**
   * Bulk invite users to company
   * ENHANCED: Better error reporting and success tracking
   */
  async bulkInviteToCompany(companyId, userIds, teamId = null, message = '') {
    const results = [];
    const errors = [];

    console.log(`📤 Starting bulk invitation for ${userIds?.length} users`);

    for (const userId of userIds) {
      try {
        const result = await this.inviteToCompany(companyId, userId, teamId, message);
        results?.push({ 
          userId, 
          success: true, 
          inviteId: result?.id,
          teamId: result?.teamId 
        });
        console.log(`✅ Successfully invited user: ${userId}`);
      } catch (error) {
        errors?.push({ 
          userId, 
          success: false, 
          error: error?.message || 'Unknown error' 
        });
        console.error(`❌ Failed to invite user ${userId}:`, error?.message);
      }
    }

    console.log(`📊 Bulk invitation complete: ${results?.length} successful, ${errors?.length} failed`);

    return {
      successful: results,
      failed: errors,
      totalProcessed: userIds?.length,
      successCount: results?.length,
      errorCount: errors?.length
    };
  },

  /**
   * Get company invitation statistics
   */
  async getInvitationStats(companyId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get teams for this company
    const { data: teams } = await supabase?.from('teams')?.select('id')?.eq('company_id', companyId);

    if (!teams || teams?.length === 0) {
      return {
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
        total: 0
      };
    }

    const teamIds = teams?.map(t => t?.id);

    // Get invitation stats
    const { data: invites } = await supabase?.from('team_invites')?.select('status')?.in('team_id', teamIds);

    const stats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      total: invites?.length || 0
    };

    invites?.forEach(invite => {
      if (invite?.status === 'pending') stats.pending++;
      else if (invite?.status === 'accepted') stats.accepted++;
      else if (invite?.status === 'rejected') stats.rejected++;
      else if (invite?.status === 'cancelled') stats.cancelled++;
    });

    return stats;
  }
};

export default companyMemberService;