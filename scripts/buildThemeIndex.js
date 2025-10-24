/**
 * Build themes.index.json from themes directory
 * Extracts mustache-like tokens and reusable sections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THEMES_DIR = path.join(__dirname, '../themes');
const OUTPUT_FILE = path.join(__dirname, '../themes.index.json');

async function buildThemeIndex() {
	console.log('🎨 Building themes index...');
	
	const themeIndex = {
		tokens: [],
		sections: [],
		lastUpdated: new Date().toISOString()
	};

	function scanDirectory(dir, relativePath = '') {
		const items = fs.readdirSync(dir);
		
		for (const item of items) {
			const fullPath = path.join(dir, item);
			const itemRelativePath = path.join(relativePath, item);
			
			if (fs.statSync(fullPath).isDirectory()) {
				scanDirectory(fullPath, itemRelativePath);
			} else if (item.endsWith('.less') || item.endsWith('.css') || item.endsWith('.html')) {
				try {
					const content = fs.readFileSync(fullPath, 'utf8');
					
					// Extract mustache-like tokens {{tokenName}}
					const tokenMatches = content.match(/\{\{[^}]+\}\}/g);
					if (tokenMatches) {
						for (const match of tokenMatches) {
							const tokenName = match.slice(2, -2);
							
							// Find existing token or create new one
							let existingToken = themeIndex.tokens.find(t => t.name === tokenName);
							if (!existingToken) {
								existingToken = {
									name: tokenName,
									files: [],
									examples: []
								};
								themeIndex.tokens.push(existingToken);
							}
							
							if (!existingToken.files.includes(itemRelativePath)) {
								existingToken.files.push(itemRelativePath);
							}
							
							// Extract context around the token (up to 100 chars before/after)
							const matchIndex = content.indexOf(match);
							const contextStart = Math.max(0, matchIndex - 100);
							const contextEnd = Math.min(content.length, matchIndex + match.length + 100);
							const context = content.slice(contextStart, contextEnd).trim();
							
							if (existingToken.examples.length < 3) {
								existingToken.examples.push(context);
							}
						}
					}
					
					// Look for reusable sections (class definitions, major blocks)
					const classMatches = content.match(/\.[\w-]+\s*\{[^}]*\}/g);
					if (classMatches && classMatches.length > 0) {
						const section = {
							file: itemRelativePath,
							type: 'css-classes',
							classes: classMatches.slice(0, 5).map(m => m.split('{')[0].trim())
						};
						themeIndex.sections.push(section);
					}
					
				} catch (error) {
					console.warn(`Warning: Could not read ${fullPath}:`, error.message);
				}
			}
		}
	}

	if (fs.existsSync(THEMES_DIR)) {
		scanDirectory(THEMES_DIR);
	} else {
		console.warn('⚠️ Themes directory not found:', THEMES_DIR);
	}

	// Write the index
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(themeIndex, null, 2));
	
	console.log(`✅ Themes index created with ${themeIndex.tokens.length} tokens and ${themeIndex.sections.length} sections`);
	console.log('📝 Output:', OUTPUT_FILE);
	
	return themeIndex;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	buildThemeIndex().catch(console.error);
}

export default buildThemeIndex;
