// Mythwright AI Service - Multi-Provider AI Integration System
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'config', '.env') });
import { z } from 'zod';
import type { 
  GenerationSettings, 
  StatBlock, 
  NPC, 
  MagicItem, 
  Encounter,
  SystemDesignBudget 
} from '../../types/content.types.js';
import { 
  IntelligentModelSelector, 
  TaskComplexityAnalyzer,
  type ModelRecommendation,
  type TaskComplexityMetrics
} from './model-selector.js';
import CostOptimizer from './cost-optimizer.js';
import RetryHandler from './retry-handler.js';
import CacheManager from './cache-manager.js';
import ContentValidator from './content-validator.js';

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseURL?: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
}

export interface AIGenerationRequest {
  type: 'statblock' | 'npc' | 'magicitem' | 'encounter' | 'description' | 'custom';
  prompt: string;
  context?: {
    systemBudget?: SystemDesignBudget;
    projectId?: string;
    chapterId?: string;
    additionalContext?: Record<string, unknown>;
  };
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    provider?: string;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  content?: unknown;
  rawResponse?: string;
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    cost: number;
    duration: number;
    timestamp: Date;
    modelSelection?: {
      recommendation: ModelRecommendation;
      complexity: TaskComplexityMetrics;
      overridden: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  dailyUsage: {
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }[];
}

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

export class AIServiceConfig {
  private static instance: AIServiceConfig;
  private config: Map<string, AIProviderConfig> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): AIServiceConfig {
    if (!AIServiceConfig.instance) {
      AIServiceConfig.instance = new AIServiceConfig();
    }
    return AIServiceConfig.instance;
  }

  private initializeProviders() {
    // OpenAI Configuration
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.config.set('openai', {
        name: 'OpenAI',
        apiKey: openaiKey,
        defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.8'),
        enabled: true
      });
    }

    // Anthropic Configuration (for future use)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      this.config.set('anthropic', {
        name: 'Anthropic',
        apiKey: anthropicKey,
        baseURL: 'https://api.anthropic.com',
        defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-sonnet-20240229',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.8'),
        enabled: true
      });
    }

    // Google AI Configuration (for future use)
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (googleKey) {
      this.config.set('google', {
        name: 'Google AI',
        apiKey: googleKey,
        baseURL: 'https://generativelanguage.googleapis.com',
        defaultModel: 'gemini-pro',
        maxTokens: parseInt(process.env.GOOGLE_MAX_TOKENS || '4000'),
        temperature: parseFloat(process.env.GOOGLE_TEMPERATURE || '0.8'),
        enabled: true
      });
    }
  }

  getProvider(name: string): AIProviderConfig | null {
    return this.config.get(name) || null;
  }

  getAllProviders(): AIProviderConfig[] {
    return Array.from(this.config.values());
  }

  getEnabledProviders(): AIProviderConfig[] {
    return this.getAllProviders().filter(p => p.enabled);
  }

  getPrimaryProvider(): AIProviderConfig | null {
    const primaryName = process.env.AI_PROVIDER_PRIMARY || 'openai';
    return this.getProvider(primaryName);
  }

  getFallbackProvider(): AIProviderConfig | null {
    const fallbackName = process.env.AI_PROVIDER_FALLBACK || 'anthropic';
    return this.getProvider(fallbackName);
  }
}

// ============================================================================
// OPENAI PROVIDER
// ============================================================================

export class OpenAIProvider {
  private client: OpenAI;
  private config: AIProviderConfig;
  private retryHandler: RetryHandler;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2.0,
      jitterFactor: 0.1
    });
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Use retry handler to wrap the entire generation process
    return this.retryHandler.executeAIRequest(async () => {
      return this.performGeneration(request);
    }, request);
  }
  
  private async performGeneration(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Use intelligent model selection if no specific model requested
      let selectedModel = request.options?.model || this.config.defaultModel;
      let modelSelection: { recommendation: ModelRecommendation; complexity: TaskComplexityMetrics; overridden: boolean } | undefined;
      
      if (!request.options?.model) {
        // Use intelligent model selection
        const recommendation = IntelligentModelSelector.selectOptimalModel(request, {
          prioritizeCost: false, // Can be made configurable
          prioritizeQuality: true,
          maxCostPer1k: 0.1,
          requiredAccuracy: 7
        });
        
        selectedModel = recommendation.model;
        modelSelection = {
          recommendation,
          complexity: TaskComplexityAnalyzer.analyzeTask(request),
          overridden: false
        };
        
        console.log(`🤖 Intelligent model selection: ${selectedModel} (confidence: ${recommendation.confidence}%)`);
        console.log(`📊 Reasoning: ${recommendation.reasoning}`);
      } else {
        // Model was manually specified
        modelSelection = {
          recommendation: IntelligentModelSelector.selectOptimalModel(request),
          complexity: TaskComplexityAnalyzer.analyzeTask(request),
          overridden: true
        };
      }
      
      const model = selectedModel;
      const temperature = request.options?.temperature || this.config.temperature;
      const maxTokens = request.options?.maxTokens || this.config.maxTokens;

      // Build system prompt based on content type
      const systemPrompt = this.buildSystemPrompt(request.type, request.context);
      
      // Determine if we need JSON mode based on content type
      const needsJsonMode = ['statblock', 'npc', 'magicitem', 'encounter'].includes(request.type);
      
      const requestOptions: any = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.prompt }
        ],
        temperature,
        max_tokens: maxTokens
      };
      
      if (needsJsonMode) {
        requestOptions.response_format = { type: 'json_object' };
      }
      
      const response = await this.client.chat.completions.create(requestOptions);

      const duration = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateCost(model, tokensUsed);

      // Parse response based on whether JSON mode was used
      const rawContent = response.choices[0]?.message?.content || (needsJsonMode ? '{}' : '');
      let parsedContent;
      
      if (needsJsonMode) {
        try {
          parsedContent = JSON.parse(rawContent);
        } catch (parseError) {
          console.warn(`⚠️ JSON parsing failed for ${request.type}, falling back to raw content:`, parseError.message);
          // Fallback: return the raw content wrapped in a simple structure
          parsedContent = {
            content: rawContent,
            type: request.type,
            parseFailed: true
          };
        }
      } else {
        // For non-JSON types, return the content directly
        parsedContent = rawContent;
      }

      return {
        success: true,
        content: parsedContent,
        rawResponse: rawContent,
        metadata: {
          provider: 'openai',
          model,
          tokensUsed,
          cost,
          duration,
          timestamp: new Date(),
          modelSelection,
          jsonMode: needsJsonMode
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Transform error for retry handler
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if this is a retryable error
      if (this.isRetryableError(error)) {
        throw error; // Let retry handler handle it
      } else {
        // Non-retryable error - return immediately
        return {
          success: false,
          metadata: {
            provider: 'openai',
            model: request.options?.model || this.config.defaultModel,
            tokensUsed: 0,
            cost: 0,
            duration,
            timestamp: new Date()
          },
          error: {
            code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            message: errorMessage,
            details: error
          }
        };
      }
    }
  }
  
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const retryablePatterns = [
        'econnreset',
        'enotfound', 
        'econnrefused',
        'etimedout',
        'rate_limit_exceeded',
        'server_error',
        'service_unavailable',
        'timeout',
        'network_error',
        '429',
        '500',
        '502',
        '503',
        '504'
      ];
      
      return retryablePatterns.some(pattern => message.includes(pattern));
    }
    
    return true; // Default to retryable for unknown errors
  }

  private buildSystemPrompt(type: string, context?: AIGenerationRequest['context']): string {
    const basePrompt = `You are an expert D&D 5th Edition content creator for Mythwright, an AI-powered sourcebook generator.

CRITICAL INSTRUCTIONS:
1. Always respond with valid JSON that matches the expected schema
2. Follow D&D 5e rules precisely (PHB, DMG, MM)
3. Use only SRD-safe content (no Product Identity like "beholder" - use "gaze tyrant")
4. Ensure content is balanced and appropriate for the specified party level
5. Include accessibility information (alt text, descriptions)
6. Make content engaging and professionally written

`;

    const typePrompts = {
      statblock: `Create a D&D 5e creature stat block. Include:
- Basic info (name, size, type, alignment)
- Combat stats (AC, HP, speed, abilities)
- Actions, reactions, and special abilities
- Appropriate CR and XP value
- Rich description and tactics

Return JSON with StatBlock schema structure.`,

      npc: `Create a detailed D&D NPC. Include:
- Basic identity (name, race, occupation, appearance)
- Complete personality (trait, ideal, bond, flaw)
- Voice characteristics (accent, mannerisms, speech patterns)
- Background, goals, and relationships
- Sample dialogue and interaction notes

Return JSON with NPC schema structure.`,

      magicitem: `Create a D&D magic item. Include:
- Basic info (name, type, rarity, attunement)
- Detailed description and lore
- Mechanical effects and usage
- Appropriate power level for rarity
- Interesting flavor and backstory

Return JSON with MagicItem schema structure.`,

      encounter: `Create a D&D encounter. Include:
- Encounter setup and environment
- Creature selection with appropriate CR
- Tactical information and positioning
- Scaling notes for different party sizes
- Treasure and story rewards

Return JSON with Encounter schema structure.`,

      description: `Create vivid, immersive descriptive text for D&D. Include:
- Sensory details (sight, sound, smell, feel)
- Atmospheric elements
- Interactive elements for players
- Appropriate tone and mood

Return JSON with: { "title": "...", "description": "...", "readAloudText": "..." }`,

      custom: `Create custom D&D content as specified in the prompt.
Follow all D&D 5e rules and SRD guidelines.
Return JSON in the format requested.`
    };

    let prompt = basePrompt + (typePrompts[type as keyof typeof typePrompts] || typePrompts.custom);

    // Add context information
    if (context?.systemBudget) {
      prompt += `\n\nSYSTEM DESIGN BUDGET CONTEXT:
- Party Size: ${context.systemBudget.partySize}
- Party Level: ${context.systemBudget.partyLevel}
- Difficulty: ${context.systemBudget.difficulty}
- Combat Weight: ${context.systemBudget.combatWeight}%
- Exploration Weight: ${context.systemBudget.explorationWeight}%
- Social Weight: ${context.systemBudget.socialWeight}%
- Tone: ${context.systemBudget.tone}
- Setting: ${context.systemBudget.setting}

Ensure content is appropriate for this party configuration and follows the specified preferences.`;
    }

    if (context?.additionalContext) {
      prompt += `\n\nADDITIONAL CONTEXT:\n${JSON.stringify(context.additionalContext, null, 2)}`;
    }

    return prompt;
  }

  private calculateCost(model: string, tokens: number): number {
    // OpenAI pricing (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
    };

    const modelPricing = pricing[model] || pricing['gpt-4']; // Default to GPT-4 pricing
    
    // Estimate roughly 70% input, 30% output tokens
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);
    
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
}

// ============================================================================
// MAIN AI SERVICE
// ============================================================================

export class AIService {
  private static instance: AIService;
  private config: AIServiceConfig;
  private providers: Map<string, OpenAIProvider> = new Map();
  private usageStats: AIUsageStats;
  private costOptimizer: CostOptimizer;
  private cacheManager: CacheManager;
  private contentValidator: ContentValidator;

  private constructor() {
    this.config = AIServiceConfig.getInstance();
    this.initializeProviders();
    this.initializeUsageStats();
    this.initializeCostOptimizer();
    this.initializeCacheManager();
    this.initializeContentValidator();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeProviders() {
    const openaiConfig = this.config.getProvider('openai');
    if (openaiConfig) {
      this.providers.set('openai', new OpenAIProvider(openaiConfig));
    }
    
    // Add other providers as they're implemented
  }

  private initializeUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successRate: 0,
      averageResponseTime: 0,
      dailyUsage: []
    };
  }
  
  private initializeCostOptimizer() {
    this.costOptimizer = new CostOptimizer(
      {
        enableCostOptimization: process.env.AI_COST_TRACKING_ENABLED === 'true',
        maxCostPerRequest: parseFloat(process.env.AI_MAX_COST_PER_REQUEST || '0.10'),
        preferCheaperModels: process.env.AI_PREFER_CHEAPER_MODELS === 'true',
        budgetAlertThreshold: parseInt(process.env.AI_BUDGET_ALERT_THRESHOLD || '80'),
        enableUsageLimits: process.env.AI_USAGE_LIMITS_ENABLED === 'true',
        enableCaching: process.env.AI_CACHING_ENABLED === 'true',
        enableBatching: process.env.AI_BATCHING_ENABLED === 'true'
      }
    );
  }
  
  private initializeCacheManager() {
    this.cacheManager = new CacheManager({
      enabled: process.env.AI_CACHING_ENABLED === 'true',
      ttlSeconds: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600'),
      maxEntries: parseInt(process.env.AI_CACHE_MAX_ENTRIES || '1000'),
      persistToDisk: process.env.AI_CACHE_PERSIST === 'true',
      diskCachePath: process.env.AI_CACHE_PATH || './cache/ai-responses.json'
    });
  }
  
  private initializeContentValidator() {
    this.contentValidator = new ContentValidator();
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // Validate request
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        metadata: {
          provider: 'none',
          model: 'none',
          tokensUsed: 0,
          cost: 0,
          duration: 0,
          timestamp: new Date()
        },
        error: {
          code: 'INVALID_REQUEST',
          message: validation.errors.join(', ')
        }
      };
    }

    // Check cache first
    const cachedResponse = await this.cacheManager.get(request);
    if (cachedResponse) {
      console.log(`💾 Cache hit for ${request.type} generation`);
      
      // Still track the "usage" for cost tracking (but with zero cost)
      const cacheHitResponse: AIGenerationResponse = {
        ...cachedResponse,
        metadata: {
          ...cachedResponse.metadata,
          cached: true,
          cost: 0 // Cache hits are free
        }
      };
      
      this.costOptimizer.trackUsage(request, cacheHitResponse);
      this.updateUsageStats(cacheHitResponse);
      
      return cacheHitResponse;
    }

    // Check usage limits with cost optimizer
    const limitCheck = this.costOptimizer.checkUsageLimits();
    if (!limitCheck.allowed) {
      return {
        success: false,
        metadata: {
          provider: 'none',
          model: 'none',
          tokensUsed: 0,
          cost: 0,
          duration: 0,
          timestamp: new Date()
        },
        error: {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: limitCheck.reason || 'Usage limits exceeded',
          details: { waitTime: limitCheck.waitTime }
        }
      };
    }
    
    // Optimize request for cost efficiency
    const optimizedRequest = this.costOptimizer.optimizeRequest(request);

    // Select provider
    const providerName = optimizedRequest.options?.provider || 'openai';
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return {
        success: false,
        metadata: {
          provider: providerName,
          model: 'none',
          tokensUsed: 0,
          cost: 0,
          duration: 0,
          timestamp: new Date()
        },
        error: {
          code: 'PROVIDER_NOT_AVAILABLE',
          message: `Provider ${providerName} is not available`
        }
      };
    }

    // Generate content with optimized request
    const response = await provider.generateContent(optimizedRequest);
    
    // Validate AI-generated content
    if (response.success && process.env.AI_VALIDATION_ENABLED !== 'false') {
      const validationReport = await this.contentValidator.validateAIResponse(optimizedRequest, response);
      
      // Add validation report to response metadata
      response.metadata.validation = {
        report: validationReport,
        passed: validationReport.overall.passed,
        score: validationReport.overall.score,
        autoFixApplied: validationReport.content.hasAutoFixes
      };
      
      // Apply auto-fixes if available and enabled
      if (validationReport.content.hasAutoFixes && process.env.AI_AUTO_FIX_ENABLED === 'true') {
        response.content = validationReport.content.validated;
        console.log(`🔧 Applied auto-fixes to ${optimizedRequest.type} content`);
      }
      
      // Log validation results
      if (!validationReport.overall.passed) {
        console.warn(`⚠️ Content validation failed for ${optimizedRequest.type}:`, {
          errors: validationReport.overall.errors,
          warnings: validationReport.overall.warnings,
          score: validationReport.overall.score
        });
      } else {
        console.log(`✅ Content validation passed for ${optimizedRequest.type} (score: ${validationReport.overall.score}%)`);
      }
    }
    
    // Cache successful responses (after validation and auto-fixes)
    if (response.success) {
      await this.cacheManager.set(optimizedRequest, response);
    }
    
    // Track usage with cost optimizer
    this.costOptimizer.trackUsage(optimizedRequest, response);
    
    // Update legacy usage stats (for backwards compatibility)
    this.updateUsageStats(response);
    
    return response;
  }

  private validateRequest(request: AIGenerationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length === 0) {
      errors.push('Prompt is required');
    }

    if (!request.type) {
      errors.push('Content type is required');
    }

    const validTypes = ['statblock', 'npc', 'magicitem', 'encounter', 'description', 'custom'];
    if (request.type && !validTypes.includes(request.type)) {
      errors.push(`Invalid content type: ${request.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }



  private updateUsageStats(response: AIGenerationResponse) {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += response.metadata.tokensUsed;
    this.usageStats.totalCost += response.metadata.cost;
    
    // Update daily usage
    const today = new Date().toISOString().split('T')[0];
    let todayUsage = this.usageStats.dailyUsage.find(d => d.date === today);
    
    if (!todayUsage) {
      todayUsage = { date: today, requests: 0, tokens: 0, cost: 0 };
      this.usageStats.dailyUsage.push(todayUsage);
    }
    
    todayUsage.requests++;
    todayUsage.tokens += response.metadata.tokensUsed;
    todayUsage.cost += response.metadata.cost;
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.usageStats.dailyUsage = this.usageStats.dailyUsage.filter(
      d => new Date(d.date) >= thirtyDaysAgo
    );
    
    // Update success rate and average response time
    const successfulRequests = this.usageStats.totalRequests - this.getFailedRequestCount();
    this.usageStats.successRate = (successfulRequests / this.usageStats.totalRequests) * 100;
    
    // Simplified average response time calculation
    this.usageStats.averageResponseTime = (
      this.usageStats.averageResponseTime * (this.usageStats.totalRequests - 1) + response.metadata.duration
    ) / this.usageStats.totalRequests;
  }

  private getFailedRequestCount(): number {
    // This would be tracked separately in a real implementation
    return 0;
  }

  getUsageStats(): AIUsageStats {
    return { ...this.usageStats };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderConfig(name: string): AIProviderConfig | null {
    return this.config.getProvider(name);
  }

  // Convenience methods for specific content types
  async generateStatBlock(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse> {
    return this.generateContent({
      type: 'statblock',
      prompt,
      context,
      options
    });
  }

  async generateNPC(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse> {
    return this.generateContent({
      type: 'npc',
      prompt,
      context,
      options
    });
  }

  async generateMagicItem(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse> {
    return this.generateContent({
      type: 'magicitem',
      prompt,
      context,
      options
    });
  }

  async generateEncounter(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse> {
    return this.generateContent({
      type: 'encounter',
      prompt,
      context,
      options
    });
  }

  async generateDescription(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse> {
    return this.generateContent({
      type: 'description',
      prompt,
      context,
      options
    });
  }
  
  // ============================================================================
  // COST OPTIMIZATION & ANALYTICS
  // ============================================================================
  
  getCostMetrics() {
    return this.costOptimizer.getUsageMetrics();
  }
  
  getCostAlerts() {
    return this.costOptimizer.getAlerts();
  }
  
  getCostRecommendations() {
    return this.costOptimizer.getRecommendations();
  }
  
  acknowledgeCostAlert(alertId: string): boolean {
    return this.costOptimizer.acknowledgeAlert(alertId);
  }
  
  getBudgetUsage(): {
    percentage: number;
    dailySpend: number;
    monthlySpend: number;
    efficiencyScore: number;
  } {
    return {
      percentage: this.costOptimizer.getBudgetUsagePercentage(),
      dailySpend: this.costOptimizer.getDailySpend(),
      monthlySpend: this.costOptimizer.getMonthlySpend(),
      efficiencyScore: this.costOptimizer.getEfficiencyScore()
    };
  }
  
  exportUsageData(): string {
    return this.costOptimizer.exportMetrics();
  }
  
  resetUsageStats(): void {
    this.costOptimizer.reset();
    this.initializeUsageStats();
  }
  
  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================
  
  getCacheStats() {
    return this.cacheManager.getStats();
  }
  
  clearCache(): void {
    this.cacheManager.clear();
  }
  
  invalidateCacheByTag(tag: string): number {
    return this.cacheManager.invalidateByTag(tag);
  }
  
  invalidateCacheByPattern(pattern: RegExp): number {
    return this.cacheManager.invalidateByPattern(pattern);
  }
  
  isCacheEnabled(): boolean {
    return this.cacheManager.isEnabled();
  }
  
  exportCacheData(): string {
    return this.cacheManager.exportCache();
  }
  
  // ============================================================================
  // CONTENT VALIDATION
  // ============================================================================
  
  async validateContent(content: any, contentType: string, request?: AIGenerationRequest, response?: AIGenerationResponse) {
    const context = {
      contentType,
      request: request || { type: contentType, prompt: '', context: undefined },
      response: response || { success: true, content, metadata: { provider: 'manual', model: 'manual', tokensUsed: 0, cost: 0, duration: 0, timestamp: new Date() } },
      systemBudget: request?.context?.systemBudget
    };
    
    return this.contentValidator.validate(content, context);
  }
  
  getValidationRules(contentType?: string) {
    return this.contentValidator.getAvailableRules(contentType);
  }
  
  addValidationRule(contentType: string, rule: any) {
    this.contentValidator.addCustomRule(contentType, rule);
  }
  
  // ============================================================================
  // SPECIALIZED GENERATORS
  // ============================================================================
  
  async generateMonster(request: any) {
    const { default: MonsterGenerator } = await import('./generators/monster-generator.js');
    return MonsterGenerator.generateMonster(request, this);
  }
  
  async generateNPC(request: any) {
    const { default: NPCGenerator } = await import('./generators/npc-generator.js');
    return NPCGenerator.generateNPC(request, this);
  }
  
  async generateMagicItem(request: any) {
    const { default: MagicItemGenerator } = await import('./generators/magic-item-generator.js');
    return MagicItemGenerator.generateMagicItem(request, this);
  }
  
  async generateTrap(request: any) {
    const { default: TrapGenerator } = await import('./generators/trap-generator.js');
    return TrapGenerator.generateTrap(request, this);
  }
  
  async generateEncounter(request: any) {
    const { default: EncounterGenerator } = await import('./generators/encounter-generator.js');
    return EncounterGenerator.generateEncounter(request, this);
  }
  
  async generateNarrative(request: any) {
    const { default: NarrativeGenerator } = await import('./generators/narrative-generator.js');
    return NarrativeGenerator.generateNarrative(request, this);
  }
  
  async generateRandomTable(request: any) {
    const { default: RandomTableGenerator } = await import('./generators/random-table-generator.js');
    return RandomTableGenerator.generateRandomTable(request, this);
  }
  
  async generateBackgroundOrFeat(request: any) {
    const { default: BackgroundFeatGenerator } = await import('./generators/background-feat-generator.js');
    return BackgroundFeatGenerator.generateBackgroundOrFeat(request, this);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AIService;

// Singleton instance for easy import
export const aiService = AIService.getInstance();
