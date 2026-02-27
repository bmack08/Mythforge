import { Node } from '@tiptap/core';

/**
 * ImageWithAttributes - Enhanced image with PHB-specific styling attributes
 * Renders as: <img class="phb-image {wrapClass}" style="...">
 *
 * Per Blueprint EPIC F:
 * - Support width, marginLeft, marginRight attributes
 * - Support wrapLeft/wrapRight for text wrapping
 * - Inline styles for dimensions and spacing
 *
 * Attributes:
 * - src (string): Image URL (required)
 * - alt (string): Alt text
 * - width (string): CSS width value (e.g., "280px", "50%")
 * - marginLeft (string): CSS margin-left value
 * - marginRight (string): CSS margin-right value
 * - wrap ('left'|'right'|null): Text wrapping side
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
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }
          return { title: attributes.title };
        },
      },
      width: {
        default: null,
        parseHTML: element => element.style.width || element.getAttribute('data-width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { 'data-width': attributes.width };
        },
      },
      marginLeft: {
        default: null,
        parseHTML: element => element.style.marginLeft || element.getAttribute('data-margin-left'),
        renderHTML: attributes => {
          if (!attributes.marginLeft) {
            return {};
          }
          return { 'data-margin-left': attributes.marginLeft };
        },
      },
      marginRight: {
        default: null,
        parseHTML: element => element.style.marginRight || element.getAttribute('data-margin-right'),
        renderHTML: attributes => {
          if (!attributes.marginRight) {
            return {};
          }
          return { 'data-margin-right': attributes.marginRight };
        },
      },
      wrap: {
        default: null,
        parseHTML: element => {
          if (element.classList.contains('wrapLeft')) return 'left';
          if (element.classList.contains('wrapRight')) return 'right';
          return element.getAttribute('data-wrap');
        },
        renderHTML: attributes => {
          if (!attributes.wrap) {
            return {};
          }
          return { 'data-wrap': attributes.wrap };
        },
      },
      background: {
        default: false,
        parseHTML: element => {
          const style = element.getAttribute('style') || '';
          return style.includes('position') && style.includes('absolute');
        },
        renderHTML: () => ({}), // Handled in renderHTML
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

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title, width, marginLeft, marginRight, wrap, background } = node.attrs;

    // Build inline style string
    const styles = [];
    if (width) styles.push(`width:${width}`);
    if (marginLeft) styles.push(`margin-left:${marginLeft}`);
    if (marginRight) styles.push(`margin-right:${marginRight}`);
    if (background) {
      styles.push('position:absolute', 'bottom:0', 'left:0', 'height:100%');
    }

    // Build class list
    const classes = ['phb-image'];
    if (wrap === 'left') classes.push('wrapLeft');
    if (wrap === 'right') classes.push('wrapRight');

    return [
      'img',
      {
        class: classes.join(' '),
        src,
        alt: alt || '',
        title: title || undefined,
        style: styles.length > 0 ? styles.join(';') : undefined,
        ...HTMLAttributes,
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
          attrs: { src, alt: alt || '', wrap: 'left', width: '50%' },
        });
      },
      insertImageWrapRight: (src, alt) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src, alt: alt || '', wrap: 'right', width: '50%' },
        });
      },
      insertBackgroundImage: (src, alt) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { src, alt: alt || 'background image', background: true },
        });
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      // Mutable reference to the current node (updated in update() callback)
      let currentNode = node;

      // --- Helper: build Homebrewery-style style summary string ---
      const buildStyleString = (attrs) => {
        const parts = [];
        if (attrs.background) {
          parts.push('position:absolute', 'bottom:0', 'left:0', 'height:100%');
        }
        if (attrs.wrap) parts.push(`wrap:${attrs.wrap}`);
        if (attrs.width) parts.push(`width:${attrs.width}`);
        if (attrs.marginLeft) parts.push(`margin-left:${attrs.marginLeft}`);
        if (attrs.marginRight) parts.push(`margin-right:${attrs.marginRight}`);
        return parts.length > 0 ? `{${parts.join(', ')}}` : '';
      };

      // --- Prevent ProseMirror from swallowing input events ---
      const shieldInput = (input) => {
        input.addEventListener('focus', (e) => e.stopPropagation());
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('mousedown', (e) => e.stopPropagation());
        input.addEventListener('keydown', (e) => e.stopPropagation());
      };

      // --- Wrapper ---
      const dom = document.createElement('div');
      dom.className = 'image-attr-widget';
      dom.contentEditable = 'false';

      // --- Badge ---
      const badge = document.createElement('span');
      badge.className = node.attrs.background
        ? 'image-attr-badge bg'
        : 'image-attr-badge';
      badge.textContent = node.attrs.background ? 'BG IMAGE' : 'IMAGE';
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

      // -- style summary --
      const styleInfo = document.createElement('div');
      styleInfo.className = 'image-attr-style';
      styleInfo.textContent = buildStyleString(node.attrs);
      if (styleInfo.textContent) {
        fields.appendChild(styleInfo);
      }

      dom.appendChild(fields);

      // --- Return NodeView descriptor ---
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'imageWithAttributes') return false;
          currentNode = updatedNode;
          srcInput.value = updatedNode.attrs.src || '';
          altInput.value = updatedNode.attrs.alt || '';
          badge.className = updatedNode.attrs.background
            ? 'image-attr-badge bg'
            : 'image-attr-badge';
          badge.textContent = updatedNode.attrs.background ? 'BG IMAGE' : 'IMAGE';
          const newStyle = buildStyleString(updatedNode.attrs);
          styleInfo.textContent = newStyle;
          if (newStyle && !styleInfo.parentNode) {
            fields.appendChild(styleInfo);
          } else if (!newStyle && styleInfo.parentNode) {
            styleInfo.remove();
          }
          return true;
        },
      };
    };
  },
});
