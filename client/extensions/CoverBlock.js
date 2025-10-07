import { Node } from '@tiptap/core';

/**
 * CoverBlock - D&D 5e cover page section
 * Renders as: <section class="cover">...</section>
 */
export default Node.create({
  name: 'coverBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
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
      { tag: 'section.cover' },
      { tag: 'div.cover' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'cover', ...HTMLAttributes };
    
    // Add inline background style if background attribute exists
    if (node.attrs.background) {
      attrs.style = `background-image: url(${node.attrs.background})`;
    }
    
    return ['section', attrs, 0];
  },
  
  addCommands() {
    return {
      insertCover: (background = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { background },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },
});
