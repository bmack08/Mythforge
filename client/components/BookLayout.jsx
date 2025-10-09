import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import TOCPanel from './TOCPanel.jsx';
import ChapterEditor from './ChapterEditor.jsx';
import extensions from '../extensions/index.js';
import useScrollToHash from '../hooks/useScrollToHash.js';

/**
 * BookLayout Component
 * Main layout for D&D Beyond-style book navigation
 * Manages chapter loading, editing, and preview rendering
 */
export default function BookLayout() {
	const { projectId, chapterSlug } = useParams();
	const [chapter, setChapter] = useState(null);
	const [html, setHtml] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [saveTimeout, setSaveTimeout] = useState(null);

	// Enable hash-based scrolling
	useScrollToHash();

	// Load chapter data
	useEffect(() => {
		if (!chapterSlug || !projectId) return;

		setIsLoading(true);
		fetch(`/api/projects/${projectId}/chapters/${chapterSlug}`)
			.then(res => {
				if (!res.ok) throw new Error('Chapter not found');
				return res.json();
			})
			.then(data => {
				setChapter(data);
				// Generate HTML preview from TipTap JSON
				if (data.content) {
					const generatedHtml = generateHTML(data.content, extensions);
					setHtml(generatedHtml);
				}
				setIsLoading(false);
			})
			.catch(err => {
				console.error('Error loading chapter:', err);
				setIsLoading(false);
			});
	}, [projectId, chapterSlug]);

	// Handle content changes with debounced autosave
	const handleContentChange = useCallback((json) => {
		// Update preview immediately
		const generatedHtml = generateHTML(json, extensions);
		setHtml(generatedHtml);

		// Update local state
		setChapter(prev => ({ ...prev, content: json }));

		// Debounce save to server
		if (saveTimeout) clearTimeout(saveTimeout);

		const timeout = setTimeout(() => {
			if (chapter?.id) {
				fetch(`/api/projects/${projectId}/chapters/${chapter.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content: json })
				})
					.then(res => res.json())
					.then(() => console.log('Chapter saved'))
					.catch(err => console.error('Save error:', err));
			}
		}, 1000); // Save after 1 second of inactivity

		setSaveTimeout(timeout);
	}, [chapter?.id, projectId, saveTimeout]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeout) clearTimeout(saveTimeout);
		};
	}, [saveTimeout]);

	if (isLoading) {
		return (
			<div className="book-layout">
				<TOCPanel projectId={projectId} />
				<div className="workspace">
					<div className="loading">Loading chapter...</div>
				</div>
			</div>
		);
	}

	if (!chapter) {
		return (
			<div className="book-layout">
				<TOCPanel projectId={projectId} />
				<div className="workspace">
					<div className="error">Chapter not found</div>
				</div>
			</div>
		);
	}

	return (
		<div className="book-layout">
			<TOCPanel projectId={projectId} />
			<div className="workspace">
				<ChapterEditor
					content={chapter.content}
					onChange={handleContentChange}
				/>
				<div
					className="preview"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
			<Outlet />
		</div>
	);
}
