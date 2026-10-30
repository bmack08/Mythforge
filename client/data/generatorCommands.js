// Shared config for the in-editor generator slash commands ("/shop", "/npc", …).
//
// - GENERATOR_COMMANDS: what shows in the slash menu.
// - GENERATOR_FORMS: the quick-form fields per generator, matching TaleForge's
//   request schemas (app/schemas/generators.py) so the options map cleanly.
// - searchCommands(): filter for the menu.
//
// `key` is what the user types after "/"; `genType` is the bridge type
// (POST /api/generate/:genType). They differ only for "location" → "map".

export const GENERATOR_COMMANDS = [
  { key: 'shop',      genType: 'shop',      label: 'Shop',           icon: 'store',       desc: 'A shop with inventory, owners & services' },
  { key: 'npc',       genType: 'npc',       label: 'NPC / Character', icon: 'user',        desc: 'A full NPC stat block + personality' },
  { key: 'item',      genType: 'item',      label: 'Magic Item',     icon: 'gem',         desc: 'A magic item by rarity & school' },
  { key: 'encounter', genType: 'encounter', label: 'Encounter',      icon: 'swords',       desc: 'A combat encounter for the party' },
  { key: 'quest',     genType: 'quest',     label: 'Quest',          icon: 'scroll-text',       desc: 'A quest with objective & antagonist' },
  { key: 'location',  genType: 'map',       label: 'Location',       icon: 'map-pin', desc: 'A region / location with points of interest' },
];

// Field types: 'text', 'textarea', 'number', 'select' (with options).
export const GENERATOR_FORMS = {
  shop: [
    { name: 'shop_type',      label: 'Shop type',      type: 'text',   default: 'General Store', placeholder: 'Blacksmith, Apothecary, Magic Shop…' },
    { name: 'inventory_size', label: 'Inventory size', type: 'select', default: 'Medium',  options: ['Small', 'Medium', 'Large', 'Massive'] },
    { name: 'price_range',    label: 'Prices',         type: 'select', default: 'Moderate', options: ['Budget', 'Moderate', 'Expensive'] },
    { name: 'custom_note',    label: 'Custom note',    type: 'text',   default: '', placeholder: 'e.g. include one cursed homebrew blade', optional: true },
  ],
  npc: [
    { name: 'race',      label: 'Race',  type: 'select', default: 'Human',   options: ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Goblin', 'Tiefling', 'Dragonborn', 'Gnome', 'Half-Orc', 'Aasimar'] },
    { name: 'npc_class', label: 'Class', type: 'select', default: 'Fighter', options: ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'] },
    { name: 'alignment', label: 'Alignment', type: 'select', default: 'True Neutral', options: ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'] },
    { name: 'level',     label: 'Level', type: 'number', default: 5, min: 1, max: 20, optional: true },
    { name: 'add_spellcasting', label: 'Spellcaster?', type: 'select', default: 'No', options: ['No', 'Yes'], asBool: true, optional: true },
  ],
  item: [
    { name: 'rarity',        label: 'Rarity', type: 'select', default: 'Uncommon', options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'] },
    { name: 'magic_school',  label: 'School', type: 'select', default: '', options: ['', 'Evocation', 'Necromancy', 'Illusion', 'Conjuration', 'Abjuration', 'Transmutation', 'Divination'], optional: true },
    { name: 'name_preference', label: 'Name (optional)', type: 'text', default: '', optional: true },
  ],
  encounter: [
    { name: 'party_level', label: 'Party level', type: 'select', default: 'Levels 1-4 (Low)', options: ['Levels 1-4 (Low)', 'Levels 5-10 (Mid)', 'Levels 11-16 (High)'] },
    { name: 'terrain',     label: 'Terrain',     type: 'select', default: 'Forest', options: ['Swamp', 'City', 'Cave', 'Forest', 'Desert', 'Underworld', 'Mountains', 'Ruins', 'Temple', 'Dungeon'] },
    { name: 'enemy_type',  label: 'Enemies',     type: 'select', default: 'Humanoids', options: ['Undead', 'Goblins', 'Demons', 'Dragons', 'Elementals', 'Constructs', 'Humanoids', 'Beasts', 'Aberrations', 'Celestials', 'Fiends', 'Fey', 'Monstrosities', 'Oozes', 'Plants'] },
  ],
  quest: [
    { name: 'setting',                label: 'Setting',    type: 'select', default: 'Great City', options: ['Great City', 'Warring Kingdoms', 'Mystical Forest', 'Desert Empire', 'Floating Isles'] },
    { name: 'antagonist_description', label: 'Antagonist', type: 'text',   default: '', placeholder: 'e.g. a lich seeking immortality' },
  ],
  // genType 'map' (label "Location")
  map: [
    { name: 'region_type',        label: 'Region',            type: 'select', default: 'Forest', options: ['Forest', 'Desert', 'Swamp', 'Mountains', 'Plains', 'Tundra', 'Cityscape', 'Underground'] },
    { name: 'points_of_interest', label: 'Points of interest', type: 'text', default: '', placeholder: 'comma-separated, e.g. Hidden temple, Old shrine, Lost city' },
  ],
};

export function searchCommands(query) {
  const q = String(query || '').toLowerCase();
  if (!q) return GENERATOR_COMMANDS;
  return GENERATOR_COMMANDS.filter(c =>
    c.key.includes(q) || c.label.toLowerCase().includes(q) || c.genType.includes(q)
  );
}
