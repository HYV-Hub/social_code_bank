import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AIReportButton from '../../../components/AIReportButton';
import { bugService } from '../../../services/bugService';

const BugDetailsModal = ({ bug, onClose, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bug?.id && activeTab === 'comments') {
      loadComments();
    }
  }, [bug?.id, activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await bugService?.getComments(bug?.id);
      setComments(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment?.trim()) return;

    try {
      setLoading(true);
      await bugService?.addComment(bug?.id, newComment);
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await bugService?.updateBugStatus(bug?.id, newStatus);
      onStatusChange(newStatus);
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    critical: 'bg-error/15 text-error',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-warning/15 text-warning',
    low: 'bg-primary/15 text-foreground'
  };

  const statusColors = {
    open: 'bg-error/15 text-error',
    in_progress: 'bg-warning/15 text-warning',
    resolved: 'bg-success/15 text-success',
    closed: 'bg-muted text-foreground',
    reopened: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{bug?.title}</h2>
            <span className={`px-3 py-1 rounded text-xs font-medium ${priorityColors?.[bug?.priority]}`}>
              {bug?.priority}
            </span>
            <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors?.[bug?.status]}`}>
              {bug?.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details' ?'border-blue-600 text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="FileText" size={16} className="inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'comments' ?'border-blue-600 text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="MessageSquare" size={16} className="inline mr-2" />
              Comments ({comments?.length || bug?.comments || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history' ?'border-blue-600 text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Clock" size={16} className="inline mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{bug?.description}</p>
              </div>

              {/* Code Snippet */}
              {bug?.code && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Code</h3>
                  <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{bug?.code}</code>
                  </pre>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Language</h3>
                  <p className="text-muted-foreground">{bug?.language || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Author</h3>
                  <p className="text-muted-foreground">{bug?.author?.name || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Created</h3>
                  <p className="text-muted-foreground">
                    {bug?.createdAt ? new Date(bug?.createdAt)?.toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Visibility</h3>
                  <p className="text-muted-foreground capitalize">{bug?.visibility || 'public'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="bg-muted rounded-lg p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e?.target?.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={loading || !newComment?.trim()}
                    variant="default"
                    iconName="Send"
                    iconPosition="left"
                  >
                    Add Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : comments?.length > 0 ? (
                <div className="space-y-4">
                  {comments?.map((comment) => (
                    <div key={comment?.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment?.user?.name || 'User')}&background=random`}
                          alt={comment?.user?.name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {comment?.user?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment?.created_at)?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment?.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MessageSquare" size={48} className="mx-auto mb-2 text-slate-300" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Clock" size={48} className="mx-auto mb-2 text-slate-300" />
              <p>Bug history coming soon</p>
            </div>
          )}
        </div>

        {/* Add AI Report Button before Actions section */}
        <div className="border-t border-border pt-4 mb-4">
          <AIReportButton 
            entity={bug} 
            entityType="bug"
            onReportGenerated={(report) => {
              console.log('Bug AI report generated:', report);
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading || bug?.status === 'in_progress'}
            >
              Start Progress
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('resolved')}
              disabled={loading || bug?.status === 'resolved'}
            >
              Mark Resolved
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange('closed')}
              disabled={loading || bug?.status === 'closed'}
            >
              Close Bug
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BugDetailsModal;