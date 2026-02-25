import { Node } from '@tiptap/core';

/**
 * MonsterBlock - D&D 5e monster stat block
 *
 * Supports three variants:
 *   'framed'   → <div class="monster frame">   (default — bordered with background)
 *   'unframed' → <div class="monster">          (stats only, no decoration)
 *   'wide'     → <div class="monster frame wide"> (framed, spans both columns)
 */

const VARIANT_CLASS_MAP = {
  framed:   'monster frame',
  unframed: 'monster',
  wide:     'monster frame wide',
};

export default Node.create({
  name: 'monsterBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'framed',
        parseHTML: (element) => {
          // Order matters: check .wide first since it also has .frame
          if (element.classList.contains('wide'))  return 'wide';
          if (element.classList.contains('frame')) return 'framed';
          return 'unframed';
        },
        renderHTML: () => ({}), // class is set in renderHTML() below
      },
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {};
          return { 'data-monster-name': attributes.name };
        },
      },
      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-type'),
        renderHTML: attributes => {
          if (!attributes.type) return {};
          return { 'data-monster-type': attributes.type };
        },
      },
      cr: {
        default: null,
        parseHTML: element => element.getAttribute('data-monster-cr'),
        renderHTML: attributes => {
          if (!attributes.cr) return {};
          return { 'data-monster-cr': attributes.cr };
        },
      },
    };
  },

  parseHTML() {
    return [
      // Order matters — most specific first
      { tag: 'div.monster.frame.wide' },
      { tag: 'div.monster.frame' },
      { tag: 'div.monster' },
      { tag: 'div.statblock' },
      { tag: 'section.monster' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variantClass = VARIANT_CLASS_MAP[node.attrs.variant] || VARIANT_CLASS_MAP.framed;
    const attrs = { ...HTMLAttributes, class: variantClass };

    // If monster name exists, add header
    if (node.attrs.name) {
      const meta = [];
      if (node.attrs.type) meta.push(node.attrs.type);
      if (node.attrs.cr) meta.push(`CR ${node.attrs.cr}`);

      const header = [
        'div',
        { class: 'monster-header' },
        ['h3', { class: 'monster-name' }, node.attrs.name],
        meta.length ? ['p', { class: 'monster-meta' }, meta.join(' • ')] : null,
      ].filter(Boolean);

      return ['div', attrs, header, ['div', { class: 'monster-content' }, 0]];
    }

    return ['div', attrs, 0];
  },

  addCommands() {
    return {
      /** Insert a framed monster block (default). Backwards-compatible. */
      insertMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'framed', ...attrs },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert a framed monster block (explicit). */
      insertFramedMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'framed', ...attrs },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert an unframed monster block (no border/background). */
      insertUnframedMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'unframed', ...attrs },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Insert a wide monster block (framed, spanning both columns). */
      insertWideMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'wide', ...attrs },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },

      /** Change an existing monster block's variant. */
      setMonsterVariant: (variant) => ({ commands }) => {
        return commands.updateAttributes(this.name, { variant });
      },

      toggleMonster: () => ({ commands }) => {
        return commands.toggleWrap(this.name);
      },
    };
  },
});
