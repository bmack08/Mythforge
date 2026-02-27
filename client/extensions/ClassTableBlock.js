import { Node } from '@tiptap/core';

/**
 * ClassTableBlock - D&D 5e class progression table block
 *
 * Supports three variants:
 *   'basic'      -> <div class="classTable">             (no frame)
 *   'frame'      -> <div class="classTable frame">       (default - bordered with background)
 *   'decoration' -> <div class="classTable frame decoration"> (frame + decorative elements)
 *
 * Also supports a `wide` attribute that adds the `wide` class for
 * two-column spanning tables.
 *
 * Example output:
 *   <div class="classTable frame wide">
 *     <table>...</table>
 *   </div>
 */

const VARIANT_CLASS_MAP = {
  basic:      'classTable',
  frame:      'classTable frame',
  decoration: 'classTable frame decoration',
};

export default Node.create({
  name: 'classTableBlock',

  group: 'block',

  content: '(table|paragraph|heading)+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'frame',
        parseHTML: (element) => {
          if (element.classList.contains('decoration')) return 'decoration';
          if (element.classList.contains('frame'))      return 'frame';
          return 'basic';
        },
        renderHTML: () => ({}), // class is set in renderHTML() below
      },
      wide: {
        default: false,
        parseHTML: (element) => element.classList.contains('wide'),
        renderHTML: () => ({}), // class is set in renderHTML() below
      },
    };
  },

  parseHTML() {
    return [
      // Most specific first
      { tag: 'div.classTable.frame.decoration.wide' },
      { tag: 'div.classTable.frame.decoration' },
      { tag: 'div.classTable.frame.wide' },
      { tag: 'div.classTable.frame' },
      { tag: 'div.classTable.wide' },
      { tag: 'div.classTable' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variantClass = VARIANT_CLASS_MAP[node.attrs.variant] || VARIANT_CLASS_MAP.frame;
    const wideClass = node.attrs.wide ? ' wide' : '';
    const attrs = { ...HTMLAttributes, class: variantClass + wideClass };

    return ['div', attrs, 0];
  },

  addCommands() {
    return {
      /**
       * Insert a class table block.
       * @param {string} [variant='frame'] - 'basic', 'frame', or 'decoration'
       * @param {boolean} [wide=false] - whether the table spans both columns
       */
      insertClassTable: (variant = 'frame', wide = false) => ({ chain }) => {
        const levels = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th'];
        const bonuses = ['+2','+2','+2','+2','+3','+3','+3','+3','+4','+4','+4','+4','+5','+5','+5','+5','+6','+6','+6','+6'];

        const headerRow = {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Level' }] }] },
            { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Proficiency Bonus' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Features' }] }] },
          ]
        };

        const dataRows = levels.map((level, i) => ({
          type: 'tableRow',
          content: [
            { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: level }] }] },
            { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: bonuses[i] }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph' }] },
          ]
        }));

        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant, wide },
            content: [
              { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'The Class Name' }] },
              {
                type: 'table',
                content: [headerRow, ...dataRows],
              },
            ],
          })
          .run();
      },

      /** Change the variant of an existing class table block. */
      setClassTableVariant: (variant) => ({ commands }) => {
        return commands.updateAttributes(this.name, { variant });
      },

      /** Toggle the wide attribute on an existing class table block. */
      toggleClassTableWide: () => ({ tr, state, dispatch }) => {
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
    };
  },
});
