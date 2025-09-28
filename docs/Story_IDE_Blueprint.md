TaleForge Story IDE — Architecture & Implementation Blueprint

Purpose
Make the in-editor assistant act like a Story IDE (Cursor-style): it reads your draft + themes + reference books, then proposes patches (diffs) you can accept—without forcing full-document JSON. It also learns and applies WotC-style sourcebook conventions.

0) Outcomes (what this blueprint delivers)

Deep context: Assistant reads the active brew, themes (tokens like {{frontCover}}, statblock snippets), and WotC reference style rules derived from The C:\Users\Neurasthetic\Documents\homebrewery-master\docs\sourcebooks PDFs and  improved fantasy dialog styles of writing from C:\Users\Neurasthetic\Documents\homebrewery-master\docs\Dialogs-20250811T204535Z-1-001. 


Cursor-style edits: Assistant replies with a patch (unified diff) for changed files plus a short explanation. You preview and Apply.

No forced JSON for content: Only a tiny wrapper (2 keys) is structured; the patch body is raw text in a code fence (like Cursor).

\page safe: We never parse the patch body as JSON—no escaping crashes.

1) Data Model & Context
1.1 Sources the assistant can see

Active document (left editor Markdown).

Themes directory (token/section macros and examples): themes/**.

Reference set (style exemplars): your PDFs and dialogs, split into style notes (not copyrighted text; we extract layout patterns, headings, statblock layout, callout styles, tables). 



1.2 Preprocessing (one-time tasks)

Extract theme tokens: Scan themes/** for:

mustache-like tokens ({{frontCover}}, {{frontCoverBottomBanner}}, {{logo}}),

reusable sections (front matter skeletons, statblock snippets).

Build a themes.index.json with { token, filePath, exampleUsage, notes }.

Style rulebook from PDFs (no copyrighted text):

Parse PDFs to plain text and capture format rules only (e.g., “H1 ALL CAPS; small caps subtitle; two-column layout; boxed callouts for ‘Adventure Hooks’ ”, stat block field ordering, table borders, bullet list conventions).

Persist to style/wotc.rules.json (pure guidelines, no verbatim content).

This creates a Style & Theme Context Pack that can be injected into prompts without bloating tokens.

2) Prompting Contract (no giant JSON)
2.1 System prompt (role & rules)

Use once per request:

You are TaleForge Story IDE, an in-editor assistant for Homebrewery-based D&D sourcebooks.

Objectives
- Read the user’s draft and the Style & Theme Context Pack.
- Answer questions deeply (analysis).
- When asked to create or edit content, propose a patch (unified diff) that applies the change.
- Preserve Homebrewery tokens (e.g., {{frontCover}}) and commands like \page.
- Follow WotC-style conventions from the style rules (headings, stat blocks, callouts, tables).

Output Modes
1) chat: A short explanation only.
2) patch: A unified diff inside a fenced code block.
   - Use file path headers where relevant (primary file is the active document).
   - Keep patches minimal and apply cleanly.

Rules
- Never wrap patches in JSON; emit them as raw fenced text.
- Do not include copyrighted book text; use original wording while following the style rules.
- When inserting stat blocks, use the standard field order and typography conventions from the style rules.
- Make patches idempotent and conflict-aware (use @@ context hunks).

2.2 Response shape (tiny, non-breaking)

chat only:

[MODE: chat]
<short helpful message>


patch:

[MODE: patch]
<1-3 bullet points explaining the change>

```diff
--- a/client/brew.md            # or '--- a/ACTIVE.md' if single file
+++ b/client/brew.md
@@ -12,6 +12,15 @@
+\page
+## Chapter 3: Into the Gloaming
+*A one-session crawl for 3rd-level characters*
+
+**Adventure Hooks**
+- …
+- …
+


Why this works: the only “structure” is the [MODE: …] header string. The diff body is raw text—no JSON—so \page passes through safely.

3) Backend Orchestration
3.1 Build the Context Pack

On each request:

Active doc slice: first 3–4k + last 2k chars.

Theme index: short rendered summary of available tokens & snippets.

Style rules: compact bullets from style/wotc.rules.json (e.g., “H2 = ## Title Case; stat block order: AC → HP → Speed → STR..CHA → Saves → Skills → Senses → Languages → Challenge; boxed callouts style: bold title + colon, bullets.”)

Chat history: last 8–10 turns.

Send as:

[DOCUMENT CONTEXT]
<doc head/tail>

[THEMES]
<token list: {{frontCover}}, {{frontCoverBottomBanner}}, {{logo}}, … >
<examples: short fragment showing usage>

[STYLE RULES]
- Heading levels and typography
- Stat block field order
- Callout blocks format
- Tables and lists conventions
- Cover/Front matter structure

[USER MESSAGE]
<the prompt>

3.2 API call (model-agnostic)

Model: gpt-4.1 / gpt-4.1-mini (or your chosen backend).

Temperature: 0.4–0.7

Max tokens: ≥ 1500 (room for patch)

No response_format JSON. We parse the [MODE: …] header and treat the rest as text.

3.3 Parser (robust and simple)

Detect first line:

If it starts with [MODE: patch] → find the first fenced ```diff block.

Do not JSON.parse.

Extract diff body as-is.

Optionally support patch or unified.

If [MODE: chat] → show the explanation, no changes.

Apply: Use a small unified-diff applier (e.g., diff-apply, git-apply-lite, or a tiny custom hunk applier) to patch the active document.

If patch fails (conflict), show a merge UI with the hunk.

This removes the brittle \page escaping and the “code fence JSON” problem you saw.

4) Frontend (Cursor-style UX)

Chat panel shows either:

A short message (analysis), or

A Diff preview with hunks you can accept/reject (per hunk or all-at-once).

Accept → apply patch to editor buffer (left pane), keep cursor position when possible.

History: Save applied patches as entries (undo support).

5) Stat Blocks & WotC Style
5.1 Stat block generator contract

When asked to “add a CR 6 creature stat block,” the assistant should insert:

**<Creature Name>**  
*Medium humanoid (elf), neutral good*  
**Armor Class** …  
**Hit Points** …  
**Speed** …  

| STR | DEX | CON | INT | WIS | CHA |
|-----|-----|-----|-----|-----|-----|
| …   | …   | …   | …   | …   | …   |

**Saving Throws** …  
**Skills** …  
**Senses** …  
**Languages** …  
**Challenge** 6 (2,300 XP)

**Traits:**  
- **Feature (uses/Recharge):** …

**Actions:**  
- **Attack Name.** …

\page


(Adjust exact ordering/labels based on your extracted style rules from the sourcebook PDFs set. The guide encodes format order not copyrighted text.) 


5.2 Theme token usage

The assistant must prefer your tokens/macros when constructing covers, banners, or standard sections:

{{frontCover}} … {{/frontCover}}

{{logo}}, {{frontCoverBottomBanner}}, etc.

Teach it by including examples from themes/** in the Context Pack.

6) Commands your users can say (and what the IDE returns)

“Create a 3-chapter one-shot using the dnd sourcebook style; include front cover, ToC, 3 chapters, and an appendix of 3 stat blocks.”
→ [MODE: patch] unified diff adding cover, \page, chapter headers, ToC, and stat blocks formatted per style rules.

“Change the title to Evil King and regenerate the front cover section.”
→ Patch touching only the title/front-matter hunks.

“Insert a page break after Chapter 2 summary.”
→ Patch with \page added at the right spot.

“Convert tavern NPC into full WotC-style stat block.”
→ Patch replacing/inserting a canonical stat block structure.

7) Implementation Steps (checklist)

Create Context Pack builders

scripts/buildThemeIndex.ts → themes.index.json

scripts/extractStyleRules.ts from  PDFs → style/wotc.rules.json (layout rules only). 


Server route /api/story-ide

Accept { message, documentText, chatHistory }.

Construct Context Pack (doc slice + themes summary + style rules + chat history).

Call LLM with system prompt (Section 2.1) + Context Pack + user message.

Parser

Read first header line → [MODE: chat] or [MODE: patch].

If patch: extract fenced ```diff block. Do not JSON.parse.

Diff Applier

Use a small unified diff library or write ~100-line hunk applier.

On conflict → show merge UI; otherwise apply to the left editor buffer.

UI

Chat panel → shows explanation + diff preview with accept buttons.

“Apply All” / “Apply Hunk” / “Dismiss”.

Regression tests

\page must survive round-trip.

Token preservation ({{frontCover}}, etc.).

Large doc slice still produces targeted, minimal patches.

Telemetry

Log patch sizes, hunk failure rates, and tokens used.

8) Safety & Legal Notes

Do not store or emit copyrighted text from the PDFs; only keep formatting rules and layout conventions derived from them. The style rule JSON should be human-written summaries like “callout blocks use a bold title followed by bullets,” not book text.

Keep a switch to disable reference ingestion if a user uploads third-party material.

9) Example End-to-End Exchange

User: “Make this a 3-chapter one-shot . Add a front cover and ToC, then a page break before Chapter 1.”
Assistant returns:

[MODE: patch]
- Added front cover using theme tokens
- Inserted ToC
- Structured Chapters 1–3 per style rules
- Added \page before Chapter 1

```diff
--- a/ACTIVE.md
+++ b/ACTIVE.md
@@ -1,3 +1,22 @@
+{{frontCover}}
+# EVIL QUEEN
+## A dark-fantasy Adventure for 3rd-Level Characters
+*An adventure for 3 sessions designed for 4 players*
+
+{{logo}}
+{{frontCoverBottomBanner}}
+{{/frontCover}}
+
+\page
+{{wide,toc}}
+# Table of Contents
+- **Chapter 1:** …
+- **Chapter 2:** …
+- **Chapter 3:** …
+
+\page
+## Chapter 1: The Prancing Pony
+*Hook text…*
 …


---

## 10) Why this matches your 2 goals

1) **Understands themes + WotC style**  
   - We *ingest themes* and *derive style rules from dnd sourcebooks* into a compact Context Pack used by every request, so the assistant always knows your tokens and conventions. :contentReference[oaicite:13]{index=13} :contentReference[oaicite:14]{index=14} :contentReference[oaicite:15]{index=15} :contentReference[oaicite:16]{index=16}

2) **Cursor-like editing (no forced JSON)**  
   - We switch to a **patch protocol** (unified diff in a fenced block) with a tiny `[MODE: …]` header. Your backend never JSON-parses the content, so `\page` and all markdown pass through safely, and you can accept patches just like in Cursor.

> I’m 95% confident this is exactly what you’re asking for: a Story IDE that (a) *knows your themes and style rules* while writing D&D sourcebooks and (b) *works like Cursor*, proposing diffs you can accept—without JSON constraints on content.

---

### Appendix A — Minimal server pseudo-code

```ts
// POST /api/story-ide
const { message, documentText, chatHistory } = req.body;

const ctx = buildContextPack({
  doc: sliceDoc(documentText, 4000, 2000),
  themes: loadThemeSummary('themes.index.json'),
  style: loadStyleRules('style/wotc.rules.json'),
  history: chatHistory.slice(-10)
});

const systemPrompt = readFile('prompts/story_ide_system.txt');

const llmInput = `
[DOCUMENT CONTEXT]
${ctx.doc}

[THEMES]
${ctx.themes}

[STYLE RULES]
${ctx.style}

[CHAT HISTORY]
${formatHistory(ctx.history)}

[USER MESSAGE]
${message}
`;

const completion = await llm.chat({ system: systemPrompt, user: llmInput, maxTokens: 1800, temperature: 0.5 });

const { mode, patch } = parseModeAndPatch(completion.text); // looks for [MODE: patch] and ```diff...
if (mode === 'patch' && patch) {
  res.json({ mode, patch, explanation: extractBullets(completion.text) });
} else {
  res.json({ mode: 'chat', message: completion.text });
}






IMPORTANT

Bootstrap: Auto-Create/Refresh style/wotc.rules.json

Goal: The agent must derive formatting/style rules (not copyrighted text) from local sources and write them to style/wotc.rules.json.

Sources to read:

C:\Users\Neurasthetic\Documents\homebrewery-master\docs\sourcebooks

C:\Users\Neurasthetic\Documents\homebrewery-master\docs\Dialogs-20250811T204535Z-1-001

C:\Users\Neurasthetic\Documents\homebrewery-master\themes

this has been said in above text but i wnat it to be clear. 