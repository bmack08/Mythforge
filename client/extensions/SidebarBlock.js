import { Node } from '@tiptap/core';

/**
 * SidebarBlock - D&D 5e sidebar/info box
 * Renders as: <div class="sidebar">...</div>
 */
export default Node.create({
  name: 'sidebarBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          if (!attributes.title) return {};
          return { 'data-title': attributes.title };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.sidebar' },
      { tag: 'aside.sidebar' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'sidebar', ...HTMLAttributes };
    
    // If title exists, render it as first element
    if (node.attrs.title) {
      return [
        'div',
        attrs,
        ['h3', { class: 'sidebar-title' }, node.attrs.title],
        ['div', { class: 'sidebar-content' }, 0],
      ];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertSidebar: (title = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { title },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleSidebar: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
