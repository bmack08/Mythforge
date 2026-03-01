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
            content: [
              { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'Martial Archetype' }] },
              { type: 'paragraph', content: [
                { type: 'text', text: 'At 3rd level, you choose an archetype that you strive to emulate in your combat styles and techniques. Choose one of the following options. Your archetype grants you features at 3rd level and again at 7th, 10th, 15th, and 18th level.' },
              ]},
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Action Surge' }] },
              { type: 'paragraph', content: [
                { type: 'text', text: 'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action.' },
              ]},
              { type: 'paragraph', content: [
                { type: 'text', text: 'Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.' },
              ]},
            ],
          })
          .run();
      },
      toggleFeature: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
