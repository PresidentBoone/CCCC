/**
 * Preview Server for CollegeClimb
 * Serves built files from /dist directory
 *
 * @version 2.0.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4173;
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Check if dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: /dist directory not found');
  console.log('Run `npm run build` first to create the production build');
  process.exit(1);
}

// Middleware
app.use(express.static(DIST_DIR));

// Serve HTML files without .html extension
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const htmlFile = path.join(DIST_DIR, `${page}.html`);

  if (fs.existsSync(htmlFile)) {
    res.sendFile(htmlFile);
  } else {
    next();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         🔍 CollegeClimb Preview Server                ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  Local:    http://localhost:${PORT}                      ║
║  Directory: /dist (production build)                    ║
║                                                         ║
║  Press Ctrl+C to stop                                   ║
║                                                         ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\\n✅ Server stopped');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\\n✅ Server stopped');
  process.exit(0);
});
