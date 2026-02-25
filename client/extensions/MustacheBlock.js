import { Node, mergeAttributes } from '@tiptap/core';

const buildStyleString = (styles = {})=>{
	return Object.entries(styles)
		.map(([key, value])=>`${key}:${value}`)
		.join(';');
};

/**
 * MustacheBlock
 * Represents legacy Homebrewery block syntax:
 * {{class1,class2 #id style:value
 *   content here
 * }}
 *
 * Renders as: <div class="class1 class2" id="id" style="style:value">content</div>
 */
export default Node.create({
	name     : 'mustacheBlock',
	group    : 'block',
	content  : 'block+',
	defining : true,

	addAttributes() {
		return {
			id : {
				default    : null,
				parseHTML  : (element)=>element.getAttribute('data-mustache-id') ?? element.getAttribute('id'),
				renderHTML : ()=>({})  // Handled in node renderHTML
			},
			classes : {
				default    : null,
				parseHTML  : (element)=>element.getAttribute('data-mustache-classes') || element.className?.replace(/\bmustache-block\b/g, '').trim() || null,
				renderHTML : ()=>({})  // Handled in node renderHTML
			},
			styles : {
				default    : null,
				parseHTML  : (element)=>{
					const raw = element.getAttribute('data-mustache-styles');
					if(!raw) return null;
					return raw.split(';').reduce((acc, entry)=>{
						if(!entry) return acc;
						const [key, ...valueParts] = entry.split(':');
						const value = valueParts.join(':');
						if(key && value !== undefined) acc[key.trim()] = value.trim();
						return acc;
					}, {});
				},
				renderHTML : ()=>({})  // Handled in node renderHTML
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
				renderHTML : ()=>({})  // Handled in node renderHTML
			}
		};
	},

	parseHTML() {
		return [
			{ tag: 'div[data-mustache-block]' },
			{ tag: 'div.mustache-block' }
		];
	},

	renderHTML({ node, HTMLAttributes }) {
		const { id, classes, styles, attributes } = node.attrs;

		const attrs = {
			'data-mustache-block' : 'true',
		};

		// Build class string from mustache classes
		const classNames = [classes].filter(Boolean).join(' ');
		attrs.class = classNames || undefined;
		attrs['data-mustache-classes'] = classes || '';

		// Apply ID
		if(id) {
			attrs.id = id;
			attrs['data-mustache-id'] = id;
		}

		// Apply inline styles
		if(styles && Object.keys(styles).length > 0) {
			const styleStr = buildStyleString(styles);
			attrs.style = styleStr;
			attrs['data-mustache-styles'] = styleStr;
		}

		// Apply extra attributes
		if(attributes && Object.keys(attributes).length > 0) {
			attrs['data-mustache-attrs'] = JSON.stringify(attributes);
			Object.assign(attrs, attributes);
		}

		return ['div', attrs, 0];
	},

	addCommands() {
		return {
			insertMustacheBlock: (attrs = {})=>({ chain })=>{
				return chain()
					.insertContent({
						type    : this.name,
						attrs,
						content : [{ type: 'paragraph' }]
					})
					.run();
			},
			wrapInMustacheBlock: (attrs = {})=>({ chain })=>{
				return chain()
					.wrapIn(this.name, attrs)
					.run();
			}
		};
	}
});
