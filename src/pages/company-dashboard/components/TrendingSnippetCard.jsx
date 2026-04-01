import React from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const TrendingSnippetCard = ({ snippet, onView }) => {
  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "bg-warning/10 text-warning border-warning/20",
      Python: "bg-primary/10 text-primary border-primary/20",
      Java: "bg-error/10 text-error border-error/20",
      TypeScript: "bg-primary/10 text-primary border-primary/20",
      React: "bg-accent/10 text-accent border-accent/20",
      "C++": "bg-primary/10 text-primary border-primary/20"
    };
    return colors?.[language] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(snippet?.id)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Image
            src={snippet?.authorAvatar}
            alt={snippet?.authorAvatarAlt}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground truncate">{snippet?.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{snippet?.author}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getLanguageColor(snippet?.language)}`}>
          {snippet?.language}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {snippet?.description}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="Eye" size={16} />
            <span>{snippet?.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Heart" size={16} />
            <span>{snippet?.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="MessageSquare" size={16} />
            <span>{snippet?.comments}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon name="TrendingUp" size={14} color="var(--color-success)" />
          <span className="text-success font-medium">{snippet?.trendScore}%</span>
        </div>
      </div>
    </div>
  );
};

export default TrendingSnippetCard;