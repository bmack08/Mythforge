import { Table } from '@tiptap/extension-table';

/**
 * TableBlock - D&D 5e styled table with PHB parity
 * Extends Tiptap's Table extension to add PHB-specific DOM structure
 *
 * Renders as: <div class="phb-table"><table class="phb table--compact">...</table></div>
 *
 * Per Blueprint EPIC A:
 * - Wrapper div with .phb-table class
 * - Table with .phb and .table--compact classes
 * - First row uses tableHeader cells for <thead>
 * - Remaining rows use tableCell for <tbody>
 * - Support alignment classes per column (future enhancement)
 */
export default Table.extend({
  name: 'table',

  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'table--compact',
        parseHTML: element => element.getAttribute('data-table-style') || 'table--compact',
        renderHTML: attributes => {
          return { 'data-table-style': attributes.style };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const style = node.attrs.style || 'table--compact';

    // Add phb and style classes to the table
    const tableAttrs = {
      ...HTMLAttributes,
      class: `phb ${style}`,
    };

    // Wrap table in div with phb-table class for proper PHB styling
    return ['div', { class: 'phb-table' },
      ['table', tableAttrs, ['tbody', 0]]
    ];
  },

  parseHTML() {
    return [
      { tag: 'div.phb-table > table', priority: 60 },
      { tag: 'table.phb', priority: 55 },
      { tag: 'table', priority: 50 },
    ];
  },
});
