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

module.exports = { measureInk, inkTable, ICON_SELECTOR };
