/**
 * Headings Parity Tests
 * Ensures HeadingWithId generates PHB-compliant HTML structure
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Headings Parity', () => {
  test('headings basic - generates phb-h1/h2/h3 classes', () => {
    const md = readFixture('specs/parity/headings/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-h1');
    expect(html).toContain('phb-h2');
    expect(html).toContain('phb-h3');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('headings basic - generates stable IDs', () => {
    const md = readFixture('specs/parity/headings/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert IDs are present and slugified
    expect(html).toMatch(/id="[a-z0-9-]+"/);

    expect(html).toMatchSnapshot();
  });

  test('headings basic - IDs are stable across renders', () => {
    const md = readFixture('specs/parity/headings/basic.md');

    // Render twice
    const html1 = renderHTML(toTiptapJSON(md));
    const html2 = renderHTML(toTiptapJSON(md));

    // Should be identical
    expect(html1).toBe(html2);
  });
});
