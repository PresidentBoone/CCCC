const express = require('express');
const path = require('path');

const app = express();
const PORT = 3003;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Add all page routes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/essaycoach', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'essaycoach.html'));
});

app.get('/essaycoach.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'essaycoach.html'));
});

app.get('/adaptive-timeline', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adaptive-timeline.html'));
});

app.get('/adaptive-timeline.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adaptive-timeline.html'));
});

app.get('/testprep-enhanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-enhanced.html'));
});

app.get('/testprep-enhanced.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-enhanced.html'));
});

app.get('/testprep-practice', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-practice.html'));
});

app.get('/testprep-practice.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'testprep-practice.html'));
});

app.get('/scholarship', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scholarship.html'));
});

app.get('/scholarship.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'scholarship.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/document', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document.html'));
});

app.get('/document.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'document.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Essay analysis API (simplified)
app.post('/api/essay-analyze', (req, res) => {
  console.log('Essay analyze request received');
  const { essay } = req.body;
  
  if (!essay) {
    return res.status(400).json({ error: 'Essay content required' });
  }
  
  res.json({
    highlights: [{
      text: essay.substring(0, 20),
      type: "yellow",
      feedback: "Consider making this more engaging.",
      startIndex: 0,
      endIndex: 20
    }],
    overallFeedback: "Your essay shows promise. Focus on specific examples.",
    strengthsToLeanInto: ["Clear writing", "Good structure"],
    areasToImprove: ["Add specifics", "Strengthen voice"],
    nextSteps: ["Revise intro", "Add examples"]
  });
});

// Test prep API (enhanced)
app.post('/api/testprep-generate', (req, res) => {
  console.log('Test prep request received');
  const { subject = 'math', difficulty = 'medium', questionCount = 3, testType = 'sat' } = req.body;
  
  const questionBank = {
    math: {
      easy: [
        {
          id: 1,
          question: "If 2x + 3 = 11, what is x?",
          options: ["A) 2", "B) 4", "C) 6", "D) 8"],
          correctAnswer: "B",
          explanation: "Subtract 3 from both sides: 2x = 8. Then divide by 2: x = 4."
        },
        {
          id: 2,
          question: "What is 15% of 80?",
          options: ["A) 10", "B) 12", "C) 15", "D) 20"],
          correctAnswer: "B",
          explanation: "15% of 80 = 0.15 × 80 = 12"
        },
        {
          id: 3,
          question: "A rectangle has length 8 and width 5. What is its area?",
          options: ["A) 13", "B) 26", "C) 40", "D) 45"],
          correctAnswer: "C",
          explanation: "Area = length × width = 8 × 5 = 40"
        }
      ],
      medium: [
        {
          id: 4,
          question: "If f(x) = 2x² - 3x + 1, what is f(2)?",
          options: ["A) 3", "B) 5", "C) 7", "D) 9"],
          correctAnswer: "A",
          explanation: "f(2) = 2(2)² - 3(2) + 1 = 8 - 6 + 1 = 3"
        },
        {
          id: 5,
          question: "Solve: x² - 5x + 6 = 0",
          options: ["A) x = 2,3", "B) x = 1,6", "C) x = 2,4", "D) x = 1,5"],
          correctAnswer: "A",
          explanation: "(x-2)(x-3) = 0, so x = 2 or x = 3"
        },
        {
          id: 6,
          question: "The slope of the line passing through (1,3) and (4,9) is:",
          options: ["A) 1", "B) 2", "C) 3", "D) 4"],
          correctAnswer: "B",
          explanation: "Slope = (y₂-y₁)/(x₂-x₁) = (9-3)/(4-1) = 6/3 = 2"
        }
      ],
      hard: [
        {
          id: 7,
          question: "In a circle with center O, if arc AB has measure 60°, what is the measure of inscribed angle ACB?",
          options: ["A) 30°", "B) 60°", "C) 90°", "D) 120°"],
          correctAnswer: "A",
          explanation: "An inscribed angle is half the central angle that subtends the same arc. 60° ÷ 2 = 30°"
        },
        {
          id: 8,
          question: "If log₂(x) = 5, then x equals:",
          options: ["A) 10", "B) 25", "C) 32", "D) 64"],
          correctAnswer: "C",
          explanation: "log₂(x) = 5 means 2⁵ = x, so x = 32"
        }
      ]
    },
    reading: {
      easy: [
        {
          id: 9,
          question: "In the context of the passage, 'meticulous' most nearly means:",
          options: ["A) careful", "B) quick", "C) expensive", "D) difficult"],
          correctAnswer: "A",
          explanation: "Meticulous means showing great attention to detail; being very careful and precise."
        },
        {
          id: 10,
          question: "The word 'profound' in line 15 most nearly means:",
          options: ["A) shallow", "B) deep", "C) simple", "D) obvious"],
          correctAnswer: "B",
          explanation: "Profound means having deep meaning or significance."
        },
        {
          id: 20,
          question: "According to the passage, what is the main benefit mentioned?",
          options: ["A) speed", "B) convenience", "C) cost-effectiveness", "D) reliability"],
          correctAnswer: "C",
          explanation: "The passage emphasizes cost-effectiveness as the primary advantage discussed."
        }
      ],
      medium: [
        {
          id: 11,
          question: "The author's primary purpose in this passage is to:",
          options: ["A) entertain", "B) inform", "C) persuade", "D) criticize"],
          correctAnswer: "B",
          explanation: "Based on the factual tone and educational content, the author's main goal is to inform readers."
        },
        {
          id: 12,
          question: "Which of the following best describes the author's tone?",
          options: ["A) hostile", "B) objective", "C) sarcastic", "D) passionate"],
          correctAnswer: "B",
          explanation: "The author maintains an objective, neutral tone throughout the passage."
        },
        {
          id: 21,
          question: "The passage implies that the relationship between X and Y is:",
          options: ["A) causal", "B) correlational", "C) contradictory", "D) unrelated"],
          correctAnswer: "A",
          explanation: "The text suggests a direct causal relationship where X leads to Y."
        }
      ],
      hard: [
        {
          id: 13,
          question: "The passage suggests that the relationship between the two concepts can best be described as:",
          options: ["A) contradictory", "B) complementary", "C) identical", "D) unrelated"],
          correctAnswer: "B",
          explanation: "The passage indicates the concepts work together in a complementary fashion."
        },
        {
          id: 22,
          question: "The author's use of the phrase 'nuanced perspective' in the final paragraph serves to:",
          options: ["A) introduce a new argument", "B) summarize previous points", "C) acknowledge complexity", "D) refute opposing views"],
          correctAnswer: "C",
          explanation: "The phrase indicates the author is acknowledging the complexity and subtlety of the issue being discussed."
        },
        {
          id: 23,
          question: "Which of the following best captures the main paradox presented in the passage?",
          options: ["A) progress vs. tradition", "B) individual vs. collective", "C) theory vs. practice", "D) simplicity vs. complexity"],
          correctAnswer: "C",
          explanation: "The passage explores the tension between theoretical ideals and practical implementation challenges."
        }
      ]
    }
  };
  
  const questions = questionBank[subject]?.[difficulty] || questionBank.math.medium;
  const selectedQuestions = questions.slice(0, Math.min(questionCount, questions.length));
  
  res.json({
    questions: selectedQuestions,
    metadata: { subject, difficulty, questionCount: selectedQuestions.length, testType }
  });
});

// Essay chat API
app.post('/api/essay-chat', (req, res) => {
  console.log('Essay chat request received');
  const { message, essayContent = '', chatHistory = [] } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  let response = "I'm here to help with your essay! ";
  
  if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('better')) {
    response += "To improve your essay: 1) Add specific examples that show rather than tell, 2) Use active voice, 3) Create smooth transitions between paragraphs, 4) Ensure each paragraph has a clear purpose.";
  } else if (message.toLowerCase().includes('introduction') || message.toLowerCase().includes('opening')) {
    response += "For a strong introduction: 1) Start with a compelling hook (anecdote, question, or surprising fact), 2) Provide necessary context, 3) End with a clear thesis that previews your main points.";
  } else if (message.toLowerCase().includes('conclusion') || message.toLowerCase().includes('ending')) {
    response += "For an effective conclusion: 1) Restate your thesis in new words, 2) Summarize key insights (not just facts), 3) End with a call to action or forward-looking statement about your future goals.";
  } else if (message.toLowerCase().includes('length') || message.toLowerCase().includes('word')) {
    response += "Most college essays should be 500-650 words. Focus on quality over quantity - every sentence should add value to your story and help admissions officers understand who you are.";
  } else if (message.toLowerCase().includes('personal') || message.toLowerCase().includes('story')) {
    response += "Personal essays should reveal character, values, and growth. Choose a specific moment or experience, reflect on its impact, and connect it to your future goals. Show don't tell!";
  } else {
    response += "I can help with structure, content, style, grammar, or specific sections. What aspect of your essay would you like to focus on?";
  }
  
  res.json({ response });
});

// Timeline recommendations API
app.post('/api/timeline-recommendations', (req, res) => {
  console.log('Timeline recommendations request received');
  const { studentType = 'RD', graduationYear = '2026', currentMonth = new Date().getMonth() + 1 } = req.body;
  
  const timelineTemplates = {
    'ED': { // Early Decision
      9: [
        { task: "Finalize ED school choice", priority: "high", category: "applications" },
        { task: "Complete Common Application", priority: "high", category: "applications" },
        { task: "Write ED supplemental essays", priority: "high", category: "essays" },
        { task: "Request teacher recommendations", priority: "medium", category: "recommendations" }
      ],
      10: [
        { task: "Submit ED application", priority: "high", category: "applications" },
        { task: "Submit CSS Profile if required", priority: "high", category: "financial" },
        { task: "Continue working on RD applications", priority: "medium", category: "applications" }
      ],
      11: [
        { task: "Submit RD applications", priority: "high", category: "applications" },
        { task: "Apply for scholarships", priority: "medium", category: "financial" },
        { task: "Send fall grades to colleges", priority: "medium", category: "academic" }
      ]
    },
    'EA': { // Early Action
      9: [
        { task: "Complete EA applications", priority: "high", category: "applications" },
        { task: "Write personal statement", priority: "high", category: "essays" },
        { task: "Request transcripts", priority: "medium", category: "academic" }
      ],
      10: [
        { task: "Submit EA applications", priority: "high", category: "applications" },
        { task: "Work on RD supplemental essays", priority: "medium", category: "essays" }
      ]
    },
    'RD': { // Regular Decision
      10: [
        { task: "Research colleges and create final list", priority: "high", category: "research" },
        { task: "Begin Common Application", priority: "high", category: "applications" },
        { task: "Draft personal statement", priority: "high", category: "essays" }
      ],
      11: [
        { task: "Complete college applications", priority: "high", category: "applications" },
        { task: "Write supplemental essays", priority: "high", category: "essays" },
        { task: "Submit FAFSA", priority: "high", category: "financial" }
      ],
      12: [
        { task: "Submit all RD applications", priority: "high", category: "applications" },
        { task: "Apply for merit scholarships", priority: "medium", category: "financial" },
        { task: "Send mid-year grades", priority: "medium", category: "academic" }
      ]
    }
  };
  
  const recommendations = timelineTemplates[studentType] || timelineTemplates['RD'];
  const currentTasks = recommendations[currentMonth] || recommendations[10] || [];
  
  res.json({
    tasks: currentTasks,
    metadata: { studentType, graduationYear, currentMonth, totalTasks: currentTasks.length }
  });
});

// College search API
app.get('/api/college-search', (req, res) => {
  console.log('College search request received');
  const { query = '', state = '', type = '', size = '' } = req.query;
  
  const colleges = [
    {
      name: 'Harvard University',
      location: 'Cambridge, MA',
      state: 'MA',
      type: 'Private',
      size: 'Medium',
      acceptanceRate: '3.4%',
      avgSAT: '1520',
      avgACT: '34',
      tuition: '$54,269',
      ranking: 2,
      majors: ['Computer Science', 'Economics', 'Biology', 'Psychology']
    },
    {
      name: 'Stanford University',
      location: 'Stanford, CA',
      state: 'CA',
      type: 'Private',
      size: 'Large',
      acceptanceRate: '3.9%',
      avgSAT: '1505',
      avgACT: '33',
      tuition: '$56,169',
      ranking: 3,
      majors: ['Engineering', 'Computer Science', 'Business', 'Medicine']
    },
    {
      name: 'UC Berkeley',
      location: 'Berkeley, CA',
      state: 'CA',
      type: 'Public',
      size: 'Large',
      acceptanceRate: '14.5%',
      avgSAT: '1415',
      avgACT: '31',
      tuition: '$14,312',
      ranking: 4,
      majors: ['Engineering', 'Computer Science', 'Business', 'Liberal Arts']
    },
    {
      name: 'MIT',
      location: 'Cambridge, MA',
      state: 'MA',
      type: 'Private',
      size: 'Medium',
      acceptanceRate: '6.7%',
      avgSAT: '1535',
      avgACT: '35',
      tuition: '$53,790',
      ranking: 1,
      majors: ['Engineering', 'Computer Science', 'Physics', 'Mathematics']
    },
    {
      name: 'Yale University',
      location: 'New Haven, CT',
      state: 'CT',
      type: 'Private',
      size: 'Medium',
      acceptanceRate: '4.6%',
      avgSAT: '1515',
      avgACT: '34',
      tuition: '$59,950',
      ranking: 5,
      majors: ['Liberal Arts', 'Economics', 'Political Science', 'History']
    }
  ];
  
  let filteredColleges = colleges;
  
  if (query) {
    filteredColleges = filteredColleges.filter(college => 
      college.name.toLowerCase().includes(query.toLowerCase()) ||
      college.majors.some(major => major.toLowerCase().includes(query.toLowerCase()))
    );
  }
  
  if (state) {
    filteredColleges = filteredColleges.filter(college => 
      college.state.toLowerCase() === state.toLowerCase()
    );
  }
  
  if (type) {
    filteredColleges = filteredColleges.filter(college => 
      college.type.toLowerCase() === type.toLowerCase()
    );
  }
  
  if (size) {
    filteredColleges = filteredColleges.filter(college => 
      college.size.toLowerCase() === size.toLowerCase()
    );
  }
  
  res.json({
    colleges: filteredColleges,
    total: filteredColleges.length,
    query: { query, state, type, size }
  });
});

// Start server with error handling
app.listen(PORT, (error) => {
  if (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
  
  console.log(`\n🚀 CollegeClimb Simple Test Server`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`\n🧪 Test endpoints:`);
  console.log(`   • GET  /test - Server health check`);
  console.log(`   • GET  / - Dashboard homepage`);
  console.log(`   • POST /api/essay-analyze - Essay analysis`);
  console.log(`   • POST /api/testprep-generate - Test prep questions`);
  console.log(`\n✅ Ready for testing!\n`);
});

console.log('🔄 Starting server...');
