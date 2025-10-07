import { Node } from '@tiptap/core';

/**
 * WideBlock - Full-width content block spanning both columns
 * Renders as: <div class="wide">...</div>
 */
export default Node.create({
  name: 'wideBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'div.wide' },
      { tag: 'section.wide' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'wide', ...HTMLAttributes }, 0];
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
