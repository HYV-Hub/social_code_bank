import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

export default function FeedItemCard({ item, onLike, onSave }) {
  const navigate = useNavigate();

  const renderSnippetCard = () => {
    const snippet = item?.data;
    return (
      <div className="bg-card rounded-xl border border-border hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={snippet?.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(snippet?.author?.full_name || snippet?.author?.username || 'U')}&background=8b5cf6&color=fff&size=40`}
            alt={snippet?.author?.full_name || 'User avatar'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate(`/user-profile/${snippet?.author?.id}`)}
                className="font-semibold text-foreground hover:text-primary"
              >
                {snippet?.author?.full_name || snippet?.author?.username}
              </button>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(snippet?.created_at)?.toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {snippet?.author?.username && `@${snippet?.author?.username}`}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-primary/15 text-primary rounded-full">
            Snippet
          </span>
        </div>

        <h3
          onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
          className="text-sm font-semibold text-foreground mb-2 cursor-pointer hover:text-primary line-clamp-1"
        >
          {snippet?.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {snippet?.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="Code" size={16} />
            {snippet?.language}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={16} />
            {snippet?.views_count || 0} views
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Heart" size={16} />
            {snippet?.likes_count || 0} likes
          </span>
        </div>

        {snippet?.ai_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {snippet?.ai_tags?.slice(0, 5)?.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-muted text-foreground rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onLike(snippet?.id, 'snippet')}
          >
            <Icon name="Heart" size={16} className="mr-1" />
            Like
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSave(snippet?.id, 'snippet')}
          >
            <Icon name="Bookmark" size={16} className="mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
          >
            <Icon name="MessageCircle" size={16} className="mr-1" />
            Comment
          </Button>
        </div>
      </div>
    );
  };

  const renderDiscussionCard = () => {
    const bug = item?.data;
    return (
      <div className="bg-card rounded-xl border border-border hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={bug?.reporter?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(bug?.reporter?.full_name || bug?.reporter?.username || 'U')}&background=8b5cf6&color=fff&size=40`}
            alt={bug?.reporter?.full_name || 'User avatar'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate(`/user-profile/${bug?.reporter?.id}`)}
                className="font-semibold text-foreground hover:text-primary"
              >
                {bug?.reporter?.full_name || bug?.reporter?.username}
              </button>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(bug?.created_at)?.toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {bug?.reporter?.username && `@${bug?.reporter?.username}`}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-warning/15 text-warning rounded-full">
            Discussion
          </span>
        </div>

        <h3
          onClick={() => navigate(`/bug-board?id=${bug?.id}`)}
          className="text-sm font-semibold text-foreground mb-2 cursor-pointer hover:text-primary line-clamp-1"
        >
          {bug?.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {bug?.description}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            bug?.status === 'resolved' ? 'bg-success/15 text-success' :
            bug?.status === 'in_progress'? 'bg-primary/15 text-primary' : 'bg-muted text-foreground'
          }`}>
            {bug?.status?.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            bug?.priority === 'high' ? 'bg-error/15 text-error' :
            bug?.priority === 'medium'? 'bg-warning/15 text-warning' : 'bg-muted text-foreground'
          }`}>
            {bug?.priority} priority
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/bug-board?id=${bug?.id}`)}
          >
            <Icon name="MessageCircle" size={16} className="mr-1" />
            View Discussion
          </Button>
        </div>
      </div>
    );
  };

  const renderCollectionCard = () => {
    const collection = item?.data;
    return (
      <div className="bg-card rounded-xl border border-border hover:shadow-lg transition-shadow p-4 cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={collection?.creator?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(collection?.creator?.full_name || collection?.creator?.username || 'U')}&background=8b5cf6&color=fff&size=40`}
            alt={collection?.creator?.full_name || 'User avatar'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate(`/user-profile/${collection?.creator?.id}`)}
                className="font-semibold text-foreground hover:text-primary"
              >
                {collection?.creator?.full_name || collection?.creator?.username}
              </button>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {new Date(collection?.created_at)?.toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              From {collection?.hive?.name}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-success/15 text-success rounded-full">
            Collection
          </span>
        </div>

        <h3
          onClick={() => navigate(`/collection-details?id=${collection?.id}`)}
          className="text-sm font-semibold text-foreground mb-2 cursor-pointer hover:text-primary line-clamp-1"
        >
          {collection?.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {collection?.description}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/collection-details?id=${collection?.id}`)}
          >
            <Icon name="FolderOpen" size={16} className="mr-1" />
            View Collection
          </Button>
        </div>
      </div>
    );
  };

  switch (item?.type) {
    case 'snippet':
      return renderSnippetCard();
    case 'discussion':
      return renderDiscussionCard();
    case 'collection':
      return renderCollectionCard();
    default:
      return null;
  }
}