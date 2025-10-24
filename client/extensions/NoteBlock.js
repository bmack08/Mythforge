import { Node } from '@tiptap/core';

/**
 * NoteBlock - D&D 5e note/annotation block
 * Renders as: <div class="note">...</div>
 */
export default Node.create({
  name: 'noteBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'div.note' },
      { tag: 'aside.note' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'note', ...HTMLAttributes }, 0];
  },
  
  addCommands() {
    return {
      insertNote: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
      toggleNote: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
