import dedent from 'dedent-tabs';

// Map each actual page to its footer label, accounting for skips or numbering resets
const mapPages = (pages)=>{
	let actualPage = 0;
	let mappedPage = 0; // Number displayed in footer
	const pageMap    = [];

	pages.forEach((page)=>{
		actualPage++;
		const doSkip  = page.querySelector('.skipCounting');
		const doReset = page.querySelector('.resetCounting');

		if(doReset)
			mappedPage = 1;
		if(!doSkip && !doReset)
			mappedPage++;

		pageMap[actualPage] = {
			mappedPage : mappedPage,
			showPage   : !doSkip
		};
	});
	return pageMap;
};

const getMarkdown = (headings, pageMap)=>{
	const levelPad    = ['- ###', '  - ####', '    -', '      -', '        -', '          -'];

	const allMarkdown = [];
	const depthChain  = [0];

	headings.forEach((heading, index)=>{
		const pageElement = heading.closest('.page');
		if (!pageElement) {
			console.warn(`[ToC] Heading ${index} not inside a .page element:`, heading.textContent);
			return;
		}

		const pageId = pageElement.id;
		if (!pageId || !pageId.startsWith('p')) {
			console.warn(`[ToC] Page element missing valid id (expected p1, p2, etc.):`, pageId);
			return;
		}

		const page       = parseInt(pageId.replace(/^p/, ''));
		const pageInfo   = pageMap[page];

		if (!pageInfo) {
			console.warn(`[ToC] No page map entry for page ${page}`);
			return;
		}

		const mappedPage = pageInfo.mappedPage;
		const showPage   = pageInfo.showPage;
		const title      = heading.textContent.trim();
		const ToCExclude = getComputedStyle(heading).getPropertyValue('--TOC');
		const depth      = parseInt(heading.tagName.substring(1));

		if(!title || !showPage || ToCExclude == 'exclude') {
			console.log(`[ToC] Skipping heading: title="${title}", showPage=${showPage}, ToCExclude="${ToCExclude}"`);
			return;
		}

		//If different header depth than last, remove indents until nearest higher-level header, then indent once
		if(depth !== depthChain[depthChain.length -1]) {
			while (depth <= depthChain[depthChain.length - 1]) {
				depthChain.pop();
			}
			depthChain.push(depth);
		}

		const markdown = `${levelPad[depthChain.length - 2]} [{{${title}}}{{${mappedPage}}}](#p${page})`;
		allMarkdown.push(markdown);
		console.log(`[ToC] Added: "${title}" (H${depth}) -> Page ${mappedPage}`);
	});

	console.log(`[ToC] Generated ${allMarkdown.length} ToC entries`);
	return allMarkdown.join('\n');
};

const getTOC = ()=>{
	const iframe = document.getElementById('BrewRenderer');
	if (!iframe) {
		console.error('[ToC] BrewRenderer iframe not found');
		return '<!-- ToC Error: BrewRenderer iframe not found -->';
	}

	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	if (!iframeDocument) {
		console.error('[ToC] Could not access iframe document');
		return '<!-- ToC Error: Could not access iframe document -->';
	}

	const headings = iframeDocument.querySelectorAll('h1, h2, h3, h4, h5, h6');
	const pages    = iframeDocument.querySelectorAll('.page');

	console.log(`[ToC] Found ${headings.length} headings and ${pages.length} pages`);

	if (headings.length === 0) {
		return '<!-- No headings found. Add headings to your document to generate a Table of Contents. -->';
	}

	if (pages.length === 0) {
		return '<!-- No pages found. The document must be rendered first. -->';
	}

	const pageMap = mapPages(pages);
	return getMarkdown(headings, pageMap);
};

export default function(props){
	const TOC = getTOC();

	return dedent`
		{{toc,wide
		# Contents

		${TOC}
		}}
		\n`;
};