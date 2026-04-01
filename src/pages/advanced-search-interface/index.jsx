import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import SavedSearches from './components/SavedSearches';
import GlobalHivesSidebar from '../hive-explorer/components/GlobalHivesSidebar';

export default function AdvancedSearchInterface() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState({
    query: searchParams?.get('q') || '',
    contentType: searchParams?.get('type') || 'all',
    language: searchParams?.get('lang') || '',
    tags: searchParams?.get('tags') ? searchParams?.get('tags')?.split(',') : [],
    authorName: searchParams?.get('author') || '',
    dateRange: {
      from: searchParams?.get('from') || null,
      to: searchParams?.get('to') || null
    },
    engagementMin: {
      views: parseInt(searchParams?.get('minViews') || '0'),
      likes: parseInt(searchParams?.get('minLikes') || '0'),
      comments: parseInt(searchParams?.get('minComments') || '0')
    }
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    if (user) {
      loadSavedSearches();
    }
  }, [user]);

  useEffect(() => {
    if (searchParams?.get('q')) {
      handleSearch();
    }
  }, []);

  const loadSavedSearches = async () => {
    try {
      const data = await hiveService?.getSavedSearches();
      setSavedSearches(data);
    } catch (err) {
      console.error('Error loading saved searches:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      // Update URL params
      const params = new URLSearchParams();
      if (searchQuery?.query) params?.set('q', searchQuery?.query);
      if (searchQuery?.contentType !== 'all') params?.set('type', searchQuery?.contentType);
      if (searchQuery?.language) params?.set('lang', searchQuery?.language);
      if (searchQuery?.tags?.length > 0) params?.set('tags', searchQuery?.tags?.join(','));
      if (searchQuery?.authorName) params?.set('author', searchQuery?.authorName);
      if (searchQuery?.dateRange?.from) params?.set('from', searchQuery?.dateRange?.from);
      if (searchQuery?.dateRange?.to) params?.set('to', searchQuery?.dateRange?.to);
      if (searchQuery?.engagementMin?.views > 0) params?.set('minViews', searchQuery?.engagementMin?.views?.toString());
      if (searchQuery?.engagementMin?.likes > 0) params?.set('minLikes', searchQuery?.engagementMin?.likes?.toString());
      if (searchQuery?.engagementMin?.comments > 0) params?.set('minComments', searchQuery?.engagementMin?.comments?.toString());
      
      setSearchParams(params);

      const data = await hiveService?.advancedSearch(searchQuery);
      setResults(data);
    } catch (err) {
      console.error('Error performing search:', err);
      setError(err?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await hiveService?.saveSearch({
        name: searchName,
        query: searchQuery?.query,
        filters: searchQuery
      });
      
      setShowSaveModal(false);
      setSearchName('');
      loadSavedSearches();
    } catch (err) {
      console.error('Error saving search:', err);
      setError(err?.message);
    }
  };

  const handleLoadSavedSearch = (savedSearch) => {
    setSearchQuery(savedSearch?.filters);
    handleSearch();
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await hiveService?.deleteSavedSearch(searchId);
      loadSavedSearches();
    } catch (err) {
      console.error('Error deleting saved search:', err);
    }
  };

  return (
    <AppShell pageTitle="Advanced Search">
      <div className="flex">
        {/* Global Hives Sidebar */}
        <GlobalHivesSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Advanced Search
              </h1>
              <p className="text-muted-foreground">
                Powerful search with multi-criteria filtering and saved queries
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Form */}
              <div className="lg:col-span-2">
                <SearchForm
                  searchQuery={searchQuery}
                  onQueryChange={setSearchQuery}
                  onSearch={handleSearch}
                  loading={loading}
                />

                {/* Save Search Button */}
                {user && results && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveModal(true)}
                    >
                      <Icon name="Save" size={16} className="mr-2" />
                      Save This Search
                    </Button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-error">Error</p>
                      <p className="text-sm text-error mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {results && (
                  <div className="mt-8">
                    <SearchResults results={results} loading={loading} />
                  </div>
                )}
              </div>

              {/* Saved Searches Sidebar */}
              {user && (
                <div className="lg:col-span-1">
                  <SavedSearches
                    savedSearches={savedSearches}
                    onLoad={handleLoadSavedSearch}
                    onDelete={handleDeleteSavedSearch}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Save Search</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Search Name
                </label>
                <Input
                  value={searchName}
                  onChange={(e) => setSearchName(e?.target?.value)}
                  placeholder="Enter a name for this search"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSaveModal(false);
                  setSearchName('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveSearch}
                disabled={!searchName}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}