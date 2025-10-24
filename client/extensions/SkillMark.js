import { Mark } from '@tiptap/core';
import { markInputRule } from '@tiptap/core';

/**
 * SkillMark - Inline skill reference mark
 * Syntax: \skill{Perception} or \skill{stealth}
 * Renders as: <span class="skill-ref">Perception</span>
 */
export default Mark.create({
  name: 'skillMark',
  
  inclusive: false,
  
  addAttributes() {
    return {
      skillName: {
        default: null,
        parseHTML: element => element.getAttribute('data-skill'),
        renderHTML: attributes => {
          if (!attributes.skillName) return {};
          return { 'data-skill': attributes.skillName };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'span.skill-ref',
        getAttrs: element => ({
          skillName: element.getAttribute('data-skill') || element.textContent,
        }),
      },
    ];
  },
  
  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span',
      {
        class: 'skill-ref',
        'data-skill': mark.attrs.skillName,
        ...HTMLAttributes,
      },
      0,
    ];
  },
  
  addCommands() {
    return {
      setSkillMark: (skillName) => ({ commands }) => {
        return commands.setMark(this.name, { skillName });
      },
      toggleSkillMark: (skillName) => ({ commands }) => {
        return commands.toggleMark(this.name, { skillName });
      },
      unsetSkillMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
  
  addInputRules() {
    return [
      markInputRule({
        find: /\\skill\{([^}]+)\}/,
        type: this.type,
        getAttributes: (match) => ({
          skillName: match[1],
        }),
      }),
    ];
  },
});
