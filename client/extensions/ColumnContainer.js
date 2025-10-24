import { Node } from '@tiptap/core';

/**
 * ColumnContainer - Multi-column layout container
 * Renders as: <div class="phb-cols phb-col-{count}">...</div>
 *
 * Per Blueprint EPIC C:
 * - Container with .phb-cols and .phb-col-{count} classes
 * - Supports count attribute (default: 2)
 * - Works with ColumnBreak to split content flow
 */
export default Node.create({
  name: 'columnContainer',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: element => {
          // Parse from class like phb-col-2, phb-col-3
          const classList = Array.from(element.classList);
          const colClass = classList.find(c => c.match(/^phb-col-\d+$/));
          if (colClass) {
            const match = colClass.match(/phb-col-(\d+)/);
            return match ? parseInt(match[1], 10) : 2;
          }
          return element.getAttribute('data-column-count') || 2;
        },
        renderHTML: attributes => {
          return { 'data-column-count': attributes.count };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.phb-cols' },
      { tag: 'div[data-column-count]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const count = node.attrs.count || 2;

    return [
      'div',
      {
        class: `phb-cols phb-col-${count}`,
        'data-column-count': count,
        ...HTMLAttributes,
      },
      0
    ];
  },

  addCommands() {
    return {
      setColumnContainer: (count = 2) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { count },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleColumnContainer: (count = 2) => ({ commands }) => {
        return commands.toggleWrap(this.name, { count });
      },
    };
  },
});
