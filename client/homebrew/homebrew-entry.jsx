/* eslint-disable camelcase */
// Removed core-js polyfill - Vite handles polyfills via build.target
import './homebrew.less';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StaticRouter as Router, Route, Routes, useParams, useSearchParams } from 'react-router';

import HomePage    from './pages/homePage/homePage.jsx';
import EditPage    from './pages/editPage/editPage.jsx';
import UserPage    from './pages/userPage/userPage.jsx';
import SharePage   from './pages/sharePage/sharePage.jsx';
import NewPage     from './pages/newPage/newPage.jsx';
import ErrorPage   from './pages/errorPage/errorPage.jsx';
import VaultPage   from './pages/vaultPage/vaultPage.jsx';
import AccountPage from './pages/accountPage/accountPage.jsx';
import ProjectsPage from './pages/projectsPage/projectsPage.jsx';

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
			theme     : '5ePHB'
		},
		userThemes = [],
		brews = []
	} = props;

	global.account       = account;
	global.version       = version;
	global.enable_v3     = enable_v3;
	global.enable_themes = enable_themes;
	global.config        = config;

	return (
		<Router location={url}>
			<div className='homebrew'>
				<Routes>
					<Route path='/edit/:id' element={<WithRoute el={EditPage} brew={brew} userThemes={userThemes}/>} />
					<Route path='/share/:id' element={<WithRoute el={SharePage} brew={brew} />} />
					<Route path='/new/:id' element={<WithRoute el={NewPage} brew={brew} userThemes={userThemes}/>} />
					<Route path='/new' element={<WithRoute el={NewPage} userThemes={userThemes}/> } />
					<Route path='/projects' element={<WithRoute el={ProjectsPage}/>} />
					<Route path='/user/:username' element={<WithRoute el={UserPage} brews={brews} />} />
					<Route path='/vault' element={<WithRoute el={VaultPage}/>}/>
					<Route path='/changelog' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/faq' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/migrate' element={<WithRoute el={SharePage} brew={brew} disableMeta={true} />} />
					<Route path='/account' element={<WithRoute el={AccountPage} brew={brew} accountDetails={brew.accountDetails} />} />
					<Route path='/legacy' element={<WithRoute el={HomePage} brew={brew} />} />
					<Route path='/error' element={<WithRoute el={ErrorPage} brew={brew} />} />
					<Route path='/' element={<WithRoute el={HomePage} brew={brew} />} />
					<Route path='/*' element={<WithRoute el={HomePage} brew={brew} />} />
				</Routes>
			</div>
		</Router>
	);
};

// Client-side mounting for Vite
if (typeof window !== 'undefined') {
	const root = document.getElementById('reactRoot');
	if (root) {
		const reactRoot = createRoot(root);
		// Get initial props from server-rendered data if available
		const initialProps = window.__INITIAL_PROPS__ || {
			url: window.location.pathname + window.location.search,
			version: '3.19.3',
			enable_v3: true,
			enable_themes: true
		};
		reactRoot.render(<Homebrew {...initialProps} />);
	}
}

// Export for SSR
export default Homebrew;
