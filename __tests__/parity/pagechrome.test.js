/**
 * Page Chrome Parity Tests
 * Ensures Header, Footer, PageNumber generate PHB-compliant HTML
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Page Chrome Parity', () => {
  test('pagechrome basic - generates phb-header', () => {
    const md = readFixture('specs/parity/pagechrome/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-header');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('pagechrome basic - generates phb-footer', () => {
    const md = readFixture('specs/parity/pagechrome/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-footer');

    expect(html).toMatchSnapshot();
  });

  test('pagechrome basic - generates phb-page-number', () => {
    const md = readFixture('specs/parity/pagechrome/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-page-number');

    expect(html).toMatchSnapshot();
  });
});
