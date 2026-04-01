import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import PageShell from '../../components/PageShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import FeedItemCard from './components/FeedItemCard';
import FilterControls from './components/FilterControls';
import GlobalHivesSidebar from '../hive-explorer/components/GlobalHivesSidebar';

export default function GlobalExploreFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    contentType: 'all',
    language: 'all',
    recency: 'all'
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [activeFilters, page]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError('');

      const { items, total } = await hiveService?.getGlobalExploreFeed({
        ...activeFilters,
        page,
        limit: 20
      });

      if (page === 1) {
        setFeedItems(items);
      } else {
        setFeedItems(prev => [...prev, ...items]);
      }

      setHasMore(feedItems?.length + items?.length < total);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(1);
    setFeedItems([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLike = async (itemId, itemType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Implement like functionality based on item type
      console.log('Like:', itemId, itemType);
    } catch (err) {
      console.error('Error liking item:', err);
    }
  };

  const handleSave = async (itemId, itemType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Implement save functionality based on item type
      console.log('Save:', itemId, itemType);
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  return (
    <PageShell noPadding>
      <div className="flex">
        {/* Global Hives Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 border-r border-border bg-card overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
          <GlobalHivesSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Global Explore Feed
              </h1>
              <p className="text-muted-foreground">
                Discover trending snippets, popular discussions, and community highlights
              </p>
            </div>

            {/* Filter Controls */}
            <FilterControls
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-error mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Feed Items */}
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading feed...</p>
                </div>
              </div>
            ) : feedItems?.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
                  <Icon name="Search" size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No content found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Try adjusting your filters to discover more content
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {feedItems?.map((item) => (
                    <FeedItemCard
                      key={item?.id}
                      item={item}
                      onLike={handleLike}
                      onSave={handleSave}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </div>
      </div>
    </PageShell>
  );
}