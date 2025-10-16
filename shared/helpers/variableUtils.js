const normalizeVarName = (label='')=>{
	return label.trim().replace(/\s+/g, ' ');
};

/**
 * Extract variable definitions from legacy markdown.
 * Matches constructs like:
 * [var]: content
 * $[mathVar]: 1 + 2
 */
const VARIABLE_DEF_REGEX = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:(?!\() *((?:\n? *[^\s].*)+?)(?=\n{2,}|$)/gm;

export const extractVariableDefinitions = (text='')=>{
	const definitions = [];
	let match;

	while ((match = VARIABLE_DEF_REGEX.exec(text)) !== null) {
		const rawLabel = match[1];
		const normalizedLabel = normalizeVarName(rawLabel);
		const content = match[2].replace(/[ \t]+/g, ' ').trim();

		definitions.push({
			label    : normalizedLabel,
			rawLabel : rawLabel,
			content
		});
	}

	return definitions;
};

export {
	normalizeVarName
};

export default {
	normalizeVarName,
	extractVariableDefinitions
};
