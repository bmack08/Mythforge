// Mythwright Content Validation Schemas - Zod schemas for runtime validation
import { z } from 'zod';
// ============================================================================
// BASE SCHEMAS & VALIDATORS
// ============================================================================
// Entity ID validation (nanoid format)
export const EntityIdSchema = z.string().length(12).regex(/^[A-Za-z0-9_-]+$/);
export const UserIdSchema = z.string().min(1).max(255);
export const DateStringSchema = z.string().datetime();
// Size categories
export const SizeSchema = z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']);
// Ability scores (3-30 range for D&D)
export const AbilityScoreSchema = z.number().int().min(1).max(30);
export const AbilityScoresSchema = z.object({
    str: AbilityScoreSchema,
    dex: AbilityScoreSchema,
    con: AbilityScoreSchema,
    int: AbilityScoreSchema,
    wis: AbilityScoreSchema,
    cha: AbilityScoreSchema,
});
// Dice notation validation
export const DiceNotationSchema = z.string().regex(/^\d+d\d+([+-]\d+)?$/);
// Damage types
export const DamageTypeSchema = z.enum([
    'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
    'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
]);
// Conditions
export const ConditionSchema = z.enum([
    'blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated',
    'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained',
    'stunned', 'unconscious'
]);
// Challenge Rating (includes fractional CRs)
export const ChallengeRatingSchema = z.union([
    z.literal(0), z.literal(0.125), z.literal(0.25), z.literal(0.5),
    z.number().int().min(1).max(30)
]);
// ============================================================================
// SYSTEM DESIGN BUDGET SCHEMAS
// ============================================================================
export const SystemDesignBudgetSchema = z.object({
    // Party Configuration
    partySize: z.number().int().min(1).max(8),
    partyLevel: z.number().int().min(1).max(20),
    // Difficulty & Pacing
    difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']),
    encounterIntensity: z.enum(['low', 'medium', 'high']),
    restFrequency: z.enum(['frequent', 'standard', 'rare']),
    // Content Preferences (must sum to 100)
    combatWeight: z.number().int().min(0).max(100),
    explorationWeight: z.number().int().min(0).max(100),
    socialWeight: z.number().int().min(0).max(100),
    // Treasure & Magic
    treasureLevel: z.enum(['low', 'standard', 'high']),
    magicPrevalence: z.enum(['rare', 'normal', 'common']),
    treasurePace: z.enum(['slow', 'standard', 'fast']),
    // Tone & Theme
    tone: z.enum(['gritty', 'balanced', 'heroic']),
    themes: z.array(z.string()).default([]),
    setting: z.string().default(''),
    // Technical Settings
    targetLength: z.enum(['short', 'medium', 'long']),
    complexity: z.enum(['simple', 'medium', 'complex']),
}).refine((data) => {
    // Validate that content weights sum to 100
    return data.combatWeight + data.explorationWeight + data.socialWeight === 100;
}, {
    message: "Combat, exploration, and social weights must sum to 100",
    path: ["combatWeight"]
});
export const XPBudgetSchema = z.object({
    allocated: z.number().min(0),
    used: z.number().min(0),
    baseXP: z.number().min(0),
    adjustedXP: z.number().min(0),
    efficiency: z.number().min(0).max(100),
});
// ============================================================================
// LEGAL COMPLIANCE SCHEMAS
// ============================================================================
export const UsageTypeSchema = z.enum(['personal', 'sharing', 'commercial', 'marketplace']);
export const LicenseTypeSchema = z.enum(['ogl', 'cc', 'proprietary']);
export const LegalComplianceSchema = z.object({
    usageType: UsageTypeSchema,
    licenseType: LicenseTypeSchema,
    piFiltered: z.boolean(),
    attributions: z.array(z.string()),
    lastScanned: DateStringSchema.nullable(),
    complianceScore: z.number().int().min(0).max(100),
});
// ============================================================================
// CONTENT GENERATION SCHEMAS
// ============================================================================
export const GenerationSettingsSchema = z.object({
    aiGenerated: z.boolean(),
    model: z.string().nullable(),
    prompt: z.string().nullable(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().positive(),
    generatedAt: DateStringSchema.nullable(),
    tokensUsed: z.number().int().min(0),
    cost: z.number().min(0),
});
export const ValidationResultsSchema = z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    lastValidated: DateStringSchema.nullable(),
});
// ============================================================================
// PROJECT SCHEMAS
// ============================================================================
export const ProjectStatusSchema = z.enum(['draft', 'generating', 'complete', 'published', 'archived']);
export const ProjectSchema = z.object({
    id: EntityIdSchema,
    userId: UserIdSchema,
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    // Core configuration
    systemDesignBudget: SystemDesignBudgetSchema,
    generationSettings: GenerationSettingsSchema,
    legalCompliance: LegalComplianceSchema,
    // Status & Progress
    status: ProjectStatusSchema,
    generationProgress: z.object({
        step: z.number().int().positive(),
        totalSteps: z.number().int().positive(),
        percentage: z.number().int().min(0).max(100),
        currentTask: z.string(),
        updatedAt: DateStringSchema,
    }).optional(),
    // Content Statistics
    contentStats: z.object({
        totalPages: z.number().int().min(0),
        totalWords: z.number().int().min(0),
        totalEncounters: z.number().int().min(0),
        totalNPCs: z.number().int().min(0),
        totalMagicItems: z.number().int().min(0),
        totalStatBlocks: z.number().int().min(0),
        estimatedPlayTime: z.number().min(0),
    }),
    // Publishing & Sharing
    isPublic: z.boolean(),
    publishedAt: DateStringSchema.optional(),
    shareToken: z.string(),
    marketplaceData: z.record(z.unknown()).optional(),
    // Metadata
    version: z.number().int().positive(),
    aiMetadata: z.object({
        totalTokensUsed: z.number().int().min(0),
        totalCost: z.number().min(0),
        generationHistory: z.array(z.object({
            timestamp: DateStringSchema,
            model: z.string(),
            tokensUsed: z.number().int().min(0),
            cost: z.number().min(0),
        })),
        lastGenerated: DateStringSchema.optional(),
    }),
    // Timestamps
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// CHAPTER & SECTION SCHEMAS
// ============================================================================
export const ChapterTypeSchema = z.enum([
    'introduction', 'adventure', 'location', 'npcs', 'monsters',
    'items', 'appendix', 'handouts', 'maps', 'tables', 'custom'
]);
export const ChapterSchema = z.object({
    id: EntityIdSchema,
    projectId: EntityIdSchema,
    parentId: EntityIdSchema.optional(),
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().optional(),
    chapterType: ChapterTypeSchema,
    // Hierarchy & Ordering
    orderIndex: z.number().int().min(0),
    level: z.number().int().min(1).max(6),
    // Content
    content: z.string().optional(),
    generationPrompt: z.string().optional(),
    generationSettings: GenerationSettingsSchema,
    // Metadata
    contentMetadata: z.object({
        wordCount: z.number().int().min(0),
        estimatedReadTime: z.number().min(0),
        encounterCount: z.number().int().min(0),
        npcCount: z.number().int().min(0),
        magicItemCount: z.number().int().min(0),
        lastAnalyzed: DateStringSchema.optional(),
    }),
    // Publishing & Visibility
    isVisible: z.boolean(),
    isComplete: z.boolean(),
    // Cross-references and dependencies
    dependencies: z.array(EntityIdSchema),
    crossReferences: z.array(z.object({
        targetId: EntityIdSchema,
        targetType: z.enum(['chapter', 'section', 'npc', 'encounter']),
        description: z.string(),
    })),
    // Accessibility
    accessibilityMetadata: z.object({
        hasAltText: z.boolean(),
        hasProperHeadings: z.boolean(),
        colorContrastChecked: z.boolean(),
        screenReaderFriendly: z.boolean(),
        lastAccessibilityCheck: DateStringSchema.optional(),
    }),
    // Metadata
    version: z.number().int().positive(),
    authorNotes: z.string().optional(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
export const SectionTypeSchema = z.enum([
    'text', 'statblock', 'encounter', 'magicitem', 'npc', 'location',
    'table', 'boxedtext', 'sidebar', 'handout', 'map', 'custom'
]);
export const SectionSchema = z.object({
    id: EntityIdSchema,
    chapterId: EntityIdSchema,
    title: z.string().min(1).max(255),
    sectionType: SectionTypeSchema,
    orderIndex: z.number().int().min(0),
    // Content Storage
    content: z.string().optional(),
    contentData: z.record(z.unknown()),
    // Generation & Validation
    generationSettings: GenerationSettingsSchema,
    validationResults: ValidationResultsSchema,
    // Accessibility
    accessibilityData: z.object({
        altText: z.string().optional(),
        ariaLabel: z.string().optional(),
        headingLevel: z.number().int().min(1).max(6).optional(),
        isDecorative: z.boolean(),
    }),
    // Publishing & References
    isVisible: z.boolean(),
    references: z.array(z.object({
        targetId: EntityIdSchema,
        targetType: z.string(),
        description: z.string(),
    })),
    tags: z.array(z.string()),
    // Metadata
    version: z.number().int().positive(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// ENCOUNTER SCHEMAS
// ============================================================================
export const EncounterTypeSchema = z.enum(['combat', 'social', 'exploration', 'puzzle', 'mixed']);
export const DifficultySchema = z.enum(['trivial', 'easy', 'medium', 'hard', 'deadly']);
export const EncounterCreatureSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    challengeRating: ChallengeRatingSchema,
    xpValue: z.number().int().min(0),
    statBlockId: EntityIdSchema.optional(),
    source: z.string().optional(),
});
export const EncounterSchema = z.object({
    id: EntityIdSchema,
    projectId: EntityIdSchema,
    chapterId: EntityIdSchema.optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    encounterType: EncounterTypeSchema,
    difficulty: DifficultySchema,
    // Party Configuration
    partySize: z.number().int().min(1).max(8),
    partyLevel: z.number().int().min(1).max(20),
    // Creatures
    creatures: z.array(EncounterCreatureSchema),
    // XP Budget
    xpBudget: XPBudgetSchema,
    // Environment & Conditions
    environment: z.object({
        terrain: z.enum(['normal', 'difficult', 'hazardous']),
        lighting: z.enum(['bright', 'dim', 'dark']),
        weather: z.enum(['clear', 'rain', 'storm', 'fog', 'snow']),
        temperature: z.enum(['frigid', 'cold', 'temperate', 'warm', 'hot']),
        specialConditions: z.array(z.string()),
    }),
    // Tactical Information
    tactics: z.object({
        setup: z.string(),
        round1: z.string(),
        subsequentRounds: z.string(),
        retreat: z.string(),
        reinforcements: z.boolean(),
    }),
    // Rewards
    rewards: z.object({
        experience: z.number().int().min(0),
        treasure: z.array(z.object({
            itemId: EntityIdSchema.optional(),
            name: z.string(),
            description: z.string(),
            value: z.number().optional(),
        })),
        storyRewards: z.array(z.string()),
        information: z.array(z.string()),
    }),
    // Scaling
    scaling: z.object({
        canScale: z.boolean(),
        minPartySize: z.number().int().min(1).max(8),
        maxPartySize: z.number().int().min(1).max(8),
        minLevel: z.number().int().min(1).max(20),
        maxLevel: z.number().int().min(1).max(20),
        scalingNotes: z.string(),
    }).refine((data) => {
        return data.minPartySize <= data.maxPartySize && data.minLevel <= data.maxLevel;
    }, {
        message: "Min values must be less than or equal to max values"
    }),
    // Generation & Balance
    generationSettings: GenerationSettingsSchema,
    balanceAnalysis: z.object({
        lastAnalyzed: DateStringSchema.optional(),
        isBalanced: z.boolean(),
        warnings: z.array(z.string()),
        suggestions: z.array(z.string()),
        difficultyScore: z.number().min(0),
    }),
    // Usage Statistics
    usageStats: z.object({
        timesUsed: z.number().int().min(0),
        averageDuration: z.number().min(0),
        averagePlayerDeaths: z.number().min(0),
        averageResourcesUsed: z.number().min(0),
        feedback: z.array(z.object({
            rating: z.number().int().min(1).max(5),
            comment: z.string(),
            timestamp: DateStringSchema,
        })),
    }),
    // Publishing & Tags
    isPublished: z.boolean(),
    tags: z.array(z.string()),
    // Metadata
    version: z.number().int().positive(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// STAT BLOCK SCHEMAS
// ============================================================================
export const StatBlockAttackSchema = z.object({
    name: z.string().min(1),
    attackBonus: z.number().int(),
    damage: z.string().min(1),
    averageDamage: z.number().min(0),
    reach: z.number().int().positive().optional(),
    range: z.string().optional(),
    description: z.string(),
});
export const StatBlockAbilitySchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    recharge: z.string().optional(),
    cost: z.number().int().positive().optional(),
});
export const StatBlockSchema = z.object({
    id: EntityIdSchema,
    projectId: EntityIdSchema,
    chapterId: EntityIdSchema.optional(),
    // Basic Information
    name: z.string().min(1).max(255),
    size: SizeSchema,
    type: z.string().min(1),
    subtype: z.string().optional(),
    alignment: z.string().min(1),
    // Defensive Stats
    armorClass: z.number().int().min(1).max(30),
    armorClassSource: z.string().optional(),
    hitPoints: z.number().int().positive(),
    hitDice: z.string().optional(),
    speed: z.string().min(1),
    // Ability Scores
    abilities: AbilityScoresSchema,
    // Skills & Saves
    savingThrows: z.record(z.number().int()),
    skills: z.record(z.number().int()),
    // Resistances & Immunities
    damageVulnerabilities: z.array(DamageTypeSchema),
    damageResistances: z.array(DamageTypeSchema),
    damageImmunities: z.array(DamageTypeSchema),
    conditionImmunities: z.array(ConditionSchema),
    // Senses & Languages
    senses: z.string().optional(),
    languages: z.string().optional(),
    // Challenge Rating
    challengeRating: ChallengeRatingSchema,
    // Abilities & Actions
    specialAbilities: z.array(StatBlockAbilitySchema),
    actions: z.array(StatBlockAbilitySchema),
    reactions: z.array(StatBlockAbilitySchema),
    legendaryActions: z.array(StatBlockAbilitySchema),
    // Combat Statistics
    attacks: z.array(StatBlockAttackSchema),
    // Source & Attribution
    source: z.string().optional(),
    isOriginal: z.boolean(),
    // Generation & Validation
    generationSettings: GenerationSettingsSchema,
    validationResults: ValidationResultsSchema.extend({
        calculatedCR: ChallengeRatingSchema.optional(),
    }),
    // Usage Statistics
    usageStats: z.object({
        timesUsed: z.number().int().min(0),
        averageEncounterCR: z.number().min(0),
        playerFeedback: z.array(z.object({
            rating: z.number().int().min(1).max(5),
            comment: z.string(),
            timestamp: DateStringSchema,
        })),
        balanceNotes: z.array(z.string()),
    }),
    // Publishing & Tags
    isPublished: z.boolean(),
    tags: z.array(z.string()),
    // Metadata
    version: z.number().int().positive(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// MAGIC ITEM SCHEMAS
// ============================================================================
export const ItemTypeSchema = z.enum([
    'weapon', 'armor', 'shield', 'wondrous item', 'potion', 'scroll',
    'ring', 'rod', 'staff', 'wand', 'tool', 'instrument', 'vehicle', 'other'
]);
export const RaritySchema = z.enum(['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']);
export const AttunementTypeSchema = z.enum(['none', 'required', 'optional']);
export const MagicItemEffectSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    activation: z.object({
        type: z.enum(['passive', 'action', 'bonus action', 'reaction', 'minute', 'hour']),
        cost: z.number().int().positive(),
        condition: z.string().optional(),
        range: z.string().optional(),
        duration: z.string().optional(),
        concentration: z.boolean(),
    }).optional(),
});
export const MagicItemSchema = z.object({
    id: EntityIdSchema,
    projectId: EntityIdSchema,
    chapterId: EntityIdSchema.optional(),
    // Basic Information
    name: z.string().min(1).max(255),
    itemType: ItemTypeSchema,
    subtype: z.string().optional(),
    rarity: RaritySchema,
    estimatedValue: z.number().int().positive().optional(),
    // Attunement
    attunementType: AttunementTypeSchema,
    attunementRequirement: z.string().optional(),
    // Description & Lore
    description: z.string().min(1),
    flavorText: z.string().optional(),
    // Mechanical Effects
    mechanicalEffects: z.array(MagicItemEffectSchema),
    // Properties
    properties: z.object({
        charges: z.boolean(),
        maxCharges: z.number().int().positive().optional(),
        currentCharges: z.number().int().min(0).optional(),
        chargeRecovery: z.string().optional(),
        cursed: z.boolean(),
        curseDescription: z.string().optional(),
        sentient: z.boolean(),
        sentientPersonality: z.string().optional(),
        weight: z.number().positive().optional(),
        dimensions: z.string().optional(),
    }).refine((data) => {
        // If charges is true, maxCharges should be provided
        if (data.charges && !data.maxCharges) {
            return false;
        }
        // Current charges shouldn't exceed max charges
        if (data.currentCharges && data.maxCharges && data.currentCharges > data.maxCharges) {
            return false;
        }
        return true;
    }, {
        message: "Invalid charge configuration"
    }),
    // Combat Statistics
    combatStats: z.object({
        attackBonus: z.number().int().optional(),
        damageBonus: z.number().int().optional(),
        damageDice: z.string().optional(),
        damageType: DamageTypeSchema.optional(),
        armorClassBonus: z.number().int().optional(),
        magicBonus: z.number().int().min(1).max(3).optional(),
        criticalRange: z.number().int().min(18).max(20).optional(),
        specialProperties: z.array(z.string()),
    }),
    // Source & Attribution
    source: z.string().optional(),
    isOriginal: z.boolean(),
    // Generation & Validation
    generationSettings: GenerationSettingsSchema,
    validationResults: ValidationResultsSchema.extend({
        balanceScore: z.number().int().min(0).max(100),
    }),
    // Usage Tracking
    usageStats: z.object({
        timesAwarded: z.number().int().min(0),
        playerFeedback: z.array(z.object({
            rating: z.number().int().min(1).max(5),
            comment: z.string(),
            timestamp: DateStringSchema,
        })),
        balanceIssues: z.array(z.string()),
        popularityScore: z.number().min(0),
    }),
    // Publishing & Marketplace
    isPublished: z.boolean(),
    marketplaceData: z.record(z.unknown()).optional(),
    tags: z.array(z.string()),
    // Metadata
    version: z.number().int().positive(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// NPC SCHEMAS
// ============================================================================
export const SocialClassSchema = z.enum([
    'commoner', 'merchant', 'artisan', 'noble', 'official', 'clergy', 'criminal', 'ruler'
]);
export const WealthLevelSchema = z.enum([
    'destitute', 'poor', 'modest', 'comfortable', 'wealthy', 'aristocratic'
]);
export const PlotRelevanceSchema = z.enum(['none', 'minor', 'moderate', 'major', 'critical']);
export const NPCPersonalitySchema = z.object({
    trait: z.string().min(1),
    ideal: z.string().min(1),
    bond: z.string().min(1),
    flaw: z.string().min(1),
});
export const NPCVoiceSchema = z.object({
    accent: z.string().min(1),
    pitch: z.enum(['very low', 'low', 'average', 'high', 'very high']),
    volume: z.enum(['whisper', 'quiet', 'normal', 'loud', 'booming']),
    speechPattern: z.string().min(1),
    mannerism: z.string().min(1),
    catchphrase: z.string().optional(),
    vocabulary: z.enum(['simple', 'common', 'educated', 'eloquent']),
});
export const NPCInteractionStyleSchema = z.object({
    approachability: z.number().int().min(1).max(10),
    trustworthiness: z.number().int().min(1).max(10),
    helpfulness: z.number().int().min(1).max(10),
    patience: z.number().int().min(1).max(10),
    humor: z.number().int().min(1).max(10),
    intelligence: z.number().int().min(1).max(10),
});
export const NPCRelationshipSchema = z.object({
    targetId: EntityIdSchema,
    name: z.string().min(1),
    type: z.string().min(1),
    description: z.string().min(1),
    strength: z.number().int().min(-5).max(5),
    established: DateStringSchema,
});
export const NPCDialogueSampleSchema = z.object({
    context: z.string().min(1),
    text: z.string().min(1),
});
export const NPCSchema = z.object({
    id: EntityIdSchema,
    projectId: EntityIdSchema,
    chapterId: EntityIdSchema.optional(),
    // Basic Identity
    name: z.string().min(1).max(255),
    title: z.string().optional(),
    race: z.string().min(1),
    subrace: z.string().optional(),
    gender: z.string().optional(),
    age: z.number().int().positive().optional(),
    // Occupation & Social Status
    occupation: z.string().min(1),
    socialClass: SocialClassSchema,
    faction: z.string().optional(),
    // Physical Description
    appearance: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    // Personality System
    personality: NPCPersonalitySchema,
    voice: NPCVoiceSchema,
    interactionStyle: NPCInteractionStyleSchema,
    // Dialogue & Interaction
    dialogueSamples: z.array(NPCDialogueSampleSchema),
    // Background & History
    background: z.string().optional(),
    secrets: z.array(z.object({
        secret: z.string().min(1),
        severity: z.enum(['minor', 'moderate', 'major', 'critical']),
        knownBy: z.array(EntityIdSchema),
    })),
    // Goals & Motivations
    goals: z.object({
        shortTerm: z.array(z.string()),
        longTerm: z.array(z.string()),
        hidden: z.array(z.string()),
    }),
    // Stats & Abilities
    stats: AbilityScoresSchema.optional(),
    skills: z.record(z.number().int()),
    combatCapable: z.boolean(),
    // Location & Availability
    location: z.string().optional(),
    schedule: z.record(z.string()),
    // Relationships
    relationships: z.array(NPCRelationshipSchema),
    // Quest & Plot Hooks
    questHooks: z.array(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(['main', 'side', 'personal', 'faction']),
        level: z.number().int().min(1).max(20),
        reward: z.string().optional(),
    })),
    plotRelevance: PlotRelevanceSchema,
    // Resources & Possessions
    wealth: WealthLevelSchema,
    possessions: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        value: z.number().positive().optional(),
        magical: z.boolean(),
    })),
    services: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        cost: z.string().optional(),
        availability: z.string().min(1),
    })),
    // Generation & Validation
    generationSettings: GenerationSettingsSchema,
    validationResults: ValidationResultsSchema.extend({
        socialCR: z.number().min(0),
    }),
    // Usage & Interaction Tracking
    usageStats: z.object({
        timesEncountered: z.number().int().min(0),
        playerInteractions: z.array(z.object({
            type: z.string().min(1),
            outcome: z.string().min(1),
            timestamp: DateStringSchema,
        })),
        questsGiven: z.number().int().min(0),
        favorability: z.number().int().min(-10).max(10),
        memorableQuotes: z.array(z.string()),
    }),
    // Publishing & Tags
    isPublished: z.boolean(),
    tags: z.array(z.string()),
    // Metadata
    version: z.number().int().positive(),
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// TEMPLATE SCHEMAS
// ============================================================================
export const TemplateCategorySchema = z.enum([
    'encounter', 'npc', 'location', 'quest', 'item', 'organization', 'event'
]);
export const VariableTypeSchema = z.enum(['string', 'number', 'boolean', 'array', 'object', 'dice']);
export const TemplateVariableSchema = z.object({
    name: z.string().min(1).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/), // Valid variable name
    type: VariableTypeSchema,
    description: z.string().min(1),
    required: z.boolean(),
    defaultValue: z.unknown().optional(),
    exampleValue: z.unknown().optional(),
    validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        options: z.array(z.string()).optional(),
    }).optional(),
});
export const TemplateExampleSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    variables: z.record(z.unknown()),
    expectedOutput: z.string().min(1),
});
export const TemplateSchema = z.object({
    id: EntityIdSchema,
    // Basic Information
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    category: TemplateCategorySchema,
    subcategory: z.string().optional(),
    // Template Content
    content: z.string().min(1),
    variables: z.array(TemplateVariableSchema),
    // Configuration
    configuration: z.object({
        outputFormat: z.enum(['markdown', 'html', 'json']),
        allowCustomization: z.boolean(),
        requiresValidation: z.boolean(),
        autoGenerate: z.boolean(),
    }),
    // Usage & Compatibility
    compatibleWith: z.object({
        partyLevels: z.tuple([z.number().int().min(1).max(20), z.number().int().min(1).max(20)]),
        partySizes: z.tuple([z.number().int().min(1).max(8), z.number().int().min(1).max(8)]),
        systems: z.array(z.string()),
        themes: z.array(z.string()),
    }).refine((data) => {
        return data.partyLevels[0] <= data.partyLevels[1] && data.partySizes[0] <= data.partySizes[1];
    }, {
        message: "Min values must be less than or equal to max values"
    }),
    // Authorship & Publishing
    createdBy: UserIdSchema,
    isOfficial: z.boolean(),
    isPublic: z.boolean(),
    isPublished: z.boolean(),
    publishedAt: DateStringSchema.optional(),
    // Quality & Usage
    usageCount: z.number().int().min(0),
    rating: z.number().min(1).max(5).optional(),
    ratingCount: z.number().int().min(0),
    qualityScore: z.number().int().min(0).max(100),
    // Validation & Quality
    validationResults: ValidationResultsSchema,
    // Dependencies & Documentation
    dependencies: z.array(EntityIdSchema),
    examples: z.array(TemplateExampleSchema),
    documentation: z.string().optional(),
    // Marketplace
    marketplaceData: z.record(z.unknown()).optional(),
    // Tags & Versioning
    tags: z.array(z.string()),
    version: z.number().int().positive(),
    parentTemplateId: EntityIdSchema.optional(),
    // Metadata
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
    deletedAt: DateStringSchema.optional(),
});
// ============================================================================
// VERSION CONTROL SCHEMAS
// ============================================================================
export const EntityTypeSchema = z.enum([
    'project', 'chapter', 'section', 'encounter', 'statblock', 'magicitem', 'npc', 'template'
]);
export const ChangeTypeSchema = z.enum(['major', 'minor', 'patch', 'hotfix']);
export const ReviewStatusSchema = z.enum(['pending', 'approved', 'rejected', 'auto-approved']);
export const RetentionPolicySchema = z.enum(['permanent', 'long-term', 'medium-term', 'short-term']);
export const VersionDiffSchema = z.object({
    additions: z.number().int().min(0),
    deletions: z.number().int().min(0),
    modifications: z.number().int().min(0),
    details: z.array(z.object({
        type: z.enum(['addition', 'deletion', 'modification']),
        line: z.number().int().positive(),
        content: z.string().optional(),
        old: z.string().optional(),
        new: z.string().optional(),
    })),
});
export const VersionSchema = z.object({
    id: EntityIdSchema,
    // Entity Reference
    entityType: EntityTypeSchema,
    entityId: EntityIdSchema,
    // Version Information
    versionNumber: z.number().int().positive(),
    semanticVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    // Content Snapshot
    content: z.record(z.unknown()),
    contentHash: z.string().length(16),
    // Change Information
    changeType: ChangeTypeSchema,
    changeDescription: z.string().optional(),
    diffSummary: VersionDiffSchema.optional(),
    // Authorship & Review
    createdBy: UserIdSchema,
    reviewStatus: ReviewStatusSchema,
    reviewedBy: UserIdSchema.optional(),
    reviewedAt: DateStringSchema.optional(),
    reviewNotes: z.string().optional(),
    // Publishing & Deployment
    isPublished: z.boolean(),
    publishedAt: DateStringSchema.optional(),
    isActive: z.boolean(),
    // Branching & Merging
    branchName: z.string().min(1),
    parentVersionId: EntityIdSchema.optional(),
    mergeSourceId: EntityIdSchema.optional(),
    // Backup & Archival
    isBackup: z.boolean(),
    backupReason: z.string().optional(),
    fullSnapshot: z.record(z.unknown()).optional(),
    // Quality & Usage
    validationResults: ValidationResultsSchema,
    accessCount: z.number().int().min(0),
    restoreCount: z.number().int().min(0),
    // Retention & Cleanup
    expiresAt: DateStringSchema.optional(),
    retentionPolicy: RetentionPolicySchema,
    // Tags & Metadata
    tags: z.array(z.string()),
    metadata: z.record(z.unknown()),
    // Timestamps
    createdAt: DateStringSchema,
    updatedAt: DateStringSchema,
}).refine((data) => {
    // Version cannot be its own parent or merge source
    if (data.parentVersionId === data.id || data.mergeSourceId === data.id) {
        return false;
    }
    return true;
}, {
    message: "Version cannot reference itself as parent or merge source"
});
// ============================================================================
// CONTENT BLOCK SCHEMAS
// ============================================================================
export const ContentBlockTypeSchema = z.enum([
    'text', 'statblock', 'table', 'boxedtext', 'sidebar', 'image', 'map', 'handout'
]);
export const ContentBlockSchema = z.object({
    id: z.string().min(1),
    type: ContentBlockTypeSchema,
    content: z.string(),
    metadata: z.record(z.unknown()),
    styling: z.object({
        className: z.string().optional(),
        customCSS: z.string().optional(),
        layout: z.enum(['full', 'half', 'third', 'quarter']).optional(),
    }).optional(),
});
// ============================================================================
// SEARCH & FILTERING SCHEMAS
// ============================================================================
export const SearchFiltersSchema = z.object({
    // Content Type Filters
    entityTypes: z.array(EntityTypeSchema).optional(),
    contentTypes: z.array(ContentBlockTypeSchema).optional(),
    // Difficulty & Level Filters
    challengeRating: z.object({
        min: ChallengeRatingSchema,
        max: ChallengeRatingSchema,
    }).optional(),
    partyLevel: z.object({
        min: z.number().int().min(1).max(20),
        max: z.number().int().min(1).max(20),
    }).optional(),
    difficulty: z.array(DifficultySchema).optional(),
    // Content Filters
    rarity: z.array(RaritySchema).optional(),
    itemTypes: z.array(ItemTypeSchema).optional(),
    encounterTypes: z.array(EncounterTypeSchema).optional(),
    // Publishing & Quality
    isPublished: z.boolean().optional(),
    isOfficial: z.boolean().optional(),
    minRating: z.number().min(1).max(5).optional(),
    minUsageCount: z.number().int().min(0).optional(),
    // Tags & Categories
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    // Date Filters
    createdAfter: DateStringSchema.optional(),
    createdBefore: DateStringSchema.optional(),
    updatedAfter: DateStringSchema.optional(),
    updatedBefore: DateStringSchema.optional(),
}).refine((data) => {
    // Validate date ranges
    if (data.createdAfter && data.createdBefore && data.createdAfter > data.createdBefore) {
        return false;
    }
    if (data.updatedAfter && data.updatedBefore && data.updatedAfter > data.updatedBefore) {
        return false;
    }
    // Validate level ranges
    if (data.partyLevel && data.partyLevel.min > data.partyLevel.max) {
        return false;
    }
    return true;
}, {
    message: "Invalid date or level ranges"
});
export const SearchResultSchema = z.object({
    id: EntityIdSchema,
    type: EntityTypeSchema,
    title: z.string(),
    description: z.string().optional(),
    content: z.unknown(),
    relevanceScore: z.number().min(0).max(1),
    highlights: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()),
});
// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================
export const APIErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
});
export const PaginationMetaSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
});
export const APIResponseSchema = (dataSchema) => z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: APIErrorSchema.optional(),
    meta: z.object({
        pagination: PaginationMetaSchema.optional(),
        timing: z.object({
            requestId: z.string(),
            duration: z.number().positive(),
        }).optional(),
    }).optional(),
});
export const PaginatedResponseSchema = (itemSchema) => z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: z.object({
        pagination: PaginationMetaSchema,
    }),
});
// Create a combined schema map for easy access
export const SchemaMap = {
    Project: ProjectSchema,
    Chapter: ChapterSchema,
    Section: SectionSchema,
    Encounter: EncounterSchema,
    StatBlock: StatBlockSchema,
    MagicItem: MagicItemSchema,
    NPC: NPCSchema,
    Template: TemplateSchema,
    Version: VersionSchema,
};
//# sourceMappingURL=content.schemas.js.map