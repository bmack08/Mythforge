import { Node } from '@tiptap/core';

const parseInlineStyle = (inlineStyle = '') => {
  const style = {};
  inlineStyle.split(';').forEach((pair) => {
    const colonIndex = pair.indexOf(':');
    if (colonIndex === -1) return;
    const key = pair.slice(0, colonIndex).trim();
    const value = pair.slice(colonIndex + 1).trim();
    if (key && value) style[key] = value;
  });
  return style;
};

const serializeStyle = (style = {}) => {
  const entries = Object.entries(style || {})
    .filter(([key, value]) => key && value !== undefined && value !== null && String(value) !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, value]) => `${key}:${value}`).join(';');
};

const formatStyleSummary = (style = {}) => {
  const entries = Object.entries(style || {})
    .filter(([key, value]) => key && value !== undefined && value !== null && String(value) !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return '';
  return `{${entries.map(([key, value]) => `${key}:${value}`).join(', ')}}`;
};

export default Node.create({
  name: 'hbBackgroundImage',

  group: 'block',

  atom: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('src') || '',
        renderHTML: () => ({}),
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('alt') || '',
        renderHTML: () => ({}),
      },
      style: {
        default: {},
        parseHTML: (element) => parseInlineStyle(element.getAttribute('style') || ''),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'img[data-hb-background-image]' },
      { tag: 'img.phb-image[style*="position:absolute"]' },
    ];
  },

  renderHTML({ node }) {
    const src = node.attrs?.src || '';
    const alt = node.attrs?.alt || '';
    const style = node.attrs?.style || {};

    return [
      'img',
      {
        class: 'phb-image',
        'data-hb-background-image': 'true',
        src,
        alt,
        style: serializeStyle(style) || undefined,
      },
    ];
  },

  addCommands() {
    return {
      insertBackgroundImage: (src, alt = 'background image') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: src || '',
            alt,
            style: {
              position: 'absolute',
              bottom: '0',
              left: '0',
              height: '100%',
            },
          },
        });
      },

      insertHbBackgroundImage: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src: attrs.src || '',
            alt: attrs.alt || '',
            style: attrs.style || {},
          },
        });
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const stopEvent = (input) => {
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

      const updateAttrs = (patch) => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            ...patch,
          })
        );
      };

      const dom = document.createElement('div');
      dom.className = 'image-attr-widget';
      dom.contentEditable = 'false';

      const badge = document.createElement('span');
      badge.className = 'image-attr-badge bg';
      badge.textContent = 'BG IMAGE';
      dom.appendChild(badge);

      const fields = document.createElement('div');
      fields.className = 'image-attr-fields';

      const srcRow = document.createElement('div');
      srcRow.className = 'image-attr-row';
      const srcLabel = document.createElement('span');
      srcLabel.className = 'image-attr-label';
      srcLabel.textContent = 'src';
      srcRow.appendChild(srcLabel);

      const srcInput = document.createElement('input');
      srcInput.className = 'image-attr-input';
      srcInput.type = 'text';
      srcInput.value = node.attrs.src || '';
      stopEvent(srcInput);
      srcInput.addEventListener('change', (event) => {
        updateAttrs({ src: event.target.value });
      });
      srcRow.appendChild(srcInput);
      fields.appendChild(srcRow);

      const altRow = document.createElement('div');
      altRow.className = 'image-attr-row';
      const altLabel = document.createElement('span');
      altLabel.className = 'image-attr-label';
      altLabel.textContent = 'alt';
      altRow.appendChild(altLabel);

      const altInput = document.createElement('input');
      altInput.className = 'image-attr-input';
      altInput.type = 'text';
      altInput.value = node.attrs.alt || '';
      stopEvent(altInput);
      altInput.addEventListener('change', (event) => {
        updateAttrs({ alt: event.target.value });
      });
      altRow.appendChild(altInput);
      fields.appendChild(altRow);

      const styleInfo = document.createElement('div');
      styleInfo.className = 'image-attr-style';
      styleInfo.textContent = formatStyleSummary(node.attrs.style || {});
      if (styleInfo.textContent) {
        fields.appendChild(styleInfo);
      }

      dom.appendChild(fields);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false;
          currentNode = updatedNode;
          srcInput.value = updatedNode.attrs.src || '';
          altInput.value = updatedNode.attrs.alt || '';
          const styleText = formatStyleSummary(updatedNode.attrs.style || {});
          styleInfo.textContent = styleText;
          if (styleText && !styleInfo.parentNode) {
            fields.appendChild(styleInfo);
          } else if (!styleText && styleInfo.parentNode) {
            styleInfo.remove();
          }
          return true;
        },
      };
    };
  },
});
