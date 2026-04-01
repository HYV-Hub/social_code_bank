import React, { useState, useEffect } from 'react';
import { teamService } from '../../../services/teamService';
import Icon from '../../../components/AppIcon';

export default function TeamCard({ team, onClick, onUpdate }) {
  const [membersCount, setMembersCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamDetails();
  }, [team?.id]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const [count, activity] = await Promise.all([
        teamService?.getTeamMembersCount(team?.id),
        teamService?.getTeamActivity(team?.id, 3)
      ]);
      setMembersCount(count);
      setRecentActivity(activity);
    } catch (err) {
      console.error('Error loading team details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-xl border border-border hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {team?.name}
            </h3>
            {team?.company && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icon name="Building2" size={14} />
                <span>{team?.company?.name}</span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
            <Icon name="Users" size={20} />
          </div>
        </div>

        {team?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team?.description}
          </p>
        )}
      </div>
      {/* Stats */}
      <div className="px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="font-medium text-foreground">
              {loading ? '...' : membersCount}
            </span>
            <span className="text-muted-foreground">
              {membersCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          {team?.creator && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Created by</span>
              <span className="font-medium text-foreground">
                {team?.creator?.username || team?.creator?.fullName}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Recent Activity</h4>
          <Icon name="Activity" size={16} className="text-muted-foreground" />
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3]?.map(i => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : recentActivity?.length > 0 ? (
          <div className="space-y-2">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Icon name="FileCode" size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{activity?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity?.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">No recent activity</p>
        )}
      </div>
      {/* Footer */}
      <div className="px-6 py-4 bg-background flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Updated {formatDate(team?.updatedAt)}
        </span>
        <div className="flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
          <span>View Team</span>
          <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}