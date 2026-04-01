import React, { useState, useEffect } from 'react';
import { Search, X, Code, Plus, User } from 'lucide-react';
import { addSnippetToCollection, isSnippetInCollection } from '../../../services/hiveCollectionService';

const AddSnippetModal = ({ collectionId, hiveId, onClose, onSuccess }) => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippets, setSelectedSnippets] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHiveSnippets();
  }, [hiveId]);

  const loadHiveSnippets = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      console.log('🔍 Loading hive snippets for hive:', hiveId, 'collection:', collectionId);
      
      // Import supabase client
      const { supabase } = await import('../../../lib/supabase');
      
      // FIXED: Query through hive_snippets junction table with proper joins to get actual snippet data
      const { data: hiveSnippetsData, error: snippetsError } = await supabase
        ?.from('hive_snippets')
        ?.select(`
          id,
          snippet_id,
          snippet:snippets!hive_snippets_snippet_id_fkey(
            id,
            title,
            description,
            language,
            code,
            visibility,
            user_id,
            author:user_profiles!snippets_user_id_fkey(
              id,
              username,
              avatar_url,
              full_name
            )
          )
        `)
        ?.eq('hive_id', hiveId)
        ?.order('created_at', { ascending: false });

      if (snippetsError) {
        console.error('❌ Error loading hive snippets:', snippetsError);
        throw snippetsError;
      }

      console.log(`✅ Loaded ${hiveSnippetsData?.length || 0} snippets from hive`);

      // Transform data to flat structure and check collection status
      const snippetsWithStatus = await Promise.all(
        (hiveSnippetsData || [])?.map(async (item) => {
          const snippet = item?.snippet;
          if (!snippet) {
            console.warn('⚠️ Snippet data missing for hive_snippet:', item?.id);
            return null;
          }

          const { exists } = await isSnippetInCollection(collectionId, snippet?.id);
          return {
            id: snippet?.id,
            title: snippet?.title || 'Untitled Snippet',
            description: snippet?.description || '',
            language: snippet?.language || 'unknown',
            code: snippet?.code || '',
            visibility: snippet?.visibility,
            author: snippet?.author ? {
              id: snippet?.author?.id,
              username: snippet?.author?.username || 'unknown',
              avatar_url: snippet?.author?.avatar_url,
              full_name: snippet?.author?.full_name || 'Anonymous'
            } : null,
            inCollection: exists
          };
        })
      );

      // Filter out null entries (snippets that no longer exist)
      const validSnippets = snippetsWithStatus?.filter(s => s !== null);
      console.log(`✅ ${validSnippets?.length} valid snippets available, ${snippetsWithStatus?.length - validSnippets?.length} invalid entries filtered`);
      
      setSnippets(validSnippets);
    } catch (err) {
      console.error('❌ Error in loadHiveSnippets:', err);
      setError(`Failed to load snippets: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSnippet = (snippetId) => {
    const newSelected = new Set(selectedSnippets);
    if (newSelected?.has(snippetId)) {
      newSelected?.delete(snippetId);
    } else {
      newSelected?.add(snippetId);
    }
    setSelectedSnippets(newSelected);
  };

  const handleAddSnippets = async () => {
    if (selectedSnippets?.size === 0) {
      setError('Please select at least one snippet');
      return;
    }

    setAdding(true);
    setError('');

    try {
      console.log(`🚀 Adding ${selectedSnippets?.size} snippets to collection ${collectionId}`);
      
      const promises = Array.from(selectedSnippets)?.map(snippetId => {
        console.log(`  ➕ Adding snippet ${snippetId}...`);
        return addSnippetToCollection(collectionId, snippetId);
      });

      const results = await Promise.all(promises);
      
      const errors = results?.filter(r => r?.error);
      if (errors?.length > 0) {
        console.error('❌ Failed to add some snippets:', errors);
        throw new Error(`Failed to add ${errors.length} snippet(s). Please try again.`);
      }

      console.log(`✅ Successfully added ${results?.length} snippets to collection`);
      onSuccess();
    } catch (err) {
      console.error('❌ Error in handleAddSnippets:', err);
      setError(err?.message || 'Failed to add snippets to collection');
      setAdding(false);
    }
  };

  const filteredSnippets = snippets?.filter(snippet =>
    !snippet?.inCollection &&
    (snippet?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
     snippet?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
     snippet?.language?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border animate-slide-in-up">
        {/* Enhanced Header with gradient */}
        <div className="relative bg-primary text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Add Snippets to Collection</h2>
              <p className="text-white/80">Select snippets from your hive to add to this collection</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-card/20 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-card/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-card/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="p-6 bg-background border-b-2 border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="🔍 Search snippets by title, description, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl focus:ring-4 focus:ring-ring/20 focus:border-primary shadow-inner text-foreground font-medium"
            />
          </div>
        </div>

        {/* Enhanced Snippets List */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border-l-4 border-error rounded-lg flex items-start gap-3">
              <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <X className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-error">Error</p>
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-muted-foreground font-medium">Loading snippets...</p>
            </div>
          ) : filteredSnippets?.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No snippets available</h3>
              <p className="text-muted-foreground text-lg">
                {searchQuery
                  ? '🔍 No snippets found matching your search' :'📦 All hive snippets are already in this collection'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSnippets?.map((snippet) => (
                <div
                  key={snippet?.id}
                  onClick={() => handleToggleSnippet(snippet?.id)}
                  className={`group p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedSnippets?.has(snippet?.id)
                      ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]'
                      : 'border-border hover:border-border hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedSnippets?.has(snippet?.id)}
                        onChange={() => handleToggleSnippet(snippet?.id)}
                        className="w-5 h-5 text-primary border-2 border-border rounded focus:ring-4 focus:ring-ring/20 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {snippet?.title}
                        </h3>
                        {snippet?.language && (
                          <span className="ml-3 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg whitespace-nowrap">
                            {snippet?.language}
                          </span>
                        )}
                      </div>
                      {snippet?.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {snippet?.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {snippet?.author && (
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg group-hover:bg-card transition-colors">
                            <User className="w-4 h-4" />
                            <span className="font-medium">by @{snippet?.author?.username}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="p-6 border-t-2 border-border bg-background flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${selectedSnippets?.size > 0 ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
            <span className="text-sm font-semibold text-foreground">
              {selectedSnippets?.size} snippet{selectedSnippets?.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-border text-foreground rounded-xl hover:bg-muted transition-all font-semibold"
              disabled={adding}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSnippets}
              className="flex items-center gap-3 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
              disabled={adding || selectedSnippets?.size === 0}
            >
              {adding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Selected</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSnippetModal;