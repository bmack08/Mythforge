/**
 * Icons & Emoji Parity Tests
 * Ensures IconMark and Emoji generate PHB-compliant HTML
 */

import { readFixture, toTiptapJSON, renderHTML } from './testUtils.js';

describe('Icons & Emoji Parity', () => {
  test('icons-emoji basic - generates phb-icon class', () => {
    const md = readFixture('specs/parity/icons-emoji/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Assert required DOM hooks
    expect(html).toContain('phb-icon');

    // Snapshot test
    expect(html).toMatchSnapshot();
  });

  test('icons-emoji basic - FontAwesome icons render', () => {
    const md = readFixture('specs/parity/icons-emoji/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for FA icon classes
    expect(html).toMatch(/fa-dragon|fa-dice-d20|fa-sword|fa-shield/);

    expect(html).toMatchSnapshot();
  });

  test('icons-emoji basic - Elderberry Inn emoji render', () => {
    const md = readFixture('specs/parity/icons-emoji/basic.md');
    const json = toTiptapJSON(md);
    const html = renderHTML(json);

    // Check for emoji classes
    expect(html).toMatch(/phb-emoji|ei/);

    expect(html).toMatchSnapshot();
  });
});
