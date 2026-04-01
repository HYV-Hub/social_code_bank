import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PageShell from '../../components/PageShell';
import { Helmet } from 'react-helmet';
import { Search, Plus, Edit, Trash2, Eye, Globe, Lock, Users, Building, FolderPlus, Filter } from 'lucide-react';
import Select from '../../components/ui/Select';
import { collectionService } from '../../services/collectionService';
import Icon from '../../components/AppIcon';



export default function MySnippetsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippets, setSelectedSnippets] = useState(new Set());
  const [showOrganizeModal, setShowOrganizeModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showCreateCollectionForm, setShowCreateCollectionForm] = useState(false);
  const [showStandaloneCollectionModal, setShowStandaloneCollectionModal] = useState(false);
  const [newCollectionData, setNewCollectionData] = useState({
    title: '',
    description: '',
    isPublic: false,
    tags: []
  });

  // Filtering and sorting states
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' }
  ];

  const visibilityTabs = [
    { id: 'all', label: 'All Snippets', icon: Filter },
    { id: 'public', label: 'Public', icon: Globe },
    { id: 'private', label: 'Private', icon: Lock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'company', label: 'Company', icon: Building }
  ];

  // Add this block - Move filteredSnippets calculation before it's used
  const filteredSnippets = snippets?.filter(snippet =>
    snippet?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    snippet?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    snippet?.ai_tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
  );

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    loadSnippets();
    loadCollections();
  }, [authLoading, user, navigate, visibilityFilter, languageFilter, sortBy]);

  const loadSnippets = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase?.from('snippets')?.select('*')?.eq('user_id', user?.id);

      // Apply visibility filter
      if (visibilityFilter !== 'all') {
        query = query?.eq('visibility', visibilityFilter);
      }

      // Apply language filter
      if (languageFilter !== 'all') {
        query = query?.eq('language', languageFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query?.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query?.order('likes_count', { ascending: false });
          break;
        case 'views':
          query = query?.order('views_count', { ascending: false });
          break;
        case 'likes':
          query = query?.order('likes_count', { ascending: false });
          break;
        default:
          query = query?.order('created_at', { ascending: false });
      }

      const { data, error: snippetsError } = await query;

      if (snippetsError) throw snippetsError;

      setSnippets(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await collectionService?.getUserCollections();
      setCollections(data || []);
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection? Snippets in this collection will not be deleted.')) return;

    try {
      await collectionService?.deleteCollection(collectionId);
      loadCollections();
    } catch (err) {
      setError(err?.message || 'Failed to delete collection');
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const { error: deleteError } = await supabase?.from('snippets')?.delete()?.eq('id', snippetId)?.eq('user_id', user?.id);

      if (deleteError) throw deleteError;

      loadSnippets();
    } catch (err) {
      setError(err?.message || 'Failed to delete snippet');
    }
  };

  const handleSelectSnippet = (snippetId) => {
    const newSelected = new Set(selectedSnippets);
    if (newSelected?.has(snippetId)) {
      newSelected?.delete(snippetId);
    } else {
      newSelected?.add(snippetId);
    }
    setSelectedSnippets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSnippets?.size === filteredSnippets?.length) {
      setSelectedSnippets(new Set());
    } else {
      setSelectedSnippets(new Set(filteredSnippets.map(s => s?.id)));
    }
  };

  // NEW FUNCTION: Create standalone collection (without snippets)
  const handleCreateStandaloneCollection = async () => {
    if (!newCollectionData?.title?.trim()) {
      alert('Please enter a collection title');
      return;
    }

    try {
      // Create new collection
      await collectionService?.createCollection({
        title: newCollectionData?.title,
        description: newCollectionData?.description,
        isPublic: newCollectionData?.isPublic,
        tags: newCollectionData?.tags
      });

      // Reset and close
      setShowStandaloneCollectionModal(false);
      setNewCollectionData({ title: '', description: '', isPublic: false, tags: [] });
      
      // Reload collections
      await loadCollections();
      
      alert(`Successfully created collection "${newCollectionData?.title}"`);
    } catch (err) {
      setError(err?.message || 'Failed to create collection');
    }
  };

  const handleCreateAndOrganize = async () => {
    if (!newCollectionData?.title?.trim()) {
      alert('Please enter a collection title');
      return;
    }

    try {
      // Create new collection
      const newCollection = await collectionService?.createCollection({
        title: newCollectionData?.title,
        description: newCollectionData?.description,
        isPublic: newCollectionData?.isPublic,
        tags: newCollectionData?.tags
      });

      // Add selected snippets to the new collection
      for (const snippetId of selectedSnippets) {
        await collectionService?.addSnippetToCollection(newCollection?.id, snippetId);
      }

      // Reset and close
      setShowOrganizeModal(false);
      setShowCreateCollectionForm(false);
      setNewCollectionData({ title: '', description: '', isPublic: false, tags: [] });
      setSelectedSnippets(new Set());
      setSelectedCollection('');
      
      // Reload collections
      await loadCollections();
      
      alert(`Successfully created collection "${newCollectionData?.title}" and added ${selectedSnippets?.size} snippet(s)`);
    } catch (err) {
      setError(err?.message || 'Failed to create collection and organize snippets');
    }
  };

  const handleOrganizeToCollection = async () => {
    if (!selectedCollection || selectedSnippets?.size === 0) return;

    try {
      for (const snippetId of selectedSnippets) {
        await collectionService?.addSnippetToCollection(selectedCollection, snippetId);
      }

      setShowOrganizeModal(false);
      setSelectedSnippets(new Set());
      setSelectedCollection('');
      alert(`Successfully added ${selectedSnippets?.size} snippet(s) to collection`);
    } catch (err) {
      setError(err?.message || 'Failed to organize snippets');
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'bg-success/10 text-success';
      case 'private':
        return 'bg-error/10 text-error';
      case 'team':
        return 'bg-primary/10 text-primary';
      case 'company':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PageShell noPadding>
      <Helmet>
        <title>My Snippets - HyvHub</title>
      </Helmet>
        {/* Header */}
        <div className="bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Snippets</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  View, manage, and organize all your code snippets
                </p>
              </div>
              <div className="flex gap-3">
                {selectedSnippets?.size > 0 && (
                  <button
                    onClick={() => setShowOrganizeModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-background"
                  >
                    <FolderPlus className="w-5 h-5 mr-2" />
                    Organize ({selectedSnippets?.size})
                  </button>
                )}
                <button
                  onClick={() => navigate('/create-snippet')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Snippet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Filter Tabs */}
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {visibilityTabs?.map((tab) => {
                const Icon = tab?.icon;
                const count = tab?.id === 'all' 
                  ? snippets?.length 
                  : snippets?.filter(s => s?.visibility === tab?.id)?.length;
                
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setVisibilityFilter(tab?.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                      visibilityFilter === tab?.id
                        ? 'text-primary border-blue-600' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab?.label}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      visibilityFilter === tab?.id
                        ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search snippets by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <Select
                options={languageOptions}
                value={languageFilter}
                onChange={setLanguageFilter}
                placeholder="Filter by language"
              />
            </div>
            <div className="md:w-48">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort by"
              />
            </div>
          </div>

          {/* Bulk Selection */}
          {filteredSnippets?.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-card rounded-lg border border-border p-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSnippets?.size === filteredSnippets?.length && filteredSnippets?.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary focus:ring-ring border-border rounded mr-2"
                />
                <span className="text-sm text-foreground">
                  {selectedSnippets?.size > 0 
                    ? `${selectedSnippets?.size} snippet(s) selected` 
                    : 'Select all snippets'}
                </span>
              </label>
              <p className="text-sm text-muted-foreground">
                Showing {filteredSnippets?.length} {filteredSnippets?.length === 1 ? 'snippet' : 'snippets'}
                {visibilityFilter !== 'all' && ` (${visibilityFilter})`}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* UPDATED: Collections Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {collections?.length > 0 ? 'My Collections' : 'Create Your First Collection'}
            </h2>
            <button
              onClick={() => setShowStandaloneCollectionModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded-md shadow-sm font-medium text-foreground bg-card hover:bg-background"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Collection
            </button>
          </div>
          
          {collections?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {collections?.map((collection) => (
                <div
                  key={collection?.id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/collection-details?id=${collection?.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                          <Icon name="Folder" size={18} className="flex-shrink-0" />
                          {collection?.title}
                        </h3>
                        {collection?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {collection?.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            navigate(`/collection-details?id=${collection?.id}&edit=true`);
                          }}
                          className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors"
                          title="Edit collection"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleDeleteCollection(collection?.id);
                          }}
                          className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                          title="Delete collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Collection Stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Code" size={14} />
                          {collection?.snippetsCount || 0} snippets
                        </span>
                        {collection?.is_public && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            Public
                          </span>
                        )}
                        {!collection?.is_public && (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            Private
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(collection?.created_at)?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Collection Tags */}
                    {collection?.tags && collection?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {collection?.tags?.slice(0, 3)?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {collection?.tags?.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                            +{collection?.tags?.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg shadow-sm border-2 border-dashed border-border">
              <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No collections yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Organize your snippets by creating collections
              </p>
              <button
                onClick={() => setShowStandaloneCollectionModal(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Collection
              </button>
            </div>
          )}
        </div>

        {/* Snippets Section - Now displays BELOW collections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">Loading snippets...</p>
            </div>
          ) : filteredSnippets?.length === 0 && collections?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground text-lg mb-2">
                {searchQuery 
                  ? 'No snippets or collections found matching your search' :'No snippets or collections yet. Get started!'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first snippet or collection to organize your code
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/create-snippet')}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Snippet
                </button>
                <button
                  onClick={() => setShowCreateCollectionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-border text-foreground rounded-md hover:bg-background"
                >
                  <FolderPlus className="w-5 h-5 mr-2" />
                  Create Collection
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredSnippets?.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">All Snippets</h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredSnippets?.length} {filteredSnippets?.length === 1 ? 'snippet' : 'snippets'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSnippets?.map((snippet) => (
                      <div
                        key={snippet?.id}
                        className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        {/* Snippet Header with Checkbox */}
                        <div className="p-4 border-b border-border">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSnippets?.has(snippet?.id)}
                              onChange={() => handleSelectSnippet(snippet?.id)}
                              onClick={(e) => e?.stopPropagation()}
                              className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {snippet?.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(snippet?.created_at)?.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ml-2 ${getVisibilityColor(snippet?.visibility)}`}>
                                  {getVisibilityIcon(snippet?.visibility)}
                                  {snippet?.visibility}
                                </span>
                              </div>
                              {snippet?.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                  {snippet?.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Code Preview */}
                        <div className="bg-background p-4 border-b border-border">
                          <pre className="text-xs font-mono text-foreground line-clamp-3 overflow-hidden">
                            <code>{snippet?.code?.substring(0, 200)}</code>
                          </pre>
                        </div>

                        {/* Snippet Footer */}
                        <div className="p-4">
                          {/* Tags */}
                          {snippet?.ai_tags && snippet?.ai_tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {snippet?.ai_tags?.slice(0, 3)?.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {snippet?.ai_tags?.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                                  +{snippet?.ai_tags?.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Stats and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                ❤️ {snippet?.likes_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                💬 {snippet?.comments_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                👁️ {snippet?.views_count || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                {snippet?.language}
                              </span>
                              <button
                                onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/create-snippet?edit=${snippet?.id}`)}
                                className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e?.stopPropagation();
                                  handleDeleteSnippet(snippet?.id);
                                }}
                                className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Organize to Collection Modal */}
        {showOrganizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Organize Snippets</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add {selectedSnippets?.size} selected snippet(s) to a collection
              </p>

              {!showCreateCollectionForm ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Collection
                    </label>
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e?.target?.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="">-- Choose a collection --</option>
                      {collections?.map((collection) => (
                        <option key={collection?.id} value={collection?.id}>
                          {collection?.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowCreateCollectionForm(true)}
                    className="w-full mb-4 px-4 py-2 border-2 border-dashed border-blue-400 text-primary rounded-md hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Collection
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOrganizeModal(false);
                        setSelectedCollection('');
                      }}
                      className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-background"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleOrganizeToCollection}
                      disabled={!selectedCollection}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add to Collection
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Collection Title *
                      </label>
                      <input
                        type="text"
                        value={newCollectionData?.title}
                        onChange={(e) => setNewCollectionData({ ...newCollectionData, title: e?.target?.value })}
                        placeholder="e.g., React Best Practices"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={newCollectionData?.description}
                        onChange={(e) => setNewCollectionData({ ...newCollectionData, description: e?.target?.value })}
                        placeholder="Describe what this collection is about..."
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newCollectionData?.isPublic}
                        onChange={(e) => setNewCollectionData({ ...newCollectionData, isPublic: e?.target?.checked })}
                        className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                      />
                      <label htmlFor="isPublic" className="text-sm text-foreground">
                        Make this collection public
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCollectionForm(false);
                        setNewCollectionData({ title: '', description: '', isPublic: false, tags: [] });
                      }}
                      className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-background"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateAndOrganize}
                      disabled={!newCollectionData?.title?.trim()}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Create &amp; Add Snippets
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* NEW: Standalone Collection Creation Modal */}
        {showStandaloneCollectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Create New Collection</h2>
                <button
                  onClick={() => {
                    setShowStandaloneCollectionModal(false);
                    setNewCollectionData({ title: '', description: '', isPublic: false, tags: [] });
                  }}
                  className="text-muted-foreground hover:text-muted-foreground"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    value={newCollectionData?.title}
                    onChange={(e) => setNewCollectionData({ ...newCollectionData, title: e?.target?.value })}
                    placeholder="e.g., React Best Practices"
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCollectionData?.description}
                    onChange={(e) => setNewCollectionData({ ...newCollectionData, description: e?.target?.value })}
                    placeholder="Describe what this collection is about..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublicStandalone"
                    checked={newCollectionData?.isPublic}
                    onChange={(e) => setNewCollectionData({ ...newCollectionData, isPublic: e?.target?.checked })}
                    className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                  />
                  <label htmlFor="isPublicStandalone" className="text-sm text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Make this collection public
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowStandaloneCollectionModal(false);
                    setNewCollectionData({ title: '', description: '', isPublic: false, tags: [] });
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStandaloneCollection}
                  disabled={!newCollectionData?.title?.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Collection
                </button>
              </div>
            </div>
          </div>
        )}
    </PageShell>
  );
}