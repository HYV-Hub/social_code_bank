import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function HiveSettings({ hive, onUpdate, userRole }) {
  const [name, setName] = useState(hive?.name || '');
  const [description, setDescription] = useState(hive?.description || '');
  const [privacy, setPrivacy] = useState(hive?.privacy || 'public');
  const [tags, setTags] = useState(hive?.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Success</p>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Basic Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hive Name <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e?.target?.value)}
              placeholder="Describe your hive..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e?.target?.value)}
              placeholder="javascript, react, webdev"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !name || !description}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Danger Zone - Owner Only */}
      {isOwner && (
        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} />
            Danger Zone
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Transfer Ownership</h4>
              <p className="text-sm text-gray-600 mb-3">
                Transfer ownership of this hive to another admin. This action cannot be undone.
              </p>
              <Button variant="ghost" className="text-orange-600 hover:bg-orange-50">
                Transfer Ownership
              </Button>
            </div>

            <div className="pt-4 border-t border-red-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Delete Hive</h4>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete this hive and all its content. This action cannot be undone.
              </p>
              <Button variant="ghost" className="text-red-600 hover:bg-red-50">
                Delete Hive
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Hive - Non-owners */}
      {!isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Hive</h3>
          <p className="text-sm text-gray-600 mb-4">
            Leave this hive. You can rejoin later if it's public or request to join again if it's private.
          </p>
          <Button variant="ghost" className="text-red-600 hover:bg-red-50">
            Leave Hive
          </Button>
        </div>
      )}
    </div>
  );
}