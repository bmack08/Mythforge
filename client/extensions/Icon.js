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
      ]
    },

    renderHTML({ node }) {
      return [
        'span',
        {
          'data-icon': node.attrs.name,
          class: `icon ${node.attrs.name?.replace(/_/g, '-') || ''}`,
        },
      ]
    },

    addInputRules() {
      return [
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
      ]
    },
  });
}

export default createIcon;
