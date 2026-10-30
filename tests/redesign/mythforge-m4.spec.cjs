/* tests/redesign/mythforge-m4.spec.cjs
 *
 * Unit M4 of the Mythforge Tidewatch redesign: the vault, the docs
 * (changelog / faq / migrate), settings, the import path and the user page.
 *
 * The fix-list items this unit closes:
 *   1 (rest)  settings is a real page in the 09 layout; legacy is a hidden
 *             import path; unknown routes get a real 404 FROM THE SERVER too
 *   3         changelog, faq and migrate render their content in the 12-docs
 *             template - left TOC, dark solid article, never on paper
 *   6 (rest)  Tidewatch chrome on the vault and the user page
 *   7         the vault's two empty states and the user page's
 *
 * Each describe block maps to one of those, so a failure names the thing that
 * regressed rather than a selector.
 *
 * Run with the untracked lane config:
 *   NODE_PATH=<TaleForge-tidewatch>/node_modules \
 *     <TaleForge-tidewatch>/node_modules/.bin/playwright test \
 *     --config playwright.laneM.config.cjs
 */

const { test, expect } = require('@playwright/test');
const { measure, table } = require('./contrast.cjs');

const BASE_PATH = process.env.LANEM_BASE_PATH || '/mythforge';
const at = (p)=>`${BASE_PATH}${p}`;

/* The Express origin behind the Vite dev server. Server status codes, the
 * server-rendered <head> and the docs API are only visible here - the dev
 * server answers every path with its own index.html shell, so asking Vite
 * what /nonsense returns proves nothing. */
const API_URL = process.env.LANEM_API_URL || 'http://localhost:3107';

/* The author the lane seeded published brews under (laneM-m4-seed.cjs). */
const AUTHOR = process.env.LANEM_AUTHOR || 'lanem-tester';

const DOCS = [
	{ slug: 'changelog', path: '/changelog', label: 'Changelog' },
	{ slug: 'faq',       path: '/faq',       label: 'FAQ' },
	{ slug: 'migrate',   path: '/migrate',   label: 'Migrate from another editor' }
];

const goto = async (page, path)=>{
	await page.goto(at(path), { waitUntil: 'networkidle' });
	await expect(page.locator('.tide-page')).toBeVisible();
	await page.waitForTimeout(350);
};

/* ───────────────────────────────────────────────────────────────────────
 * Fix 3 - the docs. The before shots show changelog, faq and migrate as
 * BLANK pages; the markdown was handed to the client as a 5ePHB brew through
 * a props path the bundle never wired up.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('docs', ()=>{
	for (const doc of DOCS) {
		test(`${doc.slug} renders its content`, async ({ page })=>{
			await goto(page, doc.path);

			const article = page.locator('.tide-doc-article');
			await expect(article).toBeVisible();

			// Not blank, and not a spinner that never resolved: the shortest of
			// the three (migrate) is several thousand characters.
			const text = (await article.innerText()).trim();
			expect(text.length, `${doc.slug} rendered ${text.length} characters`).toBeGreaterThan(1200);

			// Real structure, not a wall of escaped markdown.
			expect(await article.locator('h2, h3').count()).toBeGreaterThan(2);
			await expect(page.locator('.tide-note-error')).toHaveCount(0);
		});

		test(`${doc.slug} is never on paper`, async ({ page })=>{
			await goto(page, doc.path);
			/* The paper the brief retires, by its own values: the PHB
			 * parchment texture, the bone page, the maroon and the gold rule.
			 * A docs page may not carry any of them, and may not mount the
			 * brew renderer at all. */
			const offenders = await page.evaluate(()=>{
				const BAD_BG = /(250, 247, 240)|(238, 224, 193)|(255, 255, 255)/;
				const out = [];
				for (const el of document.querySelectorAll('.tide-doc, .tide-doc *')) {
					const cs = getComputedStyle(el);
					if(BAD_BG.test(cs.backgroundColor)) out.push(`${el.tagName}.${el.className} bg ${cs.backgroundColor}`);
					if(/url\(/.test(cs.backgroundImage) && /parchment|phb/i.test(cs.backgroundImage))
						out.push(`${el.tagName} texture ${cs.backgroundImage}`);
				}
				return out;
			});
			expect(offenders, offenders.join('\n')).toEqual([]);
			await expect(page.locator('.brewRenderer, .pages, .page, iframe')).toHaveCount(0);
		});

		test(`${doc.slug} marks itself in the TOC`, async ({ page })=>{
			await goto(page, doc.path);
			const toc = page.locator('.tide-sidenav');
			await expect(toc).toBeVisible();
			await expect(toc.locator('a')).toHaveCount(DOCS.length);
			await expect(toc.locator('[aria-current="page"]')).toHaveText(doc.label);
		});
	}

	test('the TOC is a column, not the top bar’s flex row', async ({ page })=>{
		await goto(page, '/changelog');
		// body .homebrew nav styles EVERY <nav> in the app; a TOC that
		// inherited it came out as four wrapped columns 60px wide.
		const toc = page.locator('.tide-sidenav');
		await expect(toc).toHaveCSS('display', 'block');
		const boxes = await toc.locator('a').evaluateAll(
			(els)=>els.map((e)=>e.getBoundingClientRect().left));
		expect(new Set(boxes).size, 'TOC entries are not on one column').toBe(1);
	});

	test('every TOC destination is a real page', async ({ page })=>{
		await goto(page, '/faq');
		const hrefs = await page.locator('.tide-sidenav a').evaluateAll(
			(els)=>els.map((e)=>e.getAttribute('href')));
		expect(hrefs.length).toBe(DOCS.length);
		for (const href of hrefs) {
			const res = await page.request.get(`${API_URL}${href.replace(BASE_PATH, '')}`);
			expect(res.status(), `${href} answered ${res.status()}`).toBe(200);
		}
	});

	test('the icon glyphs the changelog documents are served, not 406ed', async ({ page })=>{
		const failures = [];
		page.on('response', (r)=>{ if(r.status() >= 400 && /\/icons\//.test(r.url())) failures.push(`${r.status()} ${r.url()}`); });
		await goto(page, '/changelog');
		await page.waitForTimeout(600);
		expect(failures, failures.join('\n')).toEqual([]);
	});

	test('the docs API refuses a document it does not have', async ({ page })=>{
		const res = await page.request.get(`${API_URL}/api/docs/not-a-document`);
		expect(res.status()).toBe(404);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 7 - the vault's two empty states, and the search that sits between
 * them. Section 9 names both: "vault with no search: the 12-vault empty
 * state. Vault with no results: 'No brews match X', with a Clear filters
 * button and a tip about exact phrases."
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('vault', ()=>{
	test('with no search it invites one, with art and both actions', async ({ page })=>{
		await goto(page, '/vault');
		const empty = page.locator('.tide-empty-panel');
		await expect(empty).toBeVisible();
		await expect(empty.locator('h2')).toHaveText('Search the vault');
		await expect(empty.locator('.tide-roundel')).toBeVisible();
		await expect(empty.getByRole('button', { name: 'Browse newest' })).toBeVisible();
		await expect(empty.getByRole('link',   { name: 'Publish your brew' })).toBeVisible();
		// and it has NOT run a query it was not asked for
		await expect(page.locator('.tide-grid')).toHaveCount(0);
	});

	test('a search that matches nothing says so and offers a way out', async ({ page })=>{
		await goto(page, '/vault');
		await page.fill('input[name="title"]', 'zzzznotathing');
		await page.getByRole('button', { name: 'Search' }).click();
		await page.waitForTimeout(900);

		const empty = page.locator('.tide-empty-panel');
		await expect(empty.locator('h2')).toHaveText(/No brews match .zzzznotathing./);
		await expect(empty.getByRole('button', { name: 'Clear filters' })).toBeVisible();
		await expect(empty).toContainText(/exact phrase/i);
	});

	test('Clear filters puts the page back to the no-search state', async ({ page })=>{
		await goto(page, '/vault');
		await page.fill('input[name="title"]', 'zzzznotathing');
		await page.getByRole('button', { name: 'Search' }).click();
		await page.waitForTimeout(900);
		await page.getByRole('button', { name: 'Clear filters' }).click();
		await page.waitForTimeout(250);
		await expect(page.locator('.tide-empty-panel h2')).toHaveText('Search the vault');
		expect(await page.inputValue('input[name="title"]')).toBe('');
	});

	test('a search that matches shows the 12-home card grid', async ({ page })=>{
		await goto(page, `/vault?author=${AUTHOR}`);
		await page.waitForTimeout(900);
		const cards = page.locator('.tide-grid .tide-card');
		expect(await cards.count(), 'the lane’s seeded brews are published').toBeGreaterThan(0);
		// Every card is a link to a real share page, not a div.
		for (const href of await cards.evaluateAll((els)=>els.map((e)=>e.getAttribute('href')))) {
			expect(href).toMatch(new RegExp(`^${BASE_PATH}/share/.+`));
		}
		await expect(page.locator('.tide-section-head h2')).toHaveText(/\d+ brews?/);
	});

	test('Search stays disabled until the form can match something', async ({ page })=>{
		await goto(page, '/vault');
		const button = page.getByRole('button', { name: 'Search' });
		await expect(button).toBeDisabled();
		await page.fill('input[name="title"]', 'ab');     // under the 3-letter floor
		await expect(button).toBeDisabled();
		await page.fill('input[name="title"]', 'ember');
		await expect(button).toBeEnabled();
	});

	test('no sort control claims an order the API does not support', async ({ page })=>{
		await goto(page, `/vault?author=${AUTHOR}`);
		await page.waitForTimeout(900);
		// server/vault.api.simple.js orders by createdAt DESC and ignores
		// sort= and dir= entirely. The old page offered four sort buttons.
		const text = await page.locator('.tide-page-body').innerText();
		expect(text).not.toMatch(/Created Date|Updated Date|Sort by/i);
		await expect(page.locator('.tide-section-head .tide-cap')).toHaveText(/Newest first/);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 1 - settings. The route fell through to the home page; section 9 asks
 * for the 09 layout or for the item to be removed, and M1 removed the item.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('settings', ()=>{
	test('is a real page, not the home page or a 404', async ({ page })=>{
		await goto(page, '/settings');
		await expect(page.locator('.settingsPage')).toBeVisible();
		await expect(page.locator('.tide-page-body h1')).toHaveText('Settings');
		await expect(page.locator('.tide-status-code')).toHaveCount(0);
		const res = await page.request.get(`${API_URL}/settings`);
		expect(res.status(), 'the server serves it rather than redirecting').toBe(200);
	});

	test('is reachable from the Mythforge bar and marks itself there', async ({ page })=>{
		await goto(page, '/');
		const link = page.locator('.tide-mbar a', { hasText: 'Settings' });
		await expect(link).toHaveAttribute('href', at('/settings'));
		await link.click();
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.tide-mbar [aria-current="page"]')).toHaveText('Settings');
	});

	test('every switch writes the key the feature that owns it reads', async ({ page })=>{
		await goto(page, '/settings');

		/* The encodings are a contract with code elsewhere in the app, and
		 * writing the wrong one silently turns the setting off:
		 *   AUTOSAVE_ON  is JSON.parse-d by editPage
		 *   the MF_* keys are compared to '1' by aiSidebar
		 *   liveScroll   is compared to 'true' by splitPane */
		const cases = [
			{ group: 'Editor',    label: 'Autosave while you write',              key: 'AUTOSAVE_ON',             off: 'false', on: 'true' },
			{ group: 'Editor',    label: 'Sync the editor and the preview',       key: 'liveScroll',              off: 'false', on: 'true' },
			{ group: 'Assistant', label: 'Open the assistant panel by default',   key: 'MF_AI_SIDEBAR_EXPANDED',  off: '0',     on: '1' },
			{ group: 'Assistant', label: 'Apply the assistant’s edits automatically', key: 'MF_AUTO_APPLY_PATCHES', off: '0',   on: '1' },
			{ group: 'Assistant', label: 'Let the assistant read the rest of your brew', key: 'MF_AUTO_INDEX_RETRIEVAL', off: '0', on: '1' }
		];

		for (const c of cases) {
			await page.getByRole('button', { name: c.group, exact: true }).click();
			const sw = page.getByRole('switch', { name: c.label });
			await expect(sw).toBeVisible();

			const before = await sw.getAttribute('aria-checked');
			await sw.click();
			const after = await sw.getAttribute('aria-checked');
			expect(after, `${c.label} did not change state`).not.toBe(before);

			const stored = await page.evaluate((k)=>window.localStorage.getItem(k), c.key);
			expect(stored, `${c.key} was written as ${stored}`).toBe(after === 'true' ? c.on : c.off);
		}
	});

	test('the account section tells the truth about being signed out', async ({ page })=>{
		await goto(page, '/settings');
		await page.getByRole('button', { name: 'Account', exact: true }).click();
		await expect(page.locator('.tide-panel')).toContainText('You are not signed in');
		// and offers the sign-in Mythforge actually has
		await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', /naturalcrit\.com\/login/);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 1 - legacy as a hidden import path.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the import path', ()=>{
	test('/legacy is an import page, not a second home page', async ({ page })=>{
		await goto(page, '/legacy');
		await expect(page.locator('.importPage')).toBeVisible();
		await expect(page.locator('.tide-page-body h1')).toHaveText('Import from Markdown');
		// The old /legacy rendered the legacy WELCOME BREW on paper.
		await expect(page.locator('.brewRenderer, .page, .homePage')).toHaveCount(0);
	});

	test('it is hidden: nothing in the chrome links to it', async ({ page })=>{
		for (const route of ['/', '/vault', '/faq', '/settings']) {
			await goto(page, route);
			const inChrome = await page.locator('nav a, .tide-mbar a').evaluateAll(
				(els)=>els.map((e)=>e.getAttribute('href')).filter(Boolean));
			expect(inChrome.filter((h)=>/\/legacy$/.test(h)), `${route} links to /legacy`).toEqual([]);
		}
	});

	test('the library’s Import action is the way in', async ({ page })=>{
		await goto(page, '/');
		const link = page.getByRole('link', { name: /Import from Markdown/i });
		await expect(link).toHaveAttribute('href', at('/legacy'));
	});

	test('pasting seeds the same keys /new reads, then goes there', async ({ page })=>{
		await goto(page, '/legacy');
		const open = page.getByRole('button', { name: 'Open in the editor' });
		await expect(open, 'nothing to import yet').toBeDisabled();

		await page.fill('.tide-textarea', '# Imported title\n\nSome body text.');
		await expect(open).toBeEnabled();
		await open.click();
		await page.waitForURL(`**${at('/new')}`, { timeout: 15000 });

		const seeded = await page.evaluate(()=>({
			brew : window.localStorage.getItem('homebrewery-new'),
			meta : window.localStorage.getItem('homebrewery-new-meta')
		}));
		expect(seeded.brew, 'the document was handed over').toContain('Imported title');
		// The title comes from the document's own first heading, not invented.
		expect(JSON.parse(seeded.meta).title).toBe('Imported title');
	});

	test('Clear empties the box', async ({ page })=>{
		await goto(page, '/legacy');
		await page.fill('.tide-textarea', 'something');
		await page.getByRole('button', { name: 'Clear' }).click();
		expect(await page.inputValue('.tide-textarea')).toBe('');
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 7 - the user page's empty state, and the card grid once it is not.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('user page', ()=>{
	test('lists a creator’s published brews as the 12-home grid', async ({ page })=>{
		await goto(page, `/user/${AUTHOR}`);
		await page.waitForTimeout(900);
		await expect(page.locator('.tide-page-body h1')).toHaveText(`${AUTHOR}’s brews`);
		expect(await page.locator('.tide-grid .tide-card').count()).toBeGreaterThan(0);
	});

	test('says so plainly when there is nothing published', async ({ page })=>{
		await goto(page, '/user/lanem-nobody-at-all');
		await page.waitForTimeout(900);
		const empty = page.locator('.tide-empty');
		await expect(empty).toBeVisible();
		await expect(empty.locator('h3')).toHaveText(/lanem-nobody-at-all hasn.t published any brews yet/);
		// Never a bare blank page: there is somewhere to go from here.
		expect(await empty.locator('a').count()).toBeGreaterThan(0);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 1 - unknown routes. Unit M1 gave the CLIENT router a styled 404; the
 * server still answered 302 to '/', so a direct hit on a broken link was
 * told its link was fine and lost its place.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('unknown routes', ()=>{
	test('the server answers 404, not a redirect', async ({ page })=>{
		const res = await page.request.get(`${API_URL}/this-route-does-not-exist`, { maxRedirects: 0 });
		expect(res.status()).toBe(404);
	});

	test('and it is the styled 404, not a bare error', async ({ page })=>{
		await goto(page, '/this-route-does-not-exist');
		await expect(page.locator('.tide-status-code')).toHaveText('404');
		await expect(page.locator('.tide-mbar')).toBeVisible();
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Dead controls: every link has somewhere to go, every button does
 * something, and nothing is unlabelled.
 * ─────────────────────────────────────────────────────────────────────── */
const sweepDead = (page)=>page.evaluate(()=>{
	const out = [];
	const label = (el)=>(el.getAttribute('aria-label') || el.innerText || el.title || '').trim();

	for (const a of document.querySelectorAll('a')) {
		const cs = getComputedStyle(a);
		if(cs.display === 'none' || cs.visibility === 'hidden') continue;
		const href = a.getAttribute('href');
		if(!href || href === '#') out.push(`a link goes nowhere: "${label(a)}"`);
	}
	for (const b of document.querySelectorAll('button')) {
		const cs = getComputedStyle(b);
		if(cs.display === 'none' || cs.visibility === 'hidden') continue;
		if(b.disabled) continue;
		if(!label(b)) out.push(`a button has no accessible label: .${b.className}`);
		const key = Object.keys(b).find((k)=>k.startsWith('__reactProps$'));
		if(key && !b[key].onClick && b.type !== 'submit')
			out.push(`button "${label(b)}" does nothing`);
	}
	return out;
});

const ROUTES = [
	'/vault',
	'/changelog',
	'/faq',
	'/migrate',
	'/settings',
	'/legacy',
	`/user/${AUTHOR}`
];

test.describe('dead controls', ()=>{
	for (const route of ROUTES) {
		test(`${route} has none`, async ({ page })=>{
			await goto(page, route);
			await page.waitForTimeout(600);
			const dead = await sweepDead(page);
			expect(dead, `${route}:\n${dead.join('\n')}`).toEqual([]);
		});
	}
});

/* ───────────────────────────────────────────────────────────────────────
 * Contrast, measured against the brightest pixel behind each word.
 *
 * Two passes, top and bottom: the changelog alone is 56,000 characters and
 * one screenshot of the first viewport would leave almost all of it
 * unmeasured while still passing a node-count guard.
 *
 * clipTop is the sticky chrome's height - once the page is scrolled the
 * Mythforge bar paints over whatever is beneath it, and sampling those pixels
 * measures the BAR rather than the paragraph. clipExempt names that chrome so
 * its own labels, which sit in that band by definition, are not dropped.
 * ─────────────────────────────────────────────────────────────────────── */
const STICKY = '.tide-mbar, nav';

const measureAll = async (page)=>{
	const clipTop = async ()=>page.evaluate(()=>{
		const bar = document.querySelector('.tide-mbar');
		return bar ? Math.ceil(bar.getBoundingClientRect().bottom) : 0;
	});

	const rows = new Map();
	for (const where of ['top', 'bottom']) {
		await page.evaluate((w)=>{
			const el = document.querySelector('.tide-page');
			const y = w === 'top' ? 0 : (el ? el.scrollHeight : document.body.scrollHeight);
			if(el) el.scrollTop = y;
			window.scrollTo(0, y);
		}, where);
		await page.waitForTimeout(300);

		const opts = where === 'top' ? {} : { clipTop: await clipTop(), clipExempt: STICKY };
		for (const r of await measure(page, opts)) {
			const key = `${r.where}|${r.text}|${r.color}|${r.fontSize}`;
			const seen = rows.get(key);
			if(!seen || r.ratio < seen.ratio) rows.set(key, r);
		}
	}
	return [...rows.values()];
};

/* minNodes guards against a run that passes because it measured almost
 * nothing. Each floor is ~75% of what the two-pass measurement actually
 * returns at the NARROWER viewport (mythforge-m4-report.cjs prints both), so
 * a page that silently stops rendering half its content fails here instead of
 * reporting a clean sweep of what is left. */
const CONTRAST_ROUTES = [
	{ route: '/vault',                    minNodes: 22, name: 'vault, no search' },
	{ route: `/vault?author=${AUTHOR}`,   minNodes: 24, name: 'vault, with results' },
	{ route: '/changelog',                minNodes: 29, name: 'changelog' },
	{ route: '/faq',                      minNodes: 25, name: 'faq' },
	{ route: '/migrate',                  minNodes: 28, name: 'migrate' },
	{ route: '/settings',                 minNodes: 18, name: 'settings' },
	{ route: '/legacy',                   minNodes: 16, name: 'import' },
	{ route: `/user/${AUTHOR}`,           minNodes: 19, name: 'user page' },
	{ route: '/user/lanem-nobody-at-all', minNodes: 13, name: 'user page, empty' }
];

test.describe('contrast', ()=>{
	for (const { route, minNodes, name } of CONTRAST_ROUTES) {
		test(`${name} has 0 text nodes below AA`, async ({ page })=>{
			await goto(page, route);
			await page.evaluate(()=>document.fonts.ready);
			await page.waitForTimeout(700);
			const rows = await measureAll(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}

	for (const { route, minNodes, name } of CONTRAST_ROUTES) {
		test(`${name} has 0 text nodes below AA at 390`, async ({ page })=>{
			await page.setViewportSize({ width: 390, height: 844 });
			await goto(page, route);
			await page.evaluate(()=>document.fonts.ready);
			await page.waitForTimeout(700);
			const rows = await measureAll(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}
});
