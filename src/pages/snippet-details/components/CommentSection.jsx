import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';

const CommentSection = ({ comments = [], onAddComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    if (!newComment?.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError('');
      await onAddComment(newComment);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e?.preventDefault();
    if (!replyText?.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError('');
      await onAddComment(replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <p className="text-gray-500 text-center py-4">
          Please login to view and add comments
        </p>
      </div>
    );
  }

  const renderComment = (comment, isReply = false) => (
    <div key={comment?.id} className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        <img
          src={comment?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment?.user?.name || 'User')}&background=random`}
          alt={`${comment?.user?.name}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment?.user?.name}</span>
              <span className="text-xs text-gray-500">@{comment?.user?.username}</span>
              <span className="text-xs text-gray-400">{formatDate(comment?.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700">{comment?.content}</p>
          </div>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment?.id)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 ml-3"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {replyingTo === comment?.id && (
        <div className="ml-12 mt-2">
          <form onSubmit={(e) => handleSubmitReply(e, comment?.id)} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e?.target?.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <Button
              type="submit"
              disabled={submitting || !replyText?.trim()}
              size="sm"
            >
              {submitting ? 'Posting...' : 'Reply'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </form>
        </div>
      )}

      {comment?.replies && comment?.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment?.replies?.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments?.length || 0})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <img
            src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'User')}&background=random`}
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e?.target?.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={submitting}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="submit"
                disabled={submitting || !newComment?.trim()}
                size="sm"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Comments List */}
      {comments?.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments?.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;