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

  // Add basic profile information
  if (userProfile) {
    if (userProfile.currentGrade) {
      systemPrompt += ` They are currently in ${userProfile.currentGrade} grade.`;
    }
    if (userProfile.currentSchool) {
      systemPrompt += ` They attend ${userProfile.currentSchool}.`;
    }
    if (userProfile.gpa) {
      systemPrompt += ` Their current GPA is ${userProfile.gpa}.`;
    }
    if (userProfile.graduationYear) {
      systemPrompt += ` They plan to graduate in ${userProfile.graduationYear}.`;
    }
  }

  // Add questionnaire-based personalization
  if (questionnaireData) {
    console.log('🎯 Processing questionnaire data with keys:', Object.keys(questionnaireData));
    
    // From questions.html questionnaire
    if (questionnaireData.applicationTimeline) {
      systemPrompt += ` They plan to apply for ${questionnaireData.applicationTimeline}.`;
    }

    if (questionnaireData.targetSchools && Array.isArray(questionnaireData.targetSchools)) {
      systemPrompt += ` They are interested in these schools: ${questionnaireData.targetSchools.join(', ')}.`;
    }

    if (questionnaireData.unweightedGPA) {
      systemPrompt += ` Their current unweighted GPA is ${questionnaireData.unweightedGPA}.`;
    }
    
    if (questionnaireData.weightedGPA) {
      systemPrompt += ` Their weighted GPA is ${questionnaireData.weightedGPA}.`;
    }

    if (questionnaireData.graduationMonth && questionnaireData.graduationYear) {
      systemPrompt += ` They will graduate in ${questionnaireData.graduationMonth} ${questionnaireData.graduationYear}.`;
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
      
      if (questionnaireData.essayStarted === 'yes') {
        systemPrompt += ` They have begun working on their essays.`;
      }
      
      if (questionnaireData.resumeStarted === 'yes') {
        systemPrompt += ` They have started building their resume.`;
      }
    } else if (questionnaireData.applicationStarted === 'no') {
      systemPrompt += ` They haven't started their college applications yet.`;
    }

    // From profile.html questionnaire data
    if (questionnaireData.academicInterests && Array.isArray(questionnaireData.academicInterests) && questionnaireData.academicInterests.length > 0) {
      systemPrompt += ` Their academic interests include: ${questionnaireData.academicInterests.join(', ')}.`;
    }

    if (questionnaireData.extracurriculars && Array.isArray(questionnaireData.extracurriculars) && questionnaireData.extracurriculars.length > 0) {
      systemPrompt += ` They participate in: ${questionnaireData.extracurriculars.join(', ')}.`;
    }

    if (questionnaireData.careerGoals && Array.isArray(questionnaireData.careerGoals) && questionnaireData.careerGoals.length > 0) {
      systemPrompt += ` Their career goals include: ${questionnaireData.careerGoals.join(', ')}.`;
    }

    if (questionnaireData.collegeWorries) {
      systemPrompt += ` They have shared these concerns about the college process: "${questionnaireData.collegeWorries}"`;
    }

    if (questionnaireData.budgetRange) {
      systemPrompt += ` Their college budget range is: ${questionnaireData.budgetRange}.`;
    }

    if (questionnaireData.locationPreference) {
      systemPrompt += ` Their location preference is: ${questionnaireData.locationPreference}.`;
    }

    if (questionnaireData.collegeTypes && Array.isArray(questionnaireData.collegeTypes) && questionnaireData.collegeTypes.length > 0) {
      systemPrompt += ` They are interested in these types of colleges: ${questionnaireData.collegeTypes.join(', ')}.`;
    }

    // Test scores from profile
    if (questionnaireData.satScore && questionnaireData.satScore !== 'Not taken/Don\'t know') {
      systemPrompt += ` Their SAT score range is: ${questionnaireData.satScore}.`;
    }

    if (questionnaireData.actScore && questionnaireData.actScore !== 'Not taken/Don\'t know') {
      systemPrompt += ` Their ACT score range is: ${questionnaireData.actScore}.`;
    }
  } else {
    console.log('⚠️ No questionnaire data available for personalization');
  }

  systemPrompt += ` 

IMPORTANT: Use ALL of this personal information to provide highly specific, relevant advice. When they ask about colleges, suggest ones that match their stated preferences and academic profile. If they need help with essays, relate to their intended major and interests. If they ask about scholarships, consider their academic performance and background. Always reference their specific situation and be encouraging.

If you don't have specific information about something they're asking about, ask relevant follow-up questions to better understand their needs.

Keep responses under 300 words but make them personal and actionable.`;

  console.log('📝 Generated personalized system prompt with comprehensive data');
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