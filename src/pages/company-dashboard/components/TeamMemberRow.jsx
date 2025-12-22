import React from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const TeamMemberRow = ({ member, onViewProfile, onManageRole }) => {
  const getRoleBadgeColor = (role) => {
    const colors = {
      "Company Owner": "bg-primary/10 text-primary border-primary/20",
      "Company Admin": "bg-accent/10 text-accent border-accent/20",
      "Team Lead": "bg-warning/10 text-warning border-warning/20",
      "Team Member": "bg-secondary/10 text-secondary border-secondary/20",
      "Read-only Member": "bg-muted text-muted-foreground border-border"
    };
    return colors?.[role] || colors?.["Team Member"];
  };

  const getActivityColor = (status) => {
    return status === "Active" ? "text-success" : "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <Image
          src={member?.avatar}
          alt={member?.avatarAlt}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{member?.name}</h4>
            {member?.isOnline && (
              <div className="w-2 h-2 rounded-full bg-success" title="Online" />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{member?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-bold text-foreground">{member?.snippets}</p>
          <p className="text-xs text-muted-foreground">Snippets</p>
        </div>
        
        <div className="text-center min-w-[80px]">
          <p className="text-2xl font-bold text-foreground">{member?.bugsFixes}</p>
          <p className="text-xs text-muted-foreground">Bug Fixes</p>
        </div>

        <div className="min-w-[140px]">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member?.role)}`}>
            {member?.role}
          </span>
        </div>

        <div className="min-w-[100px]">
          <div className="flex items-center gap-1">
            <Icon name="Clock" size={14} className={getActivityColor(member?.activityStatus)} />
            <span className={`text-sm ${getActivityColor(member?.activityStatus)}`}>
              {member?.lastActive}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile(member?.id)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View Profile"
          >
            <Icon name="Eye" size={18} color="var(--color-muted-foreground)" />
          </button>
          <button
            onClick={() => onManageRole(member?.id)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Manage Role"
          >
            <Icon name="Settings" size={18} color="var(--color-muted-foreground)" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberRow;