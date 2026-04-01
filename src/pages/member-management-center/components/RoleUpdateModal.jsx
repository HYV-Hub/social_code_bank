import React, { useState } from 'react';
import { X, Shield, Info } from 'lucide-react';

export default function RoleUpdateModal({ member, onUpdate, onClose }) {
  const [selectedRole, setSelectedRole] = useState(member?.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const roleOptions = [
    {
      value: 'user',
      label: 'Developer',
      description: 'Basic user access with ability to create snippets and collaborate',
      icon: 'User',
      color: 'gray'
    },
    {
      value: 'team_member',
      label: 'Team Member',
      description: 'Can contribute to team projects and access team resources',
      icon: 'Users',
      color: 'green'
    },
    {
      value: 'team_admin',
      label: 'Team Manager',
      description: 'Admin access to manage their designated team, add/remove team members',
      icon: 'Shield',
      color: 'blue'
    },
    {
      value: 'company_admin',
      label: 'Manager / Admin',
      description: 'Access to multiple teams, analytics, and company-wide management',
      icon: 'Crown',
      color: 'purple'
    }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (selectedRole === member?.role) {
      onClose();
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(member?.id, selectedRole);
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error?.message || 'Failed to update member role');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (color) => {
    const colors = {
      gray: 'bg-muted text-foreground border-border',
      green: 'bg-success/15 text-success border-green-300',
      blue: 'bg-primary/15 text-foreground border-blue-300',
      purple: 'bg-purple-100 text-purple-800 border-border'
    };
    return colors?.[color] || colors?.gray;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Update Member Role</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Change role for {member?.fullName || member?.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 mx-6 mt-6 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-foreground">
            <p className="font-medium mb-1">Role & Permission System</p>
            <p>
              Select the appropriate role based on the user's responsibilities. Higher roles have access to more features and management capabilities.
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {roleOptions?.map((role) => (
            <label
              key={role?.value}
              className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedRole === role?.value
                  ? 'border-blue-500 bg-primary/10 shadow-lg'
                  : 'border-border hover:border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="role"
                  value={role?.value}
                  checked={selectedRole === role?.value}
                  onChange={(e) => setSelectedRole(e?.target?.value)}
                  className="mt-1 w-5 h-5 text-primary focus:ring-ring"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(role?.color)}`}>
                      {role?.label}
                    </span>
                    {selectedRole === role?.value && (
                      <span className="text-xs text-primary font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {role?.description}
                  </p>
                </div>
              </div>
            </label>
          ))}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || selectedRole === member?.role}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Update Role</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}