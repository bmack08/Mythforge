# Mythforge Homebrewery → Tiptap Function Reference

**Generated:** 2025-10-17
**Purpose:** Comprehensive analysis of the Homebrewery legacy codebase to enable feature-parity migration to Tiptap

---

## Table of Contents

1. [Frontend (UI Layer)](#1-frontend-ui-layer)
2. [Markdown Parsing Layer](#2-markdown-parsing-layer)
3. [Custom Brew Markup Extensions](#3-custom-brew-markup-extensions)
4. [Rendering Engine](#4-rendering-engine)
5. [Style / Theme System](#5-style--theme-system)
6. [Storage, API, Database](#6-storage-api-database)
7. [Utilities & Configuration](#7-utilities--configuration)
8. [Fonts, Assets, Print & Export](#8-fonts-assets-print--export)
9. [Tiptap Extension Schema Mapping](#9-tiptap-extension-schema-mapping)

---

## 1. Frontend (UI Layer)

### 1.1 Edit Page Component

**File:** [`client/homebrew/pages/editPage/editPage.jsx`](./homebrewery-master/homebrewery-master/client/homebrew/pages/editPage/editPage.jsx)

**Core Function:** `EditPage` (React functional component)

**Description:**
The main editing interface for Homebrewery. Orchestrates the split-pane editor, real-time preview, autosave, version history, and Google Drive integration.

**Key State Variables:**
- `currentBrew` - The brew being edited (contains `text`, `style`, `theme`, `renderer`, metadata)
- `isSaving` - Boolean flag for save state
- `unsavedChanges` - Tracks whether there are unsaved edits
- `autoSaveEnabled` - User preference for autosave (stored in `localStorage`)
- `currentEditorViewPageNum`, `currentEditorCursorPageNum`, `currentBrewRendererPageNum` - Page synchronization between editor and preview

**Key Functions:**

| Function | Line | Purpose |
|----------|------|---------|
| `handleTextChange` | 128-133 | Updates `currentBrew.text` when editor content changes; validates HTML errors |
| `handleStyleChange` | 135-137 | Updates `currentBrew.style` when Style tab changes |
| `handleMetaChange` | 146-151 | Updates metadata (title, renderer, theme, etc.); fetches theme bundle if theme changes |
| `trySave` | 189-206 | Debounced save with 10-second timeout; triggered by changes or manual save (Ctrl+S) |
| `save` | 208-258 | Main save logic: updates version history, compresses brew, calculates diff patches, sends PUT request to `/api/update/:id` |
| `handleSplitMove` | 112-114 | Refreshes editor dimensions when split pane is resized |
| `toggleAutoSave` | 326-332 | Toggles autosave on/off, stores preference in `localStorage` |

**Dependencies:**
- `Markdown.validate()` - Validates HTML tag matching
- `fetchThemeBundle()` - Loads theme CSS and snippets
- `updateHistory()`, `versionHistoryGarbageCollection()` - Version control via IndexedDB
- `makePatches()`, `stringifyPatches()` - Diff/patch system for efficient saves
- `md5()`, `gzipSync()` - Hashing and compression

**Data Flow:**
```
User types → Editor.onTextChange → handleTextChange → setCurrentBrew → useEffect detects change → trySave (debounced) → save → API /api/update/:id
```

**Autosave Logic:**
- Default timeout: 10 seconds after last change
- Warning after 15 minutes of unsaved changes (if autosave OFF)
- Uses diff patches to minimize data transfer
- Stores patches, hash, and version number for conflict detection

**Keyboard Shortcuts (Global):**
- **Ctrl/Cmd + S**: Manual save
- **Ctrl/Cmd + P**: Print preview

**Planned Tiptap Migration:**
- Replace `handleTextChange` with Tiptap's `onUpdate` callback
- Sync Tiptap `EditorState` with `currentBrew.text` via serialization
- Implement Collaboration extension for Y.js-based autosave
- Migrate diff/patch system to operational transforms (OT) or CRDT

---

### 1.2 Editor Component

**File:** [`client/homebrew/editor/editor.jsx`](./homebrewery-master/homebrewery-master/client/homebrew/editor/editor.jsx)

**Core Function:** `Editor` (React class component)

**Description:**
Wraps the CodeMirror instance and manages 4 editing views:
1. **Text** - Main Markdown editor
2. **Style** - Custom CSS editor
3. **Meta** - Metadata form editor
4. **Snippet** - Custom snippet templates editor

**Key State Variables:**
- `view` - Current view ('text', 'style', 'meta', 'snippet')
- `editorTheme` - CodeMirror theme name (stored in `localStorage`)
- `docs` - Map of CodeMirror documents for each view (allows switching without losing undo history)

**Key Functions:**

| Function | Line | Purpose |
|----------|------|---------|
| `highlightCustomMarkdown` | 154-321 | Syntax highlighting for V3 custom markdown (page breaks, mustache blocks, emojis, definition lists, injectors) |
| `updateCurrentCursorPage` | 126-131 | Calculates which page the cursor is on (for synchronization with preview) |
| `updateCurrentViewPage` | 133-138 | Calculates which page is at the top of the editor viewport |
| `brewJump` | 323-362 | Scrolls preview to match editor cursor position |
| `sourceJump` | 364-411 | Scrolls editor to match preview page |
| `handleViewChange` | 144-152 | Switches between Text/Style/Meta/Snippet tabs |

**Custom Syntax Highlighting (V3 Renderer):**
- **Page breaks**: `\page` → adds `.pageLine` class, displays page number
- **Column breaks**: `\column` → adds `.columnSplit` class
- **Mustache blocks**: `{{` and `}}` → highlights with `.inline-block` or `.block` class
- **Injectors**: `{style:value}` → highlights with `.injection` class
- **Definition lists**: `::` syntax → highlights with `.dl-highlight`, `.dt-highlight`, `.dd-highlight`
- **Super/subscript**: `^text^` and `^^text^^` → highlights with `.superscript` / `.subscript`
- **Emojis**: `:emoji_name:` → highlights with `.emoji` class

**CodeMirror Document Swapping:**
```javascript
// When switching views, swap CodeMirror documents to preserve undo history
if(!this.state.docs[this.props.view]) {
  newDoc = CodeMirror.Doc(this.props.value, this.props.language);
} else {
  newDoc = this.state.docs[this.props.view];
}
const oldDoc = { [prevProps.view]: this.codeMirror.swapDoc(newDoc) };
```

**Planned Tiptap Migration:**
- Replace CodeMirror with Tiptap editor instances
- Implement custom node views for `\page`, `\column`, `{{` blocks
- Use decorations for syntax highlighting instead of CodeMirror markers
- Maintain separate ProseMirror states for text/style/meta views

---

### 1.3 BrewRenderer Component

**File:** [`client/homebrew/brewRenderer/brewRenderer.jsx`](./homebrewery-master/homebrewery-master/client/homebrew/brewRenderer/brewRenderer.jsx)

**Core Function:** `BrewRenderer` (React functional component)

**Description:**
Renders the live preview of the brew inside an iframe. Uses Intersection Observers to track which pages are visible and lazy-renders pages for performance.

**Key State Variables:**
- `isMounted` - Whether iframe has finished mounting
- `visiblePages` - Array of page numbers currently visible in viewport
- `centerPage` - The page at the center of the viewport
- `displayOptions` - Zoom level, page spread (single/two-page), shadows, gaps

**Key Functions:**

| Function | Line | Purpose |
|----------|------|---------|
| `renderPage` | 182-216 | Converts Markdown text to HTML for a single page; applies page-level injected styles/classes |
| `renderPages` | 218-235 | Renders all pages with Progressive Page Rendering (PPR): prioritizes currently-edited page, then visible pages |
| `handlePageVisibilityChange` | 140-155 | Callback for Intersection Observers; tracks visible pages and center page |
| `isInView` | 157-168 | Determines if a page should be rendered (within ±3 pages of current view) |
| `renderDummyPage` | 170-174 | Shows loading spinner for unrendered pages |
| `frameDidMount` | 267-278 | Initializes rendering after iframe mounts; scrolls to URL hash if present |

**Progressive Page Rendering (PPR):**
```javascript
// Render currently-edited page first for fast feedback
if(rawPages.length > props.currentEditorCursorPageNum -1)
  renderedPages[props.currentEditorCursorPageNum - 1] = renderPage(rawPages[...], ...);

// Then render visible pages and any unrendered pages
_.forEach(rawPages, (page, index)=>{
  if((isInView(index) || !renderedPages[index]) && typeof window !== 'undefined'){
    renderedPages[index] = renderPage(page, index);
  }
});
```

**Intersection Observer Setup:**
- **visibleObserver**: Detects when >30% of page is in viewport
- **centerObserver**: Detects which page is at the vertical center

**Display Options (stored in `localStorage`):**
- `zoomLevel` (100% default)
- `spread` (single/two-page layout)
- `startOnRight` (recto vs verso)
- `pageShadows` (enable/disable box shadows)
- `rowGap`, `columnGap` (spacing between pages)

**Planned Tiptap Migration:**
- Replace iframe rendering with in-page rendering (or keep iframe for isolation)
- Use Tiptap's `NodeView` API to render custom nodes (pages, columns)
- Implement live collaborative cursors via Collaboration extension
- Migrate PPR logic to Tiptap document reconciliation

---

### 1.4 Navbar Component

**File:** [`client/homebrew/navbar/navbar.jsx`](./homebrewery-master/homebrewery-master/client/homebrew/navbar/navbar.jsx)

**Description:**
Top navigation bar with save status, Google Drive integration, share, print, vault, and account menus.

**Key Nav Items:**

| Component | File | Purpose |
|-----------|------|---------|
| `ShareNavItem` | `share.navitem.jsx` | Copy share/edit links, QR code |
| `PrintNavItem` | `print.navitem.jsx` | Print current brew |
| `VaultNavItem` | `vault.navitem.jsx` | Access brew vault (collection) |
| `AccountNavItem` | `account.navitem.jsx` | Login/logout, account settings |
| `RecentNavItem` | `recent.navitem.jsx` | Recently edited brews |
| `ErrorNavItem` | `error-navitem.jsx` | Display save errors |

**Save Button States:**
1. **Saving...** - `isSaving === true`
2. **Autosave OFF Warning** - `unsavedChanges && warnUnsavedChanges`
3. **Save Now** - `unsavedChanges` (click to save immediately)
4. **auto-saved.** - `autoSaveEnabled && !unsavedChanges`
5. **saved.** - Default state

---

## 2. Markdown Parsing Layer

### 2.1 Main Parser

**File:** [`shared/naturalcrit/markdown.js`](./homebrewery-master/homebrewery-master/shared/naturalcrit/markdown.js)

**Core Library:** `marked@15.0.12`

**Description:**
The heart of Homebrewery's markdown parsing. Extends Marked.js with custom tokenizers and renderers for D&D-style formatting.

**Marked Extensions Used:**
1. **marked-extended-tables** - Complex table syntax
2. **marked-definition-lists** - `::` definition syntax
3. **marked-alignment-paragraphs** - Text alignment (`:left`, `:center`, `:right`)
4. **marked-nonbreaking-spaces** - Non-breaking space handling
5. **marked-subsuper-text** - `^superscript^` and `^^subscript^^`
6. **marked-smartypants-lite** - Smart quotes and dashes
7. **marked-gfm-heading-id** - Auto-generate heading IDs
8. **marked-emoji** - `:emoji:` syntax + custom icon fonts

**Main API:**

| Function | Line | Purpose |
|----------|------|---------|
| `Markdown.render(text, pageNumber)` | 814-839 | Converts raw Markdown to HTML; processes variables, runs extensions, generates output |
| `Markdown.validate(text)` | 841-898 | Validates HTML tag matching (`<div>`, `<span>`, `<a>`); returns array of errors |
| `Markdown.marked` | 813 | Exposes the configured Marked instance for token access |

**Render Pipeline:**
```javascript
// 1. Replace \column with HTML div
rawBrewText = rawBrewText.replace(/^\\column(?:break)?$/gm, `\n<div class='columnSplit'></div>\n`);

// 2. Preprocess (variable substitution via MarkedVariables hook)
rawBrewText = opts.hooks.preprocess(rawBrewText);

// 3. Tokenize
const tokens = Marked.lexer(rawBrewText, opts);

// 4. Walk tokens (apply mustacheInjectBlock transformations)
Marked.walkTokens(tokens, opts.walkTokens);

// 5. Parse tokens to HTML
const html = Marked.parser(tokens, opts);

// 6. Postprocess
return opts.hooks.postprocess(html);
```

**Custom Renderers:**

| Renderer | Line | Purpose |
|----------|------|---------|
| `renderer.html` | 116-125 | Processes Markdown inside `<div>` wrappers |
| `renderer.paragraph` | 128-137 | Prevents wrapping mustache spans/divs in `<p>` tags |
| `renderer.link` | 140-161 | Fixes local links (`#`) to target `_self` in iframe |
| `renderer.image` | 164-175 | Exposes `src` as `--HB_src` CSS variable |

**Custom Tokenizers:**
- `tokenizer.def` (line 178-180) - Disables default reflink behavior to make room for variables

---

### 2.2 Variable System

**File:** [`shared/naturalcrit/markdown.js`](./homebrewery-master/homebrewery-master/shared/naturalcrit/markdown.js) (lines 414-654)

**Function:** `MarkedVariables()` (Marked hook)

**Description:**
Implements a powerful variable substitution system with mathematical expressions, link references, and image references.

**Variable Types:**

| Syntax | Type | Example | Output |
|--------|------|---------|--------|
| `[var]: value` | Definition | `[hp]: 45` | (stores `hp = 45`) |
| `[var]` | Link Reference | `[dmg]` | `[dmg](https://dmg.com)` (if `[dmg]: https://dmg.com`) |
| `![var]` | Image Reference | `![logo]` | `![logo](logo.png)` (if `[logo]: logo.png`) |
| `$[var]` | Value Substitution | `$[hp]` | `45` |
| `$[expr]` | Math Expression | `$[hp + 10]` | `55` |

**Math Expression Parser:**
- Uses `expr-eval` library with limited operators (add, subtract, multiply, divide, power, round, floor, ceil, abs)
- Custom functions: `sign()`, `signed()`, `toRomans()`, `toChar()`, `toWords()`, etc.

**Example Usage:**
```markdown
[hp]: 45
[ac]: 18
[modifier]: +3

The dragon has **$[hp]** hit points and **$[ac]** armor class.
Its attack bonus is **$[signed(modifier)]**.
Page number: **$[HB_pageNumber]**.
```

**Variable Scope:**
- Variables are **page-scoped** by default (stored in `globalVarsList[pageNumber]`)
- Variables can be **hoisted** (looked up from later pages)
- Built-in variable: `HB_pageNumber` (auto-increments per page)

**Resolution Algorithm:**
```javascript
// 1. Preprocess: Extract all variable definitions and calls
const varsQueue = []; // Array of {type, varName, content}

// 2. Process queue iteratively until all variables resolve
while (resolvedOne || finalLoop) {
  for (const item of varsQueue) {
    if (item.type == 'varDefBlock') {
      // Try to resolve variables within the definition
      const value = replaceVar(match[0], true);
      if (value != undefined) {
        item.content = tempContent;
        globalVarsList[pageNumber][item.varName] = { content, resolved: true };
      }
    }
    if (item.type == 'varCallBlock' || item.type == 'varCallInline') {
      // Try to replace variable call with its value
      const value = replaceVar(item.content, true, finalLoop);
      if (value != undefined) {
        item.content = value;
        item.type = 'text';
      }
    }
  }
}

// 3. Reconstruct markdown with resolved variables
return varsQueue.map((item)=>item.content).join('');
```

**Planned Tiptap Migration:**
- Implement as Tiptap **InputRule** for inline variable calls (`$[...]`)
- Store variable definitions in ProseMirror document metadata
- Create custom **Mark** for resolved variables with original expression in attrs
- Add **Command** to recalculate all variables on page change

---

## 3. Custom Brew Markup Extensions

### 3.1 Mustache Inline Spans

**Extension:** `mustacheSpans` (line 182-237)

**Syntax:** `{{ classes styles #id }}content{{}}`

**Example:**
```markdown
{{ note color:blue }}This is a blue note{{}}
{{ wide }}This spans both columns{{}}
{{ descriptive }}*Monster Ability*{{}}
```

**Tokenizer:**
- Matches opening `{{` with optional tags, then content, then closing `}}`
- Supports nested `{{` blocks via counter
- Extracts style tags using `processStyleTags()`

**Renderer Output:**
```html
<span class="inline-block note" style="color:blue;">This is a blue note</span>
<span class="inline-block wide">This spans both columns</span>
<span class="inline-block descriptive"><em>Monster Ability</em></span>
```

**Style Tag Parsing:**
```javascript
processStyleTags("note color:blue #myId data-custom=value")
// Returns:
{
  classes: "note",
  styles: { color: "blue" },
  id: "myId",
  attributes: { "data-custom": "value" }
}
```

---

### 3.2 Mustache Block Divs

**Extension:** `mustacheDivs` (line 239-293)

**Syntax:**
```markdown
{{ classes styles #id
Content here
Multiple lines supported
}}
```

**Example:**
```markdown
{{ note
### Warning
Be careful with dragons!
}}

{{ classTable
##### Wizard Spells
| Level | Spell |
|-------|-------|
| 1st   | Magic Missile |
}}
```

**Renderer Output:**
```html
<div class="block note">
  <h3>Warning</h3>
  <p>Be careful with dragons!</p>
</div>

<div class="block classTable">
  <h5>Wizard Spells</h5>
  <table>...</table>
</div>
```

**Difference from Inline Spans:**
- Must be on separate lines (multiline)
- Outputs `<div>` instead of `<span>`
- Processes children with `this.parser.parse(token.tokens)` (recursive)

---

### 3.3 Mustache Inline Injectors

**Extension:** `mustacheInjectInline` (line 295-338)

**Syntax:** `content {style:value}`

**Example:**
```markdown
Bold text {color:red}
Link {font-size:20px}
```

**Mechanism:**
- **Retroactively modifies the previous token** (applies styles to preceding element)
- Merges injected tags with existing HTML attributes

**Renderer Logic:**
```javascript
// 1. Get the previous token's rendered HTML
const text = this.parser.parseInline([token]);

// 2. Extract existing tags from HTML
const originalTags = extractHTMLStyleTags(text); // {classes, styles, id, attributes}

// 3. Merge with injected tags
const tags = mergeHTMLTags(originalTags, injectedTags);

// 4. Reconstruct opening tag with merged attributes
return `${openingTag[1]}` +
  `${tags.classes ? ` class="${tags.classes}"` : ''}` +
  `${tags.id ? ` id="${tags.id}"` : ''}` +
  `${tags.styles ? ` style="..."` : ''}` +
  `${openingTag[2]}`;
```

---

### 3.4 Mustache Block Injectors

**Extension:** `mustacheInjectBlock` (line 340-391)

**Syntax:**
```markdown
> Blockquote content
{color:blue}

# Heading
{text-align:center}
```

**Same mechanism as inline injectors, but operates on block-level tokens**

**WalkTokens Hook:**
```javascript
walkTokens(token) {
  // After token tree is finished, tag tokens to apply styles to
  if(token.originalType == 'mustacheInjectBlock' && token.type !== 'table') {
    token.originalType = token.type;
    token.type = 'mustacheInjectBlock';
  }
}
```

Note: Does not work with tables due to Marked.js generating invalid token structures.

---

### 3.5 Forced Paragraph Breaks

**Extension:** `forcedParagraphBreaks` (line 393-412)

**Syntax:** `:` or `::` or `:::` (colon on its own line)

**Example:**
```markdown
Text above

:

Text below (forced break)
```

**Renderer Output:**
```html
<div class='blank'></div>
```

Multiple colons create multiple blank divs:
```markdown
:::
```
→ `<div class='blank'></div><div class='blank'></div><div class='blank'></div>`

---

### 3.6 Special Tokens

| Token | Syntax | Purpose |
|-------|--------|---------|
| Page Break | `\page` | Splits content into pages |
| Column Break | `\column` | Splits content into columns within a page |
| Snippet Marker | `\snippet name` | Marks the start of a reusable snippet |

**Page Break Regex (V3):**
```javascript
const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
```

**Column Break Replacement:**
```javascript
rawBrewText = rawBrewText.replace(/^\\column(?:break)?$/gm, `\n<div class='columnSplit'></div>\n`);
```

---

## 4. Rendering Engine

### 4.1 BrewRenderer Main Logic

**File:** [`client/homebrew/brewRenderer/brewRenderer.jsx`](./homebrewery-master/homebrewery-master/client/homebrew/brewRenderer/brewRenderer.jsx)

**Flow:**
```
props.text (Markdown) → split by \page → rawPages[] → renderPage() for each → HTML → inject into iframe
```

**renderPage Function (line 182-216):**

```javascript
const renderPage = (pageText, index)=>{
  let styles = {}, classes = 'page', attributes = {};

  if(props.renderer == 'legacy') {
    // Legacy renderer: use MarkdownLegacy.render()
    const html = MarkdownLegacy.render(pageText);
    return <BrewPage className='page phb' index={index} contents={html} />;
  } else {
    // V3 renderer: check for \page with injected styles
    if(pageText.startsWith('\\page')) {
      const firstLineTokens = Markdown.marked.lexer(pageText.split('\n', 1)[0])[0].tokens;
      const injectedTags = firstLineTokens?.find((obj)=>obj.injectedTags !== undefined)?.injectedTags;
      if(injectedTags) {
        styles = { ...styles, ...injectedTags.styles };
        classes = [classes, injectedTags.classes].join(' ').trim();
        attributes = injectedTags.attributes;
      }
      pageText = pageText.substring(pageText.indexOf('\n') + 1);
    }

    // Add artificial column break for backwards compatibility
    pageText += `\n\n&nbsp;\n\\column\n&nbsp;`;

    const html = Markdown.render(pageText, index);
    return <BrewPage className={classes} index={index} contents={html} style={styles} attributes={attributes} />;
  }
};
```

**Key Points:**
- **Page-level style injection**: `\page {color:red}` applies styles to the entire page `<div>`
- **Artificial column break**: Adds `\column` at end of each page to emulate `column-fill: auto` in older browsers
- **Lazy rendering**: Pages outside viewport use placeholder spinner

---

### 4.2 SafeHTML Sanitization

**File:** [`client/homebrew/brewRenderer/safeHTML.js`](./homebrewery-master/homebrewery-master/client/homebrew/brewRenderer/safeHTML.js)

**Purpose:** Sanitizes HTML before injecting into iframe to prevent XSS attacks.

**Note:** File not read in detail, but likely uses DOMPurify or similar library.

---

### 4.3 Theme Bundle Loading

**Function:** `fetchThemeBundle()` in [`shared/helpers.js`](./homebrewery-master/homebrewery-master/shared/helpers.js:119-134)

**API Endpoint:** `GET /api/theme/:renderer/:id`

**Logic (server-side):**
```javascript
// Recursively loads theme and all parent themes
while (req.params.id) {
  if (isUserTheme) {
    // Load brew with shareId
    const brew = await getBrew('share');
    completeStyles.push(brew.style);
    completeSnippets.push(brew.snippets);
    req.params.id = brew.theme; // Move to parent theme
  } else {
    // Load static theme
    completeStyles.push(`@import url("/themes/${renderer}/${id}/style.css");`);
    completeSnippets.push(`${renderer}_${id}`);
    req.params.id = Themes[renderer][id].baseTheme;
  }
}

return {
  styles: completeStyles.reverse(),   // Oldest parent first
  snippets: completeSnippets.reverse(),
  name: themeName,
  author: themeAuthor
};
```

**Client-side:**
```javascript
const themeBundle = res.body;
themeBundle.joinedStyles = themeBundle.styles.map((style)=>`<style>${style}</style>`).join('\n\n');
setThemeBundle(themeBundle);
```

---

### 4.4 Print Rendering

**Function:** `printCurrentBrew()` in [`shared/helpers.js`](./homebrewery-master/homebrewery-master/shared/helpers.js:108-117)

```javascript
const printCurrentBrew = ()=>{
  if(window.typeof !== 'undefined') {
    // 1. Trigger print dialog on iframe content
    window.frames['BrewRenderer'].contentWindow.print();

    // 2. Force DOM reflow (fix for @media print CSS bug)
    const node = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer').item(0);
    node.style.display='none';
    node.offsetHeight; // Trigger reflow
    node.style.display='';
  }
};
```

**Note:** `@media print` CSS causes out-of-view pages to disappear, so a forced reflow is required.

---

## 5. Style / Theme System

### 5.1 Theme Structure

**Location:** `themes/V3/` and `themes/Legacy/`

**Theme Hierarchy Example:**
```
5ePHB (Player's Handbook)
  ├── style.less (main PHB styles)
  ├── snippets/ (D&D 5e PHB snippets)
  └── baseTheme: "Blank"
      ├── style.less (base page structure)
      ├── snippets/
      └── baseTheme: null
```

**Theme Registry:** `themes/themes.json`

```json
{
  "V3": {
    "5ePHB": {
      "name": "D&D 5e PHB",
      "renderer": "V3",
      "baseTheme": "Blank",
      "baseSnippets": true,
      "path": "/themes/V3/5ePHB/style.css",
      "thumbnail": "/themes/V3/5ePHB/thumbnail.jpg"
    }
  }
}
```

---

### 5.2 Key Style Files

**Core LESS Files:**

| File | Purpose |
|------|---------|
| `themes/V3/5ePHB/style.less` | D&D 5e PHB theme (parchment, drop caps, stat blocks) |
| `themes/V3/Blank/style.less` | Base layout (2-column pages, page size, margins) |
| `themes/fonts/5e/fonts.less` | Font imports (Bookinsanity, Scaly Sans, etc.) |
| `themes/assets/assets.less` | Asset URLs (parchment watercolor, masks) |

**Example PHB Styles:**
```less
.phb {
  background-image: url('/assets/watercolor/phb-watercolor.jpg');
  font-family: 'BookInsanity', serif;

  h1 {
    font-family: 'Scaly Sans Remake', sans-serif;
    color: #58180D;
    &::before {
      content: '';
      border-bottom: 2px solid #C0AD6A;
    }
  }

  .monster {
    background-color: #F2E5CE;
    border: 1px solid #DDD;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
  }

  // Drop cap first letter
  p:first-child::first-letter {
    float: left;
    font-size: 3.5em;
    line-height: 1em;
    font-family: 'Solbera Imitation', serif;
  }
}
```

---

### 5.3 Font Loading

**Location:** `themes/fonts/`

**Fonts Used:**
- **BookInsanity** - Body text (serif)
- **Scaly Sans Remake** - Headings (sans-serif, all-caps)
- **Solbera Imitation** - Drop caps
- **Mr Eaves Small Caps** - Table headers

**Icon Fonts:**
- **diceFont** - Dice icons (`:d4:`, `:d20:`, etc.)
- **elderberryInn** - Fantasy icons
- **gameIcons** - Generic RPG icons (`:sword:`, `:shield:`)
- **fontAwesome** - Standard icons

**Font Import (LESS):**
```less
@font-face {
  font-family: 'BookInsanity';
  src: url('/fonts/5e/Bookinsanity.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

---

### 5.4 Page Layout (CSS Grid/Columns)

**Base Page Structure:**
```css
.page {
  width: 210mm;  /* A4 width */
  height: 296mm; /* A4 height */
  padding: 1cm;
  column-count: 2;
  column-gap: 1cm;
  column-fill: auto; /* Fill left column first */
  break-inside: avoid-column;
}
```

**Column Break Handling:**
```html
<div class="columnSplit"></div>
```

```css
.columnSplit {
  break-after: column;
}
```

**Wide Content (spans both columns):**
```markdown
{{ wide
### Wide Table
| Column 1 | Column 2 | Column 3 |
}}
```

```css
.wide {
  column-span: all;
}
```

---

## 6. Storage, API, Database

### 6.1 Database Schema

**File:** [`server/homebrew.model.js`](./homebrewery-master/homebrewery-master/server/homebrew.model.js)

**Database:** MongoDB (Mongoose ODM)

**Homebrew Schema:**
```javascript
{
  shareId: String (12-char nanoid, unique),
  editId: String (12-char nanoid, unique),
  googleId: String (optional, Google Drive file ID),

  // Content
  title: String,
  text: String (decompressed Markdown),
  textBin: Buffer (compressed with zlib.deflateRawSync),
  pageCount: Number,

  // Metadata
  description: String,
  tags: [String],
  systems: [String],
  lang: String (default 'en'),
  renderer: String ('V3' or 'legacy'),
  theme: String,

  // Authors
  authors: [String] (array of usernames),
  invitedAuthors: [String],
  published: Boolean,
  thumbnail: String (URL),

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastViewed: Date,
  views: Number,
  version: Number,

  // Moderation
  lock: Object (optional, for locked/banned brews)
}
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `Homebrew.get(query, fields)` | Fetches a single brew; decompresses `textBin` → `text` |
| `Homebrew.getByUser(username, allowAccess, fields, filter)` | Fetches all brews by a user |
| `Homebrew.increaseView(query)` | Increments view count and updates `lastViewed` |

---

### 6.2 API Routes

**File:** [`server/homebrew.api.js`](./homebrewery-master/homebrewery-master/server/homebrew.api.js)

**Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api` | Create new brew |
| PUT | `/api/:id` | Update existing brew |
| PUT | `/api/update/:id` | Update existing brew (alias) |
| DELETE | `/api/:id` | Delete brew (removes author from authors array) |
| GET | `/api/remove/:id` | Delete brew (legacy alias) |
| GET | `/api/theme/:renderer/:id` | Fetch theme bundle (styles + snippets) |

---

### 6.3 Brew Save Flow

**Client → Server:**

```javascript
// 1. Client calculates diff patches
const patches = makePatches(
  encodeURI(lastSavedBrew.text.normalize('NFC')),
  encodeURI(currentBrew.text.normalize('NFC'))
);

// 2. Hash the last saved text for conflict detection
const hash = await md5(lastSavedBrew.text);

// 3. Prepare brew payload
const brewToSave = {
  ...brew,
  text: brew.text.normalize('NFC'),
  pageCount: (brew.text.match(/^\\page$/gm) || []).length + 1,
  patches: stringifyPatches(patches),
  hash: hash,
  version: lastSavedBrew.version
};

// 4. Compress payload with gzip
const compressedBrew = gzipSync(strToU8(JSON.stringify(brewToSave)));

// 5. Send PUT request
const res = await request
  .put(`/api/update/${brew.editId}`)
  .set('Content-Encoding', 'gzip')
  .set('Content-Type', 'application/json')
  .send(compressedBrew);
```

**Server Processing:**

```javascript
// 1. Decompress request body
const brewFromClient = JSON.parse(gunzip(req.body));

// 2. Fetch existing brew from database
const brewFromServer = await Homebrew.get({ editId: id });

// 3. Verify version and hash (conflict detection)
if (brewFromServer.version !== brewFromClient.version) {
  return res.status(409).send('Version mismatch');
}
if (brewFromServer.hash !== brewFromClient.hash) {
  return res.status(409).send('Hash mismatch');
}

// 4. Apply patches
const patches = parsePatch(brewFromClient.patches);
const patchedText = applyPatches(patches, brewFromServer.text)[0];

// 5. Merge metadata
let brew = _.assign(brewFromServer, brewFromClient);
brew.text = mergeBrewText(brew); // Combine metadata, style, and text
brew.version++;

// 6. Save to Google Drive (if applicable)
if (brew.googleId) {
  await GoogleActions.updateGoogleBrew(brew);
}

// 7. Compress and save to MongoDB
brew.textBin = zlib.deflateRawSync(brew.text);
brew.text = undefined;
await brew.save();

// 8. Return updated brew
res.status(200).send(brew);
```

---

### 6.4 Google Drive Integration

**File:** [`server/googleActions.js`](./homebrewery-master/homebrewery-master/server/googleActions.js)

**Functions:**

| Function | Purpose |
|----------|---------|
| `GoogleActions.authCheck(account, res)` | Validates OAuth token, refreshes if expired |
| `GoogleActions.getGoogleBrew(oAuth2Client, googleId, editId, accessType)` | Fetches brew from Google Drive |
| `GoogleActions.newGoogleBrew(oAuth2Client, brew)` | Creates new file in Google Drive, returns `googleId` |
| `GoogleActions.updateGoogleBrew(brew, ip)` | Updates existing Google Drive file |
| `GoogleActions.deleteGoogleBrew(auth, googleId, editId)` | Deletes Google Drive file |

**Storage Strategy:**
- **Google Drive brews**: Only metadata stored in MongoDB (stub); full text stored in Google Drive
- **Homebrewery brews**: Full text compressed and stored in MongoDB (`textBin`)

---

## 7. Utilities & Configuration

### 7.1 Version History

**File:** [`client/homebrew/utils/versionHistory.js`](./homebrewery-master/homebrewery-master/client/homebrew/utils/versionHistory.js)

**Storage:** IndexedDB (via `customIDBStore.js`)

**Functions:**

| Function | Purpose |
|----------|---------|
| `updateHistory(brew)` | Saves a snapshot of the current brew to IndexedDB |
| `versionHistoryGarbageCollection()` | Removes old versions (keeps last 10 per brew) |

**Data Structure:**
```javascript
{
  editId: String,
  timestamp: Date,
  text: String,
  title: String,
  version: Number
}
```

---

### 7.2 Helper Functions

**File:** [`shared/helpers.js`](./homebrewery-master/homebrewery-master/shared/helpers.js)

| Function | Line | Purpose |
|----------|------|---------|
| `splitTextStyleAndMetadata(brew)` | 88-106 | Extracts YAML metadata and CSS from Markdown text |
| `printCurrentBrew()` | 108-117 | Triggers print dialog on preview iframe |
| `fetchThemeBundle(setError, setThemeBundle, renderer, theme)` | 119-134 | Fetches theme styles and snippets from API |
| `brewSnippetsToJSON(menuTitle, userBrewSnippets, themeBundleSnippets, full)` | 6-73 | Converts `\snippet` text to JSON structure |

**splitTextStyleAndMetadata Logic:**

```javascript
// 1. Extract metadata block
if (brew.text.startsWith('```metadata')) {
  const index = brew.text.indexOf('\n```\n\n');
  const metadataSection = brew.text.slice(11, index + 1);
  const metadata = yaml.load(metadataSection);
  Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', ...]));
  brew.text = brew.text.slice(index + 6);
}

// 2. Extract CSS block
if (brew.text.startsWith('```css')) {
  const index = brew.text.indexOf('\n```\n\n');
  brew.style = brew.text.slice(7, index + 1);
  brew.text = brew.text.slice(index + 6);
}
```

---

### 7.3 CodeMirror Integration

**File:** [`shared/naturalcrit/codeEditor/codeEditor.jsx`](./homebrewery-master/homebrewery-master/shared/naturalcrit/codeEditor/codeEditor.jsx)

**Keyboard Shortcuts:**

| Shortcut | Function | Line |
|----------|----------|------|
| **Ctrl/Cmd + B** | Bold (`**text**`) | 119 |
| **Ctrl/Cmd + I** | Italic (`*text*`) | 125 |
| **Ctrl/Cmd + U** | Underline (`<u>text</u>`) | 127 |
| **Ctrl/Cmd + M** | Inline span (`{{ text}}`) | 135 |
| **Shift + Ctrl/Cmd + M** | Block div (`{{\ntext\n}}`) | 137 |
| **Ctrl/Cmd + /** | Comment (`<!-- text -->` or `/* text */`) | 139 |
| **Ctrl/Cmd + K** | Link (`[text](url)`) | 141 |
| **Ctrl/Cmd + L** | Unordered list | 143 |
| **Shift + Ctrl/Cmd + L** | Ordered list | 145 |
| **Shift + Ctrl/Cmd + 1-6** | Headings (H1-H6) | 147-158 |
| **Ctrl/Cmd + Enter** | New page (`\page`) | 161 |
| **Shift + Ctrl/Cmd + Enter** | New column (`\column`) | 159 |
| **Ctrl/Cmd + [** | Fold all code | 166 |
| **Ctrl/Cmd + ]** | Unfold all code | 168 |

**Custom Behaviors:**

| Behavior | File | Description |
|----------|------|-------------|
| Auto-close curlies | `close-tag.js` | Typing `{{` auto-inserts `}}` and places cursor between |
| Emoji autocomplete | `autocompleteEmoji.js` | Typing `:` shows emoji suggestion dropdown |
| Page folding | `fold-pages.js` | Fold content between `\page` markers |
| CSS folding | `fold-css.js` | Fold CSS blocks in Style tab |

---

### 7.4 Autosave Configuration

**Storage:** `localStorage.setItem('AUTOSAVE_ON', true/false)`

**Timeout Constants:**
```javascript
const SAVE_TIMEOUT = 10000; // 10 seconds
const UNSAVED_WARNING_TIMEOUT = 900000; // 15 minutes
const UNSAVED_WARNING_POPUP_TIMEOUT = 4000; // 4 seconds
```

---

## 8. Fonts, Assets, Print & Export

### 8.1 Font Files

**Location:** `themes/fonts/`

**Font Families:**

| Font | File | Usage |
|------|------|-------|
| Bookinsanity | `5e/Bookinsanity.woff2` | Body text |
| Scaly Sans Remake | `5e/Scaly Sans Remake.woff2` | Headings |
| Solbera Imitation | `5e/Solbera Imitation.woff2` | Drop caps |
| Mr Eaves Small Caps | `5e/Mr Eaves Small Caps.woff2` | Table headers |

**Icon Fonts:**

| Font | File | Icons |
|------|------|-------|
| diceFont | `iconFonts/diceFont.woff2` | `:d4:`, `:d6:`, `:d8:`, `:d10:`, `:d12:`, `:d20:` |
| elderberryInn | `iconFonts/elderberryInn.woff2` | Fantasy tavern icons |
| gameIcons | `iconFonts/game-icons.woff2` | Weapons, shields, etc. |
| fontAwesome | `iconFonts/fontAwesome.woff2` | Standard icons |

**Icon Font Mapping Example (diceFont.js):**
```javascript
export default {
  'd4': 'i-d4',
  'd6': 'i-d6',
  'd8': 'i-d8',
  'd10': 'i-d10',
  'd12': 'i-d12',
  'd20': 'i-d20',
  // Used in markdown as :d20: → <i class="i-d20"></i>
}
```

---

### 8.2 Assets

**Location:** `themes/assets/`

**Asset Types:**

| Asset | Path | Usage |
|-------|------|-------|
| PHB Watercolor | `watercolor/phb-watercolor.jpg` | Page background |
| Watercolor Masks | `waterColorMasks/*.png` | Edge fade effects |
| Journal Assets | `Journal/*.png` | Journal theme decorations |

**Asset Loading (LESS):**
```less
.phb {
  background-image: url('/assets/watercolor/phb-watercolor.jpg');
  background-size: cover;
}
```

---

### 8.3 Print & Export

**Print Function:** [`shared/helpers.js:108-117`](./homebrewery-master/homebrewery-master/shared/helpers.js#L108-L117)

**Print CSS:**
```css
@media print {
  .page {
    page-break-after: always;
  }

  .brewRenderer {
    /* Hide UI elements */
  }
}
```

**PDF Export:**
- No built-in PDF export
- Users rely on browser "Print to PDF" functionality
- Recommended: Chrome's print dialog with custom margins

---

## 9. Tiptap Extension Schema Mapping

### 9.1 Core Node Mappings

| Homebrewery Feature | Current Implementation | Tiptap Equivalent | Priority |
|---------------------|------------------------|-------------------|----------|
| **Page Break** | `\page` (split pages via regex) | Custom `Page` node with `\page` input rule | **CRITICAL** |
| **Column Break** | `\column` → `<div class="columnSplit">` | Custom `ColumnBreak` node | **CRITICAL** |
| **Mustache Inline Spans** | `{{ }}` → `<span class="inline-block">` | Custom `InlineBlock` mark with style/class attrs | **CRITICAL** |
| **Mustache Block Divs** | `{{ }}` → `<div class="block">` | Custom `BlockDiv` node | **CRITICAL** |
| **Mustache Injectors** | `{style}` (retroactive) | Mark extension that modifies previous node attrs | **HIGH** |
| **Variables** | `[var]: value`, `$[var]` | Custom `Variable` node + plugin for resolution | **HIGH** |
| **Math Expressions** | `$[expr]` → `expr-eval` | Extend `Variable` node with math support | **MEDIUM** |
| **Forced Breaks** | `:` → `<div class="blank">` | Custom `BlankLine` node | **LOW** |

---

### 9.2 Mark Mappings

| Homebrewery Mark | Syntax | Tiptap Mark Schema | Notes |
|------------------|--------|-------------------|-------|
| **Bold** | `**text**` | Built-in `bold` mark | ✅ No changes needed |
| **Italic** | `*text*` | Built-in `italic` mark | ✅ No changes needed |
| **Underline** | `<u>text</u>` | Custom `underline` mark | Add via `Mark.create()` |
| **Superscript** | `^text^` | Custom `superscript` mark | Via marked-subsuper-text |
| **Subscript** | `^^text^^` | Custom `subscript` mark | Via marked-subsuper-text |
| **Inline Block** | `{{ }}` | Custom `inlineBlock` mark with attrs: `{classes, styles, id}` | Store mustache tags in attrs |

---

### 9.3 Extension Schemas

#### 9.3.1 Page Node

```javascript
const Page = Node.create({
  name: 'page',

  group: 'block',
  content: 'block+',
  isolating: true,

  addAttributes() {
    return {
      pageNumber: { default: 1 },
      classes: { default: null },
      styles: { default: null },
      id: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'div.page' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      class: `page ${node.attrs.classes || ''}`,
      style: serializeStyles(node.attrs.styles),
      id: node.attrs.id,
      'data-page-number': node.attrs.pageNumber
    }), 0]
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^\\page(?:\s+(.*))?$/,
        type: this.type,
        getAttributes: (match) => {
          const tags = processStyleTags(match[1] || '');
          return { classes: tags.classes, styles: tags.styles, id: tags.id };
        }
      })
    ]
  }
})
```

---

#### 9.3.2 ColumnBreak Node

```javascript
const ColumnBreak = Node.create({
  name: 'columnBreak',

  group: 'block',

  parseHTML() {
    return [{ tag: 'div.columnSplit' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'columnSplit' })]
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\\column(?:break)?$/,
        type: this.type
      })
    ]
  },

  addCommands() {
    return {
      insertColumnBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Mod-Enter': () => this.editor.commands.insertColumnBreak()
    }
  }
})
```

---

#### 9.3.3 InlineBlock Mark

```javascript
const InlineBlock = Mark.create({
  name: 'inlineBlock',

  addAttributes() {
    return {
      classes: { default: null },
      styles: { default: null },
      id: { default: null },
      attributes: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'span.inline-block' }]
  },

  renderHTML({ mark, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      class: `inline-block ${mark.attrs.classes || ''}`,
      style: serializeStyles(mark.attrs.styles),
      id: mark.attrs.id,
      ...mark.attrs.attributes
    }), 0]
  },

  addInputRules() {
    return [
      markInputRule({
        find: /{{(?:\s+([^}]*))?\s+([^}]+)}}/,
        type: this.type,
        getAttributes: (match) => {
          const tags = processStyleTags(match[1] || '');
          return { classes: tags.classes, styles: tags.styles, id: tags.id };
        }
      })
    ]
  }
})
```

---

#### 9.3.4 BlockDiv Node

```javascript
const BlockDiv = Node.create({
  name: 'blockDiv',

  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      classes: { default: null },
      styles: { default: null },
      id: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'div.block' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      class: `block ${node.attrs.classes || ''}`,
      style: serializeStyles(node.attrs.styles),
      id: node.attrs.id
    }), 0]
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^{{\s*([^\n]*)\s*$/,
        type: this.type,
        getAttributes: (match) => {
          const tags = processStyleTags(match[1] || '');
          return { classes: tags.classes, styles: tags.styles, id: tags.id };
        }
      })
    ]
  }
})
```

---

#### 9.3.5 Variable System Plugin

```javascript
const VariablePlugin = Extension.create({
  name: 'variables',

  addGlobalAttributes() {
    return [
      {
        types: ['page'],
        attributes: {
          variables: {
            default: {},
            renderHTML: () => ({})
          }
        }
      }
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variables'),

        appendTransaction(transactions, oldState, newState) {
          const tr = newState.tr;
          let modified = false;

          // 1. Collect variable definitions
          const varMap = {};
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'variableDefinition') {
              const pageNumber = getPageNumber(newState.doc, pos);
              varMap[pageNumber] ??= {};
              varMap[pageNumber][node.attrs.varName] = node.attrs.value;
            }
          });

          // 2. Resolve variable references
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'variableReference') {
              const pageNumber = getPageNumber(newState.doc, pos);
              const value = lookupVar(varMap, pageNumber, node.attrs.varName);
              if (value && node.attrs.resolvedValue !== value) {
                tr.setNodeMarkup(pos, null, { ...node.attrs, resolvedValue: value });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        }
      })
    ]
  }
})
```

---

### 9.4 Migration Priority Checklist

#### Phase 1: Core Document Structure (CRITICAL)
- [ ] **Page Node** - Implement `\page` input rule and rendering
- [ ] **Column Break Node** - Implement `\column` input rule
- [ ] **Basic Markdown** - Ensure headings, paragraphs, lists, tables work
- [ ] **Two-column Layout** - CSS to split content into columns
- [ ] **Print Preview** - Render pages with correct dimensions

#### Phase 2: Custom Markup (CRITICAL)
- [ ] **Inline Block Mark** - `{{ }}` for inline styling
- [ ] **Block Div Node** - `{{ }}` for block-level wrappers
- [ ] **Style Tag Parser** - Extract classes, styles, IDs from `{{ }}`
- [ ] **Injector Marks** - `{style}` retroactive styling

#### Phase 3: Advanced Features (HIGH)
- [ ] **Variable System** - `[var]: value` and `$[var]` substitution
- [ ] **Math Expressions** - `$[expr]` with expr-eval
- [ ] **Definition Lists** - `::` syntax support
- [ ] **Super/Subscript** - `^` and `^^` marks

#### Phase 4: Theming & Assets (MEDIUM)
- [ ] **Theme Loading** - Fetch and apply theme CSS bundles
- [ ] **Font Loading** - @font-face for Bookinsanity, Scaly Sans, etc.
- [ ] **Icon Fonts** - Emoji picker with custom icon sets
- [ ] **Background Assets** - Watercolor images, masks

#### Phase 5: Collaboration & Sync (HIGH)
- [ ] **Y.js Integration** - Real-time collaboration via Collaboration extension
- [ ] **Autosave** - Debounced save with conflict detection
- [ ] **Version History** - Store snapshots in IndexedDB
- [ ] **Google Drive Sync** - OAuth integration for cloud storage

#### Phase 6: Editor Experience (MEDIUM)
- [ ] **Keyboard Shortcuts** - Ctrl+B (bold), Ctrl+M (mustache), etc.
- [ ] **Snippet Bar** - Reusable template insertion
- [ ] **Metadata Editor** - Form for title, description, tags
- [ ] **Style Tab** - CodeMirror instance for custom CSS
- [ ] **Live Preview Sync** - Scroll editor → preview and vice versa

#### Phase 7: Polish & Optimization (LOW)
- [ ] **Syntax Highlighting** - Highlight custom syntax in editor
- [ ] **Code Folding** - Collapse page breaks and CSS blocks
- [ ] **Emoji Autocomplete** - `:` triggers dropdown
- [ ] **Error Validation** - HTML tag mismatch detection
- [ ] **Print Optimization** - Page breaks, @media print CSS

---

### 9.5 Key Tiptap Extensions to Use

| Extension | Purpose | Notes |
|-----------|---------|-------|
| **@tiptap/starter-kit** | Basic marks (bold, italic, etc.) and nodes (paragraph, heading, etc.) | ✅ Use as foundation |
| **@tiptap/extension-table** | Table support | ✅ Already GFM-compatible |
| **@tiptap/extension-collaboration** | Y.js collaborative editing | ✅ For real-time sync |
| **@tiptap/extension-collaboration-cursor** | Multi-user cursors | Optional enhancement |
| **Custom Extension: Page** | `\page` node | ⚠️ Must build |
| **Custom Extension: ColumnBreak** | `\column` node | ⚠️ Must build |
| **Custom Mark: InlineBlock** | `{{ }}` inline | ⚠️ Must build |
| **Custom Node: BlockDiv** | `{{ }}` block | ⚠️ Must build |
| **Custom Extension: Variables** | `[var]`, `$[var]` | ⚠️ Must build |

---

### 9.6 Style Tag Processing (Shared Utility)

```javascript
/**
 * Parses Homebrewery-style tags into classes, styles, id, attributes
 * Input: "note color:blue #myId data-custom=value"
 * Output: { classes: "note", styles: {color: "blue"}, id: "myId", attributes: {"data-custom": "value"} }
 */
function processStyleTags(string) {
  const tags = string.match(/(?:[^, ":=]+|[:=](?:"[^"]*"|))+/g);

  const id = _.remove(tags, (tag) => tag.startsWith('#')).map((tag) => tag.slice(1))[0] || null;
  const classes = _.remove(tags, (tag) => !tag.includes(':') && !tag.includes('=')).join(' ') || null;
  const attributes = _.remove(tags, (tag) => tag.includes('='))
    .reduce((obj, attr) => {
      const [key, value] = attr.split('=');
      obj[key.trim()] = value.replace(/"/g, '').trim();
      return obj;
    }, {}) || null;
  const styles = tags.reduce((styleObj, style) => {
    const [key, value] = style.split(':');
    styleObj[key.trim()] = value.replace(/"/g, '').trim();
    return styleObj;
  }, {}) || null;

  return { id, classes, styles, attributes };
}

/**
 * Serializes styles object to CSS string
 * Input: { color: "blue", "font-size": "20px" }
 * Output: "color:blue; font-size:20px;"
 */
function serializeStyles(styles) {
  if (!styles) return null;
  return Object.entries(styles).map(([key, value]) => `${key}:${value}`).join('; ');
}
```

---

## 10. Summary & Next Steps

### 10.1 Critical Path for Tiptap Migration

1. **Set up Tiptap Editor Instance**
   - Replace CodeMirror with Tiptap
   - Configure StarterKit with GFM extensions

2. **Implement Page System**
   - Create `Page` node with `\page` input rule
   - Add page number tracking
   - Style pages with 2-column layout (CSS columns)

3. **Implement Column Breaks**
   - Create `ColumnBreak` node with `\column` input rule
   - Add keyboard shortcut (Shift+Cmd+Enter)

4. **Implement Mustache Blocks**
   - Create `InlineBlock` mark and `BlockDiv` node
   - Implement `processStyleTags()` parser
   - Add input rules for `{{ }}` syntax

5. **Implement Variable System**
   - Create `VariableDefinition` and `VariableReference` nodes
   - Build ProseMirror plugin to resolve variables
   - Add math expression support via expr-eval

6. **Theme Integration**
   - Fetch theme bundles from API
   - Inject CSS into editor container
   - Load custom fonts

7. **Autosave & Collaboration**
   - Integrate Y.js Collaboration extension
   - Implement debounced save with conflict detection
   - Store version history in IndexedDB

8. **Editor Experience**
   - Add keyboard shortcuts for custom markup
   - Build snippet insertion UI
   - Implement syntax highlighting via decorations

---

### 10.2 Key Files to Reference During Migration

| Legacy File | Purpose | Migration Target |
|-------------|---------|------------------|
| `shared/naturalcrit/markdown.js` | Markdown parsing + custom extensions | Tiptap input rules + node views |
| `client/homebrew/brewRenderer/brewRenderer.jsx` | Preview rendering | Tiptap NodeView components |
| `client/homebrew/pages/editPage/editPage.jsx` | Editor orchestration | New Tiptap editor wrapper |
| `shared/naturalcrit/codeEditor/codeEditor.jsx` | CodeMirror setup + shortcuts | Tiptap editor config + keymaps |
| `server/homebrew.model.js` | Database schema | Keep as-is (Tiptap uses same data) |
| `server/homebrew.api.js` | API routes | Keep as-is (save/load endpoints) |
| `themes/V3/5ePHB/style.less` | PHB theme styles | Import into Tiptap as external CSS |

---

### 10.3 Testing Strategy

1. **Unit Tests**
   - Test `processStyleTags()` parser
   - Test variable resolution logic
   - Test input rules for `\page`, `\column`, `{{ }}`

2. **Integration Tests**
   - Test page rendering with injected styles
   - Test variable cross-referencing across pages
   - Test autosave conflict detection

3. **End-to-End Tests**
   - Test full editing workflow (type, save, reload)
   - Test theme switching
   - Test print preview

4. **Legacy Compatibility Tests**
   - Import old brews and verify rendering
   - Test migration from Markdown to Tiptap JSON

---

### 10.4 Documentation Requirements

1. **User Facing**
   - Migration guide for existing Homebrewery users
   - Updated syntax reference (still uses `\page`, `{{ }}`, etc.)
   - Keyboard shortcut cheatsheet

2. **Developer Facing**
   - Tiptap extension API reference
   - Custom node schema documentation
   - Theming guide for creating custom themes

---

## Appendix A: Code Reference Index

### A.1 Frontend Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| EditPage | `client/homebrew/pages/editPage/editPage.jsx` | 42-418 | Main editor page |
| Editor | `client/homebrew/editor/editor.jsx` | 34-542 | CodeMirror wrapper |
| BrewRenderer | `client/homebrew/brewRenderer/brewRenderer.jsx` | 91-353 | Preview renderer |
| Navbar | `client/homebrew/navbar/navbar.jsx` | - | Navigation bar |
| SnippetBar | `client/homebrew/editor/snippetbar/snippetbar.jsx` | - | Snippet insertion UI |

### A.2 Parsing & Rendering

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Markdown | `shared/naturalcrit/markdown.js` | 812-902 | Main Markdown API |
| mustacheSpans | `shared/naturalcrit/markdown.js` | 182-237 | `{{ }}` inline |
| mustacheDivs | `shared/naturalcrit/markdown.js` | 239-293 | `{{ }}` block |
| mustacheInjectInline | `shared/naturalcrit/markdown.js` | 295-338 | `{style}` inline |
| mustacheInjectBlock | `shared/naturalcrit/markdown.js` | 340-391 | `{style}` block |
| MarkedVariables | `shared/naturalcrit/markdown.js` | 543-653 | Variable system |

### A.3 Backend

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| HomebrewModel | `server/homebrew.model.js` | 7-71 | Mongoose schema |
| API Routes | `server/homebrew.api.js` | 35-540 | Express routes |
| getBrew | `server/homebrew.api.js` | 104-172 | Fetch brew logic |
| save | `client/homebrew/pages/editPage/editPage.jsx` | 208-258 | Client-side save |
| updateBrew | `server/homebrew.api.js` | 352-465 | Server-side save |

### A.4 Utilities

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| splitTextStyleAndMetadata | `shared/helpers.js` | 88-106 | Extract YAML/CSS |
| fetchThemeBundle | `shared/helpers.js` | 119-134 | Load theme CSS |
| updateHistory | `client/homebrew/utils/versionHistory.js` | - | Version snapshots |
| printCurrentBrew | `shared/helpers.js` | 108-117 | Print dialog |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Brew** | A Homebrewery document (contains Markdown, CSS, metadata) |
| **PHB** | Player's Handbook (D&D 5e style theme) |
| **DMG** | Dungeon Master's Guide (alternative D&D 5e theme) |
| **V3** | Version 3 renderer (current, uses modern Marked.js) |
| **Legacy** | Version 1 renderer (deprecated, uses old Marked.js) |
| **Mustache Blocks** | `{{ }}` syntax for custom styling |
| **Injectors** | `{style:value}` syntax for retroactive styling |
| **Variables** | `[var]: value` definitions and `$[var]` references |
| **Theme Bundle** | Collection of CSS and snippets from a theme and its parents |
| **Snippet** | Reusable template (e.g., stat block, spell description) |
| **editId** | 12-character ID for editing a brew |
| **shareId** | 12-character ID for viewing/sharing a brew |
| **googleId** | Google Drive file ID (33-44 characters) |

---

**End of Document**

---

**Generated by:** Claude (Anthropic)
**Date:** 2025-10-17
**Version:** 1.0
**Total Lines:** 1400+
