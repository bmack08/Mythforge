/* tests/redesign/mythforge-m5.spec.cjs
 *
 * Unit M5: ICONS.
 *
 * The owner's report was "many icons in the nav (NEW, NEED HELP, VAULT) and
 * the editor toolbars render as empty boxes". UNIT M1 found and fixed why the
 * icon FONT was not loading; this unit removes the dependence on one. The
 * chrome now draws from a vendored Lucide path set (client/icons/lucide, ISC)
 * rendered inline by client/components/Icon.jsx.
 *
 * WHAT THIS SPEC IS FOR. Every previous icon failure in this app had the same
 * shape: one request came back wrong, nothing threw, and the icon was a blank
 * the size of an icon. A test that asks "is there an element here" passes on
 * every one of them. So this one asks what a reader would ask - IS THERE INK -
 * and it asks it on every route, at both viewports, and on both servers:
 *
 *   * every `.tide-icon` hosts an <svg> with real geometry and a non-zero
 *     bounding box, drawn in the stroke width and colour the chrome asks for;
 *   * every icon that is still a FONT glyph or a CSS mask - brand marks, the
 *     repo's own `fac` masks, brew-content icons from a theme - measures more
 *     than 4px, and its mask URL actually answers with an image;
 *   * `document.fonts` reports no family in `error`, which is the signal that
 *     caught the original bug and three more besides;
 *   * icon ink clears 3:1 against the pixels behind it (WCAG 2.2 1.4.11),
 *     measured from a screenshot rather than from tokens.
 *
 * Run against the Vite dev server with the untracked lane config:
 *   NODE_PATH=<TaleForge-tidewatch>/node_modules \
 *     <TaleForge-tidewatch>/node_modules/.bin/playwright test \
 *     --config playwright.laneM.config.cjs tests/redesign/mythforge-m5.spec.cjs
 *
 * And against the production build, which is the server the owner looks at:
 *   npm run build && PORT=<p> node server.js
 *   LANEM_BASE_URL=http://localhost:<p> LANEM_BASE_PATH= \
 *   LANEM_SHOTS=0 ... playwright test ...
 * (LANEM_BASE_PATH is empty there because `node server.js` mounts at the root;
 *  LANEM_SHOTS=0 keeps the dev run's screenshots as the ones on disk.)
 */

const fs   = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { measureIcons, table } = require('./contrast.cjs');
const { measureInk, measureInkAll, inkTable } = require('./icon-ink.cjs');

const BASE_PATH = process.env.LANEM_BASE_PATH !== undefined ? process.env.LANEM_BASE_PATH : '/mythforge';
const at = (p)=>`${BASE_PATH}${p}`;

const SHOT_DIR  = process.env.LANEM_SHOT_DIR || 'C:/Users/Neurasthetic/Documents/visual-lift-after/mythforge';
const TAKE_SHOTS = process.env.LANEM_SHOTS !== '0';

/* The author the lane seeded published brews under (laneM-m4-seed.cjs). */
const AUTHOR = process.env.LANEM_AUTHOR || 'lanem-tester';

/* The height of the sticky chrome, for the contrast pass: a line of anything
 * that has scrolled under an opaque bar is not being read through it. Same
 * number M3 and M4 use. */
const STICKY = 96;

/* ── The routes ─────────────────────────────────────────────────────────
 *
 * Every route in client/homebrew/homebrew-entry.jsx that a reader can reach,
 * plus an unknown one for the 404.
 *
 * `/account` is deliberately absent and it is NOT an icon problem: signed out
 * it throws `Cannot read properties of undefined (reading 'username')` out of
 * accountPage.jsx and React unmounts the whole tree, so there is no chrome on
 * the page to measure. Pre-existing, written up in laneM-progress.md under
 * UNIT M5 - found, not fixed; the account/auth surface is the one UNIT M4
 * left alone on purpose.
 *
 * `minIcons` is a floor, not a count. Without it a page that silently stopped
 * rendering its toolbar would report a clean sweep of the four icons left, and
 * this spec would call that a pass. Each number is below what the narrower
 * viewport actually renders, so normal responsive hiding does not trip it. */
const ROUTES = [
	{ name: 'home',           path: '/',                  minIcons: 7 },
	{ name: 'projects',       path: '/projects',          minIcons: 7 },
	{ name: 'create-project', path: '/create-project',    minIcons: 7 },
	{ name: 'preview',        path: '/preview',           minIcons: 6 },
	{ name: 'collaborate',    path: '/collaborate',       minIcons: 6 },
	{ name: 'generator',      path: '/new-campaign',      minIcons: 6 },
	{ name: 'vault',          path: '/vault',             minIcons: 7 },
	{ name: 'changelog',      path: '/changelog',         minIcons: 6 },
	{ name: 'faq',            path: '/faq',               minIcons: 6 },
	{ name: 'migrate',        path: '/migrate',           minIcons: 6 },
	{ name: 'settings',       path: '/settings',          minIcons: 6 },
	{ name: 'legacy',         path: '/legacy',            minIcons: 6 },
	{ name: 'user',           path: `/user/${AUTHOR}`,    minIcons: 6 },
	{ name: 'not-found',      path: '/no-such-page-lanem', minIcons: 6 },
	{ name: 'new',            path: '/new',               minIcons: 40, editor: true },
	{ name: 'editor',         path: null,                 minIcons: 40, editor: true },
	{ name: 'share',          path: null,                 minIcons: 8 }
];

const VIEWPORTS = [
	{ label: '1440', width: 1440, height: 900 },
	{ label: '390',  width: 390,  height: 844 }
];

/* ── Fixtures ───────────────────────────────────────────────────────────── */

let IDS = null;
async function brewIds(page) {
	if(IDS) return IDS;
	const res = await page.request.get(at('/api/projects'));
	expect(res.ok(), `GET ${at('/api/projects')} -> ${res.status()}`).toBeTruthy();
	const body = await res.json();
	const brews = body.projects || body.brews || body;
	const seeded = brews.find((b)=>(b.title || '').startsWith('lanem-')) || brews[0];
	expect(seeded, 'a seeded brew to open the editor on').toBeTruthy();
	IDS = { editId: seeded.editId, shareId: seeded.shareId };
	expect(IDS.editId, 'that brew has an edit id').toBeTruthy();
	expect(IDS.shareId, 'that brew has a share id').toBeTruthy();
	return IDS;
}

async function resolvePath(page, route) {
	if(route.path) return route.path;
	const ids = await brewIds(page);
	if(route.name === 'editor') return `/edit/${ids.editId}`;
	if(route.name === 'share')  return `/share/${ids.shareId}`;
	throw new Error(`no path for route ${route.name}`);
}

async function goto(page, route) {
	const p = await resolvePath(page, route);
	await page.goto(at(p), { waitUntil: 'networkidle' });
	// The editor mounts TipTap, the theme bundle and the preview iframe after
	// first paint; the rest settle immediately.
	await page.waitForTimeout(route.editor ? 2200 : 700);
	await page.evaluate(()=>document.fonts.ready);
	return p;
}

/* ── The audit, run in the page ──────────────────────────────────────────
 *
 * One pass collects everything, so a route is walked once and each assertion
 * below reads from the same snapshot rather than re-querying a page that may
 * have moved on. */
const AUDIT = ()=>{
	const GEOM = 'path, circle, rect, line, polyline, polygon, ellipse';

	const visible = (el, cs, r)=>cs.display !== 'none'
		&& cs.visibility !== 'hidden'
		&& Number(cs.opacity) !== 0
		&& r.width > 0 && r.height > 0;

	const describe = (el)=>{
		const parts = [];
		let node = el;
		for (let i = 0; node && i < 3; i += 1) {
			parts.unshift(node.tagName.toLowerCase() + (node.id ? `[${node.id}]` : ''));
			node = node.parentElement;
		}
		return parts.join('>');
	};

	const svg = [];
	const font = [];
	const masks = new Set();

	/* Everything that is, or claims to be, an icon: the converted hosts, the
	 * icon-font classes, the repo's own `fac` masks, and any bare <i>. */
	const nodes = new Set(document.querySelectorAll(
		'i, .tide-icon, .fa, .fas, .far, .fab, .fac, [class*="fa-"], [class*="tide-icon--"]'
	));

	for (const el of nodes) {
		if(el.tagName === 'svg' || el.closest('svg')) continue;
		const cs = getComputedStyle(el);
		const r  = el.getBoundingClientRect();
		const inner = el.querySelector('svg');
		const where = describe(el);
		const cls   = (el.className || '').toString().trim();

		if(inner) {
			const sr = inner.getBoundingClientRect();
			let bbox = { width: 0, height: 0 };
			try { bbox = inner.getBBox(); } catch (e) { /* detached */ }
			svg.push({
				where,
				cls,
				name       : (cls.match(/tide-icon--([a-z0-9-]+)/) || [])[1] || '?',
				visible    : visible(el, cs, r),
				hostW      : r.width,
				hostH      : r.height,
				svgW       : sr.width,
				svgH       : sr.height,
				bboxW      : bbox.width,
				bboxH      : bbox.height,
				geometry   : inner.querySelectorAll(GEOM).length,
				stroke     : getComputedStyle(inner).stroke,
				strokeWidth: Number(getComputedStyle(inner).strokeWidth.replace('px', '')),
				hostColor  : cs.color,
				fill       : getComputedStyle(inner).fill
			});
			continue;
		}

		// No svg: a font glyph, a CSS mask, or a deliberate text host.
		const mask = cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage
			: (cs.webkitMaskImage && cs.webkitMaskImage !== 'none' ? cs.webkitMaskImage : null);
		if(mask) for (const m of mask.matchAll(/url\("?([^")]+)"?\)/g)) masks.add(m[1]);

		font.push({
			where,
			cls,
			visible : visible(el, cs, r),
			text    : (el.textContent || '').trim(),
			w       : r.width,
			h       : r.height,
			kind    : mask ? 'mask' : ((el.textContent || '').trim() ? 'text' : 'font')
		});
	}

	const fonts = [...document.fonts].map((f)=>({ family: f.family, status: f.status }));

	return {
		svg,
		font,
		masks   : [...masks],
		fonts,
		missing : window.__TIDE_ICON_MISSING__ || [],
		fallback: window.__TIDE_ICON_FONT_FALLBACK__ || []
	};
};

const fmt = (rows, n = 8)=>rows.slice(0, n).map((r)=>`  ${r.cls || r.name} @ ${r.where}`).join('\n');

/* ───────────────────────────────────────────────────────────────────────
 * The icons themselves, every route, both viewports.
 * ─────────────────────────────────────────────────────────────────────── */
for (const vp of VIEWPORTS) {
	test.describe(`icons @ ${vp.label}`, ()=>{
		test.use({ viewport: { width: vp.width, height: vp.height } });

		for (const route of ROUTES) {
			test(`${route.name} renders every icon as drawn inline SVG`, async ({ page })=>{
				await goto(page, route);

				if(TAKE_SHOTS) {
					fs.mkdirSync(SHOT_DIR, { recursive: true });
					await page.screenshot({
						path     : path.join(SHOT_DIR, `${route.name}-icons-${vp.label}.png`),
						fullPage : false
					});
				}

				const a = await page.evaluate(AUDIT);

				/* 1. A mapping pointing at an icon nobody vendored is a blank
				 * where an icon should be - the exact bug this unit removes -
				 * and client/components/Icon.jsx records it rather than
				 * shrugging. */
				expect(a.missing, `Icon names with no vendored SVG: ${a.missing.join(', ')}`).toEqual([]);

				/* 2. The chrome is actually converted. */
				const shown = a.svg.filter((s)=>s.visible);
				expect(shown.length,
					`${route.name} rendered ${shown.length} inline-SVG icons, expected at least ${route.minIcons}`)
					.toBeGreaterThanOrEqual(route.minIcons);

				/* 3. The markup is there. Necessary, nowhere near sufficient -
				 * see the ink pass below, which is what caught a set of nine
				 * <line> elements rendered with no coordinates. */
				const empty = shown.filter((s)=>s.geometry === 0);
				expect(empty, `icons with no drawable geometry:\n${fmt(empty)}`).toEqual([]);

				const tiny = shown.filter((s)=>s.svgW <= 4 || s.svgH <= 4);
				expect(tiny, `inline-SVG icons measuring 4px or less:\n${fmt(tiny)}`).toEqual([]);

				/* 4. Anything still drawn by a font or a mask has to measure
				 * too. Brand marks and the brew-content icons a theme asks for
				 * are allowed to stay Font Awesome - they are not allowed to
				 * be boxes. */
				const glyphs = a.font.filter((f)=>f.visible && f.kind !== 'text');
				const boxes  = glyphs.filter((f)=>f.w <= 4 || f.h <= 4);
				expect(boxes, `font/mask icons measuring 4px or less:\n${fmt(boxes)}`).toEqual([]);

				/* 5. NO TOFU - the question the owner actually asked. Two
				 * screenshots, one with every icon hidden by `visibility`, and
				 * a pixel diff over each icon's own rect: whatever is left IS
				 * the ink that icon contributed. See tests/redesign/icon-ink.cjs
				 * for why getBBox and child counts are not enough (both pass on
				 * a completely blank icon, and did).
				 *
				 * The floor is a SHARE of the icon's own box, not a fixed
				 * pixel count, because the chrome runs from 9px outline
				 * chevrons to 19px toolbar marks. Measured on this app: a
				 * drawn icon covers 6% to 62% of its box, and the one icon
				 * that was genuinely blank covered 0.5%. 3% with a floor of
				 * four pixels sits well clear of both ends. */
				const { rows: ink, unreached } = await measureInkAll(page);
				expect(ink.length, `${route.name} had icons to measure for ink`).toBeGreaterThan(0);

				/* measureInkAll WALKS the page rather than measuring the first
				 * screen. /changelog is about 40,000px long and its inline
				 * `{{fas,…}}` icons are all in the first fifth, so even a
				 * top-and-bottom pair of screenshots misses every one of them -
				 * 53 icons on that route, 35 of them still font glyphs, and a
				 * single-screen pass found 6. If the walk cannot reach
				 * something that is visible, that is reported rather than
				 * folded into a clean sweep of whatever it did reach. */
				expect(unreached, 'visible icons the walk never brought on screen').toBe(0);

				const blank = ink.filter((r)=>r.kind !== 'text' && (r.share < 0.03 || r.ink < 4));
				expect(blank, `icons with no ink (tofu):\n${inkTable(blank)}`).toEqual([]);

				/* 6. document.fonts. The signal that caught the original bug,
				 * and three more: the rune icon fonts and the paper fonts were
				 * all failing, and nothing on screen said so. */
				const bad = a.fonts.filter((f)=>f.status === 'error').map((f)=>f.family);
				expect([...new Set(bad)], `font families in error: ${[...new Set(bad)].join(', ')}`).toEqual([]);
			});
		}
	});
}

/* ───────────────────────────────────────────────────────────────────────
 * House style. The brief asks for a 1.75-2px stroke, currentColor, and icons
 * sized to the chrome - all three measured from the rendered page, not read
 * back off the component.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('house style', ()=>{
	test('every icon is stroked 1.75-2, in currentColor, and 1em square', async ({ page })=>{
		await goto(page, ROUTES.find((r)=>r.name === 'editor'));
		const a = await page.evaluate(AUDIT);
		const shown = a.svg.filter((s)=>s.visible);
		expect(shown.length).toBeGreaterThan(40);

		const offStroke = shown.filter((s)=>!(s.strokeWidth >= 1.75 && s.strokeWidth <= 2))
			.map((s)=>`${s.name} stroke-width ${s.strokeWidth}`);
		expect(offStroke, `outside the 1.75-2 stroke range:\n  ${offStroke.join('\n  ')}`).toEqual([]);

		/* `stroke: currentColor` resolves in the computed style to the host's
		 * own colour, so the two being equal IS the proof that the icon takes
		 * its colour from the text beside it rather than hardcoding one. */
		const offColor = shown.filter((s)=>s.stroke !== s.hostColor)
			.map((s)=>`${s.name} stroke ${s.stroke} vs color ${s.hostColor}`);
		expect(offColor, `not drawn in currentColor:\n  ${offColor.join('\n  ')}`).toEqual([]);

		const filled = shown.filter((s)=>s.fill !== 'none').map((s)=>`${s.name} fill ${s.fill}`);
		expect(filled, `stroked icons that are filled:\n  ${filled.join('\n  ')}`).toEqual([]);

		/* Square, and the size of a chrome icon rather than a hero graphic. */
		const odd = shown.filter((s)=>Math.abs(s.svgW - s.svgH) > 0.6 || s.svgW < 8 || s.svgW > 40)
			.map((s)=>`${s.name} ${s.svgW}x${s.svgH}`);
		expect(odd, `icons not square between 8 and 40px:\n  ${odd.join('\n  ')}`).toEqual([]);
	});

	/* The app renders from client/icons/lucide/icons.generated.js, but the
	 * .svg files beside it are the vendored source of truth and the ones the
	 * ISC notice covers. If the two drift, the icon in the bundle stops being
	 * the icon in the repo - so this reads both off disk and compares the
	 * geometry node by node. No browser involved; it is a repo invariant. */
	test('the generated registry still matches the vendored SVGs', ()=>{
		const dir = path.resolve(__dirname, '../../client/icons/lucide');
		expect(fs.existsSync(path.join(dir, 'LICENSE')),
			'the ISC licence sits beside the files it covers').toBeTruthy();

		const src = fs.readFileSync(path.join(dir, 'icons.generated.js'), 'utf8');
		const body = src.split('const LUCIDE_ICONS = {')[1].split('\n};')[0];
		const registry = JSON.parse(`{${body.replace(/'/g, '"')}}`);

		const files = fs.readdirSync(dir).filter((f)=>f.endsWith('.svg'));
		expect(files.length, 'vendored .svg files').toBeGreaterThan(100);
		expect(Object.keys(registry).sort(), 'registry names match the .svg files')
			.toEqual(files.map((f)=>path.basename(f, '.svg')).sort());

		const GEOM = /<(path|circle|rect|line|polyline|polygon|ellipse)\s([^>]*?)\/>/g;
		const drift = [];
		for (const file of files) {
			const name = path.basename(file, '.svg');
			const svg  = fs.readFileSync(path.join(dir, file), 'utf8');
			const nodes = [...svg.matchAll(GEOM)];
			if(nodes.length !== registry[name].length) {
				drift.push(`${name}: ${nodes.length} nodes in the svg, ${registry[name].length} in the registry`);
				continue;
			}
			nodes.forEach(([, tag, attrs], i)=>{
				const [regTag, regAttrs] = registry[name][i];
				if(tag !== regTag) drift.push(`${name}[${i}]: <${tag}> vs <${regTag}>`);
				for (const [, k, v] of attrs.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g)) {
					if(regAttrs[k] !== v) drift.push(`${name}[${i}] ${k}: "${v}" vs "${regAttrs[k]}"`);
				}
			});
		}
		expect(drift, `run \`node scripts/buildLucideIcons.cjs\`:\n  ${drift.join('\n  ')}`).toEqual([]);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * The editor toolbars. The owner named them, and most of them live inside
 * dropdowns that are closed on arrival - so a sweep of the visible page would
 * have measured the four triggers and declared victory.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('editor toolbars', ()=>{
	const GROUPS = ['Structure', 'Images', 'D&D Blocks', 'More'];

	test('every insert action in every toolbar dropdown has a drawn icon', async ({ page })=>{
		await goto(page, ROUTES.find((r)=>r.name === 'editor'));

		let checked = 0;
		for (const label of GROUPS) {
			const trigger = page.locator('.tiptap-toolbar__dropdown-trigger', { hasText: label }).first();
			await expect(trigger, `the ${label} dropdown trigger`).toBeVisible();
			await trigger.click();

			const menu = page.locator('.tiptap-toolbar__dropdown.is-open .tiptap-toolbar__dropdown-menu').first();
			await expect(menu, `the ${label} menu opens`).toBeVisible();

			const items = await menu.locator('.tiptap-toolbar__dropdown-item').count();
			expect(items, `${label} has items`).toBeGreaterThan(0);

			/* Markup first - every item has an inline svg with geometry, and
			 * every geometry node carries coordinates. That last clause is
			 * there because nine `<line>` elements with no x1/y1 at all passed
			 * a geometry count, a non-zero rect and a non-zero bounding box,
			 * and drew nothing. */
			const bad = await menu.evaluate((root)=>{
				const GEOM = 'path, circle, rect, line, polyline, polygon, ellipse';
				const out = [];
				for (const item of root.querySelectorAll('.tiptap-toolbar__dropdown-item')) {
					const name = (item.textContent || '').trim();
					const svg = item.querySelector('i svg');
					if(!svg) { out.push(`${name}: no inline svg`); continue; }
					const nodes = svg.querySelectorAll(GEOM);
					if(nodes.length === 0) { out.push(`${name}: svg has no geometry`); continue; }
					for (const n of nodes) {
						if(n.getAttributeNames().length === 0) out.push(`${name}: <${n.tagName}> has no attributes`);
					}
					const r = svg.getBoundingClientRect();
					if(r.width <= 4 || r.height <= 4) out.push(`${name}: ${r.width}x${r.height}`);
				}
				return out;
			});
			expect(bad, `${label} menu:\n  ${bad.join('\n  ')}`).toEqual([]);

			/* Then ink, with the menu open, which is the only state in which
			 * these icons are on screen at all. */
			const blank = (await measureInk(page))
				.filter((r)=>r.kind !== 'text' && (r.share < 0.03 || r.ink < 4));
			expect(blank, `${label} menu open, icons with no ink:\n${inkTable(blank)}`).toEqual([]);
			checked += items;

			await trigger.click();   // close it again
		}
		expect(checked, 'insert actions checked across the four dropdowns').toBeGreaterThan(30);
	});

	test('the mode row and the preview toolbar are drawn, mask icons included', async ({ page })=>{
		await goto(page, ROUTES.find((r)=>r.name === 'editor'));

		/* The preview toolbar's zoom and spread controls are the repo's OWN
		 * icons, masked in from client/icons/*.svg by customIcons.less. They
		 * are not an icon font and are left alone - but a mask whose url()
		 * 404s is a box with a size, which is how /icons/*.svg failed in UNIT
		 * M4, so the URL is fetched rather than assumed. */
		const a = await page.evaluate(AUDIT);
		expect(a.masks.length, 'mask-image icons found in the editor').toBeGreaterThan(4);

		for (const url of a.masks) {
			const res = await page.request.get(url);
			expect(res.status(), `${url} -> ${res.status()}`).toBe(200);
			expect(res.headers()['content-type'], `${url} content-type`).toMatch(/image\//);
		}

		/* The editor's own mode and action controls, by name. These are the
		 * ones in the owner's screenshot. */
		for (const name of ['wand-sparkles', 'share-2', 'file-down', 'bold', 'italic', 'list', 'list-ordered']) {
			const icon = page.locator(`i.tide-icon--${name} svg`).first();
			await expect(icon, `the ${name} icon is on the page`).toHaveCount(1);
		}
	});

	if(TAKE_SHOTS) {
		test('toolbar close-up', async ({ page })=>{
			await goto(page, ROUTES.find((r)=>r.name === 'editor'));
			fs.mkdirSync(SHOT_DIR, { recursive: true });
			const bar = page.locator('.tiptap-toolbar').first();
			await expect(bar).toBeVisible();
			await bar.screenshot({ path: path.join(SHOT_DIR, 'editor-toolbar-icons-1440.png') });
		});
	}
});

/* ───────────────────────────────────────────────────────────────────────
 * Non-text contrast, WCAG 2.2 1.4.11. An icon is a graphic that carries
 * meaning, so 3:1 against what is behind it - measured from a screenshot,
 * because half this chrome sits on art behind a scrim.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('icon contrast', ()=>{
	for (const vp of VIEWPORTS) {
		for (const route of ROUTES) {
			test(`${route.name} @ ${vp.label}: every icon clears 3:1`, async ({ page })=>{
				await page.setViewportSize({ width: vp.width, height: vp.height });
				await goto(page, route);

				const rows = await measureIcons(page, { clipTop: STICKY, clipExempt: 'nav, .tide-mbar, .tiptap-toolbar, .toolBar, .snippetBar' });
				expect(rows.length, `${route.name} had icons to measure`).toBeGreaterThan(0);

				const fail = rows.filter((r)=>!r.pass);
				expect(fail, `below 3:1 on ${route.name} @ ${vp.label}:\n${table(fail)}`).toEqual([]);
			});
		}
	}
});

/* ───────────────────────────────────────────────────────────────────────
 * Occlusion.
 *
 * The ink and contrast passes skip an icon that another element is painted
 * over, because neither measurement means anything there. That skip would be
 * a place to hide a defect, so it gets its own assertion: nothing in the two
 * bars this unit is about may be covered.
 *
 * This is not hypothetical. At 390 the editor's global nav wraps to three
 * rows, and because both bars are flex ITEMS of the editor column they were
 * being shrunk below their content - the Mythforge bar painted straight over
 * the save state and the account menu. The icon sweep found it by failing to
 * find any ink.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('occlusion', ()=>{
	for (const vp of VIEWPORTS) {
		for (const route of ROUTES) {
			test(`${route.name} @ ${vp.label}: nothing is painted over the chrome`, async ({ page })=>{
				await page.setViewportSize({ width: vp.width, height: vp.height });
				await goto(page, route);

				const covered = await page.evaluate(()=>{
					const out = [];
					for (const el of document.querySelectorAll('nav i.tide-icon, .tide-mbar i.tide-icon')) {
						const cs = getComputedStyle(el);
						if(cs.display === 'none' || cs.visibility === 'hidden') continue;
						/* An open dialog is SUPPOSED to cover the page. The
						 * chrome behind the template picker is aria-hidden and
						 * inert precisely so nobody can reach it. */
						if(el.closest('[aria-hidden="true"]:not(i):not(svg), [inert]')) continue;
						const r = el.getBoundingClientRect();
						const cx = r.x + r.width / 2;
						const cy = r.y + r.height / 2;
						if(r.width < 1 || cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) continue;
						const top = document.elementFromPoint(cx, cy);
						if(top && (top === el || el.contains(top) || top.contains(el))) continue;
						out.push(`${(el.className.match(/tide-icon--([a-z0-9-]+)/) || [])[1]} at ${Math.round(cx)},${Math.round(cy)} is under ${top ? top.tagName.toLowerCase() + '.' + (top.className || '').toString().trim() : 'nothing'}`);
					}
					return out;
				});
				expect(covered, `chrome icons painted over:\n  ${covered.join('\n  ')}`).toEqual([]);
			});
		}
	}
});

/* ───────────────────────────────────────────────────────────────────────
 * Dead controls. Swapping a font glyph for an svg is also the moment an
 * icon-only button can lose the only thing that named it, so the sweep is
 * part of this unit rather than a separate pass.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('dead controls', ()=>{
	for (const route of ROUTES) {
		test(`${route.name}: every icon-only control still has a name`, async ({ page })=>{
			await goto(page, route);

			const nameless = await page.evaluate(()=>{
				const out = [];
				for (const el of document.querySelectorAll('button, a, [role="button"], [role="radio"]')) {
					const cs = getComputedStyle(el);
					const r  = el.getBoundingClientRect();
					if(cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) continue;
					if(!el.querySelector('i, svg')) continue;
					const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
					if(text) continue;                                   // has a visible label
					const named = el.getAttribute('aria-label') || el.getAttribute('title')
						|| el.getAttribute('aria-labelledby')
						|| el.querySelector('svg > title');
					if(!named) out.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().trim()}`);
				}
				return out;
			});
			expect(nameless, `icon-only controls with no accessible name:\n  ${nameless.join('\n  ')}`).toEqual([]);

			/* And the sweep M1 introduced: no link without a destination. */
			const hrefless = await page.locator('a:not([href])').count();
			expect(hrefless, 'links with no href').toBe(0);
		});
	}
});
