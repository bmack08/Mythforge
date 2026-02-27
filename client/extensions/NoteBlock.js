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
            content: [
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Note Title' }] },
              { type: 'paragraph', content: [
                { type: 'text', text: 'Notes are used to add helpful information or reminders to your homebrew. They appear as green boxes in the PHB style.' }
              ]},
            ],
          })
          .run();
      },
      toggleNote: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
