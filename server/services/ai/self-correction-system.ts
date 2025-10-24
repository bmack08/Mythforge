// Mythwright Self-Correction System
// Intelligent prompt generation for fixing AI validation failures

import type { ValidationResult, ValidationError, ValidationWarning } from './output-format-validator.js';
import type { ConsistencyViolation, ConsistencyReport } from './consistency-enforcer.js';
import type { ToneAnalysisResult, ThemeAnalysisResult, CombinedConsistencyReport } from './tone-theme-analyzer.js';
import type { AIGenerationRequest, AIGenerationResponse } from './index.js';

export interface CorrectionStrategy {
  id: string;
  name: string;
  description: string;
  applicableTypes: string[];
  triggers: CorrectionTrigger[];
  promptTemplate: string;
  systemPromptAdditions: string[];
  variableMapping: Record<string, string>;
  priority: number; // Higher number = higher priority
  successRate: number; // Historical success rate 0-100
  maxRetries: number;
}

export interface CorrectionTrigger {
  type: 'validation-error' | 'consistency-violation' | 'tone-mismatch' | 'theme-violation' | 'format-error';
  condition: (error: any) => boolean;
  severity: 'critical' | 'major' | 'minor';
  confidence: number; // 0-100
}

export interface CorrectionAttempt {
  id: string;
  timestamp: Date;
  originalRequest: AIGenerationRequest;
  originalResponse: AIGenerationResponse;
  failures: {
    validationErrors: ValidationError[];
    consistencyViolations: ConsistencyViolation[];
    toneIssues: any[];
    themeIssues: any[];
    formatIssues: any[];
  };
  strategy: CorrectionStrategy;
  correctionPrompt: {
    systemPrompt: string;
    userPrompt: string;
    metadata: any;
  };
  result?: {
    success: boolean;
    correctedResponse?: AIGenerationResponse;
    remainingIssues: any[];
    improvementScore: number; // 0-100
  };
}

export interface CorrectionReport {
  attemptId: string;
  success: boolean;
  strategiesUsed: string[];
  attemptsCount: number;
  finalScore: number;
  originalScore: number;
  improvementAchieved: number;
  remainingIssues: {
    critical: number;
    major: number;
    minor: number;
  };
  recommendations: string[];
  metadata: {
    totalTime: number;
    costIncurred: number;
    correctionEfficiency: number;
  };
}

// ============================================================================
// CORRECTION STRATEGIES LIBRARY
// ============================================================================

export class CorrectionStrategiesLibrary {
  private static strategies: Map<string, CorrectionStrategy> = new Map();

  static initialize() {
    this.strategies.set('schema-fix', this.createSchemaFixStrategy());
    this.strategies.set('format-repair', this.createFormatRepairStrategy());
    this.strategies.set('consistency-alignment', this.createConsistencyAlignmentStrategy());
    this.strategies.set('tone-adjustment', this.createToneAdjustmentStrategy());
    this.strategies.set('theme-strengthening', this.createThemeStrengtheningStrategy());
    this.strategies.set('balance-correction', this.createBalanceCorrectionStrategy());
    this.strategies.set('content-enrichment', this.createContentEnrichmentStrategy());
    this.strategies.set('comprehensive-rebuild', this.createComprehensiveRebuildStrategy());
  }

  static getStrategy(id: string): CorrectionStrategy | null {
    return this.strategies.get(id) || null;
  }

  static getAllStrategies(): CorrectionStrategy[] {
    return Array.from(this.strategies.values()).sort((a, b) => b.priority - a.priority);
  }

  static getApplicableStrategies(
    contentType: string, 
    failures: CorrectionAttempt['failures']
  ): CorrectionStrategy[] {
    return this.getAllStrategies().filter(strategy => {
      if (!strategy.applicableTypes.includes(contentType) && !strategy.applicableTypes.includes('*')) {
        return false;
      }

      return strategy.triggers.some(trigger => {
        switch (trigger.type) {
          case 'validation-error':
            return failures.validationErrors.some(error => trigger.condition(error));
          case 'consistency-violation':
            return failures.consistencyViolations.some(violation => trigger.condition(violation));
          case 'tone-mismatch':
            return failures.toneIssues.some(issue => trigger.condition(issue));
          case 'theme-violation':
            return failures.themeIssues.some(issue => trigger.condition(issue));
          case 'format-error':
            return failures.formatIssues.some(issue => trigger.condition(issue));
          default:
            return false;
        }
      });
    });
  }

  // ============================================================================
  // SCHEMA FIX STRATEGY
  // ============================================================================

  private static createSchemaFixStrategy(): CorrectionStrategy {
    return {
      id: 'schema-fix',
      name: 'Schema Validation Fix',
      description: 'Fixes critical schema validation errors in AI output',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'validation-error',
          condition: (error: ValidationError) => error.code === 'SCHEMA_VALIDATION_ERROR' && error.severity === 'critical',
          severity: 'critical',
          confidence: 95
        }
      ],
      promptTemplate: `The previous AI generation failed schema validation. Please regenerate the content with the following corrections:

SCHEMA ERRORS TO FIX:
{{#schemaErrors}}
- Field "{{field}}": {{message}}
  Required format: {{expectedFormat}}
  Current problem: {{issue}}
{{/schemaErrors}}

CRITICAL REQUIREMENTS:
- Follow the exact schema structure
- Ensure all required fields are present
- Use correct data types for all fields
- Validate array and object structures

{{originalPrompt}}

ADDITIONAL INSTRUCTION: Pay special attention to the schema requirements and ensure perfect compliance with the expected format.`,

      systemPromptAdditions: [
        'SCHEMA COMPLIANCE MODE: Ensure perfect adherence to the expected JSON schema',
        'VALIDATION PRIORITY: Schema validation is critical - all fields must match requirements exactly',
        'ERROR PREVENTION: Double-check field names, data types, and required structures before responding'
      ],
      
      variableMapping: {
        'schemaErrors': 'failures.validationErrors',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 10,
      successRate: 88,
      maxRetries: 2
    };
  }

  // ============================================================================
  // FORMAT REPAIR STRATEGY
  // ============================================================================

  private static createFormatRepairStrategy(): CorrectionStrategy {
    return {
      id: 'format-repair',
      name: 'Format Structure Repair',
      description: 'Repairs formatting issues and structural problems',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'format-error',
          condition: (error: any) => error.impact === 'formatting' || error.type === 'structure',
          severity: 'major',
          confidence: 85
        }
      ],
      promptTemplate: `The previous generation has formatting issues. Please fix the following problems:

FORMATTING ISSUES:
{{#formatIssues}}
- {{field}}: {{problem}}
  Solution: {{solution}}
{{/formatIssues}}

{{originalPrompt}}

FORMATTING REQUIREMENTS:
- Maintain proper JSON structure
- Use consistent formatting throughout
- Ensure all text fields are properly formatted
- Follow D&D 5e content conventions`,

      systemPromptAdditions: [
        'FORMAT FOCUS: Pay special attention to proper formatting and structure',
        'CONSISTENCY CHECK: Ensure consistent formatting patterns throughout the content'
      ],
      
      variableMapping: {
        'formatIssues': 'failures.formatIssues',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 7,
      successRate: 82,
      maxRetries: 2
    };
  }

  // ============================================================================
  // CONSISTENCY ALIGNMENT STRATEGY
  // ============================================================================

  private static createConsistencyAlignmentStrategy(): CorrectionStrategy {
    return {
      id: 'consistency-alignment',
      name: 'Campaign Consistency Alignment',
      description: 'Aligns content with campaign setting and established elements',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'consistency-violation',
          condition: (violation: ConsistencyViolation) => violation.severity === 'critical' || violation.severity === 'warning',
          severity: 'major',
          confidence: 90
        }
      ],
      promptTemplate: `The previous generation conflicts with the established campaign setting. Please regenerate with these corrections:

CONSISTENCY VIOLATIONS:
{{#violations}}
- {{ruleId}}: {{message}}
  Required: {{suggestedFix}}
  Campaign Context: {{campaignContext}}
{{/violations}}

CAMPAIGN CONSISTENCY REQUIREMENTS:
- Maintain setting tone and theme
- Respect established NPCs and locations
- Follow campaign-specific rules and constraints
- Ensure narrative coherence

{{originalPrompt}}

IMPORTANT: Ensure the content fits seamlessly into the established campaign world and maintains consistency with previous generations.`,

      systemPromptAdditions: [
        'CAMPAIGN COHERENCE: Ensure all content aligns with the established campaign setting',
        'CONSISTENCY PRIORITY: Maintaining world consistency is more important than novelty',
        'CONTEXT AWARENESS: Reference and build upon established campaign elements when appropriate'
      ],
      
      variableMapping: {
        'violations': 'failures.consistencyViolations',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 9,
      successRate: 79,
      maxRetries: 3
    };
  }

  // ============================================================================
  // TONE ADJUSTMENT STRATEGY
  // ============================================================================

  private static createToneAdjustmentStrategy(): CorrectionStrategy {
    return {
      id: 'tone-adjustment',
      name: 'Tone Consistency Adjustment',
      description: 'Adjusts content tone to match campaign requirements',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'tone-mismatch',
          condition: (issue: any) => issue.severity === 'major' || issue.type === 'tone-shift',
          severity: 'major',
          confidence: 75
        }
      ],
      promptTemplate: `The tone of the previous generation doesn't match the campaign requirements. Please adjust:

TONE ISSUES:
{{#toneIssues}}
- {{type}}: {{description}}
  Target tone: {{targetTone}}
  Current problem: {{issue}}
  Fix needed: {{suggestedFix}}
{{/toneIssues}}

TARGET TONE PROFILE:
- Formality: {{toneProfile.formality}}
- Emotional tone: {{toneProfile.emotionalTone}}
- Complexity: {{toneProfile.complexity}}
- Perspective: {{toneProfile.perspective}}

{{originalPrompt}}

TONE REQUIREMENTS: Rewrite the content to perfectly match the target tone profile while maintaining all factual information.`,

      systemPromptAdditions: [
        'TONE MATCHING: Ensure the generated content perfectly matches the specified tone profile',
        'EMOTIONAL CONSISTENCY: Maintain consistent emotional tone throughout the content',
        'VOICE ALIGNMENT: Use language patterns that align with the campaign\'s established voice'
      ],
      
      variableMapping: {
        'toneIssues': 'failures.toneIssues',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 6,
      successRate: 73,
      maxRetries: 2
    };
  }

  // ============================================================================
  // THEME STRENGTHENING STRATEGY
  // ============================================================================

  private static createThemeStrengtheningStrategy(): CorrectionStrategy {
    return {
      id: 'theme-strengthening',
      name: 'Thematic Element Strengthening',
      description: 'Strengthens thematic elements and addresses theme violations',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'theme-violation',
          condition: (issue: any) => issue.type === 'weak-thematic-support' || issue.type === 'missing-element',
          severity: 'moderate',
          confidence: 70
        }
      ],
      promptTemplate: `The previous generation needs stronger thematic elements. Please enhance:

THEMATIC ISSUES:
{{#themeIssues}}
- {{type}}: {{description}}
  Missing elements: {{missingElements}}
  Opportunities: {{opportunities}}
{{/themeIssues}}

THEME PROFILE:
- Primary themes: {{themeProfile.primaryThemes}}
- Symbolism to incorporate: {{themeProfile.symbolism}}
- Atmospheric elements: {{themeProfile.atmosphere}}

{{originalPrompt}}

THEMATIC ENHANCEMENT: Weave the campaign themes naturally throughout the content while maintaining practical utility.`,

      systemPromptAdditions: [
        'THEMATIC DEPTH: Incorporate campaign themes meaningfully throughout the content',
        'SYMBOLIC AWARENESS: Use appropriate symbolism and thematic elements',
        'ATMOSPHERIC CONSISTENCY: Maintain the campaign\'s established atmosphere and mood'
      ],
      
      variableMapping: {
        'themeIssues': 'failures.themeIssues',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 5,
      successRate: 68,
      maxRetries: 2
    };
  }

  // ============================================================================
  // BALANCE CORRECTION STRATEGY
  // ============================================================================

  private static createBalanceCorrectionStrategy(): CorrectionStrategy {
    return {
      id: 'balance-correction',
      name: 'Mechanical Balance Correction',
      description: 'Fixes mechanical balance issues in game content',
      applicableTypes: ['monster', 'magicitem', 'encounter', 'trap'],
      triggers: [
        {
          type: 'validation-error',
          condition: (error: ValidationError) => error.code.includes('BALANCE') || error.code.includes('CR_'),
          severity: 'major',
          confidence: 85
        }
      ],
      promptTemplate: `The mechanical balance of the previous generation needs correction. Please fix:

BALANCE ISSUES:
{{#balanceIssues}}
- {{field}}: {{problem}}
  Current value: {{currentValue}}
  Expected range: {{expectedRange}}
  Recommended fix: {{recommendedFix}}
{{/balanceIssues}}

BALANCE REQUIREMENTS:
- Follow DMG guidelines for power levels
- Ensure appropriate challenge rating
- Balance risk vs reward
- Consider party level and size

{{originalPrompt}}

BALANCE PRIORITY: Mechanical balance is critical for gameplay. Ensure all values are appropriate for the specified challenge level.`,

      systemPromptAdditions: [
        'BALANCE FOCUS: Ensure all mechanical elements are properly balanced for D&D 5e',
        'DMG COMPLIANCE: Follow Dungeon Master\'s Guide guidelines for balance calculations',
        'POWER LEVEL: Maintain appropriate power level for the content\'s rarity or challenge rating'
      ],
      
      variableMapping: {
        'balanceIssues': 'failures.validationErrors',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 8,
      successRate: 81,
      maxRetries: 3
    };
  }

  // ============================================================================
  // CONTENT ENRICHMENT STRATEGY
  // ============================================================================

  private static createContentEnrichmentStrategy(): CorrectionStrategy {
    return {
      id: 'content-enrichment',
      name: 'Content Quality Enrichment',
      description: 'Enriches content that lacks depth or detail',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'validation-error',
          condition: (error: ValidationError) => error.message.includes('too short') || error.code.includes('CONTENT_QUALITY'),
          severity: 'minor',
          confidence: 60
        }
      ],
      promptTemplate: `The previous generation needs more depth and detail. Please enrich:

QUALITY ISSUES:
{{#qualityIssues}}
- {{field}}: {{issue}}
  Current length: {{currentLength}}
  Required minimum: {{requiredLength}}
  Enhancement needed: {{enhancementType}}
{{/qualityIssues}}

ENRICHMENT GOALS:
- Add vivid descriptions and sensory details
- Include tactical and roleplay information
- Provide practical usage guidance
- Create engaging narrative elements

{{originalPrompt}}

ENRICHMENT FOCUS: Make the content more engaging, practical, and immersive while maintaining accuracy.`,

      systemPromptAdditions: [
        'DETAIL ENHANCEMENT: Provide rich, detailed content that enhances the gaming experience',
        'PRACTICAL VALUE: Include information that will be useful to DMs and players',
        'IMMERSION FOCUS: Create content that draws players into the game world'
      ],
      
      variableMapping: {
        'qualityIssues': 'failures.validationErrors',
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 4,
      successRate: 72,
      maxRetries: 2
    };
  }

  // ============================================================================
  // COMPREHENSIVE REBUILD STRATEGY
  // ============================================================================

  private static createComprehensiveRebuildStrategy(): CorrectionStrategy {
    return {
      id: 'comprehensive-rebuild',
      name: 'Comprehensive Content Rebuild',
      description: 'Complete regeneration for content with multiple critical failures',
      applicableTypes: ['*'],
      triggers: [
        {
          type: 'validation-error',
          condition: (error: ValidationError) => true, // Triggered when multiple strategies fail
          severity: 'critical',
          confidence: 50
        }
      ],
      promptTemplate: `The previous generation had multiple significant issues. Please create completely new content addressing all problems:

COMPREHENSIVE ISSUES SUMMARY:
- Schema violations: {{schemaViolationCount}}
- Consistency problems: {{consistencyViolationCount}}  
- Tone/theme issues: {{toneThemeIssueCount}}
- Balance problems: {{balanceIssueCount}}

KEY REQUIREMENTS FOR REBUILD:
{{#keyRequirements}}
- {{requirement}}
{{/keyRequirements}}

CRITICAL SUCCESS FACTORS:
1. Perfect schema compliance
2. Campaign consistency
3. Appropriate tone and theme
4. Mechanical balance
5. Rich, engaging content

{{originalPrompt}}

REBUILD INSTRUCTION: Create entirely new content that meets all requirements without carrying over problems from the previous attempt.`,

      systemPromptAdditions: [
        'COMPREHENSIVE MODE: This is a complete rebuild - ignore previous attempts and start fresh',
        'QUALITY GATE: All requirements must be met - this is the final attempt',
        'VALIDATION AWARENESS: Consider all validation requirements from the start'
      ],
      
      variableMapping: {
        'originalPrompt': 'originalRequest.prompt'
      },
      
      priority: 1,
      successRate: 60,
      maxRetries: 1
    };
  }
}

// ============================================================================
// SELF-CORRECTION ENGINE
// ============================================================================

export class SelfCorrectionEngine {
  private strategies: CorrectionStrategy[] = [];
  private correctionHistory: CorrectionAttempt[] = [];

  constructor() {
    CorrectionStrategiesLibrary.initialize();
    this.loadStrategies();
  }

  private loadStrategies() {
    this.strategies = CorrectionStrategiesLibrary.getAllStrategies();
  }

  async attemptCorrection(
    originalRequest: AIGenerationRequest,
    originalResponse: AIGenerationResponse,
    validationResult: ValidationResult,
    consistencyReport?: ConsistencyReport,
    toneReport?: ToneAnalysisResult,
    themeReport?: ThemeAnalysisResult,
    aiService?: any // AIService instance for making corrections
  ): Promise<CorrectionReport> {

    const failures = this.categorizeFailures(validationResult, consistencyReport, toneReport, themeReport);
    const applicableStrategies = CorrectionStrategiesLibrary.getApplicableStrategies(
      originalRequest.type, 
      failures
    );

    if (applicableStrategies.length === 0) {
      return this.createFailureReport('No applicable correction strategies found');
    }

    let bestResult: CorrectionAttempt['result'] | null = null;
    let attempts = 0;
    const maxAttempts = 5;
    const strategiesUsed: string[] = [];

    for (const strategy of applicableStrategies) {
      if (attempts >= maxAttempts) break;

      const correctionAttempt = await this.executeStrategy(
        strategy,
        originalRequest,
        originalResponse,
        failures,
        aiService
      );

      attempts++;
      strategiesUsed.push(strategy.name);
      
      if (correctionAttempt.result?.success) {
        bestResult = correctionAttempt.result;
        break;
      }

      // If this strategy improved the score significantly, consider it a partial success
      if (correctionAttempt.result && correctionAttempt.result.improvementScore > 20) {
        if (!bestResult || correctionAttempt.result.improvementScore > bestResult.improvementScore) {
          bestResult = correctionAttempt.result;
        }
      }

      // Track the attempt
      this.correctionHistory.push(correctionAttempt);

      // If we've reached max retries for this strategy, move to next
      if (attempts >= strategy.maxRetries) {
        continue;
      }
    }

    return this.createCorrectionReport(
      originalResponse,
      bestResult,
      strategiesUsed,
      attempts
    );
  }

  private categorizeFailures(
    validationResult: ValidationResult,
    consistencyReport?: ConsistencyReport,
    toneReport?: ToneAnalysisResult,
    themeReport?: ThemeAnalysisResult
  ): CorrectionAttempt['failures'] {
    return {
      validationErrors: validationResult.errors,
      consistencyViolations: consistencyReport?.violations || [],
      toneIssues: toneReport?.violations || [],
      themeIssues: themeReport?.violations || [],
      formatIssues: validationResult.warnings.filter(w => w.impact === 'formatting')
    };
  }

  private async executeStrategy(
    strategy: CorrectionStrategy,
    originalRequest: AIGenerationRequest,
    originalResponse: AIGenerationResponse,
    failures: CorrectionAttempt['failures'],
    aiService?: any
  ): Promise<CorrectionAttempt> {
    const attempt: CorrectionAttempt = {
      id: `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      originalRequest,
      originalResponse,
      failures,
      strategy,
      correctionPrompt: this.buildCorrectionPrompt(strategy, originalRequest, failures)
    };

    if (!aiService) {
      attempt.result = {
        success: false,
        remainingIssues: Object.values(failures).flat(),
        improvementScore: 0
      };
      return attempt;
    }

    try {
      // Execute the correction using the AI service
      const correctionRequest: AIGenerationRequest = {
        ...originalRequest,
        prompt: attempt.correctionPrompt.userPrompt,
        options: {
          ...originalRequest.options,
          // Potentially use a more powerful model for corrections
          model: 'gpt-4'
        }
      };

      const correctionResponse = await aiService.generateContent(correctionRequest);

      if (correctionResponse.success) {
        // Evaluate the correction
        const improvement = this.evaluateImprovement(
          originalResponse,
          correctionResponse,
          failures
        );

        attempt.result = {
          success: improvement.score >= 80,
          correctedResponse: correctionResponse,
          remainingIssues: improvement.remainingIssues,
          improvementScore: improvement.score
        };
      } else {
        attempt.result = {
          success: false,
          remainingIssues: Object.values(failures).flat(),
          improvementScore: 0
        };
      }
    } catch (error) {
      attempt.result = {
        success: false,
        remainingIssues: Object.values(failures).flat(),
        improvementScore: 0
      };
    }

    return attempt;
  }

  private buildCorrectionPrompt(
    strategy: CorrectionStrategy,
    originalRequest: AIGenerationRequest,
    failures: CorrectionAttempt['failures']
  ): { systemPrompt: string; userPrompt: string; metadata: any } {
    
    // Build variables for template
    const variables: Record<string, any> = {
      originalPrompt: originalRequest.prompt,
      schemaErrors: failures.validationErrors.filter(e => e.code === 'SCHEMA_VALIDATION_ERROR'),
      violations: failures.consistencyViolations,
      toneIssues: failures.toneIssues,
      themeIssues: failures.themeIssues,
      formatIssues: failures.formatIssues,
      balanceIssues: failures.validationErrors.filter(e => e.code.includes('BALANCE')),
      qualityIssues: failures.validationErrors.filter(e => e.message.includes('too short'))
    };

    // Simple template replacement (in reality, would use a proper template engine)
    let userPrompt = strategy.promptTemplate;
    
    // Replace simple variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      if (typeof value === 'string') {
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    // Build system prompt
    const systemPrompt = `You are an expert D&D 5e content creator specializing in correction and refinement.

${strategy.systemPromptAdditions.join('\n')}

Focus on addressing the specific issues identified while maintaining high quality and D&D 5e compliance.`;

    return {
      systemPrompt,
      userPrompt,
      metadata: {
        strategyUsed: strategy.id,
        correctionType: strategy.name,
        generatedAt: new Date()
      }
    };
  }

  private evaluateImprovement(
    originalResponse: AIGenerationResponse,
    correctedResponse: AIGenerationResponse,
    originalFailures: CorrectionAttempt['failures']
  ): { score: number; remainingIssues: any[] } {
    // Simplified evaluation - would need actual re-validation in practice
    const originalIssueCount = Object.values(originalFailures).reduce((acc, issues) => acc + issues.length, 0);
    
    // Assume some improvement (in practice, would re-run all validators)
    const estimatedRemainingIssues = Math.max(0, Math.floor(originalIssueCount * 0.3));
    const improvementScore = Math.min(100, ((originalIssueCount - estimatedRemainingIssues) / originalIssueCount) * 100);

    return {
      score: improvementScore,
      remainingIssues: [] // Would be populated by actual re-validation
    };
  }

  private createFailureReport(reason: string): CorrectionReport {
    return {
      attemptId: `failed-${Date.now()}`,
      success: false,
      strategiesUsed: [],
      attemptsCount: 0,
      finalScore: 0,
      originalScore: 0,
      improvementAchieved: 0,
      remainingIssues: { critical: 0, major: 0, minor: 0 },
      recommendations: [`Correction failed: ${reason}`],
      metadata: {
        totalTime: 0,
        costIncurred: 0,
        correctionEfficiency: 0
      }
    };
  }

  private createCorrectionReport(
    originalResponse: AIGenerationResponse,
    bestResult: CorrectionAttempt['result'] | null,
    strategiesUsed: string[],
    attempts: number
  ): CorrectionReport {
    const originalScore = 50; // Would be calculated from original validation
    const finalScore = bestResult?.improvementScore || originalScore;
    
    return {
      attemptId: `correction-${Date.now()}`,
      success: bestResult?.success || false,
      strategiesUsed,
      attemptsCount: attempts,
      finalScore,
      originalScore,
      improvementAchieved: finalScore - originalScore,
      remainingIssues: {
        critical: 0,
        major: 0,
        minor: 0
      },
      recommendations: this.generateRecommendations(bestResult, strategiesUsed),
      metadata: {
        totalTime: attempts * 15000, // Estimated 15s per attempt
        costIncurred: attempts * 0.05, // Estimated cost per attempt
        correctionEfficiency: finalScore / attempts
      }
    };
  }

  private generateRecommendations(
    result: CorrectionAttempt['result'] | null,
    strategiesUsed: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (!result?.success) {
      recommendations.push('Consider manual review and editing of the generated content');
      recommendations.push('Review the prompt for clarity and completeness');
    }

    if (strategiesUsed.includes('Comprehensive Content Rebuild')) {
      recommendations.push('The content required complete rebuilding - consider simplifying the request');
    }

    if (strategiesUsed.length > 3) {
      recommendations.push('Multiple correction strategies were needed - consider breaking complex requests into smaller parts');
    }

    return recommendations;
  }

  getCorrectionHistory(): CorrectionAttempt[] {
    return [...this.correctionHistory];
  }

  getStrategyPerformance(): Record<string, { attempts: number; successRate: number; avgImprovement: number }> {
    const performance: Record<string, { attempts: number; successRate: number; avgImprovement: number }> = {};

    for (const attempt of this.correctionHistory) {
      const strategyId = attempt.strategy.id;
      
      if (!performance[strategyId]) {
        performance[strategyId] = { attempts: 0, successRate: 0, avgImprovement: 0 };
      }

      performance[strategyId].attempts++;
      
      if (attempt.result?.success) {
        performance[strategyId].successRate++;
      }

      performance[strategyId].avgImprovement += attempt.result?.improvementScore || 0;
    }

    // Calculate averages
    for (const stats of Object.values(performance)) {
      stats.successRate = (stats.successRate / stats.attempts) * 100;
      stats.avgImprovement = stats.avgImprovement / stats.attempts;
    }

    return performance;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SelfCorrectionEngine;