/**
 * Image Attributes Parity Tests
 * Ensures ImageWithAttributes generates PHB-compliant HTML
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Image Attributes Parity', () => {
  test('images attrs - generates phb-image class', () => {
    const md = readFixture('specs/parity/images/attrs.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-image');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('images attrs - applies width style', () => {
    const md = readFixture('specs/parity/images/attrs.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for inline width style
    expect(html).toMatch(/style="[^"]*width:/);

    expect(html).toMatchSnapshot();
  });

  test('images attrs - applies wrapLeft class', () => {
    const md = readFixture('specs/parity/images/attrs.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for wrapLeft class
    expect(html).toContain('wrapLeft');

    expect(html).toMatchSnapshot();
  });

  test('images attrs - applies wrapRight class', () => {
    const md = readFixture('specs/parity/images/attrs.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for wrapRight class
    expect(html).toContain('wrapRight');

    expect(html).toMatchSnapshot();
  });
});
