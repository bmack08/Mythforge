/**
 * Visual regression tests for wide blocks
 */
import { test, expect } from '@playwright/test';

test.describe('Wide Block Visual Parity', () => {
  test('wide basic - full width rendering', async ({ page }) => {
    await page.goto('/preview?fixture=wide/basic');

    await page.waitForSelector('.phb-wide', { timeout: 5000 });

    const previewEl = page.locator('#preview-page');
    await expect(previewEl).toHaveScreenshot('wide-basic.png');
  });
});
