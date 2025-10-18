#!/usr/bin/env node

/**
 * Development Test Server for College Climb API
 * Simulates Vercel serverless function environment locally
 * Supports ES6 modules properly
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Import API handler
import apiHandler from './api/index.js';

// Route all API calls to our unified handler
app.all('/api/*', async (req, res) => {
  try {
    await apiHandler(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'College Climb Test Server Running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 College Climb Test Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`✅ Essay Coach: http://localhost:${PORT}/essaycoach.html`);
  console.log(`✅ API Health: http://localhost:${PORT}/health`);
  console.log(`✅ API Endpoints: http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔧 Available API Endpoints:');
  console.log('   POST /api/chat - AI college counseling');
  console.log('   POST /api/essay-analyze - Essay analysis');
  console.log('   POST /api/essay-storage - Essay storage');
  console.log('   GET  /api/college-search - College search');
  console.log('   POST /api/testprep-generate - Test prep questions');
  console.log('   GET  /api/timeline - Timeline management');
  console.log('   GET  /api/scrape-scholarships - Scholarship finder');
  console.log('   POST /api/intelligence - AI insights');
  console.log('');
  console.log('⚠️  Remember to set OPENAI_API_KEY in .env for AI features');
  console.log('');
});

export default app;
