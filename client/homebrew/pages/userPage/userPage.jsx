import React, { useState, useEffect } from 'react';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, coversFor, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * A CREATOR'S PUBLISHED BREWS - /user/:username.
 *
 * Section 9 did not mock this page ("user and preview weren't mocked: both
 * are sparse and are covered by the empty states above plus the 12-home
 * grid"), so that is exactly what it is: the 12-home card grid, and the
 * brief's own empty state when there is nothing in it -
 *
 *   "user page with no published brews: '<name> hasn't published any brews
 *    yet'. For the owner, add a 'Publish from the editor's Share menu' hint
 *    and a New brew button."
 *
 * WHERE THE BREWS COME FROM. The old page read props.brews, which
 * server/app.js does fill in - and which never arrives, because
 * client/template.js hands the server's props to a `start_app` function the
 * bundle does not define (see docsPage.jsx for the full note). So the page
 * rendered an unstyled empty list for every user, including users with
 * brews. It now asks /api/vault for the author's published brews, which is
 * the same data the vault shows and works in dev and in production alike;
 * props.brews is still preferred when it is there, so fixing the props path
 * later costs this file nothing.
 *
 * Only PUBLISHED brews are listed, because that is all an unauthenticated
 * reader is allowed to see and all /api/vault returns. The owner's private
 * drafts live in the brew library, which the owner's empty state links to.
 */

const PER_PAGE = 48;

const authorsOf = (brew)=>{
	const list = Array.isArray(brew.authors)
		? brew.authors
		: String(brew.authors || '').split(',').map((a)=>a.trim()).filter(Boolean);
	return list.length ? list.join(', ') : null;
};

const UserPage = (props)=>{
	const username = props.username || '';
	const seeded   = Array.isArray(props.brews) ? props.brews.filter((b)=>b.published !== false) : [];

	const [brews,   setBrews]   = useState(seeded);
	const [loading, setLoading] = useState(seeded.length === 0);
	const [error,   setError]   = useState(null);

	const isOwner = !!username && global.account?.username === username;

	useEffect(()=>{
		if(seeded.length || !username) { setLoading(false); return; }

		let cancelled = false;
		const params = new URLSearchParams({
			title  : '',
			author : username,
			v3     : 'true',
			legacy : 'true',
			count  : String(PER_PAGE),
			page   : '1'
		});

		fetch(prefixPath(`/api/vault?${params}`), { credentials: 'same-origin' })
			.then(async (res)=>{
				const body = await res.json().catch(()=>null);
				if(!res.ok) throw new Error(body?.error || `The server answered ${res.status}.`);
				return body;
			})
			.then((body)=>{
				if(cancelled) return;
				setBrews(Array.isArray(body?.brews) ? body.brews : []);
				setLoading(false);
			})
			.catch((err)=>{
				if(cancelled) return;
				// Shown, not swallowed. "Nobody has published anything" and
				// "the request failed" are different facts about this person.
				setError(err.message || 'Could not load this collection.');
				setLoading(false);
			});

		return ()=>{ cancelled = true; };
	}, [username]);

	const possessive = username + (username.endsWith('s') ? '’' : '’s');

	const renderCard = (brew, index, covers)=>{
		const authors = authorsOf(brew);
		/* A published brew always has a shareId. editId only turns up on the
		 * props.brews path, where the server hands the owner their own rows,
		 * and the library is the honest destination when there is neither. */
		let href = '/';
		if(brew.shareId)     href = `/share/${brew.shareId}`;
		else if(brew.editId) href = `/edit/${brew.editId}`;
		return <a key={brew.shareId || brew.editId || index} className='tide-card' href={prefixPath(href)}>
			<div
				className='tide-card-cover'
				style={{ backgroundImage: cssUrl(brew.thumbnail || covers[index]) }}
				role='presentation'
			/>
			<div className='tide-card-body'>
				<h3>{brew.title?.trim() || 'Untitled brew'}</h3>
				{authors && authors !== username ? <div className='tide-cap'>{`with ${authors}`}</div> : null}
				{typeof brew.views === 'number'
					? <div className='tide-card-row'><span className='tide-chip'>{`${brew.views} views`}</span></div>
					: null}
			</div>
		</a>;
	};

	const renderEmpty = ()=>(
		<div className='tide-empty'>
			<h3>{`${username || 'This creator'} hasn’t published any brews yet.`}</h3>
			{isOwner
				? <>
					<p>Publish from the editor&rsquo;s Share menu and the brew appears here and in the vault.</p>
					<div className='tide-actions' style={{ justifyContent: 'center' }}>
						<a className='tide-btn-primary' href={prefixPath('/create-project')}>New brew</a>
						<a className='tide-btn-quiet' href={prefixPath('/')}>Your brews</a>
					</div>
				</>
				: <>
					<p>Published brews show up here. Until then there is nothing to read.</p>
					<div className='tide-actions' style={{ justifyContent: 'center' }}>
						<a className='tide-btn-quiet' href={prefixPath('/vault')}>Search the vault</a>
					</div>
				</>}
		</div>
	);

	const renderBody = ()=>{
		if(loading) return <div className='tide-note'>Loading this collection…</div>;
		if(error) {
			return <div className='tide-note tide-note-error'>
				<strong>Couldn&rsquo;t load this collection.</strong> {error}
			</div>;
		}
		if(!brews.length) return renderEmpty();

		const covers = coversFor(brews.map((b)=>b.shareId || b.editId || b.title));
		return <div className='tide-grid'>
			{brews.map((brew, i)=>renderCard(brew, i, covers))}
		</div>;
	};

	return (
		<div className='homebrew tide-page userPage'>
			<div className='tide-page-stack'>
				<Navbar>
					<Nav.section>
						<AccountNavItem />
					</Nav.section>
				</Navbar>
				<MythforgeBar active={isOwner ? 'brews' : 'vault'} />

				<div
					className='tide-art'
					style={{ '--tide-art-src': cssUrl(ART.harbour) }}
					role='presentation'
				/>

				<main className='tide-page-body'>
					<div className='tide-eyebrow'>Mythforge</div>
					<h1>{username ? `${possessive} brews` : 'Published brews'}</h1>
					<p className='tide-lede'>
						{isOwner
							? 'Everything you have published. Private drafts stay in your brew library.'
							: 'Brews this creator has published.'}
					</p>

					<section className='tide-section'>
						{renderBody()}
					</section>
				</main>

				<SrdFooter />
			</div>
		</div>
	);
};

export default UserPage;
