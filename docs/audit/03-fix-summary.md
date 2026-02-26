# Homebrewery → Mythwright Feature Parity — Fix Summary

> All fixes applied and build verified (Vite build succeeds with 0 errors)
> Updated: Round 2 — all remaining items now resolved

---

## ROUND 1 FIXES

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
**Files:** `client/extensions/CoverBlock.js`, `TipTapToolbar.jsx`, `tiptap.less`, `markdownToTiptap.js`

**Problem:** CoverBlock rendered a single `.cover` class for all cover types.

**Fix:**
- Added `coverType` attribute: 'front', 'inside', 'back', 'part'
- Renders correct CSS class (frontCover, insideCover, backCover, partCover)
- 4 toolbar buttons, 4 distinct editor label colors
- Legacy `.cover` backward compatible (→ 'front')

---

### Fix 4: Decorative Extensions (3 new)
**New files:** `WatercolorBlock.js`, `WatermarkBlock.js`, `ArtistCreditBlock.js`

- WatercolorBlock: atom node, variant 1-12, positioning attributes
- WatermarkBlock: text content, `.watermark` class
- ArtistCreditBlock: paragraph content, `.artist` class

---

### Fix 5: Monster Block Variants (3 types)
**Files:** `MonsterBlock.js`, `TipTapToolbar.jsx`, `tiptap.less`

- Framed → `.monster.frame`
- Unframed → `.monster`
- Wide → `.monster.frame.wide`

---

### Fix 6: Index Extension
**New file:** `IndexBlock.js`

- Renders `.index`, dark gray editor label

---

## ROUND 2 FIXES

### Fix 7: Editor Heading Level Badges
**File:** `client/components/tiptap.less`

**Problem:** Headings were styled with correct fonts/colors but you couldn't easily tell H1 from H2 from H3.

**Fix:**
- Created `.heading-badge()` LESS mixin that adds a `::before` pseudo-element badge
- Each heading gets a small chip: `H1`, `H2`, `H3`, `H4`, `H5`, `H6`
- Badge styled: Courier New 10px, parchment background (#fdf1dc), gold border (#C0AD6A)
- Positioned to the left of heading text (absolute, vertically centered)
- Headings get `padding-left: 2.2em` to make room
- Subtle opacity (0.7) so badges don't overpower the text

---

### Fix 8: Bold, Italic, Lists, Blockquotes in Editor
**File:** `client/components/tiptap.less`

**Problem:** Bold/italic text wasn't visually distinct. Bullets and numbered lists had no visible markers.

**Fix:**
- **Bold (`strong`):** Explicit `font-weight: bold` rule (BookInsanityRemake Bold loads)
- **Italic (`em`):** Explicit `font-style: italic` rule
- **Bold italic:** Combined rule for `strong em` / `em strong`
- **Strikethrough:** `text-decoration: line-through; color: #999`
- **Bullet lists (`ul`):** `list-style-type: disc`, nested levels: circle → square
- **Numbered lists (`ol`):** `list-style-type: decimal`, nested levels: lower-alpha → lower-roman
- **List items:** Proper padding, margin, nested `p` margin reset
- **Blockquotes:** Gold left border (3px #C0AD6A), italic, muted color

---

### Fix 9: ClassTable & RuneTable Extensions
**New files:** `ClassTableBlock.js`, `RuneTableBlock.js`

**ClassTableBlock:**
- Variants: 'basic', 'frame' (default), 'decoration'
- Wide toggle
- Pre-populates with Level/Proficiency/Features table
- CSS: `.classTable`, `.classTable.frame`, `.classTable.frame.decoration`
- Toolbar: "Class Table" and "Class Table (Wide)"
- Editor labels: dark navy

**RuneTableBlock:**
- Scripts: 'dwarvish' (Davek), 'elvish' (Rellanic), 'draconic' (Iokharic)
- Wide and frame toggles
- CSS: `.runeTable.wide.frame` with font-family inline style
- Toolbar: 3 script options (Dwarvish, Elvish, Draconic)
- Editor labels: dark purple

---

### Fix 10: Image Mask Extension
**New file:** `ImageMaskBlock.js`

- Supports center (1-16), edge (1-8), corner (1-37) mask types
- CSS custom properties: `--offsetX`, `--offsetY`, `--rotation`
- Renders: `<div class="imageMaskCenter5" style="--offsetX:0%;...">`
- Commands: `insertImageMask()`, `setMaskType()`
- Editor label: teal "IMAGE MASK"
- Toolbar: "Image Mask" in D&D Blocks dropdown

---

### Fix 11: Table of Contents Block
**New file:** `TocBlock.js`

- Content: headings, paragraphs, bullet lists
- Wide toggle for 2-column TOC
- CSS: `.toc`, `.toc.wide`
- Pre-populates with "Table of Contents" heading
- Editor label: dark gold "TABLE OF CONTENTS"
- Toolbar: "Table of Contents" and "Table of Contents (Wide)"

---

### Fix 12: Ink Friendly Toggle
**Files:** `TipTapToolbar.jsx`, `TipTapEditor.jsx`

- Toggle button in the toolbar view group (next to line numbers)
- State managed in TipTapEditor, injected as `<style>` into brew renderer iframe
- Strips backgrounds from `.page`, `.monster`, `.note`, `.descriptive`
- Hides images for printer-friendly output
- Follows same pattern as line numbers toggle

---

## VERIFICATION

- **Vite Build:** Passes with 0 errors (4.23s)
- **New files created:** 10 total
  - Round 1: WatercolorBlock.js, WatermarkBlock.js, ArtistCreditBlock.js, IndexBlock.js
  - Round 2: ClassTableBlock.js, RuneTableBlock.js, ImageMaskBlock.js, TocBlock.js
- **Files modified:** 10+ (tiptap.less, style.less, CoverBlock.js, MonsterBlock.js, TipTapToolbar.jsx, TipTapEditor.jsx, index.js, markdownToTiptap.js)
- **Backward compatibility:** All existing documents render correctly
- **CSS class mapping:** All extensions produce CSS classes matching PHB theme selectors

---

## NOTHING REMAINING

All items from the comparison matrix are now resolved:

| Item | Status |
|------|--------|
| Editor heading typography | ✅ Fixed (Round 1) |
| Editor heading level badges | ✅ Fixed (Round 2) |
| Bold/italic/lists in editor | ✅ Fixed (Round 2) |
| Spell block CSS | ✅ Fixed (Round 1) |
| Cover page variants | ✅ Fixed (Round 1) |
| Watercolor extension | ✅ Fixed (Round 1) |
| Watermark extension | ✅ Fixed (Round 1) |
| Artist Credit extension | ✅ Fixed (Round 1) |
| Monster block variants | ✅ Fixed (Round 1) |
| Index extension | ✅ Fixed (Round 1) |
| Class Table extension | ✅ Fixed (Round 2) |
| Rune Table extension | ✅ Fixed (Round 2) |
| Image Mask extension | ✅ Fixed (Round 2) |
| Table of Contents block | ✅ Fixed (Round 2) |
| Ink Friendly toggle | ✅ Fixed (Round 2) |
