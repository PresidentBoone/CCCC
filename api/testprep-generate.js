// Enhanced Test Prep Question Generation API
// Note: This is a mock implementation that works without OpenAI for testing

// Real SAT/ACT question databases and templates
const REAL_QUESTION_TEMPLATES = {
  'sat-math': {
    algebra: [
      {
        type: 'linear-equations',
        template: 'If {a}x + {b} = {c}, what is the value of x?',
        solution_template: 'Subtract {b} from both sides: {a}x = {c-b}. Then divide by {a}: x = {(c-b)/a}.',
        difficulty_factors: { easy: [2,3,5], medium: [7,11,13], hard: [17,19,23] }
      },
      {
        type: 'quadratic-equations',
        template: 'What are the solutions to x² + {b}x + {c} = 0?',
        solution_template: 'Using the quadratic formula: x = (-{b} ± √({b}² - 4(1)({c}))) / 2(1)',
        difficulty_factors: { easy: [-5,-3,-1], medium: [-7,11,-13], hard: [17,-19,23] }
      }
    ],
    geometry: [
      {
        type: 'area-perimeter',
        template: 'A rectangle has a length of {l} cm and a width of {w} cm. What is its {measurement}?',
        solutions: {
          perimeter: '2({l} + {w}) = {2*(l+w)} cm',
          area: '{l} × {w} = {l*w} cm²'
        }
      }
    ]
  },
  'act-math': {
    arithmetic: [
      {
        type: 'percentage',
        template: '{percent}% of {number} is what number?',
        solution_template: '{percent}/100 × {number} = {result}'
      }
    ]
  },
  'sat-reading': {
    vocabulary: [
      {
        type: 'context-clues',
        template: 'In the context of the passage, "{word}" most nearly means:',
        word_bank: {
          easy: ['happy', 'sad', 'big', 'small'],
          medium: ['elated', 'melancholy', 'enormous', 'minute'],
          hard: ['euphoric', 'lugubrious', 'gargantuan', 'infinitesimal']
        }
      }
    ]
  }
};

const OFFICIAL_PRACTICE_QUESTIONS = {
  'sat-math': [
    {
      prompt: "If 2x + 3y = 12 and x - y = 1, what is the value of x?",
      options: ["1", "2", "3", "4"],
      correct: 2,
      explanation: "From the second equation: x = y + 1. Substitute into first: 2(y + 1) + 3y = 12. Solve: 2y + 2 + 3y = 12, so 5y = 10, y = 2. Therefore x = 3.",
      category: "algebra",
      difficulty: "medium",
      source: "College Board Practice Test"
    },
    {
      prompt: "The graph of y = f(x) is shown above. For which value of x is f(x) = 0?",
      options: ["-2", "-1", "0", "1"],
      correct: 1,
      explanation: "f(x) = 0 where the graph crosses the x-axis. Looking at the graph, this occurs at x = -1.",
      category: "functions",
      difficulty: "easy",
      hasImage: true,
      source: "Official SAT Practice"
    }
  ],
  'act-math': [
    {
      prompt: "What is the least common multiple of 12 and 18?",
      options: ["6", "30", "36", "216"],
      correct: 2,
      explanation: "Find prime factorizations: 12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 4 × 9 = 36.",
      category: "number-theory",
      difficulty: "easy",
      source: "ACT Practice Test"
    }
  ],
  'psat-math': [
    {
      prompt: "If y = 3x - 2 and y = 7, what is the value of x?",
      options: ["1", "2", "3", "4"],
      correct: 2,
      explanation: "Substitute y = 7: 7 = 3x - 2. Add 2: 9 = 3x. Divide by 3: x = 3.",
      category: "algebra",
      difficulty: "easy",
      source: "PSAT Practice"
    }
  ]
};

// Diagnostic assessment questions to identify weak areas
const DIAGNOSTIC_QUESTIONS = {
  'sat-math': {
    algebra: [
      "Linear equations and inequalities",
      "Systems of equations", 
      "Quadratic equations",
      "Exponential functions"
    ],
    geometry: [
      "Area and perimeter",
      "Volume and surface area",
      "Coordinate geometry",
      "Trigonometry"
    ],
    statistics: [
      "Data interpretation",
      "Probability",
      "Statistical measures"
    ]
  }
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      subject, 
      difficulty, 
      questionCount = 10, 
      weakAreas = [], 
      userLevel = 'medium',
      sessionType = 'practice' // 'diagnostic', 'practice', 'full-test'
    } = req.body;

    console.log(`Generating ${questionCount} ${subject} questions (${difficulty} level)`);

    let questions = [];

    if (sessionType === 'diagnostic') {
      questions = await generateDiagnosticQuestions(subject, questionCount);
    } else if (sessionType === 'practice') {
      questions = await generatePracticeQuestions(subject, difficulty, questionCount, weakAreas);
    } else if (sessionType === 'full-test') {
      questions = await generateFullTestQuestions(subject);
    }

    // Add real questions from our database
    const realQuestions = getOfficialQuestions(subject, difficulty, Math.min(5, questionCount));
    questions = [...questions, ...realQuestions];

    // Shuffle and limit to requested count
    questions = shuffleArray(questions).slice(0, questionCount);

    // Calculate target scores and insights
    const insights = generateStudyInsights(subject, weakAreas, userLevel);

    res.status(200).json({
      success: true,
      questions,
      insights,
      metadata: {
        subject,
        difficulty,
        questionCount: questions.length,
        estimatedTime: questions.length * 2, // 2 minutes per question
        scoringInfo: getScoringInfo(subject)
      }
    });

  } catch (error) {
    console.error('Test prep generation error:', error);
    
    // Fallback to basic questions
    const fallbackQuestions = getFallbackQuestions(req.body.subject || 'sat-math', req.body.questionCount || 10);
    
    res.status(200).json({
      success: true,
      questions: fallbackQuestions,
      insights: {
        recommendation: "Practice more questions to improve your score!",
        targetAreas: ["Basic algebra", "Geometry fundamentals"]
      },
      fallback: true
    });
  }
}

async function generateDiagnosticQuestions(subject, count) {
  const questions = [];
  const categories = DIAGNOSTIC_QUESTIONS[subject] || {};
  
  // Generate questions across all categories to assess strengths/weaknesses
  Object.keys(categories).forEach(category => {
    const categoryQuestions = generateCategoryQuestions(subject, category, 'mixed', 2);
    questions.push(...categoryQuestions);
  });

  return questions.slice(0, count);
}

// Enhanced question generation with better error handling
async function generatePracticeQuestions(subject, difficulty, count, weakAreas) {
  const questions = [];
  
  // Get official questions first
  const officialQuestions = getOfficialQuestions(subject, difficulty, Math.floor(count / 2));
  questions.push(...officialQuestions);
  
  // Generate AI questions for remaining slots
  const remainingCount = count - questions.length;
  if (remainingCount > 0) {
    const aiQuestions = await generateAIQuestions(subject, difficulty, remainingCount, weakAreas);
    questions.push(...aiQuestions);
  }
  
  // Fill with template questions if still not enough
  while (questions.length < count) {
    const templateQuestions = generateTemplateQuestions(subject, difficulty, count - questions.length);
    questions.push(...templateQuestions);
  }
  
  return questions.slice(0, count);
}

async function generateAIQuestions(subject, difficulty, count, weakAreas) {
  // In a real implementation, this would call OpenAI API
  // For now, return enhanced template questions
  return generateTemplateQuestions(subject, difficulty, count, weakAreas);
}

function generateTemplateQuestions(subject, difficulty, count, weakAreas = []) {
  const templates = REAL_QUESTION_TEMPLATES[subject] || REAL_QUESTION_TEMPLATES['sat-math'];
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const categoryKeys = Object.keys(templates);
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const categoryTemplates = templates[randomCategory];
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    
    // Generate question from template
    const question = generateFromTemplate(template, subject, difficulty);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

async function generateFullTestQuestions(subject) {
  // Generate full-length test with proper section breakdown
  const testStructure = {
    'sat-math': { calculator: 38, noCalculator: 20 },
    'sat-reading': { passages: 52 },
    'act-math': { total: 60 },
    'act-english': { total: 75 },
    'act-reading': { total: 40 },
    'act-science': { total: 40 }
  };

  const structure = testStructure[subject];
  if (!structure) return [];

  // Generate questions according to official test structure
  return generateStructuredTest(subject, structure);
}

function generateCategoryQuestions(subject, category, difficulty, count) {
  const templates = REAL_QUESTION_TEMPLATES[subject]?.[category] || [];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    if (template) {
      const question = generateFromTemplate(template, difficulty);
      questions.push({
        ...question,
        category,
        subject,
        difficulty,
        source: 'Generated'
      });
    }
  }

  return questions;
}

function generateFromTemplate(template, subject, difficulty) {
  if (!template) return null;
  
  try {
    if (template.type === 'linear-equations') {
      const factors = template.difficulty_factors[difficulty] || template.difficulty_factors.medium;
      const a = factors[0];
      const b = factors[1];
      const c = factors[2];
      
      return {
        prompt: `If ${a}x + ${b} = ${c}, what is the value of x?`,
        options: [
          String(Math.round((c - b) / a)),
          String(Math.round((c - b) / a) + 1),
          String(Math.round((c - b) / a) - 1),
          String(Math.round((c - b) / a) + 2)
        ],
        correctAnswer: 0,
        explanation: `Subtract ${b} from both sides: ${a}x = ${c - b}. Then divide by ${a}: x = ${(c - b) / a}.`,
        category: 'algebra',
        difficulty: difficulty,
        subject: subject,
        source: 'Generated'
      };
    }
    
    // Add more template types here
    return null;
  } catch (error) {
    console.error('Error generating from template:', error);
    return null;
  }
}

function getOfficialQuestions(subject, difficulty, count) {
  const officialQuestions = OFFICIAL_PRACTICE_QUESTIONS[subject] || [];
  
  // Filter by difficulty if specified
  let filtered = officialQuestions;
  if (difficulty && difficulty !== 'mixed') {
    filtered = officialQuestions.filter(q => q.difficulty === difficulty);
  }

  // Shuffle and return requested count
  return shuffleArray(filtered).slice(0, count);
}

function generateStudyInsights(subject, weakAreas, userLevel) {
  const insights = {
    recommendation: "",
    targetAreas: [],
    studyPlan: [],
    scoreImprovement: {},
    timeEstimate: ""
  };

  // Base recommendations on subject and weak areas
  if (subject.includes('math')) {
    insights.recommendation = "Focus on algebra and geometry fundamentals to build a strong foundation.";
    insights.targetAreas = weakAreas.length > 0 ? weakAreas : ["Algebra", "Geometry", "Data Analysis"];
    insights.studyPlan = [
      "Complete 20 practice questions daily",
      "Review incorrect answers thoroughly", 
      "Focus on weak areas identified in diagnostic",
      "Take full practice tests weekly"
    ];
  } else if (subject.includes('reading')) {
    insights.recommendation = "Improve reading comprehension and vocabulary through targeted practice.";
    insights.targetAreas = ["Reading Comprehension", "Vocabulary in Context", "Grammar"];
    insights.studyPlan = [
      "Read challenging texts daily",
      "Practice passage-based questions",
      "Learn vocabulary in context",
      "Review grammar rules"
    ];
  }

  // Estimate score improvement potential
  insights.scoreImprovement = {
    current: userLevel === 'beginner' ? 400 : userLevel === 'intermediate' ? 500 : 600,
    target: userLevel === 'beginner' ? 500 : userLevel === 'intermediate' ? 600 : 700,
    timeframe: "3-6 months with consistent practice"
  };

  insights.timeEstimate = "2-3 hours per week for significant improvement";

  return insights;
}

function getScoringInfo(subject) {
  const scoringInfo = {
    'sat-math': { min: 200, max: 800, sections: ['No Calculator', 'Calculator'] },
    'sat-reading': { min: 200, max: 800, sections: ['Reading', 'Writing'] },
    'act-math': { min: 1, max: 36, sections: ['Mathematics'] },
    'act-english': { min: 1, max: 36, sections: ['English'] },
    'act-reading': { min: 1, max: 36, sections: ['Reading'] },
    'act-science': { min: 1, max: 36, sections: ['Science'] }
  };

  return scoringInfo[subject] || { min: 0, max: 100, sections: ['General'] };
}

function calculateAnswer(type, variables) {
  switch (type) {
    case 'linear-equations':
      return (variables.c - variables.b) / variables.a;
    case 'area-perimeter':
      return variables.l * variables.w; // assuming area
    case 'percentage':
      return (variables.percent / 100) * variables.number;
    default:
      return variables.a || 42; // fallback
  }
}

function generateOptions(correctAnswer, type) {
  const options = [correctAnswer];
  
  // Generate plausible wrong answers based on common mistakes
  while (options.length < 4) {
    let wrongAnswer;
    if (type === 'linear-equations') {
      // Common mistakes: forget to subtract, wrong operation
      wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
    } else {
      wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
    }
    
    if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
      options.push(wrongAnswer);
    }
  }

  return shuffleArray(options.map(String));
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getFallbackQuestions(subject, count) {
  const fallbacks = {
    'sat-math': [
      {
        prompt: "If 3x + 7 = 22, what is the value of x?",
        options: ["3", "5", "7", "15"],
        correctAnswer: 1,
        explanation: "Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.",
        category: "algebra",
        difficulty: "medium"
      },
      {
        prompt: "A circle has a radius of 5 units. What is its area?",
        options: ["10π", "25π", "50π", "100π"],
        correctAnswer: 1,
        explanation: "Area of a circle = πr². With r = 5, Area = π(5)² = 25π.",
        category: "geometry", 
        difficulty: "easy"
      }
    ],
    'act-math': [
      {
        prompt: "What is 15% of 80?",
        options: ["10", "12", "15", "18"],
        correctAnswer: 1,
        explanation: "15% of 80 = 0.15 × 80 = 12.",
        category: "arithmetic",
        difficulty: "easy"
      }
    ]
  };

  const baseQuestions = fallbacks[subject] || fallbacks['sat-math'];
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({...baseQuestions[i % baseQuestions.length]});
  }
  
  return questions;
}

module.exports = handler;
module.exports.default = handler;
