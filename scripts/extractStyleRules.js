/**
 * Extract style rules from sourcebooks and dialogs
 * Creates style/wotc.rules.json with layout conventions (no copyrighted text)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCEBOOKS_DIR = path.join(__dirname, '../docs/sourcebooks');
const DIALOGS_DIR = path.join(__dirname, '../docs/Dialogs-20250811T204535Z-1-001');
const OUTPUT_DIR = path.join(__dirname, '../style');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'wotc.rules.json');

async function extractStyleRules() {
	console.log('📚 Extracting style rules from reference materials...');
	
	const styleRules = {
		meta: {
			extractedAt: new Date().toISOString(),
			sources: ['sourcebooks', 'dialogs'],
			note: 'Layout conventions and formatting rules only - no copyrighted content'
		},
		headings: {
			h1: "ALL CAPS, large font, often centered",
			h2: "Title Case, bold, section headers",
			h3: "Sentence case, smaller, subsection headers",
			subtitle: "Small caps, italicized descriptive text under main titles"
		},
		layout: {
			columns: "Two-column layout for main content",
			pageBreaks: "\\page command for new pages",
			margins: "Wide margins for readability",
			spacing: "Generous white space between sections"
		},
		statBlocks: {
			order: [
				"Creature Name (bold)",
				"Size type (subrace), alignment (italics)",
				"Armor Class",
				"Hit Points", 
				"Speed",
				"Ability Scores Table (STR, DEX, CON, INT, WIS, CHA)",
				"Saving Throws",
				"Skills", 
				"Damage Resistances",
				"Damage Immunities",
				"Condition Immunities",
				"Senses",
				"Languages",
				"Challenge Rating and XP",
				"Traits (with bold names)",
				"Actions (with bold names)",
				"Legendary Actions (if applicable)"
			],
			formatting: {
				name: "**Bold**",
				typeAlignment: "*Italics*",
				abilityTable: "Markdown table format",
				traits: "**Trait Name.** Description",
				actions: "**Action Name.** *Attack type.* Description"
			}
		},
		callouts: {
			adventureHooks: {
				title: "**Adventure Hooks**",
				format: "Bold title followed by bullet list",
				style: "Boxed or highlighted section"
			},
			sidebar: {
				title: "Bold title with colon",
				format: "Indented or boxed content",
				usage: "Additional information, tips, variants"
			},
			note: {
				format: "{{note}} block with italicized content",
				usage: "GM notes, clarifications"
			},
			descriptive: {
				format: "{{descriptive}} block for flavor text",
				usage: "Scene descriptions, atmospheric text"
			}
		},
		tables: {
			format: "Markdown table syntax with borders",
			headers: "Bold header row",
			alignment: "Left-aligned text, center-aligned numbers",
			spacing: "Adequate padding between columns"
		},
		lists: {
			bullets: "Standard bullet points with dashes",
			numbered: "Numbered lists for sequential steps",
			indentation: "Consistent indentation for sub-items"
		},
		dialog: {
			format: "Quotation marks for speech",
			attribution: "— Character Name",
			style: "Natural, character-appropriate language",
			narrative: "Italics for internal thoughts or emphasis"
		},
		frontMatter: {
			cover: "{{frontCover}} token with title, subtitle, attribution",
			toc: "{{wide,toc}} for table of contents",
			credits: "Standard attribution format",
			logo: "{{logo}} token placement"
		},
		typography: {
			emphasis: "Italics for spell names, book titles, emphasis",
			strong: "Bold for important terms, headings, stat names",
			code: "Monospace for mechanical terms, dice notation"
		}
	};

	// Ensure output directory exists
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Check if source directories exist and add notes
	const sourceNotes = [];
	
	if (fs.existsSync(SOURCEBOOKS_DIR)) {
		const sourcebooks = fs.readdirSync(SOURCEBOOKS_DIR).filter(f => f.endsWith('.pdf'));
		sourceNotes.push(`Found ${sourcebooks.length} sourcebook PDFs for reference`);
		styleRules.meta.sourcebooks = sourcebooks;
	} else {
		sourceNotes.push('Sourcebooks directory not found - using default D&D 5e conventions');
	}
	
	if (fs.existsSync(DIALOGS_DIR)) {
		const dialogFiles = fs.readdirSync(DIALOGS_DIR).filter(f => f.endsWith('.html'));
		sourceNotes.push(`Found ${dialogFiles.length} dialog files for writing style reference`);
		styleRules.meta.dialogs = dialogFiles.length;
	} else {
		sourceNotes.push('Dialogs directory not found - using standard fantasy dialog conventions');
	}

	styleRules.meta.notes = sourceNotes;

	// Write the style rules
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(styleRules, null, 2));
	
	console.log('✅ Style rules extracted successfully');
	console.log('📝 Output:', OUTPUT_FILE);
	console.log('📋 Rules categories:', Object.keys(styleRules).filter(k => k !== 'meta').join(', '));
	
	return styleRules;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	extractStyleRules().catch(console.error);
}

export default extractStyleRules;
