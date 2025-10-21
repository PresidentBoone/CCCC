// CONSOLIDATED Chat API for College Climb
// Handles both general college counseling chat AND essay-specific chat
// CONSOLIDATES: chat.js + essay-chat.js

// Rate limiting
const rateLimitMap = new Map();

function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000) };
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return { allowed: true };
}

// Search College Scorecard API for college data
async function searchCollegeData(collegeName) {
  try {
    const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
    if (!apiKey) {
      console.warn('College Scorecard API key not found');
      return null;
    }

    const response = await fetch(
      `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${encodeURIComponent(collegeName)}&api_key=${apiKey}&fields=school.name,school.city,school.state,latest.admissions.admission_rate.overall,latest.student.size,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.academics.program_percentage,school.school_url,latest.admissions.sat_scores.average.overall,latest.admissions.act_scores.midpoint.cumulative&per_page=5`
    );

    if (!response.ok) {
      console.error('College Scorecard API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results.map(college => ({
        name: college['school.name'],
        city: college['school.city'],
        state: college['school.state'],
        admissionRate: college['latest.admissions.admission_rate.overall'],
        studentSize: college['latest.student.size'],
        inStateTuition: college['latest.cost.tuition.in_state'],
        outOfStateTuition: college['latest.cost.tuition.out_of_state'],
        website: college['school.school_url'],
        avgSAT: college['latest.admissions.sat_scores.average.overall'],
        avgACT: college['latest.admissions.act_scores.midpoint.cumulative']
      }));
    }

    return null;
  } catch (error) {
    console.error('Error fetching college data:', error);
    return null;
  }
}

// Detect if message is asking about specific colleges
function detectCollegeQuery(message) {
  const collegeKeywords = ['university', 'college', 'school', 'harvard', 'stanford', 'mit', 'yale', 'princeton', 'columbia', 'cornell', 'brown', 'dartmouth', 'upenn', 'berkeley', 'ucla', 'usc', 'nyu', 'duke', 'northwestern', 'vanderbilt'];
  const questionKeywords = ['admission rate', 'acceptance rate', 'tuition', 'cost', 'sat score', 'act score', 'how many students', 'location', 'where is', 'tell me about'];

  const lowerMessage = message.toLowerCase();
  const hasCollegeKeyword = collegeKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasQuestionKeyword = questionKeywords.some(keyword => lowerMessage.includes(keyword));

  return hasCollegeKeyword && hasQuestionKeyword;
}

// Extract college name from message
function extractCollegeName(message) {
  const patterns = [
    /about\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+University|\s+College)?)/,
    /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+University|\s+College)?)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+University)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+College)/
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Generate system prompt for GENERAL counseling
function generateGeneralCounselingPrompt(userProfile, questionnaireData) {
  let systemPrompt = `You are a personalized college admissions counselor for College Climb, specifically tailored to help this student. Be supportive, encouraging, and provide specific, actionable advice.`;

  if (userProfile?.name) {
    systemPrompt += ` The student's name is ${userProfile.name}.`;
  }

  if (questionnaireData) {
    if (questionnaireData.currentGradeLevel) {
      systemPrompt += ` They are currently in ${questionnaireData.currentGradeLevel}.`;
    }
    
    if (questionnaireData.expectedGraduation) {
      systemPrompt += ` They plan to graduate in ${questionnaireData.expectedGraduation}.`;
    }

    if (questionnaireData.currentGPA) {
      systemPrompt += ` Their current GPA range is ${questionnaireData.currentGPA}.`;
    }

    if (questionnaireData.satScore && questionnaireData.satScore !== '') {
      systemPrompt += ` Their SAT score range is ${questionnaireData.satScore}.`;
    }
    if (questionnaireData.actScore && questionnaireData.actScore !== '') {
      systemPrompt += ` Their ACT score range is ${questionnaireData.actScore}.`;
    }

    if (questionnaireData.targetSchools && Array.isArray(questionnaireData.targetSchools)) {
      systemPrompt += ` They are interested in these schools: ${questionnaireData.targetSchools.join(', ')}.`;
    }

    if (questionnaireData.intendedMajor) {
      systemPrompt += ` They want to major in ${questionnaireData.intendedMajor}.`;
    }

    if (questionnaireData.academicInterests && questionnaireData.academicInterests.length > 0) {
      systemPrompt += ` Their academic interests include: ${questionnaireData.academicInterests.join(', ')}.`;
    }

    if (questionnaireData.collegeTypes && questionnaireData.collegeTypes.length > 0) {
      systemPrompt += ` They prefer these types of colleges: ${questionnaireData.collegeTypes.join(', ')}.`;
    }

    if (questionnaireData.collegeSize) {
      systemPrompt += ` They prefer ${questionnaireData.collegeSize} sized colleges.`;
    }

    if (questionnaireData.locationPreference) {
      systemPrompt += ` Their location preference is: ${questionnaireData.locationPreference}.`;
    }

    if (questionnaireData.campusSetting) {
      systemPrompt += ` They prefer a ${questionnaireData.campusSetting} campus setting.`;
    }

    if (questionnaireData.careerGoals && questionnaireData.careerGoals.length > 0) {
      systemPrompt += ` Their career goals include: ${questionnaireData.careerGoals.join(', ')}.`;
    }

    if (questionnaireData.extracurriculars && questionnaireData.extracurriculars.length > 0) {
      systemPrompt += ` They participate in: ${questionnaireData.extracurriculars.join(', ')}.`;
    }

    if (questionnaireData.budgetRange) {
      systemPrompt += ` Their college budget range is ${questionnaireData.budgetRange}.`;
    }

    if (questionnaireData.financialAid && questionnaireData.financialAid.length > 0) {
      systemPrompt += ` Financial aid interests: ${questionnaireData.financialAid.join(', ')}.`;
    }

    if (questionnaireData.specialConsiderations && questionnaireData.specialConsiderations.length > 0) {
      systemPrompt += ` Important considerations: ${questionnaireData.specialConsiderations.join(', ')}.`;
    }

    if (questionnaireData.applicationStarted === 'yes') {
      systemPrompt += ` They have already started their college applications.`;
    } else if (questionnaireData.applicationStarted === 'no') {
      systemPrompt += ` They haven't started their college applications yet.`;
    }

    if (questionnaireData.essayStarted === 'yes') {
      systemPrompt += ` They have begun working on their essays.`;
    }

    if (questionnaireData.resumeStarted === 'yes') {
      systemPrompt += ` They have started building their resume.`;
    }

    if (questionnaireData.applicationTimeline) {
      systemPrompt += ` They plan to apply for ${questionnaireData.applicationTimeline}.`;
    }

    if (questionnaireData.collegeWorries) {
      systemPrompt += ` They have shared these concerns about the college process: "${questionnaireData.collegeWorries}"`;
    }

    if (questionnaireData.additionalInfo) {
      systemPrompt += ` Additional context: "${questionnaireData.additionalInfo}"`;
    }
  }

  systemPrompt += ` 

IMPORTANT: Use this personal information to provide highly specific, relevant advice. Reference their interests, goals, and preferences in your responses. If they ask about colleges, suggest ones that match their criteria. If they need help with essays, relate to their intended major and experiences. Always be encouraging and specific to their situation.

Keep responses under 250 words but make them personal and actionable.`;

  return systemPrompt;
}

// Generate system prompt for ESSAY coaching
function generateEssayChatPrompt(userProfile, essay, colleges, prompt) {
  let systemPrompt = `You are an expert college admissions essay coach. You help students improve their essays through personalized guidance, but you NEVER write essays for them.

YOUR ROLE:
- Answer questions about essay writing techniques
- Provide specific feedback on essay content when provided
- Help students brainstorm ideas and approaches
- Guide students to find their authentic voice
- Offer college-specific advice when relevant
- Encourage students to tell their unique story

GUIDELINES:
- Be encouraging but honest
- Give specific, actionable advice
- Ask clarifying questions to understand their goals
- Reference their personal background when relevant
- Never write essay content for them - guide them to write it themselves
- Focus on helping them develop their own ideas and voice
- Provide examples of techniques, not example content`;

  if (userProfile) {
    systemPrompt += `\n\nSTUDENT CONTEXT:`;
    
    if (userProfile.name) {
      systemPrompt += ` Student: ${userProfile.name}.`;
    }
    
    if (userProfile.academicInterests?.length > 0) {
      systemPrompt += ` Academic interests: ${userProfile.academicInterests.join(', ')}.`;
    }
    
    if (userProfile.intendedMajor) {
      systemPrompt += ` Intended major: ${userProfile.intendedMajor}.`;
    }
    
    if (userProfile.extracurriculars?.length > 0) {
      systemPrompt += ` Extracurriculars: ${userProfile.extracurriculars.join(', ')}.`;
    }
    
    if (userProfile.careerGoals?.length > 0) {
      systemPrompt += ` Career goals: ${userProfile.careerGoals.join(', ')}.`;
    }

    if (userProfile.collegeTypes?.length > 0) {
      systemPrompt += ` College preferences: ${userProfile.collegeTypes.join(', ')}.`;
    }
  }

  if (essay) {
    systemPrompt += `\n\nCURRENT ESSAY DRAFT:\n"${essay.substring(0, 2000)}"`;
  }

  if (colleges?.length > 0) {
    systemPrompt += `\n\nTARGET COLLEGES: ${colleges.join(', ')}. Consider these schools when giving advice.`;
  }

  if (prompt) {
    systemPrompt += `\n\nESSAY PROMPT: "${prompt}"`;
  }

  systemPrompt += `\n\nRemember: Guide them to improve their own writing. Never write content for them. Be specific and helpful while keeping them in the driver's seat of their own story.`;

  return systemPrompt;
}

// ============================================
// MAIN HANDLER - Routes based on chat type
// ============================================

module.exports = async function handler(req, res) {
  console.log('=== CONSOLIDATED CHAT API CALLED ===');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(identifier, 10, 60000);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests. Please wait a moment.',
      retryAfter: rateCheck.retryAfter 
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found');
    return res.status(500).json({ 
      error: 'Server configuration error - API key missing'
    });
  }

  try {
    const {
      message,
      messages: rawMessages, // For AI Writing Tools (direct OpenAI format)
      userProfile,
      questionnaireData,
      // Essay-specific fields
      essay,
      colleges,
      prompt,
      chatHistory,
      // Chat type indicator
      chatType
    } = req.body;

    // Handle two formats:
    // 1. Standard format: { message, userProfile, ... } - for regular chat
    // 2. Raw OpenAI format: { messages: [...] } - for AI Writing Tools

    if (rawMessages && Array.isArray(rawMessages)) {
      // AI Writing Tools format - use GPT-4o for advanced features
      console.log('🎨 Using AI WRITING TOOLS mode (GPT-4o) - raw messages format');

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: rawMessages,
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorText);

        if (openaiResponse.status === 401) {
          return res.status(500).json({
            error: 'API authentication failed. Please check your OpenAI API key.',
            details: 'Invalid API key'
          });
        } else if (openaiResponse.status === 429) {
          return res.status(500).json({
            error: 'I\'m experiencing high demand right now. Please wait a moment and try again.',
            details: 'Rate limit exceeded - please try again in 1 minute'
          });
        } else if (openaiResponse.status === 403) {
          return res.status(500).json({
            error: 'API access denied. Please check your OpenAI account billing.',
            details: 'Account may need billing setup'
          });
        } else {
          return res.status(500).json({
            error: 'External service temporarily unavailable.',
            details: `OpenAI API error: ${openaiResponse.status}`
          });
        }
      }

      const data = await openaiResponse.json();

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid OpenAI response format:', data);
        throw new Error('Invalid response format from OpenAI');
      }

      return res.status(200).json({
        response: data.choices[0].message.content
      });
    }

    // Standard format validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);

    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Determine if this is essay chat or general chat
    const isEssayChat = chatType === 'essay' || essay || prompt;

    let systemPrompt;
    let model = 'gpt-3.5-turbo'; // Default model
    let maxTokens = 500;

    if (isEssayChat) {
      // ESSAY CHAT MODE - Use GPT-4o-mini for cost-effective essay coaching
      console.log('📝 Using ESSAY CHAT mode (GPT-4o-mini)');
      systemPrompt = generateEssayChatPrompt(userProfile, essay, colleges, prompt);
      model = 'gpt-4o-mini';
      maxTokens = 800;
    } else {
      // GENERAL COUNSELING MODE - Use GPT-3.5 for efficiency
      console.log('💬 Using GENERAL COUNSELING mode (GPT-3.5)');
      systemPrompt = generateGeneralCounselingPrompt(userProfile, questionnaireData);

      // Check if message is asking about specific colleges
      let collegeData = null;
      if (detectCollegeQuery(sanitizedMessage)) {
        const collegeName = extractCollegeName(sanitizedMessage);
        if (collegeName) {
          console.log('🏫 Detected college query for:', collegeName);
          collegeData = await searchCollegeData(collegeName);
        }
      }

      // Add college data to system prompt if available
      if (collegeData && collegeData.length > 0) {
        systemPrompt += `\n\nREAL-TIME COLLEGE DATA (use this to answer the user's question):\n`;
        collegeData.forEach((college, index) => {
          systemPrompt += `\n${index + 1}. ${college.name}`;
          if (college.city && college.state) systemPrompt += ` - ${college.city}, ${college.state}`;
          if (college.admissionRate) systemPrompt += `\n   - Admission Rate: ${(college.admissionRate * 100).toFixed(1)}%`;
          if (college.studentSize) systemPrompt += `\n   - Student Size: ${college.studentSize.toLocaleString()} students`;
          if (college.inStateTuition) systemPrompt += `\n   - In-State Tuition: $${college.inStateTuition.toLocaleString()}/year`;
          if (college.outOfStateTuition) systemPrompt += `\n   - Out-of-State Tuition: $${college.outOfStateTuition.toLocaleString()}/year`;
          if (college.avgSAT) systemPrompt += `\n   - Average SAT: ${college.avgSAT}`;
          if (college.avgACT) systemPrompt += `\n   - Average ACT: ${college.avgACT}`;
          if (college.website) systemPrompt += `\n   - Website: ${college.website}`;
        });
        systemPrompt += `\n\nUse this real data to provide accurate, specific information about these colleges.`;
      }
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add chat history if provided (last 10 messages for context)
    if (chatHistory && Array.isArray(chatHistory)) {
      const recentHistory = chatHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // Add current message
    messages.push({ role: 'user', content: sanitizedMessage });

    console.log(`🤖 Calling OpenAI with model: ${model}`);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    console.log('OpenAI response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      
      if (openaiResponse.status === 401) {
        return res.status(500).json({ 
          error: 'API authentication failed. Please check your OpenAI API key.',
          details: 'Invalid API key'
        });
      } else if (openaiResponse.status === 429) {
        return res.status(500).json({ 
          error: 'I\'m experiencing high demand right now. Please wait a moment and try again.',
          details: 'Rate limit exceeded - please try again in 1 minute'
        });
      } else if (openaiResponse.status === 403) {
        return res.status(500).json({ 
          error: 'API access denied. Please check your OpenAI account billing.',
          details: 'Account may need billing setup'
        });
      } else {
        return res.status(500).json({ 
          error: 'External service temporarily unavailable.',
          details: `OpenAI API error: ${openaiResponse.status}`
        });
      }
    }

    const data = await openaiResponse.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    res.status(200).json({ 
      response: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error in consolidated chat API:', error);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
      details: error.message
    });
  }
}
