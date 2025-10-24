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

const PreviewPage = ({ query }) => {
	const [html, setHtml] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const fixture = query?.fixture;

	useEffect(() => {
		if (!fixture) {
			setError('No fixture specified. Use ?fixture=path/to/fixture');
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

	if (loading) {
		return (
			<div className="previewPage">
				<div className="loading">Loading fixture...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="previewPage">
				<div className="error">
					<h2>Error Loading Fixture</h2>
					<p>{error}</p>
					<p>Fixture path: <code>{fixture}</code></p>
				</div>
			</div>
		);
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
