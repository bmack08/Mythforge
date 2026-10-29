/* eslint-disable camelcase */
// Removed core-js polyfill - Vite handles polyfills via build.target
import './homebrew.less';

// Import Font Awesome CSS directly (LESS can't resolve npm packages in @import)
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/regular.css';

// Import non-FA icon fonts (Elderberry Inn, Game Icons, Dice) with corrected paths
import '../styles/iconFonts.less';

// Tidewatch app chrome. LAST on purpose: it overrides the inherited Homebrewery
// nav styling (navbar.less, mythwright-navbar.less) without those files having
// to be rewritten, and CSS order is the whole mechanism.
import '../styles/tidewatch.css';

// The editor's own chrome: it overrides tiptap.less, snippetbar.less,
// TipTapToolbar.less and toolBar.less, all of which are imported by the
// components themselves and so land earlier in the graph. Must follow
// tidewatch.css, which defines the tokens it reads.
import '../styles/tidewatch-editor.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { StaticRouter as Router, Route, Routes, useParams, useSearchParams } from 'react-router';
import BASE_PATH, { prefixPath, stripPrefix } from './utils/basePath.js';

// Global fetch interceptor: auto-prefix internal paths with BASE_PATH.
// This catches all fetch('/api/...') and fetch('/themes/...') calls across
// the entire app without needing to modify each file individually.
if (typeof window !== 'undefined' && BASE_PATH !== '/') {
	const _origFetch = window.fetch;
	window.fetch = (url, ...args) => {
		if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
			return _origFetch(prefixPath(url), ...args);
		}
		return _origFetch(url, ...args);
	};
}

import HomePage    from './pages/homePage/homePage.jsx';
import EditPage    from './pages/editPage/editPage.jsx';
import UserPage    from './pages/userPage/userPage.jsx';
import SharePage   from './pages/sharePage/sharePage.jsx';
import NewPage     from './pages/newPage/newPage.jsx';
import ErrorPage   from './pages/errorPage/errorPage.jsx';
import VaultPage   from './pages/vaultPage/vaultPage.jsx';
import AccountPage from './pages/accountPage/accountPage.jsx';
import PreviewPage from './pages/previewPage/previewPage.jsx';
import CampaignWizard from './pages/campaignWizard/campaignWizard.jsx';
import BrewLibraryPage from './pages/brewLibraryPage/brewLibraryPage.jsx';
import NotFoundPage from './pages/notFoundPage/notFoundPage.jsx';
import CollaboratePage from './pages/collaboratePage/collaboratePage.jsx';

const WithRoute = ({ el: Element, ...rest })=>{
	const params = useParams();
	const [searchParams] = useSearchParams();
	const queryParams = Object.fromEntries(searchParams?.entries() || []);

	return <Element {...rest} {...params} query={queryParams} />;
};

const Homebrew = (props)=>{
	const {
		url = '',
		version = '0.0.0',
		account = null,
		enable_v3 = true,
		enable_themes = true,
		config = {},
		brew = {
			title     : '',
			text      : '',
			shareId   : null,
			editId    : null,
			createdAt : null,
			updatedAt : null,
			lang      : '',
			renderer  : 'V3',
			theme     : 'Tome'
		},
		userThemes = [],
		brews = []
	} = props;

	global.account       = account;
	global.version       = version;
	global.enable_v3     = enable_v3;
	global.enable_themes = enable_themes;
	global.config        = config;

	// basename tells React Router that all routes are mounted under this prefix;
	// it handles stripping the prefix internally before matching routes.
	const basename = BASE_PATH === '/' ? undefined : BASE_PATH;

	return (
		<Router location={url} basename={basename}>
			<div className='homebrew'>
				<Routes>
					{/* ── Writing ─────────────────────────────────────────── */}
					<Route path='/edit/:id' element={<WithRoute el={EditPage} brew={brew} userThemes={userThemes} mbarActive='brews' />} />
					<Route path='/share/:id' element={<WithRoute el={SharePage} brew={brew} />} />
					<Route path='/new/:id' element={<WithRoute el={NewPage} brew={brew} userThemes={userThemes}/>} />
					<Route path='/new' element={<WithRoute el={NewPage} userThemes={userThemes}/> } />
					<Route path='/new-campaign' element={<WithRoute el={CampaignWizard}/>} />

					{/* ── Collaborate ─────────────────────────────────────────
					  * Section 9: "collaborate should become a share dialog on
					  * the editor". /collaborate was a top-bar item that fell
					  * through to the editor, so the one thing it never did was
					  * let you share anything.
					  *
					  * With a brew id it IS the editor, with that dialog already
					  * open - which also makes the dialog linkable. Without one
					  * there is nothing to share, so it lands on a page that
					  * says so and points at the library, rather than opening an
					  * empty editor (the old bug) or a 404 (which would be a lie
					  * - the route is real). */}
					<Route path='/collaborate/:id' element={<WithRoute el={EditPage} brew={brew} userThemes={userThemes} mbarActive='brews' openShare={true} />} />
					<Route path='/collaborate' element={<WithRoute el={CollaboratePage} />} />

					{/* ── The brew library ────────────────────────────────────
					  * BUILD-BRIEF section 9: home and projects are the SAME
					  * screen (the 12-home library), and create-project is that
					  * screen with the template picker already open. All three
					  * used to fall through to the editor or to an unstyled
					  * list. */}
					<Route path='/' element={<WithRoute el={BrewLibraryPage} active='brews' />} />
					<Route path='/projects' element={<WithRoute el={BrewLibraryPage} active='brews' />} />
					<Route path='/create-project' element={<WithRoute el={BrewLibraryPage} active='new' openPicker={true} />} />

					{/* ── Reading ─────────────────────────────────────────── */}
					<Route path='/user/:username' element={<WithRoute el={UserPage} brews={brews} />} />
					<Route path='/vault' element={<WithRoute el={VaultPage}/>}/>
					<Route path='/preview' element={<WithRoute el={PreviewPage}/>} />
					<Route path='/changelog' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/faq' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/migrate' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/account' element={<WithRoute el={AccountPage} brew={brew} accountDetails={brew.accountDetails} />} />
					<Route path='/error' element={<WithRoute el={ErrorPage} brew={brew} />} />

					{/* The legacy paste-and-edit surface, kept as an unlinked
					  * import path only - section 9: "legacy should be a hidden
					  * import path". It is reachable from the library's
					  * "Import from Markdown" action and from nowhere else. */}
					<Route path='/legacy' element={<WithRoute el={HomePage} brew={brew} />} />

					{/* A real 404 instead of silently rendering the home page,
					  * which told a reader with a broken link that their link
					  * was fine. */}
					<Route path='/*' element={<WithRoute el={NotFoundPage} />} />
				</Routes>
			</div>
		</Router>
	);
};

// Client-side-only mounting (no SSR)
const root = document.getElementById('reactRoot');
if (root) {
	const reactRoot = createRoot(root);
	reactRoot.render(
		<Homebrew
			url={window.location.pathname + window.location.search}
			version="3.19.3"
			enable_v3={true}
			enable_themes={true}
		/>
	);
}

export default Homebrew;
