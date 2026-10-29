import React from 'react';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * A real 404.
 *
 * BUILD-BRIEF section 9: "unknown routes should get a real 404". The router's
 * catch-all used to render the home page, so a typo in a URL produced a
 * working-looking screen and the reader had no way to tell their link was
 * wrong - the single worst outcome of the routing bug this unit fixes.
 *
 * The page keeps the nav and the Mythforge bar on purpose: a dead end that
 * still carries the way out is a dead end you can leave.
 */

const NotFoundPage = ({ path })=>{
	const shown = path
		|| (typeof window !== 'undefined' ? window.location.pathname : null);

	return <div className='homebrew tide-page notFoundPage'>
		<Navbar>
			<Nav.section>
				<AccountNavItem />
			</Nav.section>
		</Navbar>
		<MythforgeBar />

		<div
			className='tide-art'
			style={{
				'--tide-art-src'    : cssUrl(ART.harbour),
				'--tide-art-height' : '100%',
				'--tide-scrim'      : 'var(--tide-scrim-vignette)'
			}}
			role='presentation'
		/>

		<div className='tide-status'>
			<div className='tide-status-card'>
				<div className='tide-status-code'>404</div>
				<h1 className='tide-status-title'>That page isn&rsquo;t here</h1>
				<p className='tide-status-body'>
					The link may be out of date, or the brew may have been moved or deleted.
				</p>
				{shown ? <code className='tide-status-path'>{shown}</code> : null}
				<div className='tide-status-actions'>
					<a className='tide-btn-primary' href={prefixPath('/')}>Go to your brews</a>
					<a className='tide-btn-quiet' href={prefixPath('/vault')}>Search the vault</a>
				</div>
			</div>
		</div>

		<SrdFooter />
	</div>;
};

export default NotFoundPage;
