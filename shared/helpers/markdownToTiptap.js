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
      content.push({
        type: currentBlock.type,
        attrs: currentBlock.attrs,
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

    // Page break: \page
    if (trimmed === '\\page') {
      flushParagraph();
      flushBlock();
      content.push({ type: 'pageBreak' });
      continue;
    }

    // Column break: \column
    if (trimmed === '\\column') {
      flushParagraph();
      flushBlock();
      content.push({ type: 'columnBreak' });
      continue;
    }

    // Start of quote block: {{quote
    if (trimmed.startsWith('{{quote')) {
      flushParagraph();
      flushBlock();
      currentBlock = { type: 'quoteBlock', attrs: {} };
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
  let remaining = text;

  while (remaining) {
    // Find next formatting:
    // 1. Homebrewery macros: \spell{Fire Bolt}, \ability{Strength}, etc.
    // 2. Bold: **text**
    // 3. Italic: *text*

    const macroMatch = remaining.match(/\\(spell|ability|skill|condition|damage)\{([^}]+)\}/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*/); // Avoid matching **

    // Find earliest match
    const matches = [
      { match: macroMatch, type: 'macro' },
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

export default markdownToTiptap;
