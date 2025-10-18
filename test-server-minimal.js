#!/usr/bin/env node

/**
 * Minimal Test Server for College Climb API
 * Tests API functionality without complex dependencies
 */

import dotenv from 'dotenv';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our API handler
import apiHandler from './api/index.js';

const PORT = 3001;

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api')) {
    try {
      // Add Express-like methods to response object
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      
      // Collect request body for POST requests
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch (e) {
            req.body = {};
          }
          req.query = parsedUrl.query;
          await apiHandler(req, res);
        });
      } else {
        req.body = {};
        req.query = parsedUrl.query;
        await apiHandler(req, res);
      }
      return;
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
      return;
    }
  }

  // Handle static files
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'dashboard.html' : pathname.slice(1));
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  // Serve the file
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('🚀 College Climb Minimal Test Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`✅ Essay Coach: http://localhost:${PORT}/essaycoach.html`);
  console.log(`✅ API Test: http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  Set OPENAI_API_KEY in .env for AI features to work');
  console.log('');
});

export default server;
