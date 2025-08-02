const rateLimitMap = new Map();

function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

function generatePersonalizedSystemPrompt(userProfile, questionnaireData) {
  let systemPrompt = `You are a personalized college admissions counselor for College Climb, specifically tailored to help this student. Be supportive, encouraging, and provide specific, actionable advice.`;

  // Add user name if available
  if (userProfile?.name) {
    systemPrompt += ` The student's name is ${userProfile.name}.`;
  }

  // Add questionnaire-based personalization
  if (questionnaireData) {
    // Academic information
    if (questionnaireData.currentGradeLevel) {
      systemPrompt += ` They are currently in ${questionnaireData.currentGradeLevel}.`;
    }
    
    if (questionnaireData.expectedGraduation) {
      systemPrompt += ` They plan to graduate in ${questionnaireData.expectedGraduation}.`;
    }

    if (questionnaireData.currentGPA) {
      systemPrompt += ` Their current GPA range is ${questionnaireData.currentGPA}.`;
    }

    // Test scores
    if (questionnaireData.satScore && questionnaireData.satScore !== '') {
      systemPrompt += ` Their SAT score range is ${questionnaireData.satScore}.`;
    }
    if (questionnaireData.actScore && questionnaireData.actScore !== '') {
      systemPrompt += ` Their ACT score range is ${questionnaireData.actScore}.`;
    }

    // Target schools from questions.html
    if (questionnaireData.targetSchools && Array.isArray(questionnaireData.targetSchools)) {
      systemPrompt += ` They are interested in these schools: ${questionnaireData.targetSchools.join(', ')}.`;
    }

    // Intended major from questions.html
    if (questionnaireData.intendedMajor) {
      systemPrompt += ` They want to major in ${questionnaireData.intendedMajor}.`;
    }

    // Academic interests from profile
    if (questionnaireData.academicInterests && questionnaireData.academicInterests.length > 0) {
      systemPrompt += ` Their academic interests include: ${questionnaireData.academicInterests.join(', ')}.`;
    }

    // College preferences
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

    // Career goals
    if (questionnaireData.careerGoals && questionnaireData.careerGoals.length > 0) {
      systemPrompt += ` Their career goals include: ${questionnaireData.careerGoals.join(', ')}.`;
    }

    // Extracurricular activities
    if (questionnaireData.extracurriculars && questionnaireData.extracurriculars.length > 0) {
      systemPrompt += ` They participate in: ${questionnaireData.extracurriculars.join(', ')}.`;
    }

    // Financial considerations
    if (questionnaireData.budgetRange) {
      systemPrompt += ` Their college budget range is ${questionnaireData.budgetRange}.`;
    }

    if (questionnaireData.financialAid && questionnaireData.financialAid.length > 0) {
      systemPrompt += ` Financial aid interests: ${questionnaireData.financialAid.join(', ')}.`;
    }

    // Special considerations
    if (questionnaireData.specialConsiderations && questionnaireData.specialConsiderations.length > 0) {
      systemPrompt += ` Important considerations: ${questionnaireData.specialConsiderations.join(', ')}.`;
    }

    // Application status from questions.html
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

    // Timeline from questions.html
    if (questionnaireData.applicationTimeline) {
      systemPrompt += ` They plan to apply for ${questionnaireData.applicationTimeline}.`;
    }

    // Concerns and worries
    if (questionnaireData.collegeWorries) {
      systemPrompt += ` They have shared these concerns about the college process: "${questionnaireData.collegeWorries}"`;
    }

    // Additional information
    if (questionnaireData.additionalInfo) {
      systemPrompt += ` Additional context: "${questionnaireData.additionalInfo}"`;
    }
  }

  systemPrompt += ` 

IMPORTANT: Use this personal information to provide highly specific, relevant advice. Reference their interests, goals, and preferences in your responses. If they ask about colleges, suggest ones that match their criteria. If they need help with essays, relate to their intended major and experiences. Always be encouraging and specific to their situation.

Keep responses under 250 words but make them personal and actionable.`;

  return systemPrompt;
}

export default async function handler(req, res) {
  console.log('=== PERSONALIZED CHAT API CALLED ===');
  
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
    const { message, userProfile, questionnaireData } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Generate personalized system prompt
    const systemPrompt = generatePersonalizedSystemPrompt(userProfile, questionnaireData);
    
    console.log('🎯 Using personalized system prompt for user:', userProfile?.name || 'Unknown');
    console.log('📋 Questionnaire data available:', !!questionnaireData);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          { role: 'user', content: sanitizedMessage }
        ],
        max_tokens: 400,
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
    console.error('Error in personalized chat API:', error);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
      details: error.message
    });
  }
}