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
				.map((child)=>nodeToMarkdown(child))
				.join('\n').trim();
			const opening = tags ? `{{${tags}` : '{{';
			return `${opening}\n${inner ? `${inner}\n` : ''}}}`;
		}

		case 'footnoteBlock': {
			const paragraphs = (node.content || []).map(child => nodeToMarkdown(child));
			const inner = paragraphs.join('\n').trim();
			// Single paragraph → single-line format
			if (paragraphs.length <= 1) {
				return `{{footnote ${inner}}}`;
			}
			// Multi-paragraph → multi-line format
			return `{{footnote\n${inner}\n}}`;
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

		case 'imageWithAttributes': {
			const src = node.attrs?.src || '';
			const alt = node.attrs?.alt || '';
			const style = node.attrs?.style || {};
			const sortedEntries = Object.entries(style).sort(([a], [b]) => a.localeCompare(b));
			const styleBlock = sortedEntries.length > 0
				? `{${sortedEntries.map(([k, v]) => `${k}:${v}`).join(',')}}`
				: '';
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
			const inner = (node.content || []).map(child => nodeToMarkdown(child)).join('\n').trim();
			return `{{${className}${attrString}\n${inner}\n}}`;
		}

		case 'coverBlock': {
			const coverTypeMap = { front: 'frontCover', inside: 'insideCover', back: 'backCover', part: 'partCover' };
			const markup = coverTypeMap[node.attrs?.coverType] || 'frontCover';
			const inner = (node.content || []).map(child => nodeToMarkdown(child)).join('\n\n');
			return `{{${markup}}}\n\n${inner}`;
		}

		case 'bannerBlock': {
			const inner = contentToText(node.content || []);
			return `{{banner ${inner.trim()}}}`;
		}

		case 'logoBlock': {
			const inner = (node.content || []).map(child => nodeToMarkdown(child)).join(' ').trim();
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
