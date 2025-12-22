import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collectionService } from '../../services/collectionService';
import { Helmet } from 'react-helmet';
import AppNavigation from "../../components/AppNavigation";


import { ArrowLeft, Plus, Lock, Globe, Edit2, Trash2, Code, Eye, Heart, ExternalLink } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Collection not found</p>
          <button
            onClick={() => navigate('/snippet-collections')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Collection Details - HyvHub</title>
      </Helmet>
      {/* Add Navigation */}
      <AppNavigation />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/snippet-collections')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">{collection?.title}</h1>
                  {collection?.isPublic ? (
                    <Globe className="w-6 h-6 text-green-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {collection?.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
                    className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}
        {/* Snippets Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Snippets ({snippets?.length})
            </h2>
            <button
              onClick={() => navigate('/create-snippet')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Snippet
            </button>
          </div>

          {snippets?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">
                No snippets in this collection yet. Add your first snippet!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets?.map((item) => (
                <div
                  key={item?.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden group cursor-pointer"
                  onClick={() => handleViewSnippet(item?.snippetId)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {item?.snippet?.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item?.snippet?.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    {/* Language Badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Code className="w-3 h-3 mr-1" />
                        {item?.snippet?.language}
                      </span>
                    </div>

                    {/* Code Preview */}
                    <div className="bg-gray-50 rounded p-3 mb-4 border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        <code className="line-clamp-3">{item?.snippet?.code}</code>
                      </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleViewSnippet(item?.snippetId);
                        }}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleRemoveSnippet(item?.snippetId);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors border border-red-600"
                        title="Remove from collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item?.snippet?.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item?.snippet?.viewsCount || 0}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Edit Collection Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Collection</h2>
              <form onSubmit={handleUpdateCollection}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm?.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm?.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e?.target?.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editForm?.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e?.target?.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsPublic"
                      checked={editForm?.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e?.target?.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-700">
                      Make this collection public
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}