import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { Link, useNavigate } from 'react-router-dom';
import { snippetService } from '../../../services/snippetService';
import Button from '../../../components/ui/Button';

const SnippetHeader = ({ snippet }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    // Navigate to create-snippet page with edit mode
    navigate(`/create-snippet?edit=${snippet?.id}`);
  };

  const handleDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await snippetService?.deleteSnippet(snippet?.id);
      
      // Show success message
      alert('Snippet deleted successfully');
      
      // Navigate back to dashboard
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert(error?.message || 'Failed to delete snippet. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">{snippet?.title}</h1>
            <p className="text-muted-foreground text-base leading-relaxed">{snippet?.description}</p>
          </div>
          {snippet?.isOwner && (
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={handleEdit}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit snippet"
              >
                <Icon name="Edit" size={20} className="text-muted-foreground hover:text-accent" />
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors" 
                title="Delete snippet"
              >
                <Icon name="Trash2" size={20} className="text-destructive" />
              </button>
            </div>
          )}
        </div>
        {/* Author Info */}
        <div className="flex items-center gap-4 mb-4">
          <Link to={`/user-profile/${snippet?.author?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src={snippet?.author?.avatar}
              alt={snippet?.author?.avatarAlt}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{snippet?.author?.name}</p>
              <p className="text-xs text-muted-foreground">{snippet?.author?.role}</p>
            </div>
          </Link>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Calendar" size={16} />
            <span>{formatDate(snippet?.createdAt)}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Eye" size={16} />
            <span>{snippet?.stats?.views?.toLocaleString()} views</span>
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {snippet?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Icon name="AlertTriangle" size={24} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Snippet</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete "{snippet?.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SnippetHeader;