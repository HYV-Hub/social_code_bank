import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementBadge = ({ achievement }) => {
  const getBadgeColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return 'from-warning to-warning/60';
      case 'epic': return 'from-primary to-error/60';
      case 'rare': return 'from-primary to-accent';
      case 'common': return 'from-muted-foreground to-muted-foreground/60';
      default: return 'from-muted-foreground to-muted-foreground/60';
    }
  };

  return (
    <div className="group relative">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor(achievement?.rarity)} p-0.5 cursor-pointer transform hover:scale-110 transition-transform`}>
        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
          <Icon name={achievement?.icon} size={28} color="var(--color-foreground)" />
        </div>
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <p className="text-xs font-semibold text-foreground mb-1">{achievement?.title}</p>
        <p className="text-xs text-muted-foreground">{achievement?.description}</p>
        <p className="text-xs text-muted-foreground mt-1">Earned: {achievement?.earnedDate}</p>
      </div>
    </div>
  );
};

export default AchievementBadge;