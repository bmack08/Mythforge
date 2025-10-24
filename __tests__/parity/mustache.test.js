import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';
import { tiptapToMarkdown } from '../../shared/helpers/tiptapToMarkdown.js';

describe('Mustache Syntax Parity', ()=>{
	test('inline mustache span round trips', ()=>{
		const source = 'My favorite author is {{pen,#author,color:orange Brandon Sanderson}}.';
		const json = markdownToTiptap(source);
		const paragraph = json.content[0];

		expect(paragraph.type).toBe('paragraph');
		const mustacheNode = paragraph.content.find((node)=>node.type === 'mustacheSpan');
		expect(mustacheNode).toBeDefined();
		expect(mustacheNode.attrs.classes).toContain('pen');
		expect(mustacheNode.attrs.id).toBe('author');
		expect(mustacheNode.attrs.styles.color).toBe('orange');

		const markdown = tiptapToMarkdown(json);
		expect(markdown).toContain('#author');
		expect(markdown).toContain('pen');
		expect(markdown).toContain('color:orange');
		expect(markdown).toContain('Brandon Sanderson');
	});

	test('block mustache renders div with merged classes', ()=>{
		const source = [
			'{{purple,#book,text-align:center,background:#aa88aa55',
			'My favorite book is Wheel of Time.',
			'}}'
		].join('\n');

		const json = markdownToTiptap(source);
		const block = json.content.find((node)=>node.type === 'mustacheBlock');

		expect(block).toBeDefined();
		expect(block.attrs.classes).toContain('purple');
		expect(block.attrs.id).toBe('book');

		const markdown = tiptapToMarkdown(json);
		expect(markdown).toContain('#book');
		expect(markdown).toContain('purple');
		expect(markdown).toContain('text-align:center');
		expect(markdown).toContain('background:#aa88aa55');
		expect(markdown).toContain('Wheel of Time.');
	});
});
