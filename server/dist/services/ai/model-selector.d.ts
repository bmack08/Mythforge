import type { AIGenerationRequest } from './index.js';
export interface TaskComplexityMetrics {
    contentType: string;
    estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
    reasoningRequired: boolean;
    creativityRequired: boolean;
    mechanicalAccuracy: boolean;
    lengthEstimate: 'short' | 'medium' | 'long';
    contextDependency: 'low' | 'medium' | 'high';
    balanceImportance: 'low' | 'medium' | 'high' | 'critical';
}
export interface ModelRecommendation {
    model: string;
    confidence: number;
    reasoning: string;
    estimatedCost: number;
    estimatedTokens: number;
    alternatives: Array<{
        model: string;
        reason: string;
        costDifference: number;
    }>;
}
interface ModelCapabilities {
    name: string;
    maxTokens: number;
    costPer1kInput: number;
    costPer1kOutput: number;
    strengths: string[];
    weaknesses: string[];
    bestFor: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
    speed: 'fast' | 'medium' | 'slow';
    accuracy: number;
    creativity: number;
    reasoning: number;
}
declare const OPENAI_MODELS: Record<string, ModelCapabilities>;
export declare class TaskComplexityAnalyzer {
    static analyzeTask(request: AIGenerationRequest): TaskComplexityMetrics;
    private static getBaseComplexity;
    private static analyzePromptComplexity;
    private static analyzeContextComplexity;
    private static combineComplexityScores;
    private static estimateLength;
    private static getBalanceImportance;
}
export declare class IntelligentModelSelector {
    static selectOptimalModel(request: AIGenerationRequest, options?: {
        prioritizeCost?: boolean;
        prioritizeQuality?: boolean;
        maxCostPer1k?: number;
        requiredAccuracy?: number;
    }): ModelRecommendation;
    private static scoreModel;
    private static scoreComplexityMatch;
    private static scoreCost;
    private static generateReasoning;
    private static getAlternativeReason;
    static quickSelect(contentType: string, promptComplexity?: 'simple' | 'moderate' | 'complex'): string;
}
export { TaskComplexityAnalyzer, IntelligentModelSelector, OPENAI_MODELS };
export type { TaskComplexityMetrics, ModelRecommendation, ModelCapabilities };
//# sourceMappingURL=model-selector.d.ts.map