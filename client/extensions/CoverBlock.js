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
      // Specific cover types first (higher priority)
      { tag: 'div.frontCover' },
      { tag: 'div.insideCover' },
      { tag: 'div.backCover' },
      { tag: 'div.partCover' },
      { tag: 'section.frontCover' },
      { tag: 'section.insideCover' },
      { tag: 'section.backCover' },
      { tag: 'section.partCover' },
      // Legacy fallback — old documents with just .cover
      { tag: 'section.cover' },
      { tag: 'div.cover' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const coverType = node.attrs.coverType || 'front';
    const cssClass = COVER_TYPE_MAP[coverType] || 'frontCover';
    const attrs = { class: cssClass, ...HTMLAttributes };

    // Add inline background style if background attribute exists
    if (node.attrs.background) {
      attrs.style = `background-image: url(${node.attrs.background})`;
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
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert a Front Cover page */
      insertFrontCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'front', background },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert an Inside Cover page */
      insertInsideCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'inside', background },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert a Back Cover page */
      insertBackCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'back', background },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert a Part/Chapter Cover page */
      insertPartCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { coverType: 'part', background },
            content: [{ type: 'paragraph' }],
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
