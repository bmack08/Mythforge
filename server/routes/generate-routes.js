// In-editor generator routes — Mythforge's "/shop", "/npc", … slash commands
// POST here. Each call runs a TaleForge structured generator through the bridge,
// formats the JSON into Homebrewery markdown, and returns it for insertion at
// the cursor (TipTapEditor.insertContent auto-converts markdown → styled nodes).

import express from 'express';
import asyncHandler from 'express-async-handler';
import { generate as tfGenerate, validTypes, isConfigured } from '../services/ai/taleforge-generators.js';
import { format as formatGenerator } from '../services/ai/generator-formatters.js';
import { scrubProductIdentity } from '../services/ai/pi-filter.js';

const router = express.Router();

// List available generators (used by the slash-command popup, and handy for debugging).
router.get('/api/generate', (req, res) => {
  res.json({ configured: isConfigured(), types: validTypes() });
});

// Run one generator and return styled Homebrewery markdown.
router.post('/api/generate/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const params = { ...(req.body || {}) };

  // `srdSafe` (set by the client when the brew is in commercial-safe mode) is a
  // generation directive, not a generator param — pull it out before calling.
  const srdSafe = params.srdSafe === true || params.srdSafe === 'true';
  delete params.srdSafe;

  try {
    const data = await tfGenerate(type, params);
    let markdown = formatGenerator(type, data);
    let piReplacements = [];
    if (srdSafe) {
      const scrubbed = scrubProductIdentity(markdown);
      markdown = scrubbed.text;
      piReplacements = scrubbed.replacements;
    }
    res.json({ success: true, type, markdown, data, srdSafe, piReplacements });
  } catch (err) {
    // 502: the failure is upstream (TaleForge bridge / generator), not the
    // client's request shape. Surface the message so the popup can show it.
    res.status(502).json({ success: false, type, error: err.message });
  }
}));

export default router;
