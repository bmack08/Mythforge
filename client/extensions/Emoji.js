import { Node } from '@tiptap/core';

/**
 * Emoji - Inline emoji node for PHB emoji shortcodes
 * Syntax: :ei_barbarian_reckless_attack: or :emoji_smile:
 * Renders as: <span class="phb-emoji ei-barbarian-reckless-attack"></span>
 *
 * Per Blueprint EPIC G:
 * - Maps :ei_*: shortcodes to sprite or img elements
 * - Supports custom D&D emoji sets (Elderberry Inn icons)
 * - Inline display aligned with text baseline
 */
export default Node.create({
  name: 'emoji',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-emoji'),
        renderHTML: attributes => {
          if (!attributes.name) {
            return {};
          }
          return { 'data-emoji': attributes.name };
        },
      },
      set: {
        default: 'ei', // Elderberry Inn set by default
        parseHTML: element => element.getAttribute('data-emoji-set'),
        renderHTML: attributes => {
          return { 'data-emoji-set': attributes.set };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span.phb-emoji' },
      { tag: 'span[data-emoji]' },
      { tag: 'i.ei' }, // Elderberry Inn icons
    ];
  },

  renderHTML({ node }) {
    const name = node.attrs.name || '';
    const set = node.attrs.set || 'ei';

    // Convert underscores to hyphens for class names
    const className = name.replace(/_/g, '-');

    return [
      'span',
      {
        class: `phb-emoji ${set} ${set}-${className}`,
        'data-emoji': name,
        'data-emoji-set': set,
      },
    ];
  },

  addCommands() {
    return {
      insertEmoji: (name, set = 'ei') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { name, set },
        });
      },
    };
  },

  addInputRules() {
    return [
      // Elderberry Inn emoji: :ei_barbarian_reckless_attack:
      {
        find: /:ei_[a-zA-Z0-9_]+:/g,
        handler: ({ match, chain }) => {
          const name = match[0].slice(4, -1); // Remove :ei_ and trailing :
          return chain().insertContent({
            type: this.name,
            attrs: { name, set: 'ei' },
          });
        },
      },
      // Generic emoji shortcode: :emoji_smile:
      {
        find: /:emoji_[a-zA-Z0-9_]+:/g,
        handler: ({ match, chain }) => {
          const name = match[0].slice(7, -1); // Remove :emoji_ and trailing :
          return chain().insertContent({
            type: this.name,
            attrs: { name, set: 'emoji' },
          });
        },
      },
    ];
  },
});
