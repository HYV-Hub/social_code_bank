import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementBadge = ({ achievement }) => {
  const getBadgeColor = (level) => {
    const colorMap = {
      bronze: 'from-warning/80 to-warning/50',
      silver: 'from-muted-foreground to-muted',
      gold: 'from-warning to-warning/60',
      platinum: 'from-accent to-primary'
    };
    return colorMap?.[level] || 'from-primary to-accent';
  };

  return (
    <div className="group relative">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getBadgeColor(achievement?.level)} p-1 cursor-pointer transition-transform hover:scale-110`}>
        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
          <Icon name={achievement?.icon} size={32} className="text-foreground" />
        </div>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap">
          <p className="font-medium text-sm">{achievement?.title}</p>
          <p className="text-xs text-muted-foreground">{achievement?.description}</p>
          <p className="text-xs text-accent mt-1">Earned: {achievement?.earnedDate}</p>
        </div>
        <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
      </div>
    </div>
  );
};

export default AchievementBadge;