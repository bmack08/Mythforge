import { Node } from '@tiptap/core';

/**
 * DefinitionList - HTML <dl> definition list for spell stats, item properties, etc.
 * 
 * Structure:
 *   <dl>
 *     <dt>Term</dt>
 *     <dd>Definition</dd>
 *   </dl>
 * 
 * Used by spell snippets for:
 *   **Casting Time:** :: 1 action
 *   **Range:**        :: 30 feet
 */
export const DefinitionList = Node.create({
  name: 'definitionList',
  
  group: 'block',
  
  content: '(definitionTerm | definitionDescription)+',
  
  parseHTML() {
    return [{ tag: 'dl' }];
  },
  
  renderHTML() {
    return ['dl', 0];
  },
  
  addCommands() {
    return {
      insertDefinitionList: () => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content: [
              { type: 'definitionTerm', content: [{ type: 'text', text: 'Term' }] },
              { type: 'definitionDescription', content: [{ type: 'text', text: 'Definition' }] }
            ]
          })
          .run();
      },
    };
  },
});

export const DefinitionTerm = Node.create({
  name: 'definitionTerm',
  
  content: 'inline*',
  
  defining: true,
  
  parseHTML() {
    return [{ tag: 'dt' }];
  },
  
  renderHTML() {
    return ['dt', 0];
  },
});

export const DefinitionDescription = Node.create({
  name: 'definitionDescription',
  
  content: 'inline*',
  
  defining: true,
  
  parseHTML() {
    return [{ tag: 'dd' }];
  },
  
  renderHTML() {
    return ['dd', 0];
  },
});

export default DefinitionList;
