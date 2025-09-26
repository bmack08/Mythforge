// Mythwright Random Table Generator - Specialized D&D 5e Random Table Creation with Weighted Probabilities
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { RandomTable, SystemDesignBudget } from '../../../types/content.types.js';
import { RandomTableSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// RANDOM TABLE GENERATION TYPES
// ============================================================================

export interface RandomTableGenerationRequest {
  // Basic Requirements
  tableName?: string;
  tableType: TableType;
  purpose: TablePurpose;
  diceType: DiceType;
  
  // Content Parameters
  entryCount: number;
  theme: TableTheme;
  setting: SettingType;
  difficulty?: DifficultyLevel;
  
  // Contextual Information
  partyLevel?: number;
  campaignStyle?: CampaignStyle;
  culturalContext?: CulturalContext;
  timeOfDay?: TimeOfDay;
  season?: Season;
  
  // Table Structure
  weightingStyle: WeightingStyle;
  resultFormat: ResultFormat;
  includeSubtables?: boolean;
  crossReference?: boolean;
  
  // Content Customization
  toneStyle: ToneStyle;
  complexity: ComplexityLevel;
  reusability: ReusabilityLevel;
  narrative?: boolean;
  mechanical?: boolean;
  
  // Specific Requirements
  mustInclude?: string[];
  avoidContent?: string[];
  rarityDistribution?: RarityDistribution;
  consequenceLevel?: ConsequenceLevel;
  
  // Integration
  linkToTables?: string[];
  expandableEntries?: boolean;
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type TableType = 
  | 'encounter' | 'treasure' | 'random_event' | 'npc_generator' | 'location'
  | 'weather' | 'rumor' | 'complication' | 'plot_hook' | 'magic_effect'
  | 'trap_component' | 'dungeon_feature' | 'wilderness_discovery' | 'urban_event'
  | 'social_reaction' | 'merchant_goods' | 'tavern_patron' | 'quest_twist'
  | 'environmental_hazard' | 'mysterious_phenomenon' | 'faction_activity';

export type TablePurpose = 
  | 'session_preparation' | 'improvisation_aid' | 'world_building' | 'encounter_spice'
  | 'treasure_variation' | 'narrative_hooks' | 'character_background' | 'random_generation'
  | 'campaign_events' | 'exploration_results' | 'social_encounters' | 'mystery_elements';

export type DiceType = 
  | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100' | 'percentile'
  | '2d6' | '3d6' | '2d10' | 'custom';

export type TableTheme = 
  | 'classic_fantasy' | 'dark_fantasy' | 'high_fantasy' | 'urban_fantasy'
  | 'horror' | 'mystery' | 'adventure' | 'political_intrigue' | 'exploration'
  | 'dungeon_crawl' | 'wilderness' | 'seafaring' | 'planar_travel' | 'time_travel';

export type SettingType = 
  | 'any' | 'dungeon' | 'city' | 'wilderness' | 'tavern' | 'court' | 'temple'
  | 'library' | 'market' | 'docks' | 'forest' | 'mountain' | 'desert' | 'swamp'
  | 'underground' | 'planar' | 'magical_location' | 'ruins' | 'battlefield';

export type DifficultyLevel = 
  | 'trivial' | 'easy' | 'moderate' | 'challenging' | 'hard' | 'epic';

export type CampaignStyle = 
  | 'heroic' | 'gritty' | 'comedic' | 'horror' | 'political' | 'exploration'
  | 'dungeon_focused' | 'roleplay_heavy' | 'combat_focused' | 'mystery';

export type CulturalContext = 
  | 'generic_fantasy' | 'medieval_european' | 'ancient_greco_roman' | 'norse_viking'
  | 'celtic_gaelic' | 'middle_eastern' | 'far_eastern' | 'african_inspired'
  | 'renaissance_italian' | 'victorian_steampunk' | 'multicultural';

export type TimeOfDay = 
  | 'any' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight';

export type Season = 
  | 'any' | 'spring' | 'summer' | 'autumn' | 'winter';

export type WeightingStyle = 
  | 'equal' | 'bell_curve' | 'rare_heavy' | 'common_heavy' | 'custom'
  | 'dramatic_arc' | 'escalating' | 'front_loaded' | 'back_loaded';

export type ResultFormat = 
  | 'simple_text' | 'detailed_description' | 'stat_block' | 'narrative_scene'
  | 'mechanical_effect' | 'mixed_format' | 'bullet_points' | 'paragraph_form';

export type ToneStyle = 
  | 'serious' | 'humorous' | 'dramatic' | 'mysterious' | 'whimsical'
  | 'dark' | 'light_hearted' | 'epic' | 'mundane' | 'surreal';

export type ComplexityLevel = 
  | 'simple' | 'moderate' | 'complex' | 'layered';

export type ReusabilityLevel = 
  | 'one_shot' | 'session_based' | 'campaign_long' | 'universal';

export type RarityDistribution = 
  | 'even' | 'common_heavy' | 'uncommon_focus' | 'rare_emphasis' | 'legendary_possible';

export type ConsequenceLevel = 
  | 'none' | 'minor' | 'moderate' | 'major' | 'campaign_changing';

export interface RandomTableGenerationResult {
  randomTable: RandomTable;
  tableAnalysis: TableAnalysis;
  usabilityReport: UsabilityReport;
  balanceAssessment: BalanceAssessment;
  expansionSuggestions: ExpansionSuggestion[];
  usageGuidance: UsageGuidance;
  variants: TableVariant[];
}

export interface TableAnalysis {
  entryDistribution: EntryDistribution;
  thematicConsistency: number; // 0-100
  mechanicalBalance: number; // 0-100
  narrativeQuality: number; // 0-100
  reusabilityScore: number; // 0-100
  complexityRating: ComplexityRating;
  overallQuality: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface EntryDistribution {
  totalEntries: number;
  averageLength: number;
  lengthVariation: 'low' | 'moderate' | 'high';
  rarityBreakdown: RarityBreakdown;
  consequenceSpread: ConsequenceSpread;
}

export interface RarityBreakdown {
  common: number;
  uncommon: number;
  rare: number;
  veryRare: number;
  legendary: number;
}

export interface ConsequenceSpread {
  trivial: number;
  minor: number;
  moderate: number;
  major: number;
  severe: number;
}

export interface ComplexityRating {
  mechanicalComplexity: 'low' | 'medium' | 'high';
  narrativeComplexity: 'low' | 'medium' | 'high';
  dmPreparation: 'minimal' | 'moderate' | 'extensive';
  playerImpact: 'low' | 'medium' | 'high';
}

export interface UsabilityReport {
  easeOfUse: number; // 0-100
  preparationRequired: PreparationLevel;
  sessionIntegration: IntegrationLevel;
  playerEngagement: EngagementLevel;
  dmWorkload: WorkloadLevel;
  recommendedFrequency: FrequencyRecommendation;
}

export type PreparationLevel = 
  | 'none' | 'minimal' | 'moderate' | 'extensive';

export type IntegrationLevel = 
  | 'seamless' | 'easy' | 'moderate' | 'challenging';

export type EngagementLevel = 
  | 'low' | 'moderate' | 'high' | 'very_high';

export type WorkloadLevel = 
  | 'light' | 'moderate' | 'heavy' | 'intensive';

export type FrequencyRecommendation = 
  | 'every_session' | 'weekly' | 'monthly' | 'rarely' | 'special_occasions';

export interface BalanceAssessment {
  powerLevel: PowerLevelAssessment;
  riskReward: RiskRewardBalance;
  gameImpact: GameImpactAssessment;
  balanceIssues: BalanceIssue[];
  recommendations: string[];
}

export interface PowerLevelAssessment {
  averagePowerLevel: number; // 1-10 scale
  powerVariation: 'low' | 'moderate' | 'high' | 'extreme';
  outlierCount: number;
  scalingAppropriate: boolean;
}

export interface RiskRewardBalance {
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  rewardLevel: 'minimal' | 'fair' | 'generous' | 'excessive';
  balanceRating: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface GameImpactAssessment {
  narrativeImpact: 'minimal' | 'moderate' | 'significant' | 'major';
  mechanicalImpact: 'minimal' | 'moderate' | 'significant' | 'major';
  campaignImpact: 'minimal' | 'moderate' | 'significant' | 'major';
  playerAgencyImpact: 'minimal' | 'moderate' | 'significant' | 'major';
}

export interface BalanceIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedEntries: number[];
  recommendation: string;
}

export interface ExpansionSuggestion {
  suggestionType: 'subtable' | 'additional_entries' | 'cross_reference' | 'variant_table';
  description: string;
  implementation: string;
  benefit: string;
}

export interface UsageGuidance {
  whenToUse: string[];
  howToUse: string[];
  dmTips: string[];
  commonMistakes: string[];
  troubleshooting: string[];
}

export interface TableVariant {
  name: string;
  description: string;
  modifications: string[];
  useCase: string;
  difficultyChange?: number;
}

// ============================================================================
// TABLE TEMPLATES AND PATTERNS
// ============================================================================

const DICE_RANGES = {
  'd4': { min: 1, max: 4, entries: 4 },
  'd6': { min: 1, max: 6, entries: 6 },
  'd8': { min: 1, max: 8, entries: 8 },
  'd10': { min: 1, max: 10, entries: 10 },
  'd12': { min: 1, max: 12, entries: 12 },
  'd20': { min: 1, max: 20, entries: 20 },
  'd100': { min: 1, max: 100, entries: 100 },
  'percentile': { min: 1, max: 100, entries: 100 },
  '2d6': { min: 2, max: 12, entries: 11 },
  '3d6': { min: 3, max: 18, entries: 16 },
  '2d10': { min: 2, max: 20, entries: 19 }
};

const WEIGHTING_PATTERNS = {
  equal: (count: number) => Array(count).fill(1),
  bell_curve: (count: number) => {
    const weights = [];
    const center = Math.floor(count / 2);
    for (let i = 0; i < count; i++) {
      const distance = Math.abs(i - center);
      weights.push(Math.max(1, count - distance * 2));
    }
    return weights;
  },
  rare_heavy: (count: number) => {
    const weights = [];
    for (let i = 0; i < count; i++) {
      weights.push(count - i);
    }
    return weights;
  },
  common_heavy: (count: number) => {
    const weights = [];
    for (let i = 0; i < count; i++) {
      weights.push(i + 1);
    }
    return weights;
  }
};

const RARITY_DISTRIBUTIONS = {
  even: { common: 40, uncommon: 30, rare: 20, veryRare: 8, legendary: 2 },
  common_heavy: { common: 60, uncommon: 25, rare: 12, veryRare: 3, legendary: 0 },
  uncommon_focus: { common: 30, uncommon: 50, rare: 15, veryRare: 4, legendary: 1 },
  rare_emphasis: { common: 20, uncommon: 30, rare: 35, veryRare: 12, legendary: 3 },
  legendary_possible: { common: 15, uncommon: 25, rare: 30, veryRare: 20, legendary: 10 }
};

// ============================================================================
// RANDOM TABLE GENERATOR CLASS
// ============================================================================

export class RandomTableGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateRandomTable(
    request: RandomTableGenerationRequest,
    aiService: any // AIService type
  ): Promise<RandomTableGenerationResult> {
    
    // Step 1: Calculate table structure
    const tableStructure = this.calculateTableStructure(request);
    
    // Step 2: Build the AI prompt
    const aiPrompt = this.buildRandomTablePrompt(request, tableStructure);
    
    // Step 3: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'random_table',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          tableType: request.tableType,
          purpose: request.purpose,
          theme: request.theme,
          diceType: request.diceType,
          entryCount: request.entryCount,
          weightingStyle: request.weightingStyle
        }
      },
      options: {
        temperature: 0.7, // Balanced creativity for tables
        maxTokens: this.getMaxTokensForTable(request.entryCount, request.resultFormat)
      }
    };
    
    // Step 4: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Random table generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 5: Validate and parse the table
    const randomTable = this.validateAndParseTable(aiResponse.content);
    
    // Step 6: Analyze table quality
    const tableAnalysis = this.analyzeTable(randomTable, request);
    
    // Step 7: Generate usability report
    const usabilityReport = this.generateUsabilityReport(randomTable, request);
    
    // Step 8: Assess balance
    const balanceAssessment = this.assessBalance(randomTable, request);
    
    // Step 9: Generate expansion suggestions
    const expansionSuggestions = this.generateExpansionSuggestions(randomTable, request);
    
    // Step 10: Create usage guidance
    const usageGuidance = this.createUsageGuidance(randomTable, request);
    
    // Step 11: Generate variants
    const variants = this.generateVariants(randomTable, request);
    
    return {
      randomTable,
      tableAnalysis,
      usabilityReport,
      balanceAssessment,
      expansionSuggestions,
      usageGuidance,
      variants
    };
  }
  
  // ============================================================================
  // TABLE STRUCTURE CALCULATION
  // ============================================================================
  
  private static calculateTableStructure(request: RandomTableGenerationRequest): any {
    const diceInfo = DICE_RANGES[request.diceType] || DICE_RANGES['d20'];
    const actualEntryCount = Math.min(request.entryCount, diceInfo.entries);
    
    // Calculate weighting pattern
    const weights = this.calculateWeights(request.weightingStyle, actualEntryCount);
    
    // Calculate rarity distribution
    const rarityDist = RARITY_DISTRIBUTIONS[request.rarityDistribution || 'even'];
    
    return {
      diceInfo,
      actualEntryCount,
      weights,
      rarityDistribution: rarityDist,
      rangeStart: diceInfo.min,
      rangeEnd: diceInfo.min + actualEntryCount - 1
    };
  }
  
  private static calculateWeights(style: WeightingStyle, count: number): number[] {
    const pattern = WEIGHTING_PATTERNS[style as keyof typeof WEIGHTING_PATTERNS];
    if (pattern) {
      return pattern(count);
    }
    
    // Default to equal weighting
    return Array(count).fill(1);
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildRandomTablePrompt(
    request: RandomTableGenerationRequest, 
    structure: any
  ): string {
    let prompt = `Create a D&D 5e random table with balanced, engaging results:

CORE REQUIREMENTS:
- Table Type: ${request.tableType}
- Purpose: ${request.purpose}
- Dice Type: ${request.diceType}
- Entry Count: ${structure.actualEntryCount} entries`;

    if (request.tableName) {
      prompt += `\n- Table Name: ${request.tableName}`;
    }
    
    // Add table structure information
    prompt += `\n\nTABLE STRUCTURE:`;
    prompt += `\n- Dice Range: ${structure.rangeStart}-${structure.rangeEnd}`;
    prompt += `\n- Weighting Style: ${request.weightingStyle}`;
    prompt += `\n- Result Format: ${request.resultFormat}`;
    
    if (request.includeSubtables) {
      prompt += `\n- Include Subtables: Yes`;
    }
    
    if (request.crossReference) {
      prompt += `\n- Cross-Reference Other Tables: Yes`;
    }
    
    // Add thematic information
    prompt += `\n\nTHEME & SETTING:`;
    prompt += `\n- Theme: ${request.theme}`;
    prompt += `\n- Setting: ${request.setting}`;
    prompt += `\n- Tone Style: ${request.toneStyle}`;
    prompt += `\n- Complexity: ${request.complexity}`;
    
    if (request.difficulty) {
      prompt += `\n- Difficulty Level: ${request.difficulty}`;
    }
    
    if (request.partyLevel) {
      prompt += `\n- Target Party Level: ${request.partyLevel}`;
    }
    
    // Add contextual information
    if (request.campaignStyle || request.culturalContext || request.timeOfDay || request.season) {
      prompt += `\n\nCONTEXTUAL DETAILS:`;
      if (request.campaignStyle) prompt += `\n- Campaign Style: ${request.campaignStyle}`;
      if (request.culturalContext) prompt += `\n- Cultural Context: ${request.culturalContext}`;
      if (request.timeOfDay && request.timeOfDay !== 'any') prompt += `\n- Time of Day: ${request.timeOfDay}`;
      if (request.season && request.season !== 'any') prompt += `\n- Season: ${request.season}`;
    }
    
    // Add content requirements
    if (request.narrative || request.mechanical) {
      prompt += `\n\nCONTENT REQUIREMENTS:`;
      if (request.narrative) prompt += `\n- Include narrative elements and storytelling hooks`;
      if (request.mechanical) prompt += `\n- Include mechanical effects and game rules`;
    }
    
    // Add rarity and consequence information
    if (request.rarityDistribution || request.consequenceLevel) {
      prompt += `\n\nBALANCE REQUIREMENTS:`;
      if (request.rarityDistribution) {
        const dist = RARITY_DISTRIBUTIONS[request.rarityDistribution];
        prompt += `\n- Rarity Distribution: ${dist.common}% common, ${dist.uncommon}% uncommon, ${dist.rare}% rare, ${dist.veryRare}% very rare, ${dist.legendary}% legendary`;
      }
      if (request.consequenceLevel) {
        prompt += `\n- Maximum Consequence Level: ${request.consequenceLevel}`;
      }
    }
    
    // Add reusability requirements
    prompt += `\n\nREUSABILITY: ${request.reusability}`;
    switch (request.reusability) {
      case 'one_shot':
        prompt += `\n- Design for single-use scenarios with immediate impact`;
        break;
      case 'session_based':
        prompt += `\n- Design for use within a single session, multiple rolls possible`;
        break;
      case 'campaign_long':
        prompt += `\n- Design for repeated use throughout a campaign`;
        break;
      case 'universal':
        prompt += `\n- Design for use across multiple campaigns and settings`;
        break;
    }
    
    // Add must-include requirements
    if (request.mustInclude && request.mustInclude.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustInclude.forEach(requirement => {
        prompt += `\n- ${requirement}`;
      });
    }
    
    // Add avoidance requirements
    if (request.avoidContent && request.avoidContent.length > 0) {
      prompt += `\n\nAVOID CONTENT:`;
      request.avoidContent.forEach(avoid => {
        prompt += `\n- ${avoid}`;
      });
    }
    
    // Add linking requirements
    if (request.linkToTables && request.linkToTables.length > 0) {
      prompt += `\n\nLINK TO TABLES:`;
      request.linkToTables.forEach(table => {
        prompt += `\n- Reference or connect to: ${table}`;
      });
    }
    
    // Add format-specific guidance
    prompt += this.getFormatGuidance(request.resultFormat);
    
    // Add type-specific guidance
    prompt += this.getTypeGuidance(request.tableType, request.purpose);
    
    prompt += `\n\nCRITICAL REQUIREMENTS:
1. Create exactly ${structure.actualEntryCount} distinct, engaging table entries
2. Number entries from ${structure.rangeStart} to ${structure.rangeEnd}
3. Ensure each entry is unique and interesting
4. Balance common and rare results appropriately
5. Make results immediately usable in gameplay
6. Use only SRD-safe content (no Product Identity terms)
7. Ensure thematic consistency across all entries
8. Provide clear, actionable results for DMs
9. Consider the impact and consequences of each result
10. Make the table reusable and engaging for players
11. Include mechanical details where appropriate
12. Ensure results enhance rather than disrupt gameplay

Return a complete random table in JSON format following the RandomTable schema with: name, description, diceType, entries (array with rollRange and result), purpose, theme, and usage notes.`;
    
    return prompt;
  }
  
  private static getFormatGuidance(format: ResultFormat): string {
    let guidance = `\n\nRESULT FORMAT GUIDANCE (${format.toUpperCase()}):`;
    
    switch (format) {
      case 'simple_text':
        guidance += `\n- Keep results concise and immediately actionable
- Use clear, direct language
- Focus on essential information only
- Make results easy to read aloud`;
        break;
      case 'detailed_description':
        guidance += `\n- Provide rich, immersive descriptions
- Include sensory details and atmosphere
- Give DMs plenty of material to work with
- Balance detail with usability`;
        break;
      case 'stat_block':
        guidance += `\n- Include mechanical statistics and game rules
- Provide complete information for immediate use
- Ensure mechanical balance and accuracy
- Format for easy reference during play`;
        break;
      case 'narrative_scene':
        guidance += `\n- Create mini-scenes with story elements
- Include dialogue, action, and atmosphere
- Provide hooks for player engagement
- Make results feel like story moments`;
        break;
      case 'mechanical_effect':
        guidance += `\n- Focus on game mechanics and rules effects
- Provide clear mechanical consequences
- Ensure balance with existing game systems
- Make effects easy to implement`;
        break;
      case 'mixed_format':
        guidance += `\n- Combine narrative and mechanical elements
- Vary format between entries for interest
- Balance story and game mechanics
- Ensure all entries are equally useful`;
        break;
    }
    
    return guidance;
  }
  
  private static getTypeGuidance(tableType: TableType, purpose: TablePurpose): string {
    let guidance = `\n\nTABLE TYPE GUIDANCE (${tableType.toUpperCase()}):`;
    
    switch (tableType) {
      case 'encounter':
        guidance += `\n- Create varied encounter scenarios
- Include different enemy types and tactics
- Consider environmental factors
- Balance combat and non-combat encounters`;
        break;
      case 'treasure':
        guidance += `\n- Provide diverse treasure options
- Include coins, gems, art objects, and magic items
- Consider treasure value and party level
- Add interesting backstories or complications`;
        break;
      case 'random_event':
        guidance += `\n- Create unexpected but logical events
- Ensure events advance or complicate the story
- Provide opportunities for player choice
- Balance positive and negative outcomes`;
        break;
      case 'npc_generator':
        guidance += `\n- Create memorable, distinct NPCs
- Include personality traits and motivations
- Provide plot hooks and interaction opportunities
- Consider NPC roles in the world`;
        break;
      case 'location':
        guidance += `\n- Describe interesting, unique locations
- Include practical details for gameplay
- Consider how locations connect to the story
- Provide exploration opportunities`;
        break;
      case 'plot_hook':
        guidance += `\n- Create compelling story starters
- Provide clear motivation for player action
- Include stakes and consequences
- Leave room for player creativity`;
        break;
      case 'complication':
        guidance += `\n- Add interesting twists to ongoing situations
- Create challenges that require creative solutions
- Avoid purely negative outcomes
- Provide opportunities for character development`;
        break;
    }
    
    // Add purpose-specific guidance
    switch (purpose) {
      case 'improvisation_aid':
        guidance += `\n- Design for quick, on-the-spot use
- Make results immediately actionable
- Avoid requiring extensive preparation
- Provide flexible, adaptable content`;
        break;
      case 'world_building':
        guidance += `\n- Create content that expands the game world
- Include details that suggest larger stories
- Consider how results connect to campaign themes
- Provide material for future development`;
        break;
      case 'session_preparation':
        guidance += `\n- Provide detailed, ready-to-use content
- Include all necessary information for implementation
- Consider how results fit into planned sessions
- Provide expansion and development options`;
        break;
    }
    
    return guidance;
  }
  
  private static getMaxTokensForTable(entryCount: number, format: ResultFormat): number {
    let baseTokens = entryCount * 30; // Base tokens per entry
    
    // Adjust based on format
    switch (format) {
      case 'simple_text':
        baseTokens *= 0.7;
        break;
      case 'detailed_description':
        baseTokens *= 1.5;
        break;
      case 'stat_block':
        baseTokens *= 1.3;
        break;
      case 'narrative_scene':
        baseTokens *= 1.8;
        break;
      case 'mixed_format':
        baseTokens *= 1.4;
        break;
    }
    
    return Math.min(Math.max(Math.round(baseTokens), 500), 3000);
  }
  
  // ============================================================================
  // TABLE VALIDATION
  // ============================================================================
  
  private static validateAndParseTable(content: any): RandomTable {
    // Validate against schema
    const validation = RandomTableSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptTableFix(content);
      const revalidation = RandomTableSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid random table generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptTableFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.name) {
      fixed.name = 'Random Table';
    }
    
    if (!fixed.description) {
      fixed.description = 'A random table for D&D 5e gameplay.';
    }
    
    if (!fixed.diceType) {
      fixed.diceType = 'd20';
    }
    
    if (!fixed.entries || !Array.isArray(fixed.entries)) {
      fixed.entries = [];
    }
    
    // Fix entries
    fixed.entries = fixed.entries.map((entry: any, index: number) => {
      const fixedEntry = { ...entry };
      
      if (!fixedEntry.rollRange) {
        fixedEntry.rollRange = `${index + 1}`;
      }
      
      if (!fixedEntry.result) {
        fixedEntry.result = `Table entry ${index + 1}`;
      }
      
      return fixedEntry;
    });
    
    if (!fixed.purpose) {
      fixed.purpose = 'general_use';
    }
    
    if (!fixed.theme) {
      fixed.theme = 'classic_fantasy';
    }
    
    return fixed;
  }
  
  // ============================================================================
  // TABLE ANALYSIS
  // ============================================================================
  
  private static analyzeTable(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): TableAnalysis {
    const entryDistribution = this.analyzeEntryDistribution(table);
    const thematicConsistency = this.analyzeThematicConsistency(table, request);
    const mechanicalBalance = this.analyzeMechanicalBalance(table, request);
    const narrativeQuality = this.analyzeNarrativeQuality(table);
    const reusabilityScore = this.analyzeReusability(table, request);
    const complexityRating = this.analyzeComplexity(table);
    
    const overallScore = (thematicConsistency + mechanicalBalance + narrativeQuality + reusabilityScore) / 4;
    const overallQuality = this.scoreToGrade(overallScore);
    
    return {
      entryDistribution,
      thematicConsistency,
      mechanicalBalance,
      narrativeQuality,
      reusabilityScore,
      complexityRating,
      overallQuality
    };
  }
  
  private static analyzeEntryDistribution(table: RandomTable): EntryDistribution {
    const entries = table.entries || [];
    const totalEntries = entries.length;
    
    // Calculate average length
    const lengths = entries.map(entry => entry.result.length);
    const averageLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length || 0;
    
    // Calculate length variation
    const maxLen = Math.max(...lengths);
    const minLen = Math.min(...lengths);
    const lengthRange = maxLen - minLen;
    let lengthVariation: 'low' | 'moderate' | 'high';
    
    if (lengthRange < averageLength * 0.3) lengthVariation = 'low';
    else if (lengthRange < averageLength * 0.7) lengthVariation = 'moderate';
    else lengthVariation = 'high';
    
    // Analyze rarity (simplified)
    const rarityBreakdown = this.estimateRarityBreakdown(entries);
    
    // Analyze consequences (simplified)
    const consequenceSpread = this.estimateConsequenceSpread(entries);
    
    return {
      totalEntries,
      averageLength: Math.round(averageLength),
      lengthVariation,
      rarityBreakdown,
      consequenceSpread
    };
  }
  
  private static estimateRarityBreakdown(entries: any[]): RarityBreakdown {
    // Simplified rarity estimation based on entry content
    const total = entries.length;
    
    // This is a simplified estimation - in a full implementation, 
    // this would analyze actual content for rarity indicators
    return {
      common: Math.round(total * 0.4),
      uncommon: Math.round(total * 0.3),
      rare: Math.round(total * 0.2),
      veryRare: Math.round(total * 0.08),
      legendary: Math.round(total * 0.02)
    };
  }
  
  private static estimateConsequenceSpread(entries: any[]): ConsequenceSpread {
    // Simplified consequence estimation
    const total = entries.length;
    
    return {
      trivial: Math.round(total * 0.2),
      minor: Math.round(total * 0.4),
      moderate: Math.round(total * 0.25),
      major: Math.round(total * 0.12),
      severe: Math.round(total * 0.03)
    };
  }
  
  private static analyzeThematicConsistency(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): number {
    // Simplified thematic consistency analysis
    let consistency = 80; // Base score
    
    // Check if table theme matches request
    if (table.theme === request.theme) {
      consistency += 10;
    }
    
    // Check if all entries seem thematically appropriate
    // This would be more sophisticated in a full implementation
    const entries = table.entries || [];
    if (entries.length > 0) {
      consistency += 10;
    }
    
    return Math.min(100, consistency);
  }
  
  private static analyzeMechanicalBalance(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): number {
    // Simplified mechanical balance analysis
    let balance = 75; // Base score
    
    // Check entry count appropriateness
    const entries = table.entries || [];
    const expectedCount = request.entryCount;
    
    if (Math.abs(entries.length - expectedCount) <= 2) {
      balance += 15;
    } else if (Math.abs(entries.length - expectedCount) <= 5) {
      balance += 5;
    }
    
    // Check for variety in results
    if (entries.length > 5) {
      balance += 10;
    }
    
    return Math.min(100, balance);
  }
  
  private static analyzeNarrativeQuality(table: RandomTable): number {
    // Simplified narrative quality analysis
    let quality = 70; // Base score
    
    const entries = table.entries || [];
    
    // Check for descriptive content
    const hasRichContent = entries.some(entry => 
      entry.result.length > 50 && 
      (entry.result.includes('you') || entry.result.includes('the'))
    );
    
    if (hasRichContent) {
      quality += 20;
    }
    
    // Check for variety
    if (entries.length > 3) {
      quality += 10;
    }
    
    return Math.min(100, quality);
  }
  
  private static analyzeReusability(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): number {
    let reusability = 70; // Base score
    
    // Higher reusability for certain purposes
    switch (request.purpose) {
      case 'improvisation_aid':
        reusability += 20;
        break;
      case 'world_building':
        reusability += 15;
        break;
      case 'session_preparation':
        reusability += 10;
        break;
    }
    
    return Math.min(100, reusability);
  }
  
  private static analyzeComplexity(table: RandomTable): ComplexityRating {
    const entries = table.entries || [];
    const avgLength = entries.reduce((sum, entry) => sum + entry.result.length, 0) / entries.length;
    
    // Determine complexity based on average entry length and content
    let mechanicalComplexity: 'low' | 'medium' | 'high';
    let narrativeComplexity: 'low' | 'medium' | 'high';
    let dmPreparation: 'minimal' | 'moderate' | 'extensive';
    let playerImpact: 'low' | 'medium' | 'high';
    
    if (avgLength < 50) {
      mechanicalComplexity = 'low';
      narrativeComplexity = 'low';
      dmPreparation = 'minimal';
    } else if (avgLength < 150) {
      mechanicalComplexity = 'medium';
      narrativeComplexity = 'medium';
      dmPreparation = 'moderate';
    } else {
      mechanicalComplexity = 'high';
      narrativeComplexity = 'high';
      dmPreparation = 'extensive';
    }
    
    // Player impact based on table type
    playerImpact = entries.length > 10 ? 'high' : entries.length > 5 ? 'medium' : 'low';
    
    return {
      mechanicalComplexity,
      narrativeComplexity,
      dmPreparation,
      playerImpact
    };
  }
  
  private static scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  // ============================================================================
  // USABILITY REPORT GENERATION
  // ============================================================================
  
  private static generateUsabilityReport(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): UsabilityReport {
    const easeOfUse = this.calculateEaseOfUse(table, request);
    const preparationRequired = this.assessPreparationRequired(table, request);
    const sessionIntegration = this.assessSessionIntegration(table, request);
    const playerEngagement = this.assessPlayerEngagement(table, request);
    const dmWorkload = this.assessDMWorkload(table, request);
    const recommendedFrequency = this.recommendFrequency(table, request);
    
    return {
      easeOfUse,
      preparationRequired,
      sessionIntegration,
      playerEngagement,
      dmWorkload,
      recommendedFrequency
    };
  }
  
  private static calculateEaseOfUse(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): number {
    let ease = 80; // Base score
    
    // Simpler dice types are easier to use
    if (['d6', 'd10', 'd20'].includes(request.diceType)) {
      ease += 10;
    }
    
    // Fewer entries are easier to manage
    const entryCount = table.entries?.length || 0;
    if (entryCount <= 10) {
      ease += 10;
    } else if (entryCount > 20) {
      ease -= 10;
    }
    
    return Math.min(100, Math.max(0, ease));
  }
  
  private static assessPreparationRequired(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): PreparationLevel {
    const avgLength = table.entries?.reduce((sum, entry) => sum + entry.result.length, 0) / (table.entries?.length || 1) || 0;
    
    if (avgLength < 50) return 'minimal';
    if (avgLength < 100) return 'moderate';
    return 'extensive';
  }
  
  private static assessSessionIntegration(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): IntegrationLevel {
    switch (request.purpose) {
      case 'improvisation_aid':
        return 'seamless';
      case 'session_preparation':
        return 'easy';
      case 'world_building':
        return 'moderate';
      default:
        return 'easy';
    }
  }
  
  private static assessPlayerEngagement(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): EngagementLevel {
    const entryCount = table.entries?.length || 0;
    
    if (entryCount > 15 && request.narrative) return 'very_high';
    if (entryCount > 10 || request.narrative) return 'high';
    if (entryCount > 5) return 'moderate';
    return 'low';
  }
  
  private static assessDMWorkload(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): WorkloadLevel {
    const complexity = request.complexity;
    
    switch (complexity) {
      case 'simple':
        return 'light';
      case 'moderate':
        return 'moderate';
      case 'complex':
        return 'heavy';
      case 'layered':
        return 'intensive';
      default:
        return 'moderate';
    }
  }
  
  private static recommendFrequency(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): FrequencyRecommendation {
    switch (request.reusability) {
      case 'universal':
        return 'every_session';
      case 'campaign_long':
        return 'weekly';
      case 'session_based':
        return 'monthly';
      case 'one_shot':
        return 'special_occasions';
      default:
        return 'monthly';
    }
  }
  
  // ============================================================================
  // BALANCE ASSESSMENT
  // ============================================================================
  
  private static assessBalance(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): BalanceAssessment {
    const powerLevel = this.assessPowerLevel(table, request);
    const riskReward = this.assessRiskReward(table, request);
    const gameImpact = this.assessGameImpact(table, request);
    const balanceIssues = this.identifyBalanceIssues(table, request);
    const recommendations = this.generateBalanceRecommendations(balanceIssues);
    
    return {
      powerLevel,
      riskReward,
      gameImpact,
      balanceIssues,
      recommendations
    };
  }
  
  private static assessPowerLevel(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): PowerLevelAssessment {
    // Simplified power level assessment
    const averagePowerLevel = request.partyLevel ? Math.min(10, Math.max(1, request.partyLevel / 2)) : 5;
    
    return {
      averagePowerLevel,
      powerVariation: 'moderate',
      outlierCount: 0,
      scalingAppropriate: true
    };
  }
  
  private static assessRiskReward(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): RiskRewardBalance {
    // Simplified risk/reward assessment
    let riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    let rewardLevel: 'minimal' | 'fair' | 'generous' | 'excessive';
    
    switch (request.consequenceLevel) {
      case 'minor':
        riskLevel = 'low';
        rewardLevel = 'minimal';
        break;
      case 'moderate':
        riskLevel = 'moderate';
        rewardLevel = 'fair';
        break;
      case 'major':
        riskLevel = 'high';
        rewardLevel = 'generous';
        break;
      case 'campaign_changing':
        riskLevel = 'extreme';
        rewardLevel = 'generous';
        break;
      default:
        riskLevel = 'moderate';
        rewardLevel = 'fair';
    }
    
    const balanceRating = (riskLevel === 'moderate' && rewardLevel === 'fair') ? 'excellent' : 'good';
    
    return {
      riskLevel,
      rewardLevel,
      balanceRating
    };
  }
  
  private static assessGameImpact(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): GameImpactAssessment {
    let narrativeImpact: 'minimal' | 'moderate' | 'significant' | 'major';
    let mechanicalImpact: 'minimal' | 'moderate' | 'significant' | 'major';
    let campaignImpact: 'minimal' | 'moderate' | 'significant' | 'major';
    let playerAgencyImpact: 'minimal' | 'moderate' | 'significant' | 'major';
    
    // Base impact on table type and purpose
    switch (request.tableType) {
      case 'plot_hook':
        narrativeImpact = 'significant';
        mechanicalImpact = 'minimal';
        campaignImpact = 'significant';
        playerAgencyImpact = 'significant';
        break;
      case 'treasure':
        narrativeImpact = 'minimal';
        mechanicalImpact = 'significant';
        campaignImpact = 'moderate';
        playerAgencyImpact = 'moderate';
        break;
      case 'encounter':
        narrativeImpact = 'moderate';
        mechanicalImpact = 'significant';
        campaignImpact = 'moderate';
        playerAgencyImpact = 'significant';
        break;
      default:
        narrativeImpact = 'moderate';
        mechanicalImpact = 'moderate';
        campaignImpact = 'moderate';
        playerAgencyImpact = 'moderate';
    }
    
    return {
      narrativeImpact,
      mechanicalImpact,
      campaignImpact,
      playerAgencyImpact
    };
  }
  
  private static identifyBalanceIssues(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): BalanceIssue[] {
    const issues: BalanceIssue[] = [];
    
    // Check for entry count mismatch
    const entries = table.entries || [];
    const expectedCount = request.entryCount;
    
    if (Math.abs(entries.length - expectedCount) > 3) {
      issues.push({
        issue: `Entry count mismatch: expected ${expectedCount}, got ${entries.length}`,
        severity: 'medium',
        affectedEntries: [],
        recommendation: 'Adjust entry count to match dice type requirements'
      });
    }
    
    // Check for extremely long entries
    const longEntries = entries.filter(entry => entry.result.length > 200);
    if (longEntries.length > entries.length * 0.3) {
      issues.push({
        issue: 'Too many overly detailed entries may slow gameplay',
        severity: 'low',
        affectedEntries: [],
        recommendation: 'Consider condensing some entries for better usability'
      });
    }
    
    return issues;
  }
  
  private static generateBalanceRecommendations(issues: BalanceIssue[]): string[] {
    return issues.map(issue => issue.recommendation);
  }
  
  // ============================================================================
  // EXPANSION SUGGESTIONS
  // ============================================================================
  
  private static generateExpansionSuggestions(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): ExpansionSuggestion[] {
    const suggestions: ExpansionSuggestion[] = [];
    
    // Suggest subtables for complex entries
    if (request.complexity !== 'simple') {
      suggestions.push({
        suggestionType: 'subtable',
        description: 'Create subtables for complex results',
        implementation: 'Break down detailed entries into separate rollable subtables',
        benefit: 'Provides more variation and easier management of complex results'
      });
    }
    
    // Suggest additional entries for small tables
    const entryCount = table.entries?.length || 0;
    if (entryCount < 10) {
      suggestions.push({
        suggestionType: 'additional_entries',
        description: 'Expand table with more entries',
        implementation: 'Add 5-10 more entries to increase variety',
        benefit: 'Reduces repetition and increases long-term usability'
      });
    }
    
    // Suggest cross-references
    if (!request.crossReference) {
      suggestions.push({
        suggestionType: 'cross_reference',
        description: 'Add cross-references to other tables',
        implementation: 'Link some results to other random tables for expanded outcomes',
        benefit: 'Creates more complex and interconnected results'
      });
    }
    
    // Suggest variant tables
    suggestions.push({
      suggestionType: 'variant_table',
      description: 'Create themed variants',
      implementation: 'Develop versions for different settings or difficulty levels',
      benefit: 'Increases versatility and reusability across different scenarios'
    });
    
    return suggestions.slice(0, 4); // Limit to top suggestions
  }
  
  // ============================================================================
  // USAGE GUIDANCE
  // ============================================================================
  
  private static createUsageGuidance(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): UsageGuidance {
    const whenToUse = this.generateWhenToUse(request);
    const howToUse = this.generateHowToUse(request);
    const dmTips = this.generateDMTips(request);
    const commonMistakes = this.generateCommonMistakes(request);
    const troubleshooting = this.generateTroubleshooting(request);
    
    return {
      whenToUse,
      howToUse,
      dmTips,
      commonMistakes,
      troubleshooting
    };
  }
  
  private static generateWhenToUse(request: RandomTableGenerationRequest): string[] {
    const situations: string[] = [];
    
    switch (request.purpose) {
      case 'improvisation_aid':
        situations.push('When players go off-script or explore unexpected areas');
        situations.push('During spontaneous encounters or social situations');
        situations.push('When you need quick inspiration for story elements');
        break;
      case 'session_preparation':
        situations.push('While planning upcoming sessions');
        situations.push('When creating location-specific content');
        situations.push('For pre-generating potential scenarios');
        break;
      case 'world_building':
        situations.push('During campaign development');
        situations.push('When fleshing out regions or cultures');
        situations.push('For creating consistent world elements');
        break;
    }
    
    return situations.slice(0, 4);
  }
  
  private static generateHowToUse(request: RandomTableGenerationRequest): string[] {
    const instructions: string[] = [];
    
    instructions.push(`Roll ${request.diceType} and consult the corresponding entry`);
    instructions.push('Read the result and adapt it to your current situation');
    instructions.push('Use the result as inspiration rather than absolute truth');
    
    if (request.expandableEntries) {
      instructions.push('Feel free to expand on results with additional details');
    }
    
    return instructions;
  }
  
  private static generateDMTips(request: RandomTableGenerationRequest): string[] {
    const tips: string[] = [];
    
    tips.push('Modify results to fit your campaign tone and style');
    tips.push('Use results as starting points for larger story developments');
    tips.push('Keep notes on which results you\'ve used to avoid repetition');
    
    if (request.narrative) {
      tips.push('Read results with appropriate dramatic emphasis');
    }
    
    return tips.slice(0, 4);
  }
  
  private static generateCommonMistakes(request: RandomTableGenerationRequest): string[] {
    const mistakes: string[] = [];
    
    mistakes.push('Using results that don\'t fit the current situation');
    mistakes.push('Forcing results when they would disrupt the story flow');
    mistakes.push('Over-relying on tables instead of using creative judgment');
    mistakes.push('Not adapting results to match campaign themes');
    
    return mistakes;
  }
  
  private static generateTroubleshooting(request: RandomTableGenerationRequest): string[] {
    const solutions: string[] = [];
    
    solutions.push('If a result doesn\'t fit, roll again or adapt it creatively');
    solutions.push('Combine multiple results for more complex outcomes');
    solutions.push('Use results as inspiration for similar but more appropriate outcomes');
    
    return solutions;
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(
    table: RandomTable, 
    request: RandomTableGenerationRequest
  ): TableVariant[] {
    const variants: TableVariant[] = [];
    
    // Difficulty variants
    if (request.difficulty && request.difficulty !== 'moderate') {
      variants.push({
        name: 'Easier Version',
        description: 'Reduced consequences and complexity',
        modifications: [
          'Lower stakes and consequences',
          'More positive outcomes',
          'Simplified mechanics'
        ],
        useCase: 'New players or low-stakes scenarios',
        difficultyChange: -1
      });
      
      variants.push({
        name: 'Harder Version',
        description: 'Increased consequences and complexity',
        modifications: [
          'Higher stakes and consequences',
          'More challenging outcomes',
          'Additional complications'
        ],
        useCase: 'Experienced players or high-stakes scenarios',
        difficultyChange: 1
      });
    }
    
    // Setting variants
    variants.push({
      name: 'Urban Version',
      description: 'Adapted for city environments',
      modifications: [
        'Replace wilderness elements with urban equivalents',
        'Add social and political complications',
        'Include city-specific NPCs and locations'
      ],
      useCase: 'City-based campaigns'
    });
    
    variants.push({
      name: 'Wilderness Version',
      description: 'Adapted for outdoor environments',
      modifications: [
        'Replace urban elements with natural equivalents',
        'Add weather and environmental factors',
        'Include survival and exploration elements'
      ],
      useCase: 'Exploration and wilderness campaigns'
    });
    
    return variants.slice(0, 3);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RandomTableGenerator;
