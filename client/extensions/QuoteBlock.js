import { Node } from '@tiptap/core';

/**
 * QuoteBlock - D&D 5e quote/callout block
 * Renders as: <div class="quote">...</div>
 * Optionally includes attribution
 */
export default Node.create({
  name: 'quoteBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      attribution: {
        default: null,
        parseHTML: element => element.getAttribute('data-attribution'),
        renderHTML: attributes => {
          if (!attributes.attribution) return {};
          return { 'data-attribution': attributes.attribution };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.quote' },
      { tag: 'blockquote.quote' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'quote', ...HTMLAttributes };
    
    // If attribution exists, add it as a data attribute
    if (node.attrs.attribution) {
      return [
        'div',
        attrs,
        ['div', { class: 'quote-content' }, 0],
        ['p', { class: 'attribution' }, node.attrs.attribution],
      ];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertQuote: (attribution = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { attribution },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleQuote: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
