import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

import Button from '../../components/ui/Button';
import SearchHeader from './components/SearchHeader';
import FilterPanel from './components/FilterPanel';
import SortControls from './components/SortControls';
import SnippetResultCard from './components/SnippetResultCard';
import BugResultCard from './components/BugResultCard';
import UserResultCard from './components/UserResultCard';
import TeamResultCard from './components/TeamResultCard';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import AppShell from '../../components/AppShell';
import { exploreService } from '../../services/exploreService';
import { bugService } from '../../services/bugService';
import friendRequestService from '../../services/friendRequestService';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import FriendsFollowersPanel from './components/FriendsFollowersPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import FilterSidebar from './components/FilterSidebar';



const SearchResultsPage = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    sortBy: 'relevance',
    contentType: 'all',
    language: 'all',
    bugStatus: [],
    bugPriority: [],
    dateRange: null,
    minLikes: null,
    hasComments: false,
    aiTags: []
  });

  const [snippets, setSnippets] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTab, setSelectedTab] = useState('snippets');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'bug-board'
  const [globalBugs, setGlobalBugs] = useState([]);
  const [userGlobalBugs, setUserGlobalBugs] = useState([]);
  
  const resultsPerPage = 10;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    if (!query) {
      if (viewMode === 'bug-board') {
        loadGlobalBugBoard();
      } else {
        searchAllContent();
      }
    }
  }, [advancedFilters, viewMode]);

  const loadGlobalBugBoard = async () => {
    try {
      setLoading(true);
      setError('');

      // Load global open bugs (public, open status, no team/company)
      const filters = {
        language: advancedFilters?.language !== 'all' ? advancedFilters?.language : undefined,
        priority: advancedFilters?.bugPriority?.length > 0 ? advancedFilters?.bugPriority : undefined,
        sortBy: advancedFilters?.sortBy === 'newest' ? 'created_at' : 
                advancedFilters?.sortBy === 'oldest' ? 'created_at' :
                advancedFilters?.sortBy === 'likes' ? 'likes_count' : 'created_at',
        sortOrder: advancedFilters?.sortBy === 'oldest' ? 'asc' : 'desc'
      };

      const { bugs: globalBugsData, totalCount: globalCount } = await exploreService?.getGlobalOpenBugs(filters);
      setGlobalBugs(globalBugsData);

      // Load user's global bugs if authenticated
      if (user) {
        const { bugs: userBugsData, totalCount: userCount } = await exploreService?.getUserGlobalBugs(user?.id, filters);
        setUserGlobalBugs(userBugsData);
      }

      // Set allResults for display
      setAllResults(globalBugsData);
    } catch (err) {
      console.error('Error loading bug board:', err);
      setError('Failed to load bug board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'users') {
        return;
      }
      const data = await exploreService?.searchUsers(query || '');
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadTeams = async () => {
    try {
      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'teams') {
        return;
      }
      const data = await exploreService?.searchTeams(query || '');
      setTeams(data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  };

  const searchAllContent = async () => {
    try {
      setLoading(true);
      setError('');

      if (!query) {
        // 🔥 FIX: Load all public content and combine immediately
        const [snippetsData, bugsData, usersData, teamsData] = await Promise.all([
          loadPublicSnippetsData(),
          loadPublicBugsData(),
          loadUsersData(),
          loadTeamsData()
        ]);
        
        // Set individual states for result counts
        setSnippets(snippetsData);
        setBugs(bugsData);
        setUsers(usersData);
        setTeams(teamsData);
        
        // Combine results immediately with data returned from functions
        const combined = [
          ...snippetsData?.map(s => ({ ...s, type: 'snippet' })),
          ...bugsData?.map(b => ({ ...b, type: 'bug' })),
          ...usersData?.map(u => ({ ...u, type: 'user' })),
          ...teamsData?.map(t => ({ ...t, type: 'team' }))
        ];
        setAllResults(combined);
        setLoading(false);
        return;
      }

      // FIXED: Pass searchQuery (even if empty) to show ALL public content by default
      const results = await exploreService?.searchAll(query, advancedFilters);
      
      // Set individual states for result counts
      setSnippets(results?.snippets || []);
      setBugs(results?.bugs || []);
      setUsers(results?.users || []);
      setTeams(results?.teams || []);
      
      // Combine all results into a single array
      const combined = [
        ...(results?.snippets || []),
        ...(results?.bugs || []),
        ...(results?.users || []),
        ...(results?.teams || [])
      ];
      
      setAllResults(combined);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPublicSnippetsData = async () => {
    try {
      const filters = {
        language: advancedFilters?.language !== 'all' ? advancedFilters?.language : undefined,
        sortBy: advancedFilters?.sortBy === 'newest' ? 'created_at' : 
                advancedFilters?.sortBy === 'oldest' ? 'created_at' :
                advancedFilters?.sortBy === 'likes' ? 'likes_count' :
                advancedFilters?.sortBy === 'views' ? 'views_count' : 'created_at',
        sortOrder: advancedFilters?.sortBy === 'oldest' ? 'asc' : 'desc',
        minLikes: advancedFilters?.minLikes,
        hasComments: advancedFilters?.hasComments,
        dateRange: advancedFilters?.dateRange,
        aiTags: advancedFilters?.aiTags
      };

      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'snippets') {
        return [];
      }

      const data = await exploreService?.searchSnippets(query || '', filters);
      return data || [];
    } catch (err) {
      console.error('Error loading snippets:', err);
      return [];
    }
  };

  const loadPublicBugsData = async () => {
    try {
      const filters = {
        language: advancedFilters?.language !== 'all' ? advancedFilters?.language : undefined,
        status: advancedFilters?.bugStatus?.length > 0 ? advancedFilters?.bugStatus : undefined,
        priority: advancedFilters?.bugPriority?.length > 0 ? advancedFilters?.bugPriority : undefined,
        sortBy: advancedFilters?.sortBy === 'newest' ? 'created_at' : 
                advancedFilters?.sortBy === 'oldest' ? 'created_at' :
                advancedFilters?.sortBy === 'likes' ? 'likes_count' : 'created_at',
        sortOrder: advancedFilters?.sortBy === 'oldest' ? 'asc' : 'desc',
        dateRange: advancedFilters?.dateRange
      };

      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'bugs') {
        return [];
      }

      const data = await bugService?.getPublicBugs(filters);
      return data || [];
    } catch (err) {
      console.error('Error loading bugs:', err);
      return [];
    }
  };

  const loadUsersData = async () => {
    try {
      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'users') {
        return [];
      }
      const data = await exploreService?.searchUsers(query || '');
      return data || [];
    } catch (err) {
      console.error('Error loading users:', err);
      return [];
    }
  };

  const loadTeamsData = async () => {
    try {
      if (advancedFilters?.contentType !== 'all' && advancedFilters?.contentType !== 'teams') {
        return [];
      }
      const data = await exploreService?.searchTeams(query || '');
      return data || [];
    } catch (err) {
      console.error('Error loading teams:', err);
      return [];
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    if (query) {
      setSearchParams({ q: query });
    } else {
      // Clear search params if query is empty
      setSearchParams({});
    }
    if (viewMode === 'bug-board') {
      loadGlobalBugBoard();
    } else {
      searchAllContent();
    }
  };

  const handleAdvancedFilterChange = (key, value) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setAdvancedFilters({
      sortBy: 'relevance',
      contentType: 'all',
      language: 'all',
      bugStatus: [],
      bugPriority: [],
      dateRange: null,
      minLikes: null,
      hasComments: false,
      aiTags: []
    });
  };

  const handleFilterChange = (newFilters) => {
    if (newFilters.sortBy) {
      setSortBy(newFilters.sortBy);
    }
    if ('language' in newFilters) {
      setAdvancedFilters(prev => ({ ...prev, language: newFilters.language || 'all' }));
    }
    if ('visibility' in newFilters) {
      setAdvancedFilters(prev => ({ ...prev, visibility: newFilters.visibility }));
    }
  };

  const sidebarFilters = {
    sortBy,
    language: advancedFilters?.language,
    visibility: advancedFilters?.visibility || null,
  };

  // Sort results
  const sortedResults = [...allResults]?.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b?.created_at) - new Date(a?.created_at);
      case 'popular':
        return (b?.likes_count || b?.followers_count || 0) - (a?.likes_count || a?.followers_count || 0);
      case 'views':
        return (b?.views_count || 0) - (a?.views_count || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedResults?.length / resultsPerPage);
  const paginatedResults = sortedResults?.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <AppShell pageTitle="Search" rightSidebar={<FilterSidebar filters={sidebarFilters} onFilterChange={handleFilterChange} />}>
      <div className="p-4 lg:p-6">
      <Helmet>
        <title>{query ? `Search: ${query}` : viewMode === 'bug-board' ? 'Global Bug Board' : 'Explore'} - HyvHub</title>
      </Helmet>
        {/* Search Header */}
        <SearchHeader
          query={query}
          searchQuery={query}
          setSearchQuery={setQuery}
          onSearch={handleSearch}
          resultCount={sortedResults?.length}
          resultCounts={{
            snippets: snippets?.length,
            bugs: bugs?.length,
            users: users?.length,
            teams: teams?.length
          }}
        />

        {/* 🎯 FILTERS MOVED DIRECTLY BELOW SEARCH BAR */}
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => {
                    setViewMode('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'all' ?'bg-primary text-white' :'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  All Content
                </button>
                <button
                  onClick={() => {
                    setViewMode('bug-board');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'bug-board' ?'bg-primary text-white' :'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Bug" size={16} className="inline mr-2" />
                  Global Bug Board
                </button>
              </div>

              {/* Sort Controls & Filter Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <SortControls sortBy={sortBy} setSortBy={setSortBy} />
                
                {/* Filter Toggle Button */}
                <Button
                  variant={showAdvancedFilters ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="ml-2"
                >
                  <Icon name={showAdvancedFilters ? 'ChevronUp' : 'ChevronDown'} size={16} className="mr-1" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                  {(advancedFilters?.aiTags?.length > 0 || 
                    advancedFilters?.bugStatus?.length > 0 || 
                    advancedFilters?.bugPriority?.length > 0 ||
                    advancedFilters?.contentType !== 'all' ||
                    advancedFilters?.language !== 'all') && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                      {(advancedFilters?.aiTags?.length || 0) + 
                       (advancedFilters?.bugStatus?.length || 0) + 
                       (advancedFilters?.bugPriority?.length || 0) +
                       (advancedFilters?.contentType !== 'all' ? 1 : 0) +
                       (advancedFilters?.language !== 'all' ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* COLLAPSIBLE FILTER OPTIONS BENEATH SEARCH */}
            <AdvancedFilterPanel
              filters={advancedFilters}
              onFilterChange={handleAdvancedFilterChange}
              onClear={handleClearFilters}
              isOpen={showAdvancedFilters}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === 'bug-board' ? (
            /* Bug Board View */
            <div className="space-y-6">
              {/* Bug Board Header */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Global Bug Board</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open bug cases from the community - No team or company bugs
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="AlertCircle" size={16} className="text-error" />
                      <span className="font-medium">{globalBugs?.length} Open Bugs</span>
                    </div>
                    {user && userGlobalBugs?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={16} className="text-primary" />
                        <span className="font-medium">{userGlobalBugs?.length} Your Bugs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User's Global Bugs Section */}
                {user && userGlobalBugs?.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="User" size={20} className="text-primary" />
                      Your Global Bugs
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {userGlobalBugs?.slice(0, 3)?.map((bug) => (
                        <BugResultCard
                          key={`user-bug-${bug?.id}`}
                          bug={bug}
                          searchQuery={query}
                        />
                      ))}
                    </div>
                    {userGlobalBugs?.length > 3 && (
                      <button
                        onClick={() => {
                          setAllResults(userGlobalBugs);
                        }}
                        className="mt-4 text-primary hover:text-primary text-sm font-medium"
                      >
                        View all {userGlobalBugs?.length} of your global bugs →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Global Bugs List */}
              {isLoading ? (
                <LoadingState />
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-error mb-4">{error}</p>
                  <Button onClick={loadGlobalBugBoard}>Try Again</Button>
                </div>
              ) : globalBugs?.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                  <Icon name="Bug" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Open Global Bugs</h3>
                  <p className="text-muted-foreground">
                    There are no open bugs in the global community at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {globalBugs?.map((bug) => (
                    <BugResultCard
                      key={`global-bug-${bug?.id}`}
                      bug={bug}
                      searchQuery={query}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Normal Explore View */
            <div className="space-y-6">
                {/* Results Section */}
                {isLoading ? (
                  <LoadingState />
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-error mb-4">{error}</p>
                    <Button onClick={searchAllContent}>Try Again</Button>
                  </div>
                ) : sortedResults?.length === 0 ? (
                  <EmptyState
                    searchQuery={query}
                    onClearFilters={handleClearFilters} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedResults?.map((result) => {
                        if (result?.type === 'snippet') {
                          return (
                            <SnippetResultCard
                              key={`snippet-${result?.id}`}
                              snippet={result}
                              searchQuery={query} />
                          );
                        }
                        if (result?.type === 'bug') {
                          return (
                            <BugResultCard
                              key={`bug-${result?.id}`}
                              bug={result}
                              searchQuery={query} />
                          );
                        }
                        if (result?.type === 'user') {
                          return (
                            <UserResultCard
                              key={`user-${result?.id}`}
                              user={result}
                              searchQuery={query}
                              onFollow={async (id) => { await friendRequestService?.followUser(id); }}
                              onUnfollow={async (id) => { await friendRequestService?.unfollowUser(id); }}
                            />
                          );
                        }
                        if (result?.type === 'team') {
                          return (
                            <TeamResultCard
                              key={`team-${result?.id}`}
                              team={result}
                              searchQuery={query} />
                          );
                        }
                        return null;
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          iconName="ChevronLeft"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)} />

                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 :
                                          currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                          currentPage - 2 + i;
                            if (pageNum > 0 && pageNum <= totalPages) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === pageNum
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}>
                                  {pageNum}
                                </button>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          iconName="ChevronRight"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)} />
                      </div>
                    )}
                  </>
                )}
            </div>
          )}
        </div>

        {/* Mobile Filter Panel (modal) */}
        <FilterPanel
          filters={advancedFilters}
          setFilters={setAdvancedFilters}
          onApplyFilters={handleSearch}
          isMobile={true}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)} />
      </div>
    </AppShell>
  );
};

export default SearchResultsPage;