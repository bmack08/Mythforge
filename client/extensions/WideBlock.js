import { Node } from '@tiptap/core';

/**
 * WideBlock - Full-width content block spanning both columns
 * Renders as: <div class="phb-wide wide">...</div>
 *
 * Per Blueprint EPIC B:
 * - Adds .phb-wide class for parity testing
 * - Maintains .wide class for existing styling compatibility
 */
export default Node.create({
  name: 'wideBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.phb-wide' },
      { tag: 'div.wide' },
      { tag: 'section.wide' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'phb-wide wide', ...HTMLAttributes }, 0];
  },
  
  addCommands() {
    return {
      insertWide: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleWide: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
