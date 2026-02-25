import { Node } from '@tiptap/core';

/**
 * Comment - HTML comment block that's visible in editor but hidden in render
 * Renders as: <!-- comment text -->
 *
 * Syntax: <!-- This is a comment -->
 * Shows with visual indicator in TipTap editor, but completely hidden in BrewRenderer
 */
export default Node.create({
  name: 'comment',

  group: 'block',

  content: 'text*',

  defining: true,

  addAttributes() {
    return {
      commentText: {
        default: '',
        parseHTML: element => element.textContent || element.getAttribute('data-comment') || '',
        renderHTML: attributes => {
          return {
            'data-comment': attributes.commentText
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'comment-block',
      },
      {
        // Parse HTML comments from markdown
        tag: 'div[data-type="comment"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    // Render as HTML comment in the output
    // This will be stripped by the browser but is the correct format
    return ['comment-block', {
      class: 'comment-block',
      'data-type': 'comment',
      'data-comment': node.textContent || node.attrs.commentText,
      style: 'display: none',
      ...HTMLAttributes
    }, 0];
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement('div');
      const contentDOM = document.createElement('div');

      dom.className = 'comment-block-editor';
      dom.contentEditable = 'true';
      dom.style.cssText = `
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 12px 16px;
        margin: 1em 0;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #856404;
        position: relative;
      `;

      const label = document.createElement('span');
      label.style.cssText = `
        position: absolute;
        top: -10px;
        left: 12px;
        background: #ffc107;
        color: #000;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-family: sans-serif;
      `;
      label.textContent = 'Comment';

      contentDOM.style.cssText = `
        margin-top: 8px;
        white-space: pre-wrap;
      `;
      contentDOM.contentEditable = 'true';

      dom.appendChild(label);
      dom.appendChild(contentDOM);

      return {
        dom,
        contentDOM
      };
    };
  },

  addCommands() {
    return {
      insertComment: (commentText = 'This is a comment that will not be rendered into your brew.') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          content: [{ type: 'text', text: commentText }],
        });
      },
    };
  },
});
