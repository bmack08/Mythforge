// Mythwright Output Format Validator
// Comprehensive validation system for AI-generated content format compliance

import { z } from 'zod';

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  autoFixes: AutoFix[];
  metadata: {
    validatorVersion: string;
    timestamp: Date;
    contentType: string;
    schemaVersion: string;
  };
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  suggestion?: string;
  fixable: boolean;
  location?: string;
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  suggestion: string;
  impact: 'formatting' | 'usability' | 'compliance' | 'quality';
}

export interface AutoFix {
  field: string;
  originalValue: any;
  fixedValue: any;
  reason: string;
  confidence: number; // 0-100
  applied: boolean;
}

export interface FormatSpec {
  id: string;
  name: string;
  version: string;
  description: string;
  contentType: string;
  schema: z.ZodSchema;
  customValidators: CustomValidator[];
  formatRules: FormatRule[];
  requiredFields: RequiredFieldSpec[];
  optionalFields: OptionalFieldSpec[];
  autoFixRules: AutoFixRule[];
}

export interface CustomValidator {
  name: string;
  description: string;
  validator: (data: any) => ValidationResult;
  applicableTypes: string[];
  priority: number;
}

export interface FormatRule {
  name: string;
  description: string;
  rule: (data: any) => { valid: boolean; message?: string; suggestion?: string };
  severity: 'critical' | 'major' | 'minor';
  fixable: boolean;
}

export interface RequiredFieldSpec {
  path: string;
  type: string;
  description: string;
  constraints?: any;
  examples?: any[];
}

export interface OptionalFieldSpec extends RequiredFieldSpec {
  defaultValue?: any;
  recommendedFor?: string[];
}

export interface AutoFixRule {
  name: string;
  condition: (data: any) => boolean;
  fix: (data: any) => { fixed: any; changes: string[] };
  confidence: number;
  safetyCheck?: (original: any, fixed: any) => boolean;
}

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

export class SchemaLibrary {
  private static schemas: Map<string, FormatSpec> = new Map();

  static initialize() {
    this.schemas.set('monster', this.createMonsterFormatSpec());
    this.schemas.set('npc', this.createNPCFormatSpec());
    this.schemas.set('magicitem', this.createMagicItemFormatSpec());
    this.schemas.set('trap', this.createTrapFormatSpec());
    this.schemas.set('encounter', this.createEncounterFormatSpec());
    this.schemas.set('narrative', this.createNarrativeFormatSpec());
    this.schemas.set('table', this.createTableFormatSpec());
    this.schemas.set('character-option', this.createCharacterOptionFormatSpec());
  }

  static getFormatSpec(contentType: string): FormatSpec | null {
    return this.schemas.get(contentType) || null;
  }

  static getAllSpecs(): FormatSpec[] {
    return Array.from(this.schemas.values());
  }

  // ============================================================================
  // MONSTER FORMAT SPECIFICATION
  // ============================================================================

  private static createMonsterFormatSpec(): FormatSpec {
    const monsterSchema = z.object({
      name: z.string().min(1).max(100),
      size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']),
      type: z.string().min(1),
      alignment: z.string().min(1),
      armorClass: z.number().int().min(1).max(30),
      hitPoints: z.number().int().min(1),
      hitDice: z.string().regex(/^\d+d\d+(\+\d+)?$/),
      speed: z.object({
        walk: z.number().int().min(0).optional(),
        fly: z.number().int().min(0).optional(),
        swim: z.number().int().min(0).optional(),
        climb: z.number().int().min(0).optional(),
        burrow: z.number().int().min(0).optional()
      }),
      abilities: z.object({
        strength: z.number().int().min(1).max(30),
        dexterity: z.number().int().min(1).max(30),
        constitution: z.number().int().min(1).max(30),
        intelligence: z.number().int().min(1).max(30),
        wisdom: z.number().int().min(1).max(30),
        charisma: z.number().int().min(1).max(30)
      }),
      savingThrows: z.record(z.string(), z.number()).optional(),
      skills: z.record(z.string(), z.number()).optional(),
      damageResistances: z.array(z.string()).optional(),
      damageImmunities: z.array(z.string()).optional(),
      conditionImmunities: z.array(z.string()).optional(),
      senses: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      challengeRating: z.string().regex(/^(0|1\/8|1\/4|1\/2|\d+)$/),
      proficiencyBonus: z.number().int().min(2).max(9),
      actions: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(10)
      })).min(1),
      bonusActions: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(10)
      })).optional(),
      reactions: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(10)
      })).optional(),
      legendaryActions: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(10)
      })).optional(),
      traits: z.array(z.object({
        name: z.string().min(1),
        description: z.string().min(10)
      })).optional(),
      description: z.string().min(50),
      lore: z.string().min(50),
      tactics: z.string().min(30),
      environment: z.array(z.string()).min(1),
      scaling: z.object({
        suggestions: z.array(z.string()).min(1),
        partySize: z.object({
          smaller: z.string().min(10),
          larger: z.string().min(10)
        }).optional()
      }).optional()
    });

    return {
      id: 'monster-v1',
      name: 'D&D 5e Monster',
      version: '1.0',
      description: 'Complete D&D 5e creature stat block with tactical information',
      contentType: 'monster',
      schema: monsterSchema,
      customValidators: [
        {
          name: 'CR Balance Validator',
          description: 'Validates challenge rating matches calculated values',
          validator: this.validateCRBalance,
          applicableTypes: ['monster'],
          priority: 1
        },
        {
          name: 'HP Consistency Validator',
          description: 'Validates hit points match hit dice',
          validator: this.validateHPConsistency,
          applicableTypes: ['monster'],
          priority: 2
        }
      ],
      formatRules: [
        {
          name: 'Action Description Length',
          description: 'Action descriptions should be comprehensive but concise',
          rule: (data: any) => {
            const actions = data.actions || [];
            const longActions = actions.filter((action: any) => 
              action.description && action.description.length > 500
            );
            return {
              valid: longActions.length === 0,
              message: longActions.length > 0 ? `${longActions.length} actions have overly long descriptions` : undefined,
              suggestion: 'Keep action descriptions under 500 characters for readability'
            };
          },
          severity: 'minor',
          fixable: true
        }
      ],
      requiredFields: [
        { path: 'name', type: 'string', description: 'Creature name' },
        { path: 'challengeRating', type: 'string', description: 'Challenge Rating' },
        { path: 'actions', type: 'array', description: 'Available actions' }
      ],
      optionalFields: [
        { path: 'legendaryActions', type: 'array', description: 'Legendary actions', recommendedFor: ['CR 5+'] }
      ],
      autoFixRules: [
        {
          name: 'Fix Speed Format',
          condition: (data: any) => typeof data.speed === 'string',
          fix: (data: any) => {
            const speedValue = parseInt(data.speed);
            return {
              fixed: { ...data, speed: { walk: isNaN(speedValue) ? 30 : speedValue }},
              changes: ['Converted speed from string to object format']
            };
          },
          confidence: 90
        }
      ]
    };
  }

  // ============================================================================
  // NPC FORMAT SPECIFICATION
  // ============================================================================

  private static createNPCFormatSpec(): FormatSpec {
    const npcSchema = z.object({
      name: z.string().min(1).max(100),
      race: z.string().min(1),
      class: z.string().optional(),
      background: z.string().min(1),
      level: z.number().int().min(1).max(20).optional(),
      appearance: z.object({
        age: z.string().min(1),
        height: z.string().min(1),
        build: z.string().min(1),
        hair: z.string().min(1),
        eyes: z.string().min(1),
        distinguishingFeatures: z.array(z.string()).min(1),
        clothing: z.string().min(10)
      }),
      personality: z.object({
        trait: z.string().min(10),
        ideal: z.string().min(10),
        bond: z.string().min(10),
        flaw: z.string().min(10),
        temperament: z.string().min(5),
        quirks: z.array(z.string()).min(1)
      }),
      voice: z.object({
        accent: z.string().min(3),
        pitch: z.enum(['high', 'medium', 'low', 'variable']),
        pace: z.enum(['fast', 'normal', 'slow', 'variable']),
        volume: z.enum(['quiet', 'normal', 'loud', 'variable']),
        mannerisms: z.array(z.string()).min(1),
        catchphrases: z.array(z.string()).optional()
      }),
      background_story: z.string().min(100),
      goals: z.object({
        shortTerm: z.array(z.string()).min(1),
        longTerm: z.array(z.string()).min(1)
      }),
      relationships: z.record(z.string(), z.string()).optional(),
      secrets: z.array(z.string()).optional(),
      occupation: z.string().min(1),
      location: z.string().min(1),
      roleInStory: z.array(z.string()).min(1),
      sampleDialogue: z.array(z.object({
        situation: z.string().min(10),
        dialogue: z.string().min(20)
      })).min(2),
      interactionNotes: z.string().min(50),
      questHooks: z.array(z.string()).min(1),
      statBlock: z.object({
        armorClass: z.number().int().min(8).max(25),
        hitPoints: z.number().int().min(1),
        speed: z.number().int().min(0),
        abilities: z.object({
          strength: z.number().int().min(3).max(20),
          dexterity: z.number().int().min(3).max(20),
          constitution: z.number().int().min(3).max(20),
          intelligence: z.number().int().min(3).max(20),
          wisdom: z.number().int().min(3).max(20),
          charisma: z.number().int().min(3).max(20)
        }),
        skills: z.record(z.string(), z.number()).optional(),
        equipment: z.array(z.string()).optional()
      }).optional()
    });

    return {
      id: 'npc-v1',
      name: 'D&D 5e NPC',
      version: '1.0',
      description: 'Complete NPC with personality, background, and roleplay information',
      contentType: 'npc',
      schema: npcSchema,
      customValidators: [],
      formatRules: [
        {
          name: 'Dialogue Quality',
          description: 'Sample dialogue should reflect personality and voice',
          rule: (data: any) => {
            const dialogue = data.sampleDialogue || [];
            const hasPersonality = dialogue.some((d: any) => 
              d.dialogue.toLowerCase().includes(data.personality?.trait?.toLowerCase()?.split(' ')[0])
            );
            return {
              valid: hasPersonality,
              message: hasPersonality ? undefined : 'Sample dialogue doesn\'t reflect personality traits',
              suggestion: 'Include personality elements in sample dialogue'
            };
          },
          severity: 'minor',
          fixable: false
        }
      ],
      requiredFields: [
        { path: 'name', type: 'string', description: 'NPC name' },
        { path: 'personality', type: 'object', description: 'Complete personality profile' },
        { path: 'sampleDialogue', type: 'array', description: 'Sample dialogue examples' }
      ],
      optionalFields: [
        { path: 'statBlock', type: 'object', description: 'Combat statistics', recommendedFor: ['combat NPCs'] }
      ],
      autoFixRules: []
    };
  }

  // ============================================================================
  // MAGIC ITEM FORMAT SPECIFICATION
  // ============================================================================

  private static createMagicItemFormatSpec(): FormatSpec {
    const magicItemSchema = z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['weapon', 'armor', 'shield', 'wondrous item', 'ring', 'rod', 'staff', 'wand', 'potion', 'scroll', 'ammunition']),
      rarity: z.enum(['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']),
      attunement: z.boolean(),
      attunementRequirement: z.string().optional(),
      description: z.string().min(50),
      mechanics: z.object({
        properties: z.array(z.string()).min(1),
        charges: z.object({
          maximum: z.number().int().min(1),
          rechargeDice: z.string().regex(/^\d+d\d+$/),
          rechargeTime: z.enum(['dawn', 'dusk', 'long rest', 'short rest', 'daily', 'weekly'])
        }).optional(),
        spells: z.array(z.object({
          name: z.string(),
          level: z.number().int().min(0).max(9),
          castingTime: z.string(),
          cost: z.string().optional()
        })).optional(),
        bonuses: z.record(z.string(), z.number()).optional()
      }),
      usageInstructions: z.string().min(30),
      lore: z.string().min(100),
      history: z.string().min(50),
      previousOwners: z.array(z.string()).optional(),
      physicalDescription: z.object({
        appearance: z.string().min(30),
        materials: z.array(z.string()).min(1),
        weight: z.string(),
        value: z.string(),
        dimensions: z.string().optional()
      }),
      craftingInformation: z.object({
        creator: z.string().optional(),
        method: z.string().optional(),
        components: z.array(z.string()).optional(),
        time: z.string().optional(),
        cost: z.string().optional()
      }).optional(),
      variants: z.array(z.object({
        name: z.string(),
        changes: z.string(),
        rarityChange: z.string().optional()
      })).optional(),
      cursedVersion: z.object({
        description: z.string(),
        curse: z.string(),
        removalMethod: z.string().optional()
      }).optional()
    });

    return {
      id: 'magicitem-v1',
      name: 'D&D 5e Magic Item',
      version: '1.0',
      description: 'Complete magic item with mechanics, lore, and usage information',
      contentType: 'magicitem',
      schema: magicItemSchema,
      customValidators: [
        {
          name: 'Rarity Balance Validator',
          description: 'Validates power level matches rarity',
          validator: this.validateRarityBalance,
          applicableTypes: ['magicitem'],
          priority: 1
        }
      ],
      formatRules: [],
      requiredFields: [
        { path: 'name', type: 'string', description: 'Item name' },
        { path: 'rarity', type: 'string', description: 'Item rarity' },
        { path: 'mechanics.properties', type: 'array', description: 'Magical properties' }
      ],
      optionalFields: [],
      autoFixRules: []
    };
  }

  // Placeholder methods for other format specs - would be implemented similarly
  private static createTrapFormatSpec(): FormatSpec { 
    return this.createPlaceholderSpec('trap', 'D&D 5e Trap/Hazard');
  }
  
  private static createEncounterFormatSpec(): FormatSpec { 
    return this.createPlaceholderSpec('encounter', 'D&D 5e Encounter');
  }
  
  private static createNarrativeFormatSpec(): FormatSpec { 
    return this.createPlaceholderSpec('narrative', 'D&D 5e Narrative Content');
  }
  
  private static createTableFormatSpec(): FormatSpec { 
    return this.createPlaceholderSpec('table', 'D&D 5e Random Table');
  }
  
  private static createCharacterOptionFormatSpec(): FormatSpec { 
    return this.createPlaceholderSpec('character-option', 'D&D 5e Character Option');
  }

  private static createPlaceholderSpec(type: string, name: string): FormatSpec {
    return {
      id: `${type}-v1`,
      name,
      version: '1.0',
      description: `${name} format specification`,
      contentType: type,
      schema: z.object({ name: z.string() }), // Minimal schema
      customValidators: [],
      formatRules: [],
      requiredFields: [],
      optionalFields: [],
      autoFixRules: []
    };
  }

  // ============================================================================
  // CUSTOM VALIDATORS
  // ============================================================================

  private static validateCRBalance(data: any): ValidationResult {
    // Simplified CR validation - would be more complex in reality
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (data.challengeRating && data.hitPoints) {
      const cr = data.challengeRating === '0' ? 0 : 
                 data.challengeRating.includes('/') ? 0.5 : 
                 parseInt(data.challengeRating);
      
      const expectedHP = this.calculateExpectedHP(cr);
      const actualHP = data.hitPoints;
      
      const variance = Math.abs(actualHP - expectedHP) / expectedHP;
      
      if (variance > 0.5) {
        errors.push({
          code: 'CR_HP_MISMATCH',
          field: 'hitPoints',
          message: `Hit points (${actualHP}) don't match CR ${data.challengeRating} (expected ~${expectedHP})`,
          severity: 'major',
          suggestion: `Adjust hit points to ${Math.round(expectedHP)} or recalculate CR`,
          fixable: true
        });
      } else if (variance > 0.25) {
        warnings.push({
          code: 'CR_HP_VARIANCE',
          field: 'hitPoints',
          message: `Hit points slightly off for CR (${Math.round(variance * 100)}% variance)`,
          suggestion: 'Consider minor HP adjustment for better balance',
          impact: 'compliance'
        });
      }
    }

    return {
      valid: errors.length === 0,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5)),
      errors,
      warnings,
      autoFixes: [],
      metadata: {
        validatorVersion: '1.0',
        timestamp: new Date(),
        contentType: 'monster',
        schemaVersion: '1.0'
      }
    };
  }

  private static validateHPConsistency(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (data.hitPoints && data.hitDice && data.abilities?.constitution) {
      const conMod = Math.floor((data.abilities.constitution - 10) / 2);
      const [numDice, dieSize] = data.hitDice.split('d').map((n: string) => parseInt(n.split('+')[0]));
      
      const averageRoll = (dieSize + 1) / 2;
      const expectedHP = Math.floor(numDice * (averageRoll + conMod));
      
      if (Math.abs(data.hitPoints - expectedHP) > numDice) {
        errors.push({
          code: 'HP_DICE_MISMATCH',
          field: 'hitPoints',
          message: `Hit points (${data.hitPoints}) don't match hit dice calculation (expected ~${expectedHP})`,
          severity: 'major',
          suggestion: `Adjust to match ${data.hitDice} + ${conMod * numDice} Constitution modifier`,
          fixable: true
        });
      }
    }

    return {
      valid: errors.length === 0,
      score: errors.length === 0 ? 100 : 60,
      errors,
      warnings: [],
      autoFixes: [],
      metadata: {
        validatorVersion: '1.0',
        timestamp: new Date(),
        contentType: 'monster',
        schemaVersion: '1.0'
      }
    };
  }

  private static validateRarityBalance(data: any): ValidationResult {
    // Simplified rarity validation
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (data.rarity && data.mechanics?.properties) {
      const propertyCount = data.mechanics.properties.length;
      const hasCharges = !!data.mechanics.charges;
      const hasSpells = data.mechanics.spells && data.mechanics.spells.length > 0;
      
      let powerLevel = propertyCount;
      if (hasCharges) powerLevel += 1;
      if (hasSpells) powerLevel += data.mechanics.spells.length;

      const rarityLimits = {
        'common': 2,
        'uncommon': 4,
        'rare': 6,
        'very rare': 8,
        'legendary': 12
      };

      const limit = rarityLimits[data.rarity as keyof typeof rarityLimits] || 2;
      
      if (powerLevel > limit + 2) {
        errors.push({
          code: 'RARITY_POWER_MISMATCH',
          field: 'rarity',
          message: `Power level (${powerLevel}) too high for ${data.rarity} rarity (limit ~${limit})`,
          severity: 'major',
          suggestion: 'Increase rarity or reduce magical properties',
          fixable: false
        });
      }
    }

    return {
      valid: errors.length === 0,
      score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10)),
      errors,
      warnings,
      autoFixes: [],
      metadata: {
        validatorVersion: '1.0',
        timestamp: new Date(),
        contentType: 'magicitem',
        schemaVersion: '1.0'
      }
    };
  }

  private static calculateExpectedHP(cr: number): number {
    // Simplified HP calculation from DMG
    const hpByCR: Record<number, number> = {
      0: 6, 0.125: 22, 0.25: 35, 0.5: 49,
      1: 70, 2: 85, 3: 100, 4: 115, 5: 130,
      6: 145, 7: 160, 8: 175, 9: 190, 10: 205
    };
    
    return hpByCR[cr] || 100;
  }
}

// ============================================================================
// OUTPUT FORMAT VALIDATOR
// ============================================================================

export class OutputFormatValidator {
  private formatSpecs: Map<string, FormatSpec> = new Map();

  constructor() {
    SchemaLibrary.initialize();
    this.loadFormatSpecs();
  }

  private loadFormatSpecs() {
    SchemaLibrary.getAllSpecs().forEach(spec => {
      this.formatSpecs.set(spec.contentType, spec);
    });
  }

  validateContent(content: any, contentType: string, applyAutoFixes: boolean = false): ValidationResult {
    const formatSpec = this.formatSpecs.get(contentType);
    if (!formatSpec) {
      return {
        valid: false,
        score: 0,
        errors: [{
          code: 'NO_FORMAT_SPEC',
          field: 'contentType',
          message: `No format specification found for content type: ${contentType}`,
          severity: 'critical',
          fixable: false
        }],
        warnings: [],
        autoFixes: [],
        metadata: {
          validatorVersion: '1.0',
          timestamp: new Date(),
          contentType,
          schemaVersion: 'unknown'
        }
      };
    }

    let validationData = { ...content };
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    const allAutoFixes: AutoFix[] = [];

    // 1. Schema Validation
    const schemaResult = this.validateSchema(validationData, formatSpec);
    allErrors.push(...schemaResult.errors);

    // 2. Apply auto-fixes if requested and content is valid enough
    if (applyAutoFixes && schemaResult.errors.filter(e => e.severity === 'critical').length === 0) {
      const autoFixResult = this.applyAutoFixes(validationData, formatSpec);
      validationData = autoFixResult.fixedData;
      allAutoFixes.push(...autoFixResult.fixes);
    }

    // 3. Custom Validation
    for (const customValidator of formatSpec.customValidators) {
      try {
        const customResult = customValidator.validator(validationData);
        allErrors.push(...customResult.errors);
        allWarnings.push(...customResult.warnings);
      } catch (error) {
        allErrors.push({
          code: 'CUSTOM_VALIDATOR_ERROR',
          field: 'validation',
          message: `Custom validator "${customValidator.name}" failed: ${error}`,
          severity: 'major',
          fixable: false
        });
      }
    }

    // 4. Format Rules Validation
    for (const rule of formatSpec.formatRules) {
      try {
        const ruleResult = rule.rule(validationData);
        if (!ruleResult.valid) {
          if (rule.severity === 'critical' || rule.severity === 'major') {
            allErrors.push({
              code: rule.name.toUpperCase().replace(/\s+/g, '_'),
              field: 'format',
              message: ruleResult.message || `Format rule "${rule.name}" failed`,
              severity: rule.severity,
              suggestion: ruleResult.suggestion,
              fixable: rule.fixable
            });
          } else {
            allWarnings.push({
              code: rule.name.toUpperCase().replace(/\s+/g, '_'),
              field: 'format',
              message: ruleResult.message || `Format rule "${rule.name}" failed`,
              suggestion: ruleResult.suggestion || '',
              impact: 'formatting'
            });
          }
        }
      } catch (error) {
        allErrors.push({
          code: 'FORMAT_RULE_ERROR',
          field: 'validation',
          message: `Format rule "${rule.name}" failed: ${error}`,
          severity: 'major',
          fixable: false
        });
      }
    }

    // Calculate overall score
    const score = this.calculateValidationScore(allErrors, allWarnings);

    return {
      valid: allErrors.filter(e => e.severity === 'critical').length === 0,
      score,
      errors: allErrors,
      warnings: allWarnings,
      autoFixes: allAutoFixes,
      metadata: {
        validatorVersion: '1.0',
        timestamp: new Date(),
        contentType,
        schemaVersion: formatSpec.version
      }
    };
  }

  private validateSchema(data: any, formatSpec: FormatSpec): { errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    try {
      formatSpec.schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(zodError => {
          errors.push({
            code: 'SCHEMA_VALIDATION_ERROR',
            field: zodError.path.join('.') || 'root',
            message: zodError.message,
            severity: 'critical',
            fixable: this.isZodErrorFixable(zodError),
            location: zodError.path.join('.') || 'root'
          });
        });
      } else {
        errors.push({
          code: 'SCHEMA_PARSE_ERROR',
          field: 'schema',
          message: `Schema validation failed: ${error}`,
          severity: 'critical',
          fixable: false
        });
      }
    }

    return { errors };
  }

  private isZodErrorFixable(zodError: z.ZodIssue): boolean {
    // Simple heuristics for determining if a Zod error is auto-fixable
    const fixableErrorCodes = [
      'invalid_type', 
      'too_small', 
      'too_big'
    ];
    
    return fixableErrorCodes.includes(zodError.code);
  }

  private applyAutoFixes(data: any, formatSpec: FormatSpec): { fixedData: any; fixes: AutoFix[] } {
    let fixedData = { ...data };
    const fixes: AutoFix[] = [];

    for (const autoFixRule of formatSpec.autoFixRules) {
      if (autoFixRule.condition(fixedData)) {
        try {
          const fixResult = autoFixRule.fix(fixedData);
          
          // Safety check if provided
          const safeToApply = !autoFixRule.safetyCheck || 
                             autoFixRule.safetyCheck(fixedData, fixResult.fixed);
          
          if (safeToApply) {
            const fix: AutoFix = {
              field: autoFixRule.name,
              originalValue: fixedData,
              fixedValue: fixResult.fixed,
              reason: fixResult.changes.join('; '),
              confidence: autoFixRule.confidence,
              applied: true
            };
            
            fixedData = fixResult.fixed;
            fixes.push(fix);
          } else {
            fixes.push({
              field: autoFixRule.name,
              originalValue: fixedData,
              fixedValue: fixResult.fixed,
              reason: 'Safety check failed',
              confidence: 0,
              applied: false
            });
          }
        } catch (error) {
          fixes.push({
            field: autoFixRule.name,
            originalValue: data,
            fixedValue: data,
            reason: `Auto-fix failed: ${error}`,
            confidence: 0,
            applied: false
          });
        }
      }
    }

    return { fixedData, fixes };
  }

  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;

    errors.forEach(error => {
      switch (error.severity) {
        case 'critical': score -= 25; break;
        case 'major': score -= 15; break;
        case 'minor': score -= 5; break;
      }
    });

    warnings.forEach(warning => {
      switch (warning.impact) {
        case 'compliance': score -= 3; break;
        case 'usability': score -= 2; break;
        case 'quality': score -= 2; break;
        case 'formatting': score -= 1; break;
      }
    });

    return Math.max(0, score);
  }

  getFormatSpec(contentType: string): FormatSpec | null {
    return this.formatSpecs.get(contentType) || null;
  }

  getAllContentTypes(): string[] {
    return Array.from(this.formatSpecs.keys());
  }

  addCustomValidator(contentType: string, validator: CustomValidator): boolean {
    const spec = this.formatSpecs.get(contentType);
    if (!spec) return false;

    spec.customValidators.push(validator);
    return true;
  }

  addFormatRule(contentType: string, rule: FormatRule): boolean {
    const spec = this.formatSpecs.get(contentType);
    if (!spec) return false;

    spec.formatRules.push(rule);
    return true;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OutputFormatValidator;