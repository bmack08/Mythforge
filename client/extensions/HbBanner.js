import { Node } from '@tiptap/core';

/**
 * HbBanner — Homebrewery banner block (atom)
 *
 * Renders banner text inside a `.banner` div.
 * Exports as: {{banner TEXT}}
 *
 * Atom node — text is stored in attrs.text, no content children.
 */
export default Node.create({
  name: 'hbBanner',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      text: {
        default: 'HOMEBREW',
        parseHTML: (element) =>
          element.getAttribute('data-hb-banner-text') || element.textContent?.trim() || '',
        renderHTML: () => ({}), // Handled in main renderHTML
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.banner[data-hb-banner-text]', priority: 60 },
      { tag: 'div.banner', priority: 55 },
      { tag: 'span.banner', priority: 55 },
    ];
  },

  renderHTML({ node }) {
    const text = node.attrs?.text || '';
    return [
      'div',
      { class: 'banner', 'data-hb-banner-text': text },
      text,
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const shieldInput = (input) => {
        // Stop ALL events ProseMirror intercepts so typing stays in the input
        const stop = (e) => e.stopPropagation();
        for (const evt of ['focus', 'click', 'mousedown', 'keyup', 'keypress',
          'beforeinput', 'input', 'compositionstart', 'compositionend',
          'compositionupdate', 'paste', 'drop']) {
          input.addEventListener(evt, stop);
        }
        input.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
          }
        });
      };

      const dom = document.createElement('div');
      dom.className = 'hb-macro-line';
      dom.contentEditable = 'false';
      dom.style.borderLeftColor = '#c0392b';

      // {{banner
      const openTag = document.createElement('span');
      openTag.className = 'hb-macro-tag';
      openTag.textContent = '{{';
      dom.appendChild(openTag);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'hb-macro-name';
      nameSpan.style.color = '#c0392b';
      nameSpan.textContent = 'banner';
      dom.appendChild(nameSpan);

      const space = document.createElement('span');
      space.className = 'hb-macro-tag';
      space.textContent = ' ';
      dom.appendChild(space);

      // Editable text
      const textInput = document.createElement('input');
      textInput.className = 'hb-macro-input';
      textInput.type = 'text';
      textInput.value = node.attrs.text || '';
      textInput.placeholder = 'BANNER TEXT';
      shieldInput(textInput);
      textInput.addEventListener('change', () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            text: textInput.value,
          })
        );
      });
      dom.appendChild(textInput);

      // }}
      const closeTag = document.createElement('span');
      closeTag.className = 'hb-macro-tag';
      closeTag.textContent = '}}';
      dom.appendChild(closeTag);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'hbBanner') return false;
          currentNode = updatedNode;
          textInput.value = updatedNode.attrs.text || '';
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertHbBanner: (text = 'HOMEBREW') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { text },
        });
      },
    };
  },
});
