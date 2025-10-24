import { Node } from '@tiptap/core';

/**
 * FeatureBlock - D&D 5e class/race feature block
 * Renders as: <div class="feature">...</div>
 */
export default Node.create({
  name: 'featureBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-feature-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {};
          return { 'data-feature-name': attributes.name };
        },
      },
      source: {
        default: null,
        parseHTML: element => element.getAttribute('data-feature-source'),
        renderHTML: attributes => {
          if (!attributes.source) return {};
          return { 'data-feature-source': attributes.source };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.feature' },
      { tag: 'div.classfeature' },
      { tag: 'section.feature' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'feature', ...HTMLAttributes };
    
    // If feature name exists, add header
    if (node.attrs.name) {
      const header = [
        'div',
        { class: 'feature-header' },
        ['h4', { class: 'feature-name' }, node.attrs.name],
        node.attrs.source ? ['p', { class: 'feature-source' }, node.attrs.source] : null,
      ].filter(Boolean);
      
      return ['div', attrs, header, ['div', { class: 'feature-content' }, 0]];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertFeature: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleFeature: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
