import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Award, Users, Code, Bug, Star, Medal, Crown, Zap } from 'lucide-react';
import leaderboardService from '../../services/leaderboardService';
import LeaderboardCard from './components/LeaderboardCard';
import TimeFilterTabs from './components/TimeFilterTabs';
import CategoryTabs from './components/CategoryTabs';
import AchievementShowcase from './components/AchievementShowcase';

const CommunityLeaderboards = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('snippets');
  const [timeWindow, setTimeWindow] = useState('all-time');
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);

  // Category configurations
  const categories = [
    { id: 'snippets', label: 'Top Snippet Creators', icon: Code, color: 'bg-primary' },
    { id: 'bugs', label: 'Bug Fix Champions', icon: Bug, color: 'bg-error/100' },
    { id: 'helpful', label: 'Most Helpful', icon: Star, color: 'bg-warning/100' },
    { id: 'mentors', label: 'Community Mentors', icon: Users, color: 'bg-success/100' }
  ];

  const timeWindows = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all-time', label: 'All Time' }
  ];

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboardData();
  }, [activeCategory, timeWindow]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data = [];
      switch (activeCategory) {
        case 'snippets':
          data = await leaderboardService?.getTopSnippetCreators(20, timeWindow);
          break;
        case 'bugs':
          data = await leaderboardService?.getBugFixChampions(20, timeWindow);
          break;
        case 'helpful':
          data = await leaderboardService?.getMostHelpfulContributors(20, timeWindow);
          break;
        case 'mentors':
          data = await leaderboardService?.getCommunityMentors(20);
          break;
        default:
          data = [];
      }

      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err?.message || 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get score based on category
  const getScore = (user) => {
    switch (activeCategory) {
      case 'snippets':
        return user?.snippets_count || 0;
      case 'bugs':
        return user?.bugs_fixed_count || 0;
      case 'helpful':
        return user?.points || 0;
      case 'mentors':
        return user?.followers_count || 0;
      default:
        return 0;
    }
  };

  // Get score label
  const getScoreLabel = () => {
    switch (activeCategory) {
      case 'snippets':
        return 'Snippets';
      case 'bugs':
        return 'Bugs Fixed';
      case 'helpful':
        return 'Points';
      case 'mentors':
        return 'Followers';
      default:
        return 'Score';
    }
  };

  // Get rank badge
  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-warning', bg: 'bg-warning/10' };
    if (rank === 2) return { icon: Medal, color: 'text-muted-foreground', bg: 'bg-background' };
    if (rank === 3) return { icon: Award, color: 'text-warning', bg: 'bg-warning/10' };
    return { icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' };
  };

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  return (
    <>
      <Helmet>
        <title>Community Leaderboards | Social Code Bank</title>
        <meta 
          name="description" 
          content="View top contributors, trending creators, bug fix champions, and community mentors. Track achievements and compete in the Social Code Bank leaderboard." 
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-card/20 rounded-full backdrop-blur-sm mb-6">
                <Trophy className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Community Leaderboards
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Celebrate our top contributors, bug fix champions, and community mentors. 
                Track your progress and climb the ranks!
              </p>
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Code className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{leaderboardData?.length || 0}</div>
                <div className="text-sm text-blue-100">Active Contributors</div>
              </div>
              <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {leaderboardData?.[0] ? getScore(leaderboardData?.[0]) : 0}
                </div>
                <div className="text-sm text-blue-100">Top Score</div>
              </div>
              <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {categories?.length}
                </div>
                <div className="text-sm text-blue-100">Categories</div>
              </div>
              <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">Live</div>
                <div className="text-sm text-blue-100">Updated Daily</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Time Window Filter */}
          <TimeFilterTabs
            timeWindows={timeWindows}
            activeWindow={timeWindow}
            onWindowChange={setTimeWindow}
          />

          {/* Error State */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error/15 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Error Loading Leaderboard</h3>
                  <p className="text-sm text-error">{error}</p>
                </div>
                <button onClick={() => { setError(null); fetchLeaderboardData(); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5]?.map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                    <div className="h-8 w-20 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboardData?.length > 0 ? (
            <div className="space-y-4">
              {leaderboardData?.map((user, index) => {
                const rank = index + 1;
                const rankBadge = getRankBadge(rank);
                const score = getScore(user);
                const badges = leaderboardService?.getAchievementBadges(user);

                return (
                  <LeaderboardCard
                    key={user?.id || index}
                    rank={rank}
                    user={user}
                    score={score}
                    scoreLabel={getScoreLabel()}
                    rankBadge={rankBadge}
                    badges={badges}
                    onClick={() => handleUserClick(user?.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                No contributors found for this category and time period.
              </p>
            </div>
          )}

          {/* Achievement Showcase */}
          <AchievementShowcase />
        </div>
      </div>
    </>
  );
};

export default CommunityLeaderboards;