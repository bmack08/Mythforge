// Mythwright NPC Generator - Specialized D&D 5e Character Generation with Rich Personalities
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { NPC, SystemDesignBudget } from '../../../types/content.types.js';
import { NPCSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// NPC GENERATION TYPES
// ============================================================================

export interface NPCGenerationRequest {
  // Basic Requirements
  name?: string;
  race?: NPCRace | string;
  class?: NPCClass | string;
  level?: number;
  
  // Role & Function
  role: NPCRole;
  importance: NPCImportance;
  location?: string;
  occupation?: string;
  
  // Personality & Traits
  personalityTraits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  alignment?: Alignment;
  
  // Appearance & Demographics
  age?: AgeCategory;
  gender?: string;
  physicalTraits?: string[];
  clothing?: string[];
  
  // Social & Economic
  socialClass?: SocialClass;
  wealth?: WealthLevel;
  reputation?: ReputationLevel;
  relationships?: RelationshipSeed[];
  
  // Campaign Integration
  campaignTheme?: CampaignTheme;
  settingType?: SettingType;
  plotHooks?: string[];
  secrets?: string[];
  
  // Customization
  flavorText?: string;
  restrictions?: string[];
  mustHave?: string[];
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type NPCRole = 
  | 'merchant' | 'guard' | 'noble' | 'commoner' | 'artisan' | 'scholar'
  | 'cleric' | 'innkeeper' | 'blacksmith' | 'farmer' | 'hunter' | 'thief'
  | 'mage' | 'healer' | 'bard' | 'captain' | 'mayor' | 'criminal'
  | 'hermit' | 'explorer' | 'diplomat' | 'spy' | 'cultist' | 'mentor';

export type NPCImportance = 
  | 'background' | 'minor' | 'supporting' | 'major' | 'central';

export type NPCRace = 
  | 'human' | 'elf' | 'dwarf' | 'halfling' | 'dragonborn' | 'gnome'
  | 'half-elf' | 'half-orc' | 'tiefling' | 'aasimar' | 'genasi' | 'goliath'
  | 'tabaxi' | 'kenku' | 'lizardfolk' | 'kobold' | 'goblin' | 'orc';

export type NPCClass = 
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' | 'monk'
  | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' | 'warlock' | 'wizard'
  | 'commoner' | 'expert' | 'warrior' | 'adept' | 'aristocrat';

export type AgeCategory = 
  | 'child' | 'young_adult' | 'adult' | 'middle_aged' | 'elderly' | 'ancient';

export type SocialClass = 
  | 'slave' | 'peasant' | 'commoner' | 'merchant' | 'noble' | 'royalty';

export type WealthLevel = 
  | 'destitute' | 'poor' | 'modest' | 'comfortable' | 'wealthy' | 'aristocratic';

export type ReputationLevel = 
  | 'unknown' | 'local' | 'regional' | 'national' | 'legendary';

export type CampaignTheme = 
  | 'heroic' | 'dark' | 'intrigue' | 'exploration' | 'horror' | 'comedy'
  | 'mystery' | 'war' | 'political' | 'survival' | 'epic' | 'urban';

export type SettingType = 
  | 'urban' | 'rural' | 'wilderness' | 'dungeon' | 'court' | 'tavern'
  | 'market' | 'temple' | 'academy' | 'military' | 'criminal' | 'exotic';

export type Alignment = 
  | 'lawful good' | 'neutral good' | 'chaotic good'
  | 'lawful neutral' | 'true neutral' | 'chaotic neutral'
  | 'lawful evil' | 'neutral evil' | 'chaotic evil';

export interface RelationshipSeed {
  type: 'family' | 'friend' | 'enemy' | 'rival' | 'ally' | 'romantic' | 'business';
  target: string;
  description: string;
}

export interface NPCGenerationResult {
  npc: NPC;
  personalityProfile: PersonalityProfile;
  roleplayGuide: RoleplayGuide;
  plotHooks: PlotHook[];
  relationships: DetailedRelationship[];
  secrets: NPCSecret[];
  voiceActingNotes: VoiceActingNotes;
}

export interface PersonalityProfile {
  coreTraits: string[];
  motivations: string[];
  fears: string[];
  quirks: string[];
  speechPatterns: string[];
  bodyLanguage: string[];
  emotionalRange: EmotionalRange;
  socialStyle: SocialStyle;
}

export interface EmotionalRange {
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionalStability: 'stable' | 'volatile' | 'suppressed' | 'expressive';
  triggers: string[];
}

export interface SocialStyle {
  approachToStrangers: string;
  leadershipStyle?: string;
  conflictResolution: string;
  trustLevel: 'trusting' | 'cautious' | 'paranoid' | 'naive';
  socialEnergy: 'introverted' | 'extroverted' | 'ambivert';
}

export interface RoleplayGuide {
  voiceDescription: string;
  mannerisms: string[];
  catchphrases: string[];
  topics: {
    comfortable: string[];
    uncomfortable: string[];
    passionate: string[];
  };
  reactionPatterns: {
    toThreat: string;
    toKindness: string;
    toRudeness: string;
    toMoney: string;
    toMagic: string;
  };
}

export interface PlotHook {
  type: 'quest' | 'information' | 'conflict' | 'opportunity' | 'mystery';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  rewards: string[];
  consequences: string[];
  timeframe: string;
}

export interface DetailedRelationship {
  name: string;
  relationship: string;
  description: string;
  currentStatus: string;
  history: string;
  plotPotential: string;
}

export interface NPCSecret {
  type: 'personal' | 'professional' | 'criminal' | 'magical' | 'political';
  secret: string;
  impact: 'minor' | 'major' | 'campaign_changing';
  whoKnows: string[];
  consequences: string[];
  discoveryDifficulty: number; // DC 1-30
}

export interface VoiceActingNotes {
  accent?: string;
  pitch: 'high' | 'medium' | 'low';
  pace: 'fast' | 'medium' | 'slow';
  volume: 'quiet' | 'normal' | 'loud';
  distinctiveFeatures: string[];
  emotionalTones: string[];
  examplePhrases: string[];
}

// ============================================================================
// PERSONALITY TRAIT POOLS
// ============================================================================

const PERSONALITY_TRAITS = {
  positive: [
    'honest', 'loyal', 'brave', 'kind', 'generous', 'patient', 'wise', 'funny',
    'charismatic', 'hardworking', 'creative', 'optimistic', 'protective', 'curious'
  ],
  negative: [
    'greedy', 'cowardly', 'cruel', 'lazy', 'stubborn', 'arrogant', 'jealous', 'paranoid',
    'impulsive', 'pessimistic', 'violent', 'manipulative', 'selfish', 'dishonest'
  ],
  neutral: [
    'quiet', 'talkative', 'methodical', 'spontaneous', 'formal', 'casual', 'serious', 'playful',
    'traditional', 'progressive', 'practical', 'idealistic', 'analytical', 'intuitive'
  ]
};

const IDEALS = {
  good: ['Freedom', 'Justice', 'Honor', 'Compassion', 'Hope', 'Truth'],
  neutral: ['Balance', 'Knowledge', 'Nature', 'Tradition', 'Self-improvement', 'Discovery'],
  evil: ['Power', 'Domination', 'Revenge', 'Greed', 'Survival', 'Control']
};

const BONDS = [
  'family member', 'childhood friend', 'mentor', 'rival', 'lost love', 'sacred place',
  'treasured possession', 'organization', 'ideal', 'homeland', 'pet', 'deity'
];

const FLAWS = [
  'secret shame', 'addiction', 'phobia', 'enemy', 'debt', 'dark secret',
  'obsession', 'prejudice', 'overconfidence', 'cowardice', 'temper', 'naivety'
];

// ============================================================================
// NPC GENERATOR CLASS
// ============================================================================

export class NPCGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateNPC(
    request: NPCGenerationRequest,
    aiService: any // AIService type
  ): Promise<NPCGenerationResult> {
    
    // Step 1: Build the AI prompt
    const aiPrompt = this.buildNPCPrompt(request);
    
    // Step 2: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'npc',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          role: request.role,
          importance: request.importance,
          campaignTheme: request.campaignTheme,
          settingType: request.settingType
        }
      },
      options: {
        temperature: 0.8, // Higher creativity for personalities
        maxTokens: 2500 // NPCs can be very detailed
      }
    };
    
    // Step 3: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`NPC generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 4: Validate and parse the NPC
    const npc = this.validateAndParseNPC(aiResponse.content);
    
    // Step 5: Generate personality profile
    const personalityProfile = this.generatePersonalityProfile(npc, request);
    
    // Step 6: Create roleplay guide
    const roleplayGuide = this.generateRoleplayGuide(npc, personalityProfile, request);
    
    // Step 7: Generate plot hooks
    const plotHooks = this.generatePlotHooks(npc, request);
    
    // Step 8: Create detailed relationships
    const relationships = this.generateDetailedRelationships(npc, request);
    
    // Step 9: Generate secrets
    const secrets = this.generateSecrets(npc, request);
    
    // Step 10: Create voice acting notes
    const voiceActingNotes = this.generateVoiceActingNotes(npc, personalityProfile);
    
    return {
      npc,
      personalityProfile,
      roleplayGuide,
      plotHooks,
      relationships,
      secrets,
      voiceActingNotes
    };
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildNPCPrompt(request: NPCGenerationRequest): string {
    let prompt = `Create a detailed D&D 5e NPC with rich personality and background:

CORE REQUIREMENTS:
- Role: ${request.role}
- Importance: ${request.importance}`;

    if (request.name) {
      prompt += `\n- Name: ${request.name}`;
    }
    
    if (request.race) {
      prompt += `\n- Race: ${request.race}`;
    }
    
    if (request.class) {
      prompt += `\n- Class: ${request.class}`;
    }
    
    if (request.level) {
      prompt += `\n- Level: ${request.level}`;
    }
    
    if (request.location) {
      prompt += `\n- Location: ${request.location}`;
    }
    
    if (request.occupation) {
      prompt += `\n- Occupation: ${request.occupation}`;
    }
    
    if (request.alignment) {
      prompt += `\n- Alignment: ${request.alignment}`;
    }
    
    // Add context information
    if (request.campaignTheme) {
      prompt += `\n\nCAMPAIGN CONTEXT:
- Theme: ${request.campaignTheme}`;
    }
    
    if (request.settingType) {
      prompt += `\n- Setting: ${request.settingType}`;
    }
    
    // Add demographic information
    if (request.age || request.gender || request.socialClass || request.wealth) {
      prompt += `\n\nDEMOGRAPHICS:`;
      if (request.age) prompt += `\n- Age Category: ${request.age}`;
      if (request.gender) prompt += `\n- Gender: ${request.gender}`;
      if (request.socialClass) prompt += `\n- Social Class: ${request.socialClass}`;
      if (request.wealth) prompt += `\n- Wealth Level: ${request.wealth}`;
      if (request.reputation) prompt += `\n- Reputation: ${request.reputation}`;
    }
    
    // Add personality seeds
    if (request.personalityTraits || request.ideals || request.bonds || request.flaws) {
      prompt += `\n\nPERSONALITY SEEDS:`;
      if (request.personalityTraits) {
        prompt += `\n- Traits: ${request.personalityTraits.join(', ')}`;
      }
      if (request.ideals) {
        prompt += `\n- Ideals: ${request.ideals.join(', ')}`;
      }
      if (request.bonds) {
        prompt += `\n- Bonds: ${request.bonds.join(', ')}`;
      }
      if (request.flaws) {
        prompt += `\n- Flaws: ${request.flaws.join(', ')}`;
      }
    }
    
    // Add appearance hints
    if (request.physicalTraits || request.clothing) {
      prompt += `\n\nAPPEARANCE HINTS:`;
      if (request.physicalTraits) {
        prompt += `\n- Physical: ${request.physicalTraits.join(', ')}`;
      }
      if (request.clothing) {
        prompt += `\n- Clothing: ${request.clothing.join(', ')}`;
      }
    }
    
    // Add relationship seeds
    if (request.relationships && request.relationships.length > 0) {
      prompt += `\n\nRELATIONSHIP SEEDS:`;
      request.relationships.forEach(rel => {
        prompt += `\n- ${rel.type} with ${rel.target}: ${rel.description}`;
      });
    }
    
    // Add plot hooks
    if (request.plotHooks && request.plotHooks.length > 0) {
      prompt += `\n\nPLOT HOOK SEEDS:`;
      request.plotHooks.forEach(hook => {
        prompt += `\n- ${hook}`;
      });
    }
    
    // Add secrets
    if (request.secrets && request.secrets.length > 0) {
      prompt += `\n\nSECRET SEEDS:`;
      request.secrets.forEach(secret => {
        prompt += `\n- ${secret}`;
      });
    }
    
    // Add must-have features
    if (request.mustHave && request.mustHave.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustHave.forEach(feature => {
        prompt += `\n- ${feature}`;
      });
    }
    
    // Add restrictions
    if (request.restrictions && request.restrictions.length > 0) {
      prompt += `\n\nRESTRICTIONS:`;
      request.restrictions.forEach(restriction => {
        prompt += `\n- ${restriction}`;
      });
    }
    
    // Add flavor text guidance
    if (request.flavorText) {
      prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
    }
    
    // Add role-specific guidance
    prompt += this.getRoleSpecificGuidance(request.role, request.importance);
    
    prompt += `\n\nCRITICAL REQUIREMENTS:
1. Create a memorable, three-dimensional character with clear motivations
2. Include specific personality traits, ideals, bonds, and flaws
3. Provide detailed physical description and mannerisms
4. Generate appropriate background and history
5. Include speech patterns and voice characteristics
6. Create meaningful relationships and connections
7. Ensure the character fits their role and social position
8. Add interesting secrets or hidden depths
9. Make them useful for roleplay and story development
10. Use only SRD-safe content (no Product Identity terms)
11. Include appropriate ability scores for their role and level
12. Add skills, equipment, and other mechanical details as needed

Return a complete NPC in JSON format following the NPC schema with all personality details, background, appearance, relationships, and mechanical statistics.`;
    
    return prompt;
  }
  
  private static getRoleSpecificGuidance(role: NPCRole, importance: NPCImportance): string {
    let guidance = `\n\nROLE-SPECIFIC GUIDANCE:`;
    
    switch (role) {
      case 'merchant':
        guidance += `\n- Focus on trade relationships, market knowledge, and profit motives
- Include inventory, trading routes, and business connections
- Consider economic pressures and competition`;
        break;
      case 'noble':
        guidance += `\n- Emphasize political connections, family honor, and social obligations
- Include court intrigue, inheritance issues, and power dynamics
- Consider noblesse oblige vs. personal ambition`;
        break;
      case 'guard':
        guidance += `\n- Focus on duty, loyalty, and protection of others
- Include military background, chain of command, and patrol routes
- Consider corruption, moral conflicts, and personal justice`;
        break;
      case 'scholar':
        guidance += `\n- Emphasize knowledge, research, and intellectual pursuits
- Include areas of expertise, academic rivalries, and discoveries
- Consider the tension between theory and practical application`;
        break;
      case 'criminal':
        guidance += `\n- Focus on survival, territory, and criminal enterprises
- Include underworld connections, past crimes, and current schemes
- Consider redemption possibilities and moral complexity`;
        break;
      case 'cleric':
        guidance += `\n- Emphasize faith, service, and divine connection
- Include religious duties, congregation relationships, and spiritual struggles
- Consider dogma vs. personal interpretation of faith`;
        break;
      default:
        guidance += `\n- Develop character around their specific role and daily responsibilities
- Include relevant professional relationships and challenges
- Consider how their work shapes their worldview and personality`;
    }
    
    switch (importance) {
      case 'central':
        guidance += `\n- Create deep, complex motivations with multiple layers
- Include significant secrets and major plot connections
- Develop extensive relationship networks and influence`;
        break;
      case 'major':
        guidance += `\n- Provide strong personality and clear goals
- Include meaningful secrets and plot relevance
- Develop important relationships and local influence`;
        break;
      case 'supporting':
        guidance += `\n- Create memorable quirks and specific expertise
- Include minor secrets and plot utility
        - Develop focused relationships within their sphere`;
        break;
      case 'minor':
        guidance += `\n- Focus on one or two distinctive traits
- Include simple background and clear purpose
- Develop basic relationships and local connections`;
        break;
      case 'background':
        guidance += `\n- Create simple but memorable characteristics
- Focus on their immediate function and basic personality
- Keep relationships and background straightforward`;
        break;
    }
    
    return guidance;
  }
  
  // ============================================================================
  // NPC VALIDATION
  // ============================================================================
  
  private static validateAndParseNPC(content: any): NPC {
    // Validate against schema
    const validation = NPCSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptNPCFix(content);
      const revalidation = NPCSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid NPC generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptNPCFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.personalityTraits) {
      fixed.personalityTraits = ['curious', 'helpful'];
    }
    
    if (!fixed.ideals) {
      fixed.ideals = ['Knowledge is power'];
    }
    
    if (!fixed.bonds) {
      fixed.bonds = ['My family means everything to me'];
    }
    
    if (!fixed.flaws) {
      fixed.flaws = ['I trust too easily'];
    }
    
    if (!fixed.appearance) {
      fixed.appearance = 'Average height and build with unremarkable features';
    }
    
    if (!fixed.mannerisms) {
      fixed.mannerisms = ['Speaks clearly and directly'];
    }
    
    if (!fixed.background) {
      fixed.background = 'A typical member of their community with a standard upbringing';
    }
    
    if (!fixed.equipment) {
      fixed.equipment = [];
    }
    
    if (!fixed.relationships) {
      fixed.relationships = [];
    }
    
    return fixed;
  }
  
  // ============================================================================
  // PERSONALITY PROFILE GENERATION
  // ============================================================================
  
  private static generatePersonalityProfile(npc: NPC, request: NPCGenerationRequest): PersonalityProfile {
    // Extract core traits from the NPC
    const coreTraits = this.extractCoreTraits(npc);
    const motivations = this.generateMotivations(npc, request);
    const fears = this.generateFears(npc, request);
    const quirks = this.generateQuirks(npc);
    const speechPatterns = this.generateSpeechPatterns(npc);
    const bodyLanguage = this.generateBodyLanguage(npc);
    const emotionalRange = this.generateEmotionalRange(npc);
    const socialStyle = this.generateSocialStyle(npc);
    
    return {
      coreTraits,
      motivations,
      fears,
      quirks,
      speechPatterns,
      bodyLanguage,
      emotionalRange,
      socialStyle
    };
  }
  
  private static extractCoreTraits(npc: NPC): string[] {
    const traits = [...npc.personalityTraits];
    
    // Add traits inferred from ideals, bonds, and flaws
    if (npc.ideals.some(ideal => ideal.toLowerCase().includes('justice'))) {
      traits.push('justice-oriented');
    }
    if (npc.bonds.some(bond => bond.toLowerCase().includes('family'))) {
      traits.push('family-focused');
    }
    if (npc.flaws.some(flaw => flaw.toLowerCase().includes('temper'))) {
      traits.push('hot-tempered');
    }
    
    return traits.slice(0, 5); // Keep top 5 traits
  }
  
  private static generateMotivations(npc: NPC, request: NPCGenerationRequest): string[] {
    const motivations: string[] = [];
    
    // Role-based motivations
    switch (request.role) {
      case 'merchant':
        motivations.push('Increase profits and expand business');
        motivations.push('Build reputation and customer loyalty');
        break;
      case 'guard':
        motivations.push('Protect the innocent and maintain order');
        motivations.push('Advance in rank and earn respect');
        break;
      case 'scholar':
        motivations.push('Discover new knowledge and understanding');
        motivations.push('Share wisdom and educate others');
        break;
      default:
        motivations.push('Fulfill professional duties and responsibilities');
        motivations.push('Provide for family and loved ones');
    }
    
    // Add motivations from ideals and bonds
    npc.ideals.forEach(ideal => {
      motivations.push(`Uphold the ideal of ${ideal.toLowerCase()}`);
    });
    
    return motivations.slice(0, 4);
  }
  
  private static generateFears(npc: NPC, request: NPCGenerationRequest): string[] {
    const fears: string[] = [];
    
    // Generate fears from flaws
    npc.flaws.forEach(flaw => {
      if (flaw.toLowerCase().includes('secret')) {
        fears.push('Having their secrets exposed');
      } else if (flaw.toLowerCase().includes('debt')) {
        fears.push('Financial ruin and poverty');
      } else if (flaw.toLowerCase().includes('enemy')) {
        fears.push('Revenge from past enemies');
      }
    });
    
    // Role-specific fears
    switch (request.role) {
      case 'merchant':
        fears.push('Economic collapse and business failure');
        break;
      case 'guard':
        fears.push('Failing to protect those under their care');
        break;
      case 'criminal':
        fears.push('Being caught and imprisoned');
        break;
    }
    
    // Universal fears
    fears.push('Loss of loved ones');
    fears.push('Being forgotten or insignificant');
    
    return fears.slice(0, 3);
  }
  
  private static generateQuirks(npc: NPC): string[] {
    const quirks: string[] = [];
    
    // Generate quirks based on mannerisms
    if (npc.mannerisms) {
      npc.mannerisms.forEach(mannerism => {
        if (mannerism.toLowerCase().includes('hand')) {
          quirks.push('Gestures frequently with hands while talking');
        } else if (mannerism.toLowerCase().includes('eye')) {
          quirks.push('Maintains intense eye contact');
        }
      });
    }
    
    // Add random quirks
    const randomQuirks = [
      'Always counts coins twice',
      'Hums while working',
      'Collects small trinkets',
      'Never sits with back to door',
      'Quotes old sayings frequently',
      'Taps fingers when thinking'
    ];
    
    quirks.push(randomQuirks[Math.floor(Math.random() * randomQuirks.length)]);
    
    return quirks.slice(0, 3);
  }
  
  private static generateSpeechPatterns(npc: NPC): string[] {
    const patterns: string[] = [];
    
    // Add patterns based on background and class
    if (npc.class === 'wizard' || npc.class === 'cleric') {
      patterns.push('Uses formal, educated vocabulary');
      patterns.push('References books and ancient knowledge');
    } else if (npc.class === 'barbarian' || npc.class === 'fighter') {
      patterns.push('Uses direct, simple language');
      patterns.push('Military or tribal expressions');
    }
    
    // Add personality-based patterns
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('honest'))) {
      patterns.push('Speaks bluntly and directly');
    }
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('charismatic'))) {
      patterns.push('Uses persuasive and engaging language');
    }
    
    return patterns.slice(0, 3);
  }
  
  private static generateBodyLanguage(npc: NPC): string[] {
    const bodyLanguage: string[] = [];
    
    // Generate based on personality traits
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('confident'))) {
      bodyLanguage.push('Stands tall with shoulders back');
      bodyLanguage.push('Makes strong eye contact');
    } else if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('shy'))) {
      bodyLanguage.push('Avoids direct eye contact');
      bodyLanguage.push('Fidgets with hands or clothing');
    }
    
    // Add general body language
    bodyLanguage.push('Expressive facial expressions');
    bodyLanguage.push('Gestures while speaking');
    
    return bodyLanguage.slice(0, 3);
  }
  
  private static generateEmotionalRange(npc: NPC): EmotionalRange {
    // Determine primary emotion from personality traits
    let primaryEmotion = 'contentment';
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('angry'))) {
      primaryEmotion = 'anger';
    } else if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('happy'))) {
      primaryEmotion = 'joy';
    } else if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('sad'))) {
      primaryEmotion = 'melancholy';
    }
    
    const secondaryEmotions = ['curiosity', 'concern', 'amusement', 'frustration'];
    const emotionalStability = npc.flaws.some(flaw => flaw.toLowerCase().includes('temper')) ? 'volatile' : 'stable';
    const triggers = this.generateEmotionalTriggers(npc);
    
    return {
      primaryEmotion,
      secondaryEmotions,
      emotionalStability,
      triggers
    };
  }
  
  private static generateEmotionalTriggers(npc: NPC): string[] {
    const triggers: string[] = [];
    
    // Generate from flaws
    npc.flaws.forEach(flaw => {
      if (flaw.toLowerCase().includes('pride')) {
        triggers.push('Insults to their competence or reputation');
      } else if (flaw.toLowerCase().includes('family')) {
        triggers.push('Threats to family members');
      }
    });
    
    // Generate from bonds
    npc.bonds.forEach(bond => {
      triggers.push(`Anything threatening their ${bond.toLowerCase()}`);
    });
    
    return triggers.slice(0, 3);
  }
  
  private static generateSocialStyle(npc: NPC): SocialStyle {
    const approachToStrangers = npc.personalityTraits.some(trait => 
      trait.toLowerCase().includes('friendly') || trait.toLowerCase().includes('outgoing')
    ) ? 'Warm and welcoming' : 'Cautious but polite';
    
    const conflictResolution = npc.personalityTraits.some(trait => 
      trait.toLowerCase().includes('diplomatic')
    ) ? 'Seeks compromise and understanding' : 'Direct confrontation when necessary';
    
    const trustLevel = npc.flaws.some(flaw => 
      flaw.toLowerCase().includes('paranoid')
    ) ? 'paranoid' : 'cautious';
    
    const socialEnergy = npc.personalityTraits.some(trait => 
      trait.toLowerCase().includes('outgoing') || trait.toLowerCase().includes('charismatic')
    ) ? 'extroverted' : 'ambivert';
    
    return {
      approachToStrangers,
      conflictResolution,
      trustLevel,
      socialEnergy
    };
  }
  
  // ============================================================================
  // ROLEPLAY GUIDE GENERATION
  // ============================================================================
  
  private static generateRoleplayGuide(
    npc: NPC, 
    personality: PersonalityProfile, 
    request: NPCGenerationRequest
  ): RoleplayGuide {
    const voiceDescription = this.generateVoiceDescription(npc, personality);
    const mannerisms = [...(npc.mannerisms || [])];
    const catchphrases = this.generateCatchphrases(npc, request);
    const topics = this.generateTopics(npc, request);
    const reactionPatterns = this.generateReactionPatterns(npc, personality);
    
    return {
      voiceDescription,
      mannerisms,
      catchphrases,
      topics,
      reactionPatterns
    };
  }
  
  private static generateVoiceDescription(npc: NPC, personality: PersonalityProfile): string {
    let description = '';
    
    // Base voice on class and background
    if (npc.class === 'wizard' || npc.class === 'cleric') {
      description = 'Educated and articulate';
    } else if (npc.class === 'barbarian') {
      description = 'Rough and powerful';
    } else if (npc.class === 'bard') {
      description = 'Melodious and expressive';
    } else {
      description = 'Clear and practical';
    }
    
    // Add personality modifiers
    if (personality.coreTraits.includes('confident')) {
      description += ', confident and commanding';
    } else if (personality.coreTraits.includes('shy')) {
      description += ', soft-spoken and hesitant';
    }
    
    return description;
  }
  
  private static generateCatchphrases(npc: NPC, request: NPCGenerationRequest): string[] {
    const phrases: string[] = [];
    
    // Role-based catchphrases
    switch (request.role) {
      case 'merchant':
        phrases.push("What can I interest you in today?");
        phrases.push("Quality goods at fair prices!");
        break;
      case 'guard':
        phrases.push("Move along, citizen.");
        phrases.push("Nothing to see here.");
        break;
      case 'innkeeper':
        phrases.push("Welcome to my establishment!");
        phrases.push("Safe travels, friend.");
        break;
    }
    
    // Add personality-based phrases
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('optimistic'))) {
      phrases.push("Every cloud has a silver lining!");
    }
    if (npc.personalityTraits.some(trait => trait.toLowerCase().includes('cautious'))) {
      phrases.push("Better safe than sorry.");
    }
    
    return phrases.slice(0, 3);
  }
  
  private static generateTopics(npc: NPC, request: NPCGenerationRequest): any {
    const comfortable = ['local weather', 'daily routine', 'family news'];
    const uncomfortable = ['personal finances', 'political opinions'];
    const passionate = [];
    
    // Add role-specific topics
    switch (request.role) {
      case 'merchant':
        comfortable.push('trade routes', 'market prices', 'quality goods');
        passionate.push('fair business practices', 'economic opportunities');
        uncomfortable.push('competitor prices', 'business failures');
        break;
      case 'scholar':
        comfortable.push('academic theories', 'historical events', 'research methods');
        passionate.push('pursuit of knowledge', 'education reform');
        uncomfortable.push('funding cuts', 'academic rivalries');
        break;
    }
    
    // Add from ideals
    npc.ideals.forEach(ideal => {
      passionate.push(ideal.toLowerCase());
    });
    
    return {
      comfortable: comfortable.slice(0, 4),
      uncomfortable: uncomfortable.slice(0, 3),
      passionate: passionate.slice(0, 3)
    };
  }
  
  private static generateReactionPatterns(npc: NPC, personality: PersonalityProfile): any {
    return {
      toThreat: personality.coreTraits.includes('brave') ? 
        'Stands ground and faces threat directly' : 
        'Seeks help or attempts to de-escalate',
      toKindness: personality.socialStyle.trustLevel === 'trusting' ?
        'Responds warmly and reciprocates kindness' :
        'Appreciates but remains cautious',
      toRudeness: personality.emotionalRange.emotionalStability === 'volatile' ?
        'Quick anger and sharp response' :
        'Maintains composure but becomes distant',
      toMoney: npc.flaws.some(flaw => flaw.toLowerCase().includes('greed')) ?
        'Eyes light up with obvious interest' :
        'Professional interest but not greedy',
      toMagic: npc.class === 'wizard' || npc.class === 'sorcerer' ?
        'Professional curiosity and analysis' :
        'Mixture of wonder and caution'
    };
  }
  
  // ============================================================================
  // PLOT HOOKS GENERATION
  // ============================================================================
  
  private static generatePlotHooks(npc: NPC, request: NPCGenerationRequest): PlotHook[] {
    const hooks: PlotHook[] = [];
    
    // Generate hooks from secrets and flaws
    npc.flaws.forEach(flaw => {
      if (flaw.toLowerCase().includes('debt')) {
        hooks.push({
          type: 'quest',
          title: 'Outstanding Debts',
          description: `${npc.name} needs help dealing with creditors or earning money to pay off debts`,
          difficulty: 'medium',
          rewards: ['gold', 'favor', 'information'],
          consequences: ['reputation damage', 'loss of business'],
          timeframe: 'urgent'
        });
      }
    });
    
    // Role-specific hooks
    switch (request.role) {
      case 'merchant':
        hooks.push({
          type: 'quest',
          title: 'Missing Caravan',
          description: `${npc.name}'s trading caravan has gone missing and needs to be found`,
          difficulty: 'medium',
          rewards: ['gold', 'trade goods', 'merchant connections'],
          consequences: ['business failure', 'loss of reputation'],
          timeframe: 'time-sensitive'
        });
        break;
      case 'scholar':
        hooks.push({
          type: 'information',
          title: 'Ancient Knowledge',
          description: `${npc.name} has discovered references to an ancient artifact or lost knowledge`,
          difficulty: 'hard',
          rewards: ['rare knowledge', 'magical items', 'academic recognition'],
          consequences: ['dangerous enemies', 'forbidden knowledge'],
          timeframe: 'flexible'
        });
        break;
    }
    
    return hooks.slice(0, 3);
  }
  
  // ============================================================================
  // RELATIONSHIPS GENERATION
  // ============================================================================
  
  private static generateDetailedRelationships(npc: NPC, request: NPCGenerationRequest): DetailedRelationship[] {
    const relationships: DetailedRelationship[] = [];
    
    // Generate from existing relationship seeds
    if (request.relationships) {
      request.relationships.forEach(seed => {
        relationships.push({
          name: seed.target,
          relationship: seed.type,
          description: seed.description,
          currentStatus: 'stable',
          history: 'Long-standing relationship with shared experiences',
          plotPotential: 'Could provide assistance or complications for the party'
        });
      });
    }
    
    // Generate role-appropriate relationships
    switch (request.role) {
      case 'merchant':
        relationships.push({
          name: 'Trading Partner',
          relationship: 'business associate',
          description: 'Reliable supplier of goods from distant lands',
          currentStatus: 'good terms',
          history: 'Five years of successful trade agreements',
          plotPotential: 'Source of exotic goods and distant news'
        });
        break;
      case 'guard':
        relationships.push({
          name: 'Captain of the Guard',
          relationship: 'superior officer',
          description: 'Direct commanding officer who assigns duties',
          currentStatus: 'professional respect',
          history: 'Served under them for three years',
          plotPotential: 'Could provide official backing or create conflicts'
        });
        break;
    }
    
    return relationships.slice(0, 4);
  }
  
  // ============================================================================
  // SECRETS GENERATION
  // ============================================================================
  
  private static generateSecrets(npc: NPC, request: NPCGenerationRequest): NPCSecret[] {
    const secrets: NPCSecret[] = [];
    
    // Generate from flaws
    npc.flaws.forEach(flaw => {
      if (flaw.toLowerCase().includes('secret')) {
        secrets.push({
          type: 'personal',
          secret: 'Has a hidden past that would damage their reputation if revealed',
          impact: 'major',
          whoKnows: ['close family member'],
          consequences: ['loss of position', 'social ostracism'],
          discoveryDifficulty: 18
        });
      }
    });
    
    // Role-specific secrets
    switch (request.role) {
      case 'merchant':
        secrets.push({
          type: 'professional',
          secret: 'Occasionally deals in contraband or illegal goods',
          impact: 'major',
          whoKnows: ['trusted associate'],
          consequences: ['arrest', 'business closure', 'criminal charges'],
          discoveryDifficulty: 15
        });
        break;
      case 'guard':
        secrets.push({
          type: 'professional',
          secret: 'Takes bribes to look the other way on minor crimes',
          impact: 'major',
          whoKnows: ['criminal contacts'],
          consequences: ['dismissal', 'imprisonment', 'loss of honor'],
          discoveryDifficulty: 16
        });
        break;
    }
    
    return secrets.slice(0, 2);
  }
  
  // ============================================================================
  // VOICE ACTING NOTES GENERATION
  // ============================================================================
  
  private static generateVoiceActingNotes(npc: NPC, personality: PersonalityProfile): VoiceActingNotes {
    const pitch = personality.coreTraits.includes('confident') ? 'medium' : 'medium';
    const pace = personality.socialStyle.socialEnergy === 'extroverted' ? 'fast' : 'medium';
    const volume = personality.coreTraits.includes('shy') ? 'quiet' : 'normal';
    
    const distinctiveFeatures = [];
    if (npc.race === 'dwarf') {
      distinctiveFeatures.push('Slight accent with rolled Rs');
    }
    if (npc.class === 'wizard') {
      distinctiveFeatures.push('Precise pronunciation');
    }
    
    const emotionalTones = personality.emotionalRange.secondaryEmotions.slice(0, 3);
    const examplePhrases = this.generateExamplePhrases(npc, personality);
    
    return {
      pitch,
      pace,
      volume,
      distinctiveFeatures,
      emotionalTones,
      examplePhrases
    };
  }
  
  private static generateExamplePhrases(npc: NPC, personality: PersonalityProfile): string[] {
    const phrases = [
      `"Greetings, I am ${npc.name}."`,
      `"I've been ${npc.occupation || 'working'} here for years."`
    ];
    
    // Add personality-based phrases
    if (personality.coreTraits.includes('helpful')) {
      phrases.push('"How can I assist you today?"');
    }
    if (personality.coreTraits.includes('cautious')) {
      phrases.push('"I\'m not sure I should be telling you this..."');
    }
    
    return phrases.slice(0, 4);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NPCGenerator;
