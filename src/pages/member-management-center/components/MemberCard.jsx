import React, { useState } from 'react';
import { User, Mail, Shield, Activity, MoreVertical, Check, X, Users } from 'lucide-react';

export default function MemberCard({
  member,
  teams,
  isSelected,
  onSelect,
  onUpdateRole,
  onUpdateTeam,
  onDeactivate,
  onReactivate,
  onRemove,
  currentUserId
}) {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'company_admin':
        return 'bg-primary/10 text-primary';
      case 'team_admin':
        return 'bg-primary/15 text-foreground';
      case 'team_member':
        return 'bg-success/15 text-success';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'company_admin':
        return 'Manager / Admin';
      case 'team_admin':
        return 'Team Manager';
      case 'team_member':
        return 'Team Member';
      case 'user':
        return 'Developer';
      default:
        return 'User';
    }
  };

  const getContributorBadge = (level) => {
    const badges = {
      beginner: { color: 'bg-muted text-foreground', label: 'Beginner' },
      intermediate: { color: 'bg-primary/15 text-primary', label: 'Intermediate' },
      advanced: { color: 'bg-success/15 text-success', label: 'Advanced' },
      expert: { color: 'bg-primary/10 text-primary', label: 'Expert' },
      master: { color: 'bg-warning/15 text-warning', label: 'Master' }
    };
    return badges?.[level] || badges?.beginner;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const isCurrentUser = member?.id === currentUserId;
  const contributorBadge = getContributorBadge(member?.contributorLevel);
  const teamName = teams?.find(t => t?.id === member?.teamId)?.name || 'No Team';

  return (
    <div className={`bg-card rounded-lg shadow-md hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${!member?.isActive ? 'opacity-60' : ''}`}>
      {/* Card Header with Selection */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(member?.id)}
              disabled={isCurrentUser}
              className="mt-1 w-5 h-5 text-muted-foreground rounded focus:ring-primary disabled:opacity-50"
            />
            
            <div className="flex-1">
              {/* Avatar and Name */}
              <div className="flex items-center gap-3 mb-2">
                {member?.avatarUrl ? (
                  <img
                    src={member?.avatarUrl}
                    alt={member?.fullName || member?.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {member?.fullName || member?.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{member?.username}</p>
                </div>
              </div>

              {/* Status and Role Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member?.role)}`}>
                  {getRoleLabel(member?.role)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${contributorBadge?.color}`}>
                  {contributorBadge?.label}
                </span>
                {!member?.isActive && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-error/15 text-error">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {!isCurrentUser && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>

              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-xl border border-border py-2 z-20">
                    <button
                      onClick={() => {
                        onUpdateRole();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Change Role
                    </button>
                    
                    {member?.isActive ? (
                      <button
                        onClick={() => {
                          onDeactivate(member?.id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-warning hover:bg-warning/10 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onReactivate(member?.id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-success hover:bg-success/10 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Reactivate
                      </button>
                    )}
                    
                    <div className="border-t border-border my-2" />
                    
                    <button
                      onClick={() => {
                        onRemove(member?.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove from Company
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{teamName}</span>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{member?.snippetsCount || 0}</div>
            <div className="text-xs text-muted-foreground">Snippets</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">{member?.bugsFixedCount || 0}</div>
            <div className="text-xs text-muted-foreground">Bugs Fixed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {formatDate(member?.lastLoginAt)}
            </div>
            <div className="text-xs text-muted-foreground">Last Active</div>
          </div>
        </div>

        {/* Team Assignment */}
        {!isCurrentUser && (
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Team Assignment
            </label>
            <select
              value={member?.teamId || ''}
              onChange={(e) => onUpdateTeam(member?.id, e?.target?.value || null)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="">No Team</option>
              {teams?.map(team => (
                <option key={team?.id} value={team?.id}>
                  {team?.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}