# Homebrewery → Mythwright Feature Parity — Fix Summary

> All fixes applied and build verified (Vite build succeeds with 0 errors)

---

## FIXES APPLIED

### Fix 1: Editor Heading Typography (CRITICAL)
**File:** `client/components/tiptap.less`

**Problem:** All headings (h1-h5) looked identical to body text in the editor — generic Noto Serif font, same color, no size differentiation.

**Fix:**
- Added 6 `@font-face` declarations at the top of the file:
  - MrEavesRemake (headers h1-h4)
  - BookInsanityRemake (body text — normal, bold, italic, bold-italic)
  - ScalySansSmallCapsRemake (h5 captions)
- Set `.ProseMirror` body font to `BookInsanityRemake, 'Noto Serif', Georgia, serif`
- Replaced generic heading rule with individual D&D-styled rules:
  - h1: 28px, MrEavesRemake, #58180D (dark maroon)
  - h2: 24px, MrEavesRemake, #58180D
  - h3: 18px, MrEavesRemake, #58180D, **gold underline** (2px solid #C0AD6A)
  - h4: 16px, MrEavesRemake, #58180D
  - h5: 14px, ScalySansSmallCapsRemake
- Font paths use absolute URLs (`/fonts/5e/...`) served via Vite proxy → Express

---

### Fix 2: Spell Block CSS
**File:** `themes/V3/5ePHB/style.less`

**Problem:** The `.spell` CSS class had no theme styling — SpellBlock rendered unstyled in the preview.

**Fix:** Added `.spell` rule block with:
- ScalySansRemake font via `.useSansSerif()` mixin
- h4 header in `--HB_Color_HeaderText` (#58180D maroon) for spell name
- Italic `h4 + p` for level/school subline
- Maroon-colored `dl` for stat line items (Casting Time, Range, etc.)
- Visible 2px `hr` dividers in header text color

---

### Fix 3: Cover Page Variants (4 types)
**Files:** `client/extensions/CoverBlock.js`, `client/components/TipTapToolbar.jsx`, `client/components/tiptap.less`, `shared/helpers/markdownToTiptap.js`

**Problem:** CoverBlock rendered a single `.cover` class for all cover types. The PHB theme CSS has distinct rules for `.frontCover`, `.insideCover`, `.backCover`, `.partCover`.

**Fix:**
- Added `coverType` attribute with values: 'front', 'inside', 'back', 'part'
- `renderHTML()` maps to correct CSS class (frontCover, insideCover, backCover, partCover)
- `parseHTML()` recognizes all 4 classes + legacy `.cover` (→ 'front')
- Added 4 insert commands + `setCoverType()` for changing existing blocks
- Toolbar: 4 separate buttons (Front Cover, Inside Cover, Part Cover, Back Cover)
- Editor labels: 4 distinct colors (crimson, teal, charcoal, purple)
- Updated markdownToTiptap.js to parse legacy `{{frontCover}}`/etc. tokens correctly

---

### Fix 4: Decorative Extensions (3 new)
**New files:** `client/extensions/WatercolorBlock.js`, `WatermarkBlock.js`, `ArtistCreditBlock.js`
**Modified:** `client/extensions/index.js`, `client/components/tiptap.less`

**WatercolorBlock:**
- Atom node (self-closing, no editable content)
- Attributes: variant (1-12), top, left, width, opacity, backgroundColor
- Renders: `<div class="watercolor{N}" style="...">`
- Editor label: teal "WATERCOLOR"

**WatermarkBlock:**
- Content: text* (allows watermark text)
- Renders: `<div class="watermark">text</div>`
- Editor label: gray "WATERMARK" (dashed border)

**ArtistCreditBlock:**
- Content: paragraph+ (multi-line credit text)
- Renders: `<div class="artist">...</div>`
- Editor label: warm brown "ARTIST CREDIT"

All three registered in extensions/index.js and added to editor labels.

---

### Fix 5: Monster Block Variants (3 types)
**Files:** `client/extensions/MonsterBlock.js`, `client/components/TipTapToolbar.jsx`, `client/components/tiptap.less`

**Problem:** MonsterBlock always rendered `.monster.frame`. Homebrewery supports unframed, framed, and wide variants.

**Fix:**
- Added `variant` attribute: 'framed' (default), 'unframed', 'wide'
- Render mapping:
  - framed → `<div class="monster frame">`
  - unframed → `<div class="monster">`
  - wide → `<div class="monster frame wide">`
- parseHTML recognizes all 3 class combinations (checks .wide first for specificity)
- New commands: `insertFramedMonster()`, `insertUnframedMonster()`, `insertWideMonster()`, `setMonsterVariant()`
- Toolbar: 3 separate dropdown items
- Editor: "MONSTER (WIDE)" label for wide variant

---

### Fix 6: Index Extension
**New file:** `client/extensions/IndexBlock.js`
**Modified:** `client/extensions/index.js`, `client/components/tiptap.less`

- Node name: `indexBlock`
- Content: paragraph|bulletList|heading+
- Renders: `<div class="index">...</div>`
- Commands: `insertIndex()`, `toggleIndex()`
- Editor label: dark gray "INDEX"

---

## REMAINING ITEMS (Lower Priority)

These items were identified in the audit but not fixed in this session — they're lower priority and can be addressed in future iterations:

| Item | Status | Notes |
|------|--------|-------|
| Image Mask extensions (imageMaskCenter/Edge) | ❌ Missing | Complex positioning system — requires CSS mask support |
| Class Table dedicated extension | ⚠️ Partial | Works via MustacheBlock but no dedicated button |
| Rune Table dedicated extension | ⚠️ Partial | Works via MustacheBlock but no dedicated button |
| TOC auto-generation | ⚠️ Partial | SkipCounting/ResetCounting helpers exist but no auto-TOC |
| Editor body text size | ⚠️ Partial | Uses BookInsanityRemake now but keeps browser default size for readability |
| Ink Friendly mode | ⚠️ Partial | Available as snippet but no toggle button |

---

## VERIFICATION

- **Vite Build:** Passes with 0 errors
- **New files created:** 4 (WatercolorBlock.js, WatermarkBlock.js, ArtistCreditBlock.js, IndexBlock.js)
- **Files modified:** 7 (tiptap.less, style.less, CoverBlock.js, MonsterBlock.js, TipTapToolbar.jsx, index.js, markdownToTiptap.js)
- **Backward compatibility:** All existing documents render correctly — new features are additive
- **CSS class mapping:** All extensions produce CSS classes that match the PHB theme selectors
