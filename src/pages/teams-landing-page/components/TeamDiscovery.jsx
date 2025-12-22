import React, { useState } from 'react';
import { teamService } from '../../../services/teamService';

import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function TeamDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestingInvite, setRequestingInvite] = useState({});

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery?.trim()) return;

    try {
      setLoading(true);
      setError('');
      const results = await teamService?.searchTeams(searchQuery?.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching teams:', err);
      setError(err?.message || 'Failed to search teams');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInvite = async (teamId) => {
    try {
      setRequestingInvite(prev => ({ ...prev, [teamId]: true }));
      // Note: This would need a proper invite request flow
      // For now, we'll just show a success message
      alert('Invite request functionality will be implemented with team admin approval workflow');
    } catch (err) {
      console.error('Error requesting invite:', err);
      alert(err?.message || 'Failed to request invite');
    } finally {
      setRequestingInvite(prev => ({ ...prev, [teamId]: false }));
    }
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for teams by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-12 py-3 w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !searchQuery?.trim()}
            className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching teams...</p>
          </div>
        </div>
      )}
      {/* Search Results */}
      {!loading && searchResults?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Found {searchResults?.length} {searchResults?.length === 1 ? 'team' : 'teams'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults?.map((team) => (
              <div
                key={team?.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Icon name="Users" size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{team?.name}</h4>
                      {team?.company && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Icon name="Building2" size={14} />
                          <span>{team?.company?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {team?.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {team?.description}
                    </p>
                  )}

                  {team?.creator && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Icon name="User" size={14} />
                      <span>Created by {team?.creator?.username || team?.creator?.fullName}</span>
                    </div>
                  )}

                  <Button
                    onClick={() => handleRequestInvite(team?.id)}
                    disabled={requestingInvite?.[team?.id]}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {requestingInvite?.[team?.id] ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Requesting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="UserPlus" size={18} />
                        <span>Request to Join</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {!loading && searchResults?.length === 0 && searchQuery && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
            <Icon name="Search" size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No teams match your search query. Try different keywords or create a new team.
          </p>
        </div>
      )}
      {/* Initial State */}
      {!loading && !searchQuery && searchResults?.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
            <Icon name="Compass" size={40} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Teams</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Search for teams to join and collaborate with other members in your organization
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Icon name="Info" size={16} />
            <span>Enter a team name above to start searching</span>
          </div>
        </div>
      )}
    </div>
  );
}