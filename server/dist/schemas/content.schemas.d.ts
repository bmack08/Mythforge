import { z } from 'zod';
export declare const EntityIdSchema: z.ZodString;
export declare const UserIdSchema: z.ZodString;
export declare const DateStringSchema: z.ZodString;
export declare const SizeSchema: z.ZodEnum<["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]>;
export declare const AbilityScoreSchema: z.ZodNumber;
export declare const AbilityScoresSchema: z.ZodObject<{
    str: z.ZodNumber;
    dex: z.ZodNumber;
    con: z.ZodNumber;
    int: z.ZodNumber;
    wis: z.ZodNumber;
    cha: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}, {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}>;
export declare const DiceNotationSchema: z.ZodString;
export declare const DamageTypeSchema: z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>;
export declare const ConditionSchema: z.ZodEnum<["blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"]>;
export declare const ChallengeRatingSchema: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
export declare const SystemDesignBudgetSchema: z.ZodEffects<z.ZodObject<{
    partySize: z.ZodNumber;
    partyLevel: z.ZodNumber;
    difficulty: z.ZodEnum<["easy", "medium", "hard", "deadly"]>;
    encounterIntensity: z.ZodEnum<["low", "medium", "high"]>;
    restFrequency: z.ZodEnum<["frequent", "standard", "rare"]>;
    combatWeight: z.ZodNumber;
    explorationWeight: z.ZodNumber;
    socialWeight: z.ZodNumber;
    treasureLevel: z.ZodEnum<["low", "standard", "high"]>;
    magicPrevalence: z.ZodEnum<["rare", "normal", "common"]>;
    treasurePace: z.ZodEnum<["slow", "standard", "fast"]>;
    tone: z.ZodEnum<["gritty", "balanced", "heroic"]>;
    themes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    setting: z.ZodDefault<z.ZodString>;
    targetLength: z.ZodEnum<["short", "medium", "long"]>;
    complexity: z.ZodEnum<["simple", "medium", "complex"]>;
}, "strip", z.ZodTypeAny, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly";
    encounterIntensity: "medium" | "low" | "high";
    restFrequency: "frequent" | "standard" | "rare";
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: "low" | "high" | "standard";
    magicPrevalence: "rare" | "normal" | "common";
    treasurePace: "standard" | "slow" | "fast";
    tone: "gritty" | "balanced" | "heroic";
    themes: string[];
    setting: string;
    targetLength: "medium" | "short" | "long";
    complexity: "medium" | "simple" | "complex";
}, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly";
    encounterIntensity: "medium" | "low" | "high";
    restFrequency: "frequent" | "standard" | "rare";
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: "low" | "high" | "standard";
    magicPrevalence: "rare" | "normal" | "common";
    treasurePace: "standard" | "slow" | "fast";
    tone: "gritty" | "balanced" | "heroic";
    targetLength: "medium" | "short" | "long";
    complexity: "medium" | "simple" | "complex";
    themes?: string[] | undefined;
    setting?: string | undefined;
}>, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly";
    encounterIntensity: "medium" | "low" | "high";
    restFrequency: "frequent" | "standard" | "rare";
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: "low" | "high" | "standard";
    magicPrevalence: "rare" | "normal" | "common";
    treasurePace: "standard" | "slow" | "fast";
    tone: "gritty" | "balanced" | "heroic";
    themes: string[];
    setting: string;
    targetLength: "medium" | "short" | "long";
    complexity: "medium" | "simple" | "complex";
}, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly";
    encounterIntensity: "medium" | "low" | "high";
    restFrequency: "frequent" | "standard" | "rare";
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: "low" | "high" | "standard";
    magicPrevalence: "rare" | "normal" | "common";
    treasurePace: "standard" | "slow" | "fast";
    tone: "gritty" | "balanced" | "heroic";
    targetLength: "medium" | "short" | "long";
    complexity: "medium" | "simple" | "complex";
    themes?: string[] | undefined;
    setting?: string | undefined;
}>;
export declare const XPBudgetSchema: z.ZodObject<{
    allocated: z.ZodNumber;
    used: z.ZodNumber;
    baseXP: z.ZodNumber;
    adjustedXP: z.ZodNumber;
    efficiency: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    allocated: number;
    used: number;
    baseXP: number;
    adjustedXP: number;
    efficiency: number;
}, {
    allocated: number;
    used: number;
    baseXP: number;
    adjustedXP: number;
    efficiency: number;
}>;
export declare const UsageTypeSchema: z.ZodEnum<["personal", "sharing", "commercial", "marketplace"]>;
export declare const LicenseTypeSchema: z.ZodEnum<["ogl", "cc", "proprietary"]>;
export declare const LegalComplianceSchema: z.ZodObject<{
    usageType: z.ZodEnum<["personal", "sharing", "commercial", "marketplace"]>;
    licenseType: z.ZodEnum<["ogl", "cc", "proprietary"]>;
    piFiltered: z.ZodBoolean;
    attributions: z.ZodArray<z.ZodString, "many">;
    lastScanned: z.ZodNullable<z.ZodString>;
    complianceScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    usageType: "personal" | "sharing" | "commercial" | "marketplace";
    licenseType: "ogl" | "cc" | "proprietary";
    piFiltered: boolean;
    attributions: string[];
    lastScanned: string | null;
    complianceScore: number;
}, {
    usageType: "personal" | "sharing" | "commercial" | "marketplace";
    licenseType: "ogl" | "cc" | "proprietary";
    piFiltered: boolean;
    attributions: string[];
    lastScanned: string | null;
    complianceScore: number;
}>;
export declare const GenerationSettingsSchema: z.ZodObject<{
    aiGenerated: z.ZodBoolean;
    model: z.ZodNullable<z.ZodString>;
    prompt: z.ZodNullable<z.ZodString>;
    temperature: z.ZodNumber;
    maxTokens: z.ZodNumber;
    generatedAt: z.ZodNullable<z.ZodString>;
    tokensUsed: z.ZodNumber;
    cost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    aiGenerated: boolean;
    model: string | null;
    prompt: string | null;
    temperature: number;
    maxTokens: number;
    generatedAt: string | null;
    tokensUsed: number;
    cost: number;
}, {
    aiGenerated: boolean;
    model: string | null;
    prompt: string | null;
    temperature: number;
    maxTokens: number;
    generatedAt: string | null;
    tokensUsed: number;
    cost: number;
}>;
export declare const ValidationResultsSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodString, "many">;
    warnings: z.ZodArray<z.ZodString, "many">;
    lastValidated: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: string | null;
}, {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: string | null;
}>;
export declare const ProjectStatusSchema: z.ZodEnum<["draft", "generating", "complete", "published", "archived"]>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    systemDesignBudget: z.ZodEffects<z.ZodObject<{
        partySize: z.ZodNumber;
        partyLevel: z.ZodNumber;
        difficulty: z.ZodEnum<["easy", "medium", "hard", "deadly"]>;
        encounterIntensity: z.ZodEnum<["low", "medium", "high"]>;
        restFrequency: z.ZodEnum<["frequent", "standard", "rare"]>;
        combatWeight: z.ZodNumber;
        explorationWeight: z.ZodNumber;
        socialWeight: z.ZodNumber;
        treasureLevel: z.ZodEnum<["low", "standard", "high"]>;
        magicPrevalence: z.ZodEnum<["rare", "normal", "common"]>;
        treasurePace: z.ZodEnum<["slow", "standard", "fast"]>;
        tone: z.ZodEnum<["gritty", "balanced", "heroic"]>;
        themes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        setting: z.ZodDefault<z.ZodString>;
        targetLength: z.ZodEnum<["short", "medium", "long"]>;
        complexity: z.ZodEnum<["simple", "medium", "complex"]>;
    }, "strip", z.ZodTypeAny, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        themes: string[];
        setting: string;
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
    }, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
        themes?: string[] | undefined;
        setting?: string | undefined;
    }>, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        themes: string[];
        setting: string;
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
    }, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
        themes?: string[] | undefined;
        setting?: string | undefined;
    }>;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    legalCompliance: z.ZodObject<{
        usageType: z.ZodEnum<["personal", "sharing", "commercial", "marketplace"]>;
        licenseType: z.ZodEnum<["ogl", "cc", "proprietary"]>;
        piFiltered: z.ZodBoolean;
        attributions: z.ZodArray<z.ZodString, "many">;
        lastScanned: z.ZodNullable<z.ZodString>;
        complianceScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        usageType: "personal" | "sharing" | "commercial" | "marketplace";
        licenseType: "ogl" | "cc" | "proprietary";
        piFiltered: boolean;
        attributions: string[];
        lastScanned: string | null;
        complianceScore: number;
    }, {
        usageType: "personal" | "sharing" | "commercial" | "marketplace";
        licenseType: "ogl" | "cc" | "proprietary";
        piFiltered: boolean;
        attributions: string[];
        lastScanned: string | null;
        complianceScore: number;
    }>;
    status: z.ZodEnum<["draft", "generating", "complete", "published", "archived"]>;
    generationProgress: z.ZodOptional<z.ZodObject<{
        step: z.ZodNumber;
        totalSteps: z.ZodNumber;
        percentage: z.ZodNumber;
        currentTask: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        step: number;
        totalSteps: number;
        percentage: number;
        currentTask: string;
        updatedAt: string;
    }, {
        step: number;
        totalSteps: number;
        percentage: number;
        currentTask: string;
        updatedAt: string;
    }>>;
    contentStats: z.ZodObject<{
        totalPages: z.ZodNumber;
        totalWords: z.ZodNumber;
        totalEncounters: z.ZodNumber;
        totalNPCs: z.ZodNumber;
        totalMagicItems: z.ZodNumber;
        totalStatBlocks: z.ZodNumber;
        estimatedPlayTime: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalPages: number;
        totalWords: number;
        totalEncounters: number;
        totalNPCs: number;
        totalMagicItems: number;
        totalStatBlocks: number;
        estimatedPlayTime: number;
    }, {
        totalPages: number;
        totalWords: number;
        totalEncounters: number;
        totalNPCs: number;
        totalMagicItems: number;
        totalStatBlocks: number;
        estimatedPlayTime: number;
    }>;
    isPublic: z.ZodBoolean;
    publishedAt: z.ZodOptional<z.ZodString>;
    shareToken: z.ZodString;
    marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    version: z.ZodNumber;
    aiMetadata: z.ZodObject<{
        totalTokensUsed: z.ZodNumber;
        totalCost: z.ZodNumber;
        generationHistory: z.ZodArray<z.ZodObject<{
            timestamp: z.ZodString;
            model: z.ZodString;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }, {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }>, "many">;
        lastGenerated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        totalTokensUsed: number;
        totalCost: number;
        generationHistory: {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }[];
        lastGenerated?: string | undefined;
    }, {
        totalTokensUsed: number;
        totalCost: number;
        generationHistory: {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }[];
        lastGenerated?: string | undefined;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "generating" | "complete" | "published" | "archived";
    id: string;
    userId: string;
    title: string;
    systemDesignBudget: {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        themes: string[];
        setting: string;
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
    };
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    legalCompliance: {
        usageType: "personal" | "sharing" | "commercial" | "marketplace";
        licenseType: "ogl" | "cc" | "proprietary";
        piFiltered: boolean;
        attributions: string[];
        lastScanned: string | null;
        complianceScore: number;
    };
    updatedAt: string;
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
    shareToken: string;
    version: number;
    aiMetadata: {
        totalTokensUsed: number;
        totalCost: number;
        generationHistory: {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }[];
        lastGenerated?: string | undefined;
    };
    createdAt: string;
    description?: string | undefined;
    generationProgress?: {
        step: number;
        totalSteps: number;
        percentage: number;
        currentTask: string;
        updatedAt: string;
    } | undefined;
    publishedAt?: string | undefined;
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
}, {
    status: "draft" | "generating" | "complete" | "published" | "archived";
    id: string;
    userId: string;
    title: string;
    systemDesignBudget: {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly";
        encounterIntensity: "medium" | "low" | "high";
        restFrequency: "frequent" | "standard" | "rare";
        combatWeight: number;
        explorationWeight: number;
        socialWeight: number;
        treasureLevel: "low" | "high" | "standard";
        magicPrevalence: "rare" | "normal" | "common";
        treasurePace: "standard" | "slow" | "fast";
        tone: "gritty" | "balanced" | "heroic";
        targetLength: "medium" | "short" | "long";
        complexity: "medium" | "simple" | "complex";
        themes?: string[] | undefined;
        setting?: string | undefined;
    };
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    legalCompliance: {
        usageType: "personal" | "sharing" | "commercial" | "marketplace";
        licenseType: "ogl" | "cc" | "proprietary";
        piFiltered: boolean;
        attributions: string[];
        lastScanned: string | null;
        complianceScore: number;
    };
    updatedAt: string;
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
    shareToken: string;
    version: number;
    aiMetadata: {
        totalTokensUsed: number;
        totalCost: number;
        generationHistory: {
            model: string;
            tokensUsed: number;
            cost: number;
            timestamp: string;
        }[];
        lastGenerated?: string | undefined;
    };
    createdAt: string;
    description?: string | undefined;
    generationProgress?: {
        step: number;
        totalSteps: number;
        percentage: number;
        currentTask: string;
        updatedAt: string;
    } | undefined;
    publishedAt?: string | undefined;
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
}>;
export declare const ChapterTypeSchema: z.ZodEnum<["introduction", "adventure", "location", "npcs", "monsters", "items", "appendix", "handouts", "maps", "tables", "custom"]>;
export declare const ChapterSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    chapterType: z.ZodEnum<["introduction", "adventure", "location", "npcs", "monsters", "items", "appendix", "handouts", "maps", "tables", "custom"]>;
    orderIndex: z.ZodNumber;
    level: z.ZodNumber;
    content: z.ZodOptional<z.ZodString>;
    generationPrompt: z.ZodOptional<z.ZodString>;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    contentMetadata: z.ZodObject<{
        wordCount: z.ZodNumber;
        estimatedReadTime: z.ZodNumber;
        encounterCount: z.ZodNumber;
        npcCount: z.ZodNumber;
        magicItemCount: z.ZodNumber;
        lastAnalyzed: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        wordCount: number;
        estimatedReadTime: number;
        encounterCount: number;
        npcCount: number;
        magicItemCount: number;
        lastAnalyzed?: string | undefined;
    }, {
        wordCount: number;
        estimatedReadTime: number;
        encounterCount: number;
        npcCount: number;
        magicItemCount: number;
        lastAnalyzed?: string | undefined;
    }>;
    isVisible: z.ZodBoolean;
    isComplete: z.ZodBoolean;
    dependencies: z.ZodArray<z.ZodString, "many">;
    crossReferences: z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        targetType: z.ZodEnum<["chapter", "section", "npc", "encounter"]>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        targetId: string;
        targetType: "chapter" | "section" | "npc" | "encounter";
    }, {
        description: string;
        targetId: string;
        targetType: "chapter" | "section" | "npc" | "encounter";
    }>, "many">;
    accessibilityMetadata: z.ZodObject<{
        hasAltText: z.ZodBoolean;
        hasProperHeadings: z.ZodBoolean;
        colorContrastChecked: z.ZodBoolean;
        screenReaderFriendly: z.ZodBoolean;
        lastAccessibilityCheck: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        hasAltText: boolean;
        hasProperHeadings: boolean;
        colorContrastChecked: boolean;
        screenReaderFriendly: boolean;
        lastAccessibilityCheck?: string | undefined;
    }, {
        hasAltText: boolean;
        hasProperHeadings: boolean;
        colorContrastChecked: boolean;
        screenReaderFriendly: boolean;
        lastAccessibilityCheck?: string | undefined;
    }>;
    version: z.ZodNumber;
    authorNotes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    slug: string;
    chapterType: "custom" | "introduction" | "adventure" | "location" | "npcs" | "monsters" | "items" | "appendix" | "handouts" | "maps" | "tables";
    orderIndex: number;
    level: number;
    contentMetadata: {
        wordCount: number;
        estimatedReadTime: number;
        encounterCount: number;
        npcCount: number;
        magicItemCount: number;
        lastAnalyzed?: string | undefined;
    };
    isVisible: boolean;
    isComplete: boolean;
    dependencies: string[];
    crossReferences: {
        description: string;
        targetId: string;
        targetType: "chapter" | "section" | "npc" | "encounter";
    }[];
    accessibilityMetadata: {
        hasAltText: boolean;
        hasProperHeadings: boolean;
        colorContrastChecked: boolean;
        screenReaderFriendly: boolean;
        lastAccessibilityCheck?: string | undefined;
    };
    description?: string | undefined;
    deletedAt?: string | undefined;
    parentId?: string | undefined;
    content?: string | undefined;
    generationPrompt?: string | undefined;
    authorNotes?: string | undefined;
}, {
    id: string;
    title: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    slug: string;
    chapterType: "custom" | "introduction" | "adventure" | "location" | "npcs" | "monsters" | "items" | "appendix" | "handouts" | "maps" | "tables";
    orderIndex: number;
    level: number;
    contentMetadata: {
        wordCount: number;
        estimatedReadTime: number;
        encounterCount: number;
        npcCount: number;
        magicItemCount: number;
        lastAnalyzed?: string | undefined;
    };
    isVisible: boolean;
    isComplete: boolean;
    dependencies: string[];
    crossReferences: {
        description: string;
        targetId: string;
        targetType: "chapter" | "section" | "npc" | "encounter";
    }[];
    accessibilityMetadata: {
        hasAltText: boolean;
        hasProperHeadings: boolean;
        colorContrastChecked: boolean;
        screenReaderFriendly: boolean;
        lastAccessibilityCheck?: string | undefined;
    };
    description?: string | undefined;
    deletedAt?: string | undefined;
    parentId?: string | undefined;
    content?: string | undefined;
    generationPrompt?: string | undefined;
    authorNotes?: string | undefined;
}>;
export declare const SectionTypeSchema: z.ZodEnum<["text", "statblock", "encounter", "magicitem", "npc", "location", "table", "boxedtext", "sidebar", "handout", "map", "custom"]>;
export declare const SectionSchema: z.ZodObject<{
    id: z.ZodString;
    chapterId: z.ZodString;
    title: z.ZodString;
    sectionType: z.ZodEnum<["text", "statblock", "encounter", "magicitem", "npc", "location", "table", "boxedtext", "sidebar", "handout", "map", "custom"]>;
    orderIndex: z.ZodNumber;
    content: z.ZodOptional<z.ZodString>;
    contentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }>;
    accessibilityData: z.ZodObject<{
        altText: z.ZodOptional<z.ZodString>;
        ariaLabel: z.ZodOptional<z.ZodString>;
        headingLevel: z.ZodOptional<z.ZodNumber>;
        isDecorative: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isDecorative: boolean;
        altText?: string | undefined;
        ariaLabel?: string | undefined;
        headingLevel?: number | undefined;
    }, {
        isDecorative: boolean;
        altText?: string | undefined;
        ariaLabel?: string | undefined;
        headingLevel?: number | undefined;
    }>;
    isVisible: z.ZodBoolean;
    references: z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        targetType: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        targetId: string;
        targetType: string;
    }, {
        description: string;
        targetId: string;
        targetType: string;
    }>, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    orderIndex: number;
    isVisible: boolean;
    chapterId: string;
    sectionType: "map" | "custom" | "location" | "npc" | "encounter" | "text" | "statblock" | "magicitem" | "table" | "boxedtext" | "sidebar" | "handout";
    contentData: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    accessibilityData: {
        isDecorative: boolean;
        altText?: string | undefined;
        ariaLabel?: string | undefined;
        headingLevel?: number | undefined;
    };
    references: {
        description: string;
        targetId: string;
        targetType: string;
    }[];
    tags: string[];
    deletedAt?: string | undefined;
    content?: string | undefined;
}, {
    id: string;
    title: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    orderIndex: number;
    isVisible: boolean;
    chapterId: string;
    sectionType: "map" | "custom" | "location" | "npc" | "encounter" | "text" | "statblock" | "magicitem" | "table" | "boxedtext" | "sidebar" | "handout";
    contentData: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    accessibilityData: {
        isDecorative: boolean;
        altText?: string | undefined;
        ariaLabel?: string | undefined;
        headingLevel?: number | undefined;
    };
    references: {
        description: string;
        targetId: string;
        targetType: string;
    }[];
    tags: string[];
    deletedAt?: string | undefined;
    content?: string | undefined;
}>;
export declare const EncounterTypeSchema: z.ZodEnum<["combat", "social", "exploration", "puzzle", "mixed"]>;
export declare const DifficultySchema: z.ZodEnum<["trivial", "easy", "medium", "hard", "deadly"]>;
export declare const EncounterCreatureSchema: z.ZodObject<{
    name: z.ZodString;
    quantity: z.ZodNumber;
    challengeRating: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
    xpValue: z.ZodNumber;
    statBlockId: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    quantity: number;
    challengeRating: number;
    xpValue: number;
    statBlockId?: string | undefined;
    source?: string | undefined;
}, {
    name: string;
    quantity: number;
    challengeRating: number;
    xpValue: number;
    statBlockId?: string | undefined;
    source?: string | undefined;
}>;
export declare const EncounterSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    chapterId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    encounterType: z.ZodEnum<["combat", "social", "exploration", "puzzle", "mixed"]>;
    difficulty: z.ZodEnum<["trivial", "easy", "medium", "hard", "deadly"]>;
    partySize: z.ZodNumber;
    partyLevel: z.ZodNumber;
    creatures: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        quantity: z.ZodNumber;
        challengeRating: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
        xpValue: z.ZodNumber;
        statBlockId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity: number;
        challengeRating: number;
        xpValue: number;
        statBlockId?: string | undefined;
        source?: string | undefined;
    }, {
        name: string;
        quantity: number;
        challengeRating: number;
        xpValue: number;
        statBlockId?: string | undefined;
        source?: string | undefined;
    }>, "many">;
    xpBudget: z.ZodObject<{
        allocated: z.ZodNumber;
        used: z.ZodNumber;
        baseXP: z.ZodNumber;
        adjustedXP: z.ZodNumber;
        efficiency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        allocated: number;
        used: number;
        baseXP: number;
        adjustedXP: number;
        efficiency: number;
    }, {
        allocated: number;
        used: number;
        baseXP: number;
        adjustedXP: number;
        efficiency: number;
    }>;
    environment: z.ZodObject<{
        terrain: z.ZodEnum<["normal", "difficult", "hazardous"]>;
        lighting: z.ZodEnum<["bright", "dim", "dark"]>;
        weather: z.ZodEnum<["clear", "rain", "storm", "fog", "snow"]>;
        temperature: z.ZodEnum<["frigid", "cold", "temperate", "warm", "hot"]>;
        specialConditions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
        terrain: "normal" | "difficult" | "hazardous";
        lighting: "bright" | "dim" | "dark";
        weather: "clear" | "rain" | "storm" | "fog" | "snow";
        specialConditions: string[];
    }, {
        temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
        terrain: "normal" | "difficult" | "hazardous";
        lighting: "bright" | "dim" | "dark";
        weather: "clear" | "rain" | "storm" | "fog" | "snow";
        specialConditions: string[];
    }>;
    tactics: z.ZodObject<{
        setup: z.ZodString;
        round1: z.ZodString;
        subsequentRounds: z.ZodString;
        retreat: z.ZodString;
        reinforcements: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        setup: string;
        round1: string;
        subsequentRounds: string;
        retreat: string;
        reinforcements: boolean;
    }, {
        setup: string;
        round1: string;
        subsequentRounds: string;
        retreat: string;
        reinforcements: boolean;
    }>;
    rewards: z.ZodObject<{
        experience: z.ZodNumber;
        treasure: z.ZodArray<z.ZodObject<{
            itemId: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            description: z.ZodString;
            value: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }, {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }>, "many">;
        storyRewards: z.ZodArray<z.ZodString, "many">;
        information: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        experience: number;
        treasure: {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }[];
        storyRewards: string[];
        information: string[];
    }, {
        experience: number;
        treasure: {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }[];
        storyRewards: string[];
        information: string[];
    }>;
    scaling: z.ZodEffects<z.ZodObject<{
        canScale: z.ZodBoolean;
        minPartySize: z.ZodNumber;
        maxPartySize: z.ZodNumber;
        minLevel: z.ZodNumber;
        maxLevel: z.ZodNumber;
        scalingNotes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        canScale: boolean;
        minPartySize: number;
        maxPartySize: number;
        minLevel: number;
        maxLevel: number;
        scalingNotes: string;
    }, {
        canScale: boolean;
        minPartySize: number;
        maxPartySize: number;
        minLevel: number;
        maxLevel: number;
        scalingNotes: string;
    }>, {
        canScale: boolean;
        minPartySize: number;
        maxPartySize: number;
        minLevel: number;
        maxLevel: number;
        scalingNotes: string;
    }, {
        canScale: boolean;
        minPartySize: number;
        maxPartySize: number;
        minLevel: number;
        maxLevel: number;
        scalingNotes: string;
    }>;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    balanceAnalysis: z.ZodObject<{
        lastAnalyzed: z.ZodOptional<z.ZodString>;
        isBalanced: z.ZodBoolean;
        warnings: z.ZodArray<z.ZodString, "many">;
        suggestions: z.ZodArray<z.ZodString, "many">;
        difficultyScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        warnings: string[];
        isBalanced: boolean;
        suggestions: string[];
        difficultyScore: number;
        lastAnalyzed?: string | undefined;
    }, {
        warnings: string[];
        isBalanced: boolean;
        suggestions: string[];
        difficultyScore: number;
        lastAnalyzed?: string | undefined;
    }>;
    usageStats: z.ZodObject<{
        timesUsed: z.ZodNumber;
        averageDuration: z.ZodNumber;
        averagePlayerDeaths: z.ZodNumber;
        averageResourcesUsed: z.ZodNumber;
        feedback: z.ZodArray<z.ZodObject<{
            rating: z.ZodNumber;
            comment: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            rating: number;
            comment: string;
        }, {
            timestamp: string;
            rating: number;
            comment: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        timesUsed: number;
        averageDuration: number;
        averagePlayerDeaths: number;
        averageResourcesUsed: number;
        feedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
    }, {
        timesUsed: number;
        averageDuration: number;
        averagePlayerDeaths: number;
        averageResourcesUsed: number;
        feedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
    }>;
    isPublished: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly" | "trivial";
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    tags: string[];
    name: string;
    encounterType: "combat" | "social" | "exploration" | "puzzle" | "mixed";
    creatures: {
        name: string;
        quantity: number;
        challengeRating: number;
        xpValue: number;
        statBlockId?: string | undefined;
        source?: string | undefined;
    }[];
    xpBudget: {
        allocated: number;
        used: number;
        baseXP: number;
        adjustedXP: number;
        efficiency: number;
    };
    environment: {
        temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
        terrain: "normal" | "difficult" | "hazardous";
        lighting: "bright" | "dim" | "dark";
        weather: "clear" | "rain" | "storm" | "fog" | "snow";
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
        treasure: {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }[];
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
    balanceAnalysis: {
        warnings: string[];
        isBalanced: boolean;
        suggestions: string[];
        difficultyScore: number;
        lastAnalyzed?: string | undefined;
    };
    usageStats: {
        timesUsed: number;
        averageDuration: number;
        averagePlayerDeaths: number;
        averageResourcesUsed: number;
        feedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
    };
    isPublished: boolean;
    description?: string | undefined;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
}, {
    partySize: number;
    partyLevel: number;
    difficulty: "easy" | "medium" | "hard" | "deadly" | "trivial";
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    tags: string[];
    name: string;
    encounterType: "combat" | "social" | "exploration" | "puzzle" | "mixed";
    creatures: {
        name: string;
        quantity: number;
        challengeRating: number;
        xpValue: number;
        statBlockId?: string | undefined;
        source?: string | undefined;
    }[];
    xpBudget: {
        allocated: number;
        used: number;
        baseXP: number;
        adjustedXP: number;
        efficiency: number;
    };
    environment: {
        temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
        terrain: "normal" | "difficult" | "hazardous";
        lighting: "bright" | "dim" | "dark";
        weather: "clear" | "rain" | "storm" | "fog" | "snow";
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
        treasure: {
            description: string;
            name: string;
            value?: number | undefined;
            itemId?: string | undefined;
        }[];
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
    balanceAnalysis: {
        warnings: string[];
        isBalanced: boolean;
        suggestions: string[];
        difficultyScore: number;
        lastAnalyzed?: string | undefined;
    };
    usageStats: {
        timesUsed: number;
        averageDuration: number;
        averagePlayerDeaths: number;
        averageResourcesUsed: number;
        feedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
    };
    isPublished: boolean;
    description?: string | undefined;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
}>;
export declare const StatBlockAttackSchema: z.ZodObject<{
    name: z.ZodString;
    attackBonus: z.ZodNumber;
    damage: z.ZodString;
    averageDamage: z.ZodNumber;
    reach: z.ZodOptional<z.ZodNumber>;
    range: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    attackBonus: number;
    damage: string;
    averageDamage: number;
    reach?: number | undefined;
    range?: string | undefined;
}, {
    description: string;
    name: string;
    attackBonus: number;
    damage: string;
    averageDamage: number;
    reach?: number | undefined;
    range?: string | undefined;
}>;
export declare const StatBlockAbilitySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    recharge: z.ZodOptional<z.ZodString>;
    cost: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    cost?: number | undefined;
    recharge?: string | undefined;
}, {
    description: string;
    name: string;
    cost?: number | undefined;
    recharge?: string | undefined;
}>;
export declare const StatBlockSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    chapterId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    size: z.ZodEnum<["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]>;
    type: z.ZodString;
    subtype: z.ZodOptional<z.ZodString>;
    alignment: z.ZodString;
    armorClass: z.ZodNumber;
    armorClassSource: z.ZodOptional<z.ZodString>;
    hitPoints: z.ZodNumber;
    hitDice: z.ZodOptional<z.ZodString>;
    speed: z.ZodString;
    abilities: z.ZodObject<{
        str: z.ZodNumber;
        dex: z.ZodNumber;
        con: z.ZodNumber;
        int: z.ZodNumber;
        wis: z.ZodNumber;
        cha: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    }, {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    }>;
    savingThrows: z.ZodRecord<z.ZodString, z.ZodNumber>;
    skills: z.ZodRecord<z.ZodString, z.ZodNumber>;
    damageVulnerabilities: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
    damageResistances: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
    damageImmunities: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
    conditionImmunities: z.ZodArray<z.ZodEnum<["blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"]>, "many">;
    senses: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodString>;
    challengeRating: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
    specialAbilities: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        recharge: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }>, "many">;
    actions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        recharge: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }>, "many">;
    reactions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        recharge: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }>, "many">;
    legendaryActions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        recharge: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }, {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }>, "many">;
    attacks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        attackBonus: z.ZodNumber;
        damage: z.ZodString;
        averageDamage: z.ZodNumber;
        reach: z.ZodOptional<z.ZodNumber>;
        range: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        attackBonus: number;
        damage: string;
        averageDamage: number;
        reach?: number | undefined;
        range?: string | undefined;
    }, {
        description: string;
        name: string;
        attackBonus: number;
        damage: string;
        averageDamage: number;
        reach?: number | undefined;
        range?: string | undefined;
    }>, "many">;
    source: z.ZodOptional<z.ZodString>;
    isOriginal: z.ZodBoolean;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    } & {
        calculatedCR: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        calculatedCR?: number | undefined;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        calculatedCR?: number | undefined;
    }>;
    usageStats: z.ZodObject<{
        timesUsed: z.ZodNumber;
        averageEncounterCR: z.ZodNumber;
        playerFeedback: z.ZodArray<z.ZodObject<{
            rating: z.ZodNumber;
            comment: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            rating: number;
            comment: string;
        }, {
            timestamp: string;
            rating: number;
            comment: string;
        }>, "many">;
        balanceNotes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        timesUsed: number;
        averageEncounterCR: number;
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        balanceNotes: string[];
    }, {
        timesUsed: number;
        averageEncounterCR: number;
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        balanceNotes: string[];
    }>;
    isPublished: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        calculatedCR?: number | undefined;
    };
    tags: string[];
    name: string;
    challengeRating: number;
    usageStats: {
        timesUsed: number;
        averageEncounterCR: number;
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        balanceNotes: string[];
    };
    isPublished: boolean;
    size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
    alignment: string;
    armorClass: number;
    hitPoints: number;
    speed: string;
    abilities: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    savingThrows: Record<string, number>;
    skills: Record<string, number>;
    damageVulnerabilities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    damageResistances: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    damageImmunities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    conditionImmunities: ("blinded" | "charmed" | "deafened" | "frightened" | "grappled" | "incapacitated" | "invisible" | "paralyzed" | "petrified" | "poisoned" | "prone" | "restrained" | "stunned" | "unconscious")[];
    specialAbilities: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    actions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    reactions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    legendaryActions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    attacks: {
        description: string;
        name: string;
        attackBonus: number;
        damage: string;
        averageDamage: number;
        reach?: number | undefined;
        range?: string | undefined;
    }[];
    isOriginal: boolean;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
    source?: string | undefined;
    subtype?: string | undefined;
    armorClassSource?: string | undefined;
    hitDice?: string | undefined;
    senses?: string | undefined;
    languages?: string | undefined;
}, {
    type: string;
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        calculatedCR?: number | undefined;
    };
    tags: string[];
    name: string;
    challengeRating: number;
    usageStats: {
        timesUsed: number;
        averageEncounterCR: number;
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        balanceNotes: string[];
    };
    isPublished: boolean;
    size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
    alignment: string;
    armorClass: number;
    hitPoints: number;
    speed: string;
    abilities: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    };
    savingThrows: Record<string, number>;
    skills: Record<string, number>;
    damageVulnerabilities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    damageResistances: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    damageImmunities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
    conditionImmunities: ("blinded" | "charmed" | "deafened" | "frightened" | "grappled" | "incapacitated" | "invisible" | "paralyzed" | "petrified" | "poisoned" | "prone" | "restrained" | "stunned" | "unconscious")[];
    specialAbilities: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    actions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    reactions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    legendaryActions: {
        description: string;
        name: string;
        cost?: number | undefined;
        recharge?: string | undefined;
    }[];
    attacks: {
        description: string;
        name: string;
        attackBonus: number;
        damage: string;
        averageDamage: number;
        reach?: number | undefined;
        range?: string | undefined;
    }[];
    isOriginal: boolean;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
    source?: string | undefined;
    subtype?: string | undefined;
    armorClassSource?: string | undefined;
    hitDice?: string | undefined;
    senses?: string | undefined;
    languages?: string | undefined;
}>;
export declare const ItemTypeSchema: z.ZodEnum<["weapon", "armor", "shield", "wondrous item", "potion", "scroll", "ring", "rod", "staff", "wand", "tool", "instrument", "vehicle", "other"]>;
export declare const RaritySchema: z.ZodEnum<["common", "uncommon", "rare", "very rare", "legendary", "artifact"]>;
export declare const AttunementTypeSchema: z.ZodEnum<["none", "required", "optional"]>;
export declare const MagicItemEffectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    activation: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["passive", "action", "bonus action", "reaction", "minute", "hour"]>;
        cost: z.ZodNumber;
        condition: z.ZodOptional<z.ZodString>;
        range: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodString>;
        concentration: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
        cost: number;
        concentration: boolean;
        range?: string | undefined;
        condition?: string | undefined;
        duration?: string | undefined;
    }, {
        type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
        cost: number;
        concentration: boolean;
        range?: string | undefined;
        condition?: string | undefined;
        duration?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    activation?: {
        type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
        cost: number;
        concentration: boolean;
        range?: string | undefined;
        condition?: string | undefined;
        duration?: string | undefined;
    } | undefined;
}, {
    description: string;
    name: string;
    activation?: {
        type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
        cost: number;
        concentration: boolean;
        range?: string | undefined;
        condition?: string | undefined;
        duration?: string | undefined;
    } | undefined;
}>;
export declare const MagicItemSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    chapterId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    itemType: z.ZodEnum<["weapon", "armor", "shield", "wondrous item", "potion", "scroll", "ring", "rod", "staff", "wand", "tool", "instrument", "vehicle", "other"]>;
    subtype: z.ZodOptional<z.ZodString>;
    rarity: z.ZodEnum<["common", "uncommon", "rare", "very rare", "legendary", "artifact"]>;
    estimatedValue: z.ZodOptional<z.ZodNumber>;
    attunementType: z.ZodEnum<["none", "required", "optional"]>;
    attunementRequirement: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    flavorText: z.ZodOptional<z.ZodString>;
    mechanicalEffects: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        activation: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["passive", "action", "bonus action", "reaction", "minute", "hour"]>;
            cost: z.ZodNumber;
            condition: z.ZodOptional<z.ZodString>;
            range: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodString>;
            concentration: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        }, {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        activation?: {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        } | undefined;
    }, {
        description: string;
        name: string;
        activation?: {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        } | undefined;
    }>, "many">;
    properties: z.ZodEffects<z.ZodObject<{
        charges: z.ZodBoolean;
        maxCharges: z.ZodOptional<z.ZodNumber>;
        currentCharges: z.ZodOptional<z.ZodNumber>;
        chargeRecovery: z.ZodOptional<z.ZodString>;
        cursed: z.ZodBoolean;
        curseDescription: z.ZodOptional<z.ZodString>;
        sentient: z.ZodBoolean;
        sentientPersonality: z.ZodOptional<z.ZodString>;
        weight: z.ZodOptional<z.ZodNumber>;
        dimensions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    }, {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    }>, {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    }, {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    }>;
    combatStats: z.ZodObject<{
        attackBonus: z.ZodOptional<z.ZodNumber>;
        damageBonus: z.ZodOptional<z.ZodNumber>;
        damageDice: z.ZodOptional<z.ZodString>;
        damageType: z.ZodOptional<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>>;
        armorClassBonus: z.ZodOptional<z.ZodNumber>;
        magicBonus: z.ZodOptional<z.ZodNumber>;
        criticalRange: z.ZodOptional<z.ZodNumber>;
        specialProperties: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        specialProperties: string[];
        attackBonus?: number | undefined;
        damageBonus?: number | undefined;
        damageDice?: string | undefined;
        damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
        armorClassBonus?: number | undefined;
        magicBonus?: number | undefined;
        criticalRange?: number | undefined;
    }, {
        specialProperties: string[];
        attackBonus?: number | undefined;
        damageBonus?: number | undefined;
        damageDice?: string | undefined;
        damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
        armorClassBonus?: number | undefined;
        magicBonus?: number | undefined;
        criticalRange?: number | undefined;
    }>;
    source: z.ZodOptional<z.ZodString>;
    isOriginal: z.ZodBoolean;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    } & {
        balanceScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        balanceScore: number;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        balanceScore: number;
    }>;
    usageStats: z.ZodObject<{
        timesAwarded: z.ZodNumber;
        playerFeedback: z.ZodArray<z.ZodObject<{
            rating: z.ZodNumber;
            comment: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            rating: number;
            comment: string;
        }, {
            timestamp: string;
            rating: number;
            comment: string;
        }>, "many">;
        balanceIssues: z.ZodArray<z.ZodString, "many">;
        popularityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        timesAwarded: number;
        balanceIssues: string[];
        popularityScore: number;
    }, {
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        timesAwarded: number;
        balanceIssues: string[];
        popularityScore: number;
    }>;
    isPublished: z.ZodBoolean;
    marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        balanceScore: number;
    };
    tags: string[];
    name: string;
    usageStats: {
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        timesAwarded: number;
        balanceIssues: string[];
        popularityScore: number;
    };
    isPublished: boolean;
    isOriginal: boolean;
    itemType: "weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other";
    rarity: "rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact";
    attunementType: "none" | "required" | "optional";
    mechanicalEffects: {
        description: string;
        name: string;
        activation?: {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        } | undefined;
    }[];
    properties: {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    };
    combatStats: {
        specialProperties: string[];
        attackBonus?: number | undefined;
        damageBonus?: number | undefined;
        damageDice?: string | undefined;
        damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
        armorClassBonus?: number | undefined;
        magicBonus?: number | undefined;
        criticalRange?: number | undefined;
    };
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
    source?: string | undefined;
    subtype?: string | undefined;
    estimatedValue?: number | undefined;
    attunementRequirement?: string | undefined;
    flavorText?: string | undefined;
}, {
    id: string;
    description: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        balanceScore: number;
    };
    tags: string[];
    name: string;
    usageStats: {
        playerFeedback: {
            timestamp: string;
            rating: number;
            comment: string;
        }[];
        timesAwarded: number;
        balanceIssues: string[];
        popularityScore: number;
    };
    isPublished: boolean;
    isOriginal: boolean;
    itemType: "weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other";
    rarity: "rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact";
    attunementType: "none" | "required" | "optional";
    mechanicalEffects: {
        description: string;
        name: string;
        activation?: {
            type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
            cost: number;
            concentration: boolean;
            range?: string | undefined;
            condition?: string | undefined;
            duration?: string | undefined;
        } | undefined;
    }[];
    properties: {
        charges: boolean;
        cursed: boolean;
        sentient: boolean;
        maxCharges?: number | undefined;
        currentCharges?: number | undefined;
        chargeRecovery?: string | undefined;
        curseDescription?: string | undefined;
        sentientPersonality?: string | undefined;
        weight?: number | undefined;
        dimensions?: string | undefined;
    };
    combatStats: {
        specialProperties: string[];
        attackBonus?: number | undefined;
        damageBonus?: number | undefined;
        damageDice?: string | undefined;
        damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
        armorClassBonus?: number | undefined;
        magicBonus?: number | undefined;
        criticalRange?: number | undefined;
    };
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
    chapterId?: string | undefined;
    source?: string | undefined;
    subtype?: string | undefined;
    estimatedValue?: number | undefined;
    attunementRequirement?: string | undefined;
    flavorText?: string | undefined;
}>;
export declare const SocialClassSchema: z.ZodEnum<["commoner", "merchant", "artisan", "noble", "official", "clergy", "criminal", "ruler"]>;
export declare const WealthLevelSchema: z.ZodEnum<["destitute", "poor", "modest", "comfortable", "wealthy", "aristocratic"]>;
export declare const PlotRelevanceSchema: z.ZodEnum<["none", "minor", "moderate", "major", "critical"]>;
export declare const NPCPersonalitySchema: z.ZodObject<{
    trait: z.ZodString;
    ideal: z.ZodString;
    bond: z.ZodString;
    flaw: z.ZodString;
}, "strip", z.ZodTypeAny, {
    trait: string;
    ideal: string;
    bond: string;
    flaw: string;
}, {
    trait: string;
    ideal: string;
    bond: string;
    flaw: string;
}>;
export declare const NPCVoiceSchema: z.ZodObject<{
    accent: z.ZodString;
    pitch: z.ZodEnum<["very low", "low", "average", "high", "very high"]>;
    volume: z.ZodEnum<["whisper", "quiet", "normal", "loud", "booming"]>;
    speechPattern: z.ZodString;
    mannerism: z.ZodString;
    catchphrase: z.ZodOptional<z.ZodString>;
    vocabulary: z.ZodEnum<["simple", "common", "educated", "eloquent"]>;
}, "strip", z.ZodTypeAny, {
    accent: string;
    pitch: "low" | "high" | "very low" | "average" | "very high";
    volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
    speechPattern: string;
    mannerism: string;
    vocabulary: "common" | "simple" | "educated" | "eloquent";
    catchphrase?: string | undefined;
}, {
    accent: string;
    pitch: "low" | "high" | "very low" | "average" | "very high";
    volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
    speechPattern: string;
    mannerism: string;
    vocabulary: "common" | "simple" | "educated" | "eloquent";
    catchphrase?: string | undefined;
}>;
export declare const NPCInteractionStyleSchema: z.ZodObject<{
    approachability: z.ZodNumber;
    trustworthiness: z.ZodNumber;
    helpfulness: z.ZodNumber;
    patience: z.ZodNumber;
    humor: z.ZodNumber;
    intelligence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    approachability: number;
    trustworthiness: number;
    helpfulness: number;
    patience: number;
    humor: number;
    intelligence: number;
}, {
    approachability: number;
    trustworthiness: number;
    helpfulness: number;
    patience: number;
    humor: number;
    intelligence: number;
}>;
export declare const NPCRelationshipSchema: z.ZodObject<{
    targetId: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    description: z.ZodString;
    strength: z.ZodNumber;
    established: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    description: string;
    targetId: string;
    name: string;
    strength: number;
    established: string;
}, {
    type: string;
    description: string;
    targetId: string;
    name: string;
    strength: number;
    established: string;
}>;
export declare const NPCDialogueSampleSchema: z.ZodObject<{
    context: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    context: string;
}, {
    text: string;
    context: string;
}>;
export declare const NPCSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    chapterId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    race: z.ZodString;
    subrace: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    occupation: z.ZodString;
    socialClass: z.ZodEnum<["commoner", "merchant", "artisan", "noble", "official", "clergy", "criminal", "ruler"]>;
    faction: z.ZodOptional<z.ZodString>;
    appearance: z.ZodOptional<z.ZodString>;
    height: z.ZodOptional<z.ZodString>;
    weight: z.ZodOptional<z.ZodString>;
    personality: z.ZodObject<{
        trait: z.ZodString;
        ideal: z.ZodString;
        bond: z.ZodString;
        flaw: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        trait: string;
        ideal: string;
        bond: string;
        flaw: string;
    }, {
        trait: string;
        ideal: string;
        bond: string;
        flaw: string;
    }>;
    voice: z.ZodObject<{
        accent: z.ZodString;
        pitch: z.ZodEnum<["very low", "low", "average", "high", "very high"]>;
        volume: z.ZodEnum<["whisper", "quiet", "normal", "loud", "booming"]>;
        speechPattern: z.ZodString;
        mannerism: z.ZodString;
        catchphrase: z.ZodOptional<z.ZodString>;
        vocabulary: z.ZodEnum<["simple", "common", "educated", "eloquent"]>;
    }, "strip", z.ZodTypeAny, {
        accent: string;
        pitch: "low" | "high" | "very low" | "average" | "very high";
        volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
        speechPattern: string;
        mannerism: string;
        vocabulary: "common" | "simple" | "educated" | "eloquent";
        catchphrase?: string | undefined;
    }, {
        accent: string;
        pitch: "low" | "high" | "very low" | "average" | "very high";
        volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
        speechPattern: string;
        mannerism: string;
        vocabulary: "common" | "simple" | "educated" | "eloquent";
        catchphrase?: string | undefined;
    }>;
    interactionStyle: z.ZodObject<{
        approachability: z.ZodNumber;
        trustworthiness: z.ZodNumber;
        helpfulness: z.ZodNumber;
        patience: z.ZodNumber;
        humor: z.ZodNumber;
        intelligence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        approachability: number;
        trustworthiness: number;
        helpfulness: number;
        patience: number;
        humor: number;
        intelligence: number;
    }, {
        approachability: number;
        trustworthiness: number;
        helpfulness: number;
        patience: number;
        humor: number;
        intelligence: number;
    }>;
    dialogueSamples: z.ZodArray<z.ZodObject<{
        context: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        context: string;
    }, {
        text: string;
        context: string;
    }>, "many">;
    background: z.ZodOptional<z.ZodString>;
    secrets: z.ZodArray<z.ZodObject<{
        secret: z.ZodString;
        severity: z.ZodEnum<["minor", "moderate", "major", "critical"]>;
        knownBy: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        secret: string;
        severity: "minor" | "moderate" | "major" | "critical";
        knownBy: string[];
    }, {
        secret: string;
        severity: "minor" | "moderate" | "major" | "critical";
        knownBy: string[];
    }>, "many">;
    goals: z.ZodObject<{
        shortTerm: z.ZodArray<z.ZodString, "many">;
        longTerm: z.ZodArray<z.ZodString, "many">;
        hidden: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        shortTerm: string[];
        longTerm: string[];
        hidden: string[];
    }, {
        shortTerm: string[];
        longTerm: string[];
        hidden: string[];
    }>;
    stats: z.ZodOptional<z.ZodObject<{
        str: z.ZodNumber;
        dex: z.ZodNumber;
        con: z.ZodNumber;
        int: z.ZodNumber;
        wis: z.ZodNumber;
        cha: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    }, {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    }>>;
    skills: z.ZodRecord<z.ZodString, z.ZodNumber>;
    combatCapable: z.ZodBoolean;
    location: z.ZodOptional<z.ZodString>;
    schedule: z.ZodRecord<z.ZodString, z.ZodString>;
    relationships: z.ZodArray<z.ZodObject<{
        targetId: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        description: z.ZodString;
        strength: z.ZodNumber;
        established: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        description: string;
        targetId: string;
        name: string;
        strength: number;
        established: string;
    }, {
        type: string;
        description: string;
        targetId: string;
        name: string;
        strength: number;
        established: string;
    }>, "many">;
    questHooks: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        type: z.ZodEnum<["main", "side", "personal", "faction"]>;
        level: z.ZodNumber;
        reward: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "personal" | "faction" | "main" | "side";
        title: string;
        description: string;
        level: number;
        reward?: string | undefined;
    }, {
        type: "personal" | "faction" | "main" | "side";
        title: string;
        description: string;
        level: number;
        reward?: string | undefined;
    }>, "many">;
    plotRelevance: z.ZodEnum<["none", "minor", "moderate", "major", "critical"]>;
    wealth: z.ZodEnum<["destitute", "poor", "modest", "comfortable", "wealthy", "aristocratic"]>;
    possessions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        value: z.ZodOptional<z.ZodNumber>;
        magical: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        magical: boolean;
        value?: number | undefined;
    }, {
        description: string;
        name: string;
        magical: boolean;
        value?: number | undefined;
    }>, "many">;
    services: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        cost: z.ZodOptional<z.ZodString>;
        availability: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        availability: string;
        cost?: string | undefined;
    }, {
        description: string;
        name: string;
        availability: string;
        cost?: string | undefined;
    }>, "many">;
    generationSettings: z.ZodObject<{
        aiGenerated: z.ZodBoolean;
        model: z.ZodNullable<z.ZodString>;
        prompt: z.ZodNullable<z.ZodString>;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        generatedAt: z.ZodNullable<z.ZodString>;
        tokensUsed: z.ZodNumber;
        cost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }, {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    }>;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    } & {
        socialCR: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        socialCR: number;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        socialCR: number;
    }>;
    usageStats: z.ZodObject<{
        timesEncountered: z.ZodNumber;
        playerInteractions: z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            outcome: z.ZodString;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            timestamp: string;
            outcome: string;
        }, {
            type: string;
            timestamp: string;
            outcome: string;
        }>, "many">;
        questsGiven: z.ZodNumber;
        favorability: z.ZodNumber;
        memorableQuotes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        timesEncountered: number;
        playerInteractions: {
            type: string;
            timestamp: string;
            outcome: string;
        }[];
        questsGiven: number;
        favorability: number;
        memorableQuotes: string[];
    }, {
        timesEncountered: number;
        playerInteractions: {
            type: string;
            timestamp: string;
            outcome: string;
        }[];
        questsGiven: number;
        favorability: number;
        memorableQuotes: string[];
    }>;
    isPublished: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        socialCR: number;
    };
    tags: string[];
    name: string;
    usageStats: {
        timesEncountered: number;
        playerInteractions: {
            type: string;
            timestamp: string;
            outcome: string;
        }[];
        questsGiven: number;
        favorability: number;
        memorableQuotes: string[];
    };
    isPublished: boolean;
    skills: Record<string, number>;
    race: string;
    occupation: string;
    socialClass: "commoner" | "merchant" | "artisan" | "noble" | "official" | "clergy" | "criminal" | "ruler";
    personality: {
        trait: string;
        ideal: string;
        bond: string;
        flaw: string;
    };
    voice: {
        accent: string;
        pitch: "low" | "high" | "very low" | "average" | "very high";
        volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
        speechPattern: string;
        mannerism: string;
        vocabulary: "common" | "simple" | "educated" | "eloquent";
        catchphrase?: string | undefined;
    };
    interactionStyle: {
        approachability: number;
        trustworthiness: number;
        helpfulness: number;
        patience: number;
        humor: number;
        intelligence: number;
    };
    dialogueSamples: {
        text: string;
        context: string;
    }[];
    secrets: {
        secret: string;
        severity: "minor" | "moderate" | "major" | "critical";
        knownBy: string[];
    }[];
    goals: {
        shortTerm: string[];
        longTerm: string[];
        hidden: string[];
    };
    combatCapable: boolean;
    schedule: Record<string, string>;
    relationships: {
        type: string;
        description: string;
        targetId: string;
        name: string;
        strength: number;
        established: string;
    }[];
    questHooks: {
        type: "personal" | "faction" | "main" | "side";
        title: string;
        description: string;
        level: number;
        reward?: string | undefined;
    }[];
    plotRelevance: "none" | "minor" | "moderate" | "major" | "critical";
    wealth: "destitute" | "poor" | "modest" | "comfortable" | "wealthy" | "aristocratic";
    possessions: {
        description: string;
        name: string;
        magical: boolean;
        value?: number | undefined;
    }[];
    services: {
        description: string;
        name: string;
        availability: string;
        cost?: string | undefined;
    }[];
    title?: string | undefined;
    deletedAt?: string | undefined;
    location?: string | undefined;
    chapterId?: string | undefined;
    weight?: string | undefined;
    subrace?: string | undefined;
    gender?: string | undefined;
    age?: number | undefined;
    faction?: string | undefined;
    appearance?: string | undefined;
    height?: string | undefined;
    background?: string | undefined;
    stats?: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    } | undefined;
}, {
    id: string;
    generationSettings: {
        aiGenerated: boolean;
        model: string | null;
        prompt: string | null;
        temperature: number;
        maxTokens: number;
        generatedAt: string | null;
        tokensUsed: number;
        cost: number;
    };
    updatedAt: string;
    version: number;
    createdAt: string;
    projectId: string;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
        socialCR: number;
    };
    tags: string[];
    name: string;
    usageStats: {
        timesEncountered: number;
        playerInteractions: {
            type: string;
            timestamp: string;
            outcome: string;
        }[];
        questsGiven: number;
        favorability: number;
        memorableQuotes: string[];
    };
    isPublished: boolean;
    skills: Record<string, number>;
    race: string;
    occupation: string;
    socialClass: "commoner" | "merchant" | "artisan" | "noble" | "official" | "clergy" | "criminal" | "ruler";
    personality: {
        trait: string;
        ideal: string;
        bond: string;
        flaw: string;
    };
    voice: {
        accent: string;
        pitch: "low" | "high" | "very low" | "average" | "very high";
        volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
        speechPattern: string;
        mannerism: string;
        vocabulary: "common" | "simple" | "educated" | "eloquent";
        catchphrase?: string | undefined;
    };
    interactionStyle: {
        approachability: number;
        trustworthiness: number;
        helpfulness: number;
        patience: number;
        humor: number;
        intelligence: number;
    };
    dialogueSamples: {
        text: string;
        context: string;
    }[];
    secrets: {
        secret: string;
        severity: "minor" | "moderate" | "major" | "critical";
        knownBy: string[];
    }[];
    goals: {
        shortTerm: string[];
        longTerm: string[];
        hidden: string[];
    };
    combatCapable: boolean;
    schedule: Record<string, string>;
    relationships: {
        type: string;
        description: string;
        targetId: string;
        name: string;
        strength: number;
        established: string;
    }[];
    questHooks: {
        type: "personal" | "faction" | "main" | "side";
        title: string;
        description: string;
        level: number;
        reward?: string | undefined;
    }[];
    plotRelevance: "none" | "minor" | "moderate" | "major" | "critical";
    wealth: "destitute" | "poor" | "modest" | "comfortable" | "wealthy" | "aristocratic";
    possessions: {
        description: string;
        name: string;
        magical: boolean;
        value?: number | undefined;
    }[];
    services: {
        description: string;
        name: string;
        availability: string;
        cost?: string | undefined;
    }[];
    title?: string | undefined;
    deletedAt?: string | undefined;
    location?: string | undefined;
    chapterId?: string | undefined;
    weight?: string | undefined;
    subrace?: string | undefined;
    gender?: string | undefined;
    age?: number | undefined;
    faction?: string | undefined;
    appearance?: string | undefined;
    height?: string | undefined;
    background?: string | undefined;
    stats?: {
        str: number;
        dex: number;
        con: number;
        int: number;
        wis: number;
        cha: number;
    } | undefined;
}>;
export declare const TemplateCategorySchema: z.ZodEnum<["encounter", "npc", "location", "quest", "item", "organization", "event"]>;
export declare const VariableTypeSchema: z.ZodEnum<["string", "number", "boolean", "array", "object", "dice"]>;
export declare const TemplateVariableSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["string", "number", "boolean", "array", "object", "dice"]>;
    description: z.ZodString;
    required: z.ZodBoolean;
    defaultValue: z.ZodOptional<z.ZodUnknown>;
    exampleValue: z.ZodOptional<z.ZodUnknown>;
    validation: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        pattern: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: string | undefined;
    }, {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "number" | "boolean" | "object" | "array" | "dice";
    description: string;
    name: string;
    required: boolean;
    validation?: {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: string | undefined;
    } | undefined;
    defaultValue?: unknown;
    exampleValue?: unknown;
}, {
    type: "string" | "number" | "boolean" | "object" | "array" | "dice";
    description: string;
    name: string;
    required: boolean;
    validation?: {
        options?: string[] | undefined;
        min?: number | undefined;
        max?: number | undefined;
        pattern?: string | undefined;
    } | undefined;
    defaultValue?: unknown;
    exampleValue?: unknown;
}>;
export declare const TemplateExampleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    variables: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    expectedOutput: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    name: string;
    variables: Record<string, unknown>;
    expectedOutput: string;
}, {
    description: string;
    name: string;
    variables: Record<string, unknown>;
    expectedOutput: string;
}>;
export declare const TemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["encounter", "npc", "location", "quest", "item", "organization", "event"]>;
    subcategory: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    variables: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "number", "boolean", "array", "object", "dice"]>;
        description: z.ZodString;
        required: z.ZodBoolean;
        defaultValue: z.ZodOptional<z.ZodUnknown>;
        exampleValue: z.ZodOptional<z.ZodUnknown>;
        validation: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            pattern: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        }, {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "string" | "number" | "boolean" | "object" | "array" | "dice";
        description: string;
        name: string;
        required: boolean;
        validation?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        } | undefined;
        defaultValue?: unknown;
        exampleValue?: unknown;
    }, {
        type: "string" | "number" | "boolean" | "object" | "array" | "dice";
        description: string;
        name: string;
        required: boolean;
        validation?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        } | undefined;
        defaultValue?: unknown;
        exampleValue?: unknown;
    }>, "many">;
    configuration: z.ZodObject<{
        outputFormat: z.ZodEnum<["markdown", "html", "json"]>;
        allowCustomization: z.ZodBoolean;
        requiresValidation: z.ZodBoolean;
        autoGenerate: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        outputFormat: "markdown" | "html" | "json";
        allowCustomization: boolean;
        requiresValidation: boolean;
        autoGenerate: boolean;
    }, {
        outputFormat: "markdown" | "html" | "json";
        allowCustomization: boolean;
        requiresValidation: boolean;
        autoGenerate: boolean;
    }>;
    compatibleWith: z.ZodEffects<z.ZodObject<{
        partyLevels: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        partySizes: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        systems: z.ZodArray<z.ZodString, "many">;
        themes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    }, {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    }>, {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    }, {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    }>;
    createdBy: z.ZodString;
    isOfficial: z.ZodBoolean;
    isPublic: z.ZodBoolean;
    isPublished: z.ZodBoolean;
    publishedAt: z.ZodOptional<z.ZodString>;
    usageCount: z.ZodNumber;
    rating: z.ZodOptional<z.ZodNumber>;
    ratingCount: z.ZodNumber;
    qualityScore: z.ZodNumber;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }>;
    dependencies: z.ZodArray<z.ZodString, "many">;
    examples: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        variables: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        expectedOutput: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        name: string;
        variables: Record<string, unknown>;
        expectedOutput: string;
    }, {
        description: string;
        name: string;
        variables: Record<string, unknown>;
        expectedOutput: string;
    }>, "many">;
    documentation: z.ZodOptional<z.ZodString>;
    marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    parentTemplateId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: string;
    isPublic: boolean;
    version: number;
    createdAt: string;
    content: string;
    dependencies: string[];
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    name: string;
    isPublished: boolean;
    variables: {
        type: "string" | "number" | "boolean" | "object" | "array" | "dice";
        description: string;
        name: string;
        required: boolean;
        validation?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        } | undefined;
        defaultValue?: unknown;
        exampleValue?: unknown;
    }[];
    category: "location" | "npc" | "encounter" | "quest" | "item" | "organization" | "event";
    configuration: {
        outputFormat: "markdown" | "html" | "json";
        allowCustomization: boolean;
        requiresValidation: boolean;
        autoGenerate: boolean;
    };
    compatibleWith: {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    };
    createdBy: string;
    isOfficial: boolean;
    usageCount: number;
    ratingCount: number;
    qualityScore: number;
    examples: {
        description: string;
        name: string;
        variables: Record<string, unknown>;
        expectedOutput: string;
    }[];
    description?: string | undefined;
    publishedAt?: string | undefined;
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
    rating?: number | undefined;
    subcategory?: string | undefined;
    documentation?: string | undefined;
    parentTemplateId?: string | undefined;
}, {
    id: string;
    updatedAt: string;
    isPublic: boolean;
    version: number;
    createdAt: string;
    content: string;
    dependencies: string[];
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    name: string;
    isPublished: boolean;
    variables: {
        type: "string" | "number" | "boolean" | "object" | "array" | "dice";
        description: string;
        name: string;
        required: boolean;
        validation?: {
            options?: string[] | undefined;
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
        } | undefined;
        defaultValue?: unknown;
        exampleValue?: unknown;
    }[];
    category: "location" | "npc" | "encounter" | "quest" | "item" | "organization" | "event";
    configuration: {
        outputFormat: "markdown" | "html" | "json";
        allowCustomization: boolean;
        requiresValidation: boolean;
        autoGenerate: boolean;
    };
    compatibleWith: {
        themes: string[];
        partyLevels: [number, number];
        partySizes: [number, number];
        systems: string[];
    };
    createdBy: string;
    isOfficial: boolean;
    usageCount: number;
    ratingCount: number;
    qualityScore: number;
    examples: {
        description: string;
        name: string;
        variables: Record<string, unknown>;
        expectedOutput: string;
    }[];
    description?: string | undefined;
    publishedAt?: string | undefined;
    marketplaceData?: Record<string, unknown> | undefined;
    deletedAt?: string | undefined;
    rating?: number | undefined;
    subcategory?: string | undefined;
    documentation?: string | undefined;
    parentTemplateId?: string | undefined;
}>;
export declare const EntityTypeSchema: z.ZodEnum<["project", "chapter", "section", "encounter", "statblock", "magicitem", "npc", "template"]>;
export declare const ChangeTypeSchema: z.ZodEnum<["major", "minor", "patch", "hotfix"]>;
export declare const ReviewStatusSchema: z.ZodEnum<["pending", "approved", "rejected", "auto-approved"]>;
export declare const RetentionPolicySchema: z.ZodEnum<["permanent", "long-term", "medium-term", "short-term"]>;
export declare const VersionDiffSchema: z.ZodObject<{
    additions: z.ZodNumber;
    deletions: z.ZodNumber;
    modifications: z.ZodNumber;
    details: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["addition", "deletion", "modification"]>;
        line: z.ZodNumber;
        content: z.ZodOptional<z.ZodString>;
        old: z.ZodOptional<z.ZodString>;
        new: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "addition" | "deletion" | "modification";
        line: number;
        content?: string | undefined;
        old?: string | undefined;
        new?: string | undefined;
    }, {
        type: "addition" | "deletion" | "modification";
        line: number;
        content?: string | undefined;
        old?: string | undefined;
        new?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    additions: number;
    deletions: number;
    modifications: number;
    details: {
        type: "addition" | "deletion" | "modification";
        line: number;
        content?: string | undefined;
        old?: string | undefined;
        new?: string | undefined;
    }[];
}, {
    additions: number;
    deletions: number;
    modifications: number;
    details: {
        type: "addition" | "deletion" | "modification";
        line: number;
        content?: string | undefined;
        old?: string | undefined;
        new?: string | undefined;
    }[];
}>;
export declare const VersionSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    entityType: z.ZodEnum<["project", "chapter", "section", "encounter", "statblock", "magicitem", "npc", "template"]>;
    entityId: z.ZodString;
    versionNumber: z.ZodNumber;
    semanticVersion: z.ZodString;
    content: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    contentHash: z.ZodString;
    changeType: z.ZodEnum<["major", "minor", "patch", "hotfix"]>;
    changeDescription: z.ZodOptional<z.ZodString>;
    diffSummary: z.ZodOptional<z.ZodObject<{
        additions: z.ZodNumber;
        deletions: z.ZodNumber;
        modifications: z.ZodNumber;
        details: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["addition", "deletion", "modification"]>;
            line: z.ZodNumber;
            content: z.ZodOptional<z.ZodString>;
            old: z.ZodOptional<z.ZodString>;
            new: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }, {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    }, {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    }>>;
    createdBy: z.ZodString;
    reviewStatus: z.ZodEnum<["pending", "approved", "rejected", "auto-approved"]>;
    reviewedBy: z.ZodOptional<z.ZodString>;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewNotes: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodBoolean;
    publishedAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodBoolean;
    branchName: z.ZodString;
    parentVersionId: z.ZodOptional<z.ZodString>;
    mergeSourceId: z.ZodOptional<z.ZodString>;
    isBackup: z.ZodBoolean;
    backupReason: z.ZodOptional<z.ZodString>;
    fullSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    validationResults: z.ZodObject<{
        isValid: z.ZodBoolean;
        errors: z.ZodArray<z.ZodString, "many">;
        warnings: z.ZodArray<z.ZodString, "many">;
        lastValidated: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }, {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    }>;
    accessCount: z.ZodNumber;
    restoreCount: z.ZodNumber;
    expiresAt: z.ZodOptional<z.ZodString>;
    retentionPolicy: z.ZodEnum<["permanent", "long-term", "medium-term", "short-term"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: string;
    createdAt: string;
    content: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    isPublished: boolean;
    createdBy: string;
    entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    entityId: string;
    versionNumber: number;
    semanticVersion: string;
    contentHash: string;
    changeType: "minor" | "major" | "patch" | "hotfix";
    reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
    isActive: boolean;
    branchName: string;
    isBackup: boolean;
    accessCount: number;
    restoreCount: number;
    retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
    metadata: Record<string, unknown>;
    publishedAt?: string | undefined;
    changeDescription?: string | undefined;
    diffSummary?: {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    } | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNotes?: string | undefined;
    parentVersionId?: string | undefined;
    mergeSourceId?: string | undefined;
    backupReason?: string | undefined;
    fullSnapshot?: Record<string, unknown> | undefined;
    expiresAt?: string | undefined;
}, {
    id: string;
    updatedAt: string;
    createdAt: string;
    content: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    isPublished: boolean;
    createdBy: string;
    entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    entityId: string;
    versionNumber: number;
    semanticVersion: string;
    contentHash: string;
    changeType: "minor" | "major" | "patch" | "hotfix";
    reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
    isActive: boolean;
    branchName: string;
    isBackup: boolean;
    accessCount: number;
    restoreCount: number;
    retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
    metadata: Record<string, unknown>;
    publishedAt?: string | undefined;
    changeDescription?: string | undefined;
    diffSummary?: {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    } | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNotes?: string | undefined;
    parentVersionId?: string | undefined;
    mergeSourceId?: string | undefined;
    backupReason?: string | undefined;
    fullSnapshot?: Record<string, unknown> | undefined;
    expiresAt?: string | undefined;
}>, {
    id: string;
    updatedAt: string;
    createdAt: string;
    content: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    isPublished: boolean;
    createdBy: string;
    entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    entityId: string;
    versionNumber: number;
    semanticVersion: string;
    contentHash: string;
    changeType: "minor" | "major" | "patch" | "hotfix";
    reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
    isActive: boolean;
    branchName: string;
    isBackup: boolean;
    accessCount: number;
    restoreCount: number;
    retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
    metadata: Record<string, unknown>;
    publishedAt?: string | undefined;
    changeDescription?: string | undefined;
    diffSummary?: {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    } | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNotes?: string | undefined;
    parentVersionId?: string | undefined;
    mergeSourceId?: string | undefined;
    backupReason?: string | undefined;
    fullSnapshot?: Record<string, unknown> | undefined;
    expiresAt?: string | undefined;
}, {
    id: string;
    updatedAt: string;
    createdAt: string;
    content: Record<string, unknown>;
    validationResults: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        lastValidated: string | null;
    };
    tags: string[];
    isPublished: boolean;
    createdBy: string;
    entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    entityId: string;
    versionNumber: number;
    semanticVersion: string;
    contentHash: string;
    changeType: "minor" | "major" | "patch" | "hotfix";
    reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
    isActive: boolean;
    branchName: string;
    isBackup: boolean;
    accessCount: number;
    restoreCount: number;
    retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
    metadata: Record<string, unknown>;
    publishedAt?: string | undefined;
    changeDescription?: string | undefined;
    diffSummary?: {
        additions: number;
        deletions: number;
        modifications: number;
        details: {
            type: "addition" | "deletion" | "modification";
            line: number;
            content?: string | undefined;
            old?: string | undefined;
            new?: string | undefined;
        }[];
    } | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    reviewNotes?: string | undefined;
    parentVersionId?: string | undefined;
    mergeSourceId?: string | undefined;
    backupReason?: string | undefined;
    fullSnapshot?: Record<string, unknown> | undefined;
    expiresAt?: string | undefined;
}>;
export declare const ContentBlockTypeSchema: z.ZodEnum<["text", "statblock", "table", "boxedtext", "sidebar", "image", "map", "handout"]>;
export declare const ContentBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["text", "statblock", "table", "boxedtext", "sidebar", "image", "map", "handout"]>;
    content: z.ZodString;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    styling: z.ZodOptional<z.ZodObject<{
        className: z.ZodOptional<z.ZodString>;
        customCSS: z.ZodOptional<z.ZodString>;
        layout: z.ZodOptional<z.ZodEnum<["full", "half", "third", "quarter"]>>;
    }, "strip", z.ZodTypeAny, {
        className?: string | undefined;
        customCSS?: string | undefined;
        layout?: "full" | "half" | "third" | "quarter" | undefined;
    }, {
        className?: string | undefined;
        customCSS?: string | undefined;
        layout?: "full" | "half" | "third" | "quarter" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image";
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    styling?: {
        className?: string | undefined;
        customCSS?: string | undefined;
        layout?: "full" | "half" | "third" | "quarter" | undefined;
    } | undefined;
}, {
    type: "map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image";
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    styling?: {
        className?: string | undefined;
        customCSS?: string | undefined;
        layout?: "full" | "half" | "third" | "quarter" | undefined;
    } | undefined;
}>;
export declare const SearchFiltersSchema: z.ZodEffects<z.ZodObject<{
    entityTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["project", "chapter", "section", "encounter", "statblock", "magicitem", "npc", "template"]>, "many">>;
    contentTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["text", "statblock", "table", "boxedtext", "sidebar", "image", "map", "handout"]>, "many">>;
    challengeRating: z.ZodOptional<z.ZodObject<{
        min: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
        max: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
    }, {
        min: number;
        max: number;
    }>>;
    partyLevel: z.ZodOptional<z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
    }, {
        min: number;
        max: number;
    }>>;
    difficulty: z.ZodOptional<z.ZodArray<z.ZodEnum<["trivial", "easy", "medium", "hard", "deadly"]>, "many">>;
    rarity: z.ZodOptional<z.ZodArray<z.ZodEnum<["common", "uncommon", "rare", "very rare", "legendary", "artifact"]>, "many">>;
    itemTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["weapon", "armor", "shield", "wondrous item", "potion", "scroll", "ring", "rod", "staff", "wand", "tool", "instrument", "vehicle", "other"]>, "many">>;
    encounterTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["combat", "social", "exploration", "puzzle", "mixed"]>, "many">>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    isOfficial: z.ZodOptional<z.ZodBoolean>;
    minRating: z.ZodOptional<z.ZodNumber>;
    minUsageCount: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    updatedAfter: z.ZodOptional<z.ZodString>;
    updatedBefore: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    partyLevel?: {
        min: number;
        max: number;
    } | undefined;
    difficulty?: ("easy" | "medium" | "hard" | "deadly" | "trivial")[] | undefined;
    tags?: string[] | undefined;
    challengeRating?: {
        min: number;
        max: number;
    } | undefined;
    isPublished?: boolean | undefined;
    rarity?: ("rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact")[] | undefined;
    isOfficial?: boolean | undefined;
    entityTypes?: ("chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template")[] | undefined;
    contentTypes?: ("map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image")[] | undefined;
    itemTypes?: ("weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other")[] | undefined;
    encounterTypes?: ("combat" | "social" | "exploration" | "puzzle" | "mixed")[] | undefined;
    minRating?: number | undefined;
    minUsageCount?: number | undefined;
    categories?: string[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
}, {
    partyLevel?: {
        min: number;
        max: number;
    } | undefined;
    difficulty?: ("easy" | "medium" | "hard" | "deadly" | "trivial")[] | undefined;
    tags?: string[] | undefined;
    challengeRating?: {
        min: number;
        max: number;
    } | undefined;
    isPublished?: boolean | undefined;
    rarity?: ("rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact")[] | undefined;
    isOfficial?: boolean | undefined;
    entityTypes?: ("chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template")[] | undefined;
    contentTypes?: ("map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image")[] | undefined;
    itemTypes?: ("weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other")[] | undefined;
    encounterTypes?: ("combat" | "social" | "exploration" | "puzzle" | "mixed")[] | undefined;
    minRating?: number | undefined;
    minUsageCount?: number | undefined;
    categories?: string[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
}>, {
    partyLevel?: {
        min: number;
        max: number;
    } | undefined;
    difficulty?: ("easy" | "medium" | "hard" | "deadly" | "trivial")[] | undefined;
    tags?: string[] | undefined;
    challengeRating?: {
        min: number;
        max: number;
    } | undefined;
    isPublished?: boolean | undefined;
    rarity?: ("rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact")[] | undefined;
    isOfficial?: boolean | undefined;
    entityTypes?: ("chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template")[] | undefined;
    contentTypes?: ("map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image")[] | undefined;
    itemTypes?: ("weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other")[] | undefined;
    encounterTypes?: ("combat" | "social" | "exploration" | "puzzle" | "mixed")[] | undefined;
    minRating?: number | undefined;
    minUsageCount?: number | undefined;
    categories?: string[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
}, {
    partyLevel?: {
        min: number;
        max: number;
    } | undefined;
    difficulty?: ("easy" | "medium" | "hard" | "deadly" | "trivial")[] | undefined;
    tags?: string[] | undefined;
    challengeRating?: {
        min: number;
        max: number;
    } | undefined;
    isPublished?: boolean | undefined;
    rarity?: ("rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact")[] | undefined;
    isOfficial?: boolean | undefined;
    entityTypes?: ("chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template")[] | undefined;
    contentTypes?: ("map" | "text" | "statblock" | "table" | "boxedtext" | "sidebar" | "handout" | "image")[] | undefined;
    itemTypes?: ("weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other")[] | undefined;
    encounterTypes?: ("combat" | "social" | "exploration" | "puzzle" | "mixed")[] | undefined;
    minRating?: number | undefined;
    minUsageCount?: number | undefined;
    categories?: string[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    updatedAfter?: string | undefined;
    updatedBefore?: string | undefined;
}>;
export declare const SearchResultSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["project", "chapter", "section", "encounter", "statblock", "magicitem", "npc", "template"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodUnknown;
    relevanceScore: z.ZodNumber;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    id: string;
    title: string;
    metadata: Record<string, unknown>;
    relevanceScore: number;
    description?: string | undefined;
    content?: unknown;
    highlights?: string[] | undefined;
}, {
    type: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
    id: string;
    title: string;
    metadata: Record<string, unknown>;
    relevanceScore: number;
    description?: string | undefined;
    content?: unknown;
    highlights?: string[] | undefined;
}>;
export declare const APIErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
}, {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
}>;
export declare const PaginationMetaSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasNext: z.ZodBoolean;
    hasPrev: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    totalPages: number;
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}, {
    totalPages: number;
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}>;
export declare const APIResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodObject<{
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }>>;
        timing: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            requestId: string;
        }, {
            duration: number;
            requestId: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodObject<{
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }>>;
        timing: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            requestId: string;
        }, {
            duration: number;
            requestId: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }>>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodObject<{
        pagination: z.ZodOptional<z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }>>;
        timing: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            requestId: string;
        }, {
            duration: number;
            requestId: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }, {
        pagination?: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        } | undefined;
        timing?: {
            duration: number;
            requestId: string;
        } | undefined;
    }>>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const PaginatedResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<T, "many">;
    meta: z.ZodObject<{
        pagination: z.ZodObject<{
            page: z.ZodNumber;
            limit: z.ZodNumber;
            total: z.ZodNumber;
            totalPages: z.ZodNumber;
            hasNext: z.ZodBoolean;
            hasPrev: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }, {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        pagination: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }, {
        pagination: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    success: true;
    data: T["_output"][];
    meta: {
        pagination: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}, {
    success: true;
    data: T["_input"][];
    meta: {
        pagination: {
            totalPages: number;
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}>;
export { EntityIdSchema, UserIdSchema, DateStringSchema, SizeSchema, AbilityScoresSchema, DiceNotationSchema, DamageTypeSchema, ConditionSchema, ChallengeRatingSchema, SystemDesignBudgetSchema, XPBudgetSchema, LegalComplianceSchema, GenerationSettingsSchema, ValidationResultsSchema, ProjectSchema, ChapterSchema, SectionSchema, EncounterSchema, StatBlockSchema, MagicItemSchema, NPCSchema, TemplateSchema, VersionSchema, ContentBlockSchema, SearchFiltersSchema, SearchResultSchema, APIResponseSchema, PaginatedResponseSchema, };
export declare const SchemaMap: {
    readonly Project: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        systemDesignBudget: z.ZodEffects<z.ZodObject<{
            partySize: z.ZodNumber;
            partyLevel: z.ZodNumber;
            difficulty: z.ZodEnum<["easy", "medium", "hard", "deadly"]>;
            encounterIntensity: z.ZodEnum<["low", "medium", "high"]>;
            restFrequency: z.ZodEnum<["frequent", "standard", "rare"]>;
            combatWeight: z.ZodNumber;
            explorationWeight: z.ZodNumber;
            socialWeight: z.ZodNumber;
            treasureLevel: z.ZodEnum<["low", "standard", "high"]>;
            magicPrevalence: z.ZodEnum<["rare", "normal", "common"]>;
            treasurePace: z.ZodEnum<["slow", "standard", "fast"]>;
            tone: z.ZodEnum<["gritty", "balanced", "heroic"]>;
            themes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            setting: z.ZodDefault<z.ZodString>;
            targetLength: z.ZodEnum<["short", "medium", "long"]>;
            complexity: z.ZodEnum<["simple", "medium", "complex"]>;
        }, "strip", z.ZodTypeAny, {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            themes: string[];
            setting: string;
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
        }, {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
            themes?: string[] | undefined;
            setting?: string | undefined;
        }>, {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            themes: string[];
            setting: string;
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
        }, {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
            themes?: string[] | undefined;
            setting?: string | undefined;
        }>;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        legalCompliance: z.ZodObject<{
            usageType: z.ZodEnum<["personal", "sharing", "commercial", "marketplace"]>;
            licenseType: z.ZodEnum<["ogl", "cc", "proprietary"]>;
            piFiltered: z.ZodBoolean;
            attributions: z.ZodArray<z.ZodString, "many">;
            lastScanned: z.ZodNullable<z.ZodString>;
            complianceScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            usageType: "personal" | "sharing" | "commercial" | "marketplace";
            licenseType: "ogl" | "cc" | "proprietary";
            piFiltered: boolean;
            attributions: string[];
            lastScanned: string | null;
            complianceScore: number;
        }, {
            usageType: "personal" | "sharing" | "commercial" | "marketplace";
            licenseType: "ogl" | "cc" | "proprietary";
            piFiltered: boolean;
            attributions: string[];
            lastScanned: string | null;
            complianceScore: number;
        }>;
        status: z.ZodEnum<["draft", "generating", "complete", "published", "archived"]>;
        generationProgress: z.ZodOptional<z.ZodObject<{
            step: z.ZodNumber;
            totalSteps: z.ZodNumber;
            percentage: z.ZodNumber;
            currentTask: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            step: number;
            totalSteps: number;
            percentage: number;
            currentTask: string;
            updatedAt: string;
        }, {
            step: number;
            totalSteps: number;
            percentage: number;
            currentTask: string;
            updatedAt: string;
        }>>;
        contentStats: z.ZodObject<{
            totalPages: z.ZodNumber;
            totalWords: z.ZodNumber;
            totalEncounters: z.ZodNumber;
            totalNPCs: z.ZodNumber;
            totalMagicItems: z.ZodNumber;
            totalStatBlocks: z.ZodNumber;
            estimatedPlayTime: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            totalPages: number;
            totalWords: number;
            totalEncounters: number;
            totalNPCs: number;
            totalMagicItems: number;
            totalStatBlocks: number;
            estimatedPlayTime: number;
        }, {
            totalPages: number;
            totalWords: number;
            totalEncounters: number;
            totalNPCs: number;
            totalMagicItems: number;
            totalStatBlocks: number;
            estimatedPlayTime: number;
        }>;
        isPublic: z.ZodBoolean;
        publishedAt: z.ZodOptional<z.ZodString>;
        shareToken: z.ZodString;
        marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        version: z.ZodNumber;
        aiMetadata: z.ZodObject<{
            totalTokensUsed: z.ZodNumber;
            totalCost: z.ZodNumber;
            generationHistory: z.ZodArray<z.ZodObject<{
                timestamp: z.ZodString;
                model: z.ZodString;
                tokensUsed: z.ZodNumber;
                cost: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }, {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }>, "many">;
            lastGenerated: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            totalTokensUsed: number;
            totalCost: number;
            generationHistory: {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }[];
            lastGenerated?: string | undefined;
        }, {
            totalTokensUsed: number;
            totalCost: number;
            generationHistory: {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }[];
            lastGenerated?: string | undefined;
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "draft" | "generating" | "complete" | "published" | "archived";
        id: string;
        userId: string;
        title: string;
        systemDesignBudget: {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            themes: string[];
            setting: string;
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
        };
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        legalCompliance: {
            usageType: "personal" | "sharing" | "commercial" | "marketplace";
            licenseType: "ogl" | "cc" | "proprietary";
            piFiltered: boolean;
            attributions: string[];
            lastScanned: string | null;
            complianceScore: number;
        };
        updatedAt: string;
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
        shareToken: string;
        version: number;
        aiMetadata: {
            totalTokensUsed: number;
            totalCost: number;
            generationHistory: {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }[];
            lastGenerated?: string | undefined;
        };
        createdAt: string;
        description?: string | undefined;
        generationProgress?: {
            step: number;
            totalSteps: number;
            percentage: number;
            currentTask: string;
            updatedAt: string;
        } | undefined;
        publishedAt?: string | undefined;
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
    }, {
        status: "draft" | "generating" | "complete" | "published" | "archived";
        id: string;
        userId: string;
        title: string;
        systemDesignBudget: {
            partySize: number;
            partyLevel: number;
            difficulty: "easy" | "medium" | "hard" | "deadly";
            encounterIntensity: "medium" | "low" | "high";
            restFrequency: "frequent" | "standard" | "rare";
            combatWeight: number;
            explorationWeight: number;
            socialWeight: number;
            treasureLevel: "low" | "high" | "standard";
            magicPrevalence: "rare" | "normal" | "common";
            treasurePace: "standard" | "slow" | "fast";
            tone: "gritty" | "balanced" | "heroic";
            targetLength: "medium" | "short" | "long";
            complexity: "medium" | "simple" | "complex";
            themes?: string[] | undefined;
            setting?: string | undefined;
        };
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        legalCompliance: {
            usageType: "personal" | "sharing" | "commercial" | "marketplace";
            licenseType: "ogl" | "cc" | "proprietary";
            piFiltered: boolean;
            attributions: string[];
            lastScanned: string | null;
            complianceScore: number;
        };
        updatedAt: string;
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
        shareToken: string;
        version: number;
        aiMetadata: {
            totalTokensUsed: number;
            totalCost: number;
            generationHistory: {
                model: string;
                tokensUsed: number;
                cost: number;
                timestamp: string;
            }[];
            lastGenerated?: string | undefined;
        };
        createdAt: string;
        description?: string | undefined;
        generationProgress?: {
            step: number;
            totalSteps: number;
            percentage: number;
            currentTask: string;
            updatedAt: string;
        } | undefined;
        publishedAt?: string | undefined;
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
    }>;
    readonly Chapter: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        parentId: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        slug: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        chapterType: z.ZodEnum<["introduction", "adventure", "location", "npcs", "monsters", "items", "appendix", "handouts", "maps", "tables", "custom"]>;
        orderIndex: z.ZodNumber;
        level: z.ZodNumber;
        content: z.ZodOptional<z.ZodString>;
        generationPrompt: z.ZodOptional<z.ZodString>;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        contentMetadata: z.ZodObject<{
            wordCount: z.ZodNumber;
            estimatedReadTime: z.ZodNumber;
            encounterCount: z.ZodNumber;
            npcCount: z.ZodNumber;
            magicItemCount: z.ZodNumber;
            lastAnalyzed: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            wordCount: number;
            estimatedReadTime: number;
            encounterCount: number;
            npcCount: number;
            magicItemCount: number;
            lastAnalyzed?: string | undefined;
        }, {
            wordCount: number;
            estimatedReadTime: number;
            encounterCount: number;
            npcCount: number;
            magicItemCount: number;
            lastAnalyzed?: string | undefined;
        }>;
        isVisible: z.ZodBoolean;
        isComplete: z.ZodBoolean;
        dependencies: z.ZodArray<z.ZodString, "many">;
        crossReferences: z.ZodArray<z.ZodObject<{
            targetId: z.ZodString;
            targetType: z.ZodEnum<["chapter", "section", "npc", "encounter"]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            targetId: string;
            targetType: "chapter" | "section" | "npc" | "encounter";
        }, {
            description: string;
            targetId: string;
            targetType: "chapter" | "section" | "npc" | "encounter";
        }>, "many">;
        accessibilityMetadata: z.ZodObject<{
            hasAltText: z.ZodBoolean;
            hasProperHeadings: z.ZodBoolean;
            colorContrastChecked: z.ZodBoolean;
            screenReaderFriendly: z.ZodBoolean;
            lastAccessibilityCheck: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            hasAltText: boolean;
            hasProperHeadings: boolean;
            colorContrastChecked: boolean;
            screenReaderFriendly: boolean;
            lastAccessibilityCheck?: string | undefined;
        }, {
            hasAltText: boolean;
            hasProperHeadings: boolean;
            colorContrastChecked: boolean;
            screenReaderFriendly: boolean;
            lastAccessibilityCheck?: string | undefined;
        }>;
        version: z.ZodNumber;
        authorNotes: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        slug: string;
        chapterType: "custom" | "introduction" | "adventure" | "location" | "npcs" | "monsters" | "items" | "appendix" | "handouts" | "maps" | "tables";
        orderIndex: number;
        level: number;
        contentMetadata: {
            wordCount: number;
            estimatedReadTime: number;
            encounterCount: number;
            npcCount: number;
            magicItemCount: number;
            lastAnalyzed?: string | undefined;
        };
        isVisible: boolean;
        isComplete: boolean;
        dependencies: string[];
        crossReferences: {
            description: string;
            targetId: string;
            targetType: "chapter" | "section" | "npc" | "encounter";
        }[];
        accessibilityMetadata: {
            hasAltText: boolean;
            hasProperHeadings: boolean;
            colorContrastChecked: boolean;
            screenReaderFriendly: boolean;
            lastAccessibilityCheck?: string | undefined;
        };
        description?: string | undefined;
        deletedAt?: string | undefined;
        parentId?: string | undefined;
        content?: string | undefined;
        generationPrompt?: string | undefined;
        authorNotes?: string | undefined;
    }, {
        id: string;
        title: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        slug: string;
        chapterType: "custom" | "introduction" | "adventure" | "location" | "npcs" | "monsters" | "items" | "appendix" | "handouts" | "maps" | "tables";
        orderIndex: number;
        level: number;
        contentMetadata: {
            wordCount: number;
            estimatedReadTime: number;
            encounterCount: number;
            npcCount: number;
            magicItemCount: number;
            lastAnalyzed?: string | undefined;
        };
        isVisible: boolean;
        isComplete: boolean;
        dependencies: string[];
        crossReferences: {
            description: string;
            targetId: string;
            targetType: "chapter" | "section" | "npc" | "encounter";
        }[];
        accessibilityMetadata: {
            hasAltText: boolean;
            hasProperHeadings: boolean;
            colorContrastChecked: boolean;
            screenReaderFriendly: boolean;
            lastAccessibilityCheck?: string | undefined;
        };
        description?: string | undefined;
        deletedAt?: string | undefined;
        parentId?: string | undefined;
        content?: string | undefined;
        generationPrompt?: string | undefined;
        authorNotes?: string | undefined;
    }>;
    readonly Section: z.ZodObject<{
        id: z.ZodString;
        chapterId: z.ZodString;
        title: z.ZodString;
        sectionType: z.ZodEnum<["text", "statblock", "encounter", "magicitem", "npc", "location", "table", "boxedtext", "sidebar", "handout", "map", "custom"]>;
        orderIndex: z.ZodNumber;
        content: z.ZodOptional<z.ZodString>;
        contentData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }>;
        accessibilityData: z.ZodObject<{
            altText: z.ZodOptional<z.ZodString>;
            ariaLabel: z.ZodOptional<z.ZodString>;
            headingLevel: z.ZodOptional<z.ZodNumber>;
            isDecorative: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            isDecorative: boolean;
            altText?: string | undefined;
            ariaLabel?: string | undefined;
            headingLevel?: number | undefined;
        }, {
            isDecorative: boolean;
            altText?: string | undefined;
            ariaLabel?: string | undefined;
            headingLevel?: number | undefined;
        }>;
        isVisible: z.ZodBoolean;
        references: z.ZodArray<z.ZodObject<{
            targetId: z.ZodString;
            targetType: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            targetId: string;
            targetType: string;
        }, {
            description: string;
            targetId: string;
            targetType: string;
        }>, "many">;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        orderIndex: number;
        isVisible: boolean;
        chapterId: string;
        sectionType: "map" | "custom" | "location" | "npc" | "encounter" | "text" | "statblock" | "magicitem" | "table" | "boxedtext" | "sidebar" | "handout";
        contentData: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        accessibilityData: {
            isDecorative: boolean;
            altText?: string | undefined;
            ariaLabel?: string | undefined;
            headingLevel?: number | undefined;
        };
        references: {
            description: string;
            targetId: string;
            targetType: string;
        }[];
        tags: string[];
        deletedAt?: string | undefined;
        content?: string | undefined;
    }, {
        id: string;
        title: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        orderIndex: number;
        isVisible: boolean;
        chapterId: string;
        sectionType: "map" | "custom" | "location" | "npc" | "encounter" | "text" | "statblock" | "magicitem" | "table" | "boxedtext" | "sidebar" | "handout";
        contentData: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        accessibilityData: {
            isDecorative: boolean;
            altText?: string | undefined;
            ariaLabel?: string | undefined;
            headingLevel?: number | undefined;
        };
        references: {
            description: string;
            targetId: string;
            targetType: string;
        }[];
        tags: string[];
        deletedAt?: string | undefined;
        content?: string | undefined;
    }>;
    readonly Encounter: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        chapterId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        encounterType: z.ZodEnum<["combat", "social", "exploration", "puzzle", "mixed"]>;
        difficulty: z.ZodEnum<["trivial", "easy", "medium", "hard", "deadly"]>;
        partySize: z.ZodNumber;
        partyLevel: z.ZodNumber;
        creatures: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            quantity: z.ZodNumber;
            challengeRating: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
            xpValue: z.ZodNumber;
            statBlockId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            quantity: number;
            challengeRating: number;
            xpValue: number;
            statBlockId?: string | undefined;
            source?: string | undefined;
        }, {
            name: string;
            quantity: number;
            challengeRating: number;
            xpValue: number;
            statBlockId?: string | undefined;
            source?: string | undefined;
        }>, "many">;
        xpBudget: z.ZodObject<{
            allocated: z.ZodNumber;
            used: z.ZodNumber;
            baseXP: z.ZodNumber;
            adjustedXP: z.ZodNumber;
            efficiency: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            allocated: number;
            used: number;
            baseXP: number;
            adjustedXP: number;
            efficiency: number;
        }, {
            allocated: number;
            used: number;
            baseXP: number;
            adjustedXP: number;
            efficiency: number;
        }>;
        environment: z.ZodObject<{
            terrain: z.ZodEnum<["normal", "difficult", "hazardous"]>;
            lighting: z.ZodEnum<["bright", "dim", "dark"]>;
            weather: z.ZodEnum<["clear", "rain", "storm", "fog", "snow"]>;
            temperature: z.ZodEnum<["frigid", "cold", "temperate", "warm", "hot"]>;
            specialConditions: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
            terrain: "normal" | "difficult" | "hazardous";
            lighting: "bright" | "dim" | "dark";
            weather: "clear" | "rain" | "storm" | "fog" | "snow";
            specialConditions: string[];
        }, {
            temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
            terrain: "normal" | "difficult" | "hazardous";
            lighting: "bright" | "dim" | "dark";
            weather: "clear" | "rain" | "storm" | "fog" | "snow";
            specialConditions: string[];
        }>;
        tactics: z.ZodObject<{
            setup: z.ZodString;
            round1: z.ZodString;
            subsequentRounds: z.ZodString;
            retreat: z.ZodString;
            reinforcements: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            setup: string;
            round1: string;
            subsequentRounds: string;
            retreat: string;
            reinforcements: boolean;
        }, {
            setup: string;
            round1: string;
            subsequentRounds: string;
            retreat: string;
            reinforcements: boolean;
        }>;
        rewards: z.ZodObject<{
            experience: z.ZodNumber;
            treasure: z.ZodArray<z.ZodObject<{
                itemId: z.ZodOptional<z.ZodString>;
                name: z.ZodString;
                description: z.ZodString;
                value: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }, {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }>, "many">;
            storyRewards: z.ZodArray<z.ZodString, "many">;
            information: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            experience: number;
            treasure: {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }[];
            storyRewards: string[];
            information: string[];
        }, {
            experience: number;
            treasure: {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }[];
            storyRewards: string[];
            information: string[];
        }>;
        scaling: z.ZodEffects<z.ZodObject<{
            canScale: z.ZodBoolean;
            minPartySize: z.ZodNumber;
            maxPartySize: z.ZodNumber;
            minLevel: z.ZodNumber;
            maxLevel: z.ZodNumber;
            scalingNotes: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            canScale: boolean;
            minPartySize: number;
            maxPartySize: number;
            minLevel: number;
            maxLevel: number;
            scalingNotes: string;
        }, {
            canScale: boolean;
            minPartySize: number;
            maxPartySize: number;
            minLevel: number;
            maxLevel: number;
            scalingNotes: string;
        }>, {
            canScale: boolean;
            minPartySize: number;
            maxPartySize: number;
            minLevel: number;
            maxLevel: number;
            scalingNotes: string;
        }, {
            canScale: boolean;
            minPartySize: number;
            maxPartySize: number;
            minLevel: number;
            maxLevel: number;
            scalingNotes: string;
        }>;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        balanceAnalysis: z.ZodObject<{
            lastAnalyzed: z.ZodOptional<z.ZodString>;
            isBalanced: z.ZodBoolean;
            warnings: z.ZodArray<z.ZodString, "many">;
            suggestions: z.ZodArray<z.ZodString, "many">;
            difficultyScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            warnings: string[];
            isBalanced: boolean;
            suggestions: string[];
            difficultyScore: number;
            lastAnalyzed?: string | undefined;
        }, {
            warnings: string[];
            isBalanced: boolean;
            suggestions: string[];
            difficultyScore: number;
            lastAnalyzed?: string | undefined;
        }>;
        usageStats: z.ZodObject<{
            timesUsed: z.ZodNumber;
            averageDuration: z.ZodNumber;
            averagePlayerDeaths: z.ZodNumber;
            averageResourcesUsed: z.ZodNumber;
            feedback: z.ZodArray<z.ZodObject<{
                rating: z.ZodNumber;
                comment: z.ZodString;
                timestamp: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                timestamp: string;
                rating: number;
                comment: string;
            }, {
                timestamp: string;
                rating: number;
                comment: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            timesUsed: number;
            averageDuration: number;
            averagePlayerDeaths: number;
            averageResourcesUsed: number;
            feedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
        }, {
            timesUsed: number;
            averageDuration: number;
            averagePlayerDeaths: number;
            averageResourcesUsed: number;
            feedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
        }>;
        isPublished: z.ZodBoolean;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly" | "trivial";
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        tags: string[];
        name: string;
        encounterType: "combat" | "social" | "exploration" | "puzzle" | "mixed";
        creatures: {
            name: string;
            quantity: number;
            challengeRating: number;
            xpValue: number;
            statBlockId?: string | undefined;
            source?: string | undefined;
        }[];
        xpBudget: {
            allocated: number;
            used: number;
            baseXP: number;
            adjustedXP: number;
            efficiency: number;
        };
        environment: {
            temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
            terrain: "normal" | "difficult" | "hazardous";
            lighting: "bright" | "dim" | "dark";
            weather: "clear" | "rain" | "storm" | "fog" | "snow";
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
            treasure: {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }[];
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
        balanceAnalysis: {
            warnings: string[];
            isBalanced: boolean;
            suggestions: string[];
            difficultyScore: number;
            lastAnalyzed?: string | undefined;
        };
        usageStats: {
            timesUsed: number;
            averageDuration: number;
            averagePlayerDeaths: number;
            averageResourcesUsed: number;
            feedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
        };
        isPublished: boolean;
        description?: string | undefined;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
    }, {
        partySize: number;
        partyLevel: number;
        difficulty: "easy" | "medium" | "hard" | "deadly" | "trivial";
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        tags: string[];
        name: string;
        encounterType: "combat" | "social" | "exploration" | "puzzle" | "mixed";
        creatures: {
            name: string;
            quantity: number;
            challengeRating: number;
            xpValue: number;
            statBlockId?: string | undefined;
            source?: string | undefined;
        }[];
        xpBudget: {
            allocated: number;
            used: number;
            baseXP: number;
            adjustedXP: number;
            efficiency: number;
        };
        environment: {
            temperature: "cold" | "frigid" | "temperate" | "warm" | "hot";
            terrain: "normal" | "difficult" | "hazardous";
            lighting: "bright" | "dim" | "dark";
            weather: "clear" | "rain" | "storm" | "fog" | "snow";
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
            treasure: {
                description: string;
                name: string;
                value?: number | undefined;
                itemId?: string | undefined;
            }[];
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
        balanceAnalysis: {
            warnings: string[];
            isBalanced: boolean;
            suggestions: string[];
            difficultyScore: number;
            lastAnalyzed?: string | undefined;
        };
        usageStats: {
            timesUsed: number;
            averageDuration: number;
            averagePlayerDeaths: number;
            averageResourcesUsed: number;
            feedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
        };
        isPublished: boolean;
        description?: string | undefined;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
    }>;
    readonly StatBlock: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        chapterId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        size: z.ZodEnum<["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]>;
        type: z.ZodString;
        subtype: z.ZodOptional<z.ZodString>;
        alignment: z.ZodString;
        armorClass: z.ZodNumber;
        armorClassSource: z.ZodOptional<z.ZodString>;
        hitPoints: z.ZodNumber;
        hitDice: z.ZodOptional<z.ZodString>;
        speed: z.ZodString;
        abilities: z.ZodObject<{
            str: z.ZodNumber;
            dex: z.ZodNumber;
            con: z.ZodNumber;
            int: z.ZodNumber;
            wis: z.ZodNumber;
            cha: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        }, {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        }>;
        savingThrows: z.ZodRecord<z.ZodString, z.ZodNumber>;
        skills: z.ZodRecord<z.ZodString, z.ZodNumber>;
        damageVulnerabilities: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
        damageResistances: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
        damageImmunities: z.ZodArray<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>, "many">;
        conditionImmunities: z.ZodArray<z.ZodEnum<["blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"]>, "many">;
        senses: z.ZodOptional<z.ZodString>;
        languages: z.ZodOptional<z.ZodString>;
        challengeRating: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>;
        specialAbilities: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            recharge: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }>, "many">;
        actions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            recharge: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }>, "many">;
        reactions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            recharge: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }>, "many">;
        legendaryActions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            recharge: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }, {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }>, "many">;
        attacks: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            attackBonus: z.ZodNumber;
            damage: z.ZodString;
            averageDamage: z.ZodNumber;
            reach: z.ZodOptional<z.ZodNumber>;
            range: z.ZodOptional<z.ZodString>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            attackBonus: number;
            damage: string;
            averageDamage: number;
            reach?: number | undefined;
            range?: string | undefined;
        }, {
            description: string;
            name: string;
            attackBonus: number;
            damage: string;
            averageDamage: number;
            reach?: number | undefined;
            range?: string | undefined;
        }>, "many">;
        source: z.ZodOptional<z.ZodString>;
        isOriginal: z.ZodBoolean;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        } & {
            calculatedCR: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<0.125>, z.ZodLiteral<0.25>, z.ZodLiteral<0.5>, z.ZodNumber]>>;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            calculatedCR?: number | undefined;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            calculatedCR?: number | undefined;
        }>;
        usageStats: z.ZodObject<{
            timesUsed: z.ZodNumber;
            averageEncounterCR: z.ZodNumber;
            playerFeedback: z.ZodArray<z.ZodObject<{
                rating: z.ZodNumber;
                comment: z.ZodString;
                timestamp: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                timestamp: string;
                rating: number;
                comment: string;
            }, {
                timestamp: string;
                rating: number;
                comment: string;
            }>, "many">;
            balanceNotes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            timesUsed: number;
            averageEncounterCR: number;
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            balanceNotes: string[];
        }, {
            timesUsed: number;
            averageEncounterCR: number;
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            balanceNotes: string[];
        }>;
        isPublished: z.ZodBoolean;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            calculatedCR?: number | undefined;
        };
        tags: string[];
        name: string;
        challengeRating: number;
        usageStats: {
            timesUsed: number;
            averageEncounterCR: number;
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            balanceNotes: string[];
        };
        isPublished: boolean;
        size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
        alignment: string;
        armorClass: number;
        hitPoints: number;
        speed: string;
        abilities: {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        };
        savingThrows: Record<string, number>;
        skills: Record<string, number>;
        damageVulnerabilities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        damageResistances: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        damageImmunities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        conditionImmunities: ("blinded" | "charmed" | "deafened" | "frightened" | "grappled" | "incapacitated" | "invisible" | "paralyzed" | "petrified" | "poisoned" | "prone" | "restrained" | "stunned" | "unconscious")[];
        specialAbilities: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        actions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        reactions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        legendaryActions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        attacks: {
            description: string;
            name: string;
            attackBonus: number;
            damage: string;
            averageDamage: number;
            reach?: number | undefined;
            range?: string | undefined;
        }[];
        isOriginal: boolean;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
        source?: string | undefined;
        subtype?: string | undefined;
        armorClassSource?: string | undefined;
        hitDice?: string | undefined;
        senses?: string | undefined;
        languages?: string | undefined;
    }, {
        type: string;
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            calculatedCR?: number | undefined;
        };
        tags: string[];
        name: string;
        challengeRating: number;
        usageStats: {
            timesUsed: number;
            averageEncounterCR: number;
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            balanceNotes: string[];
        };
        isPublished: boolean;
        size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
        alignment: string;
        armorClass: number;
        hitPoints: number;
        speed: string;
        abilities: {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        };
        savingThrows: Record<string, number>;
        skills: Record<string, number>;
        damageVulnerabilities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        damageResistances: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        damageImmunities: ("acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder")[];
        conditionImmunities: ("blinded" | "charmed" | "deafened" | "frightened" | "grappled" | "incapacitated" | "invisible" | "paralyzed" | "petrified" | "poisoned" | "prone" | "restrained" | "stunned" | "unconscious")[];
        specialAbilities: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        actions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        reactions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        legendaryActions: {
            description: string;
            name: string;
            cost?: number | undefined;
            recharge?: string | undefined;
        }[];
        attacks: {
            description: string;
            name: string;
            attackBonus: number;
            damage: string;
            averageDamage: number;
            reach?: number | undefined;
            range?: string | undefined;
        }[];
        isOriginal: boolean;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
        source?: string | undefined;
        subtype?: string | undefined;
        armorClassSource?: string | undefined;
        hitDice?: string | undefined;
        senses?: string | undefined;
        languages?: string | undefined;
    }>;
    readonly MagicItem: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        chapterId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        itemType: z.ZodEnum<["weapon", "armor", "shield", "wondrous item", "potion", "scroll", "ring", "rod", "staff", "wand", "tool", "instrument", "vehicle", "other"]>;
        subtype: z.ZodOptional<z.ZodString>;
        rarity: z.ZodEnum<["common", "uncommon", "rare", "very rare", "legendary", "artifact"]>;
        estimatedValue: z.ZodOptional<z.ZodNumber>;
        attunementType: z.ZodEnum<["none", "required", "optional"]>;
        attunementRequirement: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        flavorText: z.ZodOptional<z.ZodString>;
        mechanicalEffects: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            activation: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["passive", "action", "bonus action", "reaction", "minute", "hour"]>;
                cost: z.ZodNumber;
                condition: z.ZodOptional<z.ZodString>;
                range: z.ZodOptional<z.ZodString>;
                duration: z.ZodOptional<z.ZodString>;
                concentration: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            }, {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            activation?: {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            } | undefined;
        }, {
            description: string;
            name: string;
            activation?: {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            } | undefined;
        }>, "many">;
        properties: z.ZodEffects<z.ZodObject<{
            charges: z.ZodBoolean;
            maxCharges: z.ZodOptional<z.ZodNumber>;
            currentCharges: z.ZodOptional<z.ZodNumber>;
            chargeRecovery: z.ZodOptional<z.ZodString>;
            cursed: z.ZodBoolean;
            curseDescription: z.ZodOptional<z.ZodString>;
            sentient: z.ZodBoolean;
            sentientPersonality: z.ZodOptional<z.ZodString>;
            weight: z.ZodOptional<z.ZodNumber>;
            dimensions: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        }, {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        }>, {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        }, {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        }>;
        combatStats: z.ZodObject<{
            attackBonus: z.ZodOptional<z.ZodNumber>;
            damageBonus: z.ZodOptional<z.ZodNumber>;
            damageDice: z.ZodOptional<z.ZodString>;
            damageType: z.ZodOptional<z.ZodEnum<["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"]>>;
            armorClassBonus: z.ZodOptional<z.ZodNumber>;
            magicBonus: z.ZodOptional<z.ZodNumber>;
            criticalRange: z.ZodOptional<z.ZodNumber>;
            specialProperties: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            specialProperties: string[];
            attackBonus?: number | undefined;
            damageBonus?: number | undefined;
            damageDice?: string | undefined;
            damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
            armorClassBonus?: number | undefined;
            magicBonus?: number | undefined;
            criticalRange?: number | undefined;
        }, {
            specialProperties: string[];
            attackBonus?: number | undefined;
            damageBonus?: number | undefined;
            damageDice?: string | undefined;
            damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
            armorClassBonus?: number | undefined;
            magicBonus?: number | undefined;
            criticalRange?: number | undefined;
        }>;
        source: z.ZodOptional<z.ZodString>;
        isOriginal: z.ZodBoolean;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        } & {
            balanceScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            balanceScore: number;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            balanceScore: number;
        }>;
        usageStats: z.ZodObject<{
            timesAwarded: z.ZodNumber;
            playerFeedback: z.ZodArray<z.ZodObject<{
                rating: z.ZodNumber;
                comment: z.ZodString;
                timestamp: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                timestamp: string;
                rating: number;
                comment: string;
            }, {
                timestamp: string;
                rating: number;
                comment: string;
            }>, "many">;
            balanceIssues: z.ZodArray<z.ZodString, "many">;
            popularityScore: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            timesAwarded: number;
            balanceIssues: string[];
            popularityScore: number;
        }, {
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            timesAwarded: number;
            balanceIssues: string[];
            popularityScore: number;
        }>;
        isPublished: z.ZodBoolean;
        marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            balanceScore: number;
        };
        tags: string[];
        name: string;
        usageStats: {
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            timesAwarded: number;
            balanceIssues: string[];
            popularityScore: number;
        };
        isPublished: boolean;
        isOriginal: boolean;
        itemType: "weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other";
        rarity: "rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact";
        attunementType: "none" | "required" | "optional";
        mechanicalEffects: {
            description: string;
            name: string;
            activation?: {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            } | undefined;
        }[];
        properties: {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        };
        combatStats: {
            specialProperties: string[];
            attackBonus?: number | undefined;
            damageBonus?: number | undefined;
            damageDice?: string | undefined;
            damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
            armorClassBonus?: number | undefined;
            magicBonus?: number | undefined;
            criticalRange?: number | undefined;
        };
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
        source?: string | undefined;
        subtype?: string | undefined;
        estimatedValue?: number | undefined;
        attunementRequirement?: string | undefined;
        flavorText?: string | undefined;
    }, {
        id: string;
        description: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            balanceScore: number;
        };
        tags: string[];
        name: string;
        usageStats: {
            playerFeedback: {
                timestamp: string;
                rating: number;
                comment: string;
            }[];
            timesAwarded: number;
            balanceIssues: string[];
            popularityScore: number;
        };
        isPublished: boolean;
        isOriginal: boolean;
        itemType: "weapon" | "armor" | "shield" | "wondrous item" | "potion" | "scroll" | "ring" | "rod" | "staff" | "wand" | "tool" | "instrument" | "vehicle" | "other";
        rarity: "rare" | "common" | "uncommon" | "very rare" | "legendary" | "artifact";
        attunementType: "none" | "required" | "optional";
        mechanicalEffects: {
            description: string;
            name: string;
            activation?: {
                type: "passive" | "action" | "bonus action" | "reaction" | "minute" | "hour";
                cost: number;
                concentration: boolean;
                range?: string | undefined;
                condition?: string | undefined;
                duration?: string | undefined;
            } | undefined;
        }[];
        properties: {
            charges: boolean;
            cursed: boolean;
            sentient: boolean;
            maxCharges?: number | undefined;
            currentCharges?: number | undefined;
            chargeRecovery?: string | undefined;
            curseDescription?: string | undefined;
            sentientPersonality?: string | undefined;
            weight?: number | undefined;
            dimensions?: string | undefined;
        };
        combatStats: {
            specialProperties: string[];
            attackBonus?: number | undefined;
            damageBonus?: number | undefined;
            damageDice?: string | undefined;
            damageType?: "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder" | undefined;
            armorClassBonus?: number | undefined;
            magicBonus?: number | undefined;
            criticalRange?: number | undefined;
        };
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
        chapterId?: string | undefined;
        source?: string | undefined;
        subtype?: string | undefined;
        estimatedValue?: number | undefined;
        attunementRequirement?: string | undefined;
        flavorText?: string | undefined;
    }>;
    readonly NPC: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        chapterId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        race: z.ZodString;
        subrace: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodString>;
        age: z.ZodOptional<z.ZodNumber>;
        occupation: z.ZodString;
        socialClass: z.ZodEnum<["commoner", "merchant", "artisan", "noble", "official", "clergy", "criminal", "ruler"]>;
        faction: z.ZodOptional<z.ZodString>;
        appearance: z.ZodOptional<z.ZodString>;
        height: z.ZodOptional<z.ZodString>;
        weight: z.ZodOptional<z.ZodString>;
        personality: z.ZodObject<{
            trait: z.ZodString;
            ideal: z.ZodString;
            bond: z.ZodString;
            flaw: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            trait: string;
            ideal: string;
            bond: string;
            flaw: string;
        }, {
            trait: string;
            ideal: string;
            bond: string;
            flaw: string;
        }>;
        voice: z.ZodObject<{
            accent: z.ZodString;
            pitch: z.ZodEnum<["very low", "low", "average", "high", "very high"]>;
            volume: z.ZodEnum<["whisper", "quiet", "normal", "loud", "booming"]>;
            speechPattern: z.ZodString;
            mannerism: z.ZodString;
            catchphrase: z.ZodOptional<z.ZodString>;
            vocabulary: z.ZodEnum<["simple", "common", "educated", "eloquent"]>;
        }, "strip", z.ZodTypeAny, {
            accent: string;
            pitch: "low" | "high" | "very low" | "average" | "very high";
            volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
            speechPattern: string;
            mannerism: string;
            vocabulary: "common" | "simple" | "educated" | "eloquent";
            catchphrase?: string | undefined;
        }, {
            accent: string;
            pitch: "low" | "high" | "very low" | "average" | "very high";
            volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
            speechPattern: string;
            mannerism: string;
            vocabulary: "common" | "simple" | "educated" | "eloquent";
            catchphrase?: string | undefined;
        }>;
        interactionStyle: z.ZodObject<{
            approachability: z.ZodNumber;
            trustworthiness: z.ZodNumber;
            helpfulness: z.ZodNumber;
            patience: z.ZodNumber;
            humor: z.ZodNumber;
            intelligence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            approachability: number;
            trustworthiness: number;
            helpfulness: number;
            patience: number;
            humor: number;
            intelligence: number;
        }, {
            approachability: number;
            trustworthiness: number;
            helpfulness: number;
            patience: number;
            humor: number;
            intelligence: number;
        }>;
        dialogueSamples: z.ZodArray<z.ZodObject<{
            context: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            context: string;
        }, {
            text: string;
            context: string;
        }>, "many">;
        background: z.ZodOptional<z.ZodString>;
        secrets: z.ZodArray<z.ZodObject<{
            secret: z.ZodString;
            severity: z.ZodEnum<["minor", "moderate", "major", "critical"]>;
            knownBy: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            secret: string;
            severity: "minor" | "moderate" | "major" | "critical";
            knownBy: string[];
        }, {
            secret: string;
            severity: "minor" | "moderate" | "major" | "critical";
            knownBy: string[];
        }>, "many">;
        goals: z.ZodObject<{
            shortTerm: z.ZodArray<z.ZodString, "many">;
            longTerm: z.ZodArray<z.ZodString, "many">;
            hidden: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            shortTerm: string[];
            longTerm: string[];
            hidden: string[];
        }, {
            shortTerm: string[];
            longTerm: string[];
            hidden: string[];
        }>;
        stats: z.ZodOptional<z.ZodObject<{
            str: z.ZodNumber;
            dex: z.ZodNumber;
            con: z.ZodNumber;
            int: z.ZodNumber;
            wis: z.ZodNumber;
            cha: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        }, {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        }>>;
        skills: z.ZodRecord<z.ZodString, z.ZodNumber>;
        combatCapable: z.ZodBoolean;
        location: z.ZodOptional<z.ZodString>;
        schedule: z.ZodRecord<z.ZodString, z.ZodString>;
        relationships: z.ZodArray<z.ZodObject<{
            targetId: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            description: z.ZodString;
            strength: z.ZodNumber;
            established: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            description: string;
            targetId: string;
            name: string;
            strength: number;
            established: string;
        }, {
            type: string;
            description: string;
            targetId: string;
            name: string;
            strength: number;
            established: string;
        }>, "many">;
        questHooks: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<["main", "side", "personal", "faction"]>;
            level: z.ZodNumber;
            reward: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "personal" | "faction" | "main" | "side";
            title: string;
            description: string;
            level: number;
            reward?: string | undefined;
        }, {
            type: "personal" | "faction" | "main" | "side";
            title: string;
            description: string;
            level: number;
            reward?: string | undefined;
        }>, "many">;
        plotRelevance: z.ZodEnum<["none", "minor", "moderate", "major", "critical"]>;
        wealth: z.ZodEnum<["destitute", "poor", "modest", "comfortable", "wealthy", "aristocratic"]>;
        possessions: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            value: z.ZodOptional<z.ZodNumber>;
            magical: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            magical: boolean;
            value?: number | undefined;
        }, {
            description: string;
            name: string;
            magical: boolean;
            value?: number | undefined;
        }>, "many">;
        services: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            cost: z.ZodOptional<z.ZodString>;
            availability: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            availability: string;
            cost?: string | undefined;
        }, {
            description: string;
            name: string;
            availability: string;
            cost?: string | undefined;
        }>, "many">;
        generationSettings: z.ZodObject<{
            aiGenerated: z.ZodBoolean;
            model: z.ZodNullable<z.ZodString>;
            prompt: z.ZodNullable<z.ZodString>;
            temperature: z.ZodNumber;
            maxTokens: z.ZodNumber;
            generatedAt: z.ZodNullable<z.ZodString>;
            tokensUsed: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }, {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        }>;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        } & {
            socialCR: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            socialCR: number;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            socialCR: number;
        }>;
        usageStats: z.ZodObject<{
            timesEncountered: z.ZodNumber;
            playerInteractions: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                outcome: z.ZodString;
                timestamp: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                timestamp: string;
                outcome: string;
            }, {
                type: string;
                timestamp: string;
                outcome: string;
            }>, "many">;
            questsGiven: z.ZodNumber;
            favorability: z.ZodNumber;
            memorableQuotes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            timesEncountered: number;
            playerInteractions: {
                type: string;
                timestamp: string;
                outcome: string;
            }[];
            questsGiven: number;
            favorability: number;
            memorableQuotes: string[];
        }, {
            timesEncountered: number;
            playerInteractions: {
                type: string;
                timestamp: string;
                outcome: string;
            }[];
            questsGiven: number;
            favorability: number;
            memorableQuotes: string[];
        }>;
        isPublished: z.ZodBoolean;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            socialCR: number;
        };
        tags: string[];
        name: string;
        usageStats: {
            timesEncountered: number;
            playerInteractions: {
                type: string;
                timestamp: string;
                outcome: string;
            }[];
            questsGiven: number;
            favorability: number;
            memorableQuotes: string[];
        };
        isPublished: boolean;
        skills: Record<string, number>;
        race: string;
        occupation: string;
        socialClass: "commoner" | "merchant" | "artisan" | "noble" | "official" | "clergy" | "criminal" | "ruler";
        personality: {
            trait: string;
            ideal: string;
            bond: string;
            flaw: string;
        };
        voice: {
            accent: string;
            pitch: "low" | "high" | "very low" | "average" | "very high";
            volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
            speechPattern: string;
            mannerism: string;
            vocabulary: "common" | "simple" | "educated" | "eloquent";
            catchphrase?: string | undefined;
        };
        interactionStyle: {
            approachability: number;
            trustworthiness: number;
            helpfulness: number;
            patience: number;
            humor: number;
            intelligence: number;
        };
        dialogueSamples: {
            text: string;
            context: string;
        }[];
        secrets: {
            secret: string;
            severity: "minor" | "moderate" | "major" | "critical";
            knownBy: string[];
        }[];
        goals: {
            shortTerm: string[];
            longTerm: string[];
            hidden: string[];
        };
        combatCapable: boolean;
        schedule: Record<string, string>;
        relationships: {
            type: string;
            description: string;
            targetId: string;
            name: string;
            strength: number;
            established: string;
        }[];
        questHooks: {
            type: "personal" | "faction" | "main" | "side";
            title: string;
            description: string;
            level: number;
            reward?: string | undefined;
        }[];
        plotRelevance: "none" | "minor" | "moderate" | "major" | "critical";
        wealth: "destitute" | "poor" | "modest" | "comfortable" | "wealthy" | "aristocratic";
        possessions: {
            description: string;
            name: string;
            magical: boolean;
            value?: number | undefined;
        }[];
        services: {
            description: string;
            name: string;
            availability: string;
            cost?: string | undefined;
        }[];
        title?: string | undefined;
        deletedAt?: string | undefined;
        location?: string | undefined;
        chapterId?: string | undefined;
        weight?: string | undefined;
        subrace?: string | undefined;
        gender?: string | undefined;
        age?: number | undefined;
        faction?: string | undefined;
        appearance?: string | undefined;
        height?: string | undefined;
        background?: string | undefined;
        stats?: {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        } | undefined;
    }, {
        id: string;
        generationSettings: {
            aiGenerated: boolean;
            model: string | null;
            prompt: string | null;
            temperature: number;
            maxTokens: number;
            generatedAt: string | null;
            tokensUsed: number;
            cost: number;
        };
        updatedAt: string;
        version: number;
        createdAt: string;
        projectId: string;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
            socialCR: number;
        };
        tags: string[];
        name: string;
        usageStats: {
            timesEncountered: number;
            playerInteractions: {
                type: string;
                timestamp: string;
                outcome: string;
            }[];
            questsGiven: number;
            favorability: number;
            memorableQuotes: string[];
        };
        isPublished: boolean;
        skills: Record<string, number>;
        race: string;
        occupation: string;
        socialClass: "commoner" | "merchant" | "artisan" | "noble" | "official" | "clergy" | "criminal" | "ruler";
        personality: {
            trait: string;
            ideal: string;
            bond: string;
            flaw: string;
        };
        voice: {
            accent: string;
            pitch: "low" | "high" | "very low" | "average" | "very high";
            volume: "normal" | "whisper" | "quiet" | "loud" | "booming";
            speechPattern: string;
            mannerism: string;
            vocabulary: "common" | "simple" | "educated" | "eloquent";
            catchphrase?: string | undefined;
        };
        interactionStyle: {
            approachability: number;
            trustworthiness: number;
            helpfulness: number;
            patience: number;
            humor: number;
            intelligence: number;
        };
        dialogueSamples: {
            text: string;
            context: string;
        }[];
        secrets: {
            secret: string;
            severity: "minor" | "moderate" | "major" | "critical";
            knownBy: string[];
        }[];
        goals: {
            shortTerm: string[];
            longTerm: string[];
            hidden: string[];
        };
        combatCapable: boolean;
        schedule: Record<string, string>;
        relationships: {
            type: string;
            description: string;
            targetId: string;
            name: string;
            strength: number;
            established: string;
        }[];
        questHooks: {
            type: "personal" | "faction" | "main" | "side";
            title: string;
            description: string;
            level: number;
            reward?: string | undefined;
        }[];
        plotRelevance: "none" | "minor" | "moderate" | "major" | "critical";
        wealth: "destitute" | "poor" | "modest" | "comfortable" | "wealthy" | "aristocratic";
        possessions: {
            description: string;
            name: string;
            magical: boolean;
            value?: number | undefined;
        }[];
        services: {
            description: string;
            name: string;
            availability: string;
            cost?: string | undefined;
        }[];
        title?: string | undefined;
        deletedAt?: string | undefined;
        location?: string | undefined;
        chapterId?: string | undefined;
        weight?: string | undefined;
        subrace?: string | undefined;
        gender?: string | undefined;
        age?: number | undefined;
        faction?: string | undefined;
        appearance?: string | undefined;
        height?: string | undefined;
        background?: string | undefined;
        stats?: {
            str: number;
            dex: number;
            con: number;
            int: number;
            wis: number;
            cha: number;
        } | undefined;
    }>;
    readonly Template: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["encounter", "npc", "location", "quest", "item", "organization", "event"]>;
        subcategory: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
        variables: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["string", "number", "boolean", "array", "object", "dice"]>;
            description: z.ZodString;
            required: z.ZodBoolean;
            defaultValue: z.ZodOptional<z.ZodUnknown>;
            exampleValue: z.ZodOptional<z.ZodUnknown>;
            validation: z.ZodOptional<z.ZodObject<{
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                pattern: z.ZodOptional<z.ZodString>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            }, {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "string" | "number" | "boolean" | "object" | "array" | "dice";
            description: string;
            name: string;
            required: boolean;
            validation?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            } | undefined;
            defaultValue?: unknown;
            exampleValue?: unknown;
        }, {
            type: "string" | "number" | "boolean" | "object" | "array" | "dice";
            description: string;
            name: string;
            required: boolean;
            validation?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            } | undefined;
            defaultValue?: unknown;
            exampleValue?: unknown;
        }>, "many">;
        configuration: z.ZodObject<{
            outputFormat: z.ZodEnum<["markdown", "html", "json"]>;
            allowCustomization: z.ZodBoolean;
            requiresValidation: z.ZodBoolean;
            autoGenerate: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            outputFormat: "markdown" | "html" | "json";
            allowCustomization: boolean;
            requiresValidation: boolean;
            autoGenerate: boolean;
        }, {
            outputFormat: "markdown" | "html" | "json";
            allowCustomization: boolean;
            requiresValidation: boolean;
            autoGenerate: boolean;
        }>;
        compatibleWith: z.ZodEffects<z.ZodObject<{
            partyLevels: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            partySizes: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            systems: z.ZodArray<z.ZodString, "many">;
            themes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        }, {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        }>, {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        }, {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        }>;
        createdBy: z.ZodString;
        isOfficial: z.ZodBoolean;
        isPublic: z.ZodBoolean;
        isPublished: z.ZodBoolean;
        publishedAt: z.ZodOptional<z.ZodString>;
        usageCount: z.ZodNumber;
        rating: z.ZodOptional<z.ZodNumber>;
        ratingCount: z.ZodNumber;
        qualityScore: z.ZodNumber;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }>;
        dependencies: z.ZodArray<z.ZodString, "many">;
        examples: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            variables: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            expectedOutput: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            name: string;
            variables: Record<string, unknown>;
            expectedOutput: string;
        }, {
            description: string;
            name: string;
            variables: Record<string, unknown>;
            expectedOutput: string;
        }>, "many">;
        documentation: z.ZodOptional<z.ZodString>;
        marketplaceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tags: z.ZodArray<z.ZodString, "many">;
        version: z.ZodNumber;
        parentTemplateId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        updatedAt: string;
        isPublic: boolean;
        version: number;
        createdAt: string;
        content: string;
        dependencies: string[];
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        name: string;
        isPublished: boolean;
        variables: {
            type: "string" | "number" | "boolean" | "object" | "array" | "dice";
            description: string;
            name: string;
            required: boolean;
            validation?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            } | undefined;
            defaultValue?: unknown;
            exampleValue?: unknown;
        }[];
        category: "location" | "npc" | "encounter" | "quest" | "item" | "organization" | "event";
        configuration: {
            outputFormat: "markdown" | "html" | "json";
            allowCustomization: boolean;
            requiresValidation: boolean;
            autoGenerate: boolean;
        };
        compatibleWith: {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        };
        createdBy: string;
        isOfficial: boolean;
        usageCount: number;
        ratingCount: number;
        qualityScore: number;
        examples: {
            description: string;
            name: string;
            variables: Record<string, unknown>;
            expectedOutput: string;
        }[];
        description?: string | undefined;
        publishedAt?: string | undefined;
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
        rating?: number | undefined;
        subcategory?: string | undefined;
        documentation?: string | undefined;
        parentTemplateId?: string | undefined;
    }, {
        id: string;
        updatedAt: string;
        isPublic: boolean;
        version: number;
        createdAt: string;
        content: string;
        dependencies: string[];
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        name: string;
        isPublished: boolean;
        variables: {
            type: "string" | "number" | "boolean" | "object" | "array" | "dice";
            description: string;
            name: string;
            required: boolean;
            validation?: {
                options?: string[] | undefined;
                min?: number | undefined;
                max?: number | undefined;
                pattern?: string | undefined;
            } | undefined;
            defaultValue?: unknown;
            exampleValue?: unknown;
        }[];
        category: "location" | "npc" | "encounter" | "quest" | "item" | "organization" | "event";
        configuration: {
            outputFormat: "markdown" | "html" | "json";
            allowCustomization: boolean;
            requiresValidation: boolean;
            autoGenerate: boolean;
        };
        compatibleWith: {
            themes: string[];
            partyLevels: [number, number];
            partySizes: [number, number];
            systems: string[];
        };
        createdBy: string;
        isOfficial: boolean;
        usageCount: number;
        ratingCount: number;
        qualityScore: number;
        examples: {
            description: string;
            name: string;
            variables: Record<string, unknown>;
            expectedOutput: string;
        }[];
        description?: string | undefined;
        publishedAt?: string | undefined;
        marketplaceData?: Record<string, unknown> | undefined;
        deletedAt?: string | undefined;
        rating?: number | undefined;
        subcategory?: string | undefined;
        documentation?: string | undefined;
        parentTemplateId?: string | undefined;
    }>;
    readonly Version: z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        entityType: z.ZodEnum<["project", "chapter", "section", "encounter", "statblock", "magicitem", "npc", "template"]>;
        entityId: z.ZodString;
        versionNumber: z.ZodNumber;
        semanticVersion: z.ZodString;
        content: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        contentHash: z.ZodString;
        changeType: z.ZodEnum<["major", "minor", "patch", "hotfix"]>;
        changeDescription: z.ZodOptional<z.ZodString>;
        diffSummary: z.ZodOptional<z.ZodObject<{
            additions: z.ZodNumber;
            deletions: z.ZodNumber;
            modifications: z.ZodNumber;
            details: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["addition", "deletion", "modification"]>;
                line: z.ZodNumber;
                content: z.ZodOptional<z.ZodString>;
                old: z.ZodOptional<z.ZodString>;
                new: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }, {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        }, {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        }>>;
        createdBy: z.ZodString;
        reviewStatus: z.ZodEnum<["pending", "approved", "rejected", "auto-approved"]>;
        reviewedBy: z.ZodOptional<z.ZodString>;
        reviewedAt: z.ZodOptional<z.ZodString>;
        reviewNotes: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodBoolean;
        publishedAt: z.ZodOptional<z.ZodString>;
        isActive: z.ZodBoolean;
        branchName: z.ZodString;
        parentVersionId: z.ZodOptional<z.ZodString>;
        mergeSourceId: z.ZodOptional<z.ZodString>;
        isBackup: z.ZodBoolean;
        backupReason: z.ZodOptional<z.ZodString>;
        fullSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        validationResults: z.ZodObject<{
            isValid: z.ZodBoolean;
            errors: z.ZodArray<z.ZodString, "many">;
            warnings: z.ZodArray<z.ZodString, "many">;
            lastValidated: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }, {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        }>;
        accessCount: z.ZodNumber;
        restoreCount: z.ZodNumber;
        expiresAt: z.ZodOptional<z.ZodString>;
        retentionPolicy: z.ZodEnum<["permanent", "long-term", "medium-term", "short-term"]>;
        tags: z.ZodArray<z.ZodString, "many">;
        metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        updatedAt: string;
        createdAt: string;
        content: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        isPublished: boolean;
        createdBy: string;
        entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
        entityId: string;
        versionNumber: number;
        semanticVersion: string;
        contentHash: string;
        changeType: "minor" | "major" | "patch" | "hotfix";
        reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
        isActive: boolean;
        branchName: string;
        isBackup: boolean;
        accessCount: number;
        restoreCount: number;
        retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
        metadata: Record<string, unknown>;
        publishedAt?: string | undefined;
        changeDescription?: string | undefined;
        diffSummary?: {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        } | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNotes?: string | undefined;
        parentVersionId?: string | undefined;
        mergeSourceId?: string | undefined;
        backupReason?: string | undefined;
        fullSnapshot?: Record<string, unknown> | undefined;
        expiresAt?: string | undefined;
    }, {
        id: string;
        updatedAt: string;
        createdAt: string;
        content: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        isPublished: boolean;
        createdBy: string;
        entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
        entityId: string;
        versionNumber: number;
        semanticVersion: string;
        contentHash: string;
        changeType: "minor" | "major" | "patch" | "hotfix";
        reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
        isActive: boolean;
        branchName: string;
        isBackup: boolean;
        accessCount: number;
        restoreCount: number;
        retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
        metadata: Record<string, unknown>;
        publishedAt?: string | undefined;
        changeDescription?: string | undefined;
        diffSummary?: {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        } | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNotes?: string | undefined;
        parentVersionId?: string | undefined;
        mergeSourceId?: string | undefined;
        backupReason?: string | undefined;
        fullSnapshot?: Record<string, unknown> | undefined;
        expiresAt?: string | undefined;
    }>, {
        id: string;
        updatedAt: string;
        createdAt: string;
        content: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        isPublished: boolean;
        createdBy: string;
        entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
        entityId: string;
        versionNumber: number;
        semanticVersion: string;
        contentHash: string;
        changeType: "minor" | "major" | "patch" | "hotfix";
        reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
        isActive: boolean;
        branchName: string;
        isBackup: boolean;
        accessCount: number;
        restoreCount: number;
        retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
        metadata: Record<string, unknown>;
        publishedAt?: string | undefined;
        changeDescription?: string | undefined;
        diffSummary?: {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        } | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNotes?: string | undefined;
        parentVersionId?: string | undefined;
        mergeSourceId?: string | undefined;
        backupReason?: string | undefined;
        fullSnapshot?: Record<string, unknown> | undefined;
        expiresAt?: string | undefined;
    }, {
        id: string;
        updatedAt: string;
        createdAt: string;
        content: Record<string, unknown>;
        validationResults: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
            lastValidated: string | null;
        };
        tags: string[];
        isPublished: boolean;
        createdBy: string;
        entityType: "chapter" | "section" | "npc" | "encounter" | "statblock" | "magicitem" | "project" | "template";
        entityId: string;
        versionNumber: number;
        semanticVersion: string;
        contentHash: string;
        changeType: "minor" | "major" | "patch" | "hotfix";
        reviewStatus: "pending" | "approved" | "rejected" | "auto-approved";
        isActive: boolean;
        branchName: string;
        isBackup: boolean;
        accessCount: number;
        restoreCount: number;
        retentionPolicy: "permanent" | "long-term" | "medium-term" | "short-term";
        metadata: Record<string, unknown>;
        publishedAt?: string | undefined;
        changeDescription?: string | undefined;
        diffSummary?: {
            additions: number;
            deletions: number;
            modifications: number;
            details: {
                type: "addition" | "deletion" | "modification";
                line: number;
                content?: string | undefined;
                old?: string | undefined;
                new?: string | undefined;
            }[];
        } | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        reviewNotes?: string | undefined;
        parentVersionId?: string | undefined;
        mergeSourceId?: string | undefined;
        backupReason?: string | undefined;
        fullSnapshot?: Record<string, unknown> | undefined;
        expiresAt?: string | undefined;
    }>;
};
export type SchemaType<T extends keyof typeof SchemaMap> = z.infer<typeof SchemaMap[T]>;
//# sourceMappingURL=content.schemas.d.ts.map