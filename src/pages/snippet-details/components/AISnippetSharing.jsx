import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import aiSnippetEnhancementService from '../../../services/aiSnippetEnhancementService';

const AISnippetSharing = ({ snippet }) => {
  const [loading, setLoading] = useState(false);
  const [sharingData, setSharingData] = useState(null);
  const [error, setError] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Generate sharing data on component mount
  useEffect(() => {
    const generateSharingData = async () => {
      if (!snippet?.code || !snippet?.language) return;

      setLoading(true);
      setError(null);

      try {
        const result = await aiSnippetEnhancementService?.generateSharingPackage({
          id: snippet?.id, // 🔑 CRITICAL: Pass snippet ID for caching
          title: snippet?.title,
          description: snippet?.description,
          code: snippet?.code,
          language: snippet?.language,
        });

        setSharingData(result);
        
        // Log cache status for debugging
        if (result?.cached) {
          console.log('📦 Loaded AI preview from cache');
        } else {
          console.log('🆕 Generated new AI preview');
        }
      } catch (err) {
        console.error('Error generating sharing data:', err);
        setError(err?.message || 'Failed to generate sharing content');
      } finally {
        setLoading(false);
      }
    };

    generateSharingData();
  }, [snippet?.id, snippet?.code, snippet?.language]); // Added snippet.id to dependencies

  // Copy text to clipboard
  const copyToClipboard = async (text, platform) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate shareable link
  const getShareableLink = () => {
    return `${window.location?.origin}/snippet-details/${snippet?.id}`;
  };

  // Share to Twitter
  const shareToTwitter = () => {
    const text = sharingData?.socialDescriptions?.twitter || snippet?.title;
    const url = getShareableLink();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  // Share to LinkedIn
  const shareToLinkedIn = () => {
    const url = getShareableLink();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  // Copy direct link
  const copyDirectLink = () => {
    const url = getShareableLink();
    copyToClipboard(url, 'link');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating AI-powered sharing content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">Failed to generate sharing content</h3>
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
              <p className="text-xs text-red-700 font-medium mb-2">Troubleshooting steps:</p>
              <ol className="text-xs text-red-700 list-decimal list-inside space-y-1">
                <li>
                  <strong>Verify API Key:</strong> Check that <code className="bg-red-100 px-1 rounded">VITE_OPENAI_API_KEY</code> is set in your <code className="bg-red-100 px-1 rounded">.env</code> file
                </li>
                <li>
                  <strong>Get API Key:</strong> Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800 font-medium">platform.openai.com/api-keys</a> to create or copy your API key
                </li>
                <li>
                  <strong>Check API Key Format:</strong> Ensure it starts with <code className="bg-red-100 px-1 rounded">sk-</code> and has no extra spaces
                </li>
                <li>
                  <strong>Verify Account Status:</strong> Confirm your OpenAI account has available credits and is active
                </li>
                <li>
                  <strong>Restart Server:</strong> After updating the .env file, restart your development server (<code className="bg-red-100 px-1 rounded">npm run dev</code>)
                </li>
                <li>
                  <strong>Check Network:</strong> Ensure you have a stable internet connection and can access OpenAI's API
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sharingData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon name="Sparkles" size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Generated Sharing Preview</h3>
            <p className="text-sm text-gray-600">Optimized for social media and team sharing</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          aria-label="Toggle details"
        >
          <Icon 
            name={showDetails ? "ChevronUp" : "ChevronDown"} 
            size={20} 
            className="text-gray-600" 
          />
        </button>
      </div>

      {/* Enhanced Preview */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-blue-600" />
          Enhanced Preview
        </h4>
        <h5 className="text-md font-bold text-gray-900 mb-2">
          {sharingData?.preview?.enhancedTitle}
        </h5>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {sharingData?.preview?.engagingDescription}
        </p>
        <div className="flex flex-wrap gap-2">
          {sharingData?.preview?.suggestedTags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Share Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
        >
          <Icon name="Twitter" size={18} />
          <span className="font-medium">Twitter</span>
        </button>

        <button
          onClick={shareToLinkedIn}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] hover:bg-[#095196] text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
        >
          <Icon name="Linkedin" size={18} />
          <span className="font-medium">LinkedIn</span>
        </button>

        <button
          onClick={copyDirectLink}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md relative"
        >
          <Icon name={copiedPlatform === 'link' ? "Check" : "Link"} size={18} />
          <span className="font-medium">
            {copiedPlatform === 'link' ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>

      {/* Platform-Specific Descriptions (Expandable) */}
      {showDetails && (
        <div className="space-y-3 mt-4 animate-fadeIn">
          {/* Twitter Description */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="Twitter" size={16} className="text-[#1DA1F2]" />
                <h5 className="text-sm font-semibold text-gray-900">Twitter Post</h5>
              </div>
              <button
                onClick={() => copyToClipboard(sharingData?.socialDescriptions?.twitter, 'twitter')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Icon name={copiedPlatform === 'twitter' ? "Check" : "Copy"} size={14} />
                {copiedPlatform === 'twitter' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {sharingData?.socialDescriptions?.twitter}
            </p>
          </div>

          {/* LinkedIn Description */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="Linkedin" size={16} className="text-[#0A66C2]" />
                <h5 className="text-sm font-semibold text-gray-900">LinkedIn Post</h5>
              </div>
              <button
                onClick={() => copyToClipboard(sharingData?.socialDescriptions?.linkedin, 'linkedin')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Icon name={copiedPlatform === 'linkedin' ? "Check" : "Copy"} size={14} />
                {copiedPlatform === 'linkedin' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {sharingData?.socialDescriptions?.linkedin}
            </p>
          </div>

          {/* Slack Description */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={16} className="text-purple-600" />
                <h5 className="text-sm font-semibold text-gray-900">Slack Message</h5>
              </div>
              <button
                onClick={() => copyToClipboard(sharingData?.socialDescriptions?.slack, 'slack')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Icon name={copiedPlatform === 'slack' ? "Check" : "Copy"} size={14} />
                {copiedPlatform === 'slack' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {sharingData?.socialDescriptions?.slack}
            </p>
          </div>

          {/* Direct Link */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon name="Link" size={16} className="text-gray-600" />
                <h5 className="text-sm font-semibold text-gray-900">Direct Link</h5>
              </div>
              <button
                onClick={copyDirectLink}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Icon name={copiedPlatform === 'link' ? "Check" : "Copy"} size={14} />
                {copiedPlatform === 'link' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-2 rounded">
              {getShareableLink()}
            </p>
          </div>
        </div>
      )}

      {/* Footer Note - Updated to mention caching */}
      <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          {sharingData?.cached 
            ? 'These descriptions were generated by AI and cached for performance. They are optimized for each platform\'s best practices.' 
            : 'These descriptions are AI-generated and optimized for each platform\'s best practices. They have been cached for future use.'
          }
        </p>
      </div>
    </div>
  );
};

export default AISnippetSharing;