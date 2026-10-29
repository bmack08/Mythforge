/* tests/redesign/mythforge-m2.spec.cjs
 *
 * Unit M2 of the Mythforge Tidewatch redesign: the editor's app chrome, the
 * Collaborate share dialog, the Tome brew theme (and hiding the legacy PHB/DMG
 * themes), and the preview's empty state.
 *
 * Each describe block maps to one numbered item on the unit's fix list, so a
 * failure names the thing that regressed rather than a selector.
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

/* The editor needs a brew. Rather than hard-code an id that only exists in one
 * machine's dev store, the suite asks the API for one - preferring a brew this
 * lane seeded (all of them prefixed "lanem-") so a run never opens somebody's
 * real work. */
let EDIT_ID = null;

const editId = async (page)=>{
	if(EDIT_ID) return EDIT_ID;
	const res = await page.request.get(at('/api/projects'));
	expect(res.ok(), 'the brew API answered').toBeTruthy();
	const body = await res.json();
	const brews = body.projects || body.brews || [];
	expect(brews.length, 'the dev store has at least one brew to open').toBeGreaterThan(0);
	const seeded = brews.find((b)=>String(b.title || '').startsWith('lanem-'));
	EDIT_ID = (seeded || brews[0]).editId;
	expect(EDIT_ID, 'that brew has an edit id').toBeTruthy();
	return EDIT_ID;
};

const goto = async (page, path)=>{
	await page.goto(at(path), { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
};

const gotoEditor = async (page, suffix = '/edit')=>{
	const id = await editId(page);
	await goto(page, `${suffix}/${id}`);
	await expect(page.locator('.tide-editor')).toBeVisible();
	return id;
};

const rgb = async (locator, prop = 'background-color')=>
	locator.evaluate((el, p)=>getComputedStyle(el).getPropertyValue(p), prop);

/* ───────────────────────────────────────────────────────────────────────
 * Fix 6 (editor half) - the Homebrewery chrome goes. Before this unit the
 * writing pane was parchment, the preview pane slate, the toolbars cream
 * and gold, and the headings maroon in the Solbera font remakes.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('editor chrome', ()=>{
	test('the writing pane is the solid #12181C surface', async ({ page })=>{
		await gotoEditor(page);
		const pane = page.locator('.tide-editor .splitPane > .pane').first();
		expect(await rgb(pane)).toBe('rgb(18, 24, 28)');
		// ...and so is the editor inside it, not a parchment sheet on top.
		expect(await rgb(page.locator('.tide-editor .editor'))).toBe('rgb(18, 24, 28)');
	});

	test('the preview pane is #1A2126', async ({ page })=>{
		await gotoEditor(page);
		const pane = page.locator('.tide-editor .splitPane > .pane').last();
		expect(await rgb(pane)).toBe('rgb(26, 33, 38)');
	});

	test('two toolbars and a status line', async ({ page })=>{
		await gotoEditor(page);
		await expect(page.locator('.tide-editor .snippetBar')).toBeVisible();
		await expect(page.locator('.tide-editor .tiptap-toolbar')).toBeVisible();
		const status = page.locator('.tide-editor .tide-editor-status');
		await expect(status).toBeVisible();
		// Every number on it is measured, so the shape is fixed.
		await expect(status).toHaveText(/^Markdown · [\d,]+ words? · Page \d+ of \d+$/);
	});

	test('no Solbera font remakes anywhere in the editor chrome', async ({ page })=>{
		await gotoEditor(page);
		const offenders = await page.evaluate(()=>{
			const BANNED = /BookInsanity|MrEaves|ScalySans|Solbera|Nodesto/i;
			const out = [];
			for (const el of document.querySelectorAll('.tide-editor-stack *')) {
				if(!el.firstChild || el.firstChild.nodeType !== 3) continue;
				if(!el.textContent.trim()) continue;
				const ff = getComputedStyle(el).fontFamily;
				if(BANNED.test(ff)) out.push(`${el.tagName.toLowerCase()} → ${ff}`);
			}
			return out.slice(0, 10);
		});
		expect(offenders, offenders.join('\n')).toEqual([]);
	});

	test('the art is a band behind the bars, not behind the writing', async ({ page })=>{
		await gotoEditor(page);
		const band = page.locator('.tide-editor .tide-art-band');
		const box = await band.boundingBox();
		expect(box.y).toBe(0);
		// Section 9 says "a ~110px chrome band". Anything taller is art behind
		// body copy, which is the parchment habit by another route.
		expect(box.height).toBeLessThanOrEqual(130);
	});

	test('the Mythforge bar is sticky under the nav and carries Share and Export PDF', async ({ page })=>{
		await gotoEditor(page);
		const bar = page.locator('.tide-editor .tide-mbar');
		await expect(bar).toBeVisible();
		await expect(bar.getByRole('button', { name: 'Share' })).toBeVisible();
		await expect(bar.getByRole('button', { name: 'Export PDF' })).toBeVisible();
		for (const label of ['Brews', 'New brew', 'Generator', 'Vault', 'Help'])
			await expect(bar.getByRole('link', { name: label })).toBeVisible();
	});

	test('the editor tools left the global nav', async ({ page })=>{
		await gotoEditor(page);
		const nav = page.locator('.tide-editor nav');
		// All five used to be top-bar items; at 1440 the row wrapped and they
		// collided. They live in the Mythforge bar now.
		for (const gone of ['Get PDF', 'Vault', 'Recent brews', 'Need help?', 'New'])
			await expect(nav.getByText(gone, { exact: true })).toHaveCount(0);
		await expect(nav.locator('.brewTitle')).toBeVisible();
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 1 (collaborate) - "collaborate should become a share dialog on the
 * editor". It used to be a top-bar item that fell through to the editor.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the share dialog', ()=>{
	test('Share opens it, Escape closes it', async ({ page })=>{
		await gotoEditor(page);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await page.locator('.tide-mbar').getByRole('button', { name: 'Share' }).click();
		const dialog = page.getByRole('dialog', { name: 'Share this brew' });
		await expect(dialog).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('it hands over a real read link and a real edit link', async ({ page })=>{
		const id = await gotoEditor(page);
		await page.locator('.tide-mbar').getByRole('button', { name: 'Share' }).click();
		const dialog = page.getByRole('dialog', { name: 'Share this brew' });

		const read = dialog.locator('#share-read-link');
		await expect(read).toBeVisible();
		const readUrl = await read.inputValue();
		expect(readUrl).toMatch(/^https?:\/\/[^/]+/);
		// The old code built this from global.config.baseUrl, which is only set
		// by a server render - in dev it produced "undefined/share/...".
		expect(readUrl).not.toContain('undefined');
		expect(readUrl).toContain('/share/');

		const edit = dialog.locator('#share-edit-link');
		await expect(edit).toBeVisible();
		expect(await edit.inputValue()).toContain(`/edit/${id}`);

		// Mythforge has no per-person access list, and the dialog says so
		// rather than implying an invitation it cannot send.
		await expect(dialog).toContainText(/Anyone with this link can edit/);
	});

	test('the read link resolves to a real page', async ({ page })=>{
		await gotoEditor(page);
		await page.locator('.tide-mbar').getByRole('button', { name: 'Share' }).click();
		const dialog = page.getByRole('dialog', { name: 'Share this brew' });
		await dialog.getByRole('link', { name: /Open the reader view/ }).click();
		await page.waitForLoadState('networkidle');
		expect(page.url()).toContain('/share/');
		await expect(page.locator('.tide-status-code')).toHaveCount(0);
	});

	test('/collaborate/:id opens the editor with the dialog already open', async ({ page })=>{
		await gotoEditor(page, '/collaborate');
		await expect(page.getByRole('dialog', { name: 'Share this brew' })).toBeVisible();
	});

	test('/collaborate with no brew is a real page, not an empty editor', async ({ page })=>{
		await goto(page, '/collaborate');
		await expect(page.locator('h1')).toHaveText('Pick a brew to share');
		// The old fall-through rendered the editor here.
		await expect(page.locator('.splitPane')).toHaveCount(0);
		await expect(page.locator('.tide-mbar')).toBeVisible();
	});

	test('the editor behind the open dialog is inert', async ({ page })=>{
		await gotoEditor(page, '/collaborate');
		const stack = page.locator('.tide-editor-stack');
		await expect(stack).toHaveAttribute('aria-hidden', 'true');
		expect(await stack.evaluate((el)=>el.inert)).toBe(true);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 6 (Tome) - "the preview's default brew theme becomes Tome", and the
 * legacy PHB/DMG themes are hidden from the picker.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the Tome brew theme', ()=>{
	test('its stylesheet is served, from source, with no build step', async ({ page })=>{
		const res = await page.request.get(at('/themes/V3/Tome/style.css'));
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('text/css');
		const css = await res.text();
		for (const token of ['#FAF7F0', '#1F2430', '#1F4E5F', '#E8EEF2'])
			expect(css, `Tome defines ${token}`).toContain(token);
	});

	test('the API knows the theme', async ({ page })=>{
		const res = await page.request.get(at('/api/theme/V3/Tome'));
		expect(res.status()).toBe(200);
		expect((await res.json()).name).toBe('Tome');
	});

	test('the paper renders as bone with teal headings', async ({ page })=>{
		await gotoEditor(page);
		const frame = page.frameLocator('#BrewRenderer');
		const paper = frame.locator('.page').first();
		await expect(paper).toBeVisible();
		const paint = await paper.evaluate((el)=>{
			const h2 = el.querySelector('h2');
			const note = el.querySelector('.note');
			const cs = getComputedStyle(el);
			return {
				paper   : cs.backgroundColor,
				ink     : cs.color,
				heading : h2 ? getComputedStyle(h2).color : null,
				bar     : h2 ? getComputedStyle(h2).borderLeftColor : null,
				note    : note ? getComputedStyle(note).backgroundColor : null
			};
		});
		expect(paint.paper).toBe('rgb(250, 247, 240)');   // bone #FAF7F0
		expect(paint.ink).toBe('rgb(31, 36, 48)');        // ink  #1F2430
		expect(paint.heading).toBe('rgb(31, 78, 95)');    // teal #1F4E5F
		expect(paint.bar).toBe('rgb(31, 78, 95)');        // the left accent bar
		expect(paint.note).toBe('rgb(232, 238, 242)');    // callout #E8EEF2
	});

	test('no parchment texture on the paper', async ({ page })=>{
		await gotoEditor(page);
		const image = await page.frameLocator('#BrewRenderer').locator('.page').first()
			.evaluate((el)=>getComputedStyle(el).backgroundImage);
		expect(image).toBe('none');
	});

	test('Tome is the theme a brew starts on', async ({ page })=>{
		await gotoEditor(page);
		await page.locator('.tide-editor .snippetBar .tabs .meta').click();
		await page.waitForTimeout(400);
		await expect(page.locator('.themes-dropdown input')).toHaveValue(/Tome/);
	});

	test('the legacy PHB and DMG themes are hidden from the picker', async ({ page })=>{
		await gotoEditor(page);
		// The Properties tab is where the theme is chosen, and the options
		// only render once the combobox is open.
		await page.locator('.tide-editor .snippetBar .tabs .meta').click();
		await page.waitForTimeout(400);
		await page.locator('.themes-dropdown input').click();
		await page.waitForTimeout(400);
		const names = await page.locator('.themes-dropdown .dropdown-options .item').allInnerTexts();
		expect(names.length, 'the picker listed some themes').toBeGreaterThan(0);
		const joined = names.join(' | ');
		expect(joined).toContain('Tome');
		expect(joined).not.toContain('5e PHB');
		expect(joined).not.toContain('5e DMG');
	});

	test('the Tome swatch in the picker is a real image, not a broken one', async ({ page })=>{
		for (const file of ['dropdownPreview.png', 'dropdownTexture.png']) {
			const res = await page.request.get(at(`/themes/V3/Tome/${file}`));
			expect(res.status(), file).toBe(200);
			expect(res.headers()['content-type'], file).toContain('image/png');
		}
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 7 (preview) - "preview with no brew loaded: 'Nothing to preview yet'
 * ... Never show a bare blank page."
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the preview empty state', ()=>{
	test('preview with nothing to preview says so, with two ways on', async ({ page })=>{
		await goto(page, '/preview');
		await expect(page.locator('h1')).toHaveText('Nothing to preview yet');
		await expect(page.getByRole('link', { name: 'Open a brew' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'New brew' }).first()).toBeVisible();
		// It used to print the harness's own instruction to the reader.
		await expect(page.locator('body')).not.toContainText('?fixture=');
	});

	test('the fixture route the visual suite drives still renders a page', async ({ page })=>{
		await goto(page, '/preview?fixture=headings/basic');
		await expect(page.locator('#preview-page.page.phb')).toBeVisible();
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Dead controls, across every route this unit owns.
 * ─────────────────────────────────────────────────────────────────────── */
const sweepDead = async (page)=>page.evaluate(()=>{
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
		if(!label(b)) out.push('a button has no accessible label');
	}
	// The AI menu used to list three labels with no handler and no href behind
	// them: AI Content Generator, Budget Engine, Collaboration Tools.
	for (const item of document.querySelectorAll('.navDropdown .navItem')) {
		if(item.tagName === 'A') continue;
		const key = Object.keys(item).find((k)=>k.startsWith('__reactProps$'));
		if(key && !item[key].onClick) out.push(`menu item "${label(item)}" does nothing`);
	}
	return out;
});

test.describe('dead controls', ()=>{
	test('the editor has no dead controls', async ({ page })=>{
		await gotoEditor(page);
		await page.locator('.tide-mbar .tide-mbar-tool').click();  // open the AI menu
		await page.waitForTimeout(200);
		const dead = await sweepDead(page);
		expect(dead, dead.join('\n')).toEqual([]);
	});

	for (const route of [
		{ name: 'share dialog', path: null },
		{ name: 'collaborate',  path: '/collaborate' },
		{ name: 'preview',      path: '/preview' }
	]) {
		test(`${route.name} has no dead controls`, async ({ page })=>{
			if(route.path) await goto(page, route.path);
			else await gotoEditor(page, '/collaborate');
			const dead = await sweepDead(page);
			expect(dead, dead.join('\n')).toEqual([]);
		});
	}
});

/* ───────────────────────────────────────────────────────────────────────
 * Contrast. Over art, against the brightest pixel behind each word.
 * ─────────────────────────────────────────────────────────────────────── */
/* minNodes guards against a run that passes because it measured almost
 * nothing. It is per route: with the share dialog open everything behind it is
 * `inert` and aria-hidden, so the only text a reader is being asked to read is
 * the dialog's own handful of labels and hints - and the two link values are
 * <input> values, which are not text nodes at all. The editor underneath is
 * measured in full by the `editor` route, which is the same component. */
const M2_ROUTES = [
	{ name: 'editor',       editor: '/edit',        minNodes: 25, narrow: 25 },
	{ name: 'editor-share', editor: '/collaborate', minNodes: 4,  narrow: 4  },
	{ name: 'collaborate',  path: '/collaborate',   minNodes: 12, narrow: 8  },
	{ name: 'preview',      path: '/preview',       minNodes: 12, narrow: 8  }
];

const gotoRoute = async (page, route)=>{
	if(route.editor) await gotoEditor(page, route.editor);
	else await goto(page, route.path);
	await page.evaluate(()=>document.fonts.ready);
	await page.waitForTimeout(300);
};

test.describe('contrast', ()=>{
	for (const route of M2_ROUTES) {
		test(`${route.name} has 0 text nodes below AA`, async ({ page })=>{
			await gotoRoute(page, route);
			const rows = await measure(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(route.minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}

	for (const route of M2_ROUTES) {
		test(`${route.name} has 0 text nodes below AA at 390`, async ({ page })=>{
			await page.setViewportSize({ width: 390, height: 844 });
			await gotoRoute(page, route);
			const rows = await measure(page);
			expect(rows.length, 'the page rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(route.narrow);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}

	/* The paper lives in an iframe, which the glyph-rect harness cannot
	 * screenshot. It does not need to: the paper is one flat colour with no
	 * art behind it, so the honest measurement there is the colour pair - each
	 * text node against the nearest ancestor that actually paints. */
	test('the Tome paper has 0 text nodes below AA', async ({ page })=>{
		await gotoEditor(page);
		const frame = page.frameLocator('#BrewRenderer').locator('.page').first();
		await expect(frame).toBeVisible();
		const rows = await frame.evaluate((root)=>{
			const parse = (c)=>{
				const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
				return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
			};
			const lum = (r, g, b)=>{
				const f = (v)=>{ v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
				return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
			};
			const behind = (el)=>{
				for (let n = el; n; n = n.parentElement) {
					const c = parse(getComputedStyle(n).backgroundColor);
					if(c && c[3] > 0.95) return c;
				}
				return [255, 255, 255, 1];
			};
			const out = [];
			for (const el of root.querySelectorAll('*')) {
				const own = [...el.childNodes]
					.filter((n)=>n.nodeType === 3 && n.textContent.trim())
					.map((n)=>n.textContent.trim()).join(' ');
				if(!own) continue;
				const cs = getComputedStyle(el);
				if(cs.visibility === 'hidden' || cs.display === 'none') continue;
				const fg = parse(cs.color);
				if(!fg) continue;
				const bg = behind(el);
				const l1 = lum(fg[0], fg[1], fg[2]);
				const l2 = lum(bg[0], bg[1], bg[2]);
				const r  = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
				const size = parseFloat(cs.fontSize);
				const need = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700) ? 3 : 4.5;
				out.push({
					text : own.slice(0, 48), where: el.tagName.toLowerCase(), color: cs.color,
					fontSize: size, fontWeight: parseInt(cs.fontWeight, 10) || 400,
					ratio: Math.round(r * 100) / 100, need, pass: r >= need
				});
			}
			return out;
		});
		expect(rows.length, 'the paper rendered enough text to be worth measuring')
			.toBeGreaterThanOrEqual(6);
		const failing = rows.filter((r)=>!r.pass);
		expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
	});
});
