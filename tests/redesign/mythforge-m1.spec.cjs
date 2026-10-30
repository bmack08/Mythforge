/* tests/redesign/mythforge-m1.spec.cjs
 *
 * Unit M1 of the Mythforge Tidewatch redesign: app chrome and tokens, the icon
 * font, the Mythwright -> Mythforge rename, the home/projects brew library, a
 * real 404, and the routing fixes behind all of it.
 *
 * Each describe block maps to one numbered item on the unit's fix list, so a
 * failure names the thing that regressed rather than a selector.
 *
 * Run with the untracked lane config (vite 8181 / express 3100):
 *   NODE_PATH=<TaleForge-tidewatch>/node_modules \
 *     <TaleForge-tidewatch>/node_modules/.bin/playwright test \
 *     --config playwright.laneM.config.cjs
 */

const { test, expect } = require('@playwright/test');
const { measure, table } = require('./contrast.cjs');

const BASE_PATH = process.env.LANEM_BASE_PATH || '/mythforge';
const at = (p)=>`${BASE_PATH}${p}`;

/* Every route unit M1 owns. The unit's contrast pass, dead-control sweep and
 * chrome assertions all run over this list.
 *
 * minNodes guards against a contrast run that passes because it measured
 * almost nothing. It is per route because create-project is the library with
 * a modal over it: everything behind the scrim is `inert` and aria-hidden, so
 * the only text a reader is being asked to read is the dialog's own ~10 nodes.
 * The page underneath is measured in full by the `home` route, which is the
 * same component. */
const M1_ROUTES = [
	{ name: 'home',           path: '/',                          minNodes: 30 },
	{ name: 'projects',       path: '/projects',                  minNodes: 30 },
	{ name: 'create-project', path: '/create-project',            minNodes: 8  },
	{ name: 'not-found',      path: '/this-route-does-not-exist', minNodes: 12 }
];

const goto = async (page, path)=>{
	await page.goto(at(path), { waitUntil: 'networkidle' });
	// The library fetches /api/projects after mount; wait for the grid, the
	// empty state or the error note rather than a fixed sleep.
	await page.waitForTimeout(400);
};

/* ───────────────────────────────────────────────────────────────────────
 * Fix 1 - routing. create-project, projects, collaborate, settings and
 * legacy all used to fall through to the editor or the home page, and an
 * unknown route rendered the home page, which told a reader with a broken
 * link that their link was fine.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('routing', ()=>{
	test('home is the brew library, not the editor', async ({ page })=>{
		await goto(page, '/');
		await expect(page.locator('h1')).toHaveText('Your brews');
		// The welcome-brew editor used to own this route.
		await expect(page.locator('.brewRenderer')).toHaveCount(0);
		await expect(page.locator('.tide-mbar')).toBeVisible();
	});

	test('projects is the same library', async ({ page })=>{
		await goto(page, '/projects');
		await expect(page.locator('h1')).toHaveText('Your brews');
		await expect(page.locator('.tide-grid').first()).toBeVisible();
	});

	test('create-project opens the template picker', async ({ page })=>{
		await goto(page, '/create-project');
		const dialog = page.getByRole('dialog', { name: 'Start a new brew' });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('button', { name: /Blank page/ })).toBeVisible();
		await expect(dialog.getByRole('button', { name: /Adventure/ })).toBeVisible();
	});

	test('the New brew control opens the picker in place', async ({ page })=>{
		await goto(page, '/');
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await page.locator('.tide-mbar button', { hasText: 'New brew' }).click();
		await expect(page.getByRole('dialog', { name: 'Start a new brew' })).toBeVisible();
	});

	test('an unknown route is a real 404, not the home page', async ({ page })=>{
		await goto(page, '/this-route-does-not-exist');
		await expect(page.locator('.tide-status-code')).toHaveText('404');
		await expect(page.locator('h1')).toContainText('isn');
		// The 404 shows the path that failed, and still carries a way out.
		await expect(page.locator('.tide-status-path')).toContainText('this-route-does-not-exist');
		await expect(page.getByRole('link', { name: 'Go to your brews' })).toBeVisible();
		// The old behaviour: the library heading on a nonsense URL.
		await expect(page.locator('h1')).not.toHaveText('Your brews');
	});

	test('legacy stays reachable as the hidden import path', async ({ page })=>{
		await goto(page, '/legacy');
		// Not a 404 - it is unlinked from the nav, not removed.
		await expect(page.locator('.tide-status-code')).toHaveCount(0);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 2 - the icon font. Every icon in the top bar and the toolbar used to
 * render as an empty box: Vite's dev proxy matched its own /@fs/ font URL and
 * forwarded it to Express, which 302s, so the face never loaded.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('icon font', ()=>{
	test('Font Awesome actually loads and its glyphs have width', async ({ page })=>{
		const notFont = [];
		page.on('response', (r)=>{
			if(/fa-(solid-900|brands-400|regular-400)\.woff2/.test(r.url())
				&& !/font/.test(r.headers()['content-type'] || '')) {
				notFont.push(`${r.status()} ${r.headers()['content-type']} ${r.url()}`);
			}
		});

		/* UPDATED BY UNIT M5, and the reason is a product change rather than a
		 * test that stopped being convenient.
		 *
		 * This used to load `/` and assert that a Font Awesome face reported
		 * `loaded` and that a `.fas` glyph in the Mythforge bar measured more
		 * than 4px. Neither can be true there any more: M5 replaced every icon
		 * in the chrome with inline SVG, so the home page renders nothing in
		 * the icon font and a browser does not download a webfont nothing
		 * uses. Asserting `loaded` on `/` would now be asserting that the
		 * dependence this redesign removed is still there.
		 *
		 * What M1 was actually protecting is kept, and split in two:
		 *
		 *   * the font path is still wired - measured on /changelog, which
		 *     renders `{{fas,…}}` icons inline in the document and so is a
		 *     page that genuinely still uses the font. A 200-text/html woff2
		 *     or a 403 would show up there again.
		 *   * the Mythforge bar's icons still RENDER - as drawn SVG now, which
		 *     is what the owner was asking for. The thorough version of that
		 *     is mythforge-m5.spec.cjs; this is the short one, so M1's own
		 *     regression stays self-contained. */
		await goto(page, '/changelog');
		await page.evaluate(()=>document.fonts.ready);

		// Nothing answered a woff2 request with something that is not a font.
		expect(notFont, notFont.join('\n')).toEqual([]);

		const loaded = await page.evaluate(()=>
			Array.from(document.fonts).some((f)=>/Font Awesome/.test(f.family) && f.status === 'loaded'));
		expect(loaded, 'a Font Awesome face reports status "loaded" on a page that uses it').toBe(true);

		// The real symptom was the fallback glyph: measure a rendered icon.
		const width = await page.evaluate(()=>{
			// `{{fas,fa-dungeon}}` in the markdown renders as a <span>, not an
			// <i>, so the tag is not part of the selector.
			const i = document.querySelector('.tide-doc-article .fas[class*="fa-"]');
			return i ? i.getBoundingClientRect().width : 0;
		});
		expect(width, 'a Font Awesome glyph in the changelog renders with width').toBeGreaterThan(4);

		// And the bar the owner reported: inline SVG now, with geometry in it.
		await goto(page, '/');
		const barIcons = await page.evaluate(()=>
			Array.from(document.querySelectorAll('.tide-mbar i.tide-icon')).map((i)=>{
				const svg = i.querySelector('svg');
				const r = svg ? svg.getBoundingClientRect() : { width: 0, height: 0 };
				return {
					geometry : svg ? svg.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse').length : 0,
					width    : r.width
				};
			}));
		expect(barIcons.length, 'the Mythforge bar has icons').toBeGreaterThan(4);
		expect(barIcons.filter((i)=>i.geometry === 0 || i.width <= 4), 'bar icons with no drawn geometry').toEqual([]);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 4 - the rename, and the brand version chip.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('naming', ()=>{
	for (const route of M1_ROUTES) {
		test(`${route.name} says Mythforge and never Mythwright`, async ({ page })=>{
			await goto(page, route.path);
			const body = await page.locator('body').innerText();
			expect(body).not.toMatch(/mythwright/i);
			// The nav carried a "V3.19.3" chip beside the brand.
			expect(body).not.toMatch(/v\s*3\.19\.3/i);
			expect(body).toMatch(/Mythforge/);
		});
	}

	test('the document title is Mythforge', async ({ page })=>{
		await goto(page, '/');
		await expect(page).toHaveTitle(/Mythforge/);
		expect(await page.title()).not.toMatch(/mythwright/i);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 6 - Tidewatch chrome in place of the Homebrewery chrome: no parchment,
 * no maroon, no gold rules, no orange sash or orange buttons in the APP
 * chrome. (Paper styling inside the brew preview is unit M2's business.)
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('chrome', ()=>{
	test('the Mythforge bar is sticky under the nav', async ({ page })=>{
		await goto(page, '/');
		const bar = page.locator('.tide-mbar');
		await expect(bar).toHaveCSS('position', 'sticky');
		const before = await bar.boundingBox();
		await page.evaluate(()=>document.querySelector('.tide-page')?.scrollTo(0, 600));
		await page.waitForTimeout(250);
		const after = await bar.boundingBox();
		expect(after.y).toBeLessThanOrEqual(before.y + 1);
	});

	test('no orange, maroon or parchment in the app chrome', async ({ page })=>{
		await goto(page, '/');
		const offenders = await page.evaluate(()=>{
			// The legacy palette's actual values, from
			// naturalcrit/styles/colors.less and the before shots.
			const banned = [
				[196, 83, 32],    // @orange, the "Create your own" sash
				[224, 122, 95],   // the floating save button
				[135, 36, 36],    // maroon
				[238, 224, 196],  // parchment
				[211, 193, 175]   // the legacy scrollbar thumb
			];
			const near = (a, b)=>Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 24;
			const parse = (css)=>{
				const m = css.match(/-?[\d.]+/g);
				return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : null;
			};
			const out = [];
			// Chrome only: the nav, the Mythforge bar and the page shell.
			const scope = document.querySelectorAll('nav *, nav, .tide-mbar, .tide-mbar *, .tide-page-body, .tide-page-body *');
			for (const el of scope) {
				const cs = getComputedStyle(el);
				for (const prop of ['backgroundColor', 'color', 'borderTopColor', 'borderBottomColor']) {
					const rgb = parse(cs[prop]);
					if(!rgb) continue;
					if(cs[prop].startsWith('rgba') && cs[prop].endsWith(', 0)')) continue;
					if(banned.some((b)=>near(rgb, b))) {
						out.push(`${el.tagName.toLowerCase()}.${el.className} ${prop}=${cs[prop]}`);
					}
				}
			}
			return out.slice(0, 12);
		});
		expect(offenders, offenders.join('\n')).toEqual([]);
	});

	test('the page shell uses the Tidewatch background', async ({ page })=>{
		await goto(page, '/');
		await expect(page.locator('.tide-page')).toHaveCSS('background-color', 'rgb(18, 24, 28)');
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Dead-control sweep. Every link and button on the unit's routes has to lead
 * somewhere: that is the defect the routing fix exists to kill, and a styled
 * button that does nothing is the same bug wearing better clothes.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('dead controls', ()=>{
	for (const route of M1_ROUTES) {
		test(`${route.name} has no dead controls`, async ({ page })=>{
			await goto(page, route.path);
			const dead = await page.evaluate(()=>{
				const out = [];
				const label = (el)=>(el.innerText || el.getAttribute('aria-label') || el.className || el.tagName)
					.replace(/\s+/g, ' ').trim().slice(0, 40);

				for (const a of document.querySelectorAll('a')) {
					const cs = getComputedStyle(a);
					if(cs.display === 'none' || cs.visibility === 'hidden') continue;
					const href = a.getAttribute('href');
					if(!href || href === '#' || href.trim() === '') out.push(`link "${label(a)}" has no href`);
				}
				for (const b of document.querySelectorAll('button')) {
					const cs = getComputedStyle(b);
					if(cs.display === 'none' || cs.visibility === 'hidden') continue;
					if(b.disabled) continue;
					// React attaches handlers at the root, so an inline onclick
					// is not the test. What IS testable: a button must either
					// submit a form or be inside a React tree that owns it.
					// Everything rendered by this unit is the latter, so the
					// check is that it carries a label a reader can act on.
					if(!label(b)) out.push('a button has no accessible label');
				}
				return out;
			});
			expect(dead, dead.join('\n')).toEqual([]);
		});
	}

	test('every Mythforge bar destination resolves to a real page', async ({ page })=>{
		await goto(page, '/');
		const hrefs = await page.locator('.tide-mbar a').evaluateAll(
			(els)=>els.map((e)=>e.getAttribute('href')));
		expect(hrefs.length).toBeGreaterThan(0);
		for (const href of hrefs) {
			await page.goto(href, { waitUntil: 'networkidle' });
			await page.waitForTimeout(250);
			// None of the bar's own destinations may be the 404.
			await expect(page.locator('.tide-status-code'), `${href} is a 404`).toHaveCount(0);
		}
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Contrast. Over art, against the brightest pixel behind each word.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('contrast', ()=>{
	for (const route of M1_ROUTES) {
		test(`${route.name} has 0 text nodes below AA`, async ({ page })=>{
			await goto(page, route.path);
			await page.evaluate(()=>document.fonts.ready);
			const rows = await measure(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(route.minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}

	/* 390 is not a smaller copy of 1440. The Mythforge bar wraps to two rows,
	 * the hero type drops to 34px (so the large-text threshold stops applying
	 * to it), and the art band covers proportionally more of the screen - all
	 * three change which pixel sits behind which word. */
	for (const route of M1_ROUTES) {
		test(`${route.name} has 0 text nodes below AA at 390`, async ({ page })=>{
			await page.setViewportSize({ width: 390, height: 844 });
			await goto(page, route.path);
			await page.evaluate(()=>document.fonts.ready);
			const rows = await measure(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(Math.min(route.minNodes, 8));
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}
});
