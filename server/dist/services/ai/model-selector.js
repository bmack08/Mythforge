const OPENAI_MODELS = {
    'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        maxTokens: 128000,
        costPer1kInput: 0.00015,
        costPer1kOutput: 0.0006,
        strengths: ['Fast', 'Cost-effective', 'Good for simple tasks'],
        weaknesses: ['Less creative', 'Limited complex reasoning'],
        bestFor: ['Simple NPCs', 'Basic descriptions', 'Quick generation'],
        complexity: 'simple',
        speed: 'fast',
        accuracy: 7,
        creativity: 6,
        reasoning: 6
    },
    'gpt-4o': {
        name: 'GPT-4o',
        maxTokens: 128000,
        costPer1kInput: 0.005,
        costPer1kOutput: 0.015,
        strengths: ['Balanced performance', 'Good reasoning', 'Multimodal'],
        weaknesses: ['More expensive than mini', 'Not the most creative'],
        bestFor: ['Stat blocks', 'Encounters', 'Balanced content'],
        complexity: 'moderate',
        speed: 'medium',
        accuracy: 9,
        creativity: 8,
        reasoning: 9
    },
    'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        maxTokens: 128000,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
        strengths: ['High accuracy', 'Complex reasoning', 'Large context'],
        weaknesses: ['More expensive', 'Slower'],
        bestFor: ['Complex encounters', 'Adventure modules', 'Detailed content'],
        complexity: 'complex',
        speed: 'medium',
        accuracy: 9,
        creativity: 8,
        reasoning: 10
    },
    'gpt-4': {
        name: 'GPT-4',
        maxTokens: 8192,
        costPer1kInput: 0.03,
        costPer1kOutput: 0.06,
        strengths: ['Highest quality', 'Best reasoning', 'Most creative'],
        weaknesses: ['Most expensive', 'Smaller context window'],
        bestFor: ['Premium content', 'Complex magic items', 'Intricate lore'],
        complexity: 'expert',
        speed: 'slow',
        accuracy: 10,
        creativity: 10,
        reasoning: 10
    }
};
// ============================================================================
// TASK COMPLEXITY ANALYZER
// ============================================================================
export class TaskComplexityAnalyzer {
    static analyzeTask(request) {
        const { type, prompt, context } = request;
        // Base complexity by content type
        const baseComplexity = this.getBaseComplexity(type);
        // Analyze prompt complexity
        const promptComplexity = this.analyzePromptComplexity(prompt);
        // Analyze context requirements
        const contextComplexity = this.analyzeContextComplexity(context);
        // Determine final complexity
        const finalComplexity = this.combineComplexityScores(baseComplexity, promptComplexity, contextComplexity);
        return {
            contentType: type,
            estimatedComplexity: finalComplexity.overall,
            reasoningRequired: finalComplexity.reasoning,
            creativityRequired: finalComplexity.creativity,
            mechanicalAccuracy: finalComplexity.mechanical,
            lengthEstimate: this.estimateLength(prompt, type),
            contextDependency: contextComplexity.dependency,
            balanceImportance: this.getBalanceImportance(type)
        };
    }
    static getBaseComplexity(type) {
        const complexityMap = {
            'description': {
                complexity: 'simple',
                reasoning: false,
                creativity: true,
                mechanical: false
            },
            'npc': {
                complexity: 'moderate',
                reasoning: true,
                creativity: true,
                mechanical: false
            },
            'statblock': {
                complexity: 'complex',
                reasoning: true,
                creativity: false,
                mechanical: true
            },
            'magicitem': {
                complexity: 'complex',
                reasoning: true,
                creativity: true,
                mechanical: true
            },
            'encounter': {
                complexity: 'expert',
                reasoning: true,
                creativity: true,
                mechanical: true
            },
            'custom': {
                complexity: 'moderate',
                reasoning: true,
                creativity: true,
                mechanical: false
            }
        };
        return complexityMap[type] || complexityMap['custom'];
    }
    static analyzePromptComplexity(prompt) {
        const length = prompt.length;
        const words = prompt.split(/\s+/).length;
        // Count complexity indicators
        const complexityKeywords = [
            'detailed', 'complex', 'intricate', 'sophisticated', 'advanced',
            'multiple', 'various', 'several', 'interconnected', 'layered'
        ];
        const specificityKeywords = [
            'exactly', 'precisely', 'specifically', 'must', 'should', 'required',
            'CR', 'level', 'rarity', 'attunement', 'damage', 'AC', 'HP'
        ];
        const requirements = (prompt.match(/\b(must|should|required|need|want)\b/gi) || []).length;
        const complexityScore = Math.min(10, Math.floor(words / 20) +
            complexityKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length);
        const specificityScore = Math.min(10, specificityKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length);
        return {
            length,
            complexity: complexityScore,
            specificity: specificityScore,
            requirements
        };
    }
    static analyzeContextComplexity(context) {
        if (!context) {
            return { dependency: 'low', budgetConstraints: false, systemIntegration: false };
        }
        const hasBudget = !!context.systemBudget;
        const hasAdditionalContext = !!context.additionalContext;
        const hasIds = !!(context.projectId || context.chapterId);
        let dependency = 'low';
        if (hasBudget && hasAdditionalContext && hasIds) {
            dependency = 'high';
        }
        else if (hasBudget || hasAdditionalContext || hasIds) {
            dependency = 'medium';
        }
        return {
            dependency,
            budgetConstraints: hasBudget,
            systemIntegration: hasIds
        };
    }
    static combineComplexityScores(base, prompt, context) {
        // Calculate overall complexity score (1-10)
        let score = 0;
        // Base complexity contribution (40%)
        const baseScore = { simple: 2, moderate: 4, complex: 7, expert: 10 }[base.complexity];
        score += baseScore * 0.4;
        // Prompt complexity contribution (40%)
        score += (prompt.complexity + prompt.specificity) * 0.2;
        // Context complexity contribution (20%)
        const contextScore = { low: 1, medium: 5, high: 9 }[context.dependency];
        score += contextScore * 0.2;
        // Determine final complexity
        let overall;
        if (score <= 3)
            overall = 'simple';
        else if (score <= 5)
            overall = 'moderate';
        else if (score <= 8)
            overall = 'complex';
        else
            overall = 'expert';
        return {
            overall,
            reasoning: base.reasoning || prompt.requirements > 2,
            creativity: base.creativity || prompt.complexity > 5,
            mechanical: base.mechanical || prompt.specificity > 5
        };
    }
    static estimateLength(prompt, type) {
        const promptWords = prompt.split(/\s+/).length;
        // Base estimates by type
        const baseEstimates = {
            'description': 100,
            'npc': 300,
            'statblock': 200,
            'magicitem': 150,
            'encounter': 400,
            'custom': 200
        };
        const baseEstimate = baseEstimates[type] || 200;
        const promptFactor = Math.max(0.5, Math.min(2, promptWords / 50));
        const estimatedTokens = baseEstimate * promptFactor;
        if (estimatedTokens <= 150)
            return 'short';
        if (estimatedTokens <= 400)
            return 'medium';
        return 'long';
    }
    static getBalanceImportance(type) {
        const importanceMap = {
            'description': 'low',
            'npc': 'medium',
            'statblock': 'critical',
            'magicitem': 'high',
            'encounter': 'critical',
            'custom': 'medium'
        };
        return importanceMap[type] || 'medium';
    }
}
// ============================================================================
// INTELLIGENT MODEL SELECTOR
// ============================================================================
export class IntelligentModelSelector {
    static selectOptimalModel(request, options) {
        // Analyze task complexity
        const complexity = TaskComplexityAnalyzer.analyzeTask(request);
        // Score all available models
        const modelScores = Object.entries(OPENAI_MODELS).map(([modelName, capabilities]) => {
            const score = this.scoreModel(capabilities, complexity, options);
            return {
                model: modelName,
                capabilities,
                score: score.total,
                breakdown: score.breakdown,
                estimatedCost: score.estimatedCost,
                estimatedTokens: score.estimatedTokens
            };
        });
        // Sort by score (highest first)
        modelScores.sort((a, b) => b.score - a.score);
        const best = modelScores[0];
        const alternatives = modelScores.slice(1, 3).map(alt => ({
            model: alt.model,
            reason: this.getAlternativeReason(alt, best),
            costDifference: alt.estimatedCost - best.estimatedCost
        }));
        return {
            model: best.model,
            confidence: Math.min(100, Math.max(50, best.score)),
            reasoning: this.generateReasoning(best, complexity),
            estimatedCost: best.estimatedCost,
            estimatedTokens: best.estimatedTokens,
            alternatives
        };
    }
    static scoreModel(capabilities, complexity, options) {
        const weights = {
            complexity: 25,
            accuracy: complexity.mechanicalAccuracy ? 25 : 15,
            creativity: complexity.creativityRequired ? 20 : 10,
            reasoning: complexity.reasoningRequired ? 20 : 10,
            cost: options?.prioritizeCost ? 30 : 15,
            speed: 5
        };
        // Estimate tokens based on content type and length
        const tokenEstimates = {
            short: { input: 150, output: 200 },
            medium: { input: 300, output: 500 },
            long: { input: 500, output: 800 }
        };
        const tokens = tokenEstimates[complexity.lengthEstimate];
        const estimatedCost = (tokens.input / 1000) * capabilities.costPer1kInput +
            (tokens.output / 1000) * capabilities.costPer1kOutput;
        // Score each aspect
        const scores = {
            complexity: this.scoreComplexityMatch(capabilities, complexity),
            accuracy: capabilities.accuracy * 10,
            creativity: capabilities.creativity * 10,
            reasoning: capabilities.reasoning * 10,
            cost: this.scoreCost(estimatedCost, options),
            speed: { fast: 100, medium: 70, slow: 40 }[capabilities.speed]
        };
        // Calculate weighted total
        const total = Object.entries(weights).reduce((sum, [key, weight]) => {
            return sum + (scores[key] * weight / 100);
        }, 0);
        return {
            total,
            breakdown: scores,
            estimatedCost,
            estimatedTokens: tokens.input + tokens.output
        };
    }
    static scoreComplexityMatch(capabilities, complexity) {
        const complexityOrder = ['simple', 'moderate', 'complex', 'expert'];
        const capabilityIndex = complexityOrder.indexOf(capabilities.complexity);
        const requiredIndex = complexityOrder.indexOf(complexity.estimatedComplexity);
        // Perfect match = 100, one level off = 80, two levels = 50, etc.
        const difference = Math.abs(capabilityIndex - requiredIndex);
        return Math.max(20, 100 - (difference * 25));
    }
    static scoreCost(estimatedCost, options) {
        const maxAcceptableCost = options?.maxCostPer1k || 0.1;
        if (estimatedCost <= maxAcceptableCost * 0.1)
            return 100; // Very cheap
        if (estimatedCost <= maxAcceptableCost * 0.3)
            return 80; // Cheap
        if (estimatedCost <= maxAcceptableCost * 0.6)
            return 60; // Reasonable
        if (estimatedCost <= maxAcceptableCost)
            return 40; // Expensive
        return 20; // Very expensive
    }
    static generateReasoning(selected, complexity) {
        const reasons = [];
        reasons.push(`Selected ${selected.capabilities.name} for ${complexity.contentType} generation`);
        if (complexity.mechanicalAccuracy && selected.capabilities.accuracy >= 9) {
            reasons.push('High accuracy needed for mechanical balance');
        }
        if (complexity.creativityRequired && selected.capabilities.creativity >= 8) {
            reasons.push('Strong creativity required for engaging content');
        }
        if (complexity.reasoningRequired && selected.capabilities.reasoning >= 8) {
            reasons.push('Complex reasoning needed for coherent design');
        }
        if (selected.estimatedCost < 0.01) {
            reasons.push('Cost-effective choice for this task');
        }
        return reasons.join('. ') + '.';
    }
    static getAlternativeReason(alt, best) {
        if (alt.estimatedCost < best.estimatedCost) {
            return `${((best.estimatedCost - alt.estimatedCost) / best.estimatedCost * 100).toFixed(0)}% cheaper`;
        }
        else if (alt.capabilities.accuracy > best.capabilities.accuracy) {
            return 'Higher accuracy for critical balance';
        }
        else if (alt.capabilities.creativity > best.capabilities.creativity) {
            return 'More creative output';
        }
        else {
            return 'Different performance trade-offs';
        }
    }
    // Convenience method for quick selection
    static quickSelect(contentType, promptComplexity = 'moderate') {
        const quickMap = {
            'description': {
                simple: 'gpt-4o-mini',
                moderate: 'gpt-4o-mini',
                complex: 'gpt-4o'
            },
            'npc': {
                simple: 'gpt-4o-mini',
                moderate: 'gpt-4o',
                complex: 'gpt-4o'
            },
            'statblock': {
                simple: 'gpt-4o',
                moderate: 'gpt-4o',
                complex: 'gpt-4-turbo'
            },
            'magicitem': {
                simple: 'gpt-4o',
                moderate: 'gpt-4o',
                complex: 'gpt-4-turbo'
            },
            'encounter': {
                simple: 'gpt-4o',
                moderate: 'gpt-4-turbo',
                complex: 'gpt-4'
            }
        };
        return quickMap[contentType]?.[promptComplexity] || 'gpt-4o';
    }
}
// ============================================================================
// EXPORTS
// ============================================================================
export { OPENAI_MODELS };
//# sourceMappingURL=model-selector.js.map