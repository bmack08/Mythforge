import { Node } from '@tiptap/core';

/**
 * PageNumber - Page number display for print/PDF
 * Renders as: <span class="phb-page-number">...</span>
 *
 * Per Blueprint EPIC E:
 * - Displays page numbers in print/PDF
 * - Supports manual numbering or auto-increment
 * - Positioned in footer area
 *
 * Attributes:
 * - value (number): Manual page number value
 * - auto (boolean): Auto-increment from previous (default: true)
 */
export default Node.create({
  name: 'pageNumber',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: element => {
          const val = element.getAttribute('data-page-number');
          return val ? parseInt(val, 10) : null;
        },
        renderHTML: attributes => {
          if (attributes.value !== null) {
            return { 'data-page-number': attributes.value };
          }
          return {};
        },
      },
      auto: {
        default: true,
        parseHTML: element => {
          const auto = element.getAttribute('data-auto');
          return auto !== 'false';
        },
        renderHTML: attributes => {
          return { 'data-auto': attributes.auto ? 'true' : 'false' };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span.phb-page-number' },
      { tag: 'span.pageNumber' },
      { tag: 'span[data-type="pageNumber"]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const content = node.attrs.value !== null ? node.attrs.value.toString() : '#';

    return [
      'span',
      {
        class: 'phb-page-number pageNumber',
        'data-type': 'pageNumber',
        ...HTMLAttributes,
      },
      content
    ];
  },

  addCommands() {
    return {
      setPageNumber: (value = null, auto = true) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { value, auto },
        });
      },
    };
  },
});
