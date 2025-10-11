const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Timeline recommendations endpoint
app.post('/api/timeline-recommendations', (req, res) => {
  console.log('Timeline recommendations request received:', req.body);
  
  const mockRecommendations = [
    {
      icon: 'clock',
      title: 'Urgent Deadlines Approaching',
      description: 'You have important application deadlines coming up in the next 2 weeks. Focus on completing your essays and requesting recommendation letters.'
    },
    {
      icon: 'pen',
      title: 'Essay Writing Strategy',
      description: 'Start with brainstorming sessions for each prompt. Focus on unique experiences that showcase your personality and achievements.'
    },
    {
      icon: 'user-friends',
      title: 'Request Recommendation Letters',
      description: 'Give your recommenders at least 4-6 weeks notice. Provide them with your resume, activity list, and any specific points you\'d like them to highlight.'
    },
    {
      icon: 'star',
      title: 'Stay Organized',
      description: 'Create a dedicated folder for each college application. Keep track of passwords, login information, and application requirements.'
    }
  ];

  res.json({
    success: true,
    recommendations: mockRecommendations
  });
});

// Timeline data endpoint
app.post('/api/timeline-data', (req, res) => {
  console.log('Timeline data save request:', req.body);
  res.json({
    success: true,
    message: 'Timeline data saved successfully',
    data: req.body
  });
});

app.get('/api/timeline-data', (req, res) => {
  console.log('Timeline data get request:', req.query);
  
  const mockData = {
    userId: req.query.userId || 'demo-user',
    colleges: [
      {
        key: 'harvard',
        name: 'Harvard University',
        location: 'Cambridge, MA',
        type: 'Private',
        addedDate: new Date().toISOString()
      }
    ],
    tasks: {},
    preferences: {
      graduationYear: 2026,
      applicationTypes: ['RD']
    },
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockData
  });
});

app.put('/api/timeline-data', (req, res) => {
  console.log('Timeline data update request:', req.body);
  res.json({
    success: true,
    message: 'Task status updated successfully',
    data: req.body
  });
});

// Static routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/timeline', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adaptive-timeline.html'));
});

app.get('/essay-coach', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'essaycoach.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CollegeClimb Timeline Test Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n📄 Available Pages:`);
  console.log(`   🏠 Dashboard: http://localhost:${PORT}/`);
  console.log(`   📝 Essay Coach: http://localhost:${PORT}/essay-coach`);
  console.log(`   📅 Adaptive Timeline: http://localhost:${PORT}/timeline`);
  console.log(`\n🔌 API Endpoints:`);
  console.log(`   • POST /api/timeline-recommendations - Get AI recommendations`);
  console.log(`   • GET/POST/PUT /api/timeline-data - Manage timeline data`);
  console.log(`   • GET /test - Simple test endpoint`);
  console.log(`\n✅ Timeline Features:`);
  console.log(`   • Personalized application timelines`);
  console.log(`   • AI-powered recommendations`);
  console.log(`   • Task management and progress tracking`);
  console.log(`   • Data persistence and sync`);
  console.log(`\n🧪 Test the APIs:`);
  console.log(`   curl http://localhost:${PORT}/test`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/timeline-recommendations -H "Content-Type: application/json" -d '{"colleges":[]}'`);
  console.log(`\n💡 Ready for timeline testing!\n`);
});

module.exports = app;
