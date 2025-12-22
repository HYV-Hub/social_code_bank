import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


export default function SearchResults({ results, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (!results || results?.totalResults === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
          <Icon name="Search" size={40} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{results?.totalResults}</span> results
            </p>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            {results?.snippets?.length > 0 && (
              <span>{results?.snippets?.length} snippets</span>
            )}
            {results?.hives?.length > 0 && (
              <span>• {results?.hives?.length} hives</span>
            )}
            {results?.collections?.length > 0 && (
              <span>• {results?.collections?.length} collections</span>
            )}
            {results?.bugs?.length > 0 && (
              <span>• {results?.bugs?.length} discussions</span>
            )}
          </div>
        </div>
      </div>

      {/* Snippets Results */}
      {results?.snippets?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snippets</h3>
          <div className="space-y-4">
            {results?.snippets?.map((snippet) => (
              <div
                key={snippet?.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {snippet?.title}
                </h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {snippet?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={16} />
                    {snippet?.author?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hives Results */}
      {results?.hives?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hives</h3>
          <div className="space-y-4">
            {results?.hives?.map((hive) => (
              <div
                key={hive?.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/hive-explorer?id=${hive?.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{hive?.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    hive?.privacy === 'public' ?'bg-green-100 text-green-700' :'bg-yellow-100 text-yellow-700'
                  }`}>
                    {hive?.privacy}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {hive?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    {hive?.member_count || 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={16} />
                    {hive?.owner?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collections Results */}
      {results?.collections?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collections</h3>
          <div className="space-y-4">
            {results?.collections?.map((collection) => (
              <div
                key={collection?.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/collection-details?id=${collection?.id}`)}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {collection?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {collection?.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="FolderOpen" size={16} />
                    From {collection?.hive?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={16} />
                    {collection?.creator?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Results */}
      {results?.bugs?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussions</h3>
          <div className="space-y-4">
            {results?.bugs?.map((bug) => (
              <div
                key={bug?.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/bug-board?id=${bug?.id}`)}
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {bug?.title}
                </h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {bug?.description}
                </p>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    bug?.status === 'resolved' ?'bg-green-100 text-green-700'
                      : bug?.status === 'in_progress' ?'bg-blue-100 text-blue-700' :'bg-gray-100 text-gray-700'
                  }`}>
                    {bug?.status?.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    by {bug?.reporter?.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}