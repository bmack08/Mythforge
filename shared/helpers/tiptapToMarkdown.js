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
