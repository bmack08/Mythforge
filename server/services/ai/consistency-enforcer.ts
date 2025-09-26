// Mythwright Campaign Consistency Enforcement System
// Ensures all generated content maintains coherent campaign setting and narrative consistency

import type { CampaignContext, GenerationHistory } from './context-aware-prompt-builder.js';

export interface ConsistencyRule {
  id: string;
  name: string;
  type: 'setting' | 'narrative' | 'mechanical' | 'stylistic';
  priority: 'critical' | 'important' | 'moderate' | 'low';
  description: string;
  validator: (content: any, context: CampaignContext) => ConsistencyViolation[];
  autoFixer?: (content: any, violations: ConsistencyViolation[]) => { fixed: any; changes: string[] };
}

export interface ConsistencyViolation {
  ruleId: string;
  severity: 'critical' | 'warning' | 'suggestion';
  message: string;
  location?: string;
  conflictingElement: any;
  suggestedFix?: string;
  confidence: number; // 0-100
}

export interface ConsistencyReport {
  overall: {
    passed: boolean;
    score: number; // 0-100
    violationCount: number;
    criticalViolations: number;
    warnings: number;
    suggestions: number;
  };
  violations: ConsistencyViolation[];
  autoFixesApplied: boolean;
  fixedContent?: any;
  summary: {
    settingConsistency: number;
    narrativeConsistency: number;
    mechanicalConsistency: number;
    stylisticConsistency: number;
  };
  recommendations: string[];
}

export interface CampaignMemory {
  facts: Record<string, any>;
  entities: {
    npcs: Record<string, any>;
    locations: Record<string, any>;
    organizations: Record<string, any>;
    items: Record<string, any>;
    events: Record<string, any>;
  };
  patterns: {
    namingConventions: string[];
    stylisticPatterns: string[];
    mechanicalPatterns: string[];
    thematicElements: string[];
  };
  relationships: {
    npcConnections: Record<string, string[]>;
    locationHierarchy: Record<string, string>;
    plotThreads: Record<string, string[]>;
  };
  constraints: {
    bannedElements: string[];
    requiredElements: string[];
    customRules: string[];
  };
}

// ============================================================================
// CONSISTENCY RULE DEFINITIONS
// ============================================================================

export class ConsistencyRules {
  
  // Setting Consistency Rules
  static SETTING_MAGIC_LEVEL_CONSISTENCY: ConsistencyRule = {
    id: 'setting-magic-level',
    name: 'Magic Level Consistency',
    type: 'setting',
    priority: 'critical',
    description: 'Ensures generated content matches the campaign\'s established magic level',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      const magicLevel = context.setting.magicLevel;
      
      if (content.type === 'magicitem' && content.rarity) {
        const itemRarity = content.rarity.toLowerCase();
        
        if (magicLevel === 'low' && ['rare', 'very rare', 'legendary'].includes(itemRarity)) {
          violations.push({
            ruleId: 'setting-magic-level',
            severity: 'critical',
            message: `${itemRarity} magic item conflicts with low-magic campaign setting`,
            conflictingElement: content.rarity,
            suggestedFix: 'Consider making this item uncommon or common rarity',
            confidence: 95
          });
        }
        
        if (magicLevel === 'moderate' && itemRarity === 'legendary') {
          violations.push({
            ruleId: 'setting-magic-level',
            severity: 'warning',
            message: `Legendary item may be too powerful for moderate-magic setting`,
            conflictingElement: content.rarity,
            suggestedFix: 'Consider very rare instead, or add significant drawbacks',
            confidence: 80
          });
        }
      }
      
      return violations;
    },
    autoFixer: (content: any, violations: ConsistencyViolation[]) => {
      const changes: string[] = [];
      let fixed = { ...content };
      
      violations.forEach(violation => {
        if (violation.ruleId === 'setting-magic-level' && content.rarity) {
          const currentRarity = content.rarity.toLowerCase();
          
          if (currentRarity === 'legendary') {
            fixed.rarity = 'very rare';
            changes.push('Reduced item rarity from legendary to very rare for setting consistency');
          } else if (['rare', 'very rare'].includes(currentRarity)) {
            fixed.rarity = 'uncommon';
            changes.push(`Reduced item rarity from ${currentRarity} to uncommon for low-magic setting`);
          }
        }
      });
      
      return { fixed, changes };
    }
  };

  static SETTING_TONE_CONSISTENCY: ConsistencyRule = {
    id: 'setting-tone',
    name: 'Tone and Theme Consistency',
    type: 'setting',
    priority: 'important',
    description: 'Ensures content matches the campaign\'s established tone and theme',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      const tone = context.setting.tone.toLowerCase();
      const theme = context.setting.theme.toLowerCase();
      
      // Check description text for tone violations
      const description = content.description || content.lore || '';
      
      if (tone === 'serious' || tone === 'dark') {
        const humorousTerms = ['silly', 'funny', 'ridiculous', 'absurd', 'comical'];
        const foundHumor = humorousTerms.some(term => description.toLowerCase().includes(term));
        
        if (foundHumor) {
          violations.push({
            ruleId: 'setting-tone',
            severity: 'warning',
            message: `Humorous content may conflict with ${tone} campaign tone`,
            conflictingElement: description,
            suggestedFix: 'Rewrite with more serious, atmospheric language',
            confidence: 75
          });
        }
      }
      
      if (theme === 'gritty realism') {
        const fantasticalTerms = ['magical', 'wondrous', 'miraculous', 'divine'];
        const foundFantastical = fantasticalTerms.some(term => 
          description.toLowerCase().includes(term) && content.type !== 'magicitem'
        );
        
        if (foundFantastical) {
          violations.push({
            ruleId: 'setting-tone',
            severity: 'suggestion',
            message: 'Overly fantastical language may not fit gritty realism theme',
            conflictingElement: description,
            suggestedFix: 'Use more grounded, realistic descriptions',
            confidence: 60
          });
        }
      }
      
      return violations;
    }
  };

  // Narrative Consistency Rules
  static NARRATIVE_NPC_CONSISTENCY: ConsistencyRule = {
    id: 'narrative-npc',
    name: 'NPC Consistency',
    type: 'narrative',
    priority: 'critical',
    description: 'Ensures NPCs are consistent with established characters',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      
      if (content.type === 'npc' || content.name) {
        const establishedNPCs = context.narrative.establishedNPCs;
        const contentName = content.name?.toLowerCase() || '';
        
        // Check for name conflicts
        const nameConflict = establishedNPCs.find(npc => 
          typeof npc === 'string' ? npc.toLowerCase() === contentName :
          npc.name?.toLowerCase() === contentName
        );
        
        if (nameConflict && contentName) {
          violations.push({
            ruleId: 'narrative-npc',
            severity: 'critical',
            message: `NPC name "${content.name}" conflicts with established character`,
            conflictingElement: content.name,
            suggestedFix: 'Use a different name or clarify if this is the same character',
            confidence: 90
          });
        }
      }
      
      return violations;
    }
  };

  static NARRATIVE_LOCATION_CONSISTENCY: ConsistencyRule = {
    id: 'narrative-location',
    name: 'Location Consistency',
    type: 'narrative',
    priority: 'important',
    description: 'Ensures locations are consistent with established geography',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      
      // Check if content references locations
      const description = content.description || content.lore || content.environment || '';
      const significantLocations = context.narrative.significantLocations;
      
      // Look for potential location references in text
      significantLocations.forEach(location => {
        if (typeof location === 'string') {
          const locationName = location.toLowerCase();
          if (description.toLowerCase().includes(locationName)) {
            // This is good - referencing established locations
            // Could add positive scoring here
          }
        }
      });
      
      return violations;
    }
  };

  // Mechanical Consistency Rules
  static MECHANICAL_BALANCE_CONSISTENCY: ConsistencyRule = {
    id: 'mechanical-balance',
    name: 'Mechanical Balance Consistency',
    type: 'mechanical',
    priority: 'important',
    description: 'Ensures mechanical elements are consistent with campaign power level',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      const partyLevel = context.party.averageLevel;
      
      // Check monster CR vs party level
      if (content.challengeRating || content.cr) {
        const cr = parseFloat(content.challengeRating || content.cr);
        
        if (cr > partyLevel + 4) {
          violations.push({
            ruleId: 'mechanical-balance',
            severity: 'warning',
            message: `CR ${cr} may be too high for level ${partyLevel} party`,
            conflictingElement: content.challengeRating || content.cr,
            suggestedFix: `Consider CR ${partyLevel - 1} to ${partyLevel + 2} for balanced encounters`,
            confidence: 85
          });
        }
      }
      
      // Check spell levels for NPCs
      if (content.spells && Array.isArray(content.spells)) {
        const highLevelSpells = content.spells.filter((spell: any) => {
          const level = spell.level || 0;
          return level > Math.ceil(partyLevel / 2);
        });
        
        if (highLevelSpells.length > 0) {
          violations.push({
            ruleId: 'mechanical-balance',
            severity: 'suggestion',
            message: `High-level spells may be too powerful for party level ${partyLevel}`,
            conflictingElement: highLevelSpells,
            suggestedFix: 'Consider lower-level spell alternatives',
            confidence: 70
          });
        }
      }
      
      return violations;
    }
  };

  // Stylistic Consistency Rules
  static STYLISTIC_NAMING_CONSISTENCY: ConsistencyRule = {
    id: 'stylistic-naming',
    name: 'Naming Convention Consistency',
    type: 'stylistic',
    priority: 'moderate',
    description: 'Ensures naming follows established campaign conventions',
    validator: (content: any, context: CampaignContext) => {
      const violations: ConsistencyViolation[] = [];
      
      // This would analyze naming patterns from previous generations
      // and flag inconsistencies
      
      return violations;
    }
  };
}

// ============================================================================
// CAMPAIGN MEMORY MANAGER
// ============================================================================

export class CampaignMemoryManager {
  private memory: CampaignMemory;
  
  constructor(initialMemory?: Partial<CampaignMemory>) {
    this.memory = {
      facts: {},
      entities: {
        npcs: {},
        locations: {},
        organizations: {},
        items: {},
        events: {}
      },
      patterns: {
        namingConventions: [],
        stylisticPatterns: [],
        mechanicalPatterns: [],
        thematicElements: []
      },
      relationships: {
        npcConnections: {},
        locationHierarchy: {},
        plotThreads: {}
      },
      constraints: {
        bannedElements: [],
        requiredElements: [],
        customRules: []
      },
      ...initialMemory
    };
  }

  // Learn from new generations
  learnFromGeneration(generation: GenerationHistory) {
    const content = generation.result;
    
    // Extract entities
    if (content.name) {
      const entityType = this.determineEntityType(content);
      if (entityType) {
        this.memory.entities[entityType][content.name] = content;
      }
    }
    
    // Learn patterns
    this.extractPatterns(content);
    
    // Update relationships
    this.updateRelationships(content);
  }

  private determineEntityType(content: any): keyof CampaignMemory['entities'] | null {
    if (content.type === 'npc' || content.personality) return 'npcs';
    if (content.type === 'location' || content.environment) return 'locations';
    if (content.type === 'magicitem') return 'items';
    if (content.type === 'encounter') return 'events';
    return null;
  }

  private extractPatterns(content: any) {
    // Extract naming patterns
    if (content.name) {
      this.analyzeNamingPattern(content.name);
    }
    
    // Extract stylistic patterns
    if (content.description || content.lore) {
      this.analyzeStylePatterns(content.description || content.lore);
    }
  }

  private analyzeNamingPattern(name: string) {
    // Simple pattern analysis - could be much more sophisticated
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      const pattern = `${nameParts.length}-part name`;
      if (!this.memory.patterns.namingConventions.includes(pattern)) {
        this.memory.patterns.namingConventions.push(pattern);
      }
    }
  }

  private analyzeStylePatterns(text: string) {
    // Analyze writing style patterns
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((acc, s) => acc + s.length, 0) / sentences.length;
    
    const stylePattern = avgSentenceLength > 100 ? 'verbose' : avgSentenceLength > 50 ? 'detailed' : 'concise';
    
    if (!this.memory.patterns.stylisticPatterns.includes(stylePattern)) {
      this.memory.patterns.stylisticPatterns.push(stylePattern);
    }
  }

  private updateRelationships(content: any) {
    // Update entity relationships based on content
    if (content.name && content.relationships) {
      this.memory.relationships.npcConnections[content.name] = content.relationships;
    }
  }

  getMemory(): CampaignMemory {
    return { ...this.memory };
  }

  addConstraint(type: keyof CampaignMemory['constraints'], constraint: string) {
    if (!this.memory.constraints[type].includes(constraint)) {
      this.memory.constraints[type].push(constraint);
    }
  }

  // Check if content conflicts with memory
  checkForConflicts(content: any): string[] {
    const conflicts: string[] = [];
    
    // Check banned elements
    this.memory.constraints.bannedElements.forEach(banned => {
      if (this.contentContainsElement(content, banned)) {
        conflicts.push(`Contains banned element: ${banned}`);
      }
    });
    
    // Check for entity conflicts
    if (content.name) {
      const entityType = this.determineEntityType(content);
      if (entityType && this.memory.entities[entityType][content.name]) {
        const existing = this.memory.entities[entityType][content.name];
        if (JSON.stringify(existing) !== JSON.stringify(content)) {
          conflicts.push(`Conflicts with established ${entityType.slice(0, -1)}: ${content.name}`);
        }
      }
    }
    
    return conflicts;
  }

  private contentContainsElement(content: any, element: string): boolean {
    const searchText = JSON.stringify(content).toLowerCase();
    return searchText.includes(element.toLowerCase());
  }
}

// ============================================================================
// CONSISTENCY ENFORCER
// ============================================================================

export class ConsistencyEnforcer {
  private rules: ConsistencyRule[] = [];
  private memoryManager: CampaignMemoryManager;

  constructor(campaignMemory?: Partial<CampaignMemory>) {
    this.memoryManager = new CampaignMemoryManager(campaignMemory);
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.rules = [
      ConsistencyRules.SETTING_MAGIC_LEVEL_CONSISTENCY,
      ConsistencyRules.SETTING_TONE_CONSISTENCY,
      ConsistencyRules.NARRATIVE_NPC_CONSISTENCY,
      ConsistencyRules.NARRATIVE_LOCATION_CONSISTENCY,
      ConsistencyRules.MECHANICAL_BALANCE_CONSISTENCY,
      ConsistencyRules.STYLISTIC_NAMING_CONSISTENCY
    ];
  }

  addRule(rule: ConsistencyRule) {
    this.rules.push(rule);
  }

  removeRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  enforceConsistency(content: any, campaignContext: CampaignContext): ConsistencyReport {
    const violations: ConsistencyViolation[] = [];
    let fixedContent = { ...content };
    let autoFixesApplied = false;
    const appliedChanges: string[] = [];

    // Run all rules
    for (const rule of this.rules) {
      try {
        const ruleViolations = rule.validator(fixedContent, campaignContext);
        violations.push(...ruleViolations);

        // Apply auto-fixes if available and violations exist
        if (rule.autoFixer && ruleViolations.length > 0) {
          const fixResult = rule.autoFixer(fixedContent, ruleViolations);
          if (fixResult.changes.length > 0) {
            fixedContent = fixResult.fixed;
            appliedChanges.push(...fixResult.changes);
            autoFixesApplied = true;
          }
        }
      } catch (error) {
        console.warn(`Error running consistency rule ${rule.id}:`, error);
      }
    }

    // Check memory-based conflicts
    const memoryConflicts = this.memoryManager.checkForConflicts(fixedContent);
    memoryConflicts.forEach(conflict => {
      violations.push({
        ruleId: 'memory-conflict',
        severity: 'warning',
        message: conflict,
        conflictingElement: fixedContent,
        confidence: 85
      });
    });

    // Calculate scores
    const report = this.generateConsistencyReport(violations, autoFixesApplied, fixedContent, appliedChanges);
    
    // Learn from this generation
    this.memoryManager.learnFromGeneration({
      id: `gen-${Date.now()}`,
      timestamp: new Date(),
      contentType: content.type || 'unknown',
      prompt: '',
      result: fixedContent,
      tags: [],
      quality: report.overall.score,
      context: {}
    });

    return report;
  }

  private generateConsistencyReport(
    violations: ConsistencyViolation[],
    autoFixesApplied: boolean,
    fixedContent: any,
    changes: string[]
  ): ConsistencyReport {
    const critical = violations.filter(v => v.severity === 'critical').length;
    const warnings = violations.filter(v => v.severity === 'warning').length;
    const suggestions = violations.filter(v => v.severity === 'suggestion').length;

    // Calculate overall score
    let score = 100;
    score -= critical * 20; // Critical violations are heavily penalized
    score -= warnings * 10; // Warnings moderately penalized
    score -= suggestions * 5; // Suggestions lightly penalized
    score = Math.max(0, score);

    // Calculate category scores
    const settingViolations = violations.filter(v => v.ruleId.startsWith('setting-'));
    const narrativeViolations = violations.filter(v => v.ruleId.startsWith('narrative-'));
    const mechanicalViolations = violations.filter(v => v.ruleId.startsWith('mechanical-'));
    const stylisticViolations = violations.filter(v => v.ruleId.startsWith('stylistic-'));

    const categoryScore = (violationCount: number) => Math.max(0, 100 - violationCount * 15);

    const recommendations = this.generateRecommendations(violations);

    return {
      overall: {
        passed: critical === 0 && warnings < 3,
        score,
        violationCount: violations.length,
        criticalViolations: critical,
        warnings,
        suggestions
      },
      violations,
      autoFixesApplied,
      fixedContent: autoFixesApplied ? fixedContent : undefined,
      summary: {
        settingConsistency: categoryScore(settingViolations.length),
        narrativeConsistency: categoryScore(narrativeViolations.length),
        mechanicalConsistency: categoryScore(mechanicalViolations.length),
        stylisticConsistency: categoryScore(stylisticViolations.length)
      },
      recommendations
    };
  }

  private generateRecommendations(violations: ConsistencyViolation[]): string[] {
    const recommendations: string[] = [];

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      recommendations.push(`Address ${criticalViolations.length} critical consistency issues before use`);
    }

    const settingViolations = violations.filter(v => v.ruleId.startsWith('setting-'));
    if (settingViolations.length > 0) {
      recommendations.push('Review campaign setting documentation to ensure consistency');
    }

    const balanceViolations = violations.filter(v => v.ruleId.includes('balance'));
    if (balanceViolations.length > 0) {
      recommendations.push('Consider adjusting power level to match party capabilities');
    }

    if (recommendations.length === 0) {
      recommendations.push('Content appears consistent with campaign setting');
    }

    return recommendations;
  }

  getCampaignMemory(): CampaignMemory {
    return this.memoryManager.getMemory();
  }

  addCampaignConstraint(type: keyof CampaignMemory['constraints'], constraint: string) {
    this.memoryManager.addConstraint(type, constraint);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ConsistencyEnforcer;