# Homebrewery vs Mythforge: Comprehensive Feature Comparison

**Date:** October 7, 2025  
**Purpose:** Identify missing features and implementation gaps between Homebrewery (parent) and Mythforge (child)  
**Key Difference:** Homebrewery uses CodeMirror + Markdown; Mythforge uses TipTap + JSON

---

## Executive Summary

Both systems aim to create D&D Player's Handbook-style documents, but use different technical approaches:

- **Homebrewery:** CodeMirror editor → Markdown (with extensions) → Marked.js parser → HTML → PHB CSS styling
- **Mythforge:** TipTap editor → JSON document → TipTap renderer → HTML → PHB CSS styling + AI Story IDE

Despite different architectures, Mythforge should support ALL Homebrewery features. This document maps each Homebrewery capability to identify implementation gaps.

---

## 1. EDITOR FEATURES

### 1.1 CodeMirror Features (Homebrewery)

**Location:** `shared/naturalcrit/codeEditor/codeEditor.jsx`

| Feature | Homebrewery | Mythforge Status | Gap Analysis |
|---------|-------------|------------------|--------------|
| **Syntax Highlighting** | ✅ Custom markdown highlighting with page numbers, column breaks, definition lists, emojis, injectors | ⚠️ Partial - TipTap has built-in highlighting but lacks Homebrewery-specific features | Need to add custom decorations for `\page`, `\column`, `{{}}` blocks |
| **Code Folding** | ✅ Fold pages, CSS blocks, custom blocks | ❌ Missing | Need to implement collapsible sections in TipTap |
| **Scroll Sync** | ✅ Bidirectional scroll between editor and preview | ❌ Missing | Critical feature - need to track cursor page position and sync with preview scroll |
| **Page Tracking** | ✅ Shows page numbers in editor margin | ❌ Missing | Need decorator/plugin to show page numbers |
| **Undo/Redo** | ✅ CodeMirror history | ✅ TipTap has built-in history | ✓ Supported |
| **Find/Replace** | ✅ CodeMirror search addon | ❌ Missing | Need to add search functionality |
| **Keyboard Shortcuts** | ✅ Extensive (Ctrl+B, Ctrl+I, Ctrl+M for spans, etc.) | ⚠️ Partial | Need to map Homebrewery shortcuts to TipTap commands |

**Homebrewery Keyboard Shortcuts to Implement:**
```javascript
// From codeEditor.jsx - extraKeys
'Ctrl-B'           : Bold
'Ctrl-I'           : Italic  
'Ctrl-U'           : Underline
'Shift-Ctrl-='     : Superscript (^text^)
'Ctrl-='           : Subscript (^^text^^)
'Ctrl-.'           : Insert &nbsp;
'Ctrl-M'           : Inline span {{text}}
'Shift-Ctrl-M'     : Block div {{\ntext\n}}
'Ctrl-/'           : Comment (<!-- -->)
'Ctrl-K'           : Link
'Ctrl-L'           : Unordered list
'Shift-Ctrl-L'     : Ordered list
'Shift-Ctrl-1-6'   : Headers H1-H6
'Shift-Ctrl-Enter' : Column break
'Ctrl-Enter'       : Page break
'Ctrl-['           : Fold all code
'Ctrl-]'           : Unfold all code
```

### 1.2 Custom Markdown Highlighting

**Location:** `client/homebrew/editor/editor.jsx` - `highlightCustomMarkdown()`

Homebrewery adds visual indicators for:
- `\page` breaks with page numbers in margin
- `\column` breaks with styling
- `{{` and `}}` block delimiters
- `{style}` injectors (inline style tags)
- Definition lists (`::`)
- Subscript/superscript (`^` and `^^`)
- Emojis (`:emoji_name:`)

**Implementation in Mythforge:**
- Create TipTap decorations/plugins to visually mark these elements
- Add gutter decoration plugin for page numbers
- Syntax highlighting for `{{}}` blocks

---

## 2. RENDERING SYSTEM

### 2.1 Markdown Parser (Homebrewery)

**Location:** `shared/naturalcrit/markdown.js`

Homebrewery uses **Marked.js** with extensive custom extensions:

| Extension | Purpose | Mythforge Equivalent |
|-----------|---------|---------------------|
| **MarkedVariables** | Variable system: `[var]: content` and `[$var]` references | ❌ Missing - critical feature |
| **mustacheSpans** | Inline spans: `{{ class content }}` | ⚠️ Partial - needs JSON representation |
| **mustacheDivs** | Block divs: `{{\nclass\ncontent\n}}` | ⚠️ Partial - needs JSON representation |
| **mustacheInjectInline** | Inject styles inline: `text {color:red}` | ❌ Missing |
| **mustacheInjectBlock** | Inject styles on blocks: `\n{color:red}` | ❌ Missing |
| **forcedParagraphBreaks** | Hard breaks: `:` (one or more colons) | ❌ Missing |
| **MarkedExtendedTables** | Advanced table features | ⚠️ Partial - TipTap has basic tables |
| **MarkedDefinitionLists** | Definition lists: `term\n: definition` | ❌ Missing |
| **MarkedAlignedParagraphs** | Text alignment | ❌ Missing |
| **MarkedNonbreakingSpaces** | Non-breaking space handling | ❌ Missing |
| **MarkedSubSuperText** | Superscript ^text^ and subscript ^^text^^ | ❌ Missing |
| **MarkedSmartypantsLite** | Smart quotes and dashes | ❌ Missing |
| **MarkedGFMHeadingId** | Auto-generate heading IDs for links | ⚠️ Partial |
| **MarkedEmojis** | Emoji support with custom icon fonts | ❌ Missing |

### 2.2 Variable System (CRITICAL)

**Homebrewery's variable system is extremely powerful:**

```markdown
<!-- Define variables -->
[spellName]: Fireball
[damage]: 8d6
[DC]: 15

<!-- Use variables -->
**[$spellName]** deals [$damage] fire damage (DC [$DC] Dexterity save).

<!-- Math operations -->
At higher levels: [$damage + 1d6] per slot level above 3rd

<!-- Links -->
[srd]: https://www.dndbeyond.com/sources/basic-rules
See the [SRD]($srd) for more details.

<!-- Hoisting - variables can be defined anywhere and used everywhere -->
```

**Implementation needed in Mythforge:**
1. Store variables in document metadata
2. Create variable resolution system during render
3. Support math operations (uses expr-eval library)
4. Support hoisting (variables defined on any page can be used on any page)

### 2.3 Mustache Syntax for Styling

**Inline spans:**
```markdown
This is {{class:text-center, color:red important text}}
{{width:50% Half-width content}}
```

**Block divs:**
```markdown
{{descriptive
This is a descriptive text block.
It spans multiple lines.
}}

{{quote
> A famous quote
{{attribution Author Name}}
}}
```

**Injectors (apply styles to previous element):**
```markdown
# Chapter Title
{color: darkred}

This paragraph is centered.
{text-align: center}
```

**Implementation needed in Mythforge:**
- Extend TipTap schema to support class/style attributes on ALL nodes
- Create custom input rules to parse `{{}}` syntax
- Support both inline and block versions

### 2.4 Emoji System

**Location:** Uses icon fonts (Font Awesome, Game Icons, Dice Font, Elderberry Inn)

```markdown
:spell-icon: Fireball
:d20: Roll initiative!
:crossed-swords: Combat encounter
```

Rendered as icon font characters, not images.

**Files to examine:**
- `themes/fonts/iconFonts/fontAwesome.js`
- `themes/fonts/iconFonts/gameIcons.js`
- `themes/fonts/iconFonts/diceFont.js`
- `themes/fonts/iconFonts/elderberryInn.js`

**Implementation needed:**
- Add icon font support to TipTap
- Create emoji node type or mark
- Import icon font mappings

---

## 3. RENDERER AND PREVIEW

### 3.1 Brew Renderer Component

**Location:** `client/homebrew/brewRenderer/brewRenderer.jsx`

| Feature | Homebrewery | Mythforge Status |
|---------|-------------|------------------|
| **Page Splitting** | ✅ Splits on `\page` or `\pagebreak` | ❌ Missing - critical for PHB styling |
| **Column Breaking** | ✅ Splits on `\column` | ❌ Missing |
| **iframe Isolation** | ✅ Renders in iframe to prevent CSS conflicts | ❌ Missing |
| **Incremental Rendering** | ✅ Only renders visible pages + 3 pages before/after | ❌ Missing |
| **Page Visibility Tracking** | ✅ IntersectionObserver tracks which pages are visible | ❌ Missing |
| **Scroll to Hash** | ✅ Auto-scroll to #anchor on load | ❌ Missing |
| **Print Support** | ✅ `printCurrentBrew()` helper | ⚠️ Partial |
| **Zoom Controls** | ✅ Zoom level, spread view, page shadows | ❌ Missing |
| **Live Preview Updates** | ✅ Updates as you type | ✅ TipTap has this |

**Page Breaking Algorithm:**
```javascript
// Homebrewery splits text on regex
const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
rawPages = props.text.split(PAGEBREAK_REGEX_V3);

// Each page is rendered separately
rawPages.map((pageText, index) => renderPage(pageText, index))
```

**Implementation needed in Mythforge:**
1. Create a page break node type in TipTap schema
2. Render each page as separate container div
3. Apply PHB page styling (height, width, margins, columns)
4. Track page numbers for scroll sync

### 3.2 Style Injection

**Location:** `brewRenderer.jsx` - `renderStyle()`

```javascript
const renderStyle = () => {
  const themeStyles = props.themeBundle?.joinedStyles ?? 
    '<style>@import url("/themes/V3/Blank/style.css");</style>';
  const cleanStyle = safeHTML(`${themeStyles} \n\n <style> ${props.style} </style>`);
  return <div dangerouslySetInnerHTML={{ __html: cleanStyle }} />;
};
```

Homebrewery:
1. Loads base theme CSS
2. Loads parent theme CSS (if theme has `baseTheme`)
3. Applies user's custom CSS from Style tab

**Implementation needed:**
- Theme loading system
- CSS injection into preview
- User custom CSS editor

### 3.3 Safe HTML Rendering

**Location:** `client/homebrew/brewRenderer/safeHTML.js`

Sanitizes HTML to prevent XSS while allowing safe PHB-specific tags:
- Allows: `<div>`, `<span>`, `<img>`, `<table>`, `<i>`, etc.
- Removes: `<script>`, `<iframe>`, `<object>`, etc.

**Implementation needed:**
- HTML sanitization layer in Mythforge
- Whitelist safe tags and attributes

---

## 4. THEME SYSTEM

### 4.1 Theme Structure

**Location:** `themes/themes.json`

```json
{
  "V3": {
    "5ePHB": {
      "name": "5e PHB",
      "renderer": "V3",
      "baseTheme": "Blank",
      "baseSnippets": false,
      "path": "5ePHB"
    },
    "5eDMG": {
      "name": "5e DMG",
      "renderer": "V3",
      "baseTheme": "5ePHB",
      "baseSnippets": "5ePHB",
      "path": "5eDMG"
    },
    "Blank": {
      "name": "Blank",
      "renderer": "V3",
      "baseTheme": false,
      "baseSnippets": false,
      "path": "Blank"
    }
  }
}
```

**Theme Inheritance:**
- Themes can inherit from parent theme (`baseTheme`)
- Themes can inherit snippets from another theme (`baseSnippets`)
- CSS is loaded in order: Blank → 5ePHB → 5eDMG → User CSS

### 4.2 User-Created Themes

Users can create custom themes by:
1. Creating a brew with tag `meta:theme`
2. Adding custom CSS in Style tab
3. Adding custom snippets in Snippet tab
4. Other users can reference this theme by its shareId

**API Endpoint:** `GET /api/theme/:renderer/:id`

Returns:
```json
{
  "styles": ["CSS string 1", "CSS string 2", ...],
  "snippets": [{ "name": "...", "snippets": [...] }],
  "name": "Theme Name",
  "author": "username"
}
```

**Implementation needed in Mythforge:**
- Theme bundle API endpoint
- User theme storage in database
- Theme selector UI
- CSS inheritance system

### 4.3 PHB Styling

**Key CSS Files (attempted to fetch, may need direct GitHub browsing):**
- `themes/V3/5ePHB/5ePHB.style.less`
- `themes/V3/Blank/Blank.style.less`
- `phb.standalone.css` (standalone version)

**PHB Features:**
- Two-column layout with column breaks
- Page dimensions: 8.5" × 11" (816px × 1056px at 96 DPI)
- Custom fonts (Mr Eaves, Bookinsanity, etc.)
- Drop caps
- Stat blocks, tables, descriptive text, etc.

**Implementation in Mythforge:**
- Port PHB CSS to work with TipTap output
- Ensure compatibility with custom styling system
- Column layout with `\column` breaks

---

## 5. SNIPPET SYSTEM

### 5.1 Snippet Bar

**Location:** `client/homebrew/editor/snippetbar/snippetbar.jsx`

**Features:**
- Snippets organized by theme
- User-created snippets via Snippet tab
- Hierarchical menu (group → subsnippets)
- Injectable text templates
- Icon-based UI

**Snippet Structure:**
```javascript
{
  groupName: 'Monsters',
  icon: 'fas fa-dragon',
  view: 'text',  // or 'style', 'meta', 'snippet'
  snippets: [
    {
      name: 'Monster Stat Block',
      icon: 'fas fa-paw',
      gen: `___
      **Armor Class** 15 (natural armor)
      **Hit Points** 52 (8d8 + 16)
      ...`
    },
    { /* more snippets */ }
  ]
}
```

**User Snippets Syntax:**
```markdown
\snippet Monster Stat Block
___
**Armor Class** 15
**Hit Points** 52

\snippet Spell Block
#### Fire Bolt
*Evocation cantrip*
```

### 5.2 Theme Snippets

**Location:** `themes/V3/5ePHB/snippets.js`

Snippets are JavaScript modules exporting arrays:
```javascript
module.exports = [
  {
    groupName: 'Text',
    icon: 'fas fa-pencil-alt',
    view: 'text',
    snippets: [
      { name: 'Drop Cap', gen: '{{drop-cap\nL}}orem ipsum...' },
      { name: 'Quote', gen: '{{quote\n> Quote text\n{{attribution Author}}\n}}' },
      // ...
    ]
  }
  // ...
];
```

**Implementation needed:**
- Snippet storage system
- Snippet injection into TipTap
- Snippet theme inheritance
- UI for snippet management

---

## 6. SAVE/LOAD SYSTEM

### 6.1 Homebrew API

**Location:** `server/homebrew.api.js`

| Endpoint | Purpose | Mythforge Status |
|----------|---------|------------------|
| `POST /api` | Create new brew | ✅ Has `POST /api/brews` |
| `PUT /api/:id` | Update brew | ✅ Has `PUT /api/brews/:brewId` |
| `DELETE /api/:id` | Delete brew | ✅ Has `DELETE /api/brews/:brewId` |
| `GET /api/theme/:renderer/:id` | Get theme bundle | ⚠️ Implemented but may need testing |
| `GET /share/:id` | View shared brew | ❌ Missing route |
| `GET /edit/:id` | Edit brew | ❌ Missing route |
| `GET /download/:id` | Download markdown source | ❌ Missing |
| `GET /source/:id` | View markdown source | ❌ Missing |
| `GET /metadata/:id` | Get brew metadata only | ❌ Missing |
| `GET /css/:id` | Get brew CSS only | ❌ Missing |
| `GET /user/:username` | List user's brews | ❌ Missing |
| `PUT /api/user/rename` | Rename author on all brews | ❌ Missing |

### 6.2 Text Storage Format

**Homebrewery stores brews as:**
```markdown
```metadata
title: My Amazing Brew
description: A cool homebrew
tags:
  - monster
  - spell
systems:
  - 5e
renderer: V3
theme: 5ePHB
```

```css
/* Custom styles */
.myClass { color: red; }
```

# Chapter 1

Content goes here...
```

**Compression:**
- Text is compressed with zlib before storing in MongoDB
- Stored as binary in `textBin` field
- `text` field is undefined when saved

**Implementation needed:**
- Metadata extraction/injection
- Text compression for storage
- Conversion between TipTap JSON and Homebrewery markdown format

### 6.3 Version Control

**Homebrewery uses:**
1. Version number incremented on each save
2. Patch-based updates using `diff-match-patch`
3. Hash verification to detect conflicts

```javascript
// On update:
1. Generate patches from client version to new version
2. Apply patches to server version
3. Verify hash matches
4. Increment version number
5. Save
```

**Implementation in Mythforge:**
- Already has version system (Phase 1)
- May need hash verification
- Patch-based updates for concurrent editing

### 6.4 Google Drive Integration

**Homebrewery supports saving to Google Drive:**
- OAuth2 authentication
- Stores brew text in Google Drive
- Stores metadata stub in MongoDB
- `googleId` field links the two

**Implementation needed:**
- Optional Google Drive sync
- OAuth2 flow
- Dual storage system (Drive + DB)

---

## 7. IMAGE AND MEDIA HANDLING

### 7.1 Image Syntax

**Markdown:**
```markdown
![Alt text](url)
![](url)

<!-- With inline styling -->
![Alt](url){width:300px}
```

**Renderer exposes URL as CSS variable:**
```javascript
// From markdown.js - renderer.image
`<img src="${href}" alt="${text}" style="--HB_src:url(${href});" />`
```

This allows CSS to access image URL for background effects.

**Implementation needed:**
- Image node in TipTap schema
- Inline style injection on images
- CSS variable support for backgrounds

### 7.2 Table Support

**Uses marked-extended-tables extension:**
- Colspan/rowspan support
- Cell alignment
- Header rows

**Implementation in Mythforge:**
- TipTap has basic table support
- Need to extend for colspan/rowspan
- PHB table styling

---

## 8. FONTS

### 8.1 Font Loading

**Homebrewery uses custom fonts:**
- **Mr Eaves Small Caps** - Headers
- **Bookinsanity** - Body text
- **Scala Sans** - Monster stat blocks

**Location:** `themes/fonts/`

**Font files are loaded via CSS:**
```css
@font-face {
  font-family: 'MrEaves';
  src: url('/fonts/MrEaves.woff2') format('woff2');
}
```

**Icon Fonts:**
- Font Awesome
- Game Icons
- Dice Font
- Elderberry Inn (custom D&D icons)

**Implementation needed:**
- Host font files in `/fonts/` directory
- Create font-face CSS
- Map icon codes to CSS classes

### 8.2 Emoji/Icon System Integration

**Location:** `shared/naturalcrit/codeEditor/autocompleteEmoji.js`

Provides autocomplete for emoji/icon names:
```
Type :spell and get autocomplete dropdown with icon preview
```

Emojis are rendered as icon font characters:
```html
<i class="fas fa-hat-wizard"></i>
```

**Implementation needed:**
- Emoji autocomplete in TipTap
- Icon font rendering
- Emoji picker UI

---

## 9. SCROLLING AND NAVIGATION

### 9.1 Scroll Sync

**Homebrewery implements bidirectional scroll sync:**

**Editor → Preview:**
```javascript
// When cursor changes page in editor, scroll preview to that page
if (props.currentEditorCursorPageNum !== this.props.currentEditorCursorPageNum) {
  this.brewJump(props.currentEditorCursorPageNum);
}
```

**Preview → Editor:**
```javascript
// When scrolling preview, update editor scroll
if (props.currentBrewRendererPageNum !== this.props.currentBrewRendererPageNum) {
  this.sourceJump(props.currentBrewRendererPageNum);
}
```

**Implementation details:**
- Track current page in editor (cursor position and scroll position)
- Track current page in preview (IntersectionObserver)
- Smooth scroll animations with bounce effect
- Debouncing to prevent scroll loops

**Implementation needed in Mythforge:**
1. Page tracking in TipTap editor
2. Page visibility tracking in preview
3. Bidirectional scroll sync
4. Smooth scroll animations

### 9.2 Jump to Page

**Keyboard shortcuts:**
- `Ctrl+Shift+→` - Jump from editor to preview
- `Ctrl+Shift+←` - Jump from preview to editor

**Implementation:**
```javascript
brewJump(targetPage) {
  // Scroll preview iframe to target page
  const targetPos = document.getElementById(`p${targetPage}`).getBoundingClientRect().top;
  brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'smooth' });
}

sourceJump(targetPage) {
  // Scroll editor to target page
  const textString = brew.text.split(/\\page/).slice(0, targetPage-1).join('\\page');
  const targetLine = textString.split('\n').length - 1;
  codeMirror.scrollTo(null, targetLine);
}
```

---

## 10. METADATA EDITOR

**Location:** `client/homebrew/editor/metadataEditor/metadataEditor.jsx`

**Editable fields:**
- Title
- Description
- Tags (multi-select)
- Systems (e.g., "5e", "Pathfinder")
- Renderer (V3 or Legacy)
- Theme (dropdown)
- Language (for HTML lang attribute)

**Theme Selector:**
- Lists static themes
- Lists user-created themes (with `meta:theme` tag)
- Shows thumbnail preview
- Supports theme inheritance

**Implementation needed:**
- Metadata editing UI
- Theme selector with previews
- Tag management
- System metadata

---

## 11. ERROR HANDLING AND VALIDATION

### 11.1 Markdown Validation

**Location:** `shared/naturalcrit/markdown.js` - `Markdown.validate()`

Validates:
- Matching opening/closing tags (`<div>`, `<span>`, `<a>`)
- Handles void tags (`<br>`, `<img>`, `<hr>`)
- Reports line numbers of errors

```javascript
const errors = Markdown.validate(brewText);
// Returns array of errors with line numbers
[
  { line: 42, type: 'div', text: 'Unmatched opening tag', id: 'OPEN' },
  { line: 50, type: 'span', text: 'Unmatched closing tag', id: 'CLOSE' }
]
```

**Implementation needed:**
- Validation system for TipTap document
- Error reporting UI

### 11.2 Error Bar

**Location:** `client/homebrew/brewRenderer/errorBar/errorBar.jsx`

Displays validation errors at top of preview:
- Red bar with error count
- Expandable to show details
- Links to error lines

---

## 12. TOOLBAR AND UI

### 12.1 Toolbar Features

**Location:** `client/homebrew/brewRenderer/toolBar/toolBar.jsx`

**Preview toolbar:**
- Zoom controls (50% to 200%)
- Spread view (single page, two-page spread)
- Page shadows toggle
- Row/column gap controls
- Page indicator (e.g., "Pages 3-5 of 12")

**Implementation needed:**
- Zoom controls
- View mode selector
- Page counter

### 12.2 Editor Toolbar

**Location:** Snippet bar includes:
- View tabs (Text, Style, Snippet, Meta)
- Undo/Redo buttons
- Code folding buttons
- Theme selector
- History dropdown (version history)

**Implementation needed:**
- Tab navigation
- History UI
- Visual undo/redo indicators

---

## 13. EXPORT AND SHARING

### 13.1 Print to PDF

**Location:** `shared/helpers.js` - `printCurrentBrew()`

```javascript
window.frames['BrewRenderer'].contentWindow.print();
```

Opens browser print dialog. CSS `@media print` rules optimize for PDF:
- Remove page breaks between pages
- Ensure proper page dimensions
- Hide UI elements

**Implementation needed:**
- Print CSS rules
- PDF export button
- Print optimization

### 13.2 Download Source

**Endpoint:** `GET /download/:id`

Downloads brew as `.txt` file containing full markdown source (including metadata and CSS).

**Implementation needed:**
- Download endpoint
- Markdown export from TipTap JSON

### 13.3 Share Links

**Homebrewery URLs:**
- `/share/:id` - Read-only view
- `/edit/:id` - Edit view (requires ownership)
- `/new/:id` - Clone brew to new

**Access control:**
- Each brew has unique `shareId` and `editId`
- `shareId` is public
- `editId` gives edit access
- Authors list controls who can edit

---

## 14. PERFORMANCE OPTIMIZATIONS

### 14.1 Lazy Rendering

**Homebrewery only renders visible pages:**
```javascript
const isInView = (index) => {
  if (Math.abs(index - currentBrewRendererPageNum - 1) <= 3) return true;
  return false;
};
```

Only renders pages within ±3 pages of visible area.

**Implementation needed:**
- Intersection Observer for page visibility
- Conditional rendering of pages

### 14.2 Throttling and Debouncing

**Update frequency:**
- Scroll events throttled to 200ms
- Text changes debounced
- Render updates batched

---

## 15. CRITICAL MISSING FEATURES IN MYTHFORGE

### Priority 1 (Critical - Required for Basic Functionality)

1. **Page Breaking System**
   - `\page` and `\pagebreak` nodes
   - Page-based rendering
   - PHB page styling (816×1056px, two columns)

2. **Column Breaking**
   - `\column` nodes
   - Column layout with breaks
   - CSS multi-column support

3. **Scroll Sync**
   - Bidirectional sync between editor and preview
   - Page number tracking
   - Smooth scroll to page

4. **PHB CSS Styling**
   - Port complete PHB stylesheet
   - Two-column layout
   - Proper fonts (Mr Eaves, Bookinsanity)
   - Stat block styling

### Priority 2 (High - Required for Homebrewery Compatibility)

5. **Mustache Block Syntax**
   - `{{class content}}` inline spans
   - `{{class\ncontent\n}}` block divs
   - Style injectors `{color:red}`
   - Support for PHB classes (descriptive, quote, etc.)

6. **Variable System**
   - Variable definition: `[var]: content`
   - Variable reference: `[$var]`
   - Math operations: `[$var + 5]`
   - Hoisting (use before define)

7. **Snippet System**
   - Snippet injection into editor
   - User snippets via `\snippet` syntax
   - Theme snippet inheritance
   - Snippet UI/toolbar

8. **Theme System**
   - Theme loading and inheritance
   - User-created themes
   - Theme bundle API
   - CSS injection system

### Priority 3 (Medium - Enhanced Features)

9. **Advanced Markdown Extensions**
   - Definition lists (`::`  syntax)
   - Extended tables (colspan/rowspan)
   - Superscript/subscript
   - Aligned paragraphs
   - Non-breaking spaces
   - Smart quotes

10. **Emoji/Icon System**
    - Icon font support (Font Awesome, Game Icons, etc.)
    - Emoji autocomplete
    - `:icon_name:` syntax

11. **Editor Enhancements**
    - Code folding
    - Custom syntax highlighting (page numbers, etc.)
    - Find/replace
    - Keyboard shortcuts parity
    - Multiple editor views (Text/Style/Snippet/Meta)

12. **Export Features**
    - Print to PDF optimization
    - Download markdown source
    - Share links with access control

### Priority 4 (Low - Nice to Have)

13. **Performance Optimizations**
    - Lazy page rendering
    - Incremental updates
    - Throttled scroll events

14. **Google Drive Integration**
    - OAuth2 authentication
    - Cloud storage option
    - Sync functionality

15. **Advanced UI**
    - Zoom controls
    - View modes (single/spread)
    - Page shadows
    - Version history UI

---

## 16. IMPLEMENTATION ROADMAP

### Phase 1: Core Rendering (2-3 weeks)

**Goal:** Get basic PHB-style pages rendering

1. **Page Break Node**
   ```javascript
   // TipTap schema extension
   const PageBreak = Node.create({
     name: 'pageBreak',
     group: 'block',
     parseHTML: () => [{ tag: 'div.page-break' }],
     renderHTML: () => ['div', { class: 'page-break', 'data-page-break': true }, 0]
   });
   ```

2. **Column Break Node**
   Similar to page break but for column breaks

3. **PHB CSS Porting**
   - Copy CSS from Homebrewery's `phb.standalone.css`
   - Adapt for TipTap HTML structure
   - Test column layout

4. **Font Loading**
   - Download fonts from Homebrewery repo
   - Create `@font-face` rules
   - Test rendering

### Phase 2: Mustache Syntax (2-3 weeks)

**Goal:** Support `{{}}` blocks and style injection

1. **Inline Span Node**
   ```javascript
   const InlineSpan = Node.create({
     name: 'inlineSpan',
     group: 'inline',
     inline: true,
     content: 'inline*',
     attrs: {
       class: { default: null },
       style: { default: null }
     },
     parseHTML: () => [{ tag: 'span.inline-block' }],
     renderHTML: ({ node, HTMLAttributes }) => [
       'span',
       mergeAttributes(HTMLAttributes, {
         class: `inline-block ${node.attrs.class}`,
         style: node.attrs.style
       }),
       0
     ],
     addInputRules: () => [
       // {{ class text }}
       nodeInputRule({
         find: /\{\{\s*([^}\n]+?)\s+([^}]+?)\}\}/,
         type: this.type,
         getAttributes: (match) => ({
           class: match[1],
           content: match[2]
         })
       })
     ]
   });
   ```

2. **Block Div Node**
   Similar structure for block divs

3. **Style Injector Mark**
   Mark that applies styles to previous node

### Phase 3: Variable System (3-4 weeks)

**Goal:** Full variable support

1. **Variable Storage**
   - Store variables in document metadata
   - Create variable registry

2. **Variable Resolution**
   - Parse variable definitions
   - Replace variable references during render
   - Support math operations (integrate expr-eval)

3. **Hoisting Support**
   - Multi-pass resolution
   - Dependency tracking

### Phase 4: Scroll Sync (1-2 weeks)

**Goal:** Bidirectional scroll sync

1. **Page Tracking in Editor**
   - Decoration plugin to mark page boundaries
   - Track cursor page position
   - Track scroll page position

2. **Page Tracking in Preview**
   - IntersectionObserver for page visibility
   - Track center page

3. **Sync Logic**
   - Editor changes → scroll preview
   - Preview scrolls → scroll editor
   - Debouncing and smooth scroll

### Phase 5: Snippet System (2-3 weeks)

**Goal:** Full snippet support

1. **Snippet Storage**
   - Parse `\snippet` syntax
   - Store in database

2. **Snippet Injection**
   - UI for selecting snippets
   - Insert into editor at cursor

3. **Theme Snippets**
   - Load from theme bundles
   - Merge with user snippets

### Phase 6: Theme System (2-3 weeks)

**Goal:** Theme loading and inheritance

1. **Theme Bundle API**
   - Implement `/api/theme/:renderer/:id`
   - Load theme CSS
   - Load theme snippets

2. **Theme Inheritance**
   - Recursive theme loading
   - CSS concatenation
   - Snippet merging

3. **User Themes**
   - Tag brews with `meta:theme`
   - Reference by shareId

### Phase 7: Advanced Extensions (3-4 weeks)

**Goal:** Markdown extension parity

1. **Definition Lists**
2. **Extended Tables**
3. **Super/Subscript**
4. **Aligned Paragraphs**
5. **Emoji System**

### Phase 8: Polish and Export (2-3 weeks)

**Goal:** Export, UI, performance

1. **Print/PDF**
2. **Share Links**
3. **Editor Shortcuts**
4. **Code Folding**
5. **Find/Replace**

---

## 17. CODE MIGRATION EXAMPLES

### Example 1: Converting mustacheSpans to TipTap

**Homebrewery (Marked.js extension):**
```javascript
const mustacheSpans = {
  name: 'mustacheSpans',
  level: 'inline',
  start(src) { return src.match(/{{[^{]/)?.index; },
  tokenizer(src, tokens) {
    const match = /^{{[^\n]*}}/.exec(src);
    if (match) {
      const tags = processStyleTags(match[0].substring(2));
      return {
        type: 'mustacheSpans',
        raw: match[0],
        text: text,
        tags: tags,
        tokens: this.lexer.inlineTokens(text)
      };
    }
  },
  renderer(token) {
    return `<span class="${token.tags.classes}" style="${token.tags.styles}">${this.parser.parseInline(token.tokens)}</span>`;
  }
};
```

**Mythforge (TipTap extension):**
```javascript
import { Node, mergeAttributes } from '@tiptap/core';
import { nodeInputRule } from '@tiptap/core';

const InlineSpan = Node.create({
  name: 'inlineSpan',
  group: 'inline',
  inline: true,
  content: 'inline*',
  
  attrs: {
    class: { default: null },
    styles: { default: {} }
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.inline-block',
        getAttrs: (node) => ({
          class: node.getAttribute('class')?.replace('inline-block', '').trim(),
          styles: parseInlineStyles(node.getAttribute('style'))
        })
      }
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const styleString = Object.entries(node.attrs.styles)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
    
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: `inline-block ${node.attrs.class || ''}`.trim(),
        style: styleString
      }),
      0
    ];
  },
  
  addInputRules() {
    return [
      nodeInputRule({
        find: /\{\{([^}]*?)\s+([^}]+?)\}\}$/,
        type: this.type,
        getAttributes: (match) => {
          const tags = processStyleTags(match[1]);
          return {
            class: tags.classes,
            styles: tags.styles
          };
        }
      })
    ];
  }
});

function processStyleTags(tagString) {
  // Parse "class:value, style:value" format
  const parts = tagString.split(',').map(s => s.trim());
  const classes = parts.filter(p => !p.includes(':')).join(' ');
  const styles = parts
    .filter(p => p.includes(':'))
    .reduce((obj, pair) => {
      const [key, value] = pair.split(':').map(s => s.trim());
      obj[key] = value;
      return obj;
    }, {});
  
  return { classes, styles };
}
```

### Example 2: Variable System

**Homebrewery implementation:**
```javascript
// Variable definition
const blockDefRegex = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\]:(?!\() *((?:\n? *[^\s].*)+)(?=\n+|$)/;

// Variable reference  
const blockCallRegex = /^[!$]?\[((?!\s*\])(?:\\.|[^\[\]\\])+)\](?=\n|$)/;

// Storage
const globalVarsList = {}; // { pageNumber: { varName: { content, resolved } } }

// Resolution
const lookupVar = function(label, index, hoist=false) {
  while (index >= 0) {
    if (globalVarsList[index]?.[label] !== undefined)
      return globalVarsList[index][label];
    index--;
  }
  if (hoist) {
    // Search future pages
  }
  return undefined;
};

// Math operations
const replaceVar = function(input) {
  const match = /\$\[(.*?)\]/.exec(input);
  const label = match[1];
  
  if (label.includes('+') || label.includes('-')) {
    // Parse math with expr-eval
    return mathParser.evaluate(label);
  }
  
  return lookupVar(label);
};
```

**Mythforge implementation strategy:**
```javascript
// Store variables in TipTap document
const VariableExtension = Extension.create({
  name: 'variables',
  
  addGlobalAttributes() {
    return [
      {
        types: ['doc'],
        attributes: {
          variables: {
            default: {},
            parseHTML: (element) => {
              const meta = element.querySelector('meta[name="brew-variables"]');
              return meta ? JSON.parse(meta.content) : {};
            },
            renderHTML: (attributes) => {
              if (!attributes.variables) return {};
              return {
                'data-variables': JSON.stringify(attributes.variables)
              };
            }
          }
        }
      }
    ];
  },
  
  addCommands() {
    return {
      setVariable: (name, value) => ({ tr, dispatch }) => {
        const { doc } = tr;
        const variables = { ...doc.attrs.variables, [name]: value };
        const newAttrs = { ...doc.attrs, variables };
        
        if (dispatch) {
          tr.setDocAttribute('variables', variables);
        }
        return true;
      },
      
      getVariable: (name) => ({ tr }) => {
        return tr.doc.attrs.variables?.[name];
      }
    };
  }
});

// Variable reference node
const VariableReference = Node.create({
  name: 'variableReference',
  group: 'inline',
  inline: true,
  atom: true,
  
  attrs: {
    variableName: { default: '' },
    math: { default: false }
  },
  
  parseHTML() {
    return [{ tag: 'span[data-variable-ref]' }];
  },
  
  renderHTML({ node }) {
    const { editor } = this;
    const variables = editor.state.doc.attrs.variables || {};
    let value = variables[node.attrs.variableName];
    
    if (node.attrs.math && value) {
      // Evaluate math expression
      value = evaluateMath(value);
    }
    
    return [
      'span',
      {
        'data-variable-ref': node.attrs.variableName,
        class: 'variable-reference'
      },
      value || `[${node.attrs.variableName}]`
    ];
  },
  
  addInputRules() {
    return [
      nodeInputRule({
        find: /\$\[([^\]]+)\]$/,
        type: this.type,
        getAttributes: (match) => ({
          variableName: match[1].trim(),
          math: /[+\-*/()0-9]/.test(match[1])
        })
      })
    ];
  }
});
```

---

## 18. TESTING STRATEGY

### Unit Tests
- [ ] Page break node rendering
- [ ] Column break node rendering
- [ ] Mustache syntax parsing
- [ ] Variable resolution
- [ ] Scroll sync logic
- [ ] Theme loading
- [ ] Snippet injection

### Integration Tests
- [ ] Editor ↔ Preview sync
- [ ] Theme inheritance
- [ ] Variable hoisting
- [ ] Export to markdown
- [ ] Import from markdown

### Visual Regression Tests
- [ ] PHB page styling
- [ ] Two-column layout
- [ ] Font rendering
- [ ] Stat block formatting
- [ ] Table styling

---

## 19. HOMEBREWERY FILES TO STUDY DIRECTLY

Since not all files could be fetched via API, browse these directly on GitHub:

### Critical CSS Files
1. `themes/V3/5ePHB/5ePHB.style.less` - Main PHB styling
2. `themes/V3/Blank/Blank.style.less` - Base theme
3. `phb.standalone.css` - Compiled standalone stylesheet

### Snippet Files
1. `themes/V3/5ePHB/snippets.js` - PHB snippets
2. `themes/V3/5eDMG/snippets.js` - DMG snippets
3. `themes/V3/Journal/snippets.js` - Journal snippets

### Font Files
1. `themes/fonts/` - Font directory
2. `themes/fonts/iconFonts/` - Icon font mappings

### Markdown Extensions
1. All `marked-*` packages in `node_modules` or package.json

---

## 20. CONCLUSION

**Mythforge is a substantial project with AI Story IDE features that Homebrewery doesn't have.** However, for D&D content creation, it must support all Homebrewery features to be a viable alternative.

**Estimated Total Implementation Time:** 18-25 weeks (4.5-6 months) for full parity

**Recommended Approach:**
1. Start with Phase 1 (Core Rendering) - get basic pages working
2. Move to Phase 2 (Mustache Syntax) - enables most Homebrewery content
3. Implement Phase 4 (Scroll Sync) - critical UX feature
4. Add Phase 3 (Variables) and Phase 5 (Snippets) - power user features
5. Polish with remaining phases

**Key Insight:** The biggest architectural difference is:
- **Homebrewery:** Text-first (markdown is source of truth)
- **Mythforge:** Structure-first (TipTap JSON is source of truth)

**Markdown conversion is OPTIONAL and only needed for:**
- **Import Tool** (optional): Markdown → TipTap JSON - if you want users to migrate existing Homebrewery content
- **Export Tool** (optional): TipTap JSON → Markdown - if you want to provide markdown download for compatibility

**Core Mythforge workflow is pure TipTap:**
```
User types in TipTap editor → TipTap JSON → TipTap renders to HTML → PHB CSS styles it
```

No markdown processing in the core rendering pipeline!

---

**Next Steps:**
1. Review this analysis
2. Prioritize features based on your users' needs
3. Start with Phase 1 implementation
4. Test each feature against Homebrewery examples
5. Build migration tools for existing Homebrewery users

Let me know which area you'd like to dive deeper into!
