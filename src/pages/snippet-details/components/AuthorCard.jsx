import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AuthorCard = ({ author }) => {
  const getLevelBadge = (level) => {
    const badges = {
      beginner: { color: 'bg-success', icon: 'User', label: 'Beginner' },
      intermediate: { color: 'bg-accent', icon: 'Users', label: 'Intermediate' },
      advanced: { color: 'bg-primary', icon: 'Award', label: 'Advanced' },
      expert: { color: 'bg-warning', icon: 'Crown', label: 'Expert' }
    };
    return badges?.[level?.toLowerCase()] || badges?.['beginner'];
  };

  const levelBadge = getLevelBadge(author?.level);

  return (
    <div className="p-6">
      <Link 
        to={`/user-profile/${author?.id}`}
        className="block group"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Image
              src={author?.avatar}
              alt={author?.avatarAlt}
              className="w-20 h-20 rounded-full object-cover border-4 border-border group-hover:border-primary/60 transition-all ring-4 ring-primary/10 group-hover:ring-primary/15"
            />
            {author?.isVerified && (
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-accent rounded-full border-2 border-white shadow-lg">
                <Icon name="Check" size={14} className="text-white" />
              </div>
            )}
            <div className="absolute top-0 right-0 w-5 h-5 bg-success border-2 border-white rounded-full shadow-lg"></div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              {author?.name}
              {author?.isVerified && (
                <Icon name="BadgeCheck" size={18} className="text-primary" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground">@{author?.username}</p>
          </div>
        </div>

        <div className={`flex items-center justify-between p-4 ${levelBadge?.color} rounded-xl shadow-lg mb-4 transform group-hover:scale-105 transition-all`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-card/20 backdrop-blur-sm rounded-lg">
              <Icon name={levelBadge?.icon} size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium uppercase tracking-wide">Skill Level</p>
              <p className="text-lg font-bold text-white">{levelBadge?.label}</p>
            </div>
          </div>
          <Icon name="TrendingUp" size={24} className="text-white/60" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 text-center">
            <Icon name="Code2" size={18} className="text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-primary">247</p>
            <p className="text-xs text-muted-foreground font-medium">Snippets</p>
          </div>

          <div className="bg-primary/10 rounded-lg p-3 border border-border text-center">
            <Icon name="Users" size={18} className="text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-primary">1.2K</p>
            <p className="text-xs text-muted-foreground font-medium">Followers</p>
          </div>

          <div className="bg-background rounded-lg p-3 border border-success/20 text-center">
            <Icon name="Heart" size={18} className="text-success mx-auto mb-1" />
            <p className="text-xl font-bold text-success">3.4K</p>
            <p className="text-xs text-muted-foreground font-medium">Likes</p>
          </div>
        </div>

        <button className="w-full py-3 px-4 bg-primary hover:bg-primary text-white rounded-xl font-semibold transition-all transform group-hover:scale-105 shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
          <span>View Full Profile</span>
          <Icon name="ArrowRight" size={18} />
        </button>
      </Link>
    </div>
  );
};

export default AuthorCard;