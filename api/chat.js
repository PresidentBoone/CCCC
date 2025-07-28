const rateLimitMap = new Map();

function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Filter out requests outside the window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

export default async function handler(req, res) {
  // Enable CORS
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

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found in environment variables');
    return res.status(500).json({ 
      error: 'Server configuration error. Please contact support.',
      details: 'API key not configured'
    });
  }

  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    console.log('Making request to OpenAI with message:', sanitizedMessage);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert college admissions counselor and AI assistant for College Climb. You specialize in helping students with:
            - College application strategies
            - Essay writing and feedback
            - Scholarship searches
            - Resume building for college applications
            - Interview preparation
            - SAT/ACT test prep advice
            - College selection and matching
            - Financial aid guidance
            
            Always provide helpful, encouraging, and specific advice. Keep responses concise but informative (under 300 words). Be supportive and motivational while being realistic about college admissions.`
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
          error: 'API authentication failed. Please contact support.',
          details: 'Invalid API key'
        });
      } else if (openaiResponse.status === 429) {
        return res.status(500).json({ 
          error: 'Service temporarily unavailable due to high demand. Please try again in a moment.',
          details: 'Rate limit exceeded'
        });
      } else {
        return res.status(500).json({ 
          error: 'External service error. Please try again later.',
          details: `OpenAI API error: ${openaiResponse.status}`
        });
      }
    }

    const data = await openaiResponse.json();
    console.log('OpenAI response data received');
    
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