// Vite compatibility shim to support legacy CommonJS require() in some files
// This creates a global require() function that works like an ES import

// Store module cache
const moduleCache = new Map();

// Global require function
window.require = function(modulePath) {
	// Check cache first
	if (moduleCache.has(modulePath)) {
		return moduleCache.get(modulePath);
	}
	
	// For now, just throw a helpful error - we'll need to convert require() to import()
	throw new Error(`Cannot require('${modulePath}') - please convert to ES import`);
};

// Global module object for compatibility
window.module = {
	exports: {}
};

// Global exports object
window.exports = window.module.exports;
