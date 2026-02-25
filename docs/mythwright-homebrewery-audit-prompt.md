# 🧪 FULL HOMEBREWERY AUDIT → MYTHWRIGHT FEATURE PARITY FIX PROMPT

> **Purpose:** Claude will exhaustively audit every feature of The Homebrewery (https://homebrewery.naturalcrit.com/), document how each feature works, then compare against the Mythwright/TaleForge app (localhost:8081) and fix EVERY discrepancy until we have full feature parity.

---

## PHASE 1: LEARN THE HOMEBREWERY CODEBASE (LOCAL FILES FIRST)

Before touching the browser, read the Homebrewery source code so you understand the full scope of what we're replicating.

### Step 1A — Read the Homebrewery source

Look in the project files for a folder called `homebrewery-master` (or similar). Read these files thoroughly:

- `README.md` — overview of the project
- `client/homebrewery/pages/homePage/` — the main demo/landing page content
- `client/homebrew/editor/` — how the editor works
- `client/homebrew/brewRenderer/` — how markdown is rendered to PHB style
- `themes/` — all theme CSS files (V3 theme, Legacy theme, PHB theme)
- `themes/V3/Snippets/` — EVERY snippet definition (these are the D&D blocks)
- `themes/V3/5ePHB/` — the core PHB stylesheet
- `client/homebrew/brewRenderer/markdownLexer.js` or equivalent — custom markdown extensions
- Any file related to: `snippets`, `mustache`, `curly bracket syntax`, `markdown-it` plugins, custom renderers

**Create a master checklist** of every feature, snippet, CSS class, and rendering behavior you find. Do NOT proceed until you have this list.

### Step 1B — Read the Homebrewery Snippet Definitions

Specifically catalog every single snippet available in the "BREW SNIPPETS" menu. For each one, document:
- The snippet name
- The markdown/syntax it inserts
- What it renders as (visual result)
- Any CSS classes involved

---

## PHASE 2: EXHAUSTIVE LIVE FEATURE AUDIT ON HOMEBREWERY.NATURALCRIT.COM

Go to https://homebrewery.naturalcrit.com/ and click "NEW" to create a fresh brew. Then systematically test EVERY feature below. Do not skip anything.

### 2.1 — TOOLBAR & EDITOR CHROME

Test and document:
- **H1 / H2 / H3 heading buttons** — do they insert markdown `#`, `##`, `###`? How do they render visually (font, size, weight, color, decorative elements)?
- **Bold / Italic / Strikethrough** buttons
- **Ordered list / Unordered list** buttons
- **Page break** button/insertion
- **Column break** button/insertion
- **Wide block** toggle
- **D&D Blocks dropdown** — click it and test EVERY single option:
  - Monster Stat Block
  - Wide Monster Stat Block
  - Front Cover Page
  - Inside Cover Page
  - Back Cover Page
  - Part Cover Page
  - Spell List
  - Class Feature
  - Note / Callout Box
  - Descriptive Text Box
  - Artist Credit
  - Watercolor Splash
  - Watermark
  - Table of Contents
  - Auto-generated Table of Contents
  - Index
  - Footer
  - ANY other block type listed
- **Table** insertion button
- **Image** insertion button
- **Link** insertion
- **Comment/annotation** syntax
- **Line/horizontal rule** insertion
- **Page numbering** syntax
- **Footnote** syntax
- **Column count / layout** controls
- **Numbered heading** button in toolbar

### 2.2 — MARKDOWN RENDERING (Text Formatting)

In the editor, type and verify each renders correctly in the preview pane:

- `# Heading 1` — renders as large decorated PHB-style heading with ornamental flourishes
- `## Heading 2` — renders as medium PHB heading with underline decoration
- `### Heading 3` — renders as small PHB heading (italic serif)
- `#### Heading 4` — renders correctly
- `##### Heading 5` — renders correctly
- **Bold** (`**text**`) — proper font weight
- *Italic* (`*text*`) — proper italic style
- ***Bold Italic*** (`***text***`)
- ~~Strikethrough~~ (`~~text~~`)
- `Inline code` backticks
- Code blocks (triple backtick)
- Blockquotes (`>`)
- Nested blockquotes (`>>`)
- Horizontal rules (`---`, `***`, `___`)
- Links `[text](url)`
- Images `![alt](url)`
- Superscript / subscript if supported
- Line breaks (double space, `\`, `<br>`)
- Paragraph spacing and indentation

### 2.3 — TABLES

- Basic markdown table rendering
- Table alignment (`:---`, `:---:`, `---:`)
- Table header styling (bold, background color)
- Table border styling
- Table row alternating colors (zebra striping)
- Wide tables
- Tables inside columns
- Tables inside stat blocks

### 2.4 — D&D SPECIFIC BLOCKS (Test EVERY one)

#### Monster Stat Block
- Red/maroon header bar with creature name
- Size, type, alignment line (italic)
- Armor Class, Hit Points, Speed section with red divider lines
- Ability scores row (STR, DEX, CON, INT, WIS, CHA) with values and modifiers
- Properties section (Saving Throws, Skills, Damage Resistances, Senses, Languages, Challenge Rating)
- Traits section with bold trait names
- Actions header with red decorative divider
- Action entries with bold names and italic attack info
- Reactions section
- Legendary Actions section
- Lair Actions section
- Mythic Actions section
- Red/orange decorative top and bottom bars
- Proper stat block background (cream/parchment tint)
- Wide stat block variant (spans two columns)

#### Spell List
- Cantrip listing format
- Spell level headers (1st level, 2nd level, etc.)
- Spell name formatting (italic)
- Spell slot notation
- Proper indentation and spacing

#### Class Feature Block
- Feature name as header
- Description text
- Sub-feature indentation
- Table integration within features

#### Note / Callout Box
- Green/tan background tint
- Decorative border styling
- Title styling within the note
- Text formatting inside notes
- Shadow/depth effect

#### Descriptive Text Box
- Italic text styling
- Tan/cream background
- Border styling
- Proper padding and margins

#### Cover Pages
- **Front Cover**: Full-page image background, title overlay, subtitle, author credits
- **Inside Cover**: Proper layout and styling
- **Back Cover**: Proper layout and styling
- **Part Cover Page**: Section divider page with part number and title

#### Artist Credit
- Positioning (absolute, bottom of page)
- Font styling (small, credits format)

#### Watercolor Splash
- Image overlay behavior
- Blending mode
- Positioning options

#### Watermark
- Diagonal text watermark across page
- Opacity and font size
- Positioning

### 2.5 — PAGE LAYOUT & STRUCTURE

- **Two-column layout** — default PHB layout with proper column gap
- **Single column / wide blocks** — `{{wide}}` syntax
- **Page breaks** — `\page` or `{{pagebreak}}` creating new pages
- **Column breaks** — `\column` or `{{columnbreak}}`
- **Page dimensions** — Letter size (8.5" × 11")
- **Page background** — Parchment/stained paper texture
- **Page border** — Decorative PHB page border
- **Footer** with page numbers
- **Footnotes** rendering at bottom of page
- **Multi-page documents** — scrolling between pages in preview
- **Content overflow** — what happens when content exceeds a page?

### 2.6 — TYPOGRAPHY & FONTS

- Body text font (Bookinsanity or equivalent serif)
- Heading fonts:
  - H1: MrJeeves or similar (large, decorative)
  - H2: MrJeeves with underline decoration
  - H3: MrJeeves italic
  - H4+: appropriate hierarchy
- Stat block fonts (specific to monster blocks)
- Table of Contents font
- Drop cap / initial letter styling (the large first letter on pages/sections)
- Font sizes at each heading level
- Line height and letter spacing
- Font colors (body text is dark brown/black, not pure black)

### 2.7 — IMAGES & MEDIA

- Inline images via markdown
- Image positioning with CSS: `{position:absolute,top:Xpx,left:Xpx}`
- Image sizing: `{width:Xpx,height:Xpx}`
- Image as page background
- Watercolor stain overlays
- Image blending modes
- Image float left/right

### 2.8 — CURLY BRACKET / MUSTACHE SYNTAX (V3 Renderer)

This is CRITICAL — The Homebrewery V3 uses `{{ }}` syntax for special blocks. Test ALL of them:

- `{{monster,frame}}` — monster stat block
- `{{monster,frame,wide}}` — wide monster stat block
- `{{classTable,frame}}` — class table
- `{{classTable,frame,wide}}` — wide class table
- `{{spellList}}` — spell list block
- `{{note}}` — note/callout block
- `{{descriptive}}` — descriptive text block
- `{{wide}}` — wide content block
- `{{watercolor,top:Xpx,left:Xpx}}` — watercolor positioning
- `{{watermark TEXT}}` — watermark
- `{{artist,top:Xpx,left:Xpx}}` — artist credit
- `{{toc}}` or `{{tableOfContents}}` — table of contents
- `{{frontCover}}` — front cover page
- `{{insideCover}}` — inside cover
- `{{backCover}}` — back cover
- `{{partCover}}` — part cover
- `{{pageNumber X}}` — manual page number
- `{{footnote TEXT}}` — footnote
- `{{imageMaskEdgeN}}` — image masks
- `{{index}}` — index generation
- `\page` — page break
- `\column` — column break
- Nested curly bracket blocks
- Custom CSS classes via curly brackets

### 2.9 — CSS CUSTOMIZATION

- Inline styles via curly bracket syntax
- Custom CSS injection (style blocks)
- Theme-level CSS variables
- Class-based styling on elements

### 2.10 — DECORATIVE ELEMENTS

- **Red ornamental dividers** (the horizontal red/gold lines between sections in stat blocks)
- **Gold/brown ornamental dividers** (between sections on normal pages)
- **Drop caps** (large initial letter on first paragraph of a page/section)
- **Page border decorations** (the subtle frame around each page)
- **Header underline decorations** (the line/flourish under H2 headings)
- **Stat block top/bottom bars** (the red gradient bars)
- **Note box corner decorations**
- **Table header styling** (the dark header row)
- **Bullet point styling** (custom bullets vs standard)

### 2.11 — NAVIGATION & UI

- **Preview pane** — live updating as you type
- **Split view** — editor left, preview right
- **Zoom controls** on preview
- **Page navigation** in preview (page 1 of N, arrows)
- **Text Editor / Properties tabs**
- **NEW button** — creates new brew
- **RECENT BREWS** button
- **VAULT** button
- **NEED HELP?** dropdown
- **GET PDF** — PDF export
- **Sharing** — share link generation
- **Collaboration** features
- **Settings** — any settings/preferences
- **BREW SNIPPETS** menu — every single snippet available
- **IMAGES** menu
- **TABLES** menu
- **FONTS** menu
- **PHB** reference menu
- **Keyboard shortcuts** — Ctrl+B, Ctrl+I, Ctrl+S, etc.

### 2.12 — PRINT / PDF FEATURES

- Print dialog behavior
- Page size options
- Background images in print
- Color accuracy in print
- Ink-friendly mode
- A4 vs Letter paper size handling

### 2.13 — BREW SNIPPETS MENU (Exhaustive)

Click BREW SNIPPETS in the toolbar and document EVERY snippet category and individual snippet:

**PHB-Style Snippets:**
- Column Break
- New Page
- Vertical Spacing
- Wide Block
- QR Code
- Monster Stat Block (basic)
- Monster Stat Block (full/extended)
- Wide Monster Stat Block
- Front Cover Page
- Inside Cover Page
- Part Cover Page
- Back Cover Page
- Magic Item
- Spell
- Spell List
- Class Feature
- Class Table
- Sub Class Feature
- Note
- Descriptive Text Box
- Watercolor Stain
- Watermark
- Artist Credit
- Auto-Table of Contents
- Table of Contents
- Index
- Footnote
- Page Number
- Image
- Background Image
- Ink Friendly
- A4 Page Size

**PLUS any additional snippets** — click through every single one and document it.

---

## PHASE 3: AUDIT MYTHWRIGHT (localhost:8081)

Now go to http://localhost:8081 and perform the exact same audit. For EVERY feature from Phase 2, test it in Mythwright and record:

- ✅ **WORKS** — feature exists and renders identically to Homebrewery
- ⚠️ **PARTIAL** — feature exists but has visual/functional differences
- ❌ **MISSING** — feature does not exist at all
- 🐛 **BROKEN** — feature exists but is broken/errors

### 3.1 — Critical Known Issues to Check First

These are issues we already know about. Verify and fix:

1. **Headings don't have visual styling in the editor** — In Homebrewery, H1/H2/H3 show different sizes and fonts in the editor AND preview. In our TipTap editor, headings may all look the same or not reflect the PHB typography.

2. **Monster stat blocks** — Compare our monster block rendering pixel-by-pixel against Homebrewery. Check:
   - Red header bars present?
   - Ability score row layout correct?
   - Red divider lines between sections?
   - Correct fonts?
   - Correct background tint?
   - Top/bottom decorative bars?

3. **Page layout** — Are we rendering two-column layout? Page backgrounds? Page borders?

4. **Decorative elements** — Drop caps, ornamental dividers, heading decorations?

5. **Typography** — Are we using the correct D&D fonts (Bookinsanity, MrJeeves, Scaly Sans, Scaly Sans Caps, Scaly Sans Bold Caps, Solbera Imitation, Nodesto Caps Condensed)?

6. **Note/callout boxes** — Correct background, border, shadow?

7. **Table styling** — PHB-style table headers, borders, alternating rows?

8. **Column/page breaks** — Do they work?

9. **Live preview** — Does the preview pane update in real time?

10. **All toolbar buttons** — Does every button in our toolbar work correctly?

### 3.2 — Full Feature Comparison Matrix

Create a detailed comparison document structured like this:

```
| Feature | Homebrewery Behavior | Mythwright Behavior | Status | Fix Priority |
|---------|---------------------|---------------------|--------|-------------|
| H1 Heading | MrJeeves ~28px dark brown, decorative | ??? | ❌/⚠️/✅ | P0/P1/P2 |
| H2 Heading | MrJeeves with underline flourish | ??? | ❌/⚠️/✅ | P0/P1/P2 |
| Monster Block | Full red bars, ability row, etc. | ??? | ❌/⚠️/✅ | P1 |
| ... every feature ... |
```

---

## PHASE 4: FIX EVERYTHING

For every ⚠️ PARTIAL, ❌ MISSING, or 🐛 BROKEN item, implement the fix in our codebase.

### Fix Priority Order:

**P0 — Critical Visual Parity** (things that immediately look wrong)
- Heading typography (fonts, sizes, colors, decorations)
- Page background (parchment texture)
- Page border decorations
- Two-column layout
- Drop caps
- Body text font and color

**P1 — Core D&D Blocks**
- Monster stat blocks (complete visual parity)
- Note/callout boxes
- Descriptive text boxes
- Tables (PHB styling)
- Spell lists
- Class features/tables

**P2 — Layout & Structure**
- Page breaks
- Column breaks
- Wide blocks
- Cover pages (front, back, inside, part)
- Footer/page numbers
- Footnotes
- Table of contents

**P3 — Decorative Polish**
- All ornamental dividers
- Watercolor stains
- Watermarks
- Artist credits
- Image positioning
- Custom CSS support

**P4 — Editor Experience**
- Toolbar functionality parity
- Snippet insertion system
- Keyboard shortcuts
- Live preview accuracy
- Editor heading visual feedback (WYSIWYG hints in TipTap)

### Implementation Notes for TipTap/ProseMirror:

When fixing issues, keep in mind our stack:
- **Editor:** TipTap (built on ProseMirror)
- **Rendering:** The preview/output should match Homebrewery's PHB CSS exactly
- **Key files to modify:** Look at our component files for the editor, the preview renderer, the CSS/SCSS theme files, and the TipTap extensions/plugins

For each fix:
1. Identify the exact CSS from Homebrewery that creates the visual effect
2. Find the corresponding component/style in our codebase
3. Port the CSS/rendering logic
4. Verify in the preview that it matches

### CSS/Font Parity Checklist:

Our CSS must include or replicate:
- `@font-face` declarations for: Bookinsanity, MrJeeves, Scaly Sans, Scaly Sans Caps, Scaly Sans Bold Caps, Solbera Imitation, Nodesto Caps Condensed
- PHB body text styles: `font-family: Bookinsanity; color: #1b1b1b; font-size: 0.34cm; line-height: 1.3em;`
- Parchment background image/texture on pages
- Column layout: `column-count: 2; column-gap: 0.9cm; column-fill: auto;`
- Page dimensions: `width: 8.5in; height: 11in; padding: 1.4cm 1.2cm;`
- Heading styles with exact font families, sizes, margins, and decorative pseudo-elements
- Stat block red color scheme (`#922610` or similar)
- Note box green/tan scheme
- All decorative `::before` and `::after` pseudo-elements on headings, dividers, stat blocks

---

## PHASE 5: VERIFICATION

After all fixes:

1. Create a **test brew** in Homebrewery that uses EVERY feature (all heading levels, a monster stat block, a spell list, a class table, a note, a descriptive box, tables, images, cover pages, table of contents, footnotes, watermarks, etc.)

2. Create the **exact same content** in Mythwright

3. Screenshot both side-by-side and verify visual parity

4. Document any remaining differences

---

## IMPORTANT REMINDERS

- **Do NOT skip features because they seem minor.** Things like the exact shade of red on a stat block divider, the precise font weight on a heading, or the subtle shadow on a note box — ALL of these matter for full parity.
- **Read the Homebrewery source CSS** — don't guess at values. Extract exact hex colors, pixel sizes, font names, etc.
- **Test in the browser** — render both side by side and compare visually.
- **Our app uses TipTap/ProseMirror** — some features that Homebrewery implements via markdown parsing, we'll need to implement as TipTap extensions, node views, or plugins. Think about the TipTap equivalent for each Homebrewery feature.
- **The homebrewery-master folder in our project files** has the complete source code — use it as the ground truth for how features should work and look.
- **If you find a feature in Homebrewery that isn't on this audit list, ADD IT and test it.** This list is comprehensive but Homebrewery may have features we haven't thought of.
- **For TipTap editor styling**: Headings, bold, italic etc. should be visually styled IN the editor (not just in preview). Users need WYSIWYG feedback while typing. Use TipTap's editor CSS to style `h1`, `h2`, `h3` nodes with appropriate D&D fonts and sizes so they look different from body text while editing.
- **For complex blocks like stat blocks**: Consider implementing these as TipTap NodeViews that render the full styled block inline in the editor, not just in the preview pane.

---

## OUTPUT EXPECTED

At the end of this session, deliver:

1. **Complete Feature Audit Document** — every Homebrewery feature documented with how it works
2. **Comparison Matrix** — every feature compared between Homebrewery and Mythwright with status
3. **All code fixes applied** to achieve feature parity
4. **Verification screenshots** showing parity achieved
5. **List of any remaining items** that need future work with explanation of what's left and why
