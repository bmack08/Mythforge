import { Node } from '@tiptap/core';

/**
 * SpellBlock - D&D 5e spell description block
 * Enhanced version with spell metadata
 * Renders as: <div class="spell">...</div>
 */
export default Node.create({
  name: 'spellBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-spell-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {};
          return { 'data-spell-name': attributes.name };
        },
      },
      level: {
        default: null,
        parseHTML: element => element.getAttribute('data-spell-level'),
        renderHTML: attributes => {
          if (!attributes.level) return {};
          return { 'data-spell-level': attributes.level };
        },
      },
      school: {
        default: null,
        parseHTML: element => element.getAttribute('data-spell-school'),
        renderHTML: attributes => {
          if (!attributes.school) return {};
          return { 'data-spell-school': attributes.school };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.spell' },
      { tag: 'section.spell' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'spell', ...HTMLAttributes };
    
    // If spell name exists, add header
    if (node.attrs.name) {
      const levelText = node.attrs.level ? `${node.attrs.level}-level ` : '';
      const schoolText = node.attrs.school || '';
      const subtitle = levelText || schoolText ? `${levelText}${schoolText}` : null;
      
      const header = [
        'div',
        { class: 'spell-header' },
        ['h4', { class: 'spell-name' }, node.attrs.name],
        subtitle ? ['p', { class: 'spell-meta' }, subtitle] : null,
      ].filter(Boolean);
      
      return ['div', attrs, header, ['div', { class: 'spell-content' }, 0]];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertSpell: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleSpell: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
