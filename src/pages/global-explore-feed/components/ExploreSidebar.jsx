import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

export default function ExploreSidebar({ trendingTags = [], topContributors = [], stats = {}, onTagClick }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Platform Stats */}
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-foreground">{(stats?.totalSnippets || 0).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Snippets</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats?.newToday || 0}</p>
            <p className="text-[10px] text-muted-foreground">New Today</p>
          </div>
        </div>
      </div>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="hyv-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Icon name="TrendingUp" size={12} /> Trending Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="hyv-tag text-[10px] hover:ring-1 hover:ring-primary/50 transition-all"
              >
                {tag} <span className="opacity-50 ml-0.5">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {topContributors.length > 0 && (
        <div className="hyv-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Icon name="Award" size={12} /> Top Contributors
          </h3>
          <div className="space-y-2.5">
            {topContributors.map((user, i) => (
              <button
                key={user?.id || i}
                onClick={() => navigate(`/user-profile/${user?.id}`)}
                className="flex items-center gap-2.5 w-full text-left hover:bg-white/5 rounded-md p-1.5 -m-1.5 transition-colors"
              >
                <span className="text-[10px] font-bold text-muted-foreground w-3">{i + 1}</span>
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=8b5cf6&color=fff&size=28`}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.full_name || user?.username}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.snippet_count} snippets</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
