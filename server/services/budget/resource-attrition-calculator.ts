// Mythwright Resource Attrition Calculator - Task 82
// Comprehensive resource tracking and depletion calculations for D&D campaigns

import type { SystemDesignBudget } from '../../types/content.types.js';

// ============================================================================
// RESOURCE ATTRITION TYPES
// ============================================================================

export interface ResourceAttritionCalculator {
  // Campaign Context
  campaignId: string;
  partyLevel: number;
  partySize: number;
  
  // Resource Tracking
  partyResources: PartyResourceState;
  resourceBudgets: ResourceBudget[];
  attritionRates: AttritionRateProfile;
  
  // Analysis
  currentAttrition: AttritionAnalysis;
  projectedDepletion: DepletionProjection;
  
  // Recommendations
  managementRecommendations: ResourceRecommendation[];
  replenishmentSuggestions: ReplenishmentSuggestion[];
  
  // Warnings
  criticalWarnings: ResourceWarning[];
  balanceAlerts: BalanceAlert[];
}

export interface PartyResourceState {
  // Core Resources
  hitPoints: HPResourceState;
  spellSlots: SpellSlotResourceState;
  classFeatures: ClassFeatureResourceState;
  
  // Equipment Resources
  ammunition: AmmunitionResourceState;
  consumables: ConsumableResourceState;
  equipment: EquipmentResourceState;
  
  // Meta Resources
  inspiration: InspirationResourceState;
  actionSurges: ActionResourceState;
  
  // Campaign Resources
  gold: number;
  reputation: ReputationResourceState;
  allies: AllyResourceState;
  information: InformationResourceState;
  
  // Time Resources
  timeRemaining: TimeResourceState;
  urgency: UrgencyLevel;
}

export interface ResourceBudget {
  resourceType: ResourceType;
  budgetType: BudgetType;
  
  // Budget Parameters
  dailyAllowance: number;
  weeklyAllowance: number;
  encounterAllowance: number;
  
  // Tracking
  currentUsage: number;
  remainingBudget: number;
  utilizationRate: number; // 0-100%
  
  // Analysis
  efficiencyScore: number; // 0-100%
  wasteLevel: number; // 0-100%
  shortfallRisk: number; // 0-100%
}

export interface AttritionRateProfile {
  profileName: string;
  
  // Base Attrition Rates (per encounter)
  hpAttritionRate: number; // percentage
  spellSlotAttritionRate: number; // percentage
  consumableAttritionRate: number; // percentage
  equipmentAttritionRate: number; // percentage
  
  // Modifiers
  difficultyModifier: number;
  environmentModifier: number;
  partyCompositionModifier: number;
  
  // Recovery Rates (per rest)
  shortRestRecoveryRate: number; // percentage
  longRestRecoveryRate: number; // percentage
  
  // Special Conditions
  attritionAcceleration: AttritionAcceleration[];
  recoveryBoosts: RecoveryBoost[];
}

export interface AttritionAnalysis {
  // Current State
  overallResourceLevel: ResourceLevel;
  resourceDistribution: ResourceDistribution;
  criticalResources: CriticalResource[];
  
  // Sustainability
  sustainabilityIndex: number; // 0-100%
  encountersRemaining: number;
  timeToDepletion: number; // hours
  
  // Efficiency
  resourceEfficiency: EfficiencyMetrics;
  wasteAnalysis: WasteAnalysis;
  
  // Risk Assessment
  depletionRisk: RiskAssessment;
  cascadingFailureRisk: number; // 0-100%
}

export interface DepletionProjection {
  // Timeline Projections
  nextHour: ResourceProjection;
  nextEncounter: ResourceProjection;
  nextRest: ResourceProjection;
  endOfDay: ResourceProjection;
  
  // Scenario Analysis
  bestCase: ScenarioProjection;
  expectedCase: ScenarioProjection;
  worstCase: ScenarioProjection;
  
  // Critical Points
  criticalThresholds: CriticalThreshold[];
  pointOfNoReturn: PointOfNoReturn;
}

export interface ResourceRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  urgency: RecommendationUrgency;
  
  // Content
  title: string;
  description: string;
  implementation: string;
  expectedBenefit: string;
  
  // Resource Impact
  resourceImpact: ResourceImpact;
  costBenefit: CostBenefitAnalysis;
  
  // Timing
  optimalTiming: OptimalTiming;
  implementationTime: number; // minutes
}

export interface ReplenishmentSuggestion {
  resourceType: ResourceType;
  replenishmentMethod: ReplenishmentMethod;
  
  // Details
  amount: number;
  cost: ReplenishmentCost;
  availability: Availability;
  
  // Timing
  urgency: ReplenishmentUrgency;
  optimalTiming: string;
  
  // Analysis
  efficiency: number; // 0-100%
  sustainability: number; // 0-100%
  riskReduction: number; // 0-100%
}

export interface ResourceWarning {
  warningType: WarningType;
  severity: WarningSeverity;
  urgency: WarningUrgency;
  
  // Content
  message: string;
  consequence: string;
  timeframe: string;
  
  // Affected Resources
  affectedResources: ResourceType[];
  cascadingEffects: CascadingEffect[];
  
  // Mitigation
  immediateActions: string[];
  preventionMeasures: string[];
}

export interface BalanceAlert {
  alertType: AlertType;
  imbalanceType: ImbalanceType;
  severity: AlertSeverity;
  
  // Details
  description: string;
  affectedPartyMembers: string[];
  recommendedActions: string[];
  
  // Metrics
  imbalanceScore: number; // 0-100%
  impactLevel: ImpactLevel;
}

// Supporting Interfaces
export interface HPResourceState {
  currentHP: CharacterHP[];
  totalMaxHP: number;
  currentTotalHP: number;
  averageHP: number;
  
  // Analysis
  hpDistribution: HPDistribution;
  deathSaveRisk: number; // 0-100%
  healingNeeded: number;
  
  // Projections
  encountersUntilDanger: number;
  sustainabilityRating: number; // 0-100%
}

export interface CharacterHP {
  characterId: string;
  characterName: string;
  maxHP: number;
  currentHP: number;
  temporaryHP: number;
  
  // Status
  hpPercentage: number;
  healthStatus: HealthStatus;
  deathSaves: DeathSaveState;
  
  // Analysis
  riskLevel: RiskLevel;
  priorityForHealing: number; // 0-100%
}

export interface SpellSlotResourceState {
  totalSlots: SpellSlotDistribution;
  remainingSlots: SpellSlotDistribution;
  utilizationRate: SpellSlotUtilization;
  
  // Analysis
  castingCapacity: CastingCapacity;
  spellEconomy: SpellEconomy;
  
  // Projections
  encountersUntilDepletion: SpellSlotProjection;
  optimalUsage: OptimalSpellUsage;
}

export interface ClassFeatureResourceState {
  features: ClassFeature[];
  totalUses: number;
  remainingUses: number;
  
  // Analysis
  utilizationEfficiency: number; // 0-100%
  strategicValue: number; // 0-100%
  
  // Recovery
  shortRestRecovery: number;
  longRestRecovery: number;
}

export interface AmmunitionResourceState {
  ammunitionTypes: AmmunitionType[];
  totalCount: number;
  criticalThreshold: number;
  
  // Analysis
  usageRate: number; // per encounter
  encountersRemaining: number;
  resupplyUrgency: ResupplyUrgency;
}

export interface ConsumableResourceState {
  consumables: Consumable[];
  totalValue: number;
  criticalItems: string[];
  
  // Analysis
  usageEfficiency: number; // 0-100%
  strategicReserve: number; // 0-100%
  replacementCost: number;
}

export interface EquipmentResourceState {
  equipment: Equipment[];
  totalDurability: number;
  averageCondition: number; // 0-100%
  
  // Analysis
  maintenanceNeeded: MaintenanceRequirement[];
  replacementSchedule: ReplacementSchedule[];
  functionalityRisk: number; // 0-100%
}

export interface TimeResourceState {
  availableTime: number; // hours
  timeConstraints: TimeConstraint[];
  urgencyFactors: UrgencyFactor[];
  
  // Analysis
  timeEfficiency: number; // 0-100%
  rushRisk: number; // 0-100%
  optimalPacing: PacingRecommendation;
}

// Enums and Types
export type ResourceType = 'hit_points' | 'spell_slots' | 'class_features' | 'ammunition' | 'consumables' | 'equipment' | 'gold' | 'time' | 'reputation' | 'allies' | 'information';
export type BudgetType = 'daily' | 'weekly' | 'encounter' | 'campaign' | 'emergency';
export type ResourceLevel = 'critical' | 'low' | 'moderate' | 'good' | 'excellent' | 'overabundant';
export type HealthStatus = 'unconscious' | 'critical' | 'wounded' | 'injured' | 'healthy' | 'full';
export type RiskLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'critical' | 'extreme';
export type UrgencyLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical' | 'emergency';
export type RecommendationType = 'conservation' | 'redistribution' | 'replenishment' | 'strategic_usage' | 'emergency_protocol';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationUrgency = 'low' | 'medium' | 'high' | 'immediate';
export type ReplenishmentMethod = 'purchase' | 'craft' | 'find' | 'rest' | 'spell' | 'ability' | 'ally_assistance';
export type ReplenishmentUrgency = 'low' | 'medium' | 'high' | 'critical';
export type WarningType = 'depletion_imminent' | 'cascade_failure' | 'inefficient_usage' | 'resource_imbalance' | 'strategic_vulnerability';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WarningUrgency = 'low' | 'medium' | 'high' | 'immediate';
export type AlertType = 'resource_imbalance' | 'efficiency_warning' | 'sustainability_concern' | 'strategic_vulnerability';
export type ImbalanceType = 'distribution_uneven' | 'utilization_poor' | 'hoarding_detected' | 'waste_excessive';
export type AlertSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type ImpactLevel = 'minimal' | 'minor' | 'moderate' | 'major' | 'severe';
export type ResupplyUrgency = 'none' | 'low' | 'medium' | 'high' | 'critical';

// Additional supporting types
export interface AttritionAcceleration {
  condition: string;
  multiplier: number;
  duration: string;
}

export interface RecoveryBoost {
  source: string;
  multiplier: number;
  applicableResources: ResourceType[];
}

export interface ResourceDistribution {
  evenlyDistributed: boolean;
  concentrationIndex: number; // 0-100%
  imbalanceScore: number; // 0-100%
  recommendedRedistribution: RedistributionPlan[];
}

export interface CriticalResource {
  resourceType: ResourceType;
  currentLevel: number;
  criticalThreshold: number;
  timeToDepletion: number;
  impactOfDepletion: string;
}

export interface EfficiencyMetrics {
  overallEfficiency: number; // 0-100%
  resourceSpecificEfficiency: ResourceEfficiency[];
  wasteLevel: number; // 0-100%
  optimizationPotential: number; // 0-100%
}

export interface WasteAnalysis {
  totalWaste: number;
  wasteByResource: ResourceWaste[];
  wasteReductionPotential: number;
  costOfWaste: number;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
}

export interface ResourceProjection {
  timestamp: string;
  projectedLevels: ResourceLevel[];
  confidence: number; // 0-100%
  assumptions: string[];
  criticalEvents: string[];
}

export interface ScenarioProjection {
  scenarioName: string;
  probability: number; // 0-100%
  resourceLevels: ResourceLevel[];
  keyEvents: string[];
  recommendations: string[];
}

export interface CriticalThreshold {
  resourceType: ResourceType;
  threshold: number;
  timeToThreshold: number;
  consequences: string[];
  preventionMeasures: string[];
}

export interface PointOfNoReturn {
  resourceType: ResourceType;
  threshold: number;
  timeToPoint: number;
  consequences: string;
  recoveryOptions: string[];
}

// ============================================================================
// RESOURCE ATTRITION CALCULATOR CLASS
// ============================================================================

export class ResourceAttritionCalculator {
  
  // ============================================================================
  // MAIN CALCULATION METHODS
  // ============================================================================
  
  static calculateResourceAttrition(
    campaignId: string,
    partyLevel: number,
    partySize: number,
    partyResources: PartyResourceState,
    encounterHistory: EncounterHistory[],
    systemBudget?: SystemDesignBudget
  ): ResourceAttritionCalculator {
    
    // Validate inputs
    this.validateInputs(partyLevel, partySize, partyResources);
    
    // Calculate resource budgets
    const resourceBudgets = this.calculateResourceBudgets(
      partyLevel,
      partySize,
      systemBudget
    );
    
    // Determine attrition rate profile
    const attritionRates = this.calculateAttritionRates(
      partyLevel,
      encounterHistory,
      systemBudget
    );
    
    // Analyze current attrition state
    const currentAttrition = this.analyzeCurrentAttrition(
      partyResources,
      resourceBudgets,
      attritionRates
    );
    
    // Project future depletion
    const projectedDepletion = this.projectResourceDepletion(
      partyResources,
      attritionRates,
      encounterHistory
    );
    
    // Generate management recommendations
    const managementRecommendations = this.generateManagementRecommendations(
      currentAttrition,
      projectedDepletion,
      partyResources
    );
    
    // Generate replenishment suggestions
    const replenishmentSuggestions = this.generateReplenishmentSuggestions(
      currentAttrition,
      projectedDepletion,
      systemBudget
    );
    
    // Generate warnings
    const criticalWarnings = this.generateCriticalWarnings(
      currentAttrition,
      projectedDepletion
    );
    
    // Generate balance alerts
    const balanceAlerts = this.generateBalanceAlerts(
      currentAttrition,
      partyResources
    );
    
    return {
      campaignId,
      partyLevel,
      partySize,
      partyResources,
      resourceBudgets,
      attritionRates,
      currentAttrition,
      projectedDepletion,
      managementRecommendations,
      replenishmentSuggestions,
      criticalWarnings,
      balanceAlerts
    };
  }
  
  // ============================================================================
  // RESOURCE BUDGET CALCULATIONS
  // ============================================================================
  
  private static calculateResourceBudgets(
    partyLevel: number,
    partySize: number,
    systemBudget?: SystemDesignBudget
  ): ResourceBudget[] {
    
    const budgets: ResourceBudget[] = [];
    
    // HP Budget
    const avgHPPerLevel = 8; // Rough average across classes
    const totalPartyHP = partyLevel * avgHPPerLevel * partySize;
    budgets.push({
      resourceType: 'hit_points',
      budgetType: 'daily',
      dailyAllowance: totalPartyHP * 0.7, // Can lose 70% HP per day safely
      weeklyAllowance: totalPartyHP * 3.5,
      encounterAllowance: totalPartyHP * 0.25,
      currentUsage: 0,
      remainingBudget: totalPartyHP * 0.7,
      utilizationRate: 0,
      efficiencyScore: 100,
      wasteLevel: 0,
      shortfallRisk: 0
    });
    
    // Spell Slot Budget
    const avgSpellSlotsPerLevel = Math.max(0, (partyLevel - 1) * 2); // Simplified
    const totalSpellSlots = avgSpellSlotsPerLevel * Math.ceil(partySize * 0.6); // ~60% casters
    budgets.push({
      resourceType: 'spell_slots',
      budgetType: 'daily',
      dailyAllowance: totalSpellSlots,
      weeklyAllowance: totalSpellSlots * 7,
      encounterAllowance: Math.ceil(totalSpellSlots / 6), // 6-8 encounters per day
      currentUsage: 0,
      remainingBudget: totalSpellSlots,
      utilizationRate: 0,
      efficiencyScore: 100,
      wasteLevel: 0,
      shortfallRisk: 0
    });
    
    // Gold Budget
    const goldPerLevel = [0, 94, 188, 375, 658, 1125, 1688, 2250, 2850, 3450, 4050, 4650, 5265, 5880, 6495, 7110, 7725, 8340, 8955, 9570, 10185];
    const avgGoldBudget = goldPerLevel[Math.min(20, partyLevel)] || 100;
    budgets.push({
      resourceType: 'gold',
      budgetType: 'weekly',
      dailyAllowance: avgGoldBudget * 0.1,
      weeklyAllowance: avgGoldBudget,
      encounterAllowance: avgGoldBudget * 0.05,
      currentUsage: 0,
      remainingBudget: avgGoldBudget,
      utilizationRate: 0,
      efficiencyScore: 100,
      wasteLevel: 0,
      shortfallRisk: 0
    });
    
    // Consumables Budget
    const consumableBudget = Math.max(5, partyLevel * 2) * partySize;
    budgets.push({
      resourceType: 'consumables',
      budgetType: 'weekly',
      dailyAllowance: consumableBudget * 0.2,
      weeklyAllowance: consumableBudget,
      encounterAllowance: consumableBudget * 0.1,
      currentUsage: 0,
      remainingBudget: consumableBudget,
      utilizationRate: 0,
      efficiencyScore: 100,
      wasteLevel: 0,
      shortfallRisk: 0
    });
    
    return budgets;
  }
  
  // ============================================================================
  // ATTRITION RATE CALCULATIONS
  // ============================================================================
  
  private static calculateAttritionRates(
    partyLevel: number,
    encounterHistory: EncounterHistory[],
    systemBudget?: SystemDesignBudget
  ): AttritionRateProfile {
    
    // Base rates by level
    const baseHPAttrition = Math.min(40, 15 + partyLevel * 1.5);
    const baseSpellSlotAttrition = Math.min(50, 20 + partyLevel * 2);
    const baseConsumableAttrition = Math.min(20, 5 + partyLevel * 0.5);
    const baseEquipmentAttrition = Math.min(10, 2 + partyLevel * 0.3);
    
    // Calculate modifiers based on encounter history
    let difficultyModifier = 1.0;
    let environmentModifier = 1.0;
    
    if (encounterHistory.length > 0) {
      const avgDifficulty = encounterHistory.reduce((sum, enc) => 
        sum + this.getDifficultyMultiplier(enc.difficulty), 0
      ) / encounterHistory.length;
      difficultyModifier = avgDifficulty;
      
      const environmentalEncounters = encounterHistory.filter(enc => 
        enc.environment === 'harsh' || enc.environment === 'dangerous'
      ).length;
      environmentModifier = 1.0 + (environmentalEncounters / encounterHistory.length) * 0.5;
    }
    
    // Recovery rates
    const shortRestRecoveryRate = Math.min(60, 30 + partyLevel * 2);
    const longRestRecoveryRate = Math.min(100, 80 + partyLevel);
    
    return {
      profileName: `Level ${partyLevel} Standard`,
      hpAttritionRate: baseHPAttrition * difficultyModifier * environmentModifier,
      spellSlotAttritionRate: baseSpellSlotAttrition * difficultyModifier,
      consumableAttritionRate: baseConsumableAttrition * difficultyModifier,
      equipmentAttritionRate: baseEquipmentAttrition * environmentModifier,
      difficultyModifier,
      environmentModifier,
      partyCompositionModifier: 1.0, // Would be calculated based on actual party composition
      shortRestRecoveryRate,
      longRestRecoveryRate,
      attritionAcceleration: [
        { condition: 'multiple_encounters_without_rest', multiplier: 1.5, duration: 'until_rest' },
        { condition: 'environmental_hazards', multiplier: 1.3, duration: 'encounter' }
      ],
      recoveryBoosts: [
        { source: 'healing_spells', multiplier: 1.2, applicableResources: ['hit_points'] },
        { source: 'short_rest_features', multiplier: 1.1, applicableResources: ['class_features'] }
      ]
    };
  }
  
  // ============================================================================
  // CURRENT STATE ANALYSIS
  // ============================================================================
  
  private static analyzeCurrentAttrition(
    partyResources: PartyResourceState,
    resourceBudgets: ResourceBudget[],
    attritionRates: AttritionRateProfile
  ): AttritionAnalysis {
    
    // Calculate overall resource level
    const resourceLevels = this.calculateResourceLevels(partyResources);
    const overallResourceLevel = this.determineOverallResourceLevel(resourceLevels);
    
    // Analyze resource distribution
    const resourceDistribution = this.analyzeResourceDistribution(partyResources);
    
    // Identify critical resources
    const criticalResources = this.identifyCriticalResources(partyResources, resourceBudgets);
    
    // Calculate sustainability
    const sustainabilityIndex = this.calculateSustainabilityIndex(
      partyResources,
      attritionRates
    );
    
    const encountersRemaining = this.calculateEncountersRemaining(
      partyResources,
      attritionRates
    );
    
    const timeToDepletion = this.calculateTimeToDepletion(
      partyResources,
      attritionRates
    );
    
    // Calculate efficiency metrics
    const resourceEfficiency = this.calculateResourceEfficiency(
      partyResources,
      resourceBudgets
    );
    
    // Analyze waste
    const wasteAnalysis = this.analyzeWaste(partyResources, resourceBudgets);
    
    // Assess depletion risk
    const depletionRisk = this.assessDepletionRisk(
      partyResources,
      attritionRates,
      criticalResources
    );
    
    const cascadingFailureRisk = this.calculateCascadingFailureRisk(
      criticalResources,
      resourceDistribution
    );
    
    return {
      overallResourceLevel,
      resourceDistribution,
      criticalResources,
      sustainabilityIndex,
      encountersRemaining,
      timeToDepletion,
      resourceEfficiency,
      wasteAnalysis,
      depletionRisk,
      cascadingFailureRisk
    };
  }
  
  // ============================================================================
  // PROJECTION CALCULATIONS
  // ============================================================================
  
  private static projectResourceDepletion(
    partyResources: PartyResourceState,
    attritionRates: AttritionRateProfile,
    encounterHistory: EncounterHistory[]
  ): DepletionProjection {
    
    // Project different time horizons
    const nextHour = this.projectResources(partyResources, attritionRates, 1, 'hour');
    const nextEncounter = this.projectResources(partyResources, attritionRates, 1, 'encounter');
    const nextRest = this.projectResources(partyResources, attritionRates, 4, 'encounter'); // ~4 encounters to rest
    const endOfDay = this.projectResources(partyResources, attritionRates, 8, 'encounter'); // ~8 encounters per day
    
    // Scenario analysis
    const bestCase = this.projectScenario(partyResources, attritionRates, 'best');
    const expectedCase = this.projectScenario(partyResources, attritionRates, 'expected');
    const worstCase = this.projectScenario(partyResources, attritionRates, 'worst');
    
    // Identify critical thresholds
    const criticalThresholds = this.identifyCriticalThresholds(
      partyResources,
      attritionRates
    );
    
    // Calculate point of no return
    const pointOfNoReturn = this.calculatePointOfNoReturn(
      partyResources,
      attritionRates
    );
    
    return {
      nextHour,
      nextEncounter,
      nextRest,
      endOfDay,
      bestCase,
      expectedCase,
      worstCase,
      criticalThresholds,
      pointOfNoReturn
    };
  }
  
  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================
  
  private static generateManagementRecommendations(
    currentAttrition: AttritionAnalysis,
    projectedDepletion: DepletionProjection,
    partyResources: PartyResourceState
  ): ResourceRecommendation[] {
    
    const recommendations: ResourceRecommendation[] = [];
    
    // Conservation recommendations
    if (currentAttrition.sustainabilityIndex < 60) {
      recommendations.push({
        type: 'conservation',
        priority: 'high',
        urgency: 'medium',
        title: 'Implement Resource Conservation',
        description: 'Current resource usage is unsustainable for long-term survival',
        implementation: 'Reduce resource expenditure by 25% across all categories',
        expectedBenefit: 'Extend operational capability by 50%',
        resourceImpact: {
          hitPoints: { change: 0, efficiency: 25 },
          spellSlots: { change: 0, efficiency: 30 },
          consumables: { change: 0, efficiency: 35 }
        },
        costBenefit: {
          implementationCost: 'low',
          benefit: 'high',
          riskReduction: 40
        },
        optimalTiming: {
          immediate: true,
          duration: 'until_replenishment',
          conditions: ['before_next_major_encounter']
        },
        implementationTime: 5
      });
    }
    
    // Redistribution recommendations
    if (currentAttrition.resourceDistribution.imbalanceScore > 70) {
      recommendations.push({
        type: 'redistribution',
        priority: 'medium',
        urgency: 'medium',
        title: 'Redistribute Resources',
        description: 'Resource distribution is uneven across party members',
        implementation: 'Transfer resources from well-supplied to resource-depleted members',
        expectedBenefit: 'Improved party survivability and efficiency',
        resourceImpact: {
          overall: { change: 0, efficiency: 20 }
        },
        costBenefit: {
          implementationCost: 'minimal',
          benefit: 'moderate',
          riskReduction: 25
        },
        optimalTiming: {
          immediate: false,
          duration: 'short_term',
          conditions: ['during_rest', 'before_challenging_encounter']
        },
        implementationTime: 15
      });
    }
    
    // Strategic usage recommendations
    if (currentAttrition.resourceEfficiency.overallEfficiency < 70) {
      recommendations.push({
        type: 'strategic_usage',
        priority: 'medium',
        urgency: 'low',
        title: 'Optimize Resource Usage Strategy',
        description: 'Current resource usage patterns are inefficient',
        implementation: 'Focus on high-impact, low-cost resource utilization',
        expectedBenefit: 'Increase effective resource capacity by 30%',
        resourceImpact: {
          efficiency: 30,
          waste: -40
        },
        costBenefit: {
          implementationCost: 'low',
          benefit: 'high',
          riskReduction: 20
        },
        optimalTiming: {
          immediate: false,
          duration: 'ongoing',
          conditions: ['during_planning_phases']
        },
        implementationTime: 30
      });
    }
    
    return recommendations;
  }
  
  private static generateReplenishmentSuggestions(
    currentAttrition: AttritionAnalysis,
    projectedDepletion: DepletionProjection,
    systemBudget?: SystemDesignBudget
  ): ReplenishmentSuggestion[] {
    
    const suggestions: ReplenishmentSuggestion[] = [];
    
    // Critical resource replenishment
    currentAttrition.criticalResources.forEach(resource => {
      if (resource.currentLevel < resource.criticalThreshold) {
        suggestions.push({
          resourceType: resource.resourceType,
          replenishmentMethod: this.getBestReplenishmentMethod(resource.resourceType),
          amount: resource.criticalThreshold - resource.currentLevel,
          cost: this.calculateReplenishmentCost(resource.resourceType, resource.criticalThreshold - resource.currentLevel),
          availability: this.assessAvailability(resource.resourceType),
          urgency: resource.timeToDepletion < 2 ? 'critical' : 'high',
          optimalTiming: resource.timeToDepletion < 1 ? 'immediate' : 'next_rest',
          efficiency: this.calculateReplenishmentEfficiency(resource.resourceType),
          sustainability: this.calculateReplenishmentSustainability(resource.resourceType),
          riskReduction: Math.min(90, (resource.criticalThreshold - resource.currentLevel) * 2)
        });
      }
    });
    
    // Proactive replenishment
    if (projectedDepletion.expectedCase.probability > 60) {
      suggestions.push({
        resourceType: 'consumables',
        replenishmentMethod: 'purchase',
        amount: 10,
        cost: { gold: 50, time: 30, effort: 'minimal' },
        availability: { chance: 90, location: 'town', restrictions: [] },
        urgency: 'medium',
        optimalTiming: 'next_town_visit',
        efficiency: 85,
        sustainability: 70,
        riskReduction: 35
      });
    }
    
    return suggestions;
  }
  
  // ============================================================================
  // WARNING GENERATION
  // ============================================================================
  
  private static generateCriticalWarnings(
    currentAttrition: AttritionAnalysis,
    projectedDepletion: DepletionProjection
  ): ResourceWarning[] {
    
    const warnings: ResourceWarning[] = [];
    
    // Imminent depletion warnings
    currentAttrition.criticalResources.forEach(resource => {
      if (resource.timeToDepletion < 2) {
        warnings.push({
          warningType: 'depletion_imminent',
          severity: 'critical',
          urgency: 'immediate',
          message: `${resource.resourceType} will be depleted within ${resource.timeToDepletion} encounters`,
          consequence: resource.impactOfDepletion,
          timeframe: `${resource.timeToDepletion} encounters`,
          affectedResources: [resource.resourceType],
          cascadingEffects: this.calculateCascadingEffects(resource.resourceType),
          immediateActions: [
            'Conserve current usage',
            'Seek immediate replenishment',
            'Consider tactical withdrawal'
          ],
          preventionMeasures: [
            'Establish minimum resource thresholds',
            'Implement early warning system',
            'Maintain strategic reserves'
          ]
        });
      }
    });
    
    // Cascade failure warnings
    if (currentAttrition.cascadingFailureRisk > 70) {
      warnings.push({
        warningType: 'cascade_failure',
        severity: 'critical',
        urgency: 'high',
        message: 'Multiple resource systems at risk of simultaneous failure',
        consequence: 'Complete operational capability loss, potential TPK',
        timeframe: 'Within 2-4 encounters',
        affectedResources: currentAttrition.criticalResources.map(r => r.resourceType),
        cascadingEffects: [
          { trigger: 'hp_depletion', effect: 'combat_ineffectiveness' },
          { trigger: 'spell_depletion', effect: 'healing_unavailable' },
          { trigger: 'consumable_depletion', effect: 'no_emergency_options' }
        ],
        immediateActions: [
          'Implement emergency conservation protocol',
          'Seek safe rest location immediately',
          'Consider strategic retreat'
        ],
        preventionMeasures: [
          'Never allow multiple critical resources simultaneously',
          'Maintain distributed resource reserves',
          'Establish clear withdrawal criteria'
        ]
      });
    }
    
    return warnings;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static validateInputs(
    partyLevel: number,
    partySize: number,
    partyResources: PartyResourceState
  ): void {
    if (partyLevel < 1 || partyLevel > 20) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    if (partySize < 1 || partySize > 8) {
      throw new Error(`Invalid party size: ${partySize}. Must be 1-8.`);
    }
    if (!partyResources) {
      throw new Error('Party resources state is required.');
    }
  }
  
  private static getDifficultyMultiplier(difficulty: string): number {
    const multipliers: Record<string, number> = {
      'trivial': 0.5,
      'easy': 0.75,
      'medium': 1.0,
      'hard': 1.25,
      'deadly': 1.5,
      'legendary': 2.0
    };
    return multipliers[difficulty] || 1.0;
  }
  
  private static calculateResourceLevels(partyResources: PartyResourceState): Record<ResourceType, number> {
    return {
      hit_points: (partyResources.hitPoints.currentTotalHP / partyResources.hitPoints.totalMaxHP) * 100,
      spell_slots: this.calculateSpellSlotPercentage(partyResources.spellSlots),
      class_features: (partyResources.classFeatures.remainingUses / Math.max(1, partyResources.classFeatures.totalUses)) * 100,
      ammunition: (partyResources.ammunition.totalCount / Math.max(1, partyResources.ammunition.criticalThreshold * 2)) * 100,
      consumables: Math.min(100, partyResources.consumables.totalValue / 10),
      equipment: partyResources.equipment.averageCondition,
      gold: Math.min(100, partyResources.gold / 100),
      time: (partyResources.timeRemaining.availableTime / Math.max(1, 24)) * 100,
      reputation: 75, // Placeholder
      allies: 75, // Placeholder
      information: 75 // Placeholder
    };
  }
  
  private static determineOverallResourceLevel(resourceLevels: Record<ResourceType, number>): ResourceLevel {
    const levels = Object.values(resourceLevels);
    const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    
    if (average >= 90) return 'excellent';
    if (average >= 70) return 'good';
    if (average >= 50) return 'moderate';
    if (average >= 30) return 'low';
    return 'critical';
  }
  
  private static calculateSpellSlotPercentage(spellSlots: SpellSlotResourceState): number {
    const totalSlots = Object.values(spellSlots.totalSlots).reduce((sum, slots) => sum + slots, 0);
    const remainingSlots = Object.values(spellSlots.remainingSlots).reduce((sum, slots) => sum + slots, 0);
    
    return totalSlots > 0 ? (remainingSlots / totalSlots) * 100 : 100;
  }
  
  private static analyzeResourceDistribution(partyResources: PartyResourceState): ResourceDistribution {
    // Simplified distribution analysis
    const hpVariance = this.calculateHPVariance(partyResources.hitPoints);
    const evenlyDistributed = hpVariance < 30;
    const concentrationIndex = Math.max(0, hpVariance - 20);
    const imbalanceScore = hpVariance;
    
    return {
      evenlyDistributed,
      concentrationIndex,
      imbalanceScore,
      recommendedRedistribution: evenlyDistributed ? [] : [
        {
          fromCharacter: 'high_resource_character',
          toCharacter: 'low_resource_character',
          resourceType: 'consumables',
          amount: 3,
          priority: 'medium'
        }
      ]
    };
  }
  
  private static calculateHPVariance(hpState: HPResourceState): number {
    if (hpState.currentHP.length === 0) return 0;
    
    const percentages = hpState.currentHP.map(char => char.hpPercentage);
    const average = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
    const variance = percentages.reduce((sum, pct) => sum + Math.pow(pct - average, 2), 0) / percentages.length;
    
    return Math.sqrt(variance);
  }
  
  private static identifyCriticalResources(
    partyResources: PartyResourceState,
    resourceBudgets: ResourceBudget[]
  ): CriticalResource[] {
    const criticalResources: CriticalResource[] = [];
    
    // Check HP
    const hpPercentage = (partyResources.hitPoints.currentTotalHP / partyResources.hitPoints.totalMaxHP) * 100;
    if (hpPercentage < 40) {
      criticalResources.push({
        resourceType: 'hit_points',
        currentLevel: hpPercentage,
        criticalThreshold: 40,
        timeToDepletion: this.calculateHPTimeToDepletion(partyResources.hitPoints),
        impactOfDepletion: 'Character death, combat ineffectiveness'
      });
    }
    
    // Check spell slots
    const spellSlotPercentage = this.calculateSpellSlotPercentage(partyResources.spellSlots);
    if (spellSlotPercentage < 30) {
      criticalResources.push({
        resourceType: 'spell_slots',
        currentLevel: spellSlotPercentage,
        criticalThreshold: 30,
        timeToDepletion: 3, // Simplified
        impactOfDepletion: 'No healing, reduced combat effectiveness'
      });
    }
    
    return criticalResources;
  }
  
  private static calculateHPTimeToDepletion(hpState: HPResourceState): number {
    // Simplified calculation based on average HP loss per encounter
    const avgHPLossPerEncounter = 20; // Rough estimate
    const currentTotalHP = hpState.currentTotalHP;
    
    return Math.max(0, Math.floor(currentTotalHP / avgHPLossPerEncounter));
  }
  
  // Additional placeholder methods for comprehensive functionality
  private static calculateSustainabilityIndex(partyResources: PartyResourceState, attritionRates: AttritionRateProfile): number {
    // Complex calculation considering all resource types and attrition rates
    return 65; // Placeholder
  }
  
  private static calculateEncountersRemaining(partyResources: PartyResourceState, attritionRates: AttritionRateProfile): number {
    // Calculate based on most limiting resource
    return 4; // Placeholder
  }
  
  private static calculateTimeToDepletion(partyResources: PartyResourceState, attritionRates: AttritionRateProfile): number {
    // Calculate in hours until critical resource depletion
    return 8; // Placeholder
  }
  
  private static calculateResourceEfficiency(partyResources: PartyResourceState, resourceBudgets: ResourceBudget[]): EfficiencyMetrics {
    return {
      overallEfficiency: 75,
      resourceSpecificEfficiency: [],
      wasteLevel: 15,
      optimizationPotential: 25
    };
  }
  
  private static analyzeWaste(partyResources: PartyResourceState, resourceBudgets: ResourceBudget[]): WasteAnalysis {
    return {
      totalWaste: 10,
      wasteByResource: [],
      wasteReductionPotential: 60,
      costOfWaste: 25
    };
  }
  
  private static assessDepletionRisk(partyResources: PartyResourceState, attritionRates: AttritionRateProfile, criticalResources: CriticalResource[]): RiskAssessment {
    return {
      overallRisk: criticalResources.length > 2 ? 'high' : 'moderate',
      riskFactors: [],
      mitigationStrategies: [],
      contingencyPlans: []
    };
  }
  
  private static calculateCascadingFailureRisk(criticalResources: CriticalResource[], resourceDistribution: ResourceDistribution): number {
    return criticalResources.length * 20 + resourceDistribution.imbalanceScore * 0.5;
  }
  
  // Additional placeholder implementations for projections and other complex calculations
  private static projectResources(partyResources: PartyResourceState, attritionRates: AttritionRateProfile, timeUnits: number, timeType: string): ResourceProjection {
    return {
      timestamp: new Date(Date.now() + timeUnits * 3600000).toISOString(),
      projectedLevels: [],
      confidence: 80,
      assumptions: ['Standard attrition rates', 'No major incidents'],
      criticalEvents: []
    };
  }
  
  private static projectScenario(partyResources: PartyResourceState, attritionRates: AttritionRateProfile, scenario: string): ScenarioProjection {
    return {
      scenarioName: scenario,
      probability: scenario === 'expected' ? 60 : scenario === 'best' ? 20 : 20,
      resourceLevels: [],
      keyEvents: [],
      recommendations: []
    };
  }
  
  private static identifyCriticalThresholds(partyResources: PartyResourceState, attritionRates: AttritionRateProfile): CriticalThreshold[] {
    return [];
  }
  
  private static calculatePointOfNoReturn(partyResources: PartyResourceState, attritionRates: AttritionRateProfile): PointOfNoReturn {
    return {
      resourceType: 'hit_points',
      threshold: 10,
      timeToPoint: 2,
      consequences: 'Party wipe likely',
      recoveryOptions: ['Immediate retreat', 'Emergency healing']
    };
  }
  
  private static getBestReplenishmentMethod(resourceType: ResourceType): ReplenishmentMethod {
    const methods: Record<ResourceType, ReplenishmentMethod> = {
      hit_points: 'spell',
      spell_slots: 'rest',
      class_features: 'rest',
      ammunition: 'purchase',
      consumables: 'purchase',
      equipment: 'craft',
      gold: 'find',
      time: 'rest',
      reputation: 'ally_assistance',
      allies: 'find',
      information: 'find'
    };
    return methods[resourceType] || 'purchase';
  }
  
  private static calculateReplenishmentCost(resourceType: ResourceType, amount: number): ReplenishmentCost {
    return {
      gold: amount * 10,
      time: amount * 5,
      effort: 'moderate'
    };
  }
  
  private static assessAvailability(resourceType: ResourceType): Availability {
    return {
      chance: 80,
      location: 'town',
      restrictions: []
    };
  }
  
  private static calculateReplenishmentEfficiency(resourceType: ResourceType): number {
    return 75; // Placeholder
  }
  
  private static calculateReplenishmentSustainability(resourceType: ResourceType): number {
    return 70; // Placeholder
  }
  
  private static calculateCascadingEffects(resourceType: ResourceType): CascadingEffect[] {
    return [
      { trigger: `${resourceType}_depletion`, effect: 'reduced_party_effectiveness' }
    ];
  }
  
  private static generateBalanceAlerts(currentAttrition: AttritionAnalysis, partyResources: PartyResourceState): BalanceAlert[] {
    const alerts: BalanceAlert[] = [];
    
    if (currentAttrition.resourceDistribution.imbalanceScore > 70) {
      alerts.push({
        alertType: 'resource_imbalance',
        imbalanceType: 'distribution_uneven',
        severity: 'moderate',
        description: 'Resources are unevenly distributed across party members',
        affectedPartyMembers: ['character_1', 'character_2'],
        recommendedActions: ['Redistribute healing potions', 'Share ammunition'],
        imbalanceScore: currentAttrition.resourceDistribution.imbalanceScore,
        impactLevel: 'moderate'
      });
    }
    
    return alerts;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface EncounterHistory {
  encounterId: string;
  difficulty: string;
  environment: string;
  resourcesLost: Record<ResourceType, number>;
  duration: number; // minutes
}

export interface DeathSaveState {
  successes: number;
  failures: number;
  stable: boolean;
}

export interface SpellSlotDistribution {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface SpellSlotUtilization {
  level1: number; // 0-100%
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface ClassFeature {
  featureId: string;
  name: string;
  maxUses: number;
  currentUses: number;
  recoveryType: 'short_rest' | 'long_rest' | 'daily';
}

export interface AmmunitionType {
  type: string;
  count: number;
  criticalThreshold: number;
}

export interface Consumable {
  itemId: string;
  name: string;
  quantity: number;
  value: number;
  criticalItem: boolean;
}

export interface Equipment {
  itemId: string;
  name: string;
  condition: number; // 0-100%
  durability: number;
  functionalityRisk: number; // 0-100%
}

// Additional complex types
export interface HPDistribution {
  healthy: number; // count
  injured: number;
  wounded: number;
  critical: number;
  unconscious: number;
}

export interface CastingCapacity {
  totalSlots: number;
  remainingSlots: number;
  utilizationRate: number; // 0-100%
  efficiency: number; // 0-100%
}

export interface SpellEconomy {
  averageSlotLevel: number;
  highLevelSlotsRemaining: number;
  economyHealth: number; // 0-100%
}

export interface SpellSlotProjection {
  level1: number; // encounters remaining
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface OptimalSpellUsage {
  recommendations: SpellUsageRecommendation[];
  conservationStrategy: string;
  emergencyThresholds: Record<string, number>;
}

export interface SpellUsageRecommendation {
  spellLevel: number;
  recommendedUsage: string;
  reasoning: string;
}

// More supporting types would be implemented as needed...

// ============================================================================
// EXPORT
// ============================================================================

export default ResourceAttritionCalculator;
