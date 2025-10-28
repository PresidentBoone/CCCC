/**
 * Simple Build Script for CollegeClimb
 * Copies public directory to dist with optional optimization
 *
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

console.log(`
╔════════════════════════════════════════════════════════╗
║         📦 CollegeClimb Build Process                 ║
╠════════════════════════════════════════════════════════╣
║  Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}                                    ║
║  Source: /public                                        ║
║  Output: /dist                                          ║
╚════════════════════════════════════════════════════════╝
`);

// Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  console.log('🧹 Cleaning /dist directory...');
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy function
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    // Create directory in destination
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Copy all files in directory
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

// Start copying
console.log('📋 Copying files...');
const startTime = Date.now();

try {
  copyRecursive(PUBLIC_DIR, DIST_DIR);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Count files
  let fileCount = 0;
  function countFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        countFiles(filePath);
      } else {
        fileCount++;
      }
    });
  }
  countFiles(DIST_DIR);

  // Calculate total size
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

  console.log(`
╔════════════════════════════════════════════════════════╗
║         ✅ Build Complete                              ║
╠════════════════════════════════════════════════════════╣
║  Files:      ${fileCount.toString().padEnd(42)} ║
║  Total Size: ${sizeMB} MB${' '.repeat(38 - sizeMB.length)} ║
║  Duration:   ${duration}s${' '.repeat(39 - duration.length)} ║
║                                                         ║
║  Output:     /dist                                      ║
╚════════════════════════════════════════════════════════╝
  `);

  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
