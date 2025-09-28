// Mythwright Content Generation Orchestrator - Automated Story Generation Pipeline
import type { 
  SystemDesignBudget, 
  StatBlock, 
  NPC, 
  MagicItem, 
  Encounter,
  NarrativeContent 
} from '../../types/content.types.js';
import { AIService } from './index.js';
import type { CampaignParameters } from './campaign-types.js';

// ============================================================================
// CONTENT GENERATION TYPES
// ============================================================================

export interface CampaignParameters {
  title: string;
  level: 'low' | 'mid' | 'high' | 'epic';
  adventureType: 'dungeon' | 'mystery' | 'intrigue' | 'wilderness' | 'city' | 'planar';
  theme: string;
  partySize: number;
  sessionCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  playerExperience?: 'beginner' | 'mixed' | 'experienced' | 'veteran';
  goals?: string[];
  budgetPreferences?: {
    combatWeight: number;
    explorationWeight: number;
    socialWeight: number;
    treasureLevel: 'minimal' | 'standard' | 'generous';
    difficultyVariance: 'consistent' | 'moderate' | 'dynamic';
  };
  budgetCalculation?: {
    totalXPBudget: number;
    xpPerSession: number;
    partyLevel: number;
    combatBudget: number;
    explorationBudget: number;
    socialBudget: number;
  };
  writingStyleRules?: string;
}

export interface GeneratedContent {
  title: string;
  coverPage: string;
  tableOfContents: string;
  chapters: GeneratedChapter[];
  appendices: GeneratedAppendix[];
  handouts: string[];
  metadata: {
    xpBudget: SystemDesignBudget;
    estimatedPlayTime: number;
    difficulty: string;
    generationTimestamp: Date;
  };
}

export interface GeneratedChapter {
  chapterNumber: number;
  title: string;
  content: string;
  encounters: Encounter[];
  npcs: NPC[];
  locations: LocationDescription[];
  treasure: MagicItem[];
  narrativeBoxes: NarrativeContent[];
}

export interface GeneratedAppendix {
  title: string;
  content: string;
  type: 'monsters' | 'magic-items' | 'maps' | 'handouts' | 'random-tables' | 'reference';
}

export interface LocationDescription {
  name: string;
  description: string;
  features: string[];
  encounters?: string[];
  secrets?: string[];
}

// ============================================================================
// XP BUDGET CALCULATOR  
// ============================================================================

class XPBudgetCalculator {
  static calculateBudget(parameters: CampaignParameters): SystemDesignBudget {
    const levelRanges = {
      low: { min: 1, max: 5, avgLevel: 3 },
      mid: { min: 6, max: 10, avgLevel: 8 },
      high: { min: 11, max: 16, avgLevel: 13 },
      epic: { min: 17, max: 20, avgLevel: 18 }
    };

    const range = levelRanges[parameters.level];
    const baseXPPerSession = this.getXPPerSession(range.avgLevel, parameters.partySize);
    const totalXP = baseXPPerSession * parameters.sessionCount;

    // Use enhanced budget preferences if available, otherwise fall back to adventure type defaults
    const pillarWeights = parameters.budgetPreferences ? {
      combat: parameters.budgetPreferences.combatWeight,
      exploration: parameters.budgetPreferences.explorationWeight,
      social: parameters.budgetPreferences.socialWeight
    } : this.getPillarWeights(parameters.adventureType);

    // Use calculated budget if available, otherwise calculate from session data
    const finalTotalXP = parameters.budgetCalculation?.totalXPBudget || totalXP;

    return {
      partySize: parameters.partySize,
      partyLevel: range.avgLevel,
      difficulty: this.getDifficultyFromComplexity(parameters.complexity),
      totalXPBudget: finalTotalXP,
      sessionsPlanned: parameters.sessionCount,
      
      // Pillar distribution (use enhanced preferences)
      combatWeight: pillarWeights.combat,
      explorationWeight: pillarWeights.exploration,
      socialWeight: pillarWeights.social,
      
      // Budget allocations
      combatXP: Math.floor(finalTotalXP * (pillarWeights.combat / 100)),
      explorationXP: Math.floor(finalTotalXP * (pillarWeights.exploration / 100)),
      socialXP: Math.floor(finalTotalXP * (pillarWeights.social / 100)),
      
      // Enhanced budget information
      treasureLevel: parameters.budgetPreferences?.treasureLevel || 'standard',
      difficultyVariance: parameters.budgetPreferences?.difficultyVariance || 'moderate',
      playerExperience: parameters.playerExperience || 'mixed',
      campaignGoals: parameters.goals || ['combat', 'exploration'],
      
      // Thematic elements
      tone: this.getToneFromTheme(parameters.theme),
      setting: parameters.theme,
      
      // Complexity scaling
      encounterComplexity: parameters.complexity,
      narrativeDepth: parameters.complexity
    };
  }

  private static getXPPerSession(level: number, partySize: number): number {
    // Base XP per level (medium encounter difficulty per player)
    const xpByLevel = [
      25, 50, 75, 125, 250, 300, 350, 450, 550, 600,
      800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800
    ];
    
    const baseXP = xpByLevel[level - 1] || 1000;
    
    // 3-5 encounters per session, varying difficulty
    const encountersPerSession = 4;
    const difficultyMultiplier = 1.2; // Mix of easy, medium, hard
    
    return Math.floor(baseXP * partySize * encountersPerSession * difficultyMultiplier);
  }

  private static getPillarWeights(adventureType: string) {
    const weights = {
      dungeon: { combat: 50, exploration: 35, social: 15 },
      mystery: { combat: 25, exploration: 40, social: 35 },
      intrigue: { combat: 15, exploration: 25, social: 60 },
      wilderness: { combat: 40, exploration: 45, social: 15 },
      city: { combat: 30, exploration: 30, social: 40 },
      planar: { combat: 45, exploration: 40, social: 15 }
    };
    
    return weights[adventureType as keyof typeof weights] || weights.dungeon;
  }

  private static getDifficultyFromComplexity(complexity: string): string {
    const mapping = {
      simple: 'Easy to Medium',
      moderate: 'Medium to Hard', 
      complex: 'Hard to Deadly'
    };
    
    return mapping[complexity as keyof typeof mapping] || 'Medium';
  }

  private static getToneFromTheme(theme: string): string {
    const toneMapping = {
      'classic-fantasy': 'Heroic Adventure',
      'dark-fantasy': 'Gothic Horror',
      'high-fantasy': 'Epic Heroism', 
      'steampunk': 'Industrial Adventure',
      'modern': 'Contemporary Action',
      'sci-fi': 'Space Opera'
    };
    
    return toneMapping[theme as keyof typeof toneMapping] || 'Heroic Adventure';
  }
}

// ============================================================================
// CONTENT GENERATION ORCHESTRATOR
// ============================================================================

export class ContentGenerationOrchestrator {
  private aiService: AIService;

  constructor() {
    this.aiService = AIService.getInstance();
  }

  async generateCampaign(parameters: CampaignParameters): Promise<GeneratedContent> {
    console.log(`🎲 Starting campaign generation: "${parameters.title}"`);
    
    // Calculate XP budget and system design
    const xpBudget = XPBudgetCalculator.calculateBudget(parameters);
    
    // Generate campaign outline
    const outline = await this.generateCampaignOutline(parameters, xpBudget);
    
    // Generate content chapter by chapter
    const chapters: GeneratedChapter[] = [];
    
    for (let i = 0; i < parameters.sessionCount; i++) {
      console.log(`📖 Generating Chapter ${i + 1}/${parameters.sessionCount}`);
      const chapter = await this.generateChapter(i + 1, outline, parameters, xpBudget);
      chapters.push(chapter);
      
      // Small delay to prevent API rate limiting
      await this.delay(1000);
    }
    
    // Generate appendices
    const appendices = await this.generateAppendices(chapters, parameters, xpBudget);
    
    // Generate handouts
    const handouts = await this.generateHandouts(chapters, parameters);
    
    // Create table of contents
    const tableOfContents = this.generateTableOfContents(chapters, appendices);
    
    // Generate cover page
    const coverPage = await this.generateCoverPage(parameters, xpBudget);
    
    console.log(`✨ Campaign generation complete: "${parameters.title}"`);
    
    return {
      title: parameters.title,
      coverPage,
      tableOfContents,
      chapters,
      appendices,
      handouts,
      metadata: {
        xpBudget,
        estimatedPlayTime: parameters.sessionCount * 4, // 4 hours per session
        difficulty: xpBudget.difficulty,
        generationTimestamp: new Date()
      }
    };
  }

  private async generateCampaignOutline(
    parameters: CampaignParameters, 
    xpBudget: SystemDesignBudget
  ): Promise<any> {
    // Load writing style rules if provided
    let styleGuidance = '';
    if (parameters.writingStyleRules) {
      try {
        const fs = await import('fs');
        const styleRules = JSON.parse(fs.readFileSync(parameters.writingStyleRules.replace('/server', 'server'), 'utf8'));
        styleGuidance = `
WRITING STYLE GUIDANCE:
Follow the D&D 5e writing patterns established in the style rules. Key principles:
- Narrative Voice: Use ${styleRules.dnd5e_writing_style_rules.narrative_voice.tone_patterns.adventure_neutral.description}
- Structure: ${styleRules.dnd5e_writing_style_rules.structural_patterns.location_descriptions.opening_technique}
- Descriptive Focus: ${styleRules.dnd5e_writing_style_rules.descriptive_techniques.sensory_hierarchy.primary}
- Player Experience Level: ${parameters.playerExperience || 'mixed'} - adjust complexity accordingly
- Campaign Goals: Focus on ${(parameters.goals || ['combat', 'exploration']).join(', ')}
`;
      } catch (error) {
        console.warn('Could not load writing style rules:', error.message);
      }
    }

    const prompt = `Create a detailed campaign outline for "${parameters.title}".

CAMPAIGN PARAMETERS:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Party Level: ${parameters.level} (Average Level ${xpBudget.partyLevel})
- Sessions: ${parameters.sessionCount}
- Complexity: ${parameters.complexity}
- Player Experience: ${parameters.playerExperience || 'mixed'}
- Campaign Goals: ${(parameters.goals || ['combat', 'exploration']).join(', ')}

XP BUDGET: ${xpBudget.totalXPBudget} total XP
- Combat (${xpBudget.combatWeight}%): ${xpBudget.combatXP} XP
- Exploration (${xpBudget.explorationWeight}%): ${xpBudget.explorationXP} XP
- Social (${xpBudget.socialWeight}%): ${xpBudget.socialXP} XP
- Treasure Level: ${xpBudget.treasureLevel}
- Difficulty Variance: ${xpBudget.difficultyVariance}

${styleGuidance}

Generate a cohesive story arc with:
1. Main plot hook and central conflict
2. Chapter-by-chapter breakdown with session goals
3. Key NPCs and their motivations
4. Major locations and their significance
5. Escalating threats and challenges
6. Satisfying climax and resolution

Return as JSON with detailed structure.`;

    const response = await this.aiService.generateContent({
      type: 'custom',
      prompt,
      context: { systemBudget: xpBudget }
    });

    return response.content || {};
  }

  private async generateChapter(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<GeneratedChapter> {
    
    // Generate main chapter content
    const chapterContent = await this.generateChapterContent(chapterNumber, outline, parameters, xpBudget);
    
    // Generate encounters for this chapter
    const encounters = await this.generateChapterEncounters(chapterNumber, outline, parameters, xpBudget);
    
    // Generate NPCs for this chapter
    const npcs = await this.generateChapterNPCs(chapterNumber, outline, parameters, xpBudget);
    
    // Generate locations
    const locations = await this.generateChapterLocations(chapterNumber, outline, parameters);
    
    // Generate treasure/magic items
    const treasure = await this.generateChapterTreasure(chapterNumber, outline, parameters, xpBudget);
    
    // Generate narrative boxes
    const narrativeBoxes = await this.generateNarrativeBoxes(chapterNumber, outline, parameters);

    return {
      chapterNumber,
      title: `Chapter ${chapterNumber}: ${chapterContent.title}`,
      content: chapterContent.homebreweryMarkdown,
      encounters,
      npcs,
      locations,
      treasure,
      narrativeBoxes
    };
  }

  private async generateChapterContent(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<{ title: string; homebreweryMarkdown: string }> {
    
    const prompt = `Generate Chapter ${chapterNumber} content for "${parameters.title}".

Use proper Homebrewery markdown formatting with:
- Chapter heading: # Chapter ${chapterNumber}: [Title]
- Descriptive boxed text: {{descriptive}} blocks for read-aloud sections
- Note boxes: {{note}} for DM information
- Page breaks: \\page where appropriate
- Column breaks: \\column for layout
- Proper section headers: ## and ###

Include:
1. Opening scene with descriptive boxed text
2. Key locations with room descriptions
3. Important NPCs with motivations
4. Plot advancement opportunities
5. Skill challenge suggestions
6. Transition to next chapter

Adventure Type: ${parameters.adventureType}
Theme: ${parameters.theme}
Session Goals: [Based on outline chapter ${chapterNumber}]

Format as professional Homebrewery content ready for play.`;

    const response = await this.aiService.generateContent({
      type: 'description',
      prompt,
      context: { systemBudget: xpBudget }
    });

    const content = response.content as any;
    return {
      title: content?.title || `Session ${chapterNumber}`,
      homebreweryMarkdown: this.formatAsHomebrewery(content, chapterNumber)
    };
  }

  private formatAsHomebrewery(content: any, chapterNumber: number): string {
    return `# Chapter ${chapterNumber}: ${content?.title || 'Adventure Continues'}

{{descriptive
${content?.readAloudText || content?.description || 'The adventure continues as our heroes face new challenges...'}
}}

${content?.description || ''}

{{note
##### DM Notes
- Adjust difficulty based on party performance
- Use environmental details to enhance immersion
- Encourage creative problem solving
}}

\\page`;
  }

  private async generateChapterEncounters(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<Encounter[]> {
    
    // Calculate encounters per chapter
    const encountersPerChapter = Math.max(2, Math.floor(xpBudget.combatXP / parameters.sessionCount / 500));
    const encounters: Encounter[] = [];

    for (let i = 0; i < encountersPerChapter; i++) {
      const prompt = `Create encounter ${i + 1} for Chapter ${chapterNumber} of "${parameters.title}".

ENCOUNTER CONTEXT:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Party Level: ${xpBudget.partyLevel}
- Party Size: ${xpBudget.partySize}

REQUIREMENTS:
- Appropriate challenge rating for party
- Thematic consistency with ${parameters.theme}
- Environmental hazards or unique mechanics
- Clear victory conditions
- Treasure/XP rewards
- Scaling suggestions for different party sizes

Generate complete encounter with creatures, tactics, environment, and rewards.`;

      const response = await this.aiService.generateEncounter(prompt, { systemBudget: xpBudget });
      
      if (response.success && response.content) {
        encounters.push(response.content as Encounter);
      }
      
      await this.delay(500);
    }

    return encounters;
  }

  private async generateChapterNPCs(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<NPC[]> {
    
    const npcsPerChapter = Math.max(2, Math.floor(parameters.sessionCount / 2) + 1);
    const npcs: NPC[] = [];

    for (let i = 0; i < npcsPerChapter; i++) {
      const prompt = `Create NPC ${i + 1} for Chapter ${chapterNumber} of "${parameters.title}".

NPC CONTEXT:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Role: ${i === 0 ? 'Major plot-relevant NPC' : 'Supporting character or quest giver'}

REQUIREMENTS:
- Clear motivation and goals
- Memorable personality traits
- Relevant background for ${parameters.theme} setting
- Specific dialogue examples
- Plot hooks or information they provide
- Visual description for players

Create a fully detailed NPC ready for roleplay.`;

      const response = await this.aiService.generateNPC(prompt, { systemBudget: xpBudget });
      
      if (response.success && response.content) {
        npcs.push(response.content as NPC);
      }
      
      await this.delay(500);
    }

    return npcs;
  }

  private async generateChapterLocations(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters
  ): Promise<LocationDescription[]> {
    
    const prompt = `Create 3-5 key locations for Chapter ${chapterNumber} of "${parameters.title}".

LOCATION REQUIREMENTS:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Include specific room/area descriptions
- Environmental features and hazards
- Hidden secrets or interactive elements
- Atmospheric details for immersion

Format as location descriptions ready for DM use.`;

    const response = await this.aiService.generateDescription(prompt);
    
    // Parse response into location objects
    const locations: LocationDescription[] = [];
    
    if (response.success && response.content) {
      const content = response.content as any;
      // This would need proper parsing logic based on actual response format
      for (let i = 1; i <= 3; i++) {
        locations.push({
          name: `Location ${i}`,
          description: content.description || 'A mysterious location awaits exploration.',
          features: ['Environmental feature 1', 'Interactive element'],
          encounters: ['Potential encounter'],
          secrets: ['Hidden secret']
        });
      }
    }

    return locations;
  }

  private async generateChapterTreasure(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<MagicItem[]> {
    
    const itemsPerChapter = Math.max(1, Math.floor(parameters.sessionCount / 3));
    const items: MagicItem[] = [];

    for (let i = 0; i < itemsPerChapter; i++) {
      const prompt = `Create magic item ${i + 1} for Chapter ${chapterNumber} of "${parameters.title}".

ITEM REQUIREMENTS:
- Appropriate rarity for level ${xpBudget.partyLevel}
- Thematic consistency with ${parameters.theme}
- Interesting mechanical effects
- Rich lore and backstory
- Clear usage instructions

Generate a complete magic item with full description and mechanics.`;

      const response = await this.aiService.generateMagicItem(prompt, { systemBudget: xpBudget });
      
      if (response.success && response.content) {
        items.push(response.content as MagicItem);
      }
      
      await this.delay(500);
    }

    return items;
  }

  private async generateNarrativeBoxes(
    chapterNumber: number,
    outline: any,
    parameters: CampaignParameters
  ): Promise<NarrativeContent[]> {
    
    const prompt = `Create 3-4 narrative boxed text sections for Chapter ${chapterNumber} of "${parameters.title}".

NARRATIVE REQUIREMENTS:
- Read-aloud text for key moments
- Atmospheric descriptions
- Character interaction scenes
- Plot revelation moments
- Theme: ${parameters.theme}
- Adventure Type: ${parameters.adventureType}

Format as boxed text ready for Homebrewery {{descriptive}} blocks.`;

    const response = await this.aiService.generateNarrative(prompt);
    
    const narratives: NarrativeContent[] = [];
    
    if (response.success && response.content) {
      // Parse and format narrative content
      for (let i = 1; i <= 3; i++) {
        narratives.push({
          type: 'descriptive',
          title: `Scene ${i}`,
          content: 'A moment of tension fills the air as our heroes face the unknown...',
          readAloudText: 'The flickering torchlight casts long shadows down the ancient corridor...'
        } as NarrativeContent);
      }
    }

    return narratives;
  }

  private async generateAppendices(
    chapters: GeneratedChapter[],
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<GeneratedAppendix[]> {
    
    const appendices: GeneratedAppendix[] = [];

    // Monsters appendix
    const allEncounters = chapters.flatMap(c => c.encounters);
    if (allEncounters.length > 0) {
      appendices.push({
        title: 'Appendix A: Monsters',
        content: this.formatMonstersAppendix(allEncounters),
        type: 'monsters'
      });
    }

    // Magic items appendix
    const allItems = chapters.flatMap(c => c.treasure);
    if (allItems.length > 0) {
      appendices.push({
        title: 'Appendix B: Magic Items',
        content: this.formatMagicItemsAppendix(allItems),
        type: 'magic-items'
      });
    }

    // Random tables appendix
    const tablesContent = await this.generateRandomTables(parameters, xpBudget);
    appendices.push({
      title: 'Appendix C: Random Tables',
      content: tablesContent,
      type: 'random-tables'
    });

    return appendices;
  }

  private formatMonstersAppendix(encounters: Encounter[]): string {
    return `# Appendix A: Monsters

This appendix contains all the creature stat blocks used in this adventure.

\\page

${encounters.map(encounter => 
  encounter.creatures?.map(creature => 
    `## ${creature.name}\n\n*[Stat block would be here]*\n\n`
  ).join('') || ''
).join('')}`;
  }

  private formatMagicItemsAppendix(items: MagicItem[]): string {
    return `# Appendix B: Magic Items

This appendix details all magical items found in this adventure.

${items.map(item => 
  `## ${item.name}\n*${item.rarity}, ${item.type}*\n\n${item.description}\n\n`
).join('')}`;
  }

  private async generateRandomTables(
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<string> {
    
    const prompt = `Create useful random tables for "${parameters.title}".

TABLES NEEDED:
- Random encounters table (1d20)
- NPC personality traits (1d10)
- Environmental complications (1d12)
- Treasure variations (1d8)
- Plot complications (1d6)

Theme: ${parameters.theme}
Adventure Type: ${parameters.adventureType}

Format as proper Homebrewery tables with dice notation.`;

    const response = await this.aiService.generateRandomTable(prompt);
    
    return response.content as string || `# Random Tables

## Random Encounters
| d20 | Encounter |
|:---:|:----------|
| 1-5 | Wandering monsters |
| 6-10 | Environmental hazard |
| 11-15 | Friendly NPC |
| 16-20 | Discovery |

## NPC Personality Traits
| d10 | Trait |
|:---:|:------|
| 1 | Nervous and twitchy |
| 2 | Overly confident |
| 3 | Speaks in riddles |
| 4 | Has a distinctive laugh |
| 5 | Always hungry |
| 6 | Forgetful |
| 7 | Suspicious of everyone |
| 8 | Tells terrible jokes |
| 9 | Hums constantly |
| 10 | Collects unusual items |`;
  }

  private async generateHandouts(
    chapters: GeneratedChapter[],
    parameters: CampaignParameters
  ): Promise<string[]> {
    
    const handouts: string[] = [];
    
    // Generate a few key handouts
    const handoutPrompts = [
      'A mysterious letter that starts the adventure',
      'An ancient map with cryptic markings',
      'A journal entry revealing important backstory'
    ];

    for (const prompt of handoutPrompts) {
      const response = await this.aiService.generateDescription(
        `Create a handout: ${prompt}. Theme: ${parameters.theme}. Format as in-world document.`
      );
      
      if (response.success) {
        handouts.push(response.content as string || prompt);
      }
      
      await this.delay(500);
    }

    return handouts;
  }

  private generateTableOfContents(chapters: GeneratedChapter[], appendices: GeneratedAppendix[]): string {
    let toc = `{{wide,toc
# Table of Contents

`;

    chapters.forEach((chapter, index) => {
      toc += `- **${chapter.title}** ${(index + 1) * 2}\n`;
    });

    toc += `\n`;

    appendices.forEach((appendix, index) => {
      const pageNum = (chapters.length * 2) + (index * 3) + 2;
      toc += `- **${appendix.title}** ${pageNum}\n`;
    });

    toc += `}}`;

    return toc;
  }

  private async generateCoverPage(
    parameters: CampaignParameters,
    xpBudget: SystemDesignBudget
  ): Promise<string> {
    
    return `{{frontCover}}

# ${parameters.title}

## A ${parameters.theme} Adventure for ${xpBudget.partyLevel}${this.getOrdinalSuffix(xpBudget.partyLevel)}-Level Characters

*An adventure for ${parameters.sessionCount} session${parameters.sessionCount > 1 ? 's' : ''} designed for ${xpBudget.partySize} players*

---

*Generated by Mythwright AI*

{{logo}}

{{frontCoverBottomBanner}}

{{/frontCover}}`;
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  private generateTableOfContents(chapters: GeneratedChapter[], appendices: GeneratedAppendix[]): string {
    return this.generateTableOfContents(chapters, appendices);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ContentGenerationOrchestrator;