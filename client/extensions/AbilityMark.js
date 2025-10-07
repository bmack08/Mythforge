import { Mark } from '@tiptap/core';
import { markInputRule } from '@tiptap/core';

/**
 * AbilityMark - Inline ability score reference mark
 * Syntax: \ability{Strength} or \ability{STR}
 * Renders as: <span class="ability-ref">Strength</span>
 */
export default Mark.create({
  name: 'abilityMark',
  
  inclusive: false,
  
  addAttributes() {
    return {
      abilityName: {
        default: null,
        parseHTML: element => element.getAttribute('data-ability'),
        renderHTML: attributes => {
          if (!attributes.abilityName) return {};
          return { 'data-ability': attributes.abilityName };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.ability-ref',
        getAttrs: element => ({
          abilityName: element.getAttribute('data-ability') || element.textContent,
        }),
      },
    ];
  },
  
  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      {
        class: 'ability-ref',
        'data-ability': mark.attrs.abilityName,
        ...HTMLAttributes,
      },
      0,
    ];
  },
  
  addCommands() {
    return {
      setAbilityMark: (abilityName) => ({ commands }) => {
        return commands.setMark(this.name, { abilityName });
      },
      toggleAbilityMark: (abilityName) => ({ commands }) => {
        return commands.toggleMark(this.name, { abilityName });
      },
      unsetAbilityMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
  
  addInputRules() {
    return [
      markInputRule({
        find: /\\ability\{([^}]+)\}/,
        type: this.type,
        getAttributes: (match) => ({
          abilityName: match[1],
        }),
      }),
    ];
  },
});
