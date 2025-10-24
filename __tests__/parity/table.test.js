/**
 * Table Parity Tests
 * Ensures TableBlock generates PHB-compliant HTML structure
 */

import { readFixture, toTiptapJSON, renderHTML, assertDOMHooks } from './testUtils.js';

describe('Table Parity', () => {
  test('table basic - generates phb-table wrapper', () => {
    const md = readFixture('specs/parity/table/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-table');
    expect(html).toContain('<table');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('table basic - first row becomes thead', () => {
    const md = readFixture('specs/parity/table/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert header structure
    expect(html).toContain('<thead');
    expect(html).toContain('<tbody');

    expect(html).toMatchSnapshot();
  });

  test('table basic - applies alignment classes', () => {
    const md = readFixture('specs/parity/table/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Future: Check for alignment classes on columns
    expect(html).toMatchSnapshot();
  });
});
