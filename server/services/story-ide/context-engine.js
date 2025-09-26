// Context-Aware GPT Integration
// Provides intelligent context to GPT based on project knowledge graph

import KnowledgeGraph from './knowledge-graph.js';

class ContextEngine {
    constructor() {
        this.knowledgeGraph = new KnowledgeGraph();
    }

    // Main context-aware response generation
    async generateContextAwareResponse(brewId, userMessage, documentText, options = {}) {
        try {
            // Get or create project
            let project = await this.knowledgeGraph.getProjectByBrewId(brewId);
            if (!project) {
                const projectId = await this.knowledgeGraph.createProject(brewId, 'Untitled Story', '');
                project = { id: projectId, brew_id: brewId };
            }

            // Process document if it has changed
            if (documentText && documentText.trim()) {
                await this.knowledgeGraph.processDocument(project.id, documentText);
            }

            // Get relevant context for the user's request
            const context = await this.knowledgeGraph.getContextForQuery(project.id, userMessage);

            // Build enhanced prompt with full project context
            const enhancedPrompt = await this.buildContextualPrompt(userMessage, documentText, context, options);

            return {
                success: true,
                prompt: enhancedPrompt,
                context: context,
                projectId: project.id
            };

        } catch (error) {
            console.error('Context Engine error:', error);
            return {
                success: false,
                error: error.message,
                fallbackPrompt: this.buildBasicPrompt(userMessage, documentText, options)
            };
        }
    }

    async buildContextualPrompt(userMessage, documentText, context, options) {
        const { editType = 'general', preserveStyle = true } = options;

        return `You are an advanced Story IDE Assistant with complete project awareness. You have access to the full knowledge graph of this D&D story project.

CURRENT DOCUMENT:
${documentText || 'No document currently open'}

PROJECT CONTEXT:
${context.context}

USER REQUEST: "${userMessage}"

STORY IDE CAPABILITIES:
You are operating as a Story IDE with the following capabilities:
- **Context Awareness**: You can see all entities, relationships, and content across the project
- **Consistency Enforcement**: Maintain continuity with established lore, names, and relationships
- **Cross-Linking**: Reference and connect related story elements automatically
- **Inline Editing**: Provide surgical edits that preserve existing style and structure
- **Knowledge Graph Integration**: Understand how all story elements connect
- **Theme-Aware Formatting**: Use proper Homebrewery tokens for professional D&D sourcebook styling

ENTITY RELATIONSHIPS AVAILABLE:
${this.formatEntityContext(context.relatedEntities)}

EDIT INSTRUCTIONS:
${this.getEditInstructions(editType)}

COMPLETE HOMEBREWERY THEME TOKENS REFERENCE:
${await this.getThemeTokensReference()}

RESPONSE FORMAT:
${this.getResponseFormat(editType)}

CRITICAL RULES:
1. **Maintain Consistency**: Always reference and maintain consistency with existing entities and relationships
2. **Cross-Reference**: When mentioning entities, ensure they align with established lore
3. **Surgical Edits**: Make precise changes while preserving the overall document structure
4. **Professional Quality**: Match the tone and style of official D&D sourcebooks
5. **Complete Context**: Use the full project context to inform your response
6. **Theme-Aware Formatting**: Always use appropriate Homebrewery tokens for professional styling
7. **Content Generation**: When creating new content (villains, NPCs, locations), use proper formatting tokens

Analyze the project context and provide your response now.`;
    }

    formatEntityContext(entities) {
        if (!entities || entities.length === 0) return 'No related entities found.';

        return entities.map(entity => {
            const properties = JSON.parse(entity.properties || '{}');
            return `- ${entity.name} (${entity.type}): ${entity.description}${properties.mentions ? ` [mentioned ${properties.mentions} times]` : ''}`;
        }).join('\n');
    }

    getEditInstructions(editType) {
        const instructions = {
            general: 'Provide helpful assistance while maintaining project consistency.',
            expand: 'Expand the selected content with rich detail while maintaining consistency with existing lore.',
            rewrite: 'Rewrite the selected content to improve clarity and style while preserving meaning and consistency.',
            summarize: 'Create a concise summary that captures the essential information.',
            tone_adjust: 'Adjust the tone and voice while preserving the content and maintaining consistency.',
            cross_link: 'Add cross-references and connections to related entities in the project.',
            consistency_check: 'Review for consistency with established lore and suggest corrections.'
        };

        return instructions[editType] || instructions.general;
    }

    getResponseFormat(editType) {
        if (editType === 'inline_edit') {
            return `Respond with JSON:
{
  "type": "inline_edit",
  "message": "Brief explanation of changes",
  "hasChanges": true,
  "originalText": "The text being replaced",
  "newText": "The replacement text",
  "reasoning": "Why this change improves the content"
}`;
        } else if (editType === 'consistency_check') {
            return `Respond with JSON:
{
  "type": "consistency_report",
  "issues": [
    {
      "type": "inconsistency|contradiction|missing_reference",
      "description": "What the issue is",
      "suggestion": "How to fix it",
      "entities_involved": ["entity1", "entity2"]
    }
  ],
  "overall_score": 0.85
}`;
        } else {
            return `For document editing, respond with JSON:
{
  "type": "document_edit",
  "message": "Conversational explanation of what you're doing",
  "hasChanges": true,
  "previewChanges": "The COMPLETE document with ONLY the requested changes applied"
}

For conversation, respond in plain text with helpful information and suggestions.`;
        }
    }

    async getThemeTokensReference() {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const themesPath = path.join(process.cwd(), 'themes.index.json');
            
            if (fs.existsSync(themesPath)) {
                const themesData = JSON.parse(fs.readFileSync(themesPath, 'utf8'));
                return this.formatThemeTokens(themesData);
            }
        } catch (error) {
            console.warn('Failed to load themes.index.json:', error.message);
        }
        
        // Fallback to basic formatting knowledge
        return `**Basic Homebrewery Formatting:**
- Page breaks: \\page
- Column breaks: \\column  
- Wide content: {{wide}}
- Monster stat blocks: {{monster,frame}}
- Note boxes: {{note ##### Title\\nContent}}
- Descriptive boxes: {{descriptive ##### Title\\nContent}}`;
    }

    formatThemeTokens(themesData) {
        const sections = [];
        
        // Format each token category
        Object.entries(themesData.tokens || {}).forEach(([category, tokens]) => {
            if (Object.keys(tokens).length === 0) return;
            
            sections.push(`**${category.toUpperCase()}:**`);
            Object.entries(tokens).forEach(([name, tokenData]) => {
                sections.push(`- ${tokenData.token}: ${tokenData.usage}`);
                if (tokenData.example) {
                    sections.push(`  Example: ${tokenData.example}`);
                }
            });
            sections.push('');
        });
        
        // Add page commands
        if (themesData.pageCommands) {
            sections.push('**PAGE COMMANDS:**');
            Object.entries(themesData.pageCommands).forEach(([name, cmdData]) => {
                sections.push(`- ${cmdData.command}: ${cmdData.usage}`);
                if (cmdData.example) {
                    sections.push(`  Example: ${cmdData.example}`);
                }
            });
            sections.push('');
        }
        
        return sections.join('\n');
    }

    buildBasicPrompt(userMessage, documentText, options) {
        return `You are a D&D Story Assistant. 

CURRENT DOCUMENT:
${documentText || 'No document currently open'}

USER REQUEST: "${userMessage}"

Please provide helpful assistance with D&D storytelling, maintaining consistency and using proper Homebrewery formatting.`;
    }

    // Get project graph for visualization
    async getProjectGraph(brewId) {
        try {
            const project = await this.knowledgeGraph.getProjectByBrewId(brewId);
            if (!project) return null;

            return await this.knowledgeGraph.getProjectGraph(project.id);
        } catch (error) {
            console.error('Failed to get project graph:', error);
            return null;
        }
    }

    // Search across project for context
    async searchProject(brewId, query) {
        try {
            const project = await this.knowledgeGraph.getProjectByBrewId(brewId);
            if (!project) return null;

            return await this.knowledgeGraph.getContextForQuery(project.id, query, 10);
        } catch (error) {
            console.error('Failed to search project:', error);
            return null;
        }
    }

    // Process document changes
    async processDocumentUpdate(brewId, documentText) {
        try {
            const project = await this.knowledgeGraph.getProjectByBrewId(brewId);
            if (!project) return false;

            await this.knowledgeGraph.processDocument(project.id, documentText);
            return true;
        } catch (error) {
            console.error('Failed to process document update:', error);
            return false;
        }
    }
}

export { ContextEngine };
export default ContextEngine;
