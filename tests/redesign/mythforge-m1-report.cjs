/* Not a spec - a reporter. Prints the contrast node count and the tightest
 * ratio per route at both viewports, so the lane's progress log can quote real
 * numbers instead of "it passed".
 *
 * NODE_PATH=<TaleForge-tidewatch>/node_modules node tests/redesign/mythforge-m1-report.cjs
 */
const PW = 'C:/Users/Neurasthetic/Documents/TaleForge-tidewatch/node_modules/@playwright/test';
const { chromium } = require(PW);
const { measure } = require('./contrast.cjs');

const BASE   = process.env.LANEM_BASE_URL || 'http://localhost:8181';
const PREFIX = process.env.LANEM_BASE_PATH || '/mythforge';

const ROUTES = [
	['home',           '/'],
	['projects',       '/projects'],
	['create-project', '/create-project'],
	['not-found',      '/this-route-does-not-exist']
];
const SIZES = [['1440', 1440, 900], ['390', 390, 844]];

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
			await page.waitForTimeout(500);
			const rows = await measure(page);
			const fails = rows.filter((r)=>!r.pass);
			const tight = rows.reduce((a, r)=>(r.ratio / r.need < a.ratio / a.need ? r : a), rows[0]);
			totalNodes += rows.length;
			totalFails += fails.length;
			console.log(`| ${name} | ${label} | ${rows.length} | ${fails.length} | `
				+ `${tight.ratio.toFixed(2)}:1 vs ${tight.need} (${tight.text.slice(0, 24)}) |`);
		}
		await page.close();
	}
	console.log(`\nTOTAL ${totalNodes} text nodes, ${totalFails} below AA.`);
	await browser.close();
})();
