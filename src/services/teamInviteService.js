import { supabase } from '../lib/supabase';

export const teamInviteService = {
  // Create team invite
  async createInvite(teamId, inviteeId, message = '') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify team exists and user is creator
    const { data: team, error: teamError } = await supabase?.from('teams')?.select('id, created_by')?.eq('id', teamId)?.eq('created_by', user?.id)?.single();

    if (teamError || !team) {
      throw new Error('Team not found or you do not have permission');
    }

    // Check if invite already exists
    const { data: existingInvite } = await supabase?.from('team_invites')?.select('id, status')?.eq('team_id', teamId)?.eq('invitee_id', inviteeId)?.eq('status', 'pending')?.single();

    if (existingInvite) {
      throw new Error('Invitation already sent to this user');
    }

    // Create invite
    const { data, error } = await supabase?.from('team_invites')?.insert({
        team_id: teamId,
        inviter_id: user?.id,
        invitee_id: inviteeId,
        message: message
      })?.select(`
        *,
        team:teams(id, name, description),
        inviter:user_profiles!team_invites_inviter_id_fkey(id, full_name, email),
        invitee:user_profiles!team_invites_invitee_id_fkey(id, full_name, email)
      `)?.single();

    if (error) throw error;

    // Create notification
    await supabase?.from('notifications')?.insert({
      user_id: inviteeId,
      actor_id: user?.id,
      notification_type: 'team_invite',
      title: 'Team Invitation',
      message: `You have been invited to join ${data?.team?.name}`,
      priority: 'medium'
    });

    return {
      id: data?.id,
      teamId: data?.team_id,
      teamName: data?.team?.name,
      teamDescription: data?.team?.description,
      inviterId: data?.inviter_id,
      inviterName: data?.inviter?.full_name,
      inviteeId: data?.invitee_id,
      inviteeName: data?.invitee?.full_name,
      status: data?.status,
      message: data?.message,
      createdAt: data?.created_at
    };
  },

  // Get invites sent by user
  async getSentInvites() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('team_invites')?.select(`
        *,
        team:teams(id, name, description),
        invitee:user_profiles!team_invites_invitee_id_fkey(id, full_name, email, avatar_url)
      `)?.eq('inviter_id', user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])?.map(invite => ({
      id: invite?.id,
      teamId: invite?.team_id,
      teamName: invite?.team?.name,
      inviteeId: invite?.invitee_id,
      inviteeName: invite?.invitee?.full_name,
      inviteeEmail: invite?.invitee?.email,
      inviteeAvatar: invite?.invitee?.avatar_url,
      status: invite?.status,
      message: invite?.message,
      createdAt: invite?.created_at,
      respondedAt: invite?.responded_at
    }));
  },

  // Get invites received by user
  async getReceivedInvites() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('team_invites')?.select(`
        *,
        team:teams(id, name, description),
        inviter:user_profiles!team_invites_inviter_id_fkey(id, full_name, email, avatar_url)
      `)?.eq('invitee_id', user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])?.map(invite => ({
      id: invite?.id,
      teamId: invite?.team_id,
      teamName: invite?.team?.name,
      teamDescription: invite?.team?.description,
      inviterId: invite?.inviter_id,
      inviterName: invite?.inviter?.full_name,
      inviterEmail: invite?.inviter?.email,
      inviterAvatar: invite?.inviter?.avatar_url,
      status: invite?.status,
      message: invite?.message,
      createdAt: invite?.created_at,
      respondedAt: invite?.responded_at
    }));
  },

  // Accept invite
  async acceptInvite(inviteId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Call the accept function
    const { data, error } = await supabase?.rpc('accept_team_invite', {
      invite_uuid: inviteId
    });

    if (error) throw error;
    if (!data) throw new Error('Failed to accept invite');

    return { success: true };
  },

  // Reject invite
  async rejectInvite(inviteId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('team_invites')?.update({
        status: 'rejected',
        responded_at: new Date()?.toISOString()
      })?.eq('id', inviteId)?.eq('invitee_id', user?.id);

    if (error) throw error;
    return { success: true };
  },

  // Cancel invite (by inviter)
  async cancelInvite(inviteId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('team_invites')?.update({
        status: 'cancelled',
        responded_at: new Date()?.toISOString()
      })?.eq('id', inviteId)?.eq('inviter_id', user?.id);

    if (error) throw error;
    return { success: true };
  },

  // Search users to invite (excluding already invited)
  async searchUsersToInvite(teamId, searchQuery = '') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all user IDs who are already invited or members
    const { data: existingInvites } = await supabase?.from('team_invites')?.select('invitee_id')?.eq('team_id', teamId)?.eq('status', 'pending');

    const existingInviteIds = (existingInvites || [])?.map(inv => inv?.invitee_id);

    // Get team members
    const { data: teamMembers } = await supabase?.from('user_profiles')?.select('id')?.eq('team_id', teamId);

    const teamMemberIds = (teamMembers || [])?.map(member => member?.id);

    // Combine excluded IDs
    const excludedIds = [...new Set([...existingInviteIds, ...teamMemberIds, user.id])];

    // Search for users
    let query = supabase?.from('user_profiles')?.select('id, full_name, email, avatar_url')?.not('id', 'in', `(${excludedIds?.join(',')})`)?.limit(10);

    if (searchQuery) {
      query = query?.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || [])?.map(user => ({
      id: user?.id,
      fullName: user?.full_name,
      email: user?.email,
      avatarUrl: user?.avatar_url
    }));
  }
};