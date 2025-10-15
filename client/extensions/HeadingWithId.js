import { Heading } from '@tiptap/extension-heading';
import { mergeAttributes } from '@tiptap/core';

/**
 * HeadingWithId Extension
 * Extends TipTap's Heading to automatically generate and manage ID attributes
 * for anchor linking and table of contents functionality (D&D Beyond style)
 */

// Simple slugify function
const slugify = (text) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove non-word chars
		.replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

export default Heading.extend({
	name: 'headingWithId',

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
