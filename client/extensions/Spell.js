import { Node } from '@tiptap/core';

/**
 * Spell - D&D 5e spell description block
 * Renders as: <div class="spell"><div class="block"></div></div>
 */
export default Node.create({
  name: 'spell',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'div.spell' },
      { tag: 'div[data-type="spell"]' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 
        class: 'spell',
        'data-type': 'spell',
        ...HTMLAttributes 
      },
      0
    ];
  },
  
  addCommands() {
    return {
      setSpell: () => ({ commands }) => {
        return commands.wrapIn(this.name);
      },
      toggleSpell: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
