import { Node } from '@tiptap/core';

/**
 * HbFrontCover — Homebrewery cover page marker (atom)
 *
 * A flat marker node that tells the theme CSS "this page is a cover page."
 * All other cover content (banner, logo, footnote, bg image, headings)
 * are siblings, not children — matching Homebrewery's architecture where
 * `.page:has(.frontCover)` drives the styling.
 *
 * Supports all 4 cover types via `coverType` attr:
 *   front  → {{frontCover}}   → <div class="frontCover">
 *   back   → {{backCover}}    → <div class="backCover">
 *   inside → {{insideCover}}  → <div class="insideCover">
 *   part   → {{partCover}}    → <div class="partCover">
 */

const COVER_TYPE_MAP = {
  front:  'frontCover',
  back:   'backCover',
  inside: 'insideCover',
  part:   'partCover',
};

const COVER_COLORS = {
  front:  '#c0392b',
  back:   '#7f8c8d',
  inside: '#2980b9',
  part:   '#8e44ad',
};

export default Node.create({
  name: 'hbFrontCover',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      coverType: {
        default: 'front',
        parseHTML: (element) => {
          if (element.classList.contains('backCover')) return 'back';
          if (element.classList.contains('insideCover')) return 'inside';
          if (element.classList.contains('partCover')) return 'part';
          return 'front';
        },
        renderHTML: () => ({}), // Handled in main renderHTML
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.frontCover[data-hb-cover]', getAttrs: () => ({ coverType: 'front' }), priority: 60 },
      { tag: 'div.backCover[data-hb-cover]', getAttrs: () => ({ coverType: 'back' }), priority: 60 },
      { tag: 'div.insideCover[data-hb-cover]', getAttrs: () => ({ coverType: 'inside' }), priority: 60 },
      { tag: 'div.partCover[data-hb-cover]', getAttrs: () => ({ coverType: 'part' }), priority: 60 },
    ];
  },

  renderHTML({ node }) {
    const className = COVER_TYPE_MAP[node.attrs.coverType] || 'frontCover';
    return ['div', { class: className, 'data-hb-cover': 'true' }];
  },

  addNodeView() {
    return ({ node }) => {
      let currentNode = node;

      const dom = document.createElement('div');
      dom.className = 'hb-macro-line';
      dom.contentEditable = 'false';

      const macroName = COVER_TYPE_MAP[node.attrs.coverType] || 'frontCover';
      const color = COVER_COLORS[node.attrs.coverType] || COVER_COLORS.front;
      dom.style.borderLeftColor = color;

      const tag = document.createElement('span');
      tag.className = 'hb-macro-tag';
      tag.textContent = '{{';
      dom.appendChild(tag);

      const name = document.createElement('span');
      name.className = 'hb-macro-name';
      name.textContent = macroName;
      name.style.color = color;
      dom.appendChild(name);

      const closeTag = document.createElement('span');
      closeTag.className = 'hb-macro-tag';
      closeTag.textContent = '}}';
      dom.appendChild(closeTag);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'hbFrontCover') return false;
          currentNode = updatedNode;
          const newMacro = COVER_TYPE_MAP[updatedNode.attrs.coverType] || 'frontCover';
          const newColor = COVER_COLORS[updatedNode.attrs.coverType] || COVER_COLORS.front;
          name.textContent = newMacro;
          name.style.color = newColor;
          dom.style.borderLeftColor = newColor;
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertHbFrontCover: () => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: { coverType: 'front' } });
      },
      insertHbBackCover: () => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: { coverType: 'back' } });
      },
      insertHbInsideCover: () => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: { coverType: 'inside' } });
      },
      insertHbPartCover: () => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: { coverType: 'part' } });
      },

      // Full cover templates — insert the marker plus default sibling content
      insertFrontCoverTemplate: () => ({ chain }) => {
        return chain().insertContent([
          { type: 'hbFrontCover', attrs: { coverType: 'front' } },
          { type: 'hbLogo', attrs: { src: '/assets/naturalCritLogoRed.svg' } },
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Adventure Title' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'A D&D 5e Adventure' }] },
          { type: 'horizontalRule' },
          { type: 'hbBanner', attrs: { text: 'HOMEBREW' } },
          { type: 'hbFootnote', content: [{ type: 'text', text: 'In a forgotten kingdom, a group of adventurers set out to uncover an ancient secret that could change the world forever.' }] },
          { type: 'hbBackgroundImage', attrs: { src: '/dragonBackground.png', alt: 'background image', style: { position: 'absolute', bottom: '0', left: '0', height: '100%' } } },
        ]).run();
      },
      insertBackCoverTemplate: () => ({ chain }) => {
        return chain().insertContent([
          { type: 'hbFrontCover', attrs: { coverType: 'back' } },
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Back Cover Title' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Description text goes here.' }] },
          { type: 'horizontalRule' },
          { type: 'hbBackgroundImage', attrs: { src: '/dragonBackground.png', alt: 'background image', style: { position: 'absolute', bottom: '0', left: '0', height: '100%' } } },
          { type: 'hbLogo', attrs: { src: '/assets/naturalCritLogoWhite.svg' } },
        ]).run();
      },
      insertInsideCoverTemplate: () => ({ chain }) => {
        return chain().insertContent([
          { type: 'hbFrontCover', attrs: { coverType: 'inside' } },
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Book Title' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] },
          { type: 'horizontalRule' },
          { type: 'hbBackgroundImage', attrs: { src: '/dragonBackground.png', alt: 'background image', style: { position: 'absolute', bottom: '0', left: '0', height: '100%' } } },
          { type: 'hbLogo', attrs: { src: '/assets/naturalCritLogoRed.svg' } },
        ]).run();
      },
      insertPartCoverTemplate: () => ({ chain }) => {
        return chain().insertContent([
          { type: 'hbFrontCover', attrs: { coverType: 'part' } },
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Part I' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Chapter Title' }] },
          { type: 'hbBackgroundImage', attrs: { src: '/dragonBackground.png', alt: 'background image', style: { position: 'absolute', bottom: '0', left: '0', height: '100%' } } },
        ]).run();
      },

      // Legacy alias
      insertFrontCover: () => ({ commands }) => {
        return commands.insertFrontCoverTemplate();
      },
    };
  },
});
