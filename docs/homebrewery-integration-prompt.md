## Homebrewery-Integrated Sourcebook Builder — Product + Build Prompt

This document is a single prompt/spec you can hand to a developer or an AI coding agent to (re)build this app from scratch. The core change: the editing experience is provided by the Homebrewery editor itself (MIT-licensed) embedded in our Next.js app, while our AI pipeline, project/TOC management, storage, and export features wrap around it.

### Goals
- **Editing**: Use the Homebrewery editor and renderer as the sole editing UI (V3 renderer by default; support Legacy). Keep its UX and keyboard behavior.
- **Projects/TOC**: Provide project structure and a Table of Contents (TOC) panel that organizes content into chapters/sections and can load/save to the Homebrewery “brew” (text/style/snippets).
- **AI Pipeline**: Keep our AI generators/refiners that output valid Homebrewery V3 markdown. Users can insert/generated content into the active brew at the cursor or at a section anchor.
- **Export**: Render using the embedded Homebrewery renderer; export to HTML/PDF.
- **Storage/Versioning**: Persist brews (text/style/snippets) per project with autosave + version history.

### Non-Goals
- Rewriting the Homebrewery UI. We embed it with minimal surface changes (routing, save/load, toolbar additions).
- Building a generic rich-text editor. Markdown remains the source of truth.

---

## High-Level Architecture

- App shell: Next.js 14 (App Router), React 18, TypeScript.
- Editor: Homebrewery client components embedded in-app (license: MIT, keep copyright + license file).
- Renderer: Homebrewery BrewRenderer (V3) in an iframe (as upstream) for isolation and safety.
- AI: Existing server routes remain; output is Homebrewery V3 markdown that we insert into the brew.
- DB: Prisma + SQLite/Postgres storing Projects, Brews, Versions, Assets.

```text
Next.js (App Router)
  ├─ /projects/[id]
  │   ├─ Sidebar: TOC, AI Assistant
  │   └─ Main: Embedded Homebrewery Editor + Renderer
  ├─ /api/projects/*    (create/read/update projects)
  ├─ /api/brews/*       (load/save brew text/style/snippets, versions)
  └─ /api/ai/*          (content generation/refinement endpoints)
```

---

## Data Model (Prisma)

```prisma
model Project {
  id           String   @id @default(cuid())
  title        String
  description  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  brew         Brew?
  outline      Json?    // chapters/sections metadata for TOC
}

model Brew {
  id        String   @id @default(cuid())
  projectId String   @unique
  text      String   // V3 markdown (with \page, \column, etc.)
  style     String   // CSS
  snippets  String   // Snippet text
  renderer  String   // 'V3' or 'legacy'
  theme     String   // e.g. '5ePHB'
  versions  Version[]
  Project   Project  @relation(fields: [projectId], references: [id])
}

model Version {
  id        String   @id @default(cuid())
  brewId    String
  createdAt DateTime @default(now())
  text      String
  style     String
  snippets  String
  hash      String
  Brew      Brew     @relation(fields: [brewId], references: [id])
}
```

---

## Core Screens

### Projects Page `/projects/[id]`
- Left: TOC panel (chapters/sections; drag/drop ordering; add, rename, delete).
- Center/Right: Embedded Homebrewery editor + live renderer.
- Top: Actions (Export PDF/HTML, Save, Share), AI Assistant quick actions.

### Editor Embedding
- Import Homebrewery `Editor` and `BrewRenderer` components.
- Keep the iframe/`react-frame-component` isolation for renderer.
- Wire `onChange` → POST `/api/brews/[projectId]` (debounced autosave).
- Provide tabs for `text`, `style`, `meta`, `snippet` as in upstream.

---

## Homebrewery Integration Plan

1. **Vendor the client-side Homebrewery code** into `apps/web/src/vendor/homebrewery/`:
   - `editor/*`, `brewRenderer/*`, `shared/*`, minimal deps (CodeMirror or keep upstream highlighting as-is).
   - Keep the upstream `license` file and copyright header.
2. **Create a thin adapter** that maps our brew state to Homebrewery props:
   - `brew = { text, style, snippets, renderer, theme }`
   - Callbacks: `onTextChange`, `onStyleChange`, `onSnipChange`, `onMetaChange` → save to `/api/brews`.
3. **Renderer**: Use upstream `BrewRenderer` component in an iframe. Pass `text/style/renderer/theme` and collect page visibility signals for UX (page number badges, etc.).
4. **Toolbar**: Optionally extend Homebrewery toolbar to add: Export, AI Insert, Section Anchor dropdown.
5. **Styling**: Use upstream theme CSS. Inject our CSS additions below it (do not edit bundled CSS if avoidable).

Notes:
- If using upstream CodeMirror: install `codemirror@5`, themes, and modes; keep their highlight logic for V3 features.
- If simplifying: keep upstream behavior but it’s acceptable to use Monaco for editor while retaining Homebrewery markdown semantics; renderer should remain Homebrewery.

---

## TOC Integration

Purpose: Provide structure without fragmenting the brew:

- Each TOC item stores a title, optional anchor (e.g. `{#intro}`), and an optional page hint.
- In the editor, “Insert Section Anchor” injects `### Section Title {#section-id}` at cursor.
- TOC panel lets users jump to anchors by scrolling the editor and snapping the renderer page.
- Reordering TOC does not mutate text unless user confirms moving sections (we can optionally support block move via heuristics).

Minimal TOC item shape:
```ts
type TocItem = {
  id: string
  title: string
  anchor?: string // e.g. #sacred-haven
  children?: TocItem[]
}
```

---

## AI Pipeline (kept as-is, output targets Homebrewery V3)

Capabilities:
- Outline generator (chapters/sections)
- Section writer (encounters, NPCs, rooms) → outputs V3 markdown using \page/\column and proper headings
- Refiner/editor (style policing, statblock formatting)
- Block inserter (insert at cursor or replace selection)

Contract:
- The AI must output valid Homebrewery V3 markdown. Example structure:

```markdown
# The Homebrewery V3

## Chapter: Sacred Haven {#sacred-haven}
Text...

\page

### Notable NPCs
...content...

\column

### Encounter: Temple Ambush
...content...
```

API routes:
- `POST /api/ai/generate-outline` → `{ projectId }` → `{ outline }`
- `POST /api/ai/generate-section` → `{ projectId, prompt, anchor? }` → `{ markdown }`
- `POST /api/ai/refine` → `{ text, instructions }` → `{ markdown }`

Insertion UX:
- “Insert at Cursor” → inject returned markdown into the Homebrewery editor.
- “Insert at Section” → find anchor -> inject after its heading.

---

## REST API

```http
GET  /api/projects/:id                 → { project }
PUT  /api/projects/:id                 → { project }

GET  /api/brews/:projectId             → { text, style, snippets, renderer, theme }
PUT  /api/brews/:projectId             → save current brew; returns { versionId }
GET  /api/brews/:projectId/versions    → list versions
POST /api/brews/:projectId/restore     → { versionId } → restores content

POST /api/ai/generate-outline          → returns TOC/outline JSON
POST /api/ai/generate-section          → returns V3 markdown
POST /api/ai/refine                    → returns V3 markdown

POST /api/export/pdf                   → returns PDF generated by renderer (server-side or headless)
POST /api/export/html                  → returns sanitized HTML bundle
```

---

## Frontend Composition (Next.js)

- `app/projects/[id]/page.tsx`
  - Loads project + brew via server components.
  - Renders TOC sidebar and an `EditorHost` client component.
- `EditorHost` (client)
  - Embeds Homebrewery `Editor` and `BrewRenderer` (vendor code) with adapters.
  - Implements save debouncing, keyboard shortcuts, AI insert, and TOC scroll sync.
- `TocPanel` (client)
  - Displays outline; clicking an item scrolls editor to anchor; supports add/rename/remove.

---

## Export

- Use embedded renderer HTML for export.
- For PDF: server route uses Playwright/Puppeteer to print the renderer page to PDF (ensure `printBackground`, proper paper size, margins, and `@media print` tuning).
- For HTML: bundle `page` DOM + theme CSS + user style into a single export.

---

## License Compliance (Homebrewery)

- Keep the upstream `license` file and include copyright:

```text
MIT License

Copyright (c) 2016 Scott Tolksdorf
```

- Add our own copyright in addition:

```text
Copyright (c) 2025 Your Company/Name
```

---

## Implementation Steps (Do This Order)

1. Scaffold Next.js app (or reuse existing).
2. Add Prisma models and migrations for `Project`, `Brew`, `Version`.
3. Vendor Homebrewery client components into `src/vendor/homebrewery/`.
4. Create `EditorAdapter.tsx` to pass `{ text, style, snippets, renderer, theme }` and implement change handlers.
5. Build `EditorHost` page section with TOC panel and AI panel.
6. Implement `/api/brews` CRUD + versioning.
7. Implement AI endpoints (reuse existing) that output V3 markdown.
8. Wire “Insert at Cursor/Section” actions.
9. Implement export (PDF/HTML) using renderer output.
10. Polish: autosave toast, unsaved guard, keyboard shortcuts, page number sync.

---

## Acceptance Criteria

- You can create a project, open `/projects/[id]`, and see Homebrewery editor + live renderer.
- Typing in the editor updates the renderer and autosaves to DB.
- TOC displays and jumps to anchors; anchors can be inserted from the UI.
- AI can generate a section and insert valid V3 markdown at cursor or a section anchor.
- Export produces print-quality PDF and a clean HTML bundle.
- License file is present and includes both the upstream and our copyright.

---

## Notes for AI Agents

- All programmatic edits must preserve Homebrewery’s semantics (V3 tokens like `\\page`, `\\column`, injected tags on the `\\page` line).
- Treat the brew text as the source of truth. The TOC is metadata/anchors on top of it.
- Ensure that AI outputs are SRD-safe and avoid copyrighted sourcebook text.


