import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

import ActivityItem from './components/ActivityItem';
import UserCard from './components/UserCard';
import AchievementBadge from './components/AchievementBadge';
import StatsCard from './components/StatsCard';
import AppNavigation from '../../components/AppNavigation';
import friendRequestService from '../../services/friendRequestService';


const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('snippets');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for dynamic data
  const [userData, setUserData] = useState(null);
  const [snippetsData, setSnippetsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [achievementsData, setAchievementsData] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // NEW: State for follow status and loading
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // New state for visibility filtering - DEFAULT TO PUBLIC ONLY
  const [visibilityFilter, setVisibilityFilter] = useState('public');
  const [filteredSnippets, setFilteredSnippets] = useState([]);

  // Fix: Properly determine if viewing own profile
  const isOwnProfile = !userId || userId === user?.id;

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' }
  ];

  // Visibility filter tabs
  const visibilityTabs = [
    { id: 'all', label: 'All Snippets', icon: 'Grid' },
    { id: 'public', label: 'Public', icon: 'Globe' },
    { id: 'private', label: 'Private', icon: 'Lock' },
    { id: 'team', label: 'Team', icon: 'Users' },
    { id: 'company', label: 'Company', icon: 'Building' }
  ];

  // Load user profile from database
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setAuthLoading(false);
        return;
      }

      try {
        setAuthLoading(true);
        const { data, error: profileError } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId || user?.id)
          ?.single();

        if (profileError) throw profileError;

        setUserProfile(data);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err?.message || 'Failed to load user profile');
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserProfile();
  }, [user, userId]);

  // NEW: Check if current user is following the profile user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !userId || isOwnProfile) return;

      try {
        const { data, error: followError } = await supabase
          ?.from('follows')
          ?.select('id')
          ?.eq('follower_id', user?.id)
          ?.eq('following_id', userId)
          ?.single();

        if (followError && followError?.code !== 'PGRST116') {
          console.error('Error checking follow status:', followError);
          return;
        }

        setIsFollowing(!!data);
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    };

    checkFollowStatus();
  }, [user, userId, isOwnProfile]);

  // Check friend request status
  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!user || !userId || user?.id === userId) return;

      try {
        const status = await friendRequestService?.checkFriendRequestStatus(userId);
        setFriendRequestStatus(status);
      } catch (err) {
        console.error('Error checking friend status:', err);
      }
    };

    checkFriendStatus();
  }, [user, userId]);

  const handleSendFriendRequest = async () => {
    try {
      await friendRequestService?.sendFriendRequest(userId);
      setFriendRequestStatus({ status: 'pending', sender_id: user?.id });
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert(err?.message || 'Failed to send friend request');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!friendRequestStatus?.id) return;

    try {
      await friendRequestService?.cancelFriendRequest(friendRequestStatus?.id);
      setFriendRequestStatus(null);
    } catch (err) {
      console.error('Error canceling friend request:', err);
      alert(err?.message || 'Failed to cancel friend request');
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendRequestStatus?.id) return;

    try {
      await friendRequestService?.acceptFriendRequest(friendRequestStatus?.id);
      setFriendRequestStatus({ ...friendRequestStatus, status: 'accepted' });
    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert(err?.message || 'Failed to accept friend request');
    }
  };

  const renderFriendButton = () => {
    // Don't show friend button on own profile
    if (!user || isOwnProfile) return null;

    if (!friendRequestStatus) {
      return (
        <button
          onClick={handleSendFriendRequest}
          className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary">
          <Icon name="UserPlus" size={20} />
          <span>Add Friend</span>
        </button>
      );
    }

    if (friendRequestStatus?.status === 'pending') {
      if (friendRequestStatus?.sender_id === user?.id) {
        return (
          <button
            onClick={handleCancelFriendRequest}
            className="flex items-center space-x-2 px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400">
            <Icon name="X" size={20} />
            <span>Cancel Request</span>
          </button>
        );
      } else {
        return (
          <button
            onClick={handleAcceptFriendRequest}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Icon name="Check" size={20} />
            <span>Accept Request</span>
          </button>
        );
      }
    }

    if (friendRequestStatus?.status === 'accepted') {
      return (
        <button
          disabled
          className="flex items-center space-x-2 px-6 py-2 bg-success/15 text-success rounded-lg cursor-not-allowed">
          <Icon name="Check" size={20} />
          <span>Friends</span>
        </button>
      );
    }

    return null;
  };

  // UPDATED: Implement actual follow/unfollow functionality
  const handleFollow = async () => {
    if (!user || !userId || isOwnProfile || followLoading) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        // Unfollow: Delete the follow relationship
        const { error: unfollowError } = await supabase
          ?.from('follows')
          ?.delete()
          ?.eq('follower_id', user?.id)
          ?.eq('following_id', userId);

        if (unfollowError) throw unfollowError;

        setIsFollowing(false);

        // Update follower/following counts locally
        setUserData(prev => prev ? {
          ...prev,
          followersCount: Math.max(0, (prev?.followersCount || 0) - 1)
        } : prev);

      } else {
        // Follow: Create a new follow relationship
        const { error: followError } = await supabase
          ?.from('follows')
          ?.insert({
            follower_id: user?.id,
            following_id: userId
          });

        if (followError) throw followError;

        setIsFollowing(true);

        // Update follower/following counts locally
        setUserData(prev => prev ? {
          ...prev,
          followersCount: (prev?.followersCount || 0) + 1
        } : prev);
      }

      // Optionally show success message
      console.log(isFollowing ? '✅ Unfollowed successfully' : '✅ Followed successfully');

    } catch (err) {
      console.error('Error toggling follow:', err);
      alert(err?.message || 'Failed to update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Load user profile data - UPDATE ANALYTICS CALCULATION
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !userProfile) return;

      try {
        setIsLoading(true);
        setError('');

        // Transform userProfile to match component format
        const transformedUserData = {
          id: userProfile?.id,
          name: userProfile?.full_name || 'Anonymous User',
          username: userProfile?.username || user?.email?.split('@')?.[0],
          avatar: userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'User')}&background=random`,
          avatarAlt: `Profile picture of ${userProfile?.full_name || 'User'}`,
          role: userProfile?.role || 'user',
          bio: userProfile?.bio || 'No bio yet',
          joinedDate: new Date(userProfile?.created_at)?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          isVerified: userProfile?.email_verified || false,
          isFollowing: false,
          snippetsCount: userProfile?.snippets_count || 0,
          followersCount: userProfile?.followers_count || 0,
          followingCount: userProfile?.following_count || 0,
          contributionScore: userProfile?.points || 0,
        };

        setUserData(transformedUserData);

        // UPDATED: Calculate total views and likes from actual snippet data
        const { data: userSnippets, error: snippetsError } = await supabase
          ?.from('snippets')
          ?.select('views_count, likes_count')
          ?.eq('user_id', userId || user?.id);

        if (snippetsError) throw snippetsError;

        const totalViews = (userSnippets || [])?.reduce((sum, snippet) => sum + (snippet?.views_count || 0), 0);
        const totalLikes = (userSnippets || [])?.reduce((sum, snippet) => sum + (snippet?.likes_count || 0), 0);

        // Load stats with calculated analytics
        setStatsData([
          {
            icon: "Code",
            label: "Total Snippets",
            value: String(userProfile?.snippets_count || 0),
            gradient: "from-primary to-accent",
            trend: 0
          },
          {
            icon: "Eye",
            label: "Total Views",
            value: String(totalViews),
            gradient: "from-success to-emerald-400",
            trend: 0
          },
          {
            icon: "Heart",
            label: "Total Likes",
            value: String(totalLikes),
            gradient: "from-error to-pink-400",
            trend: 0
          },
          {
            icon: "Bug",
            label: "Bugs Fixed",
            value: String(userProfile?.bugs_fixed_count || 0),
            gradient: "from-warning to-yellow-400",
            trend: 0
          }
        ]);

        // Set empty achievements (no achievements table in schema)
        setAchievementsData([]);

      } catch (err) {
        console.error('Error loading profile data:', err);
        setError(err?.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user, userProfile, userId]);

  // UPDATED: Load only PUBLIC snippets (global posts) - exclude team/company posts
  useEffect(() => {
    const loadSnippets = async () => {
      if (!user) return;

      try {
        let query = supabase
          ?.from('snippets')
          ?.select('*')
          ?.eq('user_id', userId || user?.id)
          ?.eq('visibility', 'public')  // CRITICAL: Only public global posts
          ?.is('team_id', null)         // CRITICAL: Exclude team posts
          ?.is('company_id', null);     // CRITICAL: Exclude company posts

        // Apply language filter
        if (filterLanguage !== 'all') {
          query = query?.eq('language', filterLanguage);
        }

        // Apply sorting
        switch (sortBy) {
          case 'recent':
            query = query?.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query?.order('likes_count', { ascending: false });
            break;
          case 'views':
            query = query?.order('views_count', { ascending: false });
            break;
          case 'likes':
            query = query?.order('likes_count', { ascending: false });
            break;
          default:
            query = query?.order('created_at', { ascending: false });
        }

        const { data, error: snippetsError } = await query;

        if (snippetsError) throw snippetsError;

        const transformedSnippets = (data || [])?.map(snippet => ({
          id: snippet?.id,
          title: snippet?.title,
          description: snippet?.description || '',
          language: snippet?.language,
          tags: snippet?.ai_tags || [],
          codePreview: snippet?.code?.substring(0, 200) || '',
          likes: snippet?.likes_count || 0,
          comments: snippet?.comments_count || 0,
          saves: 0,
          views: snippet?.views_count || 0,
          visibility: snippet?.visibility,
          createdAt: new Date(snippet?.created_at),
          updatedAt: new Date(snippet?.updated_at)
        }));

        setSnippetsData(transformedSnippets);
      } catch (err) {
        console.error('Error loading snippets:', err);
        setError(err?.message || 'Failed to load snippets');
      }
    };

    if (activeTab === 'snippets') {
      loadSnippets();
    }
  }, [user, userId, activeTab, filterLanguage, sortBy]);

  // UPDATED: Always show all public snippets (no additional filtering needed)
  useEffect(() => {
    setFilteredSnippets(snippetsData);
  }, [snippetsData]);

  // Load followers data
  useEffect(() => {
    const loadFollowers = async () => {
      if (!user) return;

      try {
        // FIXED: Use userId || user?.id to load correct profile's followers
        const { data, error: followersError } = await supabase
          ?.from('follows')
          ?.select('follower_id, user_profiles!follows_follower_id_fkey(id, full_name, username, avatar_url, bio, snippets_count, followers_count, email_verified)')
          ?.eq('following_id', userId || user?.id);

        if (followersError) throw followersError;

        const transformedFollowers = (data || [])?.map(follow => {
          const profile = follow?.user_profiles;
          return {
            id: profile?.id,
            name: profile?.full_name || 'Anonymous',
            username: profile?.username || '',
            avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${profile?.full_name || 'User'}`,
            bio: profile?.bio || '',
            snippetsCount: profile?.snippets_count || 0,
            followersCount: profile?.followers_count || 0,
            isVerified: profile?.email_verified || false,
            isFollowing: false
          };
        });

        setFollowersData(transformedFollowers);
      } catch (err) {
        console.error('Error loading followers:', err);
      }
    };

    if (activeTab === 'followers') {
      loadFollowers();
    }
  }, [user, userId, activeTab]);

  // Load following data
  useEffect(() => {
    const loadFollowing = async () => {
      if (!user) return;

      try {
        // FIXED: Use userId || user?.id to load correct profile's following
        const { data, error: followingError } = await supabase
          ?.from('follows')
          ?.select('following_id, user_profiles!follows_following_id_fkey(id, full_name, username, avatar_url, bio, snippets_count, followers_count, email_verified)')
          ?.eq('follower_id', userId || user?.id);

        if (followingError) throw followingError;

        const transformedFollowing = (data || [])?.map(follow => {
          const profile = follow?.user_profiles;
          return {
            id: profile?.id,
            name: profile?.full_name || 'Anonymous',
            username: profile?.username || '',
            avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${profile?.full_name || 'User'}`,
            bio: profile?.bio || '',
            snippetsCount: profile?.snippets_count || 0,
            followersCount: profile?.followers_count || 0,
            isVerified: profile?.email_verified || false,
            isFollowing: true
          };
        });

        setFollowingData(transformedFollowing);
      } catch (err) {
        console.error('Error loading following:', err);
      }
    };

    if (activeTab === 'following') {
      loadFollowing();
    }
  }, [user, userId, activeTab]);

  // Load activity data
  useEffect(() => {
    const loadActivity = async () => {
      if (!user) return;

      try {
        const { data, error: notificationsError } = await supabase?.from('notifications')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })?.limit(20);

        if (notificationsError) throw notificationsError;

        const transformedActivity = (data || [])?.map(notification => ({
          id: notification?.id,
          type: notification?.type,
          action: notification?.title,
          target: notification?.message,
          description: notification?.message,
          timestamp: new Date(notification?.created_at),
          engagement: { likes: 0, comments: 0 }
        }));

        setActivityData(transformedActivity);
      } catch (err) {
        console.error('Error loading activity:', err);
      }
    };

    if (activeTab === 'activity') {
      loadActivity();
    }
  }, [user, activeTab]);

  // UPDATED: Change tab label to reflect global posts only
  const tabs = [
    { id: 'snippets', label: 'Global Posts', icon: 'Code', count: snippetsData?.length },
    { id: 'activity', label: 'Activity', icon: 'Activity', count: activityData?.length },
    { id: 'followers', label: 'Followers', icon: 'Users', count: followersData?.length },
    { id: 'following', label: 'Following', icon: 'UserCheck', count: followingData?.length }
  ];

  // Fix: Navigate to profile editor
  const handleEdit = () => {
    navigate('/profile-editor');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-error/100/10 border border-error rounded-lg p-4">
            <p className="text-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show not logged in state
  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-warning/10 border border-warning rounded-lg p-4">
            <p className="text-foreground">Please log in to view your profile.</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />

      {/* Profile Header */}
      <div className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <img
                src={userData?.avatar}
                alt={userData?.avatarAlt}
                className="w-24 h-24 rounded-full object-cover border-4 border-accent"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{userData?.name}</h1>
              <p className="text-muted-foreground">{userData?.username}</p>
              <p className="text-sm text-muted-foreground">{userData?.bio || 'No bio yet'}</p>
            </div>

            {/* UPDATED: Action Buttons with functional follow */}
            <div className="flex space-x-4">
              {isOwnProfile ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Icon name="Settings" size={20} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {renderFriendButton()}
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'bg-primary text-white hover:bg-primary/90'
                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {followLoading ? (
                      <>
                        <Icon name="Loader2" size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isFollowing ? (
                      <>
                        <Icon name="UserCheck" size={20} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Icon name="UserPlus" size={20} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Achievements Section */}
        {isOwnProfile && achievementsData?.length > 0 && (
          <div className="mt-6 bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
              <button className="text-sm text-accent hover:text-accent/80 transition-colors">
                View All
              </button>
            </div>
            <div className="flex flex-wrap gap-6">
              {achievementsData?.map((achievement) => (
                <AchievementBadge key={achievement?.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData?.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="mt-8 bg-card rounded-lg border border-border overflow-hidden">
          <div className="border-b border-border overflow-x-auto">
            <div className="flex">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    {tab?.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Snippets Tab with Enhanced Filtering */}
            {activeTab === 'snippets' && (
              <div>
                {/* Language and Sort Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Select
                      options={languageOptions}
                      value={filterLanguage}
                      onChange={setFilterLanguage}
                      placeholder="Filter by language"
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      options={sortOptions}
                      value={sortBy}
                      onChange={setSortBy}
                      placeholder="Sort by"
                    />
                  </div>
                </div>

                {/* Snippets Grid - E-commerce Style */}
                {filteredSnippets?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Code" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No global posts yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first public code snippet to share with the community
                    </p>
                    <Button onClick={() => navigate('/create-snippet')}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Create Snippet
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Results Count */}
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredSnippets?.length} global {filteredSnippets?.length === 1 ? 'post' : 'posts'}
                      </p>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          onClick={() => navigate('/create-snippet')}
                        >
                          <Icon name="Plus" size={16} className="mr-2" />
                          New Snippet
                        </Button>
                      )}
                    </div>

                    {/* E-commerce Style Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSnippets?.map((snippet) => (
                        <div
                          key={snippet?.id}
                          className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
                        >
                          {/* Snippet Header */}
                          <div className="p-4 border-b border-border">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                  {snippet?.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {snippet?.createdAt?.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="px-2 py-1 text-xs rounded-full font-medium bg-success/10 text-success">
                                  <Icon name="Globe" size={12} className="inline mr-1" />
                                  public
                                </span>
                              </div>
                            </div>
                            {snippet?.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {snippet?.description}
                              </p>
                            )}
                          </div>

                          {/* Code Preview */}
                          <div className="bg-muted/30 p-4 border-b border-border">
                            <pre className="text-xs font-mono text-foreground line-clamp-3 overflow-hidden">
                              <code>{snippet?.codePreview}</code>
                            </pre>
                          </div>

                          {/* Snippet Footer */}
                          <div className="p-4">
                            {/* Tags */}
                            {snippet?.tags && snippet?.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {snippet?.tags?.slice(0, 3)?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {snippet?.tags?.length > 3 && (
                                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                    +{snippet?.tags?.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Stats and Language */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="Heart" size={14} />
                                  {snippet?.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="MessageSquare" size={14} />
                                  {snippet?.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Eye" size={14} />
                                  {snippet?.views}
                                </span>
                              </div>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                {snippet?.language}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                {activityData?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activityData?.map((activity) => (
                      <ActivityItem key={activity?.id} activity={activity} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <div>
                {followersData?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No followers yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followersData?.map((follower) => (
                      <UserCard key={follower?.id} user={follower} type="follower" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div>
                {followingData?.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="UserCheck" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followingData?.map((followingUser) => (
                      <UserCard key={followingUser?.id} user={followingUser} type="following" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;