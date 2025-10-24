import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookLayout from '../components/BookLayout.jsx';

/**
 * BookPage Component
 * Routes for the D&D Beyond-style book navigation system
 * Handles /book/:projectId/:chapterSlug routing
 */
export default function BookPage() {
	return (
		<Routes>
			<Route path="/book/:projectId" element={<BookLayout />}>
				{/* Default route - redirect to first chapter */}
				<Route index element={<Navigate to="chapter-1" replace />} />
				{/* Chapter routes */}
				<Route path=":chapterSlug" element={null} />
			</Route>
		</Routes>
	);
}
