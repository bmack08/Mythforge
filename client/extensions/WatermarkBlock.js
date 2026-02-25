import { Node } from '@tiptap/core';

/**
 * WatermarkBlock - D&D 5e watermark text overlay
 *
 * Renders as: <div class="watermark">Watermark Text</div>
 * Allows text content for the watermark label.
 */
export default Node.create({
  name: 'watermarkBlock',

  group: 'block',

  content: 'text*',

  defining: true,

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-watermark-style');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.style) return {};

          // Build inline CSS from style object for rendering
          const styleString = Object.entries(attributes.style)
            .map(([key, value]) => `${key}:${value}`)
            .join('; ');

          return {
            'data-watermark-style': JSON.stringify(attributes.style),
            style: styleString,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.watermark' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'watermark', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertWatermark: (text = 'Watermark', style = null) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { style },
          content: text ? [{ type: 'text', text }] : [],
        });
      },
    };
  },
});
