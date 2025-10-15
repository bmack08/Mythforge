/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
import './brewRenderer.less';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ensureJson, toHTML } from 'shared/contentAdapter.js';
import _ from 'lodash';

import MarkdownLegacy from 'naturalcrit/markdownLegacy.js';
// Now using contentAdapter.toHTML() for rendering with full extension registry

import ErrorBar from './errorBar/errorBar.jsx';
import ToolBar from './toolBar/toolBar.jsx';

//TODO: move to the brew renderer
import RenderWarnings from 'homebrewery/renderWarnings/renderWarnings.jsx';
import NotificationPopup from './notificationPopup/notificationPopup.jsx';
import Frame from 'react-frame-component';
import dedent from 'dedent-tabs';
import { printCurrentBrew } from 'shared/helpers.js';

import HeaderNav from './headerNav/headerNav.jsx';
import { safeHTML } from './safeHTML.js';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
const PAGEBREAK_REGEX_LEGACY = /\\page(?:break)?/m;
const COLUMNBREAK_REGEX_LEGACY = /\\column(:?break)?/m;
const PAGE_HEIGHT = 1056; // Fallback only; we measure actual height at runtime

/**
 * Split TipTap JSON document by pageBreak nodes
 * @param {object} doc - TipTap JSON document
 * @returns {array} - Array of page objects (each page is a TipTap doc fragment)
 */
const splitTipTapPages = (doc) => {
	if (!doc || !doc.content || !Array.isArray(doc.content)) {
		return [doc]; // Return single page if invalid
	}

	const pages = [];
	let currentPage = { type: 'doc', content: [] };

	doc.content.forEach((node) => {
		// Check if this node is a pageBreak
		if (node.type === 'pageBreak') {
			// Save current page and start new one
			if (currentPage.content.length > 0) {
				pages.push(currentPage);
			}
			currentPage = { type: 'doc', content: [] };
		} else {
			// Add node to current page
			currentPage.content.push(node);
		}
	});

	// Add final page if it has content
	if (currentPage.content.length > 0) {
		pages.push(currentPage);
	}

	// Return at least one empty page if document is empty
	return pages.length > 0 ? pages : [{ type: 'doc', content: [] }];
};

// Dynamic initial content will be set in the component
const getInitialContent = (renderer = 'V3', theme = '5ePHB') => dedent`
	<!DOCTYPE html><html><head>
	<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
	<link href='/homebrew/bundle.css' type="text/css" rel='stylesheet' />
	<link href='/themes/${renderer}/${theme}/style.css' type="text/css" rel='stylesheet' />
	<base target=_blank>
	</head><body style='overflow: hidden'><div></div></body></html>`;


//v=====----------------------< Brew Page Component >---------------------=====v//
const BrewPage = (props)=>{
	props = {
		contents : '',
		index    : 0,
		...props
	};
	const pageRef   = useRef(null);
	const cleanText = safeHTML(props.contents);

	useEffect(()=>{
		if(!pageRef.current) return;

		// Observer for tracking pages within the `.pages` div
		const visibleObserver = new IntersectionObserver(
			(entries)=>{
				entries.forEach((entry)=>{
					if(entry.isIntersecting)
						props.onVisibilityChange(props.index + 1, true, false); // add page to array of visible pages.
					else
						props.onVisibilityChange(props.index + 1, false, false);
				});
			},
			{ threshold: .3, rootMargin: '0px 0px 0px 0px'  } // detect when >30% of page is within bounds.
		);

		// Observer for tracking the page at the center of the iframe.
		const centerObserver = new IntersectionObserver(
			(entries)=>{
				entries.forEach((entry)=>{
					if(entry.isIntersecting)
						props.onVisibilityChange(props.index + 1, true, true); // Set this page as the center page
				});
			},
			{ threshold: 0, rootMargin: '-50% 0px -50% 0px' } // Detect when the page is at the center
		);

		// attach observers to each `.page`
		visibleObserver.observe(pageRef.current);
		centerObserver.observe(pageRef.current);
		return ()=>{
			visibleObserver.disconnect();
			centerObserver.disconnect();
		};
	}, []);

	return <div className={props.className} id={`p${props.index + 1}`} data-index={props.index} ref={pageRef} style={props.style} {...props.attributes}>
	         <div className='columnWrapper' dangerouslySetInnerHTML={{ __html: cleanText }} />
	       </div>;
};


//v=====--------------------< Brew Renderer Component >-------------------=====v//
let renderedPages = [];
let rawPages      = [];

const BrewRenderer = (props)=>{
	props = {
		text                       : '',
		style                      : '',
		renderer                   : 'legacy',
		theme                      : '5ePHB',
		lang                       : '',
		errors                     : [],
		currentEditorCursorPageNum : 1,
		currentEditorViewPageNum   : 1,
		currentBrewRendererPageNum : 1,
		themeBundle                : {},
		onPageChange               : ()=>{},
		...props
	};

	const [state, setState] = useState({
		isMounted    : false,
		visibility   : 'hidden',
		visiblePages : [],
			centerPage   : 1
	});

	const [displayOptions, setDisplayOptions] = useState({
		zoomLevel    : 100,
		spread       : 'single',
		startOnRight : true,
		pageShadows  : true,
			rowGap       : 5,
			columnGap    : 10,
	});

	//useEffect to store or gather toolbar state from storage
	useEffect(()=>{
		const toolbarState = JSON.parse(window.localStorage.getItem('hb_toolbarState'));
		toolbarState &&	setDisplayOptions(toolbarState);
	}, []);

	const [headerState, setHeaderState] = useState(false);

		const mainRef      = useRef(null);
		const pagesRef     = useRef(null);
		const measureRef   = useRef(null); // hidden measurement container inside the iframe
		const [docPages, setDocPages] = useState([]); // auto-paginated TipTap pages
		const [paginationVersion, setPaginationVersion] = useState(0);

		const autoPaginate = true; // enable auto-pagination for TipTap JSON

			// Handle TipTap JSON content - prefer auto-pagination; fallback to manual pageBreak split
			if (props.text && typeof props.text === 'object') {
				rawPages = (autoPaginate && docPages.length > 0)
					? docPages
					: splitTipTapPages(props.text);
			} else {
		// Legacy string-based content
		const textContent = typeof props.text === 'string' ? props.text : '';
		if(props.renderer == 'legacy') {
			rawPages = textContent.split(PAGEBREAK_REGEX_LEGACY);
		} else {
			rawPages = textContent.split(PAGEBREAK_REGEX_V3);
		}
	}

		// --- Auto-pagination engine (TipTap JSON) ---
		const computePageMetrics = useCallback(()=>{
			// Measure page content height and single-column width inside the iframe
			const frameDoc = document.getElementById('BrewRenderer')?.contentDocument;
			if (!frameDoc || !measureRef.current) return null;

			// Create a temp page to measure width/height/padding using current styles
			const pageEl = frameDoc.createElement('div');
			pageEl.className = 'page phb';
			pageEl.style.visibility = 'hidden';
			pageEl.style.position = 'absolute';
			pageEl.style.left = '-99999px';
			pageEl.style.top = '-99999px';

			const wrapper = frameDoc.createElement('div');
			wrapper.className = 'columnWrapper';
			// For measurement, force one column at half-width
			wrapper.style.columnCount = '1';
			pageEl.appendChild(wrapper);
			measureRef.current.appendChild(pageEl);

			// Compute sizes
			const pageRect = pageEl.getBoundingClientRect();
			const cs = frameDoc.defaultView.getComputedStyle(pageEl);
			const padL = parseFloat(cs.paddingLeft || '0');
			const padR = parseFloat(cs.paddingRight || '0');
			const contentWidth = pageRect.width - padL - padR;
			const gap = Number(displayOptions?.columnGap ?? 10);
			const singleColWidth = (contentWidth - gap) / 2;
			const contentHeight = pageRect.height; // full interior height; assume wrapper spans it

			// Apply the single column width for measurement blocks
			wrapper.style.width = `${singleColWidth}px`;

			// Cleanup
			measureRef.current.removeChild(pageEl);

			return { singleColWidth, contentHeight, gap };
		}, [displayOptions]);

		const measureBlockHeight = useCallback((html)=>{
			const frameDoc = document.getElementById('BrewRenderer')?.contentDocument;
			if (!frameDoc || !measureRef.current) return 0;
			const metrics = computePageMetrics();
			if (!metrics) return 0;
			const { singleColWidth } = metrics;

			const pageEl = frameDoc.createElement('div');
			pageEl.className = 'page phb';
			pageEl.style.visibility = 'hidden';
			pageEl.style.position = 'absolute';
			pageEl.style.left = '-99999px';
			pageEl.style.top = '-99999px';

			const wrapper = frameDoc.createElement('div');
			wrapper.className = 'columnWrapper';
			wrapper.style.columnCount = '1';
			wrapper.style.width = `${singleColWidth}px`;
			wrapper.innerHTML = html;
			pageEl.appendChild(wrapper);
			measureRef.current.appendChild(pageEl);

			// Force layout
			const h = wrapper.getBoundingClientRect().height;

			measureRef.current.removeChild(pageEl);
			return Math.ceil(h);
		}, [computePageMetrics]);

			const paginateTipTapDoc = useCallback((doc)=>{
			if (!doc || !Array.isArray(doc.content)) return [doc];
			const frameDoc = document.getElementById('BrewRenderer')?.contentDocument;
			if (!frameDoc || !measureRef.current) return [doc];
			const metrics = computePageMetrics();
			if (!metrics) return [doc];
			const { contentHeight } = metrics;

				// Segment the document at explicit pageBreak nodes so manual breaks are honored
				const segments = [];
				let seg = [];
				for (const node of doc.content) {
					if (node?.type === 'pageBreak') {
						// push current segment (may be empty) and start a new one
						segments.push(seg);
						seg = [];
					} else {
						seg.push(node);
					}
				}
				// push last segment
				segments.push(seg);

				const paginateNodes = (nodes)=>{
					const pages = [];
					let currentNodes = [];
					let colHeights = [0, 0];

					const flushPage = ()=>{
						pages.push({ type: 'doc', content: currentNodes });
						currentNodes = [];
						colHeights = [0, 0];
					};

					// Empty segment results in a blank page to reflect a deliberate manual break
					if (!nodes || nodes.length === 0) {
						pages.push({ type: 'doc', content: [] });
						return pages;
					}

					for (const node of nodes) {
						const html = toHTML({ type:'doc', content:[node] });
						const blockH = Math.max(1, measureBlockHeight(html));

						if (colHeights[0] + blockH <= contentHeight) {
							currentNodes.push(node);
							colHeights[0] += blockH;
						} else if (colHeights[1] + blockH <= contentHeight) {
							currentNodes.push(node);
							colHeights[1] += blockH;
						} else {
							if (currentNodes.length) flushPage();
							// place on fresh page (left column) even if taller than a column
							currentNodes.push(node);
							colHeights[0] = Math.min(contentHeight, blockH);
							colHeights[1] = 0;
						}
					}
					if (currentNodes.length) flushPage();
					return pages;
				};

				// Paginate each segment independently and concatenate
				const allPages = [];
				for (const s of segments) {
					const p = paginateNodes(s);
					allPages.push(...p);
				}
				return allPages.length ? allPages : [doc];
		}, [computePageMetrics, measureBlockHeight]);

		// Recompute auto-pagination when doc or display options change
		useEffect(()=>{
			if (!state.isMounted) return;
			if (!(props.text && typeof props.text === 'object')) return;
			if (!autoPaginate) return;

			try {
				const pages = paginateTipTapDoc(props.text);
				setDocPages(pages);
				setPaginationVersion(v => v + 1);
			} catch (e) {
				// Fallback silently
				setDocPages([]);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [props.text, displayOptions, state.isMounted]);

	const handlePageVisibilityChange = (pageNum, isVisible, isCenter)=>{
		setState((prevState)=>{
			const updatedVisiblePages = new Set(prevState.visiblePages);
			if(!isCenter)
				isVisible ? updatedVisiblePages.add(pageNum) : updatedVisiblePages.delete(pageNum);

			return {
				...prevState,
				visiblePages : [...updatedVisiblePages].sort((a, b)=>a - b),
				centerPage   : isCenter ? pageNum : prevState.centerPage
			};
		});

		if(isCenter)
			props.onPageChange(pageNum);
	};

	const isInView = (index)=>{
		if(!state.isMounted)
			return false;

		if(index == props.currentEditorCursorPageNum - 1)	//Already rendered before this step
			return false;

		if(Math.abs(index - props.currentBrewRendererPageNum - 1) <= 3)
			return true;

		return false;
	};

	const renderDummyPage = (index)=>{
		return <div className='phb page' id={`p${index + 1}`} key={index}>
			<i className='fas fa-spinner fa-spin' />
		</div>;
	};

	const renderStyle = ()=>{
		const themeStyles = props.themeBundle?.joinedStyles ?? '<style>@import url("/themes/V3/Blank/style.css");</style>';
		const cleanStyle = safeHTML(`${themeStyles} \n\n <style> ${props.style} </style>`);
		return <div style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html: cleanStyle }} />;
	};

	const renderPage = (pageText, index)=>{

		let styles = {
			...(!displayOptions.pageShadows ? { boxShadow: 'none' } : {})
			// Add more conditions as needed
		};
		let classes    = 'page';
		let attributes = {};

		// Handle TipTap JSON content
		if (pageText && typeof pageText === 'object') {
			const html = toHTML(pageText);
			return <BrewPage className='page phb' index={index} key={index} contents={html} style={styles} onVisibilityChange={handlePageVisibilityChange} />;
		}
		
		// Legacy renderer
		if(props.renderer == 'legacy') {
			pageText = pageText.replace(COLUMNBREAK_REGEX_LEGACY, '```\n````\n'); // Allow Legacy brews to use `\column(break)`
			const html = MarkdownLegacy.render(pageText);
			return <BrewPage className='page phb' index={index} key={index} contents={html} style={styles} onVisibilityChange={handlePageVisibilityChange} />;
		}
		
		// V3 renderer with markdown strings
		if(pageText.startsWith('\\page')) {
			// Note: Markdown.marked.lexer was removed with markdown.js migration
			// Page styling tags are now simplified - just remove the \page line
			pageText = pageText.includes('\n') ? pageText.substring(pageText.indexOf('\n') + 1) : '';
		}

		// DO NOT REMOVE!!! REQUIRED FOR BACKWARDS COMPATIBILITY WITH NON-UPGRADABLE VERSIONS OF CHROME.
		pageText += `\n\n&nbsp;\n\\column\n&nbsp;`; //Artificial column break at page end to emulate column-fill:auto (until `wide` is used, when column-fill:balance will reappear)

		// Convert markdown string to HTML via contentAdapter
		const jsonDoc = ensureJson(pageText);
		const html = toHTML(jsonDoc);

		return <BrewPage className={classes} index={index} key={index} contents={html} style={styles} attributes={attributes} onVisibilityChange={handlePageVisibilityChange} />;
	};

	const renderPages = ()=>{
		if(props.errors && props.errors.length)
			return renderedPages;

		if(rawPages.length != renderedPages.length) // Re-render all pages when page count changes
			renderedPages.length = 0;

		// Render currently-edited page first so cross-page effects (variables, links) can propagate out first
		if(rawPages.length > props.currentEditorCursorPageNum -1)
			renderedPages[props.currentEditorCursorPageNum - 1] = renderPage(rawPages[props.currentEditorCursorPageNum - 1], props.currentEditorCursorPageNum - 1);

		_.forEach(rawPages, (page, index)=>{
			if((isInView(index) || !renderedPages[index]) && typeof window !== 'undefined'){
				renderedPages[index] = renderPage(page, index); // Render any page not yet rendered, but only re-render those in PPR range
			}
		});
		return renderedPages;
	};

	const handleControlKeys = (e)=>{
		if(!(e.ctrlKey || e.metaKey)) return;
		const P_KEY = 80;
		if(e.keyCode == P_KEY && props.allowPrint) printCurrentBrew();
		if(e.keyCode == P_KEY) {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	const scrollToHash = (hash)=>{
		if(!hash) return;

		const iframeDoc = document.getElementById('BrewRenderer').contentDocument;
		let anchor = iframeDoc.querySelector(hash);

		if(anchor) {
			anchor.scrollIntoView({ behavior: 'smooth' });
		} else {
			// Use MutationObserver to wait for the element if it's not immediately available
			new MutationObserver((mutations, obs)=>{
				anchor = iframeDoc.querySelector(hash);
				if(anchor) {
					anchor.scrollIntoView({ behavior: 'smooth' });
					obs.disconnect();
				}
			}).observe(iframeDoc, { childList: true, subtree: true });
		}
	};

	const frameDidMount = ()=>{	//This triggers when iFrame finishes internal "componentDidMount"
		scrollToHash(window.location.hash);

		setTimeout(()=>{	//We still see a flicker where the style isn't applied yet, so wait 100ms before showing iFrame
			renderPages(); //Make sure page is renderable before showing
			setState((prevState)=>({
				...prevState,
				isMounted  : true,
				visibility : 'visible'
			}));
		}, 100);
	};

	const emitClick = ()=>{ // Allow clicks inside iFrame to interact with dropdowns, etc. from outside
		if(!window || !document) return;
		document.dispatchEvent(new MouseEvent('click'));
	};

	const handleDisplayOptionsChange = (newDisplayOptions)=>{
		setDisplayOptions(newDisplayOptions);
		localStorage.setItem('hb_toolbarState', JSON.stringify(newDisplayOptions));
	};

	const pagesStyle = {
		zoom      : `${displayOptions.zoomLevel}%`,
		columnGap : `${displayOptions.columnGap}px`,
		rowGap    : `${displayOptions.rowGap}px`
	};

	const styleObject = {};

	if(global.config.deployment) {
		styleObject.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='200px'><text x='0' y='15' fill='%23fff7' font-size='20'>${global.config.deployment}</text></svg>")`;
	}

	const renderedStyle = useMemo(()=>renderStyle(), [props.style, props.themeBundle]);

	// Inline fallback container styles to ensure scroll works even if CSS isn't injected
	const containerStyle = useMemo(()=>({
		height: '100vh',
		paddingTop: 60,
		paddingBottom: 80,
		overflowY: 'auto',
		overflowX: 'hidden',
		boxSizing: 'border-box',
		overscrollBehavior: 'contain',
		...styleObject
	}), [styleObject]);
	renderedPages = useMemo(()=>renderPages(), [props.text, displayOptions]);

	return (
		<>
			{/*render dummy page while iFrame is mounting.*/}
			{!state.isMounted
				? <div className='brewRenderer'>
					<div className='pages'>
						{renderDummyPage(1)}
					</div>
				</div>
				: null}

			<ErrorBar errors={props.errors} />
			<div className='popups' ref={mainRef}>
				<RenderWarnings />
				<NotificationPopup />
			</div>

			<ToolBar displayOptions={displayOptions} onDisplayOptionsChange={handleDisplayOptionsChange} visiblePages={state.visiblePages.length > 0 ? state.visiblePages : [state.centerPage]} totalPages={rawPages.length} headerState={headerState} setHeaderState={setHeaderState}/>

			{/*render in iFrame so broken code doesn't crash the site.*/}
			<Frame id='BrewRenderer' initialContent={getInitialContent(props.renderer, props.theme)}
				style={{ width: '100%', height: '100%', minHeight: '0', visibility: state.visibility }}
				contentDidMount={frameDidMount}
				onClick={()=>{emitClick();}}
			>
				<div className={`brewRenderer ${global.config.deployment && 'deployment'}`}
					onKeyDown={handleControlKeys}
					tabIndex={-1}
					style={ containerStyle }
				>

					{/* Apply CSS from Style tab and render pages from Markdown tab */}
					{state.isMounted
						&&
						<>
							{renderedStyle}
									{/* Hidden measurement container used for auto-pagination */}
									<div ref={measureRef} style={{ position:'absolute', visibility:'hidden', pointerEvents:'none', left:-99999, top:-99999 }} />
							<div className={`pages ${displayOptions.startOnRight ? 'recto' : 'verso'}	${displayOptions.spread}`} lang={`${props.lang || 'en'}`} style={pagesStyle} ref={pagesRef}>
								{renderedPages}
							</div>
						</>
					}
				</div>
				{headerState ? <HeaderNav ref={pagesRef} /> : <></>}
		</Frame>
	</>
	);
};

export default BrewRenderer;
