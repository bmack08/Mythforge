/* eslint-disable max-lines */
import _                             from 'lodash';
import { getModels } from './models/index.js';
import express                       from 'express';
import zlib                          from 'zlib';
import GoogleActions                 from './googleActions.js';
import Markdown                      from '../shared/naturalcrit/markdown.js';
import yaml                          from 'js-yaml';
import asyncHandler                  from 'express-async-handler';
import { nanoid }                    from 'nanoid';
import {makePatches, applyPatches, stringifyPatches, parsePatch} from '@sanity/diff-match-patch';
import { md5 }                       from 'hash-wasm';
import { splitTextStyleAndMetadata, 
		 brewSnippetsToJSON, debugTextMismatch }        from '../shared/helpers.js';
import checkClientVersion            from './middleware/check-client-version.js';
import KnowledgeGraph                from './services/story-ide/knowledge-graph.js';

const router = express.Router();

import { DEFAULT_BREW, DEFAULT_BREW_LOAD } from './brewDefaults.js';
import Themes from '../themes/themes.json' with { type: 'json' };

const isStaticTheme = (renderer, themeName)=>{
	return renderer === 'PHB' && themeName === '5ePHB';
};

const api = {
	// Create new brew
	newBrew : async (req, res)=>{
		try {
			const { Homebrew } = await getModels();
			const brew = await Homebrew.create({
				title: 'Untitled Brew',
				text: DEFAULT_BREW,
				renderer: 'PHB',
				theme: '5ePHB',
				shareId: nanoid(8),
				editId: nanoid(8)
			});

			res.json({
				success: true,
				brew: {
					_id: brew.id,
					title: brew.title,
					text: brew.text,
					renderer: brew.renderer,
					theme: brew.theme,
					shareId: brew.shareId,
					editId: brew.editId,
					createdAt: brew.createdAt,
					updatedAt: brew.updatedAt
				}
			});
		} catch (error) {
			console.error('New brew error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create new brew',
				details: error.message
			});
		}
	},

	// Update existing brew
	updateBrew : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { title, text, renderer, theme } = req.body;

			const { Homebrew } = await getModels();
			const brew = await Homebrew.findByPk(brewId);
			
			if (!brew) {
				return res.status(404).json({
					success: false,
					error: 'Brew not found'
				});
			}
			
			await brew.update({
				title: title || brew.title,
				text: text || brew.text,
				renderer: renderer || brew.renderer,
				theme: theme || brew.theme
			});

			res.json({
				success: true,
				brew: {
					_id: brew.id,
					title: brew.title,
					text: brew.text,
					renderer: brew.renderer,
					theme: brew.theme,
					shareId: brew.shareId,
					editId: brew.editId,
					createdAt: brew.createdAt,
					updatedAt: brew.updatedAt
				}
			});
		} catch (error) {
			console.error('Update brew error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to update brew',
				details: error.message
			});
		}
	},

	// Delete brew
	deleteBrew : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { Homebrew } = await getModels();
			await Homebrew.destroy({ where: { id: brewId } });
			res.json({ success: true });
		} catch (error) {
			console.error('Delete brew error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to delete brew',
				details: error.message
			});
		}
	},

	// Get theme bundle
	getThemeBundle : async (req, res)=>{
		/*	getThemeBundle: Collects the theme and all parent themes
		 *	and returns them as a single CSS string. This allows themes
		 *	to extend other themes and only load what's needed.
		 */
		const { themeName, renderer } = req.params;
		const theme = Themes[themeName];
		
		if (!theme) {
			return res.status(404).json({ error: 'Theme not found' });
		}

		const bundle = {
			name: themeName,
			styles: []
		};

		// Add theme styles
		if (theme.styles) {
			bundle.styles.push(...theme.styles);
		}

		// Add parent theme styles
		if (theme.parent) {
			const parentTheme = Themes[theme.parent];
			if (parentTheme && parentTheme.styles) {
				bundle.styles.unshift(...parentTheme.styles);
			}
		}

		// Add renderer styles
		if (renderer && theme.renderers && theme.renderers[renderer]) {
			bundle.styles.push(...theme.renderers[renderer]);
		}

		res.json(bundle);
	},

	// Get user projects
	getUserProjects : async (req, res)=>{
		try {
			const { Homebrew } = await getModels();
			const brews = await Homebrew.findAll({
				order: [['updatedAt', 'DESC']],
				limit: 50
			});
			
			res.json({
				success: true,
				brews: brews.map(brew => ({
					_id: brew.id,
					title: brew.title,
					text: brew.text,
					renderer: brew.renderer,
					theme: brew.theme,
					shareId: brew.shareId,
					editId: brew.editId,
					createdAt: brew.createdAt,
					updatedAt: brew.updatedAt
				}))
			});
		} catch (error) {
			console.error('Get user projects error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get projects',
				details: error.message
			});
		}
	},

	// Get projects (alias for getUserProjects)
	getProjects : async (req, res)=>{
		try {
			const { Homebrew } = await getModels();
			const brews = await Homebrew.findAll({
				order: [['updatedAt', 'DESC']],
				limit: 50
			});
			
			res.json({
				success: true,
				projects: brews.map(brew => ({
					id: brew.id,
					title: brew.title,
					text: brew.text,
					renderer: brew.renderer,
					theme: brew.theme,
					shareId: brew.shareId,
					editId: brew.editId,
					url: `/edit/${brew.editId}`,
					createdAt: brew.createdAt,
					updatedAt: brew.updatedAt
				}))
			});
		} catch (error) {
			console.error('Get projects error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get projects',
				details: error.message
			});
		}
	},

	// Story IDE endpoint - Simple and working version
		storyAssistant : async (req, res)=>{
		try {
			// Debug: Check environment variables
			console.log(`[Story Assistant] OPENAI_API_KEY loaded: ${process.env.OPENAI_API_KEY ? 'YES' : 'NO'}`);
			if (process.env.OPENAI_API_KEY) {
				console.log(`[Story Assistant] API Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
			}

			const {
				message,
				documentText = '',
				metadata = {},
				chatHistory = [],
				references = [],
				storyState = {}
			} = req.body;

			if (!message || !message.trim()) {
				return res.status(400).json({
					success: false,
					error: 'Message is required'
				});
			}

			const requestText = message.trim();
			const logPreview = requestText.substring(0, 100) + (requestText.length > 100 ? '...' : '');
			console.log('[Story IDE] Request: "' + logPreview + '"');

			// Use direct OpenAI instead of AIService
			if (!process.env.OPENAI_API_KEY) {
				console.error("❌ OPENAI_API_KEY not found in environment");
				return res.status(500).json({ error: "OpenAI API key not configured" });
			}
			
			const { OpenAI } = await import('openai');
			const openai = new OpenAI({
				apiKey: process.env.OPENAI_API_KEY,
			});

			// Simple system prompt for action-based responses
			const systemPrompt = `You are a Story IDE assistant for D&D campaign creation. 
You help users modify and enhance their story documents.

INSTRUCTIONS:
1. Understand what the user wants to change
2. Analyze the current document structure
3. Generate appropriate modifications
4. Return ONLY valid JSON with this schema:

{
  "action": "modify | create | delete",
  "target": "title | content | section | npc | location | item",
  "changes": {
    "title": "new title if changing title",
    "content": "new content if changing content", 
    "section": "section name if targeting specific section"
  },
  "reasoning": "brief explanation of what you're doing",
  "metadata": {
    "tone": "mood or style applied",
    "tags": ["relevant", "tags"],
    "confidence": 0.8
  }
}

EXAMPLES:
- "change title to something mature and spooky" → action: "modify", target: "title", changes: {title: "The Shadow's Embrace"}
- "add a new villain" → action: "create", target: "npc", changes: {content: "villain description"}
- "make this section more dramatic" → action: "modify", target: "content", changes: {content: "enhanced dramatic text"}

Always return valid JSON only. No explanations outside the JSON.`;

			// Build context
			const docContext = documentText ? documentText.substring(0, 2000) + (documentText.length > 2000 ? '...' : '') : 'No document content';
			const metaInfo = `Title: ${metadata?.title || 'Untitled'}\nURL: ${metadata?.url || ''}\nEditId: ${metadata?.editId || ''}`;
			
			const userPrompt = `CURRENT DOCUMENT CONTEXT:
${metaInfo}

DOCUMENT CONTENT:
${docContext}

USER REQUEST: ${requestText}`;

			console.log(`[Story Assistant] Making OpenAI API call...`);
			
			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.7,
			});

			console.log(`[Story Assistant] OpenAI response received`);
			
			const responseContent = completion.choices[0].message.content.trim();
			console.log(`[Story Assistant] Raw AI response: ${responseContent.substring(0, 200)}...`);

			// Parse the JSON response
			let parsed;
			try {
				parsed = JSON.parse(responseContent);
				console.log(`[Story Assistant] Parsed action: ${parsed.action} on ${parsed.target}`);
			} catch (err) {
				console.error("❌ Failed to parse AI response:", responseContent);
				return res.status(500).json({ error: "Invalid JSON from AI" });
			}

			// Return the structured response
			return res.status(200).json({
				success: true,
				mode: 'structured',
				message: `Processed ${parsed.action} operation on ${parsed.target}`,
				summary: `Action: ${parsed.action}, Target: ${parsed.target}, Reasoning: ${parsed.reasoning || 'No reasoning provided'}`,
				structuredData: parsed,
				hasMore: false,
				referencesUsed: [],
				referenceDiagnostics: [],
				raw: responseContent
			});

		} catch (error) {
			console.error('Story IDE error:', error);
			res.status(500).json({
				success: false,
				error: 'Story IDE request failed',
				details: error.message
			});
		}
	},

	// Search project content
	searchProject : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { query } = req.body;
			
			if (!brewId || !query) {
				return res.status(400).json({
					success: false,
					error: 'Brew ID and query are required'
				});
			}

			// Simple search for now - search in brew text
			const { Homebrew } = await getModels();
			const brew = await Homebrew.findByPk(brewId);
			
			if (!brew) {
				return res.status(404).json({
					success: false,
					error: 'Brew not found'
				});
			}
			
			// Simple text search
			const results = brew.text.toLowerCase().includes(query.toLowerCase()) ? [{
				id: brew.id,
				title: brew.title,
				text: brew.text.substring(0, 200) + '...',
				score: 1.0
			}] : [];
			
			res.json({
				success: true,
				results: results
			});

		} catch (error) {
			console.error('Search project error:', error);
			res.status(500).json({
				success: false,
				error: 'Search failed',
				details: error.message
			});
		}
	},

	// Get project graph
	getProjectGraph : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { Homebrew } = await getModels();
			const brew = await Homebrew.findByPk(brewId);
			
			if (!brew) {
				return res.status(404).json({ error: 'Brew not found' });
			}
			
			// Simple graph structure for now
			const graph = {
				nodes: [
					{ id: 'root', type: 'document', title: brew.title || 'Untitled' }
				],
				edges: []
			};
			
			res.json({
				success: true,
				graph: graph
			});
		} catch (error) {
			console.error('Get project graph error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to get project graph',
				details: error.message
			});
		}
	}
};

// Additional functions needed by server/app.js
export const getBrew = (type = 'share', requireAuth = false) => {
	return async (req, res, next) => {
		try {
			const { id } = req.params;
			const { Homebrew } = await getModels();
			
			// Try to find by editId first, then by primary key
			let brew = await Homebrew.findOne({ where: { editId: id } });
			if (!brew) {
				brew = await Homebrew.findByPk(id);
			}
			
			if (!brew) {
				return res.status(404).json({ error: 'Brew not found' });
			}
			
			// Add brew to request object for next middleware
			req.brew = {
				_id: brew.id,
				title: brew.title,
				text: brew.text,
				renderer: brew.renderer,
				theme: brew.theme,
				shareId: brew.shareId,
				editId: brew.editId,
				createdAt: brew.createdAt,
				updatedAt: brew.updatedAt
			};
			
			next();
		} catch (error) {
			console.error('Get brew error:', error);
			res.status(500).json({ error: 'Failed to get brew' });
		}
	};
};

export const getUsersBrewThemes = async (username) => {
	try {
		const { Homebrew } = await getModels();
		const brews = await Homebrew.findAll({
			attributes: ['renderer'],
			group: ['renderer']
		});
		return brews.map(brew => brew.renderer).filter(Boolean);
	} catch (error) {
		console.error('Get themes error:', error);
		return [];
	}
};

export const getCSS = async (req, res) => {
	try {
		const { themeName, renderer } = req.params;
		const theme = Themes[themeName];
		
		if (!theme) {
			return res.status(404).json({ error: 'Theme not found' });
		}

		let css = '';
		
		// Add parent theme styles
		if (theme.parent) {
			const parentTheme = Themes[theme.parent];
			if (parentTheme && parentTheme.styles) {
				css += parentTheme.styles.join('\n');
			}
		}
		
		// Add theme styles
		if (theme.styles) {
			css += '\n' + theme.styles.join('\n');
		}
		
		// Add renderer styles
		if (renderer && theme.renderers && theme.renderers[renderer]) {
			css += '\n' + theme.renderers[renderer].join('\n');
		}
		
		res.setHeader('Content-Type', 'text/css');
		res.send(css);
  } catch (error) {
		console.error('Get CSS error:', error);
		res.status(500).json({ error: 'Failed to get CSS' });
	}
};

// Export the router for use in app.js
export const homebrewApi = router;

export default api;