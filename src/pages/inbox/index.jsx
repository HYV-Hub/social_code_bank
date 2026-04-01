import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import { dmService } from '../../services/dmService';

export default function InboxPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  // Auto-open conversation if ?user= param
  useEffect(() => {
    if (targetUserId && user) {
      dmService.getOrCreateConversation(targetUserId).then(convId => {
        setActiveConv(convId);
        loadMessages(convId);
      }).catch(console.error);
    }
  }, [targetUserId, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await dmService.getConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const msgs = await dmService.getMessages(convId);
      setMessages(msgs);
      dmService.markAsRead(convId);
      scrollToBottom();

      // Subscribe to new messages
      if (channel) dmService.unsubscribe(channel);
      const sub = dmService.subscribeToMessages(convId, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      });
      setChannel(sub);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSelectConversation = (conv) => {
    setActiveConv(conv.id);
    loadMessages(conv.id);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    try {
      setSending(true);
      await dmService.sendMessage(activeConv, newMessage.trim());
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending:', err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    return () => { if (channel) dmService.unsubscribe(channel); };
  }, [channel]);

  return (
    <AppShell pageTitle="Messages">
      <div className="flex h-[calc(100vh-3.5rem-3rem)] lg:h-[calc(100vh-3.5rem)]">
        {/* Conversations List */}
        <div className={`${activeConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-border`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 hyv-skeleton rounded-lg" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="MessageCircle" size={32} className="mx-auto text-muted-foreground mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Visit a user profile and click "Message" to start</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors border-b border-border/50 ${
                    activeConv === conv.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <img
                    src={conv.otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser?.full_name || 'U')}&background=8b5cf6&color=fff&size=36`}
                    alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{conv.otherUser?.full_name || conv.otherUser?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">{conv.unreadCount}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`${activeConv ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Back button on mobile */}
              <div className="md:hidden flex items-center gap-2 p-3 border-b border-border">
                <button onClick={() => setActiveConv(null)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="ArrowLeft" size={20} />
                </button>
                <span className="text-sm font-medium text-foreground">Back</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-full text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Icon name="Send" size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
