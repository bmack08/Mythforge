// Mythwright Treasure Allocation System - Task 77
// DMG-compliant treasure allocation with level-appropriate rewards and magic item distribution

import type { SystemDesignBudget } from '../../types/content.types.js';

// ============================================================================
// TREASURE ALLOCATION TYPES
// ============================================================================

export interface TreasureAllocation {
  // Basic Information
  partyLevel: number;
  partySize: number;
  encounterType: EncounterType;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  
  // Treasure Budget
  totalGoldValue: number;
  treasureParcel: TreasureParcel;
  
  // Breakdown
  coins: CoinAllocation;
  gems: GemAllocation[];
  artObjects: ArtObjectAllocation[];
  magicItems: MagicItemAllocation[];
  
  // Analysis
  treasureAnalysis: TreasureAnalysis;
  recommendations: TreasureRecommendation[];
  warnings: TreasureWarning[];
}

export interface TreasureParcel {
  parcelId: string;
  level: number;
  totalValue: number;
  rarity: TreasureRarity;
  theme: TreasureTheme;
  presentation: TreasurePresentationType;
  description: string;
}

export interface CoinAllocation {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
  totalValue: number;
  weight: number; // in pounds
  presentation: CoinPresentationType;
}

export interface GemAllocation {
  gemType: GemType;
  value: number;
  quantity: number;
  totalValue: number;
  description: string;
  rarity: GemRarity;
}

export interface ArtObjectAllocation {
  objectType: ArtObjectType;
  value: number;
  description: string;
  culturalOrigin: CulturalOrigin;
  condition: ObjectCondition;
  historicalSignificance?: string;
}

export interface MagicItemAllocation {
  itemType: MagicItemType;
  rarity: MagicItemRarity;
  value: number;
  attunementRequired: boolean;
  description: string;
  powerLevel: number;
  themeRelevance: number;
}

export interface TreasureAnalysis {
  balanceScore: number; // 0-100
  varietyScore: number; // How diverse the treasure is
  themeCoherence: number; // How well treasure fits encounter theme
  powerLevel: number; // Magic item power appropriateness
  economicImpact: number; // Effect on campaign economy
  carryCapacity: number; // How much the treasure weighs
  liquidityScore: number; // How easily convertible to gold
}

export interface TreasureRecommendation {
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high';
  description: string;
  implementation: string;
}

export interface TreasureWarning {
  type: WarningType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

export type EncounterType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'trap' | 'mixed';
export type TreasureRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
export type TreasureTheme = 'military' | 'religious' | 'arcane' | 'natural' | 'noble' | 'criminal' | 'ancient' | 'planar';
export type TreasurePresentationType = 'hoard' | 'individual' | 'scattered' | 'hidden' | 'trapped' | 'guarded';
export type CoinPresentationType = 'loose' | 'pouches' | 'chest' | 'scattered' | 'hidden';
export type GemType = 'ornamental' | 'semi_precious' | 'precious' | 'rare';
export type GemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare';
export type ArtObjectType = 'jewelry' | 'sculpture' | 'painting' | 'tapestry' | 'weapon' | 'armor' | 'religious' | 'book';
export type CulturalOrigin = 'local' | 'foreign' | 'ancient' | 'exotic' | 'planar' | 'unknown';
export type ObjectCondition = 'pristine' | 'good' | 'worn' | 'damaged' | 'restored';
export type MagicItemType = 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'tool' | 'wondrous';
export type MagicItemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';
export type RecommendationType = 'magic_item' | 'treasure_variety' | 'presentation' | 'theme_coherence' | 'weight_reduction';
export type WarningType = 'overloaded' | 'underpowered' | 'economic_disruption' | 'theme_mismatch' | 'attunement_overload';

// ============================================================================
// TREASURE TABLES (DMG PAGES 133-149)
// ============================================================================

// Individual treasure by CR (DMG page 136)
const INDIVIDUAL_TREASURE_BY_CR = {
  '0-4': {
    coins: { copper: [5, 6], silver: [0, 0], electrum: [0, 0], gold: [0, 0], platinum: [0, 0] },
    magicItemChance: 0
  },
  '5-10': {
    coins: { copper: [4, 6], silver: [2, 6], electrum: [0, 0], gold: [0, 0], platinum: [0, 0] },
    magicItemChance: 0
  },
  '11-16': {
    coins: { copper: [0, 0], silver: [4, 6], electrum: [2, 6], gold: [1, 6], platinum: [0, 0] },
    magicItemChance: 0
  },
  '17+': {
    coins: { copper: [0, 0], silver: [0, 0], electrum: [2, 6], gold: [2, 6], platinum: [1, 6] },
    magicItemChance: 0
  }
};

// Treasure hoard by level (DMG page 137-139)
const TREASURE_HOARD_BY_LEVEL = {
  '1-4': {
    baseCoins: { copper: [6, 6], silver: [0, 0], electrum: [0, 0], gold: [2, 6], platinum: [0, 0] },
    gemChance: 0.5,
    artChance: 0.5,
    magicItemChance: 0.06,
    magicItemTable: 'A'
  },
  '5-10': {
    baseCoins: { copper: [2, 6], silver: [2, 6], electrum: [0, 0], gold: [6, 6], platinum: [0, 0] },
    gemChance: 0.54,
    artChance: 0.54,
    magicItemChance: 0.16,
    magicItemTable: 'B'
  },
  '11-16': {
    baseCoins: { copper: [0, 0], silver: [0, 0], electrum: [0, 0], gold: [4, 6], platinum: [5, 6] },
    gemChance: 0.52,
    artChance: 0.52,
    magicItemChance: 0.36,
    magicItemTable: 'C'
  },
  '17-20': {
    baseCoins: { copper: [0, 0], silver: [0, 0], electrum: [0, 0], gold: [12, 6], platinum: [8, 6] },
    gemChance: 0.38,
    artChance: 0.38,
    magicItemChance: 0.54,
    magicItemTable: 'D'
  }
};

// Gem values by rarity (DMG page 134)
const GEM_VALUES = {
  ornamental: [10, 10, 10, 10, 10, 50, 50, 50, 50, 50], // 10gp or 50gp
  semi_precious: [100, 100, 100, 100, 100, 500, 500, 500, 500, 500], // 100gp or 500gp
  precious: [1000, 1000, 1000, 1000, 1000], // 1000gp
  rare: [5000, 5000, 5000, 5000, 5000] // 5000gp
};

// Art object values by category (DMG page 134)
const ART_OBJECT_VALUES = {
  '25gp': ['Silver ewer', 'Carved bone statuette', 'Small gold bracelet', 'Cloth-of-gold vestments'],
  '250gp': ['Gold ring with bloodstones', 'Carved ivory statuette', 'Large gold bracelet', 'Silver necklace with gems'],
  '750gp': ['Silver chalice with moonstones', 'Silver-plated steel longsword', 'Carved harp of exotic wood', 'Small gold idol'],
  '2500gp': ['Gold chalice with emeralds', 'Gold jewelry box with platinum inlay', 'Painted gold war mask', 'Gold and ruby ring'],
  '7500gp': ['Jeweled gold crown', 'Jeweled platinum ring', 'Small gold statuette with gems', 'Gold cup with emeralds']
};

// Magic item rarity by level (DMG page 135)
const MAGIC_ITEM_RARITY_BY_LEVEL = {
  '1-4': { common: 0.5, uncommon: 0.4, rare: 0.1, very_rare: 0, legendary: 0 },
  '5-10': { common: 0.3, uncommon: 0.5, rare: 0.2, very_rare: 0, legendary: 0 },
  '11-16': { common: 0.1, uncommon: 0.3, rare: 0.4, very_rare: 0.2, legendary: 0 },
  '17-20': { common: 0.05, uncommon: 0.15, rare: 0.3, very_rare: 0.4, legendary: 0.1 }
};

// ============================================================================
// TREASURE ALLOCATION SYSTEM CLASS
// ============================================================================

export class TreasureAllocationSystem {
  
  // ============================================================================
  // MAIN ALLOCATION METHOD
  // ============================================================================
  
  static allocateTreasure(
    partyLevel: number,
    partySize: number,
    encounterType: EncounterType,
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly',
    xpBudget: number,
    systemBudget?: SystemDesignBudget
  ): TreasureAllocation {
    
    // Validate inputs
    this.validateInputs(partyLevel, partySize, difficulty);
    
    // Calculate base treasure value (typically 10% of XP budget)
    const treasurePace = systemBudget?.treasurePace || 'standard';
    const paceMultiplier = this.getTreasurePaceMultiplier(treasurePace);
    const totalGoldValue = Math.floor(xpBudget * 0.1 * paceMultiplier);
    
    // Determine treasure parcel characteristics
    const treasureParcel = this.generateTreasureParcel(partyLevel, totalGoldValue, encounterType);
    
    // Allocate treasure components
    const coins = this.allocateCoins(partyLevel, totalGoldValue * 0.6, treasureParcel.presentation);
    const gems = this.allocateGems(partyLevel, totalGoldValue * 0.15);
    const artObjects = this.allocateArtObjects(partyLevel, totalGoldValue * 0.15);
    const magicItems = this.allocateMagicItems(partyLevel, totalGoldValue * 0.1, systemBudget);
    
    // Perform treasure analysis
    const treasureAnalysis = this.analyzeTreasure(
      partyLevel, 
      partySize, 
      { coins, gems, artObjects, magicItems },
      treasureParcel,
      systemBudget
    );
    
    // Generate recommendations and warnings
    const recommendations = this.generateRecommendations(treasureAnalysis, partyLevel, encounterType);
    const warnings = this.generateWarnings(treasureAnalysis, partyLevel, partySize);
    
    return {
      partyLevel,
      partySize,
      encounterType,
      difficulty,
      totalGoldValue,
      treasureParcel,
      coins,
      gems,
      artObjects,
      magicItems,
      treasureAnalysis,
      recommendations,
      warnings
    };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private static validateInputs(partyLevel: number, partySize: number, difficulty: string): void {
    if (partyLevel < 1 || partyLevel > 20) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    if (partySize < 1 || partySize > 8) {
      throw new Error(`Invalid party size: ${partySize}. Must be 1-8.`);
    }
    const validDifficulties = ['easy', 'medium', 'hard', 'deadly'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
    }
  }
  
  private static getTreasurePaceMultiplier(pace: string): number {
    const multipliers = {
      'slow': 0.5,
      'standard': 1.0,
      'fast': 1.5
    };
    return multipliers[pace as keyof typeof multipliers] || 1.0;
  }
  
  private static generateTreasureParcel(
    level: number,
    totalValue: number,
    encounterType: EncounterType
  ): TreasureParcel {
    // Determine rarity based on value and level
    let rarity: TreasureRarity = 'common';
    if (totalValue > 5000 || level >= 17) rarity = 'legendary';
    else if (totalValue > 2500 || level >= 11) rarity = 'very_rare';
    else if (totalValue > 500 || level >= 5) rarity = 'rare';
    else if (totalValue > 100) rarity = 'uncommon';
    
    // Determine theme based on encounter type
    const themes: Record<EncounterType, TreasureTheme[]> = {
      combat: ['military', 'criminal', 'ancient'],
      social: ['noble', 'religious', 'arcane'],
      exploration: ['ancient', 'natural', 'planar'],
      puzzle: ['arcane', 'ancient', 'religious'],
      trap: ['criminal', 'ancient', 'military'],
      mixed: ['ancient', 'arcane', 'noble']
    };
    const availableThemes = themes[encounterType] || ['ancient'];
    const theme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    
    // Determine presentation
    const presentations: TreasurePresentationType[] = ['hoard', 'individual', 'scattered', 'hidden'];
    const presentation = presentations[Math.floor(Math.random() * presentations.length)];
    
    return {
      parcelId: `parcel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      totalValue,
      rarity,
      theme,
      presentation,
      description: this.generateTreasureDescription(rarity, theme, presentation, totalValue)
    };
  }
  
  private static generateTreasureDescription(
    rarity: TreasureRarity,
    theme: TreasureTheme,
    presentation: TreasurePresentationType,
    value: number
  ): string {
    const rarityDescriptors = {
      common: 'modest',
      uncommon: 'notable',
      rare: 'valuable',
      very_rare: 'precious',
      legendary: 'priceless'
    };
    
    const themeDescriptors = {
      military: 'martial spoils',
      religious: 'sacred offerings',
      arcane: 'mystical artifacts',
      natural: 'natural treasures',
      noble: 'courtly riches',
      criminal: 'ill-gotten gains',
      ancient: 'ancient relics',
      planar: 'otherworldly treasures'
    };
    
    const presentationDescriptors = {
      hoard: 'carefully accumulated',
      individual: 'personally carried',
      scattered: 'hastily abandoned',
      hidden: 'secretively concealed',
      trapped: 'dangerously protected',
      guarded: 'vigilantly watched'
    };
    
    return `A ${rarityDescriptors[rarity]} collection of ${themeDescriptors[theme]}, ${presentationDescriptors[presentation]} and worth approximately ${value} gold pieces.`;
  }
  
  private static allocateCoins(
    level: number,
    coinBudget: number,
    presentation: TreasurePresentationType
  ): CoinAllocation {
    // Determine coin distribution based on level
    let copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0;
    
    if (level <= 4) {
      // Low level: mostly copper and silver
      copper = Math.floor(coinBudget * 0.4 * 100); // 1 gp = 100 cp
      silver = Math.floor(coinBudget * 0.4 * 10);  // 1 gp = 10 sp
      gold = Math.floor(coinBudget * 0.2);
    } else if (level <= 10) {
      // Mid level: mostly silver and gold
      silver = Math.floor(coinBudget * 0.3 * 10);
      electrum = Math.floor(coinBudget * 0.1 * 2); // 1 gp = 2 ep
      gold = Math.floor(coinBudget * 0.6);
    } else if (level <= 16) {
      // High level: mostly gold and some platinum
      gold = Math.floor(coinBudget * 0.7);
      platinum = Math.floor(coinBudget * 0.3 / 10); // 1 pp = 10 gp
    } else {
      // Epic level: mostly platinum
      gold = Math.floor(coinBudget * 0.4);
      platinum = Math.floor(coinBudget * 0.6 / 10);
    }
    
    const totalValue = (copper / 100) + (silver / 10) + (electrum / 2) + gold + (platinum * 10);
    const weight = (copper / 50) + (silver / 50) + (electrum / 50) + (gold / 50) + (platinum / 50); // 50 coins = 1 lb
    
    // Determine presentation style
    const coinPresentations: CoinPresentationType[] = ['loose', 'pouches', 'chest'];
    const coinPresentation = coinPresentations[Math.floor(Math.random() * coinPresentations.length)];
    
    return {
      copper,
      silver,
      electrum,
      gold,
      platinum,
      totalValue,
      weight,
      presentation: coinPresentation
    };
  }
  
  private static allocateGems(level: number, gemBudget: number): GemAllocation[] {
    if (gemBudget < 10) return [];
    
    const gems: GemAllocation[] = [];
    let remainingBudget = gemBudget;
    
    // Determine gem types based on level and budget
    const availableGemTypes: GemType[] = [];
    if (remainingBudget >= 10) availableGemTypes.push('ornamental');
    if (remainingBudget >= 100) availableGemTypes.push('semi_precious');
    if (remainingBudget >= 1000 && level >= 5) availableGemTypes.push('precious');
    if (remainingBudget >= 5000 && level >= 11) availableGemTypes.push('rare');
    
    while (remainingBudget >= 10 && availableGemTypes.length > 0) {
      const gemType = availableGemTypes[Math.floor(Math.random() * availableGemTypes.length)];
      const gemValues = GEM_VALUES[gemType];
      const gemValue = gemValues[Math.floor(Math.random() * gemValues.length)];
      
      if (gemValue <= remainingBudget) {
        const quantity = Math.min(3, Math.floor(remainingBudget / gemValue));
        const totalValue = gemValue * quantity;
        
        gems.push({
          gemType,
          value: gemValue,
          quantity,
          totalValue,
          description: this.generateGemDescription(gemType, gemValue),
          rarity: this.getGemRarity(gemType, gemValue)
        });
        
        remainingBudget -= totalValue;
      }
      
      // Remove gem types that are too expensive
      availableGemTypes.splice(availableGemTypes.findIndex(t => {
        const minValue = Math.min(...GEM_VALUES[t]);
        return minValue > remainingBudget;
      }), 1);
    }
    
    return gems;
  }
  
  private static allocateArtObjects(level: number, artBudget: number): ArtObjectAllocation[] {
    if (artBudget < 25) return [];
    
    const artObjects: ArtObjectAllocation[] = [];
    let remainingBudget = artBudget;
    
    // Determine available art object values
    const availableValues = [];
    if (remainingBudget >= 25) availableValues.push('25gp');
    if (remainingBudget >= 250) availableValues.push('250gp');
    if (remainingBudget >= 750 && level >= 5) availableValues.push('750gp');
    if (remainingBudget >= 2500 && level >= 11) availableValues.push('2500gp');
    if (remainingBudget >= 7500 && level >= 17) availableValues.push('7500gp');
    
    while (remainingBudget >= 25 && availableValues.length > 0) {
      const valueCategory = availableValues[Math.floor(Math.random() * availableValues.length)];
      const objectValue = parseInt(valueCategory.replace('gp', ''));
      
      if (objectValue <= remainingBudget) {
        const availableObjects = ART_OBJECT_VALUES[valueCategory as keyof typeof ART_OBJECT_VALUES];
        const objectDescription = availableObjects[Math.floor(Math.random() * availableObjects.length)];
        
        artObjects.push({
          objectType: this.determineArtObjectType(objectDescription),
          value: objectValue,
          description: objectDescription,
          culturalOrigin: this.randomCulturalOrigin(),
          condition: this.randomObjectCondition(),
          historicalSignificance: Math.random() > 0.7 ? this.generateHistoricalSignificance() : undefined
        });
        
        remainingBudget -= objectValue;
      }
      
      // Remove values that are too expensive
      const expensiveIndex = availableValues.findIndex(v => parseInt(v.replace('gp', '')) > remainingBudget);
      if (expensiveIndex !== -1) {
        availableValues.splice(expensiveIndex, 1);
      }
    }
    
    return artObjects;
  }
  
  private static allocateMagicItems(
    level: number,
    magicBudget: number,
    systemBudget?: SystemDesignBudget
  ): MagicItemAllocation[] {
    const magicItems: MagicItemAllocation[] = [];
    
    // Determine if magic items should be included
    const magicPrevalence = systemBudget?.magicPrevalence || 'normal';
    const magicMultiplier = magicPrevalence === 'low' ? 0.5 : magicPrevalence === 'high' ? 1.5 : 1.0;
    
    if (magicBudget * magicMultiplier < 50) return magicItems;
    
    // Get level-appropriate rarity distribution
    const levelCategory = level <= 4 ? '1-4' : level <= 10 ? '5-10' : level <= 16 ? '11-16' : '17-20';
    const rarityDistribution = MAGIC_ITEM_RARITY_BY_LEVEL[levelCategory];
    
    // Determine number of magic items (usually 1, sometimes 2-3 for high budgets)
    const itemCount = Math.min(3, Math.floor(magicBudget / 500) + 1);
    
    for (let i = 0; i < itemCount; i++) {
      const rarity = this.selectMagicItemRarity(rarityDistribution);
      const itemType = this.randomMagicItemType();
      const value = this.getMagicItemValue(rarity);
      const attunementRequired = this.requiresAttunement(rarity, itemType);
      
      magicItems.push({
        itemType,
        rarity,
        value,
        attunementRequired,
        description: this.generateMagicItemDescription(itemType, rarity),
        powerLevel: this.calculatePowerLevel(rarity, level),
        themeRelevance: Math.floor(Math.random() * 100)
      });
    }
    
    return magicItems;
  }
  
  // ============================================================================
  // ANALYSIS AND RECOMMENDATIONS
  // ============================================================================
  
  private static analyzeTreasure(
    level: number,
    partySize: number,
    treasure: { coins: CoinAllocation; gems: GemAllocation[]; artObjects: ArtObjectAllocation[]; magicItems: MagicItemAllocation[] },
    parcel: TreasureParcel,
    systemBudget?: SystemDesignBudget
  ): TreasureAnalysis {
    
    // Calculate total treasure value
    const totalValue = treasure.coins.totalValue + 
                      treasure.gems.reduce((sum, g) => sum + g.totalValue, 0) +
                      treasure.artObjects.reduce((sum, a) => sum + a.value, 0) +
                      treasure.magicItems.reduce((sum, m) => sum + m.value, 0);
    
    // Balance score (how appropriate for level)
    const expectedValue = level * partySize * 100; // Rough estimate
    const balanceScore = Math.max(0, 100 - Math.abs(totalValue - expectedValue) / expectedValue * 100);
    
    // Variety score (diversity of treasure types)
    const typeCount = (treasure.coins.totalValue > 0 ? 1 : 0) +
                     (treasure.gems.length > 0 ? 1 : 0) +
                     (treasure.artObjects.length > 0 ? 1 : 0) +
                     (treasure.magicItems.length > 0 ? 1 : 0);
    const varietyScore = (typeCount / 4) * 100;
    
    // Theme coherence (how well treasure fits together)
    const themeCoherence = 75; // Default good coherence
    
    // Power level (magic item appropriateness)
    const avgPowerLevel = treasure.magicItems.reduce((sum, m) => sum + m.powerLevel, 0) / Math.max(1, treasure.magicItems.length);
    const powerLevel = Math.min(100, avgPowerLevel);
    
    // Economic impact (effect on campaign economy)
    const economicImpact = Math.min(100, totalValue / (level * 1000) * 100);
    
    // Carry capacity (total weight)
    const totalWeight = treasure.coins.weight +
                       treasure.gems.length * 0.1 + // Gems are light
                       treasure.artObjects.length * 2 + // Art objects vary
                       treasure.magicItems.length * 1; // Magic items vary
    const carryCapacity = Math.min(100, totalWeight / (partySize * 150) * 100); // 150 lb carrying capacity per person
    
    // Liquidity score (how easily convertible)
    const liquidityScore = (treasure.coins.totalValue / totalValue) * 100;
    
    return {
      balanceScore,
      varietyScore,
      themeCoherence,
      powerLevel,
      economicImpact,
      carryCapacity,
      liquidityScore
    };
  }
  
  private static generateRecommendations(
    analysis: TreasureAnalysis,
    level: number,
    encounterType: EncounterType
  ): TreasureRecommendation[] {
    const recommendations: TreasureRecommendation[] = [];
    
    if (analysis.varietyScore < 50) {
      recommendations.push({
        type: 'treasure_variety',
        priority: 'medium',
        description: 'Increase treasure variety',
        implementation: 'Add different types of treasure (gems, art objects, magic items)'
      });
    }
    
    if (analysis.carryCapacity > 80) {
      recommendations.push({
        type: 'weight_reduction',
        priority: 'high',
        description: 'Reduce treasure weight',
        implementation: 'Convert heavy coins to gems or magic items'
      });
    }
    
    if (analysis.powerLevel < 30 && level >= 5) {
      recommendations.push({
        type: 'magic_item',
        priority: 'medium',
        description: 'Consider adding magic items',
        implementation: 'Add level-appropriate magic items to increase encounter reward value'
      });
    }
    
    return recommendations;
  }
  
  private static generateWarnings(
    analysis: TreasureAnalysis,
    level: number,
    partySize: number
  ): TreasureWarning[] {
    const warnings: TreasureWarning[] = [];
    
    if (analysis.economicImpact > 150) {
      warnings.push({
        type: 'economic_disruption',
        severity: 'high',
        message: 'Treasure value may disrupt campaign economy',
        suggestion: 'Consider reducing total treasure value or spreading it across multiple encounters'
      });
    }
    
    if (analysis.carryCapacity > 100) {
      warnings.push({
        type: 'overloaded',
        severity: 'medium',
        message: 'Treasure may exceed party carrying capacity',
        suggestion: 'Provide means of transportation or reduce weight'
      });
    }
    
    return warnings;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static generateGemDescription(gemType: GemType, value: number): string {
    const descriptions = {
      ornamental: ['azurite', 'banded agate', 'blue quartz', 'eye agate', 'hematite', 'lapis lazuli', 'malachite', 'moss agate', 'obsidian', 'rhodochrosite', 'tiger eye', 'turquoise'],
      semi_precious: ['bloodstone', 'carnelian', 'chalcedony', 'chrysoprase', 'citrine', 'jasper', 'moonstone', 'onyx', 'quartz', 'sardonyx', 'star rose quartz', 'zircon'],
      precious: ['amber', 'amethyst', 'chrysoberyl', 'coral', 'garnet', 'jade', 'jet', 'pearl', 'spinel', 'tourmaline'],
      rare: ['black opal', 'blue sapphire', 'emerald', 'fire opal', 'opal', 'star ruby', 'star sapphire', 'yellow sapphire']
    };
    
    const gemNames = descriptions[gemType];
    const gemName = gemNames[Math.floor(Math.random() * gemNames.length)];
    return `${gemName} worth ${value} gp`;
  }
  
  private static getGemRarity(gemType: GemType, value: number): GemRarity {
    if (value >= 5000) return 'very_rare';
    if (value >= 1000) return 'rare';
    if (value >= 100) return 'uncommon';
    return 'common';
  }
  
  private static determineArtObjectType(description: string): ArtObjectType {
    if (description.includes('ring') || description.includes('bracelet') || description.includes('necklace')) return 'jewelry';
    if (description.includes('statuette') || description.includes('idol')) return 'sculpture';
    if (description.includes('sword') || description.includes('weapon')) return 'weapon';
    if (description.includes('vestments') || description.includes('chalice')) return 'religious';
    if (description.includes('crown') || description.includes('mask')) return 'jewelry';
    return 'sculpture';
  }
  
  private static randomCulturalOrigin(): CulturalOrigin {
    const origins: CulturalOrigin[] = ['local', 'foreign', 'ancient', 'exotic'];
    return origins[Math.floor(Math.random() * origins.length)];
  }
  
  private static randomObjectCondition(): ObjectCondition {
    const conditions: ObjectCondition[] = ['pristine', 'good', 'worn'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
  
  private static generateHistoricalSignificance(): string {
    const significances = [
      'Once belonged to a famous noble',
      'Created by a legendary artisan',
      'Survived a great historical event',
      'Has religious importance',
      'Connected to an ancient civilization'
    ];
    return significances[Math.floor(Math.random() * significances.length)];
  }
  
  private static selectMagicItemRarity(distribution: Record<string, number>): MagicItemRarity {
    const roll = Math.random();
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(distribution)) {
      cumulative += chance;
      if (roll <= cumulative) {
        return rarity as MagicItemRarity;
      }
    }
    
    return 'common';
  }
  
  private static randomMagicItemType(): MagicItemType {
    const types: MagicItemType[] = ['weapon', 'armor', 'accessory', 'consumable', 'wondrous'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private static getMagicItemValue(rarity: MagicItemRarity): number {
    const values = {
      common: 100,
      uncommon: 500,
      rare: 5000,
      very_rare: 50000,
      legendary: 200000,
      artifact: 1000000
    };
    return values[rarity] || 100;
  }
  
  private static requiresAttunement(rarity: MagicItemRarity, itemType: MagicItemType): boolean {
    if (rarity === 'common' || itemType === 'consumable') return false;
    return Math.random() < 0.6; // 60% chance for non-common items
  }
  
  private static generateMagicItemDescription(itemType: MagicItemType, rarity: MagicItemRarity): string {
    return `${rarity} ${itemType}`;
  }
  
  private static calculatePowerLevel(rarity: MagicItemRarity, level: number): number {
    const baseLevel = {
      common: 20,
      uncommon: 40,
      rare: 60,
      very_rare: 80,
      legendary: 100,
      artifact: 120
    }[rarity] || 20;
    
    // Adjust for party level appropriateness
    const levelAdjustment = Math.abs(level - 10) * 2; // Penalty for level mismatch
    return Math.max(0, baseLevel - levelAdjustment);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default TreasureAllocationSystem;
