import { Node } from '@tiptap/core';

/**
 * VerticalSpacing - Vertical spacing block for layout control
 * Renders as: <div class="vertical-spacing"></div>
 *
 * Syntax: ::::
 * Creates vertical space between elements
 */
export default Node.create({
  name: 'verticalSpacing',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      height: {
        default: '1cm',
        parseHTML: element => element.style.height || '1cm',
        renderHTML: attributes => {
          return { style: `height: ${attributes.height}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.vertical-spacing' },
      { tag: 'div[data-type="vertical-spacing"]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      {
        class: 'vertical-spacing',
        'data-type': 'vertical-spacing',
        style: `height: ${node.attrs.height}`,
        ...HTMLAttributes,
      },
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'vertical-spacing-editor';
      dom.contentEditable = 'false';
      dom.style.cssText = `
        height: ${node.attrs.height};
        border: 2px dashed #999;
        border-radius: 4px;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 10px,
          #eee 10px,
          #eee 11px
        );
        position: relative;
        margin: 0.5em 0;
        min-height: 20px;
      `;

      const label = document.createElement('span');
      label.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 11px;
        color: #666;
        font-weight: 500;
        pointer-events: none;
      `;
      label.textContent = `Vertical Spacing (${node.attrs.height})`;
      dom.appendChild(label);

      return { dom };
    };
  },

  addCommands() {
    return {
      insertVerticalSpacing: (height = '1cm') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { height },
        });
      },
    };
  },
});
