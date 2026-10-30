import React, { useState, useEffect, useCallback } from 'react';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, coversFor, cssUrl } from '../../../art/tidewatch/art.js';
import Icon from 'client/components/Icon.jsx';

/*
 * THE VAULT - mocks/12-mythforge-vault.html.
 *
 * Section 9: "A solid search card plus a designed empty state (art roundel,
 * 'Search the vault', suggestions, 'Browse newest' / 'Publish your brew')."
 * The before shot is a parchment texture behind a two-pane split with an
 * orange Search button - all of it inherited Homebrewery trade dress that the
 * brief retires - and, before any search, the whole right-hand pane said "No
 * search yet" in a heading and nothing else.
 *
 * Two empty states, both from section 9's list, because they are not the same
 * message: NO SEARCH YET invites you to search, NO RESULTS tells you the
 * search worked and found nothing and offers a way out.
 *
 * WHAT THE SORT BAR USED TO CLAIM. The old page offered Title / Created /
 * Updated / Views sort buttons and passed sort= and dir= to the API.
 * server/vault.api.simple.js ignores both and always orders by createdAt
 * DESC, so those four buttons re-ran the same query and the arrow moved for
 * nothing. They are gone and the column says what the order actually is
 * rather than pretending to offer a choice. Same for the "Brews found" total:
 * it came from /api/vault/total, a route that does not exist in this
 * checkout, so the number never arrived - the real response carries
 * totalCount and that is what is shown now.
 */

const PER_PAGE = 20;

/* A search is worth sending when it can match something. The API treats an
 * empty title and author as "every published brew", which is what Browse
 * newest wants - so emptiness is allowed, but a one-character title is not,
 * because it would scan the whole vault for a letter. */
const MIN_TITLE = 3;

const authorsOf = (brew)=>{
	const list = Array.isArray(brew.authors)
		? brew.authors
		: String(brew.authors || '').split(',').map((a)=>a.trim()).filter(Boolean);
	return list.length ? list.join(', ') : null;
};

const VaultPage = (props)=>{
	const query = props.query || {};

	const [title,    setTitle]    = useState(query.title || '');
	const [author,   setAuthor]   = useState(query.author || '');
	const [older,    setOlder]    = useState(query.legacy !== 'false');

	// What the last SENT search was, so the no-results message quotes the
	// terms that actually returned nothing rather than whatever is in the
	// boxes by the time it is read.
	const [sent,     setSent]     = useState(null);
	const [brews,    setBrews]    = useState(null);
	const [total,    setTotal]    = useState(0);
	const [pages,    setPages]    = useState(1);
	const [page,     setPage]     = useState(parseInt(query.page, 10) || 1);
	const [busy,     setBusy]     = useState(false);
	const [error,    setError]    = useState(null);

	const canSearch = title.trim().length >= MIN_TITLE || author.trim().length > 0;

	const search = useCallback(async (opts)=>{
		const terms = {
			title  : (opts.title ?? '').trim(),
			author : (opts.author ?? '').trim(),
			older  : !!opts.older,
			page   : opts.page || 1
		};

		setBusy(true);
		setError(null);
		setSent(terms);

		const params = new URLSearchParams({
			title  : terms.title,
			author : terms.author,
			v3     : 'true',
			legacy : terms.older ? 'true' : 'false',
			count  : String(PER_PAGE),
			page   : String(terms.page)
		});

		// Linkable: a vault search is the kind of thing people paste to each
		// other. replaceState rather than pushState so Back leaves the vault
		// instead of walking every keystroke of a search.
		try {
			const url = new URL(window.location.href);
			url.search = params.toString();
			window.history.replaceState(null, '', url.toString());
		} catch { /* a sandboxed iframe may refuse; the search still runs */ }

		try {
			const res  = await fetch(prefixPath(`/api/vault?${params}`), { credentials: 'same-origin' });
			const body = await res.json().catch(()=>null);
			if(!res.ok) throw new Error(body?.error || `The server answered ${res.status}.`);
			setBrews(Array.isArray(body?.brews) ? body.brews : []);
			setTotal(body?.totalCount ?? 0);
			setPages(Math.max(1, body?.totalPages ?? 1));
			setPage(body?.currentPage ?? terms.page);
		} catch (err) {
			// Shown, not swallowed: a failed request and a vault with nothing
			// in it look identical, and only one of them is worth retrying.
			setError(err.message || 'The vault search failed.');
			setBrews([]);
			setTotal(0);
			setPages(1);
		} finally {
			setBusy(false);
		}
	}, []);

	// A URL that already carries terms is a shared search: run it on arrival.
	// A bare /vault is the "no search yet" state and must not fire a query.
	useEffect(()=>{
		if(query.title || query.author) search({ title: query.title, author: query.author, older, page });
	}, []);

	const submit = (e)=>{
		e?.preventDefault();
		if(!canSearch) return;
		search({ title, author, older, page: 1 });
	};

	const browseNewest = ()=>{
		setTitle('');
		setAuthor('');
		search({ title: '', author: '', older, page: 1 });
	};

	const clearFilters = ()=>{
		setTitle('');
		setAuthor('');
		setOlder(true);
		setBrews(null);
		setSent(null);
		setError(null);
		setTotal(0);
		setPages(1);
		setPage(1);
		try {
			const url = new URL(window.location.href);
			url.search = '';
			window.history.replaceState(null, '', url.toString());
		} catch { /* see above */ }
	};

	const renderForm = ()=>(
		<form className='tide-solid tide-panel' onSubmit={submit}>
			<h3>Find a brew</h3>

			<label className='tide-field'>
				<span className='tide-label'>Title</span>
				<input
					className='tide-input'
					type='text'
					name='title'
					value={title}
					placeholder='Ember, lantern, hound…'
					onChange={(e)=>setTitle(e.target.value)}
				/>
			</label>

			<label className='tide-field'>
				<span className='tide-label'>Author</span>
				<input
					className='tide-input'
					type='text'
					name='author'
					value={author}
					placeholder='Any author'
					onChange={(e)=>setAuthor(e.target.value)}
				/>
			</label>

			<label className='tide-check'>
				<input
					type='checkbox'
					name='older'
					checked={older}
					onChange={(e)=>setOlder(e.target.checked)}
				/>
				Include older brews
			</label>

			<button
				type='submit'
				className='tide-btn-primary'
				style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '16px' }}
				disabled={!canSearch || busy}
			>
				{busy
					? <><span className='tide-spinner' aria-hidden='true' /> Searching…</>
					: <><Icon icon='fas fa-search' aria-hidden='true' /> Search</>}
			</button>
			{!canSearch
				? <p className='tide-hint'>{`Give a title of at least ${MIN_TITLE} letters, or an author.`}</p>
				: null}

			<div className='tide-label' style={{ marginTop: '20px' }}>Tips</div>
			<ul className='tide-tips'>
				<li>Only published brews appear here.</li>
				<li>Use &ldquo;quotes&rdquo; for an exact phrase, and a minus sign to exclude a word.</li>
				<li>Author names are case-sensitive.</li>
			</ul>
		</form>
	);

	const renderCard = (brew, index, covers)=>{
		const authors = authorsOf(brew);
		return <a
			key={brew.shareId || index}
			className='tide-card'
			href={prefixPath(`/share/${brew.shareId}`)}
		>
			<div
				className='tide-card-cover'
				style={{ backgroundImage: cssUrl(brew.thumbnail || covers[index]) }}
				role='presentation'
			/>
			<div className='tide-card-body'>
				<h3>{brew.title?.trim() || 'Untitled brew'}</h3>
				{authors ? <div className='tide-cap'>{`by ${authors}`}</div> : null}
				{typeof brew.views === 'number'
					? <div className='tide-card-row'><span className='tide-chip'>{`${brew.views} views`}</span></div>
					: null}
			</div>
		</a>;
	};

	const renderPager = ()=>{
		if(pages <= 1) return null;
		// A window of pages around the current one: 200 numbered buttons is not
		// navigation.
		const from = Math.max(1, Math.min(page - 4, pages - 8));
		const to   = Math.min(pages, from + 8);
		const nums = [];
		for (let n = from; n <= to; n++) nums.push(n);

		const go = (n)=>search({ ...sent, page: n });

		return <nav className='tide-pager' aria-label='Result pages'>
			<button type='button' disabled={page <= 1 || busy} aria-label='Previous page' onClick={()=>go(page - 1)}>
				<Icon icon='fas fa-chevron-left' aria-hidden='true' />
			</button>
			{from > 1 ? <button type='button' disabled={busy} onClick={()=>go(1)}>1</button> : null}
			{nums.map((n)=><button
				key={n}
				type='button'
				disabled={busy}
				aria-current={n === page ? 'true' : undefined}
				onClick={()=>go(n)}
			>
				{n}
			</button>)}
			{to < pages ? <button type='button' disabled={busy} onClick={()=>go(pages)}>{pages}</button> : null}
			<button type='button' disabled={page >= pages || busy} aria-label='Next page' onClick={()=>go(page + 1)}>
				<Icon icon='fas fa-chevron-right' aria-hidden='true' />
			</button>
		</nav>;
	};

	/* Empty state 1 - no search yet. Section 9's own copy. */
	const renderNoSearch = ()=>(
		<section className='tide-solid tide-empty-panel'>
			<div>
				<div
					className='tide-roundel'
					style={{ backgroundImage: cssUrl(ART.workshop) }}
					role='presentation'
				/>
				<h2>Search the vault</h2>
				<p>Look up brews other creators have published, by title or by author.</p>
				<div className='tide-actions'>
					<button type='button' className='tide-btn-primary' onClick={browseNewest}>
						Browse newest
					</button>
					<a className='tide-btn-quiet' href={prefixPath('/')}>Publish your brew</a>
				</div>
				<p className='tide-hint'>
					Publishing happens in a brew&rsquo;s Share dialog, in the editor.
				</p>
			</div>
		</section>
	);

	/* Empty state 2 - the search ran and matched nothing. */
	const renderNoResults = ()=>{
		const term = sent?.title || sent?.author || '';
		return <section className='tide-solid tide-empty-panel'>
			<div>
				<h2>{term ? `No brews match “${term}”` : 'No published brews yet'}</h2>
				<p>
					{term
						? 'Only published brews are searchable. Try fewer words, or a different spelling.'
						: 'Nothing in this vault has been published yet.'}
				</p>
				<div className='tide-actions'>
					{term
						? <button type='button' className='tide-btn-primary' onClick={clearFilters}>Clear filters</button>
						: null}
					<button type='button' className='tide-btn-quiet' onClick={browseNewest}>Browse newest</button>
				</div>
				<p className='tide-hint'>
					Tip: wrap words in &ldquo;quotes&rdquo; to match an exact phrase.
				</p>
			</div>
		</section>;
	};

	const renderResults = ()=>{
		if(error) {
			return <div className='tide-note tide-note-error'>
				<strong>The vault search failed.</strong> {error}
				{' '}
				<button type='button' className='tide-btn-ghost' onClick={()=>search(sent || { title, author, older, page: 1 })}>
					Try again
				</button>
			</div>;
		}
		if(brews === null) return renderNoSearch();
		if(busy && !brews.length) return <div className='tide-note'>Searching the vault…</div>;
		if(!brews.length) return renderNoResults();

		const covers = coversFor(brews.map((b)=>b.shareId || b.title));
		return <div>
			<div className='tide-section-head'>
				<h2>{total === 1 ? '1 brew' : `${total} brews`}</h2>
				<span className='tide-cap'>{`Newest first · page ${page} of ${pages}`}</span>
			</div>
			<div className='tide-grid' style={{ marginTop: '14px' }}>
				{brews.map((brew, i)=>renderCard(brew, i, covers))}
			</div>
			{renderPager()}
		</div>;
	};

	return (
		<div className='homebrew tide-page tide-vault vaultPage'>
			<div className='tide-page-stack'>
				<Navbar>
					<Nav.section>
						<AccountNavItem />
					</Nav.section>
				</Navbar>
				<MythforgeBar active='vault' />

				<div
					className='tide-art'
					style={{ '--tide-art-src': cssUrl(ART.workshop) }}
					role='presentation'
				/>

				<main className='tide-page-body'>
					<div className='tide-eyebrow'>Mythforge</div>
					<h1>The vault</h1>
					<p className='tide-lede'>Browse brews other creators have published.</p>

					<div className='tide-two-col'>
						{renderForm()}
						<div className='tide-col'>{renderResults()}</div>
					</div>
				</main>

				<SrdFooter />
			</div>
		</div>
	);
};

export default VaultPage;
