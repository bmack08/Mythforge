/* client/art/tidewatch/art.js
 *
 * The Tidewatch art layer's single source of truth. Every image here is
 * already-approved TaleForge art (visual-lift/art), copied in at the one size
 * each screen actually needs - no new generations, nothing from WotC.
 *
 * Imported through Vite rather than referenced as a string path so the build
 * emits them as real assets and a typo becomes a build error rather than a
 * silent empty rectangle at runtime.
 *
 * Weight budget (BUILD-BRIEF section 4: under 250 KB of art per screen at 1440):
 *   library  = workshop 23.3 KB + 4 covers 43.9 KB = 67.2 KB
 *   notFound = harbour 11.9 KB
 */
import workshop     from './creations-workshop-1280.webp';
import harbour      from './home-harbour-1280.webp';
import emberForge   from './cover-ember-forge-480.webp';
import glassThrone  from './cover-glass-throne-480.webp';
import campaignCover from './campaign-cover-1280.webp';

export const ART = {
	workshop,
	harbour,
	emberForge,
	glassThrone,
	campaignCover
};

/* The covers a brew card can draw, in a fixed order. Real brews carry no cover
 * image of their own yet, so one is assigned. */
const COVERS = [emberForge, glassThrone, campaignCover, workshop];

const hash = (key)=>{
	const s = String(key ?? '');
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	return h;
};

/* Pick a cover per brew for ONE rendered list.
 *
 * Hashing the id alone is stable but collides: with four brews and four covers
 * the first run of this put the same tower on three of the four cards, which
 * reads as a bug rather than as decoration. So the hash only sets each brew's
 * PREFERENCE, and the list is then dealt distinct covers while the supply
 * lasts - a greedy pass in list order. Past COVERS.length cards it falls back
 * to the preference and repeats, which is fine: by then no two repeats are
 * adjacent on a four-column grid.
 *
 * The result depends on the list, not just the id, so a brew's cover can
 * change when the list is re-sorted. That is the trade for not shipping four
 * identical cards, and it costs nothing a reader relies on.
 */
export const coversFor = (keys)=>{
	const used = new Set();
	return keys.map((key)=>{
		const want = hash(key) % COVERS.length;
		if(!used.has(want)) { used.add(want); return COVERS[want]; }
		for (let step = 1; step < COVERS.length; step++) {
			const alt = (want + step) % COVERS.length;
			if(!used.has(alt)) { used.add(alt); return COVERS[alt]; }
		}
		return COVERS[want];   // every cover already spoken for
	});
};

/* A single brew's cover, for anywhere that has no list to deal from. */
export const coverFor = (key)=>COVERS[hash(key) % COVERS.length];

/* `url(...)` for a CSS custom property. Kept here so no component has to
 * remember the quoting rules. */
export const cssUrl = (src)=>`url(${JSON.stringify(src)})`;

export default ART;
