import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollToHash Hook
 * Automatically scrolls to anchored headings when URL hash changes
 * Supports D&D Beyond-style navigation with smooth scrolling
 */
export default function useScrollToHash() {
	const location = useLocation();

	useEffect(() => {
		if (location.hash) {
			// Remove the # from the hash
			const id = location.hash.slice(1);
			const element = document.getElementById(id);

			if (element) {
				// Smooth scroll to the target element
				element.scrollIntoView({
					block: 'start',
					behavior: 'smooth'
				});
			}
		}
	}, [location.hash, location.pathname]); // Re-run when hash or path changes
}
