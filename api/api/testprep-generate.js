// api/testprep-generate.js
// AI-Powered Test Prep Question Generator for College Climb

export default async function handler(req, res) {
  console.log('=== TEST PREP QUESTION GENERATOR API ===');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found');
    return res.status(500).json({ 
      error: 'Server configuration error - API key missing'
    });
  }

  try {
    const { 
      subject,        // 'sat-math', 'act-reading', etc.
      difficulty,     // 'easy', 'medium', 'hard'
      count,          // Number of questions (default: 10)
      weakAreas,      // Array of weak topic areas
      userProfile     // User's profile data for personalization
    } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    // Build personalized system prompt
    const systemPrompt = buildSystemPrompt(subject, difficulty, weakAreas, userProfile);
    
    console.log('🎯 Generating questions for:', subject, '- Difficulty:', difficulty);

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Use GPT-4 for highest quality questions
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: `Generate ${count || 10} ${difficulty || 'medium'} difficulty practice questions for ${subject}.`
          }
        ],
        max_tokens: 3000,
        temperature: 0.8  // Higher temperature for variety
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      
      if (openaiResponse.status === 429) {
        return res.status(500).json({ 
          error: 'High demand right now. Please try again in a moment.',
          fallback: getFallbackQuestions(subject, count || 10)
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to generate questions',
        fallback: getFallbackQuestions(subject, count || 10)
      });
    }

    const data = await openaiResponse.json();
    const generatedText = data.choices[0].message.content;

    // Parse questions from AI response
    const questions = parseQuestions(generatedText, subject);

    // If parsing failed or insufficient questions, supplement with fallbacks
    if (questions.length < (count || 10)) {
      const needed = (count || 10) - questions.length;
      const fallbacks = getFallbackQuestions(subject, needed);
      questions.push(...fallbacks);
    }

    res.status(200).json({ 
      questions: questions,
      subject: subject,
      difficulty: difficulty || 'medium',
      count: questions.length
    });

  } catch (error) {
    console.error('Error in question generator:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      fallback: getFallbackQuestions(req.body.subject, req.body.count || 10)
    });
  }
}

// Build specialized system prompt based on test type
function buildSystemPrompt(subject, difficulty, weakAreas, userProfile) {
  const subjectPrompts = {
    'sat-math': `You are an expert SAT Math tutor creating practice questions that mirror the style and difficulty of actual SAT Math questions. 

SAT Math covers:
- Heart of Algebra (linear equations, systems, inequalities)
- Problem Solving and Data Analysis (ratios, percentages, statistics)
- Passport to Advanced Math (quadratics, polynomials, exponentials)
- Additional Topics (geometry, trigonometry, complex numbers)

Create questions that:
1. Match real SAT question formats and difficulty
2. Test conceptual understanding, not just computation
3. Include word problems and real-world scenarios
4. Have one clearly correct answer
5. Provide detailed, educational explanations`,

    'sat-reading': `You are an expert SAT Reading and Writing tutor creating practice questions.

SAT Reading & Writing covers:
- Reading comprehension passages
- Grammar and usage
- Sentence structure and clarity
- Vocabulary in context
- Rhetorical skills

Create questions that:
1. Test reading comprehension and analytical skills
2. Include grammar, punctuation, and style questions
3. Mirror actual SAT question formats
4. Have clear, unambiguous correct answers
5. Provide explanations that teach the underlying concept`,

    'act-math': `You are an expert ACT Math tutor creating practice questions.

ACT Math covers:
- Pre-Algebra and Elementary Algebra
- Intermediate Algebra and Coordinate Geometry
- Plane Geometry and Trigonometry

Create questions that:
1. Match ACT's computational and problem-solving focus
2. Test a wide range of mathematical concepts
3. Progress from basic to advanced topics
4. Include clear, step-by-step solutions
5. Build confidence through practice`,

    'act-english': `You are an expert ACT English tutor creating practice questions.

ACT English covers:
- Grammar and usage
- Punctuation
- Sentence structure
- Strategy and organization
- Style and tone

Create questions that:
1. Test standard written English conventions
2. Focus on rhetorical skills and writing strategy
3. Use passage-based questions when appropriate
4. Have one best answer
5. Explain the reasoning behind correct answers`,

    'act-reading': `You are an expert ACT Reading tutor creating practice questions.

ACT Reading covers:
- Literary narrative
- Social science passages
- Humanities passages
- Natural science passages

Create questions that:
1. Test reading comprehension and inference
2. Include main idea, detail, and vocabulary questions
3. Mirror ACT's time-pressured format
4. Provide context for understanding
5. Explain both correct and incorrect answer choices`,

    'act-science': `You are an expert ACT Science tutor creating practice questions.

ACT Science covers:
- Data representation (graphs, tables, charts)
- Research summaries
- Conflicting viewpoints

Create questions that:
1. Test scientific reasoning and data interpretation
2. Focus on reading graphs, tables, and experimental designs
3. Don't require extensive science knowledge
4. Test analytical thinking
5. Explain how to analyze scientific information`,

    'psat-math': `You are an expert PSAT Math tutor creating practice questions similar to SAT but slightly easier.

Create questions that:
1. Build toward SAT-level difficulty
2. Focus on foundational concepts
3. Help students prepare for the SAT
4. Include clear explanations
5. Build mathematical confidence`
  };

  let prompt = subjectPrompts[subject] || subjectPrompts['sat-math'];

  // Add difficulty guidance
  const difficultyGuidance = {
    'easy': '\nDifficulty: Easy - Focus on fundamental concepts and straightforward problems.',
    'medium': '\nDifficulty: Medium - Include moderate complexity and multi-step problems.',
    'hard': '\nDifficulty: Hard - Create challenging problems requiring deeper analysis.'
  };
  prompt += difficultyGuidance[difficulty] || difficultyGuidance['medium'];

  // Add weak areas focus
  if (weakAreas && weakAreas.length > 0) {
    prompt += `\n\nIMPORTANT: Focus extra attention on these weak areas: ${weakAreas.join(', ')}`;
  }

  // Add personalization based on user profile
  if (userProfile) {
    if (userProfile.questionnaire?.intendedMajor) {
      prompt += `\n\nStudent context: Interested in ${userProfile.questionnaire.intendedMajor}. Include relevant real-world applications when possible.`;
    }
    if (userProfile.questionnaire?.currentGradeLevel) {
      prompt += ` Currently in ${userProfile.questionnaire.currentGradeLevel}.`;
    }
  }

  // Format instructions
  prompt += `

FORMAT REQUIREMENTS - FOLLOW EXACTLY:

For each question, use this EXACT format:

QUESTION 1:
[Clear, complete question text]

A) [Option A text]
B) [Option B text]  
C) [Option C text]
D) [Option D text]

CORRECT: [Letter of correct answer: A, B, C, or D]

EXPLANATION: [Detailed 2-3 sentence explanation of why the answer is correct and how to solve it. Include the reasoning process and key concepts.]

---

QUESTION 2:
[Next question...]

CRITICAL RULES:
- Each question must be complete and self-contained
- All four answer choices must be plausible but only ONE is correct
- Explanations must teach the concept, not just state the answer
- Use realistic numbers and scenarios
- Ensure questions test understanding, not tricks
- Double-check that the marked correct answer is actually correct`;

  return prompt;
}

// Parse AI-generated questions into structured format
function parseQuestions(text, subject) {
  const questions = [];
  
  // Split by question markers
  const questionBlocks = text.split(/QUESTION \d+:/i).filter(block => block.trim());

  questionBlocks.forEach((block, index) => {
    try {
      // Extract question text (everything before first option)
      const questionMatch = block.match(/^([\s\S]*?)(?=[A-D]\))/);
      if (!questionMatch) return;
      
      const questionText = questionMatch[1].trim();
      if (!questionText) return;

      // Extract options (A through D)
      const optionMatches = [];
      for (let letter of ['A', 'B', 'C', 'D']) {
        const regex = new RegExp(`${letter}\\)\\s*([^\\n]+(?:\\n(?![A-D]\\)|CORRECT:|EXPLANATION:)[^\\n]+)*)`, 'i');
        const match = block.match(regex);
        if (match) {
          optionMatches.push(match[1].trim());
        }
      }

      if (optionMatches.length !== 4) return;

      // Extract correct answer
      const correctMatch = block.match(/CORRECT:\s*([A-D])/i);
      if (!correctMatch) return;
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctIndex = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3

      // Extract explanation
      const explanationMatch = block.match(/EXPLANATION:\s*([\s\S]+?)(?=---|QUESTION|\s*$)/i);
      const explanation = explanationMatch 
        ? explanationMatch[1].trim() 
        : 'Review the concept and try working through the problem step by step.';

      questions.push({
        id: `${subject}-${Date.now()}-${index}`,
        prompt: questionText,
        options: optionMatches,
        correctAnswer: correctIndex,
        explanation: explanation,
        subject: subject,
        difficulty: 'medium',
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error parsing question block:', error);
    }
  });

  return questions;
}

// Fallback questions for when AI generation fails
function getFallbackQuestions(subject, count) {
  const fallbackBank = {
    'sat-math': [
      {
        prompt: 'If 3x + 7 = 22, what is the value of x?',
        options: ['3', '5', '7', '15'],
        correctAnswer: 1,
        explanation: 'Subtract 7 from both sides to get 3x = 15. Then divide both sides by 3 to get x = 5.',
        subject: 'sat-math'
      },
      {
        prompt: 'A rectangle has a length of 12 cm and a width of 5 cm. What is its perimeter?',
        options: ['17 cm', '34 cm', '60 cm', '24 cm'],
        correctAnswer: 1,
        explanation: 'The perimeter formula is P = 2(l + w). So P = 2(12 + 5) = 2(17) = 34 cm.',
        subject: 'sat-math'
      },
      {
        prompt: 'What is 25% of 80?',
        options: ['15', '20', '25', '40'],
        correctAnswer: 1,
        explanation: 'To find 25% of 80, multiply 80 × 0.25 = 20. Alternatively, 25% is 1/4, and 80 ÷ 4 = 20.',
        subject: 'sat-math'
      },
      {
        prompt: 'If y = 2x + 3 and x = 4, what is the value of y?',
        options: ['7', '9', '11', '13'],
        correctAnswer: 2,
        explanation: 'Substitute x = 4 into the equation: y = 2(4) + 3 = 8 + 3 = 11.',
        subject: 'sat-math'
      },
      {
        prompt: 'The sum of three consecutive integers is 24. What is the smallest of these integers?',
        options: ['6', '7', '8', '9'],
        correctAnswer: 1,
        explanation: 'Let the integers be n, n+1, and n+2. Then n + (n+1) + (n+2) = 24, so 3n + 3 = 24, which gives 3n = 21, so n = 7.',
        subject: 'sat-math'
      }
    ],
    'sat-reading': [
      {
        prompt: 'Which word best describes someone who is "meticulous"?',
        options: ['Careless', 'Careful', 'Creative', 'Chaotic'],
        correctAnswer: 1,
        explanation: 'Meticulous means showing great attention to detail; very careful and precise. The word comes from Latin "meticulosus" meaning fearful or careful.',
        subject: 'sat-reading'
      },
      {
        prompt: 'In the sentence "The committee will convene next Tuesday," what does "convene" mean?',
        options: ['Postpone', 'Cancel', 'Meet', 'Discuss'],
        correctAnswer: 2,
        explanation: 'Convene means to come together or assemble, especially for a meeting. The committee will meet/gather next Tuesday.',
        subject: 'sat-reading'
      },
      {
        prompt: 'Which sentence is grammatically correct?',
        options: [
          'Neither the students nor the teacher were present.',
          'Neither the students nor the teacher was present.',
          'Neither the student nor the teachers was present.',
          'Neither the student nor the teachers were present.'
        ],
        correctAnswer: 1,
        explanation: 'With "neither...nor," the verb agrees with the noun closest to it. Since "teacher" (singular) is closest to the verb, use "was" (singular).',
        subject: 'sat-reading'
      }
    ],
    'act-math': [
      {
        prompt: 'What is the area of a triangle with base 8 inches and height 6 inches?',
        options: ['14 square inches', '24 square inches', '48 square inches', '28 square inches'],
        correctAnswer: 1,
        explanation: 'The area of a triangle is A = (1/2) × base × height = (1/2) × 8 × 6 = 24 square inches.',
        subject: 'act-math'
      },
      {
        prompt: 'If a² + b² = 25 and a = 3, what is the positive value of b?',
        options: ['2', '4', '5', '16'],
        correctAnswer: 1,
        explanation: 'Substitute a = 3: 3² + b² = 25, so 9 + b² = 25. Therefore b² = 16, and b = 4 (taking the positive value).',
        subject: 'act-math'
      }
    ],
    'act-english': [
      {
        prompt: 'Which of the following is the correct use of a semicolon?',
        options: [
          'I love reading; especially mysteries.',
          'I love reading; I especially enjoy mysteries.',
          'I love; reading mysteries.',
          'I; love reading mysteries.'
        ],
        correctAnswer: 1,
        explanation: 'A semicolon connects two independent clauses (complete sentences). "I love reading" and "I especially enjoy mysteries" are both independent clauses.',
        subject: 'act-english'
      }
    ],
    'act-reading': [
      {
        prompt: 'When an author describes a character as "taciturn," they most likely mean the character is:',
        options: ['Talkative', 'Reserved in speech', 'Dishonest', 'Aggressive'],
        correctAnswer: 1,
        explanation: 'Taciturn means habitually silent or uncommunicative; reserved in speech. It describes someone who doesn\'t talk much.',
        subject: 'act-reading'
      }
    ],
    'act-science': [
      {
        prompt: 'According to the graph showing temperature vs. time, if the temperature increases from 20°C to 60°C over 10 minutes, what is the average rate of temperature change?',
        options: ['2°C per minute', '4°C per minute', '6°C per minute', '8°C per minute'],
        correctAnswer: 1,
        explanation: 'Average rate = (change in temperature) / (change in time) = (60 - 20) / 10 = 40 / 10 = 4°C per minute.',
        subject: 'act-science'
      }
    ]
  };

  const questionsForSubject = fallbackBank[subject] || fallbackBank['sat-math'];
  const result = [];

  // Repeat questions to reach desired count
  for (let i = 0; i < count; i++) {
    const baseQuestion = questionsForSubject[i % questionsForSubject.length];
    result.push({
      ...baseQuestion,
      id: `${subject}-fallback-${i}`,
      difficulty: 'medium',
      generatedAt: new Date().toISOString()
    });
  }

  return result;
}