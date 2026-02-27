import { Node } from '@tiptap/core';

/**
 * LogoBlock - D&D 5e cover page logo container
 *
 * Renders as: <div class="logo">CONTENT</div>
 * Used in all cover page types for logo placement.
 *
 * Front cover: positioned top-center, contains an image
 * Inside cover: positioned bottom-right, contains an image
 * Back cover: positioned bottom-left, contains an image + optional caption paragraph
 *
 * The PHB theme CSS handles positioning based on which cover type contains it.
 */
export default Node.create({
  name: 'logoBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.logo' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'logo', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertLogo: (src = '/naturalCritLogoRed.svg', caption = null) => ({ commands }) => {
        const content = [
          { type: 'image', attrs: { src } },
        ];
        if (caption) {
          content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: caption }],
          });
        }
        return commands.insertContent({
          type: this.name,
          content,
        });
      },
    };
  },
});
