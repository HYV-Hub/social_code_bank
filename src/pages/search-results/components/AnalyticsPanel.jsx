import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import { exploreService } from '../../../services/exploreService';

const AnalyticsPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentFollowersPosts, setRecentFollowersPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [followers, trending, analytics] = await Promise.all([
        exploreService?.getRecentFollowersPosts(user?.id, 10),
        exploreService?.getTrendingPosts({ timeRange: selectedTimeRange, limit: 10 }),
        exploreService?.getUserActivityAnalytics(user?.id)
      ]);

      setRecentFollowersPosts(followers);
      setTrendingPosts(trending);
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'K';
    }
    return num?.toString();
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* User Analytics Summary */}
      {userAnalytics && (
        <div className="bg-muted rounded-lg shadow-sm p-4 sm:p-6 border border-primary/20">
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-primary flex-shrink-0" />
            <span className="truncate">Your Activity</span>
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="bg-card rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Code" size={14} className="text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">Total Snippets</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatNumber(userAnalytics?.totalSnippets)}</p>
              <p className="text-xs text-success mt-1">+{userAnalytics?.recentSnippets} this week</p>
            </div>
            <div className="bg-card rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Users" size={14} className="text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">Followers</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatNumber(userAnalytics?.totalFollowers)}</p>
            </div>
            <div className="bg-card rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="UserCheck" size={14} className="text-secondary flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">Following</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatNumber(userAnalytics?.totalFollowing)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Followers Posts */}
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Icon name="Users" size={18} className="text-primary flex-shrink-0" />
          <span className="truncate">Recent from People You Follow</span>
        </h3>
        {recentFollowersPosts?.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Icon name="Users" size={40} className="mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">No recent posts from people you follow</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Follow users to see their latest posts here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentFollowersPosts?.map((post) => (
              <div key={post?.id} className="border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    {post?.author?.avatar_url ? (
                      <img src={post?.author?.avatar_url} alt={post?.author?.full_name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {post?.author?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{post?.author?.full_name || post?.author?.username}</p>
                    <p className="text-xs text-muted-foreground mb-1 sm:mb-2">{new Date(post?.created_at)?.toLocaleDateString()}</p>
                    <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{post?.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">{post?.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Heart" size={12} className="flex-shrink-0" />
                        <span>{post?.likes_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MessageCircle" size={12} className="flex-shrink-0" />
                        <span>{post?.comments_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Eye" size={12} className="flex-shrink-0" />
                        <span>{post?.views_count}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Posts */}
      <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="TrendingUp" size={18} className="text-error flex-shrink-0" />
            <span className="truncate">Trending Posts</span>
          </h3>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e?.target?.value)}
            className="text-xs sm:text-sm border border-border rounded-lg px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-ring focus:border-primary w-full sm:w-auto"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        {trendingPosts?.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Icon name="TrendingUp" size={40} className="mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">No trending posts available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingPosts?.map((post, index) => (
              <div key={post?.id} className="border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-error to-warning flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-sm">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1 break-words">{post?.title}</h4>
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary rounded w-fit">
                        {post?.language}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 break-words">{post?.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Heart" size={12} className="text-error flex-shrink-0" />
                        <span>{post?.likes_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MessageCircle" size={12} className="text-primary flex-shrink-0" />
                        <span>{post?.comments_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Eye" size={12} className="text-muted-foreground flex-shrink-0" />
                        <span>{post?.views_count}</span>
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(post?.created_at)?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;