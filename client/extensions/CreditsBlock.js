import { Node } from '@tiptap/core';

/**
 * CreditsBlock - D&D 5e credits/back cover section
 * Renders as: <section class="credits">...</section>
 */
export default Node.create({
  name: 'creditsBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  parseHTML() {
    return [
      { tag: 'section.credits' },
      { tag: 'div.credits' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['section', { class: 'credits', ...HTMLAttributes }, 0];
  },
  
  addCommands() {
    return {
      insertCredits: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },
});
