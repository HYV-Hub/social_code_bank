import openai from '../lib/openaiClient';
import { isOpenAIAvailable } from '../lib/openaiClient';
import { 
  APIConnectionError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
  InternalServerError
} from 'openai';

/**
 * Maps OpenAI API error types to user-friendly error messages.
 * @param {Error} error - The error object from OpenAI API.
 * @returns {Object} Error information with isInternal flag and message.
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
 * Generate AI-powered hive summary
 * @param {Object} hiveData - Hive data including name, description, members, snippets
 * @returns {Promise<Object>} AI-generated summary with key insights
 */
export async function generateHiveSummary(hiveData) {
  // Check if OpenAI is available before making the call
  const availability = isOpenAIAvailable();
  if (!availability?.isAvailable) {
    throw new Error(availability.message);
  }

  try {
    const prompt = `Analyze this coding hive community and provide a concise summary:
    
Hive: ${hiveData?.name}
Description: ${hiveData?.description || 'No description'}
Members: ${hiveData?.memberCount || 0}
Snippets: ${hiveData?.snippetCount || 0}
Tags: ${hiveData?.tags?.join(', ') || 'None'}
Privacy: ${hiveData?.privacy}

Provide insights about the hive's focus, activity level, and community health.`;

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at analyzing developer communities and coding collaboration spaces. Provide concise, actionable insights.' 
        },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'hive_summary',
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Brief 2-3 sentence summary of the hive' },
              activityLevel: { 
                type: 'string', 
                enum: ['low', 'moderate', 'high', 'very_high'],
                description: 'Activity level assessment'
              },
              focusAreas: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Key technical focus areas'
              },
              healthScore: { 
                type: 'number', 
                minimum: 0, 
                maximum: 100,
                description: 'Overall community health score (0-100)'
              }
            },
            required: ['summary', 'activityLevel', 'focusAreas', 'healthScore'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    const errorInfo = getErrorMessage(error);
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('Error generating hive summary:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Analyze trending content and generate insights
 * @param {Array} snippets - Array of snippet objects with metrics
 * @param {Object} hiveContext - Additional hive context
 * @returns {Promise<Object>} Trending analysis with recommendations
 */
export async function analyzeTrendingContent(snippets, hiveContext = {}) {
  // Check if OpenAI is available before making the call
  const availability = isOpenAIAvailable();
  if (!availability?.isAvailable) {
    throw new Error(availability.message);
  }

  try {
    const snippetsData = snippets?.map(s => ({
      title: s?.title,
      language: s?.language,
      views: s?.views_count || 0,
      likes: s?.likes_count || 0,
      comments: s?.comments_count || 0,
      tags: s?.ai_tags || []
    }));

    const prompt = `Analyze these trending code snippets from a developer hive:

Hive: ${hiveContext?.name || 'Unknown'}
Snippets: ${JSON.stringify(snippetsData, null, 2)}

Identify:
1. What topics/technologies are trending
2. Why these snippets are popular
3. Patterns in popular content
4. Recommendations for similar content`;

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at analyzing developer content trends and engagement patterns. Provide data-driven insights.' 
        },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'trending_analysis',
          schema: {
            type: 'object',
            properties: {
              trendingTopics: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Top 3-5 trending topics or technologies'
              },
              popularityFactors: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Reasons why content is popular'
              },
              engagementPatterns: { 
                type: 'string',
                description: 'Key engagement patterns observed'
              },
              contentRecommendations: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Specific content recommendations'
              }
            },
            required: ['trendingTopics', 'popularityFactors', 'engagementPatterns', 'contentRecommendations'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    const errorInfo = getErrorMessage(error);
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('Error analyzing trending content:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Generate personalized activity recommendations
 * @param {Object} userData - User profile and activity data
 * @param {Object} hiveData - Hive data including recent activity
 * @returns {Promise<Object>} Personalized recommendations
 */
export async function generateActivityRecommendations(userData, hiveData) {
  // Check if OpenAI is available before making the call
  const availability = isOpenAIAvailable();
  if (!availability?.isAvailable) {
    throw new Error(availability.message);
  }

  try {
    const recentActivity = hiveData?.recentActivity?.slice(0, 10)?.map(a => ({
      type: a?.type,
      description: a?.description,
      timeAgo: a?.timeAgo
    }));

    const prompt = `Generate personalized recommendations for a developer in this hive:

User Level: ${userData?.contributorLevel || 'beginner'}
User Interests: ${userData?.tags?.join(', ') || 'general coding'}

Hive: ${hiveData?.name}
Recent Activity: ${JSON.stringify(recentActivity, null, 2)}
Available Collections: ${hiveData?.collections?.map(c => c?.name)?.join(', ') || 'None'}

Provide specific, actionable recommendations for engagement.`;

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at developer engagement and community building. Provide specific, actionable recommendations that match the user\'s skill level.' 
        },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'activity_recommendations',
          schema: {
            type: 'object',
            properties: {
              topRecommendations: { 
                type: 'array', 
                items: {
                  type: 'object',
                  properties: {
                    action: { type: 'string', description: 'Recommended action' },
                    reason: { type: 'string', description: 'Why this is recommended' },
                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
                  },
                  required: ['action', 'reason', 'difficulty']
                },
                description: 'Top 3-5 recommended actions'
              },
              learningOpportunities: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Learning opportunities based on hive content'
              },
              collaborationSuggestions: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Ways to collaborate with other members'
              }
            },
            required: ['topRecommendations', 'learningOpportunities', 'collaborationSuggestions'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    const errorInfo = getErrorMessage(error);
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('Error generating activity recommendations:', error);
    }
    throw new Error(errorInfo.message);
  }
}

/**
 * Generate comprehensive AI insights for hive
 * @param {Object} hiveData - Complete hive data
 * @param {Object} userData - User profile data
 * @returns {Promise<Object>} All AI-generated insights
 */
export async function generateComprehensiveHiveInsights(hiveData, userData = {}) {
  try {
    // Run all insights in parallel for better performance
    const [summary, trendingAnalysis, recommendations] = await Promise.all([
      generateHiveSummary(hiveData),
      hiveData?.trendingSnippets?.length > 0 
        ? analyzeTrendingContent(hiveData?.trendingSnippets, hiveData)
        : Promise.resolve(null),
      generateActivityRecommendations(userData, hiveData)
    ]);

    return {
      summary,
      trendingAnalysis,
      recommendations,
      generatedAt: new Date()?.toISOString()
    };
  } catch (error) {
    const errorInfo = getErrorMessage(error);
    if (errorInfo?.isInternal) {
      console.log(errorInfo?.message);
    } else {
      console.error('Error generating comprehensive insights:', error);
    }
    throw new Error(errorInfo.message);
  }
}