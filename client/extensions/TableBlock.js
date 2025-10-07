import { Node } from '@tiptap/core';

/**
 * TableBlock - D&D 5e styled table
 * Renders as: <table class="phb-table">...</table>
 * Note: This wraps the existing TipTap table extension with PHB styling
 */
export default Node.create({
  name: 'tableBlock',
  
  group: 'block',
  
  content: 'tableRow+',
  
  tableRole: 'table',
  
  isolating: true,
  
  addAttributes() {
    return {
      style: {
        default: 'phb-table',
        parseHTML: element => element.getAttribute('data-table-style') || 'phb-table',
        renderHTML: attributes => {
          return { 'data-table-style': attributes.style };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'table.phb-table' },
      { tag: 'table[data-table-style]' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const style = node.attrs.style || 'phb-table';
    return ['table', { class: style, ...HTMLAttributes }, ['tbody', 0]];
  },
  
  addCommands() {
    return {
      insertTable: (attrs = { style: 'phb-table' }) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs,
            content: [
              {
                type: 'tableRow',
                content: [
                  { type: 'tableCell' },
                  { type: 'tableCell' },
                ],
              },
            ],
          })
          .run();
      },
    };
  },
});
