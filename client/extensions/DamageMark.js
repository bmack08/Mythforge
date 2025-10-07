import { Mark } from '@tiptap/core';
import { markInputRule } from '@tiptap/core';

/**
 * DamageMark - Inline damage type reference mark
 * Syntax: \damage{fire} or \damage{slashing}
 * Renders as: <span class="damage-ref">fire</span>
 */
export default Mark.create({
  name: 'damageMark',
  
  inclusive: false,
  
  addAttributes() {
    return {
      damageType: {
        default: null,
        parseHTML: element => element.getAttribute('data-damage-type'),
        renderHTML: attributes => {
          if (!attributes.damageType) return {};
          return { 'data-damage-type': attributes.damageType };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.damage-ref',
        getAttrs: element => ({
          damageType: element.getAttribute('data-damage-type') || element.textContent,
        }),
      },
    ];
  },
  
  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      {
        class: 'damage-ref',
        'data-damage-type': mark.attrs.damageType,
        ...HTMLAttributes,
      },
      0,
    ];
  },
  
  addCommands() {
    return {
      setDamageMark: (damageType) => ({ commands }) => {
        return commands.setMark(this.name, { damageType });
      },
      toggleDamageMark: (damageType) => ({ commands }) => {
        return commands.toggleMark(this.name, { damageType });
      },
      unsetDamageMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
  
  addInputRules() {
    return [
      markInputRule({
        find: /\\damage\{([^}]+)\}/,
        type: this.type,
        getAttributes: (match) => ({
          damageType: match[1],
        }),
      }),
    ];
  },
});
