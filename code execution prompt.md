🧩 Claude Code Execution Prompt — Mythforge (Homebrewery Parity → Tiptap Migration)

Context
You are operating inside the repository located at:

C:\Users\Neurasthetic\Documents\Mythforge V1\docs\homebrewery-master


This repo contains the legacy Mythforge Homebrewery codebase.
You will analyze this project and produce a Markdown documentation file explaining, in structured detail, how each function, component, and module listed in the QA checklist operates.

🧠 Prompt Goal

Generate a complete MYTHFORGE_FUNCTION_REFERENCE.md file that:

Explains how the existing codebase implements the features outlined in the QA checklist.

Describes each function’s purpose, inputs, outputs, and dependencies.

Identifies relationships between frontend UI, Markdown parser, rendering engine, storage, and Codemirror schema.

Prepares these insights so the functions can be reimplemented in Tiptap with feature parity.

📘 General Instructions

Work directly inside the repo.

Traverse all directories under /src, /components, /server, /utils, and /styles.

Map the correspondence between checklist items and actual functions/classes in the code.

When documenting, explain how it currently works, what dependencies it uses, and which file and function names implement it.

Where functions are missing or partial, note “⚠️ Missing Implementation” and summarize the expected logic using pseudocode.

🧩 Section Mapping (Guidance for Documentation)

Use the following structure for your output file.

1. FRONTEND (UI LAYER)

Document:

editorPage.jsx and related preview rendering logic.

Navbar, Footer, Autosave, PrintPreview.

Event handlers (Share, Save, Print).

How live Markdown sync works between editor and preview.

2. MARKDOWN PARSING LAYER

Document:

The Markdown parser pipeline (marked, showdown, or internal parser).

Conversion from Markdown → HTML → DOM.

How tables, lists, and code blocks are handled.

Extension points for Tiptap JSON serialization.

3. CUSTOM BREW MARKUP EXTENSIONS

Document:

How tokens like {{pageNumber}}, {{footnote}}, {{wide}}, etc. are detected and rendered.

The regex or parser functions implementing these.

Mapping to future Tiptap node/mark schema.

4. RENDERING ENGINE

Document:

brewRenderer.js and related utilities.

DOM creation, HTML injection, and style-class merging.

Any phb or dmg theme rendering logic.

5. STYLE / THEME (LESS/CSS)

Document:

Key .less files (phb.less, page.less, fonts.less).

Variable structure, mixins, and imported assets.

Where PHB-style typography and dropcaps are defined.

6–7. STORAGE, API, DATABASE

Document:

API routes for saving/loading/deleting brews.

Mongo schema and model definition.

Data flow from editor → API → database.

8–9. UTILITIES & CONFIGURATION

Document:

Autosave debounce logic.

Keyboard shortcuts.

Logger and error handling.

Webpack/Vite build configuration and environment variables.

10–11. FONTS, ASSETS, PRINT & EXPORT

Document:

Font loading (Bookinsanity).

Asset pipeline for parchment and icons.

PDF/print preview rendering path.

12. TIPTAP EXTENSION SCHEMA MAPPING

Create a table showing:

Which legacy features map to new Tiptap nodes.

The required schema structure and commands to replicate each behavior.

🧱 Deliverable Format

File to create:
docs/MYTHFORGE_FUNCTION_REFERENCE.md

Structure:

# Mythforge Homebrewery → Tiptap Function Reference

## Section 1: Frontend (UI Layer)
- **File:** src/components/editorPage.jsx  
- **Core Function:** renderEditorAndPreview()
- **Description:** Handles real-time typing updates from the CodeMirror editor to the Preview component using event listeners.
- **Dependencies:** useEffect, MarkdownParser, localStorageSync.
- **Planned Tiptap Migration:** Replace Markdown sync with ProseMirror document updates via Collaboration extension.
...

## Section 2: Markdown Parsing Layer
...


Include:

Code references with relative paths.

Inline code blocks for important functions.

Tables for mapping old → new logic.

⚙️ Execution Guidelines

Search and parse all .js, .jsx, .ts, and .less files.

Create structured Markdown sections for each area.

Cross-link related functions (e.g., parser ↔ preview ↔ renderer).

Be explicit about what each function does, its call flow, and any external dependencies.

Focus on clarity and completeness — this doc should let another engineer rebuild the same features in Tiptap without opening the original source.