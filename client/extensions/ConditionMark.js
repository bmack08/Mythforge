import { Mark } from '@tiptap/core';
import { markInputRule } from '@tiptap/core';

/**
 * ConditionMark - Inline condition reference mark
 * Syntax: \condition{Poisoned} or \condition{stunned}
 * Renders as: <span class="condition-ref">Poisoned</span>
 */
export default Mark.create({
  name: 'conditionMark',
  
  inclusive: false,
  
  addAttributes() {
    return {
      conditionName: {
        default: null,
        parseHTML: element => element.getAttribute('data-condition'),
        renderHTML: attributes => {
          if (!attributes.conditionName) return {};
          return { 'data-condition': attributes.conditionName };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.condition-ref',
        getAttrs: element => ({
          conditionName: element.getAttribute('data-condition') || element.textContent,
        }),
      },
    ];
  },
  
  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      {
        class: 'condition-ref',
        'data-condition': mark.attrs.conditionName,
        ...HTMLAttributes,
      },
      0,
    ];
  },
  
  addCommands() {
    return {
      setConditionMark: (conditionName) => ({ commands }) => {
        return commands.setMark(this.name, { conditionName });
      },
      toggleConditionMark: (conditionName) => ({ commands }) => {
        return commands.toggleMark(this.name, { conditionName });
      },
      unsetConditionMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
  
  addInputRules() {
    return [
      markInputRule({
        find: /\\condition\{([^}]+)\}/,
        type: this.type,
        getAttributes: (match) => ({
          conditionName: match[1],
        }),
      }),
    ];
  },
});
