// Mythwright MagicItem Model - Magic Items with Rarity/Attunement Tracking
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class MagicItem extends Model {
	// Static method to get suggested price ranges by rarity (DMG guidelines)
	static getPriceRange(rarity) {
		const priceRanges = {
			'common': { min: 50, max: 100 },
			'uncommon': { min: 101, max: 500 },
			'rare': { min: 501, max: 5000 },
			'very rare': { min: 5001, max: 50000 },
			'legendary': { min: 50001, max: 500000 },
			'artifact': { min: 500000, max: null } // Priceless
		};
		
		return priceRanges[rarity] || { min: 0, max: 0 };
	}
	
	// Static method to validate attunement requirements
	static validateAttunement(attunementType, attunementRequirement) {
		const validTypes = ['none', 'required', 'optional'];
		const validRequirements = [
			'any',
			'spellcaster',
			'by a creature of good alignment',
			'by a creature of evil alignment',
			'by a creature of chaotic alignment',
			'by a creature of lawful alignment',
			'by a creature of neutral alignment',
			'by a bard',
			'by a cleric',
			'by a druid',
			'by a paladin',
			'by a ranger',
			'by a sorcerer',
			'by a warlock',
			'by a wizard',
			'by a barbarian',
			'by a fighter',
			'by a monk',
			'by a rogue',
			'by a creature with Strength 13 or higher',
			'by a creature with Dexterity 13 or higher',
			'by a creature with Constitution 13 or higher',
			'by a creature with Intelligence 13 or higher',
			'by a creature with Wisdom 13 or higher',
			'by a creature with Charisma 13 or higher'
		];
		
		const errors = [];
		
		if (!validTypes.includes(attunementType)) {
			errors.push('Invalid attunement type');
		}
		
		if (attunementType !== 'none' && attunementRequirement && 
			!validRequirements.includes(attunementRequirement)) {
			errors.push('Invalid attunement requirement');
		}
		
		return errors;
	}
	
	// Static method to categorize magic items
	static categorizeItem(itemType, properties) {
		const categories = {
			// Weapons
			weapon: {
				subcategories: ['melee', 'ranged', 'ammunition'],
				properties: ['finesse', 'light', 'heavy', 'reach', 'thrown', 'versatile', 'two-handed']
			},
			// Armor
			armor: {
				subcategories: ['light', 'medium', 'heavy', 'shield'],
				properties: ['stealth disadvantage']
			},
			// Wondrous Items
			'wondrous item': {
				subcategories: ['worn', 'held', 'consumable', 'container'],
				properties: ['charges', 'cursed', 'sentient']
			},
			// Consumables
			potion: {
				subcategories: ['healing', 'enhancement', 'utility'],
				properties: ['single-use']
			},
			scroll: {
				subcategories: ['spell', 'protection'],
				properties: ['single-use', 'spell level']
			},
			// Tools & Instruments
			tool: {
				subcategories: ['artisan', 'gaming', 'musical'],
				properties: ['proficiency bonus']
			}
		};
		
		return categories[itemType] || { subcategories: [], properties: [] };
	}
	
	// Instance method to calculate treasure value
	calculateTreasureValue(partyLevel = 5) {
		const baseValues = MagicItem.getPriceRange(this.rarity);
		let value = (baseValues.min + (baseValues.max || baseValues.min)) / 2;
		
		// Adjust for attunement (attunement items are generally more valuable)
		if (this.attunementType === 'required') {
			value *= 1.2;
		}
		
		// Adjust for charges/uses
		if (this.properties.charges) {
			const maxCharges = this.properties.maxCharges || 1;
			const currentCharges = this.properties.currentCharges || maxCharges;
			value *= (currentCharges / maxCharges);
		}
		
		// Adjust for cursed items (less valuable)
		if (this.properties.cursed) {
			value *= 0.5;
		}
		
		// Adjust for party level (higher level parties get more valuable items)
		const levelMultiplier = Math.max(0.5, Math.min(2.0, partyLevel / 10));
		value *= levelMultiplier;
		
		return Math.round(value);
	}
	
	// Instance method to check if item is appropriate for level
	isAppropriateForLevel(partyLevel) {
		const levelRanges = {
			'common': { min: 1, max: 20 },
			'uncommon': { min: 1, max: 20 },
			'rare': { min: 5, max: 20 },
			'very rare': { min: 11, max: 20 },
			'legendary': { min: 17, max: 20 },
			'artifact': { min: 20, max: 20 }
		};
		
		const range = levelRanges[this.rarity];
		return range && partyLevel >= range.min && partyLevel <= range.max;
	}
	
	// Instance method to validate magic item
	validateMagicItem() {
		const errors = [];
		const warnings = [];
		
		// Required fields
		if (!this.name) errors.push('Name is required');
		if (!this.itemType) errors.push('Item type is required');
		if (!this.rarity) errors.push('Rarity is required');
		if (!this.description) errors.push('Description is required');
		
		// Validate rarity
		const validRarities = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];
		if (this.rarity && !validRarities.includes(this.rarity)) {
			errors.push('Invalid rarity level');
		}
		
		// Validate attunement
		const attunementErrors = MagicItem.validateAttunement(
			this.attunementType, 
			this.attunementRequirement
		);
		errors.push(...attunementErrors);
		
		// Check for appropriate complexity
		if (this.rarity === 'common' && this.description.length > 500) {
			warnings.push('Common items should have simpler descriptions');
		}
		
		if (this.rarity === 'legendary' && this.description.length < 200) {
			warnings.push('Legendary items should have more detailed descriptions');
		}
		
		// Validate charges
		if (this.properties.charges && this.properties.maxCharges) {
			if (this.properties.currentCharges > this.properties.maxCharges) {
				errors.push('Current charges cannot exceed maximum charges');
			}
		}
		
		// Check for cursed items
		if (this.properties.cursed && this.rarity === 'common') {
			warnings.push('Cursed items are typically uncommon or higher rarity');
		}
		
		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}
	
	// Instance method to generate Homebrewery markdown
	toHomebreweryMarkdown() {
		let markdown = `> ##### ${this.name}\n`;
		markdown += `> *${this.itemType}${this.subtype ? ` (${this.subtype})` : ''}, ${this.rarity}`;
		
		if (this.attunementType === 'required') {
			markdown += ` (requires attunement`;
			if (this.attunementRequirement && this.attunementRequirement !== 'any') {
				markdown += ` ${this.attunementRequirement}`;
			}
			markdown += `)`;
		}
		
		markdown += `*\n>\n`;
		markdown += `> ${this.description}\n`;
		
		// Add mechanical effects if present
		if (this.mechanicalEffects && this.mechanicalEffects.length > 0) {
			markdown += `>\n`;
			this.mechanicalEffects.forEach(effect => {
				markdown += `> **${effect.name}:** ${effect.description}\n`;
			});
		}
		
		// Add charges information
		if (this.properties.charges) {
			markdown += `>\n`;
			markdown += `> **Charges:** This item has ${this.properties.maxCharges || 1} charges`;
			if (this.properties.chargeRecovery) {
				markdown += ` and regains ${this.properties.chargeRecovery}`;
			}
			markdown += `.\n`;
		}
		
		// Add curse information (hidden in description usually)
		if (this.properties.cursed && this.properties.curseDescription) {
			markdown += `>\n> **Curse:** ${this.properties.curseDescription}\n`;
		}
		
		return markdown;
	}
	
	// Instance method to use charges
	async useCharges(amount = 1) {
		if (!this.properties.charges || !this.properties.currentCharges) {
			throw new Error('This item does not have charges');
		}
		
		if (this.properties.currentCharges < amount) {
			throw new Error('Not enough charges remaining');
		}
		
		this.properties = {
			...this.properties,
			currentCharges: this.properties.currentCharges - amount
		};
		
		await this.save();
		return this.properties.currentCharges;
	}
	
	// Instance method to recharge item
	async recharge(amount = null) {
		if (!this.properties.charges) {
			throw new Error('This item does not have charges');
		}
		
		const maxCharges = this.properties.maxCharges || 1;
		const rechargeAmount = amount || maxCharges;
		
		this.properties = {
			...this.properties,
			currentCharges: Math.min(maxCharges, (this.properties.currentCharges || 0) + rechargeAmount)
		};
		
		await this.save();
		return this.properties.currentCharges;
	}
}

// Initialize the MagicItem model
const initMagicItemModel = (sequelize) => {
	MagicItem.init({
		id: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			defaultValue: () => nanoid(12),
			allowNull: false
		},
		projectId: {
			type: DataTypes.STRING(12),
			allowNull: false,
			references: {
				model: 'mythwright_projects',
				key: 'id'
			}
		},
		chapterId: {
			type: DataTypes.STRING(12),
			allowNull: true,
			references: {
				model: 'mythwright_chapters',
				key: 'id'
			}
		},
		
		// Basic Information
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 255]
			}
		},
		itemType: {
			type: DataTypes.ENUM,
			values: [
				'weapon',
				'armor',
				'shield',
				'wondrous item',
				'potion',
				'scroll',
				'ring',
				'rod',
				'staff',
				'wand',
				'tool',
				'instrument',
				'vehicle',
				'other'
			],
			allowNull: false
		},
		subtype: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: 'Specific weapon/armor type, etc.'
		},
		
		// Rarity & Value
		rarity: {
			type: DataTypes.ENUM,
			values: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'],
			allowNull: false
		},
		estimatedValue: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: 'Estimated gold piece value'
		},
		
		// Attunement
		attunementType: {
			type: DataTypes.ENUM,
			values: ['none', 'required', 'optional'],
			defaultValue: 'none',
			allowNull: false
		},
		attunementRequirement: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: 'Specific attunement requirement (class, alignment, ability score, etc.)'
		},
		
		// Description & Lore
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: 'Full item description'
		},
		flavorText: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Optional flavor text or lore'
		},
		
		// Mechanical Effects
		mechanicalEffects: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of mechanical effects with names and descriptions'
		},
		
		// Properties
		properties: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				charges: false,
				maxCharges: null,
				currentCharges: null,
				chargeRecovery: null,
				cursed: false,
				curseDescription: null,
				sentient: false,
				sentientPersonality: null,
				weight: null,
				dimensions: null
			}
		},
		
		// Combat Statistics (for weapons/armor)
		combatStats: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				attackBonus: null,
				damageBonus: null,
				damageDice: null,
				damageType: null,
				armorClassBonus: null,
				magicBonus: null,
				criticalRange: null,
				specialProperties: []
			}
		},
		
		// Usage & Activation
		activation: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				type: 'passive', // passive, action, bonus action, reaction, minute, hour
				cost: 1,
				condition: null,
				range: null,
				duration: null,
				concentration: false
			}
		},
		
		// Source & Attribution
		source: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: 'Source book or origin'
		},
		isOriginal: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false,
			comment: 'Whether this is original content'
		},
		
		// Generation Metadata
		generationSettings: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				aiGenerated: false,
				model: null,
				prompt: null,
				inspirationSources: [],
				generatedAt: null,
				tokensUsed: 0,
				cost: 0
			}
		},
		
		// Validation Results
		validationResults: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				isValid: true,
				errors: [],
				warnings: [],
				balanceScore: 100,
				lastValidated: null
			}
		},
		
		// Usage Tracking
		usageStats: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				timesAwarded: 0,
				playerFeedback: [],
				balanceIssues: [],
				popularityScore: 0
			}
		},
		
		// Marketplace & Distribution
		isPublished: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		marketplaceData: {
			type: DataTypes.JSON,
			allowNull: true,
			comment: 'Marketplace-specific data when published'
		},
		
		// Tags for categorization
		tags: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Tags for searching and categorization'
		},
		
		// Version control
		version: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		}
		
	}, {
		sequelize,
		modelName: 'MagicItem',
		tableName: 'mythwright_magicitems',
		timestamps: true,
		paranoid: true, // Soft delete support
		indexes: [
			{
				fields: ['projectId']
			},
			{
				fields: ['chapterId']
			},
			{
				fields: ['name']
			},
			{
				fields: ['itemType']
			},
			{
				fields: ['rarity']
			},
			{
				fields: ['attunementType']
			},
			{
				fields: ['isPublished']
			},
			{
				fields: ['tags']
			}
		],
		hooks: {
			// Auto-validate and calculate value after save
			afterSave: async (magicItem) => {
				if (magicItem.changed('rarity') || magicItem.changed('properties') || 
					magicItem.changed('attunementType') || magicItem.changed('description')) {
					
					const validation = magicItem.validateMagicItem();
					const estimatedValue = magicItem.calculateTreasureValue();
					
					magicItem.validationResults = {
						...validation,
						lastValidated: new Date()
					};
					
					magicItem.estimatedValue = estimatedValue;
					
					// Save without triggering hooks again
					await magicItem.save({ hooks: false });
				}
			},
			
			// Initialize charges when created
			beforeCreate: (magicItem) => {
				if (magicItem.properties.charges && magicItem.properties.maxCharges) {
					magicItem.properties.currentCharges = magicItem.properties.maxCharges;
				}
			}
		},
		validate: {
			// Custom validation for attunement consistency
			attunementConsistency() {
				if (this.attunementType === 'none' && this.attunementRequirement) {
					throw new Error('Items with no attunement cannot have attunement requirements');
				}
				
				if (this.attunementType !== 'none' && !this.attunementRequirement) {
					// Default to 'any' if attunement is required but no specific requirement
					this.attunementRequirement = 'any';
				}
			},
			
			// Validate charges configuration
			chargesConfiguration() {
				const props = this.properties;
				if (props.charges) {
					if (!props.maxCharges || props.maxCharges < 1) {
						throw new Error('Items with charges must have maxCharges >= 1');
					}
					if (props.currentCharges && props.currentCharges > props.maxCharges) {
						throw new Error('currentCharges cannot exceed maxCharges');
					}
				}
			}
		}
	});
	
	return MagicItem;
};

export { MagicItem as model, initMagicItemModel };
