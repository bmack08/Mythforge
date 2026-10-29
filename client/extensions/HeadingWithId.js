import { Heading } from '@tiptap/extension-heading';
import { mergeAttributes } from '@tiptap/core';
import slugify from './slugify.js';

/**
 * HeadingWithId Extension
 * Extends TipTap's Heading to automatically generate and manage ID attributes
 * for anchor linking and table of contents functionality (D&D Beyond style)
 *
 * NOTE: `slugify` is shared with OutlinePanel (client/extensions/slugify.js) so
 * the ids this NodeView writes always match the anchors the outline jumps to.
 */

export default Heading.extend({
	name: 'heading',

	addAttributes() {
		return {
			...this.parent?.(),
			id: {
				default: null,
				parseHTML: element => element.getAttribute('id'),
				renderHTML: attributes => {
					if (!attributes.id) {
						return {};
					}
					return { id: attributes.id };
				},
			},
		};
	},

	addNodeView() {
		return ({ node, HTMLAttributes }) => {
			const level = node.attrs.level;
			const id = node.attrs.id || slugify(node.textContent);

			// Update the node's id attribute if it was auto-generated
			if (!node.attrs.id && id) {
				node.attrs.id = id;
			}

			const dom = document.createElement(`h${level}`);

			// Merge attributes including the ID
			Object.entries(mergeAttributes(HTMLAttributes, { id })).forEach(([key, value]) => {
				dom.setAttribute(key, value);
			});

			const contentDOM = document.createElement('span');
			dom.appendChild(contentDOM);

			return {
				dom,
				contentDOM,
				update: (updatedNode) => {
					if (updatedNode.type.name !== this.name) {
						return false;
					}

					// Update ID when content changes
					const newId = slugify(updatedNode.textContent);
					if (newId && newId !== dom.getAttribute('id')) {
						dom.setAttribute('id', newId);
						updatedNode.attrs.id = newId;
					}

					return true;
				},
			};
		};
	},

	renderHTML({ node, HTMLAttributes }) {
		const level = node.attrs.level;
		const id = node.attrs.id || slugify(node.textContent);

		// Add PHB class for levels 1-3 per Blueprint EPIC D
		const phbClass = level <= 3 ? `phb-h${level}` : '';

		return [
			`h${level}`,
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id, class: phbClass }),
			0
		];
	},
});
