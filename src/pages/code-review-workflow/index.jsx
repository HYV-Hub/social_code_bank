import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService } from '../../services/reviewService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

export default function CodeReviewWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchReviews();
  }, [user, filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = filter !== 'all' ? { status: filter } : {};
      const data = await reviewService?.getAll(filters);
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'changes_requested': return 'text-warning bg-warning/10';
      case 'rejected': return 'text-error bg-error/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'changes_requested': return 'Changes Requested';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Code Review">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Code Review">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Code Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and approve code changes from your team</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {['all', 'pending', 'approved', 'changes_requested', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : statusLabel(f)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" size={20} className="text-error" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews?.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Icon name="FileSearch" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Code reviews will appear here when snippets are submitted for review in your teams.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews?.map((review) => (
              <div
                key={review?.id}
                onClick={() => navigate(`/snippet-details?id=${review?.snippet_id || review?.snippets?.id}`)}
                className="hyv-card p-4 cursor-pointer group hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {review?.snippets?.title || 'Untitled Snippet'}
                      </h3>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${statusColor(review?.status)}`}>
                        {statusLabel(review?.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {review?.snippets?.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {review?.reviewer && (
                        <span className="flex items-center gap-1">
                          <Icon name="User" size={12} />
                          {review?.reviewer?.full_name || 'Unknown'}
                        </span>
                      )}
                      {review?.snippets?.language && (
                        <span className="px-1.5 py-0.5 font-mono bg-muted rounded text-[10px]">
                          {review?.snippets?.language}
                        </span>
                      )}
                      {review?.teams?.name && (
                        <span className="flex items-center gap-1">
                          <Icon name="Users" size={12} />
                          {review?.teams?.name}
                        </span>
                      )}
                      {review?.created_at && (
                        <span>{new Date(review?.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
