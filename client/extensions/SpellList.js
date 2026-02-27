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
      insertSpellList: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Cantrips (0 Level)' }] },
              {
                type: 'bulletList',
                content: [
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Fire Bolt' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Light' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mage Hand' }] }] },
                ]
              },
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: '1st Level' }] },
              {
                type: 'bulletList',
                content: [
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Burning Hands' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Detect Magic' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Magic Missile' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Shield' }] }] },
                ]
              },
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: '2nd Level' }] },
              {
                type: 'bulletList',
                content: [
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Misty Step' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Scorching Ray' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Web' }] }] },
                ]
              },
            ],
          })
          .run();
      },
    };
  },
});
