import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MemberPanel = ({ activeChannel, members, sharedFiles, onMemberClick, onlineMembers = new Set() }) => {
  const [activeTab, setActiveTab] = React.useState('members');

  if (!activeChannel) {
    return null;
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Details</h3>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'members' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'files' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Files
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'members' ? (
          <div className="p-4 space-y-3">
            {members?.map((member) => {
              const isOnline = onlineMembers?.has(member?.id) || member?.isOnline;
              
              return (
                <button
                  key={member?.id}
                  onClick={() => onMemberClick(member)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={member?.avatar_url || member?.avatar}
                      alt={member?.full_name || member?.avatarAlt}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full">
                        <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                      </span>
                    )}
                    {!isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-card rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {member?.full_name || member?.name}
                      </span>
                      {isOnline && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Online
                        </span>
                      )}
                      {member?.role === 'admin' && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member?.title || (isOnline ? 'Active now' : 'Offline')}
                    </p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {sharedFiles?.map((file) => (
              <div
                key={file?.id}
                className="p-3 bg-background border border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon 
                      name={file?.type === 'image' ? 'Image' : file?.type === 'code' ? 'Code' : 'FileText'} 
                      size={20} 
                      className="text-muted-foreground" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{file?.size}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{file?.uploadedBy}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{file?.uploadedAt}</p>
                  </div>
                  <button className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors">
                    <Icon name="Download" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Channel Info */}
      {activeChannel?.type === 'channel' && (
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Channel Description</p>
              <p className="text-sm text-foreground">{activeChannel?.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
              <p className="text-sm text-foreground">{activeChannel?.createdAt}</p>
            </div>
            <button className="w-full px-4 py-2 bg-background border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Channel Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPanel;