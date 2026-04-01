import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ChannelList = ({ 
  channels, 
  directMessages, 
  activeChannel, 
  onChannelSelect, 
  onCreateChannel,
  searchQuery,
  onSearchChange,
  unreadCounts = new Map()
}) => {
  const [activeTab, setActiveTab] = useState('channels');

  const filteredChannels = channels?.filter(channel =>
    channel?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '')
  );

  const filteredDMs = directMessages?.filter(dm =>
    dm?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase() || '')
  );

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'channels' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Channels
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'direct' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Direct Messages
        </button>
      </div>

      {/* Channel/DM List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'channels' ? (
          <div className="p-2">
            <button
              onClick={onCreateChannel}
              className="w-full flex items-center gap-3 p-3 text-primary hover:bg-primary/10 rounded-lg transition-colors mb-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="Plus" size={18} className="text-primary" />
              </div>
              <span className="font-medium">Create Channel</span>
            </button>

            {filteredChannels?.map((channel) => {
              const isActive = activeChannel?.id === channel?.id;
              const unreadCount = unreadCounts?.get(channel?.id) || 0;
              
              return (
                <button
                  key={channel?.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary' :'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={channel?.is_private ? 'Lock' : 'Hash'} 
                      size={18} 
                      className={isActive ? 'text-primary' : 'text-muted-foreground'} 
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{channel?.name}</p>
                    {channel?.description && (
                      <p className="text-xs text-muted-foreground truncate">{channel?.description}</p>
                    )}
                  </div>
                  {/* NEW: Unread badge */}
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-error/100 text-white text-xs font-medium rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredChannels?.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No channels found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredDMs?.map((dm) => {
              const isActive = activeChannel?.id === dm?.id;
              
              return (
                <button
                  key={dm?.id}
                  onClick={() => onChannelSelect(dm)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10' :'hover:bg-muted'
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={dm?.avatar}
                      alt={dm?.avatarAlt}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {dm?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {dm?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dm?.lastMessage || (dm?.isOnline ? 'Active now' : 'Offline')}
                    </p>
                  </div>
                  {dm?.unreadCount > 0 && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {dm?.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {filteredDMs?.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No direct messages yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelList;