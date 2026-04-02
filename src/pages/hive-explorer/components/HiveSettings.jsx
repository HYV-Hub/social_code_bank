import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { hiveService } from '../../../services/hiveService';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function HiveSettings({ hive, onUpdate, userRole }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState(hive?.name || '');
  const [description, setDescription] = useState(hive?.description || '');
  const [privacy, setPrivacy] = useState(hive?.privacy || 'public');
  const [tags, setTags] = useState(hive?.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const tagsArray = tags
        ?.split(',')
        ?.map(t => t?.trim())
        ?.filter(t => t?.length > 0);

      await onUpdate({
        name,
        description,
        privacy,
        tags: tagsArray
      });

      setSuccess('Settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = userRole === 'owner';

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Error</p>
            <p className="text-sm text-error mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-success">Success</p>
            <p className="text-sm text-success mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Basic Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hive Name <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e?.target?.value)}
              placeholder="Enter hive name"
              disabled={!isOwner}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e?.target?.value)}
              placeholder="Describe your hive..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Privacy <span className="text-error">*</span>
            </label>
            <Select
              value={privacy}
              onChange={(e) => setPrivacy(e?.target?.value)}
              disabled={!isOwner}
            >
              <option value="public">🌍 Public - Anyone can join</option>
              <option value="private">🔒 Private - Approval required</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e?.target?.value)}
              placeholder="javascript, react, webdev"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !name || !description}
            className="w-full bg-primary hover:bg-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Danger Zone - Owner Only */}
      {isOwner && (
        <div className="bg-card rounded-xl border-2 border-error/20 p-6">
          <h3 className="text-lg font-semibold text-error mb-4 flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} />
            Danger Zone
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Transfer Ownership</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Transfer ownership of this hive to another admin. This action cannot be undone.
              </p>
              {showTransfer ? (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter new owner's user ID"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e?.target?.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="text-warning hover:bg-warning/10"
                      disabled={!transferTarget?.trim()}
                      onClick={async () => {
                        try {
                          setError('');
                          await hiveService?.updateMemberRole(hive?.id, transferTarget?.trim(), 'owner');
                          await hiveService?.updateMemberRole(hive?.id, user?.id, 'admin');
                          setSuccess('Ownership transferred successfully.');
                          setShowTransfer(false);
                          onUpdate?.();
                        } catch (err) {
                          setError(err?.message || 'Failed to transfer ownership');
                        }
                      }}
                    >
                      Confirm Transfer
                    </Button>
                    <Button variant="ghost" onClick={() => setShowTransfer(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" className="text-warning hover:bg-warning/10" onClick={() => setShowTransfer(true)}>
                  Transfer Ownership
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-error/20">
              <h4 className="text-sm font-semibold text-foreground mb-2">Delete Hive</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete this hive and all its content. This action cannot be undone.
              </p>
              {confirmDelete ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-error hover:bg-error/10"
                    onClick={async () => {
                      try {
                        setError('');
                        const { error: delErr } = await supabase?.from('hives')?.delete()?.eq('id', hive?.id);
                        if (delErr) throw delErr;
                        navigate('/hives');
                      } catch (err) {
                        setError(err?.message || 'Failed to delete hive');
                        setConfirmDelete(false);
                      }
                    }}
                  >
                    Yes, Delete Permanently
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="text-error hover:bg-error/10" onClick={() => setConfirmDelete(true)}>
                  Delete Hive
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave Hive - Non-owners */}
      {!isOwner && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Leave Hive</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Leave this hive. You can rejoin later if it's public or request to join again if it's private.
          </p>
          <Button
            variant="ghost"
            className="text-error hover:bg-error/10"
            onClick={async () => {
              if (!window.confirm('Are you sure you want to leave this hive?')) return;
              try {
                setError('');
                await hiveService?.removeMember(hive?.id, user?.id);
                navigate('/hives');
              } catch (err) {
                setError(err?.message || 'Failed to leave hive');
              }
            }}
          >
            Leave Hive
          </Button>
        </div>
      )}
    </div>
  );
}