import _ from 'lodash';

/**
 * Parse legacy Homebrewery style tags such as:
 *   myClass1,myClass2
 *   #myId
 *   color:red
 *   attr="value with spaces"
 *
 * Matches behavior of processStyleTags in shared/naturalcrit/markdown.js
 */
const parseStyleTags = (string = '')=>{
	if(!string) {
		return {
			id         : null,
			classes    : null,
			styles     : null,
			attributes : null
		};
	}

	// Split tags up. Quotes can only occur right after : or =.
	// eslint-disable-next-line max-len
	const tags = string.match(/(?:[^, ":=]+|[:=](?:"[^"]*"|))+/g) || [];

	const id = _.remove(tags, (tag)=>tag.startsWith('#'))
		.map((tag)=>tag.slice(1))[0] || null;

	const classes = _.remove(tags, (tag)=>(!tag.includes(':')) && (!tag.includes('=')))
		.join(' ') || null;

	const attributes = _.remove(tags, (tag)=>tag.includes('='))
		.map((tag)=>tag.replace(/="?([^"]*)"?/g, '="$1"'))
		.filter((attr)=>!attr.startsWith('class="') && !attr.startsWith('style="') && !attr.startsWith('id="'))
		.reduce((obj, attr)=>{
			const index = attr.indexOf('=');
			let [key, value] = [attr.substring(0, index), attr.substring(index + 1)];
			value = value.replace(/"/g, '');
			obj[key.trim()] = value.trim();
			return obj;
		}, {}) || null;

	const styles = tags.length ? tags.reduce((styleObj, style)=>{
		const index = style.indexOf(':');
		if(index === -1) return styleObj;
		const [key, value] = [style.substring(0, index), style.substring(index + 1)];
		styleObj[key.trim()] = value.replace(/"?([^"]*)"?/g, '$1').trim();
		return styleObj;
	}, {}) : null;

	return {
		id,
		classes    : _.isEmpty(classes) ? null : classes,
		styles     : _.isEmpty(styles) ? null : styles,
		attributes : _.isEmpty(attributes) ? null : attributes
	};
};

/**
 * Convert parsed tag info back to the legacy tag string.
 * Opposite of parseStyleTags.
 */
const stringifyStyleTags = ({ id, classes, styles, attributes } = {})=>{
	const parts = [];

	if(id) parts.push(`#${id}`);
	if(classes) {
		classes.split(' ').forEach((cls)=>{
			if(cls) parts.push(cls);
		});
	}
	if(styles) {
		Object.entries(styles).forEach(([key, value])=>{
			if(value !== undefined && value !== null && value !== '') {
				const val = value.includes(' ') ? `"${value}"` : value;
				parts.push(`${key}:${val}`);
			}
		});
	}
	if(attributes) {
		Object.entries(attributes).forEach(([key, value])=>{
			if(value !== undefined && value !== null) {
				const val = value.includes(' ') ? `"${value}"` : value;
				parts.push(`${key}=${val}`);
			}
		});
	}

	return parts.join(',');
};

export {
	parseStyleTags,
	stringifyStyleTags
};

export default {
	parseStyleTags,
	stringifyStyleTags
};
