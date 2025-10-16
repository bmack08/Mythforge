import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';
import { tiptapToMarkdown } from '../../shared/helpers/tiptapToMarkdown.js';

describe('Layout Tokens Parity', ()=>{
	test('parses page break attributes', ()=>{
		const md = '\\page{#cover,pageClass,color:red}\nContent on new page';
		const json = markdownToTiptap(md);

		expect(json.content[0].type).toBe('pageBreak');
		expect(json.content[0].attrs.id).toBe('cover');
		expect(json.content[0].attrs.classes).toContain('pageClass');
		expect(json.content[0].attrs.styles.color).toBe('red');

		const roundTrip = tiptapToMarkdown(json);
		expect(roundTrip).toContain('\\page{#cover,pageClass,color:red}');
	});

	test('parses column break attributes', ()=>{
		const md = '\\column{columnClass,width:50%}\nMore content';
		const json = markdownToTiptap(md);

		expect(json.content[0].type).toBe('columnBreak');
		expect(json.content[0].attrs.classes).toContain('columnClass');
		expect(json.content[0].attrs.styles.width).toBe('50%');

		const roundTrip = tiptapToMarkdown(json);
		expect(roundTrip).toContain('\\column{columnClass,width:50%}');
	});
});
