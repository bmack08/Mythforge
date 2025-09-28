// Mythwright StatBlock Model - D&D Creature Statistics with CR Validation
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';
class StatBlock extends Model {
    // Static method to calculate CR from stats (simplified DMG formula)
    static calculateCR(stats) {
        const { hitPoints, armorClass, attacks, savingThrows = {}, damageResistances = [], damageImmunities = [], conditionImmunities = [] } = stats;
        // Defensive CR calculation
        let defensiveCR = 0;
        let effectiveHP = hitPoints || 1;
        // Adjust HP for AC
        const acAdjustment = {
            13: 1.0, 14: 1.1, 15: 1.15, 16: 1.2, 17: 1.25, 18: 1.3, 19: 1.35, 20: 1.4
        };
        effectiveHP *= acAdjustment[Math.min(armorClass || 10, 20)] || 1.0;
        // Adjust for resistances/immunities
        const resistanceCount = damageResistances.length;
        const immunityCount = damageImmunities.length;
        const conditionCount = conditionImmunities.length;
        effectiveHP *= (1 + (resistanceCount * 0.25) + (immunityCount * 0.5) + (conditionCount * 0.1));
        // Determine defensive CR from effective HP
        const hpThresholds = [
            { hp: 6, cr: 0 }, { hp: 35, cr: 0.125 }, { hp: 49, cr: 0.25 }, { hp: 70, cr: 0.5 },
            { hp: 85, cr: 1 }, { hp: 100, cr: 2 }, { hp: 115, cr: 3 }, { hp: 130, cr: 4 },
            { hp: 145, cr: 5 }, { hp: 160, cr: 6 }, { hp: 175, cr: 7 }, { hp: 190, cr: 8 },
            { hp: 205, cr: 9 }, { hp: 220, cr: 10 }, { hp: 250, cr: 11 }, { hp: 280, cr: 12 },
            { hp: 320, cr: 13 }, { hp: 350, cr: 14 }, { hp: 400, cr: 15 }, { hp: 450, cr: 16 },
            { hp: 500, cr: 17 }, { hp: 550, cr: 18 }, { hp: 600, cr: 19 }, { hp: 700, cr: 20 }
        ];
        for (let i = hpThresholds.length - 1; i >= 0; i--) {
            if (effectiveHP >= hpThresholds[i].hp) {
                defensiveCR = hpThresholds[i].cr;
                break;
            }
        }
        // Offensive CR calculation (simplified)
        let offensiveCR = 0;
        let maxDamage = 0;
        if (attacks && attacks.length > 0) {
            attacks.forEach(attack => {
                const avgDamage = attack.averageDamage || 0;
                maxDamage = Math.max(maxDamage, avgDamage);
            });
        }
        // Determine offensive CR from damage
        const damageThresholds = [
            { dmg: 0, cr: 0 }, { dmg: 3, cr: 0.125 }, { dmg: 5, cr: 0.25 }, { dmg: 8, cr: 0.5 },
            { dmg: 11, cr: 1 }, { dmg: 16, cr: 2 }, { dmg: 21, cr: 3 }, { dmg: 26, cr: 4 },
            { dmg: 31, cr: 5 }, { dmg: 36, cr: 6 }, { dmg: 41, cr: 7 }, { dmg: 47, cr: 8 },
            { dmg: 53, cr: 9 }, { dmg: 59, cr: 10 }, { dmg: 65, cr: 11 }, { dmg: 71, cr: 12 },
            { dmg: 77, cr: 13 }, { dmg: 83, cr: 14 }, { dmg: 89, cr: 15 }, { dmg: 95, cr: 16 },
            { dmg: 101, cr: 17 }, { dmg: 107, cr: 18 }, { dmg: 113, cr: 19 }, { dmg: 119, cr: 20 }
        ];
        for (let i = damageThresholds.length - 1; i >= 0; i--) {
            if (maxDamage >= damageThresholds[i].dmg) {
                offensiveCR = damageThresholds[i].cr;
                break;
            }
        }
        // Final CR is average of defensive and offensive
        const finalCR = (defensiveCR + offensiveCR) / 2;
        return {
            calculatedCR: Math.round(finalCR * 4) / 4, // Round to nearest quarter
            defensiveCR,
            offensiveCR,
            effectiveHP,
            maxDamage
        };
    }
    // Static method to get XP value from CR
    static getXPFromCR(challengeRating) {
        const xpValues = {
            0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
            1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
            6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
            11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
            16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
            21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
            26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
        };
        return xpValues[challengeRating] || 0;
    }
    // Static method to validate ability scores
    static validateAbilityScores(abilities) {
        const errors = [];
        const requiredAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        requiredAbilities.forEach(ability => {
            const score = abilities[ability];
            if (typeof score !== 'number') {
                errors.push(`${ability.toUpperCase()} must be a number`);
            }
            else if (score < 1 || score > 30) {
                errors.push(`${ability.toUpperCase()} must be between 1 and 30`);
            }
        });
        return errors;
    }
    // Static method to calculate ability modifier
    static getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    // Instance method to calculate proficiency bonus
    getProficiencyBonus() {
        const cr = this.challengeRating || 0;
        if (cr < 5)
            return 2;
        if (cr < 9)
            return 3;
        if (cr < 13)
            return 4;
        if (cr < 17)
            return 5;
        if (cr < 21)
            return 6;
        if (cr < 25)
            return 7;
        if (cr < 29)
            return 8;
        return 9;
    }
    // Instance method to validate stat block
    validateStatBlock() {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!this.name)
            errors.push('Name is required');
        if (!this.size)
            errors.push('Size is required');
        if (!this.type)
            errors.push('Type is required');
        if (!this.alignment)
            errors.push('Alignment is required');
        if (!this.armorClass)
            errors.push('Armor Class is required');
        if (!this.hitPoints)
            errors.push('Hit Points is required');
        if (!this.speed)
            errors.push('Speed is required');
        // Validate abilities
        if (this.abilities) {
            const abilityErrors = StatBlock.validateAbilityScores(this.abilities);
            errors.push(...abilityErrors);
        }
        else {
            errors.push('Ability scores are required');
        }
        // Validate CR
        if (typeof this.challengeRating !== 'number' || this.challengeRating < 0) {
            errors.push('Challenge Rating must be a non-negative number');
        }
        // Check CR calculation if we have enough data
        if (this.hitPoints && this.armorClass && this.abilities) {
            const calculated = StatBlock.calculateCR({
                hitPoints: this.hitPoints,
                armorClass: this.armorClass,
                attacks: this.attacks || [],
                savingThrows: this.savingThrows || {},
                damageResistances: this.damageResistances || [],
                damageImmunities: this.damageImmunities || []
            });
            const difference = Math.abs(calculated.calculatedCR - this.challengeRating);
            if (difference > 1) {
                warnings.push(`Calculated CR (${calculated.calculatedCR}) differs significantly from assigned CR (${this.challengeRating})`);
            }
        }
        // Validate attacks
        if (this.attacks && this.attacks.length > 0) {
            this.attacks.forEach((attack, index) => {
                if (!attack.name)
                    errors.push(`Attack ${index + 1} must have a name`);
                if (!attack.attackBonus && attack.attackBonus !== 0) {
                    warnings.push(`Attack ${index + 1} (${attack.name}) should have an attack bonus`);
                }
                if (!attack.damage) {
                    warnings.push(`Attack ${index + 1} (${attack.name}) should have damage`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    // Instance method to generate Homebrewery markdown
    toHomebreweryMarkdown() {
        const abilities = this.abilities || {};
        const modStr = (score) => {
            const mod = StatBlock.getAbilityModifier(score);
            return `${score} (${mod >= 0 ? '+' : ''}${mod})`;
        };
        let markdown = `___\n`;
        markdown += `> ## ${this.name}\n`;
        markdown += `> *${this.size} ${this.type}, ${this.alignment}*\n`;
        markdown += `> ___\n`;
        markdown += `> - **Armor Class** ${this.armorClass}${this.armorClassSource ? ` (${this.armorClassSource})` : ''}\n`;
        markdown += `> - **Hit Points** ${this.hitPoints}${this.hitDice ? ` (${this.hitDice})` : ''}\n`;
        markdown += `> - **Speed** ${this.speed}\n`;
        markdown += `> ___\n`;
        markdown += `> |STR|DEX|CON|INT|WIS|CHA|\n`;
        markdown += `> |:---:|:---:|:---:|:---:|:---:|:---:|\n`;
        markdown += `> |${modStr(abilities.str || 10)}|${modStr(abilities.dex || 10)}|${modStr(abilities.con || 10)}|${modStr(abilities.int || 10)}|${modStr(abilities.wis || 10)}|${modStr(abilities.cha || 10)}|\n`;
        markdown += `> ___\n`;
        // Optional stats
        if (this.savingThrows && Object.keys(this.savingThrows).length > 0) {
            const saves = Object.entries(this.savingThrows)
                .map(([ability, bonus]) => `${ability.toUpperCase()} +${bonus}`)
                .join(', ');
            markdown += `> - **Saving Throws** ${saves}\n`;
        }
        if (this.skills && Object.keys(this.skills).length > 0) {
            const skills = Object.entries(this.skills)
                .map(([skill, bonus]) => `${skill} +${bonus}`)
                .join(', ');
            markdown += `> - **Skills** ${skills}\n`;
        }
        if (this.damageVulnerabilities && this.damageVulnerabilities.length > 0) {
            markdown += `> - **Damage Vulnerabilities** ${this.damageVulnerabilities.join(', ')}\n`;
        }
        if (this.damageResistances && this.damageResistances.length > 0) {
            markdown += `> - **Damage Resistances** ${this.damageResistances.join(', ')}\n`;
        }
        if (this.damageImmunities && this.damageImmunities.length > 0) {
            markdown += `> - **Damage Immunities** ${this.damageImmunities.join(', ')}\n`;
        }
        if (this.conditionImmunities && this.conditionImmunities.length > 0) {
            markdown += `> - **Condition Immunities** ${this.conditionImmunities.join(', ')}\n`;
        }
        markdown += `> - **Senses** ${this.senses || 'passive Perception ' + (10 + StatBlock.getAbilityModifier(abilities.wis || 10))}\n`;
        markdown += `> - **Languages** ${this.languages || '—'}\n`;
        markdown += `> - **Challenge Rating** ${this.challengeRating} (${StatBlock.getXPFromCR(this.challengeRating)} XP)\n`;
        markdown += `> ___\n`;
        // Special abilities
        if (this.specialAbilities && this.specialAbilities.length > 0) {
            this.specialAbilities.forEach(ability => {
                markdown += `> ***${ability.name}.*** ${ability.description}\n>\n`;
            });
            markdown += `> ___\n`;
        }
        // Actions
        if (this.actions && this.actions.length > 0) {
            markdown += `> ### Actions\n`;
            this.actions.forEach(action => {
                markdown += `> ***${action.name}.*** ${action.description}\n>\n`;
            });
        }
        // Legendary actions
        if (this.legendaryActions && this.legendaryActions.length > 0) {
            markdown += `> ### Legendary Actions\n`;
            markdown += `> ${this.name} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. ${this.name} regains spent legendary actions at the start of its turn.\n>\n`;
            this.legendaryActions.forEach(action => {
                markdown += `> ***${action.name}${action.cost > 1 ? ` (Costs ${action.cost} Actions)` : ''}.*** ${action.description}\n>\n`;
            });
        }
        return markdown;
    }
}
// Initialize the StatBlock model
const initStatBlockModel = (sequelize) => {
    StatBlock.init({
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
        size: {
            type: DataTypes.ENUM,
            values: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Creature type (humanoid, beast, fiend, etc.)'
        },
        subtype: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Creature subtype (human, goblinoid, demon, etc.)'
        },
        alignment: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Defensive Stats
        armorClass: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 30
            }
        },
        armorClassSource: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Source of AC (natural armor, chain mail, etc.)'
        },
        hitPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        hitDice: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Hit dice formula (e.g., "8d8 + 16")'
        },
        speed: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Speed in feet (e.g., "30 ft., fly 60 ft.")'
        },
        // Ability Scores
        abilities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            validate: {
                hasAllAbilities(value) {
                    const required = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
                    const missing = required.filter(ability => !(ability in value));
                    if (missing.length > 0) {
                        throw new Error(`Missing abilities: ${missing.join(', ')}`);
                    }
                }
            }
        },
        // Skills & Saves
        savingThrows: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            comment: 'Saving throw bonuses (e.g., {"str": 5, "con": 8})'
        },
        skills: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            comment: 'Skill bonuses (e.g., {"Perception": 4, "Stealth": 6})'
        },
        // Damage & Condition Resistances
        damageVulnerabilities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of damage types creature is vulnerable to'
        },
        damageResistances: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of damage types creature resists'
        },
        damageImmunities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of damage types creature is immune to'
        },
        conditionImmunities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of conditions creature is immune to'
        },
        // Senses & Languages
        senses: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Special senses (darkvision, blindsight, etc.)'
        },
        languages: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Languages known'
        },
        // Challenge Rating
        challengeRating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 30
            }
        },
        // Abilities & Actions
        specialAbilities: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of special abilities (traits)'
        },
        actions: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of actions the creature can take'
        },
        reactions: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of reactions'
        },
        legendaryActions: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of legendary actions (if any)'
        },
        // Combat Statistics
        attacks: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of attack statistics for CR calculation'
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
            comment: 'Whether this is original content or adapted'
        },
        // Generation Metadata
        generationSettings: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                aiGenerated: false,
                model: null,
                prompt: null,
                crCalculated: false,
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
                calculatedCR: null,
                lastValidated: null
            }
        },
        // Usage Statistics
        usageStats: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                timesUsed: 0,
                averageEncounterCR: 0,
                playerFeedback: [],
                balanceNotes: []
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
        modelName: 'StatBlock',
        tableName: 'mythwright_statblocks',
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
                fields: ['challengeRating']
            },
            {
                fields: ['size']
            },
            {
                fields: ['type']
            },
            {
                fields: ['isPublished']
            },
            {
                fields: ['tags']
            }
        ],
        hooks: {
            // Auto-validate stat block after save
            afterSave: async (statblock) => {
                if (statblock.changed('abilities') || statblock.changed('hitPoints') ||
                    statblock.changed('armorClass') || statblock.changed('challengeRating')) {
                    const validation = statblock.validateStatBlock();
                    const crCalculation = StatBlock.calculateCR({
                        hitPoints: statblock.hitPoints,
                        armorClass: statblock.armorClass,
                        attacks: statblock.attacks || [],
                        savingThrows: statblock.savingThrows || {},
                        damageResistances: statblock.damageResistances || [],
                        damageImmunities: statblock.damageImmunities || []
                    });
                    statblock.validationResults = {
                        ...validation,
                        calculatedCR: crCalculation.calculatedCR,
                        lastValidated: new Date()
                    };
                    // Save validation results without triggering hooks
                    await statblock.save({ hooks: false });
                }
            }
        }
    });
    return StatBlock;
};
export { StatBlock as model, initStatBlockModel };
//# sourceMappingURL=statblock.model.js.map