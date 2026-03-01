import fs from 'fs';
import path from 'path';
import { markdownToTiptap } from '../../shared/helpers/markdownToTiptap.js';
import { tiptapToMarkdown } from '../../shared/helpers/tiptapToMarkdown.js';
import { normalizeTipTapDoc } from '../../shared/helpers/normalizeDoc.js';

const fixturesPath = path.join(process.cwd(), 'specs', 'parity', 'homebrew-special', 'fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const normalizeValue = (value) => {
  if (Array.isArray(value)) return value.map(normalizeValue);

  if (value && typeof value === 'object') {
    const sortedEntries = Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, normalizeValue(value[key])]);

    return Object.fromEntries(sortedEntries);
  }

  return value;
};

const normalizeDocForCompare = (doc) => normalizeValue(doc);

const parseSource = (source) => normalizeTipTapDoc(markdownToTiptap(source));

describe('Homebrew Special Syntax Parity', () => {
  test('fixture corpus parses special macros into hb* nodes', () => {
    const full = fixtures.find((fixture) => fixture.name === 'full-front-cover-snippet');
    const parsed = parseSource(full.source);

    expect(parsed.content[0].type).toBe('hbFrontCover');
    expect(parsed.content[1].type).toBe('hbLogo');
    expect(parsed.content[1].attrs.src).toBe('/assets/naturalCritLogoRed.svg');
    expect(parsed.content.some((node) => node.type === 'hbBanner')).toBe(true);
    expect(parsed.content.some((node) => node.type === 'hbFootnote')).toBe(true);
    expect(parsed.content.some((node) => node.type === 'hbBackgroundImage')).toBe(true);
  });

  test.each(fixtures)('round-trip node semantics are stable: $name', ({ source }) => {
    const firstParse = parseSource(source);
    const firstSerialized = tiptapToMarkdown(firstParse);
    const secondParse = parseSource(firstSerialized);

    expect(normalizeDocForCompare(secondParse)).toEqual(normalizeDocForCompare(firstParse));
  });

  test.each(fixtures)('serialization is deterministic: $name', ({ source }) => {
    const first = tiptapToMarkdown(parseSource(source));
    const second = tiptapToMarkdown(parseSource(first));

    expect(second).toBe(first);
  });

  test('editing hbBackgroundImage src updates only URL and preserves syntax', () => {
    const canonicalSource = '![background image](https://i.imgur.com/IwHRrbF.jpg){bottom:0,height:100%,left:0,position:absolute}';
    const parsed = parseSource(canonicalSource);
    const imageIndex = parsed.content.findIndex((node) => node.type === 'hbBackgroundImage');

    expect(imageIndex).toBeGreaterThanOrEqual(0);

    const originalMarkdown = tiptapToMarkdown(parsed);
    const updated = JSON.parse(JSON.stringify(parsed));
    const oldSrc = updated.content[imageIndex].attrs.src;
    const newSrc = 'https://cdn.example.com/new-bg.jpg';
    updated.content[imageIndex].attrs.src = newSrc;

    const updatedMarkdown = tiptapToMarkdown(updated);

    expect(updatedMarkdown).toContain(`![background image](${newSrc}){bottom:0,height:100%,left:0,position:absolute}`);
    expect(updatedMarkdown).not.toContain(oldSrc);
    expect(updatedMarkdown.replace(newSrc, oldSrc)).toBe(originalMarkdown);
  });

  test('footnote multiline formatting is canonical and preserved', () => {
    const source = '{{footnote\n  In an amazing kingdom, a wizard and a secretary hope to prevent the destruction of mankind.\n}}';
    const parsed = parseSource(source);

    expect(parsed.content).toHaveLength(1);
    expect(parsed.content[0].type).toBe('hbFootnote');

    const serialized = tiptapToMarkdown(parsed);

    expect(serialized).toBe(source);
    expect(parseSource(serialized)).toEqual(parsed);
  });
});
