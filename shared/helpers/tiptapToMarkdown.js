import { stringifyStyleTags } from './legacyStyleTags.js';

// Convert TipTap JSON to markdown-like text for rendering and validation
export function tiptapToMarkdown(doc) {
  if (!doc || typeof doc !== 'object') return '';
  if (!doc.content || !Array.isArray(doc.content)) return '';

  return doc.content.map((node) => nodeToMarkdown(node)).join('\n\n');
}

function serializeStyleBlock(style = {}) {
  const sortedEntries = Object.entries(style || {})
    .filter(([key, value]) => key && value !== undefined && value !== null && String(value) !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  if (sortedEntries.length === 0) return '';
  return `{${sortedEntries.map(([k, v]) => `${k}:${v}`).join(',')}}`;
}

function serializeFootnote(innerText = '') {
  const lines = String(innerText)
    .split('\n')
    .map((line) => line.trimEnd());

  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();

  if (lines.length === 0) {
    return '{{footnote\n  \n}}';
  }

  const indented = lines.map((line) => `  ${line}`).join('\n');
  return `{{footnote\n${indented}\n}}`;
}

function nodeToMarkdown(node) {
  if (!node || !node.type) return '';

  switch (node.type) {
    case 'paragraph':
      return contentToText(node.content || []);

    case 'heading': {
      const level = node.attrs?.level || 1;
      const text = contentToText(node.content || []);
      return `${'#'.repeat(level)} ${text}`;
    }

    case 'mustacheSpan': {
      const tags = stringifyStyleTags(node.attrs || {});
      const inner = contentToText(node.content || []);
      const prefix = tags ? `${tags} ` : '';
      return `{{${prefix}${inner}}}`;
    }

    case 'mustacheBlock': {
      const tags = stringifyStyleTags(node.attrs || {});
      const inner = (node.content || [])
        .map((child) => nodeToMarkdown(child))
        .join('\n')
        .trim();
      const opening = tags ? `{{${tags}` : '{{';
      return `${opening}\n${inner ? `${inner}\n` : ''}}}`;
    }

    case 'hbFrontCover': {
      const coverTypeMap = { front: 'frontCover', back: 'backCover', inside: 'insideCover', part: 'partCover' };
      const coverMacro = coverTypeMap[node.attrs?.coverType] || 'frontCover';
      return `{{${coverMacro}}}`;
    }

    case 'hbLogo': {
      const src = (node.attrs?.src || '').trim();
      return `{{logo ![](${src})}}`;
    }

    case 'hbBanner': {
      const text = (node.attrs?.text || '').trim();
      return `{{banner ${text}}}`;
    }

    case 'hbFootnote': {
      const inner = contentToText(node.content || []).trim();
      return serializeFootnote(inner);
    }

    case 'hbBackgroundImage': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const style = node.attrs?.style || {};
      const styleBlock = serializeStyleBlock(style);
      return `![${alt}](${src})${styleBlock}`;
    }

    case 'footnoteBlock': {
      const paragraphs = (node.content || []).map((child) => nodeToMarkdown(child));
      const inner = paragraphs.join('\n').trim();
      return serializeFootnote(inner);
    }

    case 'pageBreak': {
      const tags = stringifyStyleTags(node.attrs || {});
      return tags ? `\\page{${tags}}` : '\\page';
    }

    case 'columnBreak': {
      const tags = stringifyStyleTags(node.attrs || {});
      return tags ? `\\column{${tags}}` : '\\column';
    }

    case 'pageNumber': {
      if (node.attrs?.auto) return '{{pageNumber,auto}}';
      if (node.attrs?.value !== null && node.attrs?.value !== undefined) {
        return `{{pageNumber ${node.attrs.value}}}`;
      }
      return '{{pageNumber,auto}}';
    }

    case 'horizontalRule':
      return '---';

    case 'text': {
      let textContent = node.text || '';
      if (node.marks && Array.isArray(node.marks)) {
        node.marks.forEach((mark) => {
          if (mark.type === 'bold') textContent = `**${textContent}**`;
          if (mark.type === 'italic') textContent = `*${textContent}*`;
          if (mark.type === 'code') textContent = `\`${textContent}\``;
          if (mark.type === 'strike') textContent = `~~${textContent}~~`;
          if (mark.type === 'link') {
            const href = mark.attrs?.href || '';
            textContent = `[${textContent}](${href})`;
          }
        });
      }
      return textContent;
    }

    case 'imageWithAttributes': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      const style = node.attrs?.style || {};
      const styleBlock = serializeStyleBlock(style);
      return `![${alt}](${src})${styleBlock}`;
    }

    case 'image': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      return `![${alt}](${src})`;
    }

    case 'imageMaskBlock': {
      const { maskType, maskNumber, offsetX, offsetY, rotation } = node.attrs || {};
      const typeCapitalized = (maskType || 'center').charAt(0).toUpperCase() + (maskType || 'center').slice(1);
      const className = `imageMask${typeCapitalized}${maskNumber || 1}`;
      const attrParts = [];
      if (offsetX && offsetX !== '0%') attrParts.push(`--offsetX:${offsetX}`);
      if (offsetY && offsetY !== '0%') attrParts.push(`--offsetY:${offsetY}`);
      if (rotation && rotation !== '0') attrParts.push(`--rotation:${rotation}`);
      const attrString = attrParts.length > 0 ? `,${attrParts.join(',')}` : '';
      const inner = (node.content || []).map((child) => nodeToMarkdown(child)).join('\n').trim();
      return `{{${className}${attrString}\n${inner}\n}}`;
    }

    case 'coverBlock': {
      const coverTypeMap = { front: 'frontCover', inside: 'insideCover', back: 'backCover', part: 'partCover' };
      const markup = coverTypeMap[node.attrs?.coverType] || 'frontCover';
      const inner = (node.content || []).map((child) => nodeToMarkdown(child)).join('\n\n');
      return `{{${markup}}}\n\n${inner}`;
    }

    case 'bannerBlock': {
      const inner = contentToText(node.content || []);
      return `{{banner ${inner.trim()}}}`;
    }

    case 'logoBlock': {
      const inner = (node.content || []).map((child) => nodeToMarkdown(child)).join(' ').trim();
      return `{{logo ${inner}}}`;
    }

    case 'hardBreak':
      return '\n';

    default:
      // Unknown node type - try to extract text content
      return contentToText(node.content || []);
  }
}

function contentToText(content) {
  if (!Array.isArray(content)) return '';
  return content.map((node) => nodeToMarkdown(node)).join('');
}

export function ensureString(text) {
  if (typeof text === 'string') return text;
  if (text && typeof text === 'object') return tiptapToMarkdown(text);
  return '';
}
