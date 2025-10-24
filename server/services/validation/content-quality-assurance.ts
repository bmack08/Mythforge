// Mythwright Content Validation and Quality Assurance System - Task 85
// Comprehensive quality control for AI-generated D&D content

import type { 
  StatBlock,
  NPC,
  MagicItem,
  Encounter,
  Chapter,
  Section,
  SystemDesignBudget
} from '../../types/content.types.js';

// ============================================================================
// QUALITY ASSURANCE TYPES
// ============================================================================

export interface QualityAssuranceReport {
  // Overall Assessment
  contentId: string;
  contentType: string;
  overallScore: number; // 0-100
  qualityGrade: QualityGrade;
  
  // Detailed Analysis
  validationResults: ValidationCategory[];
  qualityMetrics: QualityMetrics;
  
  // Issues and Recommendations
  criticalIssues: QualityIssue[];
  warnings: QualityIssue[];
  suggestions: QualityIssue[];
  
  // Compliance
  srdCompliance: ComplianceResult;
  accessibilityCompliance: ComplianceResult;
  
  // Metadata
  validatedAt: Date;
  validatorVersion: string;
}

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ValidationCategory {
  category: string;
  weight: number;
  score: number; // 0-100
  passed: boolean;
  details: ValidationDetail[];
}

export interface ValidationDetail {
  rule: string;
  passed: boolean;
  score: number;
  message: string;
  severity: 'critical' | 'warning' | 'suggestion';
  autoFixable: boolean;
  fix?: string;
}

export interface QualityMetrics {
  // Balance Metrics
  mechanicalBalance: number; // 0-100
  crAccuracy?: number; // For monsters
  xpBudgetCompliance?: number; // For encounters
  
  // Content Quality
  narrativeCoherence: number;
  descriptiveRichness: number;
  readability: number;
  
  // D&D Specific
  rulesCompliance: number;
  thematicConsistency: number;
  playerUsability: number;
  
  // Technical Quality
  formatCompliance: number;
  crossReferenceIntegrity: number;
  metadataCompleteness: number;
}

export interface QualityIssue {
  issueId: string;
  severity: 'critical' | 'warning' | 'suggestion';
  category: string;
  rule: string;
  message: string;
  location?: ContentLocation;
  autoFixable: boolean;
  suggestedFix?: string;
  impact: QualityImpact;
}

export interface ContentLocation {
  section?: string;
  line?: number;
  character?: number;
  field?: string;
}

export interface QualityImpact {
  usability: number; // -10 to 0 (negative impact on usability)
  balance: number; // -10 to 0 (negative impact on game balance)
  immersion: number; // -10 to 0 (negative impact on immersion)
  accessibility: number; // -10 to 0 (negative impact on accessibility)
}

export interface ComplianceResult {
  compliant: boolean;
  score: number; // 0-100
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  rule: string;
  severity: 'critical' | 'warning';
  message: string;
  location?: ContentLocation;
  fix?: string;
}

// ============================================================================
// CONTENT QUALITY ASSURANCE CLASS
// ============================================================================

export class ContentQualityAssurance {
  private validatorVersion = '1.0.0';
  
  // ========================================================================
  // MAIN VALIDATION ENTRY POINTS
  // ========================================================================
  
  /**
   * Validate any D&D content and generate comprehensive quality report
   */
  async validateContent(
    content: any, 
    contentType: string, 
    context?: {
      systemDesignBudget?: SystemDesignBudget;
      relatedContent?: Map<string, any>;
      validationOptions?: ValidationOptions;
    }
  ): Promise<QualityAssuranceReport> {
    const contentId = content.id || `${contentType}_${Date.now()}`;
    
    // Initialize report
    const report: QualityAssuranceReport = {
      contentId,
      contentType,
      overallScore: 0,
      qualityGrade: 'F',
      validationResults: [],
      qualityMetrics: this.initializeQualityMetrics(),
      criticalIssues: [],
      warnings: [],
      suggestions: [],
      srdCompliance: { compliant: true, score: 100, violations: [], recommendations: [] },
      accessibilityCompliance: { compliant: true, score: 100, violations: [], recommendations: [] },
      validatedAt: new Date(),
      validatorVersion: this.validatorVersion
    };
    
    // Run validation categories
    const validationCategories = this.getValidationCategories(contentType);
    
    for (const category of validationCategories) {
      const categoryResult = await this.validateCategory(content, category, context);
      report.validationResults.push(categoryResult);
      
      // Collect issues by severity
      categoryResult.details.forEach(detail => {
        if (!detail.passed) {
          const issue: QualityIssue = {
            issueId: `${contentId}_${category.category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            severity: detail.severity,
            category: category.category,
            rule: detail.rule,
            message: detail.message,
            autoFixable: detail.autoFixable,
            suggestedFix: detail.fix,
            impact: this.calculateQualityImpact(detail, contentType)
          };
          
          switch (detail.severity) {
            case 'critical':
              report.criticalIssues.push(issue);
              break;
            case 'warning':
              report.warnings.push(issue);
              break;
            case 'suggestion':
              report.suggestions.push(issue);
              break;
          }
        }
      });
    }
    
    // Calculate overall metrics and score
    report.qualityMetrics = await this.calculateQualityMetrics(content, contentType, report.validationResults);
    report.overallScore = this.calculateOverallScore(report.validationResults);
    report.qualityGrade = this.determineQualityGrade(report.overallScore);
    
    // Run compliance checks
    report.srdCompliance = await this.validateSRDCompliance(content, contentType);
    report.accessibilityCompliance = await this.validateAccessibilityCompliance(content, contentType);
    
    return report;
  }
  
  /**
   * Validate a stat block (monster, NPC, etc.)
   */
  async validateStatBlock(statBlock: StatBlock, context?: any): Promise<QualityAssuranceReport> {
    return this.validateContent(statBlock, 'statblock', context);
  }
  
  /**
   * Validate an encounter
   */
  async validateEncounter(encounter: Encounter, context?: any): Promise<QualityAssuranceReport> {
    return this.validateContent(encounter, 'encounter', context);
  }
  
  /**
   * Validate a magic item
   */
  async validateMagicItem(item: MagicItem, context?: any): Promise<QualityAssuranceReport> {
    return this.validateContent(item, 'magic_item', context);
  }
  
  /**
   * Validate an NPC
   */
  async validateNPC(npc: NPC, context?: any): Promise<QualityAssuranceReport> {
    return this.validateContent(npc, 'npc', context);
  }
  
  // ========================================================================
  // VALIDATION CATEGORIES
  // ========================================================================
  
  /**
   * Get validation categories for a content type
   */
  private getValidationCategories(contentType: string): ValidationCategoryConfig[] {
    const baseCategories: ValidationCategoryConfig[] = [
      { category: 'structure', weight: 0.2, rules: this.getStructureRules(contentType) },
      { category: 'content_quality', weight: 0.25, rules: this.getContentQualityRules(contentType) },
      { category: 'rules_compliance', weight: 0.2, rules: this.getRulesComplianceRules(contentType) },
      { category: 'balance', weight: 0.15, rules: this.getBalanceRules(contentType) },
      { category: 'usability', weight: 0.1, rules: this.getUsabilityRules(contentType) },
      { category: 'formatting', weight: 0.1, rules: this.getFormattingRules(contentType) }
    ];
    
    return baseCategories;
  }
  
  /**
   * Validate a specific category
   */
  private async validateCategory(
    content: any, 
    category: ValidationCategoryConfig, 
    context?: any
  ): Promise<ValidationCategory> {
    const details: ValidationDetail[] = [];
    
    for (const rule of category.rules) {
      const result = await this.applyValidationRule(content, rule, context);
      details.push(result);
    }
    
    // Calculate category score
    const totalScore = details.reduce((sum, detail) => sum + detail.score, 0);
    const maxScore = details.length * 100;
    const categoryScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
    
    const passed = details.every(detail => detail.passed || detail.severity !== 'critical');
    
    return {
      category: category.category,
      weight: category.weight,
      score: categoryScore,
      passed,
      details
    };
  }
  
  /**
   * Apply a single validation rule
   */
  private async applyValidationRule(
    content: any, 
    rule: ValidationRule, 
    context?: any
  ): Promise<ValidationDetail> {
    try {
      const result = await rule.validator(content, context);
      
      return {
        rule: rule.name,
        passed: result.passed,
        score: result.score,
        message: result.message,
        severity: result.severity,
        autoFixable: result.autoFixable || false,
        fix: result.suggestedFix
      };
    } catch (error) {
      return {
        rule: rule.name,
        passed: false,
        score: 0,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical',
        autoFixable: false
      };
    }
  }
  
  // ========================================================================
  // VALIDATION RULES BY CATEGORY
  // ========================================================================
  
  /**
   * Get structure validation rules for content type
   */
  private getStructureRules(contentType: string): ValidationRule[] {
    const commonRules: ValidationRule[] = [
      {
        name: 'has_required_fields',
        description: 'Content has all required fields',
        validator: async (content) => {
          const requiredFields = this.getRequiredFields(contentType);
          const missingFields = requiredFields.filter(field => !this.hasField(content, field));
          
          return {
            passed: missingFields.length === 0,
            score: missingFields.length === 0 ? 100 : Math.max(0, 100 - (missingFields.length * 25)),
            message: missingFields.length === 0 ? 
              'All required fields present' : 
              `Missing required fields: ${missingFields.join(', ')}`,
            severity: 'critical' as const
          };
        }
      },
      {
        name: 'field_types_valid',
        description: 'All fields have correct data types',
        validator: async (content) => {
          const typeErrors = this.validateFieldTypes(content, contentType);
          
          return {
            passed: typeErrors.length === 0,
            score: typeErrors.length === 0 ? 100 : Math.max(0, 100 - (typeErrors.length * 20)),
            message: typeErrors.length === 0 ? 
              'All field types valid' : 
              `Type errors: ${typeErrors.join(', ')}`,
            severity: 'warning' as const
          };
        }
      }
    ];
    
    // Add content-specific structure rules
    switch (contentType) {
      case 'statblock':
        return [...commonRules, ...this.getStatBlockStructureRules()];
      case 'encounter':
        return [...commonRules, ...this.getEncounterStructureRules()];
      case 'magic_item':
        return [...commonRules, ...this.getMagicItemStructureRules()];
      default:
        return commonRules;
    }
  }
  
  /**
   * Get content quality validation rules
   */
  private getContentQualityRules(contentType: string): ValidationRule[] {
    return [
      {
        name: 'description_quality',
        description: 'Description is engaging and detailed',
        validator: async (content) => {
          const description = content.description || '';
          const wordCount = description.split(/\s+/).length;
          const hasVividLanguage = /\b(gleaming|ancient|mysterious|ominous|shimmering|weathered)\b/i.test(description);
          const hasSensoryDetails = /\b(smell|sound|taste|feel|sight|gleam|echo|whisper)\b/i.test(description);
          
          let score = 50; // Base score
          if (wordCount >= 20) score += 20;
          if (wordCount >= 50) score += 10;
          if (hasVividLanguage) score += 10;
          if (hasSensoryDetails) score += 10;
          
          return {
            passed: score >= 70,
            score: Math.min(100, score),
            message: score >= 70 ? 
              'Description is engaging and detailed' : 
              'Description could be more vivid and detailed',
            severity: score < 50 ? 'warning' as const : 'suggestion' as const
          };
        }
      },
      {
        name: 'narrative_coherence',
        description: 'Content maintains narrative coherence',
        validator: async (content) => {
          // Check for contradictions, timeline issues, etc.
          const coherenceScore = this.analyzeNarrativeCoherence(content);
          
          return {
            passed: coherenceScore >= 75,
            score: coherenceScore,
            message: coherenceScore >= 75 ? 
              'Narrative is coherent and consistent' : 
              'Some narrative inconsistencies detected',
            severity: coherenceScore < 60 ? 'warning' as const : 'suggestion' as const
          };
        }
      },
      {
        name: 'readability_level',
        description: 'Content is at appropriate reading level',
        validator: async (content) => {
          const text = this.extractText(content);
          const readabilityScore = this.calculateReadabilityScore(text);
          
          return {
            passed: readabilityScore >= 70,
            score: readabilityScore,
            message: `Readability score: ${readabilityScore}/100`,
            severity: readabilityScore < 60 ? 'warning' as const : 'suggestion' as const,
            autoFixable: true,
            suggestedFix: 'Consider simplifying complex sentences and using more common vocabulary'
          };
        }
      }
    ];
  }
  
  /**
   * Get rules compliance validation rules
   */
  private getRulesComplianceRules(contentType: string): ValidationRule[] {
    const rules: ValidationRule[] = [
      {
        name: 'srd_terminology',
        description: 'Uses only SRD-compliant terminology',
        validator: async (content) => {
          const violations = this.checkSRDTerminology(content);
          
          return {
            passed: violations.length === 0,
            score: violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 20)),
            message: violations.length === 0 ? 
              'All terminology is SRD-compliant' : 
              `SRD violations: ${violations.join(', ')}`,
            severity: 'critical' as const,
            autoFixable: true,
            suggestedFix: violations.length > 0 ? 
              `Replace: ${violations.map(v => `"${v}" with SRD equivalent`).join(', ')}` : 
              undefined
          };
        }
      }
    ];
    
    // Add content-specific rules compliance
    if (contentType === 'statblock') {
      rules.push({
        name: 'ability_score_range',
        description: 'Ability scores are within valid range (1-30)',
        validator: async (content) => {
          const abilities = content.abilities || {};
          const invalidAbilities = Object.entries(abilities)
            .filter(([_, score]) => typeof score === 'number' && (score < 1 || score > 30))
            .map(([ability]) => ability);
          
          return {
            passed: invalidAbilities.length === 0,
            score: invalidAbilities.length === 0 ? 100 : 0,
            message: invalidAbilities.length === 0 ? 
              'All ability scores valid' : 
              `Invalid ability scores: ${invalidAbilities.join(', ')}`,
            severity: 'critical' as const
          };
        }
      });
    }
    
    return rules;
  }
  
  /**
   * Get balance validation rules
   */
  private getBalanceRules(contentType: string): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    if (contentType === 'statblock') {
      rules.push({
        name: 'cr_accuracy',
        description: 'Challenge Rating matches calculated difficulty',
        validator: async (content) => {
          const calculatedCR = this.calculateChallengeRating(content);
          const declaredCR = content.challengeRating || 0;
          const difference = Math.abs(calculatedCR - declaredCR);
          
          const accurate = difference <= 1; // Allow 1 CR difference
          const score = accurate ? 100 : Math.max(0, 100 - (difference * 25));
          
          return {
            passed: accurate,
            score,
            message: accurate ? 
              'Challenge Rating is accurate' : 
              `CR mismatch: declared ${declaredCR}, calculated ~${calculatedCR}`,
            severity: difference > 2 ? 'warning' as const : 'suggestion' as const,
            autoFixable: true,
            suggestedFix: `Consider adjusting CR to ${calculatedCR}`
          };
        }
      });
    }
    
    if (contentType === 'encounter') {
      rules.push({
        name: 'xp_budget_compliance',
        description: 'Encounter XP matches difficulty budget',
        validator: async (content, context) => {
          const budget = context?.systemDesignBudget?.encounterBudget;
          if (!budget) {
            return {
              passed: true,
              score: 100,
              message: 'No budget context provided',
              severity: 'suggestion' as const
            };
          }
          
          const encounterXP = this.calculateEncounterXP(content);
          const expectedXP = budget.dailyXPBudget / 6; // Rough estimate
          const difference = Math.abs(encounterXP - expectedXP) / expectedXP;
          
          const compliant = difference <= 0.3; // 30% tolerance
          const score = compliant ? 100 : Math.max(0, 100 - (difference * 100));
          
          return {
            passed: compliant,
            score,
            message: compliant ? 
              'XP budget is appropriate' : 
              `XP budget mismatch: ${encounterXP} vs expected ~${expectedXP}`,
            severity: difference > 0.5 ? 'warning' as const : 'suggestion' as const
          };
        }
      });
    }
    
    return rules;
  }
  
  /**
   * Get usability validation rules
   */
  private getUsabilityRules(contentType: string): ValidationRule[] {
    return [
      {
        name: 'dm_friendly_format',
        description: 'Content is formatted for easy DM use',
        validator: async (content) => {
          const hasQuickReference = this.hasQuickReferenceInfo(content);
          const hasReadAloud = this.hasReadAloudText(content);
          const hasClearSections = this.hasClearSections(content);
          
          let score = 0;
          if (hasQuickReference) score += 40;
          if (hasReadAloud) score += 30;
          if (hasClearSections) score += 30;
          
          return {
            passed: score >= 70,
            score,
            message: score >= 70 ? 
              'Content is DM-friendly' : 
              'Content could be more DM-friendly',
            severity: 'suggestion' as const,
            autoFixable: true,
            suggestedFix: 'Add quick reference info, read-aloud text, or clearer section headers'
          };
        }
      },
      {
        name: 'player_accessibility',
        description: 'Content is accessible to players when appropriate',
        validator: async (content) => {
          const accessibilityScore = this.analyzePlayerAccessibility(content);
          
          return {
            passed: accessibilityScore >= 75,
            score: accessibilityScore,
            message: `Player accessibility score: ${accessibilityScore}/100`,
            severity: accessibilityScore < 60 ? 'warning' as const : 'suggestion' as const
          };
        }
      }
    ];
  }
  
  /**
   * Get formatting validation rules
   */
  private getFormattingRules(contentType: string): ValidationRule[] {
    return [
      {
        name: 'homebrewery_compatibility',
        description: 'Content uses valid Homebrewery markdown',
        validator: async (content) => {
          const markdown = this.extractMarkdown(content);
          const errors = this.validateHomebreweryMarkdown(markdown);
          
          return {
            passed: errors.length === 0,
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 15)),
            message: errors.length === 0 ? 
              'Homebrewery formatting is valid' : 
              `Formatting errors: ${errors.join(', ')}`,
            severity: 'warning' as const,
            autoFixable: true,
            suggestedFix: errors.length > 0 ? 
              'Fix markdown formatting issues' : 
              undefined
          };
        }
      },
      {
        name: 'consistent_styling',
        description: 'Content uses consistent styling conventions',
        validator: async (content) => {
          const styleScore = this.analyzeStyleConsistency(content);
          
          return {
            passed: styleScore >= 80,
            score: styleScore,
            message: `Style consistency score: ${styleScore}/100`,
            severity: styleScore < 60 ? 'warning' as const : 'suggestion' as const
          };
        }
      }
    ];
  }
  
  // ========================================================================
  // CONTENT-SPECIFIC STRUCTURE RULES
  // ========================================================================
  
  private getStatBlockStructureRules(): ValidationRule[] {
    return [
      {
        name: 'has_stat_block_essentials',
        description: 'Stat block has all essential D&D elements',
        validator: async (content) => {
          const essentials = ['name', 'size', 'type', 'armorClass', 'hitPoints', 'speed', 'abilities'];
          const missing = essentials.filter(field => !this.hasField(content, field));
          
          return {
            passed: missing.length === 0,
            score: missing.length === 0 ? 100 : Math.max(0, 100 - (missing.length * 15)),
            message: missing.length === 0 ? 
              'All stat block essentials present' : 
              `Missing: ${missing.join(', ')}`,
            severity: 'critical' as const
          };
        }
      }
    ];
  }
  
  private getEncounterStructureRules(): ValidationRule[] {
    return [
      {
        name: 'has_encounter_essentials',
        description: 'Encounter has all essential elements',
        validator: async (content) => {
          const essentials = ['title', 'description', 'monsters', 'difficulty'];
          const missing = essentials.filter(field => !this.hasField(content, field));
          
          return {
            passed: missing.length === 0,
            score: missing.length === 0 ? 100 : Math.max(0, 100 - (missing.length * 25)),
            message: missing.length === 0 ? 
              'All encounter essentials present' : 
              `Missing: ${missing.join(', ')}`,
            severity: 'critical' as const
          };
        }
      }
    ];
  }
  
  private getMagicItemStructureRules(): ValidationRule[] {
    return [
      {
        name: 'has_magic_item_essentials',
        description: 'Magic item has all essential elements',
        validator: async (content) => {
          const essentials = ['name', 'description', 'rarity'];
          const missing = essentials.filter(field => !this.hasField(content, field));
          
          return {
            passed: missing.length === 0,
            score: missing.length === 0 ? 100 : Math.max(0, 100 - (missing.length * 35)),
            message: missing.length === 0 ? 
              'All magic item essentials present' : 
              `Missing: ${missing.join(', ')}`,
            severity: 'critical' as const
          };
        }
      }
    ];
  }
  
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  
  private getRequiredFields(contentType: string): string[] {
    const fieldMap: Record<string, string[]> = {
      statblock: ['name', 'size', 'type', 'armorClass', 'hitPoints', 'abilities'],
      encounter: ['title', 'description', 'difficulty'],
      magic_item: ['name', 'description', 'rarity'],
      npc: ['name', 'personality', 'background'],
      chapter: ['title', 'content'],
      section: ['title', 'content']
    };
    
    return fieldMap[contentType] || ['name', 'description'];
  }
  
  private hasField(content: any, field: string): boolean {
    return content && content[field] !== undefined && content[field] !== null && content[field] !== '';
  }
  
  private validateFieldTypes(content: any, contentType: string): string[] {
    const errors: string[] = [];
    
    // Type validation would be more comprehensive in a real implementation
    if (contentType === 'statblock') {
      if (content.hitPoints && typeof content.hitPoints !== 'number') {
        errors.push('hitPoints must be a number');
      }
      if (content.armorClass && typeof content.armorClass !== 'number') {
        errors.push('armorClass must be a number');
      }
    }
    
    return errors;
  }
  
  private analyzeNarrativeCoherence(content: any): number {
    // Simplified coherence analysis
    const text = this.extractText(content);
    if (!text) return 100;
    
    // Check for basic coherence indicators
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 100;
    
    // Look for transition words, consistent tense, etc.
    const hasTransitions = /\b(however|therefore|meanwhile|suddenly|then|next|finally)\b/i.test(text);
    const hasConsistentTense = this.checkTenseConsistency(text);
    
    let score = 70; // Base score
    if (hasTransitions) score += 15;
    if (hasConsistentTense) score += 15;
    
    return Math.min(100, score);
  }
  
  private calculateReadabilityScore(text: string): number {
    if (!text) return 100;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) return 100;
    
    // Simplified Flesch Reading Ease formula
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 0-100 scale where higher is better
    return Math.max(0, Math.min(100, fleschScore));
  }
  
  private countSyllables(word: string): number {
    // Simplified syllable counting
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
  
  private checkSRDTerminology(content: any): string[] {
    const text = this.extractText(content);
    const violations: string[] = [];
    
    // Product Identity terms that should not appear
    const productIdentityTerms = [
      'beholder', 'mind flayer', 'illithid', 'githyanki', 'githzerai',
      'yuan-ti', 'kuo-toa', 'slaad', 'umber hulk', 'displacer beast'
    ];
    
    productIdentityTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text)) {
        violations.push(term);
      }
    });
    
    return violations;
  }
  
  private extractText(content: any): string {
    if (typeof content === 'string') return content;
    if (!content) return '';
    
    const textFields = ['name', 'description', 'content', 'flavor', 'background'];
    const texts: string[] = [];
    
    textFields.forEach(field => {
      if (content[field] && typeof content[field] === 'string') {
        texts.push(content[field]);
      }
    });
    
    return texts.join(' ');
  }
  
  private extractMarkdown(content: any): string {
    // Extract markdown content for validation
    return this.extractText(content);
  }
  
  private validateHomebreweryMarkdown(markdown: string): string[] {
    const errors: string[] = [];
    
    // Check for common Homebrewery markdown issues
    if (markdown.includes('{{')) {
      errors.push('Contains invalid template syntax');
    }
    
    // Check for proper stat block formatting
    if (markdown.includes('___') && !markdown.match(/___\s*>\s*##/)) {
      errors.push('Stat block formatting may be incorrect');
    }
    
    return errors;
  }
  
  private analyzeStyleConsistency(content: any): number {
    const text = this.extractText(content);
    if (!text) return 100;
    
    // Check for consistent capitalization, punctuation, etc.
    let score = 100;
    
    // Check for inconsistent capitalization
    const sentences = text.split(/[.!?]+/);
    const inconsistentCaps = sentences.filter(s => {
      const trimmed = s.trim();
      return trimmed.length > 0 && trimmed[0] !== trimmed[0].toUpperCase();
    });
    
    if (inconsistentCaps.length > 0) {
      score -= inconsistentCaps.length * 10;
    }
    
    return Math.max(0, score);
  }
  
  private calculateChallengeRating(statBlock: any): number {
    // Simplified CR calculation based on HP, AC, damage output
    const hp = statBlock.hitPoints || 1;
    const ac = statBlock.armorClass || 10;
    const damage = this.estimateDamageOutput(statBlock);
    
    // Very simplified CR estimation
    let cr = Math.sqrt(hp * damage) / 10;
    
    // Adjust for AC
    if (ac > 15) cr *= 1.2;
    if (ac < 12) cr *= 0.8;
    
    return Math.max(0, Math.round(cr * 4) / 4); // Round to nearest quarter
  }
  
  private estimateDamageOutput(statBlock: any): number {
    // Estimate damage output from attacks
    const attacks = statBlock.attacks || [];
    if (attacks.length === 0) return 5; // Default low damage
    
    return attacks.reduce((total: number, attack: any) => {
      const damageRoll = attack.damage || '1d4';
      return total + this.averageDamageRoll(damageRoll);
    }, 0);
  }
  
  private averageDamageRoll(damageRoll: string): number {
    // Parse damage roll like "2d6+3" and return average
    const match = damageRoll.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 1;
    
    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const modifier = parseInt(match[3] || '0');
    
    return numDice * (dieSize + 1) / 2 + modifier;
  }
  
  private calculateEncounterXP(encounter: any): number {
    const monsters = encounter.monsters || [];
    return monsters.reduce((total: number, monster: any) => {
      const cr = monster.challengeRating || 0;
      const xp = this.crToXP(cr);
      const count = monster.count || 1;
      return total + (xp * count);
    }, 0);
  }
  
  private crToXP(cr: number): number {
    const xpTable: Record<number, number> = {
      0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
      1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
      6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900
    };
    
    return xpTable[cr] || 100;
  }
  
  private checkTenseConsistency(text: string): boolean {
    // Very simplified tense consistency check
    const pastTenseWords = text.match(/\b\w+ed\b/g) || [];
    const presentTenseWords = text.match(/\b(is|are|has|have)\b/g) || [];
    
    if (pastTenseWords.length === 0 && presentTenseWords.length === 0) return true;
    
    const pastRatio = pastTenseWords.length / (pastTenseWords.length + presentTenseWords.length);
    return pastRatio < 0.2 || pastRatio > 0.8; // Consistent if mostly one tense
  }
  
  private hasQuickReferenceInfo(content: any): boolean {
    const text = this.extractText(content);
    return /\b(DC|AC|HP|damage|save|check)\b/i.test(text);
  }
  
  private hasReadAloudText(content: any): boolean {
    const text = this.extractText(content);
    return text.includes('"') || text.includes("'") || /read aloud|boxed text/i.test(text);
  }
  
  private hasClearSections(content: any): boolean {
    const text = this.extractText(content);
    return /^#{1,6}\s+/m.test(text) || /^[A-Z][^.]*:$/m.test(text);
  }
  
  private analyzePlayerAccessibility(content: any): number {
    // Analyze how accessible content is to players
    const text = this.extractText(content);
    if (!text) return 100;
    
    let score = 70; // Base score
    
    // Check for clear language
    const readabilityScore = this.calculateReadabilityScore(text);
    score += (readabilityScore - 70) * 0.3;
    
    // Check for game terminology explanations
    const hasExplanations = /\(.*\)|see page|as described/i.test(text);
    if (hasExplanations) score += 15;
    
    // Check for examples
    const hasExamples = /for example|such as|like/i.test(text);
    if (hasExamples) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateQualityImpact(detail: ValidationDetail, contentType: string): QualityImpact {
    // Calculate the impact of a quality issue
    const baseImpact = detail.severity === 'critical' ? -8 : 
                      detail.severity === 'warning' ? -5 : -2;
    
    return {
      usability: baseImpact,
      balance: detail.rule.includes('balance') || detail.rule.includes('cr') ? baseImpact : 0,
      immersion: detail.rule.includes('narrative') || detail.rule.includes('description') ? baseImpact : 0,
      accessibility: detail.rule.includes('accessibility') || detail.rule.includes('readability') ? baseImpact : 0
    };
  }
  
  private async calculateQualityMetrics(
    content: any, 
    contentType: string, 
    validationResults: ValidationCategory[]
  ): Promise<QualityMetrics> {
    // Calculate comprehensive quality metrics
    const getScore = (category: string) => {
      const result = validationResults.find(r => r.category === category);
      return result ? result.score : 0;
    };
    
    return {
      mechanicalBalance: getScore('balance'),
      narrativeCoherence: this.analyzeNarrativeCoherence(content),
      descriptiveRichness: this.analyzeDescriptiveRichness(content),
      readability: this.calculateReadabilityScore(this.extractText(content)),
      rulesCompliance: getScore('rules_compliance'),
      thematicConsistency: this.analyzeThematicConsistency(content),
      playerUsability: this.analyzePlayerAccessibility(content),
      formatCompliance: getScore('formatting'),
      crossReferenceIntegrity: 100, // Placeholder
      metadataCompleteness: getScore('structure')
    };
  }
  
  private analyzeDescriptiveRichness(content: any): number {
    const text = this.extractText(content);
    if (!text) return 0;
    
    const words = text.split(/\s+/);
    const adjectives = words.filter(word => this.isAdjective(word));
    const adverbs = words.filter(word => this.isAdverb(word));
    
    const richness = ((adjectives.length + adverbs.length) / words.length) * 100;
    return Math.min(100, richness * 10); // Scale up for reasonable scores
  }
  
  private analyzeThematicConsistency(content: any): number {
    // Placeholder for thematic consistency analysis
    return 85; // Default good score
  }
  
  private isAdjective(word: string): boolean {
    // Very simplified adjective detection
    const adjectives = ['ancient', 'dark', 'bright', 'large', 'small', 'mysterious', 'powerful', 'magical'];
    return adjectives.includes(word.toLowerCase());
  }
  
  private isAdverb(word: string): boolean {
    // Very simplified adverb detection
    return word.toLowerCase().endsWith('ly');
  }
  
  private calculateOverallScore(validationResults: ValidationCategory[]): number {
    const weightedSum = validationResults.reduce((sum, result) => {
      return sum + (result.score * result.weight);
    }, 0);
    
    const totalWeight = validationResults.reduce((sum, result) => sum + result.weight, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  private determineQualityGrade(score: number): QualityGrade {
    if (score >= 95) return 'S';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  private initializeQualityMetrics(): QualityMetrics {
    return {
      mechanicalBalance: 0,
      narrativeCoherence: 0,
      descriptiveRichness: 0,
      readability: 0,
      rulesCompliance: 0,
      thematicConsistency: 0,
      playerUsability: 0,
      formatCompliance: 0,
      crossReferenceIntegrity: 0,
      metadataCompleteness: 0
    };
  }
  
  private async validateSRDCompliance(content: any, contentType: string): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const srdViolations = this.checkSRDTerminology(content);
    
    srdViolations.forEach(term => {
      violations.push({
        rule: 'srd_terminology',
        severity: 'critical',
        message: `Uses Product Identity term: ${term}`,
        fix: `Replace "${term}" with SRD-compliant alternative`
      });
    });
    
    const score = violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length * 25));
    
    return {
      compliant: violations.length === 0,
      score,
      violations,
      recommendations: violations.length > 0 ? 
        ['Review SRD guidelines', 'Use only Open Game Content'] : 
        []
    };
  }
  
  private async validateAccessibilityCompliance(content: any, contentType: string): Promise<ComplianceResult> {
    const violations: ComplianceViolation[] = [];
    const text = this.extractText(content);
    
    // Check readability
    const readabilityScore = this.calculateReadabilityScore(text);
    if (readabilityScore < 60) {
      violations.push({
        rule: 'readability',
        severity: 'warning',
        message: 'Content may be difficult to read',
        fix: 'Simplify sentence structure and vocabulary'
      });
    }
    
    // Check for alt text requirements (if images referenced)
    if (/!\[.*\]\(.*\)/.test(text) && !/!\[.+\]/.test(text)) {
      violations.push({
        rule: 'alt_text',
        severity: 'warning',
        message: 'Images without alt text detected',
        fix: 'Add descriptive alt text to all images'
      });
    }
    
    const score = Math.max(0, 100 - (violations.length * 15));
    
    return {
      compliant: violations.length === 0,
      score,
      violations,
      recommendations: violations.length > 0 ? 
        ['Review accessibility guidelines', 'Test with screen readers'] : 
        []
    };
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ValidationCategoryConfig {
  category: string;
  weight: number;
  rules: ValidationRule[];
}

interface ValidationRule {
  name: string;
  description: string;
  validator: (content: any, context?: any) => Promise<ValidationRuleResult>;
}

interface ValidationRuleResult {
  passed: boolean;
  score: number;
  message: string;
  severity: 'critical' | 'warning' | 'suggestion';
  autoFixable?: boolean;
  suggestedFix?: string;
}

interface ValidationOptions {
  strictMode?: boolean;
  skipCategories?: string[];
  customRules?: ValidationRule[];
}

// Export the quality assurance system
export default ContentQualityAssurance;
