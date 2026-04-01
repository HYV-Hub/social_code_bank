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
      case 'owner': return 'bg-primary';
      case 'admin': return 'bg-accent';
      case 'editor': return 'bg-success';
      case 'viewer': return 'bg-primary/60';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Current Role Badge */}
      <button
        onClick={() => canManageThisRole && setShowRolePicker(!showRolePicker)}
        disabled={!canManageThisRole}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
          member?.role === 'owner' ?'bg-primary text-white shadow-md cursor-not-allowed'
            : canManageThisRole
            ? `${getRoleColor(member?.role)} text-white shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer`
            : 'bg-muted text-foreground cursor-not-allowed'
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
        <div className="absolute z-50 mt-2 bg-card rounded-xl shadow-2xl border-2 border-border p-2 min-w-[280px]">
          <div className="mb-2 px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Change Role</p>
            <p className="text-xs text-muted-foreground mt-0.5">
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
                    ? 'bg-primary/10 border-2 border-border cursor-not-allowed' :'hover:bg-background border-2 border-transparent hover:border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{role?.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      {role?.label}
                      {role?.value === member?.role && (
                        <span className="ml-2 text-xs text-primary">(Current)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {role?.description}
                    </p>
                  </div>
                  {role?.value === member?.role && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-2 px-3 py-2 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          <button
            onClick={() => setShowRolePicker(false)}
            className="w-full mt-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
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
            className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Remove member"
          >
            <Icon name="Trash2" size={16} />
          </button>

          {/* Remove Confirmation Modal */}
          {showRemoveConfirm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center flex-shrink-0">
                    <Icon name="AlertTriangle" size={24} className="text-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Remove Member?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Are you sure you want to remove <strong>{member?.user?.username}</strong> from this hive?
                      They will lose access to all hive content and collections.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRemoveConfirm(false)}
                    disabled={isChangingRole}
                    className="flex-1 bg-muted text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveMember}
                    disabled={isChangingRole}
                    className="flex-1 bg-error text-white hover:bg-error"
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