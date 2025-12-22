import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedItemCard = ({ item, onRemove, onView }) => {
  const getItemTypeIcon = (type) => {
    switch(type) {
      case 'snippet': return 'Code';
      case 'bug': return 'Bug';
      case 'discussion': return 'MessageCircle';
      default: return 'Bookmark';
    }
  };

  const getItemTypeBadge = (type) => {
    const badges = {
      'snippet': 'bg-blue-500/10 text-blue-500',
      'bug': 'bg-orange-500/10 text-orange-500',
      'discussion': 'bg-purple-500/10 text-purple-500'
    };
    return badges?.[type] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getItemTypeBadge(item?.type)}`}>
          <Icon name={getItemTypeIcon(item?.type)} size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground line-clamp-1">
              {item?.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconSize={14}
              onClick={() => onRemove(item?.id)}
              className="flex-shrink-0"
            />
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {item?.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src={item?.authorAvatar} 
                alt={item?.authorAvatarAlt}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-muted-foreground">{item?.authorName}</span>
            </div>
            
            <Button
              variant="outline"
              size="xs"
              iconName="ExternalLink"
              iconSize={12}
              onClick={() => onView(item?.id, item?.type)}
            >
              View
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Saved {item?.savedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;