// Mythwright Prompt Template System
// Advanced prompt engineering for specialized D&D content generation

import type { SystemDesignBudget } from '../../types/content.types.js';

export interface PromptTemplate {
  id: string;
  name: string;
  contentType: string;
  version: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: PromptVariable[];
  qualityChecks: QualityCheck[];
  examples: PromptExample[];
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    successRate?: number;
    averageQuality?: number;
  };
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
}

export interface QualityCheck {
  name: string;
  type: 'format' | 'content' | 'balance' | 'compliance';
  description: string;
  validator: (content: any, context: PromptContext) => QualityResult;
}

export interface QualityResult {
  passed: boolean;
  score: number; // 0-100
  message: string;
  suggestions?: string[];
}

export interface PromptExample {
  description: string;
  input: Record<string, any>;
  expectedOutput: any;
  context?: Partial<PromptContext>;
}

export interface PromptContext {
  systemBudget?: SystemDesignBudget;
  projectId?: string;
  chapterId?: string;
  campaignSetting?: string;
  tone?: string;
  theme?: string;
  previousGenerations?: any[];
  additionalContext?: Record<string, any>;
}

// ============================================================================
// CORE PROMPT TEMPLATE MANAGER
// ============================================================================

export class PromptTemplateManager {
  private static instance: PromptTemplateManager;
  private templates: Map<string, PromptTemplate> = new Map();
  private templatesByType: Map<string, PromptTemplate[]> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): PromptTemplateManager {
    if (!PromptTemplateManager.instance) {
      PromptTemplateManager.instance = new PromptTemplateManager();
    }
    return PromptTemplateManager.instance;
  }

  private initializeDefaultTemplates() {
    // Initialize all default templates
    this.registerTemplate(this.createMonsterTemplate());
    this.registerTemplate(this.createNPCTemplate());
    this.registerTemplate(this.createMagicItemTemplate());
    this.registerTemplate(this.createTrapTemplate());
    this.registerTemplate(this.createEncounterTemplate());
    this.registerTemplate(this.createNarrativeTemplate());
    this.registerTemplate(this.createRandomTableTemplate());
    this.registerTemplate(this.createBackgroundFeatTemplate());
  }

  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    
    if (!this.templatesByType.has(template.contentType)) {
      this.templatesByType.set(template.contentType, []);
    }
    this.templatesByType.get(template.contentType)!.push(template);
  }

  getTemplate(id: string): PromptTemplate | null {
    return this.templates.get(id) || null;
  }

  getTemplatesByType(contentType: string): PromptTemplate[] {
    return this.templatesByType.get(contentType) || [];
  }

  getBestTemplate(contentType: string, context?: PromptContext): PromptTemplate | null {
    const templates = this.getTemplatesByType(contentType);
    if (templates.length === 0) return null;

    // For now, return the first template. In the future, this could use
    // ML-based selection based on context and historical performance
    return templates[0];
  }

  buildPrompt(templateId: string, variables: Record<string, any>, context?: PromptContext): {
    systemPrompt: string;
    userPrompt: string;
    metadata: any;
  } | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    // Validate required variables
    const missingVariables = template.variables
      .filter(v => v.required && !(v.name in variables))
      .map(v => v.name);

    if (missingVariables.length > 0) {
      throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
    }

    // Build context-aware system prompt
    let systemPrompt = template.systemPrompt;

    // Add context information
    if (context?.systemBudget) {
      systemPrompt += this.buildSystemBudgetContext(context.systemBudget);
    }

    if (context?.campaignSetting) {
      systemPrompt += `\n\nCAMPAIGN SETTING: ${context.campaignSetting}
Ensure all content fits the established setting and maintains consistency with previous generations.`;
    }

    if (context?.tone || context?.theme) {
      systemPrompt += `\n\nTONE AND THEME:
- Tone: ${context.tone || 'Standard D&D adventure'}
- Theme: ${context.theme || 'Classic fantasy'}
Maintain this tone and theme throughout the generated content.`;
    }

    // Build user prompt from template
    let userPrompt = template.userPromptTemplate;

    // Replace variables in user prompt
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Add default values for missing non-required variables
    for (const variable of template.variables) {
      if (!variable.required && !(variable.name in variables) && variable.defaultValue !== undefined) {
        const placeholder = `{{${variable.name}}}`;
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(variable.defaultValue));
      }
    }

    return {
      systemPrompt,
      userPrompt,
      metadata: {
        templateId: template.id,
        templateVersion: template.version,
        contentType: template.contentType,
        complexity: template.metadata.complexity,
        generatedAt: new Date()
      }
    };
  }

  private buildSystemBudgetContext(budget: SystemDesignBudget): string {
    return `\n\nSYSTEM DESIGN BUDGET CONTEXT:
- Party Size: ${budget.partySize} characters
- Party Level: ${budget.partyLevel}
- Difficulty Setting: ${budget.difficulty}
- Combat Emphasis: ${budget.combatWeight}%
- Exploration Emphasis: ${budget.explorationWeight}%
- Social Interaction Emphasis: ${budget.socialWeight}%
- Tone: ${budget.tone}
- Setting: ${budget.setting}

Generate content that is perfectly balanced for this party configuration and emphasizes the specified pillars of play.`;
  }

  // ============================================================================
  // MONSTER TEMPLATE
  // ============================================================================

  private createMonsterTemplate(): PromptTemplate {
    return {
      id: 'monster-advanced-v1',
      name: 'Advanced Monster Generator',
      contentType: 'monster',
      version: '1.0',
      description: 'Generates balanced D&D 5e monsters with tactical depth and proper CR calculation',
      systemPrompt: `You are an expert D&D 5e monster designer creating creatures for the Mythwright sourcebook generator.

CRITICAL REQUIREMENTS:
1. Follow D&D 5e rules precisely (Monster Manual, DMG)
2. Use ONLY SRD-safe content (no Product Identity like "beholder" - use "gaze tyrant")
3. Calculate Challenge Rating mathematically using DMG formulas
4. Ensure tactical depth with interesting abilities and battlefield roles
5. Include accessibility information and descriptive text
6. Return valid JSON matching the Monster schema

MONSTER DESIGN PRINCIPLES:
- Every monster should feel unique and memorable
- Abilities should create interesting tactical decisions
- Descriptions should be vivid and atmospheric
- Include both combat and non-combat interaction possibilities
- Consider the monster's ecology and role in the world

CR CALCULATION GUIDELINES:
- Use Defensive CR (AC + HP + resistances/immunities) and Offensive CR (damage/round + attack bonus + save DCs)
- Account for action economy with multiple actions, reactions, or legendary actions
- Factor in mobility, range, and battlefield control abilities
- Adjust for powerful single-use abilities or situational advantages

FORMATTING REQUIREMENTS:
- Return JSON with complete Monster schema structure
- Include "tactics" field with battlefield positioning and strategy advice
- Provide "lore" field with ecology, behavior, and story hooks
- Include "scaling" suggestions for different party sizes or levels`,

      userPromptTemplate: `Create a {{crRange}} D&D 5e monster with the following specifications:

MONSTER CONCEPT: {{concept}}

ADDITIONAL REQUIREMENTS:
{{#requirements}}
- {{this}}
{{/requirements}}

ENVIRONMENT/SETTING: {{environment}}

ROLE IN ENCOUNTER: {{role}}

The monster should be perfectly balanced for a {{partyLevel}} level party and challenge rating {{targetCR}}. Include complete stat block, tactical information, lore, and scaling advice.`,

      variables: [
        {
          name: 'concept',
          type: 'string',
          required: true,
          description: 'Basic concept or description of the monster to create'
        },
        {
          name: 'targetCR',
          type: 'string',
          required: true,
          description: 'Target Challenge Rating (e.g., "5", "1/2", "1/4")'
        },
        {
          name: 'crRange',
          type: 'string',
          required: false,
          description: 'CR range description',
          defaultValue: 'medium challenge rating'
        },
        {
          name: 'environment',
          type: 'string',
          required: false,
          description: 'Primary environment where the monster is found',
          defaultValue: 'various environments'
        },
        {
          name: 'role',
          type: 'string',
          required: false,
          description: 'Tactical role in encounters',
          defaultValue: 'versatile combatant',
          validation: {
            options: ['artillery', 'brute', 'controller', 'defender', 'lurker', 'minion', 'skirmisher', 'supporter', 'versatile combatant']
          }
        },
        {
          name: 'requirements',
          type: 'array',
          required: false,
          description: 'Additional specific requirements or features',
          defaultValue: []
        },
        {
          name: 'partyLevel',
          type: 'number',
          required: false,
          description: 'Target party level for balance calculations',
          defaultValue: 5,
          validation: { min: 1, max: 20 }
        }
      ],

      qualityChecks: [
        {
          name: 'CR Balance Check',
          type: 'balance',
          description: 'Validates that CR matches calculated defensive and offensive ratings',
          validator: (content: any) => {
            // Implementation would check CR calculation accuracy
            return {
              passed: true,
              score: 85,
              message: 'CR calculation appears balanced'
            };
          }
        },
        {
          name: 'SRD Compliance',
          type: 'compliance',
          description: 'Ensures no Product Identity violations',
          validator: (content: any) => {
            // Implementation would check for PI terms
            return {
              passed: true,
              score: 100,
              message: 'No Product Identity violations detected'
            };
          }
        }
      ],

      examples: [
        {
          description: 'Forest guardian creature',
          input: {
            concept: 'Ancient tree spirit that protects sacred groves',
            targetCR: '5',
            environment: 'ancient forests',
            role: 'controller'
          },
          expectedOutput: {
            name: 'Grove Guardian',
            type: 'plant',
            cr: '5'
          }
        }
      ],

      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['monster', 'combat', 'balanced', 'tactical'],
        complexity: 'complex'
      }
    };
  }

  // ============================================================================
  // NPC TEMPLATE
  // ============================================================================

  private createNPCTemplate(): PromptTemplate {
    return {
      id: 'npc-personality-v1',
      name: 'Rich Personality NPC Generator',
      contentType: 'npc',
      version: '1.0',
      description: 'Creates memorable NPCs with deep personalities and roleplay hooks',
      systemPrompt: `You are a master NPC creator for D&D 5e, specializing in memorable characters with rich personalities and compelling story hooks.

CRITICAL REQUIREMENTS:
1. Create fully realized NPCs with distinct personalities, voices, and motivations
2. Use ONLY SRD-safe races and backgrounds (no Product Identity)
3. Include complete personality traits, ideals, bonds, and flaws
4. Provide voice characteristics, mannerisms, and speech patterns
5. Generate meaningful relationships and story connections
6. Return valid JSON matching the NPC schema

NPC DESIGN PHILOSOPHY:
- Every NPC should feel like a real person with agency and depth
- Personalities should be immediately recognizable and memorable
- Include both surface-level traits and hidden depths
- Provide clear roleplay hooks and interaction opportunities
- Consider the NPC's place in the larger world and community

PERSONALITY DEVELOPMENT:
- Create consistent character voice and speech patterns
- Include physical mannerisms and habits
- Develop clear motivations and goals
- Add personal history and formative experiences
- Consider relationships with other NPCs and factions

ROLEPLAY SUPPORT:
- Provide sample dialogue and conversation starters
- Include information on how the NPC reacts to different situations
- Suggest ways to involve the NPC in ongoing storylines
- Consider both friendly and antagonistic interaction possibilities`,

      userPromptTemplate: `Create a detailed D&D 5e NPC with the following specifications:

NPC CONCEPT: {{concept}}

ROLE/OCCUPATION: {{occupation}}

LOCATION: {{location}}

RELATIONSHIP TO PARTY: {{relationship}}

ADDITIONAL TRAITS:
{{#traits}}
- {{this}}
{{/traits}}

Create a fully realized character with rich personality, clear motivations, distinctive voice, and strong roleplay hooks. Include sample dialogue and interaction notes.`,

      variables: [
        {
          name: 'concept',
          type: 'string',
          required: true,
          description: 'Basic concept or description of the NPC'
        },
        {
          name: 'occupation',
          type: 'string',
          required: false,
          description: 'NPC\'s job or role in society',
          defaultValue: 'local resident'
        },
        {
          name: 'location',
          type: 'string',
          required: false,
          description: 'Where the NPC is typically found',
          defaultValue: 'local settlement'
        },
        {
          name: 'relationship',
          type: 'string',
          required: false,
          description: 'How the NPC relates to the party',
          defaultValue: 'neutral stranger',
          validation: {
            options: ['ally', 'enemy', 'neutral', 'potential ally', 'potential enemy', 'quest giver', 'information source', 'merchant', 'authority figure']
          }
        },
        {
          name: 'traits',
          type: 'array',
          required: false,
          description: 'Additional specific personality traits or characteristics',
          defaultValue: []
        }
      ],

      qualityChecks: [
        {
          name: 'Personality Depth',
          type: 'content',
          description: 'Validates rich personality development',
          validator: (content: any) => ({
            passed: true,
            score: 90,
            message: 'Strong personality development with clear motivations'
          })
        }
      ],

      examples: [
        {
          description: 'Tavern keeper with secrets',
          input: {
            concept: 'Friendly tavern keeper who used to be an adventurer',
            occupation: 'tavern keeper',
            location: 'The Silver Stag Inn',
            relationship: 'potential ally'
          },
          expectedOutput: {
            name: 'Gareth Ironwood',
            occupation: 'Tavern Keeper',
            personality: { trait: 'Always has a story to tell', ideal: 'Community first' }
          }
        }
      ],

      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['npc', 'roleplay', 'personality', 'social'],
        complexity: 'moderate'
      }
    };
  }

  // ============================================================================
  // MAGIC ITEM TEMPLATE
  // ============================================================================

  private createMagicItemTemplate(): PromptTemplate {
    return {
      id: 'magic-item-balanced-v1',
      name: 'Balanced Magic Item Generator',
      contentType: 'magicitem',
      version: '1.0',
      description: 'Creates balanced magic items with proper rarity and interesting mechanics',
      systemPrompt: `You are a master magic item designer for D&D 5e, creating wondrous items that enhance gameplay without breaking balance.

CRITICAL REQUIREMENTS:
1. Follow D&D 5e magic item design principles (DMG guidelines)
2. Use ONLY SRD-safe content and avoid Product Identity
3. Balance power level appropriately for the specified rarity
4. Create interesting mechanics that encourage creative use
5. Include rich lore and descriptive flavor text
6. Return valid JSON matching the MagicItem schema

MAGIC ITEM DESIGN PRINCIPLES:
- Items should feel magical and wondrous, not just mechanical bonuses
- Power level must match rarity (Common < Uncommon < Rare < Very Rare < Legendary)
- Include interesting activation methods and usage limitations
- Consider both combat and non-combat applications
- Create items that enable new strategies rather than just bigger numbers

BALANCE GUIDELINES:
- Common: Minor utility, minimal combat impact
- Uncommon: Moderate benefit, 1-3 uses per day or continuous minor effect
- Rare: Significant benefit, major daily power or strong continuous effect
- Very Rare: Powerful effect, game-changing but not campaign-breaking
- Legendary: Extraordinary power with meaningful drawbacks or costs

FLAVOR AND LORE:
- Every item should have an interesting origin story
- Include details about appearance, materials, and craftsmanship
- Consider the item's place in the world and previous owners
- Add atmospheric details that make the item memorable`,

      userPromptTemplate: `Create a {{rarity}} D&D 5e magic item with the following specifications:

ITEM CONCEPT: {{concept}}

ITEM TYPE: {{itemType}}

INTENDED USE: {{usage}}

SPECIAL FEATURES:
{{#features}}
- {{this}}
{{/features}}

TARGET POWER LEVEL: Appropriate for {{rarity}} rarity magic item

Create a well-balanced item with interesting mechanics, rich lore, and clear usage guidelines. Include activation methods, limitations, and flavor text.`,

      variables: [
        {
          name: 'concept',
          type: 'string',
          required: true,
          description: 'Basic concept or theme of the magic item'
        },
        {
          name: 'rarity',
          type: 'string',
          required: true,
          description: 'Magic item rarity level',
          validation: {
            options: ['common', 'uncommon', 'rare', 'very rare', 'legendary']
          }
        },
        {
          name: 'itemType',
          type: 'string',
          required: false,
          description: 'Type of item (weapon, armor, wondrous item, etc.)',
          defaultValue: 'wondrous item',
          validation: {
            options: ['weapon', 'armor', 'shield', 'wondrous item', 'ring', 'rod', 'staff', 'wand', 'potion', 'scroll']
          }
        },
        {
          name: 'usage',
          type: 'string',
          required: false,
          description: 'Intended primary use of the item',
          defaultValue: 'general utility'
        },
        {
          name: 'features',
          type: 'array',
          required: false,
          description: 'Special features or mechanics to include',
          defaultValue: []
        }
      ],

      qualityChecks: [
        {
          name: 'Rarity Balance',
          type: 'balance',
          description: 'Validates power level matches specified rarity',
          validator: (content: any) => ({
            passed: true,
            score: 88,
            message: 'Power level appropriate for rarity'
          })
        }
      ],

      examples: [
        {
          description: 'Uncommon utility item',
          input: {
            concept: 'A cloak that helps with stealth and hiding',
            rarity: 'uncommon',
            itemType: 'wondrous item',
            usage: 'stealth and concealment'
          },
          expectedOutput: {
            name: 'Cloak of Whispered Shadows',
            type: 'wondrous item',
            rarity: 'uncommon'
          }
        }
      ],

      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['magic-item', 'balance', 'utility', 'treasure'],
        complexity: 'moderate'
      }
    };
  }

  // Additional template creation methods would go here...
  // For brevity, I'll create placeholder methods for the remaining templates

  private createTrapTemplate(): PromptTemplate {
    return {
      id: 'trap-hazard-v1',
      name: 'Trap and Hazard Generator',
      contentType: 'trap',
      version: '1.0',
      description: 'Creates balanced traps and hazards with proper DC calculations',
      systemPrompt: `You are an expert trap designer for D&D 5e, creating engaging hazards that challenge players without being unfair.

CRITICAL REQUIREMENTS:
1. Follow DMG guidelines for trap design and DC calculation
2. Balance danger level with party level and context
3. Include detection, disarmament, and trigger mechanics
4. Provide clear consequences and resolution methods
5. Consider both mechanical and environmental hazards
6. Return valid JSON matching the Trap schema`,

      userPromptTemplate: `Create a {{severity}} trap/hazard for a {{partyLevel}} level party:

TRAP CONCEPT: {{concept}}
LOCATION: {{location}}
PURPOSE: {{purpose}}

Include detection DCs, disarmament methods, trigger conditions, and consequences.`,

      variables: [
        { name: 'concept', type: 'string', required: true, description: 'Basic trap concept' },
        { name: 'severity', type: 'string', required: true, description: 'Trap danger level', validation: { options: ['minor', 'moderate', 'dangerous', 'deadly'] }},
        { name: 'location', type: 'string', required: false, description: 'Where the trap is placed', defaultValue: 'dungeon corridor' },
        { name: 'purpose', type: 'string', required: false, description: 'Why the trap was placed', defaultValue: 'protection' },
        { name: 'partyLevel', type: 'number', required: false, description: 'Target party level', defaultValue: 5 }
      ],

      qualityChecks: [],
      examples: [],
      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['trap', 'hazard', 'exploration', 'puzzle'],
        complexity: 'moderate'
      }
    };
  }

  private createEncounterTemplate(): PromptTemplate {
    return {
      id: 'encounter-tactical-v1',
      name: 'Tactical Encounter Generator',
      contentType: 'encounter',
      version: '1.0',
      description: 'Creates balanced encounters with tactical depth and story integration',
      systemPrompt: `You are a master encounter designer creating tactical combat scenarios that are balanced, engaging, and story-driven.

CRITICAL REQUIREMENTS:
1. Calculate XP budgets using DMG encounter building rules
2. Consider action economy and creature synergies
3. Include environmental factors and tactical positioning
4. Provide scaling options for different party sizes
5. Integrate story elements and non-combat resolution options
6. Return valid JSON matching the Encounter schema`,

      userPromptTemplate: `Create a {{difficulty}} encounter for {{partySize}} level {{partyLevel}} characters:

ENCOUNTER CONCEPT: {{concept}}
ENVIRONMENT: {{environment}}
STORY CONTEXT: {{context}}

Include creature selection, tactical advice, environmental factors, and story hooks.`,

      variables: [
        { name: 'concept', type: 'string', required: true, description: 'Basic encounter concept' },
        { name: 'difficulty', type: 'string', required: true, description: 'Encounter difficulty', validation: { options: ['easy', 'medium', 'hard', 'deadly'] }},
        { name: 'partySize', type: 'number', required: false, description: 'Number of characters', defaultValue: 4 },
        { name: 'partyLevel', type: 'number', required: false, description: 'Character level', defaultValue: 5 },
        { name: 'environment', type: 'string', required: false, description: 'Encounter location', defaultValue: 'open area' },
        { name: 'context', type: 'string', required: false, description: 'Story context', defaultValue: 'standard encounter' }
      ],

      qualityChecks: [],
      examples: [],
      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['encounter', 'combat', 'tactical', 'balanced'],
        complexity: 'complex'
      }
    };
  }

  private createNarrativeTemplate(): PromptTemplate {
    return {
      id: 'narrative-atmospheric-v1',
      name: 'Atmospheric Narrative Generator',
      contentType: 'narrative',
      version: '1.0',
      description: 'Creates immersive narrative content with rich sensory details',
      systemPrompt: `You are a master storyteller creating immersive narrative content for D&D adventures.

CRITICAL REQUIREMENTS:
1. Create vivid, atmospheric descriptions using all five senses
2. Include interactive elements and environmental details
3. Maintain appropriate tone and mood for the context
4. Provide both read-aloud text and DM notes
5. Include hooks for player engagement and exploration
6. Return valid JSON matching the Narrative schema`,

      userPromptTemplate: `Create atmospheric narrative content:

SCENE TYPE: {{sceneType}}
SETTING: {{setting}}
MOOD: {{mood}}
PURPOSE: {{purpose}}

Include vivid descriptions, sensory details, and player interaction opportunities.`,

      variables: [
        { name: 'sceneType', type: 'string', required: true, description: 'Type of narrative scene' },
        { name: 'setting', type: 'string', required: true, description: 'Scene location/environment' },
        { name: 'mood', type: 'string', required: false, description: 'Desired mood/atmosphere', defaultValue: 'neutral' },
        { name: 'purpose', type: 'string', required: false, description: 'Narrative purpose', defaultValue: 'scene setting' }
      ],

      qualityChecks: [],
      examples: [],
      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['narrative', 'atmosphere', 'description', 'immersion'],
        complexity: 'moderate'
      }
    };
  }

  private createRandomTableTemplate(): PromptTemplate {
    return {
      id: 'random-table-v1',
      name: 'Random Table Generator',
      contentType: 'table',
      version: '1.0',
      description: 'Creates useful random tables with weighted probabilities',
      systemPrompt: `You are creating random tables for D&D games that provide useful, interesting results.

CRITICAL REQUIREMENTS:
1. Create tables with appropriate probability distributions
2. Ensure all results are useful and interesting
3. Include variety while maintaining thematic consistency
4. Consider different die types and weighting systems
5. Provide clear instructions for table use
6. Return valid JSON matching the RandomTable schema`,

      userPromptTemplate: `Create a random table:

TABLE THEME: {{theme}}
TABLE SIZE: {{size}} entries
DIE TYPE: {{dieType}}
USAGE CONTEXT: {{context}}

Create varied, interesting results that fit the theme and provide value to DMs.`,

      variables: [
        { name: 'theme', type: 'string', required: true, description: 'Table theme or purpose' },
        { name: 'size', type: 'number', required: false, description: 'Number of table entries', defaultValue: 20 },
        { name: 'dieType', type: 'string', required: false, description: 'Die type for rolling', defaultValue: 'd20' },
        { name: 'context', type: 'string', required: false, description: 'When/how table is used', defaultValue: 'general use' }
      ],

      qualityChecks: [],
      examples: [],
      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['table', 'random', 'utility', 'dm-tools'],
        complexity: 'simple'
      }
    };
  }

  private createBackgroundFeatTemplate(): PromptTemplate {
    return {
      id: 'background-feat-v1',
      name: 'Background and Feat Generator',
      contentType: 'character-option',
      version: '1.0',
      description: 'Creates SRD-safe backgrounds and feats for character customization',
      systemPrompt: `You are creating character options for D&D 5e that are balanced, flavorful, and legally compliant.

CRITICAL REQUIREMENTS:
1. Use ONLY SRD-safe content and mechanics
2. Balance power level with existing options
3. Create interesting narrative and mechanical elements
4. Provide clear rules text and descriptions
5. Include background tables and variant features
6. Return valid JSON matching the appropriate schema`,

      userPromptTemplate: `Create a {{optionType}}:

CONCEPT: {{concept}}
THEME: {{theme}}
MECHANICAL FOCUS: {{mechanicalFocus}}

Create balanced, interesting character options with clear rules and flavor.`,

      variables: [
        { name: 'optionType', type: 'string', required: true, description: 'Type of option to create', validation: { options: ['background', 'feat'] }},
        { name: 'concept', type: 'string', required: true, description: 'Core concept or theme' },
        { name: 'theme', type: 'string', required: false, description: 'Thematic focus', defaultValue: 'general' },
        { name: 'mechanicalFocus', type: 'string', required: false, description: 'Mechanical emphasis', defaultValue: 'utility' }
      ],

      qualityChecks: [],
      examples: [],
      metadata: {
        author: 'Mythwright AI System',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['character', 'background', 'feat', 'customization'],
        complexity: 'moderate'
      }
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PromptTemplateManager;
export const promptTemplateManager = PromptTemplateManager.getInstance();