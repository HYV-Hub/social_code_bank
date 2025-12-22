import openai from '../lib/openaiClient';
import { isOpenAIAvailable } from '../lib/openaiClient';
import { supabase } from './supabaseClient';
import OpenAI, { 
  APIConnectionError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
  InternalServerError
} from 'openai';

/**
 * Maps OpenAI API error types to user-friendly error messages.
 * @param {Error} error - The error object from OpenAI API.
 * @returns {Object} Error information object with isInternal flag and message.
 */
function getErrorMessage(error) {
  if (error instanceof AuthenticationError) {
    return { isInternal: true, message: 'Invalid API key or authentication failed. Please check your OpenAI API key.' };
  } else if (error instanceof PermissionDeniedError) {
    return { isInternal: true, message: 'Quota exceeded or authorization failed. You may have exceeded your usage limits or do not have access to this resource.' };
  } else if (error instanceof RateLimitError) {
    return { isInternal: true, message: 'Rate limit exceeded. You are sending requests too quickly. Please wait a moment and try again.' };
  } else if (error instanceof InternalServerError) {
    return { isInternal: true, message: 'OpenAI service is currently unavailable. Please try again later.' };
  } else if (error instanceof APIConnectionError) {
    return { isInternal: true, message: 'Unable to connect to OpenAI service. Please check your API key and internet connection.' };
  } else {
    return { isInternal: false, message: error?.message || 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * AI Snippet Enhancement Service
 * Uses OpenAI to generate engaging snippet previews and social descriptions
 * Now includes server-side caching to prevent duplicate AI API calls
 */
export const aiSnippetEnhancementService = {
  /**
   * Generate an engaging snippet preview
   * @param {Object} snippetData - The snippet data (title, description, code, language)
   * @returns {Promise<Object>} Generated preview with title, description, and tags
   */
  async generateSnippetPreview(snippetData) {
    try {
      // Check OpenAI availability
      const availability = isOpenAIAvailable();
      if (!availability?.isAvailable) {
        throw new Error(availability?.message);
      }

      // Verify openai client exists
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your configuration and restart the application.');
      }

      const { title, description, code, language } = snippetData;

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert developer content writer who creates engaging, concise previews for code snippets. Your previews should be informative, attention-grabbing, and optimized for sharing across teams and social platforms.' 
          },
          { 
            role: 'user', 
            content: `Create an engaging preview for this ${language} code snippet:

Title: ${title}
Description: ${description || 'No description provided'}
Code Preview: ${code?.substring(0, 500)}...

Generate:
1. An engaging title (if the current title is generic, improve it)
2. A compelling 2-3 sentence description that highlights what makes this snippet valuable
3. 3-5 relevant hashtags/tags for discoverability

Format your response as JSON with these exact keys: enhancedTitle, engagingDescription, suggestedTags (array of strings)`
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'snippet_preview',
            schema: {
              type: 'object',
              properties: {
                enhancedTitle: { type: 'string', description: 'An improved, engaging title for the snippet' },
                engagingDescription: { type: 'string', description: 'A compelling 2-3 sentence description' },
                suggestedTags: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Array of 3-5 relevant hashtags/tags'
                }
              },
              required: ['enhancedTitle', 'engagingDescription', 'suggestedTags'],
              additionalProperties: false,
            },
          },
        },
      });

      const result = JSON.parse(response?.choices?.[0]?.message?.content || '{}');

      return {
        success: true,
        enhancedTitle: result?.enhancedTitle || title,
        engagingDescription: result?.engagingDescription || description,
        suggestedTags: result?.suggestedTags || [],
      };
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      if (errorInfo?.isInternal) {
        console.error('OpenAI API Error:', errorInfo?.message);
      } else {
        console.error('Error generating snippet preview:', error);
      }
      throw new Error(errorInfo?.message);
    }
  },

  /**
   * Generate social media descriptions for different platforms
   * @param {Object} snippetData - The snippet data
   * @param {Array<string>} platforms - Platforms to generate for (e.g., ['twitter', 'linkedin', 'slack'])
   * @returns {Promise<Object>} Platform-specific descriptions
   */
  async generateSocialDescriptions(snippetData, platforms = ['twitter', 'linkedin', 'slack']) {
    try {
      // Check OpenAI availability
      const availability = isOpenAIAvailable();
      if (!availability?.isAvailable) {
        throw new Error(availability?.message);
      }

      // Verify openai client exists
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your configuration and restart the application.');
      }

      const { title, description, code, language } = snippetData;

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at creating platform-optimized social media content for code snippets. You understand character limits, hashtag usage, and engagement patterns for different platforms.' 
          },
          { 
            role: 'user', 
            content: `Create platform-specific descriptions for this ${language} snippet:

Title: ${title}
Description: ${description || 'No description provided'}
Code Preview: ${code?.substring(0, 300)}...

Generate descriptions optimized for: ${platforms?.join(', ')}

Guidelines:
- Twitter: Max 280 chars, 2-3 hashtags, punchy and concise
- LinkedIn: Professional tone, 1-2 paragraphs, 3-5 hashtags
- Slack: Casual but informative, emoji usage okay, focus on team value

Format response as JSON with platform names as keys`
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'social_descriptions',
            schema: {
              type: 'object',
              properties: {
                twitter: { type: 'string', description: 'Twitter-optimized description (max 280 chars)' },
                linkedin: { type: 'string', description: 'LinkedIn-optimized professional description' },
                slack: { type: 'string', description: 'Slack-friendly team-oriented description' },
              },
              additionalProperties: false,
            },
          },
        },
      });

      const result = JSON.parse(response?.choices?.[0]?.message?.content || '{}');

      return {
        success: true,
        descriptions: {
          twitter: result?.twitter || '',
          linkedin: result?.linkedin || '',
          slack: result?.slack || '',
        },
      };
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      if (errorInfo?.isInternal) {
        console.error('OpenAI API Error:', errorInfo?.message);
      } else {
        console.error('Error generating social descriptions:', error);
      }
      throw new Error(errorInfo?.message);
    }
  },

  /**
   * Generate a comprehensive snippet summary optimized for sharing
   * WITH SERVER-SIDE CACHING to prevent duplicate AI API calls
   * @param {Object} snippetData - The snippet data
   * @returns {Promise<Object>} Complete sharing package with preview and social descriptions
   */
  async generateSharingPackage(snippetData) {
    try {
      // Check OpenAI availability first
      const availability = isOpenAIAvailable();
      if (!availability?.isAvailable) {
        throw new Error(availability?.message);
      }

      // Verify openai client exists
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your configuration and restart the application.');
      }

      const { id: snippetId } = snippetData;

      // 🔍 STEP 1: Check if cached preview exists in database
      if (snippetId) {
        const { data: cachedSnippet, error: cacheError } = await supabase?.from('snippets')?.select('ai_sharing_preview')?.eq('id', snippetId)?.single();

        if (!cacheError && cachedSnippet?.ai_sharing_preview) {
          const cachedPreview = cachedSnippet?.ai_sharing_preview;
          
          // Validate cache freshness (30-day TTL)
          const generatedAt = new Date(cachedPreview?.generatedAt);
          const daysSinceGeneration = (Date.now() - generatedAt?.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceGeneration < 30) {
            console.log('✅ Using cached AI sharing preview from database');
            return {
              success: true,
              ...cachedPreview,
              cached: true,
            };
          } else {
            console.log('⏰ Cached preview expired, generating new one');
          }
        }
      }

      // 🎯 STEP 2: Generate new preview if no valid cache exists
      const [previewResult, socialResult] = await Promise.all([
        this.generateSnippetPreview(snippetData),
        this.generateSocialDescriptions(snippetData),
      ]);

      const sharingPackage = {
        success: true,
        preview: {
          enhancedTitle: previewResult?.enhancedTitle,
          engagingDescription: previewResult?.engagingDescription,
          suggestedTags: previewResult?.suggestedTags,
        },
        socialDescriptions: socialResult?.descriptions,
        generatedAt: new Date()?.toISOString(),
      };

      // 💾 STEP 3: Save to database cache for future use
      if (snippetId) {
        const { error: updateError } = await supabase?.from('snippets')?.update({ ai_sharing_preview: sharingPackage })?.eq('id', snippetId);

        if (updateError) {
          console.error('Warning: Failed to cache sharing preview:', updateError);
          // Don't throw error - return the generated data anyway
        } else {
          console.log('✅ AI sharing preview cached in database');
        }
      }

      return {
        ...sharingPackage,
        cached: false,
      };
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      if (errorInfo?.isInternal) {
        console.error('OpenAI API Error:', errorInfo?.message);
      } else {
        console.error('Error generating sharing package:', error);
      }
      throw new Error(errorInfo?.message);
    }
  },

  /**
   * Generate SEO-optimized metadata for snippet pages
   * @param {Object} snippetData - The snippet data
   * @returns {Promise<Object>} SEO metadata including meta description and keywords
   */
  async generateSEOMetadata(snippetData) {
    try {
      // Check OpenAI availability
      const availability = isOpenAIAvailable();
      if (!availability?.isAvailable) {
        throw new Error(availability?.message);
      }

      // Verify openai client exists
      if (!openai) {
        throw new Error('OpenAI client is not initialized. Please check your configuration and restart the application.');
      }

      const { title, description, code, language } = snippetData;

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert specializing in developer content. Create optimized metadata that improves search visibility while accurately representing the code snippet.' 
          },
          { 
            role: 'user', 
            content: `Generate SEO metadata for this ${language} snippet:

Title: ${title}
Description: ${description || 'No description provided'}
Code Preview: ${code?.substring(0, 400)}...

Create:
1. Meta description (150-160 chars) - compelling and keyword-rich
2. Focus keywords (5-7 terms) - relevant search terms
3. Open Graph title - optimized for social sharing
4. Open Graph description - engaging summary for previews

Format as JSON`
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'seo_metadata',
            schema: {
              type: 'object',
              properties: {
                metaDescription: { type: 'string', description: 'SEO-optimized meta description (150-160 chars)' },
                keywords: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Array of 5-7 focus keywords'
                },
                ogTitle: { type: 'string', description: 'Open Graph optimized title' },
                ogDescription: { type: 'string', description: 'Open Graph description for social previews' },
              },
              required: ['metaDescription', 'keywords', 'ogTitle', 'ogDescription'],
              additionalProperties: false,
            },
          },
        },
      });

      const result = JSON.parse(response?.choices?.[0]?.message?.content || '{}');

      return {
        success: true,
        seo: {
          metaDescription: result?.metaDescription || '',
          keywords: result?.keywords || [],
          ogTitle: result?.ogTitle || title,
          ogDescription: result?.ogDescription || description,
        },
      };
    } catch (error) {
      const errorInfo = getErrorMessage(error);
      if (errorInfo?.isInternal) {
        console.error('OpenAI API Error:', errorInfo?.message);
      } else {
        console.error('Error generating SEO metadata:', error);
      }
      throw new Error(errorInfo?.message);
    }
  },
};

export default aiSnippetEnhancementService;