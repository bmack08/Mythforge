import { Node, nodeInputRule } from '@tiptap/core';
import { parseStyleTags } from '../../shared/helpers/legacyStyleTags.js';

/**
 * PageBreak - D&D 5e page break node
 * Triggered by typing "\page" or inserted via command
 * Renders as: <hr class="page-break" />
 */
export default Node.create({
  name: 'pageBreak',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-pagebreak-id'),
        renderHTML: attributes => attributes.id ? { 'data-pagebreak-id': attributes.id } : {},
      },
      classes: {
        default: null,
        parseHTML: element => element.getAttribute('data-pagebreak-classes'),
        renderHTML: attributes => attributes.classes ? { 'data-pagebreak-classes': attributes.classes } : {},
      },
      styles: {
        default: null,
        parseHTML: element => {
          const raw = element.getAttribute('data-pagebreak-styles');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        },
        renderHTML: attributes => attributes.styles ? { 'data-pagebreak-styles': JSON.stringify(attributes.styles) } : {},
      },
      attributes: {
        default: null,
        parseHTML: element => {
          const raw = element.getAttribute('data-pagebreak-attrs');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (err) {
            return null;
          }
        },
        renderHTML: attributes => attributes.attributes ? { 'data-pagebreak-attrs': JSON.stringify(attributes.attributes) } : {},
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'hr.page-break' },
      { tag: 'hr[data-type="pageBreak"]' },
      { tag: 'div.page-break' }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const {
      id,
      'data-pagebreak-classes': storedClasses,
      'data-pagebreak-styles' : storedStyles,
      'data-pagebreak-attrs'  : storedAttrs,
      ...rest
    } = HTMLAttributes;

    const classNames = ['page-break'];
    if (storedClasses) classNames.push(storedClasses);

    const styleString = storedStyles
      ? Object.entries(JSON.parse(storedStyles))
        .map(([key, value])=>`${key}:${value}`)
        .join(';')
      : null;

    const extraAttrs = storedAttrs ? JSON.parse(storedAttrs) : {};

    return [
      'hr',
      { 
        class: classNames.join(' '),
        'data-type': 'pageBreak',
        ...(id ? { id } : {}),
        ...(styleString ? { style: styleString } : {}),
        ...extraAttrs,
        ...rest
      }
    ];
  },
  
  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name });
      },
    };
  },
  
  addInputRules() {
    return [
      nodeInputRule({
        find : /^\\page(?:break)?(?:\s*{([^}]*)})?$/,
        type : this.type,
        getAttributes : (match)=>parseStyleTags(match[1] || '')
      })
    ];
  },
});
