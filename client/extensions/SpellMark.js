import { Mark } from '@tiptap/core';
import { markInputRule } from '@tiptap/core';

/**
 * SpellMark - Inline spell reference mark
 * Syntax: \spell{Fireball} or \spell{magic missile}
 * Renders as: <span class="spell-ref">Fireball</span>
 */
export default Mark.create({
  name: 'spellMark',
  
  inclusive: false,
  
  addAttributes() {
    return {
      spellName: {
        default: null,
        parseHTML: element => element.getAttribute('data-spell'),
        renderHTML: attributes => {
          if (!attributes.spellName) return {};
          return { 'data-spell': attributes.spellName };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.spell-ref',
        getAttrs: element => ({
          spellName: element.getAttribute('data-spell') || element.textContent,
        }),
      },
    ];
  },
  
  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      {
        class: 'spell-ref',
        'data-spell': mark.attrs.spellName,
        ...HTMLAttributes,
      },
      0,
    ];
  },
  
  addCommands() {
    return {
      setSpellMark: (spellName) => ({ commands }) => {
        return commands.setMark(this.name, { spellName });
      },
      toggleSpellMark: (spellName) => ({ commands }) => {
        return commands.toggleMark(this.name, { spellName });
      },
      unsetSpellMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
  
  addInputRules() {
    return [
      markInputRule({
        find: /\\spell\{([^}]+)\}/,
        type: this.type,
        getAttributes: (match) => ({
          spellName: match[1],
        }),
      }),
    ];
  },
});
