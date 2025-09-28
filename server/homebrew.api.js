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

	// Story IDE endpoint - Patch-based system with PDF reading
		storyAssistant : async (req, res)=>{
		try {
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
			console.log('[Story IDE] Request: "' + requestText.substring(0, 100) + '"');

			if (!process.env.OPENAI_API_KEY) {
				console.error("❌ OPENAI_API_KEY not found in environment");
				return res.status(500).json({ error: "OpenAI API key not configured" });
			}

			// Check if this is a PDF-related request
			const isPDFRequest = requestText.toLowerCase().includes('pdf') || 
								requestText.toLowerCase().includes('file') ||
								requestText.toLowerCase().includes('upload');

			let pdfContext = '';
			if (references && references.length > 0) {
				try {
					console.log(`[Story IDE] Processing ${references.length} uploaded files...`);
					
					const PDFProcessor = (await import('./services/story-ide/pdf-processor.js')).PDFProcessor;
					const pdfProcessor = new PDFProcessor();
					
					// Process uploaded PDF files from references
					const pdfFiles = references.filter(ref => 
						ref.mimeType === 'application/pdf' || 
						ref.name.toLowerCase().endsWith('.pdf')
					);
					
					if (pdfFiles.length > 0) {
						console.log(`[Story IDE] Found ${pdfFiles.length} PDF files to process`);
						pdfContext = '\n[PDF CONTENT FOUND]\n';
						
						for (const pdfFile of pdfFiles) {
							try {
								console.log(`[Story IDE] Processing ${pdfFile.name}...`);
								
								// Convert base64 to buffer for PDF processing
								let pdfBuffer;
								if (pdfFile.encoding === 'base64') {
									pdfBuffer = Buffer.from(pdfFile.content, 'base64');
								} else {
									console.warn(`[Story IDE] Unsupported encoding: ${pdfFile.encoding} for ${pdfFile.name}`);
									continue;
								}
								
								// Extract text from the PDF
								const extractedText = await pdfProcessor.extractPDFText(pdfBuffer);
								
								if (extractedText && extractedText.trim()) {
									console.log(`[Story IDE] Extracted ${extractedText.length} characters from ${pdfFile.name}`);
									pdfContext += `From ${pdfFile.name}:\n${extractedText.substring(0, 3000)}\n\n`;
								} else {
									console.warn(`[Story IDE] No text extracted from ${pdfFile.name}`);
								}
								
							} catch (fileError) {
								console.error(`[Story IDE] Error processing ${pdfFile.name}:`, fileError.message);
								pdfContext += `Error processing ${pdfFile.name}: ${fileError.message}\n\n`;
							}
						}
					}
					
					// Also search any local PDF content if this is a PDF-related request
					const isPDFRequest = requestText.toLowerCase().includes('pdf') || 
										requestText.toLowerCase().includes('file') ||
										requestText.toLowerCase().includes('upload');
					
					if (isPDFRequest) {
						const searchTerms = api.extractSearchTerms(requestText);
						console.log(`[Story IDE] Also searching local PDFs for: ${searchTerms.join(', ')}`);
						
						const localResults = await pdfProcessor.searchPDFContent(searchTerms.join(' '), 10);
						
						if (localResults.length > 0) {
							pdfContext += '\n[LOCAL PDF CONTENT FOUND]\n';
							localResults.forEach(result => {
								pdfContext += `From ${result.source}: ${result.content}\n`;
							});
							pdfContext += '\n';
						}
					}
					
				} catch (error) {
					console.warn('[Story IDE] PDF processing failed:', error.message);
					pdfContext += `\n[PDF PROCESSING ERROR: ${error.message}]\n`;
				}
			}
			
			const { OpenAI } = await import('openai');
			const openai = new OpenAI({
				apiKey: process.env.OPENAI_API_KEY,
			});

			// Updated system prompt for patch-based responses with PDF awareness
			const systemPrompt = `You are TaleForge Story IDE, an in-editor assistant for D&D sourcebooks.

CRITICAL: When user asks about PDF content, use ONLY the information provided in the [PDF CONTENT FOUND] section. Do not make up fictional content.

OBJECTIVES:
- Read the user's draft and any provided PDF content
- Answer questions deeply using actual source material  
- When asked to create or edit content, propose a patch (unified diff)
- Use ONLY real information from PDFs when available

OUTPUT MODES:
1) chat: Short explanation using actual PDF content
2) patch: Unified diff for content changes

RESPONSE FORMAT:
For chat: [MODE: chat] followed by explanation
For patches: [MODE: patch] followed by explanation, then diff block

RULES:
- If PDF content is available, use ONLY that information
- Never invent fictional content when real PDF data exists
- If no PDF content found, clearly state this
- Make patches idempotent using @@ context hunks
			`;

			// Build context with document and PDF content
			const docContext = documentText ? documentText.substring(0, 2000) + (documentText.length > 2000 ? '...' : '') : 'No document content';
			const metaInfo = `Title: ${metadata?.title || 'Untitled'}\nURL: ${metadata?.url || ''}\nEditId: ${metadata?.editId || ''}`;
			
			const userPrompt = `[DOCUMENT METADATA]
${metaInfo}

[CURRENT DOCUMENT]
${docContext}
${pdfContext}
[USER REQUEST]
${requestText}`;

			console.log(`[Story Assistant] Making OpenAI API call...`);
			
			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.6,
				max_tokens: 1500,
			});

			console.log(`[Story Assistant] OpenAI response received`);
			
			const responseContent = completion.choices[0].message.content.trim();
			console.log(`[Story Assistant] Raw response: ${responseContent.substring(0, 200)}...`);

			// Parse response for mode (patch vs chat)
			const { mode, patch, explanation } = api.parseStoryIDEResponse(responseContent);

			if (mode === 'patch' && patch) {
				return res.status(200).json({
					success: true,
					mode: 'patch',
					patch: patch,
					explanation: explanation,
					hasMore: false,
					raw: responseContent
				});
			} else {
				// Extract actual response content, removing [MODE: chat] if present
				let messageContent = explanation || responseContent;
				if (messageContent.startsWith('[MODE: chat]')) {
					messageContent = messageContent.substring('[MODE: chat]'.length).trim();
				}
				
				return res.status(200).json({
					success: true,
					mode: 'chat',
					message: messageContent,
					hasMore: false,
					raw: responseContent
				});
			}

		} catch (error) {
			console.error('Story IDE error:', error);
			res.status(500).json({
				success: false,
				error: 'Story IDE request failed',
				details: error.message
			});
		}
	},

	// Extract search terms from natural language request
	extractSearchTerms: (requestText) => {
		// Remove common words and extract key terms
		const stopWords = ['the', 'in', 'pdf', 'file', 'what', 'are', 'main', 'tell', 'me', 'about', 'can', 'you'];
		const words = requestText.toLowerCase()
			.split(/\s+/)
			.filter(word => word.length > 2 && !stopWords.includes(word));
		
		return words.slice(0, 5); // Return top 5 key terms
	},

	// Parse Story IDE response for mode detection
	parseStoryIDEResponse: (responseContent) => {
		const lines = responseContent.split('\n');
		const firstLine = lines[0].trim();
		
		if (firstLine.startsWith('[MODE: patch]')) {
			// Extract explanation and patch
			let explanation = '';
			let diffStartIndex = -1;
			
			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim().startsWith('```diff')) {
					diffStartIndex = i;
					break;
				} else if (lines[i].trim() && !lines[i].startsWith('```')) {
					explanation += lines[i] + '\n';
				}
			}
			
			let patch = '';
			if (diffStartIndex !== -1) {
				let diffEndIndex = lines.length;
				for (let i = diffStartIndex + 1; i < lines.length; i++) {
					if (lines[i].trim() === '```') {
						diffEndIndex = i;
						break;
					}
				}
				patch = lines.slice(diffStartIndex + 1, diffEndIndex).join('\n');
			}
			
			return {
				mode: 'patch',
				patch: patch,
				explanation: explanation.trim()
			};
		} else if (firstLine.startsWith('[MODE: chat]')) {
			return {
				mode: 'chat',
				explanation: lines.slice(1).join('\n').trim()
			};
		} else {
			// Default to chat mode
			return {
				mode: 'chat',
				explanation: responseContent
			};
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