import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import useActiveHeading from '../hooks/useActiveHeading.js';

/**
 * TOCPanel Component
 * Table of Contents panel showing chapters and headings
 * D&D Beyond-style navigation with active highlighting
 */
export default function TOCPanel({ projectId }) {
	const [chapters, setChapters] = useState([]);
	const [headings, setHeadings] = useState([]);
	const { chapterSlug } = useParams();
	const location = useLocation();
	const activeId = useActiveHeading('.preview');

	// Fetch chapters list
	useEffect(() => {
		if (!projectId) return;

		fetch(`/api/projects/${projectId}/chapters`)
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					setChapters(data);
				}
			})
			.catch(err => console.error('Error fetching chapters:', err));
	}, [projectId]);

	// Extract headings from the current chapter's preview
	useEffect(() => {
		const previewContainer = document.querySelector('.preview');
		if (!previewContainer) return;

		const headingNodes = previewContainer.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
		const parsed = Array.from(headingNodes).map(el => ({
			id: el.id,
			text: el.innerText,
			level: parseInt(el.tagName.substring(1))
		}));

		setHeadings(parsed);
	}, [location.pathname, location.hash, chapterSlug]);

	return (
		<nav className="toc-panel">
			<h2>Contents</h2>
			<ul className="chapters">
				{chapters.map(ch => (
					<li key={ch.id} className={ch.slug === chapterSlug ? 'active' : ''}>
						<Link to={`/book/${projectId}/${ch.slug}`}>
							{ch.title}
						</Link>
						{ch.slug === chapterSlug && headings.length > 0 && (
							<ul className="sub-headings">
								{headings.map(h => (
									<li
										key={h.id}
										className={`level-${h.level} ${activeId === h.id ? 'active' : ''}`}
									>
										<a href={`#${h.id}`}>{h.text}</a>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}
