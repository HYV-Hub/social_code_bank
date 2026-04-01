import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { notificationService } from '../../services/notificationService';
import AppShell from '../../components/AppShell';

const UserPreferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Profile preferences state
  const [profilePreferences, setProfilePreferences] = useState({
    full_name: '',
    bio: '',
    email: '',
    username: ''
  });

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_comments: true,
    email_likes: true,
    email_follows: true,
    email_mentions: true,
    email_bug_assignments: true,
    email_team_updates: true,
    in_app_comments: true,
    in_app_likes: true,
    in_app_follows: true,
    in_app_mentions: true,
    in_app_bug_assignments: true,
    in_app_team_updates: true,
    push_comments: true,
    push_likes: false,
    push_follows: true,
    push_mentions: true,
    push_bug_assignments: true,
    push_team_updates: true
  });

  // Load user preferences on mount
  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      setError('');

      // Load user profile - updated method call without userId
      const profile = await profileService?.getCurrentProfile();
      if (profile) {
        setProfilePreferences({
          full_name: profile?.fullName || '',
          bio: profile?.bio || '',
          email: profile?.email || '',
          username: profile?.username || ''
        });
      }

      // Load notification preferences - updated method call without userId
      const notifPrefs = await notificationService?.getPreferences();
      if (notifPrefs) {
        setNotificationPreferences({
          email_comments: notifPrefs?.emailComments ?? true,
          email_likes: notifPrefs?.emailLikes ?? true,
          email_follows: notifPrefs?.emailFollows ?? true,
          email_mentions: notifPrefs?.emailMentions ?? true,
          email_bug_assignments: notifPrefs?.emailBugAssignments ?? true,
          email_team_updates: notifPrefs?.emailTeamUpdates ?? true,
          in_app_comments: notifPrefs?.inAppComments ?? true,
          in_app_likes: notifPrefs?.inAppLikes ?? true,
          in_app_follows: notifPrefs?.inAppFollows ?? true,
          in_app_mentions: notifPrefs?.inAppMentions ?? true,
          in_app_bug_assignments: notifPrefs?.inAppBugAssignments ?? true,
          in_app_team_updates: notifPrefs?.inAppTeamUpdates ?? true,
          push_comments: notifPrefs?.pushComments ?? true,
          push_likes: notifPrefs?.pushLikes ?? false,
          push_follows: notifPrefs?.pushFollows ?? true,
          push_mentions: notifPrefs?.pushMentions ?? true,
          push_bug_assignments: notifPrefs?.pushBugAssignments ?? true,
          push_team_updates: notifPrefs?.pushTeamUpdates ?? true
        });
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfilePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Updated method call without userId - service handles auth internally
      await profileService?.updateProfile({
        fullName: profilePreferences?.full_name,
        bio: profilePreferences?.bio,
        username: profilePreferences?.username
      });

      setSuccessMessage('Profile preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile preferences:', err);
      setError(err?.message || 'Failed to save profile preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Updated method call without userId - service handles auth internally
      await notificationService?.updatePreferences({
        emailComments: notificationPreferences?.email_comments,
        emailLikes: notificationPreferences?.email_likes,
        emailFollows: notificationPreferences?.email_follows,
        emailMentions: notificationPreferences?.email_mentions,
        emailBugAssignments: notificationPreferences?.email_bug_assignments,
        emailTeamUpdates: notificationPreferences?.email_team_updates,
        inAppComments: notificationPreferences?.in_app_comments,
        inAppLikes: notificationPreferences?.in_app_likes,
        inAppFollows: notificationPreferences?.in_app_follows,
        inAppMentions: notificationPreferences?.in_app_mentions,
        inAppBugAssignments: notificationPreferences?.in_app_bug_assignments,
        inAppTeamUpdates: notificationPreferences?.in_app_team_updates,
        pushComments: notificationPreferences?.push_comments,
        pushLikes: notificationPreferences?.push_likes,
        pushFollows: notificationPreferences?.push_follows,
        pushMentions: notificationPreferences?.push_mentions,
        pushBugAssignments: notificationPreferences?.push_bug_assignments,
        pushTeamUpdates: notificationPreferences?.push_team_updates
      });

      setSuccessMessage('Notification preferences saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError(err?.message || 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = (key) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  if (loading) {
    return (
      <AppShell pageTitle="Preferences">
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading preferences...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Preferences">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <Icon name="ChevronLeft" size={20} className="mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Preferences</h1>
          <p className="text-muted-foreground">
            Manage your account settings and notification preferences
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start">
            <Icon name="AlertCircle" size={20} className="text-destructive mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-destructive text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6 flex items-start">
            <Icon name="CheckCircle" size={20} className="text-success mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-success font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Profile Preferences Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
            <Icon name="User" size={24} className="mr-2 text-primary" />
            Profile Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profilePreferences?.full_name}
                onChange={(e) => setProfilePreferences(prev => ({ ...prev, full_name: e?.target?.value }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={profilePreferences?.username}
                onChange={(e) => setProfilePreferences(prev => ({ ...prev, username: e?.target?.value }))}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={profilePreferences?.email}
                disabled
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed directly. Contact support if needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Bio
              </label>
              <textarea
                value={profilePreferences?.bio}
                onChange={(e) => setProfilePreferences(prev => ({ ...prev, bio: e?.target?.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button
              onClick={handleSaveProfilePreferences}
              disabled={saving}
              className="w-full sm:w-auto"
              iconName={saving ? "Loader2" : "Save"}
              iconClassName={saving ? "animate-spin" : ""}
            >
              {saving ? 'Saving...' : 'Save Profile Settings'}
            </Button>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
            <Icon name="Bell" size={24} className="mr-2 text-primary" />
            Notification Preferences
          </h2>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4 flex items-center">
                <Icon name="Mail" size={20} className="mr-2 text-muted-foreground" />
                Email Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {[
                  { key: 'email_comments', label: 'Comments on your snippets' },
                  { key: 'email_likes', label: 'Likes on your content' },
                  { key: 'email_follows', label: 'New followers' },
                  { key: 'email_mentions', label: 'Mentions in comments' },
                  { key: 'email_bug_assignments', label: 'Bug assignments' },
                  { key: 'email_team_updates', label: 'Team updates' }
                ]?.map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <button
                      onClick={() => handleToggleNotification(key)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notificationPreferences?.[key] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                          notificationPreferences?.[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* In-App Notifications */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4 flex items-center">
                <Icon name="Monitor" size={20} className="mr-2 text-muted-foreground" />
                In-App Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {[
                  { key: 'in_app_comments', label: 'Comments on your snippets' },
                  { key: 'in_app_likes', label: 'Likes on your content' },
                  { key: 'in_app_follows', label: 'New followers' },
                  { key: 'in_app_mentions', label: 'Mentions in comments' },
                  { key: 'in_app_bug_assignments', label: 'Bug assignments' },
                  { key: 'in_app_team_updates', label: 'Team updates' }
                ]?.map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <button
                      onClick={() => handleToggleNotification(key)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notificationPreferences?.[key] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                          notificationPreferences?.[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4 flex items-center">
                <Icon name="Smartphone" size={20} className="mr-2 text-muted-foreground" />
                Push Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {[
                  { key: 'push_comments', label: 'Comments on your snippets' },
                  { key: 'push_likes', label: 'Likes on your content' },
                  { key: 'push_follows', label: 'New followers' },
                  { key: 'push_mentions', label: 'Mentions in comments' },
                  { key: 'push_bug_assignments', label: 'Bug assignments' },
                  { key: 'push_team_updates', label: 'Team updates' }
                ]?.map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                      {label}
                    </span>
                    <button
                      onClick={() => handleToggleNotification(key)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notificationPreferences?.[key] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-card rounded-full transition-transform ${
                          notificationPreferences?.[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveNotificationPreferences}
              disabled={saving}
              className="w-full sm:w-auto"
              iconName={saving ? "Loader2" : "Save"}
              iconClassName={saving ? "animate-spin" : ""}
            >
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </div>
    </AppShell>
  );
};

export default UserPreferences;
