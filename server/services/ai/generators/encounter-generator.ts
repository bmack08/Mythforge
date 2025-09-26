// Mythwright Encounter Generator - Specialized D&D 5e Encounter Balancing with XP Budget Math
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { Encounter, SystemDesignBudget } from '../../../types/content.types.js';
import { EncounterSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// ENCOUNTER GENERATION TYPES
// ============================================================================

export interface EncounterGenerationRequest {
  // Basic Requirements
  name?: string;
  encounterType: EncounterType;
  difficulty: EncounterDifficulty;
  
  // Party Configuration
  partyLevel: number;
  partySize: number;
  partyComposition?: PartyComposition;
  
  // Encounter Parameters
  primaryObjective: EncounterObjective;
  secondaryObjectives?: EncounterObjective[];
  terrain: TerrainType;
  environment: EnvironmentType;
  
  // Monster Configuration
  monsterTypes?: MonsterType[];
  excludeMonsters?: string[];
  minions?: boolean;
  elites?: boolean;
  boss?: boolean;
  
  // Tactical Elements
  tacticalComplexity: TacticalComplexity;
  hazards?: boolean;
  cover?: CoverType;
  elevation?: boolean;
  specialFeatures?: string[];
  
  // Balance Constraints
  xpBudget?: number;
  crRange?: CRRange;
  maxMonsters?: number;
  minMonsters?: number;
  
  // Customization
  theme?: EncounterTheme;
  narrative?: string;
  restrictions?: string[];
  mustInclude?: string[];
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type EncounterType = 
  | 'combat' | 'exploration' | 'social' | 'puzzle' | 'stealth' | 'chase' | 'mixed';

export type EncounterDifficulty = 
  | 'easy' | 'medium' | 'hard' | 'deadly';

export type EncounterObjective = 
  | 'eliminate_enemies' | 'protect_target' | 'escape' | 'retrieve_item'
  | 'hold_position' | 'reach_destination' | 'solve_puzzle' | 'negotiate'
  | 'gather_information' | 'disable_mechanism' | 'survive_duration';

export type TerrainType = 
  | 'open' | 'forest' | 'urban' | 'dungeon' | 'cave' | 'swamp' | 'desert'
  | 'mountain' | 'coastal' | 'underground' | 'aerial' | 'aquatic' | 'planar';

export type EnvironmentType = 
  | 'indoor' | 'outdoor' | 'underground' | 'aquatic' | 'aerial' | 'planar'
  | 'magical' | 'urban' | 'wilderness' | 'dungeon' | 'structure';

export type MonsterType = 
  | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' 
  | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' 
  | 'monstrosity' | 'ooze' | 'plant' | 'undead';

export type TacticalComplexity = 
  | 'simple' | 'moderate' | 'complex' | 'advanced';

export type CoverType = 
  | 'none' | 'partial' | 'three_quarters' | 'full' | 'mixed';

export type EncounterTheme = 
  | 'ambush' | 'siege' | 'dungeon_crawl' | 'wilderness' | 'urban_chase'
  | 'magical_anomaly' | 'ancient_ruins' | 'elemental_chaos' | 'undead_uprising'
  | 'cult_ritual' | 'dragon_lair' | 'planar_incursion' | 'political_intrigue';

export interface CRRange {
  min: number;
  max: number;
}

export interface PartyComposition {
  tanks: number;
  damage: number;
  support: number;
  utility: number;
}

export interface EncounterGenerationResult {
  encounter: Encounter;
  xpAnalysis: XPAnalysis;
  tacticalAnalysis: TacticalAnalysis;
  balanceReport: BalanceReport;
  runningGuide: RunningGuide;
  variants: EncounterVariant[];
  scalingOptions: ScalingOptions;
}

export interface XPAnalysis {
  totalXP: number;
  adjustedXP: number;
  budgetXP: number;
  budgetUsed: number; // percentage
  xpPerMonster: XPBreakdown[];
  difficultyThresholds: DifficultyThresholds;
  multiplierApplied: number;
  accurateBalance: boolean;
}

export interface XPBreakdown {
  monster: string;
  cr: number;
  baseXP: number;
  quantity: number;
  totalXP: number;
}

export interface DifficultyThresholds {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}

export interface TacticalAnalysis {
  actionEconomy: ActionEconomyAnalysis;
  positioning: PositioningAnalysis;
  resourceDrain: ResourceDrainAnalysis;
  counterplay: CounterplayOptions;
  riskFactors: RiskFactor[];
}

export interface ActionEconomyAnalysis {
  partyActions: number;
  monsterActions: number;
  actionRatio: number;
  recommendedBalance: string;
  imbalanceWarnings: string[];
}

export interface PositioningAnalysis {
  mapSize: string;
  chokepoints: string[];
  advantageousPositions: string[];
  movementConsiderations: string[];
  lineOfSightFactors: string[];
}

export interface ResourceDrainAnalysis {
  expectedSpellSlots: SpellSlotDrain;
  expectedHealingNeeded: number;
  expectedAbilityUses: number;
  restRecommendation: 'none' | 'short' | 'long';
  attritionFactor: number;
}

export interface SpellSlotDrain {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  total: number;
}

export interface CounterplayOptions {
  primaryCounters: string[];
  alternativeApproaches: string[];
  escapeOptions: string[];
  negotiationPossible: boolean;
  environmentalSolutions: string[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface BalanceReport {
  overallBalance: 'underpowered' | 'balanced' | 'overpowered';
  balanceFactors: BalanceFactor[];
  recommendations: string[];
  warnings: string[];
  confidenceScore: number; // 0-100
}

export interface BalanceFactor {
  factor: string;
  impact: number; // -3 to +3
  description: string;
}

export interface RunningGuide {
  setupInstructions: string[];
  initiativeOrder: InitiativeGuidance[];
  roundByRound: RoundGuidance[];
  commonQuestions: EncounterFAQ[];
  troubleshooting: string[];
}

export interface InitiativeGuidance {
  creature: string;
  quantity: number;
  tactics: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RoundGuidance {
  round: number;
  focus: string;
  expectedEvents: string[];
  dmNotes: string[];
}

export interface EncounterFAQ {
  question: string;
  answer: string;
  reference?: string;
}

export interface EncounterVariant {
  name: string;
  difficultyChange: number;
  modifications: string[];
  useCase: string;
  xpAdjustment: number;
}

export interface ScalingOptions {
  easierVersion: ScalingOption;
  harderVersion: ScalingOption;
  largerParty: ScalingOption;
  smallerParty: ScalingOption;
}

export interface ScalingOption {
  description: string;
  modifications: string[];
  xpChange: number;
  newDifficulty: EncounterDifficulty;
}

// ============================================================================
// XP BUDGET CONSTANTS (Based on DMG)
// ============================================================================

const XP_THRESHOLDS_BY_LEVEL = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
};

const CR_TO_XP = {
  0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
  6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
  11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
  21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
  26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
};

const ENCOUNTER_MULTIPLIERS = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2,
  5: 2.5,
  6: 2.5,
  7: 3,
  8: 3,
  9: 3.5,
  10: 3.5,
  11: 4,
  12: 4,
  13: 4.5,
  14: 4.5,
  15: 5
};

// ============================================================================
// ENCOUNTER GENERATOR CLASS
// ============================================================================

export class EncounterGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateEncounter(
    request: EncounterGenerationRequest,
    aiService: any // AIService type
  ): Promise<EncounterGenerationResult> {
    
    // Step 1: Calculate XP budget
    const xpBudget = this.calculateXPBudget(request);
    
    // Step 2: Build the AI prompt
    const aiPrompt = this.buildEncounterPrompt(request, xpBudget);
    
    // Step 3: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'encounter',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          encounterType: request.encounterType,
          difficulty: request.difficulty,
          partyLevel: request.partyLevel,
          partySize: request.partySize,
          xpBudget,
          terrain: request.terrain
        }
      },
      options: {
        temperature: 0.7, // Balanced creativity for encounters
        maxTokens: 2500 // Encounters can be very detailed
      }
    };
    
    // Step 4: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Encounter generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 5: Validate and parse the encounter
    const encounter = this.validateAndParseEncounter(aiResponse.content);
    
    // Step 6: Perform XP analysis
    const xpAnalysis = this.performXPAnalysis(encounter, request, xpBudget);
    
    // Step 7: Analyze tactical elements
    const tacticalAnalysis = this.analyzeTacticalElements(encounter, request);
    
    // Step 8: Generate balance report
    const balanceReport = this.generateBalanceReport(encounter, request, xpAnalysis);
    
    // Step 9: Create running guide
    const runningGuide = this.createRunningGuide(encounter, request);
    
    // Step 10: Generate variants
    const variants = this.generateVariants(encounter, request);
    
    // Step 11: Create scaling options
    const scalingOptions = this.createScalingOptions(encounter, request, xpAnalysis);
    
    return {
      encounter,
      xpAnalysis,
      tacticalAnalysis,
      balanceReport,
      runningGuide,
      variants,
      scalingOptions
    };
  }
  
  // ============================================================================
  // XP BUDGET CALCULATION
  // ============================================================================
  
  private static calculateXPBudget(request: EncounterGenerationRequest): number {
    if (request.xpBudget) {
      return request.xpBudget;
    }
    
    const thresholds = XP_THRESHOLDS_BY_LEVEL[request.partyLevel] || XP_THRESHOLDS_BY_LEVEL[1];
    const baseXP = thresholds[request.difficulty];
    
    // Multiply by party size
    return baseXP * request.partySize;
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildEncounterPrompt(
    request: EncounterGenerationRequest, 
    xpBudget: number
  ): string {
    const thresholds = XP_THRESHOLDS_BY_LEVEL[request.partyLevel] || XP_THRESHOLDS_BY_LEVEL[1];
    
    let prompt = `Create a D&D 5e encounter with precise XP budget balance:

CORE REQUIREMENTS:
- Encounter Type: ${request.encounterType}
- Difficulty: ${request.difficulty}
- XP Budget: ${xpBudget} XP`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    // Add party information
    prompt += `\n\nPARTY CONFIGURATION:`;
    prompt += `\n- Party Level: ${request.partyLevel}`;
    prompt += `\n- Party Size: ${request.partySize}`;
    prompt += `\n- Primary Objective: ${request.primaryObjective}`;
    
    if (request.secondaryObjectives && request.secondaryObjectives.length > 0) {
      prompt += `\n- Secondary Objectives: ${request.secondaryObjectives.join(', ')}`;
    }
    
    if (request.partyComposition) {
      prompt += `\n- Party Composition: ${request.partyComposition.tanks} tanks, ${request.partyComposition.damage} damage, ${request.partyComposition.support} support, ${request.partyComposition.utility} utility`;
    }
    
    // Add environment information
    prompt += `\n\nENVIRONMENT:`;
    prompt += `\n- Terrain: ${request.terrain}`;
    prompt += `\n- Environment Type: ${request.environment}`;
    prompt += `\n- Tactical Complexity: ${request.tacticalComplexity}`;
    
    if (request.cover) {
      prompt += `\n- Cover Available: ${request.cover}`;
    }
    
    if (request.elevation) {
      prompt += `\n- Elevation Changes: Yes`;
    }
    
    if (request.hazards) {
      prompt += `\n- Environmental Hazards: Yes`;
    }
    
    // Add monster requirements
    if (request.monsterTypes || request.boss || request.minions || request.elites) {
      prompt += `\n\nMONSTER REQUIREMENTS:`;
      
      if (request.monsterTypes && request.monsterTypes.length > 0) {
        prompt += `\n- Preferred Types: ${request.monsterTypes.join(', ')}`;
      }
      
      if (request.boss) {
        prompt += `\n- Include Boss Monster: Yes`;
      }
      
      if (request.elites) {
        prompt += `\n- Include Elite Monsters: Yes`;
      }
      
      if (request.minions) {
        prompt += `\n- Include Minion Monsters: Yes`;
      }
      
      if (request.excludeMonsters && request.excludeMonsters.length > 0) {
        prompt += `\n- Exclude: ${request.excludeMonsters.join(', ')}`;
      }
      
      if (request.crRange) {
        prompt += `\n- CR Range: ${request.crRange.min} to ${request.crRange.max}`;
      }
      
      if (request.maxMonsters) {
        prompt += `\n- Maximum Monsters: ${request.maxMonsters}`;
      }
      
      if (request.minMonsters) {
        prompt += `\n- Minimum Monsters: ${request.minMonsters}`;
      }
    }
    
    // Add XP budget guidelines
    prompt += `\n\nXP BUDGET GUIDELINES:`;
    prompt += `\n- Target XP Budget: ${xpBudget}`;
    prompt += `\n- Difficulty Thresholds (per character):`;
    prompt += `\n  • Easy: ${thresholds.easy} XP`;
    prompt += `\n  • Medium: ${thresholds.medium} XP`;
    prompt += `\n  • Hard: ${thresholds.hard} XP`;
    prompt += `\n  • Deadly: ${thresholds.deadly} XP`;
    prompt += `\n- Party Total Thresholds:`;
    prompt += `\n  • Easy: ${thresholds.easy * request.partySize} XP`;
    prompt += `\n  • Medium: ${thresholds.medium * request.partySize} XP`;
    prompt += `\n  • Hard: ${thresholds.hard * request.partySize} XP`;
    prompt += `\n  • Deadly: ${thresholds.deadly * request.partySize} XP`;
    
    // Add encounter multiplier guidance
    prompt += `\n\nENCOUNTER MULTIPLIER GUIDANCE:`;
    prompt += `\n- 1 monster: x1 multiplier`;
    prompt += `\n- 2 monsters: x1.5 multiplier`;
    prompt += `\n- 3-6 monsters: x2-2.5 multiplier`;
    prompt += `\n- 7-10 monsters: x3-3.5 multiplier`;
    prompt += `\n- 11+ monsters: x4+ multiplier`;
    prompt += `\n- Formula: (Total Base XP × Multiplier) should equal target XP budget`;
    
    // Add theme and narrative
    if (request.theme) {
      prompt += `\n\nTHEME & NARRATIVE:`;
      prompt += `\n- Theme: ${request.theme}`;
    }
    
    if (request.narrative) {
      prompt += `\n- Narrative Context: ${request.narrative}`;
    }
    
    if (request.specialFeatures && request.specialFeatures.length > 0) {
      prompt += `\n- Special Features: ${request.specialFeatures.join(', ')}`;
    }
    
    // Add must-include requirements
    if (request.mustInclude && request.mustInclude.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustInclude.forEach(requirement => {
        prompt += `\n- ${requirement}`;
      });
    }
    
    // Add restrictions
    if (request.restrictions && request.restrictions.length > 0) {
      prompt += `\n\nRESTRICTIONS:`;
      request.restrictions.forEach(restriction => {
        prompt += `\n- ${restriction}`;
      });
    }
    
    // Add complexity-specific guidance
    prompt += this.getComplexityGuidance(request.tacticalComplexity, request.encounterType);
    
    prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e encounter building rules exactly
2. Ensure XP budget matches difficulty precisely using DMG guidelines
3. Include specific monster stat blocks or references
4. Provide detailed tactical map description
5. Balance action economy between party and monsters
6. Create engaging tactical challenges with counterplay options
7. Use only SRD-safe content (no Product Identity terms)
8. Include initiative order and round-by-round guidance
9. Consider resource management and attrition
10. Ensure encounter serves narrative purpose
11. Provide scaling options for different party sizes
12. Include environmental factors and positioning

Return a complete encounter in JSON format following the Encounter schema with all monsters, tactics, environment details, XP calculations, and running guidance.`;
    
    return prompt;
  }
  
  private static getComplexityGuidance(complexity: TacticalComplexity, type: EncounterType): string {
    let guidance = `\n\nTACTICAL COMPLEXITY GUIDANCE (${complexity.toUpperCase()}):`;
    
    switch (complexity) {
      case 'simple':
        guidance += `\n- Straightforward combat with minimal environmental factors
- Clear objectives and direct approaches
- Limited monster variety and simple tactics
- Easy-to-understand positioning`;
        break;
      case 'moderate':
        guidance += `\n- Some environmental factors and tactical options
- Multiple viable approaches to objectives
- Moderate monster variety with complementary abilities
- Interesting positioning and movement considerations`;
        break;
      case 'complex':
        guidance += `\n- Rich environmental interaction and multiple tactical layers
- Several objectives requiring different approaches
- Diverse monsters with synergistic abilities
- Complex positioning with elevation and cover`;
        break;
      case 'advanced':
        guidance += `\n- Highly interactive environment with dynamic elements
- Multi-stage objectives with evolving challenges
- Sophisticated monster coordination and tactics
- Advanced positioning with multiple battlefield layers`;
        break;
    }
    
    switch (type) {
      case 'combat':
        guidance += `\n- Focus on balanced action economy and tactical positioning
- Include variety in monster roles (tanks, damage, support)
- Consider resource attrition and healing requirements`;
        break;
      case 'exploration':
        guidance += `\n- Emphasize discovery and environmental interaction
- Include skill challenges and creative problem-solving
- Balance risk and reward for different approaches`;
        break;
      case 'social':
        guidance += `\n- Focus on NPC motivations and dialogue options
- Include multiple resolution paths and consequences
- Consider party social skills and character backgrounds`;
        break;
      case 'mixed':
        guidance += `\n- Seamlessly blend different encounter types
- Ensure each element contributes to the whole
- Provide multiple paths through different approaches`;
        break;
    }
    
    return guidance;
  }
  
  // ============================================================================
  // ENCOUNTER VALIDATION
  // ============================================================================
  
  private static validateAndParseEncounter(content: any): Encounter {
    // Validate against schema
    const validation = EncounterSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptEncounterFix(content);
      const revalidation = EncounterSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid encounter generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptEncounterFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.name) {
      fixed.name = 'Generated Encounter';
    }
    
    if (!fixed.description) {
      fixed.description = 'A challenging encounter awaits the party.';
    }
    
    if (!fixed.monsters || !Array.isArray(fixed.monsters)) {
      fixed.monsters = [];
    }
    
    if (!fixed.environment) {
      fixed.environment = 'A generic encounter area.';
    }
    
    if (!fixed.objectives) {
      fixed.objectives = ['Defeat all enemies'];
    }
    
    if (!fixed.tactics) {
      fixed.tactics = 'Standard combat tactics apply.';
    }
    
    return fixed;
  }
  
  // ============================================================================
  // XP ANALYSIS
  // ============================================================================
  
  private static performXPAnalysis(
    encounter: Encounter, 
    request: EncounterGenerationRequest, 
    budgetXP: number
  ): XPAnalysis {
    const xpBreakdown = this.calculateXPBreakdown(encounter);
    const totalXP = xpBreakdown.reduce((sum, monster) => sum + monster.totalXP, 0);
    
    // Calculate encounter multiplier
    const totalMonsters = xpBreakdown.reduce((sum, monster) => sum + monster.quantity, 0);
    const multiplier = this.getEncounterMultiplier(totalMonsters, request.partySize);
    
    const adjustedXP = totalXP * multiplier;
    const budgetUsed = (adjustedXP / budgetXP) * 100;
    
    const thresholds = XP_THRESHOLDS_BY_LEVEL[request.partyLevel] || XP_THRESHOLDS_BY_LEVEL[1];
    const difficultyThresholds = {
      easy: thresholds.easy * request.partySize,
      medium: thresholds.medium * request.partySize,
      hard: thresholds.hard * request.partySize,
      deadly: thresholds.deadly * request.partySize
    };
    
    const accurateBalance = Math.abs(budgetUsed - 100) <= 20; // Within 20% is acceptable
    
    return {
      totalXP,
      adjustedXP,
      budgetXP,
      budgetUsed,
      xpPerMonster: xpBreakdown,
      difficultyThresholds,
      multiplierApplied: multiplier,
      accurateBalance
    };
  }
  
  private static calculateXPBreakdown(encounter: Encounter): XPBreakdown[] {
    const breakdown: XPBreakdown[] = [];
    
    if (encounter.monsters) {
      encounter.monsters.forEach(monster => {
        const cr = monster.challengeRating || 1;
        const baseXP = CR_TO_XP[cr] || 200;
        const quantity = monster.quantity || 1;
        
        breakdown.push({
          monster: monster.name,
          cr,
          baseXP,
          quantity,
          totalXP: baseXP * quantity
        });
      });
    }
    
    return breakdown;
  }
  
  private static getEncounterMultiplier(monsterCount: number, partySize: number): number {
    // Adjust multiplier based on party size
    let multiplier = ENCOUNTER_MULTIPLIERS[Math.min(monsterCount, 15)] || 5;
    
    // Adjust for party size (DMG guidelines)
    if (partySize < 3) {
      multiplier *= 1.5;
    } else if (partySize > 5) {
      multiplier *= 0.5;
    }
    
    return multiplier;
  }
  
  // ============================================================================
  // TACTICAL ANALYSIS
  // ============================================================================
  
  private static analyzeTacticalElements(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): TacticalAnalysis {
    const actionEconomy = this.analyzeActionEconomy(encounter, request);
    const positioning = this.analyzePositioning(encounter, request);
    const resourceDrain = this.analyzeResourceDrain(encounter, request);
    const counterplay = this.analyzeCounterplay(encounter, request);
    const riskFactors = this.identifyRiskFactors(encounter, request);
    
    return {
      actionEconomy,
      positioning,
      resourceDrain,
      counterplay,
      riskFactors
    };
  }
  
  private static analyzeActionEconomy(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): ActionEconomyAnalysis {
    const partyActions = request.partySize; // Assuming 1 action per character
    
    let monsterActions = 0;
    if (encounter.monsters) {
      encounter.monsters.forEach(monster => {
        const quantity = monster.quantity || 1;
        monsterActions += quantity;
        
        // Add extra actions for legendary creatures
        if (monster.legendaryActions) {
          monsterActions += Math.floor(quantity * 0.5); // Rough estimate
        }
      });
    }
    
    const actionRatio = monsterActions / partyActions;
    
    let recommendedBalance = 'Balanced';
    const imbalanceWarnings: string[] = [];
    
    if (actionRatio > 1.5) {
      recommendedBalance = 'Monster-heavy';
      imbalanceWarnings.push('Monsters may overwhelm party with action economy');
    } else if (actionRatio < 0.7) {
      recommendedBalance = 'Party-favored';
      imbalanceWarnings.push('Party may dominate with superior action economy');
    }
    
    return {
      partyActions,
      monsterActions,
      actionRatio,
      recommendedBalance,
      imbalanceWarnings
    };
  }
  
  private static analyzePositioning(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): PositioningAnalysis {
    const mapSize = this.estimateMapSize(request);
    const chokepoints = this.identifyChokepoints(request);
    const advantageousPositions = this.identifyAdvantageousPositions(request);
    const movementConsiderations = this.getMovementConsiderations(request);
    const lineOfSightFactors = this.getLineOfSightFactors(request);
    
    return {
      mapSize,
      chokepoints,
      advantageousPositions,
      movementConsiderations,
      lineOfSightFactors
    };
  }
  
  private static analyzeResourceDrain(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): ResourceDrainAnalysis {
    const difficulty = request.difficulty;
    const partyLevel = request.partyLevel;
    
    // Estimate spell slot usage based on difficulty and level
    let expectedSpellSlots: SpellSlotDrain;
    
    switch (difficulty) {
      case 'easy':
        expectedSpellSlots = { level1: 1, level2: 0, level3: 0, level4: 0, level5: 0, total: 1 };
        break;
      case 'medium':
        expectedSpellSlots = { level1: 1, level2: 1, level3: 0, level4: 0, level5: 0, total: 2 };
        break;
      case 'hard':
        expectedSpellSlots = { level1: 2, level2: 1, level3: 1, level4: 0, level5: 0, total: 4 };
        break;
      case 'deadly':
        expectedSpellSlots = { level1: 2, level2: 2, level3: 1, level4: 1, level5: 0, total: 6 };
        break;
      default:
        expectedSpellSlots = { level1: 1, level2: 1, level3: 0, level4: 0, level5: 0, total: 2 };
    }
    
    const expectedHealingNeeded = this.estimateHealingNeeded(request);
    const expectedAbilityUses = this.estimateAbilityUses(request);
    const restRecommendation = this.getRestRecommendation(request);
    const attritionFactor = this.calculateAttritionFactor(request);
    
    return {
      expectedSpellSlots,
      expectedHealingNeeded,
      expectedAbilityUses,
      restRecommendation,
      attritionFactor
    };
  }
  
  private static analyzeCounterplay(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): CounterplayOptions {
    const primaryCounters = this.identifyPrimaryCounters(encounter, request);
    const alternativeApproaches = this.identifyAlternativeApproaches(request);
    const escapeOptions = this.identifyEscapeOptions(request);
    const negotiationPossible = this.assessNegotiationPossibility(encounter, request);
    const environmentalSolutions = this.identifyEnvironmentalSolutions(request);
    
    return {
      primaryCounters,
      alternativeApproaches,
      escapeOptions,
      negotiationPossible,
      environmentalSolutions
    };
  }
  
  private static identifyRiskFactors(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];
    
    // Check for save-or-die effects
    if (encounter.monsters?.some(monster => 
      monster.abilities?.some(ability => 
        ability.toLowerCase().includes('save') && 
        (ability.toLowerCase().includes('death') || ability.toLowerCase().includes('unconscious'))
      )
    )) {
      riskFactors.push({
        factor: 'Save-or-Die Effects',
        severity: 'critical',
        description: 'Monsters have abilities that can instantly incapacitate or kill',
        mitigation: 'Ensure legendary resistance or multiple save opportunities'
      });
    }
    
    // Check for overwhelming numbers
    const totalMonsters = encounter.monsters?.reduce((sum, monster) => sum + (monster.quantity || 1), 0) || 0;
    if (totalMonsters > request.partySize * 2) {
      riskFactors.push({
        factor: 'Overwhelming Numbers',
        severity: 'high',
        description: 'Large number of monsters may overwhelm party action economy',
        mitigation: 'Stagger monster entry or provide area control options'
      });
    }
    
    // Check for environmental hazards
    if (request.hazards) {
      riskFactors.push({
        factor: 'Environmental Hazards',
        severity: 'medium',
        description: 'Environmental dangers compound combat complexity',
        mitigation: 'Provide clear warning signs and counterplay options'
      });
    }
    
    return riskFactors;
  }
  
  // ============================================================================
  // BALANCE REPORT GENERATION
  // ============================================================================
  
  private static generateBalanceReport(
    encounter: Encounter, 
    request: EncounterGenerationRequest, 
    xpAnalysis: XPAnalysis
  ): BalanceReport {
    const balanceFactors = this.analyzeBalanceFactors(encounter, request, xpAnalysis);
    const overallBalance = this.determineOverallBalance(balanceFactors, xpAnalysis);
    const recommendations = this.generateBalanceRecommendations(balanceFactors, xpAnalysis);
    const warnings = this.generateBalanceWarnings(balanceFactors);
    const confidenceScore = this.calculateConfidenceScore(balanceFactors, xpAnalysis);
    
    return {
      overallBalance,
      balanceFactors,
      recommendations,
      warnings,
      confidenceScore
    };
  }
  
  private static analyzeBalanceFactors(
    encounter: Encounter, 
    request: EncounterGenerationRequest, 
    xpAnalysis: XPAnalysis
  ): BalanceFactor[] {
    const factors: BalanceFactor[] = [];
    
    // XP Budget accuracy
    const budgetDeviation = Math.abs(xpAnalysis.budgetUsed - 100);
    if (budgetDeviation > 20) {
      factors.push({
        factor: 'XP Budget Deviation',
        impact: budgetDeviation > 50 ? 2 : 1,
        description: `XP budget is ${budgetDeviation.toFixed(1)}% off target`
      });
    }
    
    // Action economy balance
    const totalMonsters = encounter.monsters?.reduce((sum, monster) => sum + (monster.quantity || 1), 0) || 0;
    const actionRatio = totalMonsters / request.partySize;
    if (actionRatio > 1.5) {
      factors.push({
        factor: 'Action Economy Imbalance',
        impact: 1,
        description: `${totalMonsters} monsters vs ${request.partySize} party members`
      });
    }
    
    // Environmental complexity
    if (request.tacticalComplexity === 'advanced') {
      factors.push({
        factor: 'High Tactical Complexity',
        impact: 1,
        description: 'Advanced tactical elements may overwhelm some groups'
      });
    }
    
    return factors;
  }
  
  private static determineOverallBalance(
    factors: BalanceFactor[], 
    xpAnalysis: XPAnalysis
  ): 'underpowered' | 'balanced' | 'overpowered' {
    const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0);
    
    if (!xpAnalysis.accurateBalance) {
      if (xpAnalysis.budgetUsed < 80) return 'underpowered';
      if (xpAnalysis.budgetUsed > 120) return 'overpowered';
    }
    
    if (totalImpact > 3) return 'overpowered';
    if (totalImpact < -2) return 'underpowered';
    return 'balanced';
  }
  
  private static generateBalanceRecommendations(
    factors: BalanceFactor[], 
    xpAnalysis: XPAnalysis
  ): string[] {
    const recommendations: string[] = [];
    
    if (!xpAnalysis.accurateBalance) {
      if (xpAnalysis.budgetUsed < 80) {
        recommendations.push('Consider adding more monsters or increasing CR');
      } else if (xpAnalysis.budgetUsed > 120) {
        recommendations.push('Consider reducing monster count or CR');
      }
    }
    
    factors.forEach(factor => {
      if (factor.factor === 'Action Economy Imbalance') {
        recommendations.push('Stagger monster initiative or add environmental factors');
      }
      if (factor.factor === 'High Tactical Complexity') {
        recommendations.push('Provide clear tactical guidance for DMs');
      }
    });
    
    return recommendations;
  }
  
  private static generateBalanceWarnings(factors: BalanceFactor[]): string[] {
    const warnings: string[] = [];
    
    factors.forEach(factor => {
      if (factor.impact >= 2) {
        warnings.push(`High impact: ${factor.description}`);
      }
    });
    
    return warnings;
  }
  
  private static calculateConfidenceScore(
    factors: BalanceFactor[], 
    xpAnalysis: XPAnalysis
  ): number {
    let confidence = 100;
    
    // Reduce confidence for XP inaccuracy
    if (!xpAnalysis.accurateBalance) {
      confidence -= 30;
    }
    
    // Reduce confidence for high-impact factors
    factors.forEach(factor => {
      confidence -= factor.impact * 10;
    });
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  // ============================================================================
  // RUNNING GUIDE GENERATION
  // ============================================================================
  
  private static createRunningGuide(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): RunningGuide {
    const setupInstructions = this.generateSetupInstructions(encounter, request);
    const initiativeOrder = this.generateInitiativeGuidance(encounter);
    const roundByRound = this.generateRoundGuidance(encounter, request);
    const commonQuestions = this.generateEncounterFAQs(encounter, request);
    const troubleshooting = this.generateTroubleshooting(encounter, request);
    
    return {
      setupInstructions,
      initiativeOrder,
      roundByRound,
      commonQuestions,
      troubleshooting
    };
  }
  
  private static generateSetupInstructions(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): string[] {
    const instructions: string[] = [];
    
    instructions.push('Set up battle map or describe the environment clearly');
    instructions.push('Roll initiative for all monsters and track turn order');
    instructions.push('Place monsters according to tactical positioning');
    instructions.push('Prepare monster stat blocks and abilities');
    instructions.push('Review environmental hazards and special features');
    
    if (request.tacticalComplexity !== 'simple') {
      instructions.push('Prepare visual aids for complex tactical elements');
    }
    
    return instructions;
  }
  
  private static generateInitiativeGuidance(encounter: Encounter): InitiativeGuidance[] {
    const guidance: InitiativeGuidance[] = [];
    
    if (encounter.monsters) {
      encounter.monsters.forEach(monster => {
        guidance.push({
          creature: monster.name,
          quantity: monster.quantity || 1,
          tactics: monster.tactics || 'Standard combat tactics',
          priority: this.assessTacticalPriority(monster)
        });
      });
    }
    
    return guidance;
  }
  
  private static generateRoundGuidance(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): RoundGuidance[] {
    const rounds: RoundGuidance[] = [];
    
    // Round 1: Setup and positioning
    rounds.push({
      round: 1,
      focus: 'Initial positioning and opening moves',
      expectedEvents: ['Monsters move to tactical positions', 'Party assesses threats', 'First attacks exchanged'],
      dmNotes: ['Emphasize environmental features', 'Set tactical tone for encounter']
    });
    
    // Round 2-3: Main combat
    rounds.push({
      round: 2,
      focus: 'Main combat engagement',
      expectedEvents: ['Full combat engagement', 'Special abilities used', 'Tactical positioning adjustments'],
      dmNotes: ['Monitor resource usage', 'Adjust monster tactics based on party actions']
    });
    
    // Final rounds: Resolution
    if (request.difficulty === 'hard' || request.difficulty === 'deadly') {
      rounds.push({
        round: 4,
        focus: 'Climax and resolution',
        expectedEvents: ['Desperate moves', 'Last-ditch abilities', 'Encounter resolution'],
        dmNotes: ['Build tension', 'Prepare for potential party retreat']
      });
    }
    
    return rounds;
  }
  
  private static generateEncounterFAQs(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): EncounterFAQ[] {
    const faqs: EncounterFAQ[] = [];
    
    faqs.push({
      question: 'What happens if the party tries to flee?',
      answer: 'Allow escape attempts but consider pursuit and consequences based on monster intelligence and motivation.'
    });
    
    faqs.push({
      question: 'How do I handle environmental hazards?',
      answer: 'Clearly telegraph hazards and provide consistent rules. Allow creative use by both party and monsters.'
    });
    
    if (request.encounterType === 'mixed') {
      faqs.push({
        question: 'How do I transition between encounter types?',
        answer: 'Use natural story beats and environmental cues to signal transitions. Maintain encounter flow.'
      });
    }
    
    return faqs;
  }
  
  private static generateTroubleshooting(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): string[] {
    const troubleshooting: string[] = [];
    
    troubleshooting.push('If encounter is too easy, add environmental complications');
    troubleshooting.push('If encounter is too hard, have monsters make tactical errors');
    troubleshooting.push('If combat drags, increase damage or reduce monster HP');
    troubleshooting.push('If players are confused, provide clearer environmental description');
    
    return troubleshooting;
  }
  
  // ============================================================================
  // VARIANT AND SCALING GENERATION
  // ============================================================================
  
  private static generateVariants(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): EncounterVariant[] {
    const variants: EncounterVariant[] = [];
    
    // Easier variant
    variants.push({
      name: `${encounter.name} (Easier)`,
      difficultyChange: -1,
      modifications: [
        'Reduce monster count by 25%',
        'Lower monster CR by 1',
        'Remove most dangerous abilities',
        'Add more cover and escape options'
      ],
      useCase: 'Lower-level parties or when resources are depleted',
      xpAdjustment: -25
    });
    
    // Harder variant
    variants.push({
      name: `${encounter.name} (Harder)`,
      difficultyChange: 1,
      modifications: [
        'Add 1-2 additional monsters',
        'Increase monster CR by 1',
        'Add environmental hazards',
        'Reduce cover and escape options'
      ],
      useCase: 'Higher-level parties or when they have full resources',
      xpAdjustment: 50
    });
    
    return variants;
  }
  
  private static createScalingOptions(
    encounter: Encounter, 
    request: EncounterGenerationRequest, 
    xpAnalysis: XPAnalysis
  ): ScalingOptions {
    return {
      easierVersion: {
        description: 'Reduce challenge for struggling parties',
        modifications: [
          'Remove 1-2 monsters',
          'Reduce monster HP by 25%',
          'Add advantageous terrain for party'
        ],
        xpChange: -25,
        newDifficulty: this.reduceDifficulty(request.difficulty)
      },
      harderVersion: {
        description: 'Increase challenge for powerful parties',
        modifications: [
          'Add 1-2 monsters of same type',
          'Increase monster damage by 25%',
          'Add environmental hazards'
        ],
        xpChange: 50,
        newDifficulty: this.increaseDifficulty(request.difficulty)
      },
      largerParty: {
        description: 'Scale for 6+ characters',
        modifications: [
          'Add monsters equal to extra party members',
          'Increase battlefield size',
          'Add secondary objectives'
        ],
        xpChange: 25,
        newDifficulty: request.difficulty
      },
      smallerParty: {
        description: 'Scale for 3 or fewer characters',
        modifications: [
          'Remove 1-2 monsters',
          'Reduce area effects',
          'Add NPC ally or environmental advantage'
        ],
        xpChange: -20,
        newDifficulty: request.difficulty
      }
    };
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static estimateMapSize(request: EncounterGenerationRequest): string {
    const partySize = request.partySize;
    
    if (partySize <= 3) return '20x20 feet';
    if (partySize <= 5) return '30x30 feet';
    return '40x40 feet';
  }
  
  private static identifyChokepoints(request: EncounterGenerationRequest): string[] {
    const chokepoints: string[] = [];
    
    switch (request.terrain) {
      case 'dungeon':
        chokepoints.push('Doorways', 'Narrow corridors');
        break;
      case 'forest':
        chokepoints.push('Dense tree clusters', 'Fallen logs');
        break;
      case 'urban':
        chokepoints.push('Alleyways', 'Building entrances');
        break;
    }
    
    return chokepoints;
  }
  
  private static identifyAdvantageousPositions(request: EncounterGenerationRequest): string[] {
    const positions: string[] = [];
    
    if (request.elevation) {
      positions.push('High ground positions', 'Elevated platforms');
    }
    
    if (request.cover !== 'none') {
      positions.push('Behind cover', 'Flanking positions');
    }
    
    return positions;
  }
  
  private static getMovementConsiderations(request: EncounterGenerationRequest): string[] {
    const considerations: string[] = [];
    
    switch (request.terrain) {
      case 'swamp':
        considerations.push('Difficult terrain slows movement');
        break;
      case 'mountain':
        considerations.push('Climbing may be required');
        break;
      case 'aquatic':
        considerations.push('Swimming speeds apply');
        break;
    }
    
    return considerations;
  }
  
  private static getLineOfSightFactors(request: EncounterGenerationRequest): string[] {
    const factors: string[] = [];
    
    if (request.cover !== 'none') {
      factors.push('Cover blocks line of sight');
    }
    
    switch (request.terrain) {
      case 'forest':
        factors.push('Trees obstruct ranged attacks');
        break;
      case 'cave':
        factors.push('Limited lighting affects visibility');
        break;
    }
    
    return factors;
  }
  
  private static estimateHealingNeeded(request: EncounterGenerationRequest): number {
    const baseHealing = request.partySize * 10; // Base healing per character
    
    switch (request.difficulty) {
      case 'easy': return baseHealing * 0.5;
      case 'medium': return baseHealing;
      case 'hard': return baseHealing * 1.5;
      case 'deadly': return baseHealing * 2;
      default: return baseHealing;
    }
  }
  
  private static estimateAbilityUses(request: EncounterGenerationRequest): number {
    switch (request.difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'deadly': return 4;
      default: return 2;
    }
  }
  
  private static getRestRecommendation(request: EncounterGenerationRequest): 'none' | 'short' | 'long' {
    if (request.difficulty === 'deadly') return 'short';
    if (request.difficulty === 'hard') return 'short';
    return 'none';
  }
  
  private static calculateAttritionFactor(request: EncounterGenerationRequest): number {
    switch (request.difficulty) {
      case 'easy': return 0.1;
      case 'medium': return 0.25;
      case 'hard': return 0.5;
      case 'deadly': return 0.75;
      default: return 0.25;
    }
  }
  
  private static identifyPrimaryCounters(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): string[] {
    const counters: string[] = [];
    
    counters.push('Focus fire on priority targets');
    counters.push('Use terrain and positioning tactically');
    
    if (request.tacticalComplexity !== 'simple') {
      counters.push('Coordinate party abilities for maximum effect');
    }
    
    return counters;
  }
  
  private static identifyAlternativeApproaches(request: EncounterGenerationRequest): string[] {
    const approaches: string[] = [];
    
    if (request.encounterType === 'mixed' || request.encounterType === 'social') {
      approaches.push('Negotiation or diplomacy');
    }
    
    if (request.encounterType === 'mixed' || request.encounterType === 'stealth') {
      approaches.push('Stealth and avoidance');
    }
    
    approaches.push('Environmental manipulation');
    
    return approaches;
  }
  
  private static identifyEscapeOptions(request: EncounterGenerationRequest): string[] {
    const options: string[] = [];
    
    options.push('Tactical retreat through entry point');
    
    if (request.terrain === 'forest') {
      options.push('Disappear into dense foliage');
    } else if (request.terrain === 'urban') {
      options.push('Escape through buildings or alleys');
    }
    
    return options;
  }
  
  private static assessNegotiationPossibility(
    encounter: Encounter, 
    request: EncounterGenerationRequest
  ): boolean {
    // Check if monsters are intelligent enough for negotiation
    return encounter.monsters?.some(monster => 
      monster.intelligence && monster.intelligence > 3
    ) || false;
  }
  
  private static identifyEnvironmentalSolutions(request: EncounterGenerationRequest): string[] {
    const solutions: string[] = [];
    
    if (request.hazards) {
      solutions.push('Turn environmental hazards against enemies');
    }
    
    if (request.elevation) {
      solutions.push('Use elevation for tactical advantage');
    }
    
    return solutions;
  }
  
  private static assessTacticalPriority(monster: any): 'high' | 'medium' | 'low' {
    if (monster.challengeRating >= 5) return 'high';
    if (monster.challengeRating >= 2) return 'medium';
    return 'low';
  }
  
  private static reduceDifficulty(difficulty: EncounterDifficulty): EncounterDifficulty {
    switch (difficulty) {
      case 'deadly': return 'hard';
      case 'hard': return 'medium';
      case 'medium': return 'easy';
      case 'easy': return 'easy';
      default: return 'easy';
    }
  }
  
  private static increaseDifficulty(difficulty: EncounterDifficulty): EncounterDifficulty {
    switch (difficulty) {
      case 'easy': return 'medium';
      case 'medium': return 'hard';
      case 'hard': return 'deadly';
      case 'deadly': return 'deadly';
      default: return 'deadly';
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EncounterGenerator;
