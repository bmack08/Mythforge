/**
 * Visual regression tests for tables
 */
import { test, expect } from '@playwright/test';

test.describe('Table Visual Parity', () => {
  test('table basic - PHB style rendering', async ({ page }) => {
    // Navigate to preview route with table fixture
    await page.goto('/preview?fixture=table/basic');

    // Wait for content to load
    await page.waitForSelector('.phb-table', { timeout: 5000 });

    // Take screenshot and compare to golden
    const previewEl = page.locator('#preview-page');
    await expect(previewEl).toHaveScreenshot('table-basic.png');
  });

  test('table basic - header styling', async ({ page }) => {
    await page.goto('/preview?fixture=table/basic');

    const tableHeader = page.locator('.phb-table thead');
    await expect(tableHeader).toBeVisible();

    // Check header has distinct styling
    await expect(tableHeader).toHaveScreenshot('table-header.png');
  });
});
