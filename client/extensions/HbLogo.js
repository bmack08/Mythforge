import { Node } from '@tiptap/core';

/**
 * HbLogo — Homebrewery logo block (atom)
 *
 * Renders a logo image inside a `.logo` div.
 * Exports as: {{logo ![](src)}}
 *
 * Atom node — src is stored in attrs, no content children.
 */
export default Node.create({
  name: 'hbLogo',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => {
          const explicit = element.getAttribute('data-hb-logo-src');
          if (explicit) return explicit;
          const image = element.querySelector('img');
          return image?.getAttribute('src') || '';
        },
        renderHTML: () => ({}), // Handled in main renderHTML
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.logo[data-hb-logo-src]', priority: 60 },
      { tag: 'div.logo', priority: 55 },
      { tag: 'span.logo', priority: 55 },
    ];
  },

  renderHTML({ node }) {
    const src = node.attrs?.src || '';
    return [
      'div',
      { class: 'logo', 'data-hb-logo-src': src },
      ['img', { src, alt: '' }],
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
      dom.style.borderLeftColor = '#e67e22';

      // {{logo ![](
      const openTag = document.createElement('span');
      openTag.className = 'hb-macro-tag';
      openTag.textContent = '{{';
      dom.appendChild(openTag);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'hb-macro-name';
      nameSpan.style.color = '#e67e22';
      nameSpan.textContent = 'logo';
      dom.appendChild(nameSpan);

      const imgSyntaxOpen = document.createElement('span');
      imgSyntaxOpen.className = 'hb-macro-tag';
      imgSyntaxOpen.textContent = ' ![](';
      dom.appendChild(imgSyntaxOpen);

      // Editable src
      const srcInput = document.createElement('input');
      srcInput.className = 'hb-macro-input';
      srcInput.type = 'text';
      srcInput.value = node.attrs.src || '';
      srcInput.placeholder = 'image url';
      shieldInput(srcInput);
      srcInput.addEventListener('change', () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            src: srcInput.value,
          })
        );
      });
      dom.appendChild(srcInput);

      // )}}
      const closeTag = document.createElement('span');
      closeTag.className = 'hb-macro-tag';
      closeTag.textContent = ')}}';
      dom.appendChild(closeTag);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'hbLogo') return false;
          currentNode = updatedNode;
          srcInput.value = updatedNode.attrs.src || '';
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      insertHbLogo: (src = '/assets/naturalCritLogoRed.svg') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src },
        });
      },
    };
  },
});
