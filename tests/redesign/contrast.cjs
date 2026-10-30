/* tests/redesign/contrast.cjs
 *
 * WCAG contrast for text that sits over a painting.
 *
 * Ported from the TaleForge Tidewatch redesign's own harness
 * (TaleForge-tidewatch frontend/tests/polish/redesign/contrast.ts), which is in
 * turn the algorithm visual-lift/mocks/contrast_check.py runs on the mocks.
 * CommonJS because Mythforge's node_modules is a junction that must not gain
 * packages, so these specs borrow @playwright/test through NODE_PATH and only
 * require() consults it.
 *
 * WHY A PLAIN COLOUR-PAIR CHECK IS NOT ENOUGH. "ink50 on card is 7.4:1" is a
 * statement about two tokens. Tidewatch puts text over art behind a scrim, and
 * what the reader's eye competes with is not a token - it is whichever pixel of
 * the painting happens to be behind that word. A title can clear 13:1 over the
 * dark left third of a cover and fail over the lit tower on the right.
 *
 * So this measures what the brief actually asks for: every text node at
 * >=4.5:1 (>=3:1 for large text) against the 99th-percentile background pixel
 * behind its GLYPHS, measured with the glyphs hidden.
 *
 *   1. Walk every visible element that renders its own text; record the text,
 *      its computed colour, size, weight, and the rect of each line of glyphs.
 *   2. Hide the glyphs with `color: transparent`, which leaves backgrounds,
 *      borders, art and scrims exactly as they were. Hiding the ELEMENTS would
 *      take their own background with them and measure everything against the
 *      page base.
 *   3. Screenshot, decode it in the page via canvas, and take the 99th
 *      percentile of background luminance per line.
 *   4. Ratio against 4.5, or 3.0 for large text (>=24px, or >=18.66px bold),
 *      per WCAG 2.2 1.4.3.
 *
 * The 99th percentile rather than the maximum is the mock harness's choice and
 * is kept: one antialiased pixel from a neighbouring border should not condemn
 * a paragraph.
 *
 * GLYPH rects rather than element boxes, and disabled controls skipped, are
 * both carried over from the TaleForge port - a button's own border sits
 * inside its bounding box and is not behind its text, and WCAG 1.4.3 exempts
 * inactive components.
 */

const IGNORE_SELECTOR   = '[aria-hidden="true"], script, style, noscript';
const DISABLED_SELECTOR = '[disabled], [aria-disabled="true"]';

/* Text lying under an opaque sticky bar is not text anyone is reading: the bar
 * paints over it completely. Sampling it anyway makes the bar's own fill look
 * like the paragraph's background and invents a failure - which is exactly what
 * happened to the generator's level cards once a click had scrolled them under
 * the Mythforge sub-bar. `clipTop` is the height of that chrome; a line whose
 * rect starts above it is skipped, and the same line is measured on a pass
 * where it is in the clear.
 *
 * `clipExempt` names the sticky chrome itself: its own labels sit inside that
 * band by definition and are perfectly readable there, so clipping them would
 * drop the nav and the sub-bar from every scrolled measurement.
 *
 * Both default to off, so M1's and M2's calls are unchanged. */
async function probes(page, { clipTop = 0, clipExempt = '' } = {}) {
	return page.evaluate(({ ignoreSelector, disabledSelector, clip, exempt })=>{
		const describe = (el)=>{
			const parts = [];
			let node = el;
			for (let i = 0; node && i < 3; i += 1) {
				const id = node.getAttribute?.('data-testid') || node.id;
				parts.unshift(id ? `${node.tagName.toLowerCase()}[${id}]` : node.tagName.toLowerCase());
				node = node.parentElement;
			}
			return parts.join('>');
		};

		// Text this element renders itself, not text inside its children.
		const ownText = (el)=>Array.from(el.childNodes)
			.filter((n)=>n.nodeType === 3)
			.map((n)=>(n.textContent || '').replace(/\s+/g, ' ').trim())
			.join(' ')
			.trim();

		const out = [];
		for (const el of Array.from(document.querySelectorAll('*'))) {
			if(el.closest(ignoreSelector)) continue;
			const text = ownText(el);
			if(!text) continue;

			const cs = getComputedStyle(el);
			if(cs.visibility === 'hidden' || cs.display === 'none') continue;
			if(parseFloat(cs.opacity) === 0) continue;
			if(el.closest(disabledSelector)) continue;

			const exemptFromClip = clip > 0 && exempt && el.closest(exempt);
			const rects = [];
			for (const node of Array.from(el.childNodes)) {
				if(node.nodeType !== 3) continue;
				if(!(node.textContent || '').trim()) continue;
				const range = document.createRange();
				range.selectNodeContents(node);
				for (const r of Array.from(range.getClientRects())) {
					if(r.width < 2 || r.height < 2) continue;
					if(r.bottom <= 0 || r.right <= 0) continue;
					if(!exemptFromClip && r.top < clip) continue;   // behind the sticky chrome
					if(r.top >= window.innerHeight || r.left >= window.innerWidth) continue;
					const x = Math.max(0, Math.floor(r.left));
					const y = Math.max(0, Math.floor(r.top));
					rects.push({
						x,
						y,
						w : Math.min(window.innerWidth, Math.ceil(r.right)) - x,
						h : Math.min(window.innerHeight, Math.ceil(r.bottom)) - y
					});
				}
				range.detach();
			}
			if(rects.length === 0) continue;

			out.push({
				text       : text.slice(0, 48),
				color      : cs.color,
				fontSize   : parseFloat(cs.fontSize) || 0,
				fontWeight : Number.parseInt(cs.fontWeight, 10) || 400,
				where      : describe(el),
				boxes      : rects
			});
		}
		return out;
	}, { ignoreSelector: IGNORE_SELECTOR, disabledSelector: DISABLED_SELECTOR,
		clip: clipTop, exempt: clipExempt });
}

/* sRGB relative luminance, WCAG 2.x definition. */
function relLuminance(r, g, b) {
	const f = (v)=>{
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
	const [lo, hi] = a < b ? [a, b] : [b, a];
	return (hi + 0.05) / (lo + 0.05);
}

function parseColor(css) {
	const m = css.match(/-?[\d.]+/g);
	if(!m || m.length < 3) return null;
	return [Number(m[0]), Number(m[1]), Number(m[2])];
}

async function measure(page, options = {}) {
	const found = await probes(page, options);
	if(found.length === 0) return [];

	const styleId = 'tidewatch-contrast-probe';
	await page.evaluate((id)=>{
		const el = document.createElement('style');
		el.id = id;
		el.textContent = `*, *::before, *::after {
			color: transparent !important;
			text-shadow: none !important;
			caret-color: transparent !important;
			-webkit-text-fill-color: transparent !important;
		}`;
		document.head.appendChild(el);
	}, styleId);

	const shot = (await page.screenshot({ type: 'png' })).toString('base64');
	const bg = await page.evaluate(async ({ b64, groups })=>{
		const img = new Image();
		img.src = `data:image/png;base64,${b64}`;
		await img.decode();
		const canvas = document.createElement('canvas');
		canvas.width  = img.naturalWidth;
		canvas.height = img.naturalHeight;
		const ctx = canvas.getContext('2d');
		if(!ctx) return groups.map(()=>1);
		ctx.drawImage(img, 0, 0);

		// The screenshot is in device pixels; the boxes are in CSS pixels.
		const scale = img.naturalWidth / window.innerWidth;

		const lum = (r, g, b)=>{
			const f = (v)=>{
				const c = v / 255;
				return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
		};

		const percentile = (bx)=>{
			const x = Math.round(bx.x * scale);
			const y = Math.round(bx.y * scale);
			const w = Math.max(1, Math.min(Math.round(bx.w * scale), canvas.width - x));
			const h = Math.max(1, Math.min(Math.round(bx.h * scale), canvas.height - y));
			if(x < 0 || y < 0 || w < 1 || h < 1) return 0;
			const data = ctx.getImageData(x, y, w, h).data;
			const ls = [];
			for (let i = 0; i < data.length; i += 4) ls.push(lum(data[i], data[i + 1], data[i + 2]));
			ls.sort((a, b2)=>a - b2);
			return ls[Math.max(0, Math.ceil(ls.length * 0.99) - 1)];
		};

		// One text node can wrap over several lines. Every line is measured
		// and the BRIGHTEST one decides: a paragraph is only as readable as
		// its worst line.
		return groups.map((boxes)=>Math.max(...boxes.map(percentile)));
	}, { b64: shot, groups: found.map((p)=>p.boxes) });

	await page.evaluate((id)=>document.getElementById(id)?.remove(), styleId);

	return found.map((p, i)=>{
		const rgb   = parseColor(p.color);
		const fg    = rgb ? relLuminance(rgb[0], rgb[1], rgb[2]) : 1;
		const large = p.fontSize >= 24 || (p.fontSize >= 18.66 && p.fontWeight >= 700);
		const need  = large ? 3.0 : 4.5;
		const r     = ratio(fg, bg[i]);
		return {
			text       : p.text,
			where      : p.where,
			color      : p.color,
			fontSize   : p.fontSize,
			fontWeight : p.fontWeight,
			ratio      : Math.round(r * 100) / 100,
			need,
			pass       : r >= need
		};
	});
}

/* A markdown table of the tightest rows, for the progress log. */
function table(rows, limit = 12) {
	const sorted = [...rows].sort((a, b)=>a.ratio / a.need - b.ratio / b.need);
	const lines = [
		'| text | where | colour | px | ratio | need | pass |',
		'|---|---|---|---|---|---|---|'
	];
	for (const r of sorted.slice(0, limit)) {
		lines.push(
			`| ${r.text.replace(/\|/g, '\\|')} | \`${r.where}\` | \`${r.color}\` `
			+ `| ${r.fontSize} | ${r.ratio.toFixed(2)}:1 | ${r.need} | ${r.pass ? 'yes' : 'NO'} |`
		);
	}
	return lines.join('\n');
}

/* ── Icons ──────────────────────────────────────────────────────────────
 *
 * WCAG 2.2 1.4.11: a graphic needed to understand the content has to clear
 * 3:1 against what is adjacent to it. Every icon in the Tidewatch chrome is
 * `stroke: currentColor` on a surface that may be a solid, a glass panel over
 * art, or the gradient nav - so "the token is fine" is no more an answer here
 * than it is for text, and the same screenshot method applies.
 *
 * The one difference: text is hidden with `color: transparent`, which leaves
 * the element's own background in place. For an icon the ink IS the svg, so
 * the svg is hidden with `visibility` and the host <i> - which carries no
 * background of its own - is sampled. Added by UNIT M5.
 *
 * Decorative icons are measured too, deliberately. Every icon in this chrome
 * is marked aria-hidden because it sits beside its own label, so exempting
 * them would measure nothing at all; and an icon too faint to see is still a
 * button nobody can find, label or no label. */
async function measureIcons(page, { clipTop = 0, clipExempt = '' } = {}) {
	const found = await page.evaluate(({ clip, exempt })=>{
		const describe = (el)=>{
			const parts = [];
			let node = el;
			for (let i = 0; node && i < 3; i += 1) {
				const id = node.getAttribute?.('data-testid') || node.id;
				parts.unshift(id ? `${node.tagName.toLowerCase()}[${id}]` : node.tagName.toLowerCase());
				node = node.parentElement;
			}
			return parts.join('>');
		};

		/* On this screenshot, and not underneath something else.
		 *
		 * A measurement is only meaningful for an icon the camera can see:
		 * one scrolled off the side of a horizontally scrolling toolbar gets
		 * its sample box clamped to the canvas edge and reads back whatever
		 * is at the edge, and one painted over by another element contributes
		 * no pixels at all. Both are reported by their own assertions in
		 * mythforge-m5.spec.cjs rather than being quietly folded into an
		 * ink or contrast number here. */
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
		for (const host of Array.from(document.querySelectorAll('i.tide-icon'))) {
			if(!host.querySelector('svg')) continue;
			const cs = getComputedStyle(host);
			if(cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
			if(host.closest('[disabled], [aria-disabled="true"]')) continue;
			/* Behind an open dialog. The page under a 72%-black scrim is
			 * decoration - it is aria-hidden and inert, nobody can reach it,
			 * and measuring it compares real ink against a dimmed surface and
			 * invents a failure. Unit M1 hit exactly this with text on
			 * /create-project and fixed it the same way. */
			if(host.closest('[aria-hidden="true"]:not(i):not(svg), [inert]')) continue;

			const r = host.getBoundingClientRect();
			if(r.width < 1 || r.height < 1) continue;
			if(!onCamera(r) || occluded(host, r)) continue;
			if(clip && r.top < clip && !(exempt && host.closest(exempt))) continue;

			/* Sample the middle, not the whole box. An icon's ink is centred,
			 * and the outer ring of its box belongs to whatever chip it sits
			 * in - a rounded corner, a border, or the paper showing past the
			 * edge of the splitPane's 19px toggle. Taking the 99th percentile
			 * over the full rect let four of those corner pixels report a
			 * white-on-#232B2F icon as 2.27:1. Same reasoning as the text
			 * pass using GLYPH rects rather than element boxes. */
			const inset = Math.min(3, Math.floor(Math.min(r.width, r.height) * 0.18));

			out.push({
				name  : (host.className.match(/tide-icon--([a-z0-9-]+)/) || [])[1] || '?',
				where : describe(host),
				color : cs.color,
				box   : {
					x : r.x + inset,
					y : r.y + inset,
					w : Math.max(1, r.width  - inset * 2),
					h : Math.max(1, r.height - inset * 2)
				}
			});
		}
		return out;
	}, { clip: clipTop, exempt: clipExempt });

	if(found.length === 0) return [];

	const styleId = 'tidewatch-icon-probe';
	await page.evaluate((id)=>{
		const el = document.createElement('style');
		el.id = id;
		el.textContent = 'i.tide-icon > svg { visibility: hidden !important; }';
		document.head.appendChild(el);
	}, styleId);

	const shot = (await page.screenshot({ type: 'png' })).toString('base64');
	const bg = await page.evaluate(async ({ b64, boxes })=>{
		const img = new Image();
		img.src = `data:image/png;base64,${b64}`;
		await img.decode();
		const canvas = document.createElement('canvas');
		canvas.width  = img.naturalWidth;
		canvas.height = img.naturalHeight;
		const ctx = canvas.getContext('2d');
		if(!ctx) return boxes.map(()=>1);
		ctx.drawImage(img, 0, 0);
		const scale = img.naturalWidth / window.innerWidth;
		const lum = (r, g, b)=>{
			const f = (v)=>{
				const c = v / 255;
				return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
		};
		return boxes.map((bx)=>{
			const x = Math.round(bx.x * scale);
			const y = Math.round(bx.y * scale);
			const w = Math.max(1, Math.min(Math.round(bx.w * scale), canvas.width - x));
			const h = Math.max(1, Math.min(Math.round(bx.h * scale), canvas.height - y));
			if(x < 0 || y < 0 || w < 1 || h < 1) return 0;
			const data = ctx.getImageData(x, y, w, h).data;
			const ls = [];
			for (let i = 0; i < data.length; i += 4) ls.push(lum(data[i], data[i + 1], data[i + 2]));
			ls.sort((a, b2)=>a - b2);
			return ls[Math.max(0, Math.ceil(ls.length * 0.99) - 1)];
		});
	}, { b64: shot, boxes: found.map((p)=>p.box) });

	await page.evaluate((id)=>document.getElementById(id)?.remove(), styleId);

	return found.map((p, i)=>{
		const rgb = parseColor(p.color);
		const fg  = rgb ? relLuminance(rgb[0], rgb[1], rgb[2]) : 1;
		const r   = ratio(fg, bg[i]);
		return {
			text       : p.name,
			where      : p.where,
			color      : p.color,
			fontSize   : Math.round(p.box.w),
			fontWeight : 400,
			ratio      : Math.round(r * 100) / 100,
			need       : 3.0,                 // WCAG 2.2 1.4.11, non-text contrast
			pass       : r >= 3.0
		};
	});
}

module.exports = { probes, measure, measureIcons, table };
