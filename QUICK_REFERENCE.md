# Mythforge Tiptap Parity - Quick Reference

## Extension Registry

All custom extensions are exported from `client/extensions/index.js`.

### Layout Extensions

| Extension | Name | DOM Output | Attributes |
|-----------|------|------------|------------|
| **TableBlock** | `table` | `<div class="phb-table"><table class="phb table--compact">` | `style`, `hasHeader` |
| **WideBlock** | `wideBlock` | `<div class="phb-wide wide">` | - |
| **ColumnContainer** | `columnContainer` | `<div class="phb-cols phb-col-{count}">` | `count` (2-4) |
| **ColumnBreak** | `columnBreak` | `<div class="column-break">` | - |
| **PageBreak** | `pageBreak` | `<div class="page-break">` | - |

### Page Chrome Extensions

| Extension | Name | DOM Output | Attributes |
|-----------|------|------------|------------|
| **Header** | `header` | `<div class="phb-header">` | - |
| **Footer** | `footer` | `<div class="phb-footer">` | - |
| **PageNumber** | `pageNumber` | `<span class="phb-page-number">` | `value`, `auto` |

### Media Extensions

| Extension | Name | DOM Output | Attributes |
|-----------|------|------------|------------|
| **ImageWithAttributes** | `imageWithAttributes` | `<img class="phb-image {wrap}">` | `src`, `alt`, `width`, `marginLeft`, `marginRight`, `wrap` |

### Inline Extensions

| Extension | Name | DOM Output | Attributes |
|-----------|------|------------|------------|
| **HeadingWithId** | `headingWithId` | `<h{n} class="phb-h{n}" id="{slug}">` | `level`, `id` |
| **IconMark** | `iconMark` | `<i class="phb-icon {set} {icon}">` | `name` |
| **Emoji** | `emoji` | `<span class="phb-emoji {set}">` | `name`, `set` |

## CSS Classes Reference

### Tables
```css
.phb-table              /* Wrapper div */
.phb-table > table.phb  /* Table element */
.table--compact         /* Compact variant */
thead                   /* Header section */
tbody                   /* Body section */
tbody tr:nth-child(odd) /* Zebra striping */
```

### Layout
```css
.phb-wide         /* Full-width content */
.phb-cols         /* Column container */
.phb-col-2        /* 2-column layout */
.phb-col-3        /* 3-column layout */
.phb-col-4        /* 4-column layout */
.column-break     /* Column break */
```

### Headings
```css
.phb-h1           /* Level 1 heading */
.phb-h2           /* Level 2 heading */
.phb-h3           /* Level 3 heading */
```

### Page Chrome
```css
.phb-header       /* Page header */
.phb-footer       /* Page footer */
.phb-page-number  /* Page number */
```

### Images
```css
.phb-image        /* All images */
.phb-image.wrapLeft   /* Left-floated with text wrap */
.phb-image.wrapRight  /* Right-floated with text wrap */
```

### Icons & Emoji
```css
.phb-icon         /* All icons */
.phb-emoji        /* All emoji */
.ei               /* Elderberry Inn set */
.fas, .far, .fab  /* FontAwesome sets */
```

## Markdown Syntax (Future)

### Tables
```markdown
| Name | Level | Class |
|------|-------|-------|
| Gandalf | 20 | Wizard |
| Aragorn | 16 | Ranger |
```

### Wide Blocks
```markdown
{{wide}}
Full-width content here
{{/wide}}
```

### Columns
```markdown
{column-count:2}

Content in first column

{{columnbreak}}

Content in second column
```

### Page Chrome
```markdown
{{header}}
Chapter Title
{{/header}}

{{footer}}
Page {{pagenumber}}
{{/footer}}
```

### Images with Attributes
```markdown
![Alt text](image.png){width:280px,wrapLeft}
![Alt text](image.png){width:200px,marginRight:1cm,wrapRight}
```

### Icons & Emoji
```markdown
:fa-dragon:
:fa-dice-d20:
:ei_barbarian_reckless_attack:
:ei_wizard_fireball:
```

## Extension Commands

### Insert Table
```javascript
editor.commands.insertTable({ style: 'table--compact', hasHeader: true })
```

### Set Column Container
```javascript
editor.commands.setColumnContainer(3) // 3 columns
```

### Insert Wide Block
```javascript
editor.commands.insertWide()
```

### Insert Page Number
```javascript
editor.commands.setPageNumber(1, true) // value=1, auto=true
```

### Insert Image with Attributes
```javascript
editor.commands.setImageWithAttributes({
  src: 'image.png',
  width: '280px',
  wrap: 'left'
})
```

### Insert Emoji
```javascript
editor.commands.insertEmoji('barbarian_reckless_attack', 'ei')
```

## Testing Commands

### Run All Tests
```bash
npm test
```

### Run Parity Tests Only
```bash
npm test __tests__/parity/
```

### Run Specific Feature Test
```bash
npm test table.test.js
npm test columns.test.js
npm test images.test.js
```

### Run Visual Tests (Playwright)
```bash
cd __visual__
npx playwright test
```

### Update Visual Snapshots
```bash
cd __visual__
npx playwright test --update-snapshots
```

### Interactive Visual Test Mode
```bash
cd __visual__
npx playwright test --ui
```

## File Locations

### Extensions
- `client/extensions/*.js` - All Tiptap extensions
- `client/extensions/index.js` - Extension registry

### Styles
- `shared/themes/V3/5ePHB/style.less` - PHB theme styles

### Tests
- `__tests__/parity/*.test.js` - Unit tests
- `__visual__/tests/*.visual.spec.js` - Visual tests
- `specs/parity/*/*.md` - Test fixtures

### Documentation
- `docs/mythforge_tiptap_parity_evolution_engineering_blueprint.md` - Blueprint
- `PARITY_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `QUICK_REFERENCE.md` - This file

## Common Tasks

### Add a New Extension

1. Create file: `client/extensions/MyExtension.js`
2. Import in `client/extensions/index.js`
3. Add to `configuredExtensions` array
4. Export in named exports
5. Add styles to `shared/themes/V3/5ePHB/style.less`
6. Create test fixture: `specs/parity/myfeature/basic.md`
7. Create test: `__tests__/parity/myfeature.test.js`

### Add Visual Test

1. Create fixture: `specs/parity/feature/test.md`
2. Create test: `__visual__/tests/feature.visual.spec.js`
3. Run test to generate golden: `npx playwright test`
4. Review golden in `__visual__/goldens/`

### Update Extension Rendering

1. Read extension file
2. Modify `renderHTML` method
3. Update LESS styles if needed
4. Run tests to verify
5. Update snapshots if intentional change

### Debug Test Failures

1. Check test output for assertion failures
2. Review generated HTML vs expected
3. Verify extension is in registry
4. Check LESS compilation
5. Use `console.log` in test utils

## Troubleshooting

### Tests Fail with "Extension not found"
- Check `client/extensions/index.js` includes your extension
- Verify export name matches usage

### Visual Tests Fail with "Route not found"
- Implement `/preview?fixture=<path>` route
- Ensure route renders Tiptap content
- Add `#preview-page` element wrapper

### Styles Not Applying
- Check LESS file for syntax errors
- Verify class names match extension output
- Clear build cache and rebuild
- Check browser DevTools for applied styles

### Markdown Not Parsing
- `toTiptapJSON` in testUtils is placeholder
- Implement actual parser integration
- Connect to marked or custom parser

## Links

- [Tiptap Documentation](https://tiptap.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Blueprint Document](./docs/mythforge_tiptap_parity_evolution_engineering_blueprint.md)
- [Implementation Summary](./PARITY_IMPLEMENTATION_SUMMARY.md)

---

**Version:** 1.0
**Last Updated:** 2025-10-15
**Status:** Primary Implementation Complete
