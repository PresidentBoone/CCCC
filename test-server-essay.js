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

// API Routes
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

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'essaycoach.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 College Climb Essay Coach Test Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📝 Essay Coach available at: http://localhost:${PORT}/essaycoach.html`);
  console.log(`\n✅ Features available:`);
  console.log(`   • Essay writing and editing`);
  console.log(`   • AI analysis with color-coded highlights`);
  console.log(`   • Personalized feedback`);
  console.log(`   • AI chat assistant`);
  console.log(`   • Essay saving and version management`);
  console.log(`   • Dark/light theme support`);
  console.log(`\n💡 Note: This is a test server with mock AI responses`);
  console.log(`   In production, connect to real OpenAI API and Firebase\n`);
});

module.exports = app;
