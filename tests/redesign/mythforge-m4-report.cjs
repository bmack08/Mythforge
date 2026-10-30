/* Not a spec - a reporter. Prints the contrast node count and the tightest
 * ratio per route at both viewports, using the SAME two-pass measurement the
 * M4 spec gates on, so the lane's progress log can quote real numbers instead
 * of "it passed".
 *
 * Two passes, top and bottom: the changelog article is 56,000 characters and
 * one screenshot of the first viewport would leave almost all of it
 * unmeasured.
 *
 * LANEM_BASE_URL=http://localhost:8188 \
 *   NODE_PATH=<TaleForge-tidewatch>/node_modules \
 *   node tests/redesign/mythforge-m4-report.cjs
 */
const PW = 'C:/Users/Neurasthetic/Documents/TaleForge-tidewatch/node_modules/@playwright/test';
const { chromium } = require(PW);
const { measure } = require('./contrast.cjs');

const BASE   = process.env.LANEM_BASE_URL || 'http://localhost:8188';
const PREFIX = process.env.LANEM_BASE_PATH || '/mythforge';
const AUTHOR = process.env.LANEM_AUTHOR || 'lanem-tester';
const STICKY = '.tide-mbar, nav';

const ROUTES = [
	['vault, no search',   '/vault'],
	['vault, results',     `/vault?author=${AUTHOR}`],
	['changelog',          '/changelog'],
	['faq',                '/faq'],
	['migrate',            '/migrate'],
	['settings',           '/settings'],
	['import (/legacy)',   '/legacy'],
	['user page',          `/user/${AUTHOR}`],
	['user page, empty',   '/user/lanem-nobody-at-all']
];
const SIZES = [['1440', 1440, 900], ['390', 390, 844]];

const measureAll = async (page)=>{
	const rows = new Map();
	for (const where of ['top', 'bottom']) {
		await page.evaluate((w)=>{
			const el = document.querySelector('.tide-page');
			const y = w === 'top' ? 0 : (el ? el.scrollHeight : document.body.scrollHeight);
			if(el) el.scrollTop = y;
			window.scrollTo(0, y);
		}, where);
		await page.waitForTimeout(300);
		const clipTop = where === 'top' ? 0 : await page.evaluate(()=>{
			const bar = document.querySelector('.tide-mbar');
			return bar ? Math.ceil(bar.getBoundingClientRect().bottom) : 0;
		});
		const opts = where === 'top' ? {} : { clipTop, clipExempt: STICKY };
		for (const r of await measure(page, opts)) {
			const key = `${r.where}|${r.text}|${r.color}|${r.fontSize}`;
			const seen = rows.get(key);
			if(!seen || r.ratio < seen.ratio) rows.set(key, r);
		}
	}
	return [...rows.values()];
};

(async ()=>{
	const browser = await chromium.launch();
	let totalNodes = 0;
	let totalFails = 0;
	console.log('| route | viewport | text nodes | below AA | tightest ratio |');
	console.log('|---|---|---|---|---|');
	for (const [label, w, h] of SIZES) {
		const page = await browser.newPage({ viewport: { width: w, height: h } });
		for (const [name, path] of ROUTES) {
			await page.goto(`${BASE}${PREFIX}${path}`, { waitUntil: 'networkidle' });
			await page.evaluate(()=>document.fonts.ready);
			await page.waitForTimeout(700);
			const rows = await measureAll(page);
			const fails = rows.filter((r)=>!r.pass);
			const tight = rows.reduce((a, r)=>(r.ratio / r.need < a.ratio / a.need ? r : a), rows[0]);
			totalNodes += rows.length;
			totalFails += fails.length;
			console.log(`| ${name} | ${label} | ${rows.length} | ${fails.length} | `
				+ `${tight.ratio.toFixed(2)}:1 vs ${tight.need} (${tight.text.slice(0, 28)}) |`);
		}
		await page.close();
	}
	console.log(`\nTOTAL ${totalNodes} text nodes, ${totalFails} below AA.`);
	await browser.close();
})();
