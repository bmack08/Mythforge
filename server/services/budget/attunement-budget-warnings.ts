// Mythwright Attunement Budget Warnings - Task 79
// Magic item attunement tracking and warnings to prevent character overload

import type { SystemDesignBudget, MagicItem } from '../../types/content.types.js';

// ============================================================================
// ATTUNEMENT BUDGET TYPES
// ============================================================================

export interface AttunementBudgetAnalysis {
  // Party Information
  partyLevel: number;
  partySize: number;
  
  // Attunement Tracking
  totalAttunementSlots: number;
  usedAttunementSlots: number;
  availableAttunementSlots: number;
  
  // Per-Character Analysis
  characterAttunement: CharacterAttunementStatus[];
  
  // Magic Item Analysis
  magicItems: AttunedMagicItem[];
  pendingItems: PendingMagicItem[];
  
  // Budget Analysis
  attunementUtilization: number; // 0-100%
  distributionBalance: number; // How evenly distributed across party
  powerConcentration: number; // How concentrated powerful items are
  
  // Warnings and Recommendations
  warnings: AttunementWarning[];
  recommendations: AttunementRecommendation[];
  
  // Projections
  futureProjections: AttunementProjection[];
}

export interface CharacterAttunementStatus {
  characterId: string;
  characterName: string;
  level: number;
  class: string;
  
  // Attunement Capacity
  maxAttunementSlots: number;
  usedSlots: number;
  availableSlots: number;
  
  // Current Items
  attunedItems: AttunedMagicItem[];
  
  // Analysis
  powerLevel: number; // Combined power of attuned items
  itemSynergy: number; // How well items work together
  roleOptimization: number; // How well items fit character role
  
  // Warnings
  overloaded: boolean;
  underutilized: boolean;
  conflictingItems: AttunementConflict[];
}

export interface AttunedMagicItem {
  itemId: string;
  name: string;
  rarity: MagicItemRarity;
  itemType: MagicItemType;
  attunementRequired: boolean;
  
  // Attunement Details
  attunedBy?: string; // character ID
  attunementDate?: Date;
  
  // Power Analysis
  powerLevel: number; // 1-10 scale
  utilityScore: number; // How useful for the character
  versatility: number; // How many situations it helps with
  
  // Balance Concerns
  gameBreaking: boolean;
  stackingIssues: string[]; // Items that don't stack well
  maintenanceRequired: boolean; // Requires charges, etc.
}

export interface PendingMagicItem {
  itemId: string;
  name: string;
  rarity: MagicItemRarity;
  attunementRequired: boolean;
  
  // Assignment Analysis
  bestCandidate: string; // character ID
  alternativeCandidates: string[];
  
  // Impact Analysis
  powerIncrease: number;
  roleImprovement: number;
  partyBalance: number;
  
  // Concerns
  conflicts: AttunementConflict[];
  warnings: string[];
}

export interface AttunementConflict {
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedItems: string[];
  resolution: string;
}

export interface AttunementWarning {
  type: WarningType;
  severity: WarningSeverity;
  characterId?: string;
  itemId?: string;
  message: string;
  recommendation: string;
  urgency: WarningUrgency;
}

export interface AttunementRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  characterId?: string;
  itemId?: string;
  description: string;
  implementation: string;
  expectedBenefit: string;
}

export interface AttunementProjection {
  level: number;
  estimatedItems: number;
  attunementPressure: number; // 0-100%
  recommendedDistribution: CharacterItemDistribution[];
  potentialIssues: string[];
}

export interface CharacterItemDistribution {
  characterId: string;
  recommendedItems: number;
  itemTypes: MagicItemType[];
  powerLevel: number;
}

// Enums and Types
export type MagicItemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';
export type MagicItemType = 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'tool' | 'wondrous';
export type ConflictType = 'duplicate_effect' | 'contradictory_effect' | 'stacking_limitation' | 'slot_conflict' | 'theme_mismatch';
export type ConflictSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type WarningType = 'overloaded' | 'underutilized' | 'imbalanced' | 'power_creep' | 'conflict' | 'maintenance' | 'economy_impact';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WarningUrgency = 'low' | 'medium' | 'high' | 'immediate';
export type RecommendationType = 'redistribute' | 'acquire_new' | 'retire_item' | 'upgrade_item' | 'resolve_conflict' | 'balance_party';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// ATTUNEMENT RULES AND CONSTANTS
// ============================================================================

// Maximum attunement slots per character (PHB page 138)
const MAX_ATTUNEMENT_SLOTS = 3;

// Magic item power levels by rarity
const POWER_LEVELS_BY_RARITY = {
  common: 1,
  uncommon: 2,
  rare: 4,
  very_rare: 6,
  legendary: 8,
  artifact: 10
};

// Items that typically require attunement by rarity
const ATTUNEMENT_LIKELIHOOD = {
  common: 0.1,    // 10% of common items require attunement
  uncommon: 0.3,  // 30% of uncommon items require attunement
  rare: 0.6,      // 60% of rare items require attunement
  very_rare: 0.8, // 80% of very rare items require attunement
  legendary: 0.9, // 90% of legendary items require attunement
  artifact: 1.0   // 100% of artifacts require attunement
};

// Item types that commonly require attunement
const ATTUNEMENT_ITEM_TYPES = {
  weapon: 0.4,
  armor: 0.5,
  shield: 0.3,
  accessory: 0.7,
  tool: 0.2,
  wondrous: 0.6,
  consumable: 0.0 // Consumables never require attunement
};

// Power scaling thresholds
const POWER_SCALING_THRESHOLDS = {
  low: 8,      // Total power level 8 or less is low
  moderate: 15, // Total power level 9-15 is moderate
  high: 22,    // Total power level 16-22 is high
  extreme: 30  // Total power level 23+ is extreme
};

// ============================================================================
// ATTUNEMENT BUDGET WARNINGS CLASS
// ============================================================================

export class AttunementBudgetWarnings {
  
  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================
  
  static analyzeAttunementBudget(
    partyLevel: number,
    partySize: number,
    characters: CharacterInfo[],
    magicItems: MagicItem[],
    pendingItems: MagicItem[] = [],
    systemBudget?: SystemDesignBudget
  ): AttunementBudgetAnalysis {
    
    // Validate inputs
    this.validateInputs(partyLevel, partySize, characters);
    
    // Calculate total attunement capacity
    const totalAttunementSlots = partySize * MAX_ATTUNEMENT_SLOTS;
    
    // Analyze current attunement usage
    const characterAttunement = this.analyzeCharacterAttunement(characters, magicItems);
    const usedAttunementSlots = characterAttunement.reduce((sum, char) => sum + char.usedSlots, 0);
    const availableAttunementSlots = totalAttunementSlots - usedAttunementSlots;
    
    // Process magic items
    const attunedItems = magicItems.filter(item => item.attunementRequired && item.attunedBy);
    const pendingAnalysis = this.analyzePendingItems(pendingItems, characters, characterAttunement);
    
    // Calculate utilization metrics
    const attunementUtilization = (usedAttunementSlots / totalAttunementSlots) * 100;
    const distributionBalance = this.calculateDistributionBalance(characterAttunement);
    const powerConcentration = this.calculatePowerConcentration(characterAttunement);
    
    // Generate warnings and recommendations
    const warnings = this.generateWarnings(
      partyLevel,
      characterAttunement,
      attunedItems,
      pendingAnalysis,
      attunementUtilization,
      systemBudget
    );
    
    const recommendations = this.generateRecommendations(
      partyLevel,
      characterAttunement,
      attunedItems,
      pendingAnalysis,
      distributionBalance,
      powerConcentration
    );
    
    // Create future projections
    const futureProjections = this.createFutureProjections(
      partyLevel,
      partySize,
      characterAttunement,
      systemBudget
    );
    
    return {
      partyLevel,
      partySize,
      totalAttunementSlots,
      usedAttunementSlots,
      availableAttunementSlots,
      characterAttunement,
      magicItems: attunedItems,
      pendingItems: pendingAnalysis,
      attunementUtilization,
      distributionBalance,
      powerConcentration,
      warnings,
      recommendations,
      futureProjections
    };
  }
  
  // ============================================================================
  // CHARACTER ANALYSIS
  // ============================================================================
  
  private static analyzeCharacterAttunement(
    characters: CharacterInfo[],
    magicItems: MagicItem[]
  ): CharacterAttunementStatus[] {
    
    return characters.map(character => {
      // Get items attuned to this character
      const attunedItems = magicItems
        .filter(item => item.attunedBy === character.id && item.attunementRequired)
        .map(item => this.convertToAttunedItem(item, character));
      
      const usedSlots = attunedItems.length;
      const availableSlots = MAX_ATTUNEMENT_SLOTS - usedSlots;
      
      // Calculate power level
      const powerLevel = attunedItems.reduce((sum, item) => sum + item.powerLevel, 0);
      
      // Calculate item synergy
      const itemSynergy = this.calculateItemSynergy(attunedItems, character);
      
      // Calculate role optimization
      const roleOptimization = this.calculateRoleOptimization(attunedItems, character);
      
      // Check for conflicts
      const conflictingItems = this.identifyConflicts(attunedItems);
      
      return {
        characterId: character.id,
        characterName: character.name,
        level: character.level,
        class: character.class,
        maxAttunementSlots: MAX_ATTUNEMENT_SLOTS,
        usedSlots,
        availableSlots,
        attunedItems,
        powerLevel,
        itemSynergy,
        roleOptimization,
        overloaded: usedSlots > MAX_ATTUNEMENT_SLOTS,
        underutilized: usedSlots === 0 && character.level >= 5,
        conflictingItems
      };
    });
  }
  
  private static convertToAttunedItem(item: MagicItem, character: CharacterInfo): AttunedMagicItem {
    const powerLevel = POWER_LEVELS_BY_RARITY[item.rarity] || 1;
    const utilityScore = this.calculateUtilityScore(item, character);
    const versatility = this.calculateVersatility(item);
    
    return {
      itemId: item.id,
      name: item.name,
      rarity: item.rarity,
      itemType: item.itemType,
      attunementRequired: item.attunementRequired,
      attunedBy: character.id,
      attunementDate: item.attunementDate,
      powerLevel,
      utilityScore,
      versatility,
      gameBreaking: this.isGameBreaking(item, character.level),
      stackingIssues: this.identifyStackingIssues(item),
      maintenanceRequired: this.requiresMaintenance(item)
    };
  }
  
  // ============================================================================
  // PENDING ITEMS ANALYSIS
  // ============================================================================
  
  private static analyzePendingItems(
    pendingItems: MagicItem[],
    characters: CharacterInfo[],
    currentAttunement: CharacterAttunementStatus[]
  ): PendingMagicItem[] {
    
    return pendingItems
      .filter(item => item.attunementRequired)
      .map(item => {
        // Find best candidate for this item
        const candidates = this.evaluateCandidates(item, characters, currentAttunement);
        const bestCandidate = candidates[0]?.characterId || '';
        const alternativeCandidates = candidates.slice(1, 3).map(c => c.characterId);
        
        // Analyze impact
        const powerIncrease = POWER_LEVELS_BY_RARITY[item.rarity] || 1;
        const roleImprovement = this.calculateRoleImprovement(item, bestCandidate, characters);
        const partyBalance = this.calculatePartyBalanceImpact(item, bestCandidate, currentAttunement);
        
        // Identify conflicts
        const conflicts = this.identifyPendingConflicts(item, bestCandidate, currentAttunement);
        const warnings = this.generatePendingWarnings(item, bestCandidate, currentAttunement);
        
        return {
          itemId: item.id,
          name: item.name,
          rarity: item.rarity,
          attunementRequired: item.attunementRequired,
          bestCandidate,
          alternativeCandidates,
          powerIncrease,
          roleImprovement,
          partyBalance,
          conflicts,
          warnings
        };
      });
  }
  
  // ============================================================================
  // CALCULATIONS AND ANALYSIS
  // ============================================================================
  
  private static calculateDistributionBalance(characterAttunement: CharacterAttunementStatus[]): number {
    if (characterAttunement.length === 0) return 100;
    
    const usedSlots = characterAttunement.map(char => char.usedSlots);
    const average = usedSlots.reduce((sum, slots) => sum + slots, 0) / characterAttunement.length;
    
    // Calculate variance from average
    const variance = usedSlots.reduce((sum, slots) => sum + Math.pow(slots - average, 2), 0) / characterAttunement.length;
    
    // Convert to balance score (lower variance = better balance)
    return Math.max(0, 100 - (variance * 20));
  }
  
  private static calculatePowerConcentration(characterAttunement: CharacterAttunementStatus[]): number {
    if (characterAttunement.length === 0) return 0;
    
    const powerLevels = characterAttunement.map(char => char.powerLevel);
    const totalPower = powerLevels.reduce((sum, power) => sum + power, 0);
    const maxPower = Math.max(...powerLevels);
    
    if (totalPower === 0) return 0;
    
    // Concentration is the percentage of total power held by the most powerful character
    return (maxPower / totalPower) * 100;
  }
  
  private static calculateItemSynergy(items: AttunedMagicItem[], character: CharacterInfo): number {
    if (items.length <= 1) return 100;
    
    let synergyScore = 50; // Base score
    
    // Check for complementary item types
    const itemTypes = items.map(item => item.itemType);
    const uniqueTypes = new Set(itemTypes);
    
    // Variety bonus
    if (uniqueTypes.size === items.length) {
      synergyScore += 20; // All different types
    } else if (uniqueTypes.size > items.length / 2) {
      synergyScore += 10; // Good variety
    }
    
    // Class-specific synergies
    if (character.class === 'Fighter' || character.class === 'Paladin') {
      if (itemTypes.includes('weapon') && itemTypes.includes('armor')) {
        synergyScore += 15; // Weapon + armor synergy for martial classes
      }
    } else if (character.class === 'Wizard' || character.class === 'Sorcerer') {
      if (itemTypes.includes('wondrous') && itemTypes.includes('accessory')) {
        synergyScore += 15; // Magical item synergy for casters
      }
    }
    
    return Math.min(100, synergyScore);
  }
  
  private static calculateRoleOptimization(items: AttunedMagicItem[], character: CharacterInfo): number {
    if (items.length === 0) return 0;
    
    let optimizationScore = 0;
    
    items.forEach(item => {
      // Score based on how well the item fits the character's role
      let itemScore = 50; // Base score
      
      switch (character.class) {
        case 'Fighter':
        case 'Paladin':
        case 'Ranger':
          if (item.itemType === 'weapon' || item.itemType === 'armor') itemScore += 30;
          break;
        case 'Wizard':
        case 'Sorcerer':
        case 'Warlock':
          if (item.itemType === 'wondrous' || item.itemType === 'accessory') itemScore += 30;
          break;
        case 'Rogue':
          if (item.itemType === 'tool' || item.itemType === 'accessory') itemScore += 30;
          break;
        case 'Cleric':
        case 'Druid':
          if (item.itemType === 'shield' || item.itemType === 'wondrous') itemScore += 30;
          break;
      }
      
      optimizationScore += itemScore;
    });
    
    return Math.min(100, optimizationScore / items.length);
  }
  
  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================
  
  private static identifyConflicts(items: AttunedMagicItem[]): AttunementConflict[] {
    const conflicts: AttunementConflict[] = [];
    
    // Check for duplicate effects
    const effectMap = new Map<string, string[]>();
    items.forEach(item => {
      const effects = this.getItemEffects(item);
      effects.forEach(effect => {
        if (!effectMap.has(effect)) {
          effectMap.set(effect, []);
        }
        effectMap.get(effect)!.push(item.itemId);
      });
    });
    
    effectMap.forEach((itemIds, effect) => {
      if (itemIds.length > 1) {
        conflicts.push({
          type: 'duplicate_effect',
          severity: 'moderate',
          description: `Multiple items provide the same effect: ${effect}`,
          affectedItems: itemIds,
          resolution: 'Consider replacing one item with something that provides different benefits'
        });
      }
    });
    
    // Check for stacking limitations
    items.forEach(item => {
      if (item.stackingIssues.length > 0) {
        const conflictingItems = items.filter(other => 
          other.itemId !== item.itemId && 
          item.stackingIssues.some(issue => other.name.includes(issue))
        );
        
        if (conflictingItems.length > 0) {
          conflicts.push({
            type: 'stacking_limitation',
            severity: 'major',
            description: `${item.name} has stacking limitations with other items`,
            affectedItems: [item.itemId, ...conflictingItems.map(i => i.itemId)],
            resolution: 'Review stacking rules and consider alternative items'
          });
        }
      }
    });
    
    return conflicts;
  }
  
  // ============================================================================
  // WARNING GENERATION
  // ============================================================================
  
  private static generateWarnings(
    partyLevel: number,
    characterAttunement: CharacterAttunementStatus[],
    attunedItems: AttunedMagicItem[],
    pendingItems: PendingMagicItem[],
    utilization: number,
    systemBudget?: SystemDesignBudget
  ): AttunementWarning[] {
    const warnings: AttunementWarning[] = [];
    
    // Check for overloaded characters
    characterAttunement.forEach(character => {
      if (character.overloaded) {
        warnings.push({
          type: 'overloaded',
          severity: 'critical',
          characterId: character.characterId,
          message: `${character.characterName} has exceeded maximum attunement slots`,
          recommendation: 'Remove or redistribute magic items to stay within the 3-slot limit',
          urgency: 'immediate'
        });
      }
    });
    
    // Check for underutilized characters
    characterAttunement.forEach(character => {
      if (character.underutilized) {
        warnings.push({
          type: 'underutilized',
          severity: 'low',
          characterId: character.characterId,
          message: `${character.characterName} is not using any attunement slots`,
          recommendation: 'Consider providing magic items that require attunement',
          urgency: 'low'
        });
      }
    });
    
    // Check for power imbalance
    const powerLevels = characterAttunement.map(char => char.powerLevel);
    const maxPower = Math.max(...powerLevels);
    const minPower = Math.min(...powerLevels);
    
    if (maxPower - minPower > 10) {
      warnings.push({
        type: 'imbalanced',
        severity: 'medium',
        message: 'Significant power imbalance detected between party members',
        recommendation: 'Consider redistributing magic items or providing items to less powerful characters',
        urgency: 'medium'
      });
    }
    
    // Check for power creep
    const averagePowerLevel = powerLevels.reduce((sum, power) => sum + power, 0) / powerLevels.length;
    const expectedPowerLevel = partyLevel * 0.8; // Rough guideline
    
    if (averagePowerLevel > expectedPowerLevel * 1.5) {
      warnings.push({
        type: 'power_creep',
        severity: 'high',
        message: 'Party power level is significantly above expected for their level',
        recommendation: 'Monitor encounter difficulty and consider reducing magic item frequency',
        urgency: 'medium'
      });
    }
    
    // Check utilization
    if (utilization > 90) {
      warnings.push({
        type: 'overloaded',
        severity: 'high',
        message: 'Party attunement capacity is nearly exhausted',
        recommendation: 'Be cautious about introducing new attunement items',
        urgency: 'high'
      });
    }
    
    return warnings;
  }
  
  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================
  
  private static generateRecommendations(
    partyLevel: number,
    characterAttunement: CharacterAttunementStatus[],
    attunedItems: AttunedMagicItem[],
    pendingItems: PendingMagicItem[],
    distributionBalance: number,
    powerConcentration: number
  ): AttunementRecommendation[] {
    const recommendations: AttunementRecommendation[] = [];
    
    // Redistribution recommendations
    if (distributionBalance < 60) {
      recommendations.push({
        type: 'redistribute',
        priority: 'medium',
        description: 'Improve attunement distribution across party members',
        implementation: 'Move items from overloaded characters to those with available slots',
        expectedBenefit: 'Better party balance and resource utilization'
      });
    }
    
    // Power concentration recommendations
    if (powerConcentration > 60) {
      recommendations.push({
        type: 'balance_party',
        priority: 'medium',
        description: 'Reduce power concentration in a single character',
        implementation: 'Distribute powerful items more evenly across the party',
        expectedBenefit: 'More balanced party dynamics and encounter design flexibility'
      });
    }
    
    // Individual character recommendations
    characterAttunement.forEach(character => {
      if (character.availableSlots > 0 && character.level >= 5) {
        recommendations.push({
          type: 'acquire_new',
          priority: 'low',
          characterId: character.characterId,
          description: `${character.characterName} has unused attunement slots`,
          implementation: 'Provide appropriate magic items for this character',
          expectedBenefit: 'Increased character power and engagement'
        });
      }
      
      if (character.roleOptimization < 50) {
        recommendations.push({
          type: 'upgrade_item',
          priority: 'medium',
          characterId: character.characterId,
          description: `${character.characterName}'s items don't optimize their role well`,
          implementation: 'Replace items with ones more suited to their class and playstyle',
          expectedBenefit: 'Improved character effectiveness and player satisfaction'
        });
      }
      
      if (character.conflictingItems.length > 0) {
        recommendations.push({
          type: 'resolve_conflict',
          priority: 'high',
          characterId: character.characterId,
          description: `${character.characterName} has conflicting magic items`,
          implementation: 'Address item conflicts through replacement or rule clarification',
          expectedBenefit: 'Clearer mechanics and better item synergy'
        });
      }
    });
    
    return recommendations;
  }
  
  // ============================================================================
  // FUTURE PROJECTIONS
  // ============================================================================
  
  private static createFutureProjections(
    partyLevel: number,
    partySize: number,
    currentAttunement: CharacterAttunementStatus[],
    systemBudget?: SystemDesignBudget
  ): AttunementProjection[] {
    const projections: AttunementProjection[] = [];
    
    for (let level = partyLevel + 1; level <= 20; level += 2) {
      const estimatedItems = this.estimateItemsAtLevel(level, partySize, systemBudget);
      const attunementPressure = (estimatedItems * 0.6) / (partySize * MAX_ATTUNEMENT_SLOTS) * 100;
      
      const recommendedDistribution = currentAttunement.map(character => ({
        characterId: character.characterId,
        recommendedItems: Math.min(MAX_ATTUNEMENT_SLOTS, Math.ceil(estimatedItems / partySize)),
        itemTypes: this.getRecommendedItemTypes(character.class),
        powerLevel: Math.floor(level * 0.8)
      }));
      
      const potentialIssues: string[] = [];
      if (attunementPressure > 80) {
        potentialIssues.push('High attunement pressure - consider non-attunement items');
      }
      if (attunementPressure > 100) {
        potentialIssues.push('Attunement capacity exceeded - items will go unused');
      }
      
      projections.push({
        level,
        estimatedItems,
        attunementPressure,
        recommendedDistribution,
        potentialIssues
      });
    }
    
    return projections;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static validateInputs(partyLevel: number, partySize: number, characters: CharacterInfo[]): void {
    if (partyLevel < 1 || partyLevel > 20) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    if (partySize < 1 || partySize > 8) {
      throw new Error(`Invalid party size: ${partySize}. Must be 1-8.`);
    }
    if (characters.length !== partySize) {
      throw new Error(`Character count (${characters.length}) doesn't match party size (${partySize}).`);
    }
  }
  
  private static calculateUtilityScore(item: MagicItem, character: CharacterInfo): number {
    let score = 50; // Base utility
    
    // Class-specific bonuses
    const classBonus = this.getClassItemBonus(item.itemType, character.class);
    score += classBonus;
    
    // Rarity bonus
    const rarityBonus = POWER_LEVELS_BY_RARITY[item.rarity] * 5;
    score += rarityBonus;
    
    return Math.min(100, score);
  }
  
  private static calculateVersatility(item: MagicItem): number {
    // Placeholder - would analyze item properties to determine versatility
    const versatilityByType = {
      weapon: 60,
      armor: 40,
      shield: 30,
      accessory: 80,
      tool: 70,
      wondrous: 90,
      consumable: 20
    };
    
    return versatilityByType[item.itemType] || 50;
  }
  
  private static isGameBreaking(item: MagicItem, characterLevel: number): boolean {
    // Items that are significantly above character level or have game-breaking effects
    const itemPowerLevel = POWER_LEVELS_BY_RARITY[item.rarity];
    const expectedPowerLevel = Math.floor(characterLevel / 3);
    
    return itemPowerLevel > expectedPowerLevel * 2;
  }
  
  private static identifyStackingIssues(item: MagicItem): string[] {
    // Common stacking issues with magic items
    const stackingIssues: string[] = [];
    
    if (item.name.includes('Ring of Protection')) {
      stackingIssues.push('Protection');
    }
    if (item.name.includes('Cloak of Protection')) {
      stackingIssues.push('Protection');
    }
    if (item.itemType === 'armor') {
      stackingIssues.push('Armor Class');
    }
    
    return stackingIssues;
  }
  
  private static requiresMaintenance(item: MagicItem): boolean {
    // Items that require charges, daily uses, etc.
    return item.rarity === 'very_rare' || item.rarity === 'legendary' || 
           item.name.includes('Wand') || item.name.includes('Staff');
  }
  
  private static getItemEffects(item: AttunedMagicItem): string[] {
    // Placeholder - would parse item description for effects
    const effects: string[] = [];
    
    if (item.name.includes('Protection')) effects.push('AC Bonus');
    if (item.name.includes('Strength')) effects.push('Strength Enhancement');
    if (item.itemType === 'weapon') effects.push('Attack Bonus');
    
    return effects;
  }
  
  private static evaluateCandidates(
    item: MagicItem,
    characters: CharacterInfo[],
    currentAttunement: CharacterAttunementStatus[]
  ): Array<{characterId: string; score: number}> {
    return characters
      .map(character => {
        const attunement = currentAttunement.find(a => a.characterId === character.id);
        if (!attunement || attunement.availableSlots <= 0) {
          return { characterId: character.id, score: 0 };
        }
        
        let score = 50; // Base score
        
        // Class compatibility
        score += this.getClassItemBonus(item.itemType, character.class);
        
        // Available slots bonus
        score += attunement.availableSlots * 10;
        
        // Power balance consideration
        if (attunement.powerLevel < 5) score += 20; // Boost weak characters
        
        return { characterId: character.id, score };
      })
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score);
  }
  
  private static getClassItemBonus(itemType: MagicItemType, characterClass: string): number {
    const bonuses: Record<string, Record<MagicItemType, number>> = {
      Fighter: { weapon: 30, armor: 25, shield: 20, accessory: 10, tool: 5, wondrous: 10, consumable: 0 },
      Wizard: { weapon: 5, armor: 10, shield: 5, accessory: 25, tool: 15, wondrous: 30, consumable: 10 },
      Rogue: { weapon: 20, armor: 15, shield: 5, accessory: 25, tool: 30, wondrous: 15, consumable: 10 },
      Cleric: { weapon: 15, armor: 20, shield: 25, accessory: 20, tool: 10, wondrous: 20, consumable: 10 }
    };
    
    return bonuses[characterClass]?.[itemType] || 10;
  }
  
  private static calculateRoleImprovement(
    item: MagicItem,
    characterId: string,
    characters: CharacterInfo[]
  ): number {
    const character = characters.find(c => c.id === characterId);
    if (!character) return 0;
    
    return this.getClassItemBonus(item.itemType, character.class);
  }
  
  private static calculatePartyBalanceImpact(
    item: MagicItem,
    characterId: string,
    currentAttunement: CharacterAttunementStatus[]
  ): number {
    const character = currentAttunement.find(c => c.characterId === characterId);
    if (!character) return 0;
    
    const powerLevels = currentAttunement.map(c => c.powerLevel);
    const averagePower = powerLevels.reduce((sum, power) => sum + power, 0) / powerLevels.length;
    
    // Positive impact if giving to below-average character, negative if above-average
    return character.powerLevel < averagePower ? 20 : -10;
  }
  
  private static identifyPendingConflicts(
    item: MagicItem,
    characterId: string,
    currentAttunement: CharacterAttunementStatus[]
  ): AttunementConflict[] {
    const character = currentAttunement.find(c => c.characterId === characterId);
    if (!character) return [];
    
    const conflicts: AttunementConflict[] = [];
    
    // Check for slot conflicts
    if (character.availableSlots <= 0) {
      conflicts.push({
        type: 'slot_conflict',
        severity: 'critical',
        description: 'Character has no available attunement slots',
        affectedItems: [item.id],
        resolution: 'Remove an existing item or assign to different character'
      });
    }
    
    return conflicts;
  }
  
  private static generatePendingWarnings(
    item: MagicItem,
    characterId: string,
    currentAttunement: CharacterAttunementStatus[]
  ): string[] {
    const warnings: string[] = [];
    const character = currentAttunement.find(c => c.characterId === characterId);
    
    if (!character) {
      warnings.push('Character not found');
      return warnings;
    }
    
    if (character.availableSlots <= 0) {
      warnings.push('No available attunement slots');
    }
    
    if (character.powerLevel > 15) {
      warnings.push('Character already has high power level');
    }
    
    return warnings;
  }
  
  private static estimateItemsAtLevel(
    level: number,
    partySize: number,
    systemBudget?: SystemDesignBudget
  ): number {
    const magicPrevalence = systemBudget?.magicPrevalence || 'normal';
    const baseItems = Math.floor(level / 2) * partySize;
    
    const prevalenceMultiplier = {
      low: 0.5,
      normal: 1.0,
      high: 1.5
    }[magicPrevalence] || 1.0;
    
    return Math.floor(baseItems * prevalenceMultiplier);
  }
  
  private static getRecommendedItemTypes(characterClass: string): MagicItemType[] {
    const recommendations: Record<string, MagicItemType[]> = {
      Fighter: ['weapon', 'armor', 'shield'],
      Wizard: ['wondrous', 'accessory', 'tool'],
      Rogue: ['tool', 'accessory', 'weapon'],
      Cleric: ['shield', 'wondrous', 'armor']
    };
    
    return recommendations[characterClass] || ['wondrous', 'accessory'];
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface CharacterInfo {
  id: string;
  name: string;
  level: number;
  class: string;
}

// ============================================================================
// EXPORT
// ============================================================================

export default AttunementBudgetWarnings;
