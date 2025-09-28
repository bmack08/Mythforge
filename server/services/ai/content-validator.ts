// Mythwright AI Content Validation Pipeline - Comprehensive Output Validation
import { 
  ProjectSchema, 
  ChapterSchema, 
  StatBlockSchema, 
  NPCSchema, 
  MagicItemSchema, 
  EncounterSchema,
  type SchemaType 
} from '../../schemas/content.schemas.js';
import type { AIGenerationRequest, AIGenerationResponse } from './index.js';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'schema' | 'balance' | 'content' | 'legal' | 'accessibility';
  validator: (content: any, context?: ValidationContext) => ValidationResult;
}

export interface ValidationContext {
  contentType: string;
  request: AIGenerationRequest;
  response: AIGenerationResponse;
  systemBudget?: any;
}

export interface ValidationResult {
  passed: boolean;
  message?: string;
  suggestion?: string;
  autoFix?: {
    possible: boolean;
    description: string;
    fix?: () => any;
  };
}

export interface ValidationReport {
  overall: {
    passed: boolean;
    score: number; // 0-100
    errors: number;
    warnings: number;
    infos: number;
  };
  results: Array<{
    rule: string;
    category: string;
    severity: 'error' | 'warning' | 'info';
    passed: boolean;
    message?: string;
    suggestion?: string;
    autoFixAvailable: boolean;
  }>;
  content: {
    original: any;
    validated: any;
    hasAutoFixes: boolean;
  };
  recommendations: string[];
}

// ============================================================================
// CONTENT VALIDATOR CLASS
// ============================================================================

export class ContentValidator {
  private rules: Map<string, ValidationRule[]> = new Map();
  private piTerms: Set<string> = new Set(); // Product Identity terms
  
  constructor() {
    this.initializeRules();
    this.initializePITerms();
  }
  
  private initializeRules(): void {
    // Schema validation rules
    this.addRule('statblock', {
      name: 'schema_compliance',
      description: 'Validates content against StatBlock schema',
      severity: 'error',
      category: 'schema',
      validator: (content) => this.validateSchema(content, StatBlockSchema)
    });
    
    this.addRule('npc', {
      name: 'schema_compliance',
      description: 'Validates content against NPC schema',
      severity: 'error',
      category: 'schema',
      validator: (content) => this.validateSchema(content, NPCSchema)
    });
    
    this.addRule('magicitem', {
      name: 'schema_compliance',
      description: 'Validates content against MagicItem schema',
      severity: 'error',
      category: 'schema',
      validator: (content) => this.validateSchema(content, MagicItemSchema)
    });
    
    this.addRule('encounter', {
      name: 'schema_compliance',
      description: 'Validates content against Encounter schema',
      severity: 'error',
      category: 'schema',
      validator: (content) => this.validateSchema(content, EncounterSchema)
    });
    
    // Balance validation rules
    this.addRule('statblock', {
      name: 'cr_balance_check',
      description: 'Validates Challenge Rating balance',
      severity: 'warning',
      category: 'balance',
      validator: (content) => this.validateCRBalance(content)
    });
    
    this.addRule('encounter', {
      name: 'xp_budget_check',
      description: 'Validates XP budget calculations',
      severity: 'warning',
      category: 'balance',
      validator: (content, context) => this.validateXPBudget(content, context)
    });
    
    this.addRule('magicitem', {
      name: 'rarity_balance_check',
      description: 'Validates magic item power vs rarity',
      severity: 'warning',
      category: 'balance',
      validator: (content) => this.validateMagicItemBalance(content)
    });
    
    // Content quality rules
    this.addRule('*', {
      name: 'content_completeness',
      description: 'Ensures all required fields are present and meaningful',
      severity: 'error',
      category: 'content',
      validator: (content) => this.validateContentCompleteness(content)
    });
    
    this.addRule('*', {
      name: 'text_quality',
      description: 'Validates text quality and readability',
      severity: 'warning',
      category: 'content',
      validator: (content) => this.validateTextQuality(content)
    });
    
    // Legal compliance rules
    this.addRule('*', {
      name: 'product_identity_check',
      description: 'Ensures no Product Identity terms are used',
      severity: 'error',
      category: 'legal',
      validator: (content) => this.validateProductIdentity(content)
    });
    
    this.addRule('*', {
      name: 'srd_compliance',
      description: 'Validates SRD 5.1 compliance',
      severity: 'warning',
      category: 'legal',
      validator: (content) => this.validateSRDCompliance(content)
    });
    
    // Accessibility rules
    this.addRule('*', {
      name: 'accessibility_check',
      description: 'Validates accessibility features',
      severity: 'info',
      category: 'accessibility',
      validator: (content) => this.validateAccessibility(content)
    });
  }
  
  private initializePITerms(): void {
    // Product Identity terms that cannot be used
    const piTerms = [
      'beholder', 'mind flayer', 'illithid', 'yuan-ti', 'githyanki', 'githzerai',
      'kuo-toa', 'slaad', 'umber hulk', 'displacer beast', 'owlbear', 'bulezau',
      'cambion', 'githyanki', 'githzerai', 'kuo-toa', 'slaad', 'umber hulk',
      'baatezu', 'tanar\'ri', 'spelljammer', 'planescape', 'dark sun',
      'dragonlance', 'forgotten realms', 'greyhawk', 'ravenloft'
    ];
    
    piTerms.forEach(term => this.piTerms.add(term.toLowerCase()));
  }
  
  private addRule(contentType: string, rule: ValidationRule): void {
    if (!this.rules.has(contentType)) {
      this.rules.set(contentType, []);
    }
    this.rules.get(contentType)!.push(rule);
  }
  
  // ============================================================================
  // MAIN VALIDATION METHOD
  // ============================================================================
  
  async validate(
    content: any, 
    context: ValidationContext
  ): Promise<ValidationReport> {
    const applicableRules = this.getApplicableRules(context.contentType);
    const results: ValidationReport['results'] = [];
    let autoFixedContent = { ...content };
    let hasAutoFixes = false;
    
    // Run all validation rules
    for (const rule of applicableRules) {
      try {
        const result = rule.validator(autoFixedContent, context);
        
        results.push({
          rule: rule.name,
          category: rule.category,
          severity: rule.severity,
          passed: result.passed,
          message: result.message,
          suggestion: result.suggestion,
          autoFixAvailable: result.autoFix?.possible || false
        });
        
        // Apply auto-fixes if available
        if (!result.passed && result.autoFix?.possible && result.autoFix.fix) {
          try {
            autoFixedContent = result.autoFix.fix() || autoFixedContent;
            hasAutoFixes = true;
          } catch (fixError) {
            console.warn(`Auto-fix failed for rule ${rule.name}:`, fixError);
          }
        }
      } catch (error) {
        console.error(`Validation rule ${rule.name} failed:`, error);
        results.push({
          rule: rule.name,
          category: rule.category,
          severity: 'error',
          passed: false,
          message: `Validation rule failed: ${error}`,
          autoFixAvailable: false
        });
      }
    }
    
    // Calculate overall score and statistics
    const errors = results.filter(r => r.severity === 'error' && !r.passed).length;
    const warnings = results.filter(r => r.severity === 'warning' && !r.passed).length;
    const infos = results.filter(r => r.severity === 'info' && !r.passed).length;
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    const score = total > 0 ? Math.round((passed / total) * 100) : 100;
    const overallPassed = errors === 0;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results, context);
    
    return {
      overall: {
        passed: overallPassed,
        score,
        errors,
        warnings,
        infos
      },
      results,
      content: {
        original: content,
        validated: autoFixedContent,
        hasAutoFixes
      },
      recommendations
    };
  }
  
  private getApplicableRules(contentType: string): ValidationRule[] {
    const specificRules = this.rules.get(contentType) || [];
    const generalRules = this.rules.get('*') || [];
    return [...specificRules, ...generalRules];
  }
  
  // ============================================================================
  // SPECIFIC VALIDATION METHODS
  // ============================================================================
  
  private validateSchema(content: any, schema: any): ValidationResult {
    try {
      const result = schema.safeParse(content);
      
      if (result.success) {
        return { passed: true };
      } else {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return {
          passed: false,
          message: `Schema validation failed: ${errors.join(', ')}`,
          suggestion: 'Ensure all required fields are present and correctly typed'
        };
      }
    } catch (error) {
      return {
        passed: false,
        message: `Schema validation error: ${error}`,
        suggestion: 'Check content structure and data types'
      };
    }
  }
  
  private validateCRBalance(content: any): ValidationResult {
    if (!content.challengeRating || !content.hitPoints || !content.armorClass) {
      return {
        passed: false,
        message: 'Missing required fields for CR calculation',
        suggestion: 'Ensure challengeRating, hitPoints, and armorClass are present'
      };
    }
    
    const cr = typeof content.challengeRating === 'string' 
      ? this.parseCR(content.challengeRating) 
      : content.challengeRating;
    
    const expectedHP = this.getExpectedHPForCR(cr);
    const actualHP = content.hitPoints;
    
    const hpVariance = Math.abs(actualHP - expectedHP) / expectedHP;
    
    if (hpVariance > 0.5) { // More than 50% variance
      return {
        passed: false,
        message: `Hit points (${actualHP}) don't match expected range for CR ${content.challengeRating} (expected ~${expectedHP})`,
        suggestion: `Consider adjusting HP to ${Math.round(expectedHP * 0.8)}-${Math.round(expectedHP * 1.2)} range`,
        autoFix: {
          possible: true,
          description: `Adjust HP to ${Math.round(expectedHP)}`,
          fix: () => ({ ...content, hitPoints: Math.round(expectedHP) })
        }
      };
    }
    
    return { passed: true };
  }
  
  private validateXPBudget(content: any, context?: ValidationContext): ValidationResult {
    if (!content.xpBudget || !context?.systemBudget) {
      return { passed: true }; // Skip if no budget info
    }
    
    const { allocated, used } = content.xpBudget;
    const efficiency = used / allocated;
    
    if (efficiency < 0.7) {
      return {
        passed: false,
        message: `XP budget underutilized: ${Math.round(efficiency * 100)}% (${used}/${allocated})`,
        suggestion: 'Consider adding more creatures or increasing difficulty',
        autoFix: {
          possible: true,
          description: 'Suggest additional creatures to reach 80-90% budget usage',
          fix: () => this.suggestAdditionalCreatures(content, allocated - used)
        }
      };
    }
    
    if (efficiency > 1.1) {
      return {
        passed: false,
        message: `XP budget exceeded: ${Math.round(efficiency * 100)}% (${used}/${allocated})`,
        suggestion: 'Consider reducing creature count or difficulty'
      };
    }
    
    return { passed: true };
  }
  
  private validateMagicItemBalance(content: any): ValidationResult {
    if (!content.rarity || !content.mechanicalEffects) {
      return { passed: true }; // Skip if missing required fields
    }
    
    const rarity = content.rarity.toLowerCase();
    const effects = content.mechanicalEffects || [];
    const powerLevel = this.calculateItemPowerLevel(effects);
    const expectedPower = this.getExpectedPowerForRarity(rarity);
    
    const powerVariance = Math.abs(powerLevel - expectedPower) / expectedPower;
    
    if (powerVariance > 0.3) { // More than 30% variance
      return {
        passed: false,
        message: `Item power level (${powerLevel}) doesn't match rarity ${rarity} (expected ~${expectedPower})`,
        suggestion: rarity === 'common' && powerLevel > expectedPower * 1.3
          ? 'Consider increasing rarity or reducing mechanical effects'
          : 'Consider adjusting rarity to match power level'
      };
    }
    
    return { passed: true };
  }
  
  private validateContentCompleteness(content: any): ValidationResult {
    const requiredFields = ['name'];
    const missingFields = requiredFields.filter(field => !content[field] || content[field].trim?.() === '');
    
    if (missingFields.length > 0) {
      return {
        passed: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        suggestion: 'Ensure all required fields have meaningful content'
      };
    }
    
    // Check for placeholder text
    const placeholderPatterns = [
      /lorem ipsum/i,
      /placeholder/i,
      /todo/i,
      /\[.*\]/,
      /xxx/i,
      /sample/i
    ];
    
    const contentString = JSON.stringify(content).toLowerCase();
    const hasPlaceholders = placeholderPatterns.some(pattern => pattern.test(contentString));
    
    if (hasPlaceholders) {
      return {
        passed: false,
        message: 'Content contains placeholder text',
        suggestion: 'Replace placeholder text with meaningful content'
      };
    }
    
    return { passed: true };
  }
  
  private validateTextQuality(content: any): ValidationResult {
    const textFields = this.extractTextFields(content);
    const issues: string[] = [];
    
    for (const [field, text] of textFields) {
      if (typeof text !== 'string') continue;
      
      // Check minimum length
      if (text.trim().length < 10) {
        issues.push(`${field} is too short (minimum 10 characters)`);
      }
      
      // Check for repeated words
      const words = text.toLowerCase().split(/\s+/);
      const repeatedWords = words.filter((word, index) => 
        word.length > 3 && words.indexOf(word, index + 1) !== -1
      );
      
      if (repeatedWords.length > words.length * 0.1) {
        issues.push(`${field} has excessive word repetition`);
      }
      
      // Check for basic grammar issues
      if (!/[.!?]$/.test(text.trim())) {
        issues.push(`${field} should end with proper punctuation`);
      }
    }
    
    if (issues.length > 0) {
      return {
        passed: false,
        message: `Text quality issues: ${issues.join('; ')}`,
        suggestion: 'Review and improve text quality'
      };
    }
    
    return { passed: true };
  }
  
  private validateProductIdentity(content: any): ValidationResult {
    const contentString = JSON.stringify(content).toLowerCase();
    const foundPITerms: string[] = [];
    
    for (const piTerm of this.piTerms) {
      if (contentString.includes(piTerm)) {
        foundPITerms.push(piTerm);
      }
    }
    
    if (foundPITerms.length > 0) {
      return {
        passed: false,
        message: `Product Identity terms found: ${foundPITerms.join(', ')}`,
        suggestion: 'Replace with SRD-safe alternatives (e.g., beholder → gaze tyrant)',
        autoFix: {
          possible: true,
          description: 'Replace PI terms with SRD-safe alternatives',
          fix: () => this.replacePITerms(content, foundPITerms)
        }
      };
    }
    
    return { passed: true };
  }
  
  private validateSRDCompliance(content: any): ValidationResult {
    // This is a simplified check - in practice would be more comprehensive
    const contentString = JSON.stringify(content).toLowerCase();
    
    // Check for non-SRD spells, classes, etc.
    const nonSRDTerms = [
      'eldritch blast', // Warlock-specific
      'hex', // Warlock spell
      'spiritual weapon', // Cleric spell
      'counterspell' // Not in basic SRD
    ];
    
    const foundTerms = nonSRDTerms.filter(term => contentString.includes(term));
    
    if (foundTerms.length > 0) {
      return {
        passed: false,
        message: `Potentially non-SRD content: ${foundTerms.join(', ')}`,
        suggestion: 'Verify these terms are available in SRD 5.1'
      };
    }
    
    return { passed: true };
  }
  
  private validateAccessibility(content: any): ValidationResult {
    const issues: string[] = [];
    
    // Check for alt text on images (if any)
    if (content.images && Array.isArray(content.images)) {
      const imagesWithoutAlt = content.images.filter((img: any) => !img.altText);
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      }
    }
    
    // Check for proper heading structure
    if (content.description && typeof content.description === 'string') {
      const headings = content.description.match(/#{1,6}\s/g) || [];
      if (headings.length === 0 && content.description.length > 200) {
        issues.push('Long content should use headings for structure');
      }
    }
    
    if (issues.length > 0) {
      return {
        passed: false,
        message: `Accessibility issues: ${issues.join('; ')}`,
        suggestion: 'Add alt text and proper heading structure'
      };
    }
    
    return { passed: true };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private parseCR(cr: string): number {
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseInt(cr) || 0;
  }
  
  private getExpectedHPForCR(cr: number): number {
    // Simplified HP calculation based on DMG guidelines
    const hpByCR: Record<number, number> = {
      0: 3, 0.125: 7, 0.25: 15, 0.5: 22,
      1: 33, 2: 45, 3: 58, 4: 71, 5: 84,
      6: 97, 7: 110, 8: 123, 9: 136, 10: 149
    };
    
    return hpByCR[cr] || Math.round(13 * cr + 20);
  }
  
  private calculateItemPowerLevel(effects: any[]): number {
    // Simplified power level calculation
    let power = 0;
    
    for (const effect of effects) {
      if (effect.name?.toLowerCase().includes('damage')) power += 3;
      if (effect.name?.toLowerCase().includes('heal')) power += 2;
      if (effect.name?.toLowerCase().includes('bonus')) power += 1;
      if (effect.activation?.type === 'passive') power += 1;
    }
    
    return power;
  }
  
  private getExpectedPowerForRarity(rarity: string): number {
    const powerByRarity: Record<string, number> = {
      'common': 1,
      'uncommon': 3,
      'rare': 6,
      'very rare': 9,
      'legendary': 12,
      'artifact': 15
    };
    
    return powerByRarity[rarity] || 3;
  }
  
  private extractTextFields(content: any): Array<[string, string]> {
    const textFields: Array<[string, string]> = [];
    
    const extractFromObject = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string' && value.length > 0) {
          textFields.push([fieldName, value]);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          extractFromObject(value, fieldName);
        }
      }
    };
    
    extractFromObject(content);
    return textFields;
  }
  
  private replacePITerms(content: any, piTerms: string[]): any {
    const replacements: Record<string, string> = {
      'beholder': 'gaze tyrant',
      'mind flayer': 'brain eater',
      'illithid': 'brain eater',
      'yuan-ti': 'serpent folk',
      'displacer beast': 'phase cat',
      'owlbear': 'owl-bear hybrid'
    };
    
    let contentString = JSON.stringify(content);
    
    for (const term of piTerms) {
      const replacement = replacements[term] || `${term.replace(/\s+/g, '_')}_creature`;
      contentString = contentString.replace(new RegExp(term, 'gi'), replacement);
    }
    
    return JSON.parse(contentString);
  }
  
  private suggestAdditionalCreatures(content: any, remainingXP: number): any {
    // Simplified creature suggestion
    const lowCRCreatures = [
      { name: 'Goblin', cr: 0.25, xp: 50 },
      { name: 'Orc', cr: 0.5, xp: 100 },
      { name: 'Hobgoblin', cr: 0.5, xp: 100 }
    ];
    
    const suggestions = [];
    let xpLeft = remainingXP;
    
    for (const creature of lowCRCreatures) {
      const count = Math.floor(xpLeft / creature.xp);
      if (count > 0) {
        suggestions.push(`${count}x ${creature.name} (${count * creature.xp} XP)`);
        xpLeft -= count * creature.xp;
      }
    }
    
    return {
      ...content,
      _suggestions: suggestions
    };
  }
  
  private generateRecommendations(
    results: ValidationReport['results'], 
    context: ValidationContext
  ): string[] {
    const recommendations: string[] = [];
    
    const errors = results.filter(r => r.severity === 'error' && !r.passed);
    const warnings = results.filter(r => r.severity === 'warning' && !r.passed);
    
    if (errors.length > 0) {
      recommendations.push('Fix all error-level issues before using this content');
    }
    
    if (warnings.filter(w => w.category === 'balance').length > 0) {
      recommendations.push('Review balance-related warnings to ensure fair gameplay');
    }
    
    const autoFixableCount = results.filter(r => r.autoFixAvailable).length;
    if (autoFixableCount > 0) {
      recommendations.push(`${autoFixableCount} issues can be automatically fixed`);
    }
    
    if (context.contentType === 'statblock' && errors.some(e => e.rule === 'cr_balance_check')) {
      recommendations.push('Consider using online CR calculators to verify balance');
    }
    
    return recommendations;
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  async validateAIResponse(
    request: AIGenerationRequest,
    response: AIGenerationResponse
  ): Promise<ValidationReport> {
    if (!response.success || !response.content) {
      return {
        overall: { passed: false, score: 0, errors: 1, warnings: 0, infos: 0 },
        results: [{
          rule: 'response_success',
          category: 'schema',
          severity: 'error',
          passed: false,
          message: 'AI response was not successful',
          autoFixAvailable: false
        }],
        content: {
          original: response.content,
          validated: response.content,
          hasAutoFixes: false
        },
        recommendations: ['Retry the AI generation or check for API issues']
      };
    }
    
    const context: ValidationContext = {
      contentType: request.type,
      request,
      response,
      systemBudget: request.context?.systemBudget
    };
    
    return this.validate(response.content, context);
  }
  
  getAvailableRules(contentType?: string): ValidationRule[] {
    if (contentType) {
      return this.getApplicableRules(contentType);
    }
    
    const allRules: ValidationRule[] = [];
    for (const rules of this.rules.values()) {
      allRules.push(...rules);
    }
    
    return allRules;
  }
  
  addCustomRule(contentType: string, rule: ValidationRule): void {
    this.addRule(contentType, rule);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ContentValidator;
