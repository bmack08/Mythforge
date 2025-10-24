// Mythwright Context-Aware Prompt Builder
// Intelligent prompt construction with campaign consistency and adaptive context

import type { SystemDesignBudget } from '../../types/content.types.js';
import { promptTemplateManager, type PromptContext, type PromptTemplate } from './prompt-templates.js';

export interface CampaignContext {
  id: string;
  name: string;
  setting: {
    name: string;
    theme: string;
    tone: string;
    genre: string;
    timePeriod: string;
    magicLevel: 'low' | 'moderate' | 'high' | 'very high';
    technologyLevel: string;
  };
  narrative: {
    currentArc: string;
    mainThemes: string[];
    recurringElements: string[];
    establishedNPCs: string[];
    significantLocations: string[];
    ongoingPlotThreads: string[];
  };
  party: {
    size: number;
    averageLevel: number;
    classes: string[];
    races: string[];
    playStyle: 'combat-focused' | 'exploration-focused' | 'social-focused' | 'balanced';
    preferences: string[];
  };
  previousGenerations: GenerationHistory[];
  worldRules: {
    customMechanics: string[];
    bannedContent: string[];
    houseRules: string[];
    importantNPCs: Record<string, any>;
    establishedFacts: Record<string, any>;
  };
}

export interface GenerationHistory {
  id: string;
  timestamp: Date;
  contentType: string;
  prompt: string;
  result: any;
  tags: string[];
  quality: number;
  context: {
    chapterName?: string;
    sectionName?: string;
    purpose?: string;
    connections?: string[];
  };
}

export interface AdaptivePromptContext extends PromptContext {
  campaignContext?: CampaignContext;
  generationGoals?: string[];
  consistencyRequirements?: string[];
  avoidancePatterns?: string[];
  preferenceWeights?: Record<string, number>;
  contextualHints?: string[];
}

export interface PromptAdaptation {
  baseTemplate: PromptTemplate;
  adaptations: {
    systemPromptAdditions: string[];
    userPromptModifications: string[];
    variableOverrides: Record<string, any>;
    constraintsAdded: string[];
    emphasesAdded: string[];
  };
  reasoning: {
    contexturalFactors: string[];
    adaptationDecisions: string[];
    consistencyChecks: string[];
    qualityPredictions: string[];
  };
  metadata: {
    adaptationLevel: 'minimal' | 'moderate' | 'extensive' | 'complete';
    confidenceScore: number;
    expectedQuality: number;
    estimatedTokens: number;
  };
}

// ============================================================================
// CONTEXT ANALYSIS ENGINE
// ============================================================================

export class ContextAnalysisEngine {
  
  static analyzeCampaignConsistency(
    contentType: string, 
    campaignContext: CampaignContext, 
    requestContext: AdaptivePromptContext
  ): {
    consistencyRequirements: string[];
    potentialConflicts: string[];
    connectionOpportunities: string[];
    adaptationNeeds: string[];
  } {
    const analysis = {
      consistencyRequirements: [] as string[],
      potentialConflicts: [] as string[],
      connectionOpportunities: [] as string[],
      adaptationNeeds: [] as string[]
    };

    // Setting consistency analysis
    if (campaignContext.setting) {
      analysis.consistencyRequirements.push(
        `Maintain ${campaignContext.setting.theme} theme with ${campaignContext.setting.tone} tone`,
        `Respect ${campaignContext.setting.magicLevel} magic level setting`,
        `Stay consistent with ${campaignContext.setting.genre} genre expectations`
      );
    }

    // Narrative consistency analysis
    if (campaignContext.narrative) {
      if (campaignContext.narrative.currentArc) {
        analysis.consistencyRequirements.push(
          `Connect to or support the current "${campaignContext.narrative.currentArc}" story arc`
        );
      }

      if (campaignContext.narrative.recurringElements.length > 0) {
        analysis.connectionOpportunities.push(
          `Reference or incorporate recurring elements: ${campaignContext.narrative.recurringElements.join(', ')}`
        );
      }

      if (campaignContext.narrative.establishedNPCs.length > 0) {
        analysis.connectionOpportunities.push(
          `Potential connections to established NPCs: ${campaignContext.narrative.establishedNPCs.join(', ')}`
        );
      }
    }

    // Previous generation analysis
    const recentSimilarGenerations = campaignContext.previousGenerations
      .filter(gen => gen.contentType === contentType)
      .slice(-5); // Last 5 similar generations

    if (recentSimilarGenerations.length > 0) {
      const commonPatterns = this.identifyCommonPatterns(recentSimilarGenerations);
      if (commonPatterns.length > 0) {
        analysis.adaptationNeeds.push(
          `Avoid repetition of recent patterns: ${commonPatterns.join(', ')}`
        );
      }
    }

    // World rules analysis
    if (campaignContext.worldRules) {
      if (campaignContext.worldRules.bannedContent.length > 0) {
        analysis.consistencyRequirements.push(
          `Avoid banned content: ${campaignContext.worldRules.bannedContent.join(', ')}`
        );
      }

      if (campaignContext.worldRules.customMechanics.length > 0) {
        analysis.adaptationNeeds.push(
          `Consider integration of custom mechanics: ${campaignContext.worldRules.customMechanics.join(', ')}`
        );
      }
    }

    return analysis;
  }

  static identifyCommonPatterns(generations: GenerationHistory[]): string[] {
    const patterns: string[] = [];
    
    // Analyze tags for common themes
    const tagCounts: Record<string, number> = {};
    generations.forEach(gen => {
      gen.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Identify overused patterns (appearing in >60% of recent generations)
    const threshold = Math.ceil(generations.length * 0.6);
    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count >= threshold) {
        patterns.push(tag);
      }
    });

    return patterns;
  }

  static predictContentQuality(
    template: PromptTemplate, 
    context: AdaptivePromptContext,
    adaptations: PromptAdaptation['adaptations']
  ): number {
    let baseQuality = template.metadata.successRate || 75;

    // Context quality factors
    if (context.campaignContext?.setting) {
      baseQuality += 5; // Clear setting context helps
    }

    if (context.systemBudget) {
      baseQuality += 10; // System budget provides clear constraints
    }

    // Adaptation quality factors
    const adaptationCount = Object.values(adaptations).reduce((acc, arr) => 
      acc + (Array.isArray(arr) ? arr.length : Object.keys(arr).length), 0
    );

    if (adaptationCount > 10) {
      baseQuality -= 5; // Too many adaptations can reduce clarity
    } else if (adaptationCount > 5) {
      baseQuality += 5; // Moderate adaptations usually help
    }

    // History quality factors
    if (context.campaignContext?.previousGenerations) {
      const recentQuality = context.campaignContext.previousGenerations
        .slice(-3)
        .reduce((acc, gen) => acc + gen.quality, 0) / 3;
      
      // Recent quality influences prediction
      baseQuality = (baseQuality * 0.7) + (recentQuality * 0.3);
    }

    return Math.max(10, Math.min(100, baseQuality));
  }
}

// ============================================================================
// CONTEXT-AWARE PROMPT BUILDER
// ============================================================================

export class ContextAwarePromptBuilder {
  private static instance: ContextAwarePromptBuilder;

  private constructor() {}

  static getInstance(): ContextAwarePromptBuilder {
    if (!ContextAwarePromptBuilder.instance) {
      ContextAwarePromptBuilder.instance = new ContextAwarePromptBuilder();
    }
    return ContextAwarePromptBuilder.instance;
  }

  buildAdaptivePrompt(
    contentType: string,
    baseVariables: Record<string, any>,
    context: AdaptivePromptContext
  ): PromptAdaptation {
    // Step 1: Select base template
    const baseTemplate = promptTemplateManager.getBestTemplate(contentType, context) ||
      promptTemplateManager.getTemplatesByType(contentType)[0];

    if (!baseTemplate) {
      throw new Error(`No template found for content type: ${contentType}`);
    }

    // Step 2: Analyze campaign context if available
    let contextAnalysis = null;
    if (context.campaignContext) {
      contextAnalysis = ContextAnalysisEngine.analyzeCampaignConsistency(
        contentType,
        context.campaignContext,
        context
      );
    }

    // Step 3: Build adaptations
    const adaptations = {
      systemPromptAdditions: [] as string[],
      userPromptModifications: [] as string[],
      variableOverrides: {} as Record<string, any>,
      constraintsAdded: [] as string[],
      emphasesAdded: [] as string[]
    };

    // Step 4: Apply campaign setting adaptations
    if (context.campaignContext?.setting) {
      adaptations.systemPromptAdditions.push(this.buildSettingContext(context.campaignContext.setting));
    }

    // Step 5: Apply narrative context adaptations
    if (context.campaignContext?.narrative) {
      adaptations.systemPromptAdditions.push(this.buildNarrativeContext(context.campaignContext.narrative));
    }

    // Step 6: Apply consistency requirements
    if (contextAnalysis) {
      if (contextAnalysis.consistencyRequirements.length > 0) {
        adaptations.constraintsAdded.push(...contextAnalysis.consistencyRequirements);
      }

      if (contextAnalysis.connectionOpportunities.length > 0) {
        adaptations.emphasesAdded.push(...contextAnalysis.connectionOpportunities);
      }

      if (contextAnalysis.adaptationNeeds.length > 0) {
        adaptations.systemPromptAdditions.push(
          `\nADAPTATION REQUIREMENTS:\n${contextAnalysis.adaptationNeeds.map(need => `- ${need}`).join('\n')}`
        );
      }
    }

    // Step 7: Apply system design budget adaptations
    if (context.systemBudget) {
      adaptations.systemPromptAdditions.push(this.buildSystemBudgetContext(context.systemBudget));
    }

    // Step 8: Apply historical pattern avoidance
    if (context.avoidancePatterns && context.avoidancePatterns.length > 0) {
      adaptations.constraintsAdded.push(
        ...context.avoidancePatterns.map(pattern => `Avoid overusing: ${pattern}`)
      );
    }

    // Step 9: Apply preference weights
    if (context.preferenceWeights) {
      const weightedPreferences = Object.entries(context.preferenceWeights)
        .filter(([_, weight]) => weight > 0.5)
        .map(([preference, weight]) => `Emphasize ${preference} (weight: ${weight})`)
        .join(', ');
      
      if (weightedPreferences) {
        adaptations.emphasesAdded.push(`Preference weighting: ${weightedPreferences}`);
      }
    }

    // Step 10: Generate reasoning
    const reasoning = this.generateAdaptationReasoning(baseTemplate, adaptations, contextAnalysis, context);

    // Step 11: Calculate metadata
    const expectedQuality = ContextAnalysisEngine.predictContentQuality(baseTemplate, context, adaptations);
    const adaptationLevel = this.calculateAdaptationLevel(adaptations);
    
    return {
      baseTemplate,
      adaptations,
      reasoning,
      metadata: {
        adaptationLevel,
        confidenceScore: this.calculateConfidenceScore(contextAnalysis, context),
        expectedQuality,
        estimatedTokens: this.estimateTokenUsage(baseTemplate, adaptations)
      }
    };
  }

  private buildSettingContext(setting: CampaignContext['setting']): string {
    return `\nCAMPAIGN SETTING CONTEXT:
- Setting: ${setting.name} (${setting.genre}, ${setting.timePeriod})
- Theme: ${setting.theme}
- Tone: ${setting.tone}
- Magic Level: ${setting.magicLevel}
- Technology Level: ${setting.technologyLevel}

Ensure all generated content fits seamlessly into this established setting and maintains the specified tone and theme.`;
  }

  private buildNarrativeContext(narrative: CampaignContext['narrative']): string {
    let context = `\nNARRATIVE CONTEXT:`;
    
    if (narrative.currentArc) {
      context += `\n- Current Story Arc: ${narrative.currentArc}`;
    }

    if (narrative.mainThemes.length > 0) {
      context += `\n- Main Themes: ${narrative.mainThemes.join(', ')}`;
    }

    if (narrative.establishedNPCs.length > 0) {
      context += `\n- Established NPCs: ${narrative.establishedNPCs.join(', ')}`;
    }

    if (narrative.significantLocations.length > 0) {
      context += `\n- Significant Locations: ${narrative.significantLocations.join(', ')}`;
    }

    if (narrative.ongoingPlotThreads.length > 0) {
      context += `\n- Ongoing Plot Threads: ${narrative.ongoingPlotThreads.join(', ')}`;
    }

    context += `\n\nSeek opportunities to reference, build upon, or meaningfully connect to these established narrative elements.`;

    return context;
  }

  private buildSystemBudgetContext(budget: SystemDesignBudget): string {
    return `\nSYSTEM DESIGN BUDGET:
- Party: ${budget.partySize} characters, level ${budget.partyLevel}
- Difficulty: ${budget.difficulty}
- Pillar Emphasis: Combat ${budget.combatWeight}%, Exploration ${budget.explorationWeight}%, Social ${budget.socialWeight}%
- Tone: ${budget.tone}
- Setting: ${budget.setting}

Generate content that perfectly balances these parameters and provides appropriate challenge for the specified party configuration.`;
  }

  private generateAdaptationReasoning(
    template: PromptTemplate,
    adaptations: PromptAdaptation['adaptations'],
    contextAnalysis: any,
    context: AdaptivePromptContext
  ): PromptAdaptation['reasoning'] {
    const reasoning = {
      contexturalFactors: [] as string[],
      adaptationDecisions: [] as string[],
      consistencyChecks: [] as string[],
      qualityPredictions: [] as string[]
    };

    // Contextual factors
    if (context.campaignContext) {
      reasoning.contexturalFactors.push(
        `Campaign setting: ${context.campaignContext.setting?.name || 'Generic fantasy'}`,
        `Party configuration: ${context.campaignContext.party?.size || 'Unknown'} level ${context.campaignContext.party?.averageLevel || 'Unknown'} characters`
      );
    }

    if (context.systemBudget) {
      reasoning.contexturalFactors.push(
        `System budget emphasizes ${context.systemBudget.combatWeight > 40 ? 'combat' : context.systemBudget.explorationWeight > 40 ? 'exploration' : 'social interaction'}`
      );
    }

    // Adaptation decisions
    if (adaptations.systemPromptAdditions.length > 0) {
      reasoning.adaptationDecisions.push(
        `Added ${adaptations.systemPromptAdditions.length} system prompt enhancements for context awareness`
      );
    }

    if (adaptations.constraintsAdded.length > 0) {
      reasoning.adaptationDecisions.push(
        `Applied ${adaptations.constraintsAdded.length} consistency constraints`
      );
    }

    // Consistency checks
    if (contextAnalysis?.consistencyRequirements.length > 0) {
      reasoning.consistencyChecks.push(
        `${contextAnalysis.consistencyRequirements.length} setting consistency requirements enforced`
      );
    }

    // Quality predictions
    reasoning.qualityPredictions.push(
      `Template baseline success rate: ${template.metadata.successRate || 'Unknown'}%`,
      `Context awareness should improve relevance and integration quality`
    );

    return reasoning;
  }

  private calculateAdaptationLevel(adaptations: PromptAdaptation['adaptations']): 'minimal' | 'moderate' | 'extensive' | 'complete' {
    const totalAdaptations = Object.values(adaptations).reduce((acc, val) => 
      acc + (Array.isArray(val) ? val.length : Object.keys(val).length), 0
    );

    if (totalAdaptations <= 2) return 'minimal';
    if (totalAdaptations <= 5) return 'moderate';
    if (totalAdaptations <= 10) return 'extensive';
    return 'complete';
  }

  private calculateConfidenceScore(contextAnalysis: any, context: AdaptivePromptContext): number {
    let confidence = 70; // Base confidence

    if (context.campaignContext?.setting) confidence += 10;
    if (context.systemBudget) confidence += 15;
    if (contextAnalysis?.consistencyRequirements.length > 0) confidence += 10;
    if (context.campaignContext?.previousGenerations?.length > 0) confidence += 5;

    return Math.min(100, confidence);
  }

  private estimateTokenUsage(template: PromptTemplate, adaptations: PromptAdaptation['adaptations']): number {
    let baseTokens = 800; // Estimated base template tokens

    // Add tokens for adaptations
    baseTokens += adaptations.systemPromptAdditions.length * 100;
    baseTokens += adaptations.constraintsAdded.length * 50;
    baseTokens += adaptations.emphasesAdded.length * 30;

    return baseTokens;
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  buildPromptForContent(
    contentType: string,
    variables: Record<string, any>,
    context: AdaptivePromptContext
  ): {
    systemPrompt: string;
    userPrompt: string;
    metadata: any;
    adaptation: PromptAdaptation;
  } {
    const adaptation = this.buildAdaptivePrompt(contentType, variables, context);
    const basePrompt = promptTemplateManager.buildPrompt(
      adaptation.baseTemplate.id,
      { ...variables, ...adaptation.adaptations.variableOverrides },
      context
    );

    if (!basePrompt) {
      throw new Error('Failed to build base prompt');
    }

    // Apply adaptations to system prompt
    let enhancedSystemPrompt = basePrompt.systemPrompt;
    adaptation.adaptations.systemPromptAdditions.forEach(addition => {
      enhancedSystemPrompt += addition;
    });

    // Add constraints and emphases
    if (adaptation.adaptations.constraintsAdded.length > 0) {
      enhancedSystemPrompt += `\n\nCONSTRAINTS:\n${adaptation.adaptations.constraintsAdded.map(c => `- ${c}`).join('\n')}`;
    }

    if (adaptation.adaptations.emphasesAdded.length > 0) {
      enhancedSystemPrompt += `\n\nEMPHASES:\n${adaptation.adaptations.emphasesAdded.map(e => `- ${e}`).join('\n')}`;
    }

    // Apply user prompt modifications
    let enhancedUserPrompt = basePrompt.userPrompt;
    adaptation.adaptations.userPromptModifications.forEach(modification => {
      enhancedUserPrompt += `\n\n${modification}`;
    });

    return {
      systemPrompt: enhancedSystemPrompt,
      userPrompt: enhancedUserPrompt,
      metadata: {
        ...basePrompt.metadata,
        adaptation: adaptation.metadata,
        reasoning: adaptation.reasoning
      },
      adaptation
    };
  }

  // Create campaign context from system design budget and additional info
  static createBasicCampaignContext(
    systemBudget: SystemDesignBudget,
    additionalInfo?: Partial<CampaignContext>
  ): CampaignContext {
    return {
      id: additionalInfo?.id || `campaign-${Date.now()}`,
      name: additionalInfo?.name || 'Untitled Campaign',
      setting: {
        name: systemBudget.setting,
        theme: systemBudget.tone,
        tone: systemBudget.tone,
        genre: 'fantasy',
        timePeriod: 'medieval fantasy',
        magicLevel: 'moderate',
        technologyLevel: 'medieval',
        ...additionalInfo?.setting
      },
      narrative: {
        currentArc: 'Beginning Adventure',
        mainThemes: [],
        recurringElements: [],
        establishedNPCs: [],
        significantLocations: [],
        ongoingPlotThreads: [],
        ...additionalInfo?.narrative
      },
      party: {
        size: systemBudget.partySize,
        averageLevel: systemBudget.partyLevel,
        classes: [],
        races: [],
        playStyle: systemBudget.combatWeight > 40 ? 'combat-focused' :
                   systemBudget.explorationWeight > 40 ? 'exploration-focused' :
                   systemBudget.socialWeight > 40 ? 'social-focused' : 'balanced',
        preferences: [],
        ...additionalInfo?.party
      },
      previousGenerations: additionalInfo?.previousGenerations || [],
      worldRules: {
        customMechanics: [],
        bannedContent: [],
        houseRules: [],
        importantNPCs: {},
        establishedFacts: {},
        ...additionalInfo?.worldRules
      }
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ContextAwarePromptBuilder;
export const contextAwarePromptBuilder = ContextAwarePromptBuilder.getInstance();