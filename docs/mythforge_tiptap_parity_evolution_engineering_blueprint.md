# Mythforge (Tiptap) Parity & Evolution — Engineering Blueprint

> Purpose: Deliver a **complete, agent-friendly** task plan to bring Mythforge’s `tiptap` branch to *visual and behavioral parity* with Homebrewery **and** set the foundation for next‑gen features (AI, collaboration). This blueprint is written so Copilot/agents can execute safely with minimal drift.

**Homebrewery repo (local):**

- **Windows path:** `C:\Users\Neurasthetic\Documents\Mythforge V1\docs\homebrewery-master`

---

## 1) Goals & Constraints

- **Primary goal:** Same Markdown inputs should render with **Homebrewery‑quality output** (PHB look/feel) in Mythforge’s Tiptap editor and print/PDF.
- **Secondary goal:** Migrate legacy “brew markup” features into **typed Tiptap extensions** with stable DOM hooks.
- **Constraints:**
  - Keep **Tiptap JSON** the source of truth; support import/export to Markdown.
  - Preserve (or improve) print pagination and column behaviors.
  - Minimal churn outside of targeted files per task.

---

## 2) Architecture Map (12 Layers → Mythforge)

- **UI (React):** Editor + Preview panes; TipTapEditor component.
- **Markdown Parser:** Markdown ⇄ Tiptap JSON bridges (custom helpers).
- **Custom Brew Syntax:** Implemented as Tiptap nodes/marks + input rules.
- **Rendering Engine:** NodeViews/HTML output with PHB class hooks.
- **CSS/LESS Themes:** PHB/DMG styles; ensure classnames match.
- **Storage:** Save JSON (and optionally Markdown) to DB; autosave.
- **Server/API:** Express routes remain; expand to accept JSON.
- **Database:** Add `content_json`, `content_md`, `schema_version`.
- **Utilities:** Shortcuts, autosave, URL handling.
- **Build/Config:** Vite/Webpack, Babel/TS, ESLint.
- **Fonts & Assets:** PHB fonts, textures, emoji/images.
- **Print/Export:** Paged media CSS, PDF flow, page chrome.

---

## 3) Current Inventory (tiptap branch)

### 3.1 Custom Tiptap Extensions (present)

- **Block/Nodes:**
  - `PageBreak` — page break block
  - `ColumnBreak` — column break delimiter
  - `WideBlock` — wide content block
  - `QuoteBlock` — styled quotation block
  - `SidebarBlock` — side note block
  - `NoteBlock` — note/admonition block
  - `FootnoteBlock` — footnote container
  - `CoverBlock` — cover page block
  - `CreditsBlock` — credits block
  - `FeatureBlock` — D&D feature section
  - `MonsterBlock` — monster stat block
  - `ClassFeature` — class feature container
  - `Spell` — single spell entry
  - `SpellBlock` — grouped spells
  - `SpellList` — spell list section
  - `TableBlock` — custom table wrapper
  - `Icon` — inline icon node
  - `HeadingWithId` — heading node with slugified ids
- **Marks:**
  - `SpellMark`, `AbilityMark`, `SkillMark`, `ConditionMark`, `DamageMark`
- **Editor Setup (present):** `TipTapEditor.jsx`
- **Helpers (present):** `markdownToTiptap.js`, `tiptapToMarkdown.js`

> Note: Names are representative of actual files in `client/extensions/` and `client/components/`; exact filenames already validated separately.

### 3.2 Gaps vs Parity (high‑level)

- **Missing nodes/marks:** Header, Footer, PageNumber, ColumnContainer, Emoji, ImageWithAttributes, ItemCard, RollNode, StyleBlock, Dropcap, Tooltip, Reference, Color, FontFamily, TextAlign.
- **Likely DOM/classname drift:** Tables, headings, wide/column wrappers, page chrome hooks.

---

## 4) Global Conventions (Contracts)

1. **DOM class hooks (PHB family)**

   - Tables: wrapper `.phb-table`, table class `.phb table--compact` (or equivalent), header row class `.phb-table__head`.
   - Wide content: `.phb-wide`.
   - Columns: container `.phb-cols`, per‑count `.phb-col-2`, `.phb-col-3`.
   - Page chrome: `.phb-header`, `.phb-footer`, `.phb-page-number`.
   - Page breaks: `.phb-pagebreak`.
   - Headings: `.phb-h1`/`.phb-h2`/`.phb-h3` mapped from `<h1>`–`<h3>`.

2. **Extension attribute schema (typed)**

   - ColumnContainer: `{ count: number }`
   - ImageWithAttributes: `{ src: string, alt?: string, width?: string, marginLeft?: string, marginRight?: string, wrap?: 'left'|'right'|null }`
   - PageNumber: `{ value?: number, auto?: boolean }`
   - Icon/Emoji: `{ name: string, set?: 'fas'|'far'|'fab'|'ei' }`

3. **File layout**

   - `client/extensions/<Feature>.ts(x)` for each node/mark.
   - `themes/phb.less` consumes the class hooks above.
   - Tests under `__tests__/parity/**` and visual under `__visual__/goldens/**`.

---

## 5) Feature Map (Single Source of Truth)

Create `shared/featureMap.json` consumed by parser + renderer:

```json
{
  "wide": { "node": "wideBlock", "class": "phb-wide" },
  "column-count": { "node": "columnContainer", "attr": "count", "classBase": "phb-col" },
  "pagebreak": { "node": "pageBreak", "class": "phb-pagebreak" },
  "header": { "node": "header", "class": "phb-header" },
  "footer": { "node": "footer", "class": "phb-footer" },
  "pagenumber": { "node": "pageNumber", "class": "phb-page-number" },
  "emoji": { "mark": "emoji", "class": "phb-emoji" },
  "icon": { "mark": "iconMark", "class": "phb-icon" },
  "image-attrs": { "node": "imageWithAttributes", "class": "phb-image" },
  "table": { "node": "tableBlock", "wrapper": "phb-table" }
}
```

---

## 6) Parity Spec Template (per feature)

**Location:** `specs/parity/<feature>/`

- **Input Markdown:** Minimal, focused.
- **Expected Tiptap JSON:** Short JSON asserting node names/attrs.
- **Expected HTML:** Exact wrapper/classes; stable small snapshot.
- **Visual Golden:** PNG of expected render with PHB CSS.
- **Done Criteria:** Unit + visual tests pass; CSS hooks match.

**Example — Tables**

- `basic.md` — a 5‑column, 3‑row grid with header.
- `expected.json` — includes `tableBlock` wrapper.
- `expected.html` — contains `<div class="phb-table"><table class="phb table--compact">…`.
- `basic.png` — golden screenshot.

---

## 7) Testing Strategy (Error‑resistant)

1. **Unit & Snapshot (Jest)**

   - Markdown → JSON → HTML conversion for each fixture.
   - Assert DOM structure/class hooks precisely (string compare or small HTML snapshot per feature).
   - Round‑trip tests: JSON → Markdown → JSON for simple blocks.

2. **Visual Regression (Playwright)**

   - Render fixture in a minimal preview route (no app chrome).
   - Compare to golden with tiny tolerance (≤ 1%).

3. **CI gates**

   - Fail build on unit or visual regression failures.
   - ESLint/Prettier and type checks required.

---

## 8) Epics & Tasks (with Acceptance Criteria)

### **EPIC A — Table Parity** (highest impact)

**Goal:** PHB‑accurate tables (headers, zebra rows, spacing, rule lines, alignment columns).

**Tasks**

- A1: Update `TableBlock` to emit wrapper `<div class="phb-table">` and `<table class="phb table--compact">` elements.
- A2: Markdown bridge identifies first row as header → `<thead>`; emit align classes per column.
- A3: LESS in `themes/phb.less`: zebra striping, header bars, cell padding, thin rules.
- A4: Tests: `specs/parity/table/basic.md` + Jest snapshot + Playwright golden.

**Acceptance**

- Unit: HTML contains correct wrappers/classes; header maps to `<thead>`.
- Visual: ≤ 1% diff against golden.

---

### **EPIC B — Wide Block**

**Goal:** `{{wide}}` expands content to full page width as in PHB.

**Tasks**

- B1: Confirm `WideBlock` acts as wrapper or toggle for next block (decide spec; prefer explicit wrapper node).
- B2: Ensure class `.phb-wide` on wrapper; adjust PHB LESS for full‑bleed rules.
- B3: Fixtures + tests.

**Acceptance**

- Unit: HTML includes `.phb-wide` wrapper; no layout leaks.
- Visual: Render matches PHB wide example.

---

### **EPIC C — Columns**

**Goal:** Support `{column-count:n}` container plus `ColumnBreak`.

**Tasks**

- C1: New `ColumnContainer` node with `attrs.count` (2 default).
- C2: Markdown directive `{column-count:2}` → container node in JSON.
- C3: Render HTML with `.phb-cols.phb-col-2` on container, children flow inside; `ColumnBreak` splits children.
- C4: LESS for multi‑column gutters, balancing, widows/orphans tolerances.
- C5: Fixtures + tests for 2/3 columns and breaks.

**Acceptance**

- Unit: Correct classnames and structure.
- Visual: Text flows in columns with correct gutters.

---

### **EPIC D — Headings & IDs**

**Goal:** PHB‑style heading classes + stable anchors.

**Tasks**

- D1: Ensure `HeadingWithId` adds `.phb-h1/2/3` and unique slug ids.
- D2: LESS styles align with PHB typography.
- D3: Fixtures + tests.

**Acceptance**

- Unit: Headings have classes and ids; ids are slugified and stable.
- Visual: Typographic match.

---

### **EPIC E — Page Chrome** (Header, Footer, PageNumber)

**Goal:** Printable header/footer areas and page numbering.

**Tasks**

- E1: Implement `Header` and `Footer` nodes; render as fixed regions in paged media.
- E2: Implement `PageNumber` node: `{ value?: number, auto?: boolean }`.
- E3: Print CSS applies positions, fonts, and divider lines.
- E4: Fixtures: simple two‑page doc with header/footer and auto numbering.

**Acceptance**

- Unit: Nodes render with `.phb-header/.phb-footer/.phb-page-number`.
- Visual: Numbers increment; header/footer appear on every page.

---

### **EPIC F — Images with Attributes**

**Goal:** Support `{width:280px,margin-right:-3cm,wrapLeft}` after image.

**Tasks**

- F1: New `ImageWithAttributes` node with attrs (width, margins, wrap side).
- F2: Markdown bridge parses `{}` after `![alt](src)` to attrs.
- F3: Render `<img>` with inline style or mapped CSS classes; add `.wrapLeft/.wrapRight` classes.
- F4: Fixtures + tests for sizing and wrap behavior.

**Acceptance**

- Unit: Attrs parsed and applied.
- Visual: Text wrapping behaves as PHB.

---

### **EPIC G — Icons & Emoji**

**Goal:** Inline FA icons and emoji shortcodes like `:ei_barbarian_reckless_attack:`.

**Tasks**

- G1: Ensure `Icon`/`IconMark` supports `{ set: 'fas'|'far'|'fab', name: 'fa-sword' }` or equivalent.
- G2: New `Emoji` inline node/mark to map `:ei_...:` to `<img>` or `<i>` with sprite.
- G3: Fixtures + tests.

**Acceptance**

- Unit: Shortcodes convert to inline nodes properly.
- Visual: Icon/emoji align with text baseline and size.

---

### **EPIC H — Markdown Bridge (Import/Export)**

**Goal:** Stable import of legacy Markdown and reasonable export.

**Tasks**

- H1: Extend `markdownToTiptap` to recognize directives (`{{wide}}`, `{column-count:n}`, `{{footnote}}`, etc.) using `featureMap.json`.
- H2: Extend `tiptapToMarkdown` for best‑effort round‑trip.
- H3: Round‑trip tests for simple constructs; document non‑round‑trippable cases.

**Acceptance**

- Unit: Correct node creation and markdown serialization for supported features.

---

### **EPIC I — Print/PDF Polishing**

**Goal:** Paged media parity (widows/orphans, column balance, no content overlap).

**Tasks**

- I1: Fine‑tune print styles for margins, gutters, page backgrounds.
- I2: Ensure `PageBreak` and `ColumnBreak` are respected by print engine.
- I3: Add print‑only elements (e.g., continued rules) if desired.

**Acceptance**

- Visual: Multi‑page fixture prints without overlaps; margins correct.

---

### **EPIC J — Quality Gates**

**Goal:** Make changes safe to land.

**Tasks**

- J1: ESLint + Prettier enforced in pre‑commit.
- J2: Types (TS or JSDoc) for extension attrs to stop drift.
- J3: CI pipeline running unit + visual tests on PRs.

**Acceptance**

- CI blocks merge on failing tests or lint errors.

---

### **EPIC K — Future/Optional (AI hooks)**

- Node‑range aware commands (rewrite a block, insert stat block).
- Slash commands for “insert spell block”, etc.

---

## 9) Minimal Code Scaffolds (for agents)

**TableBlock (wrapper) — skeleton**

```ts
import { Node } from '@tiptap/core';

export const TableBlock = Node.create({
  name: 'tableBlock',
  group: 'block',
  content: 'table',
  parseHTML: () => [{ tag: 'div.phb-table' }],
  renderHTML() { return ['div', { class: 'phb-table' }, 0]; }
});
```

**ColumnContainer — skeleton**

```ts
import { Node } from '@tiptap/core';

export const ColumnContainer = Node.create({
  name: 'columnContainer',
  group: 'block',
  content: 'block+',
  addAttributes() { return { count: { default: 2 } }; },
  renderHTML({ HTMLAttributes }) {
    const count = HTMLAttributes.count ?? 2;
    return ['div', { class: `phb-cols phb-col-${count}` }, 0];
  }
});
```

**ImageWithAttributes — skeleton**

```ts
import { Node } from '@tiptap/core';

export const ImageWithAttributes = Node.create({
  name: 'imageWithAttributes', inline: true, group: 'inline', draggable: true,
  addAttributes() {
    return { src: {}, alt: { default: '' }, width: { default: null },
             marginLeft: { default: null }, marginRight: { default: null }, wrap: { default: null } };
  },
  renderHTML({ HTMLAttributes }) {
    const style = [
      HTMLAttributes.width ? `width:${HTMLAttributes.width}` : '',
      HTMLAttributes.marginLeft ? `margin-left:${HTMLAttributes.marginLeft}` : '',
      HTMLAttributes.marginRight ? `margin-right:${HTMLAttributes.marginRight}` : ''
    ].filter(Boolean).join(';');
    const cls = HTMLAttributes.wrap ? `wrap${HTMLAttributes.wrap[0].toUpperCase()}${HTMLAttributes.wrap.slice(1)}` : '';
    return ['img', { ...HTMLAttributes, class: ['phb-image', cls].filter(Boolean).join(' '), style }];
  }
});
```

**Playwright visual test — example**

```ts
import { test, expect } from '@playwright/test';

test('PHB table visual parity', async ({ page }) => {
  await page.goto('http://localhost:3000/preview?fixture=table/basic');
  const pageEl = page.locator('#preview-page');
  await expect(pageEl).toHaveScreenshot('table.basic.png', { maxDiffPixelRatio: 0.01 });
});
```

**Jest snapshot test — example**

```ts
import { toTiptapJSON, renderHTML } from './testUtils';

test('table basic', () => {
  const md = readFixture('specs/parity/table/basic.md');
  const json = toTiptapJSON(md);
  const html = renderHTML(json);
  expect(html).toContain('<div class="phb-table">');
  expect(html).toMatchSnapshot();
});
```

---

## 10) Copilot / Agent Work‑Order Template

**Title:**  parity

**Touch only:**&#x20;

**Do NOT touch:**&#x20;

**Contract:**

- Input fixture(s): `specs/parity/<feature>/*.md`
- Must output DOM with hooks:&#x20;
- Attr schema:&#x20;

**Acceptance:**

- Jest snapshots green
- Playwright visual diff ≤ 1%
- ESLint/Prettier clean

**Edge cases:**&#x20;

**Definition of Done:** All acceptance criteria met; no unrelated snapshot churn.

---

## 11) Initial Sprint Plan (2–3 days)

1. **Tables** (A1–A4) — biggest visual win.
2. **Wide** (B1–B3) — simple, prominent.
3. **Columns** (C1–C5) — layout foundation.
4. **Headings** (D1–D3) — typography polish.

Then proceed to **Page Chrome** (E1–E4) and **Images** (F1–F4).

---

## 12) Risk Register & Mitigations

- **CSS drift:** Lock DOM hooks via tests; snapshot per feature.
- **Markdown edge cases:** Keep fixtures small; document non‑round‑trippable cases.
- **Print glitches:** Use dedicated print fixtures; run local PDF checks.
- **Agent scope creep:** Strict task templates + file allow‑lists.

---

## 13) Project Definition of Done (overall)

- All parity fixtures pass unit + visual tests.
- All listed missing features implemented or intentionally deferred with docs.
- Print preview matches PHB style across tested fixtures.
- CI protects main; lint/type clean.

---

### Appendices

**A) Missing Extensions To Implement**

- Header, Footer, PageNumber
- ColumnContainer
- Emoji
- ImageWithAttributes
- ItemCard
- RollNode
- StyleBlock
- Dropcap, Tooltip, Reference
- Color, FontFamily, TextAlign

\*\*B) Minimal CSS hooks to add/confirm in \*\*``

- `.phb-table`, `.phb table--compact`
- `.phb-wide`
- `.phb-cols`, `.phb-col-2`, `.phb-col-3`
- `.phb-header`, `.phb-footer`, `.phb-page-number`
- `.phb-pagebreak`
- `.phb-h1`, `.phb-h2`, `.phb-h3`

**C) Fixtures to author first**

- `table/basic.md`, `table/complex.md`
- `wide/basic.md`
- `columns/two.md`, `columns/three.md`, `columns/mix-breaks.md`
- `headings/basic.md`
- `pagechrome/basic.md`
- `images/attrs.md`
- `icons-emoji/basic.md`

This document is the **canonical blueprint** for Copilot/agents and human reviewers. Use it as the single source of truth for tasks, tests, and acceptance.

