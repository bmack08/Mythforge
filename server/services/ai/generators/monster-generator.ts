// Mythwright Monster Generator - Specialized D&D 5e Creature Generation with CR Balancing
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { StatBlock, SystemDesignBudget } from '../../../types/content.types.js';
import { StatBlockSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// MONSTER GENERATION TYPES
// ============================================================================

export interface MonsterGenerationRequest {
  // Basic Requirements
  challengeRating: number | string; // e.g., 0.25, 1, 5, "1/4"
  creatureType: CreatureType;
  size: CreatureSize;
  
  // Optional Parameters
  name?: string;
  theme?: MonsterTheme;
  environment?: Environment;
  role?: CombatRole;
  abilities?: SpecialAbilities[];
  alignment?: Alignment;
  
  // Balance Requirements
  partyLevel?: number;
  partySize?: number;
  encounterDifficulty?: EncounterDifficulty;
  
  // Customization
  flavorText?: string;
  restrictions?: string[];
  mustHave?: string[];
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type CreatureType = 
  | 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' 
  | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' 
  | 'monstrosity' | 'ooze' | 'plant' | 'undead';

export type CreatureSize = 
  | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type MonsterTheme = 
  | 'classic' | 'horror' | 'nature' | 'elemental' | 'undead' 
  | 'fiendish' | 'celestial' | 'aberrant' | 'draconic' | 'construct';

export type Environment = 
  | 'arctic' | 'coast' | 'desert' | 'forest' | 'grassland' 
  | 'mountain' | 'swamp' | 'underdark' | 'urban' | 'any';

export type CombatRole = 
  | 'brute' | 'skirmisher' | 'soldier' | 'lurker' | 'artillery' 
  | 'controller' | 'leader' | 'minion';

export type SpecialAbilities = 
  | 'flight' | 'swimming' | 'burrowing' | 'climbing' | 'telepathy'
  | 'spellcasting' | 'multiattack' | 'legendary_actions' | 'lair_actions'
  | 'resistance' | 'immunity' | 'regeneration' | 'pack_tactics';

export type Alignment = 
  | 'lawful good' | 'neutral good' | 'chaotic good'
  | 'lawful neutral' | 'true neutral' | 'chaotic neutral'
  | 'lawful evil' | 'neutral evil' | 'chaotic evil'
  | 'unaligned';

export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'deadly';

export interface MonsterGenerationResult {
  statBlock: StatBlock;
  balanceReport: BalanceReport;
  tactics: TacticalGuidance;
  variants: MonsterVariant[];
}

export interface BalanceReport {
  crAccurate: boolean;
  offensiveCR: number;
  defensiveCR: number;
  finalCR: number;
  balanceIssues: string[];
  recommendations: string[];
  xpValue: number;
}

export interface TacticalGuidance {
  combatRole: CombatRole;
  preferredRange: 'melee' | 'ranged' | 'mixed';
  tactics: string[];
  weaknesses: string[];
  synergies: string[];
  environmentalFactors: string[];
}

export interface MonsterVariant {
  name: string;
  description: string;
  modifications: string[];
  crChange: number;
  useCase: string;
}

// ============================================================================
// CR CALCULATION CONSTANTS (Based on DMG)
// ============================================================================

const CR_XP_VALUES: Record<string, number> = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
  '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
  '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
  '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
  '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
  '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000,
  '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
};

const DEFENSIVE_CR_THRESHOLDS = [
  { cr: 0, hp: 6, ac: 13 }, { cr: 0.125, hp: 35, ac: 13 }, { cr: 0.25, hp: 49, ac: 13 },
  { cr: 0.5, hp: 70, ac: 13 }, { cr: 1, hp: 85, ac: 13 }, { cr: 2, hp: 100, ac: 13 },
  { cr: 3, hp: 115, ac: 13 }, { cr: 4, hp: 130, ac: 14 }, { cr: 5, hp: 145, ac: 15 },
  { cr: 6, hp: 160, ac: 15 }, { cr: 7, hp: 175, ac: 15 }, { cr: 8, hp: 190, ac: 16 },
  { cr: 9, hp: 205, ac: 16 }, { cr: 10, hp: 220, ac: 17 }, { cr: 11, hp: 235, ac: 17 },
  { cr: 12, hp: 250, ac: 17 }, { cr: 13, hp: 265, ac: 18 }, { cr: 14, hp: 280, ac: 18 },
  { cr: 15, hp: 295, ac: 18 }, { cr: 16, hp: 310, ac: 18 }, { cr: 17, hp: 325, ac: 19 }
];

const OFFENSIVE_CR_THRESHOLDS = [
  { cr: 0, dpr: 1, attackBonus: 3 }, { cr: 0.125, dpr: 2, attackBonus: 3 }, { cr: 0.25, dpr: 3, attackBonus: 3 },
  { cr: 0.5, dpr: 4, attackBonus: 3 }, { cr: 1, dpr: 5, attackBonus: 3 }, { cr: 2, dpr: 8, attackBonus: 3 },
  { cr: 3, dpr: 11, attackBonus: 4 }, { cr: 4, dpr: 14, attackBonus: 5 }, { cr: 5, dpr: 17, attackBonus: 6 },
  { cr: 6, dpr: 20, attackBonus: 6 }, { cr: 7, dpr: 23, attackBonus: 6 }, { cr: 8, dpr: 26, attackBonus: 7 },
  { cr: 9, dpr: 29, attackBonus: 7 }, { cr: 10, dpr: 32, attackBonus: 7 }, { cr: 11, dpr: 35, attackBonus: 8 },
  { cr: 12, dpr: 38, attackBonus: 8 }, { cr: 13, dpr: 41, attackBonus: 8 }, { cr: 14, dpr: 44, attackBonus: 8 },
  { cr: 15, dpr: 47, attackBonus: 8 }, { cr: 16, dpr: 50, attackBonus: 9 }, { cr: 17, dpr: 53, attackBonus: 10 }
];

// ============================================================================
// MONSTER GENERATOR CLASS
// ============================================================================

export class MonsterGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateMonster(
    request: MonsterGenerationRequest,
    aiService: any // AIService type
  ): Promise<MonsterGenerationResult> {
    
    // Step 1: Build the AI prompt
    const aiPrompt = this.buildMonsterPrompt(request);
    
    // Step 2: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'statblock',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          challengeRating: request.challengeRating,
          creatureType: request.creatureType,
          size: request.size,
          role: request.role,
          theme: request.theme
        }
      },
      options: {
        temperature: 0.7, // Balanced creativity for monsters
        maxTokens: 2000 // Monsters can be complex
      }
    };
    
    // Step 3: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Monster generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 4: Validate and parse the stat block
    const statBlock = this.validateAndParseStatBlock(aiResponse.content);
    
    // Step 5: Perform CR balance analysis
    const balanceReport = this.analyzeBalance(statBlock, request);
    
    // Step 6: Generate tactical guidance
    const tactics = this.generateTacticalGuidance(statBlock, request);
    
    // Step 7: Create variants
    const variants = this.generateVariants(statBlock, request);
    
    return {
      statBlock,
      balanceReport,
      tactics,
      variants
    };
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildMonsterPrompt(request: MonsterGenerationRequest): string {
    const cr = this.normalizeCR(request.challengeRating);
    const xpValue = CR_XP_VALUES[cr.toString()] || 100;
    
    let prompt = `Create a D&D 5e monster stat block with the following specifications:

CORE REQUIREMENTS:
- Challenge Rating: ${request.challengeRating} (${xpValue} XP)
- Creature Type: ${request.creatureType}
- Size: ${request.size}`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    if (request.alignment) {
      prompt += `\n- Alignment: ${request.alignment}`;
    }
    
    if (request.theme) {
      prompt += `\n- Theme: ${request.theme}`;
    }
    
    if (request.environment) {
      prompt += `\n- Environment: ${request.environment}`;
    }
    
    if (request.role) {
      prompt += `\n- Combat Role: ${request.role}`;
    }
    
    // Add balance requirements
    if (request.partyLevel && request.partySize) {
      prompt += `\n\nBALANCE CONTEXT:
- Designed for party of ${request.partySize} level ${request.partyLevel} characters
- Encounter difficulty: ${request.encounterDifficulty || 'medium'}`;
    }
    
    // Add special abilities
    if (request.abilities && request.abilities.length > 0) {
      prompt += `\n\nSPECIAL ABILITIES REQUIRED:
${request.abilities.map(ability => `- ${ability.replace('_', ' ')}`).join('\n')}`;
    }
    
    // Add restrictions
    if (request.restrictions && request.restrictions.length > 0) {
      prompt += `\n\nRESTRICTIONS:
${request.restrictions.map(restriction => `- ${restriction}`).join('\n')}`;
    }
    
    // Add must-have features
    if (request.mustHave && request.mustHave.length > 0) {
      prompt += `\n\nMUST INCLUDE:
${request.mustHave.map(feature => `- ${feature}`).join('\n')}`;
    }
    
    // Add flavor text guidance
    if (request.flavorText) {
      prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
    }
    
    // Add CR balance guidance
    const expectedHP = this.getExpectedHP(cr);
    const expectedAC = this.getExpectedAC(cr);
    const expectedDPR = this.getExpectedDPR(cr);
    const expectedAttackBonus = this.getExpectedAttackBonus(cr);
    
    prompt += `\n\nCR BALANCE GUIDELINES (for CR ${cr}):
- Expected HP: ~${expectedHP} (range: ${Math.floor(expectedHP * 0.8)}-${Math.ceil(expectedHP * 1.2)})
- Expected AC: ~${expectedAC} (range: ${expectedAC - 1}-${expectedAC + 1})
- Expected Damage per Round: ~${expectedDPR}
- Expected Attack Bonus: +${expectedAttackBonus}

CRITICAL REQUIREMENTS:
1. Follow D&D 5e stat block format exactly
2. Ensure CR is mathematically accurate using DMG guidelines
3. Include interesting tactical options and abilities
4. Make the creature memorable and flavorful
5. Ensure abilities synergize with the creature's role
6. Use only SRD-safe content (no Product Identity terms)
7. Include proper saving throws and skills based on creature type
8. Add legendary actions/resistance if CR 5+ and appropriate
9. Consider environmental factors and creature ecology
10. Balance offense and defense appropriately for the CR

Return a complete stat block in JSON format following the StatBlock schema.`;
    
    return prompt;
  }
  
  // ============================================================================
  // STAT BLOCK VALIDATION
  // ============================================================================
  
  private static validateAndParseStatBlock(content: any): StatBlock {
    // Validate against schema
    const validation = StatBlockSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptStatBlockFix(content);
      const revalidation = StatBlockSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid stat block generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptStatBlockFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.hitPointsFormula && fixed.hitPoints) {
      // Estimate hit die based on size and HP
      const hitDie = this.estimateHitDie(fixed.size, fixed.hitPoints);
      fixed.hitPointsFormula = hitDie;
    }
    
    if (!fixed.speed) {
      fixed.speed = { walk: 30 }; // Default speed
    }
    
    if (!fixed.savingThrows) {
      fixed.savingThrows = {};
    }
    
    if (!fixed.skills) {
      fixed.skills = {};
    }
    
    if (!fixed.damageResistances) {
      fixed.damageResistances = [];
    }
    
    if (!fixed.damageImmunities) {
      fixed.damageImmunities = [];
    }
    
    if (!fixed.conditionImmunities) {
      fixed.conditionImmunities = [];
    }
    
    if (!fixed.senses) {
      fixed.senses = { passivePerception: 10 + Math.floor((fixed.abilityScores?.wisdom || 10 - 10) / 2) };
    }
    
    if (!fixed.languages) {
      fixed.languages = [];
    }
    
    if (!fixed.actions) {
      fixed.actions = [];
    }
    
    return fixed;
  }
  
  // ============================================================================
  // CR BALANCE ANALYSIS
  // ============================================================================
  
  private static analyzeBalance(statBlock: StatBlock, request: MonsterGenerationRequest): BalanceReport {
    const targetCR = this.normalizeCR(request.challengeRating);
    
    // Calculate defensive CR
    const defensiveCR = this.calculateDefensiveCR(statBlock);
    
    // Calculate offensive CR
    const offensiveCR = this.calculateOffensiveCR(statBlock);
    
    // Calculate final CR
    const finalCR = Math.round((defensiveCR + offensiveCR) / 2);
    
    // Check accuracy
    const crAccurate = Math.abs(finalCR - targetCR) <= 0.5;
    
    // Identify balance issues
    const balanceIssues: string[] = [];
    const recommendations: string[] = [];
    
    if (!crAccurate) {
      balanceIssues.push(`Calculated CR (${finalCR}) doesn't match target CR (${targetCR})`);
      
      if (finalCR > targetCR) {
        recommendations.push('Consider reducing HP, AC, damage output, or special abilities');
      } else {
        recommendations.push('Consider increasing HP, AC, damage output, or adding special abilities');
      }
    }
    
    const defensiveOffensiveGap = Math.abs(defensiveCR - offensiveCR);
    if (defensiveOffensiveGap > 2) {
      balanceIssues.push(`Large gap between defensive CR (${defensiveCR}) and offensive CR (${offensiveCR})`);
      
      if (defensiveCR > offensiveCR) {
        recommendations.push('Consider adding damage or special offensive abilities');
      } else {
        recommendations.push('Consider increasing HP or AC for better survivability');
      }
    }
    
    // Check for common balance issues
    this.checkCommonBalanceIssues(statBlock, balanceIssues, recommendations);
    
    return {
      crAccurate,
      offensiveCR,
      defensiveCR,
      finalCR,
      balanceIssues,
      recommendations,
      xpValue: CR_XP_VALUES[finalCR.toString()] || CR_XP_VALUES[targetCR.toString()] || 100
    };
  }
  
  private static calculateDefensiveCR(statBlock: StatBlock): number {
    const hp = statBlock.hitPoints;
    const ac = statBlock.armorClass;
    
    // Find base CR from HP
    let baseCR = 0;
    for (const threshold of DEFENSIVE_CR_THRESHOLDS) {
      if (hp >= threshold.hp) {
        baseCR = threshold.cr;
      } else {
        break;
      }
    }
    
    // Adjust for AC
    const expectedAC = this.getExpectedAC(baseCR);
    const acDifference = ac - expectedAC;
    const crAdjustment = Math.floor(acDifference / 2) * 0.5; // Every 2 AC = 0.5 CR
    
    // Adjust for resistances/immunities
    let resistanceMultiplier = 1;
    if (statBlock.damageResistances && statBlock.damageResistances.length > 0) {
      resistanceMultiplier += 0.25 * statBlock.damageResistances.length;
    }
    if (statBlock.damageImmunities && statBlock.damageImmunities.length > 0) {
      resistanceMultiplier += 0.5 * statBlock.damageImmunities.length;
    }
    
    const effectiveHP = hp * resistanceMultiplier;
    
    // Recalculate with effective HP
    let finalCR = baseCR + crAdjustment;
    if (resistanceMultiplier > 1.5) {
      finalCR += 0.5; // Significant resistance bonus
    }
    
    return Math.max(0, finalCR);
  }
  
  private static calculateOffensiveCR(statBlock: StatBlock): number {
    // Calculate damage per round
    let dpr = 0;
    let highestAttackBonus = 0;
    
    if (statBlock.actions) {
      for (const action of statBlock.actions) {
        if (action.type === 'attack') {
          // Parse attack bonus and damage
          const attackBonus = this.parseAttackBonus(action.description || '');
          const damage = this.parseDamage(action.description || '');
          
          highestAttackBonus = Math.max(highestAttackBonus, attackBonus);
          dpr += damage;
        }
      }
    }
    
    // Find base CR from DPR
    let baseCR = 0;
    for (const threshold of OFFENSIVE_CR_THRESHOLDS) {
      if (dpr >= threshold.dpr) {
        baseCR = threshold.cr;
      } else {
        break;
      }
    }
    
    // Adjust for attack bonus
    const expectedAttackBonus = this.getExpectedAttackBonus(baseCR);
    const attackBonusDifference = highestAttackBonus - expectedAttackBonus;
    const crAdjustment = Math.floor(attackBonusDifference / 2) * 0.5; // Every 2 attack bonus = 0.5 CR
    
    return Math.max(0, baseCR + crAdjustment);
  }
  
  private static checkCommonBalanceIssues(
    statBlock: StatBlock, 
    issues: string[], 
    recommendations: string[]
  ): void {
    // Check for save-or-die effects
    if (statBlock.actions?.some(action => 
      action.description?.toLowerCase().includes('unconscious') ||
      action.description?.toLowerCase().includes('paralyzed') ||
      action.description?.toLowerCase().includes('stunned')
    )) {
      issues.push('Contains potentially overpowered save-or-die effects');
      recommendations.push('Consider adding legendary resistance or reducing save DC');
    }
    
    // Check for excessive legendary actions
    if (statBlock.legendaryActions && statBlock.legendaryActions.length > 3) {
      issues.push('Too many legendary actions for balanced gameplay');
      recommendations.push('Limit to 3 legendary actions per turn');
    }
    
    // Check for appropriate legendary resistance
    const cr = this.normalizeCR(statBlock.challengeRating);
    if (cr >= 5 && !statBlock.legendaryResistance) {
      recommendations.push('Consider adding legendary resistance for CR 5+ creatures');
    }
  }
  
  // ============================================================================
  // TACTICAL GUIDANCE GENERATION
  // ============================================================================
  
  private static generateTacticalGuidance(
    statBlock: StatBlock, 
    request: MonsterGenerationRequest
  ): TacticalGuidance {
    const role = request.role || this.inferCombatRole(statBlock);
    const preferredRange = this.inferPreferredRange(statBlock);
    
    const tactics = this.generateTactics(statBlock, role);
    const weaknesses = this.identifyWeaknesses(statBlock);
    const synergies = this.identifySynergies(statBlock, request);
    const environmentalFactors = this.getEnvironmentalFactors(request.environment);
    
    return {
      combatRole: role,
      preferredRange,
      tactics,
      weaknesses,
      synergies,
      environmentalFactors
    };
  }
  
  private static inferCombatRole(statBlock: StatBlock): CombatRole {
    const hp = statBlock.hitPoints;
    const ac = statBlock.armorClass;
    const cr = this.normalizeCR(statBlock.challengeRating);
    
    // High HP, low AC = Brute
    if (hp > this.getExpectedHP(cr) * 1.2 && ac < this.getExpectedAC(cr)) {
      return 'brute';
    }
    
    // High AC, moderate HP = Soldier
    if (ac > this.getExpectedAC(cr) && hp >= this.getExpectedHP(cr) * 0.8) {
      return 'soldier';
    }
    
    // High speed or teleportation = Skirmisher
    if (statBlock.speed?.walk && statBlock.speed.walk > 40) {
      return 'skirmisher';
    }
    
    // Spellcasting or ranged attacks = Artillery
    if (statBlock.spellcasting || statBlock.actions?.some(a => a.description?.includes('ranged'))) {
      return 'artillery';
    }
    
    // Default to soldier
    return 'soldier';
  }
  
  private static inferPreferredRange(statBlock: StatBlock): 'melee' | 'ranged' | 'mixed' {
    const hasRangedAttacks = statBlock.actions?.some(a => 
      a.description?.includes('ranged') || a.description?.includes('range')
    );
    const hasMeleeAttacks = statBlock.actions?.some(a => 
      a.description?.includes('melee') || a.type === 'attack'
    );
    
    if (hasRangedAttacks && hasMeleeAttacks) return 'mixed';
    if (hasRangedAttacks) return 'ranged';
    return 'melee';
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(
    statBlock: StatBlock, 
    request: MonsterGenerationRequest
  ): MonsterVariant[] {
    const variants: MonsterVariant[] = [];
    const baseCR = this.normalizeCR(statBlock.challengeRating);
    
    // Elite variant (CR +1)
    variants.push({
      name: `Elite ${statBlock.name}`,
      description: 'A more powerful version with enhanced abilities',
      modifications: [
        'Increase HP by 25%',
        'Add +2 to attack rolls and damage',
        'Increase AC by 1',
        'Add one additional special ability'
      ],
      crChange: 1,
      useCase: 'Boss encounters or higher-level parties'
    });
    
    // Weak variant (CR -1)
    if (baseCR > 0.25) {
      variants.push({
        name: `Lesser ${statBlock.name}`,
        description: 'A weaker version suitable for lower-level encounters',
        modifications: [
          'Reduce HP by 25%',
          'Reduce attack bonus by 2',
          'Remove one special ability',
          'Reduce damage by 25%'
        ],
        crChange: -1,
        useCase: 'Lower-level parties or minion encounters'
      });
    }
    
    // Swarm variant (if Small or smaller)
    if (['Tiny', 'Small'].includes(statBlock.size)) {
      variants.push({
        name: `Swarm of ${statBlock.name}s`,
        description: 'Multiple creatures acting as a single entity',
        modifications: [
          'Combine into Medium swarm',
          'HP scales with swarm size',
          'Resistance to physical damage',
          'Vulnerability to area effects',
          'Swarm dispersal mechanics'
        ],
        crChange: 1,
        useCase: 'Encounters requiring area control tactics'
      });
    }
    
    return variants;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static normalizeCR(cr: number | string): number {
    if (typeof cr === 'string') {
      if (cr === '1/8') return 0.125;
      if (cr === '1/4') return 0.25;
      if (cr === '1/2') return 0.5;
      return parseInt(cr) || 1;
    }
    return cr;
  }
  
  private static getExpectedHP(cr: number): number {
    const threshold = DEFENSIVE_CR_THRESHOLDS.find(t => t.cr === cr);
    return threshold?.hp || Math.round(13 * cr + 20);
  }
  
  private static getExpectedAC(cr: number): number {
    const threshold = DEFENSIVE_CR_THRESHOLDS.find(t => t.cr === cr);
    return threshold?.ac || Math.round(13 + cr / 3);
  }
  
  private static getExpectedDPR(cr: number): number {
    const threshold = OFFENSIVE_CR_THRESHOLDS.find(t => t.cr === cr);
    return threshold?.dpr || Math.round(3 * cr + 2);
  }
  
  private static getExpectedAttackBonus(cr: number): number {
    const threshold = OFFENSIVE_CR_THRESHOLDS.find(t => t.cr === cr);
    return threshold?.attackBonus || Math.round(3 + cr / 2);
  }
  
  private static estimateHitDie(size: string, hp: number): string {
    const hitDieMap: Record<string, number> = {
      'Tiny': 4, 'Small': 6, 'Medium': 8, 'Large': 10, 'Huge': 12, 'Gargantuan': 20
    };
    
    const die = hitDieMap[size] || 8;
    const numDice = Math.round(hp / (die / 2 + 0.5));
    
    return `${numDice}d${die}`;
  }
  
  private static parseAttackBonus(description: string): number {
    const match = description.match(/\+(\d+)\s+to\s+hit/i);
    return match ? parseInt(match[1]) : 0;
  }
  
  private static parseDamage(description: string): number {
    // Simplified damage parsing - would be more complex in reality
    const diceMatch = description.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
    if (diceMatch) {
      const numDice = parseInt(diceMatch[1]);
      const dieSize = parseInt(diceMatch[2]);
      const bonus = diceMatch[3] ? parseInt(diceMatch[3]) : 0;
      return numDice * (dieSize / 2 + 0.5) + bonus;
    }
    return 0;
  }
  
  private static generateTactics(statBlock: StatBlock, role: CombatRole): string[] {
    const tactics: string[] = [];
    
    switch (role) {
      case 'brute':
        tactics.push('Charge directly at the strongest-looking opponent');
        tactics.push('Use powerful attacks even if they leave openings');
        tactics.push('Ignore minor threats to focus on primary targets');
        break;
      case 'skirmisher':
        tactics.push('Use hit-and-run tactics to avoid retaliation');
        tactics.push('Target isolated or vulnerable enemies');
        tactics.push('Retreat when heavily damaged to reposition');
        break;
      case 'artillery':
        tactics.push('Maintain distance and use ranged attacks');
        tactics.push('Target spellcasters and other ranged threats first');
        tactics.push('Seek cover or high ground when possible');
        break;
      case 'controller':
        tactics.push('Use abilities to control battlefield positioning');
        tactics.push('Focus on disrupting enemy formations');
        tactics.push('Support allies with beneficial effects');
        break;
      default:
        tactics.push('Fight defensively while looking for opportunities');
        tactics.push('Coordinate with allies when possible');
        tactics.push('Use special abilities strategically');
    }
    
    return tactics;
  }
  
  private static identifyWeaknesses(statBlock: StatBlock): string[] {
    const weaknesses: string[] = [];
    
    // Low saves
    const saves = statBlock.savingThrows || {};
    const lowSaves = ['wisdom', 'intelligence', 'charisma'].filter(save => 
      !saves[save as keyof typeof saves] || saves[save as keyof typeof saves]! < 3
    );
    
    if (lowSaves.length > 0) {
      weaknesses.push(`Vulnerable to ${lowSaves.join(', ')} saves`);
    }
    
    // Low AC
    const cr = this.normalizeCR(statBlock.challengeRating);
    if (statBlock.armorClass < this.getExpectedAC(cr) - 1) {
      weaknesses.push('Low armor class - vulnerable to sustained attacks');
    }
    
    // No ranged options
    const hasRanged = statBlock.actions?.some(a => a.description?.includes('ranged'));
    if (!hasRanged) {
      weaknesses.push('No ranged attacks - vulnerable to kiting tactics');
    }
    
    return weaknesses;
  }
  
  private static identifySynergies(statBlock: StatBlock, request: MonsterGenerationRequest): string[] {
    const synergies: string[] = [];
    
    if (request.creatureType === 'humanoid') {
      synergies.push('Works well with other humanoids in organized groups');
    }
    
    if (request.abilities?.includes('pack_tactics')) {
      synergies.push('Extremely effective when fighting alongside allies');
    }
    
    if (statBlock.spellcasting) {
      synergies.push('Can support allies with spells and buffs');
    }
    
    return synergies;
  }
  
  private static getEnvironmentalFactors(environment?: Environment): string[] {
    const factors: string[] = [];
    
    switch (environment) {
      case 'forest':
        factors.push('Use trees for cover and concealment');
        factors.push('Difficult terrain may slow pursuit');
        break;
      case 'urban':
        factors.push('Use buildings and alleys tactically');
        factors.push('May have civilian complications');
        break;
      case 'underdark':
        factors.push('Limited visibility benefits creature');
        factors.push('Cramped spaces favor certain tactics');
        break;
      default:
        factors.push('Consider terrain and environmental hazards');
    }
    
    return factors;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MonsterGenerator;
