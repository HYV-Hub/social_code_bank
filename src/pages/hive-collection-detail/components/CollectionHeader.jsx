import React from 'react';
import { ArrowLeft, BookOpen, Lock, Globe, Edit, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CollectionHeader = ({ collection, canManage, onBack, onEdit }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Hive</span>
        </button>

        <div className="flex items-start justify-between gap-6">
          {/* Collection Info */}
          <div className="flex-1">
            {/* Icon and Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {collection?.name}
                </h1>
                <div className="flex items-center gap-3 text-blue-100">
                  {/* Hive Name */}
                  <span className="flex items-center gap-1">
                    {collection?.hives?.privacy === 'private' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    {collection?.hives?.name}
                  </span>
                  <span>•</span>
                  <span>{collection?.snippet_count || 0} snippets</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {collection?.description && (
              <p className="text-lg text-blue-50 mb-6 max-w-3xl">
                {collection?.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  Created by <span className="font-medium text-white">
                    @{collection?.user_profiles?.username || 'unknown'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {collection?.created_at 
                    ? formatDistanceToNow(new Date(collection.created_at), { addSuffix: true })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex-shrink-0">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Collection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionHeader;