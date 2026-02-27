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
            content: [
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Descriptive Text' }] },
              { type: 'paragraph', content: [
                { type: 'text', marks: [{ type: 'italic' }], text: 'Read-aloud text or descriptive box content goes here. This block uses the PHB descriptive style with a tan background and subtle border.' }
              ]},
            ],
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
