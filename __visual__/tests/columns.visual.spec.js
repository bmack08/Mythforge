/**
 * Visual regression tests for column layouts
 */
import { test, expect } from '@playwright/test';

test.describe('Columns Visual Parity', () => {
  test('columns two - two column layout', async ({ page }) => {
    await page.goto('/preview?fixture=columns/two');

    await page.waitForSelector('.phb-cols.phb-col-2', { timeout: 5000 });

    const previewEl = page.locator('#preview-page');
    await expect(previewEl).toHaveScreenshot('columns-two.png');
  });

  test('columns three - three column layout', async ({ page }) => {
    await page.goto('/preview?fixture=columns/three');

    await page.waitForSelector('.phb-cols.phb-col-3', { timeout: 5000 });

    const previewEl = page.locator('#preview-page');
    await expect(previewEl).toHaveScreenshot('columns-three.png');
  });
});
