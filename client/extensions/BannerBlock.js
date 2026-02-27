import { Node } from '@tiptap/core';

/**
 * BannerBlock - D&D 5e cover page banner
 *
 * Renders as: <div class="banner">TEXT</div>
 * Used in front cover pages for the red banner overlay with text like "HOMEBREW".
 * The PHB theme CSS positions this absolutely over the cover page banner SVG.
 */
export default Node.create({
  name: 'bannerBlock',

  group: 'block',

  content: 'text*',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div.banner' },
      { tag: 'span.banner' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'banner', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertBanner: (text = 'HOMEBREW') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          content: text ? [{ type: 'text', text }] : [],
        });
      },
    };
  },
});
