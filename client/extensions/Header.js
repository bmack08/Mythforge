import { Node } from '@tiptap/core';

/**
 * Header - Page header element for print/PDF
 * Renders as: <div class="phb-header">...</div>
 *
 * Per Blueprint EPIC E:
 * - Fixed position element in paged media
 * - Appears at top of each page
 * - Can contain text, images, or other content
 */
export default Node.create({
  name: 'header',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.phb-header' },
      { tag: 'header.phb-header' },
      { tag: 'div[data-type="header"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'phb-header',
        'data-type': 'header',
        ...HTMLAttributes,
      },
      0
    ];
  },

  addCommands() {
    return {
      setHeader: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },
});
