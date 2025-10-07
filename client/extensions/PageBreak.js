import { Node } from '@tiptap/core';
import { textblockTypeInputRule } from '@tiptap/core';

/**
 * PageBreak - D&D 5e page break node
 * Triggered by typing "\page" or inserted via command
 * Renders as: <hr class="page-break" />
 */
export default Node.create({
  name: 'pageBreak',
  
  group: 'block',
  
  atom: true,
  
  parseHTML() {
    return [
      { tag: 'hr.page-break' },
      { tag: 'hr[data-type="pageBreak"]' },
      { tag: 'div.page-break' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'hr',
      { 
        class: 'page-break',
        'data-type': 'pageBreak',
        ...HTMLAttributes 
      }
    ];
  },
  
  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
  
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^\\page$/,
        type: this.type,
      }),
    ];
  },
});
