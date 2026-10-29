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

module.exports = { probes, measure, table };
