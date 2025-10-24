/**
 * Visual regression tests for headings
 */
import { test, expect } from '@playwright/test';

test.describe('Headings Visual Parity', () => {
  test('headings basic - PHB typography', async ({ page }) => {
    await page.goto('/preview?fixture=headings/basic');

    await page.waitForSelector('.phb-h1', { timeout: 5000 });

    const previewEl = page.locator('#preview-page');
    await expect(previewEl).toHaveScreenshot('headings-basic.png');
  });

  test('headings - h1 styling', async ({ page }) => {
    await page.goto('/preview?fixture=headings/basic');

    const h1 = page.locator('.phb-h1').first();
    await expect(h1).toHaveScreenshot('heading-h1.png');
  });

  test('headings - h2 styling', async ({ page }) => {
    await page.goto('/preview?fixture=headings/basic');

    const h2 = page.locator('.phb-h2').first();
    await expect(h2).toHaveScreenshot('heading-h2.png');
  });

  test('headings - h3 styling', async ({ page }) => {
    await page.goto('/preview?fixture=headings/basic');

    const h3 = page.locator('.phb-h3').first();
    await expect(h3).toHaveScreenshot('heading-h3.png');
  });
});
