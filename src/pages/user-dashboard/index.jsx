import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import SnippetCard from './components/SnippetCard';
import ExpandedSnippetCard from '../../components/cards/ExpandedSnippetCard';

import SavedItemCard from './components/SavedItemCard';
import ActivityItem from './components/ActivityItem';
import AchievementBadge from './components/AchievementBadge';
import AppShell from '../../components/AppShell';
import InviteTeamModal from '../../components/InviteTeamModal';
import { snippetService } from '../../services/snippetService';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';
import { collectionService } from '../../services/collectionService';


const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for real data
  const [userProfile, setUserProfile] = useState(null);
  const [recentSnippets, setRecentSnippets] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('mySnippets');
  
  // NEW: State for user statistics
  const [userStats, setUserStats] = useState({
    totalSnippets: 0,
    totalViews: 0,
    totalLikes: 0,
    bugsFixed: 0,
    followers: 0,
    following: 0,
    points: 0
  });
  
  // New state for invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // New state for filtering
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredContent, setFilteredContent] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // NEW: State for saved snippets collections
  const [userCollections, setUserCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionSnippets, setCollectionSnippets] = useState([]);

  // Load user profile and dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', user?.id)
          ?.single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        // UPDATED: Calculate total views and likes from snippets
        const { data: userSnippets, error: snippetsError } = await supabase
          ?.from('snippets')
          ?.select('views_count, likes_count')
          ?.eq('user_id', user?.id);

        if (snippetsError) throw snippetsError;

        const totalViews = (userSnippets || [])?.reduce((sum, snippet) => sum + (snippet?.views_count || 0), 0);
        const totalLikes = (userSnippets || [])?.reduce((sum, snippet) => sum + (snippet?.likes_count || 0), 0);

        // NEW: Set accurate user statistics from database
        setUserStats({
          totalSnippets: profile?.snippets_count || 0,
          totalViews: totalViews,
          totalLikes: totalLikes,
          bugsFixed: profile?.bugs_fixed_count || 0,
          followers: profile?.followers_count || 0,
          following: profile?.following_count || 0,
          points: profile?.points || 0
        });

        // Fetch user's own snippets only (private, public, company - NOT team)
        const { data: snippetsData, error: snippetsLoadError } = await supabase
          ?.from('snippets')
          ?.select(`
            *,
            user_profiles!inner(
              id,
              full_name,
              username,
              avatar_url
            )
          `)
          ?.eq('user_id', user?.id)
          ?.neq('visibility', 'team')
          ?.order('created_at', { ascending: false })
          ?.limit(10);

        if (snippetsLoadError) throw snippetsLoadError;
        setRecentSnippets(snippetsData || []);

        // NEW: Load user collections
        await loadUserCollections();

      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  // NEW: Load user collections
  const loadUserCollections = async () => {
    try {
      setLoadingCollections(true);
      const collections = await collectionService?.getUserCollections();
      setUserCollections(collections);
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoadingCollections(false);
    }
  };

  // NEW: Load snippets from selected collection
  const loadCollectionSnippets = async (collectionId) => {
    try {
      setLoadingCollections(true);
      const collection = await collectionService?.getCollectionById(collectionId);
      setCollectionSnippets(collection?.snippets || []);
      setSelectedCollection(collection);
    } catch (err) {
      console.error('Error loading collection snippets:', err);
      setError('Failed to load collection snippets');
    } finally {
      setLoadingCollections(false);
    }
  };

  const quickActions = [
    {
      icon: "Users",
      title: "Teams",
      description: "View and manage your teams",
      color: "primary",
      action: () => navigate('/teams-landing-page?context=user')
    },
    {
      icon: "Search",
      title: "Explore",
      description: "Browse community code",
      color: "success",
      action: () => navigate('/search-results')
    },
    {
      icon: "Bell",
      title: "Notifications",
      description: "Check your updates",
      color: "warning",
      action: () => navigate('/notifications')
    },
    {
      icon: "Code",
      title: "Snippets",
      description: "View your code snippets",
      color: "accent",
      action: () => navigate(`/user-profile/${user?.id}`)
    }
  ];

  const tabs = [
    { id: 'mySnippets', label: 'My Snippets', icon: 'Code', count: recentSnippets?.length || 0 },
    { id: 'saved', label: 'Saved Snippets', icon: 'Bookmark', count: userCollections?.reduce((sum, col) => sum + (col?.snippetsCount || 0), 0) },
    { id: 'activity', label: 'Activity Feed', icon: 'Activity', count: recentActivity?.length || 0 }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state — skeleton cards
  if (loading) {
    return (
      <AppShell pageTitle="My Library">
        <div className="p-4 lg:p-6 space-y-5">
          <div className="h-5 w-48 hyv-skeleton rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="hyv-card p-4">
                <div className="h-3 w-20 hyv-skeleton mb-2 rounded" />
                <div className="h-4 w-3/4 hyv-skeleton mb-3 rounded" />
                <div className="h-20 hyv-skeleton rounded-lg mb-3" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 hyv-skeleton rounded" />
                  <div className="h-3 w-10 hyv-skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppShell pageTitle="My Library">
        <div className="bg-error/10 border border-error rounded-lg p-4">
          <p className="text-error">{error}</p>
        </div>
      </AppShell>
    );
  }

  // Show not logged in state
  if (!user) {
    return (
      <AppShell pageTitle="My Library">
        <div className="bg-warning/10 border border-warning rounded-lg p-4">
          <p className="text-foreground">Please log in to view your dashboard.</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleLikeToggle = async (snippetId, liked) => {
    try {
      await snippetService.toggleLike(snippetId);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleFork = async (snippet) => {
    try {
      const result = await snippetService.forkSnippet(snippet.id);
      if (result?.id) navigate(`/snippet-details?id=${result.id}`);
    } catch (err) {
      console.error('Fork failed:', err);
    }
  };

  const handleEditSnippet = (snippetId) => {
    navigate(`/create-snippet?edit=${snippetId}`);
  };

  const handleDeleteSnippet = (snippetId) => {
    const snippet = recentSnippets?.find(s => s?.id === snippetId);
    if (snippet) {
      setSnippetToDelete(snippet);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!snippetToDelete || deleting) return;

    try {
      setDeleting(true);
      await snippetService?.deleteSnippet(snippetToDelete?.id);

      // Remove from local state
      setRecentSnippets(prev => prev?.filter(s => s?.id !== snippetToDelete?.id));

      alert('Snippet deleted successfully');
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert(error?.message || 'Failed to delete snippet. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSnippetToDelete(null);
    }
  };

  const handleApplyFilters = async (filters) => {
    try {
      setFilterLoading(true);
      setAppliedFilters(filters);

      let results = [];

      // Fetch based on content type
      if (filters?.contentType === 'snippets' || filters?.contentType === 'all') {
        const snippets = await fetchFilteredSnippets(filters);
        results = [...results, ...snippets];
      }

      if (filters?.contentType === 'bugs' || filters?.contentType === 'all') {
        const bugs = await fetchFilteredBugs(filters);
        results = [...results, ...bugs];
      }

      // Sort results
      results = sortResults(results, filters?.sortBy);

      setFilteredContent(results);
      setShowFilters(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setFilterLoading(false);
    }
  };

  const fetchFilteredSnippets = async (filters) => {
    let query = supabase?.from('snippets')?.select('*')?.eq('user_id', user?.id);

    // Apply search query
    if (filters?.searchQuery) {
      query = query?.or(`title.ilike.%${filters?.searchQuery}%,description.ilike.%${filters?.searchQuery}%`);
    }

    // Apply AI tags filter
    if (filters?.aiTags) {
      const tags = filters?.aiTags?.split(',')?.map(tag => tag?.trim())?.filter(Boolean);
      if (tags?.length > 0) {
        query = query?.overlaps('ai_tags', tags);
      }
    }

    // Apply language filter
    if (filters?.language && filters?.language !== 'all') {
      query = query?.eq('language', filters?.language);
    }

    const { data, error } = await query?.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])?.map(snippet => ({
      ...snippet,
      contentType: 'snippet'
    }));
  };

  const fetchFilteredBugs = async (filters) => {
    let query = supabase?.from('bugs')?.select('*')?.eq('user_id', user?.id);

    // Apply search query
    if (filters?.searchQuery) {
      query = query?.or(`title.ilike.%${filters?.searchQuery}%,description.ilike.%${filters?.searchQuery}%`);
    }

    // Apply language filter
    if (filters?.language && filters?.language !== 'all') {
      query = query?.eq('language', filters?.language);
    }

    // Apply fixed code filter
    if (filters?.hasFixedCode === 'yes') {
      query = query?.not('fixed_code', 'is', null);
    } else if (filters?.hasFixedCode === 'no') {
      query = query?.is('fixed_code', null);
    }

    // Apply bug status filter
    if (filters?.bugStatus && filters?.bugStatus !== 'all') {
      query = query?.eq('bug_status', filters?.bugStatus);
    }

    // Apply bug priority filter
    if (filters?.bugPriority && filters?.bugPriority !== 'all') {
      query = query?.eq('priority', filters?.bugPriority);
    }

    const { data, error } = await query?.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || [])?.map(bug => ({
      ...bug,
      contentType: 'bug'
    }));
  };

  const sortResults = (results, sortBy) => {
    switch (sortBy) {
      case 'popular':
        return results?.sort((a, b) => (b?.likes_count || 0) - (a?.likes_count || 0));
      case 'views':
        return results?.sort((a, b) => (b?.views_count || 0) - (a?.views_count || 0));
      case 'recent':
      default:
        return results?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));
    }
  };

  const handleClearFilters = () => {
    setAppliedFilters({});
    setFilteredContent([]);
    setShowFilters(false);
  };

  const DashboardSidebar = () => (
    <div className="space-y-5">
      {/* Stats */}
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats?.totalSnippets || 0}</p>
            <p className="text-[10px] text-muted-foreground">Snippets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{userStats?.totalViews || 0}</p>
            <p className="text-[10px] text-muted-foreground">Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{userStats?.totalLikes || 0}</p>
            <p className="text-[10px] text-muted-foreground">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{userCollections?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Collections</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity?.slice(0, 5)?.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <Icon name={item?.icon || 'Activity'} size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-foreground truncate">{item?.message || item?.description || 'Activity'}</p>
                <p className="text-muted-foreground">{item?.time || item?.created_at || ''}</p>
              </div>
            </div>
          ))}
          {(!recentActivity || recentActivity.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AppShell pageTitle="My Library" rightSidebar={<DashboardSidebar />}>
      <div className="p-4 lg:p-6">
      {/* Quick Save */}
        <div className="hyv-card p-4 border-accent/20 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-accent flex items-center gap-1.5">
              <Icon name="Zap" size={14} /> Quick Save
            </span>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Snippet title..." id="quick-title"
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary" />
            <button onClick={() => navigate('/create-snippet')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              <Icon name="Plus" size={14} /> New
            </button>
          </div>
        </div>

        {/* Stats Row — compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-foreground">{userStats?.totalSnippets}</p>
            <p className="text-[10px] text-muted-foreground">Snippets</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-accent">{userStats?.totalViews}</p>
            <p className="text-[10px] text-muted-foreground">Views</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-success">{userStats?.totalLikes}</p>
            <p className="text-[10px] text-muted-foreground">Likes</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-warning">{userStats?.bugsFixed}</p>
            <p className="text-[10px] text-muted-foreground">Bugs Fixed</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-primary">{userStats?.followers}</p>
            <p className="text-[10px] text-muted-foreground">Followers</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-foreground">{userStats?.following}</p>
            <p className="text-[10px] text-muted-foreground">Following</p>
          </div>
          <div className="hyv-card p-3 text-center">
            <p className="text-xl font-bold text-accent">{userStats?.points}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        <div className="mb-8">
          <AdvancedFilterPanel
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            initialFilters={appliedFilters}
          />
        </div>

        {/* Filtered Results Section */}
        {Object.keys(appliedFilters)?.length > 0 && (
          <div className="mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Filtered Results</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredContent?.length} {filteredContent?.length === 1 ? 'item' : 'items'} found
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-sm"
                >
                  <Icon name="X" size={16} className="mr-2" />
                  Clear Filters
                </Button>
              </div>

              {filterLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Filtering results...</p>
                </div>
              ) : filteredContent?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No results found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredContent?.map((item) => (
                    <div
                      key={item?.id}
                      className="bg-muted/30 border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        if (item?.contentType === 'snippet') {
                          navigate(`/snippet-details?id=${item?.id}`);
                        } else {
                          navigate(`/bug-board?bug=${item?.id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={item?.contentType === 'snippet' ? 'Code' : 'Bug'} 
                            size={16}
                            className={item?.contentType === 'snippet' ? 'text-accent' : 'text-error'}
                          />
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {item?.contentType}
                          </span>
                        </div>
                        {item?.language && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {item?.language}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                        {item?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item?.description}
                      </p>
                      {item?.ai_tags && item?.ai_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item?.ai_tags?.slice(0, 3)?.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {item?.ai_tags?.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                              +{item?.ai_tags?.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Heart" size={12} />
                          {item?.likes_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Eye" size={12} />
                          {item?.views_count || 0}
                        </span>
                        {item?.contentType === 'bug' && (
                          <>
                            <span className={`flex items-center gap-1 ${
                              item?.fixed_code ? 'text-success' : 'text-warning'
                            }`}>
                              <Icon name={item?.fixed_code ? 'CheckCircle' : 'Clock'} size={12} />
                              {item?.fixed_code ? 'Fixed' : 'Pending'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NEW: Tab Navigation */}
        <div className="mb-8">
          <div className="bg-card rounded-lg border border-border">
            {/* Tab Headers */}
            <div className="flex border-b border-border overflow-x-auto">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => {
                    setActiveTab(tab?.id);
                    if (tab?.id === 'saved') {
                      loadUserCollections();
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                    activeTab === tab?.id
                      ? 'text-accent border-b-2 border-accent bg-accent/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span className="whitespace-nowrap">{tab?.label}</span>
                  {tab?.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                      {tab?.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* My Snippets Tab */}
              {activeTab === 'mySnippets' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">My Snippets</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/user-profile/${user?.id}`)}
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      View All
                    </Button>
                  </div>

                  {recentSnippets?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Code" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No snippets yet</p>
                      <Button onClick={() => navigate('/create-snippet')}>
                        Create Your First Snippet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentSnippets?.map((snippet) => (
                        <ExpandedSnippetCard
                          key={snippet?.id}
                          snippet={snippet}
                          onLike={handleLikeToggle}
                          onFork={handleFork}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NEW: Saved Snippets Tab */}
              {activeTab === 'saved' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Saved Snippet Collections</h2>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate('/snippet-collections')}
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      New Collection
                    </Button>
                  </div>

                  {loadingCollections ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading collections...</p>
                    </div>
                  ) : userCollections?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Bookmark" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No saved collections yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Start organizing your favorite snippets into collections</p>
                      <Button onClick={() => navigate('/snippet-collections')}>
                        Create First Collection
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Collection List */}
                      {!selectedCollection && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {userCollections?.map((collection) => (
                            <div
                              key={collection?.id}
                              onClick={() => loadCollectionSnippets(collection?.id)}
                              className="bg-muted/30 border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <Icon name="Folder" size={20} className="text-primary" />
                                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                                    {collection?.title}
                                  </h3>
                                </div>
                                {collection?.isPublic && (
                                  <span className="flex-shrink-0 text-xs px-2 py-1 bg-success/10 text-success rounded">
                                    Public
                                  </span>
                                )}
                              </div>
                              
                              {collection?.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {collection?.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="Code" size={12} />
                                  {collection?.snippetsCount} {collection?.snippetsCount === 1 ? 'snippet' : 'snippets'}
                                </span>
                                <span>
                                  {new Date(collection?.createdAt)?.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {collection?.tags && collection?.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {collection?.tags?.slice(0, 3)?.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {collection?.tags?.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                      +{collection?.tags?.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Collection Snippets View */}
                      {selectedCollection && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSelectedCollection(null);
                                setCollectionSnippets([]);
                              }}
                              className="text-sm"
                            >
                              <Icon name="ArrowLeft" size={16} className="mr-2" />
                              Back to Collections
                            </Button>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground">{selectedCollection?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {collectionSnippets?.length} {collectionSnippets?.length === 1 ? 'snippet' : 'snippets'}
                              </p>
                            </div>
                          </div>

                          {loadingCollections ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading snippets...</p>
                            </div>
                          ) : collectionSnippets?.length === 0 ? (
                            <div className="text-center py-12">
                              <Icon name="Code" size={48} className="mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No snippets in this collection yet</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {collectionSnippets?.map((item) => (
                                <div
                                  key={item?.id}
                                  className="bg-muted/30 border border-border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
                                  onClick={() => navigate(`/snippet-details?id=${item?.snippet?.id}`)}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1">
                                      <Icon name="Code" size={16} className="text-accent" />
                                      <h3 className="font-semibold text-foreground line-clamp-1">
                                        {item?.snippet?.title}
                                      </h3>
                                    </div>
                                    {item?.snippet?.language && (
                                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                        {item?.snippet?.language}
                                      </span>
                                    )}
                                  </div>

                                  {item?.snippet?.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                      {item?.snippet?.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <Icon name="Heart" size={12} />
                                        {item?.snippet?.likesCount || 0}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Icon name="Eye" size={12} />
                                        {item?.snippet?.viewsCount || 0}
                                      </span>
                                    </div>
                                    <span>
                                      Added {new Date(item?.addedAt)?.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
                  {recentActivity?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Activity" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity?.map((activity) => (
                        <ActivityItem key={activity?.id} activity={activity} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Achievements */}
          {achievements?.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Achievements</h2>
              <div className="flex flex-wrap gap-4">
                {achievements?.map((achievement) => (
                  <AchievementBadge key={achievement?.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Saved Items */}
          {savedItems?.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Saved Items</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/snippet-collections')}
                  className="text-sm text-accent hover:text-accent/80"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {savedItems?.map((item) => (
                  <SavedItemCard 
                    key={item?.id} 
                    item={item}
                    onRemove={() => {}}
                    onView={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && snippetToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Icon name="AlertTriangle" size={24} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Snippet</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete "{snippetToDelete?.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSnippetToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Invite Team Modal */}
      <InviteTeamModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedTeam(null);
        }}
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
      />
      </div>
    </AppShell>
  );
};

export default UserDashboard;