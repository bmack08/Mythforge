import { Node } from '@tiptap/core';

/**
 * ImageMaskBlock - D&D 5e image masking effects
 *
 * Clips images into artistic shapes using CSS mask-image with watercolor mask files.
 *
 * Three mask types:
 *   - center (1-16): Centered circular/organic masks
 *   - edge (1-8):    Edge-aligned masks for page borders
 *   - corner (1-37): Corner masks for decorative corners
 *
 * Renders as:
 *   <div class="imageMaskCenter5" style="--offsetX:0%;--offsetY:0%;--rotation:0">
 *     <img ... />
 *   </div>
 *
 * Homebrewery syntax reference:
 *   {{imageMaskCenter5,--offsetX:0%,--offsetY:0%,--rotation:0
 *     ![alt](url){position:absolute,bottom:0,left:0,height:100%}
 *   }}
 */
export default Node.create({
  name: 'imageMaskBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      maskType: {
        default: 'center',
        parseHTML: (element) => {
          const cls = element.className || '';
          if (cls.includes('imageMaskEdge')) return 'edge';
          if (cls.includes('imageMaskCorner')) return 'corner';
          return 'center';
        },
        renderHTML: () => ({}), // Applied via class in renderHTML()
      },
      maskNumber: {
        default: 1,
        parseHTML: (element) => {
          const cls = element.className || '';
          const match = cls.match(/imageMask(?:Center|Edge|Corner)(\d+)/i);
          return match ? parseInt(match[1], 10) : 1;
        },
        renderHTML: () => ({}), // Applied via class in renderHTML()
      },
      offsetX: {
        default: '0%',
        parseHTML: (element) => {
          return element.style.getPropertyValue('--offsetX') || '0%';
        },
        renderHTML: () => ({}), // Applied via style in renderHTML()
      },
      offsetY: {
        default: '0%',
        parseHTML: (element) => {
          return element.style.getPropertyValue('--offsetY') || '0%';
        },
        renderHTML: () => ({}), // Applied via style in renderHTML()
      },
      rotation: {
        default: '0',
        parseHTML: (element) => {
          return element.style.getPropertyValue('--rotation') || '0';
        },
        renderHTML: () => ({}), // Applied via style in renderHTML()
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          const cls = element.className || '';
          const hasImageMask = /imageMask(Center|Edge|Corner)\d+/i.test(cls);
          return hasImageMask ? {} : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { maskType, maskNumber, offsetX, offsetY, rotation } = node.attrs;

    // Build CSS class: imageMaskCenter5, imageMaskEdge3, imageMaskCorner12, etc.
    const typeCapitalized = maskType.charAt(0).toUpperCase() + maskType.slice(1);
    const cssClass = `imageMask${typeCapitalized}${maskNumber}`;

    // Build inline style with CSS custom properties
    const styleParts = [];
    styleParts.push(`--offsetX:${offsetX}`);
    styleParts.push(`--offsetY:${offsetY}`);
    styleParts.push(`--rotation:${rotation}`);

    const attrs = {
      class: cssClass,
      style: styleParts.join(';'),
    };

    // 0 = content hole — child blocks (images, paragraphs) render here
    return ['div', attrs, 0];
  },

  addCommands() {
    return {
      /**
       * Insert a new image mask block at the current cursor position.
       * @param {Object} opts
       * @param {string} opts.maskType  - 'center', 'edge', or 'corner'
       * @param {number} opts.maskNumber - mask variant number
       * @param {string} opts.offsetX   - horizontal offset (CSS value)
       * @param {string} opts.offsetY   - vertical offset (CSS value)
       * @param {string} opts.rotation  - rotation value
       */
      insertImageMask: (opts = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: {
              maskType: opts.maskType || 'center',
              maskNumber: opts.maskNumber || 5,
              offsetX: opts.offsetX || '0%',
              offsetY: opts.offsetY || '0%',
              rotation: opts.rotation || '0',
            },
            content: [
              { type: 'paragraph', content: [
                { type: 'text', text: 'Image masks clip images with decorative edges. Set the mask type (center, edge, corner) and adjust --offsetX, --offsetY, and --rotation using the node attributes.' }
              ]},
            ],
          })
          .run();
      },

      /**
       * Change the mask type and/or number on the currently selected imageMaskBlock.
       * @param {string} type   - 'center', 'edge', or 'corner'
       * @param {number} number - mask variant number
       */
      setMaskType: (type, number) => ({ commands }) => {
        const attrs = {};
        if (type) attrs.maskType = type;
        if (number) attrs.maskNumber = number;
        return commands.updateAttributes(this.name, attrs);
      },
    };
  },
});
