/**
 * Base path utility for running Mythforge under a sub-path (e.g. /mythforge/).
 *
 * When integrated into TaleForge, Mythforge is served at /mythforge/.
 * When running standalone, set MYTHFORGE_BASE_PATH=/ to disable prefixing.
 *
 * Usage:
 *   import BASE_PATH, { prefixPath, stripPrefix } from './basePath.js';
 *
 *   prefixPath('/edit/abc')  → '/mythforge/edit/abc'
 *   prefixPath('/api/brews') → '/mythforge/api/brews'
 *   stripPrefix('/mythforge/edit/abc') → '/edit/abc'
 */

const BASE_PATH = (typeof window !== 'undefined' && window.__MYTHFORGE_BASE_PATH__)
	|| '/mythforge';

/**
 * Prefix a path with BASE_PATH. Idempotent — won't double-prefix.
 * Skips absolute URLs (http://, https://, //) and already-prefixed paths.
 */
export const prefixPath = (path) => {
	if (!path) return path;
	if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) return path;
	if (BASE_PATH !== '/' && path.startsWith(BASE_PATH)) return path;
	if (BASE_PATH === '/') return path;
	return `${BASE_PATH}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Strip BASE_PATH prefix from a path, returning the clean internal path.
 * Used for React Router location and window.location.pathname parsing.
 */
export const stripPrefix = (path) => {
	if (BASE_PATH === '/') return path;
	if (path.startsWith(BASE_PATH)) {
		const stripped = path.slice(BASE_PATH.length);
		return stripped || '/';
	}
	return path;
};

export default BASE_PATH;
