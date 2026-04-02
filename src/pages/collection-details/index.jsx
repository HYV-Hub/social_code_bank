import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collectionService } from '../../services/collectionService';
import { Helmet } from 'react-helmet';
import AppShell from '../../components/AppShell';


import { ArrowLeft, Plus, Lock, Globe, Edit2, Trash2, Code, Eye, Heart, ExternalLink } from 'lucide-react';
import CompactSnippetCard from '../../components/cards/CompactSnippetCard';

export default function CollectionDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams?.get('id');

  const [collection, setCollection] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: false
  });

  useEffect(() => {
    if (collectionId) {
      loadCollectionDetails();
    }
  }, [collectionId]);

  const loadCollectionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the correct service method that returns collection with snippets
      const collectionData = await collectionService?.getCollectionById(collectionId);
      
      setCollection(collectionData);
      setSnippets(collectionData?.snippets || []);
      setEditForm({
        title: collectionData?.title,
        description: collectionData?.description || '',
        tags: collectionData?.tags?.join(', ') || '',
        isPublic: collectionData?.isPublic
      });
    } catch (err) {
      console.error('Error loading collection:', err);
      setError(err?.message || 'Failed to load collection details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollection = async (e) => {
    e?.preventDefault();
    try {
      const tags = editForm?.tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag?.length > 0);

      await collectionService?.updateCollection(collectionId, {
        title: editForm?.title,
        description: editForm?.description,
        tags: tags,
        isPublic: editForm?.isPublic
      });

      setShowEditModal(false);
      await loadCollectionDetails();
    } catch (err) {
      console.error('Error updating collection:', err);
      setError(err?.message || 'Failed to update collection');
    }
  };

  const handleRemoveSnippet = async (snippetId) => {
    if (!window.confirm('Remove this snippet from the collection?')) return;

    try {
      await collectionService?.removeSnippetFromCollection(collectionId, snippetId);
      await loadCollectionDetails();
    } catch (err) {
      console.error('Error removing snippet:', err);
      setError(err?.message || 'Failed to remove snippet');
    }
  };

  const handleViewSnippet = (snippetId) => {
    navigate(`/snippet-details?id=${snippetId}`);
  };

  if (loading) {
    return (
      <AppShell pageTitle="Collection">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading collection...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!collection) {
    return (
      <AppShell pageTitle="Collection">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">Collection not found</p>
            <button
              onClick={() => navigate('/snippet-collections')}
              className="mt-4 text-primary hover:text-primary"
            >
              Back to Collections
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Collection">
      <Helmet>
        <title>Collection Details - HyvHub</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/snippet-collections')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground">{collection?.title}</h1>
                  {collection?.isPublic ? (
                    <Globe className="w-6 h-6 text-success" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {collection?.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-background"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>

            {/* Tags */}
            {collection?.tags && collection?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {collection?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium bg-primary/15 text-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}
        {/* Snippets Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Snippets ({snippets?.length})
            </h2>
            <button
              onClick={() => navigate('/create-snippet')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Snippet
            </button>
          </div>

          {snippets?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg shadow-sm">
              <p className="text-muted-foreground text-lg">
                No snippets in this collection yet. Add your first snippet!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snippets?.map((item) => (
                <CompactSnippetCard
                  key={item?.id}
                  snippet={item?.snippet || item}
                  onLike={() => {}}
                />
              ))}
            </div>
          )}
        </div>
        {/* Edit Collection Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Edit Collection</h2>
              <form onSubmit={handleUpdateCollection}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm?.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e?.target?.value })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm?.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e?.target?.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editForm?.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e?.target?.value })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsPublic"
                      checked={editForm?.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e?.target?.checked })}
                      className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                    />
                    <label htmlFor="editIsPublic" className="ml-2 block text-sm text-foreground">
                      Make this collection public
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-background"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}