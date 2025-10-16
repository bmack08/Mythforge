import { parseStyleTags } from './legacyStyleTags.js';

/**
 * Convert Homebrewery markdown to TipTap JSON structure
 * 
 * Supports:
 * - Headings (# H1, ## H2, ### H3 for red PHB style)
 * - Homebrewery blocks ({{quote}}, {{attribution}}, etc.)
 * - Page/column breaks (\page, \column)
 * - Horizontal rules (---, ***)
 * - Bold (**text**), Italic (*text*)
 * - Inline macros (\spell{}, \ability{}, etc.)
 * - Paragraphs
 * - Mustache inline/block styling ({{class text}}, {{\nclass\n...\n}})
 */

export function markdownToTiptap(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const lines = markdown.split('\n');
  const content = [];
  let currentParagraph = [];
  let currentBlock = null; // For {{quote}}, {{sidebar}}, etc.
  let blockContent = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        if (currentBlock) {
          // Add to current block
          blockContent.push({
            type: 'paragraph',
            content: parseInlineMarks(text)
          });
        } else {
          // Add to document
          content.push({
            type: 'paragraph',
            content: parseInlineMarks(text)
          });
        }
      }
      currentParagraph = [];
    }
  };

  const flushBlock = () => {
    if (currentBlock) {
      const attrs = currentBlock.attrs || {};
      content.push({
        type: currentBlock.type,
        attrs: attrs,
        content: blockContent.length > 0 ? blockContent : [{ type: 'paragraph' }]
      });
      currentBlock = null;
      blockContent = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line - flush current paragraph
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Page break: \page, \pagebreak, with optional style tags
    const pageMatch = trimmed.match(/^\\page(?:break)?(?:\s*{([^}]*)})?$/);
    if (pageMatch) {
      flushParagraph();
      flushBlock();
      const tagString = pageMatch[1] ? pageMatch[1].trim() : '';
      content.push({ type: 'pageBreak', attrs: parseStyleTags(tagString) });
      continue;
    }

    // Column break: \column, \columnbreak with optional style tags
    const columnMatch = trimmed.match(/^\\column(?:break)?(?:\s*{([^}]*)})?$/);
    if (columnMatch) {
      flushParagraph();
      flushBlock();
      const tagString = columnMatch[1] ? columnMatch[1].trim() : '';
      content.push({ type: 'columnBreak', attrs: parseStyleTags(tagString) });
      continue;
    }

    // Footnote block: {{footnote ...}}
    const footnoteMatch = trimmed.match(/^{{footnote\s+(.*)}}$/s);
    if (footnoteMatch) {
      flushParagraph();
      flushBlock();
      const footnoteText = footnoteMatch[1].trim();
      const innerContent = parseInlineMarks(footnoteText);
      content.push({
        type    : 'footnoteBlock',
        content : [{
          type    : 'paragraph',
          content : innerContent.length ? innerContent : [{ type: 'text', text: '' }]
        }]
      });
      continue;
    }

    // Start of quote block: {{quote
    if (trimmed.startsWith('{{quote')) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'quoteBlock', attrs: {} };
      continue;
    }

    // Start of wide block: {{wide
    if (trimmed.startsWith('{{wide')) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'wideBlock', attrs: {} };
      continue;
    }

    // Start of header block: {{header
    if (trimmed.startsWith('{{header')) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'header', attrs: {} };
      continue;
    }

    // Start of footer block: {{footer
    if (trimmed.startsWith('{{footer')) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'footer', attrs: {} };
      continue;
    }

    // Page number: {{pagenumber}}
    if (trimmed === '{{pagenumber}}') {
      flushParagraph();
      if (!currentBlock) {
        content.push({ type: 'pageNumber', attrs: { auto: true } });
      } else {
        blockContent.push({ type: 'pageNumber', attrs: { auto: true } });
      }
      continue;
    }

    // Column break: {{columnbreak}}
    if (trimmed === '{{columnbreak}}') {
      flushParagraph();
      if (!currentBlock) {
        content.push({ type: 'columnBreak' });
      } else {
        blockContent.push({ type: 'columnBreak' });
      }
      continue;
    }

    // Column container: {column-count:2}
    const columnCountMatch = trimmed.match(/^\{column-count:(\d+)\}$/);
    if (columnCountMatch) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'columnContainer', attrs: { count: parseInt(columnCountMatch[1], 10) } };
      continue;
    }

    // Attribution in quote: {{attribution
    if (trimmed.startsWith('{{attribution ')) {
      const attribution = trimmed.slice(14).replace(/}}$/, '').trim();
      if (currentBlock && currentBlock.type === 'quoteBlock') {
        currentBlock.attrs.attribution = attribution;
      }
      continue;
    }

    // Generic mustache block start (e.g. {{class,id attr}} on its own line)
    if (trimmed.startsWith('{{') && !trimmed.endsWith('}}')) {
      flushParagraph();
      flushBlock();
      const tagString = trimmed.slice(2).trim();
      currentBlock = {
        type  : 'mustacheBlock',
        attrs : parseStyleTags(tagString)
      };
      continue;
    }

    // End of block: }}
    if (trimmed === '}}') {
      flushParagraph();
      flushBlock();
      continue;
    }

    // Heading H1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineMarks(trimmed.slice(2))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineMarks(trimmed.slice(2))
      });
      continue;
    }

    // Heading H2
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineMarks(trimmed.slice(3))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineMarks(trimmed.slice(3))
      });
      continue;
    }

    // Heading H3 (PHB red style)
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: parseInlineMarks(trimmed.slice(4))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 3 },
        content: parseInlineMarks(trimmed.slice(4))
      });
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      if (!currentBlock) content.push({ type: 'horizontalRule' });
      else blockContent.push({ type: 'horizontalRule' });
      continue;
    }

    // Regular line - add to current paragraph
    currentParagraph.push(line);
  }

  // Flush any remaining content
  flushParagraph();
  flushBlock();

  // Ensure at least one node
  if (content.length === 0) {
    content.push({ type: 'paragraph' });
  }

  return { type: 'doc', content };
}

/**
 * Parse inline marks: bold, italic, and Homebrewery macros
 * Handles: **bold**, *italic*, \spell{}, \ability{}, \skill{}, \condition{}, \damage{}
 * Returns array of text nodes with marks
 */
function parseInlineMarks(text) {
    if (!text) return [];

  const nodes = [];
  const segments = splitMustacheSegments(text);

  for (const segment of segments) {
    if(segment.type === 'mustache') {
      const { tags, innerContent } = splitMustacheInline(segment.value);
      const attrs = parseStyleTags(tags || '');
      const innerNodes = parseInlineMarks(innerContent);
      nodes.push({
        type    : 'mustacheSpan',
        attrs   : attrs,
        content : innerNodes.length ? innerNodes : [{ type: 'text', text: '' }]
      });
      continue;
    }

    nodes.push(...parseSimpleInlineMarks(segment.value));
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: '' }];
}

/**
 * Original parser for non-mustache inline decorations.
 */
function parseSimpleInlineMarks(text) {
  if (!text) return [];

  const nodes = [];
  let remaining = text;

  while (remaining) {
    // Find next formatting:
    // 1. Homebrewery macros: \spell{Fire Bolt}, \ability{Strength}, etc.
    // 2. Icons: :fa-dragon:, :far-smile:, :fab-github:
    // 3. Emoji: :ei_barbarian_reckless_attack:
    // 4. Bold: **text**
    // 5. Italic: *text*

    const macroMatch = remaining.match(/\\(spell|ability|skill|condition|damage)\{([^}]+)\}/);
    const iconMatch = remaining.match(/:(fa[rb]?-[a-zA-Z0-9-]+):/);
    const emojiMatch = remaining.match(/:ei_[a-zA-Z0-9_]+:/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*/); // Avoid matching **

    // Find earliest match
    const matches = [
      { match: macroMatch, type: 'macro' },
      { match: iconMatch, type: 'icon' },
      { match: emojiMatch, type: 'emoji' },
      { match: boldMatch, type: 'bold' },
      { match: italicMatch, type: 'italic' }
    ].filter(m => m.match !== null);

    if (matches.length === 0) {
      // No more formatting - add remaining text
      if (remaining) {
        nodes.push({ type: 'text', text: remaining });
      }
      break;
    }

    // Sort by position
    matches.sort((a, b) => a.match.index - b.match.index);
    const nextMatch = matches[0];

    // Add text before the match
    if (nextMatch.match.index > 0) {
      nodes.push({ type: 'text', text: remaining.slice(0, nextMatch.match.index) });
    }

    // Add formatted text
    if (nextMatch.type === 'macro') {
      // \spell{Fire Bolt} → text with spellMark
      const markType = nextMatch.match[1] + 'Mark'; // spellMark, abilityMark, etc.
      nodes.push({
        type: 'text',
        text: nextMatch.match[2], // Content inside {}
        marks: [{ type: markType }]
      });
    } else if (nextMatch.type === 'icon') {
      // :fa-dragon: → iconMark node
      const iconName = nextMatch.match[1];
      nodes.push({
        type: 'iconMark',
        attrs: { name: iconName }
      });
    } else if (nextMatch.type === 'emoji') {
      // :ei_barbarian_reckless_attack: → emoji node
      const emojiName = nextMatch.match[0].slice(4, -1); // Remove :ei_ and trailing :
      nodes.push({
        type: 'emoji',
        attrs: { name: emojiName, set: 'ei' }
      });
    } else if (nextMatch.type === 'bold') {
      nodes.push({
        type: 'text',
        text: nextMatch.match[1],
        marks: [{ type: 'bold' }]
      });
    } else if (nextMatch.type === 'italic') {
      nodes.push({
        type: 'text',
        text: nextMatch.match[1],
        marks: [{ type: 'italic' }]
      });
    }

    // Continue with remaining text
    remaining = remaining.slice(nextMatch.match.index + nextMatch.match[0].length);
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: '' }];
}

function splitMustacheSegments(text) {
  const segments = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf('{{', cursor);
    if(start === -1) {
      segments.push({ type: 'text', value: text.slice(cursor) });
      break;
    }

    if(start > cursor) {
      segments.push({ type: 'text', value: text.slice(cursor, start) });
    }

    const end = text.indexOf('}}', start + 2);
    if(end === -1) {
      segments.push({ type: 'text', value: text.slice(start) });
      break;
    }

    const inner = text.slice(start + 2, end);
    segments.push({ type: 'mustache', value: inner });
    cursor = end + 2;
  }

  if(segments.length === 0) {
    segments.push({ type: 'text', value: text });
  }

  return segments.filter((segment)=>segment.value !== '');
}

function splitMustacheInline(inner) {
  let inQuotes = false;
  let splitIndex = -1;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if(char === '"' && inner[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      continue;
    }
    if(!inQuotes && /\s/.test(char)) {
      splitIndex = i;
      break;
    }
  }

  if(splitIndex === -1) {
    return {
      tags         : inner.trim(),
      innerContent : ''
    };
  }

  return {
    tags         : inner.slice(0, splitIndex).trim(),
    innerContent : inner.slice(splitIndex).trim()
  };
}

export default markdownToTiptap;
