import { Node } from '@tiptap/core';

/**
 * ImageWithAttributes - Enhanced image with PHB-specific styling attributes
 * Renders as: <img class="phb-image {wrapClass}" style="...">
 *
 * Uses a single `style` Record<string,string> attribute for all visual
 * properties (width, margins, position, float, etc.) instead of individual
 * semantic attributes.
 *
 * Backward compatible: parses old data-width, data-margin-left,
 * data-margin-right attributes and wrapLeft/wrapRight classes into the
 * unified style Record.
 *
 * Attributes:
 * - src (string): Image URL (required)
 * - alt (string): Alt text (default '')
 * - style (Record<string,string>): CSS key-value pairs (default {})
 */
export default Node.create({
  name: 'imageWithAttributes',

  group: 'block',

  inline: false,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) {
            return {};
          }
          return { src: attributes.src };
        },
      },
      alt: {
        default: '',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          return { alt: attributes.alt };
        },
      },
      style: {
        default: {},
        parseHTML: element => {
          const style = {};

          // 1. Parse inline style attribute into key-value pairs
          const inlineStyle = element.getAttribute('style') || '';
          if (inlineStyle) {
            inlineStyle.split(';').forEach(pair => {
              const colonIdx = pair.indexOf(':');
              if (colonIdx === -1) return;
              const key = pair.slice(0, colonIdx).trim();
              const value = pair.slice(colonIdx + 1).trim();
              if (key && value) {
                style[key] = value;
              }
            });
          }

          // 2. Old data-width → width
          const dataWidth = element.getAttribute('data-width');
          if (dataWidth) {
            style['width'] = dataWidth;
          }

          // 3. Old data-margin-left → margin-left
          const dataMarginLeft = element.getAttribute('data-margin-left');
          if (dataMarginLeft) {
            style['margin-left'] = dataMarginLeft;
          }

          // 4. Old data-margin-right → margin-right
          const dataMarginRight = element.getAttribute('data-margin-right');
          if (dataMarginRight) {
            style['margin-right'] = dataMarginRight;
          }

          // 5. wrapLeft class → float: left
          if (element.classList.contains('wrapLeft')) {
            style['float'] = 'left';
          }

          // 6. wrapRight class → float: right
          if (element.classList.contains('wrapRight')) {
            style['float'] = 'right';
          }

          return Object.keys(style).length > 0 ? style : {};
        },
        renderHTML: () => {
          // Handled in the main renderHTML
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img.phb-image',
        priority: 60,
      },
      {
        tag: 'img[data-width]',
        priority: 55,
      },
      {
        tag: 'img.wrapLeft',
        priority: 55,
      },
      {
        tag: 'img.wrapRight',
        priority: 55,
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, style } = node.attrs;
    const styleObj = style || {};

    // Build class list
    const classes = ['phb-image'];
    if (styleObj.float === 'left') classes.push('wrapLeft');
    if (styleObj.float === 'right') classes.push('wrapRight');

    // Build inline style (exclude float since it's handled by class)
    const inlineStyles = Object.entries(styleObj)
      .filter(([k]) => k !== 'float')
      .map(([k, v]) => `${k}:${v}`)
      .join(';');

    return [
      'img',
      {
        class: classes.join(' '),
        src,
        alt: alt || '',
        style: inlineStyles || undefined,
      }
    ];
  },

  addCommands() {
    return {
      setImageWithAttributes: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
      insertImageWrapLeft: (src, alt) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src, alt: alt || '', style: { float: 'left', width: '50%' } },
        });
      },
      insertImageWrapRight: (src, alt) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src, alt: alt || '', style: { float: 'right', width: '50%' } },
        });
      },
      insertBackgroundImage: (src, alt) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            src,
            alt: alt || 'background image',
            style: { position: 'absolute', bottom: '0', left: '0', height: '100%' },
          },
        });
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      // Mutable reference to the current node (updated in update() callback)
      let currentNode = node;

      // --- Prevent ProseMirror from swallowing input events ---
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
            input.blur(); // Triggers 'change' event
          }
        });
      };

      // --- Wrapper ---
      const dom = document.createElement('div');
      dom.className = 'image-attr-widget';
      dom.contentEditable = 'false';

      // --- Badge ---
      const style = node.attrs.style || {};
      const isBackground = (style.position === 'absolute');

      const badge = document.createElement('span');
      badge.className = isBackground
        ? 'image-attr-badge bg'
        : 'image-attr-badge';
      badge.textContent = isBackground ? 'BG IMAGE' : 'IMAGE';
      dom.appendChild(badge);

      // --- Fields container ---
      const fields = document.createElement('div');
      fields.className = 'image-attr-fields';

      // -- src row --
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
      shieldInput(srcInput);

      srcInput.addEventListener('change', (e) => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            src: e.target.value,
          })
        );
      });
      srcRow.appendChild(srcInput);
      fields.appendChild(srcRow);

      // -- alt row --
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
      shieldInput(altInput);

      altInput.addEventListener('change', (e) => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            alt: e.target.value,
          })
        );
      });
      altRow.appendChild(altInput);
      fields.appendChild(altRow);

      // -- editable style properties --
      const styleContainer = document.createElement('div');
      styleContainer.className = 'image-attr-style-fields';

      const styleInputs = {};

      const buildStyleRows = (styleObj) => {
        styleContainer.innerHTML = '';
        Object.keys(styleInputs).forEach((k) => delete styleInputs[k]);

        const entries = Object.entries(styleObj || {})
          .filter(([key, value]) => key && value !== undefined && value !== null && String(value) !== '')
          .sort(([a], [b]) => a.localeCompare(b));

        for (const [key, value] of entries) {
          const row = document.createElement('div');
          row.className = 'image-attr-row';
          const label = document.createElement('span');
          label.className = 'image-attr-label';
          label.textContent = key;
          row.appendChild(label);
          const input = document.createElement('input');
          input.className = 'image-attr-input';
          input.type = 'text';
          input.value = value;
          shieldInput(input);
          input.addEventListener('change', () => {
            const pos = getPos();
            if (typeof pos !== 'number') return;
            const newStyle = { ...currentNode.attrs.style };
            if (input.value.trim()) {
              newStyle[key] = input.value.trim();
            } else {
              delete newStyle[key];
            }
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...currentNode.attrs,
                style: newStyle,
              })
            );
          });
          row.appendChild(input);
          styleContainer.appendChild(row);
          styleInputs[key] = input;
        }
      };

      buildStyleRows(node.attrs.style || {});
      fields.appendChild(styleContainer);

      dom.appendChild(fields);

      // --- Return NodeView descriptor ---
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'imageWithAttributes') return false;
          currentNode = updatedNode;
          srcInput.value = updatedNode.attrs.src || '';
          altInput.value = updatedNode.attrs.alt || '';
          const updatedStyle = updatedNode.attrs.style || {};
          const updatedIsBackground = (updatedStyle.position === 'absolute');
          badge.className = updatedIsBackground
            ? 'image-attr-badge bg'
            : 'image-attr-badge';
          badge.textContent = updatedIsBackground ? 'BG IMAGE' : 'IMAGE';
          buildStyleRows(updatedStyle);
          return true;
        },
      };
    };
  },
});
