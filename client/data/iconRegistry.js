/**
 * Unified Icon Registry for Mythforge
 *
 * Imports all 4 icon font sources and transforms them into a single searchable
 * registry with categories, human-readable names, and D&D-relevant search terms.
 *
 * Usage:
 *   import { ALL_ICONS, ICON_SETS, searchIcons, getCategories } from '../data/iconRegistry';
 */

import gameIconsRaw from '../../themes/fonts/iconFonts/gameIcons.js';
import elderberryInnRaw from '../../themes/fonts/iconFonts/elderberryInn.js';
import fontAwesomeRaw from '../../themes/fonts/iconFonts/fontAwesome.js';
import diceFontRaw from '../../themes/fonts/iconFonts/diceFont.js';

// ---------------------------------------------------------------------------
// Icon Set Metadata
// ---------------------------------------------------------------------------

export const ICON_SETS = {
  elderberry:  { label: 'Elderberry Inn',  prefix: 'ei',  description: 'D&D 5e specialized icons' },
  game:        { label: 'Game Icons',       prefix: 'gi',  description: 'RPG & fantasy icons' },
  fontawesome: { label: 'Font Awesome',     prefix: 'fa',  description: 'General purpose icons' },
  dice:        { label: 'Dice',             prefix: 'df',  description: 'D&D dice faces' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert an icon key like 'gi_wolf_head' or 'fas_arrow_down' into a
 * human-readable name like 'Wolf Head' or 'Arrow Down'.
 * Strips the prefix (everything before the first underscore).
 */
function toHumanName(key) {
  // Remove the prefix portion (ei_, gi_, fas_, far_, fab_, df_)
  const withoutPrefix = key.replace(/^(ei|gi|fas|far|fab|df)_/, '');
  return withoutPrefix
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract simple name words for search purposes.
 * 'gi_wolf_head' -> ['wolf', 'head']
 */
function nameWords(key) {
  const withoutPrefix = key.replace(/^(ei|gi|fas|far|fab|df)_/, '');
  return withoutPrefix.split('_').filter(Boolean);
}

// ---------------------------------------------------------------------------
// D&D Synonym Map — adds extra search terms for D&D-relevant concepts
// ---------------------------------------------------------------------------

const DND_SYNONYMS = {
  // Weapons
  sword:      ['weapon', 'blade', 'melee', 'martial'],
  dagger:     ['weapon', 'blade', 'melee', 'rogue', 'knife', 'stabbing'],
  knife:      ['weapon', 'blade', 'dagger'],
  axe:        ['weapon', 'melee', 'martial', 'chop'],
  mace:       ['weapon', 'melee', 'bludgeon', 'club'],
  hammer:     ['weapon', 'melee', 'bludgeon', 'warhammer'],
  halberd:    ['weapon', 'melee', 'polearm', 'martial'],
  trident:    ['weapon', 'melee', 'polearm', 'aquatic'],
  spear:      ['weapon', 'melee', 'polearm', 'thrown'],
  bow:        ['weapon', 'ranged', 'archer'],
  crossbow:   ['weapon', 'ranged', 'bolt'],
  arrow:      ['ammo', 'ranged', 'projectile'],
  sickle:     ['weapon', 'melee', 'druid'],
  scythe:     ['weapon', 'melee', 'death'],
  kunai:      ['weapon', 'thrown', 'ninja'],
  shuriken:   ['weapon', 'thrown', 'ninja'],
  broadsword: ['weapon', 'blade', 'melee', 'martial', 'sword'],

  // Armor & Defense
  shield:     ['armor', 'defense', 'protection', 'block'],
  helmet:     ['armor', 'defense', 'head', 'protection'],
  helm:       ['armor', 'defense', 'head', 'helmet'],
  vest:       ['armor', 'defense', 'body'],
  hood:       ['armor', 'clothing', 'stealth', 'rogue'],

  // Magic & Spells
  magic:      ['arcane', 'spell', 'enchantment', 'mystic'],
  spell:      ['magic', 'arcane', 'casting', 'cantrip'],
  wand:       ['magic', 'arcane', 'casting', 'wizard'],
  potion:     ['magic', 'alchemy', 'elixir', 'brew', 'healing'],
  flask:      ['alchemy', 'potion', 'elixir'],
  crystal:    ['magic', 'gem', 'arcane', 'divination'],
  rune:       ['magic', 'arcane', 'enchantment', 'glyph'],
  aura:       ['magic', 'buff', 'enchantment', 'radiance'],
  fire:       ['element', 'damage', 'burning', 'flame'],
  lightning:  ['element', 'damage', 'thunder', 'storm', 'electric'],
  ice:        ['element', 'damage', 'cold', 'frost', 'frozen'],
  acid:       ['element', 'damage', 'corrosive'],
  poison:     ['damage', 'toxic', 'venom'],
  necrotic:   ['damage', 'undead', 'death', 'dark'],
  radiant:    ['damage', 'holy', 'divine', 'light'],
  psychic:    ['damage', 'mind', 'mental', 'psionic'],

  // Creatures
  dragon:     ['creature', 'monster', 'wyrm', 'drake', 'boss'],
  wolf:       ['creature', 'beast', 'animal', 'canine'],
  snake:      ['creature', 'beast', 'reptile', 'serpent'],
  spider:     ['creature', 'beast', 'arachnid', 'drow'],
  hydra:      ['creature', 'monster', 'multi-headed'],
  octopus:    ['creature', 'monster', 'tentacle', 'kraken'],
  skull:      ['death', 'undead', 'skeleton', 'bone'],
  raven:      ['creature', 'bird', 'familiar'],
  cat:        ['creature', 'beast', 'familiar', 'animal'],
  fish:       ['creature', 'beast', 'aquatic', 'animal'],
  lion:       ['creature', 'beast', 'animal', 'king'],
  rabbit:     ['creature', 'beast', 'animal'],
  fox:        ['creature', 'beast', 'animal', 'cunning'],
  beetle:     ['creature', 'insect', 'bug'],
  butterfly:  ['creature', 'insect', 'fey'],
  fairy:      ['creature', 'fey', 'magic', 'sprite'],
  wyvern:     ['creature', 'dragon', 'flying', 'monster'],
  dinosaur:   ['creature', 'beast', 'ancient', 'monster'],
  shark:      ['creature', 'beast', 'aquatic', 'predator'],

  // D&D Classes
  barbarian:  ['class', 'rage', 'melee', 'strength'],
  bard:       ['class', 'music', 'charisma', 'inspiration'],
  cleric:     ['class', 'divine', 'healing', 'holy', 'wisdom'],
  druid:      ['class', 'nature', 'wild shape', 'wisdom'],
  fighter:    ['class', 'martial', 'melee', 'strength'],
  monk:       ['class', 'martial arts', 'ki', 'dexterity'],
  paladin:    ['class', 'divine', 'smite', 'holy', 'oath'],
  ranger:     ['class', 'nature', 'archery', 'tracking'],
  rogue:      ['class', 'stealth', 'sneak attack', 'dexterity'],
  sorcerer:   ['class', 'arcane', 'magic', 'charisma', 'bloodline'],
  warlock:    ['class', 'arcane', 'magic', 'pact', 'eldritch'],
  wizard:     ['class', 'arcane', 'magic', 'intelligence', 'spellbook'],

  // Conditions & Status
  blinded:    ['condition', 'status', 'debuff'],
  charmed:    ['condition', 'status', 'debuff', 'enchantment'],
  deafened:   ['condition', 'status', 'debuff'],
  frightened: ['condition', 'status', 'debuff', 'fear'],
  grappled:   ['condition', 'status', 'debuff', 'restrained'],
  paralyzed:  ['condition', 'status', 'debuff'],
  petrified:  ['condition', 'status', 'debuff', 'stone'],
  poisoned:   ['condition', 'status', 'debuff', 'toxic'],
  prone:      ['condition', 'status', 'debuff', 'fallen'],
  restrained: ['condition', 'status', 'debuff'],
  stunned:    ['condition', 'status', 'debuff'],
  unconscious:['condition', 'status', 'debuff', 'death saves'],
  invisible:  ['condition', 'status', 'stealth', 'hidden'],
  incapacitated: ['condition', 'status', 'debuff'],

  // D&D Objects & Items
  key:        ['item', 'lock', 'treasure', 'dungeon'],
  gem:        ['item', 'treasure', 'loot', 'jewel'],
  crown:      ['item', 'royalty', 'king', 'queen', 'treasure'],
  book:       ['item', 'knowledge', 'spellbook', 'tome', 'scroll'],
  scroll:     ['item', 'spell', 'magic', 'parchment'],
  candle:     ['item', 'light', 'dungeon'],
  torch:      ['item', 'light', 'dungeon', 'fire'],
  campfire:   ['rest', 'camp', 'fire', 'short rest', 'long rest'],
  bell:       ['item', 'alarm', 'sound'],
  chain:      ['item', 'prison', 'binding', 'restraint'],
  anchor:     ['item', 'ship', 'nautical'],
  compass:    ['item', 'navigation', 'travel'],

  // Environment
  tower:      ['building', 'castle', 'dungeon', 'structure'],
  castle:     ['building', 'fortress', 'dungeon', 'structure'],
  bridge:     ['structure', 'crossing', 'terrain'],
  mountain:   ['terrain', 'environment', 'landscape'],
  tree:       ['terrain', 'environment', 'nature', 'forest'],
  grass:      ['terrain', 'environment', 'nature'],
  flower:     ['nature', 'plant', 'flora'],
  leaf:       ['nature', 'plant', 'flora', 'druid'],
  sun:        ['sky', 'light', 'celestial', 'day'],
  moon:       ['sky', 'light', 'celestial', 'night'],
  snowflake:  ['weather', 'cold', 'ice', 'winter'],
  water:      ['element', 'liquid', 'aquatic', 'ocean'],

  // Dice
  d4:         ['dice', 'die', 'roll', 'four-sided'],
  d6:         ['dice', 'die', 'roll', 'six-sided'],
  d8:         ['dice', 'die', 'roll', 'eight-sided'],
  d10:        ['dice', 'die', 'roll', 'ten-sided', 'percentile'],
  d12:        ['dice', 'die', 'roll', 'twelve-sided'],
  d20:        ['dice', 'die', 'roll', 'twenty-sided', 'attack', 'check', 'save'],
  d2:         ['dice', 'die', 'coin', 'flip'],
  dice:       ['die', 'roll', 'random', 'chance'],

  // Actions & Combat
  movement:   ['action', 'speed', 'walk', 'run'],
  action:     ['combat', 'turn', 'attack'],
  reaction:   ['combat', 'turn', 'opportunity'],
  bonus:      ['combat', 'turn', 'bonus action'],

  // Misc D&D
  gold:       ['money', 'treasure', 'loot', 'coins', 'gp'],
  health:     ['hp', 'hit points', 'healing', 'life'],
  heart:      ['hp', 'hit points', 'health', 'life'],
  death:      ['dying', 'undead', 'necromancy'],
  heal:       ['restore', 'cure', 'recovery'],
};

/**
 * Build the searchTerms array for an icon entry.
 * Includes the name words plus any D&D synonyms that match.
 */
function buildSearchTerms(key, name, category) {
  const words = nameWords(key).map((w) => w.toLowerCase());
  const synonymSet = new Set(words);

  // Add category as a search term
  if (category) {
    category.toLowerCase().split(/\s+/).forEach((w) => synonymSet.add(w));
  }

  // Add D&D synonyms for each word
  for (const word of words) {
    const syns = DND_SYNONYMS[word];
    if (syns) {
      syns.forEach((s) => synonymSet.add(s));
    }
  }

  return Array.from(synonymSet);
}

// ---------------------------------------------------------------------------
// Elderberry Inn — Category Parsing
// ---------------------------------------------------------------------------

/**
 * The elderberry source file has comments that define category boundaries.
 * We parse the raw source to map each key to a category.
 * Since we can't parse the JS file's comments at runtime, we define the
 * category ranges based on the known structure.
 */

const ELDERBERRY_CATEGORIES = {
  // Keys that appear before any category comment
  'ei_book': 'General',
  'ei_screen': 'General',
};

// Spell levels: ei_spell_0 through ei_spell_9
const ELDERBERRY_SPELL_LEVEL_KEYS = new Set(
  Array.from({ length: 10 }, (_, i) => `ei_spell_${i}`)
);

// Damage types
const ELDERBERRY_DAMAGE_KEYS = new Set([
  'ei_acid', 'ei_bludgeoning', 'ei_cold', 'ei_fire', 'ei_force',
  'ei_lightning', 'ei_necrotic', 'ei_piercing', 'ei_poison',
  'ei_psychic', 'ei_radiant', 'ei_slashing', 'ei_thunder',
]);

// Conditions
const ELDERBERRY_CONDITION_KEYS = new Set([
  'ei_blinded', 'ei_charmed', 'ei_deafened', 'ei_exhaust1', 'ei_exhaust2',
  'ei_exhaust3', 'ei_exhaust4', 'ei_exhaust5', 'ei_exhaust6',
  'ei_frightened', 'ei_grappled', 'ei_incapacitated', 'ei_invisible',
  'ei_paralyzed', 'ei_petrified', 'ei_poisoned', 'ei_prone',
  'ei_restrained', 'ei_stunned', 'ei_unconscious',
]);

// Classes and Features
const ELDERBERRY_CLASS_KEYS = new Set([
  'ei_barbarian_rage', 'ei_barbarian_reckless_attack', 'ei_bardic_inspiration',
  'ei_cleric_channel_divinity', 'ei_druid_wild_shape', 'ei_fighter_action_surge',
  'ei_fighter_second_wind', 'ei_monk_flurry_blows', 'ei_monk_patient_defense',
  'ei_monk_step_of_the_wind', 'ei_monk_step_of_the_wind2', 'ei_monk_step_of_the_wind3',
  'ei_monk_stunning_strike', 'ei_monk_stunning_strike2', 'ei_paladin_divine_smite',
  'ei_paladin_lay_on_hands',
  'ei_barbarian_abilities', 'ei_barbarian', 'ei_bard_abilities', 'ei_bard',
  'ei_cleric_abilities', 'ei_cleric', 'ei_druid_abilities', 'ei_druid',
  'ei_fighter_abilities', 'ei_fighter', 'ei_monk_abilities', 'ei_monk',
  'ei_paladin_abilities', 'ei_paladin', 'ei_ranger_abilities', 'ei_ranger',
  'ei_rogue_abilities', 'ei_rogue', 'ei_sorcerer_abilities', 'ei_sorcerer',
  'ei_warlock_abilities', 'ei_warlock', 'ei_wizard_abilities', 'ei_wizard',
]);

// Actions
const ELDERBERRY_ACTION_KEYS = new Set([
  'ei_movement', 'ei_action', 'ei_bonus_action', 'ei_reaction',
]);

function getElderberryCategory(key) {
  if (ELDERBERRY_CATEGORIES[key]) return ELDERBERRY_CATEGORIES[key];
  if (ELDERBERRY_SPELL_LEVEL_KEYS.has(key)) return 'Spell Levels';
  if (ELDERBERRY_DAMAGE_KEYS.has(key)) return 'Damage Types';
  if (ELDERBERRY_CONDITION_KEYS.has(key)) return 'Conditions';
  if (ELDERBERRY_CLASS_KEYS.has(key)) return 'Classes';
  if (ELDERBERRY_ACTION_KEYS.has(key)) return 'Actions';
  // Everything else is a Spell
  return 'Spells';
}

// ---------------------------------------------------------------------------
// Font Awesome — Category Inference
// ---------------------------------------------------------------------------

const FA_CATEGORY_PATTERNS = [
  // Order matters: first match wins
  { pattern: /^fa[bsr]_(arrow|angle|caret|chevron|up_|down_|left_|right_|sort|rotate|shuffle|turn|repeat|redo|undo|compress|expand|maximize|minimize|crop)/, category: 'Arrows & Navigation' },
  { pattern: /^fa[bsr]_(play|pause|stop|forward|backward|eject|volume|music|headphones|radio|podcast|film|video|camera|photo|image|circle_play|circle_pause|circle_stop)/, category: 'Media' },
  { pattern: /^fa[bsr]_(align|indent|list|paragraph|text|font|bold|italic|underline|strikethrough|subscript|superscript|quote|heading|spell_check|pen|pencil|eraser|highlighter|marker)/, category: 'Text & Editing' },
  { pattern: /^fa[bsr]_(cloud|sun|moon|star|snow|wind|rain|bolt|temperature|umbrella|water|droplet|smog|tornado|hurricane|meteor)/, category: 'Weather & Sky' },
  { pattern: /^fa[bsr]_(dog|cat|horse|crow|dove|dragon|fish|frog|hippo|kiwi_bird|otter|paw|spider|worm|bugs|locust|mosquito|shrimp|feather)/, category: 'Animals & Nature' },
  { pattern: /^fa[bsr]_(user|person|people|child|baby|users|id_badge|id_card|address|portrait|face|head)/, category: 'People' },
  { pattern: /^fa[bsr]_(car|truck|bus|taxi|bicycle|motorcycle|plane|helicopter|rocket|ship|boat|train|subway|van|trailer|sailboat|ferry|jet_fighter)/, category: 'Transportation' },
  { pattern: /^fa[bsr]_(home|house|building|city|hospital|hotel|school|store|warehouse|church|mosque|synagogue|place_of_worship|landmark|monument|dungeon|archway|torii_gate|gopuram|vihara|kaaba)/, category: 'Buildings' },
  { pattern: /^fa[bsr]_(heart|shield|cross|wand|hat_wizard|skull|skull_crossbones|ghost|swords|khanda|ankh|hand_sparkles|fire|fire_flame)/, category: 'Fantasy & RPG' },
  { pattern: /^fa[bsr]_(chart|graph|diagram|signal|table|database|server|code|terminal|laptop|desktop|computer|keyboard|mouse|display|hard_drive|microchip|memory|network|wifi|satellite|globe|ethernet|plug)/, category: 'Technology' },
  { pattern: /^fa[bsr]_(dollar|money|coins|wallet|credit_card|receipt|cash_register|piggy_bank|sack_dollar|cent|euro|pound|yen|indian_rupee|bitcoin|lira|peso|ruble|shekel|won|franc|baht|austral|cedi|colón|cruzeiro|dong|guarani|hryvnia|kip|lari|manat|mill|naira|tenge|tugrik)/, category: 'Money & Commerce' },
  { pattern: /^fa[bsr]_(flask|atom|dna|microscope|vial|syringe|stethoscope|pills|tablets|capsules|prescription|lungs|brain|bone|tooth|eye|ear|hand_holding_medical|virus|bacteria|disease|biohazard|radiation|mask_face)/, category: 'Science & Medical' },
  { pattern: /^fa[bsr]_(book|newspaper|file|folder|note|clipboard|copy|paste|floppy|save|download|upload|print|paperclip|envelope|stamp|inbox|paper_plane|scroll|bookmark)/, category: 'Documents' },
  { pattern: /^fa[bsr]_(lock|unlock|key|shield|fingerprint|eye_slash|ban|user_shield|mask|user_lock|user_secret)/, category: 'Security' },
  { pattern: /^fa[bsr]_(wrench|screwdriver|hammer|gear|gears|toolbox|tools|cog)/, category: 'Tools' },
  { pattern: /^fa[bsr]_(check|xmark|circle_check|circle_xmark|square_check|exclamation|question|info|circle_info|triangle_exclamation|circle_exclamation|bell|flag|thumbs)/, category: 'Status & Alerts' },
  { pattern: /^fa[bsr]_(dice|chess|puzzle|gamepad|ghost)/, category: 'Games' },
  { pattern: /^fab_/, category: 'Brands' },
];

function getFontAwesomeCategory(key) {
  for (const { pattern, category } of FA_CATEGORY_PATTERNS) {
    if (pattern.test(key)) return category;
  }
  return 'General';
}

// ---------------------------------------------------------------------------
// Game Icons — Category Inference
// ---------------------------------------------------------------------------

const GI_CATEGORY_PATTERNS = [
  // Weapons
  { pattern: /sword|dagger|knife|axe|mace|hammer|halberd|trident|spear|crossbow|bow|arrow|blade|sickle|scythe|shuriken|kunai|musket|rifle|revolver|pistol|broadsword|boomerang/, category: 'Weapons' },
  // Armor & Defense
  { pattern: /shield|helmet|helm|armor|vest|hood|barrier/, category: 'Armor & Defense' },
  // Creatures
  { pattern: /dragon|wolf|snake|spider|hydra|octopus|skull|raven|cat|fish|lion|rabbit|fox|beetle|butterfly|fairy|wyvern|dinosaur|shark|sheep|seagull|gecko|snail|dragonfly|maggot|bird|bat|tentacle|monster|eye_monster|sea_serpent/, category: 'Creatures' },
  // Magic & Arcane
  { pattern: /magic|wand|crystal|rune|aura|arcane|enchant|potion|flask|vial|spell|fire_ring|fire_shield|fire_breath|lightning|frost|frozen|frostfire|energise|implosion|beam|overmind|kaleidoscope/, category: 'Magic' },
  // Nature & Environment
  { pattern: /tree|leaf|flower|grass|sprout|sun|moon|snowflake|water|lava|mountain|montain|vine|acorn|clover|daisy|pine|palm|mushroom|thorny|coral|ocean/, category: 'Nature' },
  // Buildings & Structures
  { pattern: /tower|castle|bridge|lighthouse|fortress|gate|arena|capitol/, category: 'Buildings' },
  // Items & Treasure
  { pattern: /key|gem|crown|gold|diamond|emerald|sapphire|ruby|jewel|trophy|treasure|pearl|ring|pendant|ankh/, category: 'Treasure & Items' },
  // Tools & Equipment
  { pattern: /wrench|gear|cog|hammer_drop|anvil|drill|lever|shovel|saw|repair|forging|chain|grappling|hook|rope|lantern|torch|candle|bell|compass|telescope|hourglass|mirror|incense/, category: 'Tools & Equipment' },
  // Food & Drink
  { pattern: /meat|chicken|apple|cheese|beer|coffee|carrot|roast|toast|egg|brandy/, category: 'Food & Drink' },
  // Status & Effects
  { pattern: /health|heart|poison|bleeding|broken|death|regeneration|burning|falling/, category: 'Status & Effects' },
  // People & Actions
  { pattern: /player|duel|muscle|footprint|shoe|boot|hand|overhead|underhand/, category: 'People & Actions' },
  // Dice
  { pattern: /dice|perspective_dice/, category: 'Dice' },
  // Zodiac & Symbols
  { pattern: /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|ophiuchus|omega/, category: 'Zodiac & Symbols' },
];

function getGameIconCategory(key) {
  const nameOnly = key.replace(/^gi_/, '');
  for (const { pattern, category } of GI_CATEGORY_PATTERNS) {
    if (pattern.test(nameOnly)) return category;
  }
  return 'General';
}

// ---------------------------------------------------------------------------
// Dice Font — Category by Die Type
// ---------------------------------------------------------------------------

function getDiceFontCategory(key) {
  const nameOnly = key.replace(/^df_/, '');
  if (nameOnly.startsWith('f'))               return 'Fudge Dice';
  if (nameOnly.startsWith('solid_small_dot')) return 'd6 Solid Dot';
  if (nameOnly.startsWith('small_dot'))       return 'd6 Small Dot';
  if (nameOnly.startsWith('dot_d6'))          return 'd6 Dot';
  if (nameOnly.startsWith('d20'))             return 'd20';
  if (nameOnly.startsWith('d12'))             return 'd12';
  if (nameOnly.startsWith('d10'))             return 'd10';
  if (nameOnly.startsWith('d8'))              return 'd8';
  if (nameOnly.startsWith('d6'))              return 'd6';
  if (nameOnly.startsWith('d4'))              return 'd4';
  if (nameOnly.startsWith('d2'))              return 'd2';
  return 'Dice';
}

// ---------------------------------------------------------------------------
// Transform Source Data → Unified Entries
// ---------------------------------------------------------------------------

function transformSet(rawMap, set, categoryFn) {
  return Object.entries(rawMap).map(([key, cssClass]) => {
    const name = toHumanName(key);
    const category = categoryFn(key);
    const searchTerms = buildSearchTerms(key, name, category);
    return { id: key, name, cssClass, set, category, searchTerms };
  });
}

const elderberryIcons = transformSet(elderberryInnRaw, 'elderberry', getElderberryCategory);
const gameIcons       = transformSet(gameIconsRaw,      'game',       getGameIconCategory);
const fontAwesomeIcons = transformSet(fontAwesomeRaw,   'fontawesome', getFontAwesomeCategory);
const diceIcons       = transformSet(diceFontRaw,       'dice',       getDiceFontCategory);

// ---------------------------------------------------------------------------
// Exported: ALL_ICONS
// ---------------------------------------------------------------------------

export const ALL_ICONS = [
  ...elderberryIcons,
  ...gameIcons,
  ...fontAwesomeIcons,
  ...diceIcons,
];

// ---------------------------------------------------------------------------
// Pre-built lookup maps (lazy-initialized for performance)
// ---------------------------------------------------------------------------

let _iconsBySet = null;
let _iconsByCategory = null;
let _iconById = null;

function getIconsBySet() {
  if (!_iconsBySet) {
    _iconsBySet = {};
    for (const icon of ALL_ICONS) {
      if (!_iconsBySet[icon.set]) _iconsBySet[icon.set] = [];
      _iconsBySet[icon.set].push(icon);
    }
  }
  return _iconsBySet;
}

function getIconsByCategory() {
  if (!_iconsByCategory) {
    _iconsByCategory = {};
    for (const icon of ALL_ICONS) {
      const key = `${icon.set}:${icon.category}`;
      if (!_iconsByCategory[key]) _iconsByCategory[key] = [];
      _iconsByCategory[key].push(icon);
    }
  }
  return _iconsByCategory;
}

function getIconById() {
  if (!_iconById) {
    _iconById = {};
    for (const icon of ALL_ICONS) {
      _iconById[icon.id] = icon;
    }
  }
  return _iconById;
}

/**
 * Look up a single icon by its id (the key used in :colon: syntax).
 * Returns the icon entry or undefined.
 */
export function lookupIcon(id) {
  return getIconById()[id];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Search icons by query string with optional filters.
 *
 * @param {string} query - Search query (case-insensitive substring match)
 * @param {Object} [options]
 * @param {string} [options.set] - Filter by icon set ('elderberry'|'game'|'fontawesome'|'dice')
 * @param {string} [options.category] - Filter by category name
 * @param {number} [options.limit=50] - Max results to return
 * @returns {Array} Matching icon entries sorted by relevance
 */
export function searchIcons(query, options = {}) {
  const { set, category, limit = 50 } = options;
  const q = (query || '').toLowerCase().trim();

  // Determine the candidate pool
  let candidates = ALL_ICONS;
  if (set) {
    candidates = getIconsBySet()[set] || [];
  }
  if (category) {
    // Further filter by category
    candidates = candidates.filter(
      (icon) => icon.category.toLowerCase() === category.toLowerCase()
    );
  }

  // If no query, return first `limit` candidates (browsing mode)
  if (!q) {
    return candidates.slice(0, limit);
  }

  // Score each candidate
  const scored = [];
  for (const icon of candidates) {
    const nameLower = icon.name.toLowerCase();
    const idLower = icon.id.toLowerCase();

    // Exact name match
    if (nameLower === q) {
      scored.push({ icon, score: 0 });
      continue;
    }

    // Exact id match
    if (idLower === q) {
      scored.push({ icon, score: 1 });
      continue;
    }

    // Name starts with query
    if (nameLower.startsWith(q)) {
      scored.push({ icon, score: 2 });
      continue;
    }

    // Id starts with query (after prefix)
    const idWithoutPrefix = idLower.replace(/^(ei|gi|fas|far|fab|df)_/, '');
    if (idWithoutPrefix.startsWith(q)) {
      scored.push({ icon, score: 3 });
      continue;
    }

    // Name contains query
    if (nameLower.includes(q)) {
      scored.push({ icon, score: 4 });
      continue;
    }

    // Id contains query
    if (idLower.includes(q)) {
      scored.push({ icon, score: 5 });
      continue;
    }

    // Search terms contain query
    const termMatch = icon.searchTerms.some((term) => term.includes(q));
    if (termMatch) {
      scored.push({ icon, score: 6 });
      continue;
    }

    // Query words all match somewhere in searchTerms
    const queryWords = q.split(/\s+/);
    if (queryWords.length > 1) {
      const allMatch = queryWords.every((qw) =>
        icon.searchTerms.some((term) => term.includes(qw)) ||
        nameLower.includes(qw) ||
        idLower.includes(qw)
      );
      if (allMatch) {
        scored.push({ icon, score: 7 });
      }
    }
  }

  // Sort by score (lower = more relevant), then alphabetically by name
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.icon.name.localeCompare(b.icon.name);
  });

  return scored.slice(0, limit).map((s) => s.icon);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * Get all unique category names, optionally filtered by icon set.
 *
 * @param {string} [set] - Optional icon set to filter by
 * @returns {string[]} Sorted array of unique category names
 */
export function getCategories(set) {
  let source = ALL_ICONS;
  if (set) {
    source = getIconsBySet()[set] || [];
  }
  const cats = new Set(source.map((icon) => icon.category));
  return Array.from(cats).sort();
}

/**
 * Get icons grouped by category, optionally filtered by set.
 *
 * @param {string} [set] - Optional icon set to filter by
 * @returns {Object} Map of category name -> array of icon entries
 */
export function getIconsByGroupedCategory(set) {
  let source = ALL_ICONS;
  if (set) {
    source = getIconsBySet()[set] || [];
  }
  const grouped = {};
  for (const icon of source) {
    if (!grouped[icon.category]) grouped[icon.category] = [];
    grouped[icon.category].push(icon);
  }
  return grouped;
}
