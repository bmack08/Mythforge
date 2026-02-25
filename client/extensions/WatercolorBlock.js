import { Node } from '@tiptap/core';

/**
 * WatercolorBlock - D&D 5e watercolor splash decoration
 *
 * Renders as a self-closing decorative div with a watercolor variant class.
 * Variants 1-12 correspond to Homebrewery's watercolor stain images.
 *
 * Renders as: <div class="watercolor1" style="top:20px; left:30px; ..."></div>
 * Atom node — no editable content inside.
 */
export default Node.create({
  name: 'watercolorBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      variant: {
        default: 1,
        parseHTML: (element) => {
          // Extract variant number from class like "watercolor7"
          const match = element.className.match(/watercolor(\d+)/);
          return match ? parseInt(match[1], 10) : 1;
        },
        renderHTML: () => {
          // Class is applied in renderHTML() below
          return {};
        },
      },
      top: {
        default: null,
        parseHTML: (element) => element.style.top || null,
        renderHTML: () => ({}),
      },
      left: {
        default: null,
        parseHTML: (element) => element.style.left || null,
        renderHTML: () => ({}),
      },
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: () => ({}),
      },
      opacity: {
        default: null,
        parseHTML: (element) => element.style.opacity || null,
        renderHTML: () => ({}),
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          // Match any div whose class starts with "watercolor"
          const hasWatercolor = /watercolor\d+/.test(element.className);
          return hasWatercolor ? {} : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const variant = node.attrs.variant || 1;
    const cssClass = `watercolor${variant}`;

    // Build inline style from attributes
    const styleParts = [];
    if (node.attrs.top)             styleParts.push(`top:${node.attrs.top}`);
    if (node.attrs.left)            styleParts.push(`left:${node.attrs.left}`);
    if (node.attrs.width)           styleParts.push(`width:${node.attrs.width}`);
    if (node.attrs.opacity)         styleParts.push(`opacity:${node.attrs.opacity}`);
    if (node.attrs.backgroundColor) styleParts.push(`background-color:${node.attrs.backgroundColor}`);

    const attrs = { class: cssClass };
    if (styleParts.length > 0) {
      attrs.style = styleParts.join('; ');
    }

    return ['div', attrs];
  },

  addCommands() {
    return {
      insertWatercolor: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            variant: attrs.variant || 1,
            top: attrs.top || null,
            left: attrs.left || null,
            width: attrs.width || null,
            opacity: attrs.opacity || null,
            backgroundColor: attrs.backgroundColor || null,
          },
        });
      },
    };
  },
});
