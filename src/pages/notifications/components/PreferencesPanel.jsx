import React, { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';

export function PreferencesPanel({ isOpen, onClose }) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService?.getPreferences();
      // If no preferences exist, initialize with defaults
      if (!prefs) {
        setPreferences({
          emailComments: true,
          emailLikes: true,
          emailFollows: true,
          emailMentions: true,
          emailBugAssignments: true,
          emailTeamUpdates: true,
          inAppComments: true,
          inAppLikes: true,
          inAppFollows: true,
          inAppMentions: true,
          inAppBugAssignments: true,
          inAppTeamUpdates: true,
          pushComments: true,
          pushLikes: false,
          pushFollows: true,
          pushMentions: true,
          pushBugAssignments: true,
          pushTeamUpdates: true
        });
      } else {
        setPreferences(prefs);
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await notificationService?.updatePreferences(preferences);
      onClose();
    } catch (err) {
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading preferences...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-error">{error}</p>
              <button
                onClick={loadPreferences}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
              >
                Retry
              </button>
            </div>
          ) : preferences ? (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'emailComments', label: 'Comments on your snippets' },
                    { key: 'emailLikes', label: 'Likes on your content' },
                    { key: 'emailFollows', label: 'New followers' },
                    { key: 'emailMentions', label: 'Mentions in comments' },
                    { key: 'emailBugAssignments', label: 'Bug assignments' },
                    { key: 'emailTeamUpdates', label: 'Team updates and announcements' }
                  ]?.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.[key] || false}
                        onChange={(e) => updatePreference(key, e?.target?.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Push Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'pushComments', label: 'Comments on your snippets' },
                    { key: 'pushLikes', label: 'Likes on your content' },
                    { key: 'pushFollows', label: 'New followers' },
                    { key: 'pushMentions', label: 'Mentions in comments' },
                    { key: 'pushBugAssignments', label: 'Bug assignments' },
                    { key: 'pushTeamUpdates', label: 'Team updates and announcements' }
                  ]?.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.[key] || false}
                        onChange={(e) => updatePreference(key, e?.target?.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In-App Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">In-App Notifications</h3>
                <div className="space-y-3">
                  {[
                    { key: 'inAppComments', label: 'Comments on your snippets' },
                    { key: 'inAppLikes', label: 'Likes on your content' },
                    { key: 'inAppFollows', label: 'New followers' },
                    { key: 'inAppMentions', label: 'Mentions in comments' },
                    { key: 'inAppBugAssignments', label: 'Bug assignments' },
                    { key: 'inAppTeamUpdates', label: 'Team updates and announcements' }
                  ]?.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences?.[key] || false}
                        onChange={(e) => updatePreference(key, e?.target?.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
