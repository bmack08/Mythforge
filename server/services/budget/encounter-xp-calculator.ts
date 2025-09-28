// Mythwright Encounter XP Budget Calculator - Task 76
// DMG-compliant XP budget calculations with encounter multipliers and difficulty scaling

import type { SystemDesignBudget } from '../../types/content.types.js';

// ============================================================================
// ENCOUNTER XP CALCULATION TYPES
// ============================================================================

export interface EncounterXPBudget {
  // Basic Budget Information
  dailyXPBudget: number;
  encounterXPBudget: number;
  adjustedXPBudget: number;
  
  // Encounter Parameters
  partyLevel: number;
  partySize: number;
  difficulty: EncounterDifficulty;
  encounterType: EncounterType;
  
  // Multiplier Information
  encounterMultiplier: number;
  partyMultiplier: number;
  difficultyMultiplier: number;
  
  // Thresholds
  easyThreshold: number;
  mediumThreshold: number;
  hardThreshold: number;
  deadlyThreshold: number;
  
  // Budget Allocation
  recommendedMonsters: MonsterBudgetRecommendation[];
  treasureBudget: number;
  xpReward: number;
  
  // Analysis
  balanceAnalysis: EncounterBalanceAnalysis;
  warnings: EncounterWarning[];
  suggestions: EncounterSuggestion[];
}

export interface MonsterBudgetRecommendation {
  challengeRating: number;
  xpValue: number;
  quantity: number;
  role: MonsterRole;
  totalXP: number;
  adjustedXP: number;
}

export interface EncounterBalanceAnalysis {
  balanceScore: number; // 0-100
  difficultyAccuracy: number; // How close to target difficulty
  actionEconomyBalance: number; // Party vs monsters action economy
  damageOutputBalance: number; // Expected damage balance
  resourceDrainLevel: number; // How much resources this encounter should drain
  tacticalComplexity: number; // Encounter tactical depth
  recommendedDuration: number; // Expected combat rounds
}

export interface EncounterWarning {
  type: WarningType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

export interface EncounterSuggestion {
  type: SuggestionType;
  priority: 'low' | 'medium' | 'high';
  description: string;
  implementation: string;
}

export type EncounterDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary';
export type EncounterType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'trap' | 'mixed';
export type MonsterRole = 'minion' | 'standard' | 'elite' | 'boss' | 'legendary' | 'support' | 'artillery' | 'controller';
export type WarningType = 'xp_overflow' | 'action_economy' | 'damage_spike' | 'resource_drain' | 'difficulty_mismatch' | 'party_size';
export type SuggestionType = 'monster_selection' | 'encounter_modification' | 'tactical_advice' | 'environmental_factor' | 'treasure_adjustment';

// ============================================================================
// XP THRESHOLDS BY LEVEL (DMG PAGE 82)
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

// ============================================================================
// ENCOUNTER MULTIPLIERS (DMG PAGE 82)
// ============================================================================

const ENCOUNTER_MULTIPLIERS = {
  1: 1.0,   // Single monster
  2: 1.5,   // Pair of monsters  
  3: 2.0,   // Group of 3-6 monsters
  4: 2.0,
  5: 2.0,
  6: 2.0,
  7: 2.5,   // Group of 7-10 monsters
  8: 2.5,
  9: 2.5,
  10: 2.5,
  11: 3.0,  // Group of 11-14 monsters
  12: 3.0,
  13: 3.0,
  14: 3.0,
  15: 4.0   // Group of 15+ monsters
};

// Party size multipliers (for parties not size 3-5)
const PARTY_SIZE_MULTIPLIERS = {
  1: 1.5,   // Solo character
  2: 1.5,   // Pair
  3: 1.0,   // Standard
  4: 1.0,   // Standard
  5: 1.0,   // Standard  
  6: 0.5,   // Large party
  7: 0.5,   // Large party
  8: 0.5    // Large party
};

// ============================================================================
// ENCOUNTER XP CALCULATOR CLASS
// ============================================================================

export class EncounterXPCalculator {
  
  // ============================================================================
  // MAIN CALCULATION METHOD
  // ============================================================================
  
  static calculateEncounterBudget(
    partyLevel: number,
    partySize: number,
    difficulty: EncounterDifficulty,
    encounterType: EncounterType = 'combat',
    systemBudget?: SystemDesignBudget
  ): EncounterXPBudget {
    
    // Validate inputs
    this.validateInputs(partyLevel, partySize, difficulty);
    
    // Get base XP thresholds for party level
    const baseThresholds = XP_THRESHOLDS_BY_LEVEL[partyLevel as keyof typeof XP_THRESHOLDS_BY_LEVEL];
    if (!baseThresholds) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    
    // Calculate party-adjusted thresholds
    const thresholds = {
      easyThreshold: baseThresholds.easy * partySize,
      mediumThreshold: baseThresholds.medium * partySize,
      hardThreshold: baseThresholds.hard * partySize,
      deadlyThreshold: baseThresholds.deadly * partySize
    };
    
    // Calculate encounter XP budget based on difficulty
    const encounterXPBudget = this.calculateEncounterXPByDifficulty(difficulty, thresholds);
    
    // Calculate daily XP budget (6-8 medium encounters per day)
    const dailyXPBudget = thresholds.mediumThreshold * 6.5;
    
    // Get party size multiplier
    const partyMultiplier = PARTY_SIZE_MULTIPLIERS[Math.min(8, partySize)] || 0.5;
    
    // Calculate adjusted XP budget (accounting for encounter multipliers)
    const adjustedXPBudget = encounterXPBudget * partyMultiplier;
    
    // Generate monster recommendations
    const recommendedMonsters = this.generateMonsterRecommendations(
      encounterXPBudget, 
      adjustedXPBudget, 
      partyLevel, 
      partySize,
      encounterType
    );
    
    // Calculate treasure budget (10% of XP value in gold)
    const treasureBudget = Math.floor(encounterXPBudget * 0.1);
    
    // Calculate XP reward (usually equal to monster XP)
    const xpReward = encounterXPBudget;
    
    // Perform balance analysis
    const balanceAnalysis = this.analyzeEncounterBalance(
      partyLevel, 
      partySize, 
      encounterXPBudget, 
      recommendedMonsters,
      systemBudget
    );
    
    // Generate warnings and suggestions
    const warnings = this.generateWarnings(partyLevel, partySize, encounterXPBudget, balanceAnalysis);
    const suggestions = this.generateSuggestions(partyLevel, partySize, difficulty, balanceAnalysis);
    
    return {
      dailyXPBudget,
      encounterXPBudget,
      adjustedXPBudget,
      partyLevel,
      partySize,
      difficulty,
      encounterType,
      encounterMultiplier: this.calculateEncounterMultiplier(recommendedMonsters.length),
      partyMultiplier,
      difficultyMultiplier: this.getDifficultyMultiplier(difficulty),
      ...thresholds,
      recommendedMonsters,
      treasureBudget,
      xpReward,
      balanceAnalysis,
      warnings,
      suggestions
    };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private static validateInputs(partyLevel: number, partySize: number, difficulty: EncounterDifficulty): void {
    if (partyLevel < 1 || partyLevel > 20) {
      throw new Error(`Invalid party level: ${partyLevel}. Must be 1-20.`);
    }
    if (partySize < 1 || partySize > 8) {
      throw new Error(`Invalid party size: ${partySize}. Must be 1-8.`);
    }
    const validDifficulties: EncounterDifficulty[] = ['trivial', 'easy', 'medium', 'hard', 'deadly', 'legendary'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
    }
  }
  
  private static calculateEncounterXPByDifficulty(
    difficulty: EncounterDifficulty, 
    thresholds: { easyThreshold: number; mediumThreshold: number; hardThreshold: number; deadlyThreshold: number }
  ): number {
    switch (difficulty) {
      case 'trivial':
        return Math.floor(thresholds.easyThreshold * 0.5);
      case 'easy':
        return thresholds.easyThreshold;
      case 'medium':
        return thresholds.mediumThreshold;
      case 'hard':
        return thresholds.hardThreshold;
      case 'deadly':
        return thresholds.deadlyThreshold;
      case 'legendary':
        return Math.floor(thresholds.deadlyThreshold * 1.5);
      default:
        return thresholds.mediumThreshold;
    }
  }
  
  private static calculateEncounterMultiplier(monsterCount: number): number {
    if (monsterCount >= 15) return 4.0;
    if (monsterCount >= 11) return 3.0;
    if (monsterCount >= 7) return 2.5;
    if (monsterCount >= 3) return 2.0;
    if (monsterCount === 2) return 1.5;
    return 1.0;
  }
  
  private static getDifficultyMultiplier(difficulty: EncounterDifficulty): number {
    const multipliers = {
      trivial: 0.5,
      easy: 0.75,
      medium: 1.0,
      hard: 1.25,
      deadly: 1.5,
      legendary: 2.0
    };
    return multipliers[difficulty] || 1.0;
  }
  
  private static generateMonsterRecommendations(
    xpBudget: number,
    adjustedBudget: number,
    partyLevel: number,
    partySize: number,
    encounterType: EncounterType
  ): MonsterBudgetRecommendation[] {
    const recommendations: MonsterBudgetRecommendation[] = [];
    
    // Calculate appropriate CR range for party level
    const minCR = Math.max(0.125, partyLevel / 4);
    const maxCR = partyLevel + 2;
    
    // Standard CR to XP mapping (Monster Manual)
    const crToXP: Record<number, number> = {
      0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
      1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
      6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
      11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
      16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
      21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
      26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
    };
    
    // Generate different encounter compositions
    if (encounterType === 'combat') {
      // Option 1: Single strong monster
      const singleCR = Math.min(maxCR, partyLevel + 1);
      const singleXP = crToXP[singleCR] || 200;
      if (singleXP <= xpBudget * 1.2) {
        recommendations.push({
          challengeRating: singleCR,
          xpValue: singleXP,
          quantity: 1,
          role: singleCR >= partyLevel + 2 ? 'boss' : 'elite',
          totalXP: singleXP,
          adjustedXP: singleXP
        });
      }
      
      // Option 2: Multiple medium monsters
      const mediumCR = Math.max(0.25, partyLevel / 2);
      const mediumXP = crToXP[mediumCR] || 100;
      const mediumQuantity = Math.floor(xpBudget / mediumXP);
      if (mediumQuantity >= 2 && mediumQuantity <= 6) {
        const totalXP = mediumXP * mediumQuantity;
        const adjustedXP = totalXP * this.calculateEncounterMultiplier(mediumQuantity);
        recommendations.push({
          challengeRating: mediumCR,
          xpValue: mediumXP,
          quantity: mediumQuantity,
          role: 'standard',
          totalXP,
          adjustedXP
        });
      }
      
      // Option 3: Many weak monsters (minion swarm)
      const minionCR = Math.max(0.125, partyLevel / 4);
      const minionXP = crToXP[minionCR] || 25;
      const minionQuantity = Math.floor(xpBudget / minionXP);
      if (minionQuantity >= 4 && minionQuantity <= 12) {
        const totalXP = minionXP * minionQuantity;
        const adjustedXP = totalXP * this.calculateEncounterMultiplier(minionQuantity);
        recommendations.push({
          challengeRating: minionCR,
          xpValue: minionXP,
          quantity: minionQuantity,
          role: 'minion',
          totalXP,
          adjustedXP
        });
      }
      
      // Option 4: Mixed encounter (boss + minions)
      const bossCR = Math.min(maxCR, partyLevel);
      const bossXP = crToXP[bossCR] || 200;
      const remainingBudget = xpBudget - bossXP;
      if (remainingBudget > 0) {
        const supportCR = Math.max(0.125, partyLevel / 3);
        const supportXP = crToXP[supportCR] || 50;
        const supportQuantity = Math.floor(remainingBudget / supportXP);
        if (supportQuantity >= 1 && supportQuantity <= 4) {
          // This would be a complex recommendation with multiple monster types
          // For simplicity, we'll add it as a suggestion rather than full recommendation
        }
      }
    }
    
    // Filter recommendations that are within reasonable XP bounds
    return recommendations.filter(rec => 
      rec.adjustedXP >= xpBudget * 0.5 && rec.adjustedXP <= xpBudget * 1.5
    ).slice(0, 3); // Return top 3 recommendations
  }
  
  private static analyzeEncounterBalance(
    partyLevel: number,
    partySize: number,
    xpBudget: number,
    monsters: MonsterBudgetRecommendation[],
    systemBudget?: SystemDesignBudget
  ): EncounterBalanceAnalysis {
    
    // Calculate balance score (0-100)
    let balanceScore = 75; // Start with good baseline
    
    // Adjust based on action economy
    const totalMonsters = monsters.reduce((sum, m) => sum + m.quantity, 0);
    const actionEconomyRatio = totalMonsters / partySize;
    
    let actionEconomyBalance = 50;
    if (actionEconomyRatio >= 0.5 && actionEconomyRatio <= 1.5) {
      actionEconomyBalance = 85; // Good action economy
    } else if (actionEconomyRatio > 1.5) {
      actionEconomyBalance = 30; // Too many monsters
    } else {
      actionEconomyBalance = 60; // Too few monsters
    }
    
    // Estimate damage output balance (simplified)
    const averageMonsterCR = monsters.reduce((sum, m) => sum + (m.challengeRating * m.quantity), 0) / Math.max(1, totalMonsters);
    const damageOutputBalance = Math.min(100, Math.max(20, 100 - Math.abs(averageMonsterCR - partyLevel) * 15));
    
    // Calculate resource drain level based on difficulty
    const resourceDrainLevel = Math.min(100, (xpBudget / (partyLevel * partySize * 50)) * 100);
    
    // Tactical complexity based on monster variety and roles
    const uniqueRoles = new Set(monsters.map(m => m.role)).size;
    const tacticalComplexity = Math.min(100, uniqueRoles * 25 + (totalMonsters > 1 ? 25 : 0));
    
    // Recommended duration (combat rounds)
    const recommendedDuration = Math.max(3, Math.min(8, Math.ceil(totalMonsters / partySize) + 2));
    
    // Calculate difficulty accuracy
    const targetXP = xpBudget;
    const actualXP = monsters.reduce((sum, m) => sum + m.adjustedXP, 0);
    const difficultyAccuracy = Math.max(0, 100 - Math.abs(targetXP - actualXP) / targetXP * 100);
    
    // Update overall balance score
    balanceScore = Math.round(
      (actionEconomyBalance * 0.3) +
      (damageOutputBalance * 0.25) +
      (difficultyAccuracy * 0.25) +
      (tacticalComplexity * 0.2)
    );
    
    return {
      balanceScore,
      difficultyAccuracy,
      actionEconomyBalance,
      damageOutputBalance,
      resourceDrainLevel,
      tacticalComplexity,
      recommendedDuration
    };
  }
  
  private static generateWarnings(
    partyLevel: number,
    partySize: number,
    xpBudget: number,
    analysis: EncounterBalanceAnalysis
  ): EncounterWarning[] {
    const warnings: EncounterWarning[] = [];
    
    // XP overflow warning
    if (analysis.difficultyAccuracy < 60) {
      warnings.push({
        type: 'xp_overflow',
        severity: 'medium',
        message: 'Encounter XP significantly differs from target difficulty',
        suggestion: 'Adjust monster selection or quantity to match intended difficulty'
      });
    }
    
    // Action economy warning
    if (analysis.actionEconomyBalance < 40) {
      warnings.push({
        type: 'action_economy',
        severity: 'high',
        message: 'Poor action economy balance between party and monsters',
        suggestion: 'Consider adjusting monster quantity or adding/removing monsters'
      });
    }
    
    // Damage spike warning
    if (analysis.damageOutputBalance < 30) {
      warnings.push({
        type: 'damage_spike',
        severity: 'high',
        message: 'Potential damage output imbalance detected',
        suggestion: 'Review monster damage capabilities vs party defenses'
      });
    }
    
    // Resource drain warning
    if (analysis.resourceDrainLevel > 80) {
      warnings.push({
        type: 'resource_drain',
        severity: 'medium',
        message: 'Encounter may drain significant party resources',
        suggestion: 'Consider if this fits the intended encounter pacing'
      });
    }
    
    // Party size warnings
    if (partySize <= 2) {
      warnings.push({
        type: 'party_size',
        severity: 'low',
        message: 'Small party size may affect encounter balance',
        suggestion: 'Consider reducing monster quantity or providing NPC allies'
      });
    } else if (partySize >= 6) {
      warnings.push({
        type: 'party_size',
        severity: 'low',
        message: 'Large party size may affect encounter balance',
        suggestion: 'Consider increasing monster quantity or using stronger monsters'
      });
    }
    
    return warnings;
  }
  
  private static generateSuggestions(
    partyLevel: number,
    partySize: number,
    difficulty: EncounterDifficulty,
    analysis: EncounterBalanceAnalysis
  ): EncounterSuggestion[] {
    const suggestions: EncounterSuggestion[] = [];
    
    // Monster selection suggestions
    if (analysis.tacticalComplexity < 50) {
      suggestions.push({
        type: 'monster_selection',
        priority: 'medium',
        description: 'Add tactical variety to the encounter',
        implementation: 'Include monsters with different roles (tank, damage, support, control)'
      });
    }
    
    // Environmental factor suggestions
    if (difficulty === 'hard' || difficulty === 'deadly') {
      suggestions.push({
        type: 'environmental_factor',
        priority: 'medium',
        description: 'Consider adding environmental elements',
        implementation: 'Add terrain features, hazards, or interactive elements to increase complexity'
      });
    }
    
    // Tactical advice
    if (analysis.recommendedDuration > 6) {
      suggestions.push({
        type: 'tactical_advice',
        priority: 'low',
        description: 'Long combat encounter detected',
        implementation: 'Plan monster tactics to keep combat dynamic and engaging'
      });
    }
    
    // Treasure adjustment suggestions
    suggestions.push({
      type: 'treasure_adjustment',
      priority: 'low',
      description: 'Consider treasure placement',
      implementation: 'Place treasure that complements the encounter theme and party level'
    });
    
    return suggestions;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  static getXPThresholds(partyLevel: number, partySize: number) {
    const baseThresholds = XP_THRESHOLDS_BY_LEVEL[partyLevel as keyof typeof XP_THRESHOLDS_BY_LEVEL];
    if (!baseThresholds) {
      throw new Error(`Invalid party level: ${partyLevel}`);
    }
    
    return {
      easy: baseThresholds.easy * partySize,
      medium: baseThresholds.medium * partySize,
      hard: baseThresholds.hard * partySize,
      deadly: baseThresholds.deadly * partySize
    };
  }
  
  static calculateDailyXPBudget(partyLevel: number, partySize: number): number {
    const thresholds = this.getXPThresholds(partyLevel, partySize);
    return thresholds.medium * 6.5; // 6-8 medium encounters per day
  }
  
  static getCRFromXP(xpValue: number): number {
    const xpToCR: Record<number, number> = {
      10: 0, 25: 0.125, 50: 0.25, 100: 0.5,
      200: 1, 450: 2, 700: 3, 1100: 4, 1800: 5,
      2300: 6, 2900: 7, 3900: 8, 5000: 9, 5900: 10,
      7200: 11, 8400: 12, 10000: 13, 11500: 14, 13000: 15,
      15000: 16, 18000: 17, 20000: 18, 22000: 19, 25000: 20
    };
    
    // Find closest XP value
    let closestXP = 10;
    let minDifference = Math.abs(xpValue - 10);
    
    for (const [xp, cr] of Object.entries(xpToCR)) {
      const difference = Math.abs(xpValue - parseInt(xp));
      if (difference < minDifference) {
        minDifference = difference;
        closestXP = parseInt(xp);
      }
    }
    
    return xpToCR[closestXP];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default EncounterXPCalculator;
