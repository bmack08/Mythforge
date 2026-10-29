// Mythwright Content Generation Orchestrator - Automated Story Generation Pipeline
import { AIService } from './index.js';

// ============================================================================
// CONFIG
// ============================================================================

// The campaign wizard sends `campaignLength` (an id), NOT a numeric
// `sessionCount`. Map it here so the chapter loop and cover page have a real
// number. (Mirror of CAMPAIGN_LENGTHS in client campaignWizard.jsx.)
const LENGTH_TO_SESSIONS = {
  oneshot: 1,
  short: 4,
  medium: 10,
  long: 20,
  epic: 40
};

// Hard cap on generated chapters. Each chapter is one AI call; an "epic"
// (40 sessions) would otherwise fire 40 calls. Cap keeps generation cost and
// time bounded; chapters beyond this are summarized in the outline rather than
// fully written. Override with MYTHWRIGHT_MAX_CHAPTERS.
const MAX_CHAPTERS = parseInt(process.env.MYTHWRIGHT_MAX_CHAPTERS || '8', 10);

// Resolve a usable session count from whatever the request provided.
function resolveSessionCount(parameters) {
  // Explicit numeric sessionCount wins, then campaignLength id, then default.
  const explicit = parseInt(parameters.sessionCount, 10);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const mapped = LENGTH_TO_SESSIONS[parameters.campaignLength];
  if (mapped) return mapped;
  return 4; // sensible default (short arc)
}

// System prompt for NARRATIVE content (outline, chapters, tables, handouts).
// The default provider system prompt (buildSystemPrompt) forces "always respond
// with valid JSON", which fights our need for ready-to-render Homebrewery
// markdown. We pass this via context.customSystemPrompt + skipDefaultSystemPrompt
// + responseFormat:'text' so the model returns clean markdown, not JSON.
const MARKDOWN_SYSTEM_PROMPT = `You are an expert D&D 5e adventure writer producing content for The Homebrewery (a Markdown-to-PHB renderer). Output ONLY ready-to-render Homebrewery Markdown — no JSON, no code fences, no preamble, no commentary, no explanations.

Use these Homebrewery constructs:
- Headings: "# Title", "## Section", "### Subsection".
- Read-aloud / boxed text: a {{descriptive}} block, e.g.
  {{descriptive
  The boxed text players hear, in italicized prose.
  }}
- DM-only guidance: a {{note}} block, e.g.
  {{note
  ##### DM Note
  Guidance for the DM.
  }}
- Tables: real Markdown pipe tables with a header row and a |:---:| separator row. Never output a table as JSON.
- Stat blocks: a {{monster,frame}} block with the standard 5e fields and "::" leader lines.
- Page breaks: "\\page" between major sections.

Rules:
- SRD-safe only — never use Product Identity names (use "gaze tyrant", not "beholder").
- Write complete, runnable content with concrete names, DCs, and read-aloud text.
- Begin chapter content with its own "# Chapter N: <Title>" heading.`;

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
    // Normalize the session count BEFORE anything reads it (XP budget, cover
    // page, and the chapter loop all depend on it). This is the root fix for
    // "0 chapters" + "undefined session": the request carries `campaignLength`,
    // not a numeric `sessionCount`.
    const sessionCount = resolveSessionCount(parameters);
    const chapterCount = Math.min(sessionCount, MAX_CHAPTERS);
    parameters.sessionCount = sessionCount; // propagate to sub-methods
    if (sessionCount > chapterCount) {
      console.warn(`⚠️ Session count ${sessionCount} exceeds MAX_CHAPTERS (${MAX_CHAPTERS}); generating ${chapterCount} chapters.`);
    }
    console.log(`🎲 Starting campaign generation: "${parameters.title}" (${chapterCount} chapters)`);

    // Calculate XP budget and system design
    const xpBudget = XPBudgetCalculator.calculateBudget(parameters);

    // Generate campaign outline
    const outline = await this.generateCampaignOutline(parameters, xpBudget);

    // Generate content chapter by chapter
    const chapters = [];

    for (let i = 0; i < chapterCount; i++) {
      console.log(`📖 Generating Chapter ${i + 1}/${chapterCount}`);
      const chapter = await this.generateChapter(i + 1, outline, parameters, xpBudget);
      chapters.push(chapter);

      // Small delay to prevent API rate limiting
      await this.delay(1000);
    }

    if (chapters.length === 0) {
      // Fail loud rather than returning an empty-but-"successful" book.
      throw new Error('Campaign generation produced 0 chapters — check sessionCount/campaignLength mapping.');
    }
    
    // Generate appendices (random tables + player handouts, folded in)
    const appendices = await this.generateAppendices(chapters, parameters, xpBudget);

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
      metadata: {
        xpBudget,
        estimatedPlayTime: parameters.sessionCount * 4, // 4 hours per session
        difficulty: xpBudget.difficulty,
        generationTimestamp: new Date()
      }
    };
  }

  async generateCampaignOutline(parameters, xpBudget) {
    let prompt = `Create a detailed campaign outline for "${parameters.title}".

CAMPAIGN PARAMETERS:
- Adventure Type: ${parameters.adventureType}
- Theme: ${parameters.theme}
- Party Level: ${parameters.level}
- Sessions: ${parameters.sessionCount}
- Complexity: ${parameters.complexity}
${parameters.tone ? `- Tone: ${parameters.tone}` : ''}

XP BUDGET: ${xpBudget.totalXPBudget} total XP
- Combat (${xpBudget.combatWeight}%): ${xpBudget.combatXP} XP
- Exploration (${xpBudget.explorationWeight}%): ${xpBudget.explorationXP} XP
- Social (${xpBudget.socialWeight}%): ${xpBudget.socialXP} XP

Generate a cohesive story arc with:
1. Main plot hook and central conflict
2. A chapter-by-chapter breakdown (one bullet per chapter, with its session goal)
3. Key NPCs and their motivations
4. Major locations and their significance
5. Escalating threats and challenges
6. Satisfying climax and resolution

Write it as a tight planning outline in plain Markdown (headings + bullets). This is an internal planning brief that will guide chapter writing — keep it concise.`;

    // Include DM's reference materials as additional context
    if (parameters.referenceContext) {
      prompt += `\n\nREFERENCE MATERIALS FROM THE DM:
The following content was provided by the DM as background material. Use it to inform the campaign's world, characters, plot elements, and tone. Incorporate relevant details naturally.
${parameters.referenceContext}`;
    }

    const response = await this.aiService.generateContent({
      type: 'description',
      prompt,
      context: {
        systemBudget: xpBudget,
        customSystemPrompt: MARKDOWN_SYSTEM_PROMPT,
        skipDefaultSystemPrompt: true,
        responseFormat: 'text'
      }
    });

    if (!response.success) {
      throw new Error(`Campaign outline generation failed: ${response.error?.message || 'unknown error'}`);
    }

    // Always a markdown string now (responseFormat:'text').
    return typeof response.content === 'string' ? response.content : '';
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
    const prompt = `Write Chapter ${chapterNumber} of "${parameters.title}" as complete, ready-to-run Homebrewery Markdown.

Adventure Type: ${parameters.adventureType}
Theme: ${parameters.theme}${parameters.tone ? `\nTone: ${parameters.tone}` : ''}
Party: ${xpBudget.partySize} players, around level ${xpBudget.partyLevel}.

CAMPAIGN OUTLINE (follow this arc; write the portion for chapter ${chapterNumber}):
${outline || '(no outline available — invent a coherent chapter that fits the theme)'}

Include, in this order:
1. A "# Chapter ${chapterNumber}: <evocative title>" heading.
2. An opening {{descriptive}} read-aloud box.
3. Two to four keyed locations with "## " headings, each with sensory description and at least one DC'd skill check (e.g. "DC 14 Wisdom (Perception)").
4. At least one important NPC (name + motivation) in a {{note}} box.
5. At least one encounter or skill challenge with concrete numbers.
6. A short hook transitioning to the next chapter.

Output ONLY Homebrewery Markdown — no JSON, no code fences, no commentary.`;

    const response = await this.aiService.generateContent({
      type: 'description',
      prompt,
      context: {
        systemBudget: xpBudget,
        customSystemPrompt: MARKDOWN_SYSTEM_PROMPT,
        skipDefaultSystemPrompt: true,
        responseFormat: 'text'
      }
    });

    if (!response.success) {
      throw new Error(`Chapter ${chapterNumber} generation failed: ${response.error?.message || 'unknown error'}`);
    }

    const markdown = this.formatAsHomebrewery(response.content, chapterNumber);
    return {
      title: this.extractTitle(markdown, chapterNumber),
      homebreweryMarkdown: markdown
    };
  }

  // Use the AI's Homebrewery markdown DIRECTLY; only guarantee structure — a
  // chapter heading at the top and a trailing \page. (Previously this discarded
  // the AI output and emitted a generic template; that was the "no chapters"
  // bug's sibling — generic boilerplate instead of real content.)
  formatAsHomebrewery(markdown, chapterNumber) {
    let md = (typeof markdown === 'string' ? markdown : '').trim();

    // Defensive: strip a wrapping ```...``` code fence if the model added one
    // despite instructions (this was the raw-JSON-dump failure mode).
    const fence = md.match(/^```[a-z]*\s*([\s\S]*?)\s*```$/i);
    if (fence) md = fence[1].trim();

    if (!md) {
      // Fail-soft but VISIBLE — never silently emit a generic chapter.
      return `# Chapter ${chapterNumber}\n\n{{note\n##### Generation Note\nThis chapter returned empty from the AI and should be regenerated.\n}}\n\n\\page`;
    }

    // Guarantee a chapter heading on the first line.
    const firstLine = md.split('\n', 1)[0] || '';
    if (!/^#\s+chapter\s+\d+/i.test(firstLine)) {
      md = `# Chapter ${chapterNumber}\n\n${md}`;
    }

    // Guarantee a trailing page break between chapters.
    if (!/\\page\s*$/.test(md)) {
      md = `${md}\n\n\\page`;
    }
    return md;
  }

  extractTitle(markdown, chapterNumber) {
    const m = String(markdown || '').match(/^#\s+Chapter\s+\d+:\s*(.+)$/im);
    return m ? m[1].trim() : `Session ${chapterNumber}`;
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

    // Player handouts appendix (folded in here so it actually renders).
    const handoutsContent = await this.generateHandouts(parameters);
    if (handoutsContent) {
      appendices.push({
        title: 'Appendix B: Player Handouts',
        content: handoutsContent,
        type: 'handouts'
      });
    }

    return appendices;
  }

  async generateRandomTables(parameters, xpBudget) {
    const prompt = `Create useful random tables for "${parameters.title}" as Homebrewery Markdown pipe tables — NOT JSON.

Begin with a "# Appendix A: Random Tables" heading, then provide each table with a "## " heading, a header row, and a |:---:| separator row:
- Random Encounters (1d20)
- NPC Personality Traits (1d10)
- Environmental Complications (1d12)
- Treasure Variations (1d8)
- Plot Complications (1d6)

Theme: ${parameters.theme}
Adventure Type: ${parameters.adventureType}

Output ONLY Homebrewery Markdown tables.`;

    const response = await this.aiService.generateContent({
      type: 'description',
      prompt,
      context: {
        systemBudget: xpBudget,
        customSystemPrompt: MARKDOWN_SYSTEM_PROMPT,
        skipDefaultSystemPrompt: true,
        responseFormat: 'text'
      }
    });

    let md = (response.success && typeof response.content === 'string') ? response.content.trim() : '';
    const fence = md.match(/^```[a-z]*\s*([\s\S]*?)\s*```$/i);
    if (fence) md = fence[1].trim();

    if (!md) {
      console.warn('⚠️ Random tables generation failed/empty; using fallback tables.');
      md = `# Appendix A: Random Tables

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
    return md;
  }

  // Returns a single Homebrewery-markdown string of player handouts (each in a
  // {{descriptive}} box), or '' if none generated. Folded into the appendices by
  // generateAppendices so the content actually renders (previously these calls
  // were made but the result was never assembled into the document).
  async generateHandouts(parameters) {
    const handoutPrompts = [
      'A mysterious letter that helps kick off the adventure',
      'An ancient map page with cryptic markings (describe it as a labelled legend)',
      'A torn journal entry revealing important backstory'
    ];

    const sections = [];
    for (const p of handoutPrompts) {
      const response = await this.aiService.generateContent({
        type: 'description',
        prompt: `Write a single player handout: ${p}. Theme: ${parameters.theme}. It is an in-world document — write the ACTUAL in-world text only (no narration about it). Put a "### " title line, then the document text inside a {{descriptive}} box. Output only Homebrewery Markdown.`,
        context: {
          customSystemPrompt: MARKDOWN_SYSTEM_PROMPT,
          skipDefaultSystemPrompt: true,
          responseFormat: 'text'
        }
      });

      if (response.success && typeof response.content === 'string' && response.content.trim()) {
        let md = response.content.trim();
        const fence = md.match(/^```[a-z]*\s*([\s\S]*?)\s*```$/i);
        if (fence) md = fence[1].trim();
        sections.push(md);
      }
      await this.delay(500);
    }

    return sections.length ? `# Appendix B: Player Handouts\n\n${sections.join('\n\n')}` : '';
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