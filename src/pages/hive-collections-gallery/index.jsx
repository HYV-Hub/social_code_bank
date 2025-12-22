import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, TrendingUp, Clock, Users, Eye, Bookmark, Share2, ChevronDown, X, ArrowLeft, ArrowUp } from 'lucide-react';
import { hiveCollectionService } from '../../services/hiveCollectionService';
import { useAuth } from '../../components/AuthContext';
import Icon from '../../components/ui/Icon';

const HiveCollectionsGallery = () => {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [sortBy, setSortBy] = useState('recent');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState(null);
  
  // Featured collections
  const [featuredCollections, setFeaturedCollections] = useState([]);

  useEffect(() => {
    loadCollections();
  }, [hiveId]);

  useEffect(() => {
    applyFilters();
  }, [collections, searchQuery, sortBy, filterLanguage, filterType]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await hiveCollectionService?.getHiveCollections(hiveId);
      setCollections(data || []);
      
      // Identify featured collections (e.g., most popular or curated)
      const featured = (data || [])?.filter(c => c?.snippet_count >= 5)?.slice(0, 3);
      setFeaturedCollections(featured);
      
    } catch (err) {
      console.error('Error loading collections:', err);
      setError(err?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...collections];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(c => 
        c?.name?.toLowerCase()?.includes(query) ||
        c?.description?.toLowerCase()?.includes(query)
      );
    }
    
    // Language filter
    if (filterLanguage !== 'all') {
      filtered = filtered?.filter(c => 
        c?.primary_language?.toLowerCase() === filterLanguage?.toLowerCase()
      );
    }
    
    // Note: Type filter (public/private) removed as hive_collections table doesn't have is_public column
    
    // Sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b?.view_count || 0) - (a?.view_count || 0);
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'snippets':
          return (b?.snippet_count || 0) - (a?.snippet_count || 0);
        case 'name':
          return (a?.name || '')?.localeCompare(b?.name || '');
        default:
          return 0;
      }
    });
    
    setFilteredCollections(filtered);
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/hive-collection-detail/${collectionId}`);
  };

  const handleSaveCollection = async (collectionId, e) => {
    e?.stopPropagation();
    try {
      // Implement save functionality
      console.log('Save collection:', collectionId);
    } catch (err) {
      console.error('Error saving collection:', err);
    }
  };

  const handleShareCollection = async (collectionId, e) => {
    e?.stopPropagation();
    try {
      const url = `${window.location?.origin}/hive-collection-detail/${collectionId}`;
      await navigator.clipboard?.writeText(url);
      alert('Collection link copied to clipboard!');
    } catch (err) {
      console.error('Error sharing collection:', err);
    }
  };

  const saveFilterConfiguration = () => {
    const config = {
      sortBy,
      filterLanguage,
      filterType,
      searchQuery
    };
    setSavedFilters(config);
    localStorage.setItem(`hive_${hiveId}_filters`, JSON.stringify(config));
    alert('Filter configuration saved!');
  };

  const loadSavedFilters = () => {
    const saved = localStorage.getItem(`hive_${hiveId}_filters`);
    if (saved) {
      const config = JSON.parse(saved);
      setSortBy(config?.sortBy || 'recent');
      setFilterLanguage(config?.filterLanguage || 'all');
      setFilterType(config?.filterType || 'all');
      setSearchQuery(config?.searchQuery || '');
    }
  };

  const clearFilters = () => {
    setSortBy('recent');
    setFilterLanguage('all');
    setFilterType('all');
    setSearchQuery('');
  };

  const getLanguages = () => {
    const languages = new Set();
    collections?.forEach(c => {
      if (c?.primary_language) languages?.add(c?.primary_language);
    });
    return Array.from(languages);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCollections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-20">
      {/* Enhanced Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-b border-blue-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Grid className="w-8 h-8" />
                </div>
                Hive Collections Gallery
              </h1>
              <p className="text-blue-100 text-lg">
                📚 Discover and browse {collections?.length} collections from hive members
              </p>
            </div>
            
            {/* Enhanced Search Bar with glass morphism effect */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  placeholder="🔍 Search collections, descriptions, snippets..."
                  className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-xl shadow-lg focus:ring-4 focus:ring-white/30 focus:border-white transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            
            {/* Enhanced View Toggle with better styling */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid' ?'bg-white text-blue-600 shadow-lg scale-105' :'text-white hover:bg-white/20'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list' ?'bg-white text-blue-600 shadow-lg scale-105' :'text-white hover:bg-white/20'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Featured Collections Section with better visual design */}
      {featuredCollections?.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-12 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold">⭐ Featured Collections</h2>
                <p className="text-white/90">Top collections curated for you</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCollections?.map((collection) => (
                <div
                  key={collection?.id}
                  onClick={() => handleCollectionClick(collection?.id)}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl group-hover:text-yellow-300 transition-colors">{collection?.name}</h3>
                    <div className="p-2 bg-yellow-400/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-yellow-300" />
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {collection?.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                      <Users className="w-4 h-4" />
                      {collection?.creator_name}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                      <Eye className="w-4 h-4" />
                      {collection?.view_count || 0} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filter Controls with better visual hierarchy */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e?.target?.value)}
                  className="appearance-none px-5 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-gray-700 cursor-pointer hover:border-gray-300 transition-all"
                >
                  <option value="recent">🕐 Most Recent</option>
                  <option value="popular">🔥 Most Popular</option>
                  <option value="snippets">📦 Most Snippets</option>
                  <option value="name">🔤 Name (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              
              {(sortBy !== 'recent' || filterLanguage !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveFilterConfiguration}
                className="px-5 py-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all font-medium"
              >
                💾 Save Filters
              </button>
              <button
                onClick={loadSavedFilters}
                className="px-5 py-3 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all font-medium"
              >
                📂 Load Saved
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🌐 Programming Language
                  </label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e?.target?.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="all">All Languages</option>
                    {getLanguages()?.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Results Count with better visual design */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-700 font-medium">
              Showing <span className="font-bold text-blue-600">{filteredCollections?.length}</span> of <span className="font-bold">{collections?.length}</span> collections
            </p>
          </div>
        </div>

        {/* Collections Grid/List with enhanced cards */}
        {filteredCollections?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No collections found</h3>
              <p className="text-gray-600 text-lg">
                {searchQuery ? '🔍 Try adjusting your search or filters' : '📦 No collections available in this hive yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' :'space-y-4'
          }>
            {filteredCollections?.map((collection) => (
              <CollectionCard
                key={collection?.id}
                collection={collection}
                viewMode={viewMode}
                onCollectionClick={handleCollectionClick}
                onSave={handleSaveCollection}
                onShare={handleShareCollection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center justify-center w-14 h-14 bg-white text-gray-700 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-gray-200 hover:border-blue-500"
          title="Go Back"
        >
          <Icon name="ArrowLeft" size={24} className="group-hover:text-blue-600 transition-colors" />
        </button>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
          title="Scroll to Top"
        >
          <Icon name="ArrowUp" size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// Enhanced CollectionCard component
const CollectionCard = ({ collection, viewMode, onCollectionClick, onSave, onShare }) => {
  const cardClass = viewMode === 'grid' ?'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-300 hover:scale-105' :'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex border border-gray-100 hover:border-blue-300';

  return (
    <div className={cardClass} onClick={() => onCollectionClick(collection?.id)}>
      {/* Enhanced Preview Thumbnail with gradient and animation */}
      {viewMode === 'grid' && (
        <div className="h-56 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 drop-shadow-lg">{collection?.snippet_count || 0}</div>
              <div className="text-sm font-medium uppercase tracking-wider">Code Snippets</div>
            </div>
          </div>
          {collection?.primary_language && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 text-xs font-bold shadow-lg">
                {collection?.primary_language}
              </span>
            </div>
          )}
          {/* Decorative animated circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-75"></div>
        </div>
      )}
      <div className={viewMode === 'grid' ? 'p-6' : 'flex-1 p-6 flex items-center gap-6'}>
        {viewMode === 'list' && (
          <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <div className="text-center">
              <div className="text-2xl font-bold">{collection?.snippet_count || 0}</div>
              <div className="text-xs">Snippets</div>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {collection?.name}
            </h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {collection?.description || 'No description available'}
          </p>
          
          {/* Enhanced Creator Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {collection?.creator_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Created by</p>
              <p className="text-sm text-gray-900 font-semibold">{collection?.creator_name || 'Unknown'}</p>
            </div>
          </div>
          
          {/* Enhanced Engagement Metrics */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{collection?.view_count || 0}</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">{new Date(collection.created_at)?.toLocaleDateString()}</span>
            </span>
          </div>
          
          {/* Enhanced Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e?.stopPropagation(); onCollectionClick(collection?.id); }}
              className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              View Collection →
            </button>
            <button
              onClick={(e) => { e?.stopPropagation(); onSave(collection?.id, e); }}
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Save Collection"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e?.stopPropagation(); onShare(collection?.id, e); }}
              className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Share Collection"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveCollectionsGallery;