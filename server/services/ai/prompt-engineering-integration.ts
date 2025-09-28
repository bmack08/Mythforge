// Mythwright Prompt Engineering Integration Layer
// Connects all Phase 3.3 components for advanced AI prompt engineering

import type { AIGenerationRequest, AIGenerationResponse } from './index.js';
import { ContextAwarePromptBuilder, type AdaptivePromptContext, type CampaignContext } from './context-aware-prompt-builder.js';
import { ConsistencyEnforcer, type CampaignMemory } from './consistency-enforcer.js';
import { ToneThemeConsistencyChecker } from './tone-theme-analyzer.js';
import { OutputFormatValidator } from './output-format-validator.js';
import { SelfCorrectionEngine } from './self-correction-system.js';

export interface AdvancedGenerationRequest extends AIGenerationRequest {
  advancedOptions?: {
    campaignContext?: CampaignContext;
    toneProfile?: string;
    themeProfile?: string;
    consistencyLevel?: 'strict' | 'moderate' | 'relaxed';
    enableSelfCorrection?: boolean;
    maxCorrectionAttempts?: number;
    qualityThreshold?: number; // 0-100
  };
}

export interface AdvancedGenerationResponse extends AIGenerationResponse {
  advanced?: {
    promptEngineering: {
      templateUsed: string;
      adaptationLevel: string;
      contextFactors: string[];
    };
    validation: {
      formatScore: number;
      consistencyScore: number;
      toneScore: number;
      themeScore: number;
      overallQuality: number;
    };
    corrections?: {
      attemptsMade: number;
      strategiesUsed: string[];
      improvementAchieved: number;
      finalScore: number;
    };
    recommendations: string[];
    metadata: {
      processingSteps: string[];
      totalProcessingTime: number;
      qualityAnalysis: any;
    };
  };
}

export interface PromptEngineeeringConfig {
  enableContextAwarePrompts: boolean;
  enableConsistencyEnforcement: boolean;
  enableToneThemeAnalysis: boolean;
  enableFormatValidation: boolean;
  enableSelfCorrection: boolean;
  defaultQualityThreshold: number;
  maxCorrectionAttempts: number;
  cacheEngineeredPrompts: boolean;
  logDetailedMetrics: boolean;
}

// ============================================================================
// ADVANCED PROMPT ENGINEERING SERVICE
// ============================================================================

export class AdvancedPromptEngineeringService {
  private contextAwareBuilder: ContextAwarePromptBuilder;
  private consistencyEnforcer: ConsistencyEnforcer;
  private toneThemeChecker: ToneThemeConsistencyChecker;
  private formatValidator: OutputFormatValidator;
  private selfCorrectionEngine: SelfCorrectionEngine;
  private config: PromptEngineeeringConfig;

  constructor(config?: Partial<PromptEngineeeringConfig>, campaignMemory?: Partial<CampaignMemory>) {
    this.config = {
      enableContextAwarePrompts: true,
      enableConsistencyEnforcement: true,
      enableToneThemeAnalysis: true,
      enableFormatValidation: true,
      enableSelfCorrection: true,
      defaultQualityThreshold: 70,
      maxCorrectionAttempts: 3,
      cacheEngineeredPrompts: true,
      logDetailedMetrics: true,
      ...config
    };

    this.initializeComponents(campaignMemory);
  }

  private initializeComponents(campaignMemory?: Partial<CampaignMemory>) {
    this.contextAwareBuilder = ContextAwarePromptBuilder.getInstance();
    this.consistencyEnforcer = new ConsistencyEnforcer(campaignMemory);
    this.toneThemeChecker = new ToneThemeConsistencyChecker();
    this.formatValidator = new OutputFormatValidator();
    this.selfCorrectionEngine = new SelfCorrectionEngine();
  }

  async generateWithAdvancedPromptEngineering(
    request: AdvancedGenerationRequest,
    aiService: any // AIService instance
  ): Promise<AdvancedGenerationResponse> {
    const startTime = Date.now();
    const processingSteps: string[] = [];
    let finalResponse: AIGenerationResponse;
    let promptEngineering: any = {};
    let validation: any = {};
    let corrections: any = undefined;

    try {
      // Step 1: Context-Aware Prompt Building
      if (this.config.enableContextAwarePrompts) {
        processingSteps.push('context-aware-prompt-building');
        
        const adaptiveContext: AdaptivePromptContext = {
          campaignContext: request.advancedOptions?.campaignContext,
          systemBudget: request.context?.systemBudget,
          generationGoals: ['high-quality', 'campaign-consistent', 'balanced'],
          consistencyRequirements: request.advancedOptions?.consistencyLevel === 'strict' ? 
            ['strict-setting-adherence', 'perfect-tone-match'] : [],
          preferenceWeights: this.calculatePreferenceWeights(request)
        };

        const builtPrompt = this.contextAwareBuilder.buildPromptForContent(
          request.type,
          this.extractVariables(request),
          adaptiveContext
        );

        // Update the request with the engineered prompt
        request.prompt = builtPrompt.userPrompt;
        
        promptEngineering = {
          templateUsed: builtPrompt.adaptation.baseTemplate.id,
          adaptationLevel: builtPrompt.adaptation.metadata.adaptationLevel,
          contextFactors: builtPrompt.adaptation.reasoning.contexturalFactors
        };

        // Set system prompt in request options
        if (!request.options) request.options = {};
        request.options.systemPrompt = builtPrompt.systemPrompt;
      }

      // Step 2: Generate Initial Content
      processingSteps.push('initial-generation');
      let response = await aiService.generateContent(request);
      
      if (!response.success) {
        return this.createFailureResponse(response, processingSteps, startTime);
      }

      // Step 3: Comprehensive Validation
      if (this.shouldPerformValidation()) {
        processingSteps.push('comprehensive-validation');
        
        const validationResults = await this.performComprehensiveValidation(
          response.content,
          request,
          response
        );

        validation = {
          formatScore: validationResults.format.score,
          consistencyScore: validationResults.consistency?.overall.score || 100,
          toneScore: validationResults.toneTheme?.overall.toneConsistency || 100,
          themeScore: validationResults.toneTheme?.overall.themeConsistency || 100,
          overallQuality: this.calculateOverallQuality(validationResults)
        };

        // Step 4: Self-Correction if needed
        const qualityThreshold = request.advancedOptions?.qualityThreshold || this.config.defaultQualityThreshold;
        const enableCorrection = request.advancedOptions?.enableSelfCorrection !== false && this.config.enableSelfCorrection;
        
        if (enableCorrection && validation.overallQuality < qualityThreshold) {
          processingSteps.push('self-correction');
          
          const correctionReport = await this.selfCorrectionEngine.attemptCorrection(
            request,
            response,
            validationResults.format,
            validationResults.consistency,
            validationResults.toneTheme?.toneAnalysis,
            validationResults.toneTheme?.themeAnalysis,
            aiService
          );

          if (correctionReport.success && correctionReport.finalScore > validation.overallQuality) {
            // Use corrected response
            response = correctionReport as any; // Would need proper response extraction
            validation.overallQuality = correctionReport.finalScore;
          }

          corrections = {
            attemptsMade: correctionReport.attemptsCount,
            strategiesUsed: correctionReport.strategiesUsed,
            improvementAchieved: correctionReport.improvementAchieved,
            finalScore: correctionReport.finalScore
          };
        }
      }

      finalResponse = response;

    } catch (error) {
      console.error('Advanced prompt engineering failed:', error);
      
      // Fallback to basic generation
      finalResponse = await aiService.generateContent({
        type: request.type,
        prompt: request.prompt,
        context: request.context,
        options: request.options
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(validation, corrections, processingSteps);

    return {
      ...finalResponse,
      advanced: {
        promptEngineering,
        validation,
        corrections,
        recommendations,
        metadata: {
          processingSteps,
          totalProcessingTime: Date.now() - startTime,
          qualityAnalysis: this.createQualityAnalysis(validation)
        }
      }
    };
  }

  private shouldPerformValidation(): boolean {
    return this.config.enableFormatValidation || 
           this.config.enableConsistencyEnforcement || 
           this.config.enableToneThemeAnalysis;
  }

  private async performComprehensiveValidation(
    content: any,
    request: AdvancedGenerationRequest,
    response: AIGenerationResponse
  ) {
    const results: any = {};

    // Format validation
    if (this.config.enableFormatValidation) {
      results.format = this.formatValidator.validateContent(content, request.type, true);
    }

    // Consistency enforcement
    if (this.config.enableConsistencyEnforcement && request.advancedOptions?.campaignContext) {
      results.consistency = this.consistencyEnforcer.enforceConsistency(
        content,
        request.advancedOptions.campaignContext
      );
    }

    // Tone/Theme analysis
    if (this.config.enableToneThemeAnalysis) {
      const toneProfile = request.advancedOptions?.toneProfile;
      const themeProfile = request.advancedOptions?.themeProfile;
      
      if (toneProfile && themeProfile) {
        this.toneThemeChecker.setToneProfile(toneProfile);
        this.toneThemeChecker.setThemeProfile(themeProfile);
        
        const contentText = this.extractTextFromContent(content);
        results.toneTheme = this.toneThemeChecker.analyzeContent(contentText);
      }
    }

    return results;
  }

  private calculateOverallQuality(validationResults: any): number {
    const scores: number[] = [];

    if (validationResults.format) {
      scores.push(validationResults.format.score);
    }

    if (validationResults.consistency) {
      scores.push(validationResults.consistency.overall.score);
    }

    if (validationResults.toneTheme) {
      scores.push(validationResults.toneTheme.overall.score);
    }

    if (scores.length === 0) return 85; // Default quality score

    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }

  private calculatePreferenceWeights(request: AdvancedGenerationRequest): Record<string, number> {
    const weights: Record<string, number> = {
      'format-compliance': 1.0,
      'campaign-consistency': 0.9,
      'tone-matching': 0.8,
      'theme-support': 0.8,
      'mechanical-balance': 0.9,
      'creativity': 0.7
    };

    // Adjust based on consistency level
    if (request.advancedOptions?.consistencyLevel === 'strict') {
      weights['campaign-consistency'] = 1.0;
      weights['tone-matching'] = 1.0;
      weights['theme-support'] = 1.0;
    } else if (request.advancedOptions?.consistencyLevel === 'relaxed') {
      weights['creativity'] = 1.0;
      weights['campaign-consistency'] = 0.6;
    }

    return weights;
  }

  private extractVariables(request: AdvancedGenerationRequest): Record<string, any> {
    // Extract variables from the request for template building
    // This would be more sophisticated in practice
    return {
      concept: request.prompt,
      // Additional variables would be extracted based on request type and context
    };
  }

  private extractTextFromContent(content: any): string {
    // Extract text content for tone/theme analysis
    if (typeof content === 'string') return content;
    
    const textFields = ['description', 'lore', 'background_story', 'tactics', 'interactionNotes', 'usageInstructions'];
    let text = '';
    
    for (const field of textFields) {
      if (content[field]) {
        text += content[field] + ' ';
      }
    }

    return text.trim() || JSON.stringify(content);
  }

  private generateRecommendations(
    validation: any,
    corrections: any,
    processingSteps: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (validation.overallQuality < 60) {
      recommendations.push('Content quality is below standards - consider manual review');
    }

    if (validation.formatScore < 80) {
      recommendations.push('Format validation issues detected - review schema compliance');
    }

    if (validation.consistencyScore < 70) {
      recommendations.push('Consistency issues with campaign setting - review established elements');
    }

    if (corrections && corrections.attemptsMade > 2) {
      recommendations.push('Multiple correction attempts were needed - consider simplifying the request');
    }

    if (processingSteps.includes('self-correction') && !corrections?.success) {
      recommendations.push('Auto-correction failed - manual editing may be required');
    }

    if (recommendations.length === 0) {
      recommendations.push('Content meets quality standards and is ready for use');
    }

    return recommendations;
  }

  private createQualityAnalysis(validation: any) {
    return {
      strengths: this.identifyStrengths(validation),
      weaknesses: this.identifyWeaknesses(validation),
      overallAssessment: this.createOverallAssessment(validation)
    };
  }

  private identifyStrengths(validation: any): string[] {
    const strengths: string[] = [];

    if (validation.formatScore >= 90) strengths.push('Excellent format compliance');
    if (validation.consistencyScore >= 90) strengths.push('Perfect campaign consistency');
    if (validation.toneScore >= 90) strengths.push('Excellent tone matching');
    if (validation.themeScore >= 90) strengths.push('Strong thematic elements');

    return strengths;
  }

  private identifyWeaknesses(validation: any): string[] {
    const weaknesses: string[] = [];

    if (validation.formatScore < 70) weaknesses.push('Format compliance needs improvement');
    if (validation.consistencyScore < 70) weaknesses.push('Campaign consistency issues');
    if (validation.toneScore < 70) weaknesses.push('Tone matching problems');
    if (validation.themeScore < 70) weaknesses.push('Weak thematic support');

    return weaknesses;
  }

  private createOverallAssessment(validation: any): string {
    if (validation.overallQuality >= 90) return 'Excellent quality - ready for immediate use';
    if (validation.overallQuality >= 80) return 'High quality - minor refinements may be beneficial';
    if (validation.overallQuality >= 70) return 'Good quality - meets standards with room for improvement';
    if (validation.overallQuality >= 60) return 'Acceptable quality - significant improvements recommended';
    return 'Below standards - major revisions required';
  }

  private createFailureResponse(
    response: AIGenerationResponse,
    processingSteps: string[],
    startTime: number
  ): AdvancedGenerationResponse {
    return {
      ...response,
      advanced: {
        promptEngineering: {
          templateUsed: 'none',
          adaptationLevel: 'none',
          contextFactors: []
        },
        validation: {
          formatScore: 0,
          consistencyScore: 0,
          toneScore: 0,
          themeScore: 0,
          overallQuality: 0
        },
        recommendations: ['Generation failed - check request parameters and try again'],
        metadata: {
          processingSteps,
          totalProcessingTime: Date.now() - startTime,
          qualityAnalysis: { strengths: [], weaknesses: ['Generation failure'], overallAssessment: 'Failed to generate content' }
        }
      }
    };
  }

  // Configuration and management methods
  updateConfig(newConfig: Partial<PromptEngineeeringConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PromptEngineeeringConfig {
    return { ...this.config };
  }

  getPerformanceMetrics() {
    return {
      selfCorrectionPerformance: this.selfCorrectionEngine.getStrategyPerformance(),
      correctionHistory: this.selfCorrectionEngine.getCorrectionHistory().slice(-10) // Last 10 attempts
    };
  }

  // Campaign management
  addCampaignConstraint(type: string, constraint: string) {
    this.consistencyEnforcer.addCampaignConstraint(type as any, constraint);
  }

  getCampaignMemory() {
    return this.consistencyEnforcer.getCampaignMemory();
  }

  // Tone and theme management
  setToneProfile(profileId: string): boolean {
    return this.toneThemeChecker.setToneProfile(profileId);
  }

  setThemeProfile(profileId: string): boolean {
    return this.toneThemeChecker.setThemeProfile(profileId);
  }

  getAvailableProfiles() {
    return this.toneThemeChecker.getAvailableProfiles();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AdvancedPromptEngineeringService;