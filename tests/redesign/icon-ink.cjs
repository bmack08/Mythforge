/* tests/redesign/icon-ink.cjs
 *
 * "Is there ink in that box?" - the only question that distinguishes a drawn
 * icon from the empty box the owner reported, and it is harder to answer than
 * it looks.
 *
 * WHAT DOES NOT WORK, measured rather than assumed:
 *
 *   * `svg.getBBox()` is the obvious instrument and it is wrong for a stroked
 *     icon set. getBBox measures FILL geometry, and Chromium returns 0x0 for a
 *     <line>; four of the vendored Lucide icons (sliders-horizontal, hash,
 *     italic, frame) are drawn entirely from <line>, so a perfectly good icon
 *     reports an empty box. Individual straight <path> segments report 0 in one
 *     dimension for the same reason - `plus` comes back as two paths of 14x0
 *     and 0x14. `getBBox({ stroke: true })` is specified to include the stroke
 *     and is NOT honoured on the root <svg> in this Chromium: it returns 0x0
 *     for sliders-horizontal too.
 *   * counting child elements proves markup exists, which is exactly what
 *     every previous version of this bug already had.
 *   * a non-zero bounding CLIENT rect proves the box exists. The box was never
 *     the problem. The box is what tofu IS.
 *
 * WHAT THIS DOES. Two screenshots of the same page - one as rendered, one with
 * every icon host hidden with `visibility` - and a per-icon pixel diff over the
 * icon's own rect. Hiding by `visibility` leaves layout untouched, so the two
 * frames line up pixel for pixel and the difference is precisely the ink the
 * icon contributed. It works the same for an inline <svg>, for a Font Awesome
 * glyph, and for a `fac` CSS mask - which matters, because all three are on
 * screen in Mythforge and all three have failed in this codebase.
 *
 * Added by UNIT M5.
 */

/* Every element that is, or claims to be, an icon. */
const ICON_SELECTOR = 'i, .tide-icon, .fa, .fas, .far, .fab, .fac, [class*="fa-"]';

async function measureInk(page) {
	const found = await page.evaluate((sel)=>{
		const describe = (el)=>{
			const parts = [];
			let node = el;
			for (let i = 0; node && i < 3; i += 1) {
				parts.unshift(node.tagName.toLowerCase() + (node.id ? `[${node.id}]` : ''));
				node = node.parentElement;
			}
			return parts.join('>');
		};

		/* Only icons the camera can actually see. One scrolled off the side of
		 * a horizontally scrolling toolbar, or painted over by another
		 * element, contributes no pixels to this frame - which is a layout
		 * question, reported by its own assertion in mythforge-m5.spec.cjs,
		 * not an icon that failed to draw. */
		const onCamera = (r)=>r.bottom > 0 && r.top < window.innerHeight
			&& r.right > 0 && r.left < window.innerWidth;
		const occluded = (el, r)=>{
			const cx = r.x + r.width / 2;
			const cy = r.y + r.height / 2;
			if(cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return true;
			const top = document.elementFromPoint(cx, cy);
			if(!top) return true;
			return !(top === el || el.contains(top) || top.contains(el));
		};

		const out = [];
		let index = 0;
		for (const el of document.querySelectorAll(sel)) {
			if(el.tagName === 'svg' || el.closest('svg')) continue;
			const cs = getComputedStyle(el);
			const r  = el.getBoundingClientRect();
			if(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
			if(r.width < 1 || r.height < 1) continue;
			if(!onCamera(r) || occluded(el, r)) continue;
			/* Behind an open dialog: the scrim is painted over it in BOTH
			 * frames, so whatever ink is left is not ink anybody can see.
			 * Unit M1 drew the same line for text. */
			if(el.closest('[aria-hidden="true"]:not(i):not(svg), [inert]')) continue;

			const cls  = (el.className || '').toString().trim();
			const mask = (cs.maskImage && cs.maskImage !== 'none') ? cs.maskImage
				: ((cs.webkitMaskImage && cs.webkitMaskImage !== 'none') ? cs.webkitMaskImage : null);

			let kind = 'font';
			if(el.querySelector('svg')) kind = 'svg';
			else if(mask) kind = 'mask';
			else if((el.textContent || '').trim()) kind = 'text';

			el.setAttribute('data-tide-ink', String(index));
			out.push({
				idx   : index,
				/* Set by measureInkAll() so a walk down a long page can tell
				 * "this icon again" from "a new icon". Absent for a plain
				 * single-screen measureInk(). */
				id    : el.getAttribute('data-tide-icon-id'),
				kind,
				cls,
				where : describe(el),
				name  : (cls.match(/tide-icon--([a-z0-9-]+)/) || [])[1]
					|| (cls.match(/fa-([a-z0-9-]+)/) || [])[1]
					|| cls.split(/\s+/).pop() || '?',
				box   : { x: r.x, y: r.y, w: r.width, h: r.height }
			});
			index += 1;
		}
		return out;
	}, ICON_SELECTOR);

	if(found.length === 0) return [];

	const before = (await page.screenshot({ type: 'png' })).toString('base64');

	const styleId = 'tidewatch-ink-probe';
	await page.evaluate((id)=>{
		const el = document.createElement('style');
		el.id = id;
		el.textContent = '[data-tide-ink] { visibility: hidden !important; }';
		document.head.appendChild(el);
	}, styleId);

	const after = (await page.screenshot({ type: 'png' })).toString('base64');

	const diffs = await page.evaluate(async ({ a, b, boxes })=>{
		const load = async (b64)=>{
			const img = new Image();
			img.src = `data:image/png;base64,${b64}`;
			await img.decode();
			const c = document.createElement('canvas');
			c.width = img.naturalWidth;
			c.height = img.naturalHeight;
			const ctx = c.getContext('2d');
			ctx.drawImage(img, 0, 0);
			return { ctx, c };
		};
		const A = await load(a);
		const B = await load(b);
		const scale = A.c.width / window.innerWidth;

		return boxes.map((bx)=>{
			const x = Math.max(0, Math.round(bx.x * scale));
			const y = Math.max(0, Math.round(bx.y * scale));
			const w = Math.max(1, Math.min(Math.round(bx.w * scale), A.c.width - x));
			const h = Math.max(1, Math.min(Math.round(bx.h * scale), A.c.height - y));
			if(w < 1 || h < 1) return { ink: 0, total: 0 };
			const da = A.ctx.getImageData(x, y, w, h).data;
			const db = B.ctx.getImageData(x, y, w, h).data;
			let ink = 0;
			/* 12/255 per channel: well above PNG-identical noise, well below
			 * the difference an anti-aliased stroke makes against any of the
			 * Tidewatch surfaces. */
			for (let i = 0; i < da.length; i += 4) {
				if(Math.abs(da[i] - db[i]) > 12
					|| Math.abs(da[i + 1] - db[i + 1]) > 12
					|| Math.abs(da[i + 2] - db[i + 2]) > 12) ink += 1;
			}
			return { ink, total: w * h };
		});
	}, { a: before, b: after, boxes: found.map((f)=>f.box) });

	await page.evaluate((id)=>{
		document.getElementById(id)?.remove();
		for (const el of document.querySelectorAll('[data-tide-ink]')) el.removeAttribute('data-tide-ink');
	}, styleId);

	return found.map((f, i)=>({
		...f,
		ink   : diffs[i].ink,
		total : diffs[i].total,
		share : diffs[i].total ? Math.round((diffs[i].ink / diffs[i].total) * 1000) / 1000 : 0
	}));
}

/* A markdown table of the faintest icons, for the progress log. */
function inkTable(rows, limit = 12) {
	const sorted = [...rows].sort((a, b)=>a.ink - b.ink);
	const lines = ['| icon | kind | where | box | ink px | share |', '|---|---|---|---|---|---|'];
	for (const r of sorted.slice(0, limit)) {
		lines.push(`| ${r.name} | ${r.kind} | \`${r.where}\` | ${Math.round(r.box.w)}x${Math.round(r.box.h)} | ${r.ink} | ${r.share} |`);
	}
	return lines.join('\n');
}

/* Scroll everything that scrolls to its end.
 *
 * `window.scrollTo(0, document.body.scrollHeight)` is the obvious move and it
 * is a no-op on half of Mythforge: the docs pages, the vault and the editor
 * all scroll inside a CONTAINER, and on /changelog `document.body.scrollHeight`
 * is exactly the viewport height while the first inline `{{fas,…}}` icon sits
 * 6,019px down inside `.tide-doc-article`'s scroller. A bottom pass that only
 * moves the window measures the same first screen twice and reports it as
 * coverage.
 *
 * Returns how many elements actually moved, so a caller can tell a page with
 * nothing below the fold from a scroll that silently did nothing. */
async function scrollToBottom(page) {
	const moved = await page.evaluate(()=>{
		let n = 0;
		const targets = [document.scrollingElement, ...document.querySelectorAll('*')];
		for (const el of targets) {
			if(!el) continue;
			if(el.scrollHeight - el.clientHeight < 40) continue;
			const before = el.scrollTop;
			el.scrollTop = el.scrollHeight;
			if(el.scrollTop !== before) n += 1;
		}
		return n;
	});
	await page.waitForTimeout(500);
	return moved;
}

/* Every icon on the page, not just the ones on the first screen.
 *
 * measureInk() is a screenshot, so it can only report what the camera can see,
 * and "top of page plus bottom of page" is not coverage: /changelog is about
 * 40,000px long and its thirteen inline `{{fas,…}}` icons are all in the first
 * fifth, so both of those passes miss every one of them.
 *
 * This walks instead. Each icon gets a stable id, then: scroll the first
 * un-measured one into view, measure that screen, mark everything it saw,
 * repeat. Bounded by maxPasses so a page that somehow never settles stops
 * rather than spins, and the caller is told how many it could not reach.
 *
 * Returns { rows, unreached, passes }. */
async function measureInkAll(page, { maxPasses = 40 } = {}) {
	const total = await page.evaluate((sel)=>{
		let n = 0;
		for (const el of document.querySelectorAll(sel)) {
			if(el.tagName === 'svg' || el.closest('svg')) continue;
			el.setAttribute('data-tide-icon-id', String(n++));
		}
		return n;
	}, ICON_SELECTOR);

	const rows = [];
	const seen = new Set();
	let passes = 0;

	for (; passes < maxPasses; passes += 1) {
		const batch = await measureInk(page);
		for (const r of batch) {
			if(r.id === null || r.id === undefined || seen.has(r.id)) continue;
			seen.add(r.id);
			rows.push(r);
		}

		const scrolled = await page.evaluate((measured)=>{
			const done = new Set(measured);
			for (const el of document.querySelectorAll('[data-tide-icon-id]:not([data-tide-tried])')) {
				if(done.has(el.getAttribute('data-tide-icon-id'))) continue;
				const cs = getComputedStyle(el);
				if(cs.display === 'none' || cs.visibility === 'hidden') continue;
				const r = el.getBoundingClientRect();
				if(r.width < 1 || r.height < 1) continue;
				/* Mark it tried BEFORE scrolling. Without this the loop can
				 * pick the same element every pass - one that scrolls into
				 * view but is then covered, so measureInk skips it and it is
				 * still "not done" next time round - and burn every pass on
				 * it while the rest of the page goes unmeasured. */
				el.setAttribute('data-tide-tried', '1');
				/* `inline` as well as `block`: at 390 the editor's snippet bar
				 * scrolls SIDEWAYS, and a walk that only scrolls vertically
				 * leaves a dozen tools at x = -140 or x = 516 and calls them
				 * unreachable. */
				el.scrollIntoView({ block: 'center', inline: 'center' });
				return true;
			}
			return false;
		}, [...seen]);

		if(!scrolled) break;
		await page.waitForTimeout(350);
	}

	/* CONFIRM EVERY SUSPECT BEFORE REPORTING IT.
	 *
	 * A walk down a dense, scrolling page produces false blanks: an icon in a
	 * horizontally scrolling toolbar can be on camera for the frame that
	 * measured it and covered by the time the second frame is taken, which
	 * reads as zero ink. So anything the walk thinks is blank is scrolled into
	 * view ON ITS OWN and measured again, and only the second reading counts.
	 * An icon that cannot be measured even then is not a blank icon - it is an
	 * unmeasurable one, and it is counted as unreached instead, which is the
	 * honest distinction. */
	const suspects = rows.filter((r)=>r.kind !== 'text' && (r.share < 0.03 || r.ink < 4));
	let unmeasurable = 0;
	for (const suspect of suspects) {
		await page.evaluate((id)=>{
			document.querySelector(`[data-tide-icon-id="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' });
		}, suspect.id);
		await page.waitForTimeout(250);
		const again = (await measureInk(page)).find((r)=>r.id === suspect.id);
		const i = rows.indexOf(suspect);
		if(again) {
			rows[i] = { ...again, recheck: true };
		} else {
			// Could not be brought on camera clear of everything else.
			rows.splice(i, 1);
			unmeasurable += 1;
		}
	}

	/* `unreached` is for icons the walk NEVER EVEN TRIED - the case that would
	 * mean a page went unmeasured and nobody noticed. An icon that was scrolled
	 * to and still could not be measured was covered by something at that
	 * moment; that is occlusion, it is asserted on its own in
	 * mythforge-m5.spec.cjs, and it is counted separately here. */
	const neverSeen = await page.evaluate((measured)=>{
		const done = new Set(measured);
		let n = 0;
		for (const el of document.querySelectorAll('[data-tide-icon-id]:not([data-tide-tried])')) {
			if(done.has(el.getAttribute('data-tide-icon-id'))) continue;
			const cs = getComputedStyle(el);
			const r = el.getBoundingClientRect();
			// Hidden and unreachable is fine. Visible and unreachable is not,
			// and that is what this counts.
			if(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
			if(r.width < 1 || r.height < 1) continue;
			// Behind an open dialog, or painted over by something: neither is
			// an icon that failed to draw, and both are asserted elsewhere.
			if(el.closest('[aria-hidden="true"]:not(i):not(svg), [inert]')) continue;
			const cx = r.x + r.width / 2;
			const cy = r.y + r.height / 2;
			if(cx >= 0 && cy >= 0 && cx <= window.innerWidth && cy <= window.innerHeight) {
				const top = document.elementFromPoint(cx, cy);
				if(top && !(top === el || el.contains(top) || top.contains(el))) continue;
			}
			n += 1;
		}
		return n;
	}, [...seen]);

	const tried = await page.evaluate(()=>{
		const n = document.querySelectorAll('[data-tide-tried]').length;
		for (const el of document.querySelectorAll('[data-tide-icon-id]')) {
			el.removeAttribute('data-tide-icon-id');
			el.removeAttribute('data-tide-tried');
		}
		return n;
	});

	return { rows, unreached: neverSeen, unmeasurable, tried, passes: passes + 1, total };
}

module.exports = { measureInk, measureInkAll, inkTable, scrollToBottom, ICON_SELECTOR };
