/**
 * Simple Development Server for CollegeClimb
 * Serves static files from /public directory with live reload
 *
 * @version 2.0.0
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Serve HTML files without .html extension
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const htmlFile = path.join(PUBLIC_DIR, `${page}.html`);

  // Check if HTML file exists
  const fs = require('fs');
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
║         🚀 CollegeClimb Development Server            ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  Local:    http://localhost:${PORT}                      ║
║  Directory: /public                                     ║
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
