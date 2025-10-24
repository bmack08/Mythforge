// Mythwright Content Type Definitions - Comprehensive D&D Content Types
// These types mirror our database models and provide type safety for AI generation

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================

export type EntityId = string; // nanoid(12)
export type UserId = string;
export type DateString = string; // ISO date string

// Size categories for creatures and objects
export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

// Ability scores
export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

// Dice notation and damage types
export type DiceNotation = string; // e.g., "1d8+2", "2d6"
export type DamageType = 
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning'
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing'
  | 'thunder';

export type Condition = 
  | 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled' | 'incapacitated'
  | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned' | 'prone' | 'restrained'
  | 'stunned' | 'unconscious';

// Challenge Rating (includes fractional CRs)
export type ChallengeRating = 
  | 0 | 0.125 | 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25
  | 26 | 27 | 28 | 29 | 30;

// ============================================================================
// SYSTEM DESIGN BUDGET TYPES
// ============================================================================

export interface SystemDesignBudget {
  // Party Configuration
  partySize: number; // 1-8
  partyLevel: number; // 1-20
  
  // Difficulty & Pacing
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  encounterIntensity?: 'low' | 'medium' | 'high';
  restFrequency?: 'frequent' | 'standard' | 'rare';
  
  // Content Preferences (percentages that sum to 100)
  combatWeight: number; // 0-100
  explorationWeight: number; // 0-100
  socialWeight: number; // 0-100
  
  // XP Budget Calculations
  totalXPBudget: number;
  sessionsPlanned: number;
  combatXP: number;
  explorationXP: number;
  socialXP: number;
  
  // Treasure & Magic
  treasureLevel: 'minimal' | 'standard' | 'generous';
  magicPrevalence?: 'rare' | 'normal' | 'common';
  treasurePace?: 'slow' | 'standard' | 'fast';
  
  // Enhanced Budget Features
  difficultyVariance: 'consistent' | 'moderate' | 'dynamic';
  playerExperience: 'beginner' | 'mixed' | 'experienced' | 'veteran';
  campaignGoals: string[];
  
  // Tone & Theme
  tone: 'gritty' | 'balanced' | 'heroic';
  themes?: string[]; // Array of theme tags
  setting: string; // Campaign setting description
  
  // Technical Settings
  targetLength?: 'short' | 'medium' | 'long'; // 10-20, 20-40, 40+ pages
  complexity: 'simple' | 'medium' | 'complex';
  narrativeDepth?: 'simple' | 'moderate' | 'complex';
  encounterComplexity?: 'simple' | 'moderate' | 'complex';
}

export interface XPBudget {
  allocated: number;    // XP allocated to this content
  used: number;         // XP used by creatures/challenges
  baseXP: number;       // Base XP without multipliers
  adjustedXP: number;   // XP with encounter multipliers
  efficiency: number;   // Percentage of budget used (0-100)
}

// ============================================================================
// LEGAL COMPLIANCE TYPES
// ============================================================================

export type UsageType = 'personal' | 'sharing' | 'commercial' | 'marketplace';
export type LicenseType = 'ogl' | 'cc' | 'proprietary';

export interface LegalCompliance {
  usageType: UsageType;
  licenseType: LicenseType;
  piFiltered: boolean; // Product Identity filtered for commercial use
  attributions: string[]; // Required attributions
  lastScanned: DateString | null;
  complianceScore: number; // 0-100
}

// ============================================================================
// CONTENT GENERATION TYPES
// ============================================================================

export interface GenerationSettings {
  aiGenerated: boolean;
  model: string | null; // 'gpt-4', 'claude-3', etc.
  prompt: string | null;
  temperature: number; // 0-2
  maxTokens: number;
  generatedAt: DateString | null;
  tokensUsed: number;
  cost: number; // in USD
}

export interface ValidationResults {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lastValidated: DateString | null;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: EntityId;
  userId: UserId;
  title: string;
  description?: string;
  
  // Core configuration
  systemDesignBudget: SystemDesignBudget;
  generationSettings: GenerationSettings;
  legalCompliance: LegalCompliance;
  
  // Status & Progress
  status: 'draft' | 'generating' | 'complete' | 'published' | 'archived';
  generationProgress?: {
    step: number;
    totalSteps: number;
    percentage: number;
    currentTask: string;
    updatedAt: DateString;
  };
  
  // Content Statistics
  contentStats: {
    totalPages: number;
    totalWords: number;
    totalEncounters: number;
    totalNPCs: number;
    totalMagicItems: number;
    totalStatBlocks: number;
    estimatedPlayTime: number; // in hours
  };
  
  // Publishing & Sharing
  isPublic: boolean;
  publishedAt?: DateString;
  shareToken: string;
  marketplaceData?: Record<string, unknown>;
  
  // Metadata
  version: number;
  aiMetadata: {
    totalTokensUsed: number;
    totalCost: number;
    generationHistory: Array<{
      timestamp: DateString;
      model: string;
      tokensUsed: number;
      cost: number;
    }>;
    lastGenerated?: DateString;
  };
  
  // Timestamps
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// CHAPTER & SECTION TYPES
// ============================================================================

export type ChapterType = 
  | 'introduction' | 'adventure' | 'location' | 'npcs' | 'monsters'
  | 'items' | 'appendix' | 'handouts' | 'maps' | 'tables' | 'custom';

export interface Chapter {
  id: EntityId;
  projectId: EntityId;
  parentId?: EntityId; // For hierarchical chapters
  
  title: string;
  slug: string;
  description?: string;
  chapterType: ChapterType;
  
  // Hierarchy & Ordering
  orderIndex: number;
  level: number; // 1-6 (like HTML headings)
  
  // Content
  content?: string; // Homebrewery markdown
  generationPrompt?: string;
  generationSettings: GenerationSettings;
  
  // Metadata
  contentMetadata: {
    wordCount: number;
    estimatedReadTime: number; // in minutes
    encounterCount: number;
    npcCount: number;
    magicItemCount: number;
    lastAnalyzed?: DateString;
  };
  
  // Publishing & Visibility
  isVisible: boolean;
  isComplete: boolean;
  
  // Cross-references and dependencies
  dependencies: EntityId[]; // Chapter IDs this chapter depends on
  crossReferences: Array<{
    targetId: EntityId;
    targetType: 'chapter' | 'section' | 'npc' | 'encounter';
    description: string;
  }>;
  
  // Accessibility
  accessibilityMetadata: {
    hasAltText: boolean;
    hasProperHeadings: boolean;
    colorContrastChecked: boolean;
    screenReaderFriendly: boolean;
    lastAccessibilityCheck?: DateString;
  };
  
  // Metadata
  version: number;
  authorNotes?: string;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

export type SectionType = 
  | 'text' | 'statblock' | 'encounter' | 'magicitem' | 'npc' | 'location'
  | 'table' | 'boxedtext' | 'sidebar' | 'handout' | 'map' | 'custom';

export interface Section {
  id: EntityId;
  chapterId: EntityId;
  
  title: string;
  sectionType: SectionType;
  orderIndex: number;
  
  // Content Storage
  content?: string; // Raw content (markdown, text, etc.)
  contentData: Record<string, unknown>; // Structured data for specific content types
  
  // Generation & Validation
  generationSettings: GenerationSettings;
  validationResults: ValidationResults;
  
  // Accessibility
  accessibilityData: {
    altText?: string;
    ariaLabel?: string;
    headingLevel?: number;
    isDecorative: boolean;
  };
  
  // Publishing & References
  isVisible: boolean;
  references: Array<{
    targetId: EntityId;
    targetType: string;
    description: string;
  }>;
  tags: string[];
  
  // Metadata
  version: number;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// ENCOUNTER TYPES
// ============================================================================

export type EncounterType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'mixed';
export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';

export interface EncounterCreature {
  name: string;
  quantity: number;
  challengeRating: ChallengeRating;
  xpValue: number;
  statBlockId?: EntityId; // Reference to StatBlock if custom
  source?: string; // Source book or "custom"
}

export interface Encounter {
  id: EntityId;
  projectId: EntityId;
  chapterId?: EntityId;
  
  name: string;
  description?: string;
  encounterType: EncounterType;
  difficulty: Difficulty;
  
  // Party Configuration
  partySize: number; // 1-8
  partyLevel: number; // 1-20
  
  // Creatures
  creatures: EncounterCreature[];
  
  // XP Budget
  xpBudget: XPBudget;
  
  // Environment & Conditions
  environment: {
    terrain: 'normal' | 'difficult' | 'hazardous';
    lighting: 'bright' | 'dim' | 'dark';
    weather: 'clear' | 'rain' | 'storm' | 'fog' | 'snow';
    temperature: 'frigid' | 'cold' | 'temperate' | 'warm' | 'hot';
    specialConditions: string[];
  };
  
  // Tactical Information
  tactics: {
    setup: string; // Initial positioning
    round1: string; // First round tactics
    subsequentRounds: string; // Ongoing tactics
    retreat: string; // Retreat conditions
    reinforcements: boolean; // Whether reinforcements arrive
  };
  
  // Rewards
  rewards: {
    experience: number; // XP reward (usually automatic)
    treasure: Array<{
      itemId?: EntityId;
      name: string;
      description: string;
      value?: number;
    }>;
    storyRewards: string[]; // Non-mechanical rewards
    information: string[]; // Information gained
  };
  
  // Scaling
  scaling: {
    canScale: boolean;
    minPartySize: number;
    maxPartySize: number;
    minLevel: number;
    maxLevel: number;
    scalingNotes: string;
  };
  
  // Generation & Balance
  generationSettings: GenerationSettings;
  balanceAnalysis: {
    lastAnalyzed?: DateString;
    isBalanced: boolean;
    warnings: string[];
    suggestions: string[];
    difficultyScore: number;
  };
  
  // Usage Statistics
  usageStats: {
    timesUsed: number;
    averageDuration: number; // in minutes
    averagePlayerDeaths: number;
    averageResourcesUsed: number;
    feedback: Array<{
      rating: number; // 1-5
      comment: string;
      timestamp: DateString;
    }>;
  };
  
  // Publishing & Tags
  isPublished: boolean;
  tags: string[];
  
  // Metadata
  version: number;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// STAT BLOCK TYPES
// ============================================================================

export interface StatBlockAttack {
  name: string;
  attackBonus: number;
  damage: string; // e.g., "1d8 + 3 slashing"
  averageDamage: number;
  reach?: number;
  range?: string; // e.g., "30/120 ft."
  description: string;
}

export interface StatBlockAbility {
  name: string;
  description: string;
  recharge?: string; // e.g., "5-6", "Short Rest"
  cost?: number; // For legendary actions
}

export interface StatBlock {
  id: EntityId;
  projectId: EntityId;
  chapterId?: EntityId;
  
  // Basic Information
  name: string;
  size: Size;
  type: string; // creature type (humanoid, beast, etc.)
  subtype?: string; // creature subtype
  alignment: string;
  
  // Defensive Stats
  armorClass: number;
  armorClassSource?: string; // "natural armor", "chain mail", etc.
  hitPoints: number;
  hitDice?: string; // "8d8 + 16"
  speed: string; // "30 ft., fly 60 ft."
  
  // Ability Scores
  abilities: AbilityScores;
  
  // Skills & Saves
  savingThrows: Record<string, number>; // e.g., {"str": 5, "con": 8}
  skills: Record<string, number>; // e.g., {"Perception": 4, "Stealth": 6}
  
  // Resistances & Immunities
  damageVulnerabilities: DamageType[];
  damageResistances: DamageType[];
  damageImmunities: DamageType[];
  conditionImmunities: Condition[];
  
  // Senses & Languages
  senses?: string; // "darkvision 60 ft., passive Perception 14"
  languages?: string; // "Common, Draconic"
  
  // Challenge Rating
  challengeRating: ChallengeRating;
  
  // Abilities & Actions
  specialAbilities: StatBlockAbility[]; // Traits
  actions: StatBlockAbility[];
  reactions: StatBlockAbility[];
  legendaryActions: StatBlockAbility[];
  
  // Combat Statistics (for CR calculation)
  attacks: StatBlockAttack[];
  
  // Source & Attribution
  source?: string;
  isOriginal: boolean;
  
  // Generation & Validation
  generationSettings: GenerationSettings;
  validationResults: ValidationResults & {
    calculatedCR?: ChallengeRating;
  };
  
  // Usage Statistics
  usageStats: {
    timesUsed: number;
    averageEncounterCR: number;
    playerFeedback: Array<{
      rating: number;
      comment: string;
      timestamp: DateString;
    }>;
    balanceNotes: string[];
  };
  
  // Publishing & Tags
  isPublished: boolean;
  tags: string[];
  
  // Metadata
  version: number;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// MAGIC ITEM TYPES
// ============================================================================

export type ItemType = 
  | 'weapon' | 'armor' | 'shield' | 'wondrous item' | 'potion' | 'scroll'
  | 'ring' | 'rod' | 'staff' | 'wand' | 'tool' | 'instrument' | 'vehicle' | 'other';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export type AttunementType = 'none' | 'required' | 'optional';

export interface MagicItemEffect {
  name: string;
  description: string;
  activation?: {
    type: 'passive' | 'action' | 'bonus action' | 'reaction' | 'minute' | 'hour';
    cost: number;
    condition?: string;
    range?: string;
    duration?: string;
    concentration: boolean;
  };
}

export interface MagicItem {
  id: EntityId;
  projectId: EntityId;
  chapterId?: EntityId;
  
  // Basic Information
  name: string;
  itemType: ItemType;
  subtype?: string; // specific weapon/armor type, etc.
  rarity: Rarity;
  estimatedValue?: number; // in gold pieces
  
  // Attunement
  attunementType: AttunementType;
  attunementRequirement?: string; // "by a spellcaster", "by a creature of good alignment", etc.
  
  // Description & Lore
  description: string;
  flavorText?: string;
  
  // Mechanical Effects
  mechanicalEffects: MagicItemEffect[];
  
  // Properties
  properties: {
    charges: boolean;
    maxCharges?: number;
    currentCharges?: number;
    chargeRecovery?: string; // "1d4 + 1 charges daily at dawn"
    cursed: boolean;
    curseDescription?: string;
    sentient: boolean;
    sentientPersonality?: string;
    weight?: number;
    dimensions?: string;
  };
  
  // Combat Statistics (for weapons/armor)
  combatStats: {
    attackBonus?: number;
    damageBonus?: number;
    damageDice?: string;
    damageType?: DamageType;
    armorClassBonus?: number;
    magicBonus?: number; // +1, +2, +3 enhancement
    criticalRange?: number; // 19-20, 18-20, etc.
    specialProperties: string[];
  };
  
  // Source & Attribution
  source?: string;
  isOriginal: boolean;
  
  // Generation & Validation
  generationSettings: GenerationSettings;
  validationResults: ValidationResults & {
    balanceScore: number; // 0-100
  };
  
  // Usage Tracking
  usageStats: {
    timesAwarded: number;
    playerFeedback: Array<{
      rating: number;
      comment: string;
      timestamp: DateString;
    }>;
    balanceIssues: string[];
    popularityScore: number;
  };
  
  // Publishing & Marketplace
  isPublished: boolean;
  marketplaceData?: Record<string, unknown>;
  tags: string[];
  
  // Metadata
  version: number;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// NPC TYPES
// ============================================================================

export type SocialClass = 
  | 'commoner' | 'merchant' | 'artisan' | 'noble' | 'official' | 'clergy' | 'criminal' | 'ruler';

export type WealthLevel = 
  | 'destitute' | 'poor' | 'modest' | 'comfortable' | 'wealthy' | 'aristocratic';

export type PlotRelevance = 'none' | 'minor' | 'moderate' | 'major' | 'critical';

export interface NPCPersonality {
  trait: string; // Primary personality trait
  ideal: string; // Driving ideal or motivation
  bond: string; // Important connection or loyalty
  flaw: string; // Character weakness or flaw
}

export interface NPCVoice {
  accent: string; // 'british', 'irish', 'none', etc.
  pitch: 'very low' | 'low' | 'average' | 'high' | 'very high';
  volume: 'whisper' | 'quiet' | 'normal' | 'loud' | 'booming';
  speechPattern: string; // 'speaks quickly', 'uses big words', etc.
  mannerism: string; // 'taps fingers', 'strokes beard', etc.
  catchphrase?: string;
  vocabulary: 'simple' | 'common' | 'educated' | 'eloquent';
}

export interface NPCInteractionStyle {
  approachability: number; // 1-10 scale
  trustworthiness: number; // 1-10 scale
  helpfulness: number; // 1-10 scale
  patience: number; // 1-10 scale
  humor: number; // 1-10 scale
  intelligence: number; // 1-10 scale (apparent)
}

export interface NPCRelationship {
  targetId: EntityId;
  name: string;
  type: string; // 'friend', 'enemy', 'rival', 'family', etc.
  description: string;
  strength: number; // -5 to +5 scale
  established: DateString;
}

export interface NPCDialogueSample {
  context: string; // 'greeting', 'angry', 'helpful', etc.
  text: string;
}

export interface NPC {
  id: EntityId;
  projectId: EntityId;
  chapterId?: EntityId;
  
  // Basic Identity
  name: string;
  title?: string; // "Lord", "Captain", "Dr.", etc.
  race: string;
  subrace?: string;
  gender?: string;
  age?: number;
  
  // Occupation & Social Status
  occupation: string;
  socialClass: SocialClass;
  faction?: string; // Guild, organization, or faction
  
  // Physical Description
  appearance?: string;
  height?: string;
  weight?: string;
  
  // Personality System
  personality: NPCPersonality;
  voice: NPCVoice;
  interactionStyle: NPCInteractionStyle;
  
  // Dialogue & Interaction
  dialogueSamples: NPCDialogueSample[];
  
  // Background & History
  background?: string;
  secrets: Array<{
    secret: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    knownBy: EntityId[]; // Other NPCs who know this secret
  }>;
  
  // Goals & Motivations
  goals: {
    shortTerm: string[]; // Immediate goals
    longTerm: string[]; // Life goals
    hidden: string[]; // Secret agendas
  };
  
  // Stats & Abilities
  stats?: AbilityScores;
  skills: Record<string, number>; // Skill bonuses for important NPCs
  combatCapable: boolean;
  
  // Location & Availability
  location?: string;
  schedule: Record<string, string>; // Daily/weekly schedule
  
  // Relationships
  relationships: NPCRelationship[];
  
  // Quest & Plot Hooks
  questHooks: Array<{
    title: string;
    description: string;
    type: 'main' | 'side' | 'personal' | 'faction';
    level: number; // Suggested party level
    reward?: string;
  }>;
  plotRelevance: PlotRelevance;
  
  // Resources & Possessions
  wealth: WealthLevel;
  possessions: Array<{
    name: string;
    description: string;
    value?: number;
    magical: boolean;
  }>;
  services: Array<{
    name: string;
    description: string;
    cost?: string;
    availability: string;
  }>;
  
  // Generation & Validation
  generationSettings: GenerationSettings;
  validationResults: ValidationResults & {
    socialCR: number; // Social challenge rating
  };
  
  // Usage & Interaction Tracking
  usageStats: {
    timesEncountered: number;
    playerInteractions: Array<{
      type: string; // 'conversation', 'quest', 'combat', etc.
      outcome: string;
      timestamp: DateString;
    }>;
    questsGiven: number;
    favorability: number; // Player relationship score (-10 to +10)
    memorableQuotes: string[];
  };
  
  // Publishing & Tags
  isPublished: boolean;
  tags: string[];
  
  // Metadata
  version: number;
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory = 
  | 'encounter' | 'npc' | 'location' | 'quest' | 'item' | 'organization' | 'event';

export type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'dice';

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  exampleValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TemplateExample {
  name: string;
  description: string;
  variables: Record<string, unknown>;
  expectedOutput: string;
}

export interface Template {
  id: EntityId;
  
  // Basic Information
  name: string;
  description?: string;
  category: TemplateCategory;
  subcategory?: string;
  
  // Template Content
  content: string; // Template with variable placeholders
  variables: TemplateVariable[];
  
  // Configuration
  configuration: {
    outputFormat: 'markdown' | 'html' | 'json';
    allowCustomization: boolean;
    requiresValidation: boolean;
    autoGenerate: boolean;
  };
  
  // Usage & Compatibility
  compatibleWith: {
    partyLevels: [number, number]; // [min, max]
    partySizes: [number, number]; // [min, max]
    systems: string[]; // ['5e', 'pf2e', etc.]
    themes: string[];
  };
  
  // Authorship & Publishing
  createdBy: UserId;
  isOfficial: boolean;
  isPublic: boolean;
  isPublished: boolean;
  publishedAt?: DateString;
  
  // Quality & Usage
  usageCount: number;
  rating?: number; // 1-5 stars
  ratingCount: number;
  qualityScore: number; // 0-100
  
  // Validation & Quality
  validationResults: ValidationResults;
  
  // Dependencies & Documentation
  dependencies: EntityId[]; // Required templates or resources
  examples: TemplateExample[];
  documentation?: string;
  
  // Marketplace
  marketplaceData?: Record<string, unknown>;
  
  // Tags & Versioning
  tags: string[];
  version: number;
  parentTemplateId?: EntityId; // If this is a variant
  
  // Metadata
  createdAt: DateString;
  updatedAt: DateString;
  deletedAt?: DateString;
}

// ============================================================================
// VERSION CONTROL TYPES
// ============================================================================

export type EntityType = 
  | 'project' | 'chapter' | 'section' | 'encounter' | 'statblock' | 'magicitem' | 'npc' | 'template';

export type ChangeType = 'major' | 'minor' | 'patch' | 'hotfix';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'auto-approved';

export type RetentionPolicy = 'permanent' | 'long-term' | 'medium-term' | 'short-term';

export interface VersionDiff {
  additions: number;
  deletions: number;
  modifications: number;
  details: Array<{
    type: 'addition' | 'deletion' | 'modification';
    line: number;
    content?: string;
    old?: string;
    new?: string;
  }>;
}

export interface Version {
  id: EntityId;
  
  // Entity Reference
  entityType: EntityType;
  entityId: EntityId;
  
  // Version Information
  versionNumber: number; // Sequential: 1, 2, 3, ...
  semanticVersion: string; // "1.2.3"
  
  // Content Snapshot
  content: Record<string, unknown>; // Full content at this version
  contentHash: string; // SHA-256 hash for integrity
  
  // Change Information
  changeType: ChangeType;
  changeDescription?: string;
  diffSummary?: VersionDiff;
  
  // Authorship & Review
  createdBy: UserId;
  reviewStatus: ReviewStatus;
  reviewedBy?: UserId;
  reviewedAt?: DateString;
  reviewNotes?: string;
  
  // Publishing & Deployment
  isPublished: boolean;
  publishedAt?: DateString;
  isActive: boolean; // Currently active version
  
  // Branching & Merging
  branchName: string; // 'main', 'feature-xyz', etc.
  parentVersionId?: EntityId;
  mergeSourceId?: EntityId;
  
  // Backup & Archival
  isBackup: boolean;
  backupReason?: string;
  fullSnapshot?: Record<string, unknown>; // Complete entity state
  
  // Quality & Usage
  validationResults: ValidationResults;
  accessCount: number;
  restoreCount: number;
  
  // Retention & Cleanup
  expiresAt?: DateString;
  retentionPolicy: RetentionPolicy;
  
  // Tags & Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  // Timestamps
  createdAt: DateString;
  updatedAt: DateString;
}

// ============================================================================
// CONTENT BLOCK TYPES (for rich content)
// ============================================================================

export type ContentBlockType = 
  | 'text' | 'statblock' | 'table' | 'boxedtext' | 'sidebar' | 'image' | 'map' | 'handout';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  metadata: Record<string, unknown>;
  styling?: {
    className?: string;
    customCSS?: string;
    layout?: 'full' | 'half' | 'third' | 'quarter';
  };
}

// ============================================================================
// SEARCH & FILTERING TYPES
// ============================================================================

export interface SearchFilters {
  // Content Type Filters
  entityTypes?: EntityType[];
  contentTypes?: ContentBlockType[];
  
  // Difficulty & Level Filters
  challengeRating?: {
    min: ChallengeRating;
    max: ChallengeRating;
  };
  partyLevel?: {
    min: number;
    max: number;
  };
  difficulty?: Difficulty[];
  
  // Content Filters
  rarity?: Rarity[];
  itemTypes?: ItemType[];
  encounterTypes?: EncounterType[];
  
  // Publishing & Quality
  isPublished?: boolean;
  isOfficial?: boolean;
  minRating?: number;
  minUsageCount?: number;
  
  // Tags & Categories
  tags?: string[];
  categories?: string[];
  
  // Date Filters
  createdAfter?: DateString;
  createdBefore?: DateString;
  updatedAfter?: DateString;
  updatedBefore?: DateString;
}

export interface SearchResult<T = unknown> {
  id: EntityId;
  type: EntityType;
  title: string;
  description?: string;
  content: T;
  relevanceScore: number;
  highlights?: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timing?: {
      requestId: string;
      duration: number;
    };
  };
}

export interface PaginatedResponse<T = unknown> extends APIResponse<T[]> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// ============================================================================
// NARRATIVE CONTENT TYPES
// ============================================================================

export interface NarrativeContent {
  id?: EntityId;
  projectId?: EntityId;
  chapterId?: EntityId;
  
  // Content Information
  type: 'descriptive' | 'read-aloud' | 'dm-note' | 'dialogue' | 'environmental';
  title: string;
  content: string;
  readAloudText?: string;
  
  // Formatting & Style
  style?: 'boxed' | 'indented' | 'quote' | 'note';
  homebreweryFormat?: string; // {{descriptive}}, {{note}}, etc.
  
  // Context & Usage
  sceneType?: 'opening' | 'transition' | 'climax' | 'resolution';
  triggerConditions?: string[];
  atmosphere?: 'tense' | 'peaceful' | 'mysterious' | 'dramatic' | 'humorous';
  
  // Generation & Metadata
  generationSettings?: GenerationSettings;
  createdAt?: DateString;
  updatedAt?: DateString;
}

export interface LocationDescription {
  id?: EntityId;
  projectId?: EntityId;
  chapterId?: EntityId;
  
  // Basic Information
  name: string;
  type: 'room' | 'outdoor' | 'building' | 'settlement' | 'dungeon' | 'landmark';
  description: string;
  
  // Environmental Details
  features: string[]; // Notable features, furniture, terrain
  dimensions?: string; // "30 feet by 20 feet, 10-foot-high ceiling"
  lighting?: 'bright' | 'dim' | 'darkness' | 'variable';
  atmosphere?: string; // Mood and feeling of the location
  
  // Interactive Elements
  encounters?: string[]; // Potential encounters in this location
  secrets?: string[]; // Hidden elements, secret doors, etc.
  traps?: string[]; // Trap descriptions or references
  treasure?: string[]; // Treasure descriptions or references
  
  // Navigation & Connections
  exits?: Array<{
    direction: string;
    destination: string;
    description?: string;
  }>;
  mapReference?: string; // Reference to associated map
  
  // Game Mechanics
  skillChallenges?: Array<{
    skill: string;
    dc: number;
    description: string;
  }>;
  environmentalHazards?: string[];
  
  // Generation & Metadata
  generationSettings?: GenerationSettings;
  homebreweryFormat?: string; // Formatted for Homebrewery output
  createdAt?: DateString;
  updatedAt?: DateString;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './content.types';
