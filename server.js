#!/usr/bin/env node

/*******************************************************************************
 * UNIFIED HOMEBREWERY SERVER - server.js
 * 
 * This file consolidates all backend/server-side logic into a single entry point.
 * Run with: node server.js
 * Access at: http://localhost:8000
 ******************************************************************************/

// ============================================================================
// IMPORT EXISTING HOMEBREWERY INFRASTRUCTURE
// ============================================================================

import { initializeModels } from './server/models/index.js';
import app from './server/app.js';
import config from './server/config.js';

// ============================================================================
// AI SERVICE ENHANCEMENT
// ============================================================================

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { nanoid } from 'nanoid';
import asyncHandler from 'express-async-handler';

// Load environment variables
dotenv.config({ path: join(process.cwd(), 'config', '.env') });

class AIService {
  static instance;
  
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  initializeProviders() {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiClient = new OpenAI({ apiKey: openaiKey });
      this.providers.set('openai', {
        client: openaiClient,
        models: {
          'gpt-4o-mini': { contextWindow: 128000, costPer1k: 0.00015 },
          'gpt-4o': { contextWindow: 128000, costPer1k: 0.005 },
          'gpt-3.5-turbo': { contextWindow: 16385, costPer1k: 0.0015 }
        },
        defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini'
      });
      console.log('✅ OpenAI provider initialized');
    }
  }

  async generateContent(request) {
    try {
      const provider = this.providers.get('openai');
      if (!provider) {
        throw new Error('OpenAI provider not available');
      }

      const model = request.model || provider.defaultModel;
      const needsJsonMode = ['statblock', 'npc', 'magicitem', 'encounter'].includes(request.type);
      
      const requestOptions = {
        model: model,
        messages: [
          { role: 'system', content: request.systemPrompt || 'You are a helpful D&D content generator.' },
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7
      };

      if (needsJsonMode) {
        requestOptions.response_format = { type: 'json_object' };
      }

      const response = await provider.client.chat.completions.create(requestOptions);
      
      return {
        success: true,
        content: response.choices[0].message.content,
        model: model,
        usage: response.usage
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ============================================================================
// CONTENT GENERATION ORCHESTRATOR
// ============================================================================

class ContentGenerationOrchestrator {
  constructor() {
    this.aiService = AIService.getInstance();
  }

  async generateCampaign(parameters) {
    console.log('🎲 Starting campaign generation:', parameters.title);
    
    try {
      // Calculate XP budget
      const xpBudget = this.calculateXPBudget(parameters);
      
      // Generate campaign content
      const systemPrompt = this.buildSystemPrompt(parameters, xpBudget);
      const mainPrompt = this.buildCampaignPrompt(parameters, xpBudget);
      
      console.log('📖 Generating campaign content...');
      
      const result = await this.aiService.generateContent({
        type: 'campaign',
        systemPrompt: systemPrompt,
        prompt: mainPrompt,
        maxTokens: 4000,
        temperature: 0.8
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✨ Campaign generation complete');
      
      return {
        success: true,
        content: result.content,
        metadata: {
          xpBudget: xpBudget,
          model: result.model,
          usage: result.usage,
          generationTimestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Campaign generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateXPBudget(parameters) {
    const partyLevel = this.determinePartyLevel(parameters.level);
    const baseXP = this.getBaseXPForLevel(partyLevel);
    const totalXPBudget = baseXP * parameters.partySize * parameters.sessionCount;
    
    return {
      partySize: parameters.partySize,
      partyLevel: partyLevel,
      totalXPBudget: totalXPBudget,
      xpPerSession: totalXPBudget / parameters.sessionCount,
      combatBudget: Math.floor(totalXPBudget * 0.6),
      explorationBudget: Math.floor(totalXPBudget * 0.3),
      socialBudget: Math.floor(totalXPBudget * 0.1)
    };
  }

  determinePartyLevel(levelCategory) {
    const levelMap = { 'low': 3, 'mid': 8, 'high': 14, 'epic': 18 };
    return levelMap[levelCategory] || 3;
  }

  getBaseXPForLevel(level) {
    const xpTable = [0, 300, 600, 900, 1200, 1800, 2300, 2900, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500];
    return xpTable[Math.min(level, 20)] || 1000;
  }

  buildSystemPrompt(parameters, xpBudget) {
    return `You are an expert D&D 5e adventure designer creating professional campaign content for Homebrewery.

WRITING STYLE REQUIREMENTS:
- Use engaging second-person perspective for DM instructions
- Create vivid, immersive descriptions with rich sensory details
- Maintain professional tone while being accessible to new DMs
- Structure content with clear headers and logical progression
- Include tactical advice and scaling suggestions

XP BUDGET CONSTRAINTS:
- Total XP Budget: ${xpBudget.totalXPBudget}
- Combat Budget: ${xpBudget.combatBudget} XP
- Exploration Budget: ${xpBudget.explorationBudget} XP
- Social Budget: ${xpBudget.socialBudget} XP
- Party Level: ${xpBudget.partyLevel}

Generate content that follows official D&D 5e adventure formatting and includes proper Homebrewery markdown syntax.`;
  }

  buildCampaignPrompt(parameters, xpBudget) {
    return `Create a complete ${parameters.title} adventure with the following specifications:

**Campaign Details:**
- Title: ${parameters.title}
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Complexity: ${parameters.complexity}
- Sessions: ${parameters.sessionCount}
- Party Size: ${parameters.partySize}

**Required Structure:**
1. **Cover Page** - Use {{frontCover}} format with title, level range, session count
2. **Table of Contents** - Use {{wide,toc}} format
3. **Main Content** - ${parameters.sessionCount} chapter(s) with encounters, exploration, and social content
4. **Appendices** - Random tables for encounters, complications, and treasures

**Content Requirements:**
- Stay within XP budget of ${xpBudget.totalXPBudget} total XP
- Include ${Math.ceil(xpBudget.combatBudget / 1000)} combat encounters
- Include ${Math.ceil(xpBudget.explorationBudget / 500)} exploration challenges  
- Include ${Math.ceil(xpBudget.socialBudget / 250)} social interactions
- Use proper Homebrewery markdown formatting
- Include DM guidance and scaling advice

Format the output as complete Homebrewery markdown ready for the editor.`;
  }
}

// ============================================================================
// ENHANCED HOMEBREWERY APP WITH AI CAMPAIGN GENERATION
// ============================================================================

// Add enhanced API route for campaign generation to existing app
app.post('/api/mythwright/generate', asyncHandler(async (req, res) => {
  console.log('📥 Received campaign generation request');
  
  try {
    const orchestrator = new ContentGenerationOrchestrator();
    const result = await orchestrator.generateCampaign(req.body);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // Generate unique IDs for the brew
    const editId = nanoid(12);
    const shareId = nanoid(12);

    res.json({
      success: true,
      editId: editId,
      shareId: shareId,
      title: req.body.title || 'AI Generated Campaign',
      url: `/edit/${editId}`,
      homebreweryText: result.content,
      metadata: result.metadata,
      note: "Campaign generated successfully!"
    });

  } catch (error) {
    console.error('Campaign generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Campaign generation failed: ' + error.message
    });
  }
}));

// ============================================================================
// SERVER STARTUP USING EXISTING HOMEBREWERY INFRASTRUCTURE
// ============================================================================

initializeModels(config).then(()=>{
	// Ensure that we have successfully connected to the database before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;
	
	// Initialize AI service
	const aiService = AIService.getInstance();
	if (!aiService.providers.get('openai')) {
		console.log('⚠️  OpenAI API key not found - AI features will be limited');
	} else {
		console.log('🎲 Mythwright AI campaign generation ready!');
	}
	
	app.listen(PORT, ()=>{
		const reset = '\x1b[0m'; // Reset to default style
		const bright = '\x1b[1m'; // Bright (bold) style
		const cyan = '\x1b[36m'; // Cyan color
		const underline = '\x1b[4m'; // Underlined style

		console.log(`\n\t🚀 Homebrewery Unified Server started at: ${new Date().toLocaleString()}`);
		console.log(`\t📍 Server running on port: ${PORT}`);
		console.log(`\t${bright + cyan}Main page: ${reset}${underline + bright + cyan}http://localhost:${PORT}${reset}`);
		console.log(`\t${bright + cyan}New AI Campaign: ${reset}${underline + bright + cyan}http://localhost:${PORT}/new${reset}`);
		console.log(`\t🔧 Health check: http://localhost:${PORT}/api/health\n\n`);
	});
}).catch((error) => {
	console.error('Failed to initialize database and models:', error);
	process.exit(1);
});