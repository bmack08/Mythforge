/* tests/redesign/mythforge-m3.spec.cjs
 *
 * Unit M3 of the Mythforge Tidewatch redesign: the campaign generator.
 *
 * Fix-list item 5, in full:
 *   - remove "D&D 5e" (use "5E-compatible")
 *   - remove the "Lost Mines of Phandelver" placeholder
 *   - remove the purple gradient header
 *   - build it as the 12-generator 5-step glass bar over a solid panel
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

/* The Express origin behind the Vite dev server. Server-rendered <head> is
 * only visible here. */
const API_URL = process.env.LANEM_API_URL || 'http://localhost:3100';

const STEPS = ['Basics', 'World', 'Adventure', 'References', 'Generate'];

const goto = async (page, path = '/new-campaign')=>{
	await page.goto(at(path), { waitUntil: 'networkidle' });
	await expect(page.locator('.tide-steps')).toBeVisible();
	await page.waitForTimeout(300);
};

/* Walk forward with the page's own control rather than by setting state, so
 * the walk is itself a test that Next step works on every step. */
const advanceTo = async (page, step)=>{
	for (let i = 1; i < step; i++) {
		await page.getByRole('button', { name: 'Next step' }).click();
		await page.waitForTimeout(150);
	}
	await expect(page.locator('.tide-step.on .tide-step-label')).toHaveText(STEPS[step - 1]);
};

const rgb = async (locator, prop = 'background-color')=>
	locator.evaluate((el, p)=>getComputedStyle(el).getPropertyValue(p), prop);

/* ───────────────────────────────────────────────────────────────────────
 * Fix 5a - the wording. "D&D 5e" is Wizards of the Coast's mark and
 * "The Lost Mines of Phandelver" is one of their adventures; it sat in the
 * campaign-name field as the example the user was invited to follow.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('wording', ()=>{
	test('no WotC marks anywhere on the page, in any step', async ({ page })=>{
		await goto(page);
		for (let step = 1; step <= 5; step++) {
			if(step > 1) {
				await page.getByRole('button', { name: 'Next step' }).click();
				await page.waitForTimeout(150);
			}
			/* Attribute text counts: the offender was a placeholder, which
			 * innerText does not see. */
			const haystack = await page.evaluate(()=>{
				const bits = [document.body.innerText, document.title];
				for (const el of document.querySelectorAll('[placeholder], [aria-label], [alt], [title]'))
					bits.push(el.getAttribute('placeholder'), el.getAttribute('aria-label'),
						el.getAttribute('alt'), el.getAttribute('title'));
				return bits.filter(Boolean).join(' | ');
			});
			expect(haystack, `step ${step}`).not.toMatch(/Phandelver/i);
			expect(haystack, `step ${step}`).not.toMatch(/Lost Mines/i);
			expect(haystack, `step ${step}`).not.toMatch(/D&D/i);
			expect(haystack, `step ${step}`).not.toMatch(/Dungeons? ?& ?Dragons/i);
		}
	});

	test('the system is named as 5E-compatible instead', async ({ page })=>{
		await goto(page);
		await expect(page.locator('.tide-lede')).toHaveText(/5E-compatible/);
	});

	test('the header is the mock’s, and Mythwright is gone', async ({ page })=>{
		await goto(page);
		await expect(page.locator('.tide-page-body h1')).toHaveText('Campaign generator');
		await expect(page.locator('.tide-eyebrow')).toHaveText('Mythforge');
		const text = await page.evaluate(()=>document.body.innerText);
		expect(text).not.toMatch(/Mythwright/i);
		expect(text).not.toMatch(/V?3\.19\.3/);
	});

	/* The <title> and the Open Graph card are rendered by Express, not by the
	 * SPA - the Vite dev server answers this route with its own index.html
	 * shell, so asking Vite for them proves nothing. Straight to the origin. */
	test('the page title and OG description carry the same wording', async ({ page })=>{
		const res = await page.request.get(`${API_URL}/new-campaign`);
		expect(res.ok(), `${API_URL} answered ${res.status()}`).toBeTruthy();
		const html = await res.text();
		expect(html).toMatch(/content="Campaign generator"/);
		expect(html).toMatch(/5E-compatible/);
		expect(html).not.toMatch(/D&amp;D 5e|D&D 5e/i);
		expect(html).not.toMatch(/Phandelver/i);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 5b - the purple gradient header. #8b5cf6 -> #7c3aed over a
 * #1a1a2e/#16213e/#0f3460 page, which is not in the Tidewatch palette at all.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the purple is gone', ()=>{
	test('no element computes to any of the wizard purples', async ({ page })=>{
		await goto(page);
		const offenders = await page.evaluate(()=>{
			// 8b5cf6, 7c3aed, 6d28d9, ede9fe - the five @wizard-* LESS variables
			// and the one hard-coded gradient stop.
			const BAD = /\b(139, 92, 246|124, 58, 237|109, 40, 217|237, 233, 254)\b/;
			const out = [];
			for (const el of document.querySelectorAll('*')) {
				const cs = getComputedStyle(el);
				for (const p of ['color', 'background-color', 'background-image',
					'border-top-color', 'border-bottom-color', 'box-shadow'])
					if(BAD.test(cs.getPropertyValue(p)))
						out.push(`${el.tagName}.${el.className} ${p}`);
			}
			return out;
		});
		expect(offenders, offenders.join('\n')).toEqual([]);
	});

	test('the header is type on the page, not a filled banner', async ({ page })=>{
		await goto(page);
		const h1 = page.locator('.tide-page-body h1');
		// A gradient banner would paint its own background behind the title.
		expect(await rgb(h1)).toBe('rgba(0, 0, 0, 0)');
		expect(await rgb(h1, 'background-image')).toBe('none');
		expect(await rgb(h1, 'font-family')).toMatch(/Cormorant Garamond/);
	});

	test('and the old page shell went with it', async ({ page })=>{
		await goto(page);
		// .wizard-header / .wizard-body / .step-dot were the purple sheet's
		// own classes; campaignWizard.less is deleted, so they must be absent.
		for (const sel of ['.wizard-header', '.wizard-body', '.step-dot', '.btn-generate', '.option-card'])
			await expect(page.locator(sel)).toHaveCount(0);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 5c - the 5-step GLASS bar over a SOLID panel.
 * 12-mythforge-generator.html: "a glass 5-step bar (Basics, World, Adventure,
 * References, Generate) over a solid panel, on campaign-cover".
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the step bar and the panel', ()=>{
	test('five steps, named as the brief names them', async ({ page })=>{
		await goto(page);
		const labels = page.locator('.tide-steps .tide-step-label');
		await expect(labels).toHaveCount(5);
		expect(await labels.allTextContents()).toEqual(STEPS);
	});

	test('the bar is glass and the panel under it is solid', async ({ page })=>{
		await goto(page);
		const bar = page.locator('.tide-steps');
		expect(await rgb(bar)).toBe('rgba(12, 17, 20, 0.8)');
		expect(await rgb(bar, 'backdrop-filter')).toMatch(/blur\(20px\)/);

		const panel = page.locator('.tide-panel');
		expect(await rgb(panel)).toBe('rgba(23, 30, 34, 0.94)');
		expect(await rgb(panel, 'backdrop-filter')).toBe('none');
	});

	/* REGRESSION. The bar was first written as a <nav>, which put it inside
	 * `body .homebrew nav` (0,0,1,2) - it outranks `.tide-steps` (0,0,1,0), so
	 * the bar rendered wearing the global top bar's background, min-height and
	 * blur. It is an <ol> now. */
	test('the bar does not inherit the global nav chrome', async ({ page })=>{
		await goto(page);
		const bar = page.locator('.tide-steps');
		expect(await bar.evaluate((el)=>el.tagName)).toBe('OL');
		expect(await rgb(bar, 'min-height')).not.toBe('48px');
		expect(await rgb(bar, 'list-style-type')).toBe('none');
	});

	test('the active step is teal, the rest are not', async ({ page })=>{
		await goto(page);
		await expect(page.locator('.tide-step.on')).toHaveCount(1);
		expect(await rgb(page.locator('.tide-step.on'))).toBe('rgba(31, 78, 95, 0.8)');
		expect(await rgb(page.locator('.tide-step.on .tide-step-num'))).toBe('rgb(79, 179, 176)');
		expect(await rgb(page.locator('.tide-step.on .tide-step-num'), 'color')).toBe('rgb(11, 31, 31)');
	});

	test('a step you have not reached is disabled, a step you have is not', async ({ page })=>{
		await goto(page);
		const steps = page.locator('.tide-steps button');
		await expect(steps.nth(0)).toBeEnabled();        // the one you are on
		for (let i = 1; i < 5; i++) await expect(steps.nth(i)).toBeDisabled();

		await advanceTo(page, 3);
		await expect(steps.nth(0)).toBeEnabled();        // done
		await expect(steps.nth(1)).toBeEnabled();        // done
		await expect(steps.nth(2)).toBeEnabled();        // current
		await expect(steps.nth(3)).toBeDisabled();
		await expect(page.locator('.tide-step.done')).toHaveCount(2);
	});

	test('the bar and the counter follow the form, forwards and back', async ({ page })=>{
		await goto(page);
		for (let step = 1; step <= 5; step++) {
			if(step > 1) {
				await page.getByRole('button', { name: 'Next step' }).click();
				await page.waitForTimeout(150);
			}
			await expect(page.locator('.tide-step.on .tide-step-label')).toHaveText(STEPS[step - 1]);
			await expect(page.locator('.tide-wizard-foot .tide-cap')).toHaveText(`Step ${step} of 5`);
		}
		// Back, then a jump via the bar itself.
		await page.getByRole('button', { name: 'Back' }).click();
		await expect(page.locator('.tide-step.on .tide-step-label')).toHaveText('References');
		await page.locator('.tide-steps button').first().click();
		await expect(page.locator('.tide-step.on .tide-step-label')).toHaveText('Basics');
	});

	test('every step renders a heading and the footer', async ({ page })=>{
		await goto(page);
		const HEADINGS = ['Campaign basics', 'World and players', 'Adventure type',
			'Reference materials', 'Review and generate'];
		for (let step = 1; step <= 5; step++) {
			if(step > 1) {
				await page.getByRole('button', { name: 'Next step' }).click();
				await page.waitForTimeout(150);
			}
			await expect(page.locator('.tide-panel h2')).toHaveText(HEADINGS[step - 1]);
			await expect(page.locator('.tide-wizard-foot')).toBeVisible();
		}
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Fix 6, on this route - Homebrewery chrome out, Tidewatch chrome in, and the
 * Mythforge sub-bar sticky under the nav with Generator marked current.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('chrome', ()=>{
	test('the Mythforge bar is here and knows where it is', async ({ page })=>{
		await goto(page);
		const bar = page.locator('.tide-mbar');
		await expect(bar).toBeVisible();
		expect(await rgb(bar, 'position')).toBe('sticky');
		await expect(bar.locator('.on')).toHaveText('Generator');
	});

	test('no parchment, maroon, gold rules or Solbera fonts', async ({ page })=>{
		await goto(page);
		const offenders = await page.evaluate(()=>{
			const FONTS = /BookInsanity|MrEaves|ScalySans|Solbera|Nodesto/i;
			// the parchment cream, the PHB maroon, the gold rule
			const COLOURS = /\b(238, 229, 206|88, 24, 13|201, 173, 106|192, 178, 131)\b/;
			const out = [];
			for (const el of document.querySelectorAll('*')) {
				const cs = getComputedStyle(el);
				if(FONTS.test(cs.fontFamily)) out.push(`${el.tagName}.${el.className} font`);
				for (const p of ['color', 'background-color', 'background-image', 'border-top-color'])
					if(COLOURS.test(cs.getPropertyValue(p))) out.push(`${el.tagName}.${el.className} ${p}`);
			}
			return out;
		});
		expect(offenders, offenders.join('\n')).toEqual([]);
	});

	test('the SRD footer is on the page', async ({ page })=>{
		await goto(page);
		await expect(page.locator('.tide-foot')).toContainText('SRD 5.2.1');
	});

	test('the art is the campaign cover, as a band, inside budget', async ({ page })=>{
		const sizes = [];
		page.on('response', async (res)=>{
			if(/\.(webp|png|jpg|jpeg|gif|avif)(\?|$)/i.test(res.url())) {
				const len = Number(res.headers()['content-length'] || 0);
				sizes.push({ url: res.url(), len });
			}
		});
		await goto(page);
		const art = page.locator('.tide-art');
		expect(await rgb(art, 'background-image')).toMatch(/campaign-cover/);
		expect(await rgb(art, 'height')).toBe('360px');

		const total = sizes.reduce((a, s)=>a + s.len, 0);
		// BUILD-BRIEF section 4: under 250 KB of art per screen at 1440.
		expect(total, JSON.stringify(sizes)).toBeLessThan(250 * 1024);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * The pipeline is NOT what this unit changes, so prove it did not.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('behaviour', ()=>{
	test('Generate posts the same parameters it always did', async ({ page })=>{
		let posted = null;
		await page.route('**/api/mythwright/generate', async (route)=>{
			posted = route.request().postDataJSON();
			await route.fulfill({
				status      : 200,
				contentType : 'application/json',
				body        : JSON.stringify({ success: false, error: 'lanem- stubbed, no model called' })
			});
		});

		await goto(page);
		await page.getByRole('button', { name: 'Campaign name' })
			.or(page.locator('.tide-input').first()).first()
			.fill('lanem- a test campaign');
		await page.getByRole('button', { name: 'Long (13–25)' }).click();
		await advanceTo(page, 5);
		await page.getByRole('button', { name: 'Generate campaign' }).click();
		await page.waitForTimeout(500);

		expect(posted).toMatchObject({
			title         : 'lanem- a test campaign',
			theme         : 'classic-fantasy',
			sessionCount  : 20,              // the "long" id's count, server-mirrored
			partySize     : 4,
			level         : 'low',
			complexity    : 'moderate',
			adventureType : 'dungeon'
		});
	});

	test('a failed generation says so, in the Tidewatch error card', async ({ page })=>{
		await page.route('**/api/mythwright/generate', (route)=>route.fulfill({
			status      : 200,
			contentType : 'application/json',
			body        : JSON.stringify({ success: false, error: 'lanem- stubbed failure' })
		}));
		await goto(page);
		await advanceTo(page, 5);
		await page.getByRole('button', { name: 'Generate campaign' }).click();
		const note = page.locator('.tide-note-error');
		await expect(note).toBeVisible();
		await expect(note).toContainText('lanem- stubbed failure');
		expect(await rgb(note, 'border-top-color')).toBe('rgba(240, 114, 111, 0.55)');
	});

	test('the party-size stepper clamps at both ends', async ({ page })=>{
		await goto(page);
		await advanceTo(page, 2);
		const minus = page.getByRole('button', { name: 'One fewer player' });
		const plus  = page.getByRole('button', { name: 'One more player' });
		const out   = page.locator('.tide-stepper output');

		await expect(out).toHaveText('4');
		for (let i = 0; i < 6; i++) if(await minus.isEnabled()) await minus.click();
		await expect(out).toHaveText('1');
		await expect(minus).toBeDisabled();
		for (let i = 0; i < 10; i++) if(await plus.isEnabled()) await plus.click();
		await expect(out).toHaveText('8');
		await expect(plus).toBeDisabled();
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * The share dialog's link box was called .tide-input, which this unit needed
 * for the generator's text fields - and tidewatch-editor.css loads later, so
 * M2's definition was silently winning. It is .tide-linkfield now; this is the
 * guard that the rename reached the component too.
 * ─────────────────────────────────────────────────────────────────────── */
test.describe('the share dialog survived the field rename', ()=>{
	test('the share link box is still the mono read-only field', async ({ page })=>{
		const res = await page.request.get(at('/api/projects'));
		expect(res.ok()).toBeTruthy();
		const body = await res.json();
		const brews = body.projects || body.brews || [];
		expect(brews.length, 'the dev store has a brew to open').toBeGreaterThan(0);
		const seeded = brews.find((b)=>String(b.title || '').startsWith('lanem-')) || brews[0];

		await page.goto(at(`/collaborate/${seeded.editId}`), { waitUntil: 'networkidle' });
		const field = page.locator('.tide-linkfield').first();
		await expect(field).toBeVisible();
		expect(await rgb(field, 'font-family')).toMatch(/JetBrains Mono|ui-monospace/);
		await expect(page.locator('.tide-input')).toHaveCount(0);
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Dead controls, on every step.
 * ─────────────────────────────────────────────────────────────────────── */
const sweepDead = async (page)=>page.evaluate(()=>{
	const out = [];
	const label = (el)=>(el.innerText || el.getAttribute('aria-label') || '')
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
		if(!label(b)) out.push(`a button has no accessible label: .${b.className}`);
		const key = Object.keys(b).find((k)=>k.startsWith('__reactProps$'));
		if(key && !b[key].onClick && b.type !== 'submit')
			out.push(`button "${label(b)}" does nothing`);
	}
	return out;
});

test.describe('dead controls', ()=>{
	test('no step has one', async ({ page })=>{
		await goto(page);
		for (let step = 1; step <= 5; step++) {
			if(step > 1) {
				await page.getByRole('button', { name: 'Next step' }).click();
				await page.waitForTimeout(150);
			}
			const dead = await sweepDead(page);
			expect(dead, `step ${step}:\n${dead.join('\n')}`).toEqual([]);
		}
	});

	test('Cancel goes to the brew library rather than nowhere', async ({ page })=>{
		await goto(page);
		const cancel = page.getByRole('link', { name: 'Cancel' });
		await expect(cancel).toHaveAttribute('href', at('/'));
		await cancel.click();
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.brewLibraryPage, .tide-grid').first()).toBeVisible();
	});
});

/* ───────────────────────────────────────────────────────────────────────
 * Contrast, over the art, against the brightest pixel behind each word.
 * ─────────────────────────────────────────────────────────────────────── */
/* minNodes guards against a run that passes because it measured almost
 * nothing. Set to ~75% of the counts the two-pass measurement actually
 * returns (44/45/39/29/39, the same at both viewports), so a step that
 * silently stops rendering half its form fails here rather than reporting a
 * clean sweep of what is left. */
const M3_STEPS = [
	{ step: 1, minNodes: 34 },
	{ step: 2, minNodes: 34 },
	{ step: 3, minNodes: 29 },
	{ step: 4, minNodes: 22 },
	{ step: 5, minNodes: 29 }
];

/* The harness skips disabled controls, which WCAG 1.4.3 does exempt - but the
 * steps you have not reached yet are disabled BUTTONS carrying informational
 * labels ("References", "Generate"), and losing them from the measurement
 * would be an accident of the markup rather than a decision. Re-enabling them
 * changes no pixel (nothing hangs off :disabled but the cursor), so they are
 * measured with everything else.
 *
 * Two passes, top and bottom. A step's form is taller than 844px, and one
 * screenshot of the first viewport would quietly leave most of it unmeasured -
 * `minNodes` would still pass. Rows are merged on their identity, so a node
 * seen in both passes is kept once, at its worst reading.
 *
 * clipTop is the sticky chrome's own height: once the page is scrolled, the
 * Mythforge bar paints over whatever is beneath it, and sampling those pixels
 * measures the BAR, not the paragraph. */
const STICKY = '.tide-mbar, nav';

const measureAll = async (page)=>{
	await page.evaluate(()=>{
		for (const b of document.querySelectorAll('.tide-steps button[disabled]'))
			b.removeAttribute('disabled');
	});

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
		await page.waitForTimeout(250);

		// Unscrolled, nothing is under the bar - the bar is still in its own
		// place in the flow - so the clip is only needed on the scrolled pass.
		const opts = where === 'top'
			? {}
			: { clipTop: await clipTop(), clipExempt: STICKY };

		for (const r of await measure(page, opts)) {
			const key = `${r.where}|${r.text}|${r.color}|${r.fontSize}`;
			const seen = rows.get(key);
			if(!seen || r.ratio < seen.ratio) rows.set(key, r);
		}
	}
	return [...rows.values()];
};

test.describe('contrast', ()=>{
	for (const { step, minNodes } of M3_STEPS) {
		test(`step ${step} has 0 text nodes below AA`, async ({ page })=>{
			await goto(page);
			await advanceTo(page, step);
			await page.evaluate(()=>document.fonts.ready);
			await page.waitForTimeout(300);
			const rows = await measureAll(page);
			expect(rows.length, 'the step rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}

	for (const { step, minNodes } of M3_STEPS) {
		test(`step ${step} has 0 text nodes below AA at 390`, async ({ page })=>{
			await page.setViewportSize({ width: 390, height: 844 });
			await goto(page);
			await advanceTo(page, step);
			await page.evaluate(()=>document.fonts.ready);
			await page.waitForTimeout(300);
			const rows = await measureAll(page);
			expect(rows.length, 'the step rendered enough text to be worth measuring')
				.toBeGreaterThanOrEqual(minNodes);
			const failing = rows.filter((r)=>!r.pass);
			expect(failing, `\n${table(failing.length ? failing : rows)}\n`).toEqual([]);
		});
	}
});
