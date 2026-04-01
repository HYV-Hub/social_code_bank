import { supabase } from '../lib/supabase';
import openai, { isOpenAIAvailable } from '../lib/openaiClient';

/**
 * AI Tagging Service - Full OpenAI Integration with Comprehensive Tagging
 *
 * Provides comprehensive code analysis using OpenAI's GPT model
 * with structured outputs, normalization layer, and automatic retry logic.
 */
class AITaggingService {
  /**
   * Normalize ANY analysis result (snake_case or camelCase) to canonical camelCase shape
   */
  normalizeAnalysisResult(raw, processingTimeMs = 0) {
    if (!raw || typeof raw !== 'object') return this.getEmptyAnalysis('Invalid response');

    return {
      success: true,
      requestId: raw.requestId || raw.request_id || crypto.randomUUID?.() || Date.now().toString(),
      detectedLanguage: raw.detectedLanguage || raw.detected_language || 'unknown',
      languageConfidence: raw.languageConfidence || raw.language_confidence || 'low',
      qualityScore: Math.round(raw.qualityScore ?? raw.optimizationScore ?? raw.optimization_score ?? raw.quality_score ?? 0),
      readabilityScore: Math.round(raw.readabilityScore ?? raw.readability_score ?? 0),
      complexityLevel: raw.complexityLevel || raw.complexity_level || 'medium',
      bugRisk: raw.bugRisk || raw.bug_risk || 'low',
      tags: raw.tags || raw.aiTags || raw.ai_tags || [],
      purposeTags: raw.purposeTags || raw.purpose_tags || [],
      functionalityTags: raw.functionalityTags || raw.functionality_tags || [],
      searchAliases: raw.searchAliases || raw.search_aliases || [],
      summary: raw.summary || '',
      strengths: raw.strengths || [],
      weaknesses: raw.weaknesses || [],
      improvements: raw.improvements || [],
      recommendations: {
        quick: raw.recommendations?.quick || raw.quick_recommendations || [],
        detailed: raw.recommendations?.detailed || raw.detailed_recommendations || [],
      },
      categories: raw.categories || [],
      metrics: raw.metrics || {},
      provider: raw.provider || 'openai',
      model: raw.model || 'gpt-4o',
      analysisVersion: raw.analysisVersion || raw.analysis_version || 'v2',
      processingTimeMs,
    };
  }

  /**
   * Get an empty analysis result for fallback/error cases
   */
  getEmptyAnalysis(reason = 'Analysis unavailable') {
    return {
      success: false,
      requestId: Date.now().toString(),
      detectedLanguage: 'unknown',
      languageConfidence: 'low',
      qualityScore: 0,
      readabilityScore: 0,
      complexityLevel: 'medium',
      bugRisk: 'unknown',
      tags: [],
      purposeTags: [],
      functionalityTags: [],
      searchAliases: [],
      summary: reason,
      strengths: [],
      weaknesses: [],
      improvements: [],
      recommendations: { quick: [], detailed: [] },
      categories: [],
      metrics: {},
      provider: 'none',
      model: 'none',
      analysisVersion: 'v2',
      processingTimeMs: 0,
    };
  }

  /**
   * Retry an async operation with exponential backoff
   */
  async retryWithExponentialBackoff(fn, options = {}) {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      maxDelayMs = 10000,
      backoffMultiplier = 2,
      onRetry = null,
    } = options;

    let lastError;
    let currentDelay = initialDelayMs;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        const shouldNotRetry =
          error?.message?.includes('API key') ||
          error?.message?.includes('quota exceeded') ||
          error?.message?.includes('Code is required') ||
          error?.response?.status === 401 ||
          error?.response?.status === 403;

        if (shouldNotRetry || attempt === maxRetries) {
          throw error;
        }

        const delay = Math.min(currentDelay, maxDelayMs);
        if (onRetry) onRetry(attempt, maxRetries, delay, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError;
  }

  /**
   * Analyze code snippet with AI for comprehensive optimization report
   */
  async analyzeSnippetWithAI(snippetData, onRetry = null) {
    const { code, title } = snippetData;

    const availability = isOpenAIAvailable();
    if (!availability?.isAvailable) {
      console.warn('OpenAI not configured:', availability?.message);
      return this.getEmptyAnalysis('OpenAI not configured');
    }

    if (!code || !code?.trim()) {
      throw new Error('Code is required for AI analysis');
    }

    const startTime = Date.now();

    return await this.retryWithExponentialBackoff(
      async () => {
        const timeoutDuration = 25000;

        const apiResponse = await Promise.race([
          openai?.chat?.completions?.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are an expert code reviewer. Analyze code snippets and return structured JSON.

TAGGING RULES — Generate purpose-based tags across 7 categories:
1. Language: the detected programming language (e.g. python, javascript, csharp)
2. Framework: detected frameworks/libraries (e.g. react, django, express)
3. UI element: if applicable (e.g. modal, form, table, chart)
4. Purpose: what the code does (e.g. authentication, api-call, data-processing)
5. Pattern: design/coding patterns used (e.g. singleton, observer, middleware)
6. Business intent: the business goal (e.g. user-onboarding, payment-flow, analytics)
7. Workflow stage: where this fits (e.g. setup, validation, transformation, rendering)

NEVER generate generic tags like "code", "snippet", "best-practices", "programming".
Tags should be specific and searchable.`,
              },
              {
                role: 'user',
                content: `Analyze this code snippet. Detect the programming language from syntax only.

Title: "${title}"

Code:
\`\`\`
${code}
\`\`\`

Return comprehensive JSON analysis.`,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'code_analysis',
                schema: {
                  type: 'object',
                  properties: {
                    detected_language: { type: 'string' },
                    language_confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                    optimization_score: { type: 'number', minimum: 0, maximum: 100 },
                    readability_score: { type: 'number', minimum: 0, maximum: 100 },
                    complexity_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                    bug_risk: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    tags: { type: 'array', items: { type: 'string' } },
                    purpose_tags: { type: 'array', items: { type: 'string' } },
                    functionality_tags: { type: 'array', items: { type: 'string' } },
                    search_aliases: { type: 'array', items: { type: 'string' } },
                    summary: { type: 'string' },
                    strengths: { type: 'array', items: { type: 'string' } },
                    weaknesses: { type: 'array', items: { type: 'string' } },
                    improvements: { type: 'array', items: { type: 'string' } },
                    quick_recommendations: { type: 'array', items: { type: 'string' } },
                    detailed_recommendations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' },
                          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                        },
                        required: ['title', 'description', 'priority'],
                      },
                    },
                    categories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          score: { type: 'number' },
                          issues: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                severity: { type: 'string' },
                                title: { type: 'string' },
                                description: { type: 'string' },
                                recommendation: { type: 'string' },
                              },
                              required: ['severity', 'title', 'description', 'recommendation'],
                            },
                          },
                        },
                        required: ['id', 'name', 'score', 'issues'],
                      },
                    },
                    metrics: {
                      type: 'object',
                      properties: {
                        lines: { type: 'number' },
                        functions: { type: 'number' },
                        imports: { type: 'number' },
                      },
                    },
                  },
                  required: [
                    'detected_language',
                    'language_confidence',
                    'optimization_score',
                    'readability_score',
                    'summary',
                    'tags',
                    'bug_risk',
                    'categories',
                  ],
                  additionalProperties: false,
                },
              },
            },
            temperature: 0.2,
            max_tokens: 16000,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutDuration)
          ),
        ]);

        if (!apiResponse?.choices?.[0]?.message?.content) {
          throw new Error('OpenAI returned an empty response');
        }

        const raw = JSON.parse(apiResponse.choices[0].message.content);
        const processingTimeMs = Date.now() - startTime;

        return this.normalizeAnalysisResult(raw, processingTimeMs);
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        onRetry:
          onRetry ||
          ((attempt, maxRetries, delay, error) => {
            console.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms: ${error?.message}`);
          }),
      }
    ).catch((error) => {
      console.warn('All retry attempts failed, returning empty analysis:', error?.message);
      return this.getEmptyAnalysis(`Analysis failed: ${error?.message}`);
    });
  }

  /**
   * Update snippet with AI analysis results in Supabase
   */
  async updateSnippetAnalysis(snippetId, analysisData) {
    try {
      const { error } = await supabase
        .from('snippets')
        .update({
          ai_tags: analysisData?.tags,
          ai_quality_score: Math.round(analysisData?.qualityScore || 0),
          ai_analysis_data: {
            summary: analysisData?.summary,
            strengths: analysisData?.strengths,
            weaknesses: analysisData?.weaknesses,
            improvements: analysisData?.improvements,
            recommendations: analysisData?.recommendations,
            categories: analysisData?.categories,
            complexityLevel: analysisData?.complexityLevel,
            bugRisk: analysisData?.bugRisk,
            readabilityScore: analysisData?.readabilityScore,
            purposeTags: analysisData?.purposeTags,
            functionalityTags: analysisData?.functionalityTags,
            searchAliases: analysisData?.searchAliases,
            metrics: analysisData?.metrics,
            requestId: analysisData?.requestId,
            analysisVersion: analysisData?.analysisVersion,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', snippetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating snippet analysis:', error);
      throw error;
    }
  }

  /**
   * Fallback language detection based on syntax patterns
   */
  detectLanguageFallback(code) {
    const patterns = {
      python: [/\ndef\s+\w+\s*\(/, /^(import|from)\s+[\w.]+/m, /\bprint\s*\(/, /\belif\b/],
      javascript: [/\b(const|let|var)\b/, /=>/, /console\.log/, /\bfunction\s+\w+/],
      typescript: [/:\s*(string|number|boolean|any|void)/, /\binterface\s+\w+/, /\btype\s+\w+/],
      csharp: [/namespace\s+[\w.]+/, /using\s+System/, /{\s*get;\s*set;\s*}/, /async\s+Task/],
      java: [/package\s+[\w.]+/, /import\s+java\./, /public\s+class/, /System\.out\./],
      go: [/package\s+main/, /\bfunc\s+\w+/, /:=/],
      rust: [/\bfn\s+\w+/, /\blet\s+(mut\s+)?\w+/, /\bimpl\b/],
      php: [/<\?php/, /\$\w+/],
    };

    let best = { tag: 'unknown', score: 0 };
    for (const [lang, pats] of Object.entries(patterns)) {
      const score = pats.filter((p) => p.test(code)).length;
      if (score > best.score) best = { tag: lang, score };
    }
    return best.score >= 2 ? best.tag : 'unknown';
  }

  async analyzeCode(code, language) {
    return this.analyzeSnippetWithAI({ code, language, title: 'Code Analysis' });
  }

  async analyzeSnippet(snippetData) {
    return this.analyzeSnippetWithAI(snippetData);
  }
}

export default new AITaggingService();

export const analyzeSnippetWithAI = async (snippetData) => {
  const service = new AITaggingService();
  return service.analyzeSnippetWithAI(snippetData);
};
