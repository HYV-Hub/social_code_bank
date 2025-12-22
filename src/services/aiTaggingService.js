import { supabase } from '../lib/supabase';
import openai, { isOpenAIAvailable, safeOpenAICall } from '../lib/openaiClient';
import { Zap, Code, Shield, Sparkles, Bug, TrendingUp, Database, Gauge } from 'lucide-react';

/**
 * AI Tagging Service - Full OpenAI Integration with Comprehensive Tagging
 * 
 * Provides comprehensive code analysis using OpenAI's GPT-5 model
 * with advanced reasoning capabilities, structured outputs, and automatic retry logic.
 */
class AITaggingService {
  /**
   * Retry an async operation with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {Object} options - Retry configuration
   * @returns {Promise} Result of the operation
   */
  async retryWithExponentialBackoff(fn, options = {}) {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      maxDelayMs = 10000,
      backoffMultiplier = 2,
      onRetry = null
    } = options;

    let lastError;
    let currentDelay = initialDelayMs;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for AI analysis`);
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        const shouldNotRetry = 
          error?.message?.includes('API key') ||
          error?.message?.includes('quota exceeded') ||
          error?.message?.includes('Code is required') ||
          error?.response?.status === 401 || // Unauthorized
          error?.response?.status === 403;   // Forbidden
        
        if (shouldNotRetry || attempt === maxRetries) {
          console.error(`❌ Final attempt ${attempt} failed, not retrying:`, error?.message);
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(currentDelay, maxDelayMs);
        console.warn(`⚠️ Attempt ${attempt} failed: ${error?.message}. Retrying in ${delay}ms...`);
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt, maxRetries, delay, error);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increase delay for next attempt
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError;
  }

  /**
   * Analyze code snippet with GPT-5 for comprehensive optimization report
   * Includes automatic retry logic with exponential backoff
   * @param {Object} snippetData - Snippet information
   * @param {Function} onRetry - Optional callback for retry events
   * @returns {Promise<Object>} Complete analysis with optimization score and recommendations
   */
  async analyzeSnippetWithAI(snippetData, onRetry = null) {
    const { code, title } = snippetData;

    // CRITICAL FIX: Add detailed logging for debugging
    console.log('🔍 Starting AI analysis for snippet:', { 
      title, 
      hasCode: !!code, 
      codeLength: code?.length,
      timestamp: new Date()?.toISOString()
    });

    // CRITICAL FIX: Check OpenAI availability correctly
    const availability = isOpenAIAvailable();
    if (!availability?.isAvailable) {
      console.warn('⚠️ OpenAI not configured:', availability?.message);
      return this.getFallbackAnalysis(snippetData);
    }

    if (!code || !code?.trim()) {
      console.error('❌ No code provided for analysis');
      throw new Error('Code is required for AI analysis');
    }

    const startTime = Date.now();

    // Wrap the entire OpenAI call in retry logic
    return await this.retryWithExponentialBackoff(
      async () => {
        try {
          console.log('🚀 Calling OpenAI API for analysis...');
          
          const timeoutDuration = 25000; // 25 seconds timeout
          
          // CRITICAL FIX: Call OpenAI directly without nested safeOpenAICall wrapper
          const apiResponse = await Promise.race([
            openai?.chat?.completions?.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert code reviewer and optimization specialist with PRECISE language detection capabilities.

🔍 CRITICAL LANGUAGE DETECTION RULES - NEVER MAKE MISTAKES:

**Python Detection (Priority 1 - Check FIRST for dynamic languages):**
- Import statements: "import os", "from collections import", "import numpy as np" - Function definitions:"def function_name():", "def __init__(self):"
- Class definitions: "class ClassName:", "class MyClass(BaseClass):"
- Decorators: "@property", "@staticmethod", "@classmethod", "@app.route" - List comprehensions:"[x for x in range(10)]", "[i**2 for i in items]"
- Dictionary syntax: "{'key': 'value'}", "dict.get('key')"
- Indentation-based blocks: no curly braces, uses colons and indentation
- Built-in functions: "print()", "len()", "range()", "enumerate()", "zip()"
- String formatting: "f'{variable}'", "'{}'.format()", "'%s' % var"
- Type hints: "def func(x: int) -> str:", "variable: List[str]"
- Python keywords: "elif", "except", "finally", "with", "as", "yield", "lambda" - Magic methods:"__str__", "__repr__", "__len__", "__init__"
- No semicolons at line endings (unlike JavaScript)
- Comments with "#" only (not "//" like JavaScript)

**JavaScript/TypeScript Detection (Check SECOND for dynamic languages):**
- Variable declarations: "const", "let", "var" (Python uses no declaration keywords)
- Arrow functions: "() =>", "(x) => x * 2" (Python uses "lambda" or "def")
- Curly braces for blocks: "{ }" (Python uses indentation only)
- Semicolons: ";" at line endings (Python doesn't use these)
- Comments: "//", "/* */" (Python only uses "#")
- Console logging: "console.log()" (Python uses "print()")
- Promise/async: "Promise", "then", "catch" (Python uses "async def", "await")
- Template literals: \\\`string \${var}\\\` (Python uses f-strings or format())
- Object literals: "{ key: value }" (Python uses "{ 'key': 'value' }")
- Array methods: ".map()", ".filter()", ".reduce()" (Python uses list comprehensions)
- typeof, instanceof operators (Python uses "type()", "isinstance()")
- Function expressions: "function name() {}" (Python: "def name():")

**C# Detection (Priority 1 - Check FIRST for compiled languages):**
- namespace declarations: "namespace MyApp" - using statements:"using System", "using System.Collections.Generic" - Property syntax:"public string Name { get; set; }" - LINQ expressions:".Where(", ".Select(", ".FirstOrDefault("
- async/await with Task: "async Task<T>", "await Task" - Attributes:"[HttpGet]", "[JsonProperty]", "[Serializable]"
- Nullable types: "string?", "int?"
- Class modifiers: "public class", "internal class", "sealed class" - Interface prefix:"IEnumerable", "IDisposable" - String interpolation: $"Hello {name}" - Lambda with types:"(int x) => x * 2"

**C++ Detection:**
- #include directives: "#include <iostream>", "#include <vector>" - std:: namespace:"std::cout", "std::vector" - Pointers:"int* ptr", "char* str" - Templates:"template<typename T>" - :: scope resolution:"MyClass::StaticMethod()" - cout/cin:"std::cout <<", "std::cin >>"

**C Detection:**
- No OOP features (no classes)
- stdio.h: "#include <stdio.h>" - Manual memory:"malloc(", "free("
- Function pointers without lambdas

**Java Detection:**
- Package declarations: "package com.example" - Imports:"import java.util.*"
- Public class file structure
- System.out.println

**Go Detection:**
- Package declaration: "package main" - Import syntax:"import \\"fmt\\"" - Function declaration:"func functionName() {}"
- Type after variable: "var name string"
- := operator for short declarations
- defer, goroutine keywords

**Rust Detection:**
- fn keyword: "fn main() {}"
- let bindings: "let x = 5;" - Ownership syntax:"&", "mut" - Macro invocations:"println!()", "vec!" - impl blocks:"impl MyStruct {}"
- match expressions

**PHP Detection:**
- <?php opening tag
- $ for variables: "$variable"
- -> for object access: "$obj->method()"
- echo, print statements
- Function definition: "function name() {}"

**Ruby Detection:**
- def/end blocks
- puts, print statements
- Symbols: ":symbol"
- Instance variables: "@variable"
- Class variables: "@@variable" - String interpolation:"#\\{variable\\}"

**Swift Detection:**
- var/let declarations with types
- func keyword
- Optional syntax: "String?"
- guard, defer keywords
- Swift-specific APIs

**Kotlin Detection:**
- fun keyword for functions
- val/var declarations
- Nullable types: "String?"
- data class, sealed class
- when expressions

**Dart/Flutter Detection:**
- void main() entry
- Widget build methods
- State<T> patterns
- final/const keywords
- => for single expression functions

**CRITICAL DIFFERENTIATION RULES:**
1. Python vs JavaScript:
   - Python: def, import, no semicolons, # comments, indentation-based, print()
   - JavaScript: const/let/var, semicolons, // or /* */ comments, braces, console.log()

2. Python vs other languages:
   - Python NEVER uses curly braces for block structure
   - Python NEVER uses semicolons at line endings
   - Python ALWAYS uses "def" for functions (not "function", "func", "fn")
   - Python uses "import" without quotes (unlike Go's "import \\"package\\"")

**IF LANGUAGE MARKER CONFLICTS:**
1. Python wins if: def/class + import statements + # comments + no semicolons + indentation-based
2. JavaScript wins if: const/let/var + semicolons + { } blocks + // comments
3. C# wins if: namespace + using System + properties with get/set
4. C++ wins if: #include + std:: + pointer syntax
5. C wins if: only #include + no OOP + manual memory management
6. Java wins if: package + import java + public class
7. TypeScript wins if: interface + type annotations + const/let
8. Go wins if: package main + import with quotes + func keyword
9. Rust wins if: fn keyword + let bindings + ownership syntax
10. PHP wins if: <?php + $ variables
11. Ruby wins if: def/end + puts + @ variables
12. Swift wins if: var/let with types + func + Optional syntax
13. Kotlin wins if: fun keyword + val/var + data class
14. Dart wins if: void main + Widget + State<T>

CRITICAL: Generate COMPREHENSIVE TAGS covering ALL these categories:

1. LANGUAGE TAGS - Detect PRIMARY language with 100% accuracy WITHOUT user hints:
   - python, javascript, typescript, csharp, cpp, c, java, go, rust, php, ruby, swift, kotlin, dart
   - ALWAYS analyze syntax markers first - NEVER rely on user input
   - NEVER confuse Python with JavaScript - check for def vs const/let/var
   - NEVER confuse C# with C, C++, or Java
   - Check for language-specific syntax BEFORE making determination

2. FRAMEWORK/LIBRARY TAGS - Detect ALL frameworks/libraries used:
   **Python Frameworks:**
   - django, flask, fastapi, tornado, pyramid
   - numpy, pandas, matplotlib, scikit-learn, tensorflow, pytorch
   - requests, beautifulsoup, scrapy, selenium
   - pytest, unittest, sqlalchemy, pydantic
   
   **C# Frameworks:**
   - dotnet, asp-net-core, asp-net-mvc, entity-framework, wpf, xamarin, blazor
   - nancy, signalr, hangfire, serilog, automapper, nunit, xunit, moq
   
   **Frontend Frameworks:**
   - react, vue, angular, svelte, next.js, nuxt, gatsby
   
   **Backend Frameworks:**
   - express, django, flask, fastapi, spring, rails, laravel
   
   **Database Libraries:**
   - prisma, supabase, sequelize, mongoose, typeorm, dapper, ado-net
   
   **Styling:**
   - tailwind, bootstrap, material-ui, styled-components, sass
   
   **Animation:**
   - framer-motion, gsap, anime.js
   
   **State Management:**
   - redux, zustand, mobx, recoil, jotai

3. PURPOSE TAGS - What the code does:
   - api-call, component, middleware, database-query, utility-function
   - authentication, authorization, validation, error-handling
   - data-processing, file-handling, image-processing, pdf-generation
   - web-scraping, data-transformation, batch-processing
   - machine-learning, data-analysis, scientific-computing

4. BEHAVIORAL TAGS - How code behaves:
   - async-flow, state-management, event-handling, error-handling
   - caching, debouncing, throttling, polling, websocket
   - lazy-loading, code-splitting, memoization, dependency-injection

5. DIFFICULTY LEVEL TAGS:
   - beginner / intermediate / advanced / expert

6. UI COMPONENT TAGS (if applicable):
   - modal, dropdown, slider, carousel, form, input, button
   - table, chart, graph, gallery, card, list, navigation
   - toast, alert, dialog, tooltip, popover, menu, sidebar

7. SECURITY TAGS - Security considerations:
   - input-sanitization, auth-required, encryption, token-handling
   - xss-protection, csrf-protection, sql-injection-safe
   - secure-storage, rate-limiting, cors-configured, oauth2, jwt

8. PERFORMANCE TAGS - Performance characteristics:
   - heavy-loop, memoization, optimization, virtualization
   - lazy-evaluation, batch-processing, parallel-execution
   - memory-efficient, cpu-intensive, io-bound, multithreading

9. DATABASE TAGS (if applicable):
   - sql-query, nosql-query, prisma-schema, mongodb, postgresql
   - orm, raw-query, migration, seeding, indexing, stored-procedure

10. METADATA TAGS - Code characteristics:
    - lines-[count], complexity-[low/medium/high]
    - imports-[count], functions-[count], classes-[count]
    - documented, tested, typed, linted, async, generic

Generate detailed analysis including:
- ACCURATE language identification using ONLY code analysis (ignore any user hints)
- Performance bottlenecks and optimization opportunities
- Security vulnerabilities and best practices
- Code quality, maintainability, and readability
- Bugs, edge cases, and potential issues
- Framework-specific patterns and anti-patterns
- Style consistency and coding standards

Provide actionable, specific recommendations with code examples where helpful.`
              },
              {
                role: 'user',
                content: `Analyze this code snippet and automatically detect the programming language.

Title: "${title}"

Code:
\`\`\`
${code}
\`\`\`

CRITICAL INSTRUCTIONS:
1. DETECT the language by examining syntax markers (def/class, const/let/var, namespace, using, #include, etc.)
2. Use the DETECTED language in all tags and analysis
3. IGNORE any previous language hints - analyze code syntax only
4. For C# code, look for: namespace, using System, properties with get/set, LINQ, async Task
5. NEVER confuse C# with C, C++, or Java - check for C#-specific syntax
6. NEVER confuse Python with JavaScript - check for Python-specific markers

Provide comprehensive analysis including:
1. DETECTED language (PRIMARY LANGUAGE ONLY) based on code analysis
2. Overall quality and optimization score (0-100)
3. Readability score (0-100)
4. Category-specific analysis (performance, security, quality, bugs, style, architecture)
5. COMPREHENSIVE AI-generated tags covering ALL 10 tag categories
6. Detailed recommendations with priorities and code examples
7. Bug risk assessment with specific identified bugs
8. Code smell detection
9. Improvement suggestions
10. Company style match score (0-100)
11. Complexity analysis
12. Performance diagnostics
13. Architectural review
14. Security analysis with severity levels`
              }
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'comprehensive_code_analysis',
                schema: {
                  type: 'object',
                  properties: {
                    detectedLanguage: {
                      type: 'string',
                      description: 'Verified primary programming language detected from syntax analysis'
                    },
                    languageConfidence: {
                      type: 'string',
                      enum: ['high', 'medium', 'low'],
                      description: 'Confidence level in language detection'
                    },
                    languageVerificationNote: {
                      type: 'string',
                      description: 'Note if detected language differs from user-specified language'
                    },
                    optimizationScore: { 
                      type: 'number', 
                      minimum: 0, 
                      maximum: 100,
                      description: 'Overall code optimization score'
                    },
                    readabilityScore: {
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Code readability and maintainability score'
                    },
                    summary: { 
                      type: 'string',
                      description: 'Technical summary including VERIFIED language: what the code is, what it does, technologies used, key behavior'
                    },
                    aiTags: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Comprehensive flat array using VERIFIED language tag, plus all other categories: framework, purpose, behavioral, difficulty, UI, security, performance, database, metadata'
                    },
                    bugRisk: { 
                      type: 'string', 
                      enum: ['low', 'medium', 'high', 'critical']
                    },
                    styleMatchScore: { 
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'How well code matches team/company style patterns'
                    },
                    complexityLevel: {
                      type: 'string',
                      enum: ['low', 'medium', 'high']
                    },
                    categories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          score: { type: 'number' },
                          color: { type: 'string' },
                          icon: { type: 'string' },
                          issues: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                title: { type: 'string' },
                                description: { type: 'string' },
                                recommendation: { type: 'string' },
                                impact: { type: 'string' },
                                lineNumbers: { type: 'array', items: { type: 'number' } },
                                codeExample: {
                                  type: 'object',
                                  properties: {
                                    before: { type: 'string' },
                                    after: { type: 'string' }
                                  }
                                }
                              },
                              required: ['severity', 'title', 'description', 'recommendation']
                            }
                          }
                        },
                        required: ['id', 'name', 'score', 'issues']
                      }
                    },
                    securityAnalysis: {
                      type: 'object',
                      properties: {
                        overallSeverity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                        vulnerabilities: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: { type: 'string' },
                              severity: { type: 'string' },
                              description: { type: 'string' },
                              location: { type: 'string' },
                              fix: { type: 'string' }
                            }
                          }
                        }
                      }
                    },
                    bugReview: {
                      type: 'object',
                      properties: {
                        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
                        potentialBugs: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              type: { type: 'string' },
                              description: { type: 'string' },
                              location: { type: 'string' },
                              fix: { type: 'string' }
                            }
                          }
                        }
                      }
                    },
                    codeSmells: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          smell: { type: 'string' },
                          location: { type: 'string' },
                          suggestion: { type: 'string' }
                        }
                      }
                    },
                    performanceDiagnostics: {
                      type: 'object',
                      properties: {
                        bottlenecks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              issue: { type: 'string' },
                              impact: { type: 'string' },
                              solution: { type: 'string' }
                            }
                          }
                        }
                      }
                    },
                    architecturalReview: {
                      type: 'object',
                      properties: {
                        concerns: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              concern: { type: 'string' },
                              recommendation: { type: 'string' }
                            }
                          }
                        }
                      }
                    },
                    recommendations: {
                      type: 'object',
                      properties: {
                        quick: { type: 'array', items: { type: 'string' } },
                        detailed: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              description: { type: 'string' },
                              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                              effort: { type: 'string' },
                              impact: { type: 'string' },
                              codeExample: {
                                type: 'object',
                                properties: {
                                  before: { type: 'string' },
                                  after: { type: 'string' }
                                }
                              }
                            },
                            required: ['title', 'description', 'priority']
                          }
                        }
                      }
                    }
                  },
                  required: ['detectedLanguage', 'languageConfidence', 'optimizationScore', 'readabilityScore', 'summary', 'aiTags', 'bugRisk', 'categories', 'recommendations'],
                  additionalProperties: false
                }
              }
            },
            temperature: 0.2, // Even lower temperature for pure language detection without hints
            max_tokens: 16000
          }),
          // Timeout promise that rejects after specified duration
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Request timeout after ${timeoutDuration / 1000} seconds`)), timeoutDuration)
          )
        ]);

        console.log('🔍 Raw OpenAI response received:', { 
          hasChoices: !!apiResponse?.choices,
          hasContent: !!apiResponse?.choices?.[0]?.message?.content 
        });

        // CRITICAL FIX: Parse the response content directly
        if (!apiResponse?.choices?.[0]?.message?.content) {
          console.error('❌ OpenAI returned empty response');
          throw new Error('OpenAI returned an empty response. Please check your API quota and try again.');
        }

        const analysisResult = JSON.parse(apiResponse?.choices?.[0]?.message?.content);

        // Verify we have valid analysis data
        if (!analysisResult || typeof analysisResult !== 'object') {
          console.error('❌ Invalid analysis result:', { analysisResult });
          throw new Error('OpenAI returned invalid or empty analysis data');
        }

        const duration = Date.now() - startTime;
        
        // Log success with details and duration
        console.log('✅ AI analysis completed successfully:', {
          detectedLanguage: analysisResult?.detectedLanguage,
          confidence: analysisResult?.languageConfidence,
          optimizationScore: analysisResult?.optimizationScore,
          tagsCount: analysisResult?.aiTags?.length,
          durationMs: duration,
          durationSeconds: (duration / 1000)?.toFixed(2)
        });

        // CRITICAL FIX: Warn if analysis took too long
        if (duration > 20000) {
          console.warn(`⚠️ AI analysis took ${(duration / 1000)?.toFixed(2)}s - consider code optimization or breaking into smaller snippets`);
        }

        // Transform icon names to actual icon components
        const processedAnalysis = this.processAnalysisIcons(analysisResult);

        return {
          analysis: processedAnalysis,
          optimizationScore: analysisResult?.optimizationScore,
          tags: analysisResult?.aiTags || [],
          detectedLanguage: analysisResult?.detectedLanguage,
          languageConfidence: analysisResult?.languageConfidence
        };

        } catch (error) {
          const duration = Date.now() - startTime;
          
          console.error('❌ OpenAI analysis failed with error:', {
            message: error?.message,
            name: error?.name,
            durationMs: duration,
            stack: error?.stack?.substring(0, 200)
          });
          
          // CRITICAL FIX: Provide more detailed error information
          if (error?.message?.includes('API key')) {
            throw new Error('OpenAI API key is invalid or not configured. Please check your VITE_OPENAI_API_KEY environment variable.');
          } else if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
            throw new Error('OpenAI API quota exceeded or rate limited. Please try again later.');
          } else if (error?.message?.includes('timeout') || error?.message?.includes('Request timeout')) {
            throw new Error(`OpenAI API request timed out after ${(duration / 1000).toFixed(1)}s. Please try again with a smaller code snippet.`);
          } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
            throw new Error('Network timeout - please check your internet connection and try again.');
          } else if (error?.message?.includes('empty response')) {
            throw new Error('OpenAI returned an empty response. Please check your API quota and try again.');
          }
          
          throw error;
        }
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        onRetry: onRetry || ((attempt, maxRetries, delay, error) => {
          console.warn(`🔄 Retry ${attempt}/${maxRetries} after ${delay}ms due to: ${error?.message}`);
        })
      }
    )?.catch(error => {
      // If all retries fail, use fallback analysis
      console.warn('⚠️ All retry attempts failed, falling back to basic analysis:', error?.message);
      return this.getFallbackAnalysis(snippetData);
    });
  }

  /**
   * Process icon names from GPT response to map to actual Lucide icons
   */
  processAnalysisIcons(analysis) {
    const iconMap = {
      'performance': Zap,
      'security': Shield,
      'quality': Code,
      'bugs': Bug,
      'style': Sparkles,
      'optimization': TrendingUp,
      'architecture': Database,
      'complexity': Gauge,
      'readability': Code,
      'maintainability': TrendingUp
    };

    if (analysis?.categories) {
      analysis.categories = analysis?.categories?.map(category => ({
        ...category,
        icon: iconMap?.[category?.id] || Code,
        color: this.getCategoryColor(category?.id)
      }));
    }

    return analysis;
  }

  /**
   * Get Tailwind color class for category
   */
  getCategoryColor(categoryId) {
    const colorMap = {
      'performance': 'blue',
      'security': 'red',
      'quality': 'green',
      'bugs': 'orange',
      'style': 'purple',
      'optimization': 'indigo',
      'architecture': 'teal',
      'complexity': 'yellow',
      'readability': 'cyan',
      'maintainability': 'lime'
    };

    return colorMap?.[categoryId] || 'gray';
  }

  /**
   * Fallback analysis when OpenAI is not available
   */
  getFallbackAnalysis(snippetData) {
    const { code } = snippetData;
    // REMOVED: language parameter - will detect from code only
    
    if (!code) {
      return {
        analysis: {
          optimizationScore: 50,
          readabilityScore: 50,
          summary: 'Basic analysis - OpenAI integration required for full analysis',
          bugRisk: 'medium',
          styleMatchScore: 50,
          complexityLevel: 'medium',
          categories: [
            {
              id: 'quality',
              name: 'Code Quality',
              score: 50,
              color: 'green',
              icon: Code,
              issues: [{
                severity: 'medium',
                title: 'Analysis Unavailable',
                description: 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to enable comprehensive AI analysis with automatic language detection.',
                recommendation: 'Configure OpenAI API key in your .env file to unlock language detection and all tagging categories'
              }]
            }
          ],
          recommendations: {
            quick: ['Configure OpenAI API for automatic language detection and comprehensive tagging'],
            detailed: [{
              title: 'Enable Complete AI Analysis with Automatic Language Detection',
              description: 'Add your OpenAI API key to unlock comprehensive code analysis with automatic language detection and all 10 tag categories.',
              priority: 'high',
              effort: '5 minutes',
              impact: 'Enables automatic language detection and detailed code optimization insights'
            }]
          }
        },
        optimizationScore: 50,
        tags: ['code-snippet', 'needs-comprehensive-analysis', 'configure-openai'],
        detectedLanguage: 'unknown',
        languageConfidence: 'low'
      };
    }

    // Enhanced language detection for fallback analysis (without user hints)
    const detectedLang = this.detectLanguageFallback(code);

    // Basic code metrics for fallback
    const lines = code?.split('\n');
    const nonEmptyLines = lines?.filter(line => line?.trim()?.length > 0)?.length;
    const hasComments = code?.includes('//') || code?.includes('/*') || code?.includes('#');
    const hasProperIndentation = code?.includes('  ') || code?.includes('\t');
    
    // Detect some basic patterns
    const hasAsync = code?.includes('async') || code?.includes('await') || code?.includes('Promise') || code?.includes('Task');
    const hasState = code?.includes('useState') || code?.includes('state') || code?.includes('setState');
    const hasLoop = code?.includes('for') || code?.includes('while') || code?.includes('map');
    const hasFunction = code?.includes('function') || code?.includes('=>') || code?.includes('def ') || code?.includes('void ') || code?.includes('public ');
    
    let qualityScore = 50;
    if (hasComments) qualityScore += 15;
    if (hasProperIndentation) qualityScore += 15;
    if (nonEmptyLines > 10) qualityScore += 10;
    if (nonEmptyLines < 100) qualityScore += 10;
    
    // Build comprehensive fallback tags with verified language
    const fallbackTags = [
      // Verified language tag
      detectedLang?.tag,
      
      // Purpose tags (basic detection)
      hasFunction ? 'utility-function' : 'code-snippet',
      hasState ? 'state-management' : null,
      
      // Behavioral tags
      hasAsync ? 'async-flow' : 'synchronous',
      hasLoop ? 'iteration' : null,
      
      // Difficulty level
      nonEmptyLines < 50 ? 'beginner' : nonEmptyLines < 150 ? 'intermediate' : 'advanced',
      
      // Metadata tags
      `lines-${nonEmptyLines}`,
      hasComments ? 'documented' : 'needs-documentation',
      hasProperIndentation ? 'properly-formatted' : 'formatting-issues',
      nonEmptyLines < 50 ? 'complexity-low' : nonEmptyLines < 200 ? 'complexity-medium' : 'complexity-high',
      
      // Additional context
      'fallback-analysis',
      'enable-openai-for-accurate-language-detection'
    ]?.filter(Boolean);

    const languageNote = detectedLang?.verified ? 
      `Detected ${detectedLang?.name} code based on syntax patterns.` :
      `Language could not be reliably detected. Enable OpenAI for accurate automatic detection.`;
    
    return {
      analysis: {
        optimizationScore: Math.min(qualityScore, 100),
        readabilityScore: hasProperIndentation ? 75 : 50,
        summary: `Basic analysis of ${nonEmptyLines} lines of code. ${languageNote} Enable OpenAI for comprehensive tagging with automatic language detection.`,
        bugRisk: 'medium',
        styleMatchScore: hasProperIndentation ? 75 : 50,
        complexityLevel: nonEmptyLines < 50 ? 'low' : nonEmptyLines < 200 ? 'medium' : 'high',
        categories: [
          {
            id: 'quality',
            name: 'Code Quality',
            score: qualityScore,
            color: 'green',
            icon: Code,
            issues: [
              {
                severity: 'low',
                title: 'Basic Metrics Analyzed',
                description: `Code has ${nonEmptyLines} lines, ${hasComments ? 'includes' : 'lacks'} comments, ${hasProperIndentation ? 'proper' : 'inconsistent'} indentation. ${languageNote} Limited tagging available without OpenAI.`,
                recommendation: 'Enable OpenAI API for comprehensive analysis with 100% accurate language detection across all 10 tag categories including precise C# identification that won\'t be confused with C, C++, or Java.'
              }
            ]
          }
        ],
        recommendations: {
          quick: [
            'Add OpenAI API key for automatic language detection',
            hasComments ? 'Documentation present' : 'Add code comments',
            'Enable AI-powered automatic language detection and tag generation'
          ],
          detailed: [
            {
              title: 'Configure Complete AI Tagging with Automatic Language Detection',
              description: 'Set up OpenAI API key to unlock comprehensive code analysis with automatic language detection and detailed tagging across all 10 categories.',
              priority: 'high',
              effort: '5 minutes',
              impact: 'Enables automatic language detection for better code organization'
            }
          ]
        }
      },
      optimizationScore: Math.min(qualityScore, 100),
      tags: fallbackTags,
      detectedLanguage: detectedLang?.tag || 'unknown',
      languageConfidence: detectedLang?.verified ? 'medium' : 'low'
    };
  }

  /**
   * Fallback language detection based on syntax patterns (no user hints)
   */
  detectLanguageFallback(code) {
    // Python Detection patterns (check first for dynamic languages)
    const pythonPatterns = {
      importStatement: /^(import|from)\s+[\w.]+/m,
      defKeyword: /\ndef\s+\w+\s*\(/,
      classDefinition: /\nclass\s+\w+/,
      decorators: /@\w+/,
      listComprehension: /\[.+\s+for\s+.+\s+in\s+.+\]/,
      pythonPrint: /\bprint\s*\(/,
      colonBlocks: /:\s*$/m,
      elifKeyword: /\belif\b/,
      magicMethods: /__\w+__/,
      hashComments: /#[^\n]*/
    };

    // Calculate Python score from positive patterns
    let pythonScore = 0;
    
    // Check positive patterns
    for (const pattern of Object.values(pythonPatterns)) {
      if (pattern?.test(code)) {
        pythonScore++;
      }
    }

    // Add bonus points if Python-negative indicators are ABSENT
    // (these are patterns that Python code should NOT have)
    const hasCurlyBraces = /\{[\s\S]*\}/?.test(code);
    const hasSemicolons = /;$/m?.test(code);
    
    // Python code should NOT have these, so reward their absence
    if (!hasCurlyBraces) pythonScore++;
    if (!hasSemicolons) pythonScore++;

    // JavaScript Detection patterns (check for JS-specific markers)
    const jsPatterns = {
      constLetVar: /\b(const|let|var)\b/,
      arrowFunction: /=>/,
      curlyBraces: /\{[\s\S]*\}/,
      semicolons: /;$/m,
      slashComments: /\/\//,
      consoleLog: /console\.log/,
      functionKeyword: /\bfunction\s+\w+/,
      promiseChain: /\.(then|catch)\(/,
      templateLiteral: /`[^`]*\${[^}]+}/,
      typeof: /\btypeof\b/
    };

    let jsScore = 0;
    for (const pattern of Object.values(jsPatterns)) {
      if (pattern?.test(code)) {
        jsScore++;
      }
    }

    // TypeScript Detection patterns
    const tsPatterns = {
      typeAnnotation: /:\s*(string|number|boolean|any|void)/,
      interface: /\binterface\s+\w+/,
      typeKeyword: /\btype\s+\w+/,
      genericTypes: /<[A-Z]\w*>/,
      asKeyword: /\bas\s+\w+/
    };

    let tsScore = 0;
    for (const pattern of Object.values(tsPatterns)) {
      if (pattern?.test(code)) {
        tsScore++;
      }
    }

    // C# Detection patterns (check for compiled languages)
    const csharpPatterns = {
      namespace: /namespace\s+[\w.]+/,
      usingSystem: /using\s+System/,
      properties: /{\s*get;\s*set;\s*}/,
      linq: /\.(Where|Select|FirstOrDefault|Any|All)\(/,
      asyncTask: /async\s+Task/,
      attributes: /\[[\w]+\]/,
      nullable: /\w+\?/,
      interpolation: /\$"[^"]*{[^}]+}/
    };

    let csharpScore = 0;
    for (const pattern of Object.values(csharpPatterns)) {
      if (pattern?.test(code)) {
        csharpScore++;
      }
    }

    // C++ Detection patterns
    const cppPatterns = {
      include: /#include\s*<[\w.]+>/,
      stdNamespace: /std::/,
      pointers: /\w+\s*\*\s*\w+/,
      templates: /template\s*<.*>/,
      scopeResolution: /::/,
      cout: /std::cout/
    };

    let cppScore = 0;
    for (const pattern of Object.values(cppPatterns)) {
      if (pattern?.test(code)) {
        cppScore++;
      }
    }

    // Java Detection patterns
    const javaPatterns = {
      packageDecl: /package\s+[\w.]+/,
      importJava: /import\s+java\./,
      publicClass: /public\s+class/,
      systemOut: /System\.out\./
    };

    let javaScore = 0;
    for (const pattern of Object.values(javaPatterns)) {
      if (pattern?.test(code)) {
        javaScore++;
      }
    }

    // Go Detection patterns
    const goPatterns = {
      packageMain: /package\s+main/,
      importQuotes: /import\s+"[\w/]+"/,
      funcKeyword: /\bfunc\s+\w+/,
      shortDeclaration: /:=/,
      defer: /\bdefer\b/
    };

    let goScore = 0;
    for (const pattern of Object.values(goPatterns)) {
      if (pattern?.test(code)) {
        goScore++;
      }
    }

    // Rust Detection patterns
    const rustPatterns = {
      fnKeyword: /\bfn\s+\w+/,
      letBinding: /\blet\s+\w+/,
      mutKeyword: /\bmut\b/,
      macroCall: /\w+!/,
      implBlock: /\bimpl\b/
    };

    let rustScore = 0;
    for (const pattern of Object.values(rustPatterns)) {
      if (pattern?.test(code)) {
        rustScore++;
      }
    }

    // PHP Detection patterns
    const phpPatterns = {
      phpTag: /<\?php/,
      dollarVar: /\$\w+/,
      arrowAccess: /->/,
      echo: /\becho\b/,
      phpFunction: /\bfunction\s+\w+/
    };

    let phpScore = 0;
    for (const pattern of Object.values(phpPatterns)) {
      if (pattern?.test(code)) {
        phpScore++;
      }
    }

    // Ruby Detection patterns
    const rubyPatterns = {
      defEnd: /\bdef\s+\w+[\s\S]*\bend\b/,
      puts: /\bputs\b/,
      symbols: /:\w+/,
      instanceVar: /@\w+/,
      classVar: /@@\w+/
    };

    let rubyScore = 0;
    for (const pattern of Object.values(rubyPatterns)) {
      if (pattern?.test(code)) {
        rubyScore++;
      }
    }

    // Determine best match with priority scoring (no user hints considered)
    const scores = [
      { tag: 'python', name: 'Python', score: pythonScore, verified: pythonScore >= 3 },
      { tag: 'javascript', name: 'JavaScript', score: jsScore, verified: jsScore >= 3 },
      { tag: 'typescript', name: 'TypeScript', score: tsScore + jsScore, verified: tsScore >= 2 },
      { tag: 'csharp', name: 'C#', score: csharpScore, verified: csharpScore >= 2 },
      { tag: 'cpp', name: 'C++', score: cppScore, verified: cppScore >= 2 },
      { tag: 'java', name: 'Java', score: javaScore, verified: javaScore >= 2 },
      { tag: 'go', name: 'Go', score: goScore, verified: goScore >= 2 },
      { tag: 'rust', name: 'Rust', score: rustScore, verified: rustScore >= 2 },
      { tag: 'php', name: 'PHP', score: phpScore, verified: phpScore >= 2 },
      { tag: 'ruby', name: 'Ruby', score: rubyScore, verified: rubyScore >= 2 }
    ];

    // Sort by score descending
    scores?.sort((a, b) => b?.score - a?.score);

    // If top score is high enough, return that language
    if (scores?.[0]?.verified) {
      return scores?.[0];
    }

    // No reliable detection possible
    return { 
      tag: 'unknown', 
      name: 'Unknown', 
      verified: false 
    };
  }

  /**
   * Update snippet with AI analysis results in Supabase
   */
  async updateSnippetAnalysis(snippetId, analysisData) {
    try {
      // Use correct database column names
      const { error } = await supabase?.from('snippets')?.update({
          ai_tags: analysisData?.tags,
          ai_quality_score: analysisData?.optimizationScore,
          ai_analysis_data: analysisData?.analysis,
          updated_at: new Date()?.toISOString()
        })?.eq('id', snippetId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating snippet analysis:', error);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async analyzeCode(code, language) {
    return this.analyzeSnippetWithAI({ code, language, title: 'Code Analysis' });
  }

  /**
   * Legacy method for backward compatibility
   */
  async analyzeSnippet(snippetData) {
    return this.analyzeSnippetWithAI(snippetData);
  }
}

export default new AITaggingService();

// Export the main function for direct imports
export const analyzeSnippetWithAI = async (snippetData) => {
  const service = new AITaggingService();
  return service?.analyzeSnippetWithAI(snippetData);
};