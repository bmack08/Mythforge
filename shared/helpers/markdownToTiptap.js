/**
 * Convert markdown-like text to TipTap JSON structure
 * This is a SIMPLE converter for basic markdown used in brews
 * 
 * Supports:
 * - Headings (# H1, ## H2)
 * - Horizontal rules (---, ***)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Paragraphs
 */

export function markdownToTiptap(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const lines = markdown.split('\n');
  const content = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        content.push({
          type: 'paragraph',
          content: parseInlineMarks(text)
        });
      }
      currentParagraph = [];
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

    // Heading H1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushParagraph();
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineMarks(trimmed.slice(2))
      });
      continue;
    }

    // Heading H2
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineMarks(trimmed.slice(3))
      });
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      content.push({ type: 'horizontalRule' });
      continue;
    }

    // Regular line - add to current paragraph
    currentParagraph.push(line);
  }

  // Flush any remaining paragraph
  flushParagraph();

  // Ensure at least one node
  if (content.length === 0) {
    content.push({ type: 'paragraph' });
  }

  return { type: 'doc', content };
}

/**
 * Parse inline markdown marks (bold, italic) in text
 * Returns array of text nodes with marks
 */
function parseInlineMarks(text) {
  if (!text) return [];

  const nodes = [];
  let remaining = text;

  // Very simple parser - handles **bold** and *italic*
  // This is NOT a complete markdown parser, just enough for basic formatting

  while (remaining) {
    // Find next bold or italic
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/\*([^*]+)\*/);

    let nextMatch = null;
    let type = null;

    if (boldMatch && (!italicMatch || boldMatch.index < italicMatch.index)) {
      nextMatch = boldMatch;
      type = 'bold';
    } else if (italicMatch) {
      nextMatch = italicMatch;
      type = 'italic';
    }

    if (!nextMatch) {
      // No more formatting - add remaining text
      if (remaining) {
        nodes.push({ type: 'text', text: remaining });
      }
      break;
    }

    // Add text before the match
    if (nextMatch.index > 0) {
      nodes.push({ type: 'text', text: remaining.slice(0, nextMatch.index) });
    }

    // Add formatted text
    const mark = type === 'bold' ? 'bold' : 'italic';
    nodes.push({
      type: 'text',
      text: nextMatch[1],
      marks: [{ type: mark }]
    });

    // Continue with remaining text
    remaining = remaining.slice(nextMatch.index + nextMatch[0].length);
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: '' }];
}

export default markdownToTiptap;
