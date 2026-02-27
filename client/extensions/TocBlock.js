import { Node } from '@tiptap/core';

/**
 * TocBlock - Table of Contents block
 * Renders as: <div class="toc">...</div> or <div class="toc wide">...</div>
 *
 * The Homebrewery PHB theme has built-in .toc CSS for table of contents
 * styling, including indentation for different heading levels and
 * dot-leader patterns for page numbers.
 */
export default Node.create({
  name: 'tocBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      wide: {
        default: false,
        parseHTML: (element) => element.classList.contains('wide'),
        renderHTML: () => ({}), // class is set in renderHTML() below
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.toc.wide' },
      { tag: 'div.toc' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const classes = ['toc'];
    if (node.attrs.wide) {
      classes.push('wide');
    }
    return ['div', { ...HTMLAttributes, class: classes.join(' ') }, 0];
  },

  addCommands() {
    return {
      /**
       * Insert a TOC block with optional wide mode.
       * @param {boolean} wide - If true, TOC spans both columns
       */
      insertToc: (wide = false) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { wide },
            content: [
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Table of Contents' }] },
              {
                type: 'bulletList',
                content: [
                  { type: 'listItem', content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Chapter 1: Introduction .............. 3' }] },
                    {
                      type: 'bulletList',
                      content: [
                        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Background .................. 4' }] }] },
                        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Adventure Overview ....... 5' }] }] },
                      ]
                    }
                  ]},
                  { type: 'listItem', content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Chapter 2: The Adventure ........... 7' }] },
                    {
                      type: 'bulletList',
                      content: [
                        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Part 1: The Journey .......... 8' }] }] },
                        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Part 2: The Dungeon ......... 12' }] }] },
                      ]
                    }
                  ]},
                  { type: 'listItem', content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Appendix A: Monsters ............... 18' }] }
                  ]},
                  { type: 'listItem', content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'Appendix B: Magic Items ........... 22' }] }
                  ]},
                ]
              },
            ],
          })
          .run();
      },

      /**
       * Toggle the wide attribute on the current TOC block.
       */
      toggleTocWide: () => ({ commands, state }) => {
        // Find the tocBlock node at the current selection
        const { from } = state.selection;
        let tocPos = null;
        let tocNode = null;

        state.doc.nodesBetween(from, from, (node, pos) => {
          if (node.type.name === 'tocBlock') {
            tocPos = pos;
            tocNode = node;
            return false;
          }
        });

        if (tocNode && tocPos !== null) {
          return commands.updateAttributes(this.name, {
            wide: !tocNode.attrs.wide,
          });
        }
        return false;
      },
    };
  },
});
