// Entity Recognition and Parsing System
// Extracts NPCs, locations, items, events, and other story elements from text

import nlp from 'compromise';

class EntityParser {
    constructor() {
        // D&D specific entity patterns
        this.patterns = {
            // NPCs - Proper names, titles, character references
            npc: [
                /\b[A-Z][a-z]+ (?:the )?[A-Z][a-z]+\b/g, // "Gandalf the Grey"
                /\b(?:Lord|Lady|Sir|Dame|King|Queen|Prince|Princess|Duke|Duchess|Baron|Count|Captain|General|Master|Mistress) [A-Z][a-z]+\b/g,
                /\b[A-Z][a-z]+ [A-Z][a-z]+(?:son|daughter|born)\b/g, // "Erik Erikson"
            ],
            
            // Locations - Places, cities, dungeons, regions
            location: [
                /\b(?:City|Town|Village|Castle|Keep|Tower|Dungeon|Cave|Forest|Mountain|River|Lake|Sea|Ocean|Desert|Plains|Swamp|Marsh) (?:of )?[A-Z][a-z]+\b/g,
                /\bThe [A-Z][a-z]+ (?:Tavern|Inn|Shop|Market|Temple|Church|Cathedral|Library|Academy|Guild)\b/g,
                /\b[A-Z][a-z]+(?:'s)? (?:Lair|Den|Sanctum|Chamber|Hall|Throne Room|Study|Laboratory)\b/g,
            ],
            
            // Items - Weapons, armor, magical items, artifacts
            item: [
                /\b(?:Sword|Blade|Axe|Hammer|Bow|Staff|Wand|Rod|Ring|Amulet|Crown|Shield|Armor) (?:of )?[A-Z][a-z]+\b/g,
                /\bThe [A-Z][a-z]+ (?:Sword|Blade|Axe|Hammer|Bow|Staff|Wand|Rod|Ring|Amulet|Crown|Shield)\b/g,
                /\b[A-Z][a-z]+(?:'s)? (?:Sword|Blade|Axe|Hammer|Bow|Staff|Wand|Rod|Ring|Amulet|Crown|Shield)\b/g,
            ],
            
            // Events - Battles, ceremonies, historical events
            event: [
                /\bThe (?:Battle|War|Siege|Fall|Rise) (?:of|at) [A-Z][a-z]+\b/g,
                /\b(?:Battle|War|Siege|Ceremony|Ritual|Festival|Tournament) (?:of|at) [A-Z][a-z]+\b/g,
                /\bThe [A-Z][a-z]+ (?:War|Rebellion|Uprising|Crusade|Conquest)\b/g,
            ],
            
            // Factions - Organizations, guilds, cults, armies
            faction: [
                /\bThe [A-Z][a-z]+ (?:Guild|Order|Brotherhood|Sisterhood|Cult|Circle|Alliance|Legion|Company)\b/g,
                /\b(?:House|Clan|Tribe) [A-Z][a-z]+\b/g,
                /\b[A-Z][a-z]+ (?:Mercenaries|Guards|Watch|Militia|Army|Navy)\b/g,
            ],
            
            // Spells and abilities
            spell: [
                /\b[A-Z][a-z]+ (?:Bolt|Ray|Blast|Storm|Shield|Ward|Curse|Blessing|Charm)\b/g,
                /\b(?:Fireball|Lightning|Healing|Teleport|Invisibility|Fly|Haste|Slow)\b/gi,
            ],
            
            // Monsters and creatures
            monster: [
                /\b(?:Ancient|Elder|Young|Adult) (?:Red|Blue|Green|Black|White|Gold|Silver|Bronze|Copper|Brass) Dragon\b/g,
                /\b(?:Orc|Goblin|Hobgoblin|Bugbear|Ogre|Troll|Giant|Demon|Devil|Angel|Celestial) (?:[A-Z][a-z]+)?\b/g,
                /\b[A-Z][a-z]+ (?:Dragon|Demon|Devil|Angel|Elemental|Golem|Undead|Beast|Fiend|Fey)\b/g,
            ]
        };
    }

    // Main parsing function
    parseDocument(text, projectId) {
        const entities = new Map();
        const relationships = [];
        
        // Extract entities by type
        for (const [type, patterns] of Object.entries(this.patterns)) {
            for (const pattern of patterns) {
                const matches = text.match(pattern) || [];
                for (const match of matches) {
                    const cleanName = this.cleanEntityName(match);
                    if (cleanName && !entities.has(cleanName)) {
                        entities.set(cleanName, {
                            name: cleanName,
                            type: type,
                            mentions: 1,
                            firstPosition: text.indexOf(match),
                            context: this.extractContext(text, text.indexOf(match))
                        });
                    } else if (entities.has(cleanName)) {
                        entities.get(cleanName).mentions++;
                    }
                }
            }
        }

        // Detect relationships using NLP
        const doc = nlp(text);
        relationships.push(...this.findRelationships(doc, entities));

        return {
            entities: Array.from(entities.values()),
            relationships: relationships,
            chunks: this.chunkDocument(text, entities)
        };
    }

    cleanEntityName(name) {
        return name.trim()
            .replace(/^(The|A|An)\s+/i, '') // Remove articles
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    extractContext(text, position, radius = 100) {
        const start = Math.max(0, position - radius);
        const end = Math.min(text.length, position + radius);
        return text.substring(start, end).trim();
    }

    findRelationships(doc, entities) {
        const relationships = [];
        const entityNames = Array.from(entities.keys());
        
        // Look for relationship patterns
        const sentences = doc.sentences().out('array');
        
        for (const sentence of sentences) {
            const mentionedEntities = entityNames.filter(name => 
                sentence.toLowerCase().includes(name.toLowerCase())
            );
            
            if (mentionedEntities.length >= 2) {
                // Find relationship type based on context
                const relationshipType = this.detectRelationshipType(sentence);
                
                for (let i = 0; i < mentionedEntities.length - 1; i++) {
                    for (let j = i + 1; j < mentionedEntities.length; j++) {
                        relationships.push({
                            entity1: mentionedEntities[i],
                            entity2: mentionedEntities[j],
                            type: relationshipType,
                            context: sentence,
                            strength: this.calculateRelationshipStrength(sentence, relationshipType)
                        });
                    }
                }
            }
        }
        
        return relationships;
    }

    detectRelationshipType(sentence) {
        const lowerSentence = sentence.toLowerCase();
        
        if (lowerSentence.includes('enemy') || lowerSentence.includes('fight') || lowerSentence.includes('battle')) {
            return 'enemies';
        } else if (lowerSentence.includes('friend') || lowerSentence.includes('ally') || lowerSentence.includes('help')) {
            return 'allies';
        } else if (lowerSentence.includes('in') || lowerSentence.includes('at') || lowerSentence.includes('located')) {
            return 'located_in';
        } else if (lowerSentence.includes('owns') || lowerSentence.includes('has') || lowerSentence.includes('possesses')) {
            return 'owns';
        } else if (lowerSentence.includes('knows') || lowerSentence.includes('met') || lowerSentence.includes('familiar')) {
            return 'knows';
        } else if (lowerSentence.includes('part of') || lowerSentence.includes('member') || lowerSentence.includes('belongs')) {
            return 'part_of';
        }
        
        return 'related'; // Default relationship type
    }

    calculateRelationshipStrength(sentence, relationshipType) {
        const strongWords = ['very', 'extremely', 'deeply', 'completely', 'totally', 'absolutely'];
        const weakWords = ['slightly', 'somewhat', 'barely', 'hardly', 'maybe', 'perhaps'];
        
        const lowerSentence = sentence.toLowerCase();
        
        if (strongWords.some(word => lowerSentence.includes(word))) {
            return 0.9;
        } else if (weakWords.some(word => lowerSentence.includes(word))) {
            return 0.3;
        }
        
        return 0.6; // Default strength
    }

    chunkDocument(text, entities) {
        const chunks = [];
        const paragraphs = text.split(/\n\s*\n/);
        let position = 0;
        
        for (const paragraph of paragraphs) {
            if (paragraph.trim()) {
                const chunkEntities = Array.from(entities.keys()).filter(name =>
                    paragraph.toLowerCase().includes(name.toLowerCase())
                );
                
                chunks.push({
                    content: paragraph.trim(),
                    type: this.detectChunkType(paragraph),
                    position_start: position,
                    position_end: position + paragraph.length,
                    entities: chunkEntities
                });
            }
            position += paragraph.length + 2; // +2 for \n\n
        }
        
        return chunks;
    }

    detectChunkType(text) {
        const lowerText = text.toLowerCase();
        
        if (text.startsWith('#')) return 'chapter';
        if (text.includes('**Armor Class**') || text.includes('**Hit Points**')) return 'stat_block';
        if (text.includes('{{monster') || text.includes('{{spell')) return 'stat_block';
        if (text.includes('{{note') || text.includes('{{descriptive')) return 'description';
        if (lowerText.includes('read aloud') || lowerText.includes('boxed text')) return 'description';
        
        return 'section';
    }
}

export default EntityParser;
