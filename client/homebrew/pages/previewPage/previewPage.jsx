/**
 * PreviewPage - Renders Tiptap fixtures for visual testing
 *
 * Usage: /preview?fixture=table/basic
 *
 * Loads markdown fixtures from specs/parity/ directory,
 * converts to Tiptap JSON, and renders with PHB styles
 * for Playwright visual regression testing.
 */

import React, { useState, useEffect } from 'react';
import { generateHTML } from '@tiptap/html';
import extensions from '../../../extensions/index.js';
import { markdownToTiptap } from '../../../../shared/helpers/markdownToTiptap.js';
import './previewPage.less';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';

/*
 * The empty and error states for /preview.
 *
 * BUILD-BRIEF section 9: "preview with no brew loaded: 'Nothing to preview
 * yet', with Open a brew / New brew buttons. Never show a bare blank page."
 * Before this, /preview with no ?fixture= printed the sentence "No fixture
 * specified. Use ?fixture=path/to/fixture" on a bare grey page - an internal
 * instruction to a test harness, shown to whoever followed the link.
 *
 * The ?fixture= path itself is untouched: __visual__/tests/*.visual.spec.js
 * drive this route and expect exactly the markup they get today.
 */
const PreviewShell = ({ code, title, body, detail })=>
	<div className='homebrew tide-page previewPage-empty'>
		<Navbar>
			<Nav.section>
				<AccountNavItem />
			</Nav.section>
		</Navbar>
		<MythforgeBar active='brews' />

		<div className='tide-status'>
			<div className='tide-status-card'>
				<div className='tide-status-code'>{code}</div>
				<h1 className='tide-status-title'>{title}</h1>
				<p className='tide-status-body'>{body}</p>
				{detail ? <code className='tide-status-path'>{detail}</code> : null}
				<div className='tide-status-actions'>
					<a className='tide-btn-primary' href={prefixPath('/')}>Open a brew</a>
					<a className='tide-btn-quiet' href={prefixPath('/create-project')}>New brew</a>
				</div>
			</div>
		</div>

		<SrdFooter />
	</div>;

const PreviewPage = ({ query }) => {
	const [html, setHtml] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const fixture = query?.fixture;

	useEffect(() => {
		if (!fixture) {
			// Not an error: arriving at /preview with nothing to preview is an
			// ordinary thing to do. It gets the empty state, not a red box.
			setLoading(false);
			return;
		}

		loadFixture(fixture);
	}, [fixture]);

	const loadFixture = async (fixturePath) => {
		try {
			setLoading(true);
			setError(null);

			// Load fixture markdown
			// In production, this would fetch from server
			// For now, we'll use a fetch or import approach
			const response = await fetch(`/specs/parity/${fixturePath}.md`);

			if (!response.ok) {
				throw new Error(`Fixture not found: ${fixturePath}`);
			}

			const markdown = await response.text();

			// Convert markdown to Tiptap JSON
			const json = markdownToTiptap(markdown);

			// Generate HTML from JSON
			const renderedHTML = generateHTML(json, extensions);

			setHtml(renderedHTML);
			setLoading(false);
		} catch (err) {
			console.error('Error loading fixture:', err);
			setError(err.message);
			setLoading(false);
		}
	};

	if (!fixture && !loading) {
		return <PreviewShell
			code='PREVIEW'
			title='Nothing to preview yet'
			body='Open one of your brews to see it laid out on the page, or start a new one.'
		/>;
	}

	if (loading) {
		return (
			<div className="previewPage">
				<div className="loading">Loading fixture...</div>
			</div>
		);
	}

	if (error) {
		return <PreviewShell
			code='PREVIEW'
			title='That preview could not be loaded'
			body='The brew or fixture behind this link is missing. Open a brew from your library instead.'
			detail={fixture ? `fixture: ${fixture}` : null}
		/>;
	}

	return (
		<div className="previewPage">
			<div
				id="preview-page"
				className="page phb"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
};

export default PreviewPage;
