// Mythforge → TaleForge structured-generator bridge client.
//
// Calls TaleForge's internal service-token generator endpoints
// (POST /api/v1/internal/ai/generate/{type}) and returns the structured JSON.
// Sibling to TaleForgeProvider (server/services/ai/index.js) which handles the
// generic completion bridge — this one handles the 8 structured generators
// (npc, shop, item, encounter, quest, story, map, puzzle).
//
// Config (shared with the completion bridge):
//   TALEFORGE_AI_URL        e.g. http://localhost:8000
//   TALEFORGE_SERVICE_TOKEN shared service token (sent as X-Service-Token)

const VALID_TYPES = new Set([
  'npc', 'shop', 'item', 'encounter', 'quest', 'story', 'map', 'puzzle'
]);

function config() {
  const base = (process.env.TALEFORGE_AI_URL || '').replace(/\/+$/, '');
  const token = process.env.TALEFORGE_SERVICE_TOKEN || '';
  return { base, token };
}

export function isConfigured() {
  const { base, token } = config();
  return Boolean(base && token);
}

export function validTypes() {
  return Array.from(VALID_TYPES);
}

/**
 * Run one structured generator through the bridge.
 * @param {string} type  one of VALID_TYPES
 * @param {object} params  the generator's request params (see TaleForge
 *   app/schemas/generators.py — e.g. shop: {shop_type, inventory_size, price_range, custom_note?})
 * @returns {Promise<object>} the generator's structured JSON
 */
export async function generate(type, params = {}) {
  const { base, token } = config();
  if (!base || !token) {
    throw new Error(
      'TaleForge generator bridge not configured (set TALEFORGE_AI_URL and ' +
      'TALEFORGE_SERVICE_TOKEN in the Mythforge .env).'
    );
  }
  if (!VALID_TYPES.has(type)) {
    throw new Error(`Unknown generator '${type}'. Valid: ${validTypes().join(', ')}`);
  }

  const res = await fetch(`${base}/api/v1/internal/ai/generate/${encodeURIComponent(type)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Token': token
    },
    body: JSON.stringify(params || {})
  });

  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); }
    catch { detail = await res.text().catch(() => ''); }
    throw new Error(`TaleForge generator '${type}' failed: HTTP ${res.status} ${detail}`);
  }

  return res.json();
}
