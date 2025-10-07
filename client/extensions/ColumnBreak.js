import { Node } from '@tiptap/core';
import { textblockTypeInputRule } from '@tiptap/core';

/**
 * ColumnBreak - D&D 5e column break (two-column layout)
 * Triggered by typing "\column" or inserted via command
 * Renders as: <div class="column-break" />
 */
export default Node.create({
  name: 'columnBreak',
  
  group: 'block',
  
  atom: true,
  
  parseHTML() {
    return [
      { tag: 'div.column-break' },
      { tag: 'hr.column-break' },
      { tag: 'div[data-type="columnBreak"]' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 
        class: 'column-break',
        'data-type': 'columnBreak',
        ...HTMLAttributes 
      }
    ];
  },
  
  addCommands() {
    return {
      setColumnBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
  
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^\\column$/,
        type: this.type,
      }),
    ];
  },
});
