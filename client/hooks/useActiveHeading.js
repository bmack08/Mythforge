import { useEffect, useState } from 'react';

/**
 * useActiveHeading Hook
 * Tracks which heading is currently visible using IntersectionObserver
 * Used to highlight active items in the table of contents (D&D Beyond style)
 *
 * @param {string} containerSelector - CSS selector for the scrollable container (default: '.preview')
 * @returns {string|null} - The ID of the currently active heading
 */
export default function useActiveHeading(containerSelector = '.preview') {
	const [activeId, setActiveId] = useState(null);

	useEffect(() => {
		const container = document.querySelector(containerSelector);
		if (!container) return;

		const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				root: container,
				rootMargin: '-20% 0px -70% 0px', // Trigger when heading is in the top 30% of viewport
				threshold: 0
			}
		);

		headings.forEach((heading) => observer.observe(heading));

		return () => observer.disconnect();
	}, [containerSelector]);

	return activeId;
}
