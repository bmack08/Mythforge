/* eslint-disable camelcase */
import 'core-js/es/string/to-well-formed.js'; //Polyfill for older browsers
import './homebrew.less';
import React from 'react';
import { StaticRouter as Router, Route, Routes, useParams, useSearchParams } from 'react-router';

import EditPage    from './pages/editPage/editPage.jsx';
import UserPage    from './pages/userPage/userPage.jsx';
import SharePage   from './pages/sharePage/sharePage.jsx';
import NewPage     from './pages/newPage/newPage.jsx';
import ErrorPage   from './pages/errorPage/errorPage.jsx';
import VaultPage   from './pages/vaultPage/vaultPage.jsx';
import AccountPage from './pages/accountPage/accountPage.jsx';
import PreviewPage from './pages/previewPage/previewPage.jsx';
import BrewLibraryPage from './pages/brewLibraryPage/brewLibraryPage.jsx';
import NotFoundPage from './pages/notFoundPage/notFoundPage.jsx';
import DocsPage from './pages/docsPage/docsPage.jsx';
import SettingsPage from './pages/settingsPage/settingsPage.jsx';
import ImportPage from './pages/importPage/importPage.jsx';

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
		enable_v3 = false,
		enable_themes,
		config,
		brew = {
			title     : '',
			text      : '',
			shareId   : null,
			editId    : null,
			createdAt : null,
			updatedAt : null,
			lang      : ''
		},
		userThemes,
		brews
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
					<Route path='/' element={<WithRoute el={BrewLibraryPage} active='brews' />} />
					<Route path='/projects' element={<WithRoute el={BrewLibraryPage} active='brews' />} />
					<Route path='/create-project' element={<WithRoute el={BrewLibraryPage} active='new' openPicker={true} />} />
					<Route path='/preview' element={<WithRoute el={PreviewPage}/>} />
					<Route path='/user/:username' element={<WithRoute el={UserPage} brews={brews} />} />
					<Route path='/vault' element={<WithRoute el={VaultPage}/>}/>
					<Route path='/changelog' element={<WithRoute el={DocsPage} slug='changelog' />} />
					<Route path='/faq' element={<WithRoute el={DocsPage} slug='faq' />} />
					<Route path='/migrate' element={<WithRoute el={DocsPage} slug='migrate' />} />
					<Route path='/settings' element={<WithRoute el={SettingsPage} />} />
					<Route path='/account' element={<WithRoute el={AccountPage} brew={brew} accountDetails={brew.accountDetails} />} />
					<Route path='/legacy' element={<WithRoute el={ImportPage} />} />
					<Route path='/error' element={<WithRoute el={ErrorPage} brew={brew} />} />
					<Route path='/*' element={<WithRoute el={NotFoundPage} />} />
				</Routes>
			</div>
		</Router>
	);
};

export default Homebrew;