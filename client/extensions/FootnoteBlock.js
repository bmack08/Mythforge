import { Node } from '@tiptap/core';

/**
 * FootnoteBlock - D&D 5e footnote/reference block
 * Renders as: <div class="footnote">...</div>
 */
export default Node.create({
  name: 'footnoteBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-number'),
        renderHTML: attributes => {
          if (!attributes.number) return {};
          return { 'data-footnote-number': attributes.number };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.footnote' },
      { tag: 'aside.footnote' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'footnote', ...HTMLAttributes };
    
    // If footnote number exists, add it
    if (node.attrs.number) {
      return [
        'div',
        attrs,
        ['span', { class: 'footnote-number' }, `[${node.attrs.number}]`],
        ['span', { class: 'footnote-content' }, 0],
      ];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertFootnote: (number = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { number },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },
});
