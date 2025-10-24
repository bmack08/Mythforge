// Mythwright Content Block System - Rich Content Types for Homebrewery Integration
import { z } from 'zod';
import { ContentBlockSchema, ContentBlockTypeSchema } from '../schemas/content.schemas.js';

// ============================================================================
// CONTENT BLOCK REGISTRY
// ============================================================================

export interface ContentBlockDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'text' | 'layout' | 'interactive' | 'media' | 'data';
  schema: z.ZodSchema;
  renderer: (content: unknown, metadata?: Record<string, unknown>) => string;
  validator?: (content: unknown) => { isValid: boolean; errors: string[]; warnings: string[] };
  defaultContent: unknown;
  examples: Array<{
    name: string;
    description: string;
    content: unknown;
    metadata?: Record<string, unknown>;
  }>;
}

// ============================================================================
// TEXT CONTENT BLOCKS
// ============================================================================

export const TextBlockDefinition: ContentBlockDefinition = {
  type: 'text',
  name: 'Text Block',
  description: 'Standard text content with markdown support',
  icon: '📝',
  category: 'text',
  schema: z.object({
    content: z.string(),
    formatting: z.object({
      style: z.enum(['normal', 'italic', 'bold', 'emphasis']).default('normal'),
      alignment: z.enum(['left', 'center', 'right', 'justify']).default('left'),
      indentation: z.number().int().min(0).max(5).default(0),
    }).default({}),
  }),
  renderer: (content: any) => {
    const { content: text, formatting = {} } = content;
    let markdown = text;
    
    // Apply formatting
    if (formatting.style === 'italic') markdown = `*${markdown}*`;
    if (formatting.style === 'bold') markdown = `**${markdown}**`;
    if (formatting.style === 'emphasis') markdown = `***${markdown}***`;
    
    // Apply alignment (using HTML for Homebrewery)
    if (formatting.alignment === 'center') {
      markdown = `<div style="text-align: center">\n\n${markdown}\n\n</div>`;
    } else if (formatting.alignment === 'right') {
      markdown = `<div style="text-align: right">\n\n${markdown}\n\n</div>`;
    }
    
    // Apply indentation
    if (formatting.indentation > 0) {
      const indent = '  '.repeat(formatting.indentation);
      markdown = markdown.split('\n').map(line => `${indent}${line}`).join('\n');
    }
    
    return markdown;
  },
  defaultContent: {
    content: 'Enter your text here...',
    formatting: { style: 'normal', alignment: 'left', indentation: 0 }
  },
  examples: [
    {
      name: 'Basic Text',
      description: 'Simple paragraph text',
      content: {
        content: 'The ancient ruins stretch before you, shrouded in mist and mystery.',
        formatting: { style: 'normal', alignment: 'left', indentation: 0 }
      }
    },
    {
      name: 'Emphasized Text',
      description: 'Text with emphasis formatting',
      content: {
        content: 'This is critically important information!',
        formatting: { style: 'emphasis', alignment: 'center', indentation: 0 }
      }
    }
  ]
};

// ============================================================================
// BOXED TEXT CONTENT BLOCKS
// ============================================================================

export const BoxedTextBlockDefinition: ContentBlockDefinition = {
  type: 'boxedtext',
  name: 'Boxed Text',
  description: 'Highlighted text in a box (read-aloud text, quotes, etc.)',
  icon: '📦',
  category: 'text',
  schema: z.object({
    content: z.string(),
    title: z.string().optional(),
    style: z.enum(['default', 'descriptive', 'note', 'warning', 'quote']).default('default'),
    background: z.enum(['default', 'parchment', 'stone', 'wood', 'metal']).default('default'),
  }),
  renderer: (content: any) => {
    const { content: text, title, style = 'default', background = 'default' } = content;
    
    let boxClass = '';
    if (style === 'descriptive') boxClass = 'descriptive';
    if (style === 'note') boxClass = 'note';
    if (style === 'warning') boxClass = 'warning';
    
    let markdown = '';
    
    if (title) {
      markdown += `> ##### ${title}\n`;
    }
    
    // Split content into lines and add quote markers
    const lines = text.split('\n');
    lines.forEach(line => {
      markdown += `> ${line}\n`;
    });
    
    // Add custom styling if needed
    if (boxClass) {
      markdown = `<div class="${boxClass}">\n\n${markdown}\n</div>`;
    }
    
    return markdown;
  },
  defaultContent: {
    content: 'This is boxed text that will be highlighted for players.',
    title: '',
    style: 'default',
    background: 'default'
  },
  examples: [
    {
      name: 'Read-Aloud Text',
      description: 'Descriptive text for the DM to read to players',
      content: {
        content: 'You enter a vast chamber with towering pillars carved from black stone. Torchlight flickers against the walls, casting dancing shadows that seem to move with a life of their own.',
        title: 'Chamber Description',
        style: 'descriptive',
        background: 'default'
      }
    },
    {
      name: 'Warning Box',
      description: 'Important warning or caution for DMs',
      content: {
        content: 'Be careful with this encounter - it can easily become deadly if players are not prepared.',
        title: 'DM Warning',
        style: 'warning',
        background: 'default'
      }
    }
  ]
};

// ============================================================================
// SIDEBAR CONTENT BLOCKS
// ============================================================================

export const SidebarBlockDefinition: ContentBlockDefinition = {
  type: 'sidebar',
  name: 'Sidebar',
  description: 'Side content box with additional information',
  icon: '📋',
  category: 'layout',
  schema: z.object({
    title: z.string(),
    content: z.string(),
    position: z.enum(['left', 'right']).default('right'),
    width: z.enum(['narrow', 'normal', 'wide']).default('normal'),
    style: z.enum(['default', 'rules', 'lore', 'mechanics']).default('default'),
  }),
  renderer: (content: any) => {
    const { title, content: text, position = 'right', width = 'normal', style = 'default' } = content;
    
    let className = 'sidebar';
    if (position === 'left') className += ' sidebar-left';
    if (width === 'narrow') className += ' sidebar-narrow';
    if (width === 'wide') className += ' sidebar-wide';
    if (style !== 'default') className += ` sidebar-${style}`;
    
    let markdown = `<div class='${className}'>\n\n`;
    markdown += `##### ${title}\n\n`;
    markdown += `${text}\n\n`;
    markdown += `</div>`;
    
    return markdown;
  },
  defaultContent: {
    title: 'Sidebar Title',
    content: 'Additional information or rules clarification goes here.',
    position: 'right',
    width: 'normal',
    style: 'default'
  },
  examples: [
    {
      name: 'Rules Clarification',
      description: 'Sidebar explaining a complex rule',
      content: {
        title: 'Grappling Rules',
        content: 'When you want to grab a creature or wrestle with it, you can use the Attack action to make a special melee attack, a grapple...',
        position: 'right',
        width: 'normal',
        style: 'rules'
      }
    },
    {
      name: 'Lore Box',
      description: 'Additional world lore and background',
      content: {
        title: 'The Lost Kingdom',
        content: 'Long ago, this region was ruled by the mighty Kingdom of Aethros, whose magical prowess was unmatched...',
        position: 'left',
        width: 'wide',
        style: 'lore'
      }
    }
  ]
};

// ============================================================================
// TABLE CONTENT BLOCKS
// ============================================================================

export const TableBlockDefinition: ContentBlockDefinition = {
  type: 'table',
  name: 'Table',
  description: 'Data tables and random tables',
  icon: '📊',
  category: 'data',
  schema: z.object({
    title: z.string().optional(),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    tableType: z.enum(['data', 'random', 'lookup']).default('data'),
    diceColumn: z.number().int().min(0).optional(), // Which column contains dice ranges
    styling: z.object({
      bordered: z.boolean().default(true),
      striped: z.boolean().default(false),
      compact: z.boolean().default(false),
    }).default({}),
  }),
  validator: (content: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!content.headers || content.headers.length === 0) {
      errors.push('Table must have at least one header');
    }
    
    if (!content.rows || content.rows.length === 0) {
      warnings.push('Table has no data rows');
    }
    
    // Check that all rows have the same number of columns as headers
    content.rows?.forEach((row: string[], index: number) => {
      if (row.length !== content.headers.length) {
        warnings.push(`Row ${index + 1} has ${row.length} columns but expected ${content.headers.length}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },
  renderer: (content: any) => {
    const { title, headers, rows, tableType = 'data', styling = {} } = content;
    
    let markdown = '';
    
    if (title) {
      markdown += `##### ${title}\n`;
      if (tableType === 'random') {
        markdown += `*Roll a d${rows.length} or choose*\n\n`;
      }
    }
    
    // Create header row
    markdown += '|' + headers.join('|') + '|\n';
    
    // Create separator row
    const separators = headers.map((_, index) => {
      // Center align dice columns, left align others
      return content.diceColumn === index ? ':---:' : ':---|';
    });
    markdown += '|' + separators.join('|') + '|\n';
    
    // Add data rows
    rows.forEach((row: string[], index: number) => {
      // For random tables, add dice range if not provided
      if (tableType === 'random' && content.diceColumn === 0 && !row[0].match(/\d/)) {
        row[0] = `${index + 1}`;
      }
      markdown += '|' + row.join('|') + '|\n';
    });
    
    // Add styling classes if needed
    if (styling.compact || styling.striped) {
      const classes = [];
      if (styling.compact) classes.push('compact');
      if (styling.striped) classes.push('striped');
      markdown = `<div class="table ${classes.join(' ')}">\n\n${markdown}\n</div>`;
    }
    
    return markdown;
  },
  defaultContent: {
    title: 'Sample Table',
    headers: ['Column 1', 'Column 2'],
    rows: [
      ['Row 1, Col 1', 'Row 1, Col 2'],
      ['Row 2, Col 1', 'Row 2, Col 2']
    ],
    tableType: 'data',
    styling: { bordered: true, striped: false, compact: false }
  },
  examples: [
    {
      name: 'Random Encounter Table',
      description: 'A random table for generating encounters',
      content: {
        title: 'Forest Encounters',
        headers: ['d8', 'Encounter'],
        rows: [
          ['1-2', '1d4 wolves'],
          ['3-4', '1 brown bear'],
          ['5-6', '2d4 bandits'],
          ['7', '1 owlbear'],
          ['8', 'Friendly ranger']
        ],
        tableType: 'random',
        diceColumn: 0,
        styling: { bordered: true, striped: true, compact: false }
      }
    },
    {
      name: 'Equipment List',
      description: 'A data table showing equipment stats',
      content: {
        title: 'Weapons',
        headers: ['Name', 'Cost', 'Damage', 'Weight'],
        rows: [
          ['Shortsword', '10 gp', '1d6 piercing', '2 lb.'],
          ['Longsword', '15 gp', '1d8 slashing', '3 lb.'],
          ['Greatsword', '50 gp', '2d6 slashing', '6 lb.']
        ],
        tableType: 'data',
        styling: { bordered: true, striped: false, compact: true }
      }
    }
  ]
};

// ============================================================================
// STAT BLOCK CONTENT BLOCKS
// ============================================================================

export const StatBlockContentDefinition: ContentBlockDefinition = {
  type: 'statblock',
  name: 'Stat Block',
  description: 'D&D creature or NPC stat block',
  icon: '👹',
  category: 'data',
  schema: z.object({
    statBlockId: z.string().optional(), // Reference to StatBlock model
    inline: z.boolean().default(false), // Whether to render inline or as reference
    customData: z.object({
      name: z.string(),
      size: z.string(),
      type: z.string(),
      alignment: z.string(),
      armorClass: z.number(),
      hitPoints: z.number(),
      speed: z.string(),
      abilities: z.object({
        str: z.number(),
        dex: z.number(),
        con: z.number(),
        int: z.number(),
        wis: z.number(),
        cha: z.number(),
      }),
      challengeRating: z.union([z.number(), z.string()]),
    }).optional(),
  }),
  renderer: (content: any, metadata: any) => {
    const { statBlockId, inline = false, customData } = content;
    
    if (statBlockId && !inline) {
      // Reference to existing stat block
      return `{{statblock:${statBlockId}}}`;
    }
    
    if (!customData) {
      return '<!-- Stat block data missing -->';
    }
    
    const { name, size, type, alignment, armorClass, hitPoints, speed, abilities, challengeRating } = customData;
    
    // Calculate ability modifiers
    const getMod = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (score: number) => {
      const mod = getMod(score);
      return `${score} (${mod >= 0 ? '+' : ''}${mod})`;
    };
    
    let markdown = `___\n`;
    markdown += `> ## ${name}\n`;
    markdown += `> *${size} ${type}, ${alignment}*\n`;
    markdown += `> ___\n`;
    markdown += `> - **Armor Class** ${armorClass}\n`;
    markdown += `> - **Hit Points** ${hitPoints}\n`;
    markdown += `> - **Speed** ${speed}\n`;
    markdown += `> ___\n`;
    markdown += `> |STR|DEX|CON|INT|WIS|CHA|\n`;
    markdown += `> |:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    markdown += `> |${formatMod(abilities.str)}|${formatMod(abilities.dex)}|${formatMod(abilities.con)}|${formatMod(abilities.int)}|${formatMod(abilities.wis)}|${formatMod(abilities.cha)}|\n`;
    markdown += `> ___\n`;
    markdown += `> - **Challenge Rating** ${challengeRating}\n`;
    markdown += `> ___\n`;
    
    return markdown;
  },
  defaultContent: {
    inline: true,
    customData: {
      name: 'Sample Creature',
      size: 'Medium',
      type: 'humanoid',
      alignment: 'neutral',
      armorClass: 12,
      hitPoints: 11,
      speed: '30 ft.',
      abilities: { str: 10, dex: 14, con: 12, int: 10, wis: 13, cha: 11 },
      challengeRating: '1/4'
    }
  },
  examples: [
    {
      name: 'Basic Humanoid',
      description: 'A simple humanoid stat block',
      content: {
        inline: true,
        customData: {
          name: 'Guard',
          size: 'Medium',
          type: 'humanoid (human)',
          alignment: 'lawful neutral',
          armorClass: 16,
          hitPoints: 11,
          speed: '30 ft.',
          abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
          challengeRating: '1/8'
        }
      }
    }
  ]
};

// ============================================================================
// IMAGE CONTENT BLOCKS
// ============================================================================

export const ImageBlockDefinition: ContentBlockDefinition = {
  type: 'image',
  name: 'Image',
  description: 'Images, artwork, and visual content',
  icon: '🖼️',
  category: 'media',
  schema: z.object({
    src: z.string().url(),
    alt: z.string(),
    title: z.string().optional(),
    caption: z.string().optional(),
    layout: z.enum(['inline', 'float-left', 'float-right', 'center', 'full-width']).default('inline'),
    size: z.enum(['small', 'medium', 'large', 'original']).default('medium'),
    border: z.boolean().default(false),
    shadow: z.boolean().default(false),
  }),
  renderer: (content: any) => {
    const { src, alt, title, caption, layout = 'inline', size = 'medium', border = false, shadow = false } = content;
    
    let classes = ['image'];
    if (layout !== 'inline') classes.push(`image-${layout}`);
    if (size !== 'medium') classes.push(`image-${size}`);
    if (border) classes.push('image-border');
    if (shadow) classes.push('image-shadow');
    
    let markdown = '';
    
    if (layout === 'center') {
      markdown += `<div style="text-align: center">\n\n`;
    }
    
    markdown += `![${alt}](${src}`;
    if (title) markdown += ` "${title}"`;
    markdown += ')';
    
    if (classes.length > 1) {
      markdown = `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ''} class="${classes.join(' ')}" />`;
    }
    
    if (caption) {
      markdown += `\n\n*${caption}*`;
    }
    
    if (layout === 'center') {
      markdown += `\n\n</div>`;
    }
    
    return markdown;
  },
  defaultContent: {
    src: 'https://example.com/image.jpg',
    alt: 'Descriptive alt text',
    title: '',
    caption: '',
    layout: 'inline',
    size: 'medium',
    border: false,
    shadow: false
  },
  examples: [
    {
      name: 'Centered Artwork',
      description: 'Large centered image with caption',
      content: {
        src: 'https://example.com/dragon.jpg',
        alt: 'Ancient red dragon breathing fire',
        title: 'The Terror of Mount Doom',
        caption: 'The ancient red dragon Pyraxis guards his hoard jealously.',
        layout: 'center',
        size: 'large',
        border: true,
        shadow: true
      }
    },
    {
      name: 'Floating Portrait',
      description: 'Small portrait image floating right',
      content: {
        src: 'https://example.com/npc-portrait.jpg',
        alt: 'Portrait of Lady Blackthorne',
        title: 'Lady Blackthorne',
        caption: '',
        layout: 'float-right',
        size: 'small',
        border: true,
        shadow: false
      }
    }
  ]
};

// ============================================================================
// HANDOUT CONTENT BLOCKS
// ============================================================================

export const HandoutBlockDefinition: ContentBlockDefinition = {
  type: 'handout',
  name: 'Handout',
  description: 'Player handouts, letters, documents',
  icon: '📄',
  category: 'interactive',
  schema: z.object({
    title: z.string(),
    content: z.string(),
    handoutType: z.enum(['letter', 'document', 'map', 'note', 'journal', 'poster']).default('document'),
    style: z.enum(['parchment', 'paper', 'stone', 'metal', 'magical']).default('parchment'),
    aged: z.boolean().default(true),
    torn: z.boolean().default(false),
    stained: z.boolean().default(false),
    font: z.enum(['normal', 'handwritten', 'gothic', 'ancient']).default('normal'),
  }),
  renderer: (content: any) => {
    const { title, content: text, handoutType = 'document', style = 'parchment', aged = true, torn = false, stained = false, font = 'normal' } = content;
    
    let classes = ['handout', `handout-${handoutType}`, `handout-${style}`];
    if (aged) classes.push('handout-aged');
    if (torn) classes.push('handout-torn');
    if (stained) classes.push('handout-stained');
    if (font !== 'normal') classes.push(`handout-${font}`);
    
    let markdown = `<div class="${classes.join(' ')}">\n\n`;
    
    if (title) {
      markdown += `### ${title}\n\n`;
    }
    
    markdown += `${text}\n\n`;
    markdown += `</div>`;
    
    return markdown;
  },
  defaultContent: {
    title: 'Handout Title',
    content: 'This is a handout for players to read.',
    handoutType: 'document',
    style: 'parchment',
    aged: true,
    torn: false,
    stained: false,
    font: 'normal'
  },
  examples: [
    {
      name: 'Ancient Letter',
      description: 'An aged letter with handwritten font',
      content: {
        title: 'Letter from the Past',
        content: 'My dearest friend,\n\nI write to you in haste, for the shadows grow long and my time grows short. The artifact you seek lies hidden beneath the old oak, where we once played as children.\n\nMay the gods protect you,\n\nElara',
        handoutType: 'letter',
        style: 'parchment',
        aged: true,
        torn: true,
        stained: true,
        font: 'handwritten'
      }
    },
    {
      name: 'Official Decree',
      description: 'A formal government document',
      content: {
        title: 'Royal Proclamation',
        content: 'By order of His Majesty King Aldric the Third, all citizens are hereby commanded to report any suspicious magical activity to the nearest Crown representative immediately.\n\nFailure to comply will result in imprisonment.\n\n*Sealed with the Royal Seal*',
        handoutType: 'document',
        style: 'paper',
        aged: false,
        torn: false,
        stained: false,
        font: 'gothic'
      }
    }
  ]
};

// ============================================================================
// POSITION CONTENT BLOCKS (for layout)
// ============================================================================

export const PositionBlockDefinition: ContentBlockDefinition = {
  type: 'position',
  name: 'Position Block',
  description: 'Layout positioning and spacing control',
  icon: '📐',
  category: 'layout',
  schema: z.object({
    type: z.enum(['absolute', 'relative', 'fixed']).default('relative'),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    zIndex: z.number().optional(),
  }),
  renderer: (content: any) => {
    // Position blocks are typically handled by CSS, return empty for now
    return '';
  },
  defaultContent: {
    type: 'relative',
    x: 0,
    y: 0
  },
  examples: []
};

// ============================================================================
// CONTENT BLOCK REGISTRY
// ============================================================================

export const ContentBlockRegistry: Record<string, ContentBlockDefinition> = {
  text: TextBlockDefinition,
  boxedtext: BoxedTextBlockDefinition,
  sidebar: SidebarBlockDefinition,
  table: TableBlockDefinition,
  statblock: StatBlockContentDefinition,
  image: ImageBlockDefinition,
  handout: HandoutBlockDefinition,
  position: PositionBlockDefinition,
};

// ============================================================================
// CONTENT BLOCK UTILITIES
// ============================================================================

export class ContentBlockProcessor {
  static getBlockDefinition(type: string): ContentBlockDefinition | null {
    return ContentBlockRegistry[type] || null;
  }
  
  static validateBlock(type: string, content: unknown): { isValid: boolean; errors: string[]; warnings: string[] } {
    const definition = this.getBlockDefinition(type);
    if (!definition) {
      return { isValid: false, errors: [`Unknown block type: ${type}`], warnings: [] };
    }
    
    // Schema validation
    const schemaResult = definition.schema.safeParse(content);
    if (!schemaResult.success) {
      return {
        isValid: false,
        errors: schemaResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        warnings: []
      };
    }
    
    // Custom validation if provided
    if (definition.validator) {
      return definition.validator(content);
    }
    
    return { isValid: true, errors: [], warnings: [] };
  }
  
  static renderBlock(type: string, content: unknown, metadata?: Record<string, unknown>): string {
    const definition = this.getBlockDefinition(type);
    if (!definition) {
      return `<!-- Unknown block type: ${type} -->`;
    }
    
    // Validate first
    const validation = this.validateBlock(type, content);
    if (!validation.isValid) {
      return `<!-- Invalid ${type} block: ${validation.errors.join(', ')} -->`;
    }
    
    try {
      return definition.renderer(content, metadata);
    } catch (error) {
      console.error(`Error rendering ${type} block:`, error);
      return `<!-- Error rendering ${type} block -->`;
    }
  }
  
  static getAllBlockTypes(): string[] {
    return Object.keys(ContentBlockRegistry);
  }
  
  static getBlocksByCategory(category: string): ContentBlockDefinition[] {
    return Object.values(ContentBlockRegistry).filter(def => def.category === category);
  }
  
  static createDefaultBlock(type: string): { type: string; content: unknown; metadata: Record<string, unknown> } {
    const definition = this.getBlockDefinition(type);
    if (!definition) {
      throw new Error(`Unknown block type: ${type}`);
    }
    
    return {
      type,
      content: definition.defaultContent,
      metadata: {}
    };
  }
  
  static getBlockExamples(type: string): Array<{ name: string; description: string; content: unknown; metadata?: Record<string, unknown> }> {
    const definition = this.getBlockDefinition(type);
    return definition?.examples || [];
  }
}

// ============================================================================
// CONTENT BLOCK BUILDER
// ============================================================================

export class ContentBlockBuilder {
  private blocks: Array<{ id: string; type: string; content: unknown; metadata: Record<string, unknown> }> = [];
  
  addBlock(type: string, content?: unknown, metadata?: Record<string, unknown>): this {
    const definition = ContentBlockProcessor.getBlockDefinition(type);
    if (!definition) {
      throw new Error(`Unknown block type: ${type}`);
    }
    
    const blockContent = content || definition.defaultContent;
    const blockMetadata = metadata || {};
    
    this.blocks.push({
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: blockContent,
      metadata: blockMetadata
    });
    
    return this;
  }
  
  addText(content: string, formatting?: any): this {
    return this.addBlock('text', { content, formatting: formatting || {} });
  }
  
  addBoxedText(content: string, title?: string, style?: string): this {
    return this.addBlock('boxedtext', { content, title, style: style || 'default' });
  }
  
  addSidebar(title: string, content: string, options?: any): this {
    return this.addBlock('sidebar', { title, content, ...options });
  }
  
  addTable(headers: string[], rows: string[][], title?: string, options?: any): this {
    return this.addBlock('table', { headers, rows, title, ...options });
  }
  
  addStatBlock(statBlockId?: string, customData?: any): this {
    return this.addBlock('statblock', { statBlockId, customData });
  }
  
  addImage(src: string, alt: string, options?: any): this {
    return this.addBlock('image', { src, alt, ...options });
  }
  
  addHandout(title: string, content: string, options?: any): this {
    return this.addBlock('handout', { title, content, ...options });
  }
  
  validate(): { isValid: boolean; errors: Array<{ blockId: string; errors: string[] }>; warnings: Array<{ blockId: string; warnings: string[] }> } {
    const errors: Array<{ blockId: string; errors: string[] }> = [];
    const warnings: Array<{ blockId: string; warnings: string[] }> = [];
    
    this.blocks.forEach(block => {
      const validation = ContentBlockProcessor.validateBlock(block.type, block.content);
      
      if (!validation.isValid) {
        errors.push({ blockId: block.id, errors: validation.errors });
      }
      
      if (validation.warnings.length > 0) {
        warnings.push({ blockId: block.id, warnings: validation.warnings });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  render(): string {
    let markdown = '';
    
    this.blocks.forEach(block => {
      const rendered = ContentBlockProcessor.renderBlock(block.type, block.content, block.metadata);
      markdown += rendered + '\n\n';
    });
    
    return markdown.trim();
  }
  
  getBlocks(): Array<{ id: string; type: string; content: unknown; metadata: Record<string, unknown> }> {
    return [...this.blocks];
  }
  
  clear(): this {
    this.blocks = [];
    return this;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ContentBlockRegistry,
  ContentBlockProcessor,
  ContentBlockBuilder,
  
  // Individual block definitions
  TextBlockDefinition,
  BoxedTextBlockDefinition,
  SidebarBlockDefinition,
  TableBlockDefinition,
  StatBlockContentDefinition,
  ImageBlockDefinition,
  HandoutBlockDefinition,
  PositionBlockDefinition,
};

export type { ContentBlockDefinition };
