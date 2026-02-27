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
    const MONSTER_CONTENT = [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Creature Name' }] },
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'Medium beast, unaligned' }
      ]},
      { type: 'horizontalRule' },
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Armor Class ' },
        { type: 'text', text: '13 (natural armor)' }
      ]},
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Hit Points ' },
        { type: 'text', text: '22 (4d8 + 4)' }
      ]},
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Speed ' },
        { type: 'text', text: '30 ft.' }
      ]},
      { type: 'horizontalRule' },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'STR' }] }] },
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'DEX' }] }] },
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CON' }] }] },
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'INT' }] }] },
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'WIS' }] }] },
              { type: 'tableHeader', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CHA' }] }] },
            ]
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '14 (+2)' }] }] },
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '12 (+1)' }] }] },
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '12 (+1)' }] }] },
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '2 (-4)' }] }] },
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '10 (+0)' }] }] },
              { type: 'tableCell', attrs: { textAlign: 'center' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '6 (-2)' }] }] },
            ]
          },
        ]
      },
      { type: 'horizontalRule' },
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Senses ' },
        { type: 'text', text: 'darkvision 60 ft., passive Perception 12' }
      ]},
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Languages ' },
        { type: 'text', text: 'Common' }
      ]},
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Challenge ' },
        { type: 'text', text: '1 (200 XP)' }
      ]},
      { type: 'horizontalRule' },
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Pack Tactics. ' },
        { type: 'text', text: 'The creature has advantage on attack rolls against a target if at least one of the creature\'s allies is within 5 feet of the target.' }
      ]},
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Actions' }] },
      { type: 'paragraph', content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Bite. ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Melee Weapon Attack: ' },
        { type: 'text', text: '+4 to hit, reach 5 ft., one target. ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Hit: ' },
        { type: 'text', text: '5 (1d6 + 2) piercing damage.' }
      ]},
    ];

    return {
      /** Insert a framed monster block (default). Backwards-compatible. */
      insertMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'framed', ...attrs },
            content: MONSTER_CONTENT,
          })
          .run();
      },

      /** Insert a framed monster block (explicit). */
      insertFramedMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'framed', ...attrs },
            content: MONSTER_CONTENT,
          })
          .run();
      },

      /** Insert an unframed monster block (no border/background). */
      insertUnframedMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'unframed', ...attrs },
            content: MONSTER_CONTENT,
          })
          .run();
      },

      /** Insert a wide monster block (framed, spanning both columns). */
      insertWideMonster: (attrs = {}) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { variant: 'wide', ...attrs },
            content: MONSTER_CONTENT,
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
