import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FeedItemCard from './components/FeedItemCard';
import FilterControls from './components/FilterControls';
import CompactListItem from './components/CompactListItem';
import ExploreSidebar from './components/ExploreSidebar';

export default function GlobalExploreFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter state
  const [contentType, setContentType] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTagFilter, setActiveTagFilter] = useState(null);

  // View mode
  const [viewMode, setViewMode] = useState('grid');

  // Sidebar data
  const [categories, setCategories] = useState([]);
  const [sidebarData, setSidebarData] = useState({ tags: [], contributors: [], stats: {} });

  // Load sidebar data once
  useEffect(() => {
    Promise.all([
      hiveService?.getTrendingTags?.(15),
      hiveService?.getTopContributors?.(5),
      hiveService?.getExploreStats?.(),
      hiveService?.getCategoryCounts?.(),
    ]).then(([tags, contributors, stats, cats]) => {
      setSidebarData({ tags: tags || [], contributors: contributors || [], stats: stats || {} });
      setCategories(cats || []);
    }).catch(err => {
      console.error('Error loading sidebar data:', err);
    });
  }, []);

  // Load feed when filters change
  useEffect(() => {
    loadFeed();
  }, [contentType, language, sortBy, activeCategory, activeTagFilter, page]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError('');

      const { items, total } = await hiveService?.getGlobalExploreFeed({
        contentType,
        language,
        sortBy,
        category: activeCategory,
        tagFilter: activeTagFilter,
        page,
        limit: 20
      });

      if (page === 1) {
        setFeedItems(items || []);
      } else {
        setFeedItems(prev => [...prev, ...(items || [])]);
      }

      setHasMore((feedItems?.length || 0) + (items?.length || 0) < total);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const resetAndReload = () => {
    setPage(1);
    setFeedItems([]);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    resetAndReload();
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    resetAndReload();
  };

  const handleContentTypeChange = (value) => {
    setContentType(value);
    resetAndReload();
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    resetAndReload();
  };

  const handleTagClick = (tag) => {
    setActiveTagFilter(tag === activeTagFilter ? null : tag);
    resetAndReload();
  };

  const handleTagClear = () => {
    setActiveTagFilter(null);
    resetAndReload();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Sidebar component
  const sidebar = (
    <ExploreSidebar
      trendingTags={sidebarData.tags}
      topContributors={sidebarData.contributors}
      stats={sidebarData.stats}
      onTagClick={handleTagClick}
    />
  );

  return (
    <AppShell pageTitle="Explore" rightSidebar={sidebar}>
      <div className="p-4 lg:p-6">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">Discover Code</h1>
            <p className="text-xs text-muted-foreground">Find snippets, patterns, and solutions shared by developers</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Grid view"
            >
              <Icon name="LayoutGrid" size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="List view"
            >
              <Icon name="List" size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterControls
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
          activeLanguage={language}
          onLanguageChange={handleLanguageChange}
          activeContentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          activeTagFilter={activeTagFilter}
          onTagClear={handleTagClear}
        />

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error">Error</p>
              <p className="text-sm text-error mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && page === 1 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="hyv-card p-4">
                  <div className="h-3 w-16 hyv-skeleton mb-2 rounded" />
                  <div className="h-4 w-3/4 hyv-skeleton mb-2 rounded" />
                  <div className="h-3 w-1/2 hyv-skeleton mb-3 rounded" />
                  <div className="flex gap-1 mb-3">
                    <div className="h-5 w-12 hyv-skeleton rounded" />
                    <div className="h-5 w-14 hyv-skeleton rounded" />
                    <div className="h-5 w-10 hyv-skeleton rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 hyv-skeleton rounded" />
                    <div className="h-3 w-12 hyv-skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="hyv-card px-4 py-3 flex items-center gap-4">
                  <div className="h-4 flex-1 hyv-skeleton rounded" />
                  <div className="h-4 w-12 hyv-skeleton rounded" />
                  <div className="h-4 w-20 hyv-skeleton rounded" />
                </div>
              ))}
            </div>
          )
        ) : feedItems?.length === 0 ? (
          /* Empty state */
          <div className="hyv-empty">
            <Icon name="Search" size={40} className="mb-3 opacity-30 text-primary" />
            <h3 className="text-base font-semibold text-foreground mb-1">No content found</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">Try adjusting your filters or explore a different category</p>
            <button
              onClick={() => { setActiveCategory(null); setActiveTagFilter(null); setLanguage('all'); setContentType('all'); setSortBy('trending'); resetAndReload(); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid view */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedItems.map((item) => (
                  <FeedItemCard
                    key={item?.id}
                    item={item}
                    onLike={() => {}}
                    onSave={() => {}}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            )}

            {/* List view */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {feedItems.map((item) => (
                  <CompactListItem
                    key={item?.id}
                    item={item}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-border border-t-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
