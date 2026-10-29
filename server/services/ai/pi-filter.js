// ============================================================================
// pi-filter — Product Identity scrubber for "commercial-safe" generation.
//
// Wizards of the Coast's Product Identity (specific monster names, setting
// names) is NOT part of the CC-BY SRD and may not be reproduced in content a
// creator intends to sell. This replaces those terms with SRD-safe equivalents.
//
// Ports the replacement intent of server/services/ai/content-validator.ts
// (which had the logic but private + object-oriented + dormant) into a clean,
// reusable string-level filter that operates on the generated Homebrewery
// markdown. The list is intentionally CURATED to the terms that are clearly
// Product Identity (i.e. NOT in SRD 5.1) — SRD-safe creatures that the old
// validator over-listed (owlbear, slaad, umber hulk) are deliberately omitted
// so we don't degrade legitimately-usable content. Adjust the map as needed.
// ============================================================================

// PI term (lowercase) → SRD-safe replacement. Multi-word phrases are matched as
// whole phrases; order longest-first so "mind flayer" wins before "flayer".
const REPLACEMENTS = {
  // ---- Monsters / creatures (clear Product Identity) ----
  'mind flayer'     : 'mind devourer',
  'displacer beast' : 'phase panther',
  'githyanki'       : 'astral raider',
  'githzerai'       : 'astral ascetic',
  'illithid'        : 'mind devourer',
  'beholder'        : 'gaze tyrant',
  'yuan-ti'         : 'serpentfolk',
  'kuo-toa'         : 'fishfolk',
  'bulezau'         : 'goat-fiend',
  'cambion'         : 'fiend-scion',
  "tanar'ri"        : 'demons',
  'baatezu'         : 'devils',
  // ---- Settings (Product Identity place names) ----
  'forgotten realms': 'the old realms',
  'dragonlance'     : 'the lance saga',
  'spelljammer'     : 'wildspace voyaging',
  'planescape'      : 'the planar cosmos',
  'ravenloft'       : 'the dread domains',
  'greyhawk'        : 'the free lands',
  'dark sun'        : 'the scorched world',
};

// Build one regex per term, longest phrase first (so multi-word phrases match
// before any single-word subset). Word-boundary-ish anchoring avoids clobbering
// substrings inside larger words.
const RULES = Object.keys(REPLACEMENTS)
  .sort((a, b) => b.length - a.length)
  .map((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Capture an optional plural "s" so "displacer beasts" → "phase panthers".
    return { term, replacement: REPLACEMENTS[term], re: new RegExp(`(^|[^\\w-])(${escaped})(s?)(?![\\w-])`, 'gi') };
  });

// Capitalize the replacement's first letter when the matched term was capitalized,
// so "Beholder" → "Gaze tyrant" (not "gaze tyrant").
function matchCase(matched, replacement) {
  if (matched && matched[0] === matched[0].toUpperCase() && matched[0] !== matched[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * scrubProductIdentity(text) → { text, replacements }
 * Replaces all Product Identity terms with SRD-safe equivalents.
 * `replacements` lists which terms were changed and how many times.
 */
export function scrubProductIdentity(text) {
  if (typeof text !== 'string' || !text) return { text: text || '', replacements: [] };
  let out = text;
  const replacements = [];

  for (const { term, replacement, re } of RULES) {
    let count = 0;
    out = out.replace(re, (full, pre, hit, sfx) => {
      count++;
      return pre + matchCase(hit, replacement) + (sfx || '');
    });
    if (count > 0) replacements.push({ term, replacement, count });
  }

  // Collapse an accidental double article when a replacement that starts with
  // "the" lands right after an existing "the" (e.g. "the The old realms").
  out = out.replace(/\b(the)\s+(the)\b/gi, '$2');

  return { text: out, replacements };
}

export default scrubProductIdentity;
