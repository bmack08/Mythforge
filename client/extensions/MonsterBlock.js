import { Node } from '@tiptap/core';

/**
 * MonsterBlock - D&D 5e monster stat block
 * Renders as: <div class="monster">...</div>
 */
export default Node.create({
  name: 'monsterBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {};
          return { 'data-monster-name': attributes.name };
        },
      },
      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-type'),
        renderHTML: attributes => {
          if (!attributes.type) return {};
          return { 'data-monster-type': attributes.type };
        },
      },
      cr: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-cr'),
        renderHTML: attributes => {
          if (!attributes.cr) return {};
          return { 'data-monster-cr': attributes.cr };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.monster' },
      { tag: 'div.statblock' },
      { tag: 'section.monster' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'monster', ...HTMLAttributes };
    
    // If monster name exists, add header
    if (node.attrs.name) {
      const meta = [];
      if (node.attrs.type) meta.push(node.attrs.type);
      if (node.attrs.cr) meta.push(`CR ${node.attrs.cr}`);
      
      const header = [
        'div',
        { class: 'monster-header' },
        ['h3', { class: 'monster-name' }, node.attrs.name],
        meta.length ? ['p', { class: 'monster-meta' }, meta.join(' • ')] : null,
      ].filter(Boolean);
      
      return ['div', attrs, header, ['div', { class: 'monster-content' }, 0]];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleMonster: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
