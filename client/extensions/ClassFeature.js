import { Node } from '@tiptap/core';

/**
 * ClassFeature - D&D 5e PHB-style class feature block
 * Renders as: <div class="classFeature"><div class="block"></div></div>
 */
export default Node.create({
  name: 'classFeature',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'div.classFeature' },
      { tag: 'div[data-type="classFeature"]' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 
        class: 'classFeature',
        'data-type': 'classFeature',
        ...HTMLAttributes 
      },
      0
    ];
  },
  
  addCommands() {
    return {
      setClassFeature: () => ({ commands }) => {
        return commands.wrapIn(this.name);
      },
      toggleClassFeature: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
