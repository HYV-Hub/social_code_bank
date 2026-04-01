import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import { useHiveRealtime } from '../../hooks/useHiveRealtime';
import PageShell from '../../components/PageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import GlobalHivesSidebar from './components/GlobalHivesSidebar';

import HiveInsightsSidebar from './components/HiveInsightsSidebar';
import ActivityFeed from './components/ActivityFeed';
import HiveSettings from './components/HiveSettings';
import HiveCollectionsTab from './components/HiveCollectionsTab';
import DesktopNavigationBar from './components/DesktopNavigationBar';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import MemberRoleManager from './components/MemberRoleManager';
import CompanySidebar from '../../components/CompanySidebar';
import { companyDashboardService } from '../../services/companyDashboardService';

export default function HiveExplorer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hiveId: routeHiveId } = useParams();
  const location = useLocation();
  
  // Support both query params (legacy) and route params (new)
  const hiveId = routeHiveId || searchParams?.get('hive') || searchParams?.get('id');
  
  const [hive, setHive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [snippets, setSnippets] = useState([]);
  const [collections, setCollections] = useState([]);
  const [members, setMembers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myHives, setMyHives] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  // Mobile sidebar states
  const [globalSidebarOpen, setGlobalSidebarOpen] = useState(false);
  const [navSidebarOpen, setNavSidebarOpen] = useState(false);
  const [insightsSidebarOpen, setInsightsSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Add this block - declare missing context state variables before use
  const [isCompanyContext, setIsCompanyContext] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  // End of added block

  // Add this block - declare missing variables
  const canManageHive = hive?.userRole === 'owner' || hive?.userRole === 'admin';
  const memberRole = hive?.userRole;
  // End of added block

  // Real-time subscription callbacks
  const handleMemberJoined = (newMember) => {
    setMembers(prev => [newMember, ...prev]);
    setHive(prev => prev ? { ...prev, member_count: (prev?.member_count || 0) + 1 } : prev);
    
    // Show notification
    setRealtimeNotification({
      type: 'member',
      message: `${newMember?.user?.username || 'Someone'} joined the hive`,
      timestamp: new Date()
    });
    setTimeout(() => setRealtimeNotification(null), 5000);
  };

  const handleSnippetAdded = (newSnippet) => {
    setSnippets(prev => [newSnippet, ...prev]);
    setHive(prev => prev ? { ...prev, snippet_count: (prev?.snippet_count || 0) + 1 } : prev);
    
    // Add to activity feed
    const activity = {
      id: `snippet-${newSnippet?.id}`,
      type: 'snippet_added',
      created_at: new Date()?.toISOString(),
      user: newSnippet?.author,
      snippet: { id: newSnippet?.id, title: newSnippet?.title },
      timeAgo: 'Just now'
    };
    setRecentActivity(prev => [activity, ...prev]);
    
    // Show notification
    setRealtimeNotification({
      type: 'snippet',
      message: `${newSnippet?.author?.username || 'Someone'} added a new snippet: ${newSnippet?.title}`,
      timestamp: new Date()
    });
    setTimeout(() => setRealtimeNotification(null), 5000);
  };

  const handleCommentAdded = (newComment) => {
    // Update comments count for the snippet
    setSnippets(prev => prev?.map(snippet => 
      snippet?.id === newComment?.snippet_id 
        ? { ...snippet, comments_count: (snippet?.comments_count || 0) + 1 }
        : snippet
    ));
    
    // Add to activity feed
    const activity = {
      id: `comment-${newComment?.id}`,
      type: 'comment_added',
      created_at: new Date()?.toISOString(),
      user: newComment?.user,
      snippet: newComment?.snippet,
      timeAgo: 'Just now'
    };
    setRecentActivity(prev => [activity, ...prev]);
    
    // Show notification
    setRealtimeNotification({
      type: 'comment',
      message: `${newComment?.user?.username || 'Someone'} commented on "${newComment?.snippet?.title}"`,
      timestamp: new Date()
    });
    setTimeout(() => setRealtimeNotification(null), 5000);
  };

  const handleCollectionUpdated = (payload) => {
    if (payload?.eventType === 'INSERT') {
      // Reload collections
      loadHiveCollections();
    }
  };

  // Setup real-time subscriptions
  useHiveRealtime(hive?.userRole ? hiveId : null, {
    onMemberJoined: handleMemberJoined,
    onSnippetAdded: handleSnippetAdded,
    onCommentAdded: handleCommentAdded,
    onCollectionUpdated: handleCollectionUpdated
  });

  // SIMPLIFIED: Single reliable state reset on component mount
  useEffect(() => {
    // Reset state when hiveId changes
    setLoading(true);
    setError('');
    setSnippets([]);
    setCollections([]);
    setMembers([]);
    setInsights(null);
    setJoinRequests([]);
    setRecentActivity([]);
    setSearchQuery('');
    
    if (hiveId) {
      loadHiveData();
    }
    if (user) {
      loadMyHives();
    }
  }, [hiveId, user]);

  useEffect(() => {
    if (activeTab === 'activity' && hive?.userRole) {
      loadRecentActivity();
    }
  }, [activeTab, hive]);

  const loadHiveData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const hiveData = await hiveService?.getHiveDetails(hiveId);
      setHive(hiveData);
      
      // NEW: Check if this is a company hive
      if (hiveData?.company_id) {
        setIsCompanyContext(true);
        // Load company info for sidebar
        try {
          const companyData = await companyDashboardService?.getCompanyDetails(hiveData?.company_id);
          setCompanyInfo(companyData);
        } catch (err) {
          console.error('Error loading company info:', err);
        }
      } else {
        setIsCompanyContext(false);
        setCompanyInfo(null);
      }
      
      if (hiveData?.userRole) {
        // Load snippets, collections, members, and insights for members
        const [snippetsData, collectionsData, membersData, insightsData] = await Promise.all([
          hiveService?.getHiveSnippets(hiveId, { page: 1, limit: 20 }),
          hiveService?.getHiveCollections(hiveId),
          hiveService?.getHiveMembers(hiveId),
          hiveService?.getHiveInsights(hiveId)
        ]);
        
        setSnippets(snippetsData?.snippets || []);
        setCollections(collectionsData || []);
        setMembers(membersData || []);
        setInsights(insightsData);

        // If admin/owner, load join requests
        if (hiveData?.userRole === 'owner' || hiveData?.userRole === 'admin') {
          const requestsData = await hiveService?.getJoinRequests(hiveId);
          setJoinRequests(requestsData || []);
        }
      }
    } catch (err) {
      console.error('Error loading hive data:', err);
      setError(err?.message || 'Failed to load hive');
    } finally {
      setLoading(false);
    }
  };

  const loadHiveCollections = async () => {
    try {
      const collectionsData = await hiveService?.getHiveCollections(hiveId);
      setCollections(collectionsData || []);
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const loadMyHives = async () => {
    try {
      const data = await hiveService?.getUserHives();
      setMyHives(data || []);
    } catch (err) {
      console.error('Error loading my hives:', err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const activities = await hiveService?.getHiveActivity(hiveId);
      setRecentActivity(activities || []);
    } catch (err) {
      console.error('Error loading activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleJoinHive = async () => {
    try {
      if (hive?.privacy === 'public') {
        await hiveService?.joinHive(hiveId);
      } else {
        await hiveService?.requestJoin(hiveId);
      }
      loadHiveData();
      loadMyHives();
    } catch (err) {
      console.error('Error joining hive:', err);
      setError(err?.message);
    }
  };

  const handleApproveRequest = async (requestId, userId) => {
    try {
      await hiveService?.approveJoinRequest(requestId, hiveId, userId);
      loadHiveData();
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err?.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await hiveService?.rejectJoinRequest(requestId);
      loadHiveData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err?.message);
    }
  };

  const handleUpdateSettings = async (updates) => {
    try {
      await hiveService?.updateHiveSettings(hiveId, updates);
      loadHiveData();
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      await hiveService?.updateMemberRole(hiveId, userId, newRole);
      await loadHiveData(); // Reload to get updated member list
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await hiveService?.removeMember(hiveId, userId);
      await loadHiveData(); // Reload to get updated member list
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  const filteredSnippets = snippets?.filter(snippet =>
    snippet?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    snippet?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  ) || [];

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search':
        setSearchFocused(true);
        // Focus search input if it exists
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Search"]');
          if (searchInput) searchInput?.focus();
        }, 100);
        break;
      case 'shortcuts':
        setShowShortcuts(true);
        break;
      case 'notifications':
        // Toggle activity tab
        setActiveTab('overview');
        break;
      default:
        break;
    }
  };

  // Global keyboard shortcut handler
  React.useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Show shortcuts modal with '?'
      if (e?.key === '?' && !e?.ctrlKey && !e?.metaKey) {
        const target = e?.target;
        if (target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
          e?.preventDefault();
          setShowShortcuts(true);
        }
      }

      // Close modal with Escape
      if (e?.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  if (loading) {
    return (
      <PageShell noPadding>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-purple-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 mx-auto animate-ping opacity-20"></div>
            </div>
            <p className="text-foreground font-medium animate-pulse">Loading hive experience...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !hive) {
    return (
      <PageShell noPadding>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="text-center max-w-md">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-error/100 opacity-10 blur-3xl rounded-full"></div>
              <Icon name="AlertCircle" size={80} className="mx-auto text-error relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Hive Not Found
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {error || 'This hive does not exist or you do not have access to view it.'}
            </p>
            <Button
              onClick={() => navigate('/hives')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Back to Hives
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell noPadding>
      
      <div className={isCompanyContext ? 'flex' : 'pt-16'}>
        {/* NEW: Show CompanySidebar for company hives */}
        {isCompanyContext && companyInfo && (
          <CompanySidebar
            companyInfo={companyInfo}
            companyHives={myHives?.filter(h => h?.company_id === companyInfo?.id) || []}
            userRole={user?.role || 'member'}
            currentPage="hive"
            onCreateHive={() => navigate('/company-teams-page')}
            onHiveClick={(selectedHiveId) => navigate(`/hives/${selectedHiveId}`)}
          />
        )}

        {/* Main Content - adjusted for company context */}
        <main className={isCompanyContext ? 'flex-1 overflow-y-auto pt-6' : ''}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Enhanced Hive Header with Gradient */}
            <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-2xl overflow-hidden mb-8">
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-card rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-card rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>

              <div className="relative z-10 p-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                        {hive?.name}
                      </h1>
                      <span className={`px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                        hive?.privacy === 'public' ?'bg-success/100/90 text-white' :'bg-warning/100/90 text-white'
                      }`}>
                        {hive?.privacy === 'public' ? '🌍 Public Hive' : '🔒 Private Hive'}
                      </span>
                      {hive?.userRole && (
                        <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-card/90 text-primary capitalize shadow-lg backdrop-blur-sm">
                          {hive?.userRole === 'owner' ? '👑 ' : hive?.userRole === 'admin' ? '⭐ ' : ''}
                          {hive?.userRole}
                        </span>
                      )}
                    </div>
                    <p className="text-purple-100 mb-6 text-lg leading-relaxed max-w-3xl">
                      {hive?.description}
                    </p>
                    
                    {/* Stats Row with Enhanced Design */}
                    <div className="flex items-center gap-8 flex-wrap">
                      <div className="flex items-center gap-2 text-white/90 bg-card/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <Icon name="Users" size={20} />
                        <span className="font-semibold">{hive?.member_count || 0}</span>
                        <span className="text-sm">members</span>
                      </div>
                      {hive?.snippet_count > 0 && (
                        <div className="flex items-center gap-2 text-white/90 bg-card/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                          <Icon name="Code" size={20} />
                          <span className="font-semibold">{hive?.snippet_count}</span>
                          <span className="text-sm">snippets</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-white/90 bg-card/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <Icon name="User" size={20} />
                        <span className="text-sm">Owner:</span>
                        <span className="font-semibold">{hive?.owner?.username || hive?.owner?.full_name || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    {hive?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {hive?.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-1.5 text-sm font-medium bg-card/90 text-primary rounded-full shadow-md backdrop-blur-sm hover:bg-card transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!hive?.userRole && (
                    <Button
                      onClick={handleJoinHive}
                      disabled={!user || hive?.hasPendingRequest}
                      className="bg-card text-primary hover:bg-background font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hive?.hasPendingRequest ? (
                        <>
                          <Icon name="Clock" size={20} className="mr-2" />
                          Request Pending
                        </>
                      ) : hive?.privacy === 'public' ? (
                        <>
                          <Icon name="UserPlus" size={20} className="mr-2" />
                          Join Hive
                        </>
                      ) : (
                        <>
                          <Icon name="Send" size={20} className="mr-2" />
                          Request to Join
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Tabs Navigation */}
            <div className="mb-8">
              <div className="bg-card rounded-xl shadow-md p-2 border border-border">
                <nav className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === 'overview' ?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name="Home" size={18} />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('snippets')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === 'snippets' ?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name="Code" size={18} />
                    Snippets
                    {snippets?.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-card/20 rounded-full">
                        {snippets?.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('collections')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === 'collections' ?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name="FolderOpen" size={18} />
                    Collections
                    {collections?.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-card/20 rounded-full">
                        {collections?.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === 'members' ?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name="Users" size={18} />
                    Members
                    <span className="px-2 py-0.5 text-xs bg-card/20 rounded-full">
                      {members?.length || 0}
                    </span>
                  </button>
                  {canManageHive && (
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                        activeTab === 'settings' ?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name="Settings" size={18} />
                      Settings
                    </button>
                  )}
                </nav>
              </div>
            </div>

            {/* Tab Content with Enhanced Styling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-8">
                {activeTab === 'overview' && (
                  <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                    <ActivityFeed hiveId={hiveId} />
                  </div>
                )}

                {activeTab === 'snippets' && (
                  <div className="space-y-6">
                    {/* Enhanced Search Bar */}
                    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Code Snippets
                          </h2>
                          <p className="text-muted-foreground text-sm mt-1">
                            Explore {filteredSnippets?.length} snippet{filteredSnippets?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="relative flex-1 max-w-md">
                          <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Search snippets... (Press / to focus)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e?.target?.value)}
                            className={`pl-10 pr-4 py-3 border-2 rounded-lg transition-all ${
                              searchFocused 
                                ? 'border-purple-500 ring-2 ring-purple-200' :'border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                            }`}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                          />
                          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-muted border border-border rounded shadow-sm text-muted-foreground">
                            /
                          </kbd>
                        </div>
                      </div>
                    </div>

                    {filteredSnippets?.length === 0 ? (
                      <div className="bg-card rounded-xl shadow-lg border border-border p-12 text-center">
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-primary/100 opacity-10 blur-2xl rounded-full"></div>
                          <Icon name="Code" size={64} className="mx-auto text-purple-400 relative z-10" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No snippets found</h3>
                        <p className="text-muted-foreground mb-6">
                          {searchQuery 
                            ? 'Try adjusting your search terms' :'Be the first to add a snippet to this hive!'}
                        </p>
                        {hive?.userRole && (
                          <Button
                            onClick={() => navigate(`/hive-snippet-editor?hive=${hiveId}`)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                          >
                            <Icon name="Plus" size={18} className="mr-2" />
                            Create Snippet
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredSnippets?.map((snippet, idx) => (
                          <div
                            key={snippet?.id}
                            className="group bg-card border-2 border-border rounded-xl p-6 hover:shadow-2xl hover:border-border transition-all cursor-pointer transform hover:-translate-y-1"
                            onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                                  {snippet?.title}
                                </h3>
                                {snippet?.description && (
                                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                    {snippet?.description}
                                  </p>
                                )}
                              </div>
                              <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-primary rounded-lg group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors">
                                {snippet?.language}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                              <span className="flex items-center gap-2 hover:text-error transition-colors">
                                <Icon name="Heart" size={16} />
                                <span className="font-medium">{snippet?.likes_count || 0}</span>
                              </span>
                              <span className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Icon name="MessageCircle" size={16} />
                                <span className="font-medium">{snippet?.comments_count || 0}</span>
                              </span>
                              <span className="flex items-center gap-2 hover:text-success transition-colors">
                                <Icon name="Eye" size={16} />
                                <span className="font-medium">{snippet?.views_count || 0}</span>
                              </span>
                              <span className="flex items-center gap-2 ml-auto text-primary">
                                <Icon name="User" size={16} />
                                <span className="font-medium">@{snippet?.author?.username}</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'collections' && (
                  <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                    <HiveCollectionsTab 
                      hiveId={hiveId} 
                      hiveRole={memberRole}
                    />
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="space-y-6">
                    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Hive Members
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {members?.length} active member{members?.length !== 1 ? 's' : ''}
                        </p>
                        {canManageHive && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-border rounded-lg">
                            <div className="flex items-start gap-2">
                              <Icon name="Info" size={16} className="text-primary mt-0.5" />
                              <div className="text-xs text-purple-900 leading-relaxed">
                                <p className="font-semibold mb-1">Role Management:</p>
                                <ul className="space-y-1 ml-4 list-disc">
                                  <li><strong>Admin:</strong> Manage members, moderate content, manage settings</li>
                                  <li><strong>Editor:</strong> Create/edit snippets and collections</li>
                                  <li><strong>Member:</strong> Contribute snippets and participate</li>
                                  <li><strong>Viewer:</strong> Read-only access, can view and comment</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {members?.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-indigo-500 opacity-10 blur-2xl rounded-full"></div>
                            <Icon name="Users" size={64} className="mx-auto text-indigo-400 relative z-10" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">No members yet</h3>
                          <p className="text-muted-foreground">Be the first to join this hive!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {members?.map((member, idx) => (
                            <div
                              key={member?.id}
                              className="group flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:shadow-lg hover:border-border transition-all"
                              style={{ animationDelay: `${idx * 30}ms` }}
                            >
                              {member?.user?.avatar_url ? (
                                <img
                                  src={member?.user?.avatar_url}
                                  alt={member?.user?.username}
                                  className="w-14 h-14 rounded-full ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all flex-shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all flex-shrink-0">
                                  <Icon name="User" size={24} className="text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {member?.user?.full_name || member?.user?.username}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">@{member?.user?.username}</p>
                                {canManageHive && member?.role !== 'owner' && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Joined {new Date(member?.joined_at)?.toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {canManageHive && member?.user?.id !== user?.id ? (
                                <MemberRoleManager
                                  member={member}
                                  currentUserRole={hive?.userRole}
                                  onRoleUpdate={handleUpdateMemberRole}
                                  onMemberRemove={handleRemoveMember}
                                />
                              ) : (
                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                                  member?.role === 'owner' ?'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                    : member?.role === 'admin' ?'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                    : member?.role === 'editor' ?'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                    : member?.role === 'viewer' ?'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md' :'bg-muted text-foreground'
                                }`}>
                                  {member?.role === 'owner' && '👑 '}
                                  {member?.role === 'admin' && '⭐ '}
                                  {member?.role === 'editor' && '✏️ '}
                                  {member?.role === 'viewer' && '👁️ '}
                                  {member?.role}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && canManageHive && (
                  <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                    <HiveSettings 
                      hive={hive} 
                      onUpdate={loadHiveData}
                    />
                  </div>
                )}
              </div>

              {/* Right Sidebar - Analytics - Only visible on XL screens */}
              <div className="lg:col-span-4">
                <div className="hidden xl:block w-80 border-l border-border overflow-y-auto min-h-[calc(100vh-4rem)] sticky top-16">
                  <HiveInsightsSidebar
                    hiveData={hive}
                    collections={collections}
                    insights={{
                      totalSnippets: hive?.snippet_count || 0,
                      activeMembers: members?.filter(m => {
                        const joinDate = new Date(m?.joined_at);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
                        return joinDate >= sevenDaysAgo;
                      })?.length || 0,
                      postsThisWeek: recentActivity?.filter(a => {
                        const activityDate = new Date(a?.created_at);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
                        return activityDate >= sevenDaysAgo && a?.type === 'snippet_added';
                      })?.length || 0,
                      growthRate: calculateGrowthRate()
                    }}
                    recentActivity={recentActivity?.slice(0, 5)}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* UPDATED: Hide global hive sidebars when in company context */}
      {!isCompanyContext && (
        <>
          {/* Desktop Navigation Bar - NEW */}
          <DesktopNavigationBar
            hiveId={hiveId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            canManageHive={canManageHive}
            snippetCount={snippets?.length || 0}
            memberCount={members?.length || 0}
            collectionCount={collections?.length || 0}
            onQuickAction={handleQuickAction}
          />
          
          {/* Mobile Toggle Buttons - ONLY VISIBLE ON MOBILE (< lg) */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50 flex gap-2">
            {/* My Hives Icon - Mobile only */}
            <button
              onClick={() => setGlobalSidebarOpen(true)}
              className="p-3 bg-card rounded-full shadow-lg border border-border hover:bg-background transition-all hover:scale-105"
              title="My Hives"
            >
              <Icon name="Menu" size={24} className="text-foreground" />
            </button>
            {/* Navigation Icon - Mobile only when user is member */}
            {hive?.userRole && (
              <button
                onClick={() => setNavSidebarOpen(true)}
                className="p-3 bg-card rounded-full shadow-lg border border-border hover:bg-background transition-all hover:scale-105"
                title="Navigation"
              >
                <Icon name="List" size={24} className="text-foreground" />
              </button>
            )}
          </div>

          {/* Mobile Global Sidebar */}
          {globalSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setGlobalSidebarOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-card shadow-xl" onClick={(e) => e?.stopPropagation()}>
                <GlobalHivesSidebar
                  myHives={myHives}
                  currentHiveId={hiveId}
                  onClose={() => setGlobalSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Navigation Sidebar */}
          {navSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setNavSidebarOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-card shadow-xl" onClick={(e) => e?.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Navigation</h2>
                    <button
                      onClick={() => setNavSidebarOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer">
                      <Icon name="Home" size={20} className="text-muted-foreground" />
                      <span className="text-foreground">Home</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer">
                      <Icon name="FolderOpen" size={20} className="text-muted-foreground" />
                      <span className="text-foreground">Collections</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer">
                      <Icon name="Users" size={20} className="text-muted-foreground" />
                      <span className="text-foreground">Members</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background cursor-pointer">
                      <Icon name="Activity" size={20} className="text-muted-foreground" />
                      <span className="text-foreground">Activity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Keyboard Shortcuts Modal - Keep for both contexts */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Enhanced Real-time Notification Toast - Keep for both contexts */}
      {realtimeNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-card border-l-4 border-purple-600 rounded-xl shadow-2xl p-5 max-w-sm backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                realtimeNotification?.type === 'member' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                realtimeNotification?.type === 'snippet'? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-purple-400 to-pink-500'
              }`}>
                <Icon 
                  name={
                    realtimeNotification?.type === 'member' ? 'UserPlus' :
                    realtimeNotification?.type === 'snippet' ? 'Code' : 'MessageCircle'
                  } 
                  size={20} 
                  className="text-white"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {realtimeNotification?.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Icon name="Clock" size={12} />
                  Just now
                </p>
              </div>
              <button
                onClick={() => setRealtimeNotification(null)}
                className="flex-shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );

  function calculateGrowthRate() {
    // Simple growth calculation based on recent member joins
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
    const recentJoins = members?.filter(m => new Date(m?.joined_at) >= thirtyDaysAgo)?.length || 0;
    const totalMembers = members?.length || 1;
    return Math.round((recentJoins / totalMembers) * 100);
  }
}