import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';
import { tiptapToMarkdown } from '../../shared/helpers/tiptapToMarkdown.js';
import { normalizeTipTapDoc } from '../../shared/helpers/normalizeDoc.js';

describe('Footnote Parity', ()=>{
	test('parses footnote block and round-trips', ()=>{
		const source = '{{footnote PART 1 | SECTION NAME}}';
		const json = normalizeTipTapDoc(markdownToTiptap(source));

		expect(json.content).toHaveLength(1);
		expect(json.content[0].type).toBe('footnoteBlock');

		const roundTrip = tiptapToMarkdown(json);
		expect(roundTrip.trim()).toBe(source);
	});
	test('normalizer converts raw footnote text', ()=>{
		const doc = {
			type    : 'doc',
			content : [{
				type    : 'paragraph',
				content : [{ type: 'text', text: '{{footnote Example}}' }]
			}]
		};

		const normalized = normalizeTipTapDoc(doc);
		expect(normalized.content[0].type).toBe('footnoteBlock');
	});

	test('handles trailing spaces inside footnote braces', ()=>{
		const doc = {
			type    : 'doc',
			content : [{
				type    : 'paragraph',
				content : [{ type: 'text', text: '{{footnote Example Text }} ' }]
			}]
		};
		const normalized = normalizeTipTapDoc(doc);
		expect(normalized.content[0].content[0].content[0].text).toBe('Example Text');
	});
});
