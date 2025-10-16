/**
 * Normalize TipTap documents by converting legacy inline tokens
 * into their structured node equivalents.
 *
 * Currently handles:
 * - `{{footnote ...}}` lines -> `footnoteBlock`
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
						type    : 'footnoteBlock',
						content : [{
							type    : 'paragraph',
							content : [{ type: 'text', text: footnoteText }]
						}]
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
