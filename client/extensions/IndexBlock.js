import { Node } from '@tiptap/core';

/**
 * IndexBlock - D&D 5e index/glossary page block
 * Renders as: <div class="index">...</div>
 *
 * Used for creating index pages with very small font text
 * organized in columns. Supports paragraphs, bullet lists,
 * and headings inside.
 */
export default Node.create({
  name: 'indexBlock',

  group: 'block',

  content: '(paragraph|bulletList|heading)+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.index' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'index', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertIndex: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Index' }] },
              {
                type: 'bulletList',
                content: [
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Adventurers, 7' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dragons, 12-15' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Magic Items, 23' }] }] },
                  { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Spells, 28-34' }] }] },
                ]
              },
            ],
          })
          .run();
      },
      toggleIndex: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
