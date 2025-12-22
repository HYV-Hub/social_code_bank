import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppNavigation from '../../components/AppNavigation';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <AppNavigation />
      <div className="flex">
        {/* Global Hives Sidebar */}
        <GlobalHivesSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Global Explore Feed
              </h1>
              <p className="text-gray-600">
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Feed Items */}
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading feed...</p>
                </div>
              </div>
            ) : feedItems?.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
                  <Icon name="Search" size={40} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No content found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters to discover more content
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-8">
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
        </main>
      </div>
    </div>
  );
}