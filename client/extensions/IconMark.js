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
    
    // FontAwesome icons: :fa-dragon: → <i class="fa fa-dragon"></i>
    if (name.startsWith('fa-')) {
      return [
        'i',
        {
          class: `fa ${name}`,
          'data-icon': name,
        },
      ];
    }
    
    // Legacy emoji/game icons: :ei_name: or :gi_name:
    return [
      'span',
      {
        'data-icon': name,
        class: `icon ${name.replace(/_/g, '-')}`,
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
