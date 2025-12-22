import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { hiveService } from '../../../services/hiveService';

export default function MemberRoleManager({ 
  member, 
  currentUserRole, 
  onRoleUpdate,
  onMemberRemove 
}) {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [error, setError] = useState('');

  const capabilities = hiveService?.getRoleCapabilities(currentUserRole);
  const canManageThisRole = capabilities?.canManageRoles?.includes(member?.role);
  const availableRoles = hiveService?.getAvailableRoles()?.filter(role => capabilities?.canManageRoles?.includes(role?.value));

  const handleRoleChange = async (newRole) => {
    if (newRole === member?.role) {
      setShowRolePicker(false);
      return;
    }

    try {
      setIsChangingRole(true);
      setError('');
      await onRoleUpdate(member?.user?.id, newRole);
      setShowRolePicker(false);
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err?.message || 'Failed to update role');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      setIsChangingRole(true);
      setError('');
      await onMemberRemove(member?.user?.id);
      setShowRemoveConfirm(false);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err?.message || 'Failed to remove member');
    } finally {
      setIsChangingRole(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return '👑';
      case 'admin': return '⭐';
      case 'editor': return '✏️';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'from-purple-500 to-indigo-500';
      case 'admin': return 'from-blue-500 to-cyan-500';
      case 'editor': return 'from-green-500 to-emerald-500';
      case 'viewer': return 'from-purple-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Current Role Badge */}
      <button
        onClick={() => canManageThisRole && setShowRolePicker(!showRolePicker)}
        disabled={!canManageThisRole}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
          member?.role === 'owner' ?'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md cursor-not-allowed'
            : canManageThisRole
            ? `bg-gradient-to-r ${getRoleColor(member?.role)} text-white shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer`
            : 'bg-gray-100 text-gray-700 cursor-not-allowed'
        }`}
        title={canManageThisRole ? 'Click to change role' : 'Cannot manage this role'}
      >
        {getRoleIcon(member?.role)} {member?.role}
        {canManageThisRole && (
          <Icon name="ChevronDown" size={14} className="inline-block ml-1" />
        )}
      </button>
      {/* Role Picker Dropdown */}
      {showRolePicker && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-2 min-w-[280px]">
          <div className="mb-2 px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Change Role</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Select new role for {member?.user?.username}
            </p>
          </div>
          
          <div className="space-y-1">
            {availableRoles?.map((role) => (
              <button
                key={role?.value}
                onClick={() => handleRoleChange(role?.value)}
                disabled={isChangingRole || role?.value === member?.role}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                  role?.value === member?.role
                    ? 'bg-purple-50 border-2 border-purple-300 cursor-not-allowed' :'hover:bg-gray-50 border-2 border-transparent hover:border-purple-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{role?.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {role?.label}
                      {role?.value === member?.role && (
                        <span className="ml-2 text-xs text-purple-600">(Current)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {role?.description}
                    </p>
                  </div>
                  {role?.value === member?.role && (
                    <Icon name="Check" size={16} className="text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={() => setShowRolePicker(false)}
            className="w-full mt-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {/* Remove Member Button (Owner Only) */}
      {capabilities?.canRemoveMembers && member?.role !== 'owner' && (
        <>
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove member"
          >
            <Icon name="Trash2" size={16} />
          </button>

          {/* Remove Confirmation Modal */}
          {showRemoveConfirm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Remove Member?
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Are you sure you want to remove <strong>{member?.user?.username}</strong> from this hive?
                      They will lose access to all hive content and collections.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRemoveConfirm(false)}
                    disabled={isChangingRole}
                    className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveMember}
                    disabled={isChangingRole}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    {isChangingRole ? (
                      <>
                        <Icon name="Loader" size={16} className="mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Remove Member
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}