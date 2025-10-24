/*
  TipTap Icon node extension as a factory function to avoid bundler import timing issues.
*/
// Factory: supply TipTap core, get an Icon node extension back
function createIcon(core) {
  const Node = core?.Node || core?.default?.Node;
  if (!Node || typeof Node.create !== 'function') {
    // Soft fallback to avoid hard crash if core is unavailable
    return { name: 'icon' };
  }

  return Node.create({
    name: 'icon',

    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
      return {
        name: {
          default: null,
        },
      }
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
      ]
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
        ]
      }
      
      // Legacy emoji/game icons: :ei_name: or :gi_name:
      return [
        'span',
        {
          'data-icon': name,
          class: `icon ${name.replace(/_/g, '-')}`,
        },
      ]
    },

    addInputRules() {
      return [
        // Legacy game/emoji icons: :ei_name: or :gi_name:
        {
          find: /:(ei|gi)_[a-zA-Z0-9_]+:/,
          handler: ({ match, chain }) => {
            const name = match[0].slice(1, -1)
            return chain().insertContent({
              type: this.name,
              attrs: { name },
            })
          },
        },
        // FontAwesome icons: :fa-dragon: or :fa-dice-d20:
        {
          find: /:fa-[a-zA-Z0-9-]+:/,
          handler: ({ match, chain }) => {
            const name = match[0].slice(1, -1)
            return chain().insertContent({
              type: this.name,
              attrs: { name },
            })
          },
        },
      ]
    },
  });
}

export default createIcon;
