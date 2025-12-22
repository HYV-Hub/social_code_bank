import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const LeaderboardCard = ({ rank, user, score, scoreLabel, rankBadge, badges, onClick }) => {
  const { icon: RankIcon, color: rankColor, bg: rankBg } = rankBadge;

  // Mock trend data (in real app, calculate from historical data)
  const getTrendIndicator = () => {
    if (rank <= 3) return { icon: Minus, text: 'Same', color: 'text-gray-400' };
    const random = Math.random();
    if (random > 0.5) return { icon: ArrowUp, text: 'Up', color: 'text-green-500' };
    if (random < 0.3) return { icon: ArrowDown, text: 'Down', color: 'text-red-500' };
    return { icon: Minus, text: 'Same', color: 'text-gray-400' };
  };

  const trend = getTrendIndicator();
  const TrendIcon = trend?.icon;

  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer
        border-2 ${rank <= 3 ? 'border-yellow-200' : 'border-transparent'}
        hover:border-blue-300 p-6
      `}
    >
      <div className="flex items-center gap-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`
            w-16 h-16 rounded-full flex flex-col items-center justify-center
            ${rankBg} ${rank <= 3 ? 'ring-4 ring-yellow-100' : ''}
          `}>
            <RankIcon className={`w-6 h-6 ${rankColor}`} />
            <span className={`text-xs font-bold ${rankColor}`}>#{rank}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
              {user?.avatar_url ? (
                <img 
                  src={user?.avatar_url} 
                  alt={user?.username || 'User avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* Name and Username */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {user?.full_name || user?.username || 'Anonymous'}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                @{user?.username || 'unknown'}
              </p>
            </div>
          </div>

          {/* Contributor Level */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${user?.contributor_level === 'master' ? 'bg-purple-100 text-purple-700' : ''}
              ${user?.contributor_level === 'expert' ? 'bg-blue-100 text-blue-700' : ''}
              ${user?.contributor_level === 'advanced' ? 'bg-green-100 text-green-700' : ''}
              ${user?.contributor_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${user?.contributor_level === 'beginner' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              {user?.contributor_level?.toUpperCase() || 'BEGINNER'}
            </span>

            {/* Trend Indicator */}
            <div className={`flex items-center gap-1 text-xs ${trend?.color}`}>
              <TrendIcon className="w-3 h-3" />
              <span>{trend?.text}</span>
            </div>
          </div>

          {/* Achievement Badges */}
          {badges && badges?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges?.slice(0, 3)?.map((badge, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${badge?.color} text-white
                  `}
                  title={badge?.name}
                >
                  <span>{badge?.icon}</span>
                  <span className="hidden sm:inline">{badge?.name}</span>
                </div>
              ))}
              {badges?.length > 3 && (
                <div className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  +{badges?.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="flex-shrink-0 text-right">
          <div className={`
            text-3xl font-bold
            ${rank === 1 ? 'text-yellow-500' : ''}
            ${rank === 2 ? 'text-gray-400' : ''}
            ${rank === 3 ? 'text-orange-500' : ''}
            ${rank > 3 ? 'text-gray-900' : ''}
          `}>
            {score?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {scoreLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;