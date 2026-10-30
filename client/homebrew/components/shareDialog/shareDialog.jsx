import React, { useCallback, useEffect, useRef, useState } from 'react';
import { prefixPath } from '../../utils/basePath.js';
import Icon from 'client/components/Icon.jsx';

/*
 * The share dialog - what the editor's "Share" button opens, and what the
 * /collaborate route resolves to.
 *
 * BUILD-BRIEF section 9 routing fix: "collaborate should become a share dialog
 * on the editor". Before this, /collaborate was a top-bar item that fell
 * through to the editor, so the only thing it collaborated on was confusion.
 *
 * WHAT THIS DIALOG DOES NOT DO, and why. Mythforge has no collaborator model:
 * no invitations, no roles, no per-user access list. What it actually has is
 * two URLs - a read-only share link and an edit link that grants editing to
 * anyone holding it. So the dialog hands over those two links and says plainly
 * what each one gives away. Inventing an "invite by email" field here would
 * have looked like the richer feature and silently done nothing.
 */

const CopyField = ({ id, label, url, hint, danger })=>{
	const [copied, setCopied] = useState(false);
	const timer = useRef(null);

	useEffect(()=>()=>clearTimeout(timer.current), []);

	const copy = async ()=>{
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(()=>setCopied(false), 2000);
		} catch (err) {
			// Clipboard access can be refused (no permission, insecure origin).
			// Say so rather than flashing "Copied" over a copy that never
			// happened - the field is selectable, so there is still a way out.
			console.error('Share dialog: clipboard write failed', err);
			setCopied('failed');
		}
	};

	return <div className='tide-field'>
		<label htmlFor={id}>{label}</label>
		<div className='tide-field-row'>
			<input
				id={id}
				className='tide-linkfield'
				type='text'
				value={url}
				readOnly
				onFocus={(e)=>e.target.select()}
			/>
			<button type='button' className='tide-btn-quiet' onClick={copy}>
				<Icon icon='fas fa-copy' aria-hidden='true' />
				Copy
			</button>
		</div>
		<p className={`tide-field-hint${danger ? ' tide-field-hint-warn' : ''}`}>{hint}</p>
		<p className='tide-field-status' role='status'>
			{copied === true ? 'Copied to clipboard.' : null}
			{copied === 'failed' ? 'Could not reach the clipboard - select the link and copy it.' : null}
		</p>
	</div>;
};

const ShareDialog = ({ brew, shareLink, redditLink, onClose })=>{
	const cardRef = useRef(null);

	const handleKey = useCallback((e)=>{
		if(e.key === 'Escape') onClose?.();
	}, [onClose]);

	useEffect(()=>{
		document.addEventListener('keydown', handleKey);
		cardRef.current?.focus();
		return ()=>document.removeEventListener('keydown', handleKey);
	}, [handleKey]);

	// global.config.baseUrl is filled in by the server render. Falling back to
	// the browser's own origin keeps the links real in dev, where it is unset.
	const origin = (typeof global !== 'undefined' && global.config?.baseUrl)
		|| (typeof window !== 'undefined' ? window.location.origin : '');

	const readUrl = shareLink ? `${origin}${prefixPath(`/share/${shareLink}`)}` : null;
	const editUrl = brew?.editId ? `${origin}${prefixPath(`/edit/${brew.editId}`)}` : null;

	const readField = readUrl
		? <CopyField
			id='share-read-link'
			label='Read-only link'
			url={readUrl}
			hint='Anyone with this link can read the brew. They cannot change it.'
		/>
		: <p className='tide-note'>
			This brew has no share link yet. Save it once and the link appears here.
		</p>;

	const editField = editUrl
		? <CopyField
			id='share-edit-link'
			label='Editing link'
			url={editUrl}
			danger={true}
			hint='Anyone with this link can edit the brew. Mythforge has no per-person access list, so only send it to people you want writing in it.'
		/>
		: null;

	const readerLink = readUrl
		? <a className='tide-btn-primary' href={prefixPath(`/share/${shareLink}`)}>
			<Icon icon='fas fa-book-open' aria-hidden='true' />
			Open the reader view
		</a>
		: null;

	const redditButton = redditLink
		? <a className='tide-btn-quiet' href={redditLink} target='_blank' rel='noopener noreferrer'>
			<Icon icon='fab fa-reddit-alien' aria-hidden='true' />
			Post to Reddit
		</a>
		: null;

	return <div
		className='tide-modal-scrim'
		onClick={(e)=>{ if(e.target === e.currentTarget) onClose?.(); }}
	>
		<div
			className='tide-modal tide-modal-narrow'
			role='dialog'
			aria-modal='true'
			aria-label='Share this brew'
			tabIndex={-1}
			ref={cardRef}
		>
			<div className='tide-modal-head'>
				<div>
					<h2>Share this brew</h2>
					<p className='tide-lede'>
						{brew?.title ? brew.title : 'Untitled brew'}
					</p>
				</div>
				<button
					type='button'
					className='tide-modal-close'
					aria-label='Close'
					onClick={()=>onClose?.()}
				>
					<Icon icon='fas fa-times' aria-hidden='true' />
				</button>
			</div>

			{readField}
			{editField}

			<div className='tide-modal-foot'>
				{readerLink}
				{redditButton}
			</div>
		</div>
	</div>;
};

export default ShareDialog;
