import React from 'react';
import { Users, Lock, Globe, FileCode, TrendingUp, MoreVertical } from 'lucide-react';

const CompanyHiveCard = ({ hive, onClick, userRole }) => {
  const isPrivate = hive?.privacy === 'private';
  const canManage = userRole === 'admin' || userRole === 'director' || hive?.is_owner;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {hive?.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground" />
            )}
            {canManage && (
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  // Handle menu click
                }}
                className="text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {hive?.description || 'No description provided'}
        </p>
      </div>
      {/* Card Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{hive?.member_count || 0}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div className="text-center border-l border-r border-border">
            <div className="flex items-center justify-center mb-1">
              <FileCode className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{hive?.snippet_count || 0}</p>
            <p className="text-xs text-muted-foreground">Snippets</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{hive?.collection_count || 0}</p>
            <p className="text-xs text-muted-foreground">Collections</p>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isPrivate 
              ? 'bg-muted text-foreground' :'bg-primary/10 text-primary'
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
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Owner
            </span>
          )}
        </div>
      </div>
      {/* Hover Effect Indicator */}
      <div className="h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
    </div>
  );
};

export default CompanyHiveCard;