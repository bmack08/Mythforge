vision & guardrails
goal: one app that scaffolds, auto generates, and polishes a full homebrew adventure sourcebook (levels, setting, bestiary, magic items, DM tools) with optional character options. output must be:
•	structured (front matter → main book → back matter),
•	balanced (encounters, treasure, leveling),
•	accessible & localizable, and
•	marketplace ready (print + digital + VTT).
legal/compliance:
•	Build on SRD 5.1 (CC BY 4.0) only. Never ship closed WotC text, art, logos, trade dress, or exact layout duplicates. Offer compatible, original wording and visual language.
•	Provide a toggle to flag content that risks closed IP (e.g., “beholder,” “mind flayer”) and suggest SRD safe replacements (e.g., “gaze tyrant,” “ceremorph”).
•	Include a license injector (defaults to CC BY 4.0 or creator’s license) + attribution builder.
________________________________________
product pillars
1.	story first, rules assisted: wizard like flow that captures premise, tone, pillars (combat, exploration, social), and constraints, then produces a scaffolding.
2.	difficulty as a system design budget: a unified set of knobs that drive balance, pacing, and loot across the whole book.
3.	chunked authoring: everything is a typed block (room key, event, NPC, item, table, sidebar, etc.) with style + exports wired in.
4.	AI collaborate mode: templates for “fast draft,” plus a brainstorming chat with context memory (tone, lore, constraints).
5.	marketplace outputs: press ready PDF (CMYK), accessible PDF (tagged), ePub, Markdown/Docx, Foundry VTT/Roll20/Alchemy data packs.
________________________________________
information architecture (complete book)
front matter (marketplace ready)
•	Title Page (book title, author/studio, logo slot, license badge).
•	Credits & Legal (contributors, playtesters; SRD 5.1/CC BY; creator’s license).
•	Dedication / Epigraph (optional).
•	How to Use this Book (for all DM levels).
•	Safety Tools & Content Warnings (Session Zero, Lines & Veils, X Card, Open Door).
•	What You Need to Play (SRD references, dice, VTT modules).
•	Adventure Summary (hook, themes, tone, level range, pillars, expected playtime).
•	Adventure Flow Overview (one page diagram + bullet synopsis).
•	Adventure Background (history, factions, secrets).
•	Player Handout Summary (what exists; spoiler free).
•	Running for Different Group Sizes / Levels (scaling advice).
•	Accessibility Statement (layout, alt text, dyslexia friendly fonts optional).
core chapters (adventure book)
1.	Chapter 1: Starting the Adventure
o	Hooks (3–5), Onboarding, Session Zero prompts, Lines/Veils cues.
o	Starting Location Key (boxed text + DM notes).
o	Early complications, fail forward beats, safety valves.
2.	Chapter 2+: Adventure Sites & Acts
Pattern repeats per site/act; app supports branching or sandbox.
o	Region/Site Overview: purpose, ambience, travel hazards.
o	Random Encounters (by day/night/terrain).
o	Keyed Locations:
	Numbered (2.1, 2.2…), Boxed Text, Read Aloud Sensory Table, Features, Traps/Hazards, Secrets & Clues, Tactics & Morale, Treasure.
	Scaling blocks (“Easy/Standard/Hard/Deadly” variants).
	Sidebar: running notes, optional variants, lore drops.
o	Social Scenes (goals, stakes, truths/falsehoods, clocks for rising tension).
o	Set Piece Encounters (terrain layers, phases, soft timers).
o	Travel & Exploration Procedures (watches, supply stress, weather).
3.	Chapter N: Climaxes & Resolutions
o	Multiple endings (success, partial, failure with consequences).
o	“What changes in the world?” knobs.
o	Epilogues, downtime rewards, follow on hooks.
optional player content
•	Backgrounds (traits, ideals, bonds, flaws; SRD safe).
•	Feats / Spells / Subclasses (power checked; see Damage Control below).
•	New Equipment (downtime uses, crafting tags).
setting toolbox (homebrew friendly)
•	Region Gazetteer (maps; travel times; factions; laws & taboos; services).
•	Hex/Sector Procedures (1 page ops per mode: overland, city, dungeon).
bestiary
•	Stat Blocks (SRD chassis; MM style clarity without copied prose):
o	Lore blurb, Encounter role, Tactics, Morale/Retreat, Treasure.
o	Variant templates (elite, minion, swarm, lair).
o	Behavior tables (what it wants, how it fights, parley options).
o	Accessibility: bolded action names, consistent iconography.
magic items & rewards
•	Rarity budget per level band; attunement load advice.
•	Story bound items (progressive unlocks), Consumables, Boons (non item rewards).
•	Identify/Discovery tables; Cursed/Complication toggles.
DM tools chapter
•	Encounter Math (XP budgets, multipliers, daily nova/attrition slider).
•	Milestone/Session Budgets (leveling by beats, not kills).
•	Sandbox Clocks (faction fronts, looming disasters).
•	Travel, Weather, Supply Stress (fast tables).
•	Traps & Hazards Builder (damage tiers, detection DC, counterplay).
•	Social Conflict (influence, leverage, clocks).
•	Downtime & Rewards (favors, renown, rivals).
•	On the Fly Scaling cheatsheet.
back matter
•	Appendix A: Random Tables (hooks, rumors, dungeon dressing, names).
•	Appendix B: Player Handouts (letters, maps, puzzles; print & form fillable).
•	Appendix C: Stat Block Index (alphabetical + by CR + by role).
•	Appendix D: Magic Item Index (by rarity, slot, theme).
•	Appendix E: Conditions & Rules Reminders (SRD excerpts, rephrased).
•	Glossary (consistent terminology), Index, Design Notes (optional).
•	Character Sheets (optional module later).
________________________________________
system design budget (the master difficulty knobs)
These global settings drive generators, warnings, and scaling blurbs everywhere:
•	Target Party Level Range (e.g., 1–5).
•	Table Size (3–6 PCs), Rest Frequency (gritty–standard–high), Magic Prevalence (low/normal/high), Healer Presence toggle.
•	Pillar Emphasis sliders: Combat / Exploration / Social (0–100).
•	Encounter Intensity Curve (front loaded spike, steady, rising).
•	Resource Attrition (gritty attrition vs nova bursts).
•	Treasure Pace (low, standard, high), Attunement Fatigue (strict/loose).
•	Tone & Safety (horror, whimsy, heroics; content thresholds).
•	Sandbox Pressure (faction clocks speed).
How it’s used:
•	Encounter Builder computes XP budgets and suggests count/CR; applies multipliers for group size, environment & synergy; tags “swingy” designs.
•	Treasure Allocator matches rarity budget to leveling plan; warns on attunement overload.
•	Pacing Engine aligns scenes with your intensity curve; inserts breathers after set pieces.
•	Scaling Notes are auto generated per encounter (“For 3 PCs, remove the xxx” / “Hard mode: add lair action Y”).
________________________________________
damage control & sanity checks (balance + playability)
Monsters/NPCs (homebrew or tweaked):
•	CR Estimator (offense/defense DPR, to hit/DCs, nova profile, action economy, rider effects, AoE footprint).
•	Red Flags: unavoidable stun/lock chains; save or lose without counterplay; auto kill thresholds; healing loops.
•	Counterplay Hints (skills, spells, items that help; tactics that negate).
•	Swinginess Meter (crit range, advantage stacking, recharge spam).
PC Options (optional chapter):
•	Feat/Spell/Subclass Budget vs SRD baselines (expected DPR/Utility per round; action economy collisions; scaling slope).
•	Attunement Economy warnings (too many “must take” items).
Encounter Sanity:
•	Action Economy Check: creatures vs PCs, legendary/lair usage, adds/minions.
•	Terrain Leverage: does the map enable the creature’s shtick?
•	Recovery Windows: ensure rests/safe harbors align with chosen attrition level.
Accessibility Sanity:
•	Boxed text length ≤ ~120 words, short sentences, avoid color only cues.
•	All art/maps have alt text; PDFs tagged; headings semantic; contrast checked.
________________________________________
authoring workflow (DM friendly)
1.	Create Project → select template (one shot, 3 act mini, campaign arc, dungeon crawl, hexcrawl, city intrigue).
2.	Set System Budget → party, sliders, tone, marketplace target.
3.	Pitch & Pillars Wizard → premise, themes, 3 conflicts, 3 treasures, 3 secrets.
4.	Auto Scaffold → TOC, act/site shells, early hooks, faction fronts, first map stubs.
5.	Block Authoring (everything is a typed block with fields + preview):
o	Room/Scene (id, title, boxed text, features, checks, secrets, treasure, scaling, sidebar).
o	NPC (role, bonds, goals, truths/falsehoods, voice cues, stat link).
o	Monster (build/import, variants).
o	Item (rarity, attunement, discovery).
o	Table (rollable, weighted).
6.	AI Collaborate (context aware chat):
o	“give me 3 lair actions for a fungal dragon that push positioning”
o	“rewrite this boxed text to 90 words, 2 reading levels lower, present tense.”
7.	Balancing Pass → warnings, suggestions; one click “scale to Hard mode.”
8.	A11y Pass → alt text prompts, contrast, heading outline, reading level.
9.	Export → press PDF, accessible PDF, VTT packs, ePub/Docx, Markdown.
10.	Marketplace Pack → cover template, metadata (blurb, tags, safety notes), license, sample pages.
________________________________________
UI/UX details that matter
•	Left TOC / Right Editor with live preview; swap to Map Mode (pins = keyed areas).
•	Block Library (drag drop: boxed text, sidebar, callout, stat block, table, handout).
•	Style System (themes that are familiar but legally distinct): page furniture, colorways; dyslexia friendly font toggle.
•	Glossary Hover (terms show SRD tooltip).
•	Inline Rollers for tables while testing.
•	Versioning & Playtest Notes (tag blocks “changed at table,” jot rulings).
•	Locale Panel (strings separated; date/time/number formats; right to left support).
________________________________________
export & integration
•	PDF: press (300dpi/CMYK/bleeds), and tagged a11y PDF (semantic headings, alt text, reading order).
•	VTT: Foundry (scenes, walls, lights, tokens, compendia), Roll20 (pages, dynamic lighting), Alchemy (cards), FG (modules).
•	Maps: grid/no grid PNG, WEBP, VTT metadata (px per grid, offsets), 1" printable tiles.
•	Data: JSON schema for blocks; Markdown for portability; Docx for editors.
•	Covers: KDP/DriveThru templates (spine calc), A+ content images.
________________________________________
templates library (copy drop ready)
boxed text (short, sensory, present tense)
2.4 – Lamp Lit Archives (Read Aloud, ~85 words)
Dry parchment and lamp oil scent the air. Shelves loom in tight rows, their ledgers stitched with red twine. A brass astrolabe ticks on a desk, casting slow spokes of light across the floor. Somewhere beyond the stacks, a quill scratches—then stops.
DM Notes: DC 13 Perception to notice dust scuffs toward [2.5]. On first loud noise, Scribe Wight (see Bestiary) whispers a warning; second noise triggers attack.
________________________________________
sidebar (DM facing)
Running Whisper Foes
They avoid direct confrontation until outnumbered 2:1. Give hints (shadows, drafts, whispers) every 10 minutes. If caught in open, they disengage and flee via vertical routes.
________________________________________
keyed location (full)
2.7—Collapsed Gallery
Features: unstable ceiling (DC 14 Perception to spot; DC 15 Dex save on collapse, 2d6 bludgeoning; see Scaling), cracked idol (Arcana DC 12: wards inert), hidden cache (DC 14 Investigation).
Tactics: rubble grants half cover; skirmishers climb to balcony (Athletics +5).
Treasure: 45 gp in trade bars; Dust of Dimming (consumable; see Items).
Scaling:
•	3 PCs / Easy: remove one skirmisher; collapse DC 13; 1d6 damage.
•	Hard: add Shower of Shards lair action every 3 rounds (Dex save DC 13, 1d6 slashing; half on success).
________________________________________
encounter (set piece)
Bridge of Hollow Stars (Level 5, Hard)
Map: 60 ft span over void, 10 ft wide; stellar motes (difficult terrain patches).
Opposition: 1x Void Herald (elite), 2x Rift Stalkers (skirmish).
Phases:
1.	Control: Herald opens with gravity well (cluster PCs); stalkers flank.
2.	Hazard: Every 2 rounds, motes pulse (Con save DC 14 or speed halved).
3.	Desperation: At 50% HP, Herald shatters 20 ft of bridge (Dex save DC 15; fall = off map rescue clocks).
Counterplay: Teleport/flight negate bridge shatter; dispel magic suppresses gravity well 1 round.
________________________________________
NPC template
NPC: Madam Elowyn, Broker of Lost Things (Friendly Neutral)
Role: quest giver / fence. Wants: secrets, leverage. Fears: public shame.
Truths/Falsehoods: tells truth about rival’s vault routes; lies about ownership of the locket.
Voice Cues: clipped consonants, taps rings when lying.
Stat Block: use Noble (tweaked) → Persuasion +6, Insight +6; HP 22.
________________________________________
monster stat block (SRD compatible)
Gloom Stitched Wight
Medium undead, NE
AC 14 (patchwork lamellar) HP 45 (6d8+18) Speed 30 ft.
STR 14 DEX 12 CON 16 INT 10 WIS 12 CHA 14
Saves Con +5, Wis +3 Skills Stealth +3, Perception +3 Resist. necrotic; Immune poison; Cond. Immune charmed, poisoned
Senses darkvision 60 ft., passive Perception 13 Lang. Common, Necril
CR 3 (700 XP)
Sunless Scholar. Advantage on checks to decode/forgery of ledgers.
Reknit Flesh (1/Day). Heals 15 hp at 0 hp instead of dropping, stands, gains +2 AC until end of next turn.
Actions
Ink Dipped Quill. Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 8 (1d8+4) piercing + 7 (2d6) necrotic; DC 13 Con save or disadvantage on Int checks 1 hour.
Withering Remark (Recharge 5–6). 15 ft cone; DC 13 Wis save or 13 (3d8) psychic and frightened until end of next turn (on success, half damage, no fright).
Tactics keeps cover; focuses on loudest PC; retreats at ≤10 hp.
________________________________________
magic item
Dust of Dimming (Consumable, Uncommon)
Toss (20/60). On impact, 10 ft radius dim light for 1 minute; creatures in area have disadvantage on Perception (sight) checks; invisible creatures outlined (no advantage from invisibility). Identify: faint abjuration & evocation.
________________________________________
random table
Rumors in the Port (d8, 25% true)
1 A lighthouse keeper hasn’t aged in 30 years.
2 A silver fish whispers names the night before a storm…
…
________________________________________
player background
Background: Ledger Walker
Skill Proficiencies: Investigation, Insight; Tool: Calligrapher’s Supplies; Feature: Paper Trail (gain a clue when you spend an hour in any archive). Suggested Traits/Ideals/Bonds/Flaws table.
________________________________________
rules engines (core math)
Encounter Builder:
•	Compute party XP budget by difficulty; apply multipliers (creature count, same type synergy), adjust for lair/legendary traits; output CR range suggestions + composition (anchor/controller/skirmisher/artillery/support).
•	Surface Action Economy Score and Nova Risk Index.
Loot/Treasure:
•	Per level RARITY budget (consumables count as 0.25 item); Attunement Budget (party max attunements, warn on overfill); inject non item rewards (boons, favors, safehouses).
Milestones:
•	Choose act beats (3–6 per tier). Tag encounters/scenes to beats; auto track progress; recommend downtime cadence.
Traps/Hazards:
•	Damage tiers by level; Discovery DC bands; Counterplay options; Reset/Single use toggles.
Social:
•	Influence DC from NPC composure; Leverage meter (+/ ) from gifts, blackmail, favors; Clock for patience or suspicion.
________________________________________
accessibility & inclusion
•	WCAG 2.2 AA color/contrast; dyslexia friendly font option; hyphenation control; line length 60–80 chars.
•	Screenreader first: semantic headings (H1–H4), alt text on images/maps, labeled boxed text (role="doc-quote"), reading order.
•	Plain Language mode for boxed text.
•	Color independent map symbology (patterns + icons).
•	Content Warnings front matter; “soft opt out” beats (non graphic alternatives).
•	Localization hooks: translatable strings; avoid hard coded idioms.
________________________________________
advanced tips & expert insight
•	Momentum economy: alternate high cognitive load scenes (tactical set piece) with low load (simple social) to prevent DM fatigue.
•	Fail forward design: every key check failure yields progress + cost (noise, time, resource).
•	3 Tracks of Clueing: physical (props), social (gossip), environmental (signs) so one missed check never stalls.
•	Tactics as teaching: early encounters foreshadow boss mechanics in safe doses.
•	Boss pacing: map to music structure (intro–verse–chorus–bridge–finale); give the DM a sequence card (what happens on turns 1–5 if unsure).
•	Map affordances: place, on purpose, 3 features per fight (elevation, hazardous zone, dynamic cover) to create choices without rules bloat.
•	Safety valves: at least one “exit scene” per act (negotiate, retreat with cost, alternative win condition).
________________________________________
data schemas (for devs)
json
CopyEdit
// simplified block schema
{
  "id": "2.4",
  "type": "location",
  "title": "Lamp-Lit Archives",
  "boxedText": "Dry parchment and lamp oil...",
  "features": [
    {"name": "Shelves", "dc": 12, "note": "tight rows..."},
    {"name": "Astrolabe", "interact": "Arcana DC 12 pauses ticking"}
  ],
  "checks": [{"skill": "Perception", "dc": 13, "effect": "Dust scuffs toward 2.5"}],
  "secrets": ["Hidden ledger page under blotter"],
  "encounterRef": ["gloomStitchedWight"],
  "treasure": [{"ref": "dustOfDimming"}],
  "scaling": {"easy": "...", "hard": "..."},
  "sidebars": [{"title": "Running Whisper Foes", "body": "They avoid..."}],
  "links": [{"to": "2.5", "type": "passage"}],
  "a11y": {"altText": null, "readingLevel": "8th"}
}
________________________________________
AI collaboration patterns
•	Generator prompts (pre tuned): “3 villain goals that escalate over 5 sessions,” “5 travel mishaps that cost time but not TPK.”
•	Refinement prompts: “reduce jargon,” “convert to sandbox clocks,” “tone shift to whimsical.”
•	Consistency enforcer: named entity tracker (faction names, place names); spellings; style guide (serial comma, 2nd person boxed text).
________________________________________
what we can build next (roadmap)
•	Playtest Mode: timer, initiative tracker, encounter scaling sliders live; push changes back into manuscript with notes.
•	Art briefs generator: per scene/monster, with alt text prewritten.
•	Community templates: shareable block bundles (e.g., city intrigue starter kit).
•	Revenue packager: auto create DriveThru/KDP listings (metadata, sample PDF, thumbnail sets).
•	Ruleset adapters: plug additional SRDs (PF2, Shadowdark) via strategy interfaces.
________________________________________
if you want, i can spin up a starter project from this blueprint: pick a template (e.g., “3 act mini campaign, levels 1–5”), set your system budget defaults, and I’ll generate the initial TOC with chapter shells, sample encounters, and placeholders wired for your NPC generator.
Sources
You said:
Here is what i would like. I am using cursor AI to currently build the app. but the data you have provided is worth more than gold itsself. i need to tell cursor of these details and instructions for it to run all the task needed to complete the application. can you help me with this 
ChatGPT said:
Thought for 19s
awesome — let’s turn all that into a clean, Cursor ready build spec you can paste into your repo and hand to the AI. below is a pragmatic PRD + tech spec + scaffolding plan (with data models, JSON schemas, prompts, and a test/checklist) so Cursor can implement the app end to end.
________________________________________
PRD: Homebrew Adventure Sourcebook Generator
Goal
A web app that helps DMs generate, edit, and export complete homebrew adventure sourcebooks (with front matter, DM facing text, boxed text, sidebars, numbered sections, accessibility), including optional character options, DM tools, adventures, bestiary, items, settings, templates, and marketplace ready packaging.
Core User Flows
1.	New Project Wizard
o	Inputs: Title, authors/credits, license, system/edition, target party level & size, tone/genre, setting seed, “system design budget” (difficulty/complexity), marketplace metadata.
o	Output: Project skeleton with chapters/sections and placeholders.
2.	AI Brainstorming Mode (Chat)
o	Threaded conversation that refines lore, enemies, bosses, maps, factions, plot beats.
o	Can spawn or update sections, encounters, NPCs, items.
o	“Ask AI to fill this section” from any node in the outline.
3.	Template Mode
o	Pick a template (one shot, 3 act, hex crawl, urban intrigue, dungeon crawl, campaign arc, etc.).
o	Auto populate the outline and chunk numbers; later editable.
4.	Balancing & Sanity Checks (“Damage Control”)
o	Encounter difficulty/XP budget calculator (party level/size).
o	Homebrew stat sanity (caps for AC/HP/DPR/save DC) with warnings + suggestions.
o	Milestone builder & treasure parcel generator consistent with difficulty.
5.	Editor
o	Rich editor for DM text, boxed text, sidebars, stat blocks, tables.
o	Versioning; compare AI vs. manual edits.
o	Accessibility helpers (alt text, heading structure, landmarks, color contrast check).
6.	Export & Marketplace Packaging
o	Outputs: PDF (print ready), ePub, HTML, and VTT bundles (Foundry/Roll20 JSON), plus a manifest.yaml including front matter, credits, legal, version, content hash.
o	All front matter included (title page, credits, license, safety/tools page, how to run).
o	Back matter included (appendices, indexes, glossary) — character sheets optional later.
________________________________________
Architecture (suggested)
•	Frontend: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Zustand (or Redux Toolkit) for state; MDX for content blocks; TipTap/ProseMirror for rich editing.
•	Backend: Next.js API routes (tRPC optional) + Prisma + PostgreSQL (or SQLite for local dev).
•	LLM Orchestration: Server actions calling your provider; JSON schema constrained outputs; retry/repair cycle with validators.
•	Build/Export: MDX → HTML → PDF (Playwright); ePub via epub-gen or pandoc pipeline.
•	VTT Export: FoundryVTT & Roll20 JSON mappers.
•	Auth: NextAuth (email/OAuth).
•	CI/CD: GitHub Actions (lint, typecheck, tests, export snapshot PDFs).
•	Licensing: Support custom license + CC BY 4.0; provide content provenance fields.
________________________________________
Repo Structure
bash
CopyEdit
/apps/web
  /src
    /app (Next.js app router)
      /projects/[id]
      /api
    /components
      /editor
      /ai
      /templates
    /lib
      /schemas
      /balance
      /export
      /vtt
    /styles
  /public
/packages
  /core-types
  /generators
  /balancer
  /exporters
  /prompts
  /templates
/tools
  pdf-preview.ts
  seed.ts
________________________________________
Data Models (TypeScript / Prisma)
Core Types (/packages/core-types/src/types.ts)
ts
CopyEdit
export type Difficulty = "story" | "easy" | "medium" | "hard" | "deadly";
export type System = "5e-srd-5.1" | "pf2e" | "generic";

export interface SystemDesignBudget {
  targetLevel: number;    // 1-20
  partySize: number;      // 1-6+
  difficulty: Difficulty;
  combatMix: number;      // 0..1 (0 = story, 1 = combat heavy)
  magicItemRarityCap?: "uncommon"|"rare"|"very-rare"|"legendary";
}

export interface ManifestMeta {
  title: string;
  subtitle?: string;
  version: string;            // semver
  authors: { name: string; role?: string }[];
  license: string;
  credits: string[];
  legalNotes?: string;
  marketplace: {
    summary: string;
    tags: string[];
    coverImageId?: string;
  };
}

export interface AdventureProject {
  id: string;
  system: System;
  meta: ManifestMeta;
  design: SystemDesignBudget;
  settingSeed: string;
  outline: Chapter[];
  bestiary: StatBlock[];
  items: MagicItem[];
  spells?: Spell[];
  backgrounds?: Background[];
  dmTools: DMTools;
  accessibility: AccessibilityMeta;
}

export interface Chapter {
  id: string;
  title: string;
  number: string;       // e.g. "Chapter 3"
  sections: Section[];
}

export type SectionKind = "dm-text" | "boxed-text" | "sidebar" | "encounter" | "table" | "handout";

export interface Section {
  id: string;
  kind: SectionKind;
  title?: string;
  number?: string;      // auto-numbered
  bodyMDX?: string;     // MDX w/ admonitions
  encounterRef?: Encounter;
  table?: TableBlock;
  handout?: Handout;
  accessibility?: { altText?: string; ariaLabel?: string };
}

export interface Encounter {
  id: string;
  name: string;
  environment?: string;
  recommendedLevel?: number;
  xpBudget: number;
  difficulty: Difficulty;
  monsters: EncounterMonster[];
  npcs?: NPC[];
  treasure?: TreasureParcel[];
  milestone?: boolean;
}

export interface EncounterMonster {
  refId: string;   // link to StatBlock.id
  quantity: number;
  notes?: string;
}

export interface StatBlock {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment?: string;
  ac: number;
  hp: number;
  speeds: string;
  abilities: { str:number; dex:number; con:number; int:number; wis:number; cha:number };
  saves?: Partial<Record<"str"|"dex"|"con"|"int"|"wis"|"cha", number>>;
  skills?: Record<string, number>;
  senses?: string[];
  languages?: string[];
  cr: number;      // 0..30 (5e)
  traits: Trait[];
  actions: Trait[];
  reactions?: Trait[];
  legendary?: Trait[];
  dprEstimate?: number;
  saveDC?: number;
  tags?: string[];
  provenance?: "srd" | "homebrew";
}

export interface Trait { name: string; text: string; }

export interface MagicItem {
  id: string;
  name: string;
  rarity: "common"|"uncommon"|"rare"|"very-rare"|"legendary"|"artifact";
  type: string; // weapon, armor, wondrous, potion, scroll, etc
  attunement?: boolean;
  textMDX: string;
  sanity?: BalanceFlags;
}

export interface DMTools {
  encounterRules: string;  // explainer chapter (DM-facing)
  travelRules?: string;
  restingRules?: string;
  hazards?: string;
  safetyTools?: string;    // X-Card / Lines & Veils, etc.
}

export interface AccessibilityMeta {
  hasAltText: boolean;
  headingOutlineOK: boolean;
  colorContrastAA: boolean;
  keyboardNavOK: boolean;
}

export interface TableBlock {
  columns: string[];
  rows: string[][];
  caption?: string;
}

export interface Handout {
  title: string;
  bodyMDX: string;
}
Prisma Sketch
prisma
CopyEdit
model Project {
  id        String  @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  blob      Json     // AdventureProject
  ownerId   String
}
________________________________________
JSON Schemas for LLM Output Validation (/packages/core-types/src/schemas/*.json)
Create JSON Schemas mirroring the interfaces above for:
•	AdventureProject
•	Encounter
•	StatBlock
•	MagicItem
Then write zod wrappers in /packages/core-types/src/validation.ts to validate and coerce.
________________________________________
Balancing (“System Design Budget” + Damage Control)
/packages/balancer
•	Encounter XP Budget (5e style):
o	Inputs: partyLevel, partySize, difficulty.
o	Map difficulty → XP thresholds per character; sum & multiply for size.
o	Adjust for # of monsters (multipliers).
o	Output target XP window.
•	Sanity Checks for StatBlocks:
o	Caps by CR: AC range, HP range, average DPR, attack bonus, save DC.
o	Compute DPR estimate from actions; warn if 2+ sigma beyond table.
o	Emit BalanceFlags: acHigh, hpLow, dprSpike, saveDcHigh, legendaryOvertuned.
•	Treasure Parcels:
o	Based on difficulty & # encounters; respect magicItemRarityCap.
o	Ensure diversity: consumables vs permanent.
•	Milestone Builder:
o	Per chapter marks; ensure ~3–4 meaningful milestones per level band.
Provide pure functions with tests.
________________________________________
AI Prompts Library (/packages/prompts)
1) Project Skeleton
text
CopyEdit
SYSTEM:
You are a senior TTRPG developer. Generate a fully-structured sourcebook skeleton. Output MUST be valid JSON matching AdventureProject schema.

USER:
System = ${system}; Title = ${title}; Setting seed = ${seed}; Design budget = ${JSON.stringify(budget)}.
Chapters: include Front Matter (title page, credits, license, safety tools), Introduction (how to use), Character Options (optional), DM Tools, The Adventure (3–6 chapters with numbered sections), Bestiary, Magic Items, Setting Appendix, Back Matter (glossary, index).
Each section must include: kind, title, placeholder bodyMDX, and numbering plan.
2) Brainstorm Section
text
CopyEdit
SYSTEM:
You expand or rewrite a single Section. Keep tone consistent. Prefer DM-facing guidance; include Boxed Text when kind=boxed-text. Use MDX; include <Aside type="tip|warning|note"> for sidebars. No rules text from copyrighted books; write your own.

USER:
Here is the Section JSON: ${sectionJson}.
Here are project constraints (budget, party level/size): ${constraints}.
Revise with stronger hooks, foreshadowing, and a short rumor table if relevant. Return Section JSON only.
3) Encounter Generator
text
CopyEdit
SYSTEM:
Generate a balanced Encounter aligned to 5e SRD. Use only known monsters in the provided SRD list. Compute xpBudget & difficulty. Avoid homebrew unless requested.

USER:
Party level=${L}, size=${N}, desired difficulty=${difficulty}, environment=${env}, theme=${theme}.
Use these SRD monsters: ${monsterList}.
Output Encounter JSON + a matching boxed-text Section and a DM-text Section (tactics, scaling up/down).
4) Homebrew StatBlock (with sanity)
text
CopyEdit
SYSTEM:
Generate a homebrew StatBlock themed "${theme}". Stay within caps for CR=${cr}. After generating, run a self-check: if AC/HP/DPR/DC out of band, lower them. Mark any flags in `sanity`.

USER:
Target CR=${cr}, role=${role}, environment=${env}, twist=${twist}. Output StatBlock JSON only.
5) Numbering & Chunking
text
CopyEdit
SYSTEM:
You are a layout engine. Given a Chapter with Sections, assign hierarchical numbers (Chapter N, N.1, N.1.1...). Keep boxed-text unnumbered but reference nearest section. Ensure titles <= 60 chars. Return Chapter JSON.
________________________________________
Templates (/packages/templates)
•	One Shot (3–4 hours): Hook → 3 Scenes → Boss → Rewards → Epilogue.
•	3 Act Adventure: Act I (Hook/Complication), Act II (Travel/Investigation), Act III (Climax).
•	Dungeon Crawl: 10–15 keyed areas, map notes, hazards, puzzles.
•	Hex Crawl: Region summary, 12 hex features, 6 encounters, 3 factions.
•	Urban Intrigue: Factions, clues web, social encounters, chase.
Each template ships with outline + sample sections + boxed text patterns + sidebars.
________________________________________
Editor UX Requirements
•	Blocks: DM Text, Boxed Text, Sidebar/Aside, Stat Block, Table, Image with alt text, Handout.
•	Slash commands: /boxed, /sidebar tip, /table, /encounter.
•	Accessibility: Enforce heading levels; require alt text for images; color contrast checker; keyboard navigable inspector; export adds landmarks.
•	Terminology: built in glossary and lint rule (e.g., “creature” vs “monster” usage, numbered references).
•	Numbering: auto number; lock numbers on export.
________________________________________
Exporters
PDF (/packages/exporters/pdf)
•	Render MDX via Next.js → Playwright “print to PDF”.
•	Page masters for front matter, running heads/feet, table of contents.
•	Bookmarks by chapter/section. Tagged PDF if feasible.
ePub (/packages/exporters/epub)
•	Convert HTML chunks → epub via epub-gen (or pandoc).
VTT (/packages/exporters/vtt)
•	Foundry: actors (StatBlocks), items, journal entries, scenes (encounters).
•	Roll20: compendium JSON + handouts.
Manifest (manifest.yaml)
yaml
CopyEdit
title: ...
version: 1.0.0
authors:
  - name: ...
license: CC-BY-4.0
front_matter:
  includes: [title_page, credits, license, safety_tools, how_to_run]
back_matter:
  includes: [appendices, glossary, index]
hash: <content sha256>
________________________________________
Accessibility Checklist (enforced on export)
•	Headings are sequential (H1→H2→H3).
•	Alt text present for images and handouts.
•	TOC & bookmarks present.
•	Color contrast AA for swatches used in sidebars.
•	Keyboard traps none (editor).
•	Landmarks: main, nav, aside.
________________________________________
Licensing & Content Safety
•	Provide a toggle for SRD only content and mark provenance on stat blocks.
•	No verbatim copying of non SRD rules text; generate original wording.
•	Marketplace bundle includes license text and credits.
________________________________________
API Endpoints (Next.js routes)
•	POST /api/projects create
•	GET /api/projects/:id fetch
•	PATCH /api/projects/:id update
•	POST /api/projects/:id/generate/section
•	POST /api/projects/:id/generate/encounter
•	POST /api/projects/:id/numbering
•	POST /api/projects/:id/export/pdf|epub|vtt
•	POST /api/validate (schema validation)
________________________________________
Tests
•	Unit: balancer functions; json schema validation; numbering utility; treasure generator.
•	Property-based: stat sanity stays within bands for many random CRs.
•	Snapshot: export a sample project → compare PDF TOC/bookmarks.
•	E2E: create project → template → add encounter → export.
________________________________________
“Cursor Tasks” Document (paste into .cursor/rules.md)
STYLE
•	Prefer TypeScript, functional utilities, exhaustive types.
•	All model changing LLM calls: validate against zod schemas; on failure, auto repair with a “validator report” prompt.
TASKS
1.	Scaffold repo per structure above.
2.	Implement core types, zod schemas, Prisma Project model.
3.	Build New Project Wizard (forms for meta + design budget + setting seed).
4.	Implement Template Mode (load template, write outline).
5.	Implement Brainstorm Chat (UI + server action calling prompt #2).
6.	Build Encounter Generator (prompt #3) + balancer functions.
7.	Add Sanity Checker for StatBlocks with UI warnings.
8.	Rich Editor with blocks & MDX; add /boxed, /sidebar, /table, /encounter commands.
9.	Numbering service (prompt #5) + auto number on save/export.
10.	Exporters: PDF then ePub then VTT; produce manifest.yaml.
11.	Accessibility checks and export gating.
12.	CI with typecheck, tests, snapshot export.
PROMPTS
•	Mount prompts from /packages/prompts and keep them versioned.
•	Always request JSON only when schema required.
VALIDATION
•	Every generator endpoint must: call LLM → parse → zod validate → if fail, send validator report back to LLM for self repair → re validate.
________________________________________
Quick Code Seeds
Balancer DPR/SaveDC caps (very rough 5e-style bands)
ts
CopyEdit
// /packages/balancer/bands.ts
export const bandsByCR = {
  0: { ac:[10,14], hp:[1,12], dpr:[1,5], atk:[2,4], dc:[10,11] },
  1: { ac:[11,15], hp:[15,30], dpr:[6,12], atk:[3,5], dc:[11,12] },
  3: { ac:[12,16], hp:[60,85], dpr:[16,28], atk:[4,6], dc:[12,13] },
  5: { ac:[13,17], hp:[100,135], dpr:[30,42], atk:[6,7], dc:[14,15] },
  8: { ac:[14,18], hp:[150,200], dpr:[45,60], atk:[7,8], dc:[15,16] },
  12:{ ac:[15,19], hp:[225,300], dpr:[65,85], atk:[8,9], dc:[16,17] },
  16:{ ac:[17,20], hp:[300,375], dpr:[90,115],atk:[9,10],dc:[17,18] },
  20:{ ac:[18,21], hp:[400,500], dpr:[110,140],atk:[10,12],dc:[18,19] },
} as const;
Encounter XP budget skeleton
ts
CopyEdit
export function encounterBudget(level:number, size:number, diff:Difficulty){
  const per = { story:0, easy:25, medium:50, hard:75, deadly:100 }[diff]; // unit = % of deadly
  const deadly = deadlyThreshold(level) * size;
  const target = Math.round(deadly * (per/100));
  return { target, window:[Math.round(target*0.85), Math.round(target*1.15)] };
}

