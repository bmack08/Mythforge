import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
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
		port: 8081,
		proxy: {
			// Proxy API calls to your Express server
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
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
