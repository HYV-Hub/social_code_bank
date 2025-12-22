import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import AppNavigation from '../../components/AppNavigation';
import Button from '../../components/ui/Button';

import Icon from '../../components/AppIcon';
import { companyDashboardService } from '../../services/companyDashboardService';
import { teamService } from '../../services/teamService';
import CreateSnippetModal from './components/CreateSnippetModal';
import CompanySidebar from '../../components/CompanySidebar';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyDetails, setCompanyDetails] = useState(null);
  
  // UPDATED: Read activeTab from query params
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'overview');
  
  // Feed state
  const [feedLoading, setFeedLoading] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [feedFilters, setFeedFilters] = useState({
    language: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });
  const [hasMore, setHasMore] = useState(false);

  // ADD: Teams state
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [teamError, setTeamError] = useState('');

  // UPDATED: Add modal state for quick snippet creation
  const [showCreateSnippetModal, setShowCreateSnippetModal] = useState(false);

  // CRITICAL FIX: Memoize loadCompanyFeed to prevent infinite loops
  const loadCompanyFeed = useCallback(async (loadMore = false) => {
    if (!userProfile?.company_id) return;

    try {
      setFeedLoading(true);
      
      const filters = loadMore 
        ? { ...feedFilters, offset: snippets?.length }
        : feedFilters;

      const result = await companyDashboardService?.getCompanySnippetsFeed(
        userProfile?.company_id, 
        filters
      );
      
      if (loadMore) {
        setSnippets(prev => [...prev, ...result?.snippets]);
      } else {
        setSnippets(result?.snippets);
      }
      
      setHasMore(result?.hasMore);
    } catch (err) {
      console.error('Error loading company feed:', err);
      setError(err?.message || 'Failed to load company feed');
    } finally {
      setFeedLoading(false);
    }
  }, [userProfile?.company_id, feedFilters, snippets?.length]);

  // ADD: Load company teams function
  const loadCompanyTeams = useCallback(async () => {
    if (!userProfile?.company_id) return;

    try {
      setTeamsLoading(true);
      setTeamError('');
      
      const companyTeams = await teamService?.getCompanyTeams(userProfile?.company_id);
      setTeams(companyTeams || []);
      
      console.log('✅ Loaded', companyTeams?.length, 'company teams');
    } catch (err) {
      console.error('Error loading company teams:', err);
      setTeamError(err?.message || 'Failed to load company teams');
    } finally {
      setTeamsLoading(false);
    }
  }, [userProfile?.company_id]);

  // CRITICAL FIX: Verify user has company access - removed activeTab from dependencies
  useEffect(() => {
    let isMounted = true;

    const verifyCompanyAccess = async () => {
      // Wait for auth to load
      if (authLoading) {
        console.log('🔄 Auth loading...');
        return;
      }

      // Check if user is authenticated
      if (!user?.id) {
        console.log('❌ No authenticated user, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      // UPDATED: Don't redirect if user is just navigating within company pages
      // Only redirect if they truly don't have company access
      if (!userProfile?.company_id) {
        console.log('❌ User has no company');
        
        // Check if user came from a company-related page (don't redirect in that case)
        const referrer = document.referrer;
        const isCompanyNavigation = referrer?.includes('/company-') || 
                                   referrer?.includes('/teams-landing-page') ||
                                   referrer?.includes('/member-management-center');
        
        if (!isCompanyNavigation) {
          setError('You need to create or join a company first');
          setTimeout(() => {
            navigate('/company-creation', { replace: true });
          }, 2000);
        }
        return;
      }

      try {
        setLoading(true);
        
        // Fetch company details with timeout
        console.log('📋 Fetching company details for:', userProfile?.company_id);
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const companyPromise = companyDashboardService?.getCompanyDetails(userProfile?.company_id);
        
        const company = await Promise.race([companyPromise, timeoutPromise]);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        if (!company) {
          console.error('❌ Company not found');
          setError('Company not found. Please contact support.');
          
          setTimeout(() => {
            navigate('/user-dashboard', { replace: true });
          }, 2000);
          return;
        }

        console.log('✅ Company loaded successfully:', {
          id: company?.id,
          name: company?.name,
          slug: company?.slug
        });

        setCompanyDetails(company);
        setError('');
      } catch (err) {
        console.error('❌ Error loading company dashboard:', err);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        // Provide more specific error messages
        if (err?.message === 'Request timeout') {
          setError('Connection timeout. Please check your internet and try again.');
        } else if (err?.message?.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err?.message || 'Failed to load company dashboard');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyCompanyAccess();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, userProfile, authLoading, navigate]);

  // ADD: useEffect for loading teams when teams tab is active
  useEffect(() => {
    if (activeTab === 'teams' && userProfile?.company_id && !teamsLoading && teams?.length === 0) {
      loadCompanyTeams();
    }
  }, [activeTab, userProfile?.company_id, loadCompanyTeams, teamsLoading, teams?.length]);

  // CRITICAL FIX: Separate useEffect for feed loading with memoized function
  useEffect(() => {
    if (activeTab === 'feed' && userProfile?.company_id && !feedLoading && snippets?.length === 0) {
      loadCompanyFeed();
    }
  }, [activeTab, userProfile?.company_id, loadCompanyFeed]); // Now using memoized function

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFeedFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
    // Reload feed with new filters
    setTimeout(() => loadCompanyFeed(), 100);
  };

  // UPDATED: Handle tab change with query params
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without triggering full navigation
    if (tab === 'overview') {
      setSearchParams({}); // Clear query params for overview
    } else {
      setSearchParams({ tab });
    }
  };

  // Navigate to snippet details
  const handleSnippetClick = (snippetId) => {
    navigate(`/snippet-details?id=${snippetId}`);
  };

  // ADD: Handle team card click
  const handleTeamClick = (teamId) => {
    navigate(`/team-dashboard?id=${teamId}`);
  };

  // ADD: Handle create team
  const handleCreateTeam = () => {
    // Open create team modal or navigate to team creation page
    setShowCreateTeamModal(true);
  };

  // UPDATED: Add handler to open snippet creation modal
  const handleCreateSnippet = () => {
    setShowCreateSnippetModal(true);
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading company dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with redirect message
  if (error && !companyDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center max-w-md">
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <Icon name="AlertCircle" size={48} className="text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-900 mb-2">Access Error</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show company dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppNavigation />
      
      <div className="flex">
        {/* Company Sidebar */}
        <CompanySidebar
          companyInfo={companyDetails}
          companyHives={[]}
          userRole={user?.role || 'member'}
          currentPage="dashboard"
          onCreateHive={() => navigate('/company-teams-page')}
          onHiveClick={(hiveId) => navigate(`/hives/${hiveId}`)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {companyDetails?.name || 'Company Dashboard'}
                </h1>
                <p className="text-gray-600">{companyDetails?.description || 'Welcome to your company dashboard'}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateSnippet}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  iconName="Plus"
                >
                  Add Snippet
                </Button>
                <Button
                  onClick={() => navigate('/company-management-dashboard')}
                  iconName="Settings"
                >
                  Manage Company
                </Button>
              </div>
            </div>

            {/* UPDATED: Increased size of Company Stats boxes for better visibility */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ENHANCED: Team Members box with larger sizing and better visual hierarchy */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Icon name="Users" size={28} className="text-blue-600" />
                  </div>
                  <span className="text-base font-medium text-gray-700">Total Members</span>
                </div>
                <p className="text-5xl font-bold text-gray-900 mb-2">{companyDetails?.users_count || 0}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    out of <span className="font-semibold text-blue-600">{companyDetails?.user_limit || 10}</span> limit
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Icon name="Building" size={28} className="text-green-600" />
                  </div>
                  <span className="text-base font-medium text-gray-700">Company ID</span>
                </div>
                <p className="text-xl font-mono text-gray-700 truncate mb-2">{companyDetails?.slug || 'N/A'}</p>
                <p className="text-sm text-gray-500">Unique identifier</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Icon name="Calendar" size={28} className="text-purple-600" />
                  </div>
                  <span className="text-base font-medium text-gray-700">Created</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {companyDetails?.created_at ? new Date(companyDetails?.created_at)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Company established</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg px-6 pt-4">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'overview' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="LayoutDashboard" size={18} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('feed')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'feed' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="FileCode" size={18} />
                <span>Company Feed</span>
                {snippets?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                    {snippets?.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleTabChange('teams')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === 'teams' ?'border-blue-600 text-blue-600' :'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="Users" size={18} />
                <span>Teams</span>
                {teams?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                    {teams?.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            /* Overview Tab */
            (<div className="bg-white rounded-b-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={handleCreateSnippet}
                  iconName="Plus"
                  className="justify-start"
                >
                  Add Snippet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/member-management-center')}
                  iconName="Users"
                  className="justify-start"
                >
                  Manage Members
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange('teams')}
                  iconName="Users"
                  className="justify-start"
                >
                  View Company Teams
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange('feed')}
                  iconName="FileCode"
                  className="justify-start"
                >
                  Browse Snippets
                </Button>
              </div>
            </div>)
          ) : activeTab === 'feed' ? (
            /* Company Feed Tab */
            (<div className="bg-white rounded-b-lg shadow-lg p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Company Snippets</h2>
                <Button
                  onClick={handleCreateSnippet}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  iconName="Plus"
                >
                  Add Snippet
                </Button>
              </div>

              {/* Feed Filters */}
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Icon name="Filter" size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={feedFilters?.language}
                  onChange={(e) => handleFilterChange('language', e?.target?.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Languages</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>

                <select
                  value={feedFilters?.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_at">Most Recent</option>
                  <option value="likes_count">Most Liked</option>
                  <option value="views_count">Most Viewed</option>
                  <option value="comments_count">Most Commented</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => loadCompanyFeed()}
                  iconName="RefreshCw"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
              {/* Feed Content */}
              {feedLoading && snippets?.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading company snippets...</p>
                  </div>
                </div>
              ) : snippets?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                    <Icon name="FileCode" size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No snippets yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Be the first to share a code snippet with your company
                  </p>
                  <Button
                    onClick={() => navigate('/create-snippet')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Create Snippet
                  </Button>
                </div>
              ) : (
                <>
                  {/* Snippets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {snippets?.map((snippet) => (
                      <div
                        key={snippet?.id}
                        onClick={() => handleSnippetClick(snippet?.id)}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        {/* Language Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {snippet?.language}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(snippet?.createdAt)?.toLocaleDateString()}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {snippet?.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {snippet?.description || 'No description provided'}
                        </p>

                        {/* Code Preview */}
                        {snippet?.codePreview && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <code className="text-xs text-gray-700 line-clamp-3">
                              {snippet?.codePreview}
                            </code>
                          </div>
                        )}

                        {/* Author & Engagement */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            {snippet?.author?.avatar && (
                              <img 
                                src={snippet?.author?.avatar} 
                                alt={snippet?.author?.name}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="text-sm text-gray-700 font-medium">
                              {snippet?.author?.name || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Icon name="Heart" size={16} />
                              {snippet?.likesCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="MessageCircle" size={16} />
                              {snippet?.commentsCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => loadCompanyFeed(true)}
                        variant="outline"
                        disabled={feedLoading}
                        iconName={feedLoading ? "Loader" : "ArrowDown"}
                      >
                        {feedLoading ? 'Loading...' : 'Load More Snippets'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>)
          ) : activeTab === 'teams' ? (
            /* ADD: Company Teams Tab */
            <div className="bg-white rounded-b-lg shadow-lg p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Company Teams</h2>
                <Button
                  onClick={handleCreateTeam}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  iconName="Plus"
                >
                  Create Team
                </Button>
              </div>

              {/* Teams Content */}
              {teamsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading company teams...</p>
                  </div>
                </div>
              ) : teamError ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                    <Icon name="AlertCircle" size={40} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Teams</h3>
                  <p className="text-gray-600 mb-6">{teamError}</p>
                  <Button
                    onClick={() => loadCompanyTeams()}
                    variant="outline"
                    iconName="RefreshCw"
                  >
                    Try Again
                  </Button>
                </div>
              ) : teams?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                    <Icon name="Users" size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create your first team to organize projects and collaborate with company members
                  </p>
                  <Button
                    onClick={handleCreateTeam}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Create Team
                  </Button>
                </div>
              ) : (
                <>
                  {/* Teams Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams?.map((team) => (
                      <div
                        key={team?.id}
                        onClick={() => handleTeamClick(team?.id)}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      >
                        {/* Team Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {team?.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {team?.description || 'No description provided'}
                            </p>
                          </div>
                          <div className="ml-3 p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                            <Icon name="Users" size={20} />
                          </div>
                        </div>

                        {/* Team Stats */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Icon name="Calendar" size={16} />
                            <span>
                              {team?.createdAt ? new Date(team?.createdAt)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Team Creator */}
                        {team?.creator && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                            {team?.creator?.avatarUrl ? (
                              <img 
                                src={team?.creator?.avatarUrl} 
                                alt={team?.creator?.fullName || team?.creator?.username}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <Icon name="User" size={14} className="text-gray-500" />
                              </div>
                            )}
                            <span className="text-sm text-gray-600">
                              Created by <span className="font-medium text-gray-900">{team?.creator?.fullName || team?.creator?.username}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Refresh Button */}
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => loadCompanyTeams()}
                      variant="outline"
                      iconName="RefreshCw"
                      size="sm"
                    >
                      Refresh Teams
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </main>
      </div>

      <CreateSnippetModal
        isOpen={showCreateSnippetModal}
        onClose={() => setShowCreateSnippetModal(false)}
        companyId={companyDetails?.id}
      />
    </div>
  );
};

export default CompanyDashboard;