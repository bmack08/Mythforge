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
import fs                            from 'fs';
import { join }                      from 'path';
import { md5 }                       from 'hash-wasm';
import OpenAI                        from 'openai';
import { splitTextStyleAndMetadata, 
		 brewSnippetsToJSON, debugTextMismatch }        from '../shared/helpers.js';
import checkClientVersion            from './middleware/check-client-version.js';
import KnowledgeGraph                from './services/story-ide/knowledge-graph.js';

const router = express.Router();

// Lazy singleton OpenAI client to avoid import-time failures in dev
let __openaiClient = null;
export const getOpenAI = () => {
	const key = (process.env.OPENAI_API_KEY || '').trim();
	if (!key) return null; // Avoid crashing during dev import; handler will respond gracefully
	if (__openaiClient) return __openaiClient;
	__openaiClient = new OpenAI({ apiKey: key });
	return __openaiClient;
};

// Add theme bundle route
// --- ROUTES ---
router.get('/api/theme/:renderer/:id', asyncHandler((req, res) => api.getThemeBundle(req, res)));
// Story IDE (main assistant endpoint)
router.post('/api/story-ide', asyncHandler((req, res) => api.storyAssistant(req, res)));
// (Optional) wire up other endpoints already implemented
router.post('/api/brews',           asyncHandler((req, res) => api.newBrew(req, res)));
router.put('/api/brews/:brewId',    asyncHandler((req, res) => api.updateBrew(req, res)));
router.delete('/api/brews/:brewId', asyncHandler((req, res) => api.deleteBrew(req, res)));
router.post('/api/search/:brewId',  asyncHandler((req, res) => api.searchProject(req, res)));
router.get('/api/graph/:brewId',    asyncHandler((req, res) => api.getProjectGraph(req, res)));
// Versioning (Phase 1)
router.post('/api/story/version/:brewId', asyncHandler((req, res) => api.createStoryVersion(req, res)));
router.post('/api/story/undo/:brewId',    asyncHandler((req, res) => api.undoStoryVersion(req, res)));
router.post('/api/story/redo/:brewId',    asyncHandler((req, res) => api.redoStoryVersion(req, res)));
router.get('/api/story/version/:brewId/active', asyncHandler((req, res) => api.getActiveStoryVersionEndpoint(req, res)));
// Phase 2: Index and Retrieval
router.post('/api/story/index/:brewId', asyncHandler((req, res) => api.indexStoryChunks(req, res)));
router.post('/api/story/retrieve/:brewId', asyncHandler((req, res) => api.retrieveStoryChunks(req, res)));
// Phase 6: Orchestrated flow (cursor-aware)
router.post('/api/story/orchestrate/:brewId', asyncHandler((req, res) => api.orchestrateStoryEdit(req, res)));
// Phase 5–7: env-gated feature endpoints
router.post('/api/phase5/budget/compute', asyncHandler((req, res) => api.computeBudget(req, res)));
router.post('/api/phase6/encounter/build', asyncHandler((req, res) => api.buildEncounter(req, res)));
router.post('/api/phase6/npc/generate', asyncHandler((req, res) => api.generateNpc(req, res)));
router.post('/api/phase7/validate/content', asyncHandler((req, res) => api.validateContent(req, res)));
// Phase 3: Knowledge Graph processing and canon checks
router.post('/api/story/graph/process/:brewId', asyncHandler((req, res) => api.processKnowledgeGraph(req, res)));
router.get('/api/story/graph/:brewId', asyncHandler((req, res) => api.getKnowledgeGraph(req, res)));
router.get('/api/story/graph/:brewId/canon', asyncHandler((req, res) => api.getCanonChecks(req, res)));

import { DEFAULT_BREW, DEFAULT_BREW_LOAD } from './brewDefaults.js';
import Themes from '../themes/themes.json' with { type: 'json' };

const isStaticTheme = (renderer, themeName)=>{
	return renderer === 'PHB' && themeName === '5ePHB';
};

const api = {
	// --- Shared helpers for version/text reconstruction ---
	getCurrentBrewText: async (brewId)=>{
		const { Homebrew } = await getModels();
		// brewId may be editId or pk id. Try editId first.
		let brew = await Homebrew.findOne({ where: { editId: brewId } });
		if (!brew) brew = await Homebrew.findByPk(brewId);
		return brew?.text || '';
	},

	// === Phases 5–7 minimal endpoints (env-gated) ===
	computeBudget: async (req, res)=>{
		try {
			if (process.env.MW_PHASE5_ENABLED !== '1') return res.status(404).json({ success: false, error: 'Phase 5 disabled' });
			const { partySize=4, partyLevel=5, difficulty='medium', restFrequency='standard', combatWeight=0.4, explorationWeight=0.3, socialWeight=0.3 } = req.body || {};
			const { default: xpCalc } = await import('./services/budget/encounter-xp-calculator.ts');
			const { default: treasure } = await import('./services/budget/treasure-allocation-system.ts');
			const { default: pacing } = await import('./services/budget/pacing-engine.ts');
			const { default: attrition } = await import('./services/budget/resource-attrition-calculator.ts');
			const xpBudget = xpCalc.computeEncounterBudget({ partySize, partyLevel, difficulty });
			const treasurePlan = treasure.planTreasure({ partyLevel, partySize });
			const pacingPlan = pacing.planPacing({ partyLevel, restFrequency, weights: { combat: combatWeight, exploration: explorationWeight, social: socialWeight } });
			const attritionPlan = attrition.compute({ partySize, partyLevel, restFrequency });
			return res.json({ success: true, budget: { xpBudget, treasurePlan, pacingPlan, attritionPlan } });
		} catch (e) {
			console.error('computeBudget error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	buildEncounter: async (req, res)=>{
		try {
			if (process.env.MW_PHASE6_ENABLED !== '1') return res.status(404).json({ success: false, error: 'Phase 6 disabled' });
			const { spec } = req.body || {};
			const { default: builder } = await import('./services/encounter/comprehensive-encounter-builder.ts');
			const result = await builder.build(spec || {});
			return res.json({ success: true, encounter: result });
		} catch (e) {
			console.error('buildEncounter error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	generateNpc: async (req, res)=>{
		try {
			if (process.env.MW_PHASE6_ENABLED !== '1') return res.status(404).json({ success: false, error: 'Phase 6 disabled' });
			const { prompt } = req.body || {};
			const { default: npcMgr } = await import('./services/npc/comprehensive-npc-manager.ts');
			const npc = await npcMgr.generate(prompt || '');
			return res.json({ success: true, npc });
		} catch (e) {
			console.error('generateNpc error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	validateContent: async (req, res)=>{
		try {
			if (process.env.MW_PHASE7_ENABLED !== '1') return res.status(404).json({ success: false, error: 'Phase 7 disabled' });
			const { content, checks } = req.body || {};
			const { default: qa } = await import('./services/validation/content-quality-assurance.ts');
			const result = await qa.validate(content || '', checks || {});
			return res.json({ success: true, result });
		} catch (e) {
			console.error('validateContent error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	// === Phase 4: Tool registry execution ===
	executeStoryTools: async (tools, ctx)=>{
		const results = [];
		for (const t of tools) {
			const name = t?.name; const args = t?.args || {};
			if (name === 'create_section') {
				const title = String(args.title || 'New Section').trim();
				const content = String(args.content || '').trim();
				const patch = `@@\n+\n# ${title}\n\n${content}\n`;
				results.push({ tool: name, ok: true, patch });
			} else if (name === 'add_encounter') {
				// Minimal encounter block
				const title = String(args.title || 'Encounter').trim();
				const enemies = Array.isArray(args.enemies) ? args.enemies : [];
				const lines = [
					`### Encounter: ${title}`,
					'',
					'| Creature | CR | Count |',
					'| --- | --- | --- |',
					...enemies.map(e=>`| ${e.name||'Unknown'} | ${e.cr||'?'} | ${e.count||1} |`),
					''
				];
				results.push({ tool: name, ok: true, insert: lines.join('\n') });
			} else if (name === 'generate_statblock') {
				const npc = String(args.npc || 'Unnamed NPC');
				const cr = String(args.cr || '1');
				const block = [
					`### ${npc} (CR ${cr})`,
					'',
					':::statblock',
					'Name: '+npc,
					'CR: '+cr,
					'AC: 12 | HP: 11 (2d8+2) | Speed: 30 ft.',
					'STR 10 DEX 12 CON 12 INT 10 WIS 10 CHA 10',
					'Traits: ...',
					'Actions: ...',
					':::',
					''
				].join('\n');
				results.push({ tool: name, ok: true, insert: block });
			} else if (name === 'add_trap') {
				const dc = args.dc ?? 13;
				const trigger = String(args.trigger || 'Pressure plate');
				const effect = String(args.effect || '1d6 piercing damage');
				const trap = [
					'### Trap',
					'',
					`Trigger: ${trigger}`,
					`Check: DC ${dc} Perception to notice; DC ${dc} Thieves\' Tools to disarm`,
					`Effect: ${effect}`,
					''
				].join('\n');
				results.push({ tool: name, ok: true, insert: trap });
			} else if (name === 'timeline_update') {
				const when = String(args.when || 'Unknown date');
				const what = String(args.what || 'Event');
				const who = String(args.who || 'Unknown');
				const line = `- ${when}: ${what} (${who})`;
				results.push({ tool: name, ok: true, timeline: line });
			} else if (name === 'apply_patch') {
				results.push({ tool: name, ok: true, note: 'Client should apply patch locally, then POST /api/story/version with fullText.' });
			} else {
				results.push({ tool: name || 'unknown', ok: false, error: 'Unsupported tool' });
			}
		}
		return results;
	},

	// Apply insertions/updates into a section (by heading)
	insertIntoSection: (fullText, sectionHint, insertText)=>{
		const text = (fullText||'');
		const lines = text.replace(/\r/g,'\n').split('\n');
		const idx = lines.findIndex(l=>/^#\s+/.test(l) && l.toLowerCase().includes(String(sectionHint||'').toLowerCase()));
		if (idx === -1) {
			// Append at end if section not found
			return text + (text.endsWith('\n')?'':'\n') + '\n' + insertText + '\n';
		}
		// Find next heading to insert before it (end of this section)
		let j = idx + 1;
		for (; j < lines.length; j++) {
			if (/^#\s+/.test(lines[j])) break;
		}
		const before = lines.slice(0, j).join('\n');
		const after = lines.slice(j).join('\n');
		return `${before}\n\n${insertText}\n\n${after}`;
	},

	upsertTimeline: (fullText, timelineLine)=>{
		const text = (fullText||'');
		const lines = text.replace(/\r/g,'\n').split('\n');
		let idx = lines.findIndex(l=>/^##\s+timeline/i.test(l));
		if (idx === -1) {
			// Create a Timeline section at the end
			return `${text}\n\n## Timeline\n\n${timelineLine}\n`;
		}
		// Insert after the heading and contiguous bullet list
		let j = idx + 1;
		while (j < lines.length && lines[j].trim().startsWith('-')) j++;
		const before = lines.slice(0, j).join('\n');
		const after = lines.slice(j).join('\n');
		return `${before}\n${timelineLine}\n${after}`;
	},

	reconstructCurrentText: async (brewId)=>{
		// Prefer active StoryVersion snapshot; fallback to Homebrew text
		try {
			const active = await api.getActiveStoryVersion(brewId);
			if (active?.fullText) return active.fullText;
		} catch(_) {}
		return await api.getCurrentBrewText(brewId);
	},

	// --- Phase 1: Versioning helpers ---
	createStoryVersion : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { patch, fullText, author = 'ai', summary } = req.body || {};
			if (!brewId || !fullText) {
				return res.status(400).json({ success: false, error: 'brewId and fullText are required' });
			}
			const { StoryVersion } = await getModels();
			// Find current active version to set parent and deactivate it
			const current = await StoryVersion.findOne({ where: { brewId, isActive: true }, order: [['createdAt', 'DESC']] });
			const crypto = await import('crypto');
			const fullTextHash = crypto.createHash('sha256').update(fullText).digest('hex');
			const version = await StoryVersion.create({
				brewId,
				parentId: current?.id || null,
				author,
				patch: patch || null,
				fullText,
				fullTextHash,
				isActive: true,
				summary: summary || null
			});
			if (current) {
				await current.update({ isActive: false });
			}
			// Optional Phase 2: auto-index for RAG
			try {
				if (process.env.STORY_IDE_AUTOINDEX === '1') {
					await api.indexStoryChunks({ params: { brewId }, body: { fullText } }, { json: ()=>{}, status: ()=>({ json: ()=>{} }) });
				}
			} catch (e) { console.warn('Auto-index error:', e.message); }
			// Optional Phase 3: auto-process knowledge graph
			try {
				if (process.env.STORY_IDE_AUTOGRAPH === '1') {
					await api.processKnowledgeGraph({ params: { brewId }, body: { fullText, title: req.body?.title || '' } }, { json: ()=>{}, status: ()=>({ json: ()=>{} }) });
				}
			} catch (e) { console.warn('Auto-graph error:', e.message); }
			return res.json({ success: true, version });
		} catch (error) {
			console.error('createStoryVersion error:', error);
			return res.status(500).json({ success: false, error: 'Failed to create version' });
		}
	},

	getActiveStoryVersion : async (brewId)=>{
		const { StoryVersion } = await getModels();
		return await StoryVersion.findOne({ where: { brewId, isActive: true }, order: [['createdAt', 'DESC']] });
	},

	getActiveStoryVersionEndpoint : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const version = await api.getActiveStoryVersion(brewId);
			if (!version) return res.status(404).json({ success: false, error: 'No active version' });
			return res.json({ success: true, version });
		} catch (error) {
			console.error('getActiveStoryVersionEndpoint error:', error);
			return res.status(500).json({ success: false, error: 'Failed to get active version' });
		}
	},

	undoStoryVersion : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { StoryVersion } = await getModels();
			const current = await api.getActiveStoryVersion(brewId);
			if (!current) return res.status(404).json({ success: false, error: 'No current version' });
			if (!current.parentId) return res.status(400).json({ success: false, error: 'No parent to undo to' });
			const parent = await StoryVersion.findByPk(current.parentId);
			if (!parent) return res.status(404).json({ success: false, error: 'Parent version not found' });
			await current.update({ isActive: false });
			await parent.update({ isActive: true });
			return res.json({ success: true, version: parent });
		} catch (error) {
			console.error('undoStoryVersion error:', error);
			return res.status(500).json({ success: false, error: 'Failed to undo' });
		}
	},

	redoStoryVersion : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { StoryVersion } = await getModels();
			// Find a child of the current inactive-parent chain newer than active
			const active = await api.getActiveStoryVersion(brewId);
			if (!active) return res.status(404).json({ success: false, error: 'No active version to base redo on' });
			const child = await StoryVersion.findOne({ where: { parentId: active.id }, order: [['createdAt','ASC']] });
			if (!child) return res.status(400).json({ success: false, error: 'No redo available' });
			await active.update({ isActive: false });
			await child.update({ isActive: true });
			return res.json({ success: true, version: child });
		} catch (error) {
			console.error('redoStoryVersion error:', error);
			return res.status(500).json({ success: false, error: 'Failed to redo' });
		}
	},

	// Create new brew
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
			// Accept either editId (preferred) or numeric id
			let brew = await Homebrew.findOne({ where: { editId: brewId } });
			if (!brew) {
				// Fall back to primary key if brewId looks like a numeric id
				try {
					brew = await Homebrew.findByPk(brewId);
				} catch(_) {}
			}
			if (!brew) {
				console.warn(`[updateBrew] Brew not found for id/editId: ${brewId}`);
			}
			
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

	// Get theme bundle (normalized + snippet identifiers)
	getThemeBundle : async (req, res)=>{
		/*	getThemeBundle: Collects the theme and all parent themes
		 *	and returns them as a single CSS string. This allows themes
		 *	to extend other themes and only load what's needed.
		 *	Also includes snippet identifiers for the client SnippetBar.
		 */
		const { renderer: rendererParam, id: themeName } = req.params;
		const normalizeRenderer = (r)=>{
			const rl = String(r || '').toLowerCase();
			if(rl === 'legacy' || rl === 'phb') return 'Legacy';
			if(rl === 'v3') return 'V3';
			return r;
		};
		const renderer = normalizeRenderer(rendererParam);
		console.log(`🎨 getThemeBundle: Requesting ${renderer}/${themeName} (raw: ${rendererParam}/${themeName})`);
		
		if (!Themes || !Themes[renderer] || !Themes[renderer][themeName]) {
			console.log(`❌ getThemeBundle: Theme not found ${renderer}/${themeName}`);
			return res.status(404).json({ error: 'Theme not found' });
		}

		const themeConfig = Themes[renderer][themeName];
		const bundle = {
			name     : themeName,
			renderer : renderer,
			styles   : [],
			snippets : []
		};

		try {
			const cssPath = join(process.cwd(), 'build', 'themes', renderer, themeName, 'style.css');
			if (fs.existsSync(cssPath)) {
				const css = fs.readFileSync(cssPath, 'utf8');
				bundle.styles.push(css);
				console.log(`✅ getThemeBundle: Loaded CSS from ${cssPath} (${css.length} chars)`);
			} else {
				console.log(`❌ getThemeBundle: CSS file not found: ${cssPath}`);
			}

			if (themeConfig.baseTheme && themeConfig.baseTheme !== false) {
				const baseThemePath = join(process.cwd(), 'build', 'themes', renderer, themeConfig.baseTheme, 'style.css');
				if (fs.existsSync(baseThemePath)) {
					const baseCss = fs.readFileSync(baseThemePath, 'utf8');
					bundle.styles.unshift(baseCss);
					console.log(`✅ getThemeBundle: Loaded base theme from ${baseThemePath} (${baseCss.length} chars)`);
				}
			}

			const rendererPrefix = `${renderer}_`;
			const snippetIds = [];
			if (renderer === 'Legacy') {
				snippetIds.push(`${rendererPrefix}${themeName}`);
			} else if (renderer === 'V3') {
				if (themeConfig.baseSnippets && themeConfig.baseSnippets !== false) {
					snippetIds.push(`${rendererPrefix}${themeConfig.baseSnippets}`);
				}
				snippetIds.push(`${rendererPrefix}${themeName}`);
			}
			bundle.snippets = snippetIds;

			console.log(`✅ getThemeBundle: Bundle complete with ${bundle.styles.length} style(s), ${bundle.snippets.length} snippet source(s)`);
			res.json(bundle);
		} catch (error) {
			console.error('❌ getThemeBundle: Error loading theme:', error);
			res.status(500).json({ error: 'Failed to load theme bundle' });
		}
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
				return res.status(500).json({ success: false, error: "OpenAI API key not configured" });
			}

			// Check if this is a PDF-related request
			const isPDFRequest = /(?:\bpdf\b|\bfile\b|\bupload\b)/i.test(requestText);

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
					// (do not redeclare isPDFRequest)
					
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
			
            // Use top-level OpenAI client (configured at import time)

			// Build system prompt: general guidance first, optionally add PDF-specific guidance only when relevant
			const hasPdfContext = !!(pdfContext && pdfContext.trim().length);
			const baseSystemPrompt = `You are TaleForge Story IDE, an in-editor assistant for D&D sourcebooks.

OBJECTIVES:
- Read the user's draft and any provided reference material
- When asked to create or edit content, propose a patch (unified diff)
- Answer questions with grounded, concise explanations when not editing

OUTPUT MODES:
1) chat: Short explanation
2) patch: Unified diff for content changes

RESPONSE FORMAT:
For chat: [MODE: chat] followed by explanation
For patches: [MODE: patch] followed by explanation, then a single fenced diff block

RULES:
- Make patches idempotent using @@ context hunks
- Do not invent content outside of the provided context
`;

			let pdfGuidance = '';
			if (hasPdfContext) {
				pdfGuidance = `PDF GUIDANCE:
- When PDF content is included in the context, ground any citations or factual claims in that content.
- Do not invent facts that aren't present in the PDFs.
- Do not mention that PDFs were used unless the user asked about PDFs.`;
			} else if (isPDFRequest) {
				pdfGuidance = `PDF GUIDANCE:
- The user asked about PDFs, but no readable PDF content is provided in the context.
- Say once: "No PDF content was provided." Then proceed using the current document and conversation context without blocking.`;
			}

			const systemPrompt = [baseSystemPrompt, pdfGuidance].filter(Boolean).join('\n\n');

			// Build context with document (always) and PDF content (only when present) - use full document for patch accuracy
			const docContext = documentText || 'No document content';
			const metaInfo = `Title: ${metadata?.title || 'Untitled'}\nURL: ${metadata?.url || ''}\nEditId: ${metadata?.editId || ''}`;
			
			console.log(`[Story IDE] Document context length: ${documentText?.length || 0} chars`);
			console.log(`[Story IDE] Sent context (first 200 chars): ${docContext.substring(0, 200)}`);
			console.log(`[Story IDE] Metadata:`, metaInfo);
			
			let contextBlock = `[DOCUMENT METADATA]
${metaInfo}

[CURRENT DOCUMENT]
${docContext}`;
			if (hasPdfContext) {
				contextBlock += `\n${pdfContext}`;
			}

			// Optional: RAG retrieval for additional grounded context
			let ragBlock = '';
			try {
				if (process.env.STORY_IDE_USE_RAG === '1') {
					const brewId = metadata?.editId || null;
					if (brewId) {
						const rag = await api.retrieveContextForRequest(brewId, requestText, 8);
						if (rag && rag.length) {
							const joined = rag.map(r => `- ${r.section ? r.section + ': ' : ''}${r.text}`).join('\n');
							const clipped = joined.slice(0, 2000);
							ragBlock = `\n[RETRIEVED CONTEXT]\n${clipped}\n`;
						}
					}
				}
			} catch (e) {
				console.warn('[RAG] Skipping retrieval:', e.message);
			}

			const userPrompt = `${contextBlock}${ragBlock}
[USER REQUEST]
${requestText}`;

			console.log(`[Story Assistant] Making OpenAI API call...`);
			
			// Acquire OpenAI client lazily
			let openai;
			try {
				openai = getOpenAI();
			} catch (clientErr) {
				console.error('❌ OpenAI client initialization failed:', clientErr.message);
				return res.status(500).json({ success: false, error: clientErr.message });
			}

			const model = process.env.STORY_IDE_MODEL || "gpt-5-mini";
			// Determine correct token parameter and sampling support based on model family
			const usesMaxCompletion = (() => {
				const m = (model || '').toLowerCase();
				return m.startsWith('gpt-5') || m.startsWith('gpt-4.1') || m.startsWith('gpt-4o') || m.startsWith('o');
			})();
			const defaultSamplingOnly = usesMaxCompletion; // these families often lock sampling params
			console.log(`[Story Assistant] Model: ${model} | Token param: ${usesMaxCompletion ? 'max_completion_tokens' : 'max_tokens'} | Sampling params: ${defaultSamplingOnly ? 'default-only' : 'custom'}`);

			const basePayload = {
				model,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				]
			};
			// Only include sampling params if model supports them
			if (!defaultSamplingOnly) {
				const temp = process.env.STORY_IDE_TEMPERATURE ? Number(process.env.STORY_IDE_TEMPERATURE) : 0.2;
				const topP = process.env.STORY_IDE_TOP_P ? Number(process.env.STORY_IDE_TOP_P) : 0.9;
				// Guard NaN
				if (!Number.isNaN(temp)) basePayload.temperature = temp;
				if (!Number.isNaN(topP)) basePayload.top_p = topP;
			}
			// Use the correct token limit parameter based on model family
			if (usesMaxCompletion) {
				basePayload.max_completion_tokens = 1800;
			} else {
				basePayload.max_tokens = 1800;
			}
			// Note: Some newer models ignore or reject presence/frequency penalties; we intentionally omit them here.
			// Phase 4: Attempt JSON/tool-calling first when enabled
			let toolResult = null;
			if (process.env.STORY_IDE_JSON_MODE === '1') {
				try {
					const jsonSystem = `${systemPrompt}\n\nWhen appropriate, reply ONLY with strict JSON of shape {\n  \"mode\": \"chat\"|\"patch\"|\"tools\",\n  \"message\"?: string,\n  \"patch\"?: string,\n  \"tools\"?: Array<{name: string, args: object}>\n}.`;
					const jsonPayload = { ...basePayload, messages: [ { role: 'system', content: jsonSystem }, { role: 'user', content: userPrompt } ] };
					const jsonCompletion = await openai.chat.completions.create(jsonPayload);
					const jsonText = (jsonCompletion.choices?.[0]?.message?.content || '').trim();
					try {
						const parsed = JSON.parse(jsonText);
						if (parsed && parsed.mode === 'tools' && Array.isArray(parsed.tools)) {
							toolResult = await api.executeStoryTools(parsed.tools, { documentText, metadata });
						} else if (parsed && parsed.mode === 'patch' && parsed.patch) {
							return res.status(200).json({ success: true, mode: 'patch', patch: parsed.patch, explanation: parsed.message || '', raw: jsonText });
						} else if (parsed && parsed.mode === 'chat') {
							return res.status(200).json({ success: true, mode: 'chat', message: parsed.message || '', raw: jsonText });
						}
					} catch (_e) {
						// Fall back to normal parsing below
					}
				} catch (jsonErr) {
					console.warn('JSON mode failed, fallback to default parsing:', jsonErr.message);
				}
			}

			const completion = await openai.chat.completions.create(basePayload);

			console.log(`[Story Assistant] OpenAI response received`);
			
			const responseContent = completion.choices[0].message.content.trim();
			console.log(`[Story Assistant] Raw response: ${responseContent.substring(0, 200)}...`);

			// Parse response for mode (patch vs chat)
			const { mode, patch, explanation } = api.parseStoryIDEResponse(responseContent);

			if (toolResult) {
				return res.status(200).json({ success: true, mode: 'tools', result: toolResult });
			} else if (mode === 'patch' && patch) {
				// Optional: immediately persist a StoryVersion snapshot for undo/redo if enabled
				try {
					if (process.env.STORY_IDE_AUTOVERSION === '1') {
						const current = documentText || '';
						// We don’t apply the patch on the server here; client applies then can POST fullText. This stores a pending record with patch only.
						// To keep Phase 1 simple, we skip auto-create and let client call /api/story/version after apply with the new text.
					}
				} catch(err) { console.warn('Autoversion skipped:', err.message); }
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

	// === Phase 2: Index & Retrieval ===
	chunkDocument: (fullText)=>{
		const text = (fullText || '').replace(/\r/g, '\n');
		// Split by top-level headings, keep simple grouping
		const parts = text.split(/\n(?=# )/g).filter(Boolean);
		const chunks = [];
		for (let i = 0; i < parts.length; i++) {
			const block = parts[i];
			const lines = block.split('\n');
			const titleLine = /^#\s+(.+)$/.exec(lines[0] || '');
			let section = titleLine ? titleLine[1].trim() : `Section ${i+1}`;
			// naive type detection
			let type = undefined;
			const low = block.toLowerCase();
			if (low.includes('encounter')) type = 'encounter';
			else if (low.includes('trap')) type = 'trap';
			else if (low.includes('statblock') || low.includes(':::statblock')) type = 'statblock';
			// extract candidate names (Proper Nouns)
			const names = Array.from(new Set((block.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || []).slice(0, 10)));
			let buf = [];
			let wordCount = 0;
			const emit = ()=>{
				if (!buf.length) return;
				chunks.push({ section, type, names, text: buf.join('\n') });
				buf = []; wordCount = 0;
			};
			for (let j=0;j<lines.length;j++){
				const line = lines[j];
				buf.push(line);
				wordCount += (line.trim().split(/\s+/).filter(Boolean).length);
				if (wordCount >= 900) emit();
			}
			emit();
		}
		// Fallback if nothing
		if (!chunks.length && text.trim()) chunks.push({ section: 'Document', type: undefined, names: [], text });
		return chunks;
	},

	embedTexts: async (inputs)=>{
		if (!process.env.OPENAI_API_KEY) throw new Error('Embedding model not configured');
		const openai = getOpenAI();
		const model = process.env.EMBED_MODEL || 'text-embedding-3-large';
		const { data } = await openai.embeddings.create({ model, input: inputs });
		return data.map(d => d.embedding);
	},

	indexStoryChunks : async (req, res)=>{
		try {
			const { brewId } = req.params;
			let { fullText } = req.body || {};
			if (!brewId) return res.status(400).json({ success: false, error: 'brewId is required' });
			if (!fullText || !fullText.trim()) {
				fullText = await api.reconstructCurrentText(brewId);
				if (!fullText || !fullText.trim()) return res.status(400).json({ success: false, error: 'No text available to index' });
			}
			const chunks = api.chunkDocument(fullText);
			const texts = chunks.map(c => c.text);
			const embeddings = await api.embedTexts(texts);
			const { StoryChunk } = await getModels();
			// Replace existing rows for this brewId
			await StoryChunk.destroy({ where: { brewId } });
			const rows = chunks.map((c, idx) => ({
				brewId,
				chunkId : `${brewId}_${idx}`,
				section : c.section,
				text    : c.text,
				embedding: embeddings[idx]
			}));
			await StoryChunk.bulkCreate(rows);
			return res.json({ success: true, count: rows.length });
		} catch (error) {
			console.error('indexStoryChunks error:', error);
			return res.status(500).json({ success: false, error: error.message });
		}
	},

	cosineSim: (a, b)=>{
		let dot=0, na=0, nb=0;
		const n = Math.min(a?.length||0, b?.length||0);
		for (let i=0;i<n;i++){ const x=a[i], y=b[i]; dot+=x*y; na+=x*x; nb+=y*y; }
		return dot / (Math.sqrt(na||1e-9) * Math.sqrt(nb||1e-9));
	},

	retrieveStoryChunks : async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { query, k = 8 } = req.body || {};
			if (!brewId || !query) return res.status(400).json({ success: false, error: 'brewId and query are required' });
			const queryEmb = (await api.embedTexts([query]))[0];
			const { StoryChunk } = await getModels();
			const rows = await StoryChunk.findAll({ where: { brewId } });
			const scored = rows.map(r => ({
				section: r.section,
				text: r.text,
				score: api.cosineSim(queryEmb, r.embedding)
			})).sort((a,b)=> b.score - a.score).slice(0, Math.max(1, Math.min(50, Number(k)||8)));
			return res.json({ success: true, results: scored });
		} catch (error) {
			console.error('retrieveStoryChunks error:', error);
			return res.status(500).json({ success: false, error: error.message });
		}
	},

	retrieveContextForRequest : async (brewId, query, k=8, sectionHint)=>{
		try {
			const { results } = await (async ()=>{
				// Reuse the same logic without HTTP
				const queryEmb = (await api.embedTexts([query]))[0];
				const { StoryChunk } = await getModels();
				let rows = await StoryChunk.findAll({ where: { brewId } });
				if (sectionHint) {
					const hint = String(sectionHint).toLowerCase();
					rows = rows.filter(r => (r.section||'').toLowerCase().includes(hint));
				}
				const scored = rows.map(r => ({ section: r.section, text: r.text, score: api.cosineSim(queryEmb, r.embedding) }))
					.sort((a,b)=> b.score - a.score)
					.slice(0, Math.max(1, Math.min(50, Number(k)||8)));
				return { results: scored };
			})();
			return results;
		} catch (e) {
			console.warn('[RAG] retrieveContextForRequest failed:', e.message);
			return [];
		}
	},

	// === Phase 6: Orchestrated tool-calling flow ===
	orchestrateStoryEdit: async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { message, cursor = {}, limits = {} } = req.body || {};
			if (!brewId || !message) return res.status(400).json({ success: false, error: 'brewId and message required' });
			const sectionHint = cursor.sectionHint || '';
			const current = await api.reconstructCurrentText(brewId);
			// Retrieve context (prefer chunks matching sectionHint)
			let ragBlock = '';
			try {
				const results = await api.retrieveContextForRequest(brewId, message, 8, sectionHint);
				if (results && results.length) {
					const joined = results.map(r => `- ${r.section ? r.section + ': ' : ''}${r.text}`).join('\n');
					ragBlock = `\n[RETRIEVED CONTEXT]\n${joined.slice(0, 2000)}\n`;
				}
			} catch(e){ console.warn('Orchestrator RAG failed:', e.message); }

			// JSON/tool-calling request
			const systemPrompt = `You are Mythforge Story IDE. Reply ONLY with strict JSON of shape {\n  "mode": "tools",\n  "plan": string,\n  "tools": Array<{ name: string, args: object }>,\n  "notes"?: string\n}\nAllowed tools: [\n  {name: "add_encounter", args: {title: string, enemies: Array<{name:string, cr:string, count:number}>}},\n  {name: "generate_statblock", args: {npc: string, cr: string}},\n  {name: "add_trap", args: {dc:number, trigger:string, effect:string}},\n  {name: "timeline_update", args: {when:string, what:string, who:string}},\n  {name: "create_section", args: {title:string, content:string}}\n]\nNever output prose outside JSON.`;
			const userPrompt = `Cursor section hint: ${sectionHint||'(none)'}\n${ragBlock}\n[USER REQUEST]\n${message}`;
			const openai = getOpenAI();
			if (!openai) return res.status(500).json({ success: false, error: 'OpenAI not configured' });
			const model = process.env.STORY_IDE_MODEL || 'gpt-4o-mini';
			let parsed = null;
			try {
				const payload = { model, messages: [ { role:'system', content: systemPrompt }, { role:'user', content: userPrompt } ], response_format: { type: 'json_object' } };
				const cmp = await openai.chat.completions.create(payload);
				const raw = (cmp.choices?.[0]?.message?.content||'').trim();
				parsed = JSON.parse(raw);
			} catch(e) { return res.status(502).json({ success:false, error: 'Model did not return valid JSON', detail: e.message }); }
			if (!parsed || parsed.mode !== 'tools' || !Array.isArray(parsed.tools)) return res.status(400).json({ success:false, error:'No tools returned' });

			// Execute tools server-side into current text
			let newText = current;
			const execResults = [];
			for (const t of parsed.tools) {
				const name = t?.name; const args = t?.args || {};
				if (!['add_encounter','generate_statblock','add_trap','timeline_update','create_section'].includes(name)) {
					execResults.push({ tool:name, ok:false, error:'Unsupported tool' }); continue;
				}
				if (name === 'timeline_update') {
					const r = `- ${String(args.when||'Unknown')}: ${String(args.what||'Event')} (${String(args.who||'Unknown')})`;
					newText = api.upsertTimeline(newText, r); execResults.push({ tool:name, ok:true }); continue;
				}
				// For section-targeted inserts, prefer sectionHint if provided
				let insertBlock = '';
				if (name === 'add_encounter') {
					const title = String(args.title||'Encounter').trim();
					const enemies = Array.isArray(args.enemies)?args.enemies:[];
					const lines = [
						`### Encounter: ${title}`, '',
						'| Creature | CR | Count |',
						'| --- | --- | --- |',
						...enemies.map(e=>`| ${e.name||'Unknown'} | ${e.cr||'?'} | ${e.count||1} |`),
						''
					];
					insertBlock = lines.join('\n');
				} else if (name === 'generate_statblock') {
					const npc = String(args.npc||'Unnamed NPC');
					const cr = String(args.cr||'1');
					insertBlock = [
						`### ${npc} (CR ${cr})`, '',
						':::statblock',
						'Name: '+npc,
						'CR: '+cr,
						'AC: 12 | HP: 11 (2d8+2) | Speed: 30 ft.',
						'STR 10 DEX 12 CON 12 INT 10 WIS 10 CHA 10',
						'Traits: ...',
						'Actions: ...',
						':::',
						''
					].join('\n');
				} else if (name === 'add_trap') {
					const dc = args.dc ?? 13; const trigger=String(args.trigger||'Pressure plate'); const effect=String(args.effect||'1d6 piercing damage');
					insertBlock = [ '### Trap', '', `Trigger: ${trigger}`, `Check: DC ${dc} Perception to notice; DC ${dc} Thieves' Tools to disarm`, `Effect: ${effect}`, '' ].join('\n');
				} else if (name === 'create_section') {
					insertBlock = `# ${String(args.title||'New Section')}\n\n${String(args.content||'')}`;
				}
				newText = api.insertIntoSection(newText, sectionHint, insertBlock);
				execResults.push({ tool:name, ok:true });
			}

			// Persist a new StoryVersion with full text
			try {
				await api.createStoryVersion({ params: { brewId } , body: { fullText: newText, author: 'ai', summary: parsed.plan||'orchestrate' } }, { json: ()=>{}, status: ()=>({ json: ()=>{} }) });
			} catch (e) { console.warn('Versioning failed:', e.message); }

			// Re-index to keep RAG fresh
			try {
				await api.indexStoryChunks({ params: { brewId }, body: { fullText: newText } }, { json: ()=>{}, status: ()=>({ json: ()=>{} }) });
			} catch (e) { console.warn('Re-index failed:', e.message); }

			return res.json({ success: true, applied: execResults.filter(r=>r.ok).length, results: execResults, notes: parsed.notes||null, fullText: newText });
		} catch (error) {
			console.error('orchestrateStoryEdit error:', error);
			return res.status(500).json({ success:false, error: error.message });
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
	,

	// === Phase 3: Knowledge Graph endpoints ===
	processKnowledgeGraph: async (req, res)=>{
		try {
			const { brewId } = req.params;
			const { fullText, title = '' } = req.body || {};
			if (!brewId) return res.status(400).json({ success: false, error: 'brewId required' });
			const text = fullText || await api.reconstructCurrentText(brewId);
			if (!text) return res.status(400).json({ success: false, error: 'No text to process' });
			const KG = new KnowledgeGraph();
			await KG.ensureReady();
			const result = await KG.processBrewDocument(brewId, title, text);
			return res.json({ success: true, result });
		} catch (e) {
			console.error('processKnowledgeGraph error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	getKnowledgeGraph: async (req, res)=>{
		try {
			const { brewId } = req.params;
			if (!brewId) return res.status(400).json({ success: false, error: 'brewId required' });
			const KG = new KnowledgeGraph();
			await KG.ensureReady();
			const proj = await KG.getProjectByBrewId(brewId);
			if (!proj) return res.json({ success: true, graph: { nodes: [], edges: [] } });
			const graph = await KG.getProjectGraph(proj.id);
			return res.json({ success: true, graph });
		} catch (e) {
			console.error('getKnowledgeGraph error:', e);
			return res.status(500).json({ success: false, error: e.message });
		}
	},

	getCanonChecks: async (req, res)=>{
		try {
			const { brewId } = req.params;
			if (!brewId) return res.status(400).json({ success: false, error: 'brewId required' });
			const KG = new KnowledgeGraph();
			await KG.ensureReady();
			const proj = await KG.getProjectByBrewId(brewId);
			if (!proj) return res.json({ success: true, warnings: [] });
			const { warnings } = await KG.runCanonChecks(proj.id);
			return res.json({ success: true, warnings });
		} catch (e) {
			console.error('getCanonChecks error:', e);
			return res.status(500).json({ success: false, error: e.message });
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