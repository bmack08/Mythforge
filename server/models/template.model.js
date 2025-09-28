// Mythwright Template Model - Reusable Content Patterns
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class Template extends Model {
	// Static method to get built-in template categories
	static getTemplateCategories() {
		return {
			'encounter': {
				description: 'Combat and challenge templates',
				subcategories: ['combat', 'social', 'exploration', 'puzzle'],
				requiredFields: ['difficulty', 'partySize', 'environment']
			},
			'npc': {
				description: 'Non-player character templates',
				subcategories: ['merchant', 'noble', 'commoner', 'villain', 'ally'],
				requiredFields: ['race', 'occupation', 'personality']
			},
			'location': {
				description: 'Location and environment templates',
				subcategories: ['dungeon', 'settlement', 'wilderness', 'building'],
				requiredFields: ['size', 'purpose', 'inhabitants']
			},
			'quest': {
				description: 'Quest and adventure hooks',
				subcategories: ['main', 'side', 'personal', 'faction'],
				requiredFields: ['questGiver', 'objective', 'reward']
			},
			'item': {
				description: 'Magic item and treasure templates',
				subcategories: ['weapon', 'armor', 'wondrous', 'consumable'],
				requiredFields: ['rarity', 'itemType', 'properties']
			},
			'organization': {
				description: 'Guild, faction, and organization templates',
				subcategories: ['guild', 'cult', 'government', 'criminal'],
				requiredFields: ['goals', 'structure', 'resources']
			},
			'event': {
				description: 'Random events and complications',
				subcategories: ['combat', 'social', 'environmental', 'supernatural'],
				requiredFields: ['trigger', 'consequences', 'resolution']
			}
		};
	}
	
	// Static method to validate template structure
	static validateTemplateStructure(templateData, category) {
		const errors = [];
		const categories = Template.getTemplateCategories();
		
		if (!categories[category]) {
			errors.push(`Invalid template category: ${category}`);
			return errors;
		}
		
		const categoryInfo = categories[category];
		const requiredFields = categoryInfo.requiredFields || [];
		
		// Check required fields
		requiredFields.forEach(field => {
			if (!templateData.variables || !templateData.variables.find(v => v.name === field)) {
				errors.push(`Required field missing: ${field}`);
			}
		});
		
		// Validate variables structure
		if (templateData.variables) {
			templateData.variables.forEach((variable, index) => {
				if (!variable.name) {
					errors.push(`Variable ${index + 1} missing name`);
				}
				if (!variable.type) {
					errors.push(`Variable ${index + 1} missing type`);
				}
			});
		}
		
		return errors;
	}
	
	// Instance method to process template with variables
	processTemplate(variables = {}) {
		try {
			let processedContent = this.content;
			let processedTitle = this.title;
			
			// Process variables in content and title
			this.variables.forEach(variable => {
				const placeholder = `{{${variable.name}}}`;
				const value = variables[variable.name] || variable.defaultValue || '';
				
				// Handle different variable types
				let processedValue = value;
				
				switch (variable.type) {
					case 'number':
						processedValue = parseInt(value) || 0;
						break;
					case 'boolean':
						processedValue = Boolean(value);
						break;
					case 'array':
						if (Array.isArray(value)) {
							processedValue = value.join(', ');
						} else {
							processedValue = String(value);
						}
						break;
					case 'dice':
						// Handle dice notation (e.g., "1d6+2")
						processedValue = this.rollDice(String(value));
						break;
					default:
						processedValue = String(value);
				}
				
				// Replace all instances
				processedContent = processedContent.replace(new RegExp(placeholder, 'g'), processedValue);
				processedTitle = processedTitle.replace(new RegExp(placeholder, 'g'), processedValue);
			});
			
			// Process conditional blocks {{#if variable}}...{{/if}}
			processedContent = this.processConditionals(processedContent, variables);
			
			// Process loops {{#each array}}...{{/each}}
			processedContent = this.processLoops(processedContent, variables);
			
			return {
				title: processedTitle,
				content: processedContent,
				processedAt: new Date(),
				variables: variables
			};
			
		} catch (error) {
			throw new Error(`Template processing failed: ${error.message}`);
		}
	}
	
	// Instance method to process conditional blocks
	processConditionals(content, variables) {
		const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
		
		return content.replace(conditionalRegex, (match, variableName, block) => {
			const value = variables[variableName];
			
			// Check if condition is truthy
			if (value && value !== 'false' && value !== '0' && value !== '') {
				return block;
			}
			
			return '';
		});
	}
	
	// Instance method to process loops
	processLoops(content, variables) {
		const loopRegex = /\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs;
		
		return content.replace(loopRegex, (match, arrayName, block) => {
			const array = variables[arrayName];
			
			if (!Array.isArray(array)) {
				return '';
			}
			
			return array.map((item, index) => {
				let processedBlock = block;
				
				// Replace {{this}} with current item
				processedBlock = processedBlock.replace(/\{\{this\}\}/g, item);
				
				// Replace {{@index}} with current index
				processedBlock = processedBlock.replace(/\{\{@index\}\}/g, index);
				
				// If item is an object, replace {{property}} with item.property
				if (typeof item === 'object') {
					Object.keys(item).forEach(key => {
						const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
						processedBlock = processedBlock.replace(placeholder, item[key]);
					});
				}
				
				return processedBlock;
			}).join('');
		});
	}
	
	// Instance method to roll dice (simple implementation)
	rollDice(diceNotation) {
		const diceRegex = /(\d+)d(\d+)([+-]\d+)?/;
		const match = diceNotation.match(diceRegex);
		
		if (!match) {
			return diceNotation; // Return as-is if not dice notation
		}
		
		const numDice = parseInt(match[1]);
		const dieSize = parseInt(match[2]);
		const modifier = match[3] ? parseInt(match[3]) : 0;
		
		let total = 0;
		for (let i = 0; i < numDice; i++) {
			total += Math.floor(Math.random() * dieSize) + 1;
		}
		
		return total + modifier;
	}
	
	// Instance method to validate template
	validateTemplate() {
		const errors = [];
		const warnings = [];
		
		// Required fields
		if (!this.name) errors.push('Template name is required');
		if (!this.category) errors.push('Template category is required');
		if (!this.content) errors.push('Template content is required');
		
		// Validate category
		const categories = Template.getTemplateCategories();
		if (this.category && !categories[this.category]) {
			errors.push(`Invalid category: ${this.category}`);
		}
		
		// Validate template structure
		const structureErrors = Template.validateTemplateStructure(
			{ variables: this.variables }, 
			this.category
		);
		errors.push(...structureErrors);
		
		// Check for unused variables
		if (this.variables) {
			this.variables.forEach(variable => {
				const placeholder = `{{${variable.name}}}`;
				if (!this.content.includes(placeholder)) {
					warnings.push(`Variable '${variable.name}' is defined but not used`);
				}
			});
		}
		
		// Check for undefined variables in content
		const variableMatches = this.content.match(/\{\{(\w+)\}\}/g) || [];
		const definedVariables = (this.variables || []).map(v => v.name);
		
		variableMatches.forEach(match => {
			const variableName = match.replace(/\{\{|\}\}/g, '');
			if (!definedVariables.includes(variableName) && 
				!['this', '@index'].includes(variableName)) {
				warnings.push(`Undefined variable used: ${variableName}`);
			}
		});
		
		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}
	
	// Instance method to clone template
	async cloneTemplate(newName, userId) {
		const clonedData = {
			...this.toJSON(),
			id: nanoid(12),
			name: newName || `${this.name} (Copy)`,
			createdBy: userId,
			isPublic: false,
			usageCount: 0,
			version: 1,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		
		delete clonedData.deletedAt;
		
		const clonedTemplate = await Template.create(clonedData);
		return clonedTemplate;
	}
	
	// Instance method to generate preview
	generatePreview(sampleVariables = {}) {
		// Use default values if no sample provided
		const previewVariables = { ...sampleVariables };
		
		this.variables.forEach(variable => {
			if (!previewVariables[variable.name]) {
				previewVariables[variable.name] = variable.defaultValue || variable.exampleValue || `[${variable.name}]`;
			}
		});
		
		return this.processTemplate(previewVariables);
	}
}

// Initialize the Template model
const initTemplateModel = (sequelize) => {
	Template.init({
		id: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			defaultValue: () => nanoid(12),
			allowNull: false
		},
		
		// Basic Information
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 255]
			}
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		
		// Categorization
		category: {
			type: DataTypes.ENUM,
			values: ['encounter', 'npc', 'location', 'quest', 'item', 'organization', 'event'],
			allowNull: false
		},
		subcategory: {
			type: DataTypes.STRING,
			allowNull: true
		},
		
		// Template Content
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: 'Template content with variable placeholders'
		},
		
		// Variables Definition
		variables: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of variable definitions with types, defaults, etc.'
		},
		
		// Template Configuration
		configuration: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				outputFormat: 'markdown', // markdown, html, json
				allowCustomization: true,
				requiresValidation: false,
				autoGenerate: false
			}
		},
		
		// Usage & Compatibility
		compatibleWith: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				partyLevels: [1, 20],
				partySizes: [3, 6],
				systems: ['5e'],
				themes: []
			}
		},
		
		// Authorship
		createdBy: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: 'User ID of template creator'
		},
		isOfficial: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
			comment: 'Whether this is an official Mythwright template'
		},
		
		// Publishing & Sharing
		isPublic: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		isPublished: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		publishedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		
		// Usage Statistics
		usageCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
		rating: {
			type: DataTypes.FLOAT,
			allowNull: true,
			validate: {
				min: 1,
				max: 5
			}
		},
		ratingCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
		
		// Quality & Validation
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
		
		qualityScore: {
			type: DataTypes.INTEGER,
			defaultValue: 100,
			allowNull: false,
			validate: {
				min: 0,
				max: 100
			}
		},
		
		// Dependencies & Requirements
		dependencies: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of required templates or resources'
		},
		
		// Examples & Documentation
		examples: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of example usages with sample variables'
		},
		
		documentation: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Detailed usage instructions and tips'
		},
		
		// Marketplace Integration
		marketplaceData: {
			type: DataTypes.JSON,
			allowNull: true,
			comment: 'Marketplace-specific data when published'
		},
		
		// Tags for categorization and search
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
		},
		parentTemplateId: {
			type: DataTypes.STRING(12),
			allowNull: true,
			references: {
				model: 'mythwright_templates',
				key: 'id'
			},
			comment: 'If this is a variant of another template'
		}
		
	}, {
		sequelize,
		modelName: 'Template',
		tableName: 'mythwright_templates',
		timestamps: true,
		paranoid: true, // Soft delete support
		indexes: [
			{
				fields: ['name']
			},
			{
				fields: ['category']
			},
			{
				fields: ['subcategory']
			},
			{
				fields: ['createdBy']
			},
			{
				fields: ['isPublic']
			},
			{
				fields: ['isPublished']
			},
			{
				fields: ['isOfficial']
			},
			{
				fields: ['rating']
			},
			{
				fields: ['usageCount']
			},
			{
				fields: ['tags']
			},
			{
				fields: ['parentTemplateId']
			}
		],
		hooks: {
			// Auto-validate template after save
			afterSave: async (template) => {
				if (template.changed('content') || template.changed('variables') || template.changed('category')) {
					const validation = template.validateTemplate();
					
					template.validationResults = {
						...validation,
						lastValidated: new Date()
					};
					
					// Calculate quality score based on validation
					let qualityScore = 100;
					qualityScore -= validation.errors.length * 20;
					qualityScore -= validation.warnings.length * 5;
					qualityScore = Math.max(0, qualityScore);
					
					template.qualityScore = qualityScore;
					
					// Save without triggering hooks again
					await template.save({ hooks: false });
				}
			},
			
			// Increment usage count when template is processed
			afterFind: (templates) => {
				// This would be called from a separate method when template is actually used
			}
		},
		validate: {
			// Validate variables structure
			validVariables() {
				if (this.variables && Array.isArray(this.variables)) {
					this.variables.forEach((variable, index) => {
						if (!variable.name) {
							throw new Error(`Variable ${index + 1} must have a name`);
						}
						if (!variable.type) {
							throw new Error(`Variable ${index + 1} must have a type`);
						}
						
						const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'dice'];
						if (!validTypes.includes(variable.type)) {
							throw new Error(`Invalid variable type: ${variable.type}`);
						}
					});
				}
			},
			
			// Validate parent template relationship
			noCircularReference() {
				// Prevent templates from referencing themselves as parent
				if (this.parentTemplateId === this.id) {
					throw new Error('Template cannot be its own parent');
				}
			}
		}
	});
	
	return Template;
};

export { Template as model, initTemplateModel };
