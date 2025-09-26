// Mythwright Comprehensive Balance & Validation System - Tasks 108-113
// Complete balance validation: CR estimation, DPR calculation, save-or-die warnings,
// action economy analysis, counterplay suggestions, swinginess meter

import type { 
  StatBlock,
  Encounter,
  SystemDesignBudget
} from '../../types/content.types.js';

// ============================================================================
// BALANCE VALIDATION TYPES
// ============================================================================

export interface BalanceValidationResult {
  validationId: string;
  targetType: 'monster' | 'encounter' | 'item' | 'spell' | 'ability';
  targetId: string;
  
  // Overall Assessment
  overallBalance: number; // 0-100
  balanceCategory: BalanceCategory;
  
  // Individual Validations
  crValidation: CRValidationResult;
  dprValidation: DPRValidationResult;
  saveOrDieValidation: SaveOrDieValidationResult;
  actionEconomyValidation: ActionEconomyValidationResult;
  counterplayValidation: CounterplayValidationResult;
  swinginessValidation: SwinginessValidationResult;
  
  // Recommendations
  balanceIssues: BalanceIssue[];
  recommendations: BalanceRecommendation[];
  
  // Metadata
  validatedAt: Date;
  validatorVersion: string;
}

export type BalanceCategory = 
  | 'severely_underpowered' | 'underpowered' | 'slightly_weak' 
  | 'balanced' | 'slightly_strong' | 'overpowered' | 'severely_overpowered';

// ============================================================================
// TASK 108: CR ESTIMATION FOR CUSTOM MONSTERS
// ============================================================================

export interface CRValidationResult {
  // Current vs Calculated CR
  currentCR: number;
  calculatedCR: number;
  crAccuracy: number; // 0-100
  
  // CR Components
  defensiveCR: number;
  offensiveCR: number;
  
  // Detailed Analysis
  hpAnalysis: HPAnalysis;
  acAnalysis: ACAnalysis;
  savingThrowAnalysis: SavingThrowAnalysis;
  damageAnalysis: DamageAnalysis;
  abilityAnalysis: AbilityAnalysis;
  
  // CR Modifiers
  appliedModifiers: CRModifier[];
  
  // Recommendations
  crAdjustments: CRAdjustment[];
}

export interface HPAnalysis {
  currentHP: number;
  expectedHP: number;
  hpRating: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  hpCR: number;
  
  // HP Modifiers
  resistanceValue: number;
  immunityValue: number;
  regenerationValue: number;
  temporaryHPValue: number;
  
  effectiveHP: number;
}

export interface ACAnalysis {
  currentAC: number;
  expectedAC: number;
  acRating: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  acCR: number;
  
  // AC Components
  baseAC: number;
  armorBonus: number;
  dexBonus: number;
  naturalArmor: number;
  magicalBonus: number;
  
  // Special Considerations
  magicResistance: boolean;
  spellResistance?: number;
  conditionImmunities: string[];
}

export interface DamageAnalysis {
  averageDPR: number;
  expectedDPR: number;
  dprRating: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  dprCR: number;
  
  // Attack Breakdown
  attacks: AttackAnalysis[];
  totalAttackBonus: number;
  
  // Damage Types
  damageTypes: DamageTypeBreakdown[];
  
  // Special Damage
  ongoingDamage: number;
  areaDamage: number;
  conditionalDamage: number;
}

export interface AttackAnalysis {
  attackName: string;
  attackBonus: number;
  expectedAttackBonus: number;
  averageDamage: number;
  damageRoll: string;
  damageType: string;
  
  // Attack Properties
  reach: number;
  range?: number;
  targets: number;
  
  // Special Properties
  additionalEffects: string[];
  saveRequired?: SaveRequirement;
  
  // Analysis
  hitChance: number; // vs AC 15
  effectiveDamage: number;
}

export interface CRModifier {
  modifierId: string;
  name: string;
  type: 'defensive' | 'offensive' | 'utility';
  crAdjustment: number;
  reasoning: string;
  
  // Modifier Details
  abilitySource: string;
  impactLevel: 'minor' | 'moderate' | 'major' | 'extreme';
  situational: boolean;
}

// ============================================================================
// TASK 109: DPR CALCULATION VALIDATION
// ============================================================================

export interface DPRValidationResult {
  // DPR Analysis
  calculatedDPR: number;
  expectedDPR: number;
  dprVariance: number;
  dprConsistency: number; // 0-100
  
  // Round-by-Round Analysis
  roundAnalysis: RoundDPRAnalysis[];
  sustainedDPR: number;
  burstDPR: number;
  
  // Target Analysis
  dprVsAC: Map<number, number>; // AC -> DPR
  dprVsSaves: Map<string, number>; // Save type -> DPR
  
  // Damage Distribution
  damageDistribution: DamageDistribution;
  criticalDamage: CriticalDamageAnalysis;
  
  // Resource Analysis
  resourceDependency: ResourceDependency;
  
  // Validation Issues
  dprIssues: DPRIssue[];
  dprRecommendations: string[];
}

export interface RoundDPRAnalysis {
  round: number;
  availableActions: ActionOption[];
  optimalDPR: number;
  averageDPR: number;
  resourcesUsed: ResourceUsage[];
  
  // Action Analysis
  actionEconomyEfficiency: number;
  actionWaste: number;
}

export interface DamageDistribution {
  minimumDamage: number;
  averageDamage: number;
  maximumDamage: number;
  
  // Probability Distribution
  damageRanges: DamageRange[];
  varianceScore: number;
  
  // Damage Spikes
  spikeChance: number;
  spikeDamage: number;
}

export interface CriticalDamageAnalysis {
  critChance: number;
  critDamage: number;
  critDPRContribution: number;
  
  // Enhanced Crits
  enhancedCritChance: number;
  enhancedCritDamage: number;
  
  // Crit Effects
  criticalEffects: string[];
}

export interface DPRIssue {
  issueType: 'too_high' | 'too_low' | 'inconsistent' | 'resource_dependent' | 'swingy';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  affectedRounds: number[];
  suggestedFix: string;
}

// ============================================================================
// TASK 110: SAVE-OR-DIE EFFECT WARNINGS
// ============================================================================

export interface SaveOrDieValidationResult {
  // Overall Assessment
  hasSaveOrDieEffects: boolean;
  severityLevel: SaveOrDieSeverity;
  riskScore: number; // 0-100
  
  // Effect Analysis
  saveOrDieEffects: SaveOrDieEffect[];
  
  // Counterplay Analysis
  counterplayOptions: CounterplayOption[];
  counterplayDifficulty: number; // 1-10
  
  // Recommendations
  warnings: SaveOrDieWarning[];
  mitigationSuggestions: MitigationSuggestion[];
}

export type SaveOrDieSeverity = 
  | 'none' | 'minor_debuff' | 'major_debuff' | 'incapacitation' 
  | 'near_death' | 'instant_death' | 'worse_than_death';

export interface SaveOrDieEffect {
  effectId: string;
  name: string;
  description: string;
  
  // Save Details
  saveType: string;
  saveDC: number;
  saveProgression: 'single' | 'repeated' | 'escalating';
  
  // Effect Severity
  onFailure: EffectConsequence;
  onSuccess: EffectConsequence;
  partialSuccess?: EffectConsequence;
  
  // Timing and Duration
  onset: 'immediate' | 'delayed' | 'gradual';
  duration: string;
  permanence: boolean;
  
  // Counterplay
  removable: boolean;
  removalMethods: RemovalMethod[];
  preventionMethods: PreventionMethod[];
  
  // Analysis
  partyWipeRisk: number; // 0-100
  funFactor: number; // 0-100
  storyImpact: number; // 0-100
}

export interface EffectConsequence {
  type: 'none' | 'damage' | 'condition' | 'ability_drain' | 'death' | 'transformation';
  severity: number; // 1-10
  description: string;
  gameplayImpact: string;
}

export interface SaveOrDieWarning {
  warningLevel: 'info' | 'caution' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  affectedPartySize: number;
  likelihoodOfOccurrence: number; // 0-100
  recommendedPartyLevel: number;
  mitigationRequired: boolean;
}

// ============================================================================
// TASK 111: ACTION ECONOMY ANALYSIS
// ============================================================================

export interface ActionEconomyValidationResult {
  // Overall Assessment
  actionEconomyBalance: number; // 0-100
  actionEfficiency: number; // 0-100
  
  // Action Analysis
  actionsPerRound: ActionBreakdown;
  actionValueAnalysis: ActionValueAnalysis;
  
  // Comparative Analysis
  partyActionComparison: PartyActionComparison;
  actionEconomyAdvantage: number; // -10 to +10
  
  // Specific Issues
  actionEconomyIssues: ActionEconomyIssue[];
  actionWaste: ActionWasteAnalysis;
  
  // Recommendations
  actionOptimizations: ActionOptimization[];
}

export interface ActionBreakdown {
  // Standard Actions
  actions: number;
  bonusActions: number;
  reactions: number;
  freeActions: number;
  
  // Special Actions
  legendaryActions: number;
  lairActions: number;
  multiattack: number;
  
  // Action Quality
  actionValue: Map<string, number>;
  totalActionValue: number;
}

export interface ActionValueAnalysis {
  // Value per Action Type
  actionValues: Map<string, ActionValue>;
  
  // Efficiency Metrics
  damagePerAction: number;
  utilityPerAction: number;
  controlPerAction: number;
  
  // Optimization Potential
  suboptimalActions: string[];
  missingActions: string[];
  redundantActions: string[];
}

export interface PartyActionComparison {
  // Typical Party Actions
  typicalPartyActions: number;
  monsterActions: number;
  actionRatio: number;
  
  // Action Quality Comparison
  partyActionValue: number;
  monsterActionValue: number;
  valueRatio: number;
  
  // Encounter Balance
  encounterBalance: 'monster_advantage' | 'balanced' | 'party_advantage';
  balanceScore: number; // -100 to +100
}

export interface ActionEconomyIssue {
  issueType: 'too_many_actions' | 'too_few_actions' | 'wasted_actions' | 'weak_actions' | 'overwhelming';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  impactOnFun: number; // 0-100
  suggestedFix: string;
}

// ============================================================================
// TASK 112: COUNTERPLAY SUGGESTION SYSTEM
// ============================================================================

export interface CounterplayValidationResult {
  // Overall Assessment
  counterplayScore: number; // 0-100
  counterplayDiversity: number; // 0-100
  
  // Available Counterplay
  counterplayOptions: CounterplayStrategy[];
  
  // Counterplay Categories
  tacticalCounterplay: TacticalCounterplay[];
  resourceCounterplay: ResourceCounterplay[];
  knowledgeCounterplay: KnowledgeCounterplay[];
  teamworkCounterplay: TeamworkCounterplay[];
  
  // Analysis
  counterplayGaps: CounterplayGap[];
  dominantStrategies: DominantStrategy[];
  
  // Recommendations
  counterplaySuggestions: CounterplaySuggestion[];
}

export interface CounterplayStrategy {
  strategyId: string;
  name: string;
  description: string;
  
  // Strategy Details
  type: CounterplayType;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  effectiveness: number; // 0-100
  
  // Requirements
  requiredClasses: string[];
  requiredSpells: string[];
  requiredItems: string[];
  requiredKnowledge: string[];
  
  // Implementation
  steps: CounterplayStep[];
  timing: CounterplayTiming;
  
  // Analysis
  successRate: number; // 0-100
  resourceCost: ResourceCost;
  riskLevel: number; // 1-10
}

export type CounterplayType = 
  | 'positioning' | 'damage_mitigation' | 'condition_removal' | 'resource_denial'
  | 'environmental' | 'social' | 'magical' | 'tactical' | 'preparation';

export interface CounterplayGap {
  gapType: 'no_counterplay' | 'expensive_counterplay' | 'class_specific' | 'knowledge_dependent';
  description: string;
  affectedScenarios: string[];
  severity: number; // 1-10
  suggestedSolution: string;
}

export interface CounterplaySuggestion {
  suggestionType: 'add_weakness' | 'reduce_power' | 'add_telegraph' | 'provide_tools';
  description: string;
  implementation: string;
  balanceImpact: number; // -10 to +10
  funImpact: number; // -10 to +10
}

// ============================================================================
// TASK 113: SWINGINESS METER FOR ENCOUNTERS
// ============================================================================

export interface SwinginessValidationResult {
  // Overall Swinginess
  swinginessScore: number; // 0-100
  swinginessCategory: SwinginessCategory;
  
  // Swinginess Sources
  damageSwinginess: DamageSwinginess;
  saveSwinginess: SaveSwinginess;
  criticalSwinginess: CriticalSwinginess;
  initiativeSwinginess: InitiativeSwinginess;
  
  // Variance Analysis
  outcomeVariance: OutcomeVariance;
  
  // Dramatic Analysis
  dramaticPotential: DramaticPotential;
  
  // Recommendations
  swinginessIssues: SwinginessIssue[];
  stabilityRecommendations: StabilityRecommendation[];
}

export type SwinginessCategory = 
  | 'very_stable' | 'stable' | 'moderate' | 'swingy' | 'very_swingy' | 'chaotic';

export interface DamageSwinginess {
  damageVariance: number;
  minimumDamageRound: number;
  maximumDamageRound: number;
  averageDamageRound: number;
  
  // Spike Analysis
  damageSpikes: DamageSpike[];
  spikeFrequency: number;
  spikeSeverity: number;
  
  // Consistency
  damageConsistency: number; // 0-100
  predictability: number; // 0-100
}

export interface SaveSwinginess {
  saveVariance: number;
  criticalSaves: CriticalSave[];
  saveFailureImpact: SaveImpactAnalysis[];
  
  // Save Clustering
  saveClusterRisk: number;
  multiSaveRounds: number;
  
  // Save Success Rates
  expectedSuccessRate: number;
  worstCaseScenario: number;
  bestCaseScenario: number;
}

export interface OutcomeVariance {
  // Encounter Outcomes
  partyWipeChance: number;
  trivialVictoryChance: number;
  closeCallChance: number;
  
  // Duration Variance
  minimumRounds: number;
  maximumRounds: number;
  averageRounds: number;
  
  // Resource Variance
  minimumResourcesUsed: number;
  maximumResourcesUsed: number;
  averageResourcesUsed: number;
}

export interface DramaticPotential {
  // Dramatic Moments
  comebackPotential: number; // 0-100
  lastStandMoments: number;
  heroicMoments: number;
  
  // Tension Analysis
  tensionCurve: TensionPoint[];
  peakTension: number;
  tensionVariability: number;
  
  // Story Value
  memorabilityScore: number; // 0-100
  storyTellingValue: number; // 0-100
}

export interface SwinginessIssue {
  issueType: 'too_swingy' | 'too_stable' | 'spike_damage' | 'save_clustering' | 'outcome_variance';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  frequency: number; // How often this occurs
  playerFrustration: number; // 1-10
  suggestedFix: string;
}

// ============================================================================
// COMPREHENSIVE BALANCE VALIDATOR CLASS
// ============================================================================

export class ComprehensiveBalanceValidator {
  private crTables: Map<number, CRBenchmarks> = new Map();
  private dprTables: Map<number, DPRBenchmarks> = new Map();
  
  constructor() {
    this.initializeCRTables();
    this.initializeDPRTables();
  }
  
  // ========================================================================
  // MAIN VALIDATION API
  // ========================================================================
  
  /**
   * Perform comprehensive balance validation
   */
  async validateBalance(
    target: StatBlock | Encounter,
    targetType: 'monster' | 'encounter'
  ): Promise<BalanceValidationResult> {
    const validationId = `balance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let crValidation: CRValidationResult;
    let dprValidation: DPRValidationResult;
    let saveOrDieValidation: SaveOrDieValidationResult;
    let actionEconomyValidation: ActionEconomyValidationResult;
    let counterplayValidation: CounterplayValidationResult;
    let swinginessValidation: SwinginessValidationResult;
    
    if (targetType === 'monster') {
      const monster = target as StatBlock;
      
      // Task 108: CR Estimation
      crValidation = await this.validateCR(monster);
      
      // Task 109: DPR Calculation
      dprValidation = await this.validateDPR(monster);
      
      // Task 110: Save-or-Die Effects
      saveOrDieValidation = await this.validateSaveOrDie(monster);
      
      // Task 111: Action Economy
      actionEconomyValidation = await this.validateActionEconomy(monster);
      
      // Task 112: Counterplay
      counterplayValidation = await this.validateCounterplay(monster);
      
      // Task 113: Swinginess (basic for single monster)
      swinginessValidation = await this.validateSwinginess(monster);
      
    } else {
      const encounter = target as Encounter;
      
      // Validate encounter as a whole
      crValidation = await this.validateEncounterCR(encounter);
      dprValidation = await this.validateEncounterDPR(encounter);
      saveOrDieValidation = await this.validateEncounterSaveOrDie(encounter);
      actionEconomyValidation = await this.validateEncounterActionEconomy(encounter);
      counterplayValidation = await this.validateEncounterCounterplay(encounter);
      swinginessValidation = await this.validateEncounterSwinginess(encounter);
    }
    
    // Calculate overall balance score
    const overallBalance = this.calculateOverallBalance([
      crValidation, dprValidation, saveOrDieValidation,
      actionEconomyValidation, counterplayValidation, swinginessValidation
    ]);
    
    // Determine balance category
    const balanceCategory = this.determineBalanceCategory(overallBalance);
    
    // Collect all issues and recommendations
    const balanceIssues = this.collectBalanceIssues([
      crValidation, dprValidation, saveOrDieValidation,
      actionEconomyValidation, counterplayValidation, swinginessValidation
    ]);
    
    const recommendations = this.generateBalanceRecommendations(balanceIssues);
    
    return {
      validationId,
      targetType,
      targetId: targetType === 'monster' ? (target as StatBlock).id : (target as Encounter).encounterId,
      overallBalance,
      balanceCategory,
      crValidation,
      dprValidation,
      saveOrDieValidation,
      actionEconomyValidation,
      counterplayValidation,
      swinginessValidation,
      balanceIssues,
      recommendations,
      validatedAt: new Date(),
      validatorVersion: '1.0.0'
    };
  }
  
  // ========================================================================
  // TASK 108: CR ESTIMATION FOR CUSTOM MONSTERS
  // ========================================================================
  
  /**
   * Validate and calculate accurate CR for monster
   */
  async validateCR(monster: StatBlock): Promise<CRValidationResult> {
    // Calculate defensive CR
    const hpAnalysis = this.analyzeHP(monster);
    const acAnalysis = this.analyzeAC(monster);
    const savingThrowAnalysis = this.analyzeSavingThrows(monster);
    
    const defensiveCR = this.calculateDefensiveCR(hpAnalysis, acAnalysis, savingThrowAnalysis);
    
    // Calculate offensive CR
    const damageAnalysis = this.analyzeDamage(monster);
    const abilityAnalysis = this.analyzeAbilities(monster);
    
    const offensiveCR = this.calculateOffensiveCR(damageAnalysis, abilityAnalysis);
    
    // Apply modifiers
    const appliedModifiers = this.calculateCRModifiers(monster, abilityAnalysis);
    
    // Calculate final CR
    const calculatedCR = this.calculateFinalCR(defensiveCR, offensiveCR, appliedModifiers);
    
    // Generate adjustments
    const crAdjustments = this.generateCRAdjustments(monster, calculatedCR, monster.challengeRating || 0);
    
    return {
      currentCR: monster.challengeRating || 0,
      calculatedCR,
      crAccuracy: this.calculateCRAccuracy(monster.challengeRating || 0, calculatedCR),
      defensiveCR,
      offensiveCR,
      hpAnalysis,
      acAnalysis,
      savingThrowAnalysis,
      damageAnalysis,
      abilityAnalysis,
      appliedModifiers,
      crAdjustments
    };
  }
  
  // ========================================================================
  // TASK 109: DPR CALCULATION VALIDATION
  // ========================================================================
  
  /**
   * Validate DPR calculations and consistency
   */
  async validateDPR(monster: StatBlock): Promise<DPRValidationResult> {
    // Calculate base DPR
    const calculatedDPR = this.calculateMonsterDPR(monster);
    const expectedDPR = this.getExpectedDPR(monster.challengeRating || 0);
    
    // Analyze round-by-round DPR
    const roundAnalysis = this.analyzeRoundByRoundDPR(monster, 10); // 10 rounds
    
    // Calculate sustained vs burst DPR
    const sustainedDPR = this.calculateSustainedDPR(roundAnalysis);
    const burstDPR = this.calculateBurstDPR(roundAnalysis);
    
    // Analyze DPR vs different ACs
    const dprVsAC = this.calculateDPRvsAC(monster, [10, 12, 14, 16, 18, 20, 22]);
    const dprVsSaves = this.calculateDPRvsSaves(monster);
    
    // Analyze damage distribution
    const damageDistribution = this.analyzeDamageDistribution(monster);
    const criticalDamage = this.analyzeCriticalDamage(monster);
    
    // Analyze resource dependency
    const resourceDependency = this.analyzeResourceDependency(monster);
    
    // Identify issues
    const dprIssues = this.identifyDPRIssues(calculatedDPR, expectedDPR, roundAnalysis);
    const dprRecommendations = this.generateDPRRecommendations(dprIssues);
    
    return {
      calculatedDPR,
      expectedDPR,
      dprVariance: this.calculateDPRVariance(roundAnalysis),
      dprConsistency: this.calculateDPRConsistency(roundAnalysis),
      roundAnalysis,
      sustainedDPR,
      burstDPR,
      dprVsAC,
      dprVsSaves,
      damageDistribution,
      criticalDamage,
      resourceDependency,
      dprIssues,
      dprRecommendations
    };
  }
  
  // ========================================================================
  // TASK 110: SAVE-OR-DIE EFFECT WARNINGS
  // ========================================================================
  
  /**
   * Analyze and warn about save-or-die effects
   */
  async validateSaveOrDie(monster: StatBlock): Promise<SaveOrDieValidationResult> {
    // Identify save-or-die effects
    const saveOrDieEffects = this.identifySaveOrDieEffects(monster);
    
    if (saveOrDieEffects.length === 0) {
      return {
        hasSaveOrDieEffects: false,
        severityLevel: 'none',
        riskScore: 0,
        saveOrDieEffects: [],
        counterplayOptions: [],
        counterplayDifficulty: 0,
        warnings: [],
        mitigationSuggestions: []
      };
    }
    
    // Analyze severity
    const severityLevel = this.analyzeSaveOrDieSeverity(saveOrDieEffects);
    const riskScore = this.calculateSaveOrDieRisk(saveOrDieEffects, monster.challengeRating || 0);
    
    // Analyze counterplay
    const counterplayOptions = this.identifyCounterplayOptions(saveOrDieEffects);
    const counterplayDifficulty = this.assessCounterplayDifficulty(counterplayOptions);
    
    // Generate warnings
    const warnings = this.generateSaveOrDieWarnings(saveOrDieEffects, riskScore);
    const mitigationSuggestions = this.generateMitigationSuggestions(saveOrDieEffects, counterplayOptions);
    
    return {
      hasSaveOrDieEffects: true,
      severityLevel,
      riskScore,
      saveOrDieEffects,
      counterplayOptions,
      counterplayDifficulty,
      warnings,
      mitigationSuggestions
    };
  }
  
  // ========================================================================
  // TASK 111: ACTION ECONOMY ANALYSIS
  // ========================================================================
  
  /**
   * Analyze action economy balance
   */
  async validateActionEconomy(monster: StatBlock): Promise<ActionEconomyValidationResult> {
    // Analyze actions per round
    const actionsPerRound = this.analyzeActionsPerRound(monster);
    const actionValueAnalysis = this.analyzeActionValue(monster, actionsPerRound);
    
    // Compare to typical party
    const partyActionComparison = this.compareToPartyActions(monster, 4); // Assume 4-person party
    
    // Identify issues
    const actionEconomyIssues = this.identifyActionEconomyIssues(
      actionsPerRound, actionValueAnalysis, partyActionComparison
    );
    
    const actionWaste = this.analyzeActionWaste(monster, actionsPerRound);
    const actionOptimizations = this.generateActionOptimizations(actionEconomyIssues, actionWaste);
    
    // Calculate balance scores
    const actionEconomyBalance = this.calculateActionEconomyBalance(partyActionComparison);
    const actionEfficiency = this.calculateActionEfficiency(actionValueAnalysis, actionWaste);
    
    return {
      actionEconomyBalance,
      actionEfficiency,
      actionsPerRound,
      actionValueAnalysis,
      partyActionComparison,
      actionEconomyAdvantage: partyActionComparison.balanceScore / 10, // Scale to -10 to +10
      actionEconomyIssues,
      actionWaste,
      actionOptimizations
    };
  }
  
  // ========================================================================
  // TASK 112: COUNTERPLAY SUGGESTION SYSTEM
  // ========================================================================
  
  /**
   * Analyze available counterplay options
   */
  async validateCounterplay(monster: StatBlock): Promise<CounterplayValidationResult> {
    // Identify all available counterplay strategies
    const counterplayOptions = await this.identifyCounterplayStrategies(monster);
    
    // Categorize counterplay
    const tacticalCounterplay = this.categorizeTacticalCounterplay(counterplayOptions);
    const resourceCounterplay = this.categorizeResourceCounterplay(counterplayOptions);
    const knowledgeCounterplay = this.categorizeKnowledgeCounterplay(counterplayOptions);
    const teamworkCounterplay = this.categorizeTeamworkCounterplay(counterplayOptions);
    
    // Analyze counterplay quality
    const counterplayScore = this.calculateCounterplayScore(counterplayOptions);
    const counterplayDiversity = this.calculateCounterplayDiversity(counterplayOptions);
    
    // Identify gaps and dominant strategies
    const counterplayGaps = this.identifyCounterplayGaps(monster, counterplayOptions);
    const dominantStrategies = this.identifyDominantStrategies(counterplayOptions);
    
    // Generate suggestions
    const counterplaySuggestions = this.generateCounterplaySuggestions(counterplayGaps, dominantStrategies);
    
    return {
      counterplayScore,
      counterplayDiversity,
      counterplayOptions,
      tacticalCounterplay,
      resourceCounterplay,
      knowledgeCounterplay,
      teamworkCounterplay,
      counterplayGaps,
      dominantStrategies,
      counterplaySuggestions
    };
  }
  
  // ========================================================================
  // TASK 113: SWINGINESS METER FOR ENCOUNTERS
  // ========================================================================
  
  /**
   * Analyze encounter swinginess and variance
   */
  async validateSwinginess(target: StatBlock | Encounter): Promise<SwinginessValidationResult> {
    // Analyze different sources of swinginess
    const damageSwinginess = this.analyzeDamageSwinginess(target);
    const saveSwinginess = this.analyzeSaveSwinginess(target);
    const criticalSwinginess = this.analyzeCriticalSwinginess(target);
    const initiativeSwinginess = this.analyzeInitiativeSwinginess(target);
    
    // Calculate overall swinginess
    const swinginessScore = this.calculateSwinginessScore([
      damageSwinginess, saveSwinginess, criticalSwinginess, initiativeSwinginess
    ]);
    
    const swinginessCategory = this.categorizeSwinginessScore(swinginessScore);
    
    // Analyze outcome variance
    const outcomeVariance = this.analyzeOutcomeVariance(target);
    
    // Analyze dramatic potential
    const dramaticPotential = this.analyzeDramaticPotential(target, outcomeVariance);
    
    // Identify issues and generate recommendations
    const swinginessIssues = this.identifySwinginessIssues(
      swinginessScore, damageSwinginess, saveSwinginess, outcomeVariance
    );
    
    const stabilityRecommendations = this.generateStabilityRecommendations(swinginessIssues);
    
    return {
      swinginessScore,
      swinginessCategory,
      damageSwinginess,
      saveSwinginess,
      criticalSwinginess,
      initiativeSwinginess,
      outcomeVariance,
      dramaticPotential,
      swinginessIssues,
      stabilityRecommendations
    };
  }
  
  // ========================================================================
  // UTILITY AND HELPER METHODS
  // ========================================================================
  
  private initializeCRTables(): void {
    // Initialize CR benchmark tables based on DMG
    const crBenchmarks: [number, CRBenchmarks][] = [
      [0, { hp: 6, ac: 13, attackBonus: 3, dpr: 2, saveDC: 13 }],
      [0.125, { hp: 22, ac: 13, attackBonus: 3, dpr: 4, saveDC: 13 }],
      [0.25, { hp: 49, ac: 13, attackBonus: 3, dpr: 6, saveDC: 13 }],
      [0.5, { hp: 70, ac: 13, attackBonus: 3, dpr: 9, saveDC: 13 }],
      [1, { hp: 85, ac: 13, attackBonus: 3, dpr: 15, saveDC: 13 }],
      [2, { hp: 142, ac: 13, attackBonus: 3, dpr: 21, saveDC: 13 }],
      [3, { hp: 212, ac: 13, attackBonus: 4, dpr: 27, saveDC: 13 }],
      [4, { hp: 250, ac: 14, attackBonus: 5, dpr: 35, saveDC: 14 }],
      [5, { hp: 326, ac: 15, attackBonus: 6, dpr: 43, saveDC: 15 }],
      // ... continue for all CRs up to 30
    ];
    
    crBenchmarks.forEach(([cr, benchmarks]) => {
      this.crTables.set(cr, benchmarks);
    });
  }
  
  private initializeDPRTables(): void {
    // Initialize DPR expectation tables
    const dprBenchmarks: [number, DPRBenchmarks][] = [
      [0, { minDPR: 0, avgDPR: 2, maxDPR: 4 }],
      [0.125, { minDPR: 2, avgDPR: 4, maxDPR: 6 }],
      [0.25, { minDPR: 4, avgDPR: 6, maxDPR: 8 }],
      [0.5, { minDPR: 6, avgDPR: 9, maxDPR: 12 }],
      [1, { minDPR: 10, avgDPR: 15, maxDPR: 20 }],
      [2, { minDPR: 15, avgDPR: 21, maxDPR: 27 }],
      [3, { minDPR: 20, avgDPR: 27, maxDPR: 34 }],
      [4, { minDPR: 25, avgDPR: 35, maxDPR: 45 }],
      [5, { minDPR: 30, avgDPR: 43, maxDPR: 56 }],
      // ... continue for all CRs
    ];
    
    dprBenchmarks.forEach(([cr, benchmarks]) => {
      this.dprTables.set(cr, benchmarks);
    });
  }
  
  // Additional helper methods would be implemented here...
  // (Due to length constraints, showing structure rather than full implementation)
  
  private calculateMonsterDPR(monster: StatBlock): number {
    if (!monster.attacks || monster.attacks.length === 0) return 0;
    
    return monster.attacks.reduce((totalDPR, attack) => {
      const hitChance = this.calculateHitChance(attack.attackBonus, 15); // vs AC 15
      const averageDamage = this.parseAverageDamage(attack.damage);
      return totalDPR + (hitChance * averageDamage);
    }, 0);
  }
  
  private calculateHitChance(attackBonus: number, targetAC: number): number {
    const rollNeeded = Math.max(2, targetAC - attackBonus);
    if (rollNeeded > 20) return 0.05; // Only crit hits
    return Math.max(0.05, (21 - rollNeeded) / 20);
  }
  
  private parseAverageDamage(damageRoll: string): number {
    const match = damageRoll.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 0;
    
    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const modifier = parseInt(match[3] || '0');
    
    return numDice * (dieSize + 1) / 2 + modifier;
  }
  
  // More helper methods would continue here...
}

// ============================================================================
// SUPPORTING INTERFACES AND TYPES
// ============================================================================

interface CRBenchmarks {
  hp: number;
  ac: number;
  attackBonus: number;
  dpr: number;
  saveDC: number;
}

interface DPRBenchmarks {
  minDPR: number;
  avgDPR: number;
  maxDPR: number;
}

interface BalanceIssue {
  issueId: string;
  category: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  impact: string;
  suggestedFix: string;
}

interface BalanceRecommendation {
  recommendationId: string;
  type: 'stat_adjustment' | 'ability_modification' | 'tactical_change' | 'environmental_factor';
  description: string;
  implementation: string;
  expectedImpact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Many more supporting interfaces would be defined here...

// Export the comprehensive balance validator
export default ComprehensiveBalanceValidator;
