import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AuthorCard = ({ author }) => {
  const getLevelBadge = (level) => {
    const badges = {
      beginner: { color: 'from-green-500 to-emerald-500', icon: 'User', label: 'Beginner' },
      intermediate: { color: 'from-blue-500 to-cyan-500', icon: 'Users', label: 'Intermediate' },
      advanced: { color: 'from-purple-500 to-pink-500', icon: 'Award', label: 'Advanced' },
      expert: { color: 'from-orange-500 to-red-500', icon: 'Crown', label: 'Expert' }
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
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 group-hover:border-purple-400 transition-all ring-4 ring-purple-100 group-hover:ring-purple-200"
            />
            {author?.isVerified && (
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full border-2 border-white shadow-lg">
                <Icon name="Check" size={14} className="text-white" />
              </div>
            )}
            <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
              {author?.name}
              {author?.isVerified && (
                <Icon name="BadgeCheck" size={18} className="text-blue-600" />
              )}
            </h3>
            <p className="text-sm text-gray-600">@{author?.username}</p>
          </div>
        </div>

        <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${levelBadge?.color} rounded-xl shadow-lg mb-4 transform group-hover:scale-105 transition-all`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
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
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200 text-center">
            <Icon name="Code2" size={18} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-600">247</p>
            <p className="text-xs text-gray-600 font-medium">Snippets</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 text-center">
            <Icon name="Users" size={18} className="text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-purple-600">1.2K</p>
            <p className="text-xs text-gray-600 font-medium">Followers</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 text-center">
            <Icon name="Heart" size={18} className="text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-600">3.4K</p>
            <p className="text-xs text-gray-600 font-medium">Likes</p>
          </div>
        </div>

        <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform group-hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
          <span>View Full Profile</span>
          <Icon name="ArrowRight" size={18} />
        </button>
      </Link>
    </div>
  );
};

export default AuthorCard;