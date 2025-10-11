// Essay Chat API for College Climb
// Handles Q&A about essays and writing advice

module.exports = {
  default: async function handler(req, res) {
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
    const { message, essay, userProfile, colleges, prompt, chatHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);

    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Build personalized system prompt for essay coaching
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

    // Add user context
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

    // Add essay context if provided
    if (essay) {
      systemPrompt += `\n\nCURRENT ESSAY DRAFT:\n"${essay.substring(0, 2000)}"`;
    }

    // Add college context
    if (colleges?.length > 0) {
      systemPrompt += `\n\nTARGET COLLEGES: ${colleges.join(', ')}. Consider these schools when giving advice.`;
    }

    // Add prompt context
    if (prompt) {
      systemPrompt += `\n\nESSAY PROMPT: "${prompt}"`;
    }

    systemPrompt += `\n\nRemember: Guide them to improve their own writing. Never write content for them. Be specific and helpful while keeping them in the driver's seat of their own story.`;

    // Build conversation history
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

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to get response. Please try again.',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await openaiResponse.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ 
        error: 'Invalid response from AI service'
      });
    }

    res.status(200).json({ 
      response: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error in essay chat API:', error);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
      details: error.message
    });
  }
}
};
