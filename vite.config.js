import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite's dev file server refuses to read anything outside the workspace root.
// In a worktree checkout node_modules is a junction into another tree, so the
// real path of every dependency asset - Font Awesome's woff2 among them - is
// outside the root and comes back 403, which is what turned every icon into an
// empty box. Allow-list the project root plus wherever node_modules actually
// lives. realpathSync is wrapped because a plain (non-junction) install needs
// no second entry and must not break the config if the folder is missing.
const nodeModulesReal = (()=>{
	try { return fs.realpathSync(path.resolve(__dirname, 'node_modules')); }
	catch { return null; }
})();
const fsAllow = [__dirname, ...(nodeModulesReal ? [nodeModulesReal] : [])];

// Base path for sub-path deployment (e.g. /mythforge/ under TaleForge)
// Set MYTHFORGE_BASE_PATH=/ for standalone development
const basePath = process.env.MYTHFORGE_BASE_PATH || '/mythforge/';

// Dev-server port and the Express origin it proxies to. Both are env-driven so a
// second checkout can run beside the default one without fighting over a port;
// the defaults are the historical hardcoded values, so `npm run dev` is unchanged.
const devPort   = Number(process.env.MYTHFORGE_VITE_PORT || 8081);
const apiTarget = process.env.MYTHFORGE_API_TARGET || 'http://localhost:3000';

// https://vitejs.dev/config/
export default defineConfig({
	base: basePath,

	plugins: [
		react({
			// Let Vite/esbuild handle JSX transforms - much faster than Babel
			jsxRuntime: 'automatic'
		})
	],

	// Define global variables for compatibility
	define: {
		'global': 'window',
		'process.env': {}
	},
	
	// Set the root to client/homebrew where the entry point is
	root: path.resolve(__dirname, 'client/homebrew'),
	
	// Public directory for static assets
	publicDir: path.resolve(__dirname, 'build/assets'),
	
	resolve: {
		alias: {
			// Map the module paths used in your imports
			'client': path.resolve(__dirname, 'client'),
			'shared': path.resolve(__dirname, 'shared'),
			'naturalcrit': path.resolve(__dirname, 'shared/naturalcrit'),
			'homebrewery': path.resolve(__dirname, 'shared/homebrewery'),
			'themes': path.resolve(__dirname, 'themes'),
			
			// Keep compatibility with old require() style paths
			'naturalcrit/codeEditor': path.resolve(__dirname, 'shared/naturalcrit/codeEditor'),
			'naturalcrit/markdown.js': path.resolve(__dirname, 'shared/naturalcrit/markdown.js'),
			'naturalcrit/markdownLegacy.js': path.resolve(__dirname, 'shared/naturalcrit/markdownLegacy.js'),
		},
		extensions: ['.mjs', '.js', '.jsx', '.json', '.less', '.css']
	},
	
	build: {
		// Output to build/homebrew
		outDir: path.resolve(__dirname, 'build/homebrew'),
		emptyOutDir: false, // Don't delete other files in build/homebrew
		
		rollupOptions: {
			input: {
				homebrew: path.resolve(__dirname, 'client/homebrew/index.html')
			},
			output: {
				// Match the old bundle structure
				entryFileNames: 'bundle.js',
				chunkFileNames: 'bundle.js',
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith('.css')) {
						return 'bundle.css';
					}
					return '[name].[ext]';
				},
				// Don't split into chunks - create one bundle like browserify did
				manualChunks: undefined,
			}
		},
		
		// Increase chunk size warning limit since we're bundling everything
		chunkSizeWarningLimit: 2000,
		
		// Generate sourcemaps for debugging
		sourcemap: true,
	},
	
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true,
				paths: [
					path.resolve(__dirname, 'shared'),
					path.resolve(__dirname, 'client'),
				]
			}
		}
	},
	
	server: {
		port: devPort,
		fs   : { allow: fsAllow },
		proxy: {
			// Proxy API calls to your Express server
			'/themes': apiTarget,      // ← ADDED
      		'/assets': apiTarget,      // ← ADDED  
      		'/fonts': apiTarget,       // ← ADDED
      		'/staticFonts': apiTarget, // ← ADDED for font serving
      		'/staticImages': apiTarget, // ← ADDED for image serving
      		'/homebrew/bundle': apiTarget,  // ← ADDED (was initially '/homebrew' but made more specific)
			'/fa-solid-900.woff2': apiTarget,   // FA font files
			'/fa-brands-400.woff2': apiTarget,
			'/fa-regular-400.woff2': apiTarget,
			'/api': {
				target: apiTarget,
				changeOrigin: true
			},

			// ── /mythforge-prefixed twins of every entry above ──────────────
			// basePath.js prefixes runtime requests with BASE_PATH ('/mythforge'),
			// so the unprefixed rules above never see them and they fall through
			// to index.html. Strip the prefix and forward to the Express server.
			// Deliberately NOT a catch-all '/mythforge' - that would swallow the
			// SPA's own routes (/mythforge/edit/:id) and Vite's dev module paths
			// (/mythforge/@vite/client, /mythforge/@fs/..., /mythforge/src/...).
			'/mythforge/themes': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/assets': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/fonts': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/staticFonts': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/staticImages': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/homebrew/bundle': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			// FA font files, at the prefix root or nested under it
			// (e.g. /mythforge/fa-solid-900.woff2, /mythforge/themes/fonts/fa-brands-400.woff2)
			//
			// The `(?!@)` is load-bearing. In dev, Vite rewrites the Font Awesome
			// stylesheet's url() to its own /mythforge/@fs/<abs path>/fa-solid-900.woff2,
			// which the old `(?:.*/)?` happily matched - so every icon-font request was
			// forwarded to Express, which has no such file and 302s to '/'. The browser
			// got a redirect where a woff2 should be, dropped the face, and every icon in
			// the top bar and the toolbar rendered as an empty box. Vite-internal paths
			// (@fs, @id, @vite, @react-refresh) must stay with Vite; only the flat and
			// theme-nested production paths belong to Express.
			'^/mythforge/(?!@)(?:.*/)?fa-(?:solid-900|brands-400|regular-400)\\.woff2$': {
				target: apiTarget,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			},
			'/mythforge/api': {
				target: apiTarget,
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/mythforge/, '')
			}
		}
	},
	
	// Optimize dependencies
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'@tiptap/react',
			'@tiptap/core',
			'@tiptap/starter-kit',
			'@tiptap/html',
			'lodash',
			'classnames',
			'moment'
		]
	}
});
