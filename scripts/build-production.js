/**
 * Production Build Script for CollegeClimb
 * Copies and optimizes files for production deployment
 *
 * Features:
 * - JavaScript minification with Terser
 * - File size reporting
 * - Performance metrics
 *
 * @version 3.0.0 - Phase 3 Enhancement
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DIST_DIR = path.join(__dirname, '..', 'dist');

console.log(`
╔════════════════════════════════════════════════════════╗
║      📦 CollegeClimb Production Build - Phase 3       ║
╠════════════════════════════════════════════════════════╣
║  Mode: PRODUCTION (with optimization)                  ║
║  Source: /public                                        ║
║  Output: /dist                                          ║
╚════════════════════════════════════════════════════════╝
`);

// Track optimization metrics
const metrics = {
  totalFiles: 0,
  jsFiles: 0,
  jsOriginalSize: 0,
  jsMinifiedSize: 0,
  htmlFiles: 0,
  cssFiles: 0,
  imageFiles: 0,
  otherFiles: 0
};

// Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  console.log('🧹 Cleaning /dist directory...');
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(DIST_DIR, { recursive: true });

/**
 * Minify JavaScript file
 */
async function minifyJavaScript(code, filename) {
  try {
    const result = await minify(code, {
      compress: {
        dead_code: true,
        drop_console: true,  // Remove console.log, console.info, console.debug in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Additional console removal
        passes: 2            // Multiple optimization passes
      },
      mangle: {
        keep_classnames: true, // Preserve class names for debugging
        keep_fnames: true // Preserve function names for stack traces
      },
      format: {
        comments: false
      },
      sourceMap: false
    });

    return result.code;
  } catch (error) {
    console.warn(`⚠️  Minification failed for ${filename}: ${error.message}`);
    return code; // Return original if minification fails
  }
}

/**
 * Copy and optimize file
 */
async function copyAndOptimize(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    // Create directory in destination
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Process all files in directory
    const files = fs.readdirSync(src);
    for (const file of files) {
      await copyAndOptimize(path.join(src, file), path.join(dest, file));
    }
  } else {
    metrics.totalFiles++;
    const ext = path.extname(src).toLowerCase();

    // Handle JavaScript files
    if (ext === '.js') {
      metrics.jsFiles++;
      const originalCode = fs.readFileSync(src, 'utf8');
      metrics.jsOriginalSize += originalCode.length;

      console.log(`🔧 Minifying ${path.basename(src)}...`);
      const minifiedCode = await minifyJavaScript(originalCode, src);
      metrics.jsMinifiedSize += minifiedCode.length;

      fs.writeFileSync(dest, minifiedCode, 'utf8');

      const originalKB = (originalCode.length / 1024).toFixed(2);
      const minifiedKB = (minifiedCode.length / 1024).toFixed(2);
      const savings = ((1 - minifiedCode.length / originalCode.length) * 100).toFixed(1);
      console.log(`   ✅ ${originalKB} KB → ${minifiedKB} KB (${savings}% smaller)`);
    }
    // Handle HTML files
    else if (ext === '.html') {
      metrics.htmlFiles++;
      fs.copyFileSync(src, dest);
    }
    // Handle CSS files
    else if (ext === '.css') {
      metrics.cssFiles++;
      fs.copyFileSync(src, dest);
    }
    // Handle image files
    else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
      metrics.imageFiles++;
      fs.copyFileSync(src, dest);
    }
    // Handle other files
    else {
      metrics.otherFiles++;
      fs.copyFileSync(src, dest);
    }
  }
}

// Start build process
async function build() {
  console.log('📋 Copying and optimizing files...\n');
  const startTime = Date.now();

  try {
    await copyAndOptimize(PUBLIC_DIR, DIST_DIR);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Calculate final dist size
    function getDirSize(dir) {
      let size = 0;
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += getDirSize(filePath);
        } else {
          size += stats.size;
        }
      });
      return size;
    }

    const totalSize = getDirSize(DIST_DIR);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    // Calculate JavaScript savings
    const jsOriginalMB = (metrics.jsOriginalSize / (1024 * 1024)).toFixed(2);
    const jsMinifiedMB = (metrics.jsMinifiedSize / (1024 * 1024)).toFixed(2);
    const jsSavings = ((1 - metrics.jsMinifiedSize / metrics.jsOriginalSize) * 100).toFixed(1);

    console.log(`
╔════════════════════════════════════════════════════════╗
║         ✅ Production Build Complete                   ║
╠════════════════════════════════════════════════════════╣
║  Total Files:    ${metrics.totalFiles.toString().padEnd(38)} ║
║    • HTML:       ${metrics.htmlFiles.toString().padEnd(38)} ║
║    • JavaScript: ${metrics.jsFiles.toString().padEnd(38)} ║
║    • CSS:        ${metrics.cssFiles.toString().padEnd(38)} ║
║    • Images:     ${metrics.imageFiles.toString().padEnd(38)} ║
║    • Other:      ${metrics.otherFiles.toString().padEnd(38)} ║
║                                                         ║
║  JavaScript Optimization:                               ║
║    • Original:   ${jsOriginalMB} MB${' '.repeat(34 - jsOriginalMB.length)} ║
║    • Minified:   ${jsMinifiedMB} MB${' '.repeat(34 - jsMinifiedMB.length)} ║
║    • Savings:    ${jsSavings}%${' '.repeat(37 - jsSavings.length)} ║
║                                                         ║
║  Total Size:     ${sizeMB} MB${' '.repeat(34 - sizeMB.length)} ║
║  Build Time:     ${duration}s${' '.repeat(35 - duration.length)} ║
║                                                         ║
║  Output:         /dist                                  ║
╚════════════════════════════════════════════════════════╝
    `);

    // Print optimization recommendations
    console.log('💡 Optimization Tips:');
    if (metrics.cssFiles > 10) {
      console.log('   • Consider consolidating CSS files');
    }
    if (metrics.imageFiles > 20) {
      console.log('   • Consider implementing lazy loading for images');
    }
    if (metrics.jsFiles > 30) {
      console.log('   • Consider code splitting for better caching');
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run build
build();
