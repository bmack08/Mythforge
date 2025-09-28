// Mythwright Trap Generator - Specialized D&D 5e Trap & Hazard Creation with DC Calculations
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { Trap, SystemDesignBudget } from '../../../types/content.types.js';
import { TrapSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// TRAP GENERATION TYPES
// ============================================================================

export interface TrapGenerationRequest {
  // Basic Requirements
  name?: string;
  trapType: TrapType;
  category: TrapCategory;
  complexity: TrapComplexity;
  
  // Difficulty & Challenge
  challengeRating?: number;
  partyLevel: number;
  partySize?: number;
  difficulty: EncounterDifficulty;
  
  // Mechanical Properties
  detectionDC?: number;
  disarmDC?: number;
  triggerMechanism: TriggerType;
  damageType?: DamageType;
  damageAmount?: string;
  
  // Environmental Context
  environment: Environment;
  location: LocationType;
  purpose: TrapPurpose;
  creator?: CreatorType;
  
  // Advanced Features
  resetMechanism?: ResetType;
  multipleTargets?: boolean;
  delayedEffect?: boolean;
  escalatingDanger?: boolean;
  
  // Customization
  theme?: TrapTheme;
  materials?: string[];
  flavorText?: string;
  restrictions?: string[];
  mustHave?: string[];
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type TrapType = 
  | 'mechanical' | 'magical' | 'environmental' | 'creature' | 'hybrid';

export type TrapCategory = 
  | 'damage' | 'restraint' | 'alarm' | 'misdirection' | 'transportation'
  | 'debuff' | 'area_denial' | 'puzzle' | 'social' | 'detection';

export type TrapComplexity = 
  | 'simple' | 'moderate' | 'complex' | 'deadly';

export type EncounterDifficulty = 
  | 'setback' | 'dangerous' | 'deadly';

export type TriggerType = 
  | 'pressure_plate' | 'tripwire' | 'motion_sensor' | 'proximity' | 'touch'
  | 'sound' | 'light' | 'magic_aura' | 'specific_action' | 'time_delay'
  | 'remote_activation' | 'creature_type' | 'spell_trigger';

export type DamageType = 
  | 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning'
  | 'thunder' | 'acid' | 'poison' | 'psychic' | 'necrotic' | 'radiant'
  | 'force' | 'none';

export type Environment = 
  | 'dungeon' | 'forest' | 'desert' | 'mountain' | 'swamp' | 'urban'
  | 'underground' | 'aquatic' | 'aerial' | 'planar' | 'magical' | 'any';

export type LocationType = 
  | 'corridor' | 'room' | 'doorway' | 'chest' | 'stairs' | 'bridge'
  | 'outdoor_path' | 'water_crossing' | 'cliff_face' | 'building_entrance'
  | 'treasure_room' | 'altar' | 'throne_room' | 'laboratory';

export type TrapPurpose = 
  | 'protect_treasure' | 'guard_passage' | 'eliminate_intruders' | 'capture_alive'
  | 'delay_progress' | 'gather_information' | 'test_worthiness' | 'create_fear'
  | 'channel_movement' | 'magical_experiment' | 'religious_trial' | 'unknown';

export type CreatorType = 
  | 'dungeon_architect' | 'paranoid_noble' | 'ancient_civilization' | 'cult'
  | 'mad_wizard' | 'thieves_guild' | 'military_engineer' | 'construct'
  | 'elemental_force' | 'undead_lord' | 'dragon' | 'unknown';

export type ResetType = 
  | 'manual' | 'automatic' | 'time_based' | 'magic_based' | 'single_use'
  | 'limited_uses' | 'never' | 'conditional';

export type TrapTheme = 
  | 'mechanical_precision' | 'elemental_fury' | 'arcane_mystery' | 'natural_hazard'
  | 'undead_curse' | 'divine_trial' | 'infernal_torture' | 'fey_trickery'
  | 'draconic_might' | 'construct_efficiency' | 'ancient_wisdom' | 'modern_innovation';

export interface TrapGenerationResult {
  trap: Trap;
  difficultyAnalysis: DifficultyAnalysis;
  mechanicalBreakdown: MechanicalBreakdown;
  tacticalGuidance: TacticalGuidance;
  variants: TrapVariant[];
  implementationGuide: ImplementationGuide;
}

export interface DifficultyAnalysis {
  calculatedCR: number;
  targetCR: number;
  difficultyAccurate: boolean;
  difficultyFactors: DifficultyFactor[];
  adjustmentRecommendations: string[];
  expectedOutcome: ExpectedOutcome;
}

export interface DifficultyFactor {
  factor: string;
  impact: number; // -2 to +3 difficulty levels
  description: string;
}

export interface ExpectedOutcome {
  averageDamage: number;
  hitProbability: number;
  detectionChance: number;
  disarmChance: number;
  partyResourceCost: string;
}

export interface MechanicalBreakdown {
  triggerConditions: string[];
  detectionMethods: DetectionMethod[];
  disarmMethods: DisarmMethod[];
  damageCalculation: DamageCalculation;
  savingThrows: SavingThrow[];
  abilityChecks: AbilityCheck[];
}

export interface DetectionMethod {
  method: string;
  dc: number;
  advantage?: boolean;
  timeRequired: string;
  risk: string;
}

export interface DisarmMethod {
  method: string;
  dc: number;
  toolsRequired?: string[];
  timeRequired: string;
  failureConsequence: string;
  successBenefit: string;
}

export interface DamageCalculation {
  formula: string;
  averageDamage: number;
  damageType: DamageType;
  saveForHalf?: boolean;
  saveDC?: number;
  saveAbility?: string;
}

export interface SavingThrow {
  ability: string;
  dc: number;
  onSuccess: string;
  onFailure: string;
  repeatable?: boolean;
}

export interface AbilityCheck {
  ability: string;
  skill?: string;
  dc: number;
  purpose: string;
  advantage?: boolean;
  groupCheck?: boolean;
}

export interface TacticalGuidance {
  bestCounters: string[];
  commonMistakes: string[];
  partyRoles: PartyRole[];
  environmentalFactors: string[];
  dmTips: string[];
}

export interface PartyRole {
  role: string;
  contribution: string;
  risks: string[];
  recommendations: string[];
}

export interface TrapVariant {
  name: string;
  difficultyChange: number;
  modifications: string[];
  useCase: string;
  implementationNotes: string[];
}

export interface ImplementationGuide {
  setupInstructions: string[];
  runningTheTrap: string[];
  commonQuestions: FAQ[];
  scalingGuidance: ScalingGuidance;
  troubleshooting: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ScalingGuidance {
  lowerLevel: string[];
  higherLevel: string[];
  largerParty: string[];
  smallerParty: string[];
}

// ============================================================================
// DIFFICULTY CALCULATION CONSTANTS (Based on DMG)
// ============================================================================

const TRAP_DAMAGE_BY_LEVEL = {
  1: { setback: '1d10', dangerous: '2d10', deadly: '4d10' },
  2: { setback: '1d10', dangerous: '2d10', deadly: '4d10' },
  3: { setback: '2d10', dangerous: '4d10', deadly: '10d10' },
  4: { setback: '2d10', dangerous: '4d10', deadly: '10d10' },
  5: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  6: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  7: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  8: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  9: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  10: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
  11: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  12: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  13: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  14: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  15: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  16: { setback: '10d10', dangerous: '18d10', deadly: '24d10' },
  17: { setback: '18d10', dangerous: '24d10', deadly: '36d10' },
  18: { setback: '18d10', dangerous: '24d10', deadly: '36d10' },
  19: { setback: '18d10', dangerous: '24d10', deadly: '36d10' },
  20: { setback: '18d10', dangerous: '24d10', deadly: '36d10' }
};

const DC_BY_LEVEL = {
  1: { easy: 5, medium: 10, hard: 15, nearly_impossible: 20 },
  5: { easy: 10, medium: 15, hard: 20, nearly_impossible: 25 },
  11: { easy: 15, medium: 20, hard: 25, nearly_impossible: 30 },
  17: { easy: 15, medium: 20, hard: 25, nearly_impossible: 30 },
  20: { easy: 15, medium: 20, hard: 25, nearly_impossible: 30 }
};

const SAVE_DC_BY_LEVEL = {
  1: 13, 2: 13, 3: 13, 4: 13, 5: 15, 6: 15, 7: 15, 8: 15, 9: 16, 10: 16,
  11: 16, 12: 16, 13: 17, 14: 17, 15: 17, 16: 17, 17: 18, 18: 18, 19: 18, 20: 19
};

const ATTACK_BONUS_BY_LEVEL = {
  1: 3, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6, 7: 6, 8: 7, 9: 8, 10: 8,
  11: 8, 12: 8, 13: 9, 14: 9, 15: 9, 16: 10, 17: 10, 18: 10, 19: 11, 20: 11
};

// ============================================================================
// TRAP GENERATOR CLASS
// ============================================================================

export class TrapGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateTrap(
    request: TrapGenerationRequest,
    aiService: any // AIService type
  ): Promise<TrapGenerationResult> {
    
    // Step 1: Build the AI prompt
    const aiPrompt = this.buildTrapPrompt(request);
    
    // Step 2: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'trap',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          trapType: request.trapType,
          complexity: request.complexity,
          partyLevel: request.partyLevel,
          difficulty: request.difficulty,
          environment: request.environment
        }
      },
      options: {
        temperature: 0.6, // Moderate creativity for traps
        maxTokens: 2200 // Traps need detailed mechanics
      }
    };
    
    // Step 3: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Trap generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 4: Validate and parse the trap
    const trap = this.validateAndParseTrap(aiResponse.content);
    
    // Step 5: Analyze difficulty
    const difficultyAnalysis = this.analyzeDifficulty(trap, request);
    
    // Step 6: Create mechanical breakdown
    const mechanicalBreakdown = this.createMechanicalBreakdown(trap, request);
    
    // Step 7: Generate tactical guidance
    const tacticalGuidance = this.generateTacticalGuidance(trap, request);
    
    // Step 8: Create variants
    const variants = this.generateVariants(trap, request);
    
    // Step 9: Create implementation guide
    const implementationGuide = this.createImplementationGuide(trap, request);
    
    return {
      trap,
      difficultyAnalysis,
      mechanicalBreakdown,
      tacticalGuidance,
      variants,
      implementationGuide
    };
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildTrapPrompt(request: TrapGenerationRequest): string {
    const expectedDamage = TRAP_DAMAGE_BY_LEVEL[request.partyLevel]?.[request.difficulty] || '2d10';
    const dcGuidelines = this.getDCForLevel(request.partyLevel);
    const saveDC = SAVE_DC_BY_LEVEL[request.partyLevel] || 13;
    
    let prompt = `Create a D&D 5e trap with precise mechanical balance:

CORE REQUIREMENTS:
- Trap Type: ${request.trapType}
- Category: ${request.category}
- Complexity: ${request.complexity}
- Difficulty: ${request.difficulty} (for level ${request.partyLevel} party)`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    prompt += `\n- Environment: ${request.environment}`;
    prompt += `\n- Location: ${request.location}`;
    prompt += `\n- Purpose: ${request.purpose}`;
    prompt += `\n- Trigger: ${request.triggerMechanism}`;
    
    if (request.creator) {
      prompt += `\n- Creator: ${request.creator}`;
    }
    
    // Add party context
    prompt += `\n\nPARTY CONTEXT:`;
    prompt += `\n- Target Level: ${request.partyLevel}`;
    if (request.partySize) {
      prompt += `\n- Party Size: ${request.partySize}`;
    }
    if (request.challengeRating) {
      prompt += `\n- Challenge Rating: ${request.challengeRating}`;
    }
    
    // Add mechanical guidelines
    prompt += `\n\nMECHANICAL GUIDELINES (Level ${request.partyLevel}, ${request.difficulty.toUpperCase()}):`;
    prompt += `\n- Expected Damage: ${expectedDamage} (average: ${this.calculateAverageDamage(expectedDamage)})`;
    prompt += `\n- Save DC Range: ${saveDC - 2} to ${saveDC + 2} (recommended: ${saveDC})`;
    prompt += `\n- Detection DC: ${dcGuidelines.medium} (medium difficulty)`;
    prompt += `\n- Disarm DC: ${dcGuidelines.hard} (hard difficulty)`;
    prompt += `\n- Attack Bonus: +${ATTACK_BONUS_BY_LEVEL[request.partyLevel] || 5}`;
    
    // Add specific requirements
    if (request.detectionDC) {
      prompt += `\n\nSPECIFIC REQUIREMENTS:`;
      prompt += `\n- Detection DC: ${request.detectionDC}`;
    }
    
    if (request.disarmDC) {
      prompt += `\n- Disarm DC: ${request.disarmDC}`;
    }
    
    if (request.damageType) {
      prompt += `\n- Damage Type: ${request.damageType}`;
    }
    
    if (request.damageAmount) {
      prompt += `\n- Damage Amount: ${request.damageAmount}`;
    }
    
    // Add advanced features
    if (request.multipleTargets || request.delayedEffect || request.escalatingDanger || request.resetMechanism) {
      prompt += `\n\nADVANCED FEATURES:`;
      if (request.multipleTargets) {
        prompt += `\n- Multiple Targets: Affects multiple party members`;
      }
      if (request.delayedEffect) {
        prompt += `\n- Delayed Effect: Effect occurs after a delay`;
      }
      if (request.escalatingDanger) {
        prompt += `\n- Escalating Danger: Becomes more dangerous over time`;
      }
      if (request.resetMechanism) {
        prompt += `\n- Reset Mechanism: ${request.resetMechanism}`;
      }
    }
    
    // Add theme and materials
    if (request.theme) {
      prompt += `\n\nTHEME & AESTHETICS:`;
      prompt += `\n- Theme: ${request.theme}`;
    }
    
    if (request.materials && request.materials.length > 0) {
      prompt += `\n- Materials: ${request.materials.join(', ')}`;
    }
    
    // Add must-have features
    if (request.mustHave && request.mustHave.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustHave.forEach(feature => {
        prompt += `\n- ${feature}`;
      });
    }
    
    // Add restrictions
    if (request.restrictions && request.restrictions.length > 0) {
      prompt += `\n\nRESTRICTIONS:`;
      request.restrictions.forEach(restriction => {
        prompt += `\n- ${restriction}`;
      });
    }
    
    // Add flavor text guidance
    if (request.flavorText) {
      prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
    }
    
    // Add complexity-specific guidance
    prompt += this.getComplexityGuidance(request.complexity, request.trapType);
    
    prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e trap mechanics exactly
2. Ensure difficulty matches party level precisely
3. Include clear trigger conditions and mechanics
4. Provide multiple detection and disarm methods
5. Balance challenge with fair counterplay options
6. Use only SRD-safe content (no Product Identity terms)
7. Include specific DCs, damage formulas, and save requirements
8. Consider environmental factors and tactical positioning
9. Make the trap engaging and memorable
10. Ensure the trap serves its narrative purpose
11. Include detailed mechanical statistics
12. Balance risk and reward appropriately

Return a complete trap in JSON format following the Trap schema with all mechanical details, descriptions, DCs, damage calculations, and tactical information.`;
    
    return prompt;
  }
  
  private static getDCForLevel(level: number): any {
    if (level <= 4) return DC_BY_LEVEL[1];
    if (level <= 10) return DC_BY_LEVEL[5];
    if (level <= 16) return DC_BY_LEVEL[11];
    return DC_BY_LEVEL[17];
  }
  
  private static calculateAverageDamage(diceFormula: string): number {
    const match = diceFormula.match(/(\d+)d(\d+)/);
    if (match) {
      const numDice = parseInt(match[1]);
      const dieSize = parseInt(match[2]);
      return numDice * (dieSize + 1) / 2;
    }
    return 10; // Default fallback
  }
  
  private static getComplexityGuidance(complexity: TrapComplexity, trapType: TrapType): string {
    let guidance = `\n\nCOMPLEXITY GUIDANCE (${complexity.toUpperCase()}):`;
    
    switch (complexity) {
      case 'simple':
        guidance += `\n- Single trigger mechanism with straightforward effect
- One primary detection method and one disarm method
- Immediate, obvious consequences
- Minimal moving parts or magical components`;
        break;
      case 'moderate':
        guidance += `\n- Multiple trigger conditions or staged effects
- 2-3 detection methods with varying difficulty
- Multiple disarm approaches with different skill requirements
- Some hidden or delayed consequences`;
        break;
      case 'complex':
        guidance += `\n- Intricate trigger system with multiple components
- Multiple detection methods requiring different approaches
- Complex disarm sequence with multiple skill checks
- Layered effects with escalating consequences`;
        break;
      case 'deadly':
        guidance += `\n- Extremely sophisticated trigger and effect system
- Hidden or nearly undetectable elements
- Multiple interconnected components
- Severe consequences with limited counterplay options`;
        break;
    }
    
    switch (trapType) {
      case 'mechanical':
        guidance += `\n- Focus on physical mechanisms, gears, springs, and pressure systems
- Emphasize tool requirements and engineering knowledge
- Include wear patterns and mechanical tells for detection`;
        break;
      case 'magical':
        guidance += `\n- Incorporate spell effects, magical auras, and arcane triggers
- Consider magical detection methods and dispelling options
- Include magical components and energy sources`;
        break;
      case 'environmental':
        guidance += `\n- Leverage natural hazards and environmental features
- Consider weather, terrain, and natural phenomena
- Make the environment itself part of the trap mechanism`;
        break;
      case 'creature':
        guidance += `\n- Involve living creatures as part of the trap system
- Consider creature behavior, intelligence, and motivation
- Include creature stat blocks or references`;
        break;
      case 'hybrid':
        guidance += `\n- Combine multiple trap types for layered complexity
- Ensure each component serves a distinct purpose
- Create synergy between different trap elements`;
        break;
    }
    
    return guidance;
  }
  
  // ============================================================================
  // TRAP VALIDATION
  // ============================================================================
  
  private static validateAndParseTrap(content: any): Trap {
    // Validate against schema
    const validation = TrapSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptTrapFix(content);
      const revalidation = TrapSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid trap generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptTrapFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.name) {
      fixed.name = 'Mysterious Trap';
    }
    
    if (!fixed.description) {
      fixed.description = 'A dangerous trap awaits the unwary.';
    }
    
    if (!fixed.detectionDC) {
      fixed.detectionDC = 15; // Default detection DC
    }
    
    if (!fixed.disarmDC) {
      fixed.disarmDC = 15; // Default disarm DC
    }
    
    if (!fixed.trigger) {
      fixed.trigger = 'pressure plate';
    }
    
    if (!fixed.effect) {
      fixed.effect = 'Deals damage to the triggering creature';
    }
    
    if (!fixed.damage) {
      fixed.damage = '2d10';
    }
    
    if (!fixed.damageType) {
      fixed.damageType = 'piercing';
    }
    
    return fixed;
  }
  
  // ============================================================================
  // DIFFICULTY ANALYSIS
  // ============================================================================
  
  private static analyzeDifficulty(trap: Trap, request: TrapGenerationRequest): DifficultyAnalysis {
    const difficultyFactors = this.analyzeDifficultyFactors(trap, request);
    const calculatedCR = this.calculateTrapCR(trap, request, difficultyFactors);
    const targetCR = request.challengeRating || this.estimateTargetCR(request);
    const difficultyAccurate = Math.abs(calculatedCR - targetCR) <= 0.5;
    
    const adjustmentRecommendations = this.generateDifficultyAdjustments(
      targetCR, 
      calculatedCR, 
      difficultyFactors
    );
    
    const expectedOutcome = this.calculateExpectedOutcome(trap, request);
    
    return {
      calculatedCR,
      targetCR,
      difficultyAccurate,
      difficultyFactors,
      adjustmentRecommendations,
      expectedOutcome
    };
  }
  
  private static analyzeDifficultyFactors(trap: Trap, request: TrapGenerationRequest): DifficultyFactor[] {
    const factors: DifficultyFactor[] = [];
    
    // Damage analysis
    const averageDamage = this.parseAverageDamage(trap.damage);
    const expectedDamage = this.calculateAverageDamage(
      TRAP_DAMAGE_BY_LEVEL[request.partyLevel]?.[request.difficulty] || '2d10'
    );
    
    const damageRatio = averageDamage / expectedDamage;
    if (damageRatio > 1.5) {
      factors.push({
        factor: 'High Damage',
        impact: 1,
        description: `Damage (${averageDamage}) is ${Math.round(damageRatio * 100)}% of expected`
      });
    } else if (damageRatio < 0.7) {
      factors.push({
        factor: 'Low Damage',
        impact: -1,
        description: `Damage (${averageDamage}) is ${Math.round(damageRatio * 100)}% of expected`
      });
    }
    
    // Detection difficulty
    const expectedDetectionDC = this.getDCForLevel(request.partyLevel).medium;
    const detectionDifference = trap.detectionDC - expectedDetectionDC;
    if (detectionDifference > 5) {
      factors.push({
        factor: 'Hard to Detect',
        impact: 0.5,
        description: `Detection DC (${trap.detectionDC}) is ${detectionDifference} higher than expected`
      });
    } else if (detectionDifference < -3) {
      factors.push({
        factor: 'Easy to Detect',
        impact: -0.5,
        description: `Detection DC (${trap.detectionDC}) is ${Math.abs(detectionDifference)} lower than expected`
      });
    }
    
    // Disarm difficulty
    const expectedDisarmDC = this.getDCForLevel(request.partyLevel).hard;
    const disarmDifference = trap.disarmDC - expectedDisarmDC;
    if (disarmDifference > 5) {
      factors.push({
        factor: 'Hard to Disarm',
        impact: 0.5,
        description: `Disarm DC (${trap.disarmDC}) is ${disarmDifference} higher than expected`
      });
    }
    
    // Multiple targets
    if (trap.description?.toLowerCase().includes('all creatures') || 
        trap.description?.toLowerCase().includes('area')) {
      factors.push({
        factor: 'Area Effect',
        impact: 1,
        description: 'Affects multiple targets simultaneously'
      });
    }
    
    // Save for half damage
    if (trap.description?.toLowerCase().includes('save') && 
        trap.description?.toLowerCase().includes('half')) {
      factors.push({
        factor: 'Save for Half',
        impact: -0.5,
        description: 'Saving throw reduces damage by half'
      });
    }
    
    // Ongoing effects
    if (trap.description?.toLowerCase().includes('ongoing') || 
        trap.description?.toLowerCase().includes('each turn')) {
      factors.push({
        factor: 'Ongoing Effect',
        impact: 1.5,
        description: 'Effect continues over multiple turns'
      });
    }
    
    // Reset mechanism
    if (trap.description?.toLowerCase().includes('resets') || 
        trap.description?.toLowerCase().includes('reactivates')) {
      factors.push({
        factor: 'Resets Automatically',
        impact: 0.5,
        description: 'Trap can trigger multiple times'
      });
    }
    
    return factors;
  }
  
  private static calculateTrapCR(
    trap: Trap, 
    request: TrapGenerationRequest, 
    factors: DifficultyFactor[]
  ): number {
    // Base CR from party level and difficulty
    let baseCR = request.partyLevel / 4; // Starting point
    
    switch (request.difficulty) {
      case 'setback':
        baseCR *= 0.5;
        break;
      case 'dangerous':
        baseCR *= 1.0;
        break;
      case 'deadly':
        baseCR *= 1.5;
        break;
    }
    
    // Apply difficulty factors
    let adjustedCR = baseCR;
    factors.forEach(factor => {
      adjustedCR += factor.impact;
    });
    
    return Math.max(0, Math.round(adjustedCR * 2) / 2); // Round to nearest 0.5
  }
  
  private static estimateTargetCR(request: TrapGenerationRequest): number {
    let targetCR = request.partyLevel / 4;
    
    switch (request.difficulty) {
      case 'setback':
        targetCR *= 0.5;
        break;
      case 'dangerous':
        targetCR *= 1.0;
        break;
      case 'deadly':
        targetCR *= 1.5;
        break;
    }
    
    return Math.max(0.25, Math.round(targetCR * 2) / 2);
  }
  
  private static generateDifficultyAdjustments(
    target: number, 
    calculated: number, 
    factors: DifficultyFactor[]
  ): string[] {
    const recommendations: string[] = [];
    const difference = calculated - target;
    
    if (Math.abs(difference) <= 0.5) {
      recommendations.push('Trap difficulty is well-balanced for the target encounter');
      return recommendations;
    }
    
    if (difference > 0) {
      // Trap is too difficult
      recommendations.push(`Trap is ${difference.toFixed(1)} CR too difficult`);
      recommendations.push('Consider reducing damage dice or DC values');
      recommendations.push('Add more detection clues or easier disarm methods');
      recommendations.push('Provide saving throws for half damage');
    } else {
      // Trap is too easy
      recommendations.push(`Trap is ${Math.abs(difference).toFixed(1)} CR too easy`);
      recommendations.push('Consider increasing damage or DC values');
      recommendations.push('Add area effects or ongoing damage');
      recommendations.push('Make detection or disarm more challenging');
    }
    
    return recommendations;
  }
  
  private static calculateExpectedOutcome(trap: Trap, request: TrapGenerationRequest): ExpectedOutcome {
    const averageDamage = this.parseAverageDamage(trap.damage);
    
    // Estimate hit probability based on save DC or attack bonus
    const hitProbability = trap.description?.includes('save') ? 0.6 : 0.65;
    
    // Estimate detection chance based on DC and party level
    const detectionChance = Math.max(0.1, Math.min(0.9, 
      (request.partyLevel * 2 + 10 - trap.detectionDC) / 20
    ));
    
    // Estimate disarm chance
    const disarmChance = Math.max(0.05, Math.min(0.8, 
      (request.partyLevel * 2 + 5 - trap.disarmDC) / 20
    ));
    
    // Estimate resource cost
    let resourceCost = 'Low';
    if (averageDamage > request.partyLevel * 3) {
      resourceCost = 'Medium';
    }
    if (averageDamage > request.partyLevel * 6) {
      resourceCost = 'High';
    }
    
    return {
      averageDamage,
      hitProbability,
      detectionChance,
      disarmChance,
      partyResourceCost: resourceCost
    };
  }
  
  private static parseAverageDamage(damageFormula: string): number {
    // Parse dice notation like "2d10", "3d6+5", etc.
    const match = damageFormula.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (match) {
      const numDice = parseInt(match[1]);
      const dieSize = parseInt(match[2]);
      const bonus = match[3] ? parseInt(match[3]) : 0;
      return numDice * (dieSize + 1) / 2 + bonus;
    }
    
    // Handle flat numbers
    const flatMatch = damageFormula.match(/^\d+$/);
    if (flatMatch) {
      return parseInt(damageFormula);
    }
    
    return 10; // Default fallback
  }
  
  // ============================================================================
  // MECHANICAL BREAKDOWN
  // ============================================================================
  
  private static createMechanicalBreakdown(trap: Trap, request: TrapGenerationRequest): MechanicalBreakdown {
    const triggerConditions = this.extractTriggerConditions(trap);
    const detectionMethods = this.generateDetectionMethods(trap, request);
    const disarmMethods = this.generateDisarmMethods(trap, request);
    const damageCalculation = this.createDamageCalculation(trap);
    const savingThrows = this.extractSavingThrows(trap, request);
    const abilityChecks = this.generateAbilityChecks(trap, request);
    
    return {
      triggerConditions,
      detectionMethods,
      disarmMethods,
      damageCalculation,
      savingThrows,
      abilityChecks
    };
  }
  
  private static extractTriggerConditions(trap: Trap): string[] {
    const conditions: string[] = [];
    
    // Extract from description
    if (trap.description?.includes('pressure')) {
      conditions.push('Creature steps on pressure plate (5+ pounds)');
    }
    if (trap.description?.includes('tripwire')) {
      conditions.push('Creature breaks tripwire or moves string');
    }
    if (trap.description?.includes('door') || trap.description?.includes('opens')) {
      conditions.push('Door or container is opened');
    }
    
    // Default based on trigger type
    if (conditions.length === 0) {
      conditions.push(`Triggered by ${trap.trigger || 'unknown mechanism'}`);
    }
    
    return conditions;
  }
  
  private static generateDetectionMethods(trap: Trap, request: TrapGenerationRequest): DetectionMethod[] {
    const methods: DetectionMethod[] = [];
    
    // Passive Perception
    methods.push({
      method: 'Passive Perception',
      dc: trap.detectionDC,
      timeRequired: 'Automatic',
      risk: 'None'
    });
    
    // Active Investigation
    methods.push({
      method: 'Active Investigation',
      dc: trap.detectionDC - 2,
      advantage: true,
      timeRequired: '1 minute',
      risk: 'May trigger trap on critical failure'
    });
    
    // Specialized methods based on trap type
    if (request.trapType === 'magical') {
      methods.push({
        method: 'Detect Magic',
        dc: Math.max(10, trap.detectionDC - 5),
        timeRequired: '1 action (spell)',
        risk: 'None'
      });
    }
    
    if (request.trapType === 'mechanical') {
      methods.push({
        method: 'Thieves\' Tools Examination',
        dc: trap.detectionDC - 3,
        timeRequired: '10 minutes',
        risk: 'None'
      });
    }
    
    return methods;
  }
  
  private static generateDisarmMethods(trap: Trap, request: TrapGenerationRequest): DisarmMethod[] {
    const methods: DisarmMethod[] = [];
    
    // Primary disarm method
    methods.push({
      method: 'Thieves\' Tools',
      dc: trap.disarmDC,
      toolsRequired: ['thieves\' tools'],
      timeRequired: '1 action',
      failureConsequence: 'Trap triggers immediately',
      successBenefit: 'Trap is permanently disabled'
    });
    
    // Alternative methods based on trap type
    if (request.trapType === 'magical') {
      methods.push({
        method: 'Dispel Magic',
        dc: trap.disarmDC - 5,
        timeRequired: '1 action (spell)',
        failureConsequence: 'No effect, trap remains active',
        successBenefit: 'Magical components are suppressed for 10 minutes'
      });
    }
    
    if (request.trapType === 'mechanical') {
      methods.push({
        method: 'Brute Force',
        dc: trap.disarmDC + 5,
        toolsRequired: ['crowbar or similar tool'],
        timeRequired: '1 minute',
        failureConsequence: 'Trap triggers and cannot be disarmed',
        successBenefit: 'Trap mechanism is destroyed'
      });
    }
    
    // Environmental bypass
    methods.push({
      method: 'Environmental Bypass',
      dc: Math.max(10, trap.disarmDC - 3),
      timeRequired: 'Varies',
      failureConsequence: 'Approach fails, trap remains active',
      successBenefit: 'Trap is avoided without disarming'
    });
    
    return methods;
  }
  
  private static createDamageCalculation(trap: Trap): DamageCalculation {
    const averageDamage = this.parseAverageDamage(trap.damage);
    
    // Check for saving throws in description
    const saveForHalf = trap.description?.toLowerCase().includes('save') && 
                       trap.description?.toLowerCase().includes('half');
    
    return {
      formula: trap.damage,
      averageDamage,
      damageType: trap.damageType || 'piercing',
      saveForHalf,
      saveDC: saveForHalf ? (trap.saveDC || 15) : undefined,
      saveAbility: saveForHalf ? 'Dexterity' : undefined
    };
  }
  
  private static extractSavingThrows(trap: Trap, request: TrapGenerationRequest): SavingThrow[] {
    const saves: SavingThrow[] = [];
    
    // Extract from description
    if (trap.description?.toLowerCase().includes('dexterity save')) {
      saves.push({
        ability: 'Dexterity',
        dc: trap.saveDC || SAVE_DC_BY_LEVEL[request.partyLevel] || 15,
        onSuccess: 'Takes half damage',
        onFailure: 'Takes full damage'
      });
    }
    
    if (trap.description?.toLowerCase().includes('constitution save')) {
      saves.push({
        ability: 'Constitution',
        dc: trap.saveDC || SAVE_DC_BY_LEVEL[request.partyLevel] || 15,
        onSuccess: 'Resists effect',
        onFailure: 'Suffers full effect'
      });
    }
    
    return saves;
  }
  
  private static generateAbilityChecks(trap: Trap, request: TrapGenerationRequest): AbilityCheck[] {
    const checks: AbilityCheck[] = [];
    
    // Detection checks
    checks.push({
      ability: 'Wisdom',
      skill: 'Perception',
      dc: trap.detectionDC,
      purpose: 'Detect the trap'
    });
    
    checks.push({
      ability: 'Intelligence',
      skill: 'Investigation',
      dc: trap.detectionDC - 2,
      purpose: 'Analyze trap mechanism',
      advantage: true
    });
    
    // Disarm checks
    checks.push({
      ability: 'Dexterity',
      skill: 'Sleight of Hand',
      dc: trap.disarmDC,
      purpose: 'Disarm the trap with thieves\' tools'
    });
    
    // Type-specific checks
    if (request.trapType === 'magical') {
      checks.push({
        ability: 'Intelligence',
        skill: 'Arcana',
        dc: trap.detectionDC,
        purpose: 'Understand magical components'
      });
    }
    
    return checks;
  }
  
  // ============================================================================
  // TACTICAL GUIDANCE
  // ============================================================================
  
  private static generateTacticalGuidance(trap: Trap, request: TrapGenerationRequest): TacticalGuidance {
    const bestCounters = this.identifyBestCounters(trap, request);
    const commonMistakes = this.identifyCommonMistakes(trap, request);
    const partyRoles = this.analyzePartyRoles(trap, request);
    const environmentalFactors = this.identifyEnvironmentalFactors(trap, request);
    const dmTips = this.generateDMTips(trap, request);
    
    return {
      bestCounters,
      commonMistakes,
      partyRoles,
      environmentalFactors,
      dmTips
    };
  }
  
  private static identifyBestCounters(trap: Trap, request: TrapGenerationRequest): string[] {
    const counters: string[] = [];
    
    // Universal counters
    counters.push('Careful movement and thorough investigation');
    counters.push('Using a 10-foot pole or similar tool to test ahead');
    
    // Type-specific counters
    switch (request.trapType) {
      case 'magical':
        counters.push('Detect Magic spell reveals magical auras');
        counters.push('Dispel Magic can disable magical components');
        break;
      case 'mechanical':
        counters.push('Thieves\' tools and mechanical expertise');
        counters.push('Understanding of engineering principles');
        break;
      case 'environmental':
        counters.push('Knowledge of natural hazards and terrain');
        counters.push('Environmental adaptation and survival skills');
        break;
    }
    
    // Damage type specific
    if (trap.damageType) {
      switch (trap.damageType) {
        case 'fire':
          counters.push('Fire resistance or immunity');
          counters.push('Water or cold-based countermeasures');
          break;
        case 'poison':
          counters.push('Poison resistance or immunity');
          counters.push('Antidotes and healing magic');
          break;
        case 'lightning':
          counters.push('Metal armor provides grounding');
          counters.push('Rubber or insulating materials');
          break;
      }
    }
    
    return counters.slice(0, 5);
  }
  
  private static identifyCommonMistakes(trap: Trap, request: TrapGenerationRequest): string[] {
    const mistakes: string[] = [];
    
    // Universal mistakes
    mistakes.push('Rushing through areas without checking for traps');
    mistakes.push('Sending the same character to handle all traps');
    mistakes.push('Ignoring environmental clues and context');
    
    // Complexity-specific mistakes
    switch (request.complexity) {
      case 'complex':
      case 'deadly':
        mistakes.push('Assuming a single successful check disables everything');
        mistakes.push('Not coordinating party actions for complex sequences');
        break;
    }
    
    // Type-specific mistakes
    switch (request.trapType) {
      case 'magical':
        mistakes.push('Trying to disarm magically without understanding the magic');
        mistakes.push('Not considering spell components or magical triggers');
        break;
      case 'mechanical':
        mistakes.push('Using brute force on delicate mechanisms');
        mistakes.push('Not having the proper tools for the job');
        break;
    }
    
    return mistakes.slice(0, 4);
  }
  
  private static analyzePartyRoles(trap: Trap, request: TrapGenerationRequest): PartyRole[] {
    const roles: PartyRole[] = [];
    
    // Rogue/Scout
    roles.push({
      role: 'Rogue/Scout',
      contribution: 'Primary trap detection and disarming',
      risks: ['Taking damage if disarm fails', 'Being separated from party'],
      recommendations: ['Use thieves\' tools proficiency', 'Take time to study the mechanism', 'Have backup plan ready']
    });
    
    // Wizard/Artificer
    roles.push({
      role: 'Wizard/Artificer',
      contribution: 'Magical analysis and alternative solutions',
      risks: ['Spell slot consumption', 'Magical backlash'],
      recommendations: ['Use Detect Magic and Identify', 'Consider Dispel Magic for magical traps', 'Analyze from safe distance']
    });
    
    // Tank/Fighter
    roles.push({
      role: 'Tank/Fighter',
      contribution: 'Protection and brute force options',
      risks: ['Taking damage for the party', 'Triggering trap accidentally'],
      recommendations: ['Position to shield others', 'Use shield and high AC', 'Be ready for emergency actions']
    });
    
    // Healer/Cleric
    roles.push({
      role: 'Healer/Cleric',
      contribution: 'Emergency healing and condition removal',
      risks: ['Resource depletion', 'Being targeted by area effects'],
      recommendations: ['Stay at safe distance', 'Prepare healing spells', 'Consider Protection from Energy']
    });
    
    return roles;
  }
  
  private static identifyEnvironmentalFactors(trap: Trap, request: TrapGenerationRequest): string[] {
    const factors: string[] = [];
    
    // Environment-specific factors
    switch (request.environment) {
      case 'dungeon':
        factors.push('Limited light may hinder detection');
        factors.push('Stone construction affects sound and vibration');
        factors.push('Narrow corridors limit movement options');
        break;
      case 'forest':
        factors.push('Natural camouflage makes detection harder');
        factors.push('Organic materials may decay over time');
        factors.push('Weather exposure affects mechanisms');
        break;
      case 'urban':
        factors.push('Noise from city may mask trap sounds');
        factors.push('Regular foot traffic may have triggered it before');
        factors.push('Modern materials and techniques possible');
        break;
      case 'underground':
        factors.push('Humidity affects metal and wood components');
        factors.push('Limited escape routes increase danger');
        factors.push('Echoes may help or hinder detection');
        break;
    }
    
    // Location-specific factors
    switch (request.location) {
      case 'doorway':
        factors.push('Chokepoint limits party positioning');
        factors.push('Door mechanism may be integral to trap');
        break;
      case 'bridge':
        factors.push('Structural damage could cause collapse');
        factors.push('Water or chasm below increases stakes');
        break;
      case 'stairs':
        factors.push('Elevation changes affect trap mechanics');
        factors.push('Falling damage compounds trap effects');
        break;
    }
    
    return factors.slice(0, 4);
  }
  
  private static generateDMTips(trap: Trap, request: TrapGenerationRequest): string[] {
    const tips: string[] = [];
    
    // General DM guidance
    tips.push('Describe the environment to provide subtle clues');
    tips.push('Allow multiple approaches and creative solutions');
    tips.push('Be consistent with trap logic and mechanics');
    
    // Difficulty-specific tips
    switch (request.difficulty) {
      case 'deadly':
        tips.push('Ensure players have fair warning and counterplay options');
        tips.push('Consider the narrative impact of character death');
        break;
      case 'setback':
        tips.push('Focus on resource drain rather than major damage');
        tips.push('Use as pacing tool rather than major obstacle');
        break;
    }
    
    // Complexity-specific tips
    switch (request.complexity) {
      case 'complex':
      case 'deadly':
        tips.push('Break complex sequences into clear stages');
        tips.push('Allow partial successes to maintain momentum');
        break;
    }
    
    return tips.slice(0, 5);
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(trap: Trap, request: TrapGenerationRequest): TrapVariant[] {
    const variants: TrapVariant[] = [];
    
    // Easier variant
    variants.push({
      name: `Lesser ${trap.name}`,
      difficultyChange: -1,
      modifications: [
        'Reduce damage by 25%',
        'Lower detection and disarm DCs by 3',
        'Add more obvious warning signs',
        'Reduce area of effect or number of targets'
      ],
      useCase: 'Lower-level parties or as a warning example',
      implementationNotes: [
        'Use for tutorial purposes',
        'Good for building tension without high lethality'
      ]
    });
    
    // Harder variant
    variants.push({
      name: `Greater ${trap.name}`,
      difficultyChange: 1,
      modifications: [
        'Increase damage by 50%',
        'Raise detection and disarm DCs by 3',
        'Add secondary effects or conditions',
        'Include reset mechanism or multiple triggers'
      ],
      useCase: 'Higher-level parties or climactic encounters',
      implementationNotes: [
        'Ensure adequate warning and counterplay',
        'Consider as boss room guardian'
      ]
    });
    
    // Alternative trigger variant
    variants.push({
      name: `${trap.name} (Alternative Trigger)`,
      difficultyChange: 0,
      modifications: [
        'Change trigger mechanism completely',
        'Adjust detection methods accordingly',
        'Maintain same damage and difficulty',
        'Alter environmental integration'
      ],
      useCase: 'Repeat encounters with different approach',
      implementationNotes: [
        'Prevents player pattern recognition',
        'Keeps trap encounters fresh'
      ]
    });
    
    return variants;
  }
  
  // ============================================================================
  // IMPLEMENTATION GUIDE
  // ============================================================================
  
  private static createImplementationGuide(trap: Trap, request: TrapGenerationRequest): ImplementationGuide {
    const setupInstructions = this.generateSetupInstructions(trap, request);
    const runningTheTrap = this.generateRunningInstructions(trap, request);
    const commonQuestions = this.generateCommonQuestions(trap, request);
    const scalingGuidance = this.generateScalingGuidance(trap, request);
    const troubleshooting = this.generateTroubleshooting(trap, request);
    
    return {
      setupInstructions,
      runningTheTrap,
      commonQuestions,
      scalingGuidance,
      troubleshooting
    };
  }
  
  private static generateSetupInstructions(trap: Trap, request: TrapGenerationRequest): string[] {
    const instructions: string[] = [];
    
    instructions.push('Review trap mechanics and prepare necessary dice');
    instructions.push('Set up battle map or theater of mind description');
    instructions.push('Prepare environmental description and clues');
    instructions.push('Note all DCs and have reference materials ready');
    
    // Type-specific setup
    switch (request.trapType) {
      case 'magical':
        instructions.push('Prepare spell effect descriptions and components');
        instructions.push('Review magical detection and dispelling rules');
        break;
      case 'mechanical':
        instructions.push('Gather props or visual aids if available');
        instructions.push('Review tool proficiency and skill check rules');
        break;
    }
    
    return instructions;
  }
  
  private static generateRunningInstructions(trap: Trap, request: TrapGenerationRequest): string[] {
    const instructions: string[] = [];
    
    instructions.push('Describe the environment and allow perception checks');
    instructions.push('Handle detection attempts with appropriate DCs');
    instructions.push('Clearly explain trigger conditions when activated');
    instructions.push('Apply effects consistently and fairly');
    instructions.push('Allow creative solutions and alternative approaches');
    
    return instructions;
  }
  
  private static generateCommonQuestions(trap: Trap, request: TrapGenerationRequest): FAQ[] {
    const faqs: FAQ[] = [];
    
    faqs.push({
      question: 'Can the trap be triggered multiple times?',
      answer: trap.description?.includes('reset') ? 
        'Yes, the trap resets automatically and can trigger again.' :
        'No, the trap is single-use and becomes inert after triggering.'
    });
    
    faqs.push({
      question: 'What happens if the disarm attempt fails?',
      answer: 'The trap triggers immediately, affecting the character attempting to disarm it.'
    });
    
    faqs.push({
      question: 'Can the trap affect multiple characters?',
      answer: trap.description?.toLowerCase().includes('area') || trap.description?.toLowerCase().includes('all') ?
        'Yes, the trap affects multiple characters in the specified area.' :
        'No, the trap typically affects only the triggering character.'
    });
    
    return faqs;
  }
  
  private static generateScalingGuidance(trap: Trap, request: TrapGenerationRequest): ScalingGuidance {
    return {
      lowerLevel: [
        'Reduce damage dice by one size (d10 → d8)',
        'Lower all DCs by 2-3 points',
        'Add more obvious warning signs',
        'Provide easier alternative solutions'
      ],
      higherLevel: [
        'Increase damage dice by one size (d8 → d10)',
        'Raise all DCs by 2-3 points',
        'Add secondary effects or conditions',
        'Include magical enhancements'
      ],
      largerParty: [
        'Increase area of effect to catch more characters',
        'Add multiple trigger points',
        'Scale damage for additional targets',
        'Consider sequential activation'
      ],
      smallerParty: [
        'Reduce area of effect or number of triggers',
        'Lower damage to account for fewer healers',
        'Provide more obvious detection clues',
        'Add escape options or safe zones'
      ]
    };
  }
  
  private static generateTroubleshooting(trap: Trap, request: TrapGenerationRequest): string[] {
    const troubleshooting: string[] = [];
    
    troubleshooting.push('If players miss obvious clues, provide additional hints');
    troubleshooting.push('If trap seems too easy, add complications on the fly');
    troubleshooting.push('If trap seems too hard, allow creative workarounds');
    troubleshooting.push('If players get stuck, provide alternative approaches');
    troubleshooting.push('If mechanics are unclear, rule in favor of player agency');
    
    return troubleshooting;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TrapGenerator;
