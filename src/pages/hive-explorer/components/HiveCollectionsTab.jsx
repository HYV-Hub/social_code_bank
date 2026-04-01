import React, { useState, useEffect } from 'react';
import { Plus, Search, Lock, Globe, Trash2, FolderOpen } from 'lucide-react';
import { getHiveCollections, deleteHiveCollection } from '../../../services/hiveCollectionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HiveCollectionsTab = ({ hiveId, hiveRole }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hiveId) {
      loadCollections();
    }
  }, [hiveId]);

  const loadCollections = async () => {
    setLoading(true);
    const { data, error } = await getHiveCollections(hiveId);
    
    if (error) {
      console.error('Error loading collections:', error);
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  const handleDeleteCollection = async (collectionId, e) => {
    e?.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    const { error } = await deleteHiveCollection(collectionId);
    
    if (error) {
      alert(`Error deleting collection: ${error?.message}`);
    } else {
      setCollections(collections?.filter(c => c?.id !== collectionId));
    }
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/hive-collection/${collectionId}`);
  };

  const filteredCollections = collections?.filter(collection =>
    collection?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    collection?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const canCreateCollection = hiveRole && ['owner', 'admin', 'member']?.includes(hiveRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {canCreateCollection && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Collection</span>
          </button>
        )}
      </div>
      {/* Collections Grid */}
      {filteredCollections?.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No collections found' : 'No collections yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : canCreateCollection
                ? 'Create your first collection to organize code snippets' :'Collections will appear here once created'
            }
          </p>
          {canCreateCollection && !searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections?.map((collection) => {
            const isOwner = collection?.created_by === user?.id;
            const canDelete = isOwner || hiveRole === 'owner' || hiveRole === 'admin';

            return (
              <div
                key={collection?.id}
                onClick={() => handleCollectionClick(collection?.id)}
                className="bg-card rounded-lg shadow-md border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Collection Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    {collection?.is_public ? (
                      <Globe className="w-4 h-4 text-success" title="Public" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" title="Private" />
                    )}
                  </div>
                  
                  {canDelete && (
                    <button
                      onClick={(e) => handleDeleteCollection(collection?.id, e)}
                      className="text-muted-foreground hover:text-error transition-colors"
                      title="Delete collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Collection Info */}
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                  {collection?.name}
                </h3>
                {collection?.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {collection?.description}
                  </p>
                )}
                {/* Collection Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{collection?.snippet_count || 0} snippets</span>
                  </div>
                  
                  {collection?.created_by_profile && (
                    <div className="flex items-center gap-2">
                      {collection?.created_by_profile?.avatar_url ? (
                        <img
                          src={collection?.created_by_profile?.avatar_url}
                          alt={collection?.created_by_profile?.username}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {collection?.created_by_profile?.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {collection?.created_by_profile?.username}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Create Collection Modal */}
      {showCreateModal && (
        <CreateCollectionModal
          hiveId={hiveId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadCollections();
          }}
        />
      )}
    </div>
  );
};

// Create Collection Modal Component
const CreateCollectionModal = ({ hiveId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!formData?.name?.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);

    const { createHiveCollection } = await import('../../../services/hiveCollectionService');
    const { data, error: createError } = await createHiveCollection({
      hiveId,
      name: formData?.name?.trim(),
      description: formData?.description?.trim(),
      isPublic: formData?.isPublic
    });

    setLoading(false);

    if (createError) {
      setError(createError?.message || 'Failed to create collection');
    } else {
      onSuccess(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Create Collection</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData?.name}
              onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="e.g., React Best Practices"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData?.description}
              onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder="Describe what this collection is about..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData?.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e?.target?.checked })}
              className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
            />
            <label htmlFor="isPublic" className="text-sm text-foreground">
              Make this collection public
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-background transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HiveCollectionsTab;