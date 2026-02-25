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
    if (name.includes('far-') || name.includes('far_')) iconSet = 'far'; // regular
    if (name.includes('fab-') || name.includes('fab_')) iconSet = 'fab'; // brands

    // FontAwesome icons — handle both naming formats:
    //   Hyphen format (from InputRules):  fa-dragon, far-heart, fab-github
    //   Underscore format (from IconRegistry): fas_dice_d20, far_heart, fab_github
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

    if (name.startsWith('fas_') || name.startsWith('far_') || name.startsWith('fab_')) {
      // Convert underscore format to FA classes: fas_dice_d20 → fas fa-dice-d20
      const withoutPrefix = name.replace(/^(fas|far|fab)_/, '');
      const iconName = `fa-${withoutPrefix.replace(/_/g, '-')}`;
      return [
        'i',
        {
          class: `phb-icon ${iconSet} ${iconName}`,
          'data-icon': name,
        },
      ];
    }

    // Legacy emoji/game/dice icons: ei_book → "ei book", gi_wolf_head → "gi wolf-head", df_d10 → "df d10"
    // Split on first underscore to get prefix and icon name, then replace remaining underscores with hyphens
    const underscoreIdx = name.indexOf('_');
    if (underscoreIdx > 0) {
      const prefix = name.slice(0, underscoreIdx);
      const iconName = name.slice(underscoreIdx + 1).replace(/_/g, '-');
      return [
        'span',
        {
          'data-icon': name,
          class: `phb-icon icon ${prefix} ${iconName}`,
          contenteditable: 'false',
        },
      ];
    }

    // Fallback for unknown format
    return [
      'span',
      {
        'data-icon': name,
        class: `phb-icon icon ${name}`,
        contenteditable: 'false',
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
