import { Node } from '@tiptap/core';

/**
 * CoverBlock - D&D 5e cover page section
 *
 * Supports 4 cover types matching the PHB theme CSS:
 *   - 'front'  → <div class="frontCover">  — full-bleed cover with logo, title, subtitle, banner
 *   - 'inside' → <div class="insideCover"> — title page with image mask and logo
 *   - 'back'   → <div class="backCover">   — dark background with description, logo
 *   - 'part'   → <div class="partCover">   — chapter/part divider with header background
 *
 * Backward compatible: existing <section class="cover"> elements parse as 'front'.
 */

const COVER_TYPE_MAP = {
  front:  'frontCover',
  inside: 'insideCover',
  back:   'backCover',
  part:   'partCover',
};

// Reverse lookup: CSS class → coverType attribute value
const CLASS_TO_TYPE = {
  frontCover:  'front',
  insideCover: 'inside',
  backCover:   'back',
  partCover:   'part',
  cover:       'front', // legacy fallback
};

export default Node.create({
  name: 'coverBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      coverType: {
        default: 'front',
        parseHTML: (element) => {
          // Check each known class and return the matching type
          for (const [cls, type] of Object.entries(CLASS_TO_TYPE)) {
            if (element.classList.contains(cls)) {
              return type;
            }
          }
          return 'front';
        },
        renderHTML: () => {
          // Class is applied in renderHTML() below; no data attribute needed
          return {};
        },
      },
      background: {
        default: null,
        parseHTML: element => element.getAttribute('data-background'),
        renderHTML: attributes => {
          if (!attributes.background) return {};
          return { 'data-background': attributes.background };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.frontCover' },
      { tag: 'div.insideCover' },
      { tag: 'div.backCover' },
      { tag: 'div.partCover' },
      { tag: 'section.frontCover' },
      { tag: 'section.insideCover' },
      { tag: 'section.backCover' },
      { tag: 'section.partCover' },
      { tag: 'section.cover' },
      { tag: 'div.cover' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const coverType = node.attrs.coverType || 'front';
    const cssClass = COVER_TYPE_MAP[coverType] || 'frontCover';

    const attrs = {
      class: cssClass,
      ...HTMLAttributes,
    };

    // All cover types use position: static to prevent content wrapper collapse.
    //
    // In Homebrewery, cover divs are empty CSS-class markers (position: absolute).
    // In TipTap, content is wrapped INSIDE the cover div. Without position: static,
    // the theme's position: absolute pulls the div out of flow, collapsing the page.
    //
    // Static lets content flow normally while .page:has() selectors still trigger
    // for child elements (banner, footnote, logo) that position absolute to .page.
    //
    // Part cover also overrides height: auto to prevent the theme's fixed 6cm
    // height from clipping content.
    if (coverType === 'part') {
      attrs.style = 'position: static; height: auto; min-height: 6cm';
    } else {
      attrs.style = 'position: static';
    }

    return ['div', attrs, 0];
  },

  addCommands() {
    return {
      /**
       * Generic insert — accepts optional coverType and background.
       * Kept for backward compatibility.
       */
      insertCover: (coverType = 'front', background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType, background },
            content: [
              { type: 'logoBlock', content: [
                { type: 'image', attrs: { src: '/naturalCritLogoRed.svg' } },
              ]},
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Adventure Title' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'A D&D 5e Adventure' }] },
              { type: 'horizontalRule' },
              { type: 'bannerBlock', content: [{ type: 'text', text: 'HOMEBREW' }] },
              { type: 'footnoteBlock', content: [
                { type: 'paragraph', content: [
                  { type: 'text', text: 'In a forgotten kingdom, a group of adventurers set out to uncover an ancient secret that could change the world forever.' }
                ]},
              ]},
              { type: 'paragraph', content: [
                { type: 'text', text: 'Tip: Select the background image and change its src to use your own image.' }
              ]},
              { type: 'imageWithAttributes', attrs: { src: '/dragonBackground.png', alt: 'background image', background: true } },
            ],
          })
          .run();
      },

      /** Insert a Front Cover page */
      insertFrontCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'front', background },
            content: [
              { type: 'logoBlock', content: [
                { type: 'image', attrs: { src: '/naturalCritLogoRed.svg' } },
              ]},
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Adventure Title' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'A D&D 5e Adventure' }] },
              { type: 'horizontalRule' },
              { type: 'bannerBlock', content: [{ type: 'text', text: 'HOMEBREW' }] },
              { type: 'footnoteBlock', content: [
                { type: 'paragraph', content: [
                  { type: 'text', text: 'In a forgotten kingdom, a group of adventurers set out to uncover an ancient secret that could change the world forever.' }
                ]},
              ]},
              { type: 'paragraph', content: [
                { type: 'text', text: 'Tip: Select the background image and change its src to use your own image.' }
              ]},
              { type: 'imageWithAttributes', attrs: { src: '/dragonBackground.png', alt: 'background image', background: true } },
            ],
          })
          .run();
      },

      /** Insert an Inside Cover page */
      insertInsideCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'inside', background },
            content: [
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Adventure Title' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] },
              { type: 'horizontalRule' },
              { type: 'paragraph', content: [
                { type: 'text', text: 'Tip: Select the background image and change its src to use your own image.' }
              ]},
              { type: 'imageMaskBlock', attrs: { maskType: 'center', maskNumber: 5, offsetX: '0%', offsetY: '0%', rotation: '0' }, content: [
                { type: 'imageWithAttributes', attrs: { src: '/dragonBackground.png', alt: 'background image', background: true } }
              ]},
              { type: 'logoBlock', content: [
                { type: 'image', attrs: { src: '/naturalCritLogoRed.svg' } },
              ]},
            ],
          })
          .run();
      },

      /** Insert a Back Cover page */
      insertBackCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'back', background },
            content: [
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Back Cover Title' }] },
              { type: 'paragraph', content: [
                { type: 'text', text: 'Embark on a thrilling journey across a vast and varied world, where magic and mystery await you at every turn. Encounter strange creatures and ancient secrets, and forge your own destiny with your choices.' }
              ]},
              { type: 'paragraph', content: [
                { type: 'text', text: 'Experience a rich and immersive story that adapts to your actions and decisions. Every choice you make has consequences, for good or ill.' }
              ]},
              { type: 'horizontalRule' },
              { type: 'paragraph', content: [
                { type: 'text', marks: [{ type: 'italic' }], text: 'For use with any fantasy roleplaying ruleset. Play the best game of your life!' }
              ]},
              { type: 'paragraph', content: [
                { type: 'text', text: 'Tip: Select the background image and change its src to use your own image.' }
              ]},
              { type: 'imageWithAttributes', attrs: { src: '/dragonBackground.png', alt: 'background image', background: true } },
              { type: 'logoBlock', content: [
                { type: 'image', attrs: { src: '/naturalCritLogoWhite.svg' } },
                { type: 'paragraph', content: [{ type: 'text', text: 'Mythforge' }] },
              ]},
            ],
          })
          .run();
      },

      /** Insert a Part/Chapter Cover page */
      insertPartCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'part', background },
            content: [
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'PART I' }] },
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Chapter Title' }] },
              { type: 'paragraph', content: [
                { type: 'text', text: 'Tip: Select the background image and change its src to use your own image.' }
              ]},
              { type: 'imageMaskBlock', attrs: { maskType: 'edge', maskNumber: 3, offsetX: '0%', offsetY: '0%', rotation: '180' }, content: [
                { type: 'imageWithAttributes', attrs: { src: '/dragonBackground.png', alt: 'background image', background: true } }
              ]},
            ],
          })
          .run();
      },

      /** Change the cover type of the current cover block */
      setCoverType: (coverType) => ({ commands }) => {
        return commands.updateAttributes(this.name, { coverType });
      },
    };
  },
});
