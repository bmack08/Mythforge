import { stringifyStyleTags } from './legacyStyleTags.js';

// Convert TipTap JSON to markdown-like text for rendering and validation
export function tiptapToMarkdown(doc) {
	if (!doc || typeof doc !== 'object') return '';
	if (!doc.content || !Array.isArray(doc.content)) return '';

	return doc.content.map(node => nodeToMarkdown(node)).join('\n\n');
}

function nodeToMarkdown(node) {
	if (!node || !node.type) return '';

	switch (node.type) {
		case 'paragraph':
			return contentToText(node.content || []);

		case 'heading':
			const level = node.attrs?.level || 1;
			const text = contentToText(node.content || []);
			return level === 1 ? `# ${text}` : `## ${text}`;

		case 'mustacheSpan': {
			const tags = stringifyStyleTags(node.attrs || {});
			const inner = contentToText(node.content || []);
			const prefix = tags ? `${tags} ` : '';
			return `{{${prefix}${inner}}}`;
		}

		case 'mustacheBlock': {
			const tags = stringifyStyleTags(node.attrs || {});
			const inner = (node.content || [])
				.map((child)=>nodeToMarkdown(child))
				.join('\n').trim();
			const opening = tags ? `{{${tags}` : '{{';
			return `${opening}\n${inner ? `${inner}\n` : ''}}}`;
		}

		case 'footnoteBlock': {
			const inner = contentToText(node.content || []);
			return `{{footnote ${inner.trim()}}}`;
		}

		case 'pageBreak': {
			const tags = stringifyStyleTags(node.attrs || {});
			return tags ? `\\page{${tags}}` : '\\page';
		}

		case 'columnBreak': {
			const tags = stringifyStyleTags(node.attrs || {});
			return tags ? `\\column{${tags}}` : '\\column';
		}

		case 'horizontalRule':
			return '---';

		case 'text':
			let textContent = node.text || '';
			// Apply marks (bold, italic, etc.)
			if (node.marks && Array.isArray(node.marks)) {
				node.marks.forEach(mark => {
					if (mark.type === 'bold') textContent = `**${textContent}**`;
					if (mark.type === 'italic') textContent = `*${textContent}*`;
					if (mark.type === 'code') textContent = `\`${textContent}\``;
				});
			}
			return textContent;

		case 'hardBreak':
			return '\n';

		default:
			// Unknown node type - try to extract text content
			return contentToText(node.content || []);
	}
}

function contentToText(content) {
	if (!Array.isArray(content)) return '';
	return content.map(node => nodeToMarkdown(node)).join('');
}

export function ensureString(text) {
	// If it's already a string, return it
	if (typeof text === 'string') return text;
	// If it's TipTap JSON, convert it
	if (text && typeof text === 'object') return tiptapToMarkdown(text);
	// Otherwise return empty string
	return '';
}
