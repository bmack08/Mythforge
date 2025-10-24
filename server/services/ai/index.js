// Mythwright AI Service - Multi-Provider AI Integration System
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'config', '.env') });

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

export class AIServiceConfig {
  static instance;
  config = new Map();

  constructor() {
    this.initializeProviders();
  }

  static getInstance() {
    if (!AIServiceConfig.instance) {
      AIServiceConfig.instance = new AIServiceConfig();
    }
    return AIServiceConfig.instance;
  }

  initializeProviders() {
    // OpenAI Configuration
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.config.set('openai', {
        name: 'OpenAI',
        apiKey: openaiKey,
        defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini',
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
  }

  getProvider(name) {
    return this.config.get(name) || null;
  }

  getAllProviders() {
    return Array.from(this.config.values());
  }

  getEnabledProviders() {
    return this.getAllProviders().filter(p => p.enabled);
  }

  getPrimaryProvider() {
    const primaryName = process.env.AI_PROVIDER_PRIMARY || 'openai';
    return this.getProvider(primaryName);
  }
}

// ============================================================================
// OPENAI PROVIDER
// ============================================================================

export class OpenAIProvider {
  constructor(config) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }

  async generateContent(request) {
    const startTime = Date.now();

    try {
      const model = request.options?.model || this.config.defaultModel;
      const temperature = request.options?.temperature || this.config.temperature;
      const maxTokens = request.options?.maxTokens || this.config.maxTokens;
      const context = request.context || {};

      const includeDefaultPrompt = !context.skipDefaultSystemPrompt;
      const defaultSystemPrompt = includeDefaultPrompt
        ? this.buildSystemPrompt(request.type, context)
        : '';

      const systemPrompt = context.customSystemPrompt
        ? (includeDefaultPrompt && defaultSystemPrompt
          ? `${defaultSystemPrompt}

${context.customSystemPrompt}`.trim()
          : context.customSystemPrompt)
        : defaultSystemPrompt;

      const responseFormatPreference = context.responseFormat;
      const needsJsonMode = responseFormatPreference === 'json'
        ? true
        : responseFormatPreference === 'text'
          ? false
          : ['statblock', 'npc', 'magicitem', 'encounter'].includes(request.type);

      const baseMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt }
      ];

      let messages = baseMessages;

      if (Array.isArray(context.additionalMessages) && context.additionalMessages.length > 0) {
        const extraMessages = context.additionalMessages
          .map(msg => ({ role: msg.role, content: msg.content }))
          .filter(msg => msg.role && msg.content);

        if (extraMessages.length > 0) {
          messages = [
            { role: 'system', content: systemPrompt },
            ...extraMessages,
            { role: 'user', content: request.prompt }
          ];
        }
      }

      const requestOptions = {
        model,
        messages,
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

      const rawContent = response.choices[0]?.message?.content || (needsJsonMode ? '{}' : '');
      let parsedContent;

      if (needsJsonMode) {
        try {
          parsedContent = JSON.parse(rawContent);
        } catch (parseError) {
          console.warn(`JSON parsing failed for ${request.type}, falling back to raw content:`, parseError.message);
          parsedContent = {
            content: rawContent,
            type: request.type,
            parseFailed: true
          };
        }
      } else {
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
          timestamp: new Date()
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

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

  buildSystemPrompt(type, context) {
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

    let prompt = basePrompt + (typePrompts[type] || typePrompts.custom);

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

  calculateCost(model, tokens) {
    // OpenAI pricing (as of 2024)
    const pricing = {
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
  static instance;
  config;
  providers = new Map();
  usageStats;

  constructor() {
    this.config = AIServiceConfig.getInstance();
    this.initializeProviders();
    this.initializeUsageStats();
  }

  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  initializeProviders() {
    const openaiConfig = this.config.getProvider('openai');
    if (openaiConfig) {
      this.providers.set('openai', new OpenAIProvider(openaiConfig));
    }
  }

  initializeUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successRate: 0,
      averageResponseTime: 0,
      dailyUsage: []
    };
  }

  async generateContent(request) {
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

    // Select provider
    const providerName = request.options?.provider || 'openai';
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

    // Generate content
    const response = await provider.generateContent(request);
    
    // Update usage stats
    this.updateUsageStats(response);
    
    return response;
  }

  validateRequest(request) {
    const errors = [];

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

  updateUsageStats(response) {
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
  }

  getUsageStats() {
    return { ...this.usageStats };
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  // Convenience methods for specific content types
  async generateStatBlock(prompt, context, options) {
    return this.generateContent({
      type: 'statblock',
      prompt,
      context,
      options
    });
  }

  async generateNPC(prompt, context, options) {
    return this.generateContent({
      type: 'npc',
      prompt,
      context,
      options
    });
  }

  async generateMagicItem(prompt, context, options) {
    return this.generateContent({
      type: 'magicitem',
      prompt,
      context,
      options
    });
  }

  async generateEncounter(prompt, context, options) {
    return this.generateContent({
      type: 'encounter',
      prompt,
      context,
      options
    });
  }

  async generateDescription(prompt, context, options) {
    return this.generateContent({
      type: 'description',
      prompt,
      context,
      options
    });
  }

  async generateRandomTable(prompt, context, options) {
    return this.generateContent({
      type: 'custom',
      prompt,
      context,
      options
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AIService;

// Singleton instance for easy import
export const aiService = AIService.getInstance();
