Below is your Phase 3.5 Mission Brief — Markdown Function Conversion → TipTap Nodes, written in the same detailed style as our earlier “Vite + TipTap” and “Stabilization” briefs.
You can paste this straight into VS Code Copilot Chat (or Claude Code) and run each part sequentially.

🧙‍♂️ Phase 3.5 — Markdown Function Conversion → TipTap Nodes

Objective:
Replace every legacy Homebrewery Markdown macro, inline token, and renderer rule from
shared/naturalcrit/markdown.js with explicit TipTap Nodes and Marks.
After this phase, all content (quotes, sidebars, spells, stat blocks, etc.) is structured JSON, not parsed text.
The TipTap extensions must render identically inside both the Editor and Preview using generateHTML().

⚙️ Core Goals

Eliminate markdown.js entirely.

Create modular TipTap extensions for every markdown feature.

Build a centralized extensions/index.js registry to export all TipTap extensions in one list.

Refactor snippetbar.jsx and TipTapEditor.jsx so they use editor.chain().insertContent() for insertion instead of inserting markdown text.

Validate that brewRenderer.jsx renders identical PHB-style HTML via generateHTML() using the same extension registry.

🗂 File Architecture to Create or Edit
client/
 ├─ extensions/
 │   ├─ index.js
 │   ├─ QuoteBlock.js
 │   ├─ SidebarBlock.js
 │   ├─ TableBlock.js
 │   ├─ PageBreak.js
 │   ├─ ColumnBreak.js
 │   ├─ NoteBlock.js
 │   ├─ SpellBlock.js
 │   ├─ FeatureBlock.js
 │   ├─ MonsterBlock.js
 │   ├─ IconMark.js
 │   ├─ SpellMark.js
 │   ├─ AbilityMark.js
 │   ├─ SkillMark.js
 │   ├─ ConditionMark.js
 │   ├─ DamageMark.js
 │   ├─ FootnoteBlock.js
 │   ├─ CoverBlock.js
 │   ├─ CreditsBlock.js
 │   ├─ WideBlock.js
 │   └─ Image.js   (import from @tiptap/extension-image)
 │
 ├─ homebrew/
 │   ├─ editor/TipTapEditor.jsx
 │   ├─ editor/snippetbar.jsx
 │   └─ brewRenderer/brewRenderer.jsx
 │
 └─ shared/contentAdapter.js

🧩 Extension Implementation Patterns
1️⃣ Block Nodes

Each block uses this template pattern:

import { Node } from '@tiptap/core'

export default Node.create({
  name: 'quoteBlock',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML() { return [{ tag: 'div.quote' }] },
  renderHTML() { return ['div', { class: 'quote' }, 0] },
  addCommands() {
    return {
      insertQuote: () => ({ chain }) =>
        chain().insertContent({ type: this.name, content: [] }).run()
    }
  }
})


Replicate this pattern for all other block types:

New Extension	Legacy Macro / Token	Output HTML Class / Element
QuoteBlock.js	{{quote}} {{attribution}}	<div class="quote"> + <p class="attribution">
SidebarBlock.js	{{sidebar}}	<div class="sidebar">
TableBlock.js	{{table}}	<table class="phb-table">
PageBreak.js	\page	<hr class="page-break">
ColumnBreak.js	\column	<div class="column-break"></div>
NoteBlock.js	{{note}}	<div class="note">
WideBlock.js	{{wide}}	<div class="wide">
SpellBlock.js	{{spell}}	<div class="spell">
FeatureBlock.js	{{classfeature}}	<div class="feature">
MonsterBlock.js	{{monster}}	<div class="monster">
FootnoteBlock.js	{{footnote}}	<div class="footnote">
CoverBlock.js	{{cover}}	<section class="cover">
CreditsBlock.js	{{credits}}	<section class="credits">

💡 Each of these should include their CSS in themes/phb.standalone.less for styling.

2️⃣ Inline Marks / Nodes

Use Mark.create() for inline macros. Example:

import { Mark } from '@tiptap/core'

export default Mark.create({
  name: 'iconMark',
  inclusive: false,
  parseHTML() { return [{ tag: 'i.icon' }] },
  renderHTML({ node }) {
    const name = node.attrs.name
    if (name.startsWith('fa-')) return ['i', { class: `fa ${name}` }]
    return ['i', { class: `icon ${name}` }]
  },
  addAttributes() { return { name: { default: '' } } },
  addInputRules() {
    return [{
      find: /:(ei|gi)_[a-zA-Z0-9_-]+:/,
      handler: ({ range, match, chain }) =>
        chain().insertContent({ type: this.name, attrs: { name: match[0].slice(1, -1) } }).run()
    }]
  }
})


Create similar marks for:

Mark File	Old Macro	Purpose
IconMark.js	:ei_*: / :gi_*:	Elder Icons / Game-Icons
SpellMark.js	\spell{}	Inline spell link
AbilityMark.js	\ability{}	Inline ability reference
SkillMark.js	\skill{}	Inline skill reference
ConditionMark.js	\condition{}	Inline condition tag
DamageMark.js	\damage{}	Inline damage type tag
3️⃣ Extension Registry

client/extensions/index.js

import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

// Block extensions
import QuoteBlock from './QuoteBlock'
import SidebarBlock from './SidebarBlock'
import TableBlock from './TableBlock'
import PageBreak from './PageBreak'
import ColumnBreak from './ColumnBreak'
import NoteBlock from './NoteBlock'
import WideBlock from './WideBlock'
import SpellBlock from './SpellBlock'
import FeatureBlock from './FeatureBlock'
import MonsterBlock from './MonsterBlock'
import FootnoteBlock from './FootnoteBlock'
import CoverBlock from './CoverBlock'
import CreditsBlock from './CreditsBlock'

// Inline marks
import IconMark from './IconMark'
import SpellMark from './SpellMark'
import AbilityMark from './AbilityMark'
import SkillMark from './SkillMark'
import ConditionMark from './ConditionMark'
import DamageMark from './DamageMark'

export default [
  StarterKit,
  Image,
  QuoteBlock,
  SidebarBlock,
  TableBlock,
  PageBreak,
  ColumnBreak,
  NoteBlock,
  WideBlock,
  SpellBlock,
  FeatureBlock,
  MonsterBlock,
  FootnoteBlock,
  CoverBlock,
  CreditsBlock,
  IconMark,
  SpellMark,
  AbilityMark,
  SkillMark,
  ConditionMark,
  DamageMark,
]

4️⃣ Editor Integration

TipTapEditor.jsx

import extensions from '../extensions/index.js'
const editor = useEditor({
  extensions,
  autofocus: true,
  onUpdate: ({ editor }) => onChange(editor.getJSON())
})


snippetbar.jsx

editor.chain().focus().insertContent({ type: 'quoteBlock' }).run()

5️⃣ Preview Renderer

brewRenderer.jsx

import { generateHTML } from '@tiptap/html'
import extensions from '../../extensions/index.js'

const html = generateHTML(brew.content, extensions)
return <div className="phb" dangerouslySetInnerHTML={{ __html: html }} />

6️⃣ CSS Consistency (Themes)

Ensure these classes exist in themes/phb.standalone.less:

.quote { font-style: italic; margin: 1em 2em; }
.attribution { text-align: right; font-style: italic; }
.sidebar { background:#f8f3e7; border:1px solid #bca37b; padding:1em; }
.page-break { border:none; border-top:2px dashed #999; page-break-after:always; }
.two-column { column-count:2; column-gap:2em; }
.note { font-size:0.9em; opacity:0.8; }
.wide { width:100%; }
.spell, .feature, .monster { font-family:'MrEavesSmallCapsOT'; }
.icon { display:inline-block; }

🧪 Validation Checklist
Test	Expected Result
Insert Quote from Snippet	Adds <div class="quote">…</div> in preview
Type :ei_sword:	Inserts <i class="icon ei_sword">
Type \page	Creates dashed <hr class="page-break">
Click Sidebar button	Inserts <div class="sidebar"> block
Add Table	Renders PHB-styled <table>
Load brew JSON in preview	generateHTML() uses same extensions; identical styling
No references to markdown.js remain	✅ Removed
AI editing / saving still functional	✅ JSON data preserved
🧱 Phase Completion Criteria

✅ Every legacy macro/inline token from markdown.js has a TipTap Node/Mark counterpart.

✅ All snippet buttons insert structured nodes via TipTap API.

✅ Preview renders identical PHB markup via generateHTML().

✅ No remaining markdown-parsing logic in codebase.

✅ extensions/index.js serves as a single source of truth for both Editor and Renderer.