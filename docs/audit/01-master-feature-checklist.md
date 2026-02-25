# Homebrewery 5ePHB — Master Feature Checklist

> Compiled from complete source code analysis of `docs/homebrewery-master/`

---

## CSS VARIABLES (Color Palette)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--HB_Color_Background` | `#EEE5CE` | Parchment page background |
| `--HB_Color_Accent` | `#E0E5C1` | Green accent, table row striping |
| `--HB_Color_HeaderUnderline` | `#C0AD6A` | Gold border under h3 |
| `--HB_Color_HorizontalRule` | `#9C2B1B` | Maroon horizontal dividers |
| `--HB_Color_HeaderText` | `#58180D` | Dark maroon for h1-h4 |
| `--HB_Color_MonsterStatBackground` | `#F2E5B5` | Monster block background |
| `--HB_Color_CaptionText` | `#766649` | Artist credit brown |
| `--HB_Color_WatercolorStain` | `#BBAD82` | Watercolor tint |
| `--HB_Color_Footnotes` | `#C9AD6A` | Gold page numbers/footnotes |

---

## FONTS

### Text Fonts
1. **BookInsanityRemake** — body text (normal, bold, italic, bold-italic)
2. **MrEavesRemake** — h1-h4 headers (small caps)
3. **ScalySansRemake** — sans-serif for notes/tables/monsters (4 weights)
4. **ScalySansSmallCapsRemake** — h5, monster section headers
5. **SolberaImitationRemake** — drop cap letter (variable weight)
6. **WalterTurncoat** — artist credits
7. **NodestoCapsCondensed** — cover page titles (4 weights)
8. **NodestoCapsWide** — back cover logo text
9. **Overpass** — back cover body, cover footnotes

### Script Fonts
10. **Davek** — Dwarvish runes
11. **Iokharic** — Draconic script
12. **Rellanic** — Elvish script

### Icon Fonts
13. **FontAwesome** — fas/far/fab icon classes
14. **Game-Icons** — .gi class (500+ icons)
15. **DiceFont** — .df class (dice notation)
16. **Elderberry Inn** — .ei class (D&D-specific: spells, conditions, classes)

---

## TYPOGRAPHY

### Headings
| Level | Font | Size | Color | Decorations |
|-------|------|------|-------|-------------|
| h1 | MrEavesRemake | 0.89cm | --HB_Color_HeaderText (#58180D) | column-span: all |
| h2 | MrEavesRemake | 0.75cm | --HB_Color_HeaderText (#58180D) | — |
| h3 | MrEavesRemake | 0.575cm | --HB_Color_HeaderText (#58180D) | 2px gold border-bottom (#C0AD6A) |
| h4 | MrEavesRemake | 0.458cm | --HB_Color_HeaderText (#58180D) | — |
| h5 | ScalySansSmallCapsRemake | 0.423cm | — | small caps |

### Body Text
- Font: BookInsanityRemake
- Size: 0.34cm
- Color: #1b1b1b (default)
- Line-height: inherited
- Paragraph spacing: 0.325cm
- Text indent on consecutive paragraphs: 1em

### Drop Cap
- Font: SolberaImitationRemake
- Size: 3.5cm
- Gradient: linear-gradient(-45deg, #322814, #998250, #322814)
- Float: left, padding-left: 40px
- Applied to first letter after h1

### Text Emphasis
- **Bold**: font-weight 800, letter-spacing -0.02em
- *Italic*: font-style italic
- `Code`: padding 0px 4px, size 0.325cm, color #58180D, bg #FAF7EA, radius 4px

---

## PAGE LAYOUT

### Base Page
- 2-column layout (column-count: 2, gap: 0.9cm, width: 8cm)
- Background: parchmentBackground.jpg
- Font: BookInsanityRemake at 0.34cm

### Footer
- Position: absolute bottom, z-index: 100
- Background: PHB_footerAccent.png (mirrored on even pages)
- Height: 50px

### Page Number (.pageNumber)
- Position: bottom-right (right: 2px, bottom: 22px)
- Color: #C9AD6A (gold)
- Even pages: bottom-left

### Footnote (.footnote)
- Position: absolute, bottom: 32px, right/left: 80px
- Color: #C9AD6A, z-index: 150

---

## D&D CONTENT BLOCKS

### 1. Note Box (.note)
- Font: ScalySansRemake 0.318cm
- Background: #E0E5C1 (green)
- Padding: 0.13cm 0.16cm
- Border: noteBorder.png (border-image 12 stretch, outset 9px 0px)
- Box-shadow: 1px 4px 14px #888888

### 2. Descriptive Box (.descriptive)
- Font: ScalySansRemake 0.318cm
- Background: #FAF7EA (off-white)
- Padding: 0.1em
- Border: descriptiveBorder.png (border-image 12 stretch, outset 4px)
- Box-shadow: 0 0 6px #FAF7EA

### 3. Monster Stat Block (.monster)
- Font: ScalySansRemake
- Position: relative

#### .monster.frame variant:
- Width: calc(100% + 0.32cm)
- Background: #F2E5B5 + parchmentBackgroundGrayscale.jpg (blend: overlay)
- Border: monsterBorderFancy.png (border-image 14 round, outset 0px 2px)
- Box-shadow: 1px 4px 14px #888888
- h2: 0.62cm, h3: ScalySansSmallCapsRemake 0.45cm
- hr dividers: redTriangle.png (6px height)
- Ability table: transparent bg, headerText color
- .monster.wide: 2-column balanced

### 4. Quote Block (.quote)
- Italic text
- Line-height: 0.54cm
- First line: 0.38cm, small-caps, normal style
- Attribution: display block, text-align right, "---" prefix

### 5. Spell List (.spellList)
- 2-column layout
- Font: ScalySansRemake 0.352cm
- h5 headings for spell levels
- .spellList.wide: 4 columns

### 6. Class Table (.classTable)
- Standard table with ScalySansRemake

#### .classTable.frame variant:
- Border: frameBorder.png (slice 200, width 47px, outset 0.4cm 0.3cm)
- Background: white

#### .classTable.decoration variant:
- ::before pseudo-element with classTableDecoration.png

### 7. Rune Table (.runeTable)
- Cell size: 1.3cm x 1.3cm
- Uppercase, centered
- .runeTable.frame: scriptBorder.png border

### 8. Index (.index)
- Font-size: 0.218cm
- No list style, nested indentation

### 9. Code Block (pre code)
- Border: codeBorder.png (border-image 26 stretch, outset 2px)
- Padding: 0.15cm, border-radius: 12px

---

## COVER PAGES

### Front Cover (.frontCover)
- 1 column, centered text
- h1: NodestoCapsCondensed 2.245cm, white, uppercase, black stroke
- h2: NodestoCapsCondensed 0.85cm, white
- hr: horizontalRule.svg (12cm x 0.5cm)
- .banner: coverPageBanner.svg background, NodestoCapsCondensed 1cm
- .footnote: Overpass 0.496cm, white, black stroke
- .logo: top 0.5cm, centered

### Inside Cover (.insideCover)
- 1 column, centered
- h1: NodestoCapsCondensed 2.1cm, uppercase
- h2: NodestoCapsCondensed 0.85cm
- .logo: bottom 1cm

### Back Cover (.backCover)
- Padding: 2.25cm top, 1.3cm sides
- Color: white
- Background: backCover.png
- h1: NodestoCapsCondensed 1.35cm, color #ED1C24
- p: Overpass 0.332cm
- .logo: bottom 2cm, NodestoCapsWide 0.4cm

### Part Cover (.partCover)
- 1 column, centered
- Background: partCoverHeaderPHB.png (6cm height)
- h1: NodestoCapsCondensed 2.3cm, uppercase
- h2: Overpass 0.45cm

---

## TABLE OF CONTENTS (.toc)

- h1: centered, mb 0.3cm
- Links: flex row, space-between
- Leaders: dotted border-bottom 0.05cm
- Page numbers: BookInsanityRemake 0.34cm
- Nested: margin-left 1em
- .toc.wide: 2-column balanced

---

## DECORATIVE ELEMENTS

### Assets Required
| Asset | File | Used For |
|-------|------|----------|
| Parchment background | parchmentBackground.jpg | Page bg |
| Parchment grayscale | parchmentBackgroundGrayscale.jpg | Monster bg |
| Footer accent | PHB_footerAccent.png | Page footer |
| Frame border | frameBorder.png | Class table frame |
| Note border | noteBorder.png | Note box border |
| Descriptive border | descriptiveBorder.png | Descriptive box border |
| Monster border | monsterBorderFancy.png | Monster stat frame |
| Code border | codeBorder.png | Code block border |
| Red triangle | redTriangle.png | Monster hr dividers |
| Horizontal rule | horizontalRule.svg | Decorative dividers |
| Class table decoration | classTableDecoration.png | Table flourishes |
| Cover banner | coverPageBanner.svg | Front cover banner |
| Part cover header | partCoverHeaderPHB.png | Part cover bg |
| Back cover | backCover.png | Back cover bg |
| Script border | scriptBorder.png | Rune table border |
| Watercolors 1-12 | watercolor/watercolor1-12.png | Decorative overlays |

### Watermark (.watermark)
- Color: black
- Positioned absolutely

### Artist Credit (.artist)
- Font: WalterTurncoat 0.27cm
- Color: #766649
- Position: absolute

---

## SNIPPETS (Editor Insertion Options)

### Style Editor
1. Remove Drop Cap
2. Tweak Drop Cap

### PHB Blocks
3. Spell
4. Spell List
5. Class Feature
6. Quote
7. Note
8. Descriptive Text Box
9. Monster Stat Block (unframed)
10. Monster Stat Block (framed)
11. Wide Monster Stat Block
12. Front Cover Page
13. Inside Cover Page
14. Part Cover Page
15. Back Cover Page
16. Magic Item
17. Artist Credit

### Tables
18. Martial Class Table (frame + decoration variants)
19. Full Caster Class Table (frame + decoration variants)
20. Half Caster Class Table (frame + decoration variants)
21. Third Caster Class Table (frame + decoration variants)
22. Dwarvish Rune Table
23. Elvish Rune Table
24. Draconic Rune Table

### Print
25. Ink Friendly

### Layout
26. Wide blocks ({{wide}})
27. Page break (\page)
28. Column break (\column)

---

## WIDE MODIFIERS

- `.monster.wide` — 2-column balanced stat block
- `.spellList.wide` — 4-column spell list
- `.classTable.wide` — full-width class table
- `.toc.wide` — 2-column balanced ToC
- `.page .wide` — generic wide block (column-span: all)
