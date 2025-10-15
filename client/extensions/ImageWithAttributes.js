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
    const { src, alt, title, width, marginLeft, marginRight, wrap } = node.attrs;

    // Build inline style string
    const styles = [];
    if (width) styles.push(`width:${width}`);
    if (marginLeft) styles.push(`margin-left:${marginLeft}`);
    if (marginRight) styles.push(`margin-right:${marginRight}`);

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
    };
  },
});
