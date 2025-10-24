import { Node } from '@tiptap/core';

/**
 * IconMark - Inline icon node (wraps legacy Icon.js)
 * Syntax: :ei_sword: or :fa-dragon:
 * Renders as: <span class="icon"> or <i class="fa">
 * 
 * Note: This is exported as a standalone node for consistency with other marks
 */
export default Node.create({
  name: 'iconMark',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-icon]',
      },
      {
        tag: 'i.fa',
      },
      {
        tag: 'i.fas',
      },
      {
        tag: 'i.far',
      },
      {
        tag: 'i.fab',
      },
    ];
  },

  renderHTML({ node }) {
    const name = node.attrs.name || '';

    // Determine icon set from prefix
    let iconSet = 'fas'; // default solid
    if (name.includes('far-')) iconSet = 'far'; // regular
    if (name.includes('fab-')) iconSet = 'fab'; // brands

    // FontAwesome icons: :fa-dragon: → <i class="phb-icon fas fa-dragon"></i>
    if (name.startsWith('fa-') || name.startsWith('far-') || name.startsWith('fab-')) {
      const iconName = name.replace(/^(fa|far|fab)-/, 'fa-');
      return [
        'i',
        {
          class: `phb-icon ${iconSet} ${iconName}`,
          'data-icon': name,
        },
      ];
    }

    // Legacy emoji/game icons: :ei_name: or :gi_name:
    return [
      'span',
      {
        'data-icon': name,
        class: `phb-icon icon ${name.replace(/_/g, '-')}`,
      },
    ];
  },

  addInputRules() {
    return [
      // Legacy game/emoji icons: :ei_name: or :gi_name:
      {
        find: /:(ei|gi)_[a-zA-Z0-9_]+:/g,
        handler: ({ match, chain }) => {
          const name = match[0].slice(1, -1);
          return chain().insertContent({
            type: this.name,
            attrs: { name },
          });
        },
      },
      // FontAwesome icons: :fa-dragon: or :fa-dice-d20:
      {
        find: /:fa-[a-zA-Z0-9-]+:/g,
        handler: ({ match, chain }) => {
          const name = match[0].slice(1, -1);
          return chain().insertContent({
            type: this.name,
            attrs: { name },
          });
        },
      },
    ];
  },
});
