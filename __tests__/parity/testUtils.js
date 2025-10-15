/**
 * Test utilities for parity testing
 * Provides helpers to convert Markdown → Tiptap JSON → HTML
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTML } from '@tiptap/html';
import extensions from '../../client/extensions/index.js';
import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read a fixture file from specs/parity
 */
export function readFixture(fixturePath) {
  const fullPath = path.join(__dirname, '..', '..', fixturePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Convert Markdown to Tiptap JSON
 * Uses the actual markdown parser from shared/helpers
 */
export function toTiptapJSON(markdown) {
  return markdownToTiptap(markdown);
}

/**
 * Render Tiptap JSON to HTML string
 * Uses all Mythforge extensions for proper parity testing
 */
export function renderHTML(json, additionalExtensions = []) {
  // Use all extensions from the registry + any additional ones
  const allExtensions = [...extensions, ...additionalExtensions];

  return generateHTML(json, allExtensions);
}

/**
 * Assert HTML contains specific DOM hooks
 */
export function assertDOMHooks(html, expectedClasses) {
  for (const className of expectedClasses) {
    if (!html.includes(className)) {
      throw new Error(`Expected HTML to contain class "${className}"`);
    }
  }
}
