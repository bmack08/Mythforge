// Mythwright Difficulty Scaling Suggestions - Task 80
// Dynamic difficulty adjustment system with real-time scaling recommendations

import type { SystemDesignBudget } from '../../types/content.types.js';
import { EncounterXPCalculator } from './encounter-xp-calculator.js';

// ============================================================================
// DIFFICULTY SCALING TYPES
// ============================================================================

export interface DifficultyScalingSuggestions {
  // Current State
  currentDifficulty: EncounterDifficulty;
  partyLevel: number;
  partySize: number;
  
  // Analysis
  difficultyAnalysis: DifficultyAnalysis;
  scalingOptions: ScalingOption[];
  
  // Environmental Factors
  environmentalModifiers: EnvironmentalModifier[];
  situationalFactors: SituationalFactor[];
  
  // Recommendations
  recommendations: DifficultyRecommendation[];
  warnings: DifficultyWarning[];
  
  // Implementation
  scalingMethods: ScalingMethod[];
  quickAdjustments: QuickAdjustment[];
}

export interface DifficultyAnalysis {
  // Current Assessment
  targetDifficulty: EncounterDifficulty;
  actualDifficulty: EncounterDifficulty;
  difficultyAccuracy: number; // 0-100%
  
  // Party Factors
  partyStrength: PartyStrength;
  partyComposition: PartyComposition;
  resourceLevel: ResourceLevel;
  experienceLevel: ExperienceLevel;
  
  // Encounter Factors
  actionEconomy: ActionEconomyAnalysis;
  damageOutput: DamageAnalysis;
  tacticalComplexity: TacticalComplexity;
  
  // Meta Factors
  sessionTiming: SessionTiming;
  campaignContext: CampaignContext;
  playerMorale: PlayerMorale;
}

export interface ScalingOption {
  id: string;
  name: string;
  description: string;
  scalingType: ScalingType;
  
  // Impact
  difficultyChange: DifficultyChange;
  implementationDifficulty: ImplementationDifficulty;
  playerVisibility: PlayerVisibility;
  
  // Details
  mechanicalChanges: MechanicalChange[];
  narrativeIntegration: string;
  reversibility: boolean;
  
  // Metrics
  estimatedTime: number; // minutes to implement
  riskLevel: RiskLevel;
  successProbability: number; // 0-100%
}

export interface EnvironmentalModifier {
  type: EnvironmentalType;
  name: string;
  description: string;
  
  // Effects
  difficultyModifier: number; // -3 to +3
  tacticalImpact: TacticalImpact;
  resourceCost: ResourceCost;
  
  // Implementation
  setupTime: number; // rounds
  duration: Duration;
  prerequisites: string[];
}

export interface SituationalFactor {
  factor: SituationalFactorType;
  impact: FactorImpact;
  description: string;
  recommendation: string;
  urgency: FactorUrgency;
}

export interface DifficultyRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  timing: RecommendationTiming;
  
  // Content
  title: string;
  description: string;
  implementation: string;
  expectedOutcome: string;
  
  // Metrics
  confidenceLevel: number; // 0-100%
  implementationCost: ImplementationCost;
  reversibility: boolean;
}

export interface DifficultyWarning {
  type: WarningType;
  severity: WarningSeverity;
  urgency: WarningUrgency;
  
  // Content
  message: string;
  consequence: string;
  mitigation: string;
  
  // Timing
  timeToImpact: number; // rounds or minutes
  windowToAct: number; // rounds or minutes
}

export interface ScalingMethod {
  method: ScalingMethodType;
  name: string;
  description: string;
  
  // Application
  applicablePhases: EncounterPhase[];
  requirements: string[];
  limitations: string[];
  
  // Examples
  examples: ScalingExample[];
  
  // Effectiveness
  effectivenessRating: number; // 0-100%
  playerAcceptance: number; // 0-100%
  narrativeIntegration: number; // 0-100%
}

export interface QuickAdjustment {
  name: string;
  description: string;
  implementationTime: number; // seconds
  
  // Effect
  difficultyChange: number; // -2 to +2
  visibility: AdjustmentVisibility;
  
  // Instructions
  instructions: string;
  undoInstructions?: string;
  
  // Constraints
  usageLimit: number; // per encounter
  cooldown: number; // rounds
}

// Supporting Interfaces
export interface ActionEconomyAnalysis {
  partyActions: number;
  enemyActions: number;
  ratio: number;
  balance: ActionEconomyBalance;
  recommendations: string[];
}

export interface DamageAnalysis {
  expectedPartyDPR: number;
  expectedEnemyDPR: number;
  timeToKill: number; // rounds
  riskOfTPK: number; // 0-100%
  damageBalance: DamageBalance;
}

export interface TacticalComplexity {
  terrainComplexity: number; // 0-10
  abilityComplexity: number; // 0-10
  objectiveComplexity: number; // 0-10
  overallComplexity: number; // 0-10
  cognitiveLoad: CognitiveLoad;
}

export interface MechanicalChange {
  type: MechanicalChangeType;
  target: string;
  change: string;
  impact: ChangeImpact;
}

export interface TacticalImpact {
  mobility: number; // -3 to +3
  visibility: number; // -3 to +3
  positioning: number; // -3 to +3
  strategy: number; // -3 to +3
}

export interface ScalingExample {
  scenario: string;
  before: string;
  after: string;
  explanation: string;
}

// Enums and Types
export type EncounterDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary';
export type PartyStrength = 'weak' | 'below_average' | 'average' | 'above_average' | 'strong' | 'overpowered';
export type PartyComposition = 'balanced' | 'heavy_damage' | 'heavy_tank' | 'heavy_support' | 'glass_cannon' | 'unconventional';
export type ResourceLevel = 'depleted' | 'low' | 'moderate' | 'high' | 'full';
export type ExperienceLevel = 'novice' | 'casual' | 'experienced' | 'veteran' | 'expert';
export type SessionTiming = 'opening' | 'early' | 'middle' | 'late' | 'climax' | 'ending';
export type CampaignContext = 'low_stakes' | 'moderate_stakes' | 'high_stakes' | 'climactic' | 'epilogue';
export type PlayerMorale = 'low' | 'cautious' | 'neutral' | 'confident' | 'overconfident';
export type ScalingType = 'monster_adjustment' | 'environmental' | 'tactical' | 'narrative' | 'resource' | 'time_pressure';
export type DifficultyChange = 'major_decrease' | 'minor_decrease' | 'no_change' | 'minor_increase' | 'major_increase';
export type ImplementationDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'complex';
export type PlayerVisibility = 'invisible' | 'subtle' | 'noticeable' | 'obvious' | 'transparent';
export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
export type EnvironmentalType = 'terrain' | 'weather' | 'lighting' | 'hazard' | 'cover' | 'elevation' | 'magical_effect';
export type ResourceCost = 'none' | 'minimal' | 'moderate' | 'significant' | 'major';
export type Duration = 'instant' | 'one_round' | 'short_term' | 'encounter' | 'extended' | 'permanent';
export type SituationalFactorType = 'time_pressure' | 'party_fatigue' | 'resource_depletion' | 'morale' | 'surprise' | 'terrain_advantage';
export type FactorImpact = 'major_negative' | 'minor_negative' | 'neutral' | 'minor_positive' | 'major_positive';
export type FactorUrgency = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationType = 'immediate_scaling' | 'gradual_adjustment' | 'environmental_change' | 'tactical_shift' | 'narrative_intervention';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationTiming = 'pre_encounter' | 'round_1' | 'early_encounter' | 'mid_encounter' | 'late_encounter' | 'post_encounter';
export type WarningType = 'tpk_risk' | 'trivial_encounter' | 'resource_drain' | 'time_overrun' | 'player_frustration';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WarningUrgency = 'low' | 'medium' | 'high' | 'immediate';
export type ScalingMethodType = 'hp_adjustment' | 'damage_adjustment' | 'add_remove_enemies' | 'environmental_hazards' | 'tactical_changes' | 'narrative_pressure';
export type EncounterPhase = 'preparation' | 'initiative' | 'early_combat' | 'mid_combat' | 'late_combat' | 'resolution';
export type AdjustmentVisibility = 'hidden' | 'subtle' | 'noticeable' | 'obvious';
export type ActionEconomyBalance = 'heavily_favors_party' | 'favors_party' | 'balanced' | 'favors_enemies' | 'heavily_favors_enemies';
export type DamageBalance = 'party_overwhelms' | 'party_advantage' | 'balanced' | 'enemy_advantage' | 'enemy_overwhelms';
export type CognitiveLoad = 'very_low' | 'low' | 'moderate' | 'high' | 'overwhelming';
export type MechanicalChangeType = 'stat_adjustment' | 'ability_modification' | 'add_feature' | 'remove_feature' | 'environmental_change';
export type ChangeImpact = 'minimal' | 'minor' | 'moderate' | 'major' | 'dramatic';
export type ImplementationCost = 'free' | 'minimal' | 'moderate' | 'significant' | 'expensive';

// ============================================================================
// DIFFICULTY SCALING CONSTANTS
// ============================================================================

// Difficulty scaling multipliers
const DIFFICULTY_MULTIPLIERS = {
  trivial: 0.25,
  easy: 0.5,
  medium: 1.0,
  hard: 1.5,
  deadly: 2.0,
  legendary: 3.0
};

// Party strength modifiers
const PARTY_STRENGTH_MODIFIERS = {
  weak: -0.5,
  below_average: -0.25,
  average: 0,
  above_average: 0.25,
  strong: 0.5,
  overpowered: 1.0
};

// Resource level impacts
const RESOURCE_LEVEL_MODIFIERS = {
  depleted: -0.4,
  low: -0.2,
  moderate: 0,
  high: 0.1,
  full: 0.2
};

// ============================================================================
// DIFFICULTY SCALING SUGGESTIONS CLASS
// ============================================================================

export class DifficultyScalingSuggestions {
  
  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================
  
  static generateScalingSuggestions(
    currentDifficulty: EncounterDifficulty,
    partyLevel: number,
    partySize: number,
    encounterData: EncounterData,
    partyState: PartyState,
    systemBudget?: SystemDesignBudget
  ): DifficultyScalingSuggestions {
    
    // Validate inputs
    this.validateInputs(currentDifficulty, partyLevel, partySize);
    
    // Analyze current difficulty
    const difficultyAnalysis = this.analyzeDifficulty(
      currentDifficulty,
      partyLevel,
      partySize,
      encounterData,
      partyState,
      systemBudget
    );
    
    // Generate scaling options
    const scalingOptions = this.generateScalingOptions(
      difficultyAnalysis,
      encounterData,
      partyState
    );
    
    // Identify environmental modifiers
    const environmentalModifiers = this.identifyEnvironmentalModifiers(
      encounterData.environment,
      difficultyAnalysis
    );
    
    // Assess situational factors
    const situationalFactors = this.assessSituationalFactors(
      partyState,
      encounterData,
      difficultyAnalysis
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      difficultyAnalysis,
      scalingOptions,
      situationalFactors
    );
    
    // Generate warnings
    const warnings = this.generateWarnings(
      difficultyAnalysis,
      partyState,
      encounterData
    );
    
    // Create scaling methods reference
    const scalingMethods = this.createScalingMethods();
    
    // Generate quick adjustments
    const quickAdjustments = this.generateQuickAdjustments(
      difficultyAnalysis,
      encounterData
    );
    
    return {
      currentDifficulty,
      partyLevel,
      partySize,
      difficultyAnalysis,
      scalingOptions,
      environmentalModifiers,
      situationalFactors,
      recommendations,
      warnings,
      scalingMethods,
      quickAdjustments
    };
  }
  
  // ============================================================================
  // DIFFICULTY ANALYSIS
  // ============================================================================
  
  private static analyzeDifficulty(
    currentDifficulty: EncounterDifficulty,
    partyLevel: number,
    partySize: number,
    encounterData: EncounterData,
    partyState: PartyState,
    systemBudget?: SystemDesignBudget
  ): DifficultyAnalysis {
    
    // Calculate XP budget for comparison
    const xpBudget = EncounterXPCalculator.calculateEncounterBudget(
      partyLevel,
      partySize,
      currentDifficulty
    );
    
    // Analyze party factors
    const partyStrength = this.assessPartyStrength(partyState, partyLevel);
    const partyComposition = this.analyzePartyComposition(partyState);
    const resourceLevel = this.assessResourceLevel(partyState);
    const experienceLevel = partyState.experienceLevel || 'casual';
    
    // Analyze encounter factors
    const actionEconomy = this.analyzeActionEconomy(encounterData, partySize);
    const damageOutput = this.analyzeDamageOutput(encounterData, partyState);
    const tacticalComplexity = this.analyzeTacticalComplexity(encounterData);
    
    // Assess meta factors
    const sessionTiming = partyState.sessionTiming || 'middle';
    const campaignContext = partyState.campaignContext || 'moderate_stakes';
    const playerMorale = partyState.playerMorale || 'neutral';
    
    // Calculate actual vs target difficulty
    const actualDifficulty = this.calculateActualDifficulty(
      currentDifficulty,
      partyStrength,
      resourceLevel,
      actionEconomy,
      damageOutput
    );
    
    const difficultyAccuracy = this.calculateDifficultyAccuracy(
      currentDifficulty,
      actualDifficulty
    );
    
    return {
      targetDifficulty: currentDifficulty,
      actualDifficulty,
      difficultyAccuracy,
      partyStrength,
      partyComposition,
      resourceLevel,
      experienceLevel,
      actionEconomy,
      damageOutput,
      tacticalComplexity,
      sessionTiming,
      campaignContext,
      playerMorale
    };
  }
  
  // ============================================================================
  // SCALING OPTIONS GENERATION
  // ============================================================================
  
  private static generateScalingOptions(
    analysis: DifficultyAnalysis,
    encounterData: EncounterData,
    partyState: PartyState
  ): ScalingOption[] {
    const options: ScalingOption[] = [];
    
    // HP Adjustment Options
    if (analysis.actualDifficulty !== analysis.targetDifficulty) {
      const hpModifier = this.calculateHPModifier(analysis);
      options.push({
        id: 'hp_adjustment',
        name: 'Adjust Monster HP',
        description: `${hpModifier > 0 ? 'Increase' : 'Decrease'} monster hit points by ${Math.abs(hpModifier * 100)}%`,
        scalingType: 'monster_adjustment',
        difficultyChange: hpModifier > 0 ? 'minor_increase' : 'minor_decrease',
        implementationDifficulty: 'easy',
        playerVisibility: 'invisible',
        mechanicalChanges: [{
          type: 'stat_adjustment',
          target: 'monster_hp',
          change: `${hpModifier > 0 ? '+' : ''}${Math.round(hpModifier * 100)}%`,
          impact: 'moderate'
        }],
        narrativeIntegration: 'The creatures appear more/less hardy than expected',
        reversibility: true,
        estimatedTime: 1,
        riskLevel: 'low',
        successProbability: 95
      });
    }
    
    // Add/Remove Enemies
    if (analysis.actionEconomy.balance !== 'balanced') {
      const enemyAdjustment = this.calculateEnemyAdjustment(analysis);
      options.push({
        id: 'enemy_count_adjustment',
        name: enemyAdjustment > 0 ? 'Add Reinforcements' : 'Remove Enemies',
        description: `${enemyAdjustment > 0 ? 'Add' : 'Remove'} ${Math.abs(enemyAdjustment)} enemy/enemies`,
        scalingType: 'monster_adjustment',
        difficultyChange: enemyAdjustment > 0 ? 'minor_increase' : 'minor_decrease',
        implementationDifficulty: 'moderate',
        playerVisibility: 'obvious',
        mechanicalChanges: [{
          type: 'add_feature',
          target: 'encounter',
          change: `${enemyAdjustment > 0 ? 'Add' : 'Remove'} ${Math.abs(enemyAdjustment)} enemies`,
          impact: 'major'
        }],
        narrativeIntegration: enemyAdjustment > 0 ? 'Reinforcements arrive' : 'Some enemies flee or are incapacitated',
        reversibility: enemyAdjustment < 0,
        estimatedTime: 3,
        riskLevel: 'moderate',
        successProbability: 80
      });
    }
    
    // Environmental Hazards
    if (analysis.tacticalComplexity.overallComplexity < 5) {
      options.push({
        id: 'environmental_hazard',
        name: 'Add Environmental Hazard',
        description: 'Introduce terrain hazards or environmental effects',
        scalingType: 'environmental',
        difficultyChange: 'minor_increase',
        implementationDifficulty: 'moderate',
        playerVisibility: 'obvious',
        mechanicalChanges: [{
          type: 'environmental_change',
          target: 'battlefield',
          change: 'Add hazardous terrain or effects',
          impact: 'moderate'
        }],
        narrativeIntegration: 'Environmental conditions change during the encounter',
        reversibility: false,
        estimatedTime: 5,
        riskLevel: 'moderate',
        successProbability: 75
      });
    }
    
    // Tactical Changes
    options.push({
      id: 'tactical_adjustment',
      name: 'Adjust Enemy Tactics',
      description: 'Modify how enemies behave and use their abilities',
      scalingType: 'tactical',
      difficultyChange: analysis.actualDifficulty < analysis.targetDifficulty ? 'minor_increase' : 'minor_decrease',
      implementationDifficulty: 'easy',
      playerVisibility: 'subtle',
      mechanicalChanges: [{
        type: 'ability_modification',
        target: 'enemy_ai',
        change: 'Adjust tactical behavior',
        impact: 'moderate'
      }],
      narrativeIntegration: 'Enemies adapt their strategy',
      reversibility: true,
      estimatedTime: 2,
      riskLevel: 'low',
      successProbability: 90
    });
    
    return options;
  }
  
  // ============================================================================
  // RECOMMENDATIONS AND WARNINGS
  // ============================================================================
  
  private static generateRecommendations(
    analysis: DifficultyAnalysis,
    scalingOptions: ScalingOption[],
    situationalFactors: SituationalFactor[]
  ): DifficultyRecommendation[] {
    const recommendations: DifficultyRecommendation[] = [];
    
    // Primary scaling recommendation
    if (analysis.difficultyAccuracy < 70) {
      const primaryOption = scalingOptions[0];
      if (primaryOption) {
        recommendations.push({
          type: 'immediate_scaling',
          priority: 'high',
          timing: 'round_1',
          title: 'Adjust Encounter Difficulty',
          description: `Current encounter difficulty doesn't match target. ${primaryOption.description}`,
          implementation: primaryOption.narrativeIntegration,
          expectedOutcome: 'Better difficulty balance and player engagement',
          confidenceLevel: primaryOption.successProbability,
          implementationCost: 'minimal',
          reversibility: primaryOption.reversibility
        });
      }
    }
    
    // Resource management recommendations
    if (analysis.resourceLevel === 'depleted' || analysis.resourceLevel === 'low') {
      recommendations.push({
        type: 'gradual_adjustment',
        priority: 'medium',
        timing: 'mid_encounter',
        title: 'Account for Low Resources',
        description: 'Party resources are low, consider reducing difficulty gradually',
        implementation: 'Reduce enemy damage output or provide tactical advantages',
        expectedOutcome: 'Prevent party defeat due to resource depletion',
        confidenceLevel: 80,
        implementationCost: 'minimal',
        reversibility: true
      });
    }
    
    // Action economy recommendations
    if (analysis.actionEconomy.balance === 'heavily_favors_enemies') {
      recommendations.push({
        type: 'tactical_shift',
        priority: 'high',
        timing: 'early_encounter',
        title: 'Address Action Economy Imbalance',
        description: 'Enemies have significant action economy advantage',
        implementation: 'Remove some enemies or provide party with additional actions',
        expectedOutcome: 'More balanced and engaging combat',
        confidenceLevel: 85,
        implementationCost: 'moderate',
        reversibility: false
      });
    }
    
    // Player morale recommendations
    if (analysis.playerMorale === 'low' || analysis.playerMorale === 'cautious') {
      recommendations.push({
        type: 'narrative_intervention',
        priority: 'medium',
        timing: 'pre_encounter',
        title: 'Boost Player Confidence',
        description: 'Players seem hesitant or demoralized',
        implementation: 'Provide tactical advantages or story elements that boost confidence',
        expectedOutcome: 'Improved player engagement and risk-taking',
        confidenceLevel: 70,
        implementationCost: 'minimal',
        reversibility: true
      });
    }
    
    return recommendations;
  }
  
  private static generateWarnings(
    analysis: DifficultyAnalysis,
    partyState: PartyState,
    encounterData: EncounterData
  ): DifficultyWarning[] {
    const warnings: DifficultyWarning[] = [];
    
    // TPK Risk Warning
    if (analysis.damageOutput.riskOfTPK > 70) {
      warnings.push({
        type: 'tpk_risk',
        severity: 'critical',
        urgency: 'immediate',
        message: 'High risk of Total Party Kill detected',
        consequence: 'Party may be defeated, potentially ending the campaign',
        mitigation: 'Immediately reduce enemy damage output or provide escape options',
        timeToImpact: 3,
        windowToAct: 2
      });
    }
    
    // Trivial Encounter Warning
    if (analysis.actualDifficulty === 'trivial' && analysis.targetDifficulty !== 'trivial') {
      warnings.push({
        type: 'trivial_encounter',
        severity: 'medium',
        urgency: 'medium',
        message: 'Encounter is too easy for the party',
        consequence: 'Players may become bored or disengaged',
        mitigation: 'Add complications, reinforcements, or environmental hazards',
        timeToImpact: 5,
        windowToAct: 10
      });
    }
    
    // Resource Drain Warning
    if (analysis.resourceLevel === 'depleted' && analysis.actualDifficulty >= 'hard') {
      warnings.push({
        type: 'resource_drain',
        severity: 'high',
        urgency: 'high',
        message: 'Party has limited resources for a difficult encounter',
        consequence: 'High chance of party defeat due to resource exhaustion',
        mitigation: 'Reduce encounter difficulty or provide resource recovery opportunities',
        timeToImpact: 2,
        windowToAct: 3
      });
    }
    
    return warnings;
  }
  
  // ============================================================================
  // SCALING METHODS AND QUICK ADJUSTMENTS
  // ============================================================================
  
  private static createScalingMethods(): ScalingMethod[] {
    return [
      {
        method: 'hp_adjustment',
        name: 'Hit Point Adjustment',
        description: 'Modify monster hit points on the fly',
        applicablePhases: ['early_combat', 'mid_combat', 'late_combat'],
        requirements: ['Monster stat blocks'],
        limitations: ['May affect encounter duration'],
        examples: [{
          scenario: 'Encounter too easy',
          before: 'Goblin with 7 HP',
          after: 'Goblin with 14 HP',
          explanation: 'Double HP to increase encounter duration and difficulty'
        }],
        effectivenessRating: 85,
        playerAcceptance: 95,
        narrativeIntegration: 70
      },
      {
        method: 'damage_adjustment',
        name: 'Damage Output Modification',
        description: 'Adjust monster damage rolls secretly',
        applicablePhases: ['early_combat', 'mid_combat', 'late_combat'],
        requirements: ['Damage rolls'],
        limitations: ['Requires careful balance'],
        examples: [{
          scenario: 'Risk of player death',
          before: 'Dragon deals 45 damage',
          after: 'Dragon deals 30 damage',
          explanation: 'Reduce damage to prevent character death while maintaining tension'
        }],
        effectivenessRating: 90,
        playerAcceptance: 85,
        narrativeIntegration: 80
      },
      {
        method: 'environmental_hazards',
        name: 'Environmental Complications',
        description: 'Add terrain hazards or environmental effects',
        applicablePhases: ['preparation', 'early_combat', 'mid_combat'],
        requirements: ['Environmental description'],
        limitations: ['May slow down combat'],
        examples: [{
          scenario: 'Need more tactical complexity',
          before: 'Empty room combat',
          after: 'Room with pit traps and unstable ceiling',
          explanation: 'Add environmental elements to increase tactical options and difficulty'
        }],
        effectivenessRating: 75,
        playerAcceptance: 80,
        narrativeIntegration: 95
      }
    ];
  }
  
  private static generateQuickAdjustments(
    analysis: DifficultyAnalysis,
    encounterData: EncounterData
  ): QuickAdjustment[] {
    const adjustments: QuickAdjustment[] = [];
    
    // HP Boost/Reduction
    adjustments.push({
      name: 'HP Quick Adjust',
      description: 'Instantly modify monster HP by ±25%',
      implementationTime: 5,
      difficultyChange: analysis.actualDifficulty < analysis.targetDifficulty ? 1 : -1,
      visibility: 'hidden',
      instructions: 'Mentally adjust monster HP values during combat',
      undoInstructions: 'Return to original HP values',
      usageLimit: 1,
      cooldown: 0
    });
    
    // Damage Fudging
    adjustments.push({
      name: 'Damage Fudge',
      description: 'Adjust damage rolls by ±3 points',
      implementationTime: 2,
      difficultyChange: 0.5,
      visibility: 'hidden',
      instructions: 'Modify damage rolls slightly up or down as needed',
      usageLimit: 3,
      cooldown: 1
    });
    
    // Tactical Shift
    adjustments.push({
      name: 'Enemy Behavior Change',
      description: 'Make enemies more/less aggressive',
      implementationTime: 10,
      difficultyChange: 1,
      visibility: 'subtle',
      instructions: 'Change enemy targeting or ability usage patterns',
      usageLimit: 2,
      cooldown: 2
    });
    
    return adjustments;
  }
  
  // ============================================================================
  // UTILITY AND CALCULATION METHODS
  // ============================================================================
  
  private static validateInputs(
    difficulty: EncounterDifficulty,
    partyLevel: number,
    partySize: number
  ): void {
    if (partyLevel < 1 || partyLevel > 20) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    if (partySize < 1 || partySize > 8) {
      throw new Error(`Invalid party size: ${partySize}. Must be 1-8.`);
    }
    const validDifficulties: EncounterDifficulty[] = ['trivial', 'easy', 'medium', 'hard', 'deadly', 'legendary'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}`);
    }
  }
  
  private static assessPartyStrength(partyState: PartyState, partyLevel: number): PartyStrength {
    let strengthScore = 50; // Base score
    
    // Level-based adjustments
    strengthScore += partyLevel * 2;
    
    // Equipment quality
    if (partyState.equipmentQuality) {
      const equipmentBonus = {
        poor: -20,
        average: 0,
        good: 10,
        excellent: 20,
        legendary: 40
      }[partyState.equipmentQuality] || 0;
      strengthScore += equipmentBonus;
    }
    
    // Resource levels
    if (partyState.resourceLevel) {
      const resourceBonus = {
        depleted: -30,
        low: -15,
        moderate: 0,
        high: 10,
        full: 20
      }[partyState.resourceLevel] || 0;
      strengthScore += resourceBonus;
    }
    
    // Convert to strength category
    if (strengthScore < 30) return 'weak';
    if (strengthScore < 45) return 'below_average';
    if (strengthScore < 70) return 'average';
    if (strengthScore < 85) return 'above_average';
    if (strengthScore < 100) return 'strong';
    return 'overpowered';
  }
  
  private static analyzePartyComposition(partyState: PartyState): PartyComposition {
    // Simplified composition analysis
    // In a real implementation, this would analyze actual character classes and builds
    return partyState.partyComposition || 'balanced';
  }
  
  private static assessResourceLevel(partyState: PartyState): ResourceLevel {
    return partyState.resourceLevel || 'moderate';
  }
  
  private static analyzeActionEconomy(encounterData: EncounterData, partySize: number): ActionEconomyAnalysis {
    const partyActions = partySize; // Simplified: 1 action per character
    const enemyActions = encounterData.monsters?.length || 1;
    const ratio = enemyActions / partyActions;
    
    let balance: ActionEconomyBalance;
    if (ratio < 0.5) balance = 'heavily_favors_party';
    else if (ratio < 0.8) balance = 'favors_party';
    else if (ratio <= 1.2) balance = 'balanced';
    else if (ratio <= 2.0) balance = 'favors_enemies';
    else balance = 'heavily_favors_enemies';
    
    const recommendations: string[] = [];
    if (balance === 'heavily_favors_enemies') {
      recommendations.push('Consider reducing enemy count or giving party additional actions');
    } else if (balance === 'heavily_favors_party') {
      recommendations.push('Consider adding more enemies or giving enemies multiple actions');
    }
    
    return {
      partyActions,
      enemyActions,
      ratio,
      balance,
      recommendations
    };
  }
  
  private static analyzeDamageOutput(encounterData: EncounterData, partyState: PartyState): DamageAnalysis {
    // Simplified damage analysis
    const expectedPartyDPR = (partyState.averageLevel || 5) * 8; // Rough estimate
    const expectedEnemyDPR = (encounterData.monsters?.length || 1) * 12; // Rough estimate
    
    const partyTTK = Math.max(1, Math.ceil((encounterData.totalEnemyHP || 50) / expectedPartyDPR));
    const enemyTTK = Math.max(1, Math.ceil((partyState.totalPartyHP || 100) / expectedEnemyDPR));
    
    const riskOfTPK = Math.max(0, Math.min(100, (partyTTK - enemyTTK) * 20 + 50));
    
    let damageBalance: DamageBalance;
    if (enemyTTK > partyTTK * 2) damageBalance = 'party_overwhelms';
    else if (enemyTTK > partyTTK * 1.5) damageBalance = 'party_advantage';
    else if (Math.abs(enemyTTK - partyTTK) <= 1) damageBalance = 'balanced';
    else if (partyTTK > enemyTTK * 1.5) damageBalance = 'enemy_advantage';
    else damageBalance = 'enemy_overwhelms';
    
    return {
      expectedPartyDPR,
      expectedEnemyDPR,
      timeToKill: Math.min(partyTTK, enemyTTK),
      riskOfTPK,
      damageBalance
    };
  }
  
  private static analyzeTacticalComplexity(encounterData: EncounterData): TacticalComplexity {
    // Simplified complexity analysis
    const terrainComplexity = encounterData.terrainFeatures?.length || 2;
    const abilityComplexity = encounterData.uniqueAbilities?.length || 3;
    const objectiveComplexity = encounterData.objectives?.length || 1;
    
    const overallComplexity = Math.min(10, (terrainComplexity + abilityComplexity + objectiveComplexity) / 3);
    
    let cognitiveLoad: CognitiveLoad;
    if (overallComplexity < 2) cognitiveLoad = 'very_low';
    else if (overallComplexity < 4) cognitiveLoad = 'low';
    else if (overallComplexity < 6) cognitiveLoad = 'moderate';
    else if (overallComplexity < 8) cognitiveLoad = 'high';
    else cognitiveLoad = 'overwhelming';
    
    return {
      terrainComplexity,
      abilityComplexity,
      objectiveComplexity,
      overallComplexity,
      cognitiveLoad
    };
  }
  
  private static calculateActualDifficulty(
    target: EncounterDifficulty,
    partyStrength: PartyStrength,
    resourceLevel: ResourceLevel,
    actionEconomy: ActionEconomyAnalysis,
    damageOutput: DamageAnalysis
  ): EncounterDifficulty {
    
    let difficultyScore = DIFFICULTY_MULTIPLIERS[target];
    
    // Apply party strength modifier
    difficultyScore += PARTY_STRENGTH_MODIFIERS[partyStrength];
    
    // Apply resource level modifier
    difficultyScore += RESOURCE_LEVEL_MODIFIERS[resourceLevel];
    
    // Apply action economy modifier
    if (actionEconomy.balance === 'heavily_favors_enemies') difficultyScore += 0.5;
    else if (actionEconomy.balance === 'heavily_favors_party') difficultyScore -= 0.5;
    
    // Apply damage balance modifier
    if (damageOutput.damageBalance === 'enemy_overwhelms') difficultyScore += 0.75;
    else if (damageOutput.damageBalance === 'party_overwhelms') difficultyScore -= 0.75;
    
    // Convert back to difficulty category
    if (difficultyScore <= 0.375) return 'trivial';
    if (difficultyScore <= 0.75) return 'easy';
    if (difficultyScore <= 1.25) return 'medium';
    if (difficultyScore <= 1.75) return 'hard';
    if (difficultyScore <= 2.5) return 'deadly';
    return 'legendary';
  }
  
  private static calculateDifficultyAccuracy(
    target: EncounterDifficulty,
    actual: EncounterDifficulty
  ): number {
    const targetValue = DIFFICULTY_MULTIPLIERS[target];
    const actualValue = DIFFICULTY_MULTIPLIERS[actual];
    const difference = Math.abs(targetValue - actualValue);
    
    return Math.max(0, 100 - (difference * 50));
  }
  
  private static calculateHPModifier(analysis: DifficultyAnalysis): number {
    const targetValue = DIFFICULTY_MULTIPLIERS[analysis.targetDifficulty];
    const actualValue = DIFFICULTY_MULTIPLIERS[analysis.actualDifficulty];
    
    return (targetValue - actualValue) * 0.5; // 50% HP change per difficulty step
  }
  
  private static calculateEnemyAdjustment(analysis: DifficultyAnalysis): number {
    if (analysis.actionEconomy.balance === 'heavily_favors_party') return 1;
    if (analysis.actionEconomy.balance === 'favors_party') return 1;
    if (analysis.actionEconomy.balance === 'heavily_favors_enemies') return -1;
    if (analysis.actionEconomy.balance === 'favors_enemies') return -1;
    return 0;
  }
  
  private static identifyEnvironmentalModifiers(
    environment: string | undefined,
    analysis: DifficultyAnalysis
  ): EnvironmentalModifier[] {
    const modifiers: EnvironmentalModifier[] = [];
    
    // Add context-appropriate environmental options
    modifiers.push({
      type: 'terrain',
      name: 'Difficult Terrain',
      description: 'Areas of challenging movement',
      difficultyModifier: 1,
      tacticalImpact: { mobility: -2, visibility: 0, positioning: 1, strategy: 1 },
      resourceCost: 'none',
      setupTime: 0,
      duration: 'encounter',
      prerequisites: []
    });
    
    modifiers.push({
      type: 'lighting',
      name: 'Dim Light',
      description: 'Reduced visibility conditions',
      difficultyModifier: 1,
      tacticalImpact: { mobility: 0, visibility: -2, positioning: 0, strategy: 1 },
      resourceCost: 'none',
      setupTime: 0,
      duration: 'encounter',
      prerequisites: []
    });
    
    return modifiers;
  }
  
  private static assessSituationalFactors(
    partyState: PartyState,
    encounterData: EncounterData,
    analysis: DifficultyAnalysis
  ): SituationalFactor[] {
    const factors: SituationalFactor[] = [];
    
    // Time pressure
    if (partyState.timeRemaining && partyState.timeRemaining < 30) {
      factors.push({
        factor: 'time_pressure',
        impact: 'minor_negative',
        description: 'Session time is running low',
        recommendation: 'Consider streamlining the encounter',
        urgency: 'medium'
      });
    }
    
    // Resource depletion
    if (analysis.resourceLevel === 'depleted' || analysis.resourceLevel === 'low') {
      factors.push({
        factor: 'resource_depletion',
        impact: 'major_negative',
        description: 'Party resources are significantly depleted',
        recommendation: 'Reduce encounter difficulty or provide resource recovery',
        urgency: 'high'
      });
    }
    
    return factors;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface EncounterData {
  environment?: string;
  monsters?: Array<{id: string; name: string; cr: number; hp: number}>;
  totalEnemyHP?: number;
  terrainFeatures?: string[];
  uniqueAbilities?: string[];
  objectives?: string[];
}

export interface PartyState {
  averageLevel?: number;
  totalPartyHP?: number;
  resourceLevel?: ResourceLevel;
  equipmentQuality?: 'poor' | 'average' | 'good' | 'excellent' | 'legendary';
  partyComposition?: PartyComposition;
  experienceLevel?: ExperienceLevel;
  sessionTiming?: SessionTiming;
  campaignContext?: CampaignContext;
  playerMorale?: PlayerMorale;
  timeRemaining?: number; // minutes
}

// ============================================================================
// EXPORT
// ============================================================================

export default DifficultyScalingSuggestions;
