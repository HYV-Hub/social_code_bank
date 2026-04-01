import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import AppNavigation from '../../components/AppNavigation';
import CollectionHeader from './components/CollectionHeader';
import FilterPanel from './components/FilterPanel';
import SnippetCard from './components/SnippetCard';
import AddSnippetModal from './components/AddSnippetModal';
import { 
  getHiveCollectionById, 
  getCollectionSnippets,
  removeSnippetFromCollection,
  updateHiveCollection
} from '../../services/hiveCollectionService';
import { useAuth } from '../../components/AuthContext';

const HiveCollectionDetail = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    language: 'all',
    search: ''
  });

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  useEffect(() => {
    if (collection) {
      loadSnippets();
    }
  }, [collection, filters]);

  const loadCollection = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getHiveCollectionById(collectionId);

    if (error) {
      console.error('Error loading collection:', error);
      setError(error?.message || 'Failed to load collection');
      // Don't redirect immediately - show error state
    } else {
      setCollection(data);
    }
    setLoading(false);
  };

  const loadSnippets = async () => {
    setSnippetsLoading(true);
    const { data, error } = await getCollectionSnippets(collectionId, filters);

    if (error) {
      console.error('Error loading snippets:', error);
      setSnippets([]);
    } else {
      // Extract snippet data from the nested structure
      const snippetData = data?.map(item => ({
        ...item?.snippet,
        addedAt: item?.added_at,
        collectionSnippetId: item?.id,
        addedBy: item?.added_by
      })) || [];
      setSnippets(snippetData);
    }
    setSnippetsLoading(false);
  };

  const handleRemoveSnippet = async (snippetId) => {
    if (!window.confirm('Remove this snippet from the collection?')) {
      return;
    }

    const { error } = await removeSnippetFromCollection(collectionId, snippetId);

    if (error) {
      alert(`Error removing snippet: ${error?.message}`);
    } else {
      setSnippets(snippets?.filter(s => s?.id !== snippetId));
      // Update collection snippet count
      setCollection({
        ...collection,
        snippet_count: Math.max((collection?.snippet_count || 1) - 1, 0)
      });
    }
  };

  const handleUpdateCollection = async (updates) => {
    const { data, error } = await updateHiveCollection(collectionId, updates);

    if (error) {
      alert(`Error updating collection: ${error?.message}`);
    } else {
      setCollection(data);
    }
  };

  const handleSnippetAdded = () => {
    loadCollection();
    loadSnippets();
  };

  const isOwner = collection?.created_by === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <AppNavigation />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-foreground font-medium text-lg">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
        <AppNavigation />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowLeft className="w-12 h-12 text-error" />
            </div>
            <div className="bg-card rounded-xl shadow-xl p-8 mb-6 border-2 border-red-100">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                {error ? '⚠️ Error Loading Collection' : '🔍 Collection Not Found'}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {error || 'The collection you are looking for could not be found.'}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <AppNavigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Back Button */}
          <button
            onClick={() => navigate(`/hives/${collection?.hive?.id}`)}
            className="group flex items-center gap-3 text-foreground hover:text-primary mb-8 transition-all font-medium bg-card px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Hive</span>
          </button>

          {/* Enhanced Collection Header Component */}
          <CollectionHeader
            collection={collection}
            isOwner={isOwner}
            onUpdate={handleUpdateCollection}
            canManage={isOwner}
            onBack={() => navigate(`/hives/${collection?.hive?.id}`)}
            onEdit={handleUpdateCollection}
          />

          {/* Enhanced Filter Panel and Add Button with better visual design */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 bg-card rounded-xl p-6 shadow-xl border border-border">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
            />

            {isOwner && (
              <button
                onClick={() => setShowAddModal(true)}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Add Snippet</span>
              </button>
            )}
          </div>

          {/* Enhanced Snippets Grid with better loading and empty states */}
          {snippetsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : snippets?.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border-2 border-dashed border-border shadow-lg">
              <div className="max-w-md mx-auto px-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {filters?.search || filters?.language !== 'all' ? '🔍 No snippets match your filters' : '📦 This collection is empty'}
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {filters?.search || filters?.language !== 'all' ?'Try adjusting your search criteria' :'Start building your collection by adding snippets'}
                </p>
                {isOwner && !filters?.search && filters?.language === 'all' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add First Snippet</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets?.map((snippet) => (
                <SnippetCard
                  key={snippet?.id}
                  snippet={snippet}
                  onRemove={isOwner ? () => handleRemoveSnippet(snippet?.id) : null}
                  addedBy={snippet?.addedBy}
                  addedAt={snippet?.addedAt}
                  canManage={isOwner}
                  onClick={() => navigate(`/snippets/${snippet?.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Snippet Modal */}
      {showAddModal && (
        <AddSnippetModal
          collectionId={collectionId}
          hiveId={collection?.hive?.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSnippetAdded}
        />
      )}
    </div>
  );
};

export default HiveCollectionDetail;