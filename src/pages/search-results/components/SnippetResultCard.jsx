import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { snippetService } from '../../../services/snippetService';
import { collectionService } from '../../../services/collectionService';
import { useAuth } from '../../../contexts/AuthContext';

const SnippetResultCard = ({ snippet }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(snippet?.likes_count || 0);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(snippet?.comments_count || 0);
  const [showCommentInput, setShowCommentInput] = useState(false);

  // NEW: Save to collection state
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // NEW: Check if user has liked this snippet on mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user?.id) {
        try {
          const liked = await snippetService?.checkUserLiked(snippet?.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };

    checkLikeStatus();
  }, [snippet?.id, user?.id]);

  // NEW: Load user collections when save menu opens
  useEffect(() => {
    const loadCollections = async () => {
      if (showSaveMenu && user?.id) {
        try {
          setLoadingCollections(true);
          const collections = await collectionService?.getUserCollections();
          setUserCollections(collections);
        } catch (error) {
          console.error('Error loading collections:', error);
        } finally {
          setLoadingCollections(false);
        }
      }
    };

    loadCollections();
  }, [showSaveMenu, user?.id]);

  const handleLikeToggle = async (e) => {
    e?.stopPropagation();

    if (!user?.id) {
      alert('Please login to like snippets');
      return;
    }

    try {
      if (isLiked) {
        await snippetService?.unlikeSnippet(snippet?.id);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await snippetService?.likeSnippet(snippet?.id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!user?.id) {
      alert('Please login to comment');
      return;
    }

    if (!commentText?.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await snippetService?.addComment(snippet?.id, commentText?.trim());
      setCommentText('');
      setCommentsCount(prev => prev + 1);
      setShowCommentInput(false);
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle save to collection
  const handleSaveToCollection = async (collectionId) => {
    if (!user?.id) {
      alert('Please login to save snippets');
      return;
    }

    try {
      setIsSaving(true);
      const result = await collectionService?.addSnippetToCollection(collectionId, snippet?.id);
      
      if (result?.alreadyExists) {
        alert('Snippet is already in this collection');
      } else {
        alert('Snippet saved to collection successfully!');
        setShowSaveMenu(false);
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
      alert('Failed to save snippet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Create new collection and add snippet
  const handleCreateAndSave = async () => {
    if (!user?.id) {
      alert('Please login to create collections');
      return;
    }

    const collectionTitle = prompt('Enter collection name:');
    if (!collectionTitle?.trim()) return;

    try {
      setIsSaving(true);
      const newCollection = await collectionService?.createCollection({
        title: collectionTitle?.trim(),
        description: '',
        isPublic: false
      });

      await collectionService?.addSnippetToCollection(newCollection?.id, snippet?.id);
      alert('Collection created and snippet saved!');
      setShowSaveMenu(false);
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Header Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
          >
            <img
              src={snippet?.user?.avatar_url || '/assets/images/no_image.png'}
              alt={snippet?.user?.full_name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {snippet?.user?.full_name || snippet?.user?.username || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(snippet?.created_at)?.toLocaleDateString()}</span>
                {snippet?.visibility && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{snippet?.visibility}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Save button with dropdown */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e?.stopPropagation();
                setShowSaveMenu(!showSaveMenu);
              }}
              className="text-muted-foreground hover:text-primary"
            >
              <Icon name="Bookmark" size={16} />
            </Button>

            {/* Save to Collection Dropdown */}
            {showSaveMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSaveMenu(false)}
                />
                
                <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Save to Collection</p>
                  </div>

                  {loadingCollections ? (
                    <div className="p-4 text-center">
                      <Icon name="Loader2" size={20} className="animate-spin mx-auto text-primary" />
                      <p className="text-xs text-muted-foreground mt-2">Loading collections...</p>
                    </div>
                  ) : userCollections?.length === 0 ? (
                    <div className="p-4 text-center">
                      <Icon name="Folder" size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground mb-3">No collections yet</p>
                      <Button
                        size="sm"
                        onClick={handleCreateAndSave}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Icon name="Plus" size={14} className="mr-2" />
                            Create Collection
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="py-2">
                        {userCollections?.map((collection) => (
                          <button
                            key={collection?.id}
                            onClick={() => handleSaveToCollection(collection?.id)}
                            disabled={isSaving}
                            className="w-full px-4 py-2 text-left hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="Folder" size={14} className="text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {collection?.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {collection?.snippetsCount} {collection?.snippetsCount === 1 ? 'snippet' : 'snippets'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCreateAndSave}
                          disabled={isSaving}
                          className="w-full justify-start"
                        >
                          {isSaving ? (
                            <>
                              <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Icon name="Plus" size={14} className="mr-2" />
                              New Collection
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Left Side: Code Snippet (2/3 width on large screens) */}
        <div 
          className="lg:col-span-2 cursor-pointer"
          onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
        >
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {snippet?.title}
          </h3>

          {snippet?.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {snippet?.description}
            </p>
          )}

          {snippet?.ai_tags && snippet?.ai_tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {snippet?.ai_tags?.slice(0, 5)?.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
              {snippet?.ai_tags?.length > 5 && (
                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                  +{snippet?.ai_tags?.length - 5} more
                </span>
              )}
            </div>
          )}

          {snippet?.code && (
            <div className="bg-background rounded-lg p-3 mb-3">
              <pre className="text-xs text-foreground overflow-x-auto line-clamp-4">
                <code>{snippet?.code}</code>
              </pre>
            </div>
          )}

          {snippet?.language && (
            <span className="inline-block text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {snippet?.language}
            </span>
          )}
        </div>

        {/* Right Side: AI Overview (1/3 width on large screens) */}
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Sparkles" size={16} className="text-white" />
            </div>
            <h4 className="font-semibold text-foreground text-sm">AI Overview</h4>
          </div>

          {snippet?.ai_overview ? (
            <div className="space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                {snippet?.ai_overview}
              </p>
              
              {/* AI Confidence Badge (if available) */}
              {snippet?.ai_confidence && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">AI Confidence</span>
                    <span className="font-medium text-primary">
                      {Math.round(snippet?.ai_confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground italic">
                No AI overview available for this snippet.
              </p>
              <p className="text-xs text-muted-foreground">
                AI analysis helps you understand what this code does and how it works.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Engagement Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? 'text-error' : 'text-muted-foreground hover:text-error'
            }`}
          >
            <Icon name={isLiked ? 'Heart' : 'Heart'} size={18} className={isLiked ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={(e) => {
              e?.stopPropagation();
              setShowCommentInput(!showCommentInput);
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon name="MessageCircle" size={18} />
            <span className="text-sm font-medium">{commentsCount}</span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Eye" size={18} />
            <span className="text-sm font-medium">{snippet?.views_count || 0}</span>
          </div>
        </div>

        {/* Inline Comment Input */}
        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="mt-3 pt-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e?.target?.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !commentText?.trim()}
                className="flex-shrink-0"
              >
                {isSubmitting ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Send" size={16} />
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SnippetResultCard;