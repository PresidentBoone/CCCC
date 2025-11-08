import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

/**
 * Vite Configuration for CollegeClimb
 * Multi-page application with 21+ HTML entry points
 *
 * Features:
 * - Multi-page build with automatic entry detection
 * - Code splitting by route
 * - Tree-shaking and minification
 * - Source maps for debugging
 * - Development server with hot reload
 * - Production optimization
 *
 * @version 2.0.1 - Fixed for static HTML with inline scripts
 */

// Automatically detect all HTML files in public directory
const htmlFiles = readdirSync(resolve(__dirname, 'public'))
  .filter(file => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace('.html', '');
    entries[name] = resolve(__dirname, 'public', file);
    return entries;
  }, {});

console.log(`🎯 Detected ${Object.keys(htmlFiles).length} HTML entry points`);

export default defineConfig({
  // Root directory (where HTML files live)
  root: 'public',

  // Public assets directory (already in public/)
  publicDir: false, // Disable since we're already in public/

  // Base URL for deployment
  base: '/',

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: '/index.html',
    cors: true,
    hmr: {
      overlay: true
    },
    // Proxy API requests to Vercel functions in development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  // Build configuration
  build: {
    // Output directory (relative to project root)
    outDir: '../dist',

    // Assets directory within outDir
    assetsDir: 'assets',

    // Generate source maps for debugging
    sourcemap: false, // Disabled - inline scripts don't need source maps

    // Minification - ENABLED for production optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // Remove console statements in production
        drop_debugger: true,    // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },

    // CSS code splitting - ENABLED for better caching
    cssCodeSplit: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB

    // Rollup options for advanced bundling
    rollupOptions: {
      // Multiple entry points (all HTML files)
      input: htmlFiles,

      output: {
        // Keep simple structure for now
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    },

    // Asset inline limit (files smaller than this will be base64 inlined)
    assetsInlineLimit: 0, // Disable inlining

    // Clear output dir before build
    emptyOutDir: true,

    // Report compressed size
    reportCompressedSize: false, // Disabled for speed

    // Target modern browsers
    target: 'es2020',

    // Copy public directory as-is
    copyPublicDir: false
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded separately
    ]
  },

  // CSS preprocessing
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add CSS preprocessor options here if needed
    }
  },

  // Plugin configuration
  plugins: [
    // Plugins will be added here as needed
  ],

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Performance settings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },

  // Worker configuration for Web Workers
  worker: {
    format: 'es',
    plugins: []
  }
});
