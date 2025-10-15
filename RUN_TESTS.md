# Quick Test Run Guide

## 🎯 Quick Start

### Option 1: Run Everything
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run unit tests
npm test __tests__/parity/

# Terminal 3: Run visual tests (after goldens are generated)
cd __visual__
npx playwright test
```

### Option 2: Step by Step
```bash
# 1. Unit tests first (no server needed)
npm test __tests__/parity/

# 2. Then start server for manual testing
npm run dev

# 3. Visit in browser:
http://localhost:3000/preview?fixture=table/basic
http://localhost:3000/preview?fixture=columns/two

# 4. Run visual tests
cd __visual__
npx playwright test --update-snapshots  # First time
npx playwright test                     # Subsequent runs
```

---

## 📝 Detailed Instructions

### Step 1: Unit Tests (Jest)

**No server needed - just run:**
```bash
npm test __tests__/parity/
```

**Expected output:**
```
PASS  __tests__/parity/table.test.js
PASS  __tests__/parity/wide.test.js
PASS  __tests__/parity/columns.test.js
PASS  __tests__/parity/headings.test.js
PASS  __tests__/parity/pagechrome.test.js
PASS  __tests__/parity/images.test.js
PASS  __tests__/parity/icons-emoji.test.js

Test Suites: 7 passed, 7 total
Tests:       XX passed, XX total
```

**If tests fail:**
- Check error messages for missing classes
- Verify extensions are loaded in testUtils
- Run with `--verbose` for more details:
  ```bash
  npm test __tests__/parity/ -- --verbose
  ```
- Update snapshots if changes are intentional:
  ```bash
  npm test __tests__/parity/ -- -u
  ```

---

### Step 2: Manual Preview Testing

**Start the server:**
```bash
npm run dev
```

**Open browser and test each fixture:**

1. **Tables:**
   ```
   http://localhost:3000/preview?fixture=table/basic
   ```
   ✅ Should see table with `.phb-table` wrapper
   ✅ Header row styled differently
   ✅ Zebra striping on body rows

2. **Wide Blocks:**
   ```
   http://localhost:3000/preview?fixture=wide/basic
   ```
   ✅ Content should span full page width
   ✅ `.phb-wide` class present

3. **Columns:**
   ```
   http://localhost:3000/preview?fixture=columns/two
   http://localhost:3000/preview?fixture=columns/three
   ```
   ✅ Content flows in 2 or 3 columns
   ✅ Column breaks work
   ✅ `.phb-cols .phb-col-2` classes present

4. **Headings:**
   ```
   http://localhost:3000/preview?fixture=headings/basic
   ```
   ✅ H1, H2, H3 styled with PHB typography
   ✅ `.phb-h1`, `.phb-h2`, `.phb-h3` classes
   ✅ ID attributes present and slugified

5. **Page Chrome:**
   ```
   http://localhost:3000/preview?fixture=pagechrome/basic
   ```
   ✅ Header at top
   ✅ Footer at bottom
   ✅ Page numbers visible

6. **Images:**
   ```
   http://localhost:3000/preview?fixture=images/attrs
   ```
   ✅ Images sized correctly
   ✅ Text wrapping works
   ✅ `.wrapLeft`, `.wrapRight` classes

7. **Icons & Emoji:**
   ```
   http://localhost:3000/preview?fixture=icons-emoji/basic
   ```
   ✅ FontAwesome icons render
   ✅ Emoji sprites/icons visible
   ✅ `.phb-icon`, `.phb-emoji` classes

**Check browser console:**
- No errors should appear
- Verify all extensions loaded

**Inspect HTML:**
- Right-click → Inspect
- Check for required classes
- Verify DOM structure matches Blueprint

---

### Step 3: Visual Tests (Playwright)

**Prerequisites:**
- Server must be running on port 3000
- Playwright installed: `npm install --save-dev @playwright/test`
- Browsers installed: `npx playwright install`

**First time (generate golden screenshots):**
```bash
cd __visual__
npx playwright test --update-snapshots
```

This creates golden images in `__visual__/goldens/`

**Subsequent runs (compare to goldens):**
```bash
cd __visual__
npx playwright test
```

**Expected output:**
```
Running 8 tests...
✓ table basic - PHB table visual parity (1234ms)
✓ wide basic - full width rendering (891ms)
✓ columns two - two column layout (923ms)
✓ columns three - three column layout (945ms)
✓ headings basic - PHB typography (789ms)

8 passed (8s)
```

**If tests fail:**
```
X table basic - PHB table visual parity
  Expected screenshot to match golden within 1%
  Actual diff: 2.3%

To update snapshots:
  npx playwright test --update-snapshots
```

**Review diffs:**
```bash
# Open test results in browser
npx playwright show-report

# Or check diff images manually
ls __visual__/test-results/**/diff.png
```

**Interactive mode (recommended for debugging):**
```bash
npx playwright test --ui
```

---

## 🐛 Troubleshooting

### Tests Can't Find Fixtures
**Error:** `Fixture not found: table/basic`

**Fix:**
- Check file exists: `specs/parity/table/basic.md`
- Verify path is correct (no leading slash)
- Ensure server serves static files from specs/

### Extensions Not Loading
**Error:** `Unknown node type: wideBlock`

**Fix:**
- Check `client/extensions/index.js` exports extension
- Verify import in `__tests__/parity/testUtils.js`
- Clear node_modules cache: `npm ci`

### Visual Tests Timeout
**Error:** `Timeout waiting for selector .phb-table`

**Fix:**
- Ensure dev server is running
- Check port matches playwright.config.js (default 3000)
- Verify preview route renders correctly in browser first
- Increase timeout in playwright.config.js

### Classes Not Found in HTML
**Error:** `Expected HTML to contain class "phb-table"`

**Fix:**
- Check extension `renderHTML` method adds class
- Verify markdown parser converts to correct node type
- Test extension in isolation:
  ```javascript
  const json = { type: 'wideBlock', content: [...] };
  const html = renderHTML(json);
  console.log(html);
  ```

### Snapshot Mismatch
**Error:** `Snapshot doesn't match`

**Fix:**
- Review changes in test output
- If intentional, update snapshots:
  ```bash
  npm test -- -u
  ```
- If unintentional, check what changed in extensions

---

## ✅ Success Checklist

Before committing, verify:

- [ ] All unit tests pass
- [ ] All visual tests pass (or goldens updated intentionally)
- [ ] Preview route loads all fixtures without errors
- [ ] Browser console clean (no errors)
- [ ] DOM contains all required classes per Blueprint
- [ ] PHB styles apply correctly
- [ ] Linter passes: `npm run lint`

---

## 📊 Expected Test Coverage

- **Table parity:** 3 tests
- **Wide blocks:** 2 tests
- **Columns:** 3 tests
- **Headings:** 3 tests
- **Page chrome:** 3 tests
- **Images:** 4 tests
- **Icons & Emoji:** 3 tests

**Total:** 21+ unit tests, 8+ visual tests

---

## 🚀 After Tests Pass

1. Review test output and any warnings
2. Run linter: `npm run lint`
3. Fix any lint errors
4. Commit changes (you'll handle this)
5. Document any issues or edge cases found
6. Move to EPIC H/I/J tasks

---

**Happy Testing!** 🎉

If you encounter issues not covered here, check:
- `STEPS_2-4_IMPLEMENTATION_SUMMARY.md` for implementation details
- `PARITY_IMPLEMENTATION_SUMMARY.md` for overall architecture
- `QUICK_REFERENCE.md` for extension reference
