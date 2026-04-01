import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function GlobalHivesLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [activeFilter, setActiveFilter] = useState(searchParams?.get('filter') || 'all');
  const [activeSort, setActiveSort] = useState(searchParams?.get('sort') || 'trending');
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [myHives, setMyHives] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadHives();
    if (user) {
      loadMyHives();
    }
  }, [searchQuery, activeFilter, activeSort, page]);

  const loadHives = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { hives: data, total } = await hiveService?.searchHives({
        query: searchQuery,
        privacy: activeFilter === 'all' ? 'all' : activeFilter,
        sort: activeSort,
        page,
        limit: 12
      });
      
      setHives(data);
      setTotalPages(Math.ceil(total / 12));
    } catch (err) {
      console.error('Error loading hives:', err);
      setError(err?.message || 'Failed to load hives');
    } finally {
      setLoading(false);
    }
  };

  const loadMyHives = async () => {
    try {
      const data = await hiveService?.getUserHives();
      setMyHives(data);
    } catch (err) {
      console.error('Error loading my hives:', err);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    updateURL({ q: searchQuery, page: 1 });
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
    updateURL({ filter, page: 1 });
  };

  const handleSortChange = (sort) => {
    setActiveSort(sort);
    setPage(1);
    updateURL({ sort, page: 1 });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params)?.forEach(([key, value]) => {
      if (value) {
        newParams?.set(key, value);
      } else {
        newParams?.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleJoinHive = async (hiveId, privacy) => {
    try {
      if (privacy === 'public') {
        await hiveService?.joinHive(hiveId);
      } else {
        await hiveService?.requestJoinHive(hiveId);
      }
      loadHives();
      loadMyHives();
    } catch (err) {
      console.error('Error joining hive:', err);
      setError(err?.message);
    }
  };

  const handleCreateHive = async (hiveData) => {
    try {
      await hiveService?.createHive(hiveData);
      setIsCreateModalOpen(false);
      loadHives();
      loadMyHives();
    } catch (err) {
      console.error('Error creating hive:', err);
      throw err;
    }
  };

  return (
    <AppShell pageTitle="Hives">
      <div className="flex">
        {/* Persistent Sidebar */}
        <aside className="hidden lg:block w-80 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Hive Switcher Dropdown */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">My Hives</h3>
              {user ? (
                myHives?.length > 0 ? (
                  <div className="space-y-2">
                    {myHives?.map((hive) => (
                      <button
                        key={hive?.id}
                        onClick={() => navigate(`/hive-explorer?id=${hive?.id}`)}
                        className="w-full flex items-center justify-between p-3 hover:bg-background rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${
                            hive?.privacy === 'private' ? 'bg-warning' : 'bg-success'
                          }`} />
                          <span className="text-sm font-medium text-foreground truncate">{hive?.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {hive?.memberCount} members
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground text-center mb-3">No hives joined yet</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Create Hive
                    </Button>
                  </div>
                )
              ) : (
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground text-center mb-3">Sign in to join hives</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Global Hive Search */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Search Hives</h3>
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Search hives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full"
                />
              </form>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!user}
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Create Hive
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/hives')}
              >
                <Icon name="Search" size={18} className="mr-2" />
                Browse All Hives
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Banner */}
            <div className="bg-primary rounded-xl p-8 mb-8 text-white">
              <h1 className="text-4xl font-bold mb-4">Explore Hives</h1>
              <p className="text-lg mb-6 opacity-90">
                Join communities of developers sharing knowledge, code snippets, and best practices
              </p>
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search hives by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="flex-1 bg-card text-foreground"
                />
                <Button type="submit" variant="secondary">
                  <Icon name="Search" size={20} />
                </Button>
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-foreground flex items-center">Filter:</span>
                {['all', 'public', 'private']?.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? 'bg-primary text-white' :'bg-card text-foreground hover:bg-background border border-border'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter?.charAt(0)?.toUpperCase() + filter?.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 ml-auto">
                <span className="text-sm font-medium text-foreground flex items-center">Sort:</span>
                {[
                  { value: 'trending', label: 'Trending' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'members', label: 'Most Members' },
                  { value: 'active', label: 'Most Active' }
                ]?.map((sort) => (
                  <button
                    key={sort?.value}
                    onClick={() => handleSortChange(sort?.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSort === sort?.value
                        ? 'bg-primary text-white' :'bg-card text-foreground hover:bg-background border border-border'
                    }`}
                  >
                    {sort?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-error">Error</p>
                  <p className="text-sm text-error mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Hive Cards Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading hives...</p>
                </div>
              </div>
            ) : hives?.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <Icon name="Hexagon" size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No hives found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search or filters' :'Be the first to create a hive and start collaborating!'
                  }
                </p>
                {user && !searchQuery && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Create Your First Hive
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {hives?.map((hive) => (
                    <div
                      key={hive?.id}
                      className="bg-card rounded-xl border border-border hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/hive-explorer?id=${hive?.id}`)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-foreground flex-1">{hive?.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            hive?.privacy === 'public' ?'bg-success/15 text-success' :'bg-warning/15 text-warning'
                          }`}>
                            {hive?.privacy}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{hive?.description}</p>
                        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Users" size={16} />
                            {hive?.memberCount} members
                          </span>
                          {hive?.snippetCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Icon name="Code" size={16} />
                              {hive?.snippetCount} snippets
                            </span>
                          )}
                        </div>
                        {hive?.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hive?.tags?.slice(0, 3)?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-muted text-foreground rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e?.stopPropagation();
                            if (hive?.joinStatus === 'member') {
                              navigate(`/hive-explorer?id=${hive?.id}`);
                            } else if (hive?.joinStatus === 'pending') {
                              // Do nothing - already pending
                            } else {
                              handleJoinHive(hive?.id, hive?.privacy);
                            }
                          }}
                          disabled={!user || hive?.joinStatus === 'pending'}
                        >
                          {hive?.joinStatus === 'member' ? (
                            <>
                              <Icon name="Check" size={16} className="mr-2" />
                              Open Hive
                            </>
                          ) : hive?.joinStatus === 'pending' ? (
                            'Pending'
                          ) : hive?.privacy === 'public' ? (
                            'Join Hive'
                          ) : (
                            'Request to Join'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPage(page - 1);
                        updateURL({ page: page - 1 });
                      }}
                      disabled={page === 1}
                    >
                      <Icon name="ChevronLeft" size={16} />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPage(page + 1);
                        updateURL({ page: page + 1 });
                      }}
                      disabled={page === totalPages}
                    >
                      <Icon name="ChevronRight" size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {/* Create Hive Modal - Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Hive</h2>
            <form onSubmit={(e) => {
              e?.preventDefault();
              const formData = new FormData(e.target);
              handleCreateHive({
                name: formData?.get('name'),
                description: formData?.get('description'),
                privacy: formData?.get('privacy')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Hive Name</label>
                  <Input name="name" required placeholder="Enter hive name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                    rows="3"
                    placeholder="Describe your hive..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Privacy</label>
                  <select
                    name="privacy"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Hive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}