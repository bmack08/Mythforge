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
	const isImageRequest = req.get('Accept')?.split(',')
        ?.filter((h)=>!h.includes('q='))
        ?.every((h)=>/image\/.*/.test(h));
	if(isImageRequest && !OWN_ICONS.test(req.url || '') && !(isLocalEnvironment && req.url?.startsWith('/staticImages'))) {
		return res.status(406).send({
			message : 'Request for image at this URL is not supported'
		});
	}

	next();
};
