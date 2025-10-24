// Mythwright Content Generation Orchestrator - Automated Story Generation Pipeline
import { AIService } from './index.js';

// ============================================================================
// XP BUDGET CALCULATOR  
// ============================================================================

class XPBudgetCalculator {
  static calculateBudget(parameters) {
    const levelRanges = {
      low: { min: 1, max: 5, avgLevel: 3 },
      mid: { min: 6, max: 10, avgLevel: 8 },
      high: { min: 11, max: 16, avgLevel: 13 },
      epic: { min: 17, max: 20, avgLevel: 18 }
    };

    const range = levelRanges[parameters.level];
    const baseXPPerSession = this.getXPPerSession(range.avgLevel, parameters.partySize);
    const totalXP = baseXPPerSession * parameters.sessionCount;

    // Adventure type influences pillar distribution
    const pillarWeights = this.getPillarWeights(parameters.adventureType);

    return {
      partySize: parameters.partySize,
      partyLevel: range.avgLevel,
      difficulty: this.getDifficultyFromComplexity(parameters.complexity),
      totalXPBudget: totalXP,
      sessionsPlanned: parameters.sessionCount,
      
      // Pillar distribution
      combatWeight: pillarWeights.combat,
      explorationWeight: pillarWeights.exploration,
      socialWeight: pillarWeights.social,
      
      // Budget allocations
      combatXP: Math.floor(totalXP * (pillarWeights.combat / 100)),
      explorationXP: Math.floor(totalXP * (pillarWeights.exploration / 100)),
      socialXP: Math.floor(totalXP * (pillarWeights.social / 100)),
      
      // Thematic elements
      tone: this.getToneFromTheme(parameters.theme),
      setting: parameters.theme,
      
      // Complexity scaling
      encounterComplexity: parameters.complexity,
      narrativeDepth: parameters.complexity
    };
  }

  static getXPPerSession(level, partySize) {
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

  static getPillarWeights(adventureType) {
    const weights = {
      dungeon: { combat: 50, exploration: 35, social: 15 },
      mystery: { combat: 25, exploration: 40, social: 35 },
      intrigue: { combat: 15, exploration: 25, social: 60 },
      wilderness: { combat: 40, exploration: 45, social: 15 },
      city: { combat: 30, exploration: 30, social: 40 },
      planar: { combat: 45, exploration: 40, social: 15 }
    };
    
    return weights[adventureType] || weights.dungeon;
  }

  static getDifficultyFromComplexity(complexity) {
    const mapping = {
      simple: 'Easy to Medium',
      moderate: 'Medium to Hard', 
      complex: 'Hard to Deadly'
    };
    
    return mapping[complexity] || 'Medium';
  }

  static getToneFromTheme(theme) {
    const toneMapping = {
      'classic-fantasy': 'Heroic Adventure',
      'dark-fantasy': 'Gothic Horror',
      'high-fantasy': 'Epic Heroism', 
      'steampunk': 'Industrial Adventure',
      'modern': 'Contemporary Action',
      'sci-fi': 'Space Opera'
    };
    
    return toneMapping[theme] || 'Heroic Adventure';
  }
}

// ============================================================================
// CONTENT GENERATION ORCHESTRATOR
// ============================================================================

export class ContentGenerationOrchestrator {
  constructor() {
    this.aiService = AIService.getInstance();
  }

  async generateCampaign(parameters) {
    console.log(`🎲 Starting campaign generation: "${parameters.title}"`);
    
    // Calculate XP budget and system design
    const xpBudget = XPBudgetCalculator.calculateBudget(parameters);
    
    // Generate campaign outline
    const outline = await this.generateCampaignOutline(parameters, xpBudget);
    
    // Generate content chapter by chapter
    const chapters = [];
    
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

  async generateCampaignOutline(parameters, xpBudget) {
    const prompt = `Create a detailed campaign outline for "${parameters.title}".

CAMPAIGN PARAMETERS:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Party Level: ${parameters.level}
- Sessions: ${parameters.sessionCount}
- Complexity: ${parameters.complexity}

XP BUDGET: ${xpBudget.totalXPBudget} total XP
- Combat (${xpBudget.combatWeight}%): ${xpBudget.combatXP} XP
- Exploration (${xpBudget.explorationWeight}%): ${xpBudget.explorationXP} XP
- Social (${xpBudget.socialWeight}%): ${xpBudget.socialXP} XP

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

  async generateChapter(chapterNumber, outline, parameters, xpBudget) {
    
    // Generate main chapter content
    const chapterContent = await this.generateChapterContent(chapterNumber, outline, parameters, xpBudget);
    
    // Generate encounters for this chapter (simplified for testing)
    const encounters = [];
    
    // Generate NPCs for this chapter (simplified for testing)
    const npcs = [];
    
    // Generate locations (simplified for testing)
    const locations = [];
    
    // Generate treasure/magic items (simplified for testing)
    const treasure = [];
    
    // Generate narrative boxes (simplified for testing)
    const narrativeBoxes = [];

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

  async generateChapterContent(chapterNumber, outline, parameters, xpBudget) {
    
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

    const content = response.content || {};
    return {
      title: content?.title || `Session ${chapterNumber}`,
      homebreweryMarkdown: this.formatAsHomebrewery(content, chapterNumber)
    };
  }

  formatAsHomebrewery(content, chapterNumber) {
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

  async generateAppendices(chapters, parameters, xpBudget) {
    const appendices = [];

    // Random tables appendix
    const tablesContent = await this.generateRandomTables(parameters, xpBudget);
    appendices.push({
      title: 'Appendix A: Random Tables',
      content: tablesContent,
      type: 'random-tables'
    });

    return appendices;
  }

  async generateRandomTables(parameters, xpBudget) {
    
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
    
    return response.content || `# Random Tables

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

  async generateHandouts(chapters, parameters) {
    const handouts = [];
    
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
        handouts.push(response.content || prompt);
      }
      
      await this.delay(500);
    }

    return handouts;
  }

  generateTableOfContents(chapters, appendices) {
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

  async generateCoverPage(parameters, xpBudget) {
    
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

  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ContentGenerationOrchestrator;