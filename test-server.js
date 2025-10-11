const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Simple MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Mock API responses for testing
const mockResponses = {
  '/api/essay-analyze': {
    highlights: [
      {
        text: "I want to major in computer science",
        type: "yellow",
        feedback: "This is a bit generic. Consider being more specific about what aspect of computer science interests you.",
        startIndex: 0,
        endIndex: 33
      },
      {
        text: "passionate about technology",
        type: "red", 
        feedback: "This is a cliché phrase. Try to show your passion through specific examples rather than stating it.",
        startIndex: 50,
        endIndex: 77
      },
      {
        text: "built my first mobile app when I was 15",
        type: "green",
        feedback: "Excellent specific example! This shows initiative and gives concrete evidence of your interest.",
        startIndex: 100,
        endIndex: 139
      }
    ],
    overallFeedback: "Your essay shows genuine interest in computer science, but could benefit from more specific examples and less generic language. The story about building your first app is compelling - consider expanding on this experience.",
    collegeSpecificAdvice: "For top-tier computer science programs, emphasize not just what you've built, but how you've learned from challenges and what unique perspective you'd bring to their program.",
    strengthsToLeanInto: [
      "Concrete example of building an app at age 15",
      "Shows early initiative in your field",
      "Demonstrates practical application of skills"
    ],
    areasToImprove: [
      "Avoid cliché phrases like 'passionate about technology'",
      "Be more specific about your computer science interests",
      "Connect your experiences to future goals more clearly"
    ],
    nextSteps: [
      "Replace generic phrases with specific details",
      "Expand on the app-building story with challenges and learnings",
      "Research your target schools' CS programs and connect your goals to their offerings"
    ]
  },
  '/api/essay-chat': {
    response: "That's a great question! When writing about your extracurricular activities, focus on the impact you made rather than just listing what you did. For example, instead of saying 'I was in debate club,' try 'Through debate club, I learned to research complex topics and articulate my thoughts under pressure, skills that helped me...' What specific activity would you like help writing about?"
  },
  '/api/essay-storage': {
    success: true,
    message: "Essay saved successfully!",
    essayId: "mock-essay-id-123",
    essays: [
      {
        id: "essay1",
        title: "Why Computer Science",
        wordCount: 487,
        versionCount: 2,
        createdAt: { seconds: Date.now() / 1000 - 86400 }
      },
      {
        id: "essay2", 
        title: "Overcoming Challenges",
        wordCount: 623,
        versionCount: 1,
        createdAt: { seconds: Date.now() / 1000 - 172800 }
      }
    ]
  }
};

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const requestData = JSON.parse(body);
          console.log(`API Request to ${pathname}:`, requestData);
          
          // Return mock response
          const mockResponse = mockResponses[pathname];
          if (mockResponse) {
            res.writeHead(200);
            res.end(JSON.stringify(mockResponse));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
          }
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else if (req.method === 'GET') {
      // Handle GET requests for essay storage
      if (pathname === '/api/essay-storage') {
        const action = parsedUrl.query.action;
        if (action === 'list') {
          res.writeHead(200);
          res.end(JSON.stringify(mockResponses[pathname]));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ 
            essay: {
              id: "essay1",
              title: "Why Computer Science",
              content: "I want to major in computer science because I am passionate about technology. I built my first mobile app when I was 15, which taught me about problem-solving and user experience design.",
              prompt: "Why do you want to study this major?",
              targetColleges: ["MIT", "Stanford", "Carnegie Mellon"]
            }
          }));
        }
      }
    }
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  
  // Security check
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    res.end(data);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('API endpoints available:');
  console.log('- POST /api/essay-analyze');
  console.log('- POST /api/essay-chat');
  console.log('- POST /api/essay-storage');
  console.log('- GET /api/essay-storage');
});
