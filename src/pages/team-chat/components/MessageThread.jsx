import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MessageThread = ({ 
  activeChannel, 
  messages, 
  onSendMessage,
  onReaction,
  onReply,
  currentUser,
  typingUsers = new Map(),
  members = [],
  onTyping
}) => {
  const [messageText, setMessageText] = React.useState('');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState(null);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageText?.trim()) {
      onSendMessage({
        text: messageText,
        replyTo: replyingTo?.id
      });
      setMessageText('');
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSend();
    }
  };

  // NEW: Handle typing indicator on input change
  const handleInputChange = (e) => {
    setMessageText(e?.target?.value);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
    }
  };

  // NEW: Get typing users display text
  const getTypingText = () => {
    const typingArray = Array.from(typingUsers?.keys() || []);
    const typingMembers = members?.filter(m => typingArray?.includes(m?.id) && m?.id !== currentUser?.id);
    
    if (typingMembers?.length === 0) return null;
    if (typingMembers?.length === 1) {
      return `${typingMembers?.[0]?.full_name || typingMembers?.[0]?.username} is typing...`;
    }
    if (typingMembers?.length === 2) {
      return `${typingMembers?.[0]?.full_name || typingMembers?.[0]?.username} and ${typingMembers?.[1]?.full_name || typingMembers?.[1]?.username} are typing...`;
    }
    return `${typingMembers?.length} people are typing...`;
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate?.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return messageDate?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const emojis = ['👍', '❤️', '😊', '🎉', '🚀', '👀', '✅', '🔥'];

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No conversation selected</h3>
          <p className="text-muted-foreground">Choose a channel or direct message to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeChannel?.type === 'channel' ? (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={activeChannel?.isPrivate ? 'Lock' : 'Hash'} size={20} className="text-primary" />
              </div>
            ) : (
              <Image
                src={activeChannel?.avatar}
                alt={activeChannel?.avatarAlt}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">{activeChannel?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeChannel?.type === 'channel' 
                  ? `${activeChannel?.memberCount} members` 
                  : activeChannel?.isOnline ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-md transition-colors">
              <Icon name="Phone" size={20} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-md transition-colors">
              <Icon name="Video" size={20} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-md transition-colors">
              <Icon name="Info" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages?.map((message) => (
          <div key={message?.id} className="group">
            {message?.replyTo && (
              <div className="ml-14 mb-1 pl-4 border-l-2 border-muted">
                <p className="text-xs text-muted-foreground">
                  Replying to <span className="font-medium">{message?.replyTo?.author}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{message?.replyTo?.text}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Image
                src={message?.user_profiles?.avatar_url || message?.avatar}
                alt={message?.user_profiles?.full_name || message?.avatarAlt}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-foreground">
                    {message?.user_profiles?.full_name || message?.user_profiles?.username || message?.author}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTime(message?.created_at || message?.timestamp)}</span>
                  {message?.is_edited && (
                    <span className="text-xs text-muted-foreground">(edited)</span>
                  )}
                  <span className="text-xs text-green-600">
                    <Icon name="CheckCheck" size={14} />
                  </span>
                </div>
                
                <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {message?.text}
                </div>

                {message?.codeSnippet && (
                  <div className="mt-2 p-3 bg-muted rounded-md border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{message?.codeSnippet?.language}</span>
                      <button className="text-xs text-primary hover:underline">Copy</button>
                    </div>
                    <pre className="text-xs text-foreground overflow-x-auto">
                      <code>{message?.codeSnippet?.code}</code>
                    </pre>
                  </div>
                )}

                {message?.attachment && (
                  <div className="mt-2 p-3 bg-muted rounded-md border border-border flex items-center gap-3">
                    <Icon name="FileText" size={24} className="text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{message?.attachment?.name}</p>
                      <p className="text-xs text-muted-foreground">{message?.attachment?.size}</p>
                    </div>
                    <button className="text-primary hover:underline text-sm">Download</button>
                  </div>
                )}

                {/* Reactions */}
                {message?.reactions && message?.reactions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message?.reactions?.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() => onReaction(message?.id, reaction?.emoji)}
                        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                          reaction?.hasReacted
                            ? 'bg-primary/20 text-primary border border-primary' :'bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent'
                        }`}
                      >
                        <span>{reaction?.emoji}</span>
                        <span>{reaction?.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowEmojiPicker(message?.id)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="Smile" size={16} />
                  </button>
                  <button
                    onClick={() => setReplyingTo(message)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="Reply" size={16} />
                  </button>
                  <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="MoreHorizontal" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* NEW: Typing indicator */}
        {getTypingText() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>{getTypingText()}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        {replyingTo && (
          <div className="mb-2 px-4 py-2 bg-muted rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Reply" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium text-foreground">{replyingTo?.author}</span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${activeChannel?.name}`}
              rows={1}
              className="w-full px-4 py-3 pr-24 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <Icon name="Paperclip" size={18} className="text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <Icon name="Code" size={18} className="text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <Icon name="Smile" size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText?.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="Send" size={18} />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;