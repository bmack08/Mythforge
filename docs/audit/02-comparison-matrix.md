# Homebrewery vs Mythwright — Comparison Matrix

> Generated from source code analysis of both codebases

---

## TYPOGRAPHY

| Feature | Homebrewery | Mythwright Preview | Mythwright Editor | Status |
|---------|-------------|-------------------|-------------------|--------|
| h1 font (MrEavesRemake 0.89cm) | ✅ | ✅ | ❌ Uses Noto Serif | ❌ EDITOR BROKEN |
| h2 font (MrEavesRemake 0.75cm) | ✅ | ✅ | ❌ Uses Noto Serif | ❌ EDITOR BROKEN |
| h3 font (MrEavesRemake 0.575cm + gold underline) | ✅ | ✅ | ❌ Uses Noto Serif, no underline | ❌ EDITOR BROKEN |
| h4 font (MrEavesRemake 0.458cm) | ✅ | ✅ | ❌ Uses Noto Serif | ❌ EDITOR BROKEN |
| h5 font (ScalySansSmallCaps 0.423cm) | ✅ | ✅ | ❌ Uses Noto Serif | ❌ EDITOR BROKEN |
| Body text (BookInsanity 0.34cm) | ✅ | ✅ | ⚠️ Uses Noto Serif | ⚠️ PARTIAL |
| Drop cap (SolberaImitation 3.5cm gradient) | ✅ | ✅ (in CSS) | N/A | ✅ WORKS |
| Bold (weight 800, -0.02em spacing) | ✅ | ✅ | ✅ | ✅ WORKS |
| Italic | ✅ | ✅ | ✅ | ✅ WORKS |
| Inline code (#58180D on #FAF7EA) | ✅ | ✅ | ✅ | ✅ WORKS |
| Header text color (#58180D maroon) | ✅ | ✅ | ❌ Default black | ❌ EDITOR BROKEN |

---

## PAGE LAYOUT

| Feature | Homebrewery | Mythwright Preview | Status |
|---------|-------------|-------------------|--------|
| 2-column layout (count:2, gap:0.9cm) | ✅ | ✅ | ✅ WORKS |
| Parchment background (#EEE5CE + texture) | ✅ | ✅ | ✅ WORKS |
| Page break (\page) | ✅ | ✅ | ✅ WORKS |
| Column break (\column) | ✅ | ✅ | ✅ WORKS |
| Wide blocks (column-span: all) | ✅ | ✅ | ✅ WORKS |
| Footer accent (PHB_footerAccent.png) | ✅ | ✅ | ✅ WORKS |
| Page numbers (gold #C9AD6A) | ✅ | ✅ | ✅ WORKS |
| Footnotes (.footnote) | ✅ | ✅ | ✅ WORKS |
| Even page mirroring (scaleX -1) | ✅ | ✅ (in CSS) | ✅ WORKS |

---

## D&D CONTENT BLOCKS

| Block | Homebrewery Class | Mythwright Class | Preview CSS | Editor Label | Status |
|-------|-------------------|-----------------|-------------|-------------|--------|
| Note box | .note | .note | ✅ Green bg, shadow, border-image | ✅ Green label | ✅ WORKS |
| Descriptive box | .descriptive | .descriptive | ✅ Off-white bg, border-image | ✅ Gold label | ✅ WORKS |
| Monster stat block | .monster.frame | .monster.frame | ✅ Full styling | ✅ Red label | ✅ WORKS |
| Wide monster | .monster.wide | via MustacheBlock | ⚠️ Via legacy syntax | ❌ No dedicated button | ⚠️ PARTIAL |
| Unframed monster | .monster (no .frame) | Not distinct | ⚠️ Always renders .frame | ❌ No unframed option | ⚠️ PARTIAL |
| Quote | .quote | .quote | ✅ Italic, attribution | ✅ Purple label | ✅ WORKS |
| Spell block | .spell (Homebrewery uses inline) | .spell | ❌ No .spell CSS in theme | ✅ Red label in editor | ❌ MISSING CSS |
| Spell list | .spellList | .spellList | ✅ 2-column, styled | ✅ Legacy extension | ✅ WORKS |
| Class feature | N/A (inline MD) | .feature | ✅ Custom CSS | ✅ Brown label | ✅ WORKS |
| Sidebar | N/A (Mythwright custom) | .sidebar | ✅ Custom CSS | ✅ Blue label | ✅ WORKS |
| Class table | .classTable.frame | Via MustacheBlock | ⚠️ Via legacy syntax | ❌ No dedicated button | ⚠️ PARTIAL |
| Rune table | .runeTable.frame | Via MustacheBlock | ⚠️ Via legacy syntax | ❌ No dedicated button | ⚠️ PARTIAL |
| Code block | pre code (border-image) | pre code | ✅ (in CSS) | ✅ | ✅ WORKS |
| Index | .index | ❌ No extension | ❌ | ❌ | ❌ MISSING |

---

## COVER PAGES

| Cover Type | Homebrewery Class | Mythwright | Status |
|-----------|-------------------|-----------|--------|
| Front cover | .frontCover | CoverBlock (.cover) | ⚠️ Single generic .cover class, no .frontCover variant |
| Inside cover | .insideCover | CoverBlock (.cover) | ⚠️ No .insideCover variant |
| Back cover | .backCover | CoverBlock (.cover) | ⚠️ No .backCover variant |
| Part cover | .partCover | CoverBlock (.cover) | ⚠️ No .partCover variant |

**Issue:** Homebrewery uses 4 distinct CSS classes with very different styling. Mythwright's CoverBlock renders a single `.cover` class. The theme CSS has rules for `.frontCover`, `.insideCover`, `.backCover`, `.partCover` but the extension doesn't produce these classes.

---

## DECORATIVE ELEMENTS

| Element | Homebrewery | Mythwright | Status |
|---------|-------------|-----------|--------|
| Monster red hr dividers (redTriangle.png) | ✅ | ✅ (in CSS) | ✅ WORKS |
| h3 gold underline (#C0AD6A) | ✅ | ✅ (in preview CSS) | ✅ WORKS |
| Horizontal rule (horizontalRule.svg) | ✅ | ✅ (in CSS) | ✅ WORKS |
| Watercolor stains (.watercolor1-12) | ✅ | ❌ No extension | ❌ MISSING |
| Watermark (.watermark) | ✅ | ❌ No extension | ❌ MISSING |
| Artist credit (.artist) | ✅ | ❌ No extension | ❌ MISSING |
| Class table decoration (::before) | ✅ | ✅ (in CSS, via MustacheBlock) | ⚠️ PARTIAL |
| Image masks (imageMaskCenter/Edge) | ✅ | ❌ No extension | ❌ MISSING |

---

## TABLES

| Feature | Homebrewery | Mythwright | Status |
|---------|-------------|-----------|--------|
| PHB header styling (dark header) | ✅ | ✅ (via .phb class) | ✅ WORKS |
| Alternating row colors (#E0E5C1) | ✅ | ✅ (in CSS) | ✅ WORKS |
| ScalySans font in tables | ✅ | ✅ (in CSS) | ✅ WORKS |

---

## TABLE OF CONTENTS

| Feature | Homebrewery | Mythwright | Status |
|---------|-------------|-----------|--------|
| .toc class with leaders | ✅ | ⚠️ No dedicated extension, available via snippet | ⚠️ PARTIAL |
| Auto-TOC generation | ✅ | ⚠️ SkipCounting/ResetCounting helpers exist | ⚠️ PARTIAL |

---

## EDITOR EXPERIENCE

| Feature | Homebrewery | Mythwright | Status |
|---------|-------------|-----------|--------|
| Heading visual differentiation in editor | ✅ (CodeMirror with custom theme) | ❌ All headings look same | ❌ BROKEN |
| D&D block labels in editor | N/A (markdown editor) | ✅ Color-coded labels | ✅ WORKS |
| Toolbar for D&D blocks | ✅ (Snippet menus) | ✅ (Dropdown + buttons) | ✅ WORKS |
| Live preview | ✅ | ✅ (split pane) | ✅ WORKS |
| Line numbers | ✅ | ✅ | ✅ WORKS |

---

## PRIORITY FIX LIST

### CRITICAL (Visual parity broken)
1. ❌ **Editor heading styling** — h1-h5 need D&D fonts, sizes, colors in .ProseMirror
2. ❌ **Spell block CSS** — .spell class has no theme styling

### HIGH (Missing features)
3. ❌ **Watercolor extension** — .watercolor1-12 blocks
4. ❌ **Watermark extension** — .watermark block
5. ❌ **Artist credit extension** — .artist block
6. ❌ **Index extension** — .index block
7. ❌ **Image mask extension** — imageMaskCenter/Edge blocks
8. ⚠️ **Cover page variants** — CoverBlock needs frontCover/insideCover/backCover/partCover types

### MEDIUM (Partial implementations)
9. ⚠️ **Unframed monster block** — no .monster (without .frame) option
10. ⚠️ **Wide monster block** — no dedicated toolbar button
11. ⚠️ **Class table block** — no dedicated extension (relies on MustacheBlock)
12. ⚠️ **Rune table** — no dedicated extension
13. ⚠️ **TOC auto-generation** — partial implementation
