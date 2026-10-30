/*
 * One-shot vendoring step for the Lucide icons used by Mythforge's chrome.
 *
 * Mythforge's node_modules is a junction into another checkout and this lane
 * may not add packages to it, so Lucide is not a dependency: its SVG sources
 * are COPIED INTO THE REPO under client/icons/lucide/ (ISC, licence beside
 * them) and that copy is the only thing the app reads. This script is how that
 * copy was produced, kept so the next person can reproduce or extend it.
 *
 * Usage (needs any checkout that has lucide-react installed):
 *   node scripts/vendorLucideIcons.cjs --from <path-to>/node_modules/lucide-react
 *
 * It reads the names in scripts/lucide-icons.txt and writes one .svg per name.
 * Then run scripts/buildLucideIcons.cjs, which turns the vendored .svg files
 * into client/icons/lucide/icons.generated.js. That second step needs nothing
 * but the repo.
 */
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'client', 'icons', 'lucide');
const LIST    = path.join(ROOT, 'scripts', 'lucide-icons.txt');

const fromArg = process.argv.indexOf('--from');
if(fromArg === -1 || !process.argv[fromArg + 1]) {
	console.error('usage: node scripts/vendorLucideIcons.cjs --from <path>/node_modules/lucide-react');
	process.exit(2);
}
const PKG = path.resolve(process.argv[fromArg + 1]);

const pkgJson = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));
const ICONS   = path.join(PKG, 'dist', 'esm', 'icons');

const names = fs.readFileSync(LIST, 'utf8').split(/\r?\n/)
	.map((l)=>l.trim())
	.filter((l)=>l && !l.startsWith('#'));

// The attribute set every Lucide icon shares, read from the package rather
// than retyped, so a Lucide default change shows up as a diff.
const defaults = fs.readFileSync(path.join(PKG, 'dist', 'esm', 'defaultAttributes.js'), 'utf8');
const defObj   = eval(`(${defaults.slice(defaults.indexOf('{'), defaults.indexOf('};') + 1)})`);  

const KEBAB = { strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin' };
const attrStr = (o)=>Object.entries(o)
	.filter(([k])=>k !== 'key')
	.map(([k, v])=>`${KEBAB[k] || k}="${v}"`).join(' ');

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const name of names) {
	const src = path.join(ICONS, `${name}.js`);
	if(!fs.existsSync(src)) {
		console.error(`MISSING in lucide-react ${pkgJson.version}: ${name}`);
		process.exitCode = 1;
		continue;
	}
	// Some names are aliases: the file is just `export { default } from './x.js'`
	// and the geometry lives in x.js. Follow the chain to the real icon.
	let file = src;
	let text = fs.readFileSync(file, 'utf8');
	let alias;
	let hops = 0;
	while ((alias = /export \{ default \} from '\.\/([^']+)\.js'/.exec(text))) {
		if(++hops > 5) throw new Error(`alias loop at ${name}`);
		file = path.join(ICONS, `${alias[1]}.js`);
		text = fs.readFileSync(file, 'utf8');
	}
	const source = path.basename(file, '.js');
	const start = text.indexOf('const __iconNode = ');
	const end   = text.indexOf('];', start); // no ']' ever occurs inside SVG path data
	if(start === -1 || end === -1) throw new Error(`cannot read __iconNode from ${src}`);
	const node = eval(text.slice(start + 'const __iconNode = '.length, end + 1));  

	const body = node.map(([tag, attrs])=>`  <${tag} ${attrStr(attrs)} />`).join('\n');
	const note = source === name ? `"${name}"` : `"${name}" (alias of "${source}")`;
	const svg  = `<!-- lucide ${note} from lucide-react ${pkgJson.version} - ISC. See LICENSE in this directory. -->\n`
		+ `<svg ${attrStr(defObj)}>\n${body}\n</svg>\n`;
	fs.writeFileSync(path.join(OUT_DIR, `${name}.svg`), svg);
	written++;
}

fs.copyFileSync(path.join(PKG, 'LICENSE'), path.join(OUT_DIR, 'LICENSE'));
console.log(`vendored ${written}/${names.length} icons from lucide-react ${pkgJson.version} into ${path.relative(ROOT, OUT_DIR)}`);
