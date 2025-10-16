# Homebrewery TipTap Parity Checklist

## ✅ Verified Working Features

### Core Layout
- [x] Page breaks (`\page`)
- [x] Column breaks (`\column`)
- [x] Column containers (`{column-count:2}`)
- [x] Page numbers (auto & manual)
- [x] **Footer accent** (PHB decorative footer image)
- [x] **Footnotes** (`{{footnote ...}}`)

### Typography
- [x] Headings (H1 `#`, H2 `##`, H3 `###`)
- [x] Bold (`**text**`)
- [x] Italic (`*text*`)
- [x] Horizontal rules (`---`)

### D&D Content Blocks
- [x] Quote blocks (`{{quote ... }}`)
- [x] Sidebar blocks
- [x] Note blocks
- [x] Wide blocks
- [x] Monster stat blocks
- [x] Spell blocks
- [x] Feature blocks

### Inline Marks
- [x] Icons (`:ei_*:`, `:gi_*:`)
- [x] Spell references (`\spell{}`)
- [x] Ability references (`\ability{}`)
- [x] Skill references (`\skill{}`)
- [x] Condition references (`\condition{}`)
- [x] Damage references (`\damage{}`)

### Styling
- [x] Mustache inline (`{{class content}}`)
- [x] Mustache blocks (`{{class\n...\n}}`)
- [x] Legacy style tags support

---

## 🧪 How to Test Each Feature

### 1. Footnotes
```markdown
{{footnote PART 1 | CHARACTER CREATION}}
```
**Expected**: Styled footnote text at bottom of page, above footer accent

### 2. Footer Accent
**Expected**: Decorative swoosh image at bottom of every page
- Visible on all pages when using 5ePHB theme
- Flipped horizontally on even-numbered pages

**Test in DevTools**:
```javascript
// Open DevTools in preview iframe
const page = document.querySelector('.page');
const afterStyle = window.getComputedStyle(page, '::after');
console.log(afterStyle.backgroundImage); // Should show PHB_footerAccent.png
console.log(afterStyle.height); // Should be 50px
```

### 3. Page Numbers
```markdown
{{pagenumber}}
```
**Expected**: Auto-incrementing page number in footer

### 4. Icons
```markdown
:ei_barbarian_reckless_attack:
:gi_wyvern:
```
**Expected**: Inline icon renders as styled `<span>` element

### 5. Page Breaks
Type in editor:
```
\page
```
Or click the "📄 Page" button in toolbar

**Expected**: New page starts in preview

---

## 🚨 Known Issues & Workarounds

### If Footer Accent Not Visible:

1. **Check theme is 5ePHB**:
   ```javascript
   // In editPage.jsx, verify:
   brew.theme === '5ePHB'
   ```

2. **Verify asset serves**:
   - Navigate to: `http://localhost:8081/assets/PHB_footerAccent.png`
   - Should show the decorative footer image

3. **Check CSS loaded in iframe**:
   ```javascript
   // In browser console:
   const frame = document.getElementById('BrewRenderer');
   const links = frame.contentDocument.querySelectorAll('link[rel="stylesheet"]');
   console.log(links); // Should include 5ePHB/style.css
   ```

4. **Rebuild themes**:
   ```bash
   npm run build
   ```

### If Footnotes Not Working:

1. **Verify extension loaded**:
   ```javascript
   // In client/extensions/index.js
   // FootnoteBlock should be in extensions array
   ```

2. **Check toolbar button**:
   - Look for 📝 Footnote button in TipTap editor toolbar
   - Click should insert footnote block

3. **Test input rule**:
   - Type `{{footnote test}}` in editor
   - Should auto-convert to footnote block

---

## 🔧 Rebuild Commands

### Full rebuild:
```bash
npm run build
```

### Run tests:
```bash
npm test -- footnote.test.js
```

### Dev server:
```bash
npm run dev
```

---

## 📊 Feature Comparison: Homebrewery vs Mythforge

| Feature | Homebrewery | Mythforge | Notes |
|---------|-------------|-----------|-------|
| Page breaks | ✅ | ✅ | `\page` syntax |
| Column breaks | ✅ | ✅ | `\column` syntax |
| Footnotes | ✅ | ✅ | `{{footnote}}` syntax |
| Footer accent | ✅ | ✅ | Auto-applied via CSS |
| Page numbers | ✅ | ✅ | Auto-increment |
| Icons | ✅ | ✅ | `:ei_*:` and `:gi_*:` |
| Headings | ✅ | ✅ | `#`, `##`, `###` |
| Quote blocks | ✅ | ✅ | `{{quote}}` |
| Monster blocks | ✅ | ✅ | Custom extension |
| Spell blocks | ✅ | ✅ | Custom extension |
| Tables | ✅ | ✅ | TipTap table extension |
| Images | ✅ | ✅ | With attributes |
| Mustache styling | ✅ | ✅ | Block & inline |

---

## 🎨 Visual Hierarchy (Z-Index)

From bottom to top:
1. Page background (auto)
2. Footer accent (`z-index: 100`)
3. Page content (`z-index: 15`)
4. Footnote text (`z-index: 150`)
5. Headers/overlays (higher)

---

## 🚀 Quick Start Test

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:8081`

3. Create a new brew or edit existing

4. Test footnote button:
   - Click "📝 Footnote" in toolbar
   - Should insert `{{footnote }}` block
   - Type content inside

5. Verify footer accent:
   - Open DevTools (F12)
   - Inspect `.page` element in iframe
   - Check `::after` pseudo-element
   - Should have `background-image: url('/assets/PHB_footerAccent.png')`

6. Test auto-conversion:
   - Type `{{footnote CHAPTER 1}}` in editor
   - Should auto-convert to footnote block
   - Preview should show styled footnote at bottom of page

---

## ✅ Success Criteria

All features work correctly when:
- Tests pass (`npm test`)
- Visual inspection matches Homebrewery output
- No console errors in browser DevTools
- Footer accent visible on all pages
- Footnotes render in correct position (above footer accent)
- All toolbar buttons functional
- Round-trip conversion (markdown → JSON → markdown) preserves content

---

## 📝 Additional Notes

- **TipTap JSON** is now the source of truth (not raw markdown)
- Markdown compatibility maintained via `markdownToTiptap` / `tiptapToMarkdown` helpers
- All Homebrewery legacy syntax supported through normalization layer
- Footer accent is purely CSS-driven (no JavaScript required)
- Page numbers use CSS counters for auto-increment
- Icons use custom TipTap extensions for inline rendering

---

## 🐛 Debugging Tips

### Enable verbose logging:
Add to browser console:
```javascript
localStorage.setItem('debug', 'mythforge:*');
```

### Check TipTap state:
```javascript
// In TipTapEditor component:
console.log(editor.getJSON());
```

### Inspect iframe content:
```javascript
const frame = document.getElementById('BrewRenderer');
const doc = frame.contentDocument;
console.log(doc.documentElement.outerHTML);
```

### Verify theme bundle:
```javascript
// In editPage.jsx:
console.log(props.brew.theme);
console.log(state.themeBundle);
```

---

**Last Updated**: After TipTap migration completion  
**Status**: ✅ Full parity with Homebrewery core features
