#!/usr/bin/env node

/**
 * WORKING Local Test Server for College Climb
 * Tests all API endpoints with proper environment variables
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables FIRST
require('dotenv').config();

// Verify OpenAI key loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env file!');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('✅ OpenAI API key found');

// Import API handler
const apiHandler = require('./api/index.js');

const PORT = 3001;

// Create server
const server = http.createServer(async (req, res) => {
  // Add helper methods to response
  res.status = (code) => { 
    res.statusCode = code; 
    return res; 
  };
  
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  
  // Parse POST/PUT body
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    
    await new Promise(resolve => {
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
        resolve();
      });
    });
  }
  
  // Parse query parameters
  const urlParts = req.url.split('?');
  req.query = {};
  if (urlParts[1]) {
    urlParts[1].split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        req.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
  }
  
  // Serve static files
  if (!req.url.startsWith('/api')) {
    const filePath = path.join(__dirname, 'public', req.url === '/' ? 'dashboard.html' : req.url);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
      };
      
      res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }
  
  // Handle API requests
  try {
    await apiHandler(req, res);
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 College Climb Test Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server:    http://localhost:${PORT}`);
  console.log(`✅ Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`✅ API Test:  http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Ready to test! Press Ctrl+C to stop.');
  console.log('');
});

// Handle errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Kill the other server first.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
