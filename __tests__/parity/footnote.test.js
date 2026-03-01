import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';
import { tiptapToMarkdown } from '../../shared/helpers/tiptapToMarkdown.js';
import { normalizeTipTapDoc } from '../../shared/helpers/normalizeDoc.js';

describe('Footnote Parity', ()=>{
	test('parses footnote block and round-trips', ()=>{
		const source = '{{footnote PART 1 | SECTION NAME}}';
		const json = normalizeTipTapDoc(markdownToTiptap(source));

		expect(json.content).toHaveLength(1);
		expect(json.content[0].type).toBe('hbFootnote');

		// Single-line footnote → canonical multi-line on serialize
		const roundTrip = tiptapToMarkdown(json);
		expect(roundTrip.trim()).toBe('{{footnote\n  PART 1 | SECTION NAME\n}}');

		// Second round-trip is idempotent
		const secondJson = normalizeTipTapDoc(markdownToTiptap(roundTrip));
		const secondRoundTrip = tiptapToMarkdown(secondJson);
		expect(secondRoundTrip).toBe(roundTrip);
	});

	test('normalizer converts raw footnote text to hbFootnote', ()=>{
		const doc = {
			type    : 'doc',
			content : [{
				type    : 'paragraph',
				content : [{ type: 'text', text: '{{footnote Example}}' }]
			}]
		};

		const normalized = normalizeTipTapDoc(doc);
		expect(normalized.content[0].type).toBe('hbFootnote');
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
		expect(normalized.content[0].type).toBe('hbFootnote');
		expect(normalized.content[0].content[0].text).toBe('Example Text');
	});

	test('normalizer migrates legacy footnoteBlock to hbFootnote', ()=>{
		const doc = {
			type: 'doc',
			content: [{
				type: 'footnoteBlock',
				content: [{
					type: 'paragraph',
					content: [{ type: 'text', text: 'Legacy footnote content' }]
				}]
			}]
		};

		const normalized = normalizeTipTapDoc(doc);
		expect(normalized.content[0].type).toBe('hbFootnote');
		expect(normalized.content[0].content[0].text).toBe('Legacy footnote content');
	});
});
