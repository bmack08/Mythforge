import { Node } from '@tiptap/core';

/**
 * PageNumber - Page number display positioned in footer area.
 *
 * Matches Homebrewery's {{pageNumber}} / {{pageNumber,auto}} syntax.
 * Renders as a positioned <div class="pageNumber"> that the PHB theme
 * styles with absolute positioning in the page footer.
 *
 * When auto=true, the CSS counter `page-numbers` displays the number
 * via `::after { content: counter(page-numbers) }` — no text content needed.
 *
 * When auto=false, the `value` attr provides the manual page number.
 */
export default Node.create({
  name: 'pageNumber',

  group: 'block',

  atom: true,

  selectable: true,

  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute('data-page-number');
          if (val) return parseInt(val, 10);
          // Manual page number: text content of the element
          const text = element.textContent?.trim();
          if (text && /^\d+$/.test(text)) return parseInt(text, 10);
          return null;
        },
        renderHTML: (attributes) => {
          if (attributes.value !== null) {
            return { 'data-page-number': attributes.value };
          }
          return {};
        },
      },
      auto: {
        default: true,
        parseHTML: (element) => {
          // Homebrewery: <div class="pageNumber auto">
          if (element.classList.contains('auto')) return true;
          const dataAuto = element.getAttribute('data-auto');
          if (dataAuto === 'true') return true;
          if (dataAuto === 'false') return false;
          // If no text content and no manual value, assume auto
          return !element.textContent?.trim();
        },
        renderHTML: () => ({}), // Handled in main renderHTML
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.pageNumber', priority: 60 },
      { tag: 'span.pageNumber', priority: 55 },
      { tag: 'span.phb-page-number', priority: 50 },
    ];
  },

  renderHTML({ node }) {
    const isAuto = node.attrs.auto;
    const classes = ['pageNumber'];
    if (isAuto) classes.push('auto');

    const attrs = { class: classes.join(' ') };

    if (!isAuto && node.attrs.value !== null) {
      // Manual page number — render the number as text content
      return ['div', attrs, node.attrs.value.toString()];
    }

    // Auto page number — CSS counter handles the display via ::after
    return ['div', attrs];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'hb-macro-line';
      dom.contentEditable = 'false';
      dom.style.borderLeftColor = '#95a5a6';

      const tag = document.createElement('span');
      tag.className = 'hb-macro-tag';
      tag.textContent = '{{';
      dom.appendChild(tag);

      const name = document.createElement('span');
      name.className = 'hb-macro-name';
      name.style.color = '#95a5a6';
      name.textContent = 'pageNumber';
      dom.appendChild(name);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'hb-macro-tag';
      if (node.attrs.auto) {
        valueSpan.textContent = ',auto';
      } else if (node.attrs.value !== null) {
        valueSpan.textContent = ` ${node.attrs.value}`;
      }
      dom.appendChild(valueSpan);

      const closeTag = document.createElement('span');
      closeTag.className = 'hb-macro-tag';
      closeTag.textContent = '}}';
      dom.appendChild(closeTag);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'pageNumber') return false;
          if (updatedNode.attrs.auto) {
            valueSpan.textContent = ',auto';
          } else if (updatedNode.attrs.value !== null) {
            valueSpan.textContent = ` ${updatedNode.attrs.value}`;
          } else {
            valueSpan.textContent = '';
          }
          return true;
        },
      };
    };
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
