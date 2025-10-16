import { Node } from '@tiptap/core';

const buildStyleString = (styles = {})=>{
	return Object.entries(styles)
		.map(([key, value])=>`${key}:${value}`)
		.join(';');
};

/**
 * MustacheSpan
 * Represents inline legacy syntax {{tags content}} and renders with combined attributes.
 */
export default Node.create({
	name     : 'mustacheSpan',
	inline   : true,
	group    : 'inline',
	content  : 'inline*',
	defining : true,

	addAttributes() {
		return {
			id : {
				default    : null,
				parseHTML  : (element)=>element.getAttribute('data-mustache-id') ?? element.getAttribute('id'),
				renderHTML : (attributes)=>attributes.id ? { id: attributes.id } : {}
			},
			classes : {
				default    : null,
				parseHTML  : (element)=>element.getAttribute('data-mustache-classes'),
				renderHTML : (attributes)=>({ class: ['inline-block', attributes.classes].filter(Boolean).join(' ') })
			},
			styles : {
				default    : null,
				parseHTML  : (element)=>{
					const raw = element.getAttribute('data-mustache-styles');
					if(!raw) return null;
					return raw.split(';').reduce((acc, entry)=>{
						if(!entry) return acc;
						const [key, value] = entry.split(':');
						if(key && value !== undefined) acc[key.trim()] = value.trim();
						return acc;
					}, {});
				},
				renderHTML : (attributes)=>{
					if(!attributes.styles) return {};
					return { style: buildStyleString(attributes.styles) };
				}
			},
			attributes : {
				default    : null,
				parseHTML  : (element)=>{
					const raw = element.getAttribute('data-mustache-attrs');
					if(!raw) return null;
					try {
						return JSON.parse(raw);
					} catch (err) {
						return null;
					}
				},
				renderHTML : (attributes)=>{
					if(!attributes.attributes) return {};
					return attributes.attributes;
				}
			}
		};
	},

	parseHTML() {
		return [
			{ tag: 'span[data-mustache-span]' },
			{ tag: 'span.mustache-inline' }
		];
	},

	renderHTML({ HTMLAttributes }) {
		const { style, attributes, classes, id, ...rest } = HTMLAttributes;
		const renderedAttrs = {
			'data-mustache-span'   : 'true',
			class                  : ['inline-block', classes].filter(Boolean).join(' ') || 'inline-block',
			'data-mustache-classes': classes || '',
			...rest
		};

		if(id) {
			renderedAttrs.id = id;
			renderedAttrs['data-mustache-id'] = id;
		}

		if(style) {
			renderedAttrs.style = style;
			renderedAttrs['data-mustache-styles'] = style;
		}

		if(attributes) {
			renderedAttrs['data-mustache-attrs'] = JSON.stringify(attributes);
			Object.assign(renderedAttrs, attributes);
		}

		return ['span', renderedAttrs, 0];
	}
});
