const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Import API handlers
const essayAnalyze = require('./api/essay-analyze.js');
const essayChat = require('./api/essay-chat.js');
const essayStorage = require('./api/essay-storage.js');
const timelineRecommendations = require('./api/timeline-recommendations.js');
const timelineData = require('./api/timeline-data.js');
const testprepGenerate = require('./api/testprep-generate.js');

// Essay Coach API Routes
app.all('/api/essay-analyze', (req, res) => {
  // Mock OpenAI API key for testing
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'test-key';
  }
  
  // Mock the OpenAI API response for testing
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (url.includes('openai.com')) {
      // Return mock response
      return {
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                highlights: [
                  {
                    text: "sample text",
                    type: "yellow",
                    feedback: "This could be more specific and engaging.",
                    startIndex: 0,
                    endIndex: 11
                  }
                ],
                overallFeedback: "Your essay shows promise but could benefit from more specific examples and a stronger personal voice. Consider adding concrete details that showcase your unique perspective.",
                collegeSpecificAdvice: "For the colleges you've selected, focus on demonstrating intellectual curiosity and how you'll contribute to their campus community.",
                strengthsToLeanInto: [
                  "Clear writing style",
                  "Good structure and organization"
                ],
                areasToImprove: [
                  "Add more specific examples",
                  "Strengthen your unique voice",
                  "Connect experiences to future goals"
                ],
                nextSteps: [
                  "Revise the introduction to be more engaging",
                  "Add concrete details to support your main points",
                  "Review for word choice and sentence variety"
                ]
              })
            }
          }]
        })
      };
    }
    return originalFetch(url, options);
  };
  
  essayAnalyze.default(req, res);
});

app.all('/api/essay-chat', (req, res) => {
  // Mock OpenAI API key for testing
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'test-key';
  }
  
  // Mock the OpenAI API response for testing
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (url.includes('openai.com')) {
      const body = JSON.parse(options.body);
      const userMessage = body.messages[body.messages.length - 1].content;
      
      // Generate a simple response based on the user's message
      let response = "I understand you're asking about your essay. ";
      
      if (userMessage.toLowerCase().includes('improve') || userMessage.toLowerCase().includes('better')) {
        response += "To improve your essay, focus on adding specific examples that show rather than tell your story. Use concrete details and avoid clichés.";
      } else if (userMessage.toLowerCase().includes('introduction') || userMessage.toLowerCase().includes('intro')) {
        response += "For your introduction, try starting with a specific moment or scene that immediately draws the reader in. Avoid generic opening statements.";
      } else if (userMessage.toLowerCase().includes('conclusion')) {
        response += "Your conclusion should tie back to your opening while showing growth or insight. Don't just summarize - reflect on what you've learned.";
      } else {
        response += "That's a great question! Could you be more specific about what aspect of your essay you'd like help with? I'm here to guide you through the writing process.";
      }
      
      return {
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: response
            }
          }]
        })
      };
    }
    return originalFetch(url, options);
  };
  
  essayChat.default(req, res);
});

app.all('/api/essay-storage', (req, res) => {
  essayStorage.default(req, res);
});

// Timeline API Routes
app.all('/api/timeline-recommendations', (req, res) => {
  try {
    timelineRecommendations(req, res);
  } catch (error) {
    console.error('Timeline recommendations error:', error);
    res.status(500).json({ error: 'Timeline recommendations failed' });
  }
});

app.all('/api/timeline-data', (req, res) => {
  try {
    timelineData(req, res);
  } catch (error) {
    console.error('Timeline data error:', error);
    res.status(500).json({ error: 'Timeline data operation failed' });
  }
});

// Simple test route for debugging
app.all('/api/test', (req, res) => {
  console.log('Test route called!');
  res.json({ message: 'Test route working', method: req.method });
});

// Test Prep API Routes
app.all('/api/testprep-generate', (req, res) => {
  console.log('Test prep API called:', req.method, req.url);
  
  // Mock OpenAI API key for testing
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'test-key';
  }
  
  try {
    console.log('Calling testprep handler...');
    // The module exports the handler function directly
    testprepGenerate(req, res);
  } catch (error) {
    console.error('Test prep generation error:', error);
    res.status(500).json({ error: 'Test prep generation failed', details: error.message });
  }
});

console.log('Test prep route registered successfully');

// Static page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/essay-coach', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'essaycoach.html'));
});

app.get('/timeline', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adaptive-timeline.html'));
});

app.get('/testprep', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-enhanced.html'));
});

app.get('/testprep-practice', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-practice.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CollegeClimb Test Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n📄 Available Pages:`);
  console.log(`   🏠 Dashboard: http://localhost:${PORT}/`);
  console.log(`   📝 Essay Coach: http://localhost:${PORT}/essay-coach`);
  console.log(`   📅 Adaptive Timeline: http://localhost:${PORT}/timeline`);
  console.log(`   📊 Test Prep Dashboard: http://localhost:${PORT}/testprep`);
  console.log(`   📝 Test Prep Practice: http://localhost:${PORT}/testprep-practice`);
  console.log(`\n🔌 API Endpoints:`);
  console.log(`   • /api/essay-analyze - Essay analysis with AI feedback`);
  console.log(`   • /api/essay-chat - Interactive essay assistance`);
  console.log(`   • /api/essay-storage - Essay saving and management`);
  console.log(`   • /api/timeline-recommendations - AI timeline recommendations`);
  console.log(`   • /api/timeline-data - Timeline data management`);
  console.log(`   • /api/testprep-generate - AI test prep question generation`);
  console.log(`\n✅ Features available:`);
  console.log(`   • Essay writing and editing with AI feedback`);
  console.log(`   • Adaptive college application timeline`);
  console.log(`   • Comprehensive SAT/ACT/PSAT test prep system`);
  console.log(`   • AI-powered diagnostic assessments`);
  console.log(`   • Real practice questions from official tests`);
  console.log(`   • Desmos calculator integration for math sections`);
  console.log(`   • AI-powered recommendations`);
  console.log(`   • Task management and progress tracking`);
  console.log(`   • Dark/light theme support`);
  console.log(`\n💡 Note: This is a test server with mock AI responses`);
  console.log(`   In production, connect to real OpenAI API and Firebase\n`);
});

module.exports = app;
