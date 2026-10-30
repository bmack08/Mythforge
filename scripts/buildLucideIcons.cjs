/*
 * Turns the vendored SVGs in client/icons/lucide/ into
 * client/icons/lucide/icons.generated.js, the registry client/components/Icon.jsx
 * renders from.
 *
 * Why a generated module and not 110 separate SVG imports: the icons are chrome
 * - they must be on screen in the first paint of the nav and both editor
 * toolbars, with no second request that can 404, 403 or come back as text/html
 * the way the icon font did (see UNIT M1 and UNIT M4 in laneM-progress.md).
 * Inline path data in the bundle cannot fail that way.
 *
 * The .svg files are the source of truth and this script needs nothing but the
 * repo, so `node scripts/buildLucideIcons.cjs` is always safe to re-run.
 */
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const DIR     = path.join(ROOT, 'client', 'icons', 'lucide');
const OUT     = path.join(DIR, 'icons.generated.js');
const GEOM    = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];

const files = fs.readdirSync(DIR).filter((f)=>f.endsWith('.svg')).sort();
if(files.length === 0) throw new Error(`no .svg files in ${DIR}`);

const icons = {};
for (const file of files) {
	const name = path.basename(file, '.svg');
	const svg  = fs.readFileSync(path.join(DIR, file), 'utf8');

	const nodes = [];
	const tagRe = new RegExp(`<(${GEOM.join('|')})[ \t\r\n]([^>]*?)/>`, 'g');
	let m;
	while ((m = tagRe.exec(svg))) {
		const attrs = {};
		// Digits belong in the NAME: `x1`, `y2`. Without them the four icons
		// drawn entirely from <line> (sliders-horizontal, hash, italic, frame)
		// came out as nine attribute-less <line> elements - markup present,
		// geometry count correct, bounding box non-zero, one pixel of ink.
		// Exactly the shape of bug this whole unit exists to remove.
		const attrRe = /([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g;
		let a;
		while ((a = attrRe.exec(m[2]))) attrs[a[1]] = a[2];
		nodes.push([m[1], attrs]);
	}
	if(nodes.length === 0) throw new Error(`${file} has no drawable geometry`);
	icons[name] = nodes;
}

const body = Object.keys(icons).sort().map((name)=>`\t'${name}' : ${JSON.stringify(icons[name])}`).join(',\n');

const out = `/* GENERATED FILE - do not edit by hand.
 *
 * Produced by scripts/buildLucideIcons.cjs from the vendored Lucide SVGs in
 * this directory (lucide-react 0.487.0, ISC - see ./LICENSE). ${files.length} icons.
 *
 * Shape: { '<icon-name>': [ [tagName, attributes], ... ] }. The shared svg
 * attributes (viewBox, stroke, linecaps) live in client/components/Icon.jsx.
 */
const LUCIDE_ICONS = {
${body}
};

export default LUCIDE_ICONS;
`;

fs.writeFileSync(OUT, out);
const onlyPaths = Object.values(icons).filter((n)=>n.every(([t])=>t === 'path')).length;
console.log(`wrote ${path.relative(ROOT, OUT)}: ${files.length} icons, ${onlyPaths} drawn only from <path>, ${files.length - onlyPaths} using circle/rect/line too`);
