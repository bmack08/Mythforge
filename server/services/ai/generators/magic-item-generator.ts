// Mythwright Magic Item Generator - Specialized D&D 5e Magic Item Creation with Rarity Validation
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { MagicItem, SystemDesignBudget } from '../../../types/content.types.js';
import { MagicItemSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// MAGIC ITEM GENERATION TYPES
// ============================================================================

export interface MagicItemGenerationRequest {
  // Basic Requirements
  name?: string;
  rarity: ItemRarity;
  itemType: ItemType;
  category: ItemCategory;
  
  // Power & Function
  primaryFunction: ItemFunction;
  secondaryFunctions?: ItemFunction[];
  powerLevel?: PowerLevel;
  attunementRequired?: boolean;
  
  // Mechanical Properties
  bonusType?: BonusType;
  bonusValue?: number;
  charges?: ChargeSystem;
  duration?: EffectDuration;
  
  // Thematic Elements
  theme?: ItemTheme;
  origin?: ItemOrigin;
  creator?: CreatorType;
  materials?: string[];
  
  // Balance & Validation
  targetLevel?: number;
  partySize?: number;
  campaignPowerLevel?: CampaignPowerLevel;
  restrictions?: string[];
  
  // Customization
  curseChance?: number; // 0-100%
  sentience?: SentienceLevel;
  flavorText?: string;
  mustHave?: string[];
  mustNotHave?: string[];
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type ItemRarity = 
  | 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact';

export type ItemType = 
  | 'weapon' | 'armor' | 'shield' | 'wondrous_item' | 'potion' | 'scroll'
  | 'ring' | 'rod' | 'staff' | 'wand' | 'ammunition' | 'tool';

export type ItemCategory = 
  | 'combat' | 'utility' | 'exploration' | 'social' | 'defensive' | 'offensive'
  | 'healing' | 'divination' | 'transportation' | 'communication' | 'crafting';

export type ItemFunction = 
  | 'damage_boost' | 'defense_boost' | 'skill_enhancement' | 'spell_casting'
  | 'healing' | 'transportation' | 'communication' | 'detection' | 'illusion'
  | 'transformation' | 'summoning' | 'control' | 'protection' | 'utility';

export type PowerLevel = 'minor' | 'moderate' | 'major' | 'supreme';

export type BonusType = 
  | 'enhancement' | 'insight' | 'luck' | 'competence' | 'circumstance' | 'sacred' | 'profane';

export type ItemTheme = 
  | 'elemental' | 'divine' | 'arcane' | 'nature' | 'shadow' | 'celestial'
  | 'infernal' | 'draconic' | 'fey' | 'aberrant' | 'necromantic' | 'artifice';

export type ItemOrigin = 
  | 'ancient_civilization' | 'divine_gift' | 'arcane_experiment' | 'natural_formation'
  | 'demonic_pact' | 'heroic_legacy' | 'royal_treasure' | 'lost_technology'
  | 'elemental_forge' | 'planar_artifact' | 'dragon_hoard' | 'unknown';

export type CreatorType = 
  | 'archmage' | 'deity' | 'dragon' | 'demon' | 'angel' | 'artificer'
  | 'ancient_king' | 'elemental_lord' | 'fey_noble' | 'lich' | 'unknown';

export type CampaignPowerLevel = 'low_magic' | 'standard' | 'high_magic' | 'epic';

export type SentienceLevel = 'none' | 'semi_sentient' | 'sentient' | 'highly_intelligent';

export interface ChargeSystem {
  maxCharges: number;
  rechargeRate: string; // e.g., "1d6 at dawn", "all at dawn", "never"
  rechargeCondition?: string;
  overchargeRisk?: string;
}

export interface EffectDuration {
  base: string; // e.g., "1 minute", "1 hour", "permanent"
  concentration?: boolean;
  extendable?: boolean;
}

export interface MagicItemGenerationResult {
  magicItem: MagicItem;
  rarityValidation: RarityValidation;
  balanceAnalysis: BalanceAnalysis;
  usageGuidance: UsageGuidance;
  variants: ItemVariant[];
  loreAndHistory: LoreAndHistory;
}

export interface RarityValidation {
  calculatedRarity: ItemRarity;
  targetRarity: ItemRarity;
  rarityAccurate: boolean;
  powerFactors: PowerFactor[];
  adjustmentRecommendations: string[];
  marketValue: number; // in gold pieces
}

export interface PowerFactor {
  factor: string;
  contribution: number; // -2 to +3 rarity levels
  description: string;
}

export interface BalanceAnalysis {
  overallBalance: 'underpowered' | 'balanced' | 'overpowered';
  combatImpact: number; // 1-10 scale
  utilityValue: number; // 1-10 scale
  campaignDisruption: number; // 1-10 scale
  recommendations: string[];
  warnings: string[];
}

export interface UsageGuidance {
  bestUseScenarios: string[];
  synergies: string[];
  counters: string[];
  dmTips: string[];
  playerGuidance: string[];
}

export interface ItemVariant {
  name: string;
  rarityChange: number;
  modifications: string[];
  useCase: string;
  marketValueMultiplier: number;
}

export interface LoreAndHistory {
  origin: string;
  previousOwners: string[];
  significantEvents: string[];
  legendsAndMyths: string[];
  currentReputation: string;
}

// ============================================================================
// RARITY POWER GUIDELINES (Based on DMG)
// ============================================================================

const RARITY_GUIDELINES = {
  common: {
    marketValue: [50, 100],
    powerLevel: 'minor',
    exampleBonus: [0, 1],
    charges: [1, 3],
    spellLevel: [0, 1],
    campaignImpact: 'negligible'
  },
  uncommon: {
    marketValue: [101, 500],
    powerLevel: 'minor',
    exampleBonus: [1, 2],
    charges: [3, 7],
    spellLevel: [1, 3],
    campaignImpact: 'minor'
  },
  rare: {
    marketValue: [501, 5000],
    powerLevel: 'moderate',
    exampleBonus: [2, 3],
    charges: [5, 10],
    spellLevel: [3, 5],
    campaignImpact: 'moderate'
  },
  very_rare: {
    marketValue: [5001, 50000],
    powerLevel: 'major',
    exampleBonus: [3, 4],
    charges: [7, 15],
    spellLevel: [5, 8],
    campaignImpact: 'significant'
  },
  legendary: {
    marketValue: [50001, 200000],
    powerLevel: 'supreme',
    exampleBonus: [4, 5],
    charges: [10, 20],
    spellLevel: [6, 9],
    campaignImpact: 'major'
  },
  artifact: {
    marketValue: [200000, 1000000],
    powerLevel: 'supreme',
    exampleBonus: [5, 6],
    charges: [15, 50],
    spellLevel: [7, 9],
    campaignImpact: 'campaign_defining'
  }
};

const ATTUNEMENT_RARITY_THRESHOLD = {
  common: 0.1,      // 10% chance
  uncommon: 0.3,    // 30% chance
  rare: 0.6,        // 60% chance
  very_rare: 0.8,   // 80% chance
  legendary: 0.9,   // 90% chance
  artifact: 1.0     // 100% chance
};

// ============================================================================
// MAGIC ITEM GENERATOR CLASS
// ============================================================================

export class MagicItemGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateMagicItem(
    request: MagicItemGenerationRequest,
    aiService: any // AIService type
  ): Promise<MagicItemGenerationResult> {
    
    // Step 1: Build the AI prompt
    const aiPrompt = this.buildMagicItemPrompt(request);
    
    // Step 2: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'magic_item',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          rarity: request.rarity,
          itemType: request.itemType,
          primaryFunction: request.primaryFunction,
          theme: request.theme,
          powerLevel: request.powerLevel
        }
      },
      options: {
        temperature: 0.7, // Balanced creativity for items
        maxTokens: 2000 // Magic items can be complex
      }
    };
    
    // Step 3: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Magic item generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 4: Validate and parse the magic item
    const magicItem = this.validateAndParseMagicItem(aiResponse.content);
    
    // Step 5: Perform rarity validation
    const rarityValidation = this.validateRarity(magicItem, request);
    
    // Step 6: Analyze balance
    const balanceAnalysis = this.analyzeBalance(magicItem, request);
    
    // Step 7: Generate usage guidance
    const usageGuidance = this.generateUsageGuidance(magicItem, request);
    
    // Step 8: Create variants
    const variants = this.generateVariants(magicItem, request);
    
    // Step 9: Generate lore and history
    const loreAndHistory = this.generateLoreAndHistory(magicItem, request);
    
    return {
      magicItem,
      rarityValidation,
      balanceAnalysis,
      usageGuidance,
      variants,
      loreAndHistory
    };
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildMagicItemPrompt(request: MagicItemGenerationRequest): string {
    const guidelines = RARITY_GUIDELINES[request.rarity];
    const attunementChance = ATTUNEMENT_RARITY_THRESHOLD[request.rarity];
    
    let prompt = `Create a D&D 5e magic item with the following specifications:

CORE REQUIREMENTS:
- Rarity: ${request.rarity} (Market Value: ${guidelines.marketValue[0]}-${guidelines.marketValue[1]} gp)
- Item Type: ${request.itemType}
- Category: ${request.category}
- Primary Function: ${request.primaryFunction}`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    if (request.secondaryFunctions && request.secondaryFunctions.length > 0) {
      prompt += `\n- Secondary Functions: ${request.secondaryFunctions.join(', ')}`;
    }
    
    if (request.powerLevel) {
      prompt += `\n- Power Level: ${request.powerLevel}`;
    }
    
    if (request.theme) {
      prompt += `\n- Theme: ${request.theme}`;
    }
    
    if (request.origin) {
      prompt += `\n- Origin: ${request.origin}`;
    }
    
    if (request.creator) {
      prompt += `\n- Creator: ${request.creator}`;
    }
    
    // Add campaign context
    if (request.targetLevel || request.campaignPowerLevel) {
      prompt += `\n\nCAMPAIGN CONTEXT:`;
      if (request.targetLevel) {
        prompt += `\n- Target Character Level: ${request.targetLevel}`;
      }
      if (request.campaignPowerLevel) {
        prompt += `\n- Campaign Power Level: ${request.campaignPowerLevel}`;
      }
      if (request.partySize) {
        prompt += `\n- Party Size: ${request.partySize}`;
      }
    }
    
    // Add mechanical guidelines
    prompt += `\n\nMECHANICAL GUIDELINES (${request.rarity.toUpperCase()}):`;
    prompt += `\n- Market Value Range: ${guidelines.marketValue[0]}-${guidelines.marketValue[1]} gp`;
    prompt += `\n- Power Level: ${guidelines.powerLevel}`;
    prompt += `\n- Typical Bonus Range: +${guidelines.exampleBonus[0]} to +${guidelines.exampleBonus[1]}`;
    prompt += `\n- Spell Level Equivalent: ${guidelines.spellLevel[0]}-${guidelines.spellLevel[1]}`;
    prompt += `\n- Campaign Impact: ${guidelines.campaignImpact}`;
    prompt += `\n- Attunement Likelihood: ${Math.round(attunementChance * 100)}%`;
    
    if (request.charges) {
      prompt += `\n- Charges: ${guidelines.charges[0]}-${guidelines.charges[1]} typical`;
    }
    
    // Add specific requirements
    if (request.bonusType && request.bonusValue) {
      prompt += `\n\nSPECIFIC REQUIREMENTS:`;
      prompt += `\n- Bonus Type: ${request.bonusType}`;
      prompt += `\n- Bonus Value: +${request.bonusValue}`;
    }
    
    if (request.attunementRequired !== undefined) {
      prompt += `\n- Attunement Required: ${request.attunementRequired ? 'Yes' : 'No'}`;
    }
    
    if (request.charges) {
      prompt += `\n- Charge System: ${request.charges.maxCharges} charges, recharges ${request.charges.rechargeRate}`;
    }
    
    if (request.duration) {
      prompt += `\n- Effect Duration: ${request.duration.base}`;
      if (request.duration.concentration) {
        prompt += ` (concentration)`;
      }
    }
    
    // Add materials and crafting
    if (request.materials && request.materials.length > 0) {
      prompt += `\n\nMATERIALS & CRAFTING:`;
      request.materials.forEach(material => {
        prompt += `\n- ${material}`;
      });
    }
    
    // Add customization options
    if (request.curseChance && request.curseChance > 0) {
      prompt += `\n\nCURSE SYSTEM:`;
      prompt += `\n- Curse Chance: ${request.curseChance}%`;
      prompt += `\n- Include balanced curse that doesn't make item useless`;
      prompt += `\n- Curse should relate to item's power or theme`;
    }
    
    if (request.sentience && request.sentience !== 'none') {
      prompt += `\n\nSENTIENCE:`;
      prompt += `\n- Sentience Level: ${request.sentience}`;
      prompt += `\n- Include personality, goals, and communication method`;
      prompt += `\n- Add potential conflicts with wielder`;
    }
    
    // Add must-have features
    if (request.mustHave && request.mustHave.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustHave.forEach(feature => {
        prompt += `\n- ${feature}`;
      });
    }
    
    // Add restrictions
    if (request.mustNotHave && request.mustNotHave.length > 0) {
      prompt += `\n\nMUST NOT INCLUDE:`;
      request.mustNotHave.forEach(restriction => {
        prompt += `\n- ${restriction}`;
      });
    }
    
    if (request.restrictions && request.restrictions.length > 0) {
      prompt += `\n\nADDITIONAL RESTRICTIONS:`;
      request.restrictions.forEach(restriction => {
        prompt += `\n- ${restriction}`;
      });
    }
    
    // Add flavor text guidance
    if (request.flavorText) {
      prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
    }
    
    // Add rarity-specific balance guidance
    prompt += this.getRaritySpecificGuidance(request.rarity, request.itemType);
    
    prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e magic item format exactly
2. Ensure power level matches rarity precisely
3. Include clear mechanical benefits and limitations
4. Balance power with interesting restrictions or costs
5. Make the item memorable and flavorful
6. Use only SRD-safe content (no Product Identity terms)
7. Include proper activation requirements and conditions
8. Consider attunement requirements for balance
9. Add rich description and lore elements
10. Ensure the item enhances gameplay without breaking it
11. Include specific rules text for all abilities
12. Balance offensive and defensive capabilities appropriately

Return a complete magic item in JSON format following the MagicItem schema with all mechanical details, descriptions, lore, and balance considerations.`;
    
    return prompt;
  }
  
  private static getRaritySpecificGuidance(rarity: ItemRarity, itemType: ItemType): string {
    let guidance = `\n\nRARITY-SPECIFIC BALANCE GUIDANCE (${rarity.toUpperCase()}):`;
    
    switch (rarity) {
      case 'common':
        guidance += `\n- Simple, single-function items with minimal combat impact
- Examples: Cantrip effects, minor utility, +1 bonuses to specific situations
- Should not significantly alter combat or exploration balance
- Focus on flavor and minor convenience rather than power`;
        break;
      case 'uncommon':
        guidance += `\n- Useful but not game-changing abilities
- Examples: +1 weapons/armor, 1st-2nd level spell effects, minor resistances
- Should provide clear benefit without dominating encounters
- Can have limited uses per day or situational restrictions`;
        break;
      case 'rare':
        guidance += `\n- Significant power that affects tactical decisions
- Examples: +2 weapons/armor, 3rd-4th level spell effects, useful resistances
- Should be powerful enough to influence encounter design
- May require attunement to prevent stacking`;
        break;
      case 'very_rare':
        guidance += `\n- Major magical power that changes how characters approach challenges
- Examples: +3 weapons/armor, 5th-7th level spell effects, immunities
- Should be campaign-memorable and alter party capabilities
- Almost certainly requires attunement`;
        break;
      case 'legendary':
        guidance += `\n- Extraordinary power that defines character builds
- Examples: +3/+4 weapons with special abilities, 8th-9th level effects
- Should be worthy of epic quests and legendary stories
- Multiple powerful abilities with meaningful restrictions`;
        break;
      case 'artifact':
        guidance += `\n- Campaign-defining power with major story significance
- Examples: Reality-altering abilities, multiple legendary-tier powers
- Should drive major story arcs and have cosmic importance
- Include both great power and significant risks/costs`;
        break;
    }
    
    // Add item type specific guidance
    switch (itemType) {
      case 'weapon':
        guidance += `\n- Focus on combat effectiveness and tactical options
- Consider damage bonuses, special attacks, and conditional abilities
- Balance offensive power with interesting activation requirements`;
        break;
      case 'armor':
        guidance += `\n- Emphasize protection and defensive abilities
- Consider AC bonuses, resistances, and reactive defenses
- Balance protection with mobility and versatility`;
        break;
      case 'wondrous_item':
        guidance += `\n- Maximize creative utility and unique effects
- Consider problem-solving abilities and exploration benefits
- Focus on effects that can't be easily replicated by spells`;
        break;
    }
    
    return guidance;
  }
  
  // ============================================================================
  // MAGIC ITEM VALIDATION
  // ============================================================================
  
  private static validateAndParseMagicItem(content: any): MagicItem {
    // Validate against schema
    const validation = MagicItemSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptMagicItemFix(content);
      const revalidation = MagicItemSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid magic item generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptMagicItemFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.rarity) {
      fixed.rarity = 'uncommon'; // Default rarity
    }
    
    if (!fixed.itemType) {
      fixed.itemType = 'wondrous_item'; // Default type
    }
    
    if (!fixed.description) {
      fixed.description = 'A magical item with mysterious properties.';
    }
    
    if (!fixed.properties) {
      fixed.properties = [];
    }
    
    if (typeof fixed.attunement === 'undefined') {
      fixed.attunement = false;
    }
    
    if (!fixed.activation) {
      fixed.activation = 'none';
    }
    
    if (!fixed.weight) {
      fixed.weight = 1; // Default weight
    }
    
    return fixed;
  }
  
  // ============================================================================
  // RARITY VALIDATION
  // ============================================================================
  
  private static validateRarity(magicItem: MagicItem, request: MagicItemGenerationRequest): RarityValidation {
    const targetRarity = request.rarity;
    const powerFactors = this.analyzePowerFactors(magicItem);
    
    // Calculate rarity based on power factors
    let rarityScore = this.getRarityBaseScore(targetRarity);
    
    powerFactors.forEach(factor => {
      rarityScore += factor.contribution;
    });
    
    const calculatedRarity = this.scoreToRarity(rarityScore);
    const rarityAccurate = calculatedRarity === targetRarity;
    
    // Generate adjustment recommendations
    const adjustmentRecommendations = this.generateRarityAdjustments(
      targetRarity, 
      calculatedRarity, 
      powerFactors
    );
    
    // Calculate market value
    const marketValue = this.calculateMarketValue(magicItem, calculatedRarity);
    
    return {
      calculatedRarity,
      targetRarity,
      rarityAccurate,
      powerFactors,
      adjustmentRecommendations,
      marketValue
    };
  }
  
  private static analyzePowerFactors(magicItem: MagicItem): PowerFactor[] {
    const factors: PowerFactor[] = [];
    
    // Analyze enhancement bonuses
    if (magicItem.properties) {
      magicItem.properties.forEach(property => {
        const bonusMatch = property.match(/\+(\d+)/);
        if (bonusMatch) {
          const bonus = parseInt(bonusMatch[1]);
          factors.push({
            factor: 'Enhancement Bonus',
            contribution: Math.max(0, bonus - 1) * 0.5, // +1 is baseline, each additional +1 adds 0.5 rarity
            description: `+${bonus} enhancement bonus`
          });
        }
      });
    }
    
    // Analyze spell effects
    const spellLevelMatch = magicItem.description?.match(/(\d+)(?:st|nd|rd|th)-level spell/i);
    if (spellLevelMatch) {
      const spellLevel = parseInt(spellLevelMatch[1]);
      let contribution = 0;
      if (spellLevel <= 2) contribution = 0;
      else if (spellLevel <= 4) contribution = 0.5;
      else if (spellLevel <= 6) contribution = 1;
      else if (spellLevel <= 8) contribution = 1.5;
      else contribution = 2;
      
      factors.push({
        factor: 'Spell Effect',
        contribution,
        description: `${spellLevel}th-level spell effect`
      });
    }
    
    // Analyze charges
    const chargesMatch = magicItem.description?.match(/(\d+)\s+charges/i);
    if (chargesMatch) {
      const charges = parseInt(chargesMatch[1]);
      let contribution = 0;
      if (charges >= 10) contribution = 0.5;
      if (charges >= 20) contribution = 1;
      
      factors.push({
        factor: 'Charge System',
        contribution,
        description: `${charges} charges available`
      });
    }
    
    // Analyze attunement
    if (magicItem.attunement) {
      factors.push({
        factor: 'Attunement Requirement',
        contribution: -0.25, // Attunement slightly reduces effective rarity
        description: 'Requires attunement (balancing factor)'
      });
    }
    
    // Analyze resistances/immunities
    if (magicItem.description?.toLowerCase().includes('resistance')) {
      factors.push({
        factor: 'Damage Resistance',
        contribution: 0.5,
        description: 'Provides damage resistance'
      });
    }
    
    if (magicItem.description?.toLowerCase().includes('immunity')) {
      factors.push({
        factor: 'Damage Immunity',
        contribution: 1,
        description: 'Provides damage immunity'
      });
    }
    
    // Analyze versatility (multiple functions)
    if (magicItem.properties && magicItem.properties.length > 2) {
      factors.push({
        factor: 'Versatility',
        contribution: 0.25 * (magicItem.properties.length - 2),
        description: `Multiple functions (${magicItem.properties.length} properties)`
      });
    }
    
    return factors;
  }
  
  private static getRarityBaseScore(rarity: ItemRarity): number {
    const rarityScores = {
      common: 0,
      uncommon: 1,
      rare: 2,
      very_rare: 3,
      legendary: 4,
      artifact: 5
    };
    return rarityScores[rarity] || 1;
  }
  
  private static scoreToRarity(score: number): ItemRarity {
    if (score < 0.5) return 'common';
    if (score < 1.5) return 'uncommon';
    if (score < 2.5) return 'rare';
    if (score < 3.5) return 'very_rare';
    if (score < 4.5) return 'legendary';
    return 'artifact';
  }
  
  private static generateRarityAdjustments(
    target: ItemRarity, 
    calculated: ItemRarity, 
    factors: PowerFactor[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (target === calculated) {
      recommendations.push('Rarity is perfectly balanced for the item\'s power level');
      return recommendations;
    }
    
    const targetScore = this.getRarityBaseScore(target);
    const calculatedScore = this.getRarityBaseScore(calculated);
    const difference = calculatedScore - targetScore;
    
    if (difference > 0) {
      // Item is too powerful for target rarity
      recommendations.push(`Item is ${difference} rarity level(s) too powerful`);
      recommendations.push('Consider reducing enhancement bonuses');
      recommendations.push('Add more restrictive activation requirements');
      recommendations.push('Reduce number of charges or uses per day');
      recommendations.push('Add attunement requirement if not present');
    } else {
      // Item is too weak for target rarity
      recommendations.push(`Item is ${Math.abs(difference)} rarity level(s) too weak`);
      recommendations.push('Consider increasing enhancement bonuses');
      recommendations.push('Add additional magical properties');
      recommendations.push('Increase spell level equivalency');
      recommendations.push('Add more charges or uses per day');
    }
    
    return recommendations;
  }
  
  private static calculateMarketValue(magicItem: MagicItem, rarity: ItemRarity): number {
    const guidelines = RARITY_GUIDELINES[rarity];
    const baseValue = (guidelines.marketValue[0] + guidelines.marketValue[1]) / 2;
    
    let multiplier = 1;
    
    // Adjust for item type
    switch (magicItem.itemType) {
      case 'weapon':
      case 'armor':
        multiplier *= 1.2; // Combat items are more valuable
        break;
      case 'potion':
      case 'scroll':
        multiplier *= 0.5; // Consumables are less valuable
        break;
    }
    
    // Adjust for attunement
    if (magicItem.attunement) {
      multiplier *= 0.9; // Attunement reduces market appeal
    }
    
    // Adjust for charges
    if (magicItem.description?.includes('charges')) {
      multiplier *= 1.1; // Charged items are more versatile
    }
    
    return Math.round(baseValue * multiplier);
  }
  
  // ============================================================================
  // BALANCE ANALYSIS
  // ============================================================================
  
  private static analyzeBalance(magicItem: MagicItem, request: MagicItemGenerationRequest): BalanceAnalysis {
    const combatImpact = this.assessCombatImpact(magicItem);
    const utilityValue = this.assessUtilityValue(magicItem);
    const campaignDisruption = this.assessCampaignDisruption(magicItem, request);
    
    let overallBalance: 'underpowered' | 'balanced' | 'overpowered' = 'balanced';
    const recommendations: string[] = [];
    const warnings: string[] = [];
    
    // Determine overall balance
    const balanceScore = (combatImpact + utilityValue + campaignDisruption) / 3;
    const expectedPower = this.getExpectedPowerForRarity(request.rarity);
    
    if (balanceScore < expectedPower - 2) {
      overallBalance = 'underpowered';
      recommendations.push('Consider adding more powerful abilities or reducing restrictions');
    } else if (balanceScore > expectedPower + 2) {
      overallBalance = 'overpowered';
      recommendations.push('Consider reducing power or adding more restrictions');
      warnings.push('This item may disrupt game balance');
    }
    
    // Specific balance recommendations
    if (combatImpact > 8) {
      warnings.push('High combat impact may overshadow other party members');
      recommendations.push('Consider adding non-combat utility to balance the item');
    }
    
    if (utilityValue > 8) {
      warnings.push('High utility value may trivialize exploration challenges');
      recommendations.push('Add limited uses per day or specific conditions');
    }
    
    if (campaignDisruption > 7) {
      warnings.push('Item may significantly alter campaign dynamics');
      recommendations.push('Ensure DM is prepared for campaign impact');
    }
    
    return {
      overallBalance,
      combatImpact,
      utilityValue,
      campaignDisruption,
      recommendations,
      warnings
    };
  }
  
  private static assessCombatImpact(magicItem: MagicItem): number {
    let impact = 1; // Base impact
    
    // Enhancement bonuses
    const bonusMatch = magicItem.description?.match(/\+(\d+)/);
    if (bonusMatch) {
      impact += parseInt(bonusMatch[1]) * 2;
    }
    
    // Damage dealing abilities
    if (magicItem.description?.toLowerCase().includes('damage')) {
      impact += 2;
    }
    
    // Defensive abilities
    if (magicItem.description?.toLowerCase().includes('resistance') || 
        magicItem.description?.toLowerCase().includes('ac')) {
      impact += 1.5;
    }
    
    // Spell effects
    const spellLevel = this.extractSpellLevel(magicItem.description || '');
    if (spellLevel > 0) {
      impact += spellLevel * 0.5;
    }
    
    return Math.min(10, Math.max(1, Math.round(impact)));
  }
  
  private static assessUtilityValue(magicItem: MagicItem): number {
    let utility = 1; // Base utility
    
    // Transportation abilities
    if (magicItem.description?.toLowerCase().includes('fly') || 
        magicItem.description?.toLowerCase().includes('teleport')) {
      utility += 3;
    }
    
    // Detection abilities
    if (magicItem.description?.toLowerCase().includes('detect') || 
        magicItem.description?.toLowerCase().includes('see')) {
      utility += 2;
    }
    
    // Communication abilities
    if (magicItem.description?.toLowerCase().includes('speak') || 
        magicItem.description?.toLowerCase().includes('understand')) {
      utility += 2;
    }
    
    // Skill bonuses
    if (magicItem.description?.toLowerCase().includes('skill') || 
        magicItem.description?.toLowerCase().includes('check')) {
      utility += 1.5;
    }
    
    // Multiple functions
    if (magicItem.properties && magicItem.properties.length > 2) {
      utility += magicItem.properties.length * 0.5;
    }
    
    return Math.min(10, Math.max(1, Math.round(utility)));
  }
  
  private static assessCampaignDisruption(magicItem: MagicItem, request: MagicItemGenerationRequest): number {
    let disruption = 1; // Base disruption
    
    // High-level spell effects
    const spellLevel = this.extractSpellLevel(magicItem.description || '');
    if (spellLevel >= 7) {
      disruption += 4;
    } else if (spellLevel >= 5) {
      disruption += 2;
    }
    
    // Reality-altering abilities
    if (magicItem.description?.toLowerCase().includes('wish') || 
        magicItem.description?.toLowerCase().includes('reality') ||
        magicItem.description?.toLowerCase().includes('time')) {
      disruption += 5;
    }
    
    // Mass effects
    if (magicItem.description?.toLowerCase().includes('all creatures') || 
        magicItem.description?.toLowerCase().includes('area')) {
      disruption += 2;
    }
    
    // Permanent effects
    if (magicItem.description?.toLowerCase().includes('permanent') || 
        magicItem.description?.toLowerCase().includes('forever')) {
      disruption += 3;
    }
    
    // Adjust for campaign power level
    if (request.campaignPowerLevel === 'low_magic') {
      disruption += 2;
    } else if (request.campaignPowerLevel === 'high_magic') {
      disruption -= 1;
    }
    
    return Math.min(10, Math.max(1, Math.round(disruption)));
  }
  
  private static getExpectedPowerForRarity(rarity: ItemRarity): number {
    const expectedPower = {
      common: 2,
      uncommon: 4,
      rare: 6,
      very_rare: 7,
      legendary: 8,
      artifact: 9
    };
    return expectedPower[rarity] || 5;
  }
  
  private static extractSpellLevel(description: string): number {
    const match = description.match(/(\d+)(?:st|nd|rd|th)-level spell/i);
    return match ? parseInt(match[1]) : 0;
  }
  
  // ============================================================================
  // USAGE GUIDANCE GENERATION
  // ============================================================================
  
  private static generateUsageGuidance(
    magicItem: MagicItem, 
    request: MagicItemGenerationRequest
  ): UsageGuidance {
    const bestUseScenarios = this.generateBestUseScenarios(magicItem, request);
    const synergies = this.identifySynergies(magicItem);
    const counters = this.identifyCounters(magicItem);
    const dmTips = this.generateDMTips(magicItem, request);
    const playerGuidance = this.generatePlayerGuidance(magicItem);
    
    return {
      bestUseScenarios,
      synergies,
      counters,
      dmTips,
      playerGuidance
    };
  }
  
  private static generateBestUseScenarios(magicItem: MagicItem, request: MagicItemGenerationRequest): string[] {
    const scenarios: string[] = [];
    
    // Based on item category
    switch (request.category) {
      case 'combat':
        scenarios.push('Boss fights and challenging encounters');
        scenarios.push('When facing enemies with high AC or resistance');
        break;
      case 'utility':
        scenarios.push('Exploration and problem-solving situations');
        scenarios.push('Social encounters and investigations');
        break;
      case 'exploration':
        scenarios.push('Dungeon delving and wilderness travel');
        scenarios.push('Overcoming environmental hazards');
        break;
    }
    
    // Based on specific abilities
    if (magicItem.description?.toLowerCase().includes('undead')) {
      scenarios.push('Encounters with undead creatures');
    }
    
    if (magicItem.description?.toLowerCase().includes('darkness')) {
      scenarios.push('Underground or nighttime adventures');
    }
    
    return scenarios.slice(0, 4);
  }
  
  private static identifySynergies(magicItem: MagicItem): string[] {
    const synergies: string[] = [];
    
    // Class synergies based on item type
    switch (magicItem.itemType) {
      case 'weapon':
        synergies.push('Fighters, Paladins, and Rangers benefit most');
        synergies.push('Combines well with combat feats and abilities');
        break;
      case 'armor':
        synergies.push('Tanks and front-line fighters gain maximum benefit');
        synergies.push('Synergizes with defensive spells and abilities');
        break;
      case 'wondrous_item':
        synergies.push('Versatile enough for any class');
        synergies.push('Enhances creative problem-solving approaches');
        break;
    }
    
    // Spell synergies
    if (magicItem.description?.toLowerCase().includes('spell')) {
      synergies.push('Spellcasters can maximize magical synergies');
      synergies.push('Combines well with metamagic and spell enhancements');
    }
    
    return synergies.slice(0, 3);
  }
  
  private static identifyCounters(magicItem: MagicItem): string[] {
    const counters: string[] = [];
    
    // Magic resistance
    if (magicItem.description?.toLowerCase().includes('spell') || 
        magicItem.description?.toLowerCase().includes('magic')) {
      counters.push('Magic resistance reduces effectiveness');
      counters.push('Antimagic fields completely negate the item');
    }
    
    // Attunement limitations
    if (magicItem.attunement) {
      counters.push('Limited by attunement slots (maximum 3)');
      counters.push('Effects end if attunement is broken');
    }
    
    // Charges
    if (magicItem.description?.includes('charges')) {
      counters.push('Limited by daily charge availability');
      counters.push('Risk of item destruction if overused');
    }
    
    return counters.slice(0, 3);
  }
  
  private static generateDMTips(magicItem: MagicItem, request: MagicItemGenerationRequest): string[] {
    const tips: string[] = [];
    
    // Rarity-based tips
    switch (request.rarity) {
      case 'rare':
      case 'very_rare':
      case 'legendary':
        tips.push('Consider this item as a major quest reward');
        tips.push('Build encounters that showcase the item\'s abilities');
        break;
      case 'artifact':
        tips.push('This should be central to a major story arc');
        tips.push('Consider the long-term campaign implications');
        break;
    }
    
    // Balance tips
    if (magicItem.description?.toLowerCase().includes('damage')) {
      tips.push('Monitor combat balance and adjust enemy HP if needed');
    }
    
    if (magicItem.description?.toLowerCase().includes('teleport') || 
        magicItem.description?.toLowerCase().includes('fly')) {
      tips.push('Prepare for players bypassing traditional obstacles');
    }
    
    return tips.slice(0, 4);
  }
  
  private static generatePlayerGuidance(magicItem: MagicItem): string[] {
    const guidance: string[] = [];
    
    // Usage optimization
    guidance.push('Coordinate with party members to maximize effectiveness');
    
    if (magicItem.attunement) {
      guidance.push('Consider attunement slot management carefully');
    }
    
    if (magicItem.description?.includes('charges')) {
      guidance.push('Save charges for critical moments');
      guidance.push('Track usage to avoid running out at crucial times');
    }
    
    // Roleplay considerations
    guidance.push('Consider how the item affects your character\'s story');
    
    return guidance.slice(0, 4);
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(
    magicItem: MagicItem, 
    request: MagicItemGenerationRequest
  ): ItemVariant[] {
    const variants: ItemVariant[] = [];
    
    // Lesser variant (reduce rarity)
    if (request.rarity !== 'common') {
      variants.push({
        name: `Lesser ${magicItem.name}`,
        rarityChange: -1,
        modifications: [
          'Reduce enhancement bonus by 1',
          'Fewer charges or uses per day',
          'More restrictive activation requirements'
        ],
        useCase: 'Lower-level parties or budget-conscious campaigns',
        marketValueMultiplier: 0.4
      });
    }
    
    // Greater variant (increase rarity)
    if (request.rarity !== 'artifact') {
      variants.push({
        name: `Greater ${magicItem.name}`,
        rarityChange: 1,
        modifications: [
          'Increase enhancement bonus by 1',
          'Additional magical properties',
          'More charges or uses per day'
        ],
        useCase: 'Higher-level parties or epic campaigns',
        marketValueMultiplier: 2.5
      });
    }
    
    // Cursed variant
    if (request.curseChance === undefined || request.curseChance < 50) {
      variants.push({
        name: `Cursed ${magicItem.name}`,
        rarityChange: 0,
        modifications: [
          'Add thematic curse that balances the benefits',
          'Curse activates under specific conditions',
          'Requires remove curse or similar to safely remove'
        ],
        useCase: 'Adding risk-reward dynamics to the campaign',
        marketValueMultiplier: 0.7
      });
    }
    
    return variants;
  }
  
  // ============================================================================
  // LORE AND HISTORY GENERATION
  // ============================================================================
  
  private static generateLoreAndHistory(
    magicItem: MagicItem, 
    request: MagicItemGenerationRequest
  ): LoreAndHistory {
    const origin = this.generateOriginStory(magicItem, request);
    const previousOwners = this.generatePreviousOwners(magicItem, request);
    const significantEvents = this.generateSignificantEvents(magicItem, request);
    const legendsAndMyths = this.generateLegendsAndMyths(magicItem, request);
    const currentReputation = this.generateCurrentReputation(magicItem, request);
    
    return {
      origin,
      previousOwners,
      significantEvents,
      legendsAndMyths,
      currentReputation
    };
  }
  
  private static generateOriginStory(magicItem: MagicItem, request: MagicItemGenerationRequest): string {
    const creator = request.creator || 'unknown';
    const origin = request.origin || 'ancient_civilization';
    
    let story = `Created by ${creator === 'unknown' ? 'a mysterious artisan' : `a powerful ${creator}`}`;
    
    switch (origin) {
      case 'divine_gift':
        story += ' as a divine blessing granted to a worthy champion';
        break;
      case 'arcane_experiment':
        story += ' during ambitious magical experiments that pushed the boundaries of possibility';
        break;
      case 'ancient_civilization':
        story += ' by an ancient civilization at the height of their magical prowess';
        break;
      case 'elemental_forge':
        story += ' in the heart of an elemental plane, where raw magical forces shaped matter';
        break;
      default:
        story += ' under circumstances lost to time and legend';
    }
    
    return story + '.';
  }
  
  private static generatePreviousOwners(magicItem: MagicItem, request: MagicItemGenerationRequest): string[] {
    const owners: string[] = [];
    
    // Generate owners based on rarity
    switch (request.rarity) {
      case 'legendary':
      case 'artifact':
        owners.push('An ancient dragon who hoarded it for centuries');
        owners.push('A legendary hero who used it to save kingdoms');
        owners.push('A powerful lich who sought its secrets');
        break;
      case 'very_rare':
      case 'rare':
        owners.push('A renowned adventurer of great skill');
        owners.push('A noble house that treasured it for generations');
        break;
      case 'uncommon':
        owners.push('A traveling merchant who never knew its true value');
        owners.push('A local hero who defended their village');
        break;
    }
    
    return owners.slice(0, 3);
  }
  
  private static generateSignificantEvents(magicItem: MagicItem, request: MagicItemGenerationRequest): string[] {
    const events: string[] = [];
    
    // Generate events based on theme and rarity
    if (request.theme === 'divine') {
      events.push('Blessed by a deity during a moment of great need');
    }
    
    if (request.rarity === 'legendary' || request.rarity === 'artifact') {
      events.push('Used to turn the tide in a great war');
      events.push('Sought after in a legendary quest');
    }
    
    events.push('Lost for decades before being rediscovered');
    events.push('Changed hands during a dramatic betrayal');
    
    return events.slice(0, 3);
  }
  
  private static generateLegendsAndMyths(magicItem: MagicItem, request: MagicItemGenerationRequest): string[] {
    const legends: string[] = [];
    
    legends.push(`Some say ${magicItem.name} chooses its wielder`);
    legends.push('Legends speak of hidden powers yet to be discovered');
    
    if (request.rarity === 'artifact') {
      legends.push('Prophecies foretell its role in shaping the world\'s fate');
    }
    
    return legends.slice(0, 3);
  }
  
  private static generateCurrentReputation(magicItem: MagicItem, request: MagicItemGenerationRequest): string {
    switch (request.rarity) {
      case 'artifact':
      case 'legendary':
        return 'Renowned across the realms and spoken of in hushed, reverent tones';
      case 'very_rare':
        return 'Known to scholars and collectors, highly sought after';
      case 'rare':
        return 'Recognized by experienced adventurers and magical experts';
      case 'uncommon':
        return 'Familiar to those knowledgeable about magical items';
      case 'common':
        return 'A curiosity to most, though useful to those who understand it';
      default:
        return 'Its reputation varies depending on who you ask';
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MagicItemGenerator;
