import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCard = ({ stat }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:border-accent/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat?.gradient} flex items-center justify-center`}>
          <Icon name={stat?.icon} size={20} color="white" />
        </div>
        {stat?.trend && (
          <div className={`flex items-center gap-1 text-xs ${stat?.trend > 0 ? 'text-success' : 'text-error'}`}>
            <Icon name={stat?.trend > 0 ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span>{Math.abs(stat?.trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground mb-1">{stat?.value}</p>
        <p className="text-sm text-muted-foreground">{stat?.label}</p>
      </div>
    </div>
  );
};

export default StatsCard;