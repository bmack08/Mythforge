import { Node } from '@tiptap/core';

/**
 * RuneTableBlock - D&D 5e rune/script table block
 *
 * A table wrapper that applies a fantasy script font. Used for
 * Dwarvish, Elvish, or Draconic inscriptions and decoding tables.
 *
 * Attributes:
 *   script: 'dwarvish' | 'elvish' | 'draconic' (default: 'dwarvish')
 *   wide:   boolean (default: true)
 *   frame:  boolean (default: true)
 *
 * Font mapping:
 *   dwarvish  -> font-family: Davek
 *   elvish    -> font-family: Rellanic
 *   draconic  -> font-family: Iokharic
 *
 * Example output:
 *   <div class="runeTable wide frame" style="font-family: Davek">
 *     <table>...</table>
 *   </div>
 */

const SCRIPT_FONT_MAP = {
  dwarvish: 'Davek',
  elvish:   'Rellanic',
  draconic: 'Iokharic',
};

export default Node.create({
  name: 'runeTableBlock',

  group: 'block',

  content: '(table|paragraph|heading)+',

  defining: true,

  addAttributes() {
    return {
      script: {
        default: 'dwarvish',
        parseHTML: (element) => {
          const style = element.getAttribute('style') || '';
          if (style.includes('Rellanic'))  return 'elvish';
          if (style.includes('Iokharic')) return 'draconic';
          return 'dwarvish';
        },
        renderHTML: () => ({}), // handled in renderHTML() below
      },
      wide: {
        default: true,
        parseHTML: (element) => element.classList.contains('wide'),
        renderHTML: () => ({}), // handled in renderHTML() below
      },
      frame: {
        default: true,
        parseHTML: (element) => element.classList.contains('frame'),
        renderHTML: () => ({}), // handled in renderHTML() below
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.runeTable.wide.frame' },
      { tag: 'div.runeTable.wide' },
      { tag: 'div.runeTable.frame' },
      { tag: 'div.runeTable' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    let className = 'runeTable';
    if (node.attrs.wide)  className += ' wide';
    if (node.attrs.frame) className += ' frame';

    const fontFamily = SCRIPT_FONT_MAP[node.attrs.script] || SCRIPT_FONT_MAP.dwarvish;

    const attrs = {
      ...HTMLAttributes,
      class: className,
      style: `font-family: ${fontFamily}`,
    };

    return ['div', attrs, 0];
  },

  addCommands() {
    return {
      /**
       * Insert a rune table block.
       * @param {string} [script='dwarvish'] - 'dwarvish', 'elvish', or 'draconic'
       */
      insertRuneTable: (script = 'dwarvish') => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { script, wide: true, frame: true },
            content: [
              {
                type: 'table',
                content: [
                  {
                    type: 'tableRow',
                    content: [
                      { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rune' }] }] },
                      { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Meaning' }] }] },
                      { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Notes' }] }] },
                    ],
                  },
                  {
                    type: 'tableRow',
                    content: [
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                    ],
                  },
                  {
                    type: 'tableRow',
                    content: [
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                      { type: 'tableCell', content: [{ type: 'paragraph' }] },
                    ],
                  },
                ],
              },
            ],
          })
          .run();
      },

      /** Change the script (font) of an existing rune table block. */
      setRuneScript: (script) => ({ commands }) => {
        return commands.updateAttributes(this.name, { script });
      },

      /** Toggle the wide attribute on an existing rune table block. */
      toggleRuneTableWide: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const node = selection.$anchor.node(selection.$anchor.depth);
        if (node?.type.name !== this.name) return false;
        if (dispatch) {
          const pos = selection.$anchor.before(selection.$anchor.depth);
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            wide: !node.attrs.wide,
          });
        }
        return true;
      },

      /** Toggle the frame attribute on an existing rune table block. */
      toggleRuneTableFrame: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const node = selection.$anchor.node(selection.$anchor.depth);
        if (node?.type.name !== this.name) return false;
        if (dispatch) {
          const pos = selection.$anchor.before(selection.$anchor.depth);
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            frame: !node.attrs.frame,
          });
        }
        return true;
      },
    };
  },
});
