// Mythwright Background/Feat Generator - Specialized D&D 5e SRD-Safe Character Options Creation
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { CharacterBackground, Feat, SystemDesignBudget } from '../../../types/content.types.js';
import { CharacterBackgroundSchema, FeatSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// BACKGROUND/FEAT GENERATION TYPES
// ============================================================================

export interface BackgroundFeatGenerationRequest {
  // Basic Requirements
  contentType: 'background' | 'feat';
  name?: string;
  
  // Background-Specific
  backgroundType?: BackgroundType;
  socialClass?: SocialClass;
  profession?: ProfessionType;
  environment?: EnvironmentType;
  
  // Feat-Specific
  featCategory?: FeatCategory;
  prerequisite?: PrerequisiteType;
  powerLevel?: PowerLevel;
  
  // Common Parameters
  theme: ThemeType;
  culturalContext?: CulturalContext;
  complexity: ComplexityLevel;
  balanceTarget: BalanceTarget;
  
  // Mechanical Requirements
  skillFocus?: SkillType[];
  abilityScoreIncrease?: boolean;
  languageOptions?: boolean;
  toolProficiencies?: boolean;
  
  // Content Constraints
  srdCompliance: boolean; // Always true for safety
  avoidProductIdentity?: string[];
  mustIncludeElements?: string[];
  
  // Customization
  flavorText?: boolean;
  mechanicalBenefit?: boolean;
  roleplayHooks?: boolean;
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type BackgroundType = 
  | 'common_folk' | 'artisan' | 'merchant' | 'scholar' | 'entertainer' | 'criminal'
  | 'soldier' | 'noble' | 'hermit' | 'wanderer' | 'religious' | 'guild_member'
  | 'outlander' | 'sailor' | 'urban_dweller' | 'rural_dweller' | 'refugee';

export type SocialClass = 
  | 'peasant' | 'commoner' | 'artisan' | 'merchant' | 'minor_noble' | 'noble'
  | 'clergy' | 'military' | 'outcast' | 'foreign' | 'tribal';

export type ProfessionType = 
  | 'farmer' | 'blacksmith' | 'carpenter' | 'weaver' | 'baker' | 'innkeeper'
  | 'merchant' | 'scribe' | 'soldier' | 'guard' | 'sailor' | 'hunter'
  | 'priest' | 'scholar' | 'entertainer' | 'thief' | 'guide' | 'healer';

export type EnvironmentType = 
  | 'urban' | 'rural' | 'wilderness' | 'coastal' | 'mountain' | 'forest'
  | 'desert' | 'arctic' | 'swamp' | 'underground' | 'planar' | 'nomadic';

export type FeatCategory = 
  | 'combat' | 'skill' | 'magic' | 'social' | 'exploration' | 'crafting'
  | 'racial' | 'class' | 'general' | 'background' | 'environmental';

export type PrerequisiteType = 
  | 'none' | 'ability_score' | 'skill_proficiency' | 'class_feature'
  | 'background' | 'race' | 'level' | 'spell_knowledge';

export type PowerLevel = 
  | 'minor' | 'moderate' | 'significant' | 'major';

export type ThemeType = 
  | 'classic_fantasy' | 'gritty_realism' | 'high_magic' | 'low_magic'
  | 'exploration' | 'intrigue' | 'horror' | 'heroic' | 'survival';

export type CulturalContext = 
  | 'generic_fantasy' | 'medieval_european' | 'ancient_greco_roman' | 'norse_viking'
  | 'celtic_gaelic' | 'middle_eastern' | 'far_eastern' | 'tribal_nomadic'
  | 'renaissance_trade' | 'frontier_settlement' | 'cosmopolitan_city';

export type ComplexityLevel = 
  | 'simple' | 'moderate' | 'complex' | 'advanced';

export type BalanceTarget = 
  | 'conservative' | 'standard' | 'generous' | 'experimental';

export type SkillType = 
  | 'Acrobatics' | 'Animal Handling' | 'Arcana' | 'Athletics' | 'Deception'
  | 'History' | 'Insight' | 'Intimidation' | 'Investigation' | 'Medicine'
  | 'Nature' | 'Perception' | 'Performance' | 'Persuasion' | 'Religion'
  | 'Sleight of Hand' | 'Stealth' | 'Survival';

export interface BackgroundFeatGenerationResult {
  content: CharacterBackground | Feat;
  balanceAnalysis: BalanceAnalysis;
  srdCompliance: SRDComplianceReport;
  usabilityAssessment: UsabilityAssessment;
  integrationGuidance: IntegrationGuidance;
  variants: ContentVariant[];
}

export interface BalanceAnalysis {
  powerLevel: number; // 1-10 scale
  mechanicalBalance: number; // 0-100
  versatility: number; // 0-100
  uniqueness: number; // 0-100
  balanceIssues: BalanceIssue[];
  recommendations: string[];
  overallRating: 'underpowered' | 'balanced' | 'overpowered';
}

export interface BalanceIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'mechanical' | 'thematic' | 'balance' | 'complexity';
  recommendation: string;
}

export interface SRDComplianceReport {
  compliant: boolean;
  potentialIssues: string[];
  safeguards: string[];
  legalRecommendations: string[];
  productIdentityRisks: PIRisk[];
}

export interface PIRisk {
  term: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  replacement?: string;
}

export interface UsabilityAssessment {
  easeOfUse: number; // 0-100
  dmFriendliness: number; // 0-100
  playerAppeal: number; // 0-100
  integrationDifficulty: 'easy' | 'moderate' | 'challenging' | 'complex';
  commonUseCase: string[];
  potentialProblems: string[];
}

export interface IntegrationGuidance {
  campaignFit: CampaignFit[];
  dmTips: string[];
  playerGuidance: string[];
  balancingTips: string[];
  customizationOptions: string[];
}

export interface CampaignFit {
  campaignType: string;
  fitRating: 'poor' | 'fair' | 'good' | 'excellent';
  notes: string;
  modifications?: string[];
}

export interface ContentVariant {
  name: string;
  description: string;
  modifications: string[];
  balanceChange: number; // -3 to +3
  useCase: string;
}

// ============================================================================
// SRD COMPLIANCE CONSTANTS
// ============================================================================

// Product Identity terms to avoid (from various D&D sources)
const PRODUCT_IDENTITY_TERMS = [
  // Creatures
  'beholder', 'mind flayer', 'illithid', 'umber hulk', 'owlbear', 'bulezau',
  'githyanki', 'githzerai', 'kuo-toa', 'slaad', 'yuan-ti', 'baatezu', 'tanar\'ri',
  
  // Deities
  'mystra', 'tyr', 'bane', 'bhaal', 'cyric', 'kelemvor', 'lathander',
  'shar', 'selune', 'tempus', 'torm', 'helm', 'ilmater',
  
  // Places
  'faerun', 'waterdeep', 'neverwinter', 'baldur\'s gate', 'candlekeep',
  'undermountain', 'menzoberranzan', 'sigil', 'planescape',
  
  // Organizations
  'harpers', 'zhentarim', 'red wizards', 'flaming fist', 'order of the gauntlet',
  
  // Spells (some examples)
  'bigby\'s', 'mordenkainen\'s', 'tenser\'s', 'otiluke\'s', 'melf\'s',
  
  // Items
  'bag of holding', 'portable hole', 'sphere of annihilation'
];

// SRD-safe skill list
const SRD_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'Sleight of Hand', 'Stealth', 'Survival'
];

// SRD-safe tool categories
const SRD_TOOL_CATEGORIES = [
  'artisan\'s tools', 'gaming set', 'musical instrument', 'thieves\' tools',
  'herbalism kit', 'navigator\'s tools', 'poisoner\'s kit'
];

// SRD-safe languages
const SRD_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
  'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan'
];

// ============================================================================
// BACKGROUND/FEAT GENERATOR CLASS
// ============================================================================

export class BackgroundFeatGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateBackgroundOrFeat(
    request: BackgroundFeatGenerationRequest,
    aiService: any // AIService type
  ): Promise<BackgroundFeatGenerationResult> {
    
    // Step 1: Validate SRD compliance requirements
    this.validateSRDCompliance(request);
    
    // Step 2: Build the AI prompt
    const aiPrompt = this.buildContentPrompt(request);
    
    // Step 3: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: request.contentType,
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          contentType: request.contentType,
          theme: request.theme,
          complexity: request.complexity,
          balanceTarget: request.balanceTarget,
          srdCompliance: request.srdCompliance
        }
      },
      options: {
        temperature: 0.6, // Moderate creativity for balanced content
        maxTokens: this.getMaxTokensForContent(request.contentType, request.complexity)
      }
    };
    
    // Step 4: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`${request.contentType} generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 5: Validate and parse the content
    const content = this.validateAndParseContent(aiResponse.content, request.contentType);
    
    // Step 6: Analyze balance
    const balanceAnalysis = this.analyzeBalance(content, request);
    
    // Step 7: Check SRD compliance
    const srdCompliance = this.checkSRDCompliance(content);
    
    // Step 8: Assess usability
    const usabilityAssessment = this.assessUsability(content, request);
    
    // Step 9: Generate integration guidance
    const integrationGuidance = this.generateIntegrationGuidance(content, request);
    
    // Step 10: Create variants
    const variants = this.generateVariants(content, request);
    
    return {
      content,
      balanceAnalysis,
      srdCompliance,
      usabilityAssessment,
      integrationGuidance,
      variants
    };
  }
  
  // ============================================================================
  // SRD COMPLIANCE VALIDATION
  // ============================================================================
  
  private static validateSRDCompliance(request: BackgroundFeatGenerationRequest): void {
    if (!request.srdCompliance) {
      throw new Error('SRD compliance is required for all generated content');
    }
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildContentPrompt(request: BackgroundFeatGenerationRequest): string {
    let prompt = `Create a D&D 5e ${request.contentType} that is completely SRD-compliant and legally safe:

CORE REQUIREMENTS:
- Content Type: ${request.contentType}
- Theme: ${request.theme}
- Complexity: ${request.complexity}
- Balance Target: ${request.balanceTarget}
- SRD COMPLIANCE: MANDATORY - Use only Open Game License content`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    // Add type-specific requirements
    if (request.contentType === 'background') {
      prompt += this.buildBackgroundPrompt(request);
    } else if (request.contentType === 'feat') {
      prompt += this.buildFeatPrompt(request);
    }
    
    // Add common requirements
    prompt += `\n\nMECHANICAL REQUIREMENTS:`;
    
    if (request.skillFocus && request.skillFocus.length > 0) {
      prompt += `\n- Skill Focus: ${request.skillFocus.join(', ')}`;
    }
    
    if (request.abilityScoreIncrease) {
      prompt += `\n- Include ability score increase options`;
    }
    
    if (request.languageOptions) {
      prompt += `\n- Include language learning options`;
      prompt += `\n- SRD Languages: ${SRD_LANGUAGES.slice(0, 10).join(', ')}`;
    }
    
    if (request.toolProficiencies) {
      prompt += `\n- Include tool proficiency options`;
      prompt += `\n- SRD Tool Categories: ${SRD_TOOL_CATEGORIES.join(', ')}`;
    }
    
    // Add cultural context
    if (request.culturalContext) {
      prompt += `\n\nCULTURAL CONTEXT: ${request.culturalContext}`;
      prompt += this.getCulturalGuidance(request.culturalContext);
    }
    
    // Add content requirements
    if (request.flavorText || request.mechanicalBenefit || request.roleplayHooks) {
      prompt += `\n\nCONTENT ELEMENTS:`;
      if (request.flavorText) prompt += `\n- Rich flavor text and background lore`;
      if (request.mechanicalBenefit) prompt += `\n- Clear mechanical benefits and rules`;
      if (request.roleplayHooks) prompt += `\n- Roleplay hooks and character development options`;
    }
    
    // Add must-include elements
    if (request.mustIncludeElements && request.mustIncludeElements.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustIncludeElements.forEach(element => {
        prompt += `\n- ${element}`;
      });
    }
    
    // Add SRD compliance warnings
    prompt += `\n\nSRD COMPLIANCE REQUIREMENTS:`;
    prompt += `\n- Use ONLY Open Game License content`;
    prompt += `\n- NEVER use Product Identity terms`;
    prompt += `\n- Avoid specific D&D setting names, deities, or unique creatures`;
    prompt += `\n- Use generic fantasy terms and concepts`;
    prompt += `\n- Reference only SRD spells, equipment, and rules`;
    
    if (request.avoidProductIdentity && request.avoidProductIdentity.length > 0) {
      prompt += `\n\nAVOID THESE TERMS:`;
      request.avoidProductIdentity.forEach(term => {
        prompt += `\n- ${term}`;
      });
    }
    
    // Add balance guidance
    prompt += this.getBalanceGuidance(request.balanceTarget);
    
    prompt += `\n\nCRITICAL SRD COMPLIANCE RULES:
1. Use ONLY content from the System Reference Document (SRD)
2. NEVER reference specific D&D campaign settings or locations
3. NEVER use Product Identity creature names or unique terms
4. Use generic fantasy language and concepts only
5. All mechanical elements must be SRD-compatible
6. Avoid trademarked spell names or unique magical items
7. Use only SRD-listed skills, tools, and languages
8. Ensure all content can be legally published under OGL
9. Create original names that don't reference copyrighted material
10. Focus on universal fantasy themes and mechanics

Return a complete ${request.contentType} in JSON format following the ${request.contentType === 'background' ? 'CharacterBackground' : 'Feat'} schema with all required fields, mechanical benefits, and SRD-compliant content.`;
    
    return prompt;
  }
  
  private static buildBackgroundPrompt(request: BackgroundFeatGenerationRequest): string {
    let prompt = `\n\nBACKGROUND SPECIFIC:`;
    
    if (request.backgroundType) {
      prompt += `\n- Background Type: ${request.backgroundType}`;
    }
    
    if (request.socialClass) {
      prompt += `\n- Social Class: ${request.socialClass}`;
    }
    
    if (request.profession) {
      prompt += `\n- Profession: ${request.profession}`;
    }
    
    if (request.environment) {
      prompt += `\n- Environment: ${request.environment}`;
    }
    
    prompt += `\n\nBACKGROUND STRUCTURE REQUIREMENTS:`;
    prompt += `\n- Provide 2 skill proficiencies from SRD skill list`;
    prompt += `\n- Include tool proficiencies or language options`;
    prompt += `\n- Provide starting equipment appropriate to the background`;
    prompt += `\n- Include a background feature with clear mechanical benefit`;
    prompt += `\n- Provide personality trait, ideal, bond, and flaw tables`;
    prompt += `\n- Ensure all elements reflect the background's theme and purpose`;
    
    return prompt;
  }
  
  private static buildFeatPrompt(request: BackgroundFeatGenerationRequest): string {
    let prompt = `\n\nFEAT SPECIFIC:`;
    
    if (request.featCategory) {
      prompt += `\n- Feat Category: ${request.featCategory}`;
    }
    
    if (request.prerequisite) {
      prompt += `\n- Prerequisite Type: ${request.prerequisite}`;
    }
    
    if (request.powerLevel) {
      prompt += `\n- Power Level: ${request.powerLevel}`;
    }
    
    prompt += `\n\nFEAT STRUCTURE REQUIREMENTS:`;
    prompt += `\n- Provide clear, balanced mechanical benefits`;
    prompt += `\n- Include prerequisites if appropriate for balance`;
    prompt += `\n- Ensure feat fills a specific mechanical or thematic niche`;
    prompt += `\n- Balance power level with existing SRD feats`;
    prompt += `\n- Provide interesting choices or customization options`;
    prompt += `\n- Avoid overlapping with existing class features`;
    
    return prompt;
  }
  
  private static getCulturalGuidance(context: CulturalContext): string {
    let guidance = `\n\nCultural Guidance:`;
    
    switch (context) {
      case 'medieval_european':
        guidance += `\n- Use medieval European-inspired themes and professions
- Focus on feudal society, guilds, and traditional crafts
- Include appropriate social hierarchies and customs`;
        break;
      case 'ancient_greco_roman':
        guidance += `\n- Draw from classical antiquity themes
- Include philosophy, rhetoric, and civic duties
- Reference appropriate classical professions and social structures`;
        break;
      case 'norse_viking':
        guidance += `\n- Use Norse-inspired themes of exploration and honor
- Include sea-faring, raiding, and clan-based society elements
- Reference appropriate warrior culture and storytelling traditions`;
        break;
      case 'celtic_gaelic':
        guidance += `\n- Draw from Celtic traditions and clan structures
- Include druidic wisdom, storytelling, and nature connection
- Reference appropriate tribal customs and seasonal celebrations`;
        break;
      case 'tribal_nomadic':
        guidance += `\n- Focus on nomadic lifestyle and tribal customs
- Include survival skills, animal handling, and oral traditions
- Reference appropriate seasonal migrations and resource management`;
        break;
      case 'frontier_settlement':
        guidance += `\n- Emphasize pioneer spirit and self-reliance
- Include wilderness survival and community building
- Reference appropriate frontier professions and challenges`;
        break;
    }
    
    return guidance;
  }
  
  private static getBalanceGuidance(target: BalanceTarget): string {
    let guidance = `\n\nBALANCE GUIDANCE (${target.toUpperCase()}):`;
    
    switch (target) {
      case 'conservative':
        guidance += `\n- Err on the side of slightly underpowered
- Focus on utility and flavor over raw power
- Ensure no mechanical element is stronger than SRD equivalents
- Prioritize thematic consistency over mechanical optimization`;
        break;
      case 'standard':
        guidance += `\n- Match power level of existing SRD content
- Balance mechanical benefits with appropriate costs or limitations
- Ensure feat/background fills a distinct niche
- Provide meaningful choices without being overpowered`;
        break;
      case 'generous':
        guidance += `\n- Allow slightly more powerful options while maintaining balance
- Provide multiple mechanical benefits that work together
- Ensure content is attractive and competitive with existing options
- Focus on enabling new character concepts and playstyles`;
        break;
      case 'experimental':
        guidance += `\n- Explore new mechanical concepts while maintaining overall balance
- Allow for innovative combinations of existing mechanics
- Ensure experimental elements have clear limitations
- Test boundaries while respecting fundamental game balance`;
        break;
    }
    
    return guidance;
  }
  
  private static getMaxTokensForContent(contentType: 'background' | 'feat', complexity: ComplexityLevel): number {
    let baseTokens = contentType === 'background' ? 800 : 400;
    
    switch (complexity) {
      case 'simple':
        baseTokens *= 0.8;
        break;
      case 'moderate':
        baseTokens *= 1.0;
        break;
      case 'complex':
        baseTokens *= 1.3;
        break;
      case 'advanced':
        baseTokens *= 1.6;
        break;
    }
    
    return Math.round(baseTokens);
  }
  
  // ============================================================================
  // CONTENT VALIDATION
  // ============================================================================
  
  private static validateAndParseContent(content: any, contentType: 'background' | 'feat'): CharacterBackground | Feat {
    const schema = contentType === 'background' ? CharacterBackgroundSchema : FeatSchema;
    const validation = schema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptContentFix(content, contentType);
      const revalidation = schema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid ${contentType} generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptContentFix(content: any, contentType: 'background' | 'feat'): any {
    const fixed = { ...content };
    
    // Common fixes
    if (!fixed.name) {
      fixed.name = contentType === 'background' ? 'Custom Background' : 'Custom Feat';
    }
    
    if (!fixed.description) {
      fixed.description = `A ${contentType} for D&D 5e characters.`;
    }
    
    // Background-specific fixes
    if (contentType === 'background') {
      if (!fixed.skillProficiencies || !Array.isArray(fixed.skillProficiencies)) {
        fixed.skillProficiencies = ['Insight', 'Persuasion'];
      }
      
      if (!fixed.feature) {
        fixed.feature = {
          name: 'Background Feature',
          description: 'This background provides a unique benefit.'
        };
      }
      
      if (!fixed.personalityTraits) {
        fixed.personalityTraits = ['I have a unique perspective on life.'];
      }
      
      if (!fixed.ideals) {
        fixed.ideals = ['I believe in doing what\'s right.'];
      }
      
      if (!fixed.bonds) {
        fixed.bonds = ['I have important connections from my past.'];
      }
      
      if (!fixed.flaws) {
        fixed.flaws = ['I sometimes let my past influence my decisions.'];
      }
    }
    
    // Feat-specific fixes
    if (contentType === 'feat') {
      if (!fixed.benefits || !Array.isArray(fixed.benefits)) {
        fixed.benefits = ['Provides a mechanical benefit to the character.'];
      }
    }
    
    return fixed;
  }
  
  // ============================================================================
  // BALANCE ANALYSIS
  // ============================================================================
  
  private static analyzeBalance(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): BalanceAnalysis {
    const powerLevel = this.calculatePowerLevel(content, request.contentType);
    const mechanicalBalance = this.assessMechanicalBalance(content, request.contentType);
    const versatility = this.assessVersatility(content, request.contentType);
    const uniqueness = this.assessUniqueness(content, request.contentType);
    const balanceIssues = this.identifyBalanceIssues(content, request);
    const recommendations = this.generateBalanceRecommendations(balanceIssues);
    const overallRating = this.determineOverallRating(powerLevel, mechanicalBalance);
    
    return {
      powerLevel,
      mechanicalBalance,
      versatility,
      uniqueness,
      balanceIssues,
      recommendations,
      overallRating
    };
  }
  
  private static calculatePowerLevel(content: CharacterBackground | Feat, contentType: 'background' | 'feat'): number {
    let powerLevel = 5; // Base power level
    
    if (contentType === 'background') {
      const background = content as CharacterBackground;
      
      // Skill proficiencies add power
      if (background.skillProficiencies && background.skillProficiencies.length > 2) {
        powerLevel += 1;
      }
      
      // Tool proficiencies add minor power
      if (background.toolProficiencies && background.toolProficiencies.length > 0) {
        powerLevel += 0.5;
      }
      
      // Languages add minor power
      if (background.languages && background.languages.length > 0) {
        powerLevel += 0.5;
      }
      
      // Feature adds significant power
      if (background.feature) {
        powerLevel += 2;
      }
    } else {
      const feat = content as Feat;
      
      // Benefits add power based on count and type
      if (feat.benefits && feat.benefits.length > 0) {
        powerLevel += feat.benefits.length * 1.5;
      }
      
      // Prerequisites indicate higher power level
      if (feat.prerequisite && feat.prerequisite !== 'None') {
        powerLevel += 1;
      }
    }
    
    return Math.min(10, Math.max(1, Math.round(powerLevel)));
  }
  
  private static assessMechanicalBalance(content: CharacterBackground | Feat, contentType: 'background' | 'feat'): number {
    let balance = 75; // Base balance score
    
    if (contentType === 'background') {
      const background = content as CharacterBackground;
      
      // Check for appropriate number of skill proficiencies
      const skillCount = background.skillProficiencies?.length || 0;
      if (skillCount === 2) balance += 15;
      else if (skillCount < 2) balance -= 10;
      else if (skillCount > 3) balance -= 20;
      
      // Check for feature presence
      if (background.feature) {
        balance += 10;
      }
    } else {
      const feat = content as Feat;
      
      // Check for appropriate benefit count
      const benefitCount = feat.benefits?.length || 0;
      if (benefitCount >= 1 && benefitCount <= 3) balance += 15;
      else if (benefitCount > 3) balance -= 15;
      
      // Prerequisites help balance powerful feats
      if (feat.prerequisite && feat.prerequisite !== 'None' && benefitCount > 2) {
        balance += 10;
      }
    }
    
    return Math.min(100, Math.max(0, balance));
  }
  
  private static assessVersatility(content: CharacterBackground | Feat, contentType: 'background' | 'feat'): number {
    let versatility = 60; // Base versatility
    
    if (contentType === 'background') {
      const background = content as CharacterBackground;
      
      // Multiple skill types increase versatility
      const skillCount = background.skillProficiencies?.length || 0;
      versatility += skillCount * 10;
      
      // Tool proficiencies add versatility
      if (background.toolProficiencies && background.toolProficiencies.length > 0) {
        versatility += 15;
      }
      
      // Languages add versatility
      if (background.languages && background.languages.length > 0) {
        versatility += 10;
      }
    } else {
      const feat = content as Feat;
      
      // Multiple benefits increase versatility
      const benefitCount = feat.benefits?.length || 0;
      versatility += benefitCount * 15;
    }
    
    return Math.min(100, Math.max(0, versatility));
  }
  
  private static assessUniqueness(content: CharacterBackground | Feat, contentType: 'background' | 'feat'): number {
    // Simplified uniqueness assessment
    // In a full implementation, this would compare against existing SRD content
    
    let uniqueness = 70; // Base uniqueness
    
    // Unique names and descriptions increase uniqueness
    if (content.name && content.name.length > 10) {
      uniqueness += 10;
    }
    
    if (content.description && content.description.length > 50) {
      uniqueness += 15;
    }
    
    return Math.min(100, Math.max(0, uniqueness));
  }
  
  private static identifyBalanceIssues(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): BalanceIssue[] {
    const issues: BalanceIssue[] = [];
    
    if (request.contentType === 'background') {
      const background = content as CharacterBackground;
      
      // Check skill proficiency count
      const skillCount = background.skillProficiencies?.length || 0;
      if (skillCount > 3) {
        issues.push({
          issue: 'Too many skill proficiencies may be overpowered',
          severity: 'medium',
          category: 'balance',
          recommendation: 'Limit to 2-3 skill proficiencies for balance'
        });
      }
      
      // Check for missing feature
      if (!background.feature) {
        issues.push({
          issue: 'Background lacks a defining feature',
          severity: 'high',
          category: 'mechanical',
          recommendation: 'Add a unique background feature'
        });
      }
    } else {
      const feat = content as Feat;
      
      // Check benefit count
      const benefitCount = feat.benefits?.length || 0;
      if (benefitCount > 4) {
        issues.push({
          issue: 'Too many benefits may make feat overpowered',
          severity: 'high',
          category: 'balance',
          recommendation: 'Limit to 2-3 related benefits'
        });
      }
      
      // Check for prerequisites on powerful feats
      if (benefitCount > 2 && (!feat.prerequisite || feat.prerequisite === 'None')) {
        issues.push({
          issue: 'Powerful feat lacks appropriate prerequisites',
          severity: 'medium',
          category: 'balance',
          recommendation: 'Add prerequisites to balance powerful effects'
        });
      }
    }
    
    return issues;
  }
  
  private static generateBalanceRecommendations(issues: BalanceIssue[]): string[] {
    return issues.map(issue => issue.recommendation);
  }
  
  private static determineOverallRating(powerLevel: number, mechanicalBalance: number): 'underpowered' | 'balanced' | 'overpowered' {
    if (powerLevel < 4 || mechanicalBalance < 60) return 'underpowered';
    if (powerLevel > 7 || mechanicalBalance < 70) return 'overpowered';
    return 'balanced';
  }
  
  // ============================================================================
  // SRD COMPLIANCE CHECKING
  // ============================================================================
  
  private static checkSRDCompliance(content: CharacterBackground | Feat): SRDComplianceReport {
    const contentText = JSON.stringify(content).toLowerCase();
    const potentialIssues: string[] = [];
    const productIdentityRisks: PIRisk[] = [];
    
    // Check for Product Identity terms
    PRODUCT_IDENTITY_TERMS.forEach(term => {
      if (contentText.includes(term.toLowerCase())) {
        productIdentityRisks.push({
          term,
          riskLevel: 'critical',
          suggestion: `Remove reference to '${term}' as it is Product Identity`,
          replacement: 'Use generic fantasy equivalent'
        });
      }
    });
    
    // Check for common problematic patterns
    const problematicPatterns = [
      { pattern: /forgotten realms?/i, issue: 'References specific D&D setting' },
      { pattern: /waterdeep|neverwinter|baldur/i, issue: 'References specific D&D locations' },
      { pattern: /tiamat|bahamut/i, issue: 'References specific D&D deities' }
    ];
    
    problematicPatterns.forEach(({ pattern, issue }) => {
      if (pattern.test(contentText)) {
        potentialIssues.push(issue);
      }
    });
    
    const compliant = productIdentityRisks.length === 0 && potentialIssues.length === 0;
    
    const safeguards = [
      'Content uses only SRD-approved terms',
      'No specific campaign setting references',
      'Generic fantasy language throughout',
      'All mechanical elements are SRD-compatible'
    ];
    
    const legalRecommendations = [
      'Review content against SRD document before publication',
      'Ensure all names and terms are original or generic',
      'Include proper OGL attribution if publishing',
      'Consider legal review for commercial use'
    ];
    
    return {
      compliant,
      potentialIssues,
      safeguards,
      legalRecommendations,
      productIdentityRisks
    };
  }
  
  // ============================================================================
  // USABILITY ASSESSMENT
  // ============================================================================
  
  private static assessUsability(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): UsabilityAssessment {
    const easeOfUse = this.calculateEaseOfUse(content, request);
    const dmFriendliness = this.calculateDMFriendliness(content, request);
    const playerAppeal = this.calculatePlayerAppeal(content, request);
    const integrationDifficulty = this.assessIntegrationDifficulty(content, request);
    const commonUseCase = this.identifyCommonUseCases(content, request);
    const potentialProblems = this.identifyPotentialProblems(content, request);
    
    return {
      easeOfUse,
      dmFriendliness,
      playerAppeal,
      integrationDifficulty,
      commonUseCase,
      potentialProblems
    };
  }
  
  private static calculateEaseOfUse(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): number {
    let ease = 75; // Base ease of use
    
    // Simple complexity increases ease of use
    switch (request.complexity) {
      case 'simple':
        ease += 15;
        break;
      case 'moderate':
        ease += 5;
        break;
      case 'complex':
        ease -= 5;
        break;
      case 'advanced':
        ease -= 15;
        break;
    }
    
    // Clear description increases ease of use
    if (content.description && content.description.length > 50) {
      ease += 10;
    }
    
    return Math.min(100, Math.max(0, ease));
  }
  
  private static calculateDMFriendliness(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): number {
    let friendliness = 70; // Base DM friendliness
    
    // Conservative balance is more DM-friendly
    if (request.balanceTarget === 'conservative') {
      friendliness += 15;
    } else if (request.balanceTarget === 'experimental') {
      friendliness -= 10;
    }
    
    // Clear mechanical benefits are DM-friendly
    if (request.contentType === 'feat') {
      const feat = content as Feat;
      if (feat.benefits && feat.benefits.length > 0) {
        friendliness += 10;
      }
    }
    
    return Math.min(100, Math.max(0, friendliness));
  }
  
  private static calculatePlayerAppeal(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): number {
    let appeal = 70; // Base player appeal
    
    // Roleplay hooks increase appeal
    if (request.roleplayHooks) {
      appeal += 15;
    }
    
    // Flavor text increases appeal
    if (request.flavorText) {
      appeal += 10;
    }
    
    // Mechanical benefits increase appeal
    if (request.mechanicalBenefit) {
      appeal += 10;
    }
    
    return Math.min(100, Math.max(0, appeal));
  }
  
  private static assessIntegrationDifficulty(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): 'easy' | 'moderate' | 'challenging' | 'complex' {
    switch (request.complexity) {
      case 'simple':
        return 'easy';
      case 'moderate':
        return 'moderate';
      case 'complex':
        return 'challenging';
      case 'advanced':
        return 'complex';
      default:
        return 'moderate';
    }
  }
  
  private static identifyCommonUseCases(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const useCases: string[] = [];
    
    if (request.contentType === 'background') {
      useCases.push('Character creation and backstory development');
      useCases.push('Adding depth to existing characters');
      useCases.push('Campaign-specific character options');
    } else {
      useCases.push('Character advancement and customization');
      useCases.push('Enabling specific character concepts');
      useCases.push('Enhancing particular playstyles');
    }
    
    return useCases;
  }
  
  private static identifyPotentialProblems(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const problems: string[] = [];
    
    if (request.balanceTarget === 'experimental') {
      problems.push('May require additional playtesting for balance');
    }
    
    if (request.complexity === 'advanced') {
      problems.push('May be too complex for new players');
    }
    
    return problems;
  }
  
  // ============================================================================
  // INTEGRATION GUIDANCE
  // ============================================================================
  
  private static generateIntegrationGuidance(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): IntegrationGuidance {
    const campaignFit = this.assessCampaignFit(content, request);
    const dmTips = this.generateDMTips(content, request);
    const playerGuidance = this.generatePlayerGuidance(content, request);
    const balancingTips = this.generateBalancingTips(content, request);
    const customizationOptions = this.generateCustomizationOptions(content, request);
    
    return {
      campaignFit,
      dmTips,
      playerGuidance,
      balancingTips,
      customizationOptions
    };
  }
  
  private static assessCampaignFit(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): CampaignFit[] {
    const fits: CampaignFit[] = [];
    
    // Assess fit for different campaign types
    fits.push({
      campaignType: 'Standard Fantasy',
      fitRating: 'excellent',
      notes: 'Fits well in most fantasy campaigns'
    });
    
    fits.push({
      campaignType: 'High Magic',
      fitRating: request.theme === 'high_magic' ? 'excellent' : 'good',
      notes: request.theme === 'high_magic' ? 'Designed for high magic settings' : 'Can be adapted for high magic'
    });
    
    fits.push({
      campaignType: 'Gritty Realism',
      fitRating: request.theme === 'gritty_realism' ? 'excellent' : 'fair',
      notes: request.theme === 'gritty_realism' ? 'Designed for gritty campaigns' : 'May need tone adjustment'
    });
    
    return fits;
  }
  
  private static generateDMTips(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const tips: string[] = [];
    
    tips.push('Review content for campaign fit before allowing');
    tips.push('Consider how this content affects party balance');
    tips.push('Be prepared to adjust if balance issues arise');
    
    if (request.contentType === 'background') {
      tips.push('Use background feature as plot hook opportunity');
      tips.push('Incorporate background elements into story');
    } else {
      tips.push('Monitor feat usage for unexpected interactions');
      tips.push('Consider feat prerequisites in character planning');
    }
    
    return tips;
  }
  
  private static generatePlayerGuidance(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const guidance: string[] = [];
    
    guidance.push('Discuss with DM before using in campaign');
    guidance.push('Consider how this fits your character concept');
    guidance.push('Be prepared to adjust if balance issues arise');
    
    if (request.contentType === 'background') {
      guidance.push('Develop rich backstory using provided elements');
      guidance.push('Use personality traits to guide roleplay');
    } else {
      guidance.push('Understand all mechanical benefits and limitations');
      guidance.push('Consider feat timing in character progression');
    }
    
    return guidance;
  }
  
  private static generateBalancingTips(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const tips: string[] = [];
    
    tips.push('Monitor usage in actual play for balance issues');
    tips.push('Compare power level to similar official content');
    tips.push('Adjust if significantly over or underpowered');
    
    if (request.balanceTarget === 'experimental') {
      tips.push('Requires careful playtesting and adjustment');
      tips.push('Consider temporary approval for testing');
    }
    
    return tips;
  }
  
  private static generateCustomizationOptions(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): string[] {
    const options: string[] = [];
    
    options.push('Adjust flavor text to match campaign setting');
    options.push('Modify mechanical elements with DM approval');
    options.push('Create variant versions for different themes');
    
    if (request.contentType === 'background') {
      options.push('Customize skill proficiencies for character concept');
      options.push('Adapt background feature to campaign needs');
    } else {
      options.push('Adjust prerequisites based on campaign power level');
      options.push('Scale benefits for different character levels');
    }
    
    return options;
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(
    content: CharacterBackground | Feat, 
    request: BackgroundFeatGenerationRequest
  ): ContentVariant[] {
    const variants: ContentVariant[] = [];
    
    // Simpler variant
    variants.push({
      name: 'Simplified Version',
      description: 'Streamlined for easier use',
      modifications: [
        'Reduce complexity of mechanics',
        'Simplify language and descriptions',
        'Focus on core benefits only'
      ],
      balanceChange: -1,
      useCase: 'New players or simple campaigns'
    });
    
    // Enhanced variant
    variants.push({
      name: 'Enhanced Version',
      description: 'Additional options and complexity',
      modifications: [
        'Add additional mechanical options',
        'Expand roleplay elements',
        'Include more customization choices'
      ],
      balanceChange: 1,
      useCase: 'Experienced players wanting more options'
    });
    
    // Themed variant
    variants.push({
      name: 'Alternative Theme',
      description: 'Adapted for different campaign themes',
      modifications: [
        'Adjust flavor text for different setting',
        'Modify cultural elements as appropriate',
        'Adapt mechanical elements to theme'
      ],
      balanceChange: 0,
      useCase: 'Different campaign settings or themes'
    });
    
    return variants;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BackgroundFeatGenerator;
