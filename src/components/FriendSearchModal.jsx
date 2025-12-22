import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import friendRequestService from '../services/friendRequestService';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';

const FriendSearchModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // NEW: Active tab state - 'search' or 'requests'
  const [activeTab, setActiveTab] = useState('search');
  // NEW: Pending friend requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      loadSuggestedUsers();
      loadPendingRequests(); // NEW: Load pending requests
      setSearchQuery('');
      setSearchResults([]);
      setError('');
      setSuccess('');
      setActiveTab('search'); // Reset to search tab
    }
  }, [isOpen]);

  // ... keep existing useEffect for search ...
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery?.trim()?.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // ... keep existing loadSuggestedUsers ...
  const loadSuggestedUsers = async () => {
    try {
      setIsLoading(true);
      const users = await friendRequestService?.getSuggestedUsers(6);
      setSuggestedUsers(users);
      
      // Check friend request status for suggested users
      const statuses = {};
      for (const suggestedUser of users) {
        const status = await friendRequestService?.checkFriendRequestStatus(suggestedUser?.id);
        statuses[suggestedUser?.id] = status;
      }
      setFriendRequests(statuses);
    } catch (err) {
      console.error('Error loading suggested users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Load pending friend requests
  const loadPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      // FIX: Use correct method name from service
      const requests = await friendRequestService?.getPendingRequests();
      
      // Transform data to match expected format
      const transformedRequests = requests?.map(request => ({
        id: request?.id,
        createdAt: request?.created_at,
        sender: {
          id: request?.sender?.id,
          name: request?.sender?.full_name || request?.sender?.username,
          username: request?.sender?.username,
          avatar: request?.sender?.avatar_url
        }
      })) || [];
      
      setPendingRequests(transformedRequests);
    } catch (err) {
      console.error('Error loading friend requests:', err);
      setError('Failed to load friend requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // ... keep existing handleSearch ...
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setError('');
      const results = await friendRequestService?.searchUsers(searchQuery);
      setSearchResults(results);

      // Check friend request status for search results
      const statuses = {};
      for (const result of results) {
        const status = await friendRequestService?.checkFriendRequestStatus(result?.id);
        statuses[result?.id] = status;
      }
      setFriendRequests(prev => ({ ...prev, ...statuses }));
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // ... keep existing handleSendRequest ...
  const handleSendRequest = async (userId) => {
    try {
      setError('');
      setSuccess('');
      // UPDATED: Use the method with notification
      await friendRequestService?.sendFriendRequestWithNotification(userId);
      setSuccess('Friend request sent successfully!');
      
      // Update the friend request status
      setFriendRequests(prev => ({
        ...prev,
        [userId]: { status: 'pending', sender_id: user?.id }
      }));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err?.message?.includes('duplicate')) {
        setError('Friend request already sent to this user.');
      } else {
        setError('Failed to send friend request. Please try again.');
      }
      console.error('Error sending friend request:', err);
    }
  };

  // ... keep existing handleCancelRequest ...
  const handleCancelRequest = async (userId) => {
    try {
      setError('');
      const requestData = friendRequests?.[userId];
      if (requestData?.id) {
        await friendRequestService?.cancelFriendRequest(requestData?.id);
        setSuccess('Friend request cancelled.');
        
        // Remove from friend requests
        setFriendRequests(prev => {
          const updated = { ...prev };
          delete updated?.[userId];
          return updated;
        });

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to cancel friend request.');
      console.error('Error cancelling friend request:', err);
    }
  };

  // NEW: Handle accepting friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      setError('');
      setSuccess('');
      setProcessingRequests(prev => new Set(prev)?.add(requestId));

      await friendRequestService?.acceptFriendRequest(requestId);
      
      // Remove the accepted request from the list
      setPendingRequests(prev => prev?.filter(req => req?.id !== requestId));
      
      setSuccess('Friend request accepted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet?.delete(requestId);
        return newSet;
      });
    }
  };

  // NEW: Handle rejecting friend request
  const handleRejectRequest = async (requestId) => {
    try {
      setError('');
      setSuccess('');
      setProcessingRequests(prev => new Set(prev)?.add(requestId));

      await friendRequestService?.rejectFriendRequest(requestId);
      
      // Remove the rejected request from the list
      setPendingRequests(prev => prev?.filter(req => req?.id !== requestId));
      
      setSuccess('Friend request rejected.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet?.delete(requestId);
        return newSet;
      });
    }
  };

  // ... keep existing getUserStatus ...
  const getUserStatus = (userId) => {
    const request = friendRequests?.[userId];
    if (!request) return 'none';
    if (request?.status === 'accepted') return 'friends';
    if (request?.status === 'pending') {
      return request?.sender_id === user?.id ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  };

  // ... keep existing renderUserCard ...
  const renderUserCard = (userItem) => {
    const status = getUserStatus(userItem?.id);

    return (
      <div key={userItem?.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <img
          src={userItem?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem?.full_name || userItem?.username || 'User')}&background=random`}
          alt={userItem?.full_name || userItem?.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userItem?.full_name || userItem?.username}
          </p>
          {userItem?.username && (
            <p className="text-xs text-gray-500 truncate">@{userItem?.username}</p>
          )}
          {userItem?.bio && (
            <p className="text-xs text-gray-600 truncate mt-1">{userItem?.bio}</p>
          )}
          {userItem?.contributor_level && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {userItem?.contributor_level}
            </span>
          )}
        </div>

        <div className="flex-shrink-0">
          {status === 'friends' && (
            <Button variant="ghost" size="sm" disabled className="text-green-600">
              <Icon name="Check" size={16} className="mr-1" />
              Friends
            </Button>
          )}
          {status === 'pending_sent' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCancelRequest(userItem?.id)}
              className="text-gray-600"
            >
              <Icon name="Clock" size={16} className="mr-1" />
              Pending
            </Button>
          )}
          {status === 'pending_received' && (
            <Button variant="ghost" size="sm" disabled className="text-blue-600">
              <Icon name="Mail" size={16} className="mr-1" />
              Received
            </Button>
          )}
          {status === 'none' && (
            <Button 
              size="sm"
              onClick={() => handleSendRequest(userItem?.id)}
              className="flex items-center gap-1"
            >
              <Icon name="UserPlus" size={16} />
              Add
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* CRITICAL: Backdrop with proper z-index and full coverage */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />
      {/* CRITICAL: Modal container with perfect centering and proper z-index */}
      <div 
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden my-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e?.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="friend-modal-title"
          style={{
            position: 'relative',
            margin: 'auto',
            maxHeight: '90vh'
          }}
        >
          {/* Header - FIXED */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <h2 id="friend-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="UserPlus" size={24} className="text-blue-600" />
              <span className="hidden sm:inline">Find Friends</span>
              <span className="sm:hidden">Friends</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-full transition-all duration-200 group flex-shrink-0"
              aria-label="Close modal"
            >
              <Icon name="X" size={20} className="text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>

          {/* NEW: Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'search' ?'text-blue-600 border-b-2 border-blue-600 bg-white' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon name="Search" size={16} />
                <span>Add Friends</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'requests' ?'text-blue-600 border-b-2 border-blue-600 bg-white' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon name="Inbox" size={16} />
                <span>Current Requests</span>
                {pendingRequests?.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {pendingRequests?.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Search Bar - FIXED (only show in search tab) */}
          {activeTab === 'search' && (
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={20} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                />
                <Input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="pl-12 pr-4 py-3 w-full text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  autoFocus
                />
              </div>
              
              {/* Messages */}
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
                  <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{error}</span>
                </div>
              )}
              {success && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
                  <Icon name="CheckCircle" size={18} className="flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{success}</span>
                </div>
              )}
            </div>
          )}

          {/* Content - SCROLLABLE */}
          <div 
            className="overflow-y-auto bg-white flex-1" 
            style={{ 
              maxHeight: 'calc(90vh - 200px)',
              minHeight: '200px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {/* Search Tab Content */}
            {activeTab === 'search' && (
              <>
                {/* Search Results */}
                {searchQuery?.trim()?.length >= 2 && (
                  <div className="p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon name="Search" size={16} className="text-blue-600" />
                      Search Results
                    </h3>
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Icon name="Loader2" size={32} className="animate-spin text-blue-600 mb-3" />
                        <span className="text-gray-600 font-medium">Searching...</span>
                      </div>
                    ) : searchResults?.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults?.map(renderUserCard)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Icon name="Users" size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No users found</p>
                        <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Users */}
                {searchQuery?.trim()?.length < 2 && (
                  <div className="p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Icon name="Sparkles" size={16} className="text-indigo-600" />
                      Suggested Users
                    </h3>
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Icon name="Loader2" size={32} className="animate-spin text-indigo-600 mb-3" />
                        <span className="text-gray-600 font-medium">Loading suggestions...</span>
                      </div>
                    ) : suggestedUsers?.length > 0 ? (
                      <div className="space-y-2">
                        {suggestedUsers?.map(renderUserCard)}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Icon name="Users" size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No suggested users available</p>
                        <p className="text-sm text-gray-500 mt-1">Check back later for recommendations</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* NEW: Requests Tab Content */}
            {activeTab === 'requests' && (
              <div className="p-4 sm:p-6">
                {/* Messages for requests tab */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                    <Icon name="AlertCircle" size={18} className="flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start gap-2">
                    <Icon name="CheckCircle" size={18} className="flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{success}</span>
                  </div>
                )}

                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="Inbox" size={16} className="text-blue-600" />
                  Pending Requests ({pendingRequests?.length})
                </h3>

                {loadingRequests ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Icon name="Loader2" size={32} className="animate-spin text-blue-600 mb-3" />
                    <span className="text-gray-600 font-medium">Loading requests...</span>
                  </div>
                ) : pendingRequests?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="Inbox" size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No pending friend requests</p>
                    <p className="text-sm text-gray-500 mt-1">New requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests?.map((request) => (
                      <div
                        key={request?.id}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                      >
                        <img
                          src={request?.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request?.sender?.name || 'User')}&background=random`}
                          alt={request?.sender?.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request?.sender?.name}
                          </p>
                          {request?.sender?.username && (
                            <p className="text-xs text-gray-500 truncate">@{request?.sender?.username}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(request?.createdAt)?.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectRequest(request?.id)}
                            disabled={processingRequests?.has(request?.id)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                          >
                            {processingRequests?.has(request?.id) ? (
                              <Icon name="Loader2" size={16} className="animate-spin" />
                            ) : (
                              <Icon name="X" size={16} />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request?.id)}
                            disabled={processingRequests?.has(request?.id)}
                            className="flex items-center gap-1"
                          >
                            {processingRequests?.has(request?.id) ? (
                              <Icon name="Loader2" size={16} className="animate-spin" />
                            ) : (
                              <>
                                <Icon name="Check" size={16} />
                                <span className="hidden sm:inline">Accept</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendSearchModal;