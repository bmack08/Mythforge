/* tests/redesign/mythforge-m5-report.cjs
 *
 * The numbers UNIT M5 reports in laneM-progress.md, produced by the SAME two
 * measurements the spec gates on - tests/redesign/contrast.cjs measureIcons()
 * and tests/redesign/icon-ink.cjs measureInk() - so the table in the log and
 * the assertion in the suite can never disagree.
 *
 * Run (dev):
 *   NODE_PATH=<TaleForge-tidewatch>/node_modules \
 *     node tests/redesign/mythforge-m5-report.cjs http://localhost:8191 /mythforge
 * Run (production build behind `node server.js`):
 *   ... node tests/redesign/mythforge-m5-report.cjs http://localhost:3115 ""
 */
const { chromium } = require('playwright');
const { measureIcons } = require('./contrast.cjs');
const { measureInkAll } = require('./icon-ink.cjs');

/* Env rather than argv: Git Bash rewrites a bare leading-slash argument into a
 * Windows path, so `/mythforge` arrives as C:/Program Files/Git/mythforge. */
const BASE = process.env.LANEM_BASE_URL || 'http://localhost:8191';
const PATH_PREFIX = process.env.LANEM_BASE_PATH !== undefined ? process.env.LANEM_BASE_PATH : '/mythforge';
const AUTHOR = process.env.LANEM_AUTHOR || 'lanem-tester';
const STICKY = 96;
const CLIP_EXEMPT = 'nav, .tide-mbar, .tiptap-toolbar, .toolBar, .snippetBar';

const VIEWPORTS = [
	{ label: '1440', width: 1440, height: 900 },
	{ label: '390',  width: 390,  height: 844 }
];

(async ()=>{
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

	// Same fixture the spec uses: the first seeded brew. The page has to be on
	// the origin before page.request can resolve a relative URL against it.
	await page.goto(`${BASE}${PATH_PREFIX}/`, { waitUntil: 'domcontentloaded' });
	const res = await page.request.get(`${BASE}${PATH_PREFIX}/api/projects`);
	const body = await res.json();
	const brews = body.projects || body.brews || body;
	const seeded = brews.find((b)=>(b.title || '').startsWith('lanem-')) || brews[0];

	const ROUTES = [
		['home', '/'], ['projects', '/projects'], ['create-project', '/create-project'],
		['preview', '/preview'], ['collaborate', '/collaborate'], ['generator', '/new-campaign'],
		['vault', '/vault'], ['changelog', '/changelog'], ['faq', '/faq'], ['migrate', '/migrate'],
		['settings', '/settings'], ['legacy', '/legacy'], ['user', `/user/${AUTHOR}`],
		['not-found', '/no-such-page-lanem'], ['new', '/new'],
		['editor', `/edit/${seeded.editId}`], ['share', `/share/${seeded.shareId}`]
	];

	const rows = [];
	let totalIcons = 0;
	let totalBelow = 0;
	let faintest = null;

	for (const vp of VIEWPORTS) {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		for (const [name, p] of ROUTES) {
			await page.goto(`${BASE}${PATH_PREFIX}${p}`, { waitUntil: 'networkidle' });
			await page.waitForTimeout(/edit|new$/.test(p) ? 2200 : 700);
			await page.evaluate(()=>document.fonts.ready);

			const con = await measureIcons(page, { clipTop: STICKY, clipExempt: CLIP_EXEMPT });
			/* The same full-page walk the spec gates on, not a single screen. */
			const { rows: ink, unreached, passes } = await measureInkAll(page);
			const drawn = ink.filter((r)=>r.kind !== 'text');
			if(unreached) console.error(`!! ${name} @ ${vp.label}: ${unreached} unreached after ${passes} passes`);
			const tight = con.slice().sort((a, b)=>a.ratio - b.ratio)[0];
			const faint = drawn.slice().sort((a, b)=>a.share - b.share)[0];
			const below = con.filter((r)=>!r.pass).length;

			const svg  = drawn.filter((r)=>r.kind === 'svg').length;
			const font = drawn.filter((r)=>r.kind === 'font').length;
			const mask = drawn.filter((r)=>r.kind === 'mask').length;

			totalIcons += con.length;
			totalBelow += below;
			if(faint && (!faintest || faint.share < faintest.share)) faintest = { ...faint, route: name, vp: vp.label };

			rows.push(`| ${name} | ${vp.label} | ${svg} | ${font} | ${mask} | ${con.length} | ${below} | `
				+ `${tight ? `${tight.ratio.toFixed(2)}:1 (${tight.text})` : '-'} | `
				+ `${faint ? `${faint.ink}px / ${(faint.share * 100).toFixed(1)}% (${faint.name})` : '-'} |`);
		}
	}

	console.log('| route | vp | svg | font | mask | measured | below 3:1 | tightest | faintest ink |');
	console.log('|---|---|---|---|---|---|---|---|---|');
	for (const r of rows) console.log(r);
	console.log(`\n${totalIcons} icons measured for contrast, ${totalBelow} below 3:1.`);
	if(faintest) console.log(`Faintest ink anywhere: ${faintest.name} on ${faintest.route} @ ${faintest.vp} - ${faintest.ink}px, ${(faintest.share * 100).toFixed(1)}% of its box.`);

	await browser.close();
})();
