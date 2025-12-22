import OpenAI from 'openai';

/**
 * AI Report Service
 * Generates AI-powered analysis reports for bugs and code snippets
 */

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const aiReportService = {
  /**
   * Generate AI report for a bug
   */
  async generateBugReport(bug) {
    try {
      const prompt = `Analyze this bug report and provide a comprehensive analysis:

Title: ${bug?.title}
Description: ${bug?.description}
Language: ${bug?.language}
Priority: ${bug?.priority}
Code:
\`\`\`${bug?.language}
${bug?.code}
\`\`\`

Please provide:
1. Bug analysis and root cause identification
2. Severity assessment (critical, high, medium, low)
3. Potential security implications
4. Recommended fix approaches
5. Code quality insights
6. Best practices violations (if any)`;

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer specializing in bug analysis, code quality, and security. Provide detailed, actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'bug_analysis_report',
            schema: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'Brief summary of the bug' },
                root_cause: { type: 'string', description: 'Identified root cause' },
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                security_implications: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Security concerns if any',
                },
                recommended_fixes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      approach: { type: 'string' },
                      code_example: { type: 'string' },
                      complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
                    },
                    required: ['approach', 'complexity'],
                  },
                },
                code_quality: {
                  type: 'object',
                  properties: {
                    score: { type: 'number', minimum: 0, maximum: 100 },
                    issues: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['score', 'issues'],
                },
                best_practices: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Best practices violations',
                },
              },
              required: ['summary', 'root_cause', 'severity', 'recommended_fixes', 'code_quality'],
              additionalProperties: false,
            },
          },
        },
        reasoning_effort: 'medium',
        verbosity: 'medium',
      });

      const report = JSON.parse(response?.choices?.[0]?.message?.content);
      
      return {
        entity_id: bug?.id,
        entity_type: 'bug',
        generated_at: new Date()?.toISOString(),
        language: bug?.language,
        title: bug?.title,
        analysis: report,
        status: 'completed',
      };
    } catch (error) {
      console.error('Error generating bug report:', error);
      throw new Error('Failed to generate AI bug report');
    }
  },

  /**
   * Generate AI report for a code snippet
   */
  async generateSnippetReport(snippet) {
    try {
      const prompt = `Analyze this code snippet and provide a comprehensive report:

Title: ${snippet?.title}
Description: ${snippet?.description || 'No description provided'}
Language: ${snippet?.language}
Code:
\`\`\`${snippet?.language}
${snippet?.code}
\`\`\`

Please provide:
1. Code quality assessment
2. Complexity analysis
3. Best practices adherence
4. Security considerations
5. Performance optimization suggestions
6. Refactoring recommendations`;

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer specializing in code quality, performance, and best practices. Provide detailed, constructive feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'snippet_analysis_report',
            schema: {
              type: 'object',
              properties: {
                summary: { type: 'string', description: 'Brief summary of the code' },
                code_quality: {
                  type: 'object',
                  properties: {
                    score: { type: 'number', minimum: 0, maximum: 100 },
                    strengths: { type: 'array', items: { type: 'string' } },
                    issues: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['score', 'strengths', 'issues'],
                },
                complexity: {
                  type: 'object',
                  properties: {
                    level: { type: 'string', enum: ['low', 'medium', 'high'] },
                    metrics: {
                      type: 'object',
                      properties: {
                        cyclomatic: { type: 'string' },
                        cognitive: { type: 'string' },
                      },
                    },
                  },
                  required: ['level'],
                },
                best_practices: {
                  type: 'object',
                  properties: {
                    followed: { type: 'array', items: { type: 'string' } },
                    violations: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['followed', 'violations'],
                },
                security: {
                  type: 'object',
                  properties: {
                    vulnerabilities: { type: 'array', items: { type: 'string' } },
                    recommendations: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['vulnerabilities', 'recommendations'],
                },
                performance: {
                  type: 'object',
                  properties: {
                    bottlenecks: { type: 'array', items: { type: 'string' } },
                    optimizations: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['bottlenecks', 'optimizations'],
                },
                refactoring: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      suggestion: { type: 'string' },
                      impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                    required: ['suggestion', 'impact'],
                  },
                },
              },
              required: ['summary', 'code_quality', 'complexity', 'best_practices', 'security'],
              additionalProperties: false,
            },
          },
        },
        reasoning_effort: 'medium',
        verbosity: 'medium',
      });

      const report = JSON.parse(response?.choices?.[0]?.message?.content);
      
      return {
        entity_id: snippet?.id,
        entity_type: 'snippet',
        generated_at: new Date()?.toISOString(),
        language: snippet?.language,
        title: snippet?.title,
        analysis: report,
        status: 'completed',
      };
    } catch (error) {
      console.error('Error generating snippet report:', error);
      throw new Error('Failed to generate AI snippet report');
    }
  },

  /**
   * Check if OpenAI is configured
   */
  isConfigured() {
    return !!import.meta.env?.VITE_OPENAI_API_KEY;
  },
};

export default aiReportService;