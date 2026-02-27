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
 * - Tables (| cell | cell | with header/separator/data rows)
 * - Blockquotes (> text)
 */

export function markdownToTiptap(markdown) {
  // If an object was passed (e.g. TipTap JSON), return it directly instead of converting
  if (markdown && typeof markdown === 'object' && markdown.type === 'doc') {
    return markdown;
  }
  if (!markdown || typeof markdown !== 'string') {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  // Extract HTML comments and store them for later processing
  const comments = [];
  const commentPlaceholder = '\u0000COMMENT_';
  markdown = markdown.replace(/<!--([\s\S]*?)-->/g, (match, commentText) => {
    comments.push(commentText.trim());
    return `${commentPlaceholder}${comments.length - 1}\u0000`;
  });

  console.log('[markdownToTiptap] Processing markdown:', markdown.slice(0, 200));

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

    // Multi-line footnote: {{footnote (without closing }})
    // MUST be before generic mustache block handler to avoid being caught as mustacheBlock
    if ((trimmed === '{{footnote' || trimmed.startsWith('{{footnote ')) && !trimmed.endsWith('}}')) {
      flushParagraph();
      flushBlock();
      const afterTag = trimmed.replace(/^{{footnote\s*/, '').trim();
      currentBlock = { type: 'footnoteBlock', attrs: {} };
      if (afterTag) {
        blockContent.push({
          type: 'paragraph',
          content: parseInlineMarks(afterTag)
        });
      }
      continue;
    }

    // Image mask block: {{imageMaskCenter5,--offsetX:0%,...
    // MUST be before generic mustache block handler
    const imageMaskMatch = trimmed.match(/^{{(imageMask(Center|Edge|Corner)(\d+))(?:,(.*))?$/);
    if (imageMaskMatch && !trimmed.endsWith('}}')) {
      flushParagraph();
      flushBlock();
      const maskType = imageMaskMatch[2].toLowerCase();
      const maskNumber = parseInt(imageMaskMatch[3], 10);
      const extraAttrs = imageMaskMatch[4] || '';
      const offsetXMatch = extraAttrs.match(/--offsetX:([^,}]+)/);
      const offsetYMatch = extraAttrs.match(/--offsetY:([^,}]+)/);
      const rotationMatch = extraAttrs.match(/--rotation:([^,}]+)/);

      currentBlock = {
        type: 'imageMaskBlock',
        attrs: {
          maskType: maskType,
          maskNumber: maskNumber,
          offsetX: offsetXMatch ? offsetXMatch[1] : '0%',
          offsetY: offsetYMatch ? offsetYMatch[1] : '0%',
          rotation: rotationMatch ? rotationMatch[1] : '0',
        }
      };
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

    // Generic mustache block with classes/tags: {{toc,wide, {{class1,class2, etc
    // Match patterns like {{toc,wide or {{customClass,id or {{class with optional whitespace
    const mustacheBlockMatch = trimmed.match(/^{{([^}]+)$/);
    if (mustacheBlockMatch) {
      flushParagraph();
      flushBlock();
      const tagString = mustacheBlockMatch[1].trim();
      const attrs = parseStyleTags(tagString);
      currentBlock = { type: 'mustacheBlock', attrs };
      continue;
    }

    // Page number: {{pagenumber}}, {{pageNumber 1}}, {{pageNumber,auto}}, {{pageNumber $[HB_pageNumber]}}
    const pageNumMatch = trimmed.match(/^{{page[Nn]umber(?:[,\s]+(.+?))?}}$/);
    if (pageNumMatch) {
      flushParagraph();
      const arg = pageNumMatch[1] ? pageNumMatch[1].trim() : null;
      let attrs;
      if (!arg || arg === 'auto') {
        attrs = { auto: true };
      } else {
        attrs = { value: arg };
      }
      if (!currentBlock) {
        content.push({ type: 'pageNumber', attrs });
      } else {
        blockContent.push({ type: 'pageNumber', attrs });
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

    // Skip page number counting: {{skipCounting}}
    if (trimmed === '{{skipcounting}}' || trimmed === '{{skipCounting}}') {
      flushParagraph();
      if (!currentBlock) {
        content.push({ type: 'skipCounting' });
      } else {
        blockContent.push({ type: 'skipCounting' });
      }
      continue;
    }

    // Reset page number counting: {{resetCounting}}
    if (trimmed === '{{resetcounting}}' || trimmed === '{{resetCounting}}') {
      flushParagraph();
      if (!currentBlock) {
        content.push({ type: 'resetCounting' });
      } else {
        blockContent.push({ type: 'resetCounting' });
      }
      continue;
    }

    // Cover page markers: {{frontCover}}, {{backCover}}, {{insideCover}}, {{partCover}}
    // These are block openers — content follows until \page or }}
    const coverMatch = trimmed.match(/^{{(frontCover|backCover|insideCover|partCover)}}$/);
    if (coverMatch) {
      flushParagraph();
      flushBlock();
      const coverTypeMap = {
        frontCover:  'front',
        insideCover: 'inside',
        backCover:   'back',
        partCover:   'part',
      };
      currentBlock = {
        type: 'coverBlock',
        attrs: { coverType: coverTypeMap[coverMatch[1]] || 'front' },
      };
      continue;
    }

    // Watermark: {{watermark TEXT}}
    const watermarkMatch = trimmed.match(/^{{watermark\s+(.+?)}}$/);
    if (watermarkMatch) {
      flushParagraph();
      const node = {
        type: 'mustacheBlock',
        attrs: { classes: 'watermark' },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: watermarkMatch[1] }] }]
      };
      if (!currentBlock) {
        content.push(node);
      } else {
        blockContent.push(node);
      }
      continue;
    }

    // Banner: {{banner TEXT}}
    const bannerMatch = trimmed.match(/^{{banner\s+(.+?)}}$/);
    if (bannerMatch) {
      flushParagraph();
      const node = {
        type: 'bannerBlock',
        content: [{ type: 'text', text: bannerMatch[1] }]
      };
      if (!currentBlock) {
        content.push(node);
      } else {
        blockContent.push(node);
      }
      continue;
    }

    // Logo: {{logo CONTENT}} — content may include images like ![](url)
    const logoMatch = trimmed.match(/^{{logo\s+(.+?)}}$/);
    if (logoMatch) {
      flushParagraph();
      const innerContent = parseInlineMarks(logoMatch[1]);
      const node = {
        type: 'logoBlock',
        content: [{ type: 'paragraph', content: innerContent }]
      };
      if (!currentBlock) {
        content.push(node);
      } else {
        blockContent.push(node);
      }
      continue;
    }

    // Vertical spacing: ::::
    if (trimmed === '::::') {
      flushParagraph();
      if (!currentBlock) {
        content.push({ type: 'verticalSpacing' });
      } else {
        blockContent.push({ type: 'verticalSpacing' });
      }
      continue;
    }

    // Horizontal spacing: {{width:NNNpx}} as a standalone line
    const hSpacingMatch = trimmed.match(/^{{width:(\d+(?:px|em|rem|%))}}$/);
    if (hSpacingMatch) {
      flushParagraph();
      const spacingNode = { type: 'verticalSpacing', attrs: { width: hSpacingMatch[1] } };
      if (!currentBlock) {
        content.push(spacingNode);
      } else {
        blockContent.push(spacingNode);
      }
      continue;
    }

    // HTML Comment placeholders
    const commentMatch = trimmed.match(/^\u0000COMMENT_(\d+)\u0000$/);
    if (commentMatch) {
      flushParagraph();
      const commentIndex = parseInt(commentMatch[1]);
      const commentText = comments[commentIndex] || '';
      if (!currentBlock) {
        content.push({
          type: 'comment',
          content: [{ type: 'text', text: commentText }]
        });
      } else {
        blockContent.push({
          type: 'comment',
          content: [{ type: 'text', text: commentText }]
        });
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

    // Headings - IMPORTANT: Check from longest to shortest to avoid matching substrings
    // H6 (minor headers)
    if (trimmed.startsWith('###### ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 6 },
        content: parseInlineMarks(trimmed.slice(7))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 6 },
        content: parseInlineMarks(trimmed.slice(7))
      });
      continue;
    }

    // H5 (table headers, section titles)
    if (trimmed.startsWith('##### ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 5 },
        content: parseInlineMarks(trimmed.slice(6))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 5 },
        content: parseInlineMarks(trimmed.slice(6))
      });
      continue;
    }

    // H4 (spell names, item names)
    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      if (!currentBlock) content.push({
        type: 'heading',
        attrs: { level: 4 },
        content: parseInlineMarks(trimmed.slice(5))
      });
      else blockContent.push({
        type: 'heading',
        attrs: { level: 4 },
        content: parseInlineMarks(trimmed.slice(5))
      });
      continue;
    }

    // H3 (PHB red style)
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

    // H2
    if (trimmed.startsWith('## ')) {
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

    // H1
    if (trimmed.startsWith('# ')) {
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

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      if (!currentBlock) content.push({ type: 'horizontalRule' });
      else blockContent.push({ type: 'horizontalRule' });
      continue;
    }

    // ──────────────────────────────────────────────────────────────────
    // Table: lines starting with | are collected as a table block.
    // Handles standard markdown tables:
    //   | Header 1 | Header 2 |
    //   |:---------|:--------:|
    //   | value 1  | value 2  |
    //
    // The separator row (|---|---|) is detected and skipped.
    // Rows before the separator use tableHeader cells; rows after use tableCell.
    // Alignment markers (:---, :---:, ---:) are captured as cell attrs.
    // Inline marks (bold, italic, links, etc.) are parsed within cell text.
    // ──────────────────────────────────────────────────────────────────
    if (trimmed.startsWith('|') || trimmed.endsWith('|')) {
      flushParagraph();

      // Collect all consecutive table lines (starting or ending with |)
      const tableLines = [];
      while (i < lines.length) {
        const tl = lines[i].trim();
        if (!tl || (!tl.startsWith('|') && !tl.endsWith('|'))) break;
        tableLines.push(tl);
        i++;
      }
      // Back up one index since the for-loop will i++ on continue
      i--;

      // Parse the collected lines into a TipTap table node
      const tableNode = parseMarkdownTable(tableLines);
      if (tableNode) {
        if (currentBlock) blockContent.push(tableNode);
        else content.push(tableNode);
      }
      continue;
    }

    // Definition list: **Term:** :: Definition
    const defMatch = trimmed.match(/^(.*?)\s*::\s*(.*)$/);
    if (defMatch) {
      console.log('[markdownToTiptap] Found definition list line:', line);
      console.log('[markdownToTiptap] Term:', defMatch[1], 'Description:', defMatch[2]);
      flushParagraph();
      const term = defMatch[1].trim();
      const description = defMatch[2].trim();
      
      // Check if there's already a definition list to append to
      const target = currentBlock ? blockContent : content;
      const lastNode = target[target.length - 1];
      
      if (lastNode && lastNode.type === 'definitionList') {
        // Append to existing list
        lastNode.content.push(
          { type: 'definitionTerm', content: parseInlineMarks(term) },
          { type: 'definitionDescription', content: parseInlineMarks(description) }
        );
      } else {
        // Create new list
        const dlNode = {
          type: 'definitionList',
          content: [
            { type: 'definitionTerm', content: parseInlineMarks(term) },
            { type: 'definitionDescription', content: parseInlineMarks(description) }
          ]
        };
        if (currentBlock) blockContent.push(dlNode);
        else content.push(dlNode);
      }
      continue;
    }

    // Unordered list item: - item or * item
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      const target = currentBlock ? blockContent : content;
      const lastNode = target[target.length - 1];
      const listItem = {
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInlineMarks(ulMatch[1]) }]
      };

      if (lastNode && lastNode.type === 'bulletList') {
        lastNode.content.push(listItem);
      } else {
        target.push({
          type: 'bulletList',
          content: [listItem]
        });
      }
      continue;
    }

    // Ordered list item: 1. item, 2. item, etc.
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      const target = currentBlock ? blockContent : content;
      const lastNode = target[target.length - 1];
      const listItem = {
        type: 'listItem',
        content: [{ type: 'paragraph', content: parseInlineMarks(olMatch[2]) }]
      };

      if (lastNode && lastNode.type === 'orderedList') {
        lastNode.content.push(listItem);
      } else {
        target.push({
          type: 'orderedList',
          attrs: { start: parseInt(olMatch[1], 10) },
          content: [listItem]
        });
      }
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('> ') || trimmed === '>') {
      flushParagraph();
      const target = currentBlock ? blockContent : content;
      const lastNode = target[target.length - 1];

      // Strip the leading > and optional space
      const quoteText = trimmed === '>' ? '' : trimmed.slice(2);
      const quotePara = quoteText
        ? { type: 'paragraph', content: parseInlineMarks(quoteText) }
        : { type: 'paragraph' };

      if (lastNode && lastNode.type === 'blockquote') {
        // Append to existing blockquote
        lastNode.content.push(quotePara);
      } else {
        target.push({
          type: 'blockquote',
          content: [quotePara]
        });
      }
      continue;
    }

    // Standalone image line: ![alt](url) or ![alt](url){styles}
    // Block-level image — avoids wrapping in a paragraph (imageWithAttributes is group: block)
    const standaloneImgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*\{([^}]+)\})?$/);
    if (standaloneImgMatch) {
      flushParagraph();
      const src = standaloneImgMatch[2];
      const alt = standaloneImgMatch[1] || '';
      let imgNode;
      if (standaloneImgMatch[3]) {
        // Has {k:v,...} style block → imageWithAttributes
        const parsed = parseStyleTags(standaloneImgMatch[3].trim());
        const style = parsed.styles || {};
        if (parsed.classes) {
          parsed.classes.split(' ').forEach(cls => {
            if (cls === 'wrapLeft') style.float = 'left';
            else if (cls === 'wrapRight') style.float = 'right';
          });
        }
        imgNode = { type: 'imageWithAttributes', attrs: { src, alt, style } };
      } else {
        // No style block → basic image
        imgNode = { type: 'image', attrs: { src, alt } };
      }
      if (!currentBlock) {
        content.push(imgNode);
      } else {
        blockContent.push(imgNode);
      }
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

  const result = { type: 'doc', content };
  console.log('[markdownToTiptap] Final JSON:', JSON.stringify(result, null, 2));
  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// Table parsing helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Determine whether a row is a separator row (e.g. |:---|:---:|---:|)
 * Separator cells contain only dashes and optional alignment colons.
 */
function isTableSeparatorRow(cells) {
  return cells.length > 0 && cells.every(cell => /^:?-+:?$/.test(cell.trim()));
}

/**
 * Extract column alignment from a separator row.
 * Returns an array of alignment strings: 'left', 'center', 'right', or null.
 *
 * :--- or ---  → 'left' (default, stored as null)
 * :---:        → 'center'
 * ---:         → 'right'
 */
function parseAlignments(separatorCells) {
  return separatorCells.map(cell => {
    const trimmed = cell.trim();
    const leftColon  = trimmed.startsWith(':');
    const rightColon = trimmed.endsWith(':');
    if (leftColon && rightColon) return 'center';
    if (rightColon)              return 'right';
    // :--- or --- are both treated as left (the default), stored as null
    return null;
  });
}

/**
 * Split a single table line into its cell strings.
 * Handles leading/trailing pipes: "| a | b |" → ["a", "b"]
 * Also handles no trailing pipe:  "| a | b"   → ["a", "b"]
 */
function splitTableRow(line) {
  // Remove leading and trailing pipe if present, then split by |
  let inner = line;
  if (inner.startsWith('|')) inner = inner.slice(1);
  if (inner.endsWith('|'))   inner = inner.slice(0, -1);
  return inner.split('|').map(cell => cell.trim());
}

/**
 * Process a raw array of cell strings to detect colspan.
 * Empty cells that follow a non-empty cell are absorbed into the preceding
 * cell's colspan count.
 *
 * @param {string[]} cells - Raw cell strings from splitTableRow
 * @returns {Array<{text: string, colspan: number}>}
 */
function processCellsForColspan(cells) {
  const processed = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === '' && processed.length > 0) {
      // Empty cell immediately following a non-empty cell → increase colspan
      processed[processed.length - 1].colspan++;
    } else {
      processed.push({ text: cells[i], colspan: 1 });
    }
  }
  return processed;
}

/**
 * Process header rows to resolve ^ (caret) merge syntax.
 *
 * The caret syntax allows vertical cell merging across header rows:
 *   Row 0: | Level | Proficiency | --- Spell Slots ---|||||
 *   Row 1: |      ^| Bonus      ^| 1st | 2nd | ... |
 *
 * A cell whose trimmed text ends with ^ means "merge this cell with the cell
 * directly above in the same column". The ^ cell's text (minus the ^) is
 * appended to the cell above, and the cell above gets its rowspan increased.
 *
 * This function mutates the processedRows in place, setting a `merged` flag on
 * cells that have been absorbed upward.
 *
 * @param {Array<Array<{text: string, colspan: number, rowspan: number, merged: boolean}>>} processedRows
 */
function processHeaderRowsForMerge(processedRows) {
  if (processedRows.length < 2) return;

  // For each row starting from row 1, check cells for caret merge
  for (let r = 1; r < processedRows.length; r++) {
    const currentRow  = processedRows[r];
    const previousRow = processedRows[r - 1];

    // Build a mapping from "flat column index" → cell index for the previous row.
    // Each cell in the previous row spans `colspan` columns, so we need to know
    // which cell in the previous row owns a given column position.
    const prevColMap = []; // prevColMap[flatCol] = index into previousRow
    for (let ci = 0; ci < previousRow.length; ci++) {
      const span = previousRow[ci].colspan || 1;
      for (let s = 0; s < span; s++) {
        prevColMap.push(ci);
      }
    }

    // Walk through the current row, tracking our flat column position
    let flatCol = 0;
    for (let ci = 0; ci < currentRow.length; ci++) {
      const cell = currentRow[ci];
      const cellText = cell.text;

      if (cellText.endsWith('^')) {
        // This cell merges upward
        const cleanText = cellText.slice(0, -1).trim();

        // Find the corresponding cell in the previous row via flat column index
        const prevCellIndex = prevColMap[flatCol];
        if (prevCellIndex !== undefined) {
          const prevCell = previousRow[prevCellIndex];

          // Increase the rowspan of the cell above
          prevCell.rowspan = (prevCell.rowspan || 1) + 1;

          // Concatenate text: if both have text, join with a space
          if (cleanText) {
            prevCell.text = prevCell.text
              ? prevCell.text + ' ' + cleanText
              : cleanText;
          }

          // Mark this cell as merged (will be skipped during rendering)
          cell.merged = true;
        }
      }

      // Advance flat column position by this cell's colspan
      flatCol += cell.colspan || 1;
    }
  }
}

/**
 * Convert a list of raw markdown table lines into a TipTap table node.
 *
 * Supports:
 * - Standard markdown tables with optional alignment separators
 * - Homebrewery ^ (caret) syntax for vertical cell merging (rowspan)
 * - Consecutive empty pipes ||||| for horizontal cell merging (colspan)
 *
 * @param {string[]} tableLines - Array of trimmed lines, each starting/ending with |
 * @returns {object|null} TipTap table node, or null if the table is empty
 */
function parseMarkdownTable(tableLines) {
  if (!tableLines || tableLines.length === 0) return null;

  // Split every line into cells
  const allRows = tableLines.map(splitTableRow);

  // Find the separator row (if any). It's typically the second row.
  let separatorIndex = -1;
  for (let r = 0; r < allRows.length; r++) {
    if (isTableSeparatorRow(allRows[r])) {
      separatorIndex = r;
      break;
    }
  }

  // Determine alignments from the separator row
  const alignments = separatorIndex >= 0
    ? parseAlignments(allRows[separatorIndex])
    : [];

  // Determine which rows are headers and which are data.
  // Rows before the separator are headers; rows after are data.
  // If there is no separator, treat all rows as data (no headers).
  let headerRowsRaw, dataRowsRaw;
  if (separatorIndex >= 0) {
    headerRowsRaw = allRows.slice(0, separatorIndex);
    dataRowsRaw   = allRows.slice(separatorIndex + 1);
  } else {
    headerRowsRaw = [];
    dataRowsRaw   = allRows;
  }

  // ── Process header rows for colspan and rowspan (^ merge) ──────────────

  // Step 1: Process each header row for colspan (empty cells after non-empty)
  const processedHeaders = headerRowsRaw.map(row => {
    const colspanned = processCellsForColspan(row);
    // Initialize rowspan and merged flag for each cell
    return colspanned.map(cell => ({
      text:    cell.text,
      colspan: cell.colspan,
      rowspan: 1,
      merged:  false
    }));
  });

  // Step 2: Process caret (^) merge across header rows
  processHeaderRowsForMerge(processedHeaders);

  // ── Build TipTap table rows ────────────────────────────────────────────
  const tableContent = [];

  // Helper: build a TipTap cell node with proper attrs
  const buildCellNode = (cellText, cellType, colIndex, colspan, rowspan) => {
    const inlineContent = parseInlineMarks(cellText || '');
    const cellNode = {
      type: cellType,
      attrs: {
        colspan:  colspan  || 1,
        rowspan:  rowspan  || 1,
        colwidth: null
      },
      content: [{
        type: 'paragraph',
        content: inlineContent.length > 0 ? inlineContent : [{ type: 'text', text: '' }]
      }]
    };

    // Attach alignment attribute if specified
    const alignment = alignments[colIndex];
    if (alignment) {
      cellNode.attrs.textAlign = alignment;
    }

    return cellNode;
  };

  // Header rows → tableHeader cells (with colspan/rowspan)
  for (const processedRow of processedHeaders) {
    const rowContent = [];
    let flatCol = 0;

    for (const cell of processedRow) {
      if (!cell.merged) {
        rowContent.push(
          buildCellNode(cell.text, 'tableHeader', flatCol, cell.colspan, cell.rowspan)
        );
      }
      flatCol += cell.colspan || 1;
    }

    // Only add the row if it has visible cells
    if (rowContent.length > 0) {
      tableContent.push({ type: 'tableRow', content: rowContent });
    }
  }

  // Data rows → tableCell cells (no merge processing, but still handle colspan)
  for (const row of dataRowsRaw) {
    const colspanned = processCellsForColspan(row);
    const rowContent = [];
    let flatCol = 0;

    for (const cell of colspanned) {
      rowContent.push(
        buildCellNode(cell.text, 'tableCell', flatCol, cell.colspan, 1)
      );
      flatCol += cell.colspan || 1;
    }

    tableContent.push({ type: 'tableRow', content: rowContent });
  }

  // A valid TipTap table needs at least one row
  if (tableContent.length === 0) return null;

  return {
    type: 'table',
    content: tableContent
  };
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
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const imageMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)(?:\s*\{([^}]+)\})?/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const strikeMatch = remaining.match(/~~([^~]+)~~/);

    // Find earliest match
    const matches = [
      { match: imageMatch, type: 'image' },  // Check image before link (both use [])
      { match: macroMatch, type: 'macro' },
      { match: iconMatch, type: 'icon' },
      { match: emojiMatch, type: 'emoji' },
      { match: boldMatch, type: 'bold' },
      { match: italicMatch, type: 'italic' },
      { match: linkMatch, type: 'link' },
      { match: codeMatch, type: 'code' },
      { match: strikeMatch, type: 'strike' }
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
    } else if (nextMatch.type === 'link') {
      nodes.push({
        type: 'text',
        text: nextMatch.match[1],
        marks: [{ type: 'link', attrs: { href: nextMatch.match[2], target: '_blank' } }]
      });
    } else if (nextMatch.type === 'image') {
      const src = nextMatch.match[2];
      const alt = nextMatch.match[1] || '';

      if (nextMatch.match[3]) {
        // Has {k:v,...} style block → create imageWithAttributes with style Record
        const parsed = parseStyleTags(nextMatch.match[3].trim());
        const style = parsed.styles || {};
        // Also handle classes that map to styles (e.g. float classes)
        if (parsed.classes) {
          parsed.classes.split(' ').forEach(cls => {
            if (cls === 'wrapLeft') style.float = 'left';
            else if (cls === 'wrapRight') style.float = 'right';
          });
        }
        nodes.push({
          type: 'imageWithAttributes',
          attrs: { src, alt, style },
        });
      } else {
        // No style block → basic image
        nodes.push({
          type: 'image',
          attrs: { src, alt, title: alt || null },
        });
      }
    } else if (nextMatch.type === 'code') {
      nodes.push({
        type: 'text',
        text: nextMatch.match[1],
        marks: [{ type: 'code' }]
      });
    } else if (nextMatch.type === 'strike') {
      nodes.push({
        type: 'text',
        text: nextMatch.match[1],
        marks: [{ type: 'strike' }]
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
