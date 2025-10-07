import { Node } from '@tiptap/core';

/**
 * SpellList - D&D 5e spell list table block
 * Renders as: <div class="spellList"><div class="block"></div></div>
 */
export default Node.create({
  name: 'spellList',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'div.spellList' },
      { tag: 'div[data-type="spellList"]' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 
        class: 'spellList',
        'data-type': 'spellList',
        ...HTMLAttributes 
      },
      0
    ];
  },
  
  addCommands() {
    return {
      setSpellList: () => ({ commands }) => {
        return commands.wrapIn(this.name);
      },
      toggleSpellList: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
