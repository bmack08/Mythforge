import type { SystemDesignBudget } from '../../types/content.types.js';
import { type ModelRecommendation, type TaskComplexityMetrics } from './model-selector.js';
export interface AIProviderConfig {
    name: string;
    apiKey: string;
    baseURL?: string;
    defaultModel: string;
    maxTokens: number;
    temperature: number;
    enabled: boolean;
}
export interface AIGenerationRequest {
    type: 'statblock' | 'npc' | 'magicitem' | 'encounter' | 'description' | 'custom';
    prompt: string;
    context?: {
        systemBudget?: SystemDesignBudget;
        projectId?: string;
        chapterId?: string;
        additionalContext?: Record<string, unknown>;
    };
    options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        provider?: string;
    };
}
export interface AIGenerationResponse {
    success: boolean;
    content?: unknown;
    rawResponse?: string;
    metadata: {
        provider: string;
        model: string;
        tokensUsed: number;
        cost: number;
        duration: number;
        timestamp: Date;
        modelSelection?: {
            recommendation: ModelRecommendation;
            complexity: TaskComplexityMetrics;
            overridden: boolean;
        };
    };
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export interface AIUsageStats {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    successRate: number;
    averageResponseTime: number;
    dailyUsage: {
        date: string;
        requests: number;
        tokens: number;
        cost: number;
    }[];
}
export declare class AIServiceConfig {
    private static instance;
    private config;
    private constructor();
    static getInstance(): AIServiceConfig;
    private initializeProviders;
    getProvider(name: string): AIProviderConfig | null;
    getAllProviders(): AIProviderConfig[];
    getEnabledProviders(): AIProviderConfig[];
    getPrimaryProvider(): AIProviderConfig | null;
    getFallbackProvider(): AIProviderConfig | null;
}
export declare class OpenAIProvider {
    private client;
    private config;
    constructor(config: AIProviderConfig);
    generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse>;
    private buildSystemPrompt;
    private calculateCost;
}
export declare class AIService {
    private static instance;
    private config;
    private providers;
    private usageStats;
    private constructor();
    static getInstance(): AIService;
    private initializeProviders;
    private initializeUsageStats;
    generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse>;
    private validateRequest;
    private checkUsageLimits;
    private updateUsageStats;
    private getFailedRequestCount;
    getUsageStats(): AIUsageStats;
    getAvailableProviders(): string[];
    getProviderConfig(name: string): AIProviderConfig | null;
    generateStatBlock(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse>;
    generateNPC(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse>;
    generateMagicItem(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse>;
    generateEncounter(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse>;
    generateDescription(prompt: string, context?: AIGenerationRequest['context'], options?: AIGenerationRequest['options']): Promise<AIGenerationResponse>;
}
export default AIService;
export declare const aiService: AIService;
//# sourceMappingURL=index.d.ts.map