#!/usr/bin/env node
const http = require('http');
const handler = require('./api/index.js');

const server = http.createServer(async (req, res) => {
  // Parse body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = {};
      }
      
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
      
      await handler(req, res);
    });
  } else {
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    await handler(req, res);
  }
});

server.listen(3001, () => {
  console.log('✅ Server running on http://localhost:3001');
  console.log('✅ Test with: curl http://localhost:3001/api');
});
