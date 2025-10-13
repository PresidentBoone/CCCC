// Essay Analysis API for College Climb

export default async function handler(req, res) {
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

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not wrap it in markdown code blocks.

ANALYSIS REQUIREMENTS:
1. Identify specific sections that need improvement (red - bad/cliche/harmful)
2. Identify sections that are okay but could be better (yellow - needs improvement)
3. Identify excellent sections (green - great, lean into this)
4. Provide DETAILED feedback for each highlighted section explaining WHY it's highlighted and HOW to improve
5. Categorize issues (cliché, weak verb, vague, show-don't-tell, etc.)
6. Provide specific examples and alternatives
7. Give overall essay advice tailored to the target colleges

REQUIRED JSON FORMAT (respond with ONLY this, nothing else):
{
  "highlights": [
    {
      "text": "exact text to highlight from the essay",
      "type": "red",
      "category": "cliche" or "weak_verb" or "vague" or "show_dont_tell" or "grammar" or "unclear" or "strength",
      "why": "detailed explanation of WHY this is highlighted - be specific about the problem",
      "how": "detailed explanation of HOW to improve - give actionable steps and examples",
      "suggestion": "specific alternative phrasing or approach (if applicable)",
      "startIndex": 0,
      "endIndex": 10
    }
  ],
  "overallFeedback": "comprehensive general essay advice",
  "collegeSpecificAdvice": "advice tailored to target colleges",
  "strengthsToLeanInto": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "nextSteps": ["actionable step 1", "actionable step 2", "actionable step 3"]
}

IMPORTANT RULES:
- For highlights: find exact text in the essay, calculate accurate startIndex and endIndex
- Use type: "red" for weak/cliche content, "yellow" for okay content, "green" for excellent content
- All arrays must have at least 1 item
- All strings must be non-empty
- Return ONLY the JSON object, no explanatory text

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
- Be HIGHLY SPECIFIC and actionable, not generic
- Reference the student's interests and goals when relevant
- For red highlights: 
  * CATEGORY: Identify if it's a cliché, weak verb, vague statement, unclear idea, etc.
  * WHY: Explain exactly what's wrong and why it weakens the essay
  * HOW: Give 2-3 specific ways to improve it
  * SUGGESTION: Provide a concrete alternative example
- For yellow highlights:
  * CATEGORY: Identify the type of improvement needed
  * WHY: Explain what's missing or could be stronger
  * HOW: Suggest specific ways to elevate this section
  * SUGGESTION: Show what a better version might look like
- For green highlights:
  * CATEGORY: "strength"
  * WHY: Explain what makes this excellent (unique voice, specific details, strong storytelling, etc.)
  * HOW: Encourage expanding or connecting this strength to other parts
  * SUGGESTION: Ways to leverage this strength elsewhere
- Keep feedback encouraging but honest
- Suggest specific improvements with examples, not just "make it better"
- Consider the target colleges in your advice
- Focus on helping the student tell THEIR unique story
- ALWAYS provide category, why, how, and suggestion for each highlight

HIGHLIGHT SELECTION CRITERIA:
- Choose MEANINGFUL sections, not random phrases
- Prioritize content issues over minor grammar (unless grammar affects clarity)
- Focus on: clichés, vague language, weak storytelling, missed opportunities, and exceptional strengths
- Each highlight should have a CLEAR reason for being selected
- Aim for 5-10 highlights per essay (more for longer essays)
- Balance red/yellow/green to give both critique and encouragement

Remember: Never write the essay for them - guide them to improve their own work with specific, actionable advice.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this essay and respond with ONLY a valid JSON object:\n\n${sanitizedEssay}` }
        ],
        max_tokens: 2500,
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
      let responseContent = data.choices[0].message.content.trim();
      
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        responseContent = jsonMatch[1].trim();
      } else {
        // Try to extract JSON object from text
        const objectMatch = responseContent.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          responseContent = objectMatch[0];
        }
      }
      
      const analysisResult = JSON.parse(responseContent);
      
      // Validate the structure
      if (!analysisResult.highlights || !Array.isArray(analysisResult.highlights)) {
        analysisResult.highlights = [];
      }
      if (!analysisResult.overallFeedback) {
        analysisResult.overallFeedback = "Analysis complete. See detailed feedback below.";
      }
      if (!analysisResult.collegeSpecificAdvice) {
        analysisResult.collegeSpecificAdvice = colleges && colleges.length > 0 
          ? `Consider how your essay aligns with the values of ${colleges.join(', ')}.`
          : "Add target colleges for specific advice.";
      }
      if (!analysisResult.strengthsToLeanInto || !Array.isArray(analysisResult.strengthsToLeanInto)) {
        analysisResult.strengthsToLeanInto = [];
      }
      if (!analysisResult.areasToImprove || !Array.isArray(analysisResult.areasToImprove)) {
        analysisResult.areasToImprove = [];
      }
      if (!analysisResult.nextSteps || !Array.isArray(analysisResult.nextSteps)) {
        analysisResult.nextSteps = ["Review the feedback", "Revise your essay", "Re-analyze for improvements"];
      }
      
      res.status(200).json(analysisResult);
    } catch (parseError) {
      // If JSON parsing fails, return the raw response in a structured format
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', data.choices[0].message.content);
      
      // Try to extract useful information from the raw text
      const rawContent = data.choices[0].message.content;
      
      res.status(200).json({
        highlights: [],
        overallFeedback: rawContent,
        collegeSpecificAdvice: colleges && colleges.length > 0
          ? `This analysis is for ${colleges.join(', ')}. Please re-analyze for detailed highlighting.`
          : "Add target colleges for specific advice.",
        strengthsToLeanInto: ["Review the feedback above for your essay's strengths"],
        areasToImprove: ["Review the feedback above for areas to improve"],
        nextSteps: ["Review the feedback carefully", "Make revisions based on suggestions", "Re-analyze for detailed highlighting"]
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
