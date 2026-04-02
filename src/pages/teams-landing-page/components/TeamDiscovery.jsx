import React, { useState } from 'react';
import { teamService } from '../../../services/teamService';
import { notificationService } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';

import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function TeamDiscovery() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestingInvite, setRequestingInvite] = useState({});
  const [requestedTeams, setRequestedTeams] = useState({});

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

  const handleRequestInvite = async (team) => {
    try {
      setRequestingInvite(prev => ({ ...prev, [team?.id]: true }));
      await notificationService?.createNotification({
        user_id: team?.created_by || team?.creator?.id,
        type: 'team_join_request',
        title: 'Team Join Request',
        message: `${user?.user_metadata?.full_name || user?.email} requested to join ${team?.name}`,
        metadata: { team_id: team?.id, requester_id: user?.id }
      });
      setRequestedTeams(prev => ({ ...prev, [team?.id]: true }));
    } catch (err) {
      console.error('Error requesting invite:', err);
      setError(err?.message || 'Failed to send join request');
    } finally {
      setRequestingInvite(prev => ({ ...prev, [team?.id]: false }));
    }
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            className="px-8 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Error</p>
            <p className="text-sm text-error mt-1">{error}</p>
          </div>
        </div>
      )}
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching teams...</p>
          </div>
        </div>
      )}
      {/* Search Results */}
      {!loading && searchResults?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Found {searchResults?.length} {searchResults?.length === 1 ? 'team' : 'teams'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults?.map((team) => (
              <div
                key={team?.id}
                className="bg-card rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon name="Users" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{team?.name}</h4>
                      {team?.company && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Icon name="Building2" size={14} />
                          <span>{team?.company?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {team?.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {team?.description}
                    </p>
                  )}

                  {team?.creator && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Icon name="User" size={14} />
                      <span>Created by {team?.creator?.username || team?.creator?.fullName}</span>
                    </div>
                  )}

                  <Button
                    onClick={() => handleRequestInvite(team)}
                    disabled={requestingInvite?.[team?.id] || requestedTeams?.[team?.id]}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {requestedTeams?.[team?.id] ? (
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="Check" size={18} />
                        <span>Request Sent</span>
                      </div>
                    ) : requestingInvite?.[team?.id] ? (
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Icon name="Search" size={40} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No teams match your search query. Try different keywords or create a new team.
          </p>
        </div>
      )}
      {/* Initial State */}
      {!loading && !searchQuery && searchResults?.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 mb-6">
            <Icon name="Compass" size={40} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Discover Teams</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Search for teams to join and collaborate with other members in your organization
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={16} />
            <span>Enter a team name above to start searching</span>
          </div>
        </div>
      )}
    </div>
  );
}