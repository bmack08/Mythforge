#!/usr/bin/env node

/*******************************************************************************
 * UNIFIED HOMEBREWERY SERVER - server.js
 *
 * This file consolidates all backend/server-side logic into a single entry point.
 * Run with: node server.js
 * Access at: http://localhost:3000
 ******************************************************************************/

// ============================================================================
// IMPORT EXISTING HOMEBREWERY INFRASTRUCTURE
// ============================================================================

import { initializeModels } from './server/models/index.js';
import app from './server/app.js';
import config from './server/config.js';

// ============================================================================
// AI SERVICE IMPORTS
// ============================================================================

import { AIService } from './server/services/ai/index.js';

// ============================================================================
// SERVER STARTUP USING EXISTING HOMEBREWERY INFRASTRUCTURE
// ============================================================================

initializeModels(config).then(()=>{
	// Ensure that we have successfully connected to the database before launching server
	const PORT = process.env.PORT || config.get('web_port') || 8000;

	// Initialize AI service
	const aiService = AIService.getInstance();
	if (aiService.getAvailableProviders().length === 0) {
		console.log('⚠️  No AI providers configured - AI features will be limited');
	} else {
		console.log(`🎲 Mythwright AI ready (providers: ${aiService.getAvailableProviders().join(', ')})`);
	}

	app.listen(PORT, ()=>{
		const reset = '\x1b[0m'; // Reset to default style
		const bright = '\x1b[1m'; // Bright (bold) style
		const cyan = '\x1b[36m'; // Cyan color
		const underline = '\x1b[4m'; // Underlined style

		console.log(`\n\t🚀 Homebrewery Unified Server started at: ${new Date().toLocaleString()}`);
		console.log(`\t📍 Server running on port: ${PORT}`);
		console.log(`\t${bright + cyan}Main page: ${reset}${underline + bright + cyan}http://localhost:${PORT}${reset}`);
		console.log(`\t${bright + cyan}Campaign Generator: ${reset}${underline + bright + cyan}http://localhost:${PORT}/new-campaign${reset}`);
		console.log(`\t🔧 Health check: http://localhost:${PORT}/api/health\n\n`);
	});
}).catch((error) => {
	console.error('Failed to initialize database and models:', error);
	process.exit(1);
});
