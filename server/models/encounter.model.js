// Mythwright Encounter Model - Combat Encounters with XP Budget
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class Encounter extends Model {
	// Static method to calculate XP multipliers based on party size
	static getXPMultiplier(numberOfCreatures, partySize = 4) {
		// XP multipliers from DMG p. 82
		const baseMultipliers = {
			1: 1,
			2: 1.5,
			3: 2,
			4: 2,
			5: 2.5,
			6: 2.5,
			7: 3,
			8: 3,
			9: 4,
			10: 4,
			11: 5,
			12: 5,
			13: 6,
			14: 6,
			15: 7
		};
		
		// Adjust for party size
		const multiplier = baseMultipliers[Math.min(numberOfCreatures, 15)] || 8;
		
		if (partySize < 3) {
			return multiplier * 1.5; // Smaller parties face higher effective difficulty
		} else if (partySize > 5) {
			return multiplier * 0.5; // Larger parties face lower effective difficulty
		}
		
		return multiplier;
	}
	
	// Static method to get encounter difficulty thresholds
	static getDifficultyThresholds(level) {
		const thresholds = {
			1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
			2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
			3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
			4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
			5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
			6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
			7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
			8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
			9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
			10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
			11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
			12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
			13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
			14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
			15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
			16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
			17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
			18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
			19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
			20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
		};
		
		return thresholds[level] || thresholds[20];
	}
	
	// Instance method to calculate total XP value
	calculateXPValue() {
		let totalXP = 0;
		let totalCreatures = 0;
		
		this.creatures.forEach(creature => {
			totalXP += (creature.xpValue || 0) * (creature.quantity || 1);
			totalCreatures += creature.quantity || 1;
		});
		
		return {
			baseXP: totalXP,
			adjustedXP: Math.round(totalXP * Encounter.getXPMultiplier(totalCreatures, this.partySize)),
			creatureCount: totalCreatures
		};
	}
	
	// Instance method to determine encounter difficulty
	getDifficulty(partyLevel, partySize = 4) {
		const { adjustedXP } = this.calculateXPValue();
		const thresholds = Encounter.getDifficultyThresholds(partyLevel);
		
		// Calculate party thresholds
		const partyThresholds = {
			easy: thresholds.easy * partySize,
			medium: thresholds.medium * partySize,
			hard: thresholds.hard * partySize,
			deadly: thresholds.deadly * partySize
		};
		
		if (adjustedXP < partyThresholds.easy) {
			return { level: 'trivial', color: 'green' };
		} else if (adjustedXP < partyThresholds.medium) {
			return { level: 'easy', color: 'lightgreen' };
		} else if (adjustedXP < partyThresholds.hard) {
			return { level: 'medium', color: 'yellow' };
		} else if (adjustedXP < partyThresholds.deadly) {
			return { level: 'hard', color: 'orange' };
		} else {
			return { level: 'deadly', color: 'red' };
		}
	}
	
	// Instance method to validate encounter balance
	validateBalance(partyLevel, partySize = 4) {
		const warnings = [];
		const errors = [];
		
		const { adjustedXP, creatureCount } = this.calculateXPValue();
		const difficulty = this.getDifficulty(partyLevel, partySize);
		
		// Check for potential issues
		if (creatureCount > partySize * 2) {
			warnings.push('Large number of creatures may slow combat');
		}
		
		if (difficulty.level === 'deadly' && creatureCount === 1) {
			warnings.push('Single deadly creature may cause swingy encounters');
		}
		
		if (adjustedXP === 0) {
			errors.push('Encounter has no XP value');
		}
		
		// Check for CR spread
		const crs = this.creatures.map(c => c.challengeRating || 0);
		const minCR = Math.min(...crs);
		const maxCR = Math.max(...crs);
		
		if (maxCR - minCR > 3) {
			warnings.push('Large CR spread may create imbalanced encounter');
		}
		
		return {
			isValid: errors.length === 0,
			difficulty: difficulty.level,
			adjustedXP,
			warnings,
			errors
		};
	}
	
	// Instance method to suggest modifications
	suggestModifications(targetDifficulty, partyLevel, partySize = 4) {
		const thresholds = Encounter.getDifficultyThresholds(partyLevel);
		const targetXP = thresholds[targetDifficulty] * partySize;
		const { adjustedXP } = this.calculateXPValue();
		
		const suggestions = [];
		
		if (adjustedXP < targetXP * 0.8) {
			suggestions.push({
				type: 'increase',
				description: 'Add more creatures or increase CR',
				targetXP: targetXP - adjustedXP
			});
		} else if (adjustedXP > targetXP * 1.2) {
			suggestions.push({
				type: 'decrease', 
				description: 'Remove creatures or reduce CR',
				excessXP: adjustedXP - targetXP
			});
		}
		
		return suggestions;
	}
}

// Initialize the Encounter model
const initEncounterModel = (sequelize) => {
	Encounter.init({
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
		
		// Encounter Configuration
		encounterType: {
			type: DataTypes.ENUM,
			values: ['combat', 'social', 'exploration', 'puzzle', 'mixed'],
			defaultValue: 'combat',
			allowNull: false
		},
		
		difficulty: {
			type: DataTypes.ENUM,
			values: ['trivial', 'easy', 'medium', 'hard', 'deadly'],
			defaultValue: 'medium',
			allowNull: false
		},
		
		// Party Configuration
		partySize: {
			type: DataTypes.INTEGER,
			defaultValue: 4,
			allowNull: false,
			validate: {
				min: 1,
				max: 8
			}
		},
		
		partyLevel: {
			type: DataTypes.INTEGER,
			defaultValue: 3,
			allowNull: false,
			validate: {
				min: 1,
				max: 20
			}
		},
		
		// Creatures in the encounter
		creatures: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: [],
			comment: 'Array of creature objects with quantity, CR, XP, etc.'
		},
		
		// XP Budget Information
		xpBudget: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				allocated: 0,    // XP allocated to this encounter
				used: 0,         // XP used by creatures
				baseXP: 0,       // Base XP without multipliers
				adjustedXP: 0,   // XP with encounter multipliers
				efficiency: 100   // Percentage of budget used
			}
		},
		
		// Environment & Conditions
		environment: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				terrain: 'normal',           // normal, difficult, hazardous
				lighting: 'bright',          // bright, dim, dark
				weather: 'clear',            // clear, rain, storm, etc.
				temperature: 'temperate',    // frigid, cold, temperate, warm, hot
				specialConditions: []        // Array of special conditions
			}
		},
		
		// Tactical Information
		tactics: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				setup: '',              // Initial positioning
				round1: '',             // First round tactics
				subsequentRounds: '',   // Ongoing tactics
				retreat: '',            // Retreat conditions
				reinforcements: false   // Whether reinforcements arrive
			}
		},
		
		// Treasure & Rewards
		rewards: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				experience: 0,      // XP reward (usually automatic)
				treasure: [],       // Array of treasure items
				storyRewards: [],   // Non-mechanical rewards
				information: []     // Information gained
			}
		},
		
		// Scaling Information
		scaling: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				canScale: true,
				minPartySize: 3,
				maxPartySize: 6,
				minLevel: 1,
				maxLevel: 20,
				scalingNotes: ''
			}
		},
		
		// Generation Metadata
		generationSettings: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				aiGenerated: false,
				model: null,
				prompt: null,
				constraints: {},
				generatedAt: null,
				tokensUsed: 0,
				cost: 0
			}
		},
		
		// Balance Analysis
		balanceAnalysis: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				lastAnalyzed: null,
				isBalanced: true,
				warnings: [],
				suggestions: [],
				difficultyScore: 0
			}
		},
		
		// Usage Statistics
		usageStats: {
			type: DataTypes.JSON,
			allowNull: false,
			defaultValue: {
				timesUsed: 0,
				averageDuration: 0,    // in minutes
				averagePlayerDeaths: 0,
				averageResourcesUsed: 0,
				feedback: []
			}
		},
		
		// Publishing
		isPublished: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
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
		modelName: 'Encounter',
		tableName: 'mythwright_encounters',
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
				fields: ['encounterType']
			},
			{
				fields: ['difficulty']
			},
			{
				fields: ['partyLevel']
			},
			{
				fields: ['partySize']
			},
			{
				fields: ['isPublished']
			},
			{
				fields: ['tags']
			}
		],
		hooks: {
			// Auto-calculate XP budget after save
			afterSave: async (encounter) => {
				if (encounter.changed('creatures') || encounter.changed('partySize') || encounter.changed('partyLevel')) {
					const xpData = encounter.calculateXPValue();
					const balance = encounter.validateBalance(encounter.partyLevel, encounter.partySize);
					
					encounter.xpBudget = {
						...encounter.xpBudget,
						baseXP: xpData.baseXP,
						adjustedXP: xpData.adjustedXP,
						used: xpData.baseXP,
						efficiency: encounter.xpBudget.allocated > 0 ? 
							Math.round((xpData.adjustedXP / encounter.xpBudget.allocated) * 100) : 100
					};
					
					encounter.balanceAnalysis = {
						lastAnalyzed: new Date(),
						isBalanced: balance.isValid,
						warnings: balance.warnings,
						suggestions: balance.errors,
						difficultyScore: xpData.adjustedXP
					};
					
					// Save without triggering hooks again
					await encounter.save({ hooks: false });
				}
			}
		},
		validate: {
			// Validate creatures array
			validCreatures() {
				if (!Array.isArray(this.creatures)) {
					throw new Error('Creatures must be an array');
				}
				
				this.creatures.forEach((creature, index) => {
					if (!creature.name) {
						throw new Error(`Creature at index ${index} must have a name`);
					}
					if (typeof creature.quantity !== 'number' || creature.quantity < 1) {
						throw new Error(`Creature at index ${index} must have valid quantity`);
					}
					if (typeof creature.challengeRating === 'undefined') {
						throw new Error(`Creature at index ${index} must have challenge rating`);
					}
				});
			}
		}
	});
	
	return Encounter;
};

export { Encounter as model, initEncounterModel };
