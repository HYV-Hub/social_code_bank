import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../../components/AppIcon';
import ChannelList from './components/ChannelList';
import MessageThread from './components/MessageThread';
import MemberPanel from './components/MemberPanel';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from '../../components/AppShell';
import { teamChatService } from '../../services/teamChatService';
import { profileService } from '../../services/profileService';

const TeamChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  const [createChannelError, setCreateChannelError] = useState('');
  
  // NEW: Typing indicators and online status state
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [onlineMembers, setOnlineMembers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState(new Map());
  const typingTimeoutRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await profileService?.getCurrentProfile();
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const currentUser = userProfile ? {
    name: userProfile?.fullName || userProfile?.username || user?.email,
    avatar: userProfile?.avatarUrl,
    avatarAlt: userProfile?.fullName || 'User'
  } : null;

  // Fetch channels when user profile is loaded
  useEffect(() => {
    const fetchChannels = async () => {
      if (!userProfile?.teamId) return;

      try {
        setLoading(true);
        const data = await teamChatService?.getTeamChannels(userProfile?.teamId);
        setChannels(data || []);

        // Set first channel as active
        if (data && data?.length > 0) {
          setActiveChannel(data?.[0]);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError(err?.message || 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [userProfile]);

  // Fetch messages when active channel changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChannel?.id) return;

      try {
        const data = await teamChatService?.getChannelMessages(activeChannel?.id);
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err?.message || 'Failed to load messages');
      }
    };

    fetchMessages();

    // Subscribe to real-time messages - FIXED METHOD NAME
    const subscription = teamChatService?.subscribeToChannel(
      activeChannel?.id,
      {
        onMessage: (payload) => {
          // Fetch full message with user profile
          teamChatService?.getChannelMessages(activeChannel?.id)?.then(messages => {
            setMessages(messages || []);
          });
        },
        onMessageUpdate: (payload) => {
          setMessages(prev => prev?.map(msg =>
            msg?.id === payload?.new?.id ? { ...msg, ...payload?.new } : msg
          ));
        },
        onMessageDelete: (payload) => {
          setMessages(prev => prev?.filter(msg => msg?.id !== payload?.old?.id));
        },
        onReaction: (payload) => {
          // Refresh messages to get updated reactions
          teamChatService?.getChannelMessages(activeChannel?.id)?.then(messages => {
            setMessages(messages || []);
          });
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [activeChannel]);

  // Fetch channel members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeChannel?.id) return;

      try {
        const data = await teamChatService?.getChannelMembers(activeChannel?.id);
        setMembers(data?.map(m => m?.user) || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();
  }, [activeChannel]);

  // NEW: Subscribe to typing indicators
  useEffect(() => {
    if (!activeChannel?.id) return;

    const subscription = teamChatService?.subscribeToTyping(
      activeChannel?.id,
      (payload) => {
        const { userId, isTyping } = payload?.payload;
        
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (isTyping) {
            newMap?.set(userId, true);
          } else {
            newMap?.delete(userId);
          }
          return newMap;
        });
      }
    );

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [activeChannel]);

  // NEW: Track online status for channel members
  useEffect(() => {
    if (!activeChannel?.id || !members) return;

    // Simulate online status tracking
    // In a real implementation, this would use Supabase Presence API
    const checkOnlineStatus = async () => {
      const online = new Set();
      members?.forEach(member => {
        // For demo: mark 60% of members as online
        if (Math?.random() > 0.4) {
          online?.add(member?.id);
        }
      });
      setOnlineMembers(online);
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [activeChannel, members]);

  // NEW: Get unread counts for all channels
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!channels) return;

      const counts = new Map();
      for (const channel of channels) {
        const count = await teamChatService?.getUnreadCount(channel?.id);
        if (count > 0) {
          counts?.set(channel?.id, count);
        }
      }
      setUnreadCounts(counts);
    };

    fetchUnreadCounts();
  }, [channels, messages]);

  // NEW: Handle typing indicator
  const handleTypingStart = () => {
    if (!activeChannel?.id || !user?.id) return;

    // Clear existing timeout
    if (typingTimeoutRef?.current) {
      clearTimeout(typingTimeoutRef?.current);
    }

    // Start typing indicator
    teamChatService?.startTyping(activeChannel?.id, user?.id);

    // Auto-stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      teamChatService?.stopTyping(activeChannel?.id, user?.id);
    }, 3000);
  };

  // NEW: Mark messages as read when viewing channel
  useEffect(() => {
    if (!activeChannel?.id) return;

    const markRead = async () => {
      await teamChatService?.markAsRead(activeChannel?.id);
      // Update unread count
      setUnreadCounts(prev => {
        const newMap = new Map(prev);
        newMap?.delete(activeChannel?.id);
        return newMap;
      });
    };

    // Mark as read after 1 second of viewing
    const timeout = setTimeout(markRead, 1000);

    return () => clearTimeout(timeout);
  }, [activeChannel, messages]);

  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
    setIsMobileMenuOpen(false);
    
    // Mark messages as read when switching channels
    teamChatService?.markAsRead(channel?.id);
  };

  const handleCreateChannel = async () => {
    setShowCreateChannelModal(true);
  };

  const handleCreateChannelSubmit = async () => {
    if (!newChannelName?.trim()) {
      setCreateChannelError('Channel name is required');
      return;
    }

    if (!userProfile?.teamId) {
      setCreateChannelError('You must be part of a team to create channels');
      return;
    }

    try {
      setLoading(true);
      setCreateChannelError('');
      
      const newChannel = await teamChatService?.createChannel(
        userProfile?.teamId,
        newChannelName?.trim(),
        newChannelDescription?.trim(),
        isPrivateChannel
      );
      
      setChannels(prev => [...prev, newChannel]);
      setActiveChannel(newChannel);
      
      // Reset form
      setNewChannelName('');
      setNewChannelDescription('');
      setIsPrivateChannel(false);
      setShowCreateChannelModal(false);
    } catch (err) {
      console.error('Error creating channel:', err);
      setCreateChannelError(err?.message || 'Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!activeChannel?.id) return;

    try {
      // Stop typing indicator before sending
      if (user?.id) {
        teamChatService?.stopTyping(activeChannel?.id, user?.id);
      }
      
      const newMessage = await teamChatService?.sendMessage(
        activeChannel?.id,
        messageData?.text,
        'text',
        messageData?.replyTo || null
      );
      // Message will be added via real-time subscription
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err?.message || 'Failed to send message');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      // Check if user already reacted with this emoji
      const message = messages?.find(m => m?.id === messageId);
      const existingReaction = message?.message_reactions?.find(
        r => r?.reaction === emoji && r?.user_id === user?.id
      );

      if (existingReaction) {
        await teamChatService?.removeReaction(existingReaction?.id);
      } else {
        await teamChatService?.addReaction(messageId, emoji);
      }

      // Refresh messages
      const updatedMessages = await teamChatService?.getChannelMessages(activeChannel?.id);
      setMessages(updatedMessages || []);
    } catch (err) {
      console.error('Error handling reaction:', err);
    }
  };

  const handleMemberClick = (member) => {
    // TODO: Implement direct message functionality
    console.log('Member clicked:', member);
  };

  // Loading state
  if (!user) {
    return (
      <AppShell pageTitle="Chat">
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Chat">
        {/* Error display */}
        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-40 text-error" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Connection Error</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Chat Interface */}
        <div className="flex h-[calc(100vh-56px)]">
          {/* Channel List - Desktop */}
          <div className="hidden lg:block">
            <ChannelList
              channels={channels}
              directMessages={[]}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              onCreateChannel={handleCreateChannel}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              unreadCounts={unreadCounts} />
          </div>

          {/* Channel List - Mobile Overlay */}
          {isMobileMenuOpen &&
          <div className="lg:hidden fixed inset-0 z-40 bg-background">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
                <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-muted rounded-md transition-colors">
                  <Icon name="X" size={24} className="text-foreground" />
                </button>
              </div>
              <ChannelList
              channels={channels}
              directMessages={[]}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              onCreateChannel={handleCreateChannel}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              unreadCounts={unreadCounts} />
            </div>
          }

          {/* Message Thread */}
          <MessageThread
            activeChannel={activeChannel}
            messages={messages}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            onReply={() => {}}
            currentUser={currentUser}
            typingUsers={typingUsers}
            members={members}
            onTyping={handleTypingStart} />

          {/* Member Panel - Desktop */}
          {isMemberPanelOpen &&
          <div className="hidden xl:block">
              <MemberPanel
              activeChannel={activeChannel}
              members={members?.map(m => ({
                ...m,
                isOnline: onlineMembers?.has(m?.id)
              }))}
              sharedFiles={[]}
              onMemberClick={handleMemberClick}
              onlineMembers={onlineMembers} />
            </div>
          }

          {/* Toggle Member Panel Button - Desktop */}
          <button
            onClick={() => setIsMemberPanelOpen(!isMemberPanelOpen)}
            className="hidden xl:block fixed right-4 bottom-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-30">
            <Icon name={isMemberPanelOpen ? 'PanelRightClose' : 'PanelRightOpen'} size={20} />
          </button>
        </div>

        {/* Create Channel Modal */}
        {showCreateChannelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Create New Channel</h3>
                <button
                  onClick={() => {
                    setShowCreateChannelModal(false);
                    setNewChannelName('');
                    setNewChannelDescription('');
                    setIsPrivateChannel(false);
                    setCreateChannelError('');
                  }}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>

              {createChannelError && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md">
                  <p className="text-sm text-error">{createChannelError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e?.target?.value)}
                    placeholder="e.g. engineering-team"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e?.target?.value)}
                    placeholder="What is this channel about?"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private-channel"
                    checked={isPrivateChannel}
                    onChange={(e) => setIsPrivateChannel(e?.target?.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <label htmlFor="private-channel" className="text-sm text-foreground">
                    Make this channel private
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateChannelModal(false);
                      setNewChannelName('');
                      setNewChannelDescription('');
                      setIsPrivateChannel(false);
                      setCreateChannelError('');
                    }}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-md hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateChannelSubmit}
                    disabled={loading || !newChannelName?.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Channel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </AppShell>
  );
};

export default TeamChat;