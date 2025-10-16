# Footnote & Footer Accent Parity Summary

## ✅ What's Been Implemented

### 1. Footnote Block Extension
- **Location**: `client/extensions/FootnoteBlock.js`
- **Syntax**: `{{footnote Your text here}}`
- **Features**:
  - Auto-detection via input rules (type `{{footnote text}}` and it converts)
  - ProseMirror plugin for real-time paragraph → footnote conversion
  - Optional numbering support via `number` attribute
  - Proper rendering to `<div class="footnote">...</div>`

### 2. Footnote Editor Button
- **Location**: `client/components/TipTapEditor.jsx` (line ~178)
- **Button Added**: 📝 Footnote button in toolbar
- **Command**: `editor.chain().focus().insertFootnote().run()`

### 3. Markdown ↔ TipTap Conversion
- **Parser**: `shared/helpers/markdownToTiptap.js` (lines 93-107)
  - Converts `{{footnote ...}}` markdown → TipTap footnoteBlock JSON
- **Serializer**: `shared/helpers/tiptapToMarkdown.js` (lines 39-42)
  - Converts footnoteBlock JSON → `{{footnote ...}}` markdown
- **Normalizer**: `shared/helpers/normalizeDoc.js`
  - Catches any plain text `{{footnote}}` and converts to structured node

### 4. Footer Accent (PHB Footer Image)
- **Asset**: `build/assets/PHB_footerAccent.png` ✅ EXISTS
- **CSS**: `build/themes/V3/5ePHB/style.css` ✅ COMPILED CORRECTLY
  ```css
  .page::after {
    position: absolute;
    bottom: 0px;
    left: 0px;
    z-index: 100;
    width: 100%;
    height: 50px;
    content: '';
    background-image: url('/assets/PHB_footerAccent.png');
    background-size: cover;
  }
  ```
- **Page Classes**: Brew renderer applies `page phb` classes correctly
- **Even Pages**: Mirror flip via `transform: scaleX(-1)` on `:nth-child(even)`

### 5. Tests Passing
All parity tests pass:
```bash
npm test -- footnote.test.js
✓ parses footnote block and round-trips
✓ normalizer converts raw footnote text
✓ handles trailing spaces inside footnote braces
```

---

## 🔍 How to Verify Footer Accent Is Working

### In Browser DevTools:
1. Start dev server: `npm run dev`
2. Open a brew in edit mode
3. Open DevTools (F12) and inspect a `.page` element in the preview iframe
4. Look for the `::after` pseudo-element with:
   - `background-image: url('/assets/PHB_footerAccent.png')`
   - `height: 50px`
   - `z-index: 100`

### Visual Check:
- Each page should have a subtle decorative footer accent at the bottom
- The accent should flip horizontally on even pages
- Footnote text (if present) should appear above the accent

---

## 🐛 If Footer Accent Doesn't Appear

### Possible Issues & Fixes:

1. **Theme not loading in iframe**
   - Check browser console for 404 errors on `/themes/V3/5ePHB/style.css`
   - Verify `props.theme` is set to `'5ePHB'` in editPage

2. **Asset path incorrect**
   - Ensure `/assets/PHB_footerAccent.png` is accessible
   - Check server is serving static assets from `build/assets/`

3. **CSS specificity conflict**
   - Another rule might be overriding `.page::after`
   - Check for `!important` rules or higher specificity selectors

4. **Z-index stacking**
   - Footer is `z-index: 100`
   - Footnote text is `z-index: 150`
   - Page content should be `z-index: 15` or lower

5. **Missing pseudo-element content**
   - Must have `content: ''` for `::after` to render
   - ✅ This is present in the compiled CSS

---

## 🚀 Quick Test Commands

### Run Tests:
```bash
npm test -- footnote.test.js
```

### Rebuild Themes:
```bash
npm run build
```

### Check Built CSS:
```powershell
Get-Content "build\themes\V3\5ePHB\style.css" | Select-String "::after"
```

### Verify Asset Exists:
```powershell
Test-Path "build\assets\PHB_footerAccent.png"
```

---

## 📝 Other Parity Items Checked

### ✅ Already Implemented:
- Page breaks (`\page`)
- Column breaks (`\column`)
- Headings (H1, H2, H3)
- Bold, Italic formatting
- Horizontal rules (`---`)
- Icons (`:ei_*:`, `:gi_*:`)
- Quote blocks
- Sidebar blocks
- Note blocks
- Wide blocks
- Headers & Footers
- Page numbers

### 🔄 Known Differences from Homebrewery:
- TipTap JSON as source of truth instead of raw Markdown
- Markdown compatibility layer via `markdownToTiptap` / `tiptapToMarkdown`
- Block-level editing vs line-based editing

---

## 🎯 Next Steps (If Footer Still Not Visible)

1. **Inspect the actual rendered HTML** in the iframe:
   ```javascript
   // In browser console:
   document.getElementById('BrewRenderer').contentDocument.querySelector('.page')
   ```

2. **Check computed styles**:
   ```javascript
   // In browser console:
   const page = document.getElementById('BrewRenderer').contentDocument.querySelector('.page');
   const afterStyle = window.getComputedStyle(page, '::after');
   console.log(afterStyle.backgroundImage);
   console.log(afterStyle.height);
   ```

3. **Verify theme bundle loading**:
   - Check Network tab for successful theme CSS load
   - Ensure no CORS errors
   - Verify iframe `<head>` contains theme `<link>` tag

---

## 🎨 Footer Accent Styling Details

### From Homebrewery PHB Theme:
- **Image**: Decorative swoosh/flourish at page bottom
- **Height**: 50px
- **Position**: Absolute, bottom: 0, left: 0
- **Width**: 100% of page
- **Z-index**: 100 (below footnote text at 150, above content at 15)
- **Even pages**: Flipped horizontally for visual symmetry

### Page Layout:
```
┌─────────────────────┐
│                     │ ← Page content (z-index: 15)
│                     │
│                     │
├─────────────────────┤
│ CHAPTER 1 | INTRO   │ ← Footnote text (z-index: 150, bottom: 32px)
│ ~~~~~~~~~~~~~~~~~~~~ │ ← Footer accent (z-index: 100, bottom: 0, height: 50px)
│        1            │ ← Page number (z-index: auto, bottom: 22px)
└─────────────────────┘
```

---

## ✨ Summary

**Footnotes**: ✅ Fully implemented and tested  
**Footer Accent CSS**: ✅ Compiled correctly  
**Footer Accent Asset**: ✅ Present in build/assets  
**Page Classes**: ✅ Applied correctly (`page phb`)  
**Theme Loading**: ✅ Wired into Frame component  

**Expected Result**: Footer accent should appear on all pages automatically when using the 5ePHB theme.

If you're still not seeing the footer accent, it's likely a runtime loading issue rather than a code/CSS issue. Check the browser DevTools Network tab and Console for any errors when loading the theme CSS or assets.
