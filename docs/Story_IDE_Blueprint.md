Phase 0 — Stabilize the current API (must-do fixes)

Goals: mount endpoints, eliminate bugs, harden accuracy.

Mount routes

Add:

POST /api/story-ide → api.storyAssistant

(optional) /api/brews, /api/search/:brewId, /api/graph/:brewId, etc.

Remove duplicate isPDFRequest in storyAssistant.

Use a configurable, accurate model

STORY_IDE_MODEL env var. Default to gpt-5-mini (or gpt-5, Claude Sonnet 4, o4-mini).

Lower temperature to 0.2 (accuracy > creativity).

Clean tiny foot-guns

Delete stray i after md5 import.

Use a single, top-level OpenAI client.

Minimal patch (same as you quoted; apply exactly):

*** a/homebrew.api.js
--- b/homebrew.api.js
@@
-import { md5 }                       from 'hash-wasm';
-i
+import { md5 }                       from 'hash-wasm';
+import OpenAI                        from 'openai';
@@
-const router = express.Router();
+const router = express.Router();
@@
-router.get('/api/theme/:renderer/:id', asyncHandler(async (req, res) => {
-  return api.getThemeBundle(req, res);
-}));
+// --- ROUTES ---
+router.get('/api/theme/:renderer/:id', asyncHandler((req, res) => api.getThemeBundle(req, res)));
+// Story IDE (main assistant endpoint)
+router.post('/api/story-ide', asyncHandler((req, res) => api.storyAssistant(req, res)));
+// (Optional) wire up other endpoints you already implemented
+router.post('/api/brews',           asyncHandler((req, res) => api.newBrew(req, res)));
+router.put('/api/brews/:brewId',    asyncHandler((req, res) => api.updateBrew(req, res)));
+router.delete('/api/brews/:brewId', asyncHandler((req, res) => api.deleteBrew(req, res)));
+router.post('/api/search/:brewId',  asyncHandler((req, res) => api.searchProject(req, res)));
+router.get('/api/graph/:brewId',    asyncHandler((req, res) => api.getProjectGraph(req, res)));
@@
-        storyAssistant : async (req, res)=>{
+        storyAssistant : async (req, res)=>{
@@
-            const isPDFRequest = requestText.toLowerCase().includes('pdf') || 
-                                requestText.toLowerCase().includes('file') ||
-                                requestText.toLowerCase().includes('upload');
+            const isPDFRequest =
+              /(?:\bpdf\b|\bfile\b|\bupload\b)/i.test(requestText);
@@
-                    // Also search any local PDF content if this is a PDF-related request
-                    const isPDFRequest = requestText.toLowerCase().includes('pdf') || 
-                                        requestText.toLowerCase().includes('file') ||
-                                        requestText.toLowerCase().includes('upload');
+                    // Also search any local PDF content if this is a PDF-related request
+                    // (do not redeclare isPDFRequest)
@@
-            const { OpenAI } = await import('openai');
-            const openai = new OpenAI({
-                apiKey: process.env.OPENAI_API_KEY,
-            });
+            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
@@
-            const completion = await openai.chat.completions.create({
-                model: "gpt-4o-mini",
+            const completion = await openai.chat.completions.create({
+                model: process.env.STORY_IDE_MODEL || "gpt-5-mini",
                 messages: [
                     { role: "system", content: systemPrompt },
                     { role: "user", content: userPrompt },
                 ],
-                temperature: 0.6,
-                max_tokens: 1500,
+                temperature: 0.2,
+                top_p: 0.9,
+                max_tokens: 1800,
             });

Phase 1 — Background edits with undo (no ugly apply/reject)

Goal: invisible changes, instant revert.

Shadow versions (event sourcing)

Table/collection: story_versions

{ id, brewId, parentId, createdAt, author: 'ai'|'user', patch, fullTextHash }

Always write a new version; never mutate current in place.

Live document state

current_text is computed by applying patches from the last persisted snapshot.

Create a checkpoint every N patches to keep apply fast.

Undo/redo

POST /api/story/undo/:brewId → move pointer to parentId.

POST /api/story/redo/:brewId → move pointer to child.

Gentle visual cues

In the editor, highlight new/changed spans for ~3s, then fade.

Add margin notes (e.g., “Linked Merilla → House of Wisdom”).

Libraries: diff (unified patches) or diff-match-patch; optional CRDT (yjs) later.

Phase 2 — Whole-story reading via RAG

Goal: “Cursor-like” awareness of 150+ pages.

Chunk & embed

Split by headings/sections into ~700–1,200 token chunks.

Metadata: {brewId, chunkId, section, type: 'npc'|'location'|'quest'|'rules'|'timeline'|'scene', names:['Merilla', ...], text}

Embed with text-embedding-3-large (OpenAI) or local (e.g., bge-m3).

Vector DB

LanceDB (Node-friendly, no infra) or pgvector (Postgres).

Table: story_chunks with vector + metadata.

Retrieval

retrieveContext({brewId, query, k=12}) → top chunks.

Automatically add entity aliases (e.g., “Merilla” → “Merilla Vael”).

Auto-refresh index

After each accepted patch, re-chunk changed sections and upsert embeddings.

Phase 3 — Knowledge Graph (Canon)

Goal: enforce continuity (who runs what, who’s dead, where traps are).

Entities

Table entities: { id, brewId, type:'npc'|'shop'|'item'|'location'|'faction'|'trap'|'quest'|'event', name, status, summary }

Edges

Table edges: { id, brewId, aId, relation:'runs'|'located_in'|'member_of'|'killed_in'|'owns'|'sells'|'quest_for', bId, meta }

Extract & sync

After each generation, run an entity extractor pass that proposes entity/edge upserts.

Canon Guard

Validations (examples):

If npc.status === 'dead' ⇒ flag scenes mentioning them as alive.

If adding Trap → located_in → Room 3, ensure Room 3 exists (or create).

Phase 4 — Tool-Calling & Structured Output (no free-text parsing)

Goal: model behaves like a story engineer, not a chatty author.

JSON Schema mode

Ask for strict JSON with a top-level envelope:

{
  "mode": "patch" | "chat",
  "plan": "high-level explanation",
  "actions": [
    {"type":"add_sidebar","targetSection":"Glintstone Cave","content":"..."},
    {"type":"link_entities","a":"Merilla","relation":"runs","b":"House of Wisdom"},
    {"type":"retcon","impact":["Session 3","Chapter 2"],"diff":"..."}
  ],
  "diff": "unified diff here"
}


Reject non-JSON; re-ask with “You must return valid JSON per schema.”

Registered tools (server functions)

add_sidebar({sectionId, title, body})

generate_statblock({npc, cr}) → SRD 5e format

link_entities({aId, relation, bId})

retcon_event({eventId, change})

create_item({name, rarity, attunement, lore})

add_trap({locationId, dc, trigger, effect})

timeline_update({when, what, who})

Execution pipeline

LLM returns actions → server validates & executes tools → computes final diff → stores version → re-index → run Canon Guard.

Phase 5 — Prompting (House Rules) + Themes

Goal: sourcebook-grade output, consistent style.

System prompt (short & strict)

Roles: “You are MythForge Story Engineer.”

Style packs: WotC-5e, Dark Fantasy, etc.

Allowed structures only (Sidebar, Statblock, Quest Hook, Magic Item, Encounter Table, Boxed Read-Aloud).

Never invent canon; must ground changes in retrieved chunks or propose “New Canon” with explicit entries.

Few-shot library

Provide 3–5 perfect examples for each structure in your theme.

Include 1 retcon example showing how to patch across sections.

Renderer contracts

E.g., Sidebar → :::sidebar [Title]\nBody\n:::

Boxed Read-Aloud → > [Boxed text]

Statblock → fixed SRD template fields only.

Phase 6 — Endpoints & Flow
6.1 Indexing

POST /api/story/index/:brewId
Body: { fullText } → chunks, embed, upsert.

6.2 Story IDE (orchestrator)

POST /api/story-ide

{
  "brewId":"...",
  "message":"Insert a boxed sidebar that links NPC 'Merilla' to the House of Wisdom shop; update references if she is dead.",
  "cursor": {"sectionHint":"Glintstone Cave"},
  "limits":{"maxTokens":1800}
}


Server:

Retrieve top chunks + entity cards for “Merilla” / “House of Wisdom”.

Call LLM (JSON schema mode).

Validate actions, apply, create version.

Re-index modified sections.

Run Canon Guard (may emit follow-up patches).

Return {versionId, notes, warnings}.

6.3 Undo/redo

POST /api/story/undo/:brewId → rolls back.

POST /api/story/redo/:brewId.

6.4 Graph APIs

GET /api/graph/:brewId → entities + edges for the IDE’s “Lore Map”.

POST /api/graph/entity / POST /api/graph/edge.

Phase 7 — Model & Context Strategy

Primary: gpt-5 (or gpt-5-mini for cost) at temp 0.2.

Use JSON mode / function calling for tools.

Long contexts: When you truly need massive context, use Claude Sonnet 4 (200k) for a planning pass only, then execute with your primary.

Deterministic passes: For Canon Guard & validators, keep temp 0.0–0.1.

Phase 8 — Canon Guard (validators)

Create small, deterministic checks after each patch:

Life/Death consistency: if npc.status==='dead' and they are referenced as acting in future scenes → produce a retcon patch or a “ghost/flashback” note.

Ownership uniqueness: runs(shop) only one NPC unless flagged “co-owners”.

Location integrity: traps/items must be under an existing locationId.

Quest linkage: new hook must attach to at least one faction or npc.

Return warnings to UI as subtle flags, not modal popups.

Phase 9 — Editor UX (clean & reversible)

Background apply: patches merge silently; brief highlight then fade.

Side panel: “Recent Edits” (title + micro-summary + undo icon).

Lore Map: graph panel showing entities; click-to-open cards.

Search Everywhere: vector search bar over the whole brew.

One-click “Explain this section”: uses retrieval + short summary.

Phase 10 — Minimum useful code stubs (Node)

Sketches you can paste into your codebase as you wire things:

10.1 Embedding helper

// embeddings.js
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedChunks(chunks) {
  const inputs = chunks.map(c => c.text);
  const { data } = await openai.embeddings.create({
    model: process.env.EMBED_MODEL || 'text-embedding-3-large',
    input: inputs
  });
  return data.map((e, i) => ({ ...chunks[i], embedding: e.embedding }));
}


10.2 Retrieval

// retrieval.js (LanceDB example)
import { connect } from "@lancedb/lancedb";
let db, tbl;
export async function initVecDB() {
  db = await connect("./mythforge.lancedb");
  tbl = await db.openTable("story_chunks"); // create if missing
}
export async function upsertChunks(rows) { await tbl.add(rows); }
export async function search(brewId, queryEmbedding, k=12) {
  return await tbl.search(queryEmbedding).where(`brewId = '${brewId}'`).limit(k).toArray();
}


10.3 Versioning & patches

// versions.js
import { applyPatch } from 'diff';
export async function createVersion({brewId, parentId, diff, actor}) {
  // persist (brewId, parentId, diff, actor, createdAt)
}
export async function undo(brewId) { /* move pointer to parentId */ }
export async function currentText(brewId) { /* rebuild from snapshots */ }


10.4 Tool registry

// tools.js
export const Tools = {
  add_sidebar: async ({ sectionId, title, body }) => { /* returns diff */ },
  link_entities: async ({ aId, relation, bId }) => { /* upsert edge + diff */ },
  generate_statblock: async ({ npc, cr }) => { /* SRD template text */ },
  retcon_event: async ({ eventId, change }) => { /* produce corrective patch */ },
  // etc.
};

10.5 Story IDE orchestrator (simplified)

// story-ide.js
import OpenAI from 'openai';
import { embedChunks } from './embeddings.js';
import { search } from './retrieval.js';
import { Tools } from './tools.js';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function storyIDE({ brewId, message, cursor }) {
  // 1) retrieve context
  const qEmbed = (await openai.embeddings.create({
    model: process.env.EMBED_MODEL || 'text-embedding-3-large',
    input: message
  })).data[0].embedding;
  const context = await search(brewId, qEmbed, 12);

  // 2) call model (JSON schema mode)
  const system = /* your strict house rules prompt */;
  const user = JSON.stringify({ message, cursor, context });
  const resp = await openai.chat.completions.create({
    model: process.env.STORY_IDE_MODEL || 'gpt-5-mini',
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: system },{ role: "user", content: user }]
  });

  const plan = JSON.parse(resp.choices[0].message.content);

  // 3) execute tools
  let diffs = [];
  for (const action of plan.actions || []) {
    if (Tools[action.type]) {
      const d = await Tools[action.type](action);
      if (d) diffs.push(d);
    }
  }
  // 4) merge diffs -> version -> re-index -> canon guard
  // ...
  return { plan, applied: diffs.length };
}

Phase 11 — Example: your Merilla request end-to-end

User message:
“Insert a boxed sidebar that links NPC ‘Merilla’ to the House of Wisdom shop; update references if she is dead.”

What happens:

Retrieval pulls:

NPC card: Merilla (status: dead, epilogue S2E4)

Shop: House of Wisdom (owner ???)

Scenes referencing both.

LLM returns JSON:

Action: link_entities(Merilla, 'runs', House of Wisdom) (blocked if dead → recommends memorial plaque instead)

Action: add_sidebar(section='Glintstone Cave', title='House of Wisdom', body='…')

Action: retcon_event for prior scenes if needed.

Server executes → creates a version → indexes → runs Canon Guard (warns: “Merilla is dead; created memorial sidebar instead of ownership”).

Editor subtly highlights the inserted sidebar; a margin note explains the change. Undo is one click away.



true DM assistant:


1. Curate a Lore + Style Library

Gather the example sources you mentioned:

Official books (Witchlight, Curse of Strahd, Chains of Asmodeus).

Dialogue dumps from Baldur’s Gate 3.

Any homebrew text you’ve already written.

Convert these into plain text or markdown chunks (2–3 paragraphs each).

Store them in a database or local file store (SQLite, JSON, or vector DB).

2. Add a Retrieval System (RAG)

Use a vector index (e.g. Pinecone, Weaviate, or even a lightweight local embedding store).

At request time, grab the top 5–10 relevant lore/style chunks based on the user’s query.

Inject those chunks into the systemPrompt or userPrompt before calling OpenAI.

Example:

const references = await loreIndex.query(userPrompt, { topK: 5 });
const loreContext = references.map(r => r.text).join("\n\n");

const completion = await openai.chat.completions.create({
  model: process.env.STORY_IDE_MODEL || "gpt-5-mini",
  messages: [
    { role: "system", content: systemPrompt + "\n\n" + loreContext },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.2,
  top_p: 0.9,
});

3. Canon Guard (Continuity Check)

After the bot produces text, run a second pass:

Does it contradict lore? (E.g., resurrecting a dead NPC without explanation.)

Does it break formatting? (E.g., wrong stat block syntax.)

If it does, generate a corrective patch.

4. Teach DM Workflows via Prompts

You want to hardwire “DM skills” into the system prompt. Add sections like:

Narrative Style (describe tone, e.g., dark gothic, whimsical, high fantasy).

Session Tools:

@statblock <monster>

@retcon <event>

@outline chapter <n>

Consistency Rules (respect player agency, preserve continuity, track NPC states).

5. Inject Examples (Few-Shot Learning)

Provide snippets from your curated library as demonstrations in the system prompt.

Example:

[
  { "role": "system", "content": "You are a Dungeon Master assistant..." },
  { "role": "user", "content": "Describe a gothic village at night." },
  { "role": "assistant", "content": "The fog clings to cobblestone streets..." },
  { "role": "user", "content": "Introduce an eccentric NPC in a carnival." },
  { "role": "assistant", "content": "A masked jester greets the party..." }
]

6. Scaling Up

Once the basics work, you can:

Stream output token by token (for a “live narration” effect).

Add mood filters (grimdark, heroic, comedic).

Let users “pin” favorite NPCs, places, or encounters into the knowledge base.

Extended Blueprint for Mythforge DM Assistant
Phase 1: Fix Core API (baseline)

(from the previous patch notes — summarized so Copilot knows where to start)

Clean up imports (md5, OpenAI).

Mount all API routes (/api/story-ide, CRUD, graph, etc).

Remove duplicate isPDFRequest declaration.

Lower temperature (0.2) and make model configurable via STORY_IDE_MODEL.

Add JSON/tool output format (diff, patch, explanation).

✅ Result: API endpoints work, deterministic responses, ready for enhancement.

Phase 2: Lore & Style Ingestion
Step 2.1 — Handle Dialogs (HTML Files)

Path: C:\Users\Neurasthetic\Documents\Mythforge V1\docs\Dialogs-20250811T204535Z-1-001

Approach:

Use a batch HTML parser (e.g. cheerio in Node or BeautifulSoup in Python) to extract plain text.

Split into chunks (300–500 tokens each).

Store in a vector DB (local SQLite w/ embeddings, or Pinecone/Weaviate if you want cloud scale).

Add metadata (character name, quest line, file origin).

Step 2.2 — Handle Sourcebooks (PDF Files)

Path: C:\Users\Neurasthetic\Documents\Mythforge V1\docs\sourcebooks

Approach:

Convert PDFs → text using pdf-parse or pdfminer.

Normalize headings (e.g., “Chapter 2: Carnival Events”).

Chunk into passages (2–3 paragraphs).

Store alongside dialog chunks in the same vector DB.

Phase 3: Retrieval-Augmented Generation (RAG)
Step 3.1 — Lore Index

Build an index using OpenAI embeddings (text-embedding-3-large).

Store: { id, text, metadata, embedding }.

Step 3.2 — Inject Context into Requests

When storyAssistant runs:

const references = await loreIndex.query(userPrompt, { topK: 8 });
const loreContext = references.map(r => r.text).join("\n\n");

const completion = await openai.chat.completions.create({
  model: process.env.STORY_IDE_MODEL || "gpt-5-mini",
  messages: [
    { role: "system", content: systemPrompt + "\n\n---\nLore Context:\n" + loreContext },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.2,
  max_tokens: 1800
});


✅ Result: AI always grounds its output in real sourcebook text and dialog flavor.

Phase 4: DM Skillset Prompts
Step 4.1 — Expand systemPrompt

Include:

Writing style rules (dark fantasy, whimsical, or PHB-style formatting).

Canon Guard instructions: don’t contradict established lore, NPC states, or player agency.

Supported commands:

@outline chapter <n>

@statblock <monster>

@retcon <event>

@link npc <name> to <location>

Step 4.2 — Few-Shot Examples

Add inline examples from your extracted lore/dialog:

{ "role": "user", "content": "Describe an ominous forest path." }
{ "role": "assistant", "content": "Mist curls between gnarled trees..." }

Phase 5: Continuity & Canon Guard

After patch generation, run a validation pass:

Does NPC status contradict earlier references?

Are terms/names consistent?

If issues are detected → auto-generate a corrective patch.

Phase 6: Scaling & Experience

Streaming responses: live narration during play.

Mood filters: grimdark / heroic / comedic.

Pinned Lore: allow DM to pin specific NPCs, locations, or quests into context.

Sourcebook-grade output: PHB-style formatting, sidebars, stat blocks.