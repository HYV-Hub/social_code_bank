import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import friendRequestService from '../../../services/friendRequestService';

const FriendsFollowersPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'suggestions') {
        const users = await friendRequestService?.getSuggestedUsers(10);
        setSuggestedUsers(users);
        
        const statusMap = {};
        for (const suggestedUser of users) {
          const isFollowing = await friendRequestService?.isFollowing(suggestedUser?.id);
          const requestStatus = await friendRequestService?.checkFriendRequestStatus(suggestedUser?.id);
          statusMap[suggestedUser?.id] = { isFollowing, requestStatus };
        }
        setFollowingStatus(statusMap);
      } else if (activeTab === 'followers') {
        const data = await friendRequestService?.getFollowers();
        setFollowers(data);
      } else if (activeTab === 'following') {
        const data = await friendRequestService?.getFollowing();
        setFollowing(data);
      } else if (activeTab === 'requests') {
        const pending = await friendRequestService?.getPendingRequests();
        const sent = await friendRequestService?.getSentRequests();
        setPendingRequests(pending);
        setSentRequests(sent);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await friendRequestService?.followUser(userId);
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: { ...prev?.[userId], isFollowing: true }
      }));
      
      alert('You are now following this user!');
    } catch (error) {
      console.error('Error following user:', error);
      alert('Failed to follow user. Please try again.');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await friendRequestService?.unfollowUser(userId);
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: { ...prev?.[userId], isFollowing: false }
      }));
      loadData();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Failed to unfollow user. Please try again.');
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendRequestService?.sendFriendRequestWithNotification(userId);
      
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: { 
          ...prev?.[userId], 
          requestStatus: { status: 'pending', sender_id: user?.id }
        }
      }));
      
      alert('Friend request sent successfully! The user will be notified.');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendRequestService?.acceptFriendRequest(requestId);
      alert('Friend request accepted!');
      loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendRequestService?.rejectFriendRequest(requestId);
      loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await friendRequestService?.cancelFriendRequest(requestId);
      loadData();
    } catch (error) {
      console.error('Error canceling request:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const renderUserCard = (userItem, showActions = true) => (
    <div key={userItem?.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {userItem?.avatar_url ? (
          <img 
            src={userItem?.avatar_url} 
            alt={userItem?.full_name} 
            className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-base">
              {(userItem?.full_name || userItem?.username)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {userItem?.full_name || userItem?.username}
          </h3>
          <p className="text-xs text-gray-600 truncate">@{userItem?.username}</p>
        </div>
      </div>
      
      {userItem?.bio && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{userItem?.bio}</p>
      )}
      
      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
        {userItem?.followers_count !== undefined && (
          <span>{userItem?.followers_count} followers</span>
        )}
        {userItem?.contributor_level && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
            {userItem?.contributor_level}
          </span>
        )}
      </div>
      
      {showActions && (
        <div className="flex gap-2">
          {followingStatus?.[userItem?.id]?.isFollowing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnfollow(userItem?.id)}
              iconName="UserMinus"
              className="flex-1 text-xs"
            >
              Unfollow
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleFollow(userItem?.id)}
              iconName="UserPlus"
              className="flex-1 text-xs"
            >
              Follow
            </Button>
          )}
          
          {!followingStatus?.[userItem?.id]?.requestStatus ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendFriendRequest(userItem?.id)}
              iconName="UserPlus"
              className="flex-1 text-xs"
            >
              Add Friend
            </Button>
          ) : followingStatus?.[userItem?.id]?.requestStatus?.status === 'pending' ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex-1 text-xs"
            >
              Pending
            </Button>
          ) : followingStatus?.[userItem?.id]?.requestStatus?.status === 'accepted' ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex-1 text-xs"
            >
              Friends
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Friends & Followers</h2>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex flex-col">
          {[
            { id: 'suggestions', label: 'Suggestions', icon: 'Sparkles' },
            { id: 'followers', label: 'Followers', icon: 'Users' },
            { id: 'following', label: 'Following', icon: 'UserCheck' },
            { id: 'requests', label: 'Requests', icon: 'Bell' }
          ]?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-l-4 ${
                activeTab === tab?.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50' :'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
              {tab?.id === 'requests' && (pendingRequests?.length > 0 || sentRequests?.length > 0) && (
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                  {pendingRequests?.length + sentRequests?.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'suggestions' && (
              <>
                {suggestedUsers?.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">No suggestions available</p>
                  </div>
                ) : (
                  suggestedUsers?.map(userItem => renderUserCard(userItem, true))
                )}
              </>
            )}

            {activeTab === 'followers' && (
              <>
                {followers?.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">No followers yet</p>
                  </div>
                ) : (
                  followers?.map(userItem => renderUserCard(userItem, false))
                )}
              </>
            )}

            {activeTab === 'following' && (
              <>
                {following?.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="UserCheck" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Not following anyone yet</p>
                  </div>
                ) : (
                  following?.map(userItem => renderUserCard(userItem, false))
                )}
              </>
            )}

            {activeTab === 'requests' && (
              <>
                {pendingRequests?.length === 0 && sentRequests?.length === 0 ? (
                  <div className="text-center py-16">
                    <Icon name="Bell" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">No friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingRequests?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Received Requests</h3>
                        <div className="space-y-4">
                          {pendingRequests?.map((request) => (
                            <div key={request?.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                {request?.sender?.avatar_url ? (
                                  <img 
                                    src={request?.sender?.avatar_url} 
                                    alt={request?.sender?.full_name} 
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-base">
                                      {request?.sender?.full_name?.charAt(0)?.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">
                                    {request?.sender?.full_name || request?.sender?.username}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    @{request?.sender?.username} sent you a friend request
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAcceptRequest(request?.id)}
                                  iconName="Check"
                                  className="flex-1 text-xs"
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectRequest(request?.id)}
                                  iconName="X"
                                  className="flex-1 text-xs"
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sentRequests?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Sent Requests</h3>
                        <div className="space-y-4">
                          {sentRequests?.map((request) => (
                            <div key={request?.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3">
                                {request?.receiver?.avatar_url ? (
                                  <img 
                                    src={request?.receiver?.avatar_url} 
                                    alt={request?.receiver?.full_name} 
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-base">
                                      {request?.receiver?.full_name?.charAt(0)?.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">
                                    {request?.receiver?.full_name || request?.receiver?.username}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    @{request?.receiver?.username} • {request?.status === 'pending' ? 'Pending' : request?.status}
                                  </p>
                                </div>
                              </div>
                              {request?.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelRequest(request?.id)}
                                  iconName="X"
                                  className="w-full text-xs"
                                >
                                  Cancel Request
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsFollowersPanel;