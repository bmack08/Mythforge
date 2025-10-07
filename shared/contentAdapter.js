/**
 * Content Adapter - Compatibility layer for TipTap JSON ↔ Legacy String
 * 
 * This adapter bridges the gap between:
 * - New TipTap v3 JSON document format
 * - Legacy code expecting markdown/HTML strings
 * 
 * Use this temporarily while migrating away from markdown.js
 */

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import * as TipTapCore from '@tiptap/core';
import createIcon from '../client/extensions/Icon.js';

// Load Icon extension
let IconExtension;
try {
  IconExtension = createIcon(TipTapCore);
} catch (err) {
  console.error('Failed to load Icon extension in contentAdapter:', err);
}

const extensions = IconExtension 
  ? [StarterKit, IconExtension]
  : [StarterKit];

/**
 * Ensures content is in TipTap JSON format
 * @param {any} docOrString - TipTap JSON doc or legacy string
 * @returns {object} TipTap JSON document
 */
export function ensureJson(docOrString) {
  if (!docOrString) {
    return { type: 'doc', content: [] };
  }
  
  // Already JSON
  if (typeof docOrString === 'object' && docOrString.type === 'doc') {
    return docOrString;
  }
  
  // Legacy string - wrap in paragraph
  if (typeof docOrString === 'string') {
    // Empty string
    if (!docOrString.trim()) {
      return { type: 'doc', content: [] };
    }
    
    // Wrap in paragraph node
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: docOrString
        }]
      }]
    };
  }
  
  // Fallback
  return { type: 'doc', content: [] };
}

/**
 * Converts TipTap JSON to plain text (for legacy compatibility)
 * Strips HTML tags and returns raw text
 * 
 * @param {object} doc - TipTap JSON document
 * @returns {string} Plain text representation
 */
export function toPlainText(doc) {
  try {
    if (!doc || typeof doc !== 'object') {
      return '';
    }
    
    // Generate HTML from TipTap JSON
    const html = generateHTML(doc, extensions);
    
    // Strip all HTML tags to get plain text
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (err) {
    console.error('toPlainText error:', err);
    return '';
  }
}

/**
 * Converts TipTap JSON to HTML (for preview rendering)
 * 
 * @param {object} doc - TipTap JSON document
 * @returns {string} HTML representation
 */
export function toHTML(doc) {
  try {
    if (!doc || typeof doc !== 'object') {
      return '';
    }
    
    return generateHTML(doc, extensions);
  } catch (err) {
    console.error('toHTML error:', err);
    return '';
  }
}

/**
 * Validates TipTap JSON structure
 * @param {any} doc - Content to validate
 * @returns {boolean} True if valid TipTap JSON
 */
export function isValidTipTapDoc(doc) {
  return !!(
    doc &&
    typeof doc === 'object' &&
    doc.type === 'doc' &&
    Array.isArray(doc.content)
  );
}

export default {
  ensureJson,
  toPlainText,
  toHTML,
  isValidTipTapDoc
};
