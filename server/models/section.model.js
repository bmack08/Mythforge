// Mythwright Section Model - Detailed Content Blocks
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class Section extends Model {
	// Static method to get sections by type
	static async getByType(chapterId, sectionType) {
		try {
			return await this.findAll({
				where: { chapterId, sectionType },
				order: [['orderIndex', 'ASC']]
			});
		} catch (error) {
			console.error('Error in Section.getByType:', error);
			throw error;
		}
	}
	
	// Instance method to validate content based on type
	validateContent() {
		const validators = {
			statblock: this.validateStatBlock,
			encounter: this.validateEncounter,
			magicitem: this.validateMagicItem,
			npc: this.validateNPC,
			location: this.validateLocation,
			table: this.validateTable
		};
		
		const validator = validators[this.sectionType];
		if (validator) {
			return validator.call(this);
		}
		
		return { valid: true, errors: [] };
	}
	
	// Stat block validation
	validateStatBlock() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.name) errors.push('Stat block must have a name');
		if (!data.armorClass) errors.push('Stat block must have AC');
		if (!data.hitPoints) errors.push('Stat block must have HP');
		if (!data.challengeRating) errors.push('Stat block must have CR');
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// Encounter validation
	validateEncounter() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.creatures || data.creatures.length === 0) {
			errors.push('Encounter must have at least one creature');
		}
		
		if (!data.xpBudget || data.xpBudget <= 0) {
			errors.push('Encounter must have valid XP budget');
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// Magic item validation
	validateMagicItem() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.name) errors.push('Magic item must have a name');
		if (!data.rarity) errors.push('Magic item must have rarity');
		if (!data.description) errors.push('Magic item must have description');
		
		const validRarities = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];
		if (data.rarity && !validRarities.includes(data.rarity)) {
			errors.push('Invalid rarity level');
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// NPC validation
	validateNPC() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.name) errors.push('NPC must have a name');
		if (!data.race) errors.push('NPC must have a race');
		if (!data.occupation) errors.push('NPC must have an occupation');
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// Location validation
	validateLocation() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.name) errors.push('Location must have a name');
		if (!data.description) errors.push('Location must have description');
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// Random table validation
	validateTable() {
		const errors = [];
		const data = this.contentData;
		
		if (!data.name) errors.push('Table must have a name');
		if (!data.entries || data.entries.length === 0) {
			errors.push('Table must have at least one entry');
		}
		
		return {
			valid: errors.length === 0,
			errors
		};
	}
	
	// Instance method to generate Homebrewery markdown
	toHomebreweryMarkdown() {
		const generators = {
			text: this.generateTextMarkdown,
			statblock: this.generateStatBlockMarkdown,
			encounter: this.generateEncounterMarkdown,
			magicitem: this.generateMagicItemMarkdown,
			npc: this.generateNPCMarkdown,
			location: this.generateLocationMarkdown,
			table: this.generateTableMarkdown,
			boxedtext: this.generateBoxedTextMarkdown,
			sidebar: this.generateSidebarMarkdown
		};
		
		const generator = generators[this.sectionType];
		if (generator) {
			return generator.call(this);
		}
		
		return this.content || '';
	}
	
	// Markdown generators for different content types
	generateTextMarkdown() {
		return this.content || '';
	}
	
	generateStatBlockMarkdown() {
		const data = this.contentData;
		return `
___
> ## ${data.name}
> *${data.size} ${data.type}, ${data.alignment}*
> ___
> - **Armor Class** ${data.armorClass}
> - **Hit Points** ${data.hitPoints}
> - **Speed** ${data.speed}
> ___
> |STR|DEX|CON|INT|WIS|CHA|
> |:---:|:---:|:---:|:---:|:---:|:---:|
> |${data.abilities?.str || 10}|${data.abilities?.dex || 10}|${data.abilities?.con || 10}|${data.abilities?.int || 10}|${data.abilities?.wis || 10}|${data.abilities?.cha || 10}|
> ___
> - **Challenge Rating** ${data.challengeRating}
> ___
${data.description || ''}
`;
	}
	
	generateEncounterMarkdown() {
		const data = this.contentData;
		let markdown = `### ${data.name}\n\n`;
		
		if (data.description) {
			markdown += `${data.description}\n\n`;
		}
		
		markdown += `**XP Budget:** ${data.xpBudget}\n\n`;
		
		if (data.creatures && data.creatures.length > 0) {
			markdown += `**Creatures:**\n`;
			data.creatures.forEach(creature => {
				markdown += `- ${creature.count}x ${creature.name} (CR ${creature.cr})\n`;
			});
		}
		
		return markdown;
	}
	
	generateMagicItemMarkdown() {
		const data = this.contentData;
		return `
> ##### ${data.name}
> *${data.type}, ${data.rarity}${data.requiresAttunement ? ' (requires attunement)' : ''}*
>
> ${data.description}
`;
	}
	
	generateNPCMarkdown() {
		const data = this.contentData;
		let markdown = `#### ${data.name}\n`;
		markdown += `*${data.race} ${data.occupation}*\n\n`;
		
		if (data.description) {
			markdown += `${data.description}\n\n`;
		}
		
		if (data.personality) {
			markdown += `**Personality:** ${data.personality}\n\n`;
		}
		
		if (data.ideals) {
			markdown += `**Ideals:** ${data.ideals}\n\n`;
		}
		
		if (data.bonds) {
			markdown += `**Bonds:** ${data.bonds}\n\n`;
		}
		
		if (data.flaws) {
			markdown += `**Flaws:** ${data.flaws}\n\n`;
		}
		
		return markdown;
	}
	
	generateLocationMarkdown() {
		const data = this.contentData;
		let markdown = `### ${data.name}\n\n`;
		
		if (data.description) {
			markdown += `${data.description}\n\n`;
		}
		
		if (data.features && data.features.length > 0) {
			markdown += `**Features:**\n`;
			data.features.forEach((feature, index) => {
				markdown += `${index + 1}. **${feature.name}:** ${feature.description}\n`;
			});
		}
		
		return markdown;
	}
	
	generateTableMarkdown() {
		const data = this.contentData;
		let markdown = `##### ${data.name}\n`;
		
		if (data.diceFormula) {
			markdown += `*${data.diceFormula}*\n\n`;
		}
		
		markdown += `| d${data.diceSize || 20} | Result |\n`;
		markdown += `|:---:|:---|\n`;
		
		data.entries?.forEach(entry => {
			const range = entry.min === entry.max ? entry.min : `${entry.min}-${entry.max}`;
			markdown += `| ${range} | ${entry.result} |\n`;
		});
		
		return markdown;
	}
	
	generateBoxedTextMarkdown() {
		return `> ${this.content?.replace(/\n/g, '\n> ') || ''}`;
	}
	
	generateSidebarMarkdown() {
		const data = this.contentData;
		return `
<div class='sidebar'>

##### ${data.title || 'Sidebar'}

${this.content || ''}

</div>
`;
	}
}

// Initialize the Section model
const initSectionModel = (sequelize) => {
	Section.init({
		id: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			defaultValue: () => nanoid(12),
			allowNull: false
		},
		chapterId: {
			type: DataTypes.STRING(12),
			allowNull: false,
			references: {
				model: 'mythwright_chapters',
				key: 'id'
			}
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 255]
			}
		},
		
		// Section Type & Content
		sectionType: {
			type: DataTypes.ENUM,
			values: [
				'text',        // Regular text content
				'statblock',   // D&D creature stat block
				'encounter',   // Combat encounter
				'magicitem',   // Magic item description
				'npc',         // Non-player character
				'location',    // Location description
				'table',       // Random table
				'boxedtext',   // Boxed/callout text
				'sidebar',     // Sidebar content
				'handout',     // Player handout
				'map',         // Map reference
				'custom'       // Custom content type
			],
			defaultValue: 'text',
			allowNull: false
		},
		
		// Content Storage
		content: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Raw content (markdown, text, etc.)'
		},
		
		contentData: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {},
			comment: 'Structured data for specific content types'
		},
		
		// Ordering & Hierarchy
		orderIndex: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
		
		// Generation Metadata
		generationSettings: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				aiGenerated: false,
				model: null,
				prompt: null,
				temperature: 0.8,
				generatedAt: null,
				tokensUsed: 0,
				cost: 0
			}
		},
		
		// Validation & Quality
		validationResults: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				isValid: true,
				errors: [],
				warnings: [],
				lastValidated: null
			}
		},
		
		// Accessibility
		accessibilityData: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				altText: null,
				ariaLabel: null,
				headingLevel: null,
				isDecorative: false
			}
		},
		
		// Publishing
		isVisible: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		
		// Cross-references
		references: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of references to other sections/content'
		},
		
		// Tags and metadata
		tags: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of tags for categorization'
		},
		
		// Version control
		version: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		}
		
	}, {
		sequelize,
		modelName: 'Section',
		tableName: 'mythwright_sections',
		timestamps: true,
		paranoid: true, // Soft delete support
		indexes: [
			{
				fields: ['chapterId']
			},
			{
				fields: ['sectionType']
			},
			{
				fields: ['chapterId', 'orderIndex']
			},
			{
				fields: ['isVisible']
			},
			{
				fields: ['tags']
			}
		],
		hooks: {
			// Validate content after save
			afterSave: async (section) => {
				if (section.changed('content') || section.changed('contentData')) {
					const validation = section.validateContent();
					section.validationResults = {
						...validation,
						lastValidated: new Date()
					};
					
					// Save validation results without triggering hooks
					await section.save({ hooks: false });
				}
			}
		}
	});
	
	return Section;
};

export { Section as model, initSectionModel };
