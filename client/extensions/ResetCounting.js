import { Node } from '@tiptap/core';

/**
 * ResetCounting - Reset page numbering to 1
 * Renders as: <span class="resetCounting" style="display:none"></span>
 *
 * Syntax: {{resetCounting}}
 * Used by Table of Contents generator to restart page numbering
 */
export default Node.create({
  name: 'resetCounting',

  group: 'inline',

  inline: true,

  atom: true,

  parseHTML() {
    return [
      { tag: 'span.resetCounting' },
      { tag: 'span[data-type="resetCounting"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        class: 'resetCounting',
        'data-type': 'resetCounting',
        style: 'display: none',
        ...HTMLAttributes,
      },
    ];
  },

  addCommands() {
    return {
      insertResetCounting: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        });
      },
    };
  },
});
