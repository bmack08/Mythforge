import React from 'react';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * /collaborate, with no brew named.
 *
 * BUILD-BRIEF section 9 turns Collaborate into "a share dialog on the editor",
 * and /collaborate/:id does exactly that. This is the other half: a share
 * dialog needs something to share, so the bare route says so and hands over
 * the two ways to get a brew in front of you.
 *
 * It is deliberately not a 404 - the route exists and the feature exists, the
 * request was just missing its subject - and deliberately not the old
 * fall-through to an empty editor, which looked like a new brew nobody asked
 * for.
 */

const CollaboratePage = ()=>{
	return <div className='homebrew tide-page collaboratePage'>
		<Navbar>
			<Nav.section>
				<AccountNavItem />
			</Nav.section>
		</Navbar>
		<MythforgeBar active='brews' />

		<div
			className='tide-art'
			style={{
				'--tide-art-src'    : cssUrl(ART.workshop),
				'--tide-art-height' : '100%',
				'--tide-scrim'      : 'var(--tide-scrim-vignette)'
			}}
			role='presentation'
		/>

		<div className='tide-status'>
			<div className='tide-status-card'>
				<div className='tide-status-code'>SHARE</div>
				<h1 className='tide-status-title'>Pick a brew to share</h1>
				<p className='tide-status-body'>
					Sharing happens from inside a brew. Open one and choose
					<strong> Share</strong> in the Mythforge bar to get its read-only
					link and its editing link.
				</p>
				<div className='tide-status-actions'>
					<a className='tide-btn-primary' href={prefixPath('/')}>Go to your brews</a>
					<a className='tide-btn-quiet' href={prefixPath('/create-project')}>New brew</a>
				</div>
			</div>
		</div>

		<SrdFooter />
	</div>;
};

export default CollaboratePage;
