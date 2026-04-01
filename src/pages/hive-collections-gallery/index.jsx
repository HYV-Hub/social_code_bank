import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, TrendingUp, Clock, Users, Eye, Bookmark, Share2, ChevronDown, X, ArrowLeft, ArrowUp } from 'lucide-react';
import { hiveCollectionService } from '../../services/hiveCollectionService';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/ui/Icon';
import AppShell from '../../components/AppShell';

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
      <AppShell pageTitle="Collections Gallery">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading collections...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell pageTitle="Collections Gallery">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={loadCollections}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Collections Gallery">
      {/* Enhanced Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-b border-blue-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 bg-card/20 rounded-lg backdrop-blur-sm">
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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  placeholder="🔍 Search collections, descriptions, snippets..."
                  className="w-full pl-12 pr-4 py-3 bg-card/95 backdrop-blur-sm border-2 border-white/50 rounded-xl shadow-lg focus:ring-4 focus:ring-white/30 focus:border-white transition-all text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>
            
            {/* Enhanced View Toggle with better styling */}
            <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid' ?'bg-card text-primary shadow-lg scale-105' :'text-white hover:bg-card/20'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list' ?'bg-card text-primary shadow-lg scale-105' :'text-white hover:bg-card/20'
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
              <div className="p-3 bg-card/20 rounded-xl backdrop-blur-sm">
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
                  className="group bg-card/10 backdrop-blur-md rounded-xl p-6 cursor-pointer hover:bg-card/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 hover:shadow-2xl"
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
                    <span className="flex items-center gap-2 bg-card/10 px-3 py-1.5 rounded-lg">
                      <Users className="w-4 h-4" />
                      {collection?.creator_name}
                    </span>
                    <span className="flex items-center gap-2 bg-card/10 px-3 py-1.5 rounded-lg">
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
        <div className="bg-card rounded-xl shadow-xl p-6 mb-8 border border-border">
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
                  className="appearance-none px-5 py-3 pr-10 border-2 border-border rounded-xl focus:ring-4 focus:ring-ring/20 focus:border-blue-500 bg-card font-medium text-foreground cursor-pointer hover:border-border transition-all"
                >
                  <option value="recent">🕐 Most Recent</option>
                  <option value="popular">🔥 Most Popular</option>
                  <option value="snippets">📦 Most Snippets</option>
                  <option value="name">🔤 Name (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              
              {(sortBy !== 'recent' || filterLanguage !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-error bg-error/10 rounded-xl hover:bg-error/15 transition-all font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveFilterConfiguration}
                className="px-5 py-3 text-primary bg-primary/10 rounded-xl hover:bg-primary/15 transition-all font-medium"
              >
                💾 Save Filters
              </button>
              <button
                onClick={loadSavedFilters}
                className="px-5 py-3 text-secondary bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all font-medium"
              >
                📂 Load Saved
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t-2 border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    🌐 Programming Language
                  </label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e?.target?.value)}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-ring/20 focus:border-blue-500 font-medium"
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
          <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-xl shadow-md border border-border">
            <div className="w-2 h-2 bg-success/100 rounded-full animate-pulse"></div>
            <p className="text-foreground font-medium">
              Showing <span className="font-bold text-primary">{filteredCollections?.length}</span> of <span className="font-bold">{collections?.length}</span> collections
            </p>
          </div>
        </div>

        {/* Collections Grid/List with enhanced cards */}
        {filteredCollections?.length === 0 ? (
          <div className="bg-card rounded-xl shadow-xl p-16 text-center border border-border">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No collections found</h3>
              <p className="text-muted-foreground text-lg">
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
          className="group flex items-center justify-center w-14 h-14 bg-card text-foreground rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-border hover:border-blue-500"
          title="Go Back"
        >
          <Icon name="ArrowLeft" size={24} className="group-hover:text-primary transition-colors" />
        </button>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
          title="Scroll to Top"
        >
          <Icon name="ArrowUp" size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </AppShell>
  );
};

// Enhanced CollectionCard component
const CollectionCard = ({ collection, viewMode, onCollectionClick, onSave, onShare }) => {
  const cardClass = viewMode === 'grid' ?'group bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-border hover:border-blue-300 hover:scale-105' :'group bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex border border-border hover:border-blue-300';

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
              <span className="px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full text-foreground text-xs font-bold shadow-lg">
                {collection?.primary_language}
              </span>
            </div>
          )}
          {/* Decorative animated circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-card/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-card/10 rounded-full animate-pulse delay-75"></div>
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
            <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {collection?.name}
            </h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
            {collection?.description || 'No description available'}
          </p>
          
          {/* Enhanced Creator Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-background rounded-lg group-hover:bg-primary/10 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {collection?.creator_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Created by</p>
              <p className="text-sm text-foreground font-semibold">{collection?.creator_name || 'Unknown'}</p>
            </div>
          </div>
          
          {/* Enhanced Engagement Metrics */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg group-hover:bg-primary/10 transition-colors">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-semibold">{collection?.view_count || 0}</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg group-hover:bg-primary/10 transition-colors">
              <Clock className="w-4 h-4 text-secondary" />
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
              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
              title="Save Collection"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e?.stopPropagation(); onShare(collection?.id, e); }}
              className="p-2.5 text-muted-foreground hover:text-secondary hover:bg-indigo-50 rounded-xl transition-all"
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