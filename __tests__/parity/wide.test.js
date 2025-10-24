/**
 * Wide Block Parity Tests
 * Ensures WideBlock generates PHB-compliant HTML structure
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Wide Block Parity', () => {
  test('wide basic - generates phb-wide wrapper', () => {
    const md = readFixture('specs/parity/wide/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-wide');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('wide basic - content spans full width', () => {
    const md = readFixture('specs/parity/wide/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for wide class on wrapper div
    expect(html).toMatch(/<div[^>]*class="[^"]*phb-wide[^"]*"/);

    expect(html).toMatchSnapshot();
  });
});
