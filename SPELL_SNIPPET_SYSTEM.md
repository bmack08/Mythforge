# The Homebrewery Spell Snippet System

## Complete Technical Documentation

This document explains how the PHB spell snippet functionality works in The Homebrewery, from button click to final styled rendering.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Step 1: The Spell Button Click](#step-1-the-spell-button-click)
4. [Step 2: Spell Text Generation](#step-2-spell-text-generation)
5. [Step 3: Text Injection into Editor](#step-3-text-injection-into-editor)
6. [Step 4: Markdown Parsing](#step-4-markdown-parsing)
7. [Step 5: Rendering in Brew Renderer](#step-5-rendering-in-brew-renderer)
8. [Step 6: CSS Styling Application](#step-6-css-styling-application)
9. [Complete Flow Diagram](#complete-flow-diagram)
10. [Key Files Reference](#key-files-reference)
11. [Technologies Used](#technologies-used)

---

## Overview

The Homebrewery uses a **snippet system** to quickly insert pre-formatted content (like spells, monsters, tables) into the editor. When you click the "Spell" button:

1. A **generator function** creates markdown text
2. Text is **injected** into the CodeMirror editor
3. Markdown is **parsed** to HTML using Marked.js
4. HTML is **rendered** in an iframe
5. **CSS styling** is applied based on the selected theme

---

## System Architecture

```
┌─────────────────┐
│  Snippet Bar    │  ← User clicks "Spell" button
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  magic.gen.js   │  ← Generates markdown text
│  (Generator)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Editor         │  ← Injects text into CodeMirror
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  markdown.js    │  ← Parses markdown to HTML
│  (Marked.js)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BrewRenderer   │  ← Renders HTML in iframe
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  style.less     │  ← Applies PHB theme styles
│  (CSS)          │
└─────────────────┘
```

---

## Step 1: The Spell Button Click

### File Location
**`client/homebrew/editor/snippetbar/snippetbar.jsx`**

### How It Works

The SnippetBar component manages all snippet buttons and their organization.

#### Loading Snippets

```jsx
// Import all theme snippets
const ThemeSnippets = {};
ThemeSnippets['Legacy_5ePHB'] = require('themes/Legacy/5ePHB/snippets.js');
ThemeSnippets['V3_5ePHB']     = require('themes/V3/5ePHB/snippets.js');
ThemeSnippets['V3_5eDMG']     = require('themes/V3/5eDMG/snippets.js');
ThemeSnippets['V3_Journal']   = require('themes/V3/Journal/snippets.js');
ThemeSnippets['V3_Blank']     = require('themes/V3/Blank/snippets.js');
```

#### Compiling Snippets

```jsx
compileSnippets : function() {
    let compiledSnippets = [];
    
    // Load snippets from theme bundle
    if(this.props.themeBundle.snippets) {
        for (let snippets of this.props.themeBundle.snippets) {
            if(typeof(snippets) == 'string')
                snippets = ThemeSnippets[snippets];
            
            // Merge parent and child theme snippets
            compiledSnippets = _.values(_.mergeWith(oldSnippets, newSnippets, this.mergeCustomizer));
        }
    }
    
    // Add user-defined snippets
    const userSnippetsasJSON = brewSnippetsToJSON(
        this.props.brew.title || 'New Document', 
        this.props.brew.snippets, 
        this.props.themeBundle.snippets
    );
    compiledSnippets.push(userSnippetsasJSON);
    
    return compiledSnippets;
}
```

#### Handling Click Events

```jsx
handleSnippetClick : function(injectedText){
    // Pass generated text up to parent component
    this.props.onInject(injectedText);
}
```

#### Rendering Snippet Groups

```jsx
<SnippetGroup
    brew={this.props.brew}
    groupName={snippetGroup.groupName}  // "PHB"
    icon={snippetGroup.icon}            // "fas fa-book"
    snippets={snippetGroup.snippets}    // Array of snippets
    onSnippetClick={this.handleSnippetClick}
/>
```

### Snippet Structure

From **`themes/V3/5ePHB/snippets.js`**:

```javascript
{
    groupName : 'PHB',
    icon      : 'fas fa-book',
    view      : 'text',
    snippets  : [
        {
            name : 'Spell',
            icon : 'fas fa-magic',
            gen  : MagicGen.spell,  // Generator function
        },
        {
            name : 'Spell List',
            icon : 'fas fa-scroll',
            gen  : MagicGen.spellList,
        },
        // ... more snippets
    ]
}
```

---

## Step 2: Spell Text Generation

### File Location
**`themes/V3/5ePHB/snippets/magic.gen.js`**

### The Spell Generator Function

```javascript
const _ = require('lodash');

const spellNames = [
    'Astral Rite of Acne',
    'Create Acne',
    'Cursed Ramen Erruption',
    'Dark Chant of the Dentists',
    'Tinsel Blast',
    // ... more spell names
];

module.exports = {
    spell : function(){
        const level = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
        const spellSchools = [
            'abjuration', 'conjuration', 'divination', 
            'enchantment', 'evocation', 'illusion', 
            'necromancy', 'transmutation'
        ];

        // Generate random components
        let components = _.sampleSize(['V', 'S', 'M'], _.random(1, 3)).join(', ');
        if(components.indexOf('M') !== -1){
            components += ` (${_.sampleSize([
                'a small doll', 
                'a crushed button worth at least 1cp', 
                'discarded gum wrapper'
            ], _.random(1, 3)).join(', ')})`;
        }

        // Build the markdown text
        return [
            `#### ${_.sample(spellNames)}`,  // H4 heading
            `*${_.sample(level)}-level ${_.sample(spellSchools)}*`,  // Italic subtitle
            '',
            '**Casting Time:** :: 1 action',  // Definition list
            `**Range:**        :: ${_.sample(['Self', 'Touch', '30 feet', '60 feet'])}`,
            `**Components:**   :: ${components}`,
            `**Duration:**     :: ${_.sample([
                'Until dispelled', 
                '1 round', 
                'Instantaneous', 
                'Concentration, up to 10 minutes', 
                '1 hour'
            ])}`,
            '',
            'A flame, equivalent in brightness to a torch, springs from an object that you touch. ',
            'The effect look like a regular flame, but it creates no heat and doesn\'t use oxygen. ',
            'A *continual flame* can be covered or hidden but not smothered or quenched.',
            '\n\n\n'
        ].join('\n');
    }
};
```

### Example Output

```markdown
#### Tinsel Blast
*3rd-level evocation*

**Casting Time:** :: 1 action
**Range:**        :: 30 feet
**Components:**   :: V, S
**Duration:**     :: 1 round

A flame, equivalent in brightness to a torch, springs from an object that you touch. 
The effect look like a regular flame, but it creates no heat and doesn't use oxygen. 
A *continual flame* can be covered or hidden but not smothered or quenched.


```

---

## Step 3: Text Injection into Editor

### File Location
**`client/homebrew/editor/editor.jsx`**

### How Text Gets Injected

The Editor component receives the generated text and injects it into CodeMirror:

```jsx
handleInject : function(injectText){
    // CodeMirror's custom injectText method
    // inserts text at current cursor position
    this.codeEditor.current?.injectText(injectText, false);
}
```

### SnippetBar Integration

```jsx
render : function(){
    return <div className='editor'>
        <SnippetBar
            brew={this.props.brew}
            onInject={this.handleInject}  // Pass inject handler
            view={this.state.view}
            renderer={this.props.renderer}
            themeBundle={this.props.themeBundle}
        />
        <CodeEditor
            ref={this.codeEditor}
            value={this.props.brew.text}
            onChange={this.props.onTextChange}
        />
    </div>;
}
```

### CodeMirror Integration

The CodeEditor component wraps CodeMirror and provides the `injectText` method:

```jsx
// From naturalcrit/codeEditor/codeEditor.jsx
injectText : function(text, cursorOffset){
    const doc = this.codeMirror.getDoc();
    const cursor = doc.getCursor();
    
    doc.replaceRange(text, cursor);
    
    // Optionally move cursor after injection
    if(cursorOffset !== false){
        const newCursor = {
            line : cursor.line,
            ch   : cursor.ch + text.length
        };
        doc.setCursor(newCursor);
    }
}
```

---

## Step 4: Markdown Parsing

### File Location
**`shared/naturalcrit/markdown.js`**

### The Rendering Pipeline

The markdown text is parsed using the **Marked.js** library with custom extensions:

```javascript
import { marked as Marked } from 'marked';
import MarkedExtendedTables from 'marked-extended-tables';
import MarkedDefinitionLists from 'marked-definition-lists';
import { gfmHeadingId as MarkedGFMHeadingId } from 'marked-gfm-heading-id';

const Markdown = {
    render : (rawBrewText, pageNumber=0)=>{
        // 1. Preprocess text
        rawBrewText = rawBrewText.replace(
            /^\\column(?:break)?$/gm, 
            `\n<div class='columnSplit'></div>\n`
        );
        
        // 2. Tokenize markdown
        const tokens = Marked.lexer(rawBrewText, opts);
        
        // 3. Walk tokens and apply transformations
        Marked.walkTokens(tokens, opts.walkTokens);
        
        // 4. Convert to HTML
        const html = Marked.parser(tokens, opts);
        
        // 5. Post-process HTML
        return opts.hooks.postprocess(html);
    }
};
```

### Markdown to HTML Conversion

**Input Markdown:**
```markdown
#### Tinsel Blast
*3rd-level evocation*

**Casting Time:** :: 1 action
**Range:**        :: 30 feet
```

**Output HTML:**
```html
<h4 id="tinsel-blast">Tinsel Blast</h4>
<p><em>3rd-level evocation</em></p>
<dl>
    <dt><strong>Casting Time:</strong></dt>
    <dd>1 action</dd>
    <dt><strong>Range:</strong></dt>
    <dd>30 feet</dd>
</dl>
```

### Custom Renderer Modifications

```javascript
const renderer = new Marked.Renderer();

// Don't wrap div blocks in <p> tags
renderer.paragraph = function(token){
    const text = this.parser.parseInline(token.tokens);
    if(text.startsWith('<div') || text.startsWith('</div'))
        return `${text}`;
    else
        return `<p>${text}</p>\n`;
};

// Process HTML blocks with markdown inside
renderer.html = function (token) {
    let html = token.text;
    if(_.startsWith(_.trim(html), '<div') && _.endsWith(_.trim(html), '</div>')){
        const openTag = html.substring(0, html.indexOf('>')+1);
        html = html.substring(html.indexOf('>')+1);
        html = html.substring(0, html.lastIndexOf('</div>'));
        return `${openTag} ${Marked.parse(html)} </div>`;
    }
    return html;
};
```

---

## Step 5: Rendering in Brew Renderer

### File Location
**`client/homebrew/brewRenderer/brewRenderer.jsx`**

### The Rendering Process

```jsx
const BrewRenderer = (props)=>{
    // Split text into pages
    if(props.renderer == 'legacy') {
        rawPages = props.text.split(/\\page(?:break)?/m);
    } else {
        rawPages = props.text.split(/^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m);
    }
    
    // Render each page
    const renderPage = (pageText, index)=>{
        // Parse any injected tags from \page{...}
        let classes = 'page';
        let styles = {};
        let attributes = {};
        
        if(pageText.match(/^\\page/)) {
            const injectedTags = parseInlineTags(pageText);
            if(injectedTags) {
                styles = { ...styles, ...injectedTags.styles };
                classes = [classes, injectedTags.classes].join(' ').trim();
                attributes = injectedTags.attributes;
            }
            pageText = pageText.substring(pageText.indexOf('\n') + 1);
        }
        
        // Convert markdown to HTML
        const html = Markdown.render(pageText, index);
        
        // Return a BrewPage component
        return <BrewPage 
            className={classes} 
            index={index} 
            key={index} 
            contents={html} 
            style={styles} 
            attributes={attributes}
            onVisibilityChange={handlePageVisibilityChange} 
        />;
    };
    
    // Render all pages
    const renderedPages = rawPages.map((page, index)=>renderPage(page, index));
    
    return <Frame initialContent={INITIAL_CONTENT}>
        <div className='pages' style={pagesStyle}>
            {renderedPages}
        </div>
    </Frame>;
};
```

### BrewPage Component

```jsx
const BrewPage = (props)=>{
    const cleanText = safeHTML(props.contents);
    
    return <div 
        className={props.className} 
        id={`p${props.index + 1}`} 
        style={props.style} 
        {...props.attributes}
    >
        <div 
            className='columnWrapper' 
            dangerouslySetInnerHTML={{ __html: cleanText }} 
        />
    </div>;
};
```

### IFrame Setup

The brew is rendered inside an iframe with its own HTML document:

```javascript
const INITIAL_CONTENT = dedent`
    <!DOCTYPE html><html><head>
    <link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
    <link href='/homebrew/bundle.css' type="text/css" rel='stylesheet' />
    <base target=_blank>
    </head><body style='overflow: hidden'><div></div></body></html>
`;
```

---

## Step 6: CSS Styling Application

### File Location
**`themes/V3/5ePHB/style.less`**

### CSS Variable Definitions

```less
:root {
    // Colors
    --HB_Color_Background            : #EEE5CE;  // Light parchment
    --HB_Color_Accent                : #E0E5C1;  // Pastel green
    --HB_Color_HeaderUnderline       : #C0AD6A;  // Gold
    --HB_Color_HorizontalRule        : #9C2B1B;  // Maroon
    --HB_Color_HeaderText            : #58180D;  // Dark Maroon
    --HB_Color_MonsterStatBackground : #F2E5B5;  // Light orange parchment
    --HB_Color_CaptionText           : #766649;  // Brown
    --HB_Color_WatercolorStain       : #BBAD82;  // Light brown
    --HB_Color_Footnotes             : #C9AD6A;  // Gold
}
```

### Page Layout

```less
.page {
    // Column layout
    column-count         : 2;
    column-fill          : auto;
    column-gap           : 0.9cm;
    column-width         : 8cm;
    
    // Typography
    font-family      : 'BookInsanityRemake';
    font-size        : 0.34cm;
    
    // Background
    background-image : @backgroundImage;  // Parchment texture
}
```

### Heading Styles

```less
.page {
    h1, h2, h3, h4 {
        margin-top      : 0;
        margin-bottom   : 0;
        font-family     : 'MrEavesRemake';
        font-weight     : 800;
        color           : var(--HB_Color_HeaderText);  // #58180D dark maroon
    }
    
    // H4 - Used for spell names
    h4 {
        font-size   : 0.458cm;
        line-height : 0.971em;
        & + * { 
            margin-top : 0.09cm;  // Space after heading
        }
    }
    
    // Margin before H4 (when it follows other elements)
    * + h4 {
        margin-top : 0.235cm;
    }
}
```

### Text Styling

```less
.page {
    // Paragraphs
    p {
        margin-top    : 0;
        margin-bottom : 0;
        line-height   : 1.35;
    }
    
    * + p { 
        margin-top : 0.325cm; 
    }
    
    // Emphasis (italics)
    em { 
        font-style : italic; 
    }
    
    // Strong (bold)
    strong {
        font-weight    : bold;
        letter-spacing : -0.02em;
    }
}
```

### Definition Lists (Spell Properties)

```less
.useSansSerif() {
    font-family : 'ScalySansRemake';
    font-size   : 0.318cm;
    p, dl, ul, ol { 
        line-height : 1.2em; 
    }
    ul, ol { 
        padding-left : 1em; 
    }
    em { 
        font-style : italic; 
    }
    strong {
        font-weight    : 800;
        letter-spacing : -0.02em;
    }
}

.page {
    dl {
        .useSansSerif();
    }
    
    dt {
        display       : inline;
        margin-left   : 0;
        margin-bottom : 0;
    }
    
    dd {
        display       : inline;
        margin-left   : 0;
        margin-bottom : 0;
        
        &::after {
            content     : '\A';
            white-space : pre;
        }
    }
}
```

### Font Families

The PHB theme uses custom D&D-style fonts:

- **BookInsanityRemake** - Body text (serif, similar to official D&D books)
- **MrEavesRemake** - Headings (small caps, bold)
- **ScalySansRemake** - Sans-serif text (tables, stats, spell properties)
- **SolberaImitationRemake** - Drop caps

---

## Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER ACTION                                │
│                   Clicks "Spell" Button                            │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 1: Snippet Bar (snippetbar.jsx)                              │
│ ─────────────────────────────────────────────────────────────────  │
│ • Loads snippets from theme files                                  │
│ • Finds "Spell" snippet in PHB group                               │
│ • Calls handleSnippetClick()                                       │
│ • Executes MagicGen.spell generator function                       │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 2: Generator Function (magic.gen.js)                         │
│ ─────────────────────────────────────────────────────────────────  │
│ • Randomly selects spell name: "Tinsel Blast"                     │
│ • Randomly selects level: "3rd"                                    │
│ • Randomly selects school: "evocation"                             │
│ • Randomly generates components, range, duration                   │
│ • Builds markdown string with D&D spell format                     │
│ • Returns: "#### Tinsel Blast\n*3rd-level evocation*\n..."        │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 3: Editor Injection (editor.jsx)                             │
│ ─────────────────────────────────────────────────────────────────  │
│ • handleInject() receives markdown text                            │
│ • Calls this.codeEditor.current.injectText()                       │
│ • CodeMirror inserts text at cursor position                       │
│ • Text appears in left editor pane                                 │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ USER SEES in Editor:                                               │
│ ════════════════════════════════════════════════════════════════   │
│ #### Tinsel Blast                                                  │
│ *3rd-level evocation*                                              │
│                                                                    │
│ **Casting Time:** :: 1 action                                      │
│ **Range:**        :: 30 feet                                       │
│ **Components:**   :: V, S                                          │
│ **Duration:**     :: 1 round                                       │
│                                                                    │
│ A flame, equivalent in brightness to a torch, springs from...      │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 4: Markdown Parsing (markdown.js)                            │
│ ─────────────────────────────────────────────────────────────────  │
│ • Marked.js tokenizes markdown                                     │
│ • Processes custom extensions:                                     │
│   - Definition lists (** :: syntax)                                │
│   - Extended tables                                                │
│   - GFM heading IDs                                                │
│ • Converts tokens to HTML:                                         │
│   #### → <h4 id="tinsel-blast">                                   │
│   *text* → <em>text</em>                                          │
│   **Casting Time:** :: → <dt><strong>Casting Time:</strong></dt>  │
│                          <dd>1 action</dd>                        │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ Generated HTML:                                                    │
│ ════════════════════════════════════════════════════════════════   │
│ <h4 id="tinsel-blast">Tinsel Blast</h4>                          │
│ <p><em>3rd-level evocation</em></p>                               │
│ <dl>                                                               │
│   <dt><strong>Casting Time:</strong></dt>                         │
│   <dd>1 action</dd>                                               │
│   <dt><strong>Range:</strong></dt>                                │
│   <dd>30 feet</dd>                                                │
│   ...                                                              │
│ </dl>                                                              │
│ <p>A flame, equivalent in brightness to a torch...</p>            │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 5: Brew Renderer (brewRenderer.jsx)                          │
│ ─────────────────────────────────────────────────────────────────  │
│ • Splits brew text into pages by \page breaks                      │
│ • For each page:                                                   │
│   - Calls Markdown.render(pageText, pageNumber)                   │
│   - Wraps HTML in BrewPage component                              │
│   - Injects into iframe using dangerouslySetInnerHTML            │
│ • Sets up IntersectionObserver for page visibility                │
│ • Manages page navigation and scrolling                            │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ IFrame Structure:                                                  │
│ ════════════════════════════════════════════════════════════════   │
│ <html>                                                             │
│   <head>                                                           │
│     <link href="/homebrew/bundle.css" />                          │
│   </head>                                                          │
│   <body>                                                           │
│     <div class="pages">                                            │
│       <div class="page" id="p1">                                   │
│         <div class="columnWrapper">                                │
│           <!-- Spell HTML here -->                                 │
│         </div>                                                     │
│       </div>                                                       │
│     </div>                                                         │
│   </body>                                                          │
│ </html>                                                            │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ STEP 6: CSS Styling (style.less)                                  │
│ ─────────────────────────────────────────────────────────────────  │
│ • .page class applies:                                             │
│   - Background: #EEE5CE (parchment)                               │
│   - Font: BookInsanityRemake (body)                               │
│   - Column layout: 2 columns                                       │
│                                                                    │
│ • h4 (spell name) gets:                                            │
│   - Color: #58180D (dark maroon)                                  │
│   - Font: MrEavesRemake (serif, bold)                             │
│   - Size: 0.458cm                                                 │
│                                                                    │
│ • em (spell level/school) gets:                                    │
│   - font-style: italic                                            │
│                                                                    │
│ • dl (spell properties) gets:                                      │
│   - Font: ScalySansRemake (sans-serif)                            │
│   - Size: 0.318cm                                                 │
│                                                                    │
│ • p (description) gets:                                            │
│   - Line-height: 1.35                                             │
│   - Standard spacing                                               │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                    FINAL RENDERED OUTPUT                           │
│                                                                    │
│    ╔════════════════════════════════════════════════════════╗     │
│    ║  🎨 PHB-Styled Parchment Background                    ║     │
│    ║                                                        ║     │
│    ║  ┌──────────────────────────────────────────────┐     ║     │
│    ║  │  TINSEL BLAST                                │     ║     │
│    ║  │  3rd-level evocation                         │     ║     │
│    ║  │                                              │     ║     │
│    ║  │  Casting Time: 1 action                     │     ║     │
│    ║  │  Range: 30 feet                             │     ║     │
│    ║  │  Components: V, S                           │     ║     │
│    ║  │  Duration: 1 round                          │     ║     │
│    ║  │                                              │     ║     │
│    ║  │  A flame, equivalent in brightness to a     │     ║     │
│    ║  │  torch, springs from an object that you     │     ║     │
│    ║  │  touch. The effect look like a regular      │     ║     │
│    ║  │  flame, but it creates no heat and doesn't  │     ║     │
│    ║  │  use oxygen. A continual flame can be       │     ║     │
│    ║  │  covered or hidden but not smothered or     │     ║     │
│    ║  │  quenched.                                  │     ║     │
│    ║  └──────────────────────────────────────────────┘     ║     │
│    ║                                                        ║     │
│    ╚════════════════════════════════════════════════════════╝     │
│                                                                    │
│    USER SEES: Perfectly formatted D&D 5e spell in right preview   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Key Files Reference

### Core Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| `client/homebrew/editor/snippetbar/snippetbar.jsx` | Snippet bar UI | `compileSnippets()`, `handleSnippetClick()` |
| `themes/V3/5ePHB/snippets/magic.gen.js` | Spell text generator | `spell()`, `spellList()`, `item()` |
| `client/homebrew/editor/editor.jsx` | Main editor component | `handleInject()`, `updateCurrentCursorPage()` |
| `shared/naturalcrit/markdown.js` | Markdown parser | `render()`, `validate()` |
| `client/homebrew/brewRenderer/brewRenderer.jsx` | Preview renderer | `renderPage()`, `renderPages()` |
| `themes/V3/5ePHB/style.less` | PHB theme styles | CSS rules for `.page`, headings, etc. |

### Theme Files

| File | Purpose |
|------|---------|
| `themes/V3/5ePHB/snippets.js` | PHB snippet definitions |
| `themes/V3/5ePHB/snippets/magic.gen.js` | Spell & magic item generators |
| `themes/V3/5ePHB/snippets/monsterblock.gen.js` | Monster stat block generator |
| `themes/V3/5ePHB/snippets/classtable.gen.js` | Class table generator |
| `themes/V3/5ePHB/snippets/classfeature.gen.js` | Class feature generator |
| `themes/V3/5ePHB/snippets/coverpage.gen.js` | Cover page generator |
| `themes/V3/5ePHB/style.less` | PHB styling rules |

### Supporting Files

| File | Purpose |
|------|---------|
| `shared/helpers.js` | Utility functions |
| `shared/naturalcrit/codeEditor/codeEditor.jsx` | CodeMirror wrapper |
| `client/homebrew/brewRenderer/safeHTML.js` | HTML sanitization |
| `themes/fonts/` | Custom D&D-style fonts |

---

## Technologies Used

### Core Libraries

- **React** (v18+) - UI framework
- **CodeMirror** (v5) - Code editor with syntax highlighting
- **Marked.js** (v4+) - Markdown parser
- **Lodash** - Utility functions
- **LESS** - CSS preprocessor

### Marked.js Extensions

- **marked-extended-tables** - Advanced table syntax
- **marked-definition-lists** - Definition list support (`**term:** :: definition`)
- **marked-alignment-paragraphs** - Text alignment
- **marked-nonbreaking-spaces** - Non-breaking space handling
- **marked-subsuper-text** - Subscript/superscript support
- **marked-smartypants-lite** - Smart quotes and dashes
- **marked-gfm-heading-id** - GitHub-flavored heading IDs
- **marked-emoji** - Emoji support

### Custom Features

- **Variables** - Dynamic text replacement
- **Page breaks** - `\page` and `\column` syntax
- **Inline tags** - `\page{classes, styles}` for custom page styling
- **Snippet system** - Reusable content templates
- **Theme system** - Swappable style themes
- **Live preview** - Real-time rendering in iframe

### Fonts Used (PHB Theme)

- **BookInsanityRemake** - Body text (serif, D&D-style)
- **MrEavesRemake** - Headings (small caps, bold)
- **ScalySansRemake** - Sans-serif (tables, stats, spell properties)
- **SolberaImitationRemake** - Drop caps
- **NodestoCapsCondensed** - Cover pages

---

## Additional Notes

### Customization

Users can customize spells by:

1. **Editing the generated text** - Modify spell name, level, properties, description
2. **Creating custom snippets** - Add snippets in the "Snippet" tab
3. **Using custom CSS** - Override styles in the "Style" tab
4. **Using variables** - Create reusable text with `{{variable}}` syntax

### Performance

- **Lazy rendering** - Only visible pages are re-rendered
- **Intersection Observer** - Tracks page visibility for optimization
- **Throttled updates** - Editor changes are debounced
- **Memoization** - React components use useMemo for expensive operations

### Accessibility

- **Semantic HTML** - Proper heading hierarchy, definition lists
- **Keyboard navigation** - Full keyboard support in editor
- **Screen reader support** - Proper ARIA labels
- **High contrast** - Dark maroon on parchment for readability

---

## Conclusion

The Homebrewery's spell snippet system is a sophisticated pipeline that:

1. **Generates** random D&D-style spell text with proper formatting
2. **Injects** the markdown text into a CodeMirror editor
3. **Parses** the markdown to HTML using Marked.js with custom extensions
4. **Renders** the HTML in an isolated iframe with proper styling
5. **Applies** theme-specific CSS to match the PHB visual style

This modular architecture allows for:
- **Easy theming** - Swap CSS files for different D&D book styles
- **Extensibility** - Add new snippet types without touching core code
- **Flexibility** - Users can edit generated content or create their own
- **Performance** - Efficient rendering with lazy loading and memoization

The result is a powerful tool that lets users create professional-looking D&D homebrew content with a single click!

---

**Document Version:** 1.0  
**Last Updated:** October 17, 2025  
**Author:** Generated from The Homebrewery source code analysis
