import { Node, nodeInputRule } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

/**
 * FootnoteBlock - D&D 5e footnote/reference block
 * Renders as: <div class="footnote">...</div>
 */
export default Node.create({
  name: 'footnoteBlock',
  
  group: 'block',
  
  content: 'block+',
  
  defining: true,
  
  addAttributes() {
    return {
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-number'),
        renderHTML: attributes => {
          if (!attributes.number) return {};
          return { 'data-footnote-number': attributes.number };
        },
      },
    };
  },
  
  parseHTML() {
    return [
      { tag: 'div.footnote' },
      { tag: 'aside.footnote' },
    ];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const attrs = { class: 'footnote', ...HTMLAttributes };
    
    // If footnote number exists, add it
    if (node.attrs.number) {
      return [
        'div',
        attrs,
        ['span', { class: 'footnote-number' }, `[${node.attrs.number}]`],
        ['span', { class: 'footnote-content' }, 0],
      ];
    }
    
    return ['div', attrs, 0];
  },
  
  addCommands() {
    return {
      insertFootnote: (number = null) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: { number },
            content: [{ type: 'paragraph' }],
          })
          .run();
      },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find  : /^{{footnote\s+([\s\S]*?)\s*}}$/,
        type  : this.type,
        getContent : (match)=>{
          const text = match[1] ?? '';
          if(!text.trim()) return false;
          return [{
            type    : 'paragraph',
            content : [{ type: 'text', text: text.trim() }]
          }];
        }
      })
    ];
  },

  addProseMirrorPlugins() {
    const footnoteRegex = /^{{footnote\s+([\s\S]*?)\s*}}$/;

    return [
      new Plugin({
        appendTransaction : (transactions, _oldState, newState)=>{
          if(!transactions.some((tr)=>tr.docChanged)) return null;

          const { doc, schema } = newState;
          const paragraphType = schema.nodes.paragraph;
          const footnoteType = schema.nodes.footnoteBlock;
          if(!paragraphType || !footnoteType) return null;

          let tr = newState.tr;
          let changed = false;

          doc.descendants((node, pos)=>{
            if(changed && tr.doc !== doc) return false;

            if(node.type === paragraphType) {
              const raw = node.textBetween(0, node.content.size, '\n', '\n');
              if(!raw) return;
              const match = footnoteRegex.exec(raw.trim());
              if(match) {
                const footnoteText = match[1].trim();
                if(!footnoteText) return;
                const footnoteNode = footnoteType.create(null,
                  paragraphType.create(null, schema.text(footnoteText))
                );
                tr = tr.replaceWith(pos, pos + node.nodeSize, footnoteNode);
                changed = true;
              }
            }
          });

          return changed ? tr : null;
        }
      })
    ];
  }
});
