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
    systemPrompt += ` The student's name is ${userProfile.name}. Always address them by their name.`;
  }

  // Add basic profile information from profile.html
  if (userProfile) {
    if (userProfile.currentGradeLevel) {
      systemPrompt += ` They are currently in ${userProfile.currentGradeLevel}.`;
    }
    if (userProfile.currentSchool) {
      systemPrompt += ` They attend ${userProfile.currentSchool}.`;
    }
    if (userProfile.gpa) {
      systemPrompt += ` Their current GPA is ${userProfile.gpa}.`;
    }
    if (userProfile.satScore && userProfile.satScore !== "Not taken/Don't know") {
      systemPrompt += ` Their SAT score range is ${userProfile.satScore}.`;
    }
    if (userProfile.actScore && userProfile.actScore !== "Not taken/Don't know") {
      systemPrompt += ` Their ACT score range is ${userProfile.actScore}.`;
    }
  }

  // Add questionnaire-based personalization from questions.html
  if (questionnaireData) {
    console.log('🎯 Processing questionnaire data with keys:', Object.keys(questionnaireData));
    
    if (questionnaireData.applicationTimeline) {
      systemPrompt += ` They plan to apply for ${questionnaireData.applicationTimeline}.`;
    }

    if (questionnaireData.targetSchools && Array.isArray(questionnaireData.targetSchools)) {
      systemPrompt += ` They are specifically interested in these schools: ${questionnaireData.targetSchools.join(', ')}.`;
    }

    if (questionnaireData.unweightedGPA) {
      systemPrompt += ` Their unweighted GPA is ${questionnaireData.unweightedGPA}.`;
    }
    
    if (questionnaireData.weightedGPA) {
      systemPrompt += ` Their weighted GPA is ${questionnaireData.weightedGPA}.`;
    }

    if (questionnaireData.intendedMajor) {
      systemPrompt += ` They want to major in ${questionnaireData.intendedMajor}.`;
    }

    if (questionnaireData.testScores) {
      systemPrompt += ` Their test scores are: ${questionnaireData.testScores}.`;
    }

    // Application progress
    if (questionnaireData.applicationStarted === 'yes') {
      systemPrompt += ` They have already started their college applications.`;
    } else if (questionnaireData.applicationStarted === 'no') {
      systemPrompt += ` They haven't started their college applications yet.`;
    }
  }

  // Add profile data from profile.html
  if (userProfile) {
    if (userProfile.academicInterests && Array.isArray(userProfile.academicInterests) && userProfile.academicInterests.length > 0) {
      systemPrompt += ` Their academic interests include: ${userProfile.academicInterests.join(', ')}.`;
    }

    if (userProfile.extracurriculars && Array.isArray(userProfile.extracurriculars) && userProfile.extracurriculars.length > 0) {
      systemPrompt += ` They participate in: ${userProfile.extracurriculars.join(', ')}.`;
    }

    if (userProfile.careerGoals && Array.isArray(userProfile.careerGoals) && userProfile.careerGoals.length > 0) {
      systemPrompt += ` Their career goals include: ${userProfile.careerGoals.join(', ')}.`;
    }

    if (userProfile.collegeTypes && Array.isArray(userProfile.collegeTypes) && userProfile.collegeTypes.length > 0) {
      systemPrompt += ` They are interested in these types of colleges: ${userProfile.collegeTypes.join(', ')}.`;
    }

    if (userProfile.budgetRange && userProfile.budgetRange !== "Prefer not to say") {
      systemPrompt += ` Their college budget range is ${userProfile.budgetRange}.`;
    }

    if (userProfile.locationPreference) {
      systemPrompt += ` Their location preference is: ${userProfile.locationPreference}.`;
    }
  }

  systemPrompt += ` 

CRITICAL: Only use information that was explicitly provided above. DO NOT make up or assume any details about schools, grades, scores, or other information not listed. If you don't have specific information, ask the student to provide it or direct them to complete their profile/questionnaire.

When providing advice:
- Reference their actual stated interests and goals
- Suggest colleges that match their stated preferences and academic profile
- If they haven't completed their profile/questionnaire, encourage them to do so for better personalized advice
- Always be encouraging and specific to their situation

Keep responses under 250 words but make them personal and actionable.`;

  console.log('📝 Generated personalized system prompt');
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
    const { message, userProfile, questionnaireData, chatHistory } = req.body;
    
    console.log('📥 Received request with:', {
      hasMessage: !!message,
      hasUserProfile: !!userProfile,
      hasQuestionnaireData: !!questionnaireData,
      hasChatHistory: chatHistory?.length > 0,
      userProfileKeys: userProfile ? Object.keys(userProfile) : [],
      questionnaireKeys: questionnaireData ? Object.keys(questionnaireData) : []
    });
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Generate personalized system prompt with all available data
    const systemPrompt = generatePersonalizedSystemPrompt(userProfile, questionnaireData);
    
    console.log('🎯 Using personalized system prompt for user:', userProfile?.name || 'Unknown');
    console.log('📋 Questionnaire data keys available:', questionnaireData ? Object.keys(questionnaireData) : 'None');

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
        max_tokens: 500,
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

    console.log('✅ Successfully generated personalized response');
    
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