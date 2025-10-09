// Mythwright Chapter Model - Hierarchical Content Structure
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class Chapter extends Model {
	// Static method to get chapter tree for a project
	static async getProjectTree(projectId) {
		try {
			const chapters = await this.findAll({
				where: { projectId },
				include: ['sections'],
				order: [
					['orderIndex', 'ASC'],
					['sections', 'orderIndex', 'ASC']
				]
			});
			
			return this.buildHierarchy(chapters);
		} catch (error) {
			console.error('Error in Chapter.getProjectTree:', error);
			throw error;
		}
	}
	
	// Static method to build hierarchical structure
	static buildHierarchy(chapters) {
		const chapterMap = new Map();
		const rootChapters = [];
		
		// First pass: create chapter map
		chapters.forEach(chapter => {
			chapterMap.set(chapter.id, {
				...chapter.toJSON(),
				children: []
			});
		});
		
		// Second pass: build hierarchy
		chapters.forEach(chapter => {
			const chapterData = chapterMap.get(chapter.id);
			
			if (chapter.parentId) {
				const parent = chapterMap.get(chapter.parentId);
				if (parent) {
					parent.children.push(chapterData);
				}
			} else {
				rootChapters.push(chapterData);
			}
		});
		
		return rootChapters;
	}
	
	// Instance method to get full path
	async getPath() {
		const path = [this.title];
		let current = this;
		
		while (current.parentId) {
			current = await Chapter.findByPk(current.parentId);
			if (current) {
				path.unshift(current.title);
			} else {
				break;
			}
		}
		
		return path.join(' > ');
	}
	
	// Instance method to get all descendants
	async getDescendants() {
		const descendants = [];
		
		const children = await Chapter.findAll({
			where: { parentId: this.id },
			include: ['sections']
		});
		
		for (const child of children) {
			descendants.push(child);
			const childDescendants = await child.getDescendants();
			descendants.push(...childDescendants);
		}
		
		return descendants;
	}
	
	// Instance method to calculate word count
	calculateWordCount() {
		let totalWords = 0;
		
		// Count words in chapter content
		if (this.content) {
			totalWords += this.content.split(/\s+/).length;
		}
		
		// Count words in sections (if loaded)
		if (this.sections) {
			this.sections.forEach(section => {
				if (section.content) {
					totalWords += section.content.split(/\s+/).length;
				}
			});
		}
		
		return totalWords;
	}
}

// Initialize the Chapter model
const initChapterModel = (sequelize) => {
	Chapter.init({
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
		parentId: {
			type: DataTypes.STRING(12),
			allowNull: true,
			references: {
				model: 'mythwright_chapters', // Self-reference for hierarchy
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
		slug: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: 'URL-friendly version of title'
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		
		// Chapter Type & Structure
		chapterType: {
			type: DataTypes.ENUM,
			values: [
				'introduction',    // Campaign introduction/background
				'adventure',       // Main adventure content
				'location',        // Location descriptions
				'npcs',           // NPC collection
				'monsters',       // Monster/creature collection
				'items',          // Magic items/equipment
				'appendix',       // Additional resources
				'handouts',       // Player handouts
				'maps',           // Map collection
				'tables',         // Random tables
				'custom'          // User-defined type
			],
			defaultValue: 'adventure',
			allowNull: false
		},
		
		// Hierarchy & Ordering
		orderIndex: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
			comment: 'Order within parent chapter'
		},
		level: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false,
			validate: {
				min: 1,
				max: 6 // Max 6 levels deep (like HTML headings)
			},
			comment: 'Nesting level (1 = top level, 2 = subsection, etc.)'
		},
		
		// Content
		content: {
			type: DataTypes.JSON, // Changed from TEXT to JSON for TipTap content
			allowNull: true,
			defaultValue: { type: 'doc', content: [] },
			comment: 'TipTap JSON content'
		},
		
		// Generation Settings
		generationPrompt: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'AI prompt used to generate this chapter'
		},
		
		generationSettings: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				aiGenerated: false,
				model: null,
				temperature: 0.8,
				maxTokens: 2000,
				generatedAt: null,
				tokensUsed: 0,
				cost: 0
			}
		},
		
		// Content Metadata
		contentMetadata: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				wordCount: 0,
				estimatedReadTime: 0, // in minutes
				encounterCount: 0,
				npcCount: 0,
				magicItemCount: 0,
				lastAnalyzed: null
			}
		},
		
		// Publishing & Visibility
		isVisible: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		
		isComplete: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		
		// Cross-references and dependencies
		dependencies: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of chapter IDs this chapter depends on'
		},
		
		crossReferences: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of references to other chapters/sections'
		},
		
		// Accessibility
		accessibilityMetadata: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				hasAltText: true,
				hasProperHeadings: true,
				colorContrastChecked: false,
				screenReaderFriendly: true,
				lastAccessibilityCheck: null
			}
		},
		
		// Version Control
		version: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		},
		
		// Notes and Comments
		authorNotes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Private notes for the author'
		}
		
	}, {
		sequelize,
		modelName: 'Chapter',
		tableName: 'mythwright_chapters',
		timestamps: true,
		paranoid: true, // Soft delete support
		indexes: [
			{
				fields: ['projectId']
			},
			{
				fields: ['parentId']
			},
			{
				fields: ['projectId', 'orderIndex']
			},
			{
				fields: ['chapterType']
			},
			{
				fields: ['level']
			},
			{
				fields: ['isVisible']
			},
			{
				fields: ['isComplete']
			}
		],
		hooks: {
			// Auto-generate slug from title
			beforeValidate: (chapter) => {
				if (chapter.title && !chapter.slug) {
					chapter.slug = chapter.title
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/(^-|-$)/g, '');
				}
			},
			
			// Update content metadata after save
			afterSave: async (chapter) => {
				if (chapter.changed('content')) {
					const wordCount = chapter.calculateWordCount();
					const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
					
					chapter.contentMetadata = {
						...chapter.contentMetadata,
						wordCount,
						estimatedReadTime,
						lastAnalyzed: new Date()
					};
					
					// Save without triggering hooks again
					await chapter.save({ hooks: false });
				}
			}
		},
		validate: {
			// Prevent circular references
			notCircularReference() {
				if (this.id === this.parentId) {
					throw new Error('Chapter cannot be its own parent');
				}
			}
		}
	});
	
	return Chapter;
};

export { Chapter as model, initChapterModel };
