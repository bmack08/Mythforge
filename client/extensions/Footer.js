import { Node } from '@tiptap/core';

/**
 * Footer - Page footer element for print/PDF
 * Renders as: <div class="phb-footer">...</div>
 *
 * Per Blueprint EPIC E:
 * - Fixed position element in paged media
 * - Appears at bottom of each page
 * - Can contain text, images, or other content
 */
export default Node.create({
  name: 'footer',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.phb-footer' },
      { tag: 'footer.phb-footer' },
      { tag: 'div[data-type="footer"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'phb-footer',
        'data-type': 'footer',
        ...HTMLAttributes,
      },
      0
    ];
  },

  addCommands() {
    return {
      setFooter: () => ({ chain }) => {
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
