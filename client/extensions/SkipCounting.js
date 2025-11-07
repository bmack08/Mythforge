import { Node } from '@tiptap/core';

/**
 * SkipCounting - Skip page number increment for this page
 * Renders as: <span class="skipCounting" style="display:none"></span>
 *
 * Syntax: {{skipCounting}}
 * Used by Table of Contents generator to skip page numbers
 */
export default Node.create({
  name: 'skipCounting',

  group: 'inline',

  inline: true,

  atom: true,

  parseHTML() {
    return [
      { tag: 'span.skipCounting' },
      { tag: 'span[data-type="skipCounting"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        class: 'skipCounting',
        'data-type': 'skipCounting',
        style: 'display: none',
        ...HTMLAttributes,
      },
    ];
  },

  addCommands() {
    return {
      insertSkipCounting: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        });
      },
    };
  },
});
