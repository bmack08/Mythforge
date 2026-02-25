import { Node } from '@tiptap/core';

/**
 * ClassFeature - D&D 5e PHB-style descriptive/class feature block
 * Renders as: <div class="descriptive"> to match the PHB theme CSS
 */
export default Node.create({
  name: 'classFeature',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.descriptive' },
      { tag: 'div.classFeature' },
      { tag: 'div[data-type="classFeature"]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        class: 'descriptive',
        'data-type': 'classFeature',
        ...HTMLAttributes
      },
      0
    ];
  },
  
  addCommands() {
    return {
      insertDescriptive: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      setClassFeature: () => ({ commands }) => {
        return commands.wrapIn(this.name);
      },
      toggleClassFeature: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
