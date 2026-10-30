import React from 'react';
import LUCIDE_ICONS from '../icons/lucide/icons.generated.js';

/*
 * The one icon in Mythforge's chrome.
 *
 * Why it exists: the chrome's icons were an icon font, and twice now the font
 * (or the SVG mask standing in for it) has been one failed request away from
 * rendering - `200 text/html` through the dev proxy in UNIT M1, `403` from
 * Vite's `server.fs`, then `404` and `406` on `/icons/*.svg` in UNIT M4. Each
 * time, every icon on screen was an empty box and nothing said so. The path
 * data is in the bundle now; there is no request left to fail.
 *
 * It takes ONE prop, `icon`, and accepts three kinds of value:
 *
 *   <Icon icon='book-open' />        a Lucide name - renders inline SVG
 *   <Icon icon='fas fa-book' />      a Font Awesome class - MAPPED to Lucide
 *                                    through FA_TO_LUCIDE below, then inline
 *   <Icon icon='fac mask-edge' />    anything unmapped - renders the original
 *                                    <i class='…'> untouched
 *
 * The middle case is what makes this a small change rather than a 250-call-site
 * one: `Nav.item icon='fas fa-user'` and the theme-supplied `snippet.icon`
 * strings keep working and come out as SVG.
 *
 * The third case is deliberate, not a loose end. Two families of icon are NOT
 * Lucide's job and keep their font/mask:
 *
 *   * brand marks - `fab fa-google-drive`, `fab fa-reddit-alien`. A generic
 *     icon set has no correct glyph for somebody else's logo, and substituting
 *     a cloud for Google Drive would be a worse answer than the real mark.
 *   * brew-content and theme icons - the `fac …` masks (book covers, image
 *     masks, rune scripts) and whatever a theme's own snippets ask for. These
 *     belong to the paper, not the chrome.
 *
 * Both are measured rather than assumed: tests/redesign/mythforge-m5.spec.cjs
 * walks every Mythforge route and fails if any of them renders smaller than
 * 4px, which is what a missing glyph measures.
 */

/* Font Awesome class -> Lucide name.
 *
 * Keyed on the bare `fa-…` token, so the style prefix (`fas`, `far`, `fa`,
 * `fa-solid`) does not matter and neither does token order. Where the same FA
 * icon means two different things in two places, the call site passes the
 * Lucide name directly instead of appearing twice here. */
const FA_TO_LUCIDE = {
	'fa-align-left'             : 'align-left',
	'fa-align-right'            : 'align-right',
	'fa-arrow-left'             : 'arrow-left',
	'fa-arrow-right'            : 'arrow-right',
	'fa-arrow-rotate-left'      : 'undo-2',
	'fa-arrows-alt-h'           : 'move-horizontal',
	'fa-arrows-alt-v'           : 'move-vertical',
	'fa-ban'                    : 'ban',
	'fa-bars'                   : 'rows-3',
	'fa-beer'                   : 'beer',
	'fa-bold'                   : 'bold',
	'fa-book'                   : 'book',
	'fa-book-open'              : 'book-open',
	'fa-book-reader'            : 'book-marked',
	'fa-bookmark'               : 'bookmark',
	'fa-border-all'             : 'grid-3x3',
	'fa-border-none'            : 'square',
	'fa-border-style'           : 'square-dashed',
	'fa-bug'                    : 'bug',
	'fa-caret-down'             : 'chevron-down',
	'fa-caret-right'            : 'chevron-right',
	'fa-check'                  : 'check',
	'fa-check-circle'           : 'circle-check',
	'fa-check-double'           : 'check-check',
	'fa-chevron-down'           : 'chevron-down',
	'fa-chevron-left'           : 'chevron-left',
	'fa-chevron-right'          : 'chevron-right',
	'fa-chevron-up'             : 'chevron-up',
	'fa-clock-rotate-left'      : 'history',
	'fa-clone'                  : 'copy',
	'fa-cloud-arrow-up'         : 'cloud-upload',
	'fa-code'                   : 'code',
	'fa-cog'                    : 'settings',
	'fa-columns'                : 'columns-2',
	'fa-comment'                : 'message-square',
	'fa-comment-alt'            : 'message-square',
	'fa-compress-alt'           : 'shrink',
	'fa-compress-arrows-alt'    : 'shrink',
	'fa-copy'                   : 'copy',
	'fa-dice-d20'               : 'dices',
	'fa-dice-five'              : 'dice-5',
	'fa-dice-four'              : 'dice-4',
	'fa-dice-one'               : 'dice-1',
	'fa-dice-six'               : 'dice-6',
	'fa-dice-three'             : 'dice-3',
	'fa-dice-two'               : 'dice-2',
	'fa-download'               : 'download',
	/* Lucide has no dragon. `sparkles` is the conventional "this is the AI"
	 * mark and is what every AI entry point in the chrome uses; see the UNIT M5
	 * note in laneM-progress.md for the one place a fantasy-specific icon would
	 * genuinely read better. */
	'fa-dragon'                 : 'sparkles',
	'fa-dungeon'                : 'library-big',
	'fa-edit'                   : 'square-pen',
	'fa-exclamation-circle'     : 'circle-alert',
	'fa-exclamation-triangle'   : 'triangle-alert',
	'fa-expand'                 : 'maximize',
	'fa-expand-alt'             : 'expand',
	'fa-expand-arrows-alt'      : 'expand',
	'fa-eye'                    : 'eye',
	'fa-feather-pointed'        : 'feather',
	'fa-file'                   : 'file',
	'fa-file-alt'               : 'file-text',
	'fa-file-import'            : 'file-input',
	'fa-file-lines'             : 'file-text',
	'fa-file-pdf'               : 'file-down',
	'fa-fill-drip'              : 'paint-bucket',
	'fa-fire'                   : 'flame',
	'fa-font'                   : 'type',
	'fa-gear'                   : 'settings',
	'fa-glasses'                : 'glasses',
	'fa-globe'                  : 'globe',
	'fa-hashtag'                : 'hash',
	'fa-hat-wizard'             : 'wand-sparkles',
	'fa-history'                : 'history',
	'fa-i-cursor'               : 'text-cursor-input',
	'fa-icons'                  : 'shapes',
	'fa-id-card'                : 'id-card',
	'fa-image'                  : 'image',
	'fa-images'                 : 'image',
	'fa-info-circle'            : 'info',
	'fa-italic'                 : 'italic',
	'fa-keyboard'               : 'keyboard',
	'fa-language'               : 'languages',
	'fa-lightbulb'              : 'lightbulb',
	'fa-link'                   : 'link',
	'fa-list'                   : 'list',
	'fa-list-alt'               : 'list',
	'fa-list-ol'                : 'list-ordered',
	'fa-list-ul'                : 'list',
	'fa-lock'                   : 'lock',
	'fa-magic'                  : 'wand-sparkles',
	'fa-magnifying-glass-minus' : 'zoom-out',
	'fa-magnifying-glass-plus'  : 'zoom-in',
	'fa-mask'                   : 'crop',
	'fa-minus'                  : 'minus',
	'fa-paint-brush'            : 'paintbrush',
	'fa-paintbrush'             : 'paintbrush',
	'fa-palette'                : 'palette',
	'fa-paper-plane'            : 'send',
	'fa-paw'                    : 'paw-print',
	'fa-pencil-alt'             : 'pencil',
	'fa-plus'                   : 'plus',
	'fa-plus-circle'            : 'circle-plus',
	'fa-plus-square'            : 'square-plus',
	'fa-power-off'              : 'power',
	'fa-print'                  : 'printer',
	'fa-project-diagram'        : 'network',
	'fa-question-circle'        : 'circle-help',
	'fa-quote-left'             : 'quote',
	'fa-quote-right'            : 'quote',
	'fa-qrcode'                 : 'qr-code',
	'fa-rectangle-list'         : 'panel-top',
	'fa-redo'                   : 'redo-2',
	'fa-robot'                  : 'bot',
	'fa-rocket'                 : 'rocket',
	'fa-save'                   : 'save',
	'fa-scroll'                 : 'scroll-text',
	'fa-search'                 : 'search',
	'fa-share-alt'              : 'share-2',
	'fa-share-nodes'            : 'share-2',
	'fa-shield-alt'             : 'shield',
	'fa-shoe-prints'            : 'footprints',
	'fa-signature'              : 'signature',
	'fa-sign-in-alt'            : 'log-in',
	'fa-skull-crossbones'       : 'skull',
	'fa-sliders-h'              : 'sliders-horizontal',
	'fa-sort-numeric-down'      : 'arrow-down-0-1',
	'fa-spider'                 : 'bug',
	'fa-spell-check'            : 'spell-check',
	'fa-spinner'                : 'loader-circle',
	'fa-sticky-note'            : 'sticky-note',
	'fa-store'                  : 'store',
	'fa-stream'                 : 'rows-3',
	'fa-strikethrough'          : 'strikethrough',
	'fa-superscript'            : 'superscript',
	'fa-table'                  : 'table',
	'fa-th-large'               : 'layout-grid',
	'fa-th-list'                : 'table-properties',
	'fa-tree'                   : 'trees',
	'fa-times'                  : 'x',
	'fa-times-circle'           : 'circle-x',
	'fa-tint'                   : 'droplet',
	'fa-trash'                  : 'trash-2',
	'fa-trash-alt'              : 'trash-2',
	'fa-undo'                   : 'undo-2',
	'fa-unlock'                 : 'unlock',
	'fa-upload'                 : 'upload',
	'fa-user'                   : 'user',
	'fa-users'                  : 'users',
	'fa-vector-square'          : 'frame',
	'fa-wand-magic-sparkles'    : 'wand-sparkles',
	'fa-window-maximize'        : 'panel-right',
	'fa-window-minimize'        : 'panel-bottom',
	'fa-xmark'                  : 'x'
};

/* Tokens that say how to draw, not what to draw. */
const FA_STYLE   = /^(fa|fas|far|fab|fal|fad|fat|fa-solid|fa-regular|fa-brands|fa-light|fa-thin|fa-duotone)$/;
const FA_SPIN    = /^fa-(spin|pulse|spin-pulse)$/;
const FA_FIXED_W = 'fa-fw';

/* Record-keeping for the spec. Anything that falls through to the font is
 * counted, so "the icons are SVG now" is a number a test can read rather than a
 * claim, and a Lucide name that is not in the vendored set is loud instead of
 * silently invisible. */
function note(bucket, value) {
	if(typeof window === 'undefined') return;
	const key = `__TIDE_ICON_${bucket}__`;
	window[key] = window[key] || [];
	if(!window[key].includes(value)) window[key].push(value);
}

/* Split an icon string into { name, extra, spin, fixedWidth }. `name` is the
 * Lucide name if one could be found, otherwise null. */
export function resolveIcon(icon) {
	if(!icon || typeof icon !== 'string') return { name: null, extra: [], spin: false, fixedWidth: false };

	const tokens = icon.trim().split(/\s+/).filter(Boolean);

	// A single token that is already a Lucide name is the common new-code case.
	if(tokens.length === 1 && LUCIDE_ICONS[tokens[0]])
		return { name: tokens[0], extra: [], spin: false, fixedWidth: false };

	let name       = null;
	let spin       = false;
	let fixedWidth = false;
	const extra    = [];

	for (const token of tokens) {
		if(FA_STYLE.test(token)) continue;
		if(FA_SPIN.test(token)) { spin = true; continue; }
		if(token === FA_FIXED_W) { fixedWidth = true; continue; }
		if(!name && FA_TO_LUCIDE[token]) { name = FA_TO_LUCIDE[token]; continue; }
		if(!name && LUCIDE_ICONS[token]) { name = token; continue; }
		// Not a style, not a glyph we know: a caller's own class
		// (`nc-toast__icon`, `tiptap-toolbar__caret`) or an icon we do not map.
		if(!token.startsWith('fa-')) extra.push(token);
	}

	if(name && !LUCIDE_ICONS[name]) {
		// A mapping pointing at an icon that was never vendored. Loud: this is a
		// blank where an icon should be, which is the bug this unit is fixing.
		note('MISSING', name);
		if(typeof console !== 'undefined') console.error(`[Icon] "${name}" is not in client/icons/lucide. Add it to scripts/lucide-icons.txt and re-run the two build scripts.`);
		name = null;
	}

	return { name, extra, spin, fixedWidth };
}

const Icon = ({ icon, className, title, ...rest })=>{
	const { name, extra, spin, fixedWidth } = resolveIcon(icon);

	if(!name) {
		// Brand marks, `fac` masks and theme icons keep the markup they had.
		note('FONT_FALLBACK', (icon || '').trim());
		const cls = [icon, className].filter(Boolean).join(' ');
		return <i className={cls} aria-hidden={title ? undefined : 'true'} title={title} {...rest} />;
	}

	const cls = [
		'tide-icon',
		`tide-icon--${name}`,
		spin && 'tide-icon--spin',
		fixedWidth && 'tide-icon--fw',
		...extra,
		className
	].filter(Boolean).join(' ');

	/* The host <i> stays so that every existing selector keyed on `i` - and
	 * there are a lot of them, all of them setting font-size - still applies.
	 * The svg is 1em square, so it tracks that font-size with no second place
	 * to keep sizes in sync. */
	return <i className={cls} aria-hidden={title ? undefined : 'true'} {...rest}>
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.9'
			strokeLinecap='round'
			strokeLinejoin='round'
			focusable='false'
			role={title ? 'img' : undefined}
			aria-hidden={title ? undefined : 'true'}
		>
			{title && <title>{title}</title>}
			{LUCIDE_ICONS[name].map(([tag, attrs], i)=>React.createElement(tag, { key: i, ...toReactAttrs(attrs) }))}
		</svg>
	</i>;
};

/* The vendored SVGs carry SVG attribute names; React wants its own spelling for
 * the handful that are camelCased. */
const ATTR = {
	'stroke-width'      : 'strokeWidth',
	'stroke-linecap'    : 'strokeLinecap',
	'stroke-linejoin'   : 'strokeLinejoin',
	'fill-rule'         : 'fillRule',
	'clip-rule'         : 'clipRule',
	'stroke-dasharray'  : 'strokeDasharray',
	'stroke-dashoffset' : 'strokeDashoffset'
};
function toReactAttrs(attrs) {
	const out = {};
	for (const [k, v] of Object.entries(attrs)) out[ATTR[k] || k] = v;
	return out;
}

/* The same icon for code that builds DOM by hand rather than returning JSX.
 *
 * ProseMirror decorations are the case that needs it: client/extensions/
 * HeadingFold.js creates the fold chevron on a heading with document.
 * createElement, so it cannot render a component - and it was the last place
 * in the editor still drawing from the icon font.
 *
 * Returns the same <i class='tide-icon …'><svg/></i> that <Icon> renders, or
 * the plain <i class='…'> for anything unmapped, so one set of CSS covers
 * both. */
export function iconElement(icon, className) {
	const { name, extra, spin, fixedWidth } = resolveIcon(icon);
	const host = document.createElement('i');
	host.setAttribute('aria-hidden', 'true');

	if(!name) {
		note('FONT_FALLBACK', (icon || '').trim());
		host.className = [icon, className].filter(Boolean).join(' ');
		return host;
	}

	host.className = [
		'tide-icon',
		`tide-icon--${name}`,
		spin && 'tide-icon--spin',
		fixedWidth && 'tide-icon--fw',
		...extra,
		className
	].filter(Boolean).join(' ');

	const SVG_NS = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(SVG_NS, 'svg');
	for (const [k, v] of Object.entries({
		width             : '1em',
		height            : '1em',
		viewBox           : '0 0 24 24',
		fill              : 'none',
		stroke            : 'currentColor',
		'stroke-width'    : '1.9',
		'stroke-linecap'  : 'round',
		'stroke-linejoin' : 'round',
		focusable         : 'false',
		'aria-hidden'     : 'true'
	})) svg.setAttribute(k, v);

	for (const [tag, attrs] of LUCIDE_ICONS[name]) {
		const node = document.createElementNS(SVG_NS, tag);
		for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
		svg.appendChild(node);
	}
	host.appendChild(svg);
	return host;
}

export { LUCIDE_ICONS, FA_TO_LUCIDE };
export default Icon;
