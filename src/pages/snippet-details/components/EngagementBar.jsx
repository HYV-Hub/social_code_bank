import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { snippetService } from '../../../services/snippetService';
import { useAuth } from '../../../contexts/AuthContext';

export default function EngagementBar({ snippet, onLikeUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(snippet?.likesCount || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if user has liked on mount
  useEffect(() => {
    if (user?.id && snippet?.id) {
      checkUserLiked();
    }
  }, [user?.id, snippet?.id]);

  const checkUserLiked = async () => {
    try {
      const hasLiked = await snippetService?.checkUserLiked(snippet?.id);
      setLiked(hasLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like snippets');
      return;
    }

    try {
      setLoading(true);
      const result = await snippetService?.toggleLike(snippet?.id, user?.id);
      
      setLiked(result?.liked);
      setLikeCount(prev => result?.liked ? prev + 1 : prev - 1);

      if (onLikeUpdate) {
        onLikeUpdate(result?.liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save functionality not yet implemented');
  };

  const handleShare = (platform) => {
    const url = window.location?.href;
    const text = `Check out this code snippet: ${snippet?.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard?.writeText(url);
      setShowShareMenu(false);
      alert('Link copied to clipboard');
    } else {
      window.open(shareUrls?.[platform], '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Enhanced Like Button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className={`group relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
              liked
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-foreground hover:from-red-50 hover:to-pink-50 hover:text-error shadow-md'
            }`}
          >
            <Icon 
              name={liked ? "Heart" : "Heart"} 
              size={20} 
              className={`transition-transform ${liked ? 'animate-pulse fill-current' : 'group-hover:scale-110'}`}
            />
            <span className="text-sm font-bold">{likeCount?.toLocaleString()}</span>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {liked ? 'Unlike' : 'Like this snippet'}
            </div>
          </button>

          {/* Enhanced Save Button */}
          <button
            onClick={handleSave}
            className={`group relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
              saved
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-foreground hover:from-blue-50 hover:to-cyan-50 hover:text-primary shadow-md'
            }`}
          >
            <Icon 
              name="Bookmark" 
              size={20} 
              className={`transition-transform ${saved ? 'fill-current' : 'group-hover:scale-110'}`}
            />
            <span className="text-sm font-bold">Save</span>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {saved ? 'Unsave' : 'Save for later'}
            </div>
          </button>

          {/* Enhanced Share Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105"
            >
              <Icon name="Share2" size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold">Share</span>
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-card text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Share snippet
              </div>
            </button>

            {/* Enhanced Share Menu */}
            {showShareMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowShareMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute top-full left-0 mt-3 bg-card border-2 border-border rounded-xl shadow-2xl p-2 z-50 min-w-[240px] transform origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Social Share Options */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="Twitter" size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Share on Twitter</span>
                    </button>

                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="Linkedin" size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Share on LinkedIn</span>
                    </button>

                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name="Facebook" size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Share on Facebook</span>
                    </button>

                    <div className="border-t border-border my-2"></div>

                    <button
                      onClick={() => {
                        handleShare('copy');
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                        <Icon name={copiedLink ? "Check" : "Link"} size={18} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {copiedLink ? 'Link Copied!' : 'Copy Link'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Comments Badge */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border border-border shadow-md">
          <Icon name="MessageSquare" size={20} className="text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{snippet?.commentsCount || 0}</span>
            <span className="text-sm text-muted-foreground font-medium">comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}