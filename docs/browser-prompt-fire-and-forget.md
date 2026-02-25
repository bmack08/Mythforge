# AUTONOMOUS TASK: Full Homebrewery Audit → Mythwright Feature Parity Fix

You are going to complete this entire task autonomously without asking me any questions. Work through every step sequentially. Do not stop, do not ask for confirmation, do not skip anything. I will be away and need this done when I return.

---

## STEP 1: Read the Homebrewery Source Code

Look in my project files for the `homebrewery-master` folder. Read the following thoroughly:

- ALL files in `themes/V3/` — especially the `5ePHB/` stylesheet and `Snippets/` folder
- ALL files in `themes/Legacy/` if it exists
- `client/homebrew/editor/` — how the editor works
- `client/homebrew/brewRenderer/` — how markdown renders to PHB style
- Any snippet definition files — these define every D&D block (monster stat blocks, notes, spell lists, class tables, cover pages, etc.)
- The core CSS that controls: page background/parchment texture, two-column layout, heading fonts and decorations, drop caps, ornamental dividers, stat block styling, note/callout boxes, table styling, page borders, footer/page numbers

From this, build a **complete master checklist** of every feature, snippet, CSS class, and visual behavior the Homebrewery supports. Save this checklist to a file. This is your reference for everything that follows.

---

## STEP 2: Audit the Live Homebrewery

Go to https://homebrewery.naturalcrit.com/ and click NEW to create a fresh brew.

Systematically test EVERY feature from your master checklist. At minimum, you must cover ALL of the following:

**Text & Typography:**
- Type `# Heading 1`, `## Heading 2`, `### Heading 3`, `#### Heading 4`, `##### Heading 5` — screenshot how each renders in the preview (font family, size, color, decorative underlines/flourishes)
- Bold, italic, bold-italic, strikethrough
- Body text font, size, color, line-height
- Drop caps (the large decorative first letter on pages)
- Blockquotes, code blocks, horizontal rules, links

**Page Layout:**
- Two-column layout (the default) — note the column gap, padding, page dimensions
- Page background (parchment texture)
- Page border decorations
- `\page` page breaks and `\column` column breaks
- `{{wide}}` wide blocks that span both columns
- Footer and page numbering
- Footnotes

**D&D Blocks — test every single one by inserting them from the BREW SNIPPETS or D&D Blocks menu:**
- Monster Stat Block (standard AND wide) — note every visual detail: red header bars, ability score row layout, red dividers between sections, background tint, fonts used, top/bottom decorative gradient bars
- Note / Callout Box — background color, border style, shadow
- Descriptive Text Box — italic text, tan background, border
- Spell List — formatting of cantrips, spell levels, spell names
- Class Feature and Class Table
- Cover Pages: Front Cover, Inside Cover, Back Cover, Part Cover
- Table of Contents / Auto-Table of Contents
- Watercolor Stain, Watermark, Artist Credit
- Magic Item, Spell block
- Index, Footnote, Page Number snippets
- Image insertion and positioning
- Ink Friendly mode, A4 page size snippet

**Tables:**
- Basic table rendering with PHB styling (dark header row, alternating row colors, border style)
- Table alignment options
- Tables inside stat blocks and notes

**Decorative Elements:**
- Red ornamental dividers in stat blocks
- Gold/brown dividers on normal pages
- H2 underline decorations/flourishes
- Stat block top/bottom gradient bars
- Note box styling details
- Bullet point styling

**Curly Bracket Syntax:**
- Test `{{monster,frame}}`, `{{note}}`, `{{descriptive}}`, `{{classTable,frame}}`, `{{wide}}`, `{{watermark}}`, `{{artist}}`, `{{frontCover}}`, `{{insideCover}}`, `{{backCover}}`, `{{partCover}}`, `{{spellList}}`, `{{toc}}`, `{{index}}`, `{{pageNumber}}`, `{{footnote}}`, and any other `{{ }}` blocks you found in the source code

**Editor UI:**
- Every toolbar button and what it does
- The BREW SNIPPETS menu — click through every single snippet
- IMAGES, TABLES, FONTS, PHB menus
- Keyboard shortcuts
- Live preview behavior

Screenshot and document everything. Save your findings.

---

## STEP 3: Audit Mythwright

Go to http://localhost:8081/

For EVERY feature you just tested on the Homebrewery, test the exact same thing on Mythwright. For each feature, record its status:

- ✅ WORKS — exists and looks identical to Homebrewery
- ⚠️ PARTIAL — exists but looks or behaves differently
- ❌ MISSING — does not exist at all
- 🐛 BROKEN — exists but errors or is non-functional

**Pay special attention to these known problem areas:**

1. **Heading styles in the TipTap editor** — Headings should look different from body text WHILE TYPING (not just in preview). In Homebrewery, H1/H2/H3 have distinct visual sizes and fonts in the editor. In our TipTap editor they might all look the same. This needs to be fixed.

2. **Monster stat block rendering** — Compare every detail: red bars, ability score row, dividers, fonts, background color, decorative elements.

3. **Page parchment background and border** — Are we showing the classic PHB parchment paper look?

4. **Two-column layout** — Is content flowing in two columns?

5. **Drop caps** — Is the first letter of sections rendered as a large decorative capital?

6. **D&D fonts** — Are we loading and using Bookinsanity (body), MrJeeves (headings), Scaly Sans (stat blocks), Nodesto Caps Condensed, Solbera Imitation, etc.?

7. **Ornamental dividers and decorations** — The red/gold horizontal flourishes between sections.

8. **Note/callout boxes** — Green/tan background, proper border, shadow.

9. **Table PHB styling** — Dark header, alternating rows, proper borders.

10. **Every toolbar button** — Does each one actually work and produce the correct output?

Build a full **comparison matrix** documenting every feature's status. Save this to a file.

---

## STEP 4: Fix Everything

Now fix every ⚠️ PARTIAL, ❌ MISSING, and 🐛 BROKEN issue you found. Work in this priority order:

**FIRST — Fix critical visual parity (stuff that's immediately obviously wrong):**
- Heading typography: make H1/H2/H3/H4/H5 use correct D&D fonts, sizes, colors, and decorative elements (underlines, flourishes) in BOTH the TipTap editor AND the preview pane
- Body text: correct font family (Bookinsanity), color (#1b1b1b), size, line-height
- Page background: parchment paper texture
- Page border: decorative PHB-style border
- Two-column layout: `column-count: 2` with proper gap
- Drop caps: large decorative first letter

**SECOND — Fix all D&D blocks:**
- Monster stat blocks (standard and wide) — achieve visual parity on every detail
- Note/callout boxes — correct background, border, shadow
- Descriptive text boxes
- Spell lists
- Class features and class tables
- Tables with PHB styling

**THIRD — Fix layout features:**
- Page breaks and column breaks
- Wide blocks
- Cover pages (all four types)
- Footer/page numbers
- Footnotes
- Table of contents

**FOURTH — Fix decorative elements:**
- All ornamental dividers (red for stat blocks, gold/brown for normal pages)
- Watercolor stains
- Watermarks
- Artist credits
- Image positioning support

**FIFTH — Fix editor experience:**
- All toolbar buttons working correctly
- Snippet insertion working for every D&D block type
- Keyboard shortcuts
- Live preview accuracy

**Implementation guidance for our TipTap/ProseMirror stack:**
- Extract exact CSS values from the Homebrewery source (hex colors, font names, pixel sizes, margins, padding) — do NOT guess
- For editor styling: add CSS rules targeting TipTap's rendered nodes (`.ProseMirror h1`, `.ProseMirror h2`, etc.) so headings look correct while editing
- For complex blocks like stat blocks: implement as TipTap NodeViews if needed
- Make sure all D&D fonts are loaded via @font-face declarations
- Port the Homebrewery's PHB stylesheet CSS into our theme files

---

## STEP 5: Verify

After applying all fixes:

1. Create a test document in Mythwright that uses every feature: all heading levels, a monster stat block, a spell list, a class table, a note box, a descriptive box, a table, cover pages, table of contents, footnotes, and watermarks
2. Screenshot the result
3. Compare visually against the Homebrewery rendering of the same content
4. If anything still doesn't match, fix it now
5. Save a final summary of what was fixed and anything that remains

---

## RULES FOR THIS SESSION

- Do NOT ask me any questions. Figure it out.
- Do NOT skip features because they seem minor. Every pixel matters.
- Do NOT guess at CSS values. Read them from the Homebrewery source code.
- Do NOT stop between phases. Complete all 5 steps.
- If you encounter an error, debug it and keep going.
- If a fix is complex, implement it anyway. Don't defer it.
- Save your audit documents, comparison matrix, and summary of changes as files I can review when I return.
- When in doubt about how something should look, the Homebrewery is the ground truth — match it exactly.
