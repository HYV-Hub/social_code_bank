import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { sessionService } from '../../services/sessionService';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from '../../components/AppShell';

const SessionManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');
  
  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  // Login attempts state
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    rememberDevice: false,
    autoLogoutMinutes: 120,
    requireMfaForNewDevice: false,
    emailNotificationNewLogin: true,
    emailNotificationSuspiciousActivity: true,
    trustedLocations: [],
    blockedIps: []
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesUpdating, setPreferencesUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        loadSessions(),
        loadLoginAttempts(),
        loadPreferences()
      ]);
    } catch (err) {
      setError(err?.message || 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await sessionService?.getActiveSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadLoginAttempts = async () => {
    setAttemptsLoading(true);
    try {
      const data = await sessionService?.getLoginAttempts(20);
      setLoginAttempts(data || []);
    } catch (err) {
      console.error('Failed to load login attempts:', err);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const loadPreferences = async () => {
    setPreferencesLoading(true);
    try {
      const data = await sessionService?.getSessionPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to end this session?')) return;
    
    try {
      await sessionService?.revokeSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError(err?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('This will log you out from all other devices. Continue?')) return;
    
    try {
      await sessionService?.revokeAllOtherSessions('current_session_token');
      await loadSessions();
    } catch (err) {
      setError(err?.message || 'Failed to revoke sessions');
    }
  };

  const handleToggleTrust = async (sessionId, currentTrust) => {
    try {
      await sessionService?.toggleDeviceTrust(sessionId, !currentTrust);
      await loadSessions();
    } catch (err) {
      setError(err?.message || 'Failed to update device trust');
    }
  };

  const handleUpdatePreferences = async (e) => {
    e?.preventDefault();
    setPreferencesUpdating(true);
    try {
      await sessionService?.updateSessionPreferences(preferences);
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to update preferences');
    } finally {
      setPreferencesUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return 'Smartphone';
      case 'tablet': return 'Tablet';
      default: return 'Monitor';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-success bg-success/10';
      case 'failed': return 'text-error bg-error/10';
      case 'blocked': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Sessions">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading session data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Sessions">
      <Helmet>
        <title>Session Management - Social Code Bank</title>
        <meta name="description" content="Manage your active sessions, review login history, and configure security preferences for your Social Code Bank account." />
      </Helmet>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Session Management</h1>
                <p className="text-muted-foreground mt-2">Monitor your account activity and manage security settings</p>
              </div>
              <button
                onClick={() => navigate('/user-dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error font-medium">Error</p>
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'sessions' ?'text-foreground border-b-2 border-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Monitor" size={18} />
                  <span>Active Sessions</span>
                  {sessions?.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-foreground bg-primary/15 rounded-full">
                      {sessions?.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'history' ?'text-foreground border-b-2 border-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Clock" size={18} />
                  <span>Login History</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'preferences' ?'text-foreground border-b-2 border-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Settings" size={18} />
                  <span>Preferences</span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Your Active Sessions</h2>
                {sessions?.length > 1 && (
                  <button
                    onClick={handleRevokeAllOther}
                    className="flex items-center gap-2 px-4 py-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors border border-error/20"
                  >
                    <Icon name="LogOut" size={18} />
                    <span>Logout All Other Devices</span>
                  </button>
                )}
              </div>

              {sessionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : sessions?.length === 0 ? (
                <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
                  <Icon name="Monitor" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active sessions found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions?.map((session) => (
                    <div key={session?.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon name={getDeviceIcon(session?.deviceType)} size={24} className="text-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{session?.deviceName || 'Unknown Device'}</h3>
                              {session?.isTrustedDevice && (
                                <span className="px-2 py-0.5 text-xs font-medium text-success bg-success/15 rounded-full flex items-center gap-1">
                                  <Icon name="Shield" size={12} />
                                  Trusted
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Icon name="Globe" size={14} />
                                <span>{session?.browserName} {session?.browserVersion} on {session?.osName} {session?.osVersion}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="MapPin" size={14} />
                                <span>{session?.locationCity}, {session?.locationCountry}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Wifi" size={14} />
                                <span>{session?.ipAddress}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Clock" size={14} />
                                <span>Last activity: {formatDate(session?.lastActivityAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Calendar" size={14} />
                                <span>Expires: {formatDate(session?.expiresAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleToggleTrust(session?.id, session?.isTrustedDevice)}
                            className="px-3 py-1.5 text-sm text-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                          >
                            {session?.isTrustedDevice ? 'Untrust' : 'Trust Device'}
                          </button>
                          <button
                            onClick={() => handleRevokeSession(session?.id)}
                            className="px-3 py-1.5 text-sm text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors border border-error/20"
                          >
                            End Session
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Login Activity</h2>

              {attemptsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : loginAttempts?.length === 0 ? (
                <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
                  <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No login history available</p>
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {loginAttempts?.map((attempt) => (
                          <tr key={attempt?.id} className="hover:bg-muted">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt?.attemptStatus)}`}>
                                {attempt?.attemptStatus === 'success' && <Icon name="CheckCircle" size={14} />}
                                {attempt?.attemptStatus === 'failed' && <Icon name="XCircle" size={14} />}
                                {attempt?.attemptStatus === 'blocked' && <Icon name="Shield" size={14} />}
                                {attempt?.attemptStatus}
                              </span>
                              {attempt?.isSuspicious && (
                                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-warning bg-warning/10">
                                  <Icon name="AlertTriangle" size={12} />
                                  Suspicious
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatDate(attempt?.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              <div>{attempt?.deviceName || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{attempt?.browserName} on {attempt?.osName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {attempt?.locationCity}, {attempt?.locationCountry}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {attempt?.ipAddress}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Security Preferences</h2>

              {preferencesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePreferences} className="space-y-6">
                  {/* Session Settings */}
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Clock" size={20} />
                      Session Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">Remember Device</label>
                          <p className="text-xs text-muted-foreground">Stay logged in on this device</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, rememberDevice: !preferences?.rememberDevice })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences?.rememberDevice ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                            preferences?.rememberDevice ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Auto Logout Timer (minutes)
                        </label>
                        <input
                          type="number"
                          value={preferences?.autoLogoutMinutes}
                          onChange={(e) => setPreferences({ ...preferences, autoLogoutMinutes: parseInt(e?.target?.value) || 120 })}
                          min="5"
                          max="1440"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Shield" size={20} />
                      Security Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">Require MFA for New Devices</label>
                          <p className="text-xs text-muted-foreground">Extra security when logging in from new devices</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, requireMfaForNewDevice: !preferences?.requireMfaForNewDevice })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences?.requireMfaForNewDevice ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                            preferences?.requireMfaForNewDevice ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="Bell" size={20} />
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">New Login Alerts</label>
                          <p className="text-xs text-muted-foreground">Get notified when you login from a new device</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, emailNotificationNewLogin: !preferences?.emailNotificationNewLogin })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences?.emailNotificationNewLogin ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                            preferences?.emailNotificationNewLogin ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-foreground">Suspicious Activity Alerts</label>
                          <p className="text-xs text-muted-foreground">Get notified about unusual account activity</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, emailNotificationSuspiciousActivity: !preferences?.emailNotificationSuspiciousActivity })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences?.emailNotificationSuspiciousActivity ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                            preferences?.emailNotificationSuspiciousActivity ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={loadPreferences}
                      className="px-6 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={preferencesUpdating}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {preferencesUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Save" size={18} />
                          <span>Save Preferences</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
    </AppShell>
  );
};

export default SessionManagement;