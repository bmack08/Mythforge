// Mythwright Tone and Theme Consistency Checker
// Advanced linguistic analysis for maintaining consistent campaign atmosphere and thematic elements

export interface ToneProfile {
  id: string;
  name: string;
  description: string;
  characteristics: {
    formality: 'formal' | 'casual' | 'mixed';
    emotionalTone: 'serious' | 'lighthearted' | 'dark' | 'inspiring' | 'mysterious' | 'neutral';
    complexity: 'simple' | 'moderate' | 'complex' | 'varied';
    perspective: 'authoritative' | 'conversational' | 'narrative' | 'technical';
  };
  linguisticMarkers: {
    vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | 'archaic';
    sentenceStructure: 'simple' | 'compound' | 'complex' | 'varied';
    activeVsPassive: 'mostly-active' | 'mixed' | 'mostly-passive';
    personPerspective: 'first' | 'second' | 'third' | 'mixed';
  };
  lexicalPatterns: {
    preferredWords: string[];
    avoidedWords: string[];
    characteristicPhrases: string[];
    punctuationStyle: string;
  };
  examples: {
    goodExample: string;
    badExample: string;
    explanation: string;
  }[];
}

export interface ThemeProfile {
  id: string;
  name: string;
  description: string;
  coreElements: {
    primaryThemes: string[];
    secondaryThemes: string[];
    symbolism: Record<string, string>;
    archetypes: string[];
    conflicts: string[];
  };
  atmosphericElements: {
    mood: string[];
    setting: string[];
    imagery: string[];
    sensoryElements: string[];
  };
  narrativePatterns: {
    storyStructures: string[];
    characterTypes: string[];
    plotDevices: string[];
    resolutionStyles: string[];
  };
  contentGuidelines: {
    encouraged: string[];
    discouraged: string[];
    forbidden: string[];
    required: string[];
  };
}

export interface ToneAnalysisResult {
  overallScore: number; // 0-100
  consistency: {
    formalityScore: number;
    emotionalConsistency: number;
    complexityConsistency: number;
    perspectiveConsistency: number;
  };
  violations: {
    type: 'tone-shift' | 'formality-mismatch' | 'emotional-inconsistency' | 'complexity-jump';
    severity: 'minor' | 'moderate' | 'major';
    location: string;
    description: string;
    suggestedFix: string;
    confidence: number;
  }[];
  recommendations: string[];
  detectedPatterns: {
    averageSentenceLength: number;
    vocabularyComplexity: number;
    emotionalWords: string[];
    toneIndicators: string[];
  };
}

export interface ThemeAnalysisResult {
  overallScore: number; // 0-100
  thematicAlignment: {
    primaryThemeSupport: number;
    symbolismUsage: number;
    archetypeConsistency: number;
    atmosphericMatch: number;
  };
  violations: {
    type: 'theme-conflict' | 'missing-element' | 'inappropriate-content' | 'weak-thematic-support';
    severity: 'minor' | 'moderate' | 'major';
    element: string;
    description: string;
    suggestedFix: string;
    confidence: number;
  }[];
  opportunities: {
    type: 'strengthen-theme' | 'add-symbolism' | 'enhance-atmosphere' | 'deepen-conflict';
    description: string;
    implementation: string;
  }[];
  thematicElements: {
    identifiedThemes: string[];
    supportingElements: string[];
    missingElements: string[];
    conflictingElements: string[];
  };
}

export interface CombinedConsistencyReport {
  overall: {
    score: number;
    passed: boolean;
    toneConsistency: number;
    themeConsistency: number;
  };
  toneAnalysis: ToneAnalysisResult;
  themeAnalysis: ThemeAnalysisResult;
  integratedViolations: {
    type: string;
    severity: 'minor' | 'moderate' | 'major';
    description: string;
    suggestedFix: string;
    affects: ('tone' | 'theme')[];
  }[];
  recommendations: {
    immediate: string[];
    longTerm: string[];
    optional: string[];
  };
}

// ============================================================================
// TONE PROFILES LIBRARY
// ============================================================================

export class ToneProfileLibrary {
  private static profiles: Map<string, ToneProfile> = new Map();

  static initialize() {
    this.profiles.set('heroic-fantasy', {
      id: 'heroic-fantasy',
      name: 'Heroic Fantasy',
      description: 'Classic D&D adventure tone - inspiring, adventurous, and heroic',
      characteristics: {
        formality: 'mixed',
        emotionalTone: 'inspiring',
        complexity: 'moderate',
        perspective: 'narrative'
      },
      linguisticMarkers: {
        vocabularyLevel: 'intermediate',
        sentenceStructure: 'varied',
        activeVsPassive: 'mostly-active',
        personPerspective: 'third'
      },
      lexicalPatterns: {
        preferredWords: ['heroic', 'brave', 'noble', 'quest', 'adventure', 'valor', 'honor', 'destiny'],
        avoidedWords: ['mundane', 'boring', 'pessimistic', 'hopeless'],
        characteristicPhrases: ['the call to adventure', 'against all odds', 'for the greater good'],
        punctuationStyle: 'standard with occasional dramatic emphasis'
      },
      examples: [
        {
          goodExample: 'The ancient sword gleams with inner light, its blade bearing runes of power that speak to those destined for greatness.',
          badExample: 'This is just another old sword with some scratches on it.',
          explanation: 'Heroic tone emphasizes wonder, destiny, and significance over mundane descriptions'
        }
      ]
    });

    this.profiles.set('dark-fantasy', {
      id: 'dark-fantasy',
      name: 'Dark Fantasy',
      description: 'Gothic, atmospheric, morally complex fantasy with horror elements',
      characteristics: {
        formality: 'formal',
        emotionalTone: 'dark',
        complexity: 'complex',
        perspective: 'narrative'
      },
      linguisticMarkers: {
        vocabularyLevel: 'advanced',
        sentenceStructure: 'complex',
        activeVsPassive: 'mixed',
        personPerspective: 'third'
      },
      lexicalPatterns: {
        preferredWords: ['shadow', 'whisper', 'decay', 'corruption', 'haunting', 'ominous', 'forsaken', 'cursed'],
        avoidedWords: ['cheerful', 'bright', 'simple', 'innocent'],
        characteristicPhrases: ['in the dying light', 'shadows lengthen', 'the price of power'],
        punctuationStyle: 'dramatic with em-dashes and ellipses'
      },
      examples: [
        {
          goodExample: 'The blade drinks deeply of shadow and despair—each soul it claims bound forever to its cursed steel, whispering dark promises to those who dare wield it.',
          badExample: 'This sword is pretty scary and makes people feel bad.',
          explanation: 'Dark fantasy uses rich, atmospheric language and explores moral complexity'
        }
      ]
    });

    this.profiles.set('gritty-realism', {
      id: 'gritty-realism',
      name: 'Gritty Realism',
      description: 'Realistic, grounded approach to fantasy with practical concerns',
      characteristics: {
        formality: 'casual',
        emotionalTone: 'serious',
        complexity: 'simple',
        perspective: 'conversational'
      },
      linguisticMarkers: {
        vocabularyLevel: 'intermediate',
        sentenceStructure: 'simple',
        activeVsPassive: 'mostly-active',
        personPerspective: 'second'
      },
      lexicalPatterns: {
        preferredWords: ['practical', 'worn', 'tested', 'reliable', 'functional', 'weathered', 'experienced'],
        avoidedWords: ['magical', 'wondrous', 'miraculous', 'perfect', 'flawless'],
        characteristicPhrases: ['hard-won experience', 'the weight of reality', 'practical concerns'],
        punctuationStyle: 'minimal and functional'
      },
      examples: [
        {
          goodExample: 'The sword has seen better days—nicks along the edge tell stories of real fights, and the worn grip fits your hand like it was made for work.',
          badExample: 'The magnificent blade radiates with divine power and perfect craftsmanship.',
          explanation: 'Gritty realism focuses on practicality and lived experience over fantasy ideals'
        }
      ]
    });

    this.profiles.set('high-fantasy', {
      id: 'high-fantasy',
      name: 'High Fantasy',
      description: 'Epic, mythic fantasy with grand scope and magical wonder',
      characteristics: {
        formality: 'formal',
        emotionalTone: 'inspiring',
        complexity: 'complex',
        perspective: 'authoritative'
      },
      linguisticMarkers: {
        vocabularyLevel: 'advanced',
        sentenceStructure: 'complex',
        activeVsPassive: 'mixed',
        personPerspective: 'third'
      },
      lexicalPatterns: {
        preferredWords: ['eternal', 'divine', 'cosmic', 'legendary', 'mythic', 'transcendent', 'primordial'],
        avoidedWords: ['simple', 'ordinary', 'mundane', 'trivial'],
        characteristicPhrases: ['since time immemorial', 'the very fabric of reality', 'cosmic significance'],
        punctuationStyle: 'formal with semicolons and complex punctuation'
      },
      examples: [
        {
          goodExample: 'Forged in the cosmic fires at the dawn of creation, this blade embodies the eternal struggle between order and chaos; its very presence reshapes the fundamental forces that govern reality.',
          badExample: 'This is a really good sword that does a lot of damage.',
          explanation: 'High fantasy uses elevated language and explores cosmic, mythic themes'
        }
      ]
    });
  }

  static getProfile(id: string): ToneProfile | null {
    return this.profiles.get(id) || null;
  }

  static getAllProfiles(): ToneProfile[] {
    return Array.from(this.profiles.values());
  }

  static addProfile(profile: ToneProfile): void {
    this.profiles.set(profile.id, profile);
  }
}

// ============================================================================
// THEME PROFILES LIBRARY
// ============================================================================

export class ThemeProfileLibrary {
  private static profiles: Map<string, ThemeProfile> = new Map();

  static initialize() {
    this.profiles.set('classic-adventure', {
      id: 'classic-adventure',
      name: 'Classic Adventure',
      description: 'Traditional D&D adventure themes of heroism, exploration, and discovery',
      coreElements: {
        primaryThemes: ['heroism', 'friendship', 'discovery', 'good vs evil'],
        secondaryThemes: ['coming of age', 'redemption', 'sacrifice', 'wisdom'],
        symbolism: {
          'light': 'hope and goodness',
          'darkness': 'evil and unknown',
          'journey': 'personal growth',
          'treasure': 'reward for virtue'
        },
        archetypes: ['hero', 'mentor', 'villain', 'innocent', 'helper'],
        conflicts: ['person vs evil', 'person vs nature', 'person vs self']
      },
      atmosphericElements: {
        mood: ['hopeful', 'adventurous', 'mysterious', 'triumphant'],
        setting: ['dungeons', 'wilderness', 'ancient ruins', 'mystical forests'],
        imagery: ['gleaming weapons', 'ancient maps', 'magical portals', 'treasure chests'],
        sensoryElements: ['echoing footsteps', 'flickering torchlight', 'musty air', 'distant sounds']
      },
      narrativePatterns: {
        storyStructures: ['hero\'s journey', 'quest narrative', 'mystery and revelation'],
        characterTypes: ['reluctant hero', 'wise mentor', 'faithful companion', 'mysterious guide'],
        plotDevices: ['ancient prophecy', 'lost artifact', 'hidden knowledge', 'testing trial'],
        resolutionStyles: ['triumphant victory', 'hard-won wisdom', 'bittersweet sacrifice']
      },
      contentGuidelines: {
        encouraged: ['teamwork', 'moral choices', 'personal growth', 'wonder and discovery'],
        discouraged: ['hopelessness', 'betrayal without redemption', 'meaningless violence'],
        forbidden: ['excessive gore', 'sexual content', 'political extremism'],
        required: ['clear moral stakes', 'opportunity for heroism', 'meaningful consequences']
      }
    });

    this.profiles.set('gothic-horror', {
      id: 'gothic-horror',
      name: 'Gothic Horror',
      description: 'Dark themes of corruption, madness, and the price of knowledge',
      coreElements: {
        primaryThemes: ['corruption', 'madness', 'forbidden knowledge', 'decay'],
        secondaryThemes: ['isolation', 'paranoia', 'guilt', 'transformation'],
        symbolism: {
          'shadow': 'hidden truth',
          'mirror': 'self-reflection and duality',
          'decay': 'corruption of ideals',
          'blood': 'life force and sacrifice'
        },
        archetypes: ['tragic hero', 'mad scientist', 'corrupted innocent', 'ancient evil'],
        conflicts: ['person vs darkness within', 'person vs cosmic horror', 'person vs society']
      },
      atmosphericElements: {
        mood: ['foreboding', 'melancholic', 'tense', 'unsettling'],
        setting: ['crumbling mansions', 'fog-shrouded moors', 'abandoned laboratories', 'cursed libraries'],
        imagery: ['flickering candles', 'tattered books', 'cracked mirrors', 'withering roses'],
        sensoryElements: ['creaking floorboards', 'whispering wind', 'acrid smoke', 'cold touch']
      },
      narrativePatterns: {
        storyStructures: ['descent into madness', 'revelation of horror', 'corruption and fall'],
        characterTypes: ['obsessed scholar', 'innocent victim', 'conflicted noble', 'ancient entity'],
        plotDevices: ['forbidden text', 'family curse', 'dark revelation', 'Faustian bargain'],
        resolutionStyles: ['pyrrhic victory', 'tragic sacrifice', 'ambiguous ending']
      },
      contentGuidelines: {
        encouraged: ['psychological tension', 'moral ambiguity', 'atmospheric dread', 'tragic consequences'],
        discouraged: ['cheap scares', 'gore without purpose', 'simple good vs evil'],
        forbidden: ['gratuitous violence', 'explicit content', 'real-world religions'],
        required: ['psychological depth', 'moral complexity', 'consequences for actions']
      }
    });
  }

  static getProfile(id: string): ThemeProfile | null {
    return this.profiles.get(id) || null;
  }

  static getAllProfiles(): ThemeProfile[] {
    return Array.from(this.profiles.values());
  }

  static addProfile(profile: ThemeProfile): void {
    this.profiles.set(profile.id, profile);
  }
}

// ============================================================================
// TONE ANALYZER
// ============================================================================

export class ToneAnalyzer {
  
  static analyzeContent(content: string, targetProfile: ToneProfile): ToneAnalysisResult {
    const analysis = this.performLinguisticAnalysis(content);
    const violations = this.identifyToneViolations(content, analysis, targetProfile);
    const score = this.calculateToneScore(violations, analysis, targetProfile);
    const recommendations = this.generateToneRecommendations(violations, analysis, targetProfile);

    return {
      overallScore: score,
      consistency: this.calculateConsistencyScores(analysis, targetProfile),
      violations,
      recommendations,
      detectedPatterns: analysis
    };
  }

  private static performLinguisticAnalysis(content: string) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Analyze sentence structure
    const averageSentenceLength = sentences.reduce((acc, s) => acc + s.length, 0) / sentences.length || 0;
    
    // Analyze vocabulary complexity
    const complexWords = words.filter(word => word.length > 6);
    const vocabularyComplexity = complexWords.length / words.length || 0;
    
    // Identify emotional words
    const emotionalWords = this.identifyEmotionalWords(words);
    
    // Identify tone indicators
    const toneIndicators = this.identifyToneIndicators(content);

    return {
      averageSentenceLength,
      vocabularyComplexity,
      emotionalWords,
      toneIndicators
    };
  }

  private static identifyEmotionalWords(words: string[]): string[] {
    const emotionalLexicon = {
      positive: ['brave', 'noble', 'heroic', 'glorious', 'magnificent', 'inspiring', 'wonderful'],
      negative: ['dark', 'grim', 'cursed', 'ominous', 'haunting', 'terrifying', 'sinister'],
      neutral: ['ancient', 'mysterious', 'powerful', 'strange', 'unusual', 'remarkable']
    };

    const found: string[] = [];
    for (const word of words) {
      for (const [category, categoryWords] of Object.entries(emotionalLexicon)) {
        if (categoryWords.includes(word)) {
          found.push(`${word} (${category})`);
        }
      }
    }

    return found;
  }

  private static identifyToneIndicators(content: string): string[] {
    const indicators: string[] = [];
    
    // Formality indicators
    if (/\b(thou|thee|thy|thine)\b/i.test(content)) {
      indicators.push('archaic formality');
    }
    if (/\b(indeed|furthermore|however|nevertheless)\b/i.test(content)) {
      indicators.push('formal discourse markers');
    }
    if (/\b(yeah|ok|stuff|things)\b/i.test(content)) {
      indicators.push('casual language');
    }

    // Emotional tone indicators
    if (/!{2,}/.test(content)) {
      indicators.push('high excitement/emphasis');
    }
    if (/\.{3,}/.test(content)) {
      indicators.push('suspense/trailing off');
    }
    if (/—/.test(content)) {
      indicators.push('dramatic pause/emphasis');
    }

    return indicators;
  }

  private static identifyToneViolations(
    content: string, 
    analysis: any, 
    targetProfile: ToneProfile
  ): ToneAnalysisResult['violations'] {
    const violations: ToneAnalysisResult['violations'] = [];

    // Check formality consistency
    const casualWords = ['yeah', 'ok', 'stuff', 'things', 'gonna', 'wanna'];
    const formalWords = ['indeed', 'furthermore', 'nevertheless', 'moreover'];
    
    const hasCasual = casualWords.some(word => content.toLowerCase().includes(word));
    const hasFormal = formalWords.some(word => content.toLowerCase().includes(word));

    if (targetProfile.characteristics.formality === 'formal' && hasCasual) {
      violations.push({
        type: 'formality-mismatch',
        severity: 'moderate',
        location: 'throughout text',
        description: 'Casual language detected in formal tone profile',
        suggestedFix: 'Replace casual expressions with more formal alternatives',
        confidence: 80
      });
    }

    if (targetProfile.characteristics.formality === 'casual' && hasFormal) {
      violations.push({
        type: 'formality-mismatch',
        severity: 'minor',
        location: 'throughout text',
        description: 'Overly formal language for casual tone profile',
        suggestedFix: 'Use more conversational, accessible language',
        confidence: 70
      });
    }

    // Check emotional tone consistency
    const positiveWords = analysis.emotionalWords.filter((w: string) => w.includes('positive'));
    const negativeWords = analysis.emotionalWords.filter((w: string) => w.includes('negative'));

    if (targetProfile.characteristics.emotionalTone === 'dark' && positiveWords.length > negativeWords.length) {
      violations.push({
        type: 'emotional-inconsistency',
        severity: 'major',
        location: 'emotional word choice',
        description: 'Too many positive emotional words for dark tone profile',
        suggestedFix: 'Replace some positive language with darker, more atmospheric alternatives',
        confidence: 85
      });
    }

    // Check complexity consistency
    if (targetProfile.characteristics.complexity === 'simple' && analysis.averageSentenceLength > 100) {
      violations.push({
        type: 'complexity-jump',
        severity: 'moderate',
        location: 'sentence structure',
        description: 'Sentences too complex for simple tone profile',
        suggestedFix: 'Break long sentences into shorter, clearer statements',
        confidence: 90
      });
    }

    return violations;
  }

  private static calculateToneScore(
    violations: ToneAnalysisResult['violations'], 
    analysis: any, 
    targetProfile: ToneProfile
  ): number {
    let score = 100;

    // Penalty for violations
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'major': score -= 20; break;
        case 'moderate': score -= 10; break;
        case 'minor': score -= 5; break;
      }
    });

    return Math.max(0, score);
  }

  private static calculateConsistencyScores(analysis: any, targetProfile: ToneProfile) {
    return {
      formalityScore: 85, // Simplified - would be more sophisticated
      emotionalConsistency: 78,
      complexityConsistency: 92,
      perspectiveConsistency: 88
    };
  }

  private static generateToneRecommendations(
    violations: ToneAnalysisResult['violations'], 
    analysis: any, 
    targetProfile: ToneProfile
  ): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'formality-mismatch')) {
      recommendations.push(`Adjust formality level to match ${targetProfile.characteristics.formality} tone`);
    }

    if (violations.some(v => v.type === 'emotional-inconsistency')) {
      recommendations.push(`Align emotional language with ${targetProfile.characteristics.emotionalTone} tone`);
    }

    if (analysis.vocabularyComplexity > 0.3 && targetProfile.characteristics.complexity === 'simple') {
      recommendations.push('Simplify vocabulary for better accessibility');
    }

    if (recommendations.length === 0) {
      recommendations.push('Tone appears consistent with target profile');
    }

    return recommendations;
  }
}

// ============================================================================
// THEME ANALYZER
// ============================================================================

export class ThemeAnalyzer {
  
  static analyzeContent(content: string, targetProfile: ThemeProfile): ThemeAnalysisResult {
    const thematicElements = this.identifyThematicElements(content, targetProfile);
    const violations = this.identifyThemeViolations(content, thematicElements, targetProfile);
    const opportunities = this.identifyThemeOpportunities(content, thematicElements, targetProfile);
    const score = this.calculateThemeScore(thematicElements, violations, targetProfile);

    return {
      overallScore: score,
      thematicAlignment: this.calculateThematicAlignment(thematicElements, targetProfile),
      violations,
      opportunities,
      thematicElements
    };
  }

  private static identifyThematicElements(content: string, targetProfile: ThemeProfile) {
    const contentLower = content.toLowerCase();
    
    const identifiedThemes = targetProfile.coreElements.primaryThemes.filter(theme =>
      contentLower.includes(theme.toLowerCase()) ||
      this.findThemeIndicators(contentLower, theme)
    );

    const supportingElements = targetProfile.atmosphericElements.mood.filter(mood =>
      this.findMoodIndicators(contentLower, mood)
    );

    const missingElements = targetProfile.coreElements.primaryThemes.filter(theme =>
      !identifiedThemes.includes(theme)
    );

    const conflictingElements = this.findConflictingElements(content, targetProfile);

    return {
      identifiedThemes,
      supportingElements,
      missingElements,
      conflictingElements
    };
  }

  private static findThemeIndicators(content: string, theme: string): boolean {
    const themeKeywords: Record<string, string[]> = {
      'heroism': ['brave', 'courage', 'valor', 'noble', 'champion', 'defender'],
      'corruption': ['tainted', 'cursed', 'twisted', 'fallen', 'decay', 'blight'],
      'discovery': ['ancient', 'hidden', 'secret', 'mysterious', 'unknown', 'revealed'],
      'sacrifice': ['give up', 'cost', 'price', 'loss', 'surrender', 'willing']
    };

    const keywords = themeKeywords[theme] || [];
    return keywords.some(keyword => content.includes(keyword));
  }

  private static findMoodIndicators(content: string, mood: string): boolean {
    const moodKeywords: Record<string, string[]> = {
      'foreboding': ['ominous', 'threatening', 'dark', 'looming', 'menacing'],
      'hopeful': ['bright', 'promising', 'optimistic', 'inspiring', 'uplifting'],
      'mysterious': ['enigmatic', 'cryptic', 'puzzling', 'secretive', 'hidden'],
      'triumphant': ['victorious', 'glorious', 'successful', 'achieving', 'conquering']
    };

    const keywords = moodKeywords[mood] || [];
    return keywords.some(keyword => content.includes(keyword));
  }

  private static findConflictingElements(content: string, targetProfile: ThemeProfile): string[] {
    const conflicting: string[] = [];
    const contentLower = content.toLowerCase();

    targetProfile.contentGuidelines.discouraged.forEach(element => {
      if (contentLower.includes(element.toLowerCase())) {
        conflicting.push(element);
      }
    });

    targetProfile.contentGuidelines.forbidden.forEach(element => {
      if (contentLower.includes(element.toLowerCase())) {
        conflicting.push(`FORBIDDEN: ${element}`);
      }
    });

    return conflicting;
  }

  private static identifyThemeViolations(
    content: string,
    thematicElements: any,
    targetProfile: ThemeProfile
  ): ThemeAnalysisResult['violations'] {
    const violations: ThemeAnalysisResult['violations'] = [];

    // Check for forbidden content
    thematicElements.conflictingElements.forEach((element: string) => {
      if (element.startsWith('FORBIDDEN:')) {
        violations.push({
          type: 'inappropriate-content',
          severity: 'major',
          element: element.replace('FORBIDDEN: ', ''),
          description: 'Content contains forbidden thematic elements',
          suggestedFix: 'Remove or replace forbidden content',
          confidence: 95
        });
      }
    });

    // Check for missing required themes
    const missingRequired = targetProfile.contentGuidelines.required.filter(req =>
      !content.toLowerCase().includes(req.toLowerCase())
    );

    if (missingRequired.length > 0) {
      violations.push({
        type: 'missing-element',
        severity: 'moderate',
        element: missingRequired.join(', '),
        description: 'Missing required thematic elements',
        suggestedFix: 'Incorporate required thematic elements into the content',
        confidence: 80
      });
    }

    // Check for weak thematic support
    if (thematicElements.identifiedThemes.length < targetProfile.coreElements.primaryThemes.length / 2) {
      violations.push({
        type: 'weak-thematic-support',
        severity: 'minor',
        element: 'overall theme support',
        description: 'Content provides weak support for core themes',
        suggestedFix: 'Strengthen thematic elements and symbolism',
        confidence: 70
      });
    }

    return violations;
  }

  private static identifyThemeOpportunities(
    content: string,
    thematicElements: any,
    targetProfile: ThemeProfile
  ): ThemeAnalysisResult['opportunities'] {
    const opportunities: ThemeAnalysisResult['opportunities'] = [];

    // Opportunity to strengthen themes
    if (thematicElements.identifiedThemes.length > 0) {
      opportunities.push({
        type: 'strengthen-theme',
        description: `Build upon identified themes: ${thematicElements.identifiedThemes.join(', ')}`,
        implementation: 'Add more thematic language, symbolism, or narrative elements'
      });
    }

    // Opportunity to add symbolism
    const unusedSymbols = Object.keys(targetProfile.coreElements.symbolism).filter(symbol =>
      !content.toLowerCase().includes(symbol.toLowerCase())
    );

    if (unusedSymbols.length > 0) {
      opportunities.push({
        type: 'add-symbolism',
        description: `Incorporate thematic symbolism: ${unusedSymbols.slice(0, 3).join(', ')}`,
        implementation: 'Weave symbolic elements naturally into descriptions and narrative'
      });
    }

    return opportunities;
  }

  private static calculateThemeScore(
    thematicElements: any,
    violations: ThemeAnalysisResult['violations'],
    targetProfile: ThemeProfile
  ): number {
    let score = 100;

    // Penalty for violations
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'major': score -= 25; break;
        case 'moderate': score -= 15; break;
        case 'minor': score -= 8; break;
      }
    });

    // Bonus for strong thematic support
    const themeSupport = thematicElements.identifiedThemes.length / targetProfile.coreElements.primaryThemes.length;
    score += Math.min(20, themeSupport * 20);

    return Math.max(0, Math.min(100, score));
  }

  private static calculateThematicAlignment(thematicElements: any, targetProfile: ThemeProfile) {
    const primaryThemeSupport = Math.min(100, 
      (thematicElements.identifiedThemes.length / targetProfile.coreElements.primaryThemes.length) * 100
    );

    const symbolismUsage = Math.min(100,
      (Object.keys(targetProfile.coreElements.symbolism).filter(symbol =>
        thematicElements.supportingElements.some((el: string) => el.includes(symbol))
      ).length / Object.keys(targetProfile.coreElements.symbolism).length) * 100
    );

    return {
      primaryThemeSupport,
      symbolismUsage,
      archetypeConsistency: 75, // Simplified
      atmosphericMatch: 80 // Simplified
    };
  }
}

// ============================================================================
// COMBINED TONE/THEME ANALYZER
// ============================================================================

export class ToneThemeConsistencyChecker {
  private toneProfile: ToneProfile | null = null;
  private themeProfile: ThemeProfile | null = null;

  constructor(toneProfileId?: string, themeProfileId?: string) {
    if (toneProfileId) {
      this.toneProfile = ToneProfileLibrary.getProfile(toneProfileId);
    }
    if (themeProfileId) {
      this.themeProfile = ThemeProfileLibrary.getProfile(themeProfileId);
    }

    // Initialize libraries
    ToneProfileLibrary.initialize();
    ThemeProfileLibrary.initialize();
  }

  setToneProfile(profileId: string): boolean {
    this.toneProfile = ToneProfileLibrary.getProfile(profileId);
    return this.toneProfile !== null;
  }

  setThemeProfile(profileId: string): boolean {
    this.themeProfile = ThemeProfileLibrary.getProfile(profileId);
    return this.themeProfile !== null;
  }

  analyzeContent(content: string): CombinedConsistencyReport {
    if (!this.toneProfile || !this.themeProfile) {
      throw new Error('Both tone and theme profiles must be set before analysis');
    }

    const toneAnalysis = ToneAnalyzer.analyzeContent(content, this.toneProfile);
    const themeAnalysis = ThemeAnalyzer.analyzeContent(content, this.themeProfile);

    const overallScore = (toneAnalysis.overallScore + themeAnalysis.overallScore) / 2;
    const passed = overallScore >= 70 && 
                   toneAnalysis.violations.filter(v => v.severity === 'major').length === 0 &&
                   themeAnalysis.violations.filter(v => v.severity === 'major').length === 0;

    const integratedViolations = this.identifyIntegratedViolations(toneAnalysis, themeAnalysis);
    const recommendations = this.generateIntegratedRecommendations(toneAnalysis, themeAnalysis);

    return {
      overall: {
        score: overallScore,
        passed,
        toneConsistency: toneAnalysis.overallScore,
        themeConsistency: themeAnalysis.overallScore
      },
      toneAnalysis,
      themeAnalysis,
      integratedViolations,
      recommendations
    };
  }

  private identifyIntegratedViolations(
    toneAnalysis: ToneAnalysisResult,
    themeAnalysis: ThemeAnalysisResult
  ) {
    const integrated: CombinedConsistencyReport['integratedViolations'] = [];

    // Check for tone-theme conflicts
    if (this.toneProfile?.characteristics.emotionalTone === 'dark' && 
        themeAnalysis.thematicElements.identifiedThemes.includes('heroism')) {
      integrated.push({
        type: 'tone-theme-conflict',
        severity: 'moderate',
        description: 'Dark emotional tone conflicts with heroic themes',
        suggestedFix: 'Either soften the dark tone or focus on darker heroic themes like sacrifice',
        affects: ['tone', 'theme']
      });
    }

    return integrated;
  }

  private generateIntegratedRecommendations(
    toneAnalysis: ToneAnalysisResult,
    themeAnalysis: ThemeAnalysisResult
  ) {
    return {
      immediate: [
        ...toneAnalysis.violations.filter(v => v.severity === 'major').map(v => v.suggestedFix),
        ...themeAnalysis.violations.filter(v => v.severity === 'major').map(v => v.suggestedFix)
      ],
      longTerm: [
        ...toneAnalysis.recommendations,
        ...themeAnalysis.opportunities.map(o => o.implementation)
      ],
      optional: [
        'Consider developing a style guide for consistent tone and theme application',
        'Build a library of approved language patterns for future use'
      ]
    };
  }

  getAvailableProfiles() {
    return {
      toneProfiles: ToneProfileLibrary.getAllProfiles(),
      themeProfiles: ThemeProfileLibrary.getAllProfiles()
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ToneThemeConsistencyChecker;