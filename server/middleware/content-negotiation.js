import config from '../config.js';
const nodeEnv = config.get('node_env');
const isLocalEnvironment = config.get('local_environments').includes(nodeEnv);

/* The app's own icon set, which this guard must not block.
 *
 * client/icons/customIcons.less pulls these in with mask-image: url(...), so
 * the browser asks for them with an image-only Accept header - exactly what
 * the check below is looking for. The guard exists to stop this server being
 * used as an image host for other people's pages; our own stylesheet asking
 * for our own toolbar glyphs is not that, and refusing it renders them as
 * empty boxes. Found by unit M4: the changelog documents those glyphs inline,
 * so the docs page asked for eleven of them and got eleven 406s. */
const OWN_ICONS = /^\/icons\//;

export default (req, res, next)=>{
	// Only the unweighted parts of Accept are considered, because the
	// `*/*;q=0.8` tail every browser appends would otherwise make nothing an
	// image request. But that leaves a trap: if EVERY part is weighted, the
	// filtered list is empty, and `[].every()` is true - so a request that names
	// no concrete type at all was being treated as image-only and refused.
	//
	// Chrome asks for a webfont with exactly that shape:
	//
	//   Accept: application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8
	//
	// which made this server answer 406 to every @font-face in the app. Found in
	// UNIT M5, while chasing why `document.fonts` reported eleven families in
	// error - Davek, Iokharic and Rellanic among them, which are the rune ICON
	// fonts, so the snippet bar's rune glyphs were empty boxes. The paper fonts
	// (Bookinsanity, Mr Eaves, Scaly Sans and the rest) were failing the same
	// way, which is the loose end UNIT M2 wrote down.
	//
	// `length > 0` is the whole fix, and it only ever NARROWS the guard: a
	// request has to actually name an image type to be refused.
	const accept = req.get('Accept')?.split(',')
        ?.filter((h)=>!h.includes('q='));
	const isImageRequest = accept?.length > 0 && accept.every((h)=>/image\/.*/.test(h));
	if(isImageRequest && !OWN_ICONS.test(req.url || '') && !(isLocalEnvironment && req.url?.startsWith('/staticImages'))) {
		return res.status(406).send({
			message : 'Request for image at this URL is not supported'
		});
	}

	next();
};
