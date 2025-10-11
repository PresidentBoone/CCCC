// Essay Analysis API for College Climb
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
    const { essay, colleges, userProfile, prompt } = req.body;

    if (!essay || typeof essay !== 'string') {
      return res.status(400).json({ error: 'Valid essay text is required' });
    }

    const sanitizedEssay = essay.trim().substring(0, 10000); // Limit essay length

    if (sanitizedEssay.length === 0) {
      return res.status(400).json({ error: 'Essay cannot be empty' });
    }

    // Build personalized system prompt
    let systemPrompt = `You are an expert college admissions essay coach. Your job is to analyze the provided essay and provide detailed feedback.

ANALYSIS REQUIREMENTS:
1. Identify specific sections that need improvement (red - bad/cliche/harmful)
2. Identify sections that are okay but could be better (yellow - needs improvement)
3. Identify excellent sections (green - great, lean into this)
4. Provide specific feedback for each highlighted section
5. Give overall essay advice tailored to the target colleges

HIGHLIGHTING FORMAT:
Return a JSON object with this structure:
{
  "highlights": [
    {
      "text": "exact text to highlight",
      "type": "red|yellow|green",
      "feedback": "specific feedback for this section",
      "startIndex": number,
      "endIndex": number
    }
  ],
  "overallFeedback": "general essay advice",
  "collegeSpecificAdvice": "advice tailored to target colleges",
  "strengthsToLeanInto": ["strength 1", "strength 2"],
  "areasToImprove": ["area 1", "area 2"],
  "nextSteps": ["step 1", "step 2"]
}

STUDENT CONTEXT:`;

    // Add user profile information
    if (userProfile?.name) {
      systemPrompt += ` Student name: ${userProfile.name}.`;
    }

    if (userProfile?.academicInterests) {
      systemPrompt += ` Academic interests: ${userProfile.academicInterests.join(', ')}.`;
    }

    if (userProfile?.intendedMajor) {
      systemPrompt += ` Intended major: ${userProfile.intendedMajor}.`;
    }

    if (userProfile?.extracurriculars) {
      systemPrompt += ` Extracurriculars: ${userProfile.extracurriculars.join(', ')}.`;
    }

    if (userProfile?.careerGoals) {
      systemPrompt += ` Career goals: ${userProfile.careerGoals.join(', ')}.`;
    }

    // Add college context
    if (colleges && colleges.length > 0) {
      systemPrompt += ` TARGET COLLEGES: ${colleges.join(', ')}. Tailor advice to these specific schools.`;
    }

    // Add prompt context
    if (prompt) {
      systemPrompt += ` ESSAY PROMPT: "${prompt}"`;
    }

    systemPrompt += `

FEEDBACK GUIDELINES:
- Be specific and actionable, not generic
- Reference the student's interests and goals when relevant
- For red highlights: Point out clichés, weak language, unclear statements, or content that doesn't add value
- For yellow highlights: Identify areas that work but could be stronger, more specific, or better connected
- For green highlights: Celebrate unique insights, strong storytelling, clear personal voice, or compelling details
- Keep feedback encouraging but honest
- Suggest specific improvements, not just "make it better"
- Consider the target colleges in your advice
- Focus on helping the student tell THEIR unique story

Remember: Never write the essay for them - guide them to improve their own work.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this essay:\n\n${sanitizedEssay}` }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to analyze essay. Please try again.',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await openaiResponse.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ 
        error: 'Invalid response from AI service'
      });
    }

    try {
      // Try to parse the JSON response
      const analysisResult = JSON.parse(data.choices[0].message.content);
      res.status(200).json(analysisResult);
    } catch (parseError) {
      // If JSON parsing fails, return the raw response
      console.error('Failed to parse AI response as JSON:', parseError);
      res.status(200).json({
        highlights: [],
        overallFeedback: data.choices[0].message.content,
        collegeSpecificAdvice: "Please try analyzing your essay again for detailed highlighting.",
        strengthsToLeanInto: [],
        areasToImprove: [],
        nextSteps: ["Revise based on the feedback above", "Re-analyze for detailed highlighting"]
      });
    }

  } catch (error) {
    console.error('Error in essay analysis API:', error);
    res.status(500).json({ 
      error: 'I apologize, but I\'m having trouble analyzing your essay right now. Please try again in a moment.',
      details: error.message
    });
  }
  }
};
