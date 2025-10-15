# Visual Regression Tests

This directory contains Playwright-based visual regression tests for Mythforge parity features.

## Setup

1. Install Playwright:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. Run tests:
   ```bash
   npx playwright test
   ```

## Structure

- `tests/` - Test specs organized by feature
- `goldens/` - Golden screenshot references (auto-generated on first run)
- `playwright.config.js` - Configuration

## Adding Tests

1. Create a new `.visual.spec.js` file in `tests/`
2. Use `page.goto('/preview?fixture=path/to/fixture')` to load fixtures
3. Use `expect(element).toHaveScreenshot('name.png')` to capture and compare

## Updating Goldens

When intentional changes are made, update golden screenshots:

```bash
npx playwright test --update-snapshots
```

## Requirements

- Preview route at `/preview?fixture=<path>` that renders Tiptap content
- Element with ID `#preview-page` containing the rendered output
- Dev server running on `localhost:3000`
