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

export default async function handler(req, res) {
  console.log('=== CHAT API CALLED ===');
  
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

    let systemPrompt = `You are a college admissions counselor for College Climb. Help students with college applications, essays, scholarships, and admissions advice. Keep responses under 200 words.`;

    if (userProfile && userProfile.name) {
      systemPrompt += ` The student's name is ${userProfile.name}.`;
    }

    if (questionnaireData) {
      systemPrompt += ` Here is some information about the student from their questionnaire: ${JSON.stringify(questionnaireData)}. Use this information to personalize your advice and guidance.`;
    }

    console.log('Making request to OpenAI...');

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
        max_tokens: 300,
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
    console.error('Error in chat API:', error);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
      details: error.message
    });
  }
}