import React from 'react';
import { Users, Lock, Globe, FileCode, TrendingUp, MoreVertical } from 'lucide-react';

const CompanyHiveCard = ({ hive, onClick, userRole }) => {
  const isPrivate = hive?.privacy === 'private';
  const canManage = userRole === 'admin' || userRole === 'director' || hive?.is_owner;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {hive?.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : (
              <Globe className="w-4 h-4 text-gray-400" />
            )}
            {canManage && (
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  // Handle menu click
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {hive?.description || 'No description provided'}
        </p>
      </div>
      {/* Card Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{hive?.member_count || 0}</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <div className="flex items-center justify-center mb-1">
              <FileCode className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{hive?.snippet_count || 0}</p>
            <p className="text-xs text-gray-500">Snippets</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{hive?.collection_count || 0}</p>
            <p className="text-xs text-gray-500">Collections</p>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isPrivate 
              ? 'bg-gray-100 text-gray-700' :'bg-blue-50 text-blue-700'
          }`}>
            {isPrivate ? (
              <>
                <Lock className="w-3 h-3" />
                Private
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" />
                Public
              </>
            )}
          </span>
          {hive?.is_owner && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
              Owner
            </span>
          )}
        </div>
      </div>
      {/* Hover Effect Indicator */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
    </div>
  );
};

export default CompanyHiveCard;