import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppNavigation from '../../components/AppNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function HivesBrowsePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [privacyFilter, setPrivacyFilter] = useState(searchParams?.get('filter') || 'all');
  const [sortBy, setSortBy] = useState(searchParams?.get('sort') || 'trending');
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  
  // New UI states
  const [viewMode, setViewMode] = useState('grid');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hiveStats, setHiveStats] = useState({ total: 0, public: 0, private: 0, members: 0 });
  const [featuredHives, setFeaturedHives] = useState([]);

  useEffect(() => {
    loadHives();
    loadRecentSearches();
    loadFeaturedHives();
  }, [searchQuery, privacyFilter, sortBy, page]);

  // New useEffect for loading featured hives and stats
  useEffect(() => {
    loadFeaturedHives();
    loadHiveStats();
  }, []);

  const loadFeaturedHives = async () => {
    try {
      const result = await hiveService?.searchHives({
        sort: 'trending',
        limit: 3
      });
      setFeaturedHives(result?.hives?.slice(0, 3) || []);
    } catch (err) {
      console.error('Error loading featured hives:', err);
    }
  };

  const loadHiveStats = async () => {
    try {
      const result = await hiveService?.searchHives({ limit: 1000 });
      const total = result?.total || 0;
      const publicCount = result?.hives?.filter(h => h?.privacy === 'public')?.length || 0;
      const privateCount = total - publicCount;
      const totalMembers = result?.hives?.reduce((sum, h) => sum + (h?.member_count || 0), 0);
      
      setHiveStats({
        total,
        public: publicCount,
        private: privateCount,
        members: totalMembers
      });
    } catch (err) {
      console.error('Error loading hive stats:', err);
    }
  };

  // Helper function to get activity level badge
  const getActivityBadge = (memberCount) => {
    if (memberCount > 100) return { label: 'Very Active', color: 'bg-green-500', icon: '🔥' };
    if (memberCount > 50) return { label: 'Active', color: 'bg-blue-500', icon: '⚡' };
    if (memberCount > 10) return { label: 'Growing', color: 'bg-yellow-500', icon: '🌱' };
    return { label: 'New', color: 'bg-purple-500', icon: '✨' };
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 'k') {
        e?.preventDefault();
        document.getElementById('hive-search-input')?.focus();
      }
      // Ctrl/Cmd + N to create new hive
      if ((e?.ctrlKey || e?.metaKey) && e?.key === 'n' && user) {
        e?.preventDefault();
        navigate('/hive-creation-wizard');
      }
      // ? to show shortcuts
      if (e?.key === '?' && !e?.ctrlKey && !e?.metaKey) {
        e?.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user, navigate, showShortcuts]);

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('hive-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading recent searches:', err);
    }
  };

  const saveRecentSearch = (query) => {
    if (!query?.trim()) return;
    try {
      const updated = [query, ...recentSearches?.filter(s => s !== query)]?.slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('hive-recent-searches', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving recent search:', err);
    }
  };

  const loadHives = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await hiveService?.searchHives({
        q: searchQuery,
        privacy: privacyFilter === 'all' ? undefined : privacyFilter,
        sort: sortBy,
        page,
        limit: 12
      });

      setHives(result?.hives || []);
      setTotalPages(Math.ceil((result?.total || 0) / (result?.limit || 12)));

      // Update URL params
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (privacyFilter !== 'all') params.filter = privacyFilter;
      if (sortBy !== 'trending') params.sort = sortBy;
      if (page !== 1) params.page = page?.toString();
      if (categoryFilter !== 'all') params.category = categoryFilter;
      setSearchParams(params);

    } catch (err) {
      console.error('Error loading hives:', err);
      setError(err?.message || 'Failed to load hives');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e?.target?.value);
    setPage(1);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPrivacyFilter('all');
    setSortBy('trending');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || privacyFilter !== 'all' || sortBy !== 'trending';

  const handleHiveAction = async (hive) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (hive?.isMember) {
        navigate(`/hives/${hive?.id}`);
      } else if (hive?.privacy === 'public') {
        await hiveService?.joinHive(hive?.id);
        loadHives();
      } else {
        navigate(`/hives/${hive?.id}`);
      }
    } catch (err) {
      console.error('Error with hive action:', err);
      setError(err?.message || 'Failed to perform action');
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid', color: 'blue' },
    { id: 'javascript', name: 'JavaScript', icon: 'Code', color: 'yellow' },
    { id: 'python', name: 'Python', icon: 'FileCode', color: 'green' },
    { id: 'react', name: 'React', icon: 'Layout', color: 'cyan' },
    { id: 'nodejs', name: 'Node.js', icon: 'Server', color: 'lime' },
    { id: 'database', name: 'Database', icon: 'Database', color: 'purple' },
    { id: 'devops', name: 'DevOps', icon: 'GitBranch', color: 'orange' },
    { id: 'mobile', name: 'Mobile', icon: 'Smartphone', color: 'pink' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <AppNavigation />
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e?.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Focus Search</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl/⌘ + K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Create Hive</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl/⌘ + N</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <Icon name="Home" size={16} />
            <span>Home</span>
          </button>
          <Icon name="ChevronRight" size={16} className="text-gray-400" />
          <span className="text-gray-900 font-medium">My Hives</span>
        </nav>

        {/* Enhanced Hero Banner with Stats */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 mb-8 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Icon name="Users" size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold">Explore Global Hives</h1>
                </div>
                <p className="text-lg lg:text-xl text-blue-100 mb-4">
                  Join developer communities, share code snippets, and collaborate worldwide
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <Icon name="Users" size={16} />
                    <span className="font-semibold">{hives?.length || 0}</span>
                    <span className="text-blue-100">Active Hives</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <Icon name="TrendingUp" size={16} />
                    <span className="text-blue-100">Growing Community</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {user && (
                  <Button
                    onClick={() => navigate('/hive-creation-wizard')}
                    className="bg-white text-blue-600 hover:bg-blue-50 whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Icon name="Plus" size={20} className="flex-shrink-0" />
                    <span className="font-semibold">Create Hive</span>
                  </Button>
                )}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                  title="Keyboard Shortcuts"
                >
                  <Icon name="Keyboard" size={16} />
                  <span className="hidden sm:inline">Shortcuts</span>
                </button>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <Input
                  id="hive-search-input"
                  type="text"
                  placeholder="Search hives by name, description, or tags... (Ctrl+K)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => e?.key === 'Enter' && handleSearchSubmit(searchQuery)}
                  className="pl-12 py-3 w-full bg-white shadow-lg hover:shadow-xl transition-shadow"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchSubmit('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Recent Searches */}
            {!searchQuery && recentSearches?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-white/70">Recent:</span>
                {recentSearches?.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(search)}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Enhanced Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/90 mr-1 font-medium">Quick Filters:</span>
              <button
                onClick={() => { setPrivacyFilter('all'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg ${
                  privacyFilter === 'all' ?'bg-white text-blue-600 scale-105' :'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Icon name="Grid" size={14} />
                  All Hives
                </span>
              </button>
              <button
                onClick={() => { setPrivacyFilter('public'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg ${
                  privacyFilter === 'public' ?'bg-white text-blue-600 scale-105' :'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                🌍 Public
              </button>
              <button
                onClick={() => { setPrivacyFilter('private'); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg ${
                  privacyFilter === 'private' ?'bg-white text-blue-600 scale-105' :'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                🔒 Private
              </button>
              {user && (
                <button
                  onClick={() => navigate('/hive-creation-wizard')}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 transition-all shadow-md hover:shadow-lg flex items-center gap-1 backdrop-blur-sm"
                >
                  <Icon name="Plus" size={14} />
                  <span>New</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured/Trending Hives Section */}
        {!searchQuery && !loading && featuredHives?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Hives</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredHives?.map((hive, idx) => {
                const activity = getActivityBadge(hive?.member_count || 0);
                return (
                  <div
                    key={hive?.id}
                    className="relative bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-100 hover:border-blue-300 group"
                    onClick={() => navigate(`/hives/${hive?.id}`)}
                  >
                    {/* Trending Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Icon name="Flame" size={12} />
                      #{idx + 1}
                    </div>
                    {/* Activity Indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${activity?.color} text-white shadow-md flex items-center gap-1`}>
                        <span>{activity?.icon}</span>
                        {activity?.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hive?.privacy === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hive?.privacy === 'public' ? '🌍' : '🔒'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {hive?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {hive?.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        <span className="font-semibold">{hive?.member_count || 0}</span>
                      </div>
                      {hive?.tags && hive?.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Icon name="Tag" size={14} />
                          <span>{hive?.tags?.length}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleHiveAction(hive);
                      }}
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    >
                      {hive?.isMember ? 'Open Hive' : 'Join Now'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Filter" size={18} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Browse by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories?.map(category => (
              <button
                key={category?.id}
                onClick={() => {
                  setCategoryFilter(category?.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  categoryFilter === category?.id
                    ? `bg-${category?.color}-100 text-${category?.color}-700 border-2 border-${category?.color}-400 shadow-md`
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <Icon name={category?.icon} size={16} />
                <span>{category?.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-gray-600 font-medium">
              {!loading && `Found ${hives?.length} ${hives?.length === 1 ? 'hive' : 'hives'}`}
            </p>
            {hasActiveFilters && (
              <>
                <span className="text-gray-400">•</span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Icon name="X" size={14} />
                  Clear Filters
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Grid View"
              >
                <Icon name="LayoutGrid" size={16} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="List View"
              >
                <Icon name="List" size={16} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Sort:</span>
              <Select
                value={sortBy}
                onChange={(e) => { setSortBy(e?.target?.value); setPage(1); }}
                className="text-sm min-w-[150px]"
              >
                <option value="trending">🔥 Trending</option>
                <option value="newest">✨ Newest</option>
                <option value="members">👥 Most Members</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">Error loading hives</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Loading State with better skeletons */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :"space-y-4"
          }>
            {[1, 2, 3, 4, 5, 6]?.map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                  <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                </div>
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : hives?.length === 0 ? (
          // Enhanced Empty State
          (<div className="text-center py-20 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border-2 border-dashed border-blue-200">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-lg">
              <Icon name="Users" size={48} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No hives found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchQuery 
                ? 'Try adjusting your search query or filters to discover more communities' :'Be the first to create a hive and start an amazing collaboration journey!'}
            </p>
            {user && (
              <Button
                onClick={() => navigate('/hive-creation-wizard')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                size="lg"
              >
                <Icon name="Plus" size={24} className="mr-2" />
                <span className="font-semibold">Create First Hive</span>
              </Button>
            )}
          </div>)
        ) : (
          <>
            {/* Enhanced Hives Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :"space-y-4"
            }>
              {hives?.map(hive => {
                const activity = getActivityBadge(hive?.member_count || 0);
                
                return (
                  <div
                    key={hive?.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-blue-300 group ${
                      viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
                    }`}
                    onClick={() => navigate(`/hives/${hive?.id}`)}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                              {hive?.name}
                            </h3>
                            {/* Activity Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${activity?.color} text-white shadow-sm`}>
                              <span>{activity?.icon}</span>
                              {activity?.label}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-sm ${
                            hive?.privacy === 'public' ?'bg-green-100 text-green-800 border border-green-200' :'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {hive?.privacy === 'public' ? '🌍 Public' : '🔒 Private'}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                          {hive?.description || 'No description provided'}
                        </p>

                        {/* Enhanced Stats Section */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                            <Icon name="Users" size={16} className="text-blue-600 flex-shrink-0" />
                            <span className="font-semibold text-gray-900">{hive?.member_count || 0}</span>
                            <span className="text-xs">members</span>
                          </div>
                          {hive?.tags && hive?.tags?.length > 0 && (
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                              <Icon name="Tag" size={16} className="text-purple-600" />
                              <span className="font-semibold text-gray-900">{hive?.tags?.length}</span>
                              <span className="text-xs">tags</span>
                            </div>
                          )}
                        </div>

                        {/* Tags Display */}
                        {hive?.tags && hive?.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hive?.tags?.slice(0, 3)?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 hover:border-blue-300 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                            {hive?.tags?.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                                +{hive?.tags?.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Enhanced Action Button */}
                        <Button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleHiveAction(hive);
                          }}
                          className={`w-full shadow-md hover:shadow-lg transition-all ${
                            hive?.isMember
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                              : hive?.hasPendingRequest
                                ? 'bg-gray-400 cursor-not-allowed' :'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          }`}
                          disabled={hive?.hasPendingRequest}
                        >
                          <span className="flex items-center justify-center gap-2">
                            {hive?.isMember ? (
                              <>
                                <Icon name="ArrowRight" size={18} />
                                <span className="font-semibold">Open Hive</span>
                              </>
                            ) : hive?.hasPendingRequest ? (
                              <>
                                <Icon name="Clock" size={18} />
                                <span>Request Pending</span>
                              </>
                            ) : (
                              <>
                                <Icon name="UserPlus" size={18} />
                                <span className="font-semibold">
                                  {hive?.privacy === 'public' ? 'Join Hive' : 'Request to Join'}
                                </span>
                              </>
                            )}
                          </span>
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Enhanced List View */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {hive?.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                              hive?.privacy === 'public' ?'bg-green-100 text-green-800' :'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hive?.privacy === 'public' ? '🌍' : '🔒'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${activity?.color} text-white`}>
                              {activity?.icon}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-1 mb-2">
                            {hive?.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-gray-700">
                              <Icon name="Users" size={12} className="text-blue-600" />
                              <span className="font-semibold">{hive?.member_count || 0}</span>
                            </span>
                            {hive?.tags && hive?.tags?.length > 0 && (
                              <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-gray-700">
                                <Icon name="Tag" size={12} className="text-purple-600" />
                                <span className="font-semibold">{hive?.tags?.length}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleHiveAction(hive);
                          }}
                          size="sm"
                          className={`shadow-md hover:shadow-lg transition-all ${
                            hive?.isMember 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700' :'bg-gradient-to-r from-blue-600 to-indigo-600'
                          }`}
                          disabled={hive?.hasPendingRequest}
                        >
                          {hive?.isMember ? 'Open' : hive?.hasPendingRequest ? 'Pending' : 'Join'}
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="disabled:opacity-50 hover:bg-blue-50"
                >
                  <Icon name="ChevronLeft" size={20} />
                  <span className="ml-1 hidden sm:inline">Previous</span>
                </Button>
                
                {[...Array(totalPages)]?.map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'ghost'}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[40px] ${
                          page === pageNum 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (Math.abs(pageNum - page) === 2) {
                    return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  return null;
                })}

                <Button
                  variant="ghost"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="disabled:opacity-50 hover:bg-blue-50"
                >
                  <span className="mr-1 hidden sm:inline">Next</span>
                  <Icon name="ChevronRight" size={20} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Enhanced Floating Action Buttons - Bottom Right - Responsive for All Devices */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-40">
        {user && (
          <button
            onClick={() => navigate('/hive-creation-wizard')}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative"
            title="Create New Hive (Ctrl+N)"
            aria-label="Create new hive"
          >
            <Icon name="Plus" size={20} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:block absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Create Hive
            </span>
          </button>
        )}
        
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gray-200 group relative"
          title="Notifications"
          aria-label="View notifications"
        >
          <Icon name="Bell" size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Notifications
          </span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gray-200 group relative"
          title="Settings"
          aria-label="Open settings"
        >
          <Icon name="Settings" size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Settings
          </span>
        </button>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gray-200 group relative"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <Icon name="ArrowUp" size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Back to Top
          </span>
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-gray-200 group relative"
          title="Keyboard Shortcuts (?)"
          aria-label="Show keyboard shortcuts"
        >
          <Icon name="Keyboard" size={20} className="sm:w-6 sm:h-6" />
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Shortcuts
          </span>
        </button>
      </div>
    </div>
  );
}

// Add keyframe animation at the end
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head?.appendChild(style);