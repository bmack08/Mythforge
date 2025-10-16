import { extractVariableDefinitions, normalizeVarName } from '../../shared/helpers/variableUtils.js';

describe('Variable Utils', ()=>{
	test('normalizes label whitespace', ()=>{
		expect(normalizeVarName('  My   Var  ')).toBe('My Var');
	});

	test('extracts block variable definitions', ()=>{
		const source = [
			'[Title]: Legendary Sword',
			'',
			'$[mathVar]: 1 + 2',
			'',
			'Text content'
		].join('\n');

		const defs = extractVariableDefinitions(source);
		expect(defs).toHaveLength(2);
		expect(defs[0]).toMatchObject({ label: 'Title', content: 'Legendary Sword' });
		expect(defs[1]).toMatchObject({ label: 'mathVar', content: '1 + 2' });
	});
});
