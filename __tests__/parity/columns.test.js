/**
 * Columns Parity Tests
 * Ensures ColumnContainer generates PHB-compliant HTML structure
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Columns Parity', () => {
  test('columns two - generates phb-cols phb-col-2', () => {
    const md = readFixture('specs/parity/columns/two.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-cols');
    expect(html).toContain('phb-col-2');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('columns three - generates phb-col-3', () => {
    const md = readFixture('specs/parity/columns/three.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-cols');
    expect(html).toContain('phb-col-3');

    expect(html).toMatchSnapshot();
  });

  test('columns - respects column breaks', () => {
    const md = readFixture('specs/parity/columns/two.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Future: Assert column break structure
    expect(html).toMatchSnapshot();
  });
});
