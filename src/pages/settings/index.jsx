import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hiveService } from '../../services/hiveService';
import AppNavigation from '../../components/AppNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile settings
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website_url: '',
    github_url: '',
    linkedin_url: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    snippet_likes: true,
    comments: true,
    team_invites: true,
    mentions: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_activity: true
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Hive settings - NEW
  const [userHives, setUserHives] = useState([]);
  const [loadingHives, setLoadingHives] = useState(false);

  useEffect(() => {
    loadSettings();
    if (activeTab === 'hives') {
      loadUserHives();
    }
  }, [user, activeTab]);

  const loadSettings = async () => {
    try {
      // Load profile data
      const { data: profile } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.single();

      if (profile) {
        setProfileData({
          username: profile?.username || '',
          email: user?.email || '',
          bio: profile?.bio || '',
          location: profile?.location || '',
          website_url: profile?.website_url || '',
          github_url: profile?.github_url || '',
          linkedin_url: profile?.linkedin_url || ''
        });

        setPrivacy({
          profile_visibility: profile?.profile_visibility || 'public',
          show_email: profile?.show_email || false,
          show_activity: profile?.show_activity !== false
        });
      }

      // Load notification preferences
      const { data: prefs } = await supabase?.from('notification_preferences')?.select('*')?.eq('user_id', user?.id)?.single();

      if (prefs) {
        setNotifications({
          email_notifications: prefs?.email_notifications !== false,
          push_notifications: prefs?.push_notifications !== false,
          snippet_likes: prefs?.snippet_likes !== false,
          comments: prefs?.comments !== false,
          team_invites: prefs?.team_invites !== false,
          mentions: prefs?.mentions !== false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadUserHives = async () => {
    try {
      setLoadingHives(true);
      // Get hives where user is the owner
      const { data, error } = await supabase
        ?.from('hives')
        ?.select('*')
        ?.eq('owner_id', user?.id)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setUserHives(data || []);
    } catch (error) {
      console.error('Error loading hives:', error);
      setMessage({ type: 'error', text: 'Failed to load hives' });
    } finally {
      setLoadingHives(false);
    }
  };

  const handleHivePrivacyUpdate = async (hiveId, newPrivacy) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await hiveService?.updateHiveSettings(hiveId, { privacy: newPrivacy });
      
      // Update local state
      setUserHives(prevHives => 
        prevHives?.map(hive => 
          hive?.id === hiveId 
            ? { ...hive, privacy: newPrivacy } 
            : hive
        )
      );

      setMessage({ type: 'success', text: 'Hive privacy updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase?.from('user_profiles')?.update({
          username: profileData?.username,
          bio: profileData?.bio,
          location: profileData?.location,
          website_url: profileData?.website_url,
          github_url: profileData?.github_url,
          linkedin_url: profileData?.linkedin_url
        })?.eq('id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase?.from('notification_preferences')?.upsert({
          user_id: user?.id,
          ...notifications
        });

      if (error) throw error;

      // Also save to user_profiles.notification_preferences for quick access
      await supabase?.from('user_profiles')?.update({
        notification_preferences: notifications
      })?.eq('id', user?.id);

      setMessage({ type: 'success', text: 'Notification preferences updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase?.from('user_profiles')?.update(privacy)?.eq('id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Privacy settings updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setLoading(false);
      return;
    }

    if (passwordData?.newPassword?.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters!' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase?.auth?.updateUser({
        password: passwordData?.newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase?.rpc('delete_user_account', {
        user_id: user?.id
      });

      if (error) throw error;

      await signOut();
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'User' },
    { id: 'notifications', name: 'Notifications', icon: 'Bell' },
    { id: 'privacy', name: 'Privacy', icon: 'Lock' },
    { id: 'hives', name: 'Hive Settings', icon: 'Layers' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'account', name: 'Account', icon: 'Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
              <div className="space-y-4">
                <Input
                  label="Username"
                  value={profileData?.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e?.target?.value })}
                  required
                />
                <Input
                  label="Email"
                  value={profileData?.email}
                  disabled
                  helperText="Contact support to change your email"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                  <textarea
                    value={profileData?.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e?.target?.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <Input
                  label="Location"
                  value={profileData?.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e?.target?.value })}
                  placeholder="City, Country"
                />
                <Input
                  label="Website"
                  value={profileData?.website_url}
                  onChange={(e) => setProfileData({ ...profileData, website_url: e?.target?.value })}
                  placeholder="https://yourwebsite.com"
                />
                <Input
                  label="GitHub"
                  value={profileData?.github_url}
                  onChange={(e) => setProfileData({ ...profileData, github_url: e?.target?.value })}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="LinkedIn"
                  value={profileData?.linkedin_url}
                  onChange={(e) => setProfileData({ ...profileData, linkedin_url: e?.target?.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(notifications)?.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground capitalize">
                      {key?.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for {key?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e?.target?.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleNotificationUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Visibility
                </label>
                <select
                  value={privacy?.profile_visibility}
                  onChange={(e) => setPrivacy({ ...privacy, profile_visibility: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="team_only">Team Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Show Email</h4>
                  <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy?.show_email}
                  onChange={(e) => setPrivacy({ ...privacy, show_email: e?.target?.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Show Activity</h4>
                  <p className="text-sm text-muted-foreground">Display your recent activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy?.show_activity}
                  onChange={(e) => setPrivacy({ ...privacy, show_activity: e?.target?.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>
            </div>
            <Button onClick={handlePrivacyUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        );

      case 'hives':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Hive Privacy Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Manage privacy settings for hives you own. Control who can view and join your hives.
            </p>

            {loadingHives ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userHives?.length === 0 ? (
              <div className="text-center py-12 bg-background rounded-lg border border-border">
                <Icon name="Layers" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">You don't own any hives yet</p>
                <p className="text-sm text-muted-foreground">Create a hive to manage its privacy settings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userHives?.map((hive) => (
                  <div key={hive?.id} className="p-4 bg-background rounded-lg border border-border hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon 
                            name={hive?.privacy === 'public' ? 'Globe' : 'Lock'} 
                            size={20} 
                            className={hive?.privacy === 'public' ? 'text-success' : 'text-orange-600'}
                          />
                          <h4 className="font-semibold text-foreground truncate">{hive?.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {hive?.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Users" size={14} />
                            {hive?.member_count || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Code" size={14} />
                            {hive?.snippet_count || 0} snippets
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <select
                          value={hive?.privacy}
                          onChange={(e) => handleHivePrivacyUpdate(hive?.id, e?.target?.value)}
                          disabled={loading}
                          className="px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-card"
                        >
                          <option value="public">🌍 Public</option>
                          <option value="private">🔒 Private</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Info" size={14} />
                        {hive?.privacy === 'public' ? (
                          <span>Anyone can view and join this hive</span>
                        ) : (
                          <span>Join requests require approval</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e?.target?.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e?.target?.value })}
                required
                helperText="Must be at least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e?.target?.value })}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Management</h3>
            
            <div className="bg-error/10 border border-error/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h4>
              <p className="text-error mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                iconName="Trash2"
              >
                Delete Account
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        {message?.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message?.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-red-800'
          }`}>
            {message?.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab?.id
                        ? 'bg-primary/10 text-primary' :'text-foreground hover:bg-background'
                    }`}
                  >
                    <Icon name={tab?.icon} size={20} />
                    <span className="font-medium">{tab?.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;