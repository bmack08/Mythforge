// Mythwright Project Model - Sourcebook Generation Projects
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class Project extends Model {
	// Static method to get projects by user
	static async getByUser(userId, includePrivate = false) {
		try {
			const whereClause = { userId };
			
			if (!includePrivate) {
				whereClause.isPublic = true;
			}
			
			const projects = await this.findAll({ 
				where: whereClause,
				order: [['updatedAt', 'DESC']],
				include: ['chapters'] // Include related chapters
			});
			
			return projects;
		} catch (error) {
			console.error('Error in Project.getByUser:', error);
			throw error;
		}
	}
	
	// Static method to get project with full content
	static async getWithContent(projectId, userId = null) {
		try {
			const whereClause = { id: projectId };
			
			// If userId provided, ensure user has access
			if (userId) {
				whereClause[database.getSequelize().Sequelize.Op.or] = [
					{ userId },
					{ isPublic: true }
				];
			}
			
			const project = await this.findOne({
				where: whereClause,
				include: [
					{
						association: 'chapters',
						include: ['sections']
					},
					{
						association: 'encounters'
					},
					{
						association: 'npcs'
					},
					{
						association: 'magicItems'
					}
				]
			});
			
			if (!project) {
				throw new Error('Project not found or access denied');
			}
			
			return project;
		} catch (error) {
			console.error('Error in Project.getWithContent:', error);
			throw error;
		}
	}
	
	// Instance method to calculate total XP budget
	calculateXPBudget() {
		const { partySize, partyLevel, difficulty } = this.systemDesignBudget;
		
		// Base XP thresholds per level (from DMG)
		const xpThresholds = {
			1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
			2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
			3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
			4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
			5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
			// ... continue for all levels
		};
		
		const threshold = xpThresholds[partyLevel] || xpThresholds[5];
		const multiplier = partySize || 4;
		
		return {
			easy: threshold.easy * multiplier,
			medium: threshold.medium * multiplier,
			hard: threshold.hard * multiplier,
			deadly: threshold.deadly * multiplier,
			selected: threshold[difficulty] * multiplier
		};
	}
	
	// Instance method to update generation progress
	async updateProgress(step, totalSteps, currentTask = '') {
		this.generationProgress = {
			step,
			totalSteps,
			percentage: Math.round((step / totalSteps) * 100),
			currentTask,
			updatedAt: new Date()
		};
		
		await this.save();
		return this;
	}
}

// Initialize the Project model
const initProjectModel = (sequelize) => {
	Project.init({
		id: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			defaultValue: () => nanoid(12),
			allowNull: false
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: 'User who owns this project'
		},
		title: {
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
		
		// System Design Budget - Core generation parameters
		systemDesignBudget: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				// Party Configuration
				partySize: 4,
				partyLevel: 3,
				
				// Difficulty & Pacing
				difficulty: 'medium', // easy, medium, hard, deadly
				encounterIntensity: 'medium', // low, medium, high
				restFrequency: 'standard', // frequent, standard, rare
				
				// Content Preferences
				combatWeight: 50, // 0-100, balance between combat and roleplay
				explorationWeight: 30,
				socialWeight: 20,
				
				// Treasure & Magic
				treasureLevel: 'standard', // low, standard, high
				magicPrevalence: 'normal', // rare, normal, common
				treasurePace: 'standard', // slow, standard, fast
				
				// Tone & Theme
				tone: 'balanced', // gritty, balanced, heroic
				themes: [], // Array of theme tags
				setting: '', // Campaign setting description
				
				// Technical Settings
				targetLength: 'medium', // short (10-20 pages), medium (20-40), long (40+ pages)
				complexity: 'medium' // simple, medium, complex
			}
		},
		
		// Content Generation Settings
		generationSettings: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				aiProvider: 'openai', // openai, anthropic
				model: 'gpt-4',
				temperature: 0.8,
				maxTokens: 2000,
				
				// Content preferences
				includeStatBlocks: true,
				includeMagicItems: true,
				includeNPCs: true,
				includeHandouts: true,
				includeRandomTables: true,
				
				// Style preferences
				writingStyle: 'descriptive', // concise, descriptive, verbose
				voiceTone: 'professional', // casual, professional, dramatic
				complexity: 'intermediate' // beginner, intermediate, advanced
			}
		},
		
		// Legal & Publishing
		legalCompliance: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				usageType: 'personal', // personal, sharing, commercial, marketplace
				licenseType: 'ogl', // ogl, cc, proprietary
				piFiltered: false, // Product Identity filtered for commercial use
				attributions: ['System Reference Document 5.1'],
				lastScanned: null,
				complianceScore: 100
			}
		},
		
		// Generation Progress & Status
		status: {
			type: DataTypes.ENUM,
			values: ['draft', 'generating', 'complete', 'published', 'archived'],
			defaultValue: 'draft',
			allowNull: false
		},
		
		generationProgress: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: null
		},
		
		// Content Statistics
		contentStats: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				totalPages: 0,
				totalWords: 0,
				totalEncounters: 0,
				totalNPCs: 0,
				totalMagicItems: 0,
				totalStatBlocks: 0,
				estimatedPlayTime: 0 // in hours
			}
		},
		
		// Publishing & Sharing
		isPublic: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		
		publishedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		
		shareToken: {
			type: DataTypes.STRING(32),
			defaultValue: () => nanoid(32),
			unique: true,
			allowNull: false
		},
		
		// Marketplace Integration
		marketplaceData: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: null
			// Will contain price, category, tags, etc. when published to marketplace
		},
		
		// Version Control
		version: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		},
		
		// AI Generation Metadata
		aiMetadata: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: {
				totalTokensUsed: 0,
				totalCost: 0,
				generationHistory: [],
				lastGenerated: null
			}
		}
		
	}, {
		sequelize,
		modelName: 'Project',
		tableName: 'mythwright_projects',
		timestamps: true,
		paranoid: true, // Soft delete support
		indexes: [
			{
				fields: ['userId']
			},
			{
				fields: ['status']
			},
			{
				fields: ['isPublic']
			},
			{
				fields: ['createdAt']
			},
			{
				unique: true,
				fields: ['shareToken']
			}
		],
		validate: {
			// Custom validation for system design budget
			validSystemBudget() {
				const budget = this.systemDesignBudget;
				if (budget.partySize < 1 || budget.partySize > 8) {
					throw new Error('Party size must be between 1 and 8');
				}
				if (budget.partyLevel < 1 || budget.partyLevel > 20) {
					throw new Error('Party level must be between 1 and 20');
				}
				if (budget.combatWeight + budget.explorationWeight + budget.socialWeight !== 100) {
					throw new Error('Content weights must sum to 100');
				}
			}
		}
	});
	
	return Project;
};

export { Project as model, initProjectModel };
