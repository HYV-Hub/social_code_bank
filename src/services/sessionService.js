import { supabase } from '../lib/supabase';

export const sessionService = {
  // Get all active sessions for current user
  async getActiveSessions() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('user_sessions')?.select('*')?.eq('user_id', user?.id)?.in('status', ['active'])?.order('last_activity_at', { ascending: false });

    if (error) throw error;

    return data?.map(session => ({
      id: session?.id,
      deviceName: session?.device_name,
      deviceType: session?.device_type,
      browserName: session?.browser_name,
      browserVersion: session?.browser_version,
      osName: session?.os_name,
      osVersion: session?.os_version,
      ipAddress: session?.ip_address,
      locationCountry: session?.location_country,
      locationCity: session?.location_city,
      isTrustedDevice: session?.is_trusted_device,
      lastActivityAt: session?.last_activity_at,
      expiresAt: session?.expires_at,
      status: session?.status,
      createdAt: session?.created_at
    }));
  },

  // Revoke a specific session
  async revokeSession(sessionId, reason = 'User requested logout') {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('user_sessions')?.update({
        status: 'revoked',
        revoked_at: new Date()?.toISOString(),
        revoked_reason: reason
      })?.eq('id', sessionId)?.eq('user_id', user?.id);

    if (error) throw error;
  },

  // Revoke all sessions except current
  async revokeAllOtherSessions(currentSessionToken) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('user_sessions')?.update({
        status: 'revoked',
        revoked_at: new Date()?.toISOString(),
        revoked_reason: 'User logged out from all devices'
      })?.eq('user_id', user?.id)?.neq('session_token', currentSessionToken)?.eq('status', 'active');

    if (error) throw error;
  },

  // Trust/untrust a device
  async toggleDeviceTrust(sessionId, isTrusted) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('user_sessions')?.update({ is_trusted_device: isTrusted })?.eq('id', sessionId)?.eq('user_id', user?.id);

    if (error) throw error;
  },

  // Get recent login attempts
  async getLoginAttempts(limit = 20) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('login_attempts')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;

    return data?.map(attempt => ({
      id: attempt?.id,
      email: attempt?.email,
      ipAddress: attempt?.ip_address,
      deviceName: attempt?.device_name,
      browserName: attempt?.browser_name,
      osName: attempt?.os_name,
      locationCountry: attempt?.location_country,
      locationCity: attempt?.location_city,
      attemptStatus: attempt?.attempt_status,
      failureReason: attempt?.failure_reason,
      isSuspicious: attempt?.is_suspicious,
      createdAt: attempt?.created_at
    }));
  },

  // Get session preferences
  async getSessionPreferences() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('session_preferences')?.select('*')?.eq('user_id', user?.id)?.single();

    if (error) {
      // If no preferences exist, create default ones
      if (error?.code === 'PGRST116') {
        return await this.createDefaultPreferences();
      }
      throw error;
    }

    return {
      rememberDevice: data?.remember_device,
      autoLogoutMinutes: data?.auto_logout_minutes,
      requireMfaForNewDevice: data?.require_mfa_for_new_device,
      emailNotificationNewLogin: data?.email_notification_new_login,
      emailNotificationSuspiciousActivity: data?.email_notification_suspicious_activity,
      trustedLocations: data?.trusted_locations,
      blockedIps: data?.blocked_ips
    };
  },

  // Update session preferences
  async updateSessionPreferences(preferences) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('session_preferences')?.upsert({
        user_id: user?.id,
        remember_device: preferences?.rememberDevice,
        auto_logout_minutes: preferences?.autoLogoutMinutes,
        require_mfa_for_new_device: preferences?.requireMfaForNewDevice,
        email_notification_new_login: preferences?.emailNotificationNewLogin,
        email_notification_suspicious_activity: preferences?.emailNotificationSuspiciousActivity,
        trusted_locations: preferences?.trustedLocations,
        blocked_ips: preferences?.blockedIps,
        updated_at: new Date()?.toISOString()
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Create default preferences
  async createDefaultPreferences() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('session_preferences')?.insert({
        user_id: user?.id,
        remember_device: false,
        auto_logout_minutes: 120,
        require_mfa_for_new_device: false,
        email_notification_new_login: true,
        email_notification_suspicious_activity: true,
        trusted_locations: [],
        blocked_ips: []
      })?.select()?.single();

    if (error) throw error;

    return {
      rememberDevice: data?.remember_device,
      autoLogoutMinutes: data?.auto_logout_minutes,
      requireMfaForNewDevice: data?.require_mfa_for_new_device,
      emailNotificationNewLogin: data?.email_notification_new_login,
      emailNotificationSuspiciousActivity: data?.email_notification_suspicious_activity,
      trustedLocations: data?.trusted_locations,
      blockedIps: data?.blocked_ips
    };
  }
};