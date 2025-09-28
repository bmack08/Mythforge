export type EntityId = string;
export type UserId = string;
export type DateString = string;
export type Size = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export interface AbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}
export type DiceNotation = string;
export type DamageType = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder';
export type Condition = 'blinded' | 'charmed' | 'deafened' | 'frightened' | 'grappled' | 'incapacitated' | 'invisible' | 'paralyzed' | 'petrified' | 'poisoned' | 'prone' | 'restrained' | 'stunned' | 'unconscious';
export type ChallengeRating = 0 | 0.125 | 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;
export interface SystemDesignBudget {
    partySize: number;
    partyLevel: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    encounterIntensity: 'low' | 'medium' | 'high';
    restFrequency: 'frequent' | 'standard' | 'rare';
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: 'low' | 'standard' | 'high';
    magicPrevalence: 'rare' | 'normal' | 'common';
    treasurePace: 'slow' | 'standard' | 'fast';
    tone: 'gritty' | 'balanced' | 'heroic';
    themes: string[];
    setting: string;
    targetLength: 'short' | 'medium' | 'long';
    complexity: 'simple' | 'medium' | 'complex';
}
export interface XPBudget {
    allocated: number;
    used: number;
    baseXP: number;
    adjustedXP: number;
    efficiency: number;
}
export type UsageType = 'personal' | 'sharing' | 'commercial' | 'marketplace';
export type LicenseType = 'ogl' | 'cc' | 'proprietary';
export interface LegalCompliance {
    usageType: UsageType;
    licenseType: LicenseType;
    piFiltered: boolean;
    attributions: string[];
    lastScanned: DateString | null;
    complianceScore: number;
}
export interface GenerationSettings {
    aiGenerated: boolean;
    model: string | null;
    prompt: string | null;
    temperature: number;
    maxTokens: number;
    generatedAt: DateString | null;
    tokensUsed: number;
    cost: number;
}
export interface ValidationResults {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: DateString | null;
}
export interface Project {
    id: EntityId;
    userId: UserId;
    title: string;
    description?: string;
    systemDesignBudget: SystemDesignBudget;
    generationSettings: GenerationSettings;
    legalCompliance: LegalCompliance;
    status: 'draft' | 'generating' | 'complete' | 'published' | 'archived';
    generationProgress?: {
        step: number;
        totalSteps: number;
        percentage: number;
        currentTask: string;
        updatedAt: DateString;
    };
    contentStats: {
        totalPages: number;
        totalWords: number;
        totalEncounters: number;
        totalNPCs: number;
        totalMagicItems: number;
        totalStatBlocks: number;
        estimatedPlayTime: number;
    };
    isPublic: boolean;
    publishedAt?: DateString;
    shareToken: string;
    marketplaceData?: Record<string, unknown>;
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
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type ChapterType = 'introduction' | 'adventure' | 'location' | 'npcs' | 'monsters' | 'items' | 'appendix' | 'handouts' | 'maps' | 'tables' | 'custom';
export interface Chapter {
    id: EntityId;
    projectId: EntityId;
    parentId?: EntityId;
    title: string;
    slug: string;
    description?: string;
    chapterType: ChapterType;
    orderIndex: number;
    level: number;
    content?: string;
    generationPrompt?: string;
    generationSettings: GenerationSettings;
    contentMetadata: {
        wordCount: number;
        estimatedReadTime: number;
        encounterCount: number;
        npcCount: number;
        magicItemCount: number;
        lastAnalyzed?: DateString;
    };
    isVisible: boolean;
    isComplete: boolean;
    dependencies: EntityId[];
    crossReferences: Array<{
        targetId: EntityId;
        targetType: 'chapter' | 'section' | 'npc' | 'encounter';
        description: string;
    }>;
    accessibilityMetadata: {
        hasAltText: boolean;
        hasProperHeadings: boolean;
        colorContrastChecked: boolean;
        screenReaderFriendly: boolean;
        lastAccessibilityCheck?: DateString;
    };
    version: number;
    authorNotes?: string;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type SectionType = 'text' | 'statblock' | 'encounter' | 'magicitem' | 'npc' | 'location' | 'table' | 'boxedtext' | 'sidebar' | 'handout' | 'map' | 'custom';
export interface Section {
    id: EntityId;
    chapterId: EntityId;
    title: string;
    sectionType: SectionType;
    orderIndex: number;
    content?: string;
    contentData: Record<string, unknown>;
    generationSettings: GenerationSettings;
    validationResults: ValidationResults;
    accessibilityData: {
        altText?: string;
        ariaLabel?: string;
        headingLevel?: number;
        isDecorative: boolean;
    };
    isVisible: boolean;
    references: Array<{
        targetId: EntityId;
        targetType: string;
        description: string;
    }>;
    tags: string[];
    version: number;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type EncounterType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'mixed';
export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
export interface EncounterCreature {
    name: string;
    quantity: number;
    challengeRating: ChallengeRating;
    xpValue: number;
    statBlockId?: EntityId;
    source?: string;
}
export interface Encounter {
    id: EntityId;
    projectId: EntityId;
    chapterId?: EntityId;
    name: string;
    description?: string;
    encounterType: EncounterType;
    difficulty: Difficulty;
    partySize: number;
    partyLevel: number;
    creatures: EncounterCreature[];
    xpBudget: XPBudget;
    environment: {
        terrain: 'normal' | 'difficult' | 'hazardous';
        lighting: 'bright' | 'dim' | 'dark';
        weather: 'clear' | 'rain' | 'storm' | 'fog' | 'snow';
        temperature: 'frigid' | 'cold' | 'temperate' | 'warm' | 'hot';
        specialConditions: string[];
    };
    tactics: {
        setup: string;
        round1: string;
        subsequentRounds: string;
        retreat: string;
        reinforcements: boolean;
    };
    rewards: {
        experience: number;
        treasure: Array<{
            itemId?: EntityId;
            name: string;
            description: string;
            value?: number;
        }>;
        storyRewards: string[];
        information: string[];
    };
    scaling: {
        canScale: boolean;
        minPartySize: number;
        maxPartySize: number;
        minLevel: number;
        maxLevel: number;
        scalingNotes: string;
    };
    generationSettings: GenerationSettings;
    balanceAnalysis: {
        lastAnalyzed?: DateString;
        isBalanced: boolean;
        warnings: string[];
        suggestions: string[];
        difficultyScore: number;
    };
    usageStats: {
        timesUsed: number;
        averageDuration: number;
        averagePlayerDeaths: number;
        averageResourcesUsed: number;
        feedback: Array<{
            rating: number;
            comment: string;
            timestamp: DateString;
        }>;
    };
    isPublished: boolean;
    tags: string[];
    version: number;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export interface StatBlockAttack {
    name: string;
    attackBonus: number;
    damage: string;
    averageDamage: number;
    reach?: number;
    range?: string;
    description: string;
}
export interface StatBlockAbility {
    name: string;
    description: string;
    recharge?: string;
    cost?: number;
}
export interface StatBlock {
    id: EntityId;
    projectId: EntityId;
    chapterId?: EntityId;
    name: string;
    size: Size;
    type: string;
    subtype?: string;
    alignment: string;
    armorClass: number;
    armorClassSource?: string;
    hitPoints: number;
    hitDice?: string;
    speed: string;
    abilities: AbilityScores;
    savingThrows: Record<string, number>;
    skills: Record<string, number>;
    damageVulnerabilities: DamageType[];
    damageResistances: DamageType[];
    damageImmunities: DamageType[];
    conditionImmunities: Condition[];
    senses?: string;
    languages?: string;
    challengeRating: ChallengeRating;
    specialAbilities: StatBlockAbility[];
    actions: StatBlockAbility[];
    reactions: StatBlockAbility[];
    legendaryActions: StatBlockAbility[];
    attacks: StatBlockAttack[];
    source?: string;
    isOriginal: boolean;
    generationSettings: GenerationSettings;
    validationResults: ValidationResults & {
        calculatedCR?: ChallengeRating;
    };
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
    isPublished: boolean;
    tags: string[];
    version: number;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type ItemType = 'weapon' | 'armor' | 'shield' | 'wondrous item' | 'potion' | 'scroll' | 'ring' | 'rod' | 'staff' | 'wand' | 'tool' | 'instrument' | 'vehicle' | 'other';
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
    name: string;
    itemType: ItemType;
    subtype?: string;
    rarity: Rarity;
    estimatedValue?: number;
    attunementType: AttunementType;
    attunementRequirement?: string;
    description: string;
    flavorText?: string;
    mechanicalEffects: MagicItemEffect[];
    properties: {
        charges: boolean;
        maxCharges?: number;
        currentCharges?: number;
        chargeRecovery?: string;
        cursed: boolean;
        curseDescription?: string;
        sentient: boolean;
        sentientPersonality?: string;
        weight?: number;
        dimensions?: string;
    };
    combatStats: {
        attackBonus?: number;
        damageBonus?: number;
        damageDice?: string;
        damageType?: DamageType;
        armorClassBonus?: number;
        magicBonus?: number;
        criticalRange?: number;
        specialProperties: string[];
    };
    source?: string;
    isOriginal: boolean;
    generationSettings: GenerationSettings;
    validationResults: ValidationResults & {
        balanceScore: number;
    };
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
    isPublished: boolean;
    marketplaceData?: Record<string, unknown>;
    tags: string[];
    version: number;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type SocialClass = 'commoner' | 'merchant' | 'artisan' | 'noble' | 'official' | 'clergy' | 'criminal' | 'ruler';
export type WealthLevel = 'destitute' | 'poor' | 'modest' | 'comfortable' | 'wealthy' | 'aristocratic';
export type PlotRelevance = 'none' | 'minor' | 'moderate' | 'major' | 'critical';
export interface NPCPersonality {
    trait: string;
    ideal: string;
    bond: string;
    flaw: string;
}
export interface NPCVoice {
    accent: string;
    pitch: 'very low' | 'low' | 'average' | 'high' | 'very high';
    volume: 'whisper' | 'quiet' | 'normal' | 'loud' | 'booming';
    speechPattern: string;
    mannerism: string;
    catchphrase?: string;
    vocabulary: 'simple' | 'common' | 'educated' | 'eloquent';
}
export interface NPCInteractionStyle {
    approachability: number;
    trustworthiness: number;
    helpfulness: number;
    patience: number;
    humor: number;
    intelligence: number;
}
export interface NPCRelationship {
    targetId: EntityId;
    name: string;
    type: string;
    description: string;
    strength: number;
    established: DateString;
}
export interface NPCDialogueSample {
    context: string;
    text: string;
}
export interface NPC {
    id: EntityId;
    projectId: EntityId;
    chapterId?: EntityId;
    name: string;
    title?: string;
    race: string;
    subrace?: string;
    gender?: string;
    age?: number;
    occupation: string;
    socialClass: SocialClass;
    faction?: string;
    appearance?: string;
    height?: string;
    weight?: string;
    personality: NPCPersonality;
    voice: NPCVoice;
    interactionStyle: NPCInteractionStyle;
    dialogueSamples: NPCDialogueSample[];
    background?: string;
    secrets: Array<{
        secret: string;
        severity: 'minor' | 'moderate' | 'major' | 'critical';
        knownBy: EntityId[];
    }>;
    goals: {
        shortTerm: string[];
        longTerm: string[];
        hidden: string[];
    };
    stats?: AbilityScores;
    skills: Record<string, number>;
    combatCapable: boolean;
    location?: string;
    schedule: Record<string, string>;
    relationships: NPCRelationship[];
    questHooks: Array<{
        title: string;
        description: string;
        type: 'main' | 'side' | 'personal' | 'faction';
        level: number;
        reward?: string;
    }>;
    plotRelevance: PlotRelevance;
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
    generationSettings: GenerationSettings;
    validationResults: ValidationResults & {
        socialCR: number;
    };
    usageStats: {
        timesEncountered: number;
        playerInteractions: Array<{
            type: string;
            outcome: string;
            timestamp: DateString;
        }>;
        questsGiven: number;
        favorability: number;
        memorableQuotes: string[];
    };
    isPublished: boolean;
    tags: string[];
    version: number;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type TemplateCategory = 'encounter' | 'npc' | 'location' | 'quest' | 'item' | 'organization' | 'event';
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
    name: string;
    description?: string;
    category: TemplateCategory;
    subcategory?: string;
    content: string;
    variables: TemplateVariable[];
    configuration: {
        outputFormat: 'markdown' | 'html' | 'json';
        allowCustomization: boolean;
        requiresValidation: boolean;
        autoGenerate: boolean;
    };
    compatibleWith: {
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
        themes: string[];
    };
    createdBy: UserId;
    isOfficial: boolean;
    isPublic: boolean;
    isPublished: boolean;
    publishedAt?: DateString;
    usageCount: number;
    rating?: number;
    ratingCount: number;
    qualityScore: number;
    validationResults: ValidationResults;
    dependencies: EntityId[];
    examples: TemplateExample[];
    documentation?: string;
    marketplaceData?: Record<string, unknown>;
    tags: string[];
    version: number;
    parentTemplateId?: EntityId;
    createdAt: DateString;
    updatedAt: DateString;
    deletedAt?: DateString;
}
export type EntityType = 'project' | 'chapter' | 'section' | 'encounter' | 'statblock' | 'magicitem' | 'npc' | 'template';
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
    entityType: EntityType;
    entityId: EntityId;
    versionNumber: number;
    semanticVersion: string;
    content: Record<string, unknown>;
    contentHash: string;
    changeType: ChangeType;
    changeDescription?: string;
    diffSummary?: VersionDiff;
    createdBy: UserId;
    reviewStatus: ReviewStatus;
    reviewedBy?: UserId;
    reviewedAt?: DateString;
    reviewNotes?: string;
    isPublished: boolean;
    publishedAt?: DateString;
    isActive: boolean;
    branchName: string;
    parentVersionId?: EntityId;
    mergeSourceId?: EntityId;
    isBackup: boolean;
    backupReason?: string;
    fullSnapshot?: Record<string, unknown>;
    validationResults: ValidationResults;
    accessCount: number;
    restoreCount: number;
    expiresAt?: DateString;
    retentionPolicy: RetentionPolicy;
    tags: string[];
    metadata: Record<string, unknown>;
    createdAt: DateString;
    updatedAt: DateString;
}
export type ContentBlockType = 'text' | 'statblock' | 'table' | 'boxedtext' | 'sidebar' | 'image' | 'map' | 'handout';
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
export interface SearchFilters {
    entityTypes?: EntityType[];
    contentTypes?: ContentBlockType[];
    challengeRating?: {
        min: ChallengeRating;
        max: ChallengeRating;
    };
    partyLevel?: {
        min: number;
        max: number;
    };
    difficulty?: Difficulty[];
    rarity?: Rarity[];
    itemTypes?: ItemType[];
    encounterTypes?: EncounterType[];
    isPublished?: boolean;
    isOfficial?: boolean;
    minRating?: number;
    minUsageCount?: number;
    tags?: string[];
    categories?: string[];
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
export * from './content.types';
//# sourceMappingURL=content.types.d.ts.map