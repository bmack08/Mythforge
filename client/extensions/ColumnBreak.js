import { Node, nodeInputRule } from '@tiptap/core';
import { parseStyleTags } from '../../shared/helpers/legacyStyleTags.js';

/**
 * ColumnBreak - D&D 5e column break (two-column layout)
 * Triggered by typing "\column" or inserted via command
 * Renders as: <div class="column-break" />
 */
export default Node.create({
  name: 'columnBreak',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-columnbreak-id'),
        renderHTML: attributes => attributes.id ? { 'data-columnbreak-id': attributes.id } : {},
      },
      classes: {
        default: null,
        parseHTML: element => element.getAttribute('data-columnbreak-classes'),
        renderHTML: attributes => attributes.classes ? { 'data-columnbreak-classes': attributes.classes } : {},
      },
      styles: {
        default: null,
        parseHTML: element => {
          const raw = element.getAttribute('data-columnbreak-styles');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        },
        renderHTML: attributes => attributes.styles ? { 'data-columnbreak-styles': JSON.stringify(attributes.styles) } : {},
      },
      attributes: {
        default: null,
        parseHTML: element => {
          const raw = element.getAttribute('data-columnbreak-attrs');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        },
        renderHTML: attributes => attributes.attributes ? { 'data-columnbreak-attrs': JSON.stringify(attributes.attributes) } : {},
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.column-break' },
      { tag: 'hr.column-break' },
      { tag: 'div[data-type="columnBreak"]' },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const {
      id,
      'data-columnbreak-classes': storedClasses,
      'data-columnbreak-styles' : storedStyles,
      'data-columnbreak-attrs'  : storedAttrs,
      ...rest
    } = HTMLAttributes;

    const classNames = ['column-break'];
    if (storedClasses) classNames.push(storedClasses);

    const styleString = storedStyles
      ? Object.entries(JSON.parse(storedStyles))
        .map(([key, value])=>`${key}:${value}`)
        .join(';')
      : null;

    const extraAttrs = storedAttrs ? JSON.parse(storedAttrs) : {};

    return [
      'div',
      { 
        class: classNames.join(' '),
        'data-type': 'columnBreak',
        ...(id ? { id } : {}),
        ...(styleString ? { style: styleString } : {}),
        ...extraAttrs,
        ...rest
      }
    ];
  },
  
  addCommands() {
    return {
      setColumnBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
  
  addInputRules() {
    return [
      nodeInputRule({
        find : /^\\column(?:break)?(?:\s*{([^}]*)})?$/,
        type : this.type,
        getAttributes : (match)=>parseStyleTags(match[1] || '')
      })
    ];
  },
});
