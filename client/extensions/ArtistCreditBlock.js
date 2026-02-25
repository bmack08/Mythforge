import { Node } from '@tiptap/core';

/**
 * ArtistCreditBlock - D&D 5e artist credit attribution
 *
 * Used to credit artists for illustrations in the sourcebook.
 * Typically positioned near artwork with CSS.
 *
 * Renders as: <div class="artist">...</div>
 * Contains paragraph+ content for artist name, medium, etc.
 */
export default Node.create({
  name: 'artistCreditBlock',

  group: 'block',

  content: 'paragraph+',

  defining: true,

  addAttributes() {
    return {
      position: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-position') || null,
        renderHTML: (attributes) => {
          if (!attributes.position) return {};
          return {
            'data-position': attributes.position,
            style: attributes.position,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.artist' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'artist', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertArtistCredit: (position = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { position },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },
});
