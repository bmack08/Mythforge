/**
 * Normalize TipTap documents by converting legacy inline tokens
 * into their structured node equivalents.
 *
 * Currently handles:
 * - `{{footnote ...}}` lines -> `hbFootnote` (inline* content)
 * - Legacy `footnoteBlock` -> `hbFootnote` migration
 */

const FOOTNOTE_REGEX = /^{{footnote\s+([\s\S]*?)\s*}}$/;

const clone = (value)=>{
	return value ? JSON.parse(JSON.stringify(value)) : value;
};

const normalizeNodes = (nodes = [])=>{
	const result = [];

	for (const node of nodes) {
		if(!node) continue;
		const cloned = { ...node };

		if(cloned.content) {
			cloned.content = normalizeNodes(cloned.content);
		}

		// Migrate legacy footnoteBlock (block+ content) to hbFootnote (inline* content)
		if(cloned.type === 'footnoteBlock') {
			const inlineContent = [];
			const paragraphs = cloned.content || [];
			for (let j = 0; j < paragraphs.length; j++) {
				if (j > 0) inlineContent.push({ type: 'hardBreak' });
				const para = paragraphs[j];
				if (para.content) {
					inlineContent.push(...para.content);
				}
			}
			result.push({
				type: 'hbFootnote',
				content: inlineContent.length > 0 ? inlineContent : [{ type: 'text', text: '' }]
			});
			continue;
		}

		if(cloned.type === 'paragraph') {
			const textOnly = cloned.content
				&& cloned.content.length
				&& cloned.content.every((child)=>child.type === 'text' && !child.marks);

			if(textOnly) {
				const combined = cloned.content.map((child)=>child.text || '').join('').trim();
				const match = combined.match(FOOTNOTE_REGEX);
				if(match) {
					const footnoteText = match[1].trim();
					if(!footnoteText) {
						result.push(cloned);
						continue;
					}
					result.push({
						type    : 'hbFootnote',
						content : [{ type: 'text', text: footnoteText }]
					});
					continue;
				}
			}
		}

		result.push(cloned);
	}

	return result;
};

export const normalizeTipTapDoc = (doc)=>{
	if(!doc || doc.type !== 'doc') return doc;
	const clonedDoc = clone(doc);
	clonedDoc.content = normalizeNodes(clonedDoc.content);
	return clonedDoc;
};

export default {
	normalizeTipTapDoc
};
