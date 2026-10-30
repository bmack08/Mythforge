import _       from 'lodash';
import yaml    from 'js-yaml';
import request from '../client/homebrew/utils/request-middleware.js';

// Convert the templates from a brew to a Snippets Structure.
const brewSnippetsToJSON = (menuTitle, userBrewSnippets, themeBundleSnippets=null, full=true)=>{
	const textSplit  = /^(\\snippet +.+\n)/gm;
	const mpAsSnippets = [];
	// Snippets from Themes first.
	if(themeBundleSnippets) {
		for (let themes of themeBundleSnippets) {
			if(typeof themes !== 'string') {
				const userSnippets = [];
				const snipSplit = themes.snippets.trim().split(textSplit).slice(1);
				for (let snips = 0; snips < snipSplit.length; snips+=2) {
					if(!snipSplit[snips].startsWith('\\snippet ')) break;
					const snippetName = snipSplit[snips].split(/\\snippet +/)[1].split('\n')[0].trim();
					if(snippetName.length != 0) {
						userSnippets.push({
							name : snippetName,
							icon : '',
							gen  : snipSplit[snips + 1],
						});
					}
				}
				if(userSnippets.length > 0) {
					mpAsSnippets.push({
						name        : themes.name,
						icon        : '',
						gen         : '',
						subsnippets : userSnippets
					});
				}
			}
		}
	}
	// Local Snippets
	if(userBrewSnippets) {
		const userSnippets = [];
		const snipSplit = userBrewSnippets.trim().split(textSplit).slice(1);
		for (let snips = 0; snips < snipSplit.length; snips+=2) {
			if(!snipSplit[snips].startsWith('\\snippet ')) break;
			const snippetName = snipSplit[snips].split(/\\snippet +/)[1].split('\n')[0].trim();
			if(snippetName.length != 0) {
				const subSnip = {
					name : snippetName,
					gen  : snipSplit[snips + 1],
				};
				// if(full) subSnip.icon = '';
				userSnippets.push(subSnip);
			}
		}
		if(userSnippets.length) {
			mpAsSnippets.push({
				name        : menuTitle,
				// icon        : '',
				subsnippets : userSnippets
			});
		}
	}

	const returnObj = {
		snippets : mpAsSnippets
	};

	if(full) {
		returnObj.groupName = 'Brew Snippets';
		returnObj.icon = 'fas fa-th-list';
		returnObj.view = 'text';
	}

	return returnObj;
};

const yamlSnippetsToText = (yamlObj)=>{
	if(typeof yamlObj == 'string') return yamlObj;

	let snippetsText = '';
	
	for (let snippet of yamlObj) {
		for (let subSnippet of snippet.subsnippets) {
			snippetsText = `${snippetsText}\\snippet ${subSnippet.name}\n${subSnippet.gen || ''}\n`;
		}
	}
	return snippetsText;
};

const splitTextStyleAndMetadata = (brew)=>{
	brew.text = brew.text.replaceAll('\r\n', '\n');
	if(brew.text.startsWith('```metadata')) {
		const index = brew.text.indexOf('\n```\n\n');
		const metadataSection = brew.text.slice(11, index + 1);
		const metadata = yaml.load(metadataSection);
		Object.assign(brew, _.pick(metadata, ['title', 'description', 'tags', 'systems', 'renderer', 'theme', 'lang']));
		brew.snippets = yamlSnippetsToText(_.pick(metadata, ['snippets']).snippets || '');
		brew.text = brew.text.slice(index + 6);
	}
	if(brew.text.startsWith('```css')) {
		const index = brew.text.indexOf('\n```\n\n');
		brew.style = brew.text.slice(7, index + 1);
		brew.text = brew.text.slice(index + 6);
	}

	// Handle old brews that still have empty strings in the tags metadata
	if(typeof brew.tags === 'string') brew.tags = brew.tags ? [brew.tags] : [];
};

const printCurrentBrew = ()=>{
	if(window.typeof !== 'undefined') {
		window.frames['BrewRenderer'].contentWindow.print();
		//Force DOM reflow; Print dialog causes a repaint, and @media print CSS somehow makes out-of-view pages disappear
		const node = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer').item(0);
		node.style.display='none';
		node.offsetHeight; // accessing this is enough to trigger a reflow
		node.style.display='';
	}
};

/* UNIT M8 - WHICH STYLESHEET A STORED THEME ACTUALLY RENDERS IN.
 *
 * Two V3 themes ship only a `style.less`: 5ePHB and 5eDMG. A .less file becomes
 * CSS only after scripts/buildHomebrew.js writes build/themes/..., a step this
 * checkout has never run and that `npm run build` (vite build) does not do. So
 * /themes/V3/5ePHB/style.css is a 404 and always has been, and a brew storing
 * either theme has no stylesheet to render in at all.
 *
 * Until M8 that never showed, for the wrong reason: the preview iframe's
 * stylesheet <link> is written once from react-frame-component's
 * `initialContent`, which is evaluated at FIRST MOUNT - before the brew has
 * loaded - so every brew got whatever the DEFAULT theme was, whatever it had
 * stored. M2 made that default Tome, so a 5ePHB brew silently previewed in
 * Tome and looked fine.
 *
 * M8 moves the default to Inkmarch, which would have turned that accident into
 * a visible regression: every brew already saved - Tome ones included - would
 * have previewed in Inkmarch. brewRenderer.jsx now keys the Frame on the
 * resolved theme so the iframe follows the brew instead of the default, and
 * this map keeps the one behaviour the owner asked to preserve: a brew that
 * stores a legacy V3 PHB/DMG theme still renders in Tome.
 *
 * 5eDMG is here for the same reason as 5ePHB and not because the brief named
 * it: it is the identical case - .less only, hidden since M2, nothing to serve.
 * Remove either line and those brews render with no theme CSS at all.
 *
 * Everything else, Inkmarch and Tome included, resolves to itself. */
const THEME_RENDER_ALIAS = {
	V3 : { '5ePHB': 'Tome', '5eDMG': 'Tome' }
};

const resolveRenderTheme = (renderer, theme)=>THEME_RENDER_ALIAS[renderer]?.[theme] ?? theme;

const fetchThemeBundle = async (obj, renderer, theme)=>{
	// Provide default fallbacks for renderer and theme
	const finalRenderer = renderer || 'V3';
	// UNIT M8: Inkmarch is the default output theme, and a stored legacy
	// PHB/DMG theme is bundled as Tome - the same resolution the preview's
	// stylesheet link uses, so the bundle and the sheet can never disagree.
	const finalTheme = resolveRenderTheme(finalRenderer, theme || 'Inkmarch');
	
	if(!finalRenderer || !finalTheme) {
		console.log('❌ fetchThemeBundle: Missing renderer or theme', { renderer: finalRenderer, theme: finalTheme });
		return;
	}
	// Add cache-busting parameter to ensure fresh theme bundle
	const cacheBuster = Date.now();
	console.log(`🎨 fetchThemeBundle: Requesting ${finalRenderer}/${finalTheme} (cb=${cacheBuster})`);
	const res = await request
			.get(`/api/theme/${finalRenderer}/${finalTheme}?cb=${cacheBuster}`)
			.catch((err)=>{
				console.error('❌ fetchThemeBundle: Request failed', err);
				obj.setState({ error: err });
			});
	if(!res) {
		console.error('❌ fetchThemeBundle: No response received');
		obj.setState((prevState)=>({
			...prevState,
			themeBundle : {}
		}));
		return;
	}
	const themeBundle = res.body;
	console.log('✅ fetchThemeBundle: Response received', { 
		stylesCount: themeBundle.styles?.length, 
		name: themeBundle.name 
	});
	themeBundle.joinedStyles = themeBundle.styles.map((style)=>`<style>${style}</style>`).join('\n\n');
	console.log('✅ fetchThemeBundle: joinedStyles created', { 
		joinedStylesLength: themeBundle.joinedStyles.length 
	});
	obj.setState((prevState)=>({
		...prevState,
		themeBundle : themeBundle,
		error       : null
	}));
};

const debugTextMismatch = (clientTextRaw, serverTextRaw, label) => {
	const clientText = clientTextRaw?.normalize('NFC') || '';
	const serverText = serverTextRaw?.normalize('NFC') || '';

	const clientBuffer = Buffer.from(clientText, 'utf8');
	const serverBuffer = Buffer.from(serverText, 'utf8');

	if (clientBuffer.equals(serverBuffer)) {
		console.log(`✅ ${label} text matches byte-for-byte.`);
		return;
	}

	console.warn(`❗${label} text mismatch detected.`);
	console.log(`Client length: ${clientBuffer.length}`);
	console.log(`Server length: ${serverBuffer.length}`);

	// Byte-level diff
	for (let i = 0; i < Math.min(clientBuffer.length, serverBuffer.length); i++) {
		if (clientBuffer[i] !== serverBuffer[i]) {
			console.log(`Byte mismatch at offset ${i}: client=0x${clientBuffer[i].toString(16)} server=0x${serverBuffer[i].toString(16)}`);
			break;
		}
	}

	// Char-level diff
	for (let i = 0; i < Math.min(clientText.length, serverText.length); i++) {
		if (clientText[i] !== serverText[i]) {
			console.log(`Char mismatch at index ${i}:`);
			console.log(`  Client: '${clientText[i]}' (U+${clientText.charCodeAt(i).toString(16).toUpperCase()})`);
			console.log(`  Server: '${serverText[i]}' (U+${serverText.charCodeAt(i).toString(16).toUpperCase()})`);
			break;
		}
	}
}

export {
	splitTextStyleAndMetadata,
	printCurrentBrew,
	fetchThemeBundle,
	resolveRenderTheme,
	brewSnippetsToJSON,
	debugTextMismatch
};
