import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Loader } from 'lucide-react';
import { teamInviteService } from '../services/teamInviteService';
import Button from './ui/Button';

const InviteTeamModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!isOpen || !teamId) return;

      try {
        setLoading(true);
        setError('');
        const results = await teamInviteService?.searchUsersToInvite(teamId, searchQuery);
        setUsers(results);
      } catch (err) {
        console.error('Error searching users:', err);
        setError(err?.message || 'Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, teamId]);

  const handleInvite = async (userId, userName) => {
    try {
      setInviting(true);
      setError('');
      setSuccess('');

      await teamInviteService?.createInvite(
        teamId,
        userId,
        `Join our team: ${teamName}`
      );

      setSuccess(`Invitation sent to ${userName}`);
      
      // Remove invited user from list
      setUsers(users?.filter(u => u?.id !== userId));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error sending invite:', err);
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Invite Users to Team</h2>
              <p className="text-sm text-muted-foreground">{teamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : users?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No users found' : 'Start typing to search for users'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => (
                <div
                  key={user?.id}
                  className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName)}&background=random`}
                      alt={user?.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">{user?.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInvite(user?.id, user?.fullName)}
                    disabled={inviting}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteTeamModal;