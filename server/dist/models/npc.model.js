// Mythwright NPC Model - Non-Player Characters with Personality/Voice Attributes
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';
class NPC extends Model {
    // Static method to generate random personality traits
    static generateRandomPersonality() {
        const traits = [
            'argumentative', 'arrogant', 'blustering', 'rude', 'curious', 'friendly',
            'honest', 'hot tempered', 'irritable', 'ponderous', 'quiet', 'suspicious'
        ];
        const ideals = [
            'beauty', 'charity', 'greater good', 'life', 'respect', 'self-sacrifice',
            'domination', 'greed', 'might', 'pain', 'revenge', 'slaughter',
            'balance', 'knowledge', 'live and let live', 'moderation', 'neutrality', 'people',
            'community', 'fairness', 'honor', 'logic', 'responsibility', 'tradition',
            'change', 'creativity', 'freedom', 'independence', 'no limits', 'whimsy'
        ];
        const bonds = [
            'family member', 'mentor', 'childhood friend', 'beloved pet', 'hometown',
            'sacred place', 'precious possession', 'old enemy', 'guild', 'organization'
        ];
        const flaws = [
            'forbidden love', 'enjoys decadent pleasures', 'arrogance', 'envies another',
            'overpowering greed', 'prone to rage', 'has a powerful enemy', 'specific phobia',
            'shameful secret', 'secret crime', 'possession of forbidden lore', 'foolhardy bravery'
        ];
        return {
            trait: traits[Math.floor(Math.random() * traits.length)],
            ideal: ideals[Math.floor(Math.random() * ideals.length)],
            bond: bonds[Math.floor(Math.random() * bonds.length)],
            flaw: flaws[Math.floor(Math.random() * flaws.length)]
        };
    }
    // Static method to generate voice characteristics
    static generateVoiceProfile() {
        const accents = [
            'none', 'british', 'irish', 'scottish', 'french', 'german', 'italian',
            'spanish', 'russian', 'nordic', 'eastern european', 'southern drawl',
            'new york', 'boston', 'cockney', 'posh', 'gruff', 'melodic'
        ];
        const speechPatterns = [
            'speaks quickly', 'speaks slowly', 'pauses frequently', 'stutters occasionally',
            'uses big words', 'speaks simply', 'whispers', 'speaks loudly',
            'has a lisp', 'rolls Rs', 'drops Gs', 'uses slang', 'very formal',
            'uses metaphors', 'quotes literature', 'makes puns'
        ];
        const mannerisms = [
            'taps fingers', 'fidgets with jewelry', 'strokes beard', 'adjusts glasses',
            'cracks knuckles', 'paces while talking', 'gestures wildly', 'avoids eye contact',
            'stares intensely', 'smiles constantly', 'frowns often', 'bites nails',
            'plays with hair', 'drums fingers', 'bounces leg', 'crosses arms'
        ];
        return {
            accent: accents[Math.floor(Math.random() * accents.length)],
            speechPattern: speechPatterns[Math.floor(Math.random() * speechPatterns.length)],
            mannerism: mannerisms[Math.floor(Math.random() * mannerisms.length)],
            pitch: ['very low', 'low', 'average', 'high', 'very high'][Math.floor(Math.random() * 5)],
            volume: ['whisper', 'quiet', 'normal', 'loud', 'booming'][Math.floor(Math.random() * 5)]
        };
    }
    // Instance method to generate dialogue sample
    generateDialogueSample(context = 'greeting') {
        const { personality, voice } = this;
        const greetings = {
            friendly: "Well hello there! What brings you to our fair town?",
            suspicious: "What do you want? We don't get many strangers around here...",
            arrogant: "I suppose you've come to bask in my presence. How predictable.",
            curious: "Oh my! Visitors! Tell me, where do you hail from?",
            rude: "What? Can't you see I'm busy? Make it quick.",
            honest: "Good day to you. I hope you find what you're looking for here."
        };
        let dialogue = greetings[personality.trait] || greetings.friendly;
        // Modify based on voice characteristics
        if (voice.accent === 'irish') {
            dialogue = dialogue.replace(/you/g, "ye");
        }
        else if (voice.accent === 'cockney') {
            dialogue = dialogue.replace(/th/g, "f");
        }
        if (voice.speechPattern === 'uses big words') {
            dialogue = dialogue.replace(/good/g, "excellent").replace(/fair/g, "magnificent");
        }
        return dialogue;
    }
    // Instance method to calculate social challenge rating
    calculateSocialCR() {
        let baseCR = 0;
        // Base CR from stats
        if (this.stats && this.stats.charisma) {
            baseCR = Math.max(0, (this.stats.charisma - 10) / 4);
        }
        // Adjust for social skills
        if (this.skills) {
            const socialSkills = ['deception', 'intimidation', 'performance', 'persuasion'];
            const socialBonus = socialSkills.reduce((total, skill) => {
                return total + (this.skills[skill] || 0);
            }, 0) / socialSkills.length;
            baseCR += socialBonus / 5;
        }
        // Adjust for position/influence
        const positionMultipliers = {
            'commoner': 0.5,
            'merchant': 1.0,
            'noble': 1.5,
            'official': 2.0,
            'ruler': 3.0
        };
        baseCR *= positionMultipliers[this.socialClass] || 1.0;
        return Math.max(0, Math.round(baseCR * 4) / 4); // Round to nearest quarter
    }
    // Instance method to validate NPC
    validateNPC() {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!this.name)
            errors.push('Name is required');
        if (!this.race)
            errors.push('Race is required');
        if (!this.occupation)
            errors.push('Occupation is required');
        // Validate personality structure
        if (this.personality) {
            if (!this.personality.trait)
                warnings.push('Personality trait not defined');
            if (!this.personality.ideal)
                warnings.push('Ideal not defined');
            if (!this.personality.bond)
                warnings.push('Bond not defined');
            if (!this.personality.flaw)
                warnings.push('Flaw not defined');
        }
        else {
            warnings.push('Personality not fully defined');
        }
        // Validate voice characteristics
        if (this.voice) {
            if (!this.voice.accent)
                warnings.push('Voice accent not defined');
            if (!this.voice.speechPattern)
                warnings.push('Speech pattern not defined');
        }
        else {
            warnings.push('Voice characteristics not defined');
        }
        // Check for stat consistency
        if (this.stats && this.occupation) {
            const occupationStats = {
                'scholar': 'intelligence',
                'priest': 'wisdom',
                'bard': 'charisma',
                'warrior': 'strength',
                'thief': 'dexterity'
            };
            const primaryStat = occupationStats[this.occupation.toLowerCase()];
            if (primaryStat && this.stats[primaryStat] < 13) {
                warnings.push(`${this.occupation} should have higher ${primaryStat}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    // Instance method to generate Homebrewery markdown
    toHomebreweryMarkdown() {
        let markdown = `#### ${this.name}\n`;
        markdown += `*${this.race} ${this.occupation}*\n\n`;
        if (this.description) {
            markdown += `${this.description}\n\n`;
        }
        // Physical appearance
        if (this.appearance) {
            markdown += `**Appearance:** ${this.appearance}\n\n`;
        }
        // Personality traits
        if (this.personality) {
            markdown += `**Personality Traits:** ${this.personality.trait}\n\n`;
            markdown += `**Ideals:** ${this.personality.ideal}\n\n`;
            markdown += `**Bonds:** ${this.personality.bond}\n\n`;
            markdown += `**Flaws:** ${this.personality.flaw}\n\n`;
        }
        // Voice and mannerisms
        if (this.voice) {
            markdown += `**Voice:** ${this.voice.accent} accent, ${this.voice.pitch} pitch, ${this.voice.speechPattern}\n\n`;
            markdown += `**Mannerisms:** ${this.voice.mannerism}\n\n`;
        }
        // Dialogue sample
        if (this.dialogueSamples && this.dialogueSamples.length > 0) {
            markdown += `**Sample Dialogue:**\n`;
            this.dialogueSamples.forEach(sample => {
                markdown += `> "${sample.text}"\n`;
            });
            markdown += `\n`;
        }
        // Stats (if combat-capable)
        if (this.stats && this.combatCapable) {
            markdown += `**Stats:** `;
            const statOrder = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
            const statStrings = statOrder.map(stat => `${stat.toUpperCase()} ${this.stats[stat] || 10}`);
            markdown += statStrings.join(', ') + '\n\n';
        }
        // Relationships
        if (this.relationships && this.relationships.length > 0) {
            markdown += `**Relationships:**\n`;
            this.relationships.forEach(rel => {
                markdown += `- **${rel.name}:** ${rel.description}\n`;
            });
            markdown += `\n`;
        }
        return markdown;
    }
    // Instance method to add relationship
    async addRelationship(targetNPCId, relationshipType, description) {
        const relationships = this.relationships || [];
        relationships.push({
            targetId: targetNPCId,
            type: relationshipType,
            description,
            strength: 1, // -5 to +5 scale
            established: new Date()
        });
        this.relationships = relationships;
        await this.save();
        return this;
    }
}
// Initialize the NPC model
const initNPCModel = (sequelize) => {
    NPC.init({
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
        // Basic Identity
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 255]
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Noble title, rank, or honorific'
        },
        race: {
            type: DataTypes.STRING,
            allowNull: false
        },
        subrace: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0
            }
        },
        // Occupation & Social Status
        occupation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        socialClass: {
            type: DataTypes.ENUM,
            values: ['commoner', 'merchant', 'artisan', 'noble', 'official', 'clergy', 'criminal', 'ruler'],
            defaultValue: 'commoner',
            allowNull: false
        },
        faction: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Guild, organization, or faction affiliation'
        },
        // Physical Description
        appearance: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Physical description and notable features'
        },
        height: {
            type: DataTypes.STRING,
            allowNull: true
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Personality (4-part D&D personality system)
        personality: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                trait: null, // Personality trait
                ideal: null, // Driving ideal
                bond: null, // Important connection
                flaw: null // Character flaw
            }
        },
        // Voice & Speech Characteristics
        voice: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                accent: 'none',
                pitch: 'average',
                volume: 'normal',
                speechPattern: 'speaks normally',
                mannerism: 'no notable mannerisms',
                catchphrase: null,
                vocabulary: 'common' // simple, common, educated, eloquent
            }
        },
        // Dialogue & Interaction
        dialogueSamples: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of sample dialogue with context'
        },
        interactionStyle: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                approachability: 5, // 1-10 scale
                trustworthiness: 5, // 1-10 scale
                helpfulness: 5, // 1-10 scale
                patience: 5, // 1-10 scale
                humor: 5, // 1-10 scale
                intelligence: 5 // 1-10 scale (apparent)
            }
        },
        // Background & History
        background: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Personal history and background'
        },
        secrets: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of secrets the NPC knows or hides'
        },
        // Goals & Motivations
        goals: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                shortTerm: [], // Immediate goals
                longTerm: [], // Life goals
                hidden: [] // Secret agendas
            }
        },
        // Stats & Abilities (for combat or skill checks)
        stats: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                str: 10, dex: 10, con: 10,
                int: 10, wis: 10, cha: 10
            }
        },
        skills: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            comment: 'Skill bonuses for important NPCs'
        },
        combatCapable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: 'Whether this NPC can engage in combat'
        },
        // Location & Availability
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Where the NPC is typically found'
        },
        schedule: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            comment: 'Daily/weekly schedule and availability'
        },
        // Relationships
        relationships: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of relationships with other NPCs'
        },
        // Quest & Plot Hooks
        questHooks: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Potential quest hooks involving this NPC'
        },
        plotRelevance: {
            type: DataTypes.ENUM,
            values: ['none', 'minor', 'moderate', 'major', 'critical'],
            defaultValue: 'none',
            allowNull: false,
            comment: 'How important this NPC is to the main plot'
        },
        // Resources & Possessions
        wealth: {
            type: DataTypes.ENUM,
            values: ['destitute', 'poor', 'modest', 'comfortable', 'wealthy', 'aristocratic'],
            defaultValue: 'modest',
            allowNull: false
        },
        possessions: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Notable possessions, equipment, or treasures'
        },
        services: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Services the NPC can provide to players'
        },
        // Generation Metadata
        generationSettings: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                aiGenerated: false,
                model: null,
                prompt: null,
                personalityGenerated: false,
                voiceGenerated: false,
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
                socialCR: 0,
                lastValidated: null
            }
        },
        // Usage & Interaction Tracking
        usageStats: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                timesEncountered: 0,
                playerInteractions: [],
                questsGiven: 0,
                favorability: 0, // Player relationship score
                memorableQuotes: []
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
        modelName: 'NPC',
        tableName: 'mythwright_npcs',
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
                fields: ['race']
            },
            {
                fields: ['occupation']
            },
            {
                fields: ['socialClass']
            },
            {
                fields: ['faction']
            },
            {
                fields: ['plotRelevance']
            },
            {
                fields: ['location']
            },
            {
                fields: ['isPublished']
            },
            {
                fields: ['tags']
            }
        ],
        hooks: {
            // Auto-validate and calculate social CR after save
            afterSave: async (npc) => {
                if (npc.changed('personality') || npc.changed('stats') ||
                    npc.changed('skills') || npc.changed('socialClass')) {
                    const validation = npc.validateNPC();
                    const socialCR = npc.calculateSocialCR();
                    npc.validationResults = {
                        ...validation,
                        socialCR,
                        lastValidated: new Date()
                    };
                    // Save without triggering hooks again
                    await npc.save({ hooks: false });
                }
            },
            // Generate random personality if not provided
            beforeCreate: (npc) => {
                // Auto-generate personality if not provided
                if (!npc.personality.trait) {
                    const randomPersonality = NPC.generateRandomPersonality();
                    npc.personality = { ...npc.personality, ...randomPersonality };
                }
                // Auto-generate voice if not provided
                if (!npc.voice.accent || npc.voice.accent === 'none') {
                    const randomVoice = NPC.generateVoiceProfile();
                    npc.voice = { ...npc.voice, ...randomVoice };
                }
            }
        },
        validate: {
            // Validate personality completeness
            personalityComplete() {
                if (this.personality) {
                    const required = ['trait', 'ideal', 'bond', 'flaw'];
                    const missing = required.filter(field => !this.personality[field]);
                    if (missing.length > 0) {
                        // Don't throw error, but warn - personality can be incomplete
                        console.warn(`NPC ${this.name} missing personality fields: ${missing.join(', ')}`);
                    }
                }
            }
        }
    });
    return NPC;
};
export { NPC as model, initNPCModel };
//# sourceMappingURL=npc.model.js.map