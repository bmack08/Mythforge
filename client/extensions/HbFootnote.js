import { Node } from '@tiptap/core';

/**
 * HbFootnote — Homebrewery footnote block
 *
 * A block node with inline content (text, marks, hardBreaks).
 * Exports as:
 *   {{footnote
 *     <content>
 *   }}
 *
 * Uses `content: 'inline*'` — the user types directly into the node
 * without paragraph wrappers. Multi-line content uses hardBreak nodes.
 */
export default Node.create({
  name: 'hbFootnote',

  group: 'block',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.footnote[data-hb-footnote]', priority: 60 },
      { tag: 'div.footnote', priority: 55 },
      { tag: 'aside.footnote', priority: 55 },
    ];
  },

  renderHTML() {
    return [
      'div',
      { class: 'footnote', 'data-hb-footnote': 'true' },
      0,
    ];
  },

  addNodeView() {
    return () => {
      // Outer container
      const dom = document.createElement('div');
      dom.className = 'hb-macro-block';
      dom.style.borderLeftColor = '#27ae60';

      // Header: {{footnote
      const header = document.createElement('div');
      header.className = 'hb-macro-tag hb-macro-block-tag';
      header.contentEditable = 'false';

      const openBrace = document.createElement('span');
      openBrace.textContent = '{{';
      header.appendChild(openBrace);

      const name = document.createElement('span');
      name.className = 'hb-macro-name';
      name.style.color = '#27ae60';
      name.textContent = 'footnote';
      header.appendChild(name);

      dom.appendChild(header);

      // Content area — ProseMirror manages this
      const contentDOM = document.createElement('div');
      contentDOM.className = 'hb-macro-content';
      dom.appendChild(contentDOM);

      // Footer: }}
      const footer = document.createElement('div');
      footer.className = 'hb-macro-tag hb-macro-block-tag';
      footer.contentEditable = 'false';
      footer.textContent = '}}';
      dom.appendChild(footer);

      return { dom, contentDOM };
    };
  },

  addCommands() {
    return {
      insertHbFootnote: (text = '') => ({ commands }) => {
        const content = text ? [{ type: 'text', text }] : [{ type: 'text', text: '' }];
        return commands.insertContent({
          type: this.name,
          content,
        });
      },

      // Legacy alias
      insertFootnote: (text) => ({ commands }) => {
        return commands.insertHbFootnote(text);
      },
    };
  },
});
