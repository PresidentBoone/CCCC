// Essay Analysis API for College Climb

/**
 * Comprehensive College Knowledge Base
 * Provides institution-specific guidance for essay writing
 */
function getCollegeSpecificGuidance(colleges) {
  const collegeKnowledgeBase = {
    // IVY LEAGUE
    'harvard': {
      values: ['intellectual curiosity', 'leadership', 'impact', 'academic excellence', 'community contribution'],
      culture: 'values students who are deeply curious, take initiative, and think about how they can contribute to the world',
      essayTips: 'Show intellectual vitality - discuss ideas that excite you, questions you want to explore. Demonstrate leadership through meaningful impact, not just titles. Be authentic about your "why" - Harvard wants to understand your motivations.',
      acceptance: '3-4%',
      commonThemes: 'Students who have made significant intellectual or community contributions, shown exceptional curiosity, or overcome major obstacles while maintaining academic excellence.'
    },
    'yale': {
      values: ['community', 'diverse perspectives', 'collaboration', 'intellectual exploration', 'social responsibility'],
      culture: 'emphasizes residential college system and community building; values students who will contribute to campus dialogue',
      essayTips: 'Emphasize how you engage with different perspectives, contribute to community, and think about your role in society. Yale loves students who are both intellectually curious AND community-minded.',
      acceptance: '4-5%',
      commonThemes: 'Students who balance academic achievement with genuine care for others, show curiosity across disciplines, and demonstrate how they\'ll contribute to Yale\'s tight-knit community.'
    },
    'princeton': {
      values: ['service', 'rigorous scholarship', 'diverse voices', 'collaboration', 'integrity'],
      culture: 'strong emphasis on undergraduate teaching and the honor code; values academic rigor and ethical leadership',
      essayTips: 'Highlight intellectual depth, commitment to service (their motto is "In the Nation\'s Service"), and collaborative spirit. Show how you\'ve pursued knowledge rigorously and ethically.',
      acceptance: '4-6%',
      commonThemes: 'Students with deep academic interests, commitment to using education for service, and strong ethical foundation.'
    },
    'columbia': {
      values: ['diversity', 'urban engagement', 'global citizenship', 'intellectual rigor', 'Core Curriculum enthusiasm'],
      culture: 'NYC location central to identity; Core Curriculum shapes educational experience; emphasis on engaging with the city',
      essayTips: 'Show excitement about NYC and what you\'ll do there, enthusiasm for the Core Curriculum (reading great books, engaging with ideas), and how you\'ll engage with Columbia\'s diverse community.',
      acceptance: '4-5%',
      commonThemes: 'Students who thrive in urban environments, are intellectually curious about diverse subjects, and want to engage with global issues.'
    },
    'penn': {
      values: ['practical application', 'interdisciplinary study', 'entrepreneurship', 'social impact', 'collaboration'],
      culture: 'Ben Franklin\'s practical philosophy; strong pre-professional programs; "One University" policy encouraging cross-school collaboration',
      essayTips: 'Emphasize how you\'ll apply knowledge practically, interest in interdisciplinary work, entrepreneurial mindset. Penn values impact and innovation.',
      acceptance: '5-7%',
      commonThemes: 'Students who want to combine academic excellence with real-world application, show entrepreneurial spirit, and plan to make tangible impact.'
    },
    'dartmouth': {
      values: ['close-knit community', 'outdoor engagement', 'undergraduate focus', 'collaboration', 'tradition'],
      culture: 'small, tight-knit community in rural setting; strong emphasis on undergraduate teaching; outdoor culture',
      essayTips: 'Show enthusiasm for close community, collaborative learning, and if genuine, outdoor activities. Dartmouth wants students who will actively participate in campus life.',
      acceptance: '6-8%',
      commonThemes: 'Students who value strong community, want close relationships with professors, and will actively engage in campus traditions.'
    },
    'cornell': {
      values: ['academic freedom', 'practical learning', 'diversity', 'entrepreneurship', 'land-grant mission'],
      culture: 'largest Ivy with diverse schools; "any person, any study" philosophy; emphasis on both theory and practice',
      essayTips: 'Highlight your specific academic interests (Cornell is very school-specific), show how you\'ll take advantage of unique resources, and demonstrate intellectual curiosity across disciplines.',
      acceptance: '7-10%',
      commonThemes: 'Students with clear academic goals, interest in hands-on learning, and appreciation for diverse educational opportunities.'
    },
    'brown': {
      values: ['open curriculum', 'intellectual freedom', 'student agency', 'interdisciplinary thinking', 'social justice'],
      culture: 'open curriculum allows students to design their education; progressive, student-driven culture',
      essayTips: 'Show you\'re self-directed, know what you want to study and why, and will thrive with academic freedom. Brown values students who take ownership of their education.',
      acceptance: '5-7%',
      commonThemes: 'Self-motivated students with clear intellectual passions who will design meaningful, interdisciplinary educational paths.'
    },

    // TOP UNIVERSITIES
    'stanford': {
      values: ['innovation', 'entrepreneurship', 'intellectual vitality', 'impact', 'interdisciplinary thinking'],
      culture: 'Silicon Valley mindset; emphasis on creating and building; collaborative and optimistic culture',
      essayTips: 'Show intellectual vitality (their specific value), entrepreneurial mindset, and how you\'ve created or built things. Stanford loves makers, innovators, and students who think big about impact.',
      acceptance: '3-4%',
      commonThemes: 'Innovators, entrepreneurs, and students with demonstrated intellectual vitality who want to use Stanford\'s resources to create meaningful impact.'
    },
    'mit': {
      values: ['hands-on learning', 'collaboration', 'problem-solving', 'innovation', 'making things'],
      culture: 'maker culture, "IHTFP" (I Have Truly Found Paradise), collaborative problem-solving, meritocracy of ideas',
      essayTips: 'Show you love building, making, and solving problems. Emphasize collaborative work, technical projects you\'ve created, and genuine passion for STEM. MIT wants doers.',
      acceptance: '4-5%',
      commonThemes: 'Makers, builders, and problem-solvers who have created projects, shown technical excellence, and love collaborative hands-on learning.'
    },
    'caltech': {
      values: ['scientific rigor', 'collaboration', 'passion for STEM', 'research', 'honor code'],
      culture: 'small, intense STEM-focused environment; house system; everyone passionate about science/engineering',
      essayTips: 'Show deep, genuine passion for STEM - not just good at it, but love it. Discuss research, projects, or scientific questions that fascinate you. Caltech is small and intense.',
      acceptance: '3-4%',
      commonThemes: 'Students with exceptional STEM talent who are genuinely passionate (even obsessed) with science/math/engineering and thrive in collaborative, rigorous environments.'
    },
    'duke': {
      values: ['knowledge in service to society', 'interdisciplinary thinking', 'community engagement', 'research', 'global perspective'],
      culture: 'strong school spirit, emphasis on service and engagement, collaborative atmosphere',
      essayTips: 'Show how you\'ll use education for service, engagement with community, and intellectual curiosity. Duke values students who balance achievement with genuine care for others.',
      acceptance: '6-8%',
      commonThemes: 'Well-rounded students who are academically strong, committed to service, and want to use their education to make a difference.'
    },
    'northwestern': {
      values: ['interdisciplinary collaboration', 'professional preparation', 'innovation', 'global engagement', 'practical learning'],
      culture: 'strong pre-professional programs, emphasis on experiential learning, collaborative culture',
      essayTips: 'Highlight interdisciplinary interests, career goals, and how you\'ll take advantage of Northwestern\'s unique programs. Show you\'re both intellectually curious and professionally focused.',
      acceptance: '7-9%',
      commonThemes: 'Students with clear goals who want to combine liberal arts education with professional preparation and real-world experience.'
    },
    'uchicago': {
      values: ['intellectual rigor', 'quirky thinking', 'love of learning', 'debate', 'uncommon perspectives'],
      culture: '"where fun comes to die" (said affectionately); intense intellectual culture; loves quirky, deep thinkers',
      essayTips: 'Show genuine intellectual curiosity, unique perspectives, and love of ideas for their own sake. UChicago famously has unusual essay prompts - embrace the weirdness and show creative thinking.',
      acceptance: '5-6%',
      commonThemes: 'Quirky, intellectually intense students who love learning, debate, and exploring ideas deeply - not for prestige but genuine curiosity.'
    },
    'johns hopkins': {
      values: ['research', 'collaboration', 'global health', 'innovation', 'pre-professional excellence'],
      culture: 'research powerhouse, especially in medicine; collaborative despite stereotype; serious academic environment',
      essayTips: 'Emphasize research interests, specific academic programs, and career goals (especially if medicine/public health/international relations). Show you\'ll take initiative in research.',
      acceptance: '7-9%',
      commonThemes: 'Research-oriented students with clear academic/career goals, particularly in STEM, medicine, or international studies.'
    },

    // TOP PUBLIC UNIVERSITIES
    'uc berkeley': {
      values: ['public service', 'innovation', 'activism', 'diversity', 'academic excellence'],
      culture: 'activist tradition, public university mission, entrepreneurial spirit, politically engaged',
      essayTips: 'Show how you\'ll use education for public good, engagement with social issues, and intellectual curiosity. Berkeley values students who will contribute to society.',
      acceptance: '11-14%',
      commonThemes: 'Socially conscious, academically strong students who want to make a difference and engage with complex social issues.'
    },
    'ucla': {
      values: ['excellence', 'service', 'diversity', 'innovation', 'social mobility'],
      culture: 'diverse, vibrant campus culture; emphasis on access and public service; strong school spirit',
      essayTips: 'Highlight community service, how you\'ll contribute to UCLA\'s diverse community, and specific programs you\'re excited about. Show both achievement and service.',
      acceptance: '9-12%',
      commonThemes: 'Well-rounded students committed to service, diversity, and using education to uplift their communities.'
    },
    'umich': {
      values: ['leaders and best', 'public service', 'diversity', 'interdisciplinary study', 'excellence'],
      culture: 'strong school spirit, public ivy prestige, emphasis on both academics and community',
      essayTips: 'Show leadership, service, and how you\'ll contribute to Michigan\'s community. Emphasize specific programs and your "why Michigan."',
      acceptance: '18-23%',
      commonThemes: 'Leaders who balance academic achievement with service and community contribution.'
    },
    'uva': {
      values: ['honor', 'Jeffersonian ideals', 'student self-governance', 'tradition', 'service'],
      culture: 'strong honor code, beautiful campus, balance of tradition and innovation',
      essayTips: 'Show appreciation for UVA\'s honor system and traditions, intellectual curiosity, and how you\'ll contribute to the community. Values fit is important.',
      acceptance: '19-23%',
      commonThemes: 'Students who value honor, tradition, and community, with strong academic achievement and leadership.'
    },

    // LIBERAL ARTS COLLEGES
    'williams': {
      values: ['tutorial system', 'close community', 'undergraduate focus', 'athletic/academic balance', 'mountains and minds'],
      culture: 'small, tight-knit, emphasis on discussion-based learning, rural setting with outdoor culture',
      essayTips: 'Show enthusiasm for close-knit community, tutorial system, and if genuine, outdoor activities. Williams wants engaged, collaborative students.',
      acceptance: '8-12%',
      commonThemes: 'Students who value close relationships with professors and peers, want discussion-based learning, and will actively engage in campus life.'
    },
    'amherst': {
      values: ['open curriculum', 'diversity', 'rigorous academics', 'close community', 'intellectual exploration'],
      culture: 'no core requirements, small and diverse, emphasis on intellectual freedom',
      essayTips: 'Show you\'re self-directed, value diversity of thought, and will design your own intellectual path. Amherst wants curious, independent thinkers.',
      acceptance: '7-11%',
      commonThemes: 'Self-motivated, intellectually curious students who will take advantage of academic freedom to pursue diverse interests.'
    },
    'swarthmore': {
      values: ['intellectual intensity', 'social responsibility', 'Quaker values', 'community', 'honors program'],
      culture: 'small, intense, values-driven; students passionate about learning and social justice',
      essayTips: 'Show deep intellectual curiosity, commitment to social responsibility, and genuine love of learning. Swarthmore is intense - demonstrate you\'ll thrive.',
      acceptance: '6-9%',
      commonThemes: 'Intellectually intense students committed to both rigorous academics and social responsibility.'
    },
    'pomona': {
      values: ['consortium benefits', 'California lifestyle', 'intellectual curiosity', 'diversity', 'small college community'],
      culture: 'best of both worlds - small college with 5C resources, Southern California setting',
      essayTips: 'Show how you\'ll take advantage of the Claremont Consortium, love of learning in a small setting, and appreciation for California culture.',
      acceptance: '7-10%',
      commonThemes: 'Students who want a small, close-knit college with access to wider resources and opportunities.'
    },

    // MORE TOP SCHOOLS
    'georgetown': {
      values: ['global engagement', 'Jesuit values', 'service', 'DC location', 'diplomacy'],
      culture: 'strong focus on international affairs, service, and ethics; DC internship opportunities',
      essayTips: 'Show interest in global issues, service orientation, and how you\'ll take advantage of DC location. Jesuit values (cura personalis - care for the whole person) are important.',
      acceptance: '12-14%',
      commonThemes: 'Students interested in international relations, politics, service, and global engagement.'
    },
    'vanderbilt': {
      values: ['balance', 'community', 'Southern hospitality', 'excellence', 'collaboration'],
      culture: 'work hard, play hard; strong sense of community; Nashville location important to culture',
      essayTips: 'Show you value balance, community engagement, and collaborative learning. Vanderbilt wants well-rounded students who will contribute to campus life.',
      acceptance: '6-8%',
      commonThemes: 'Well-rounded students who balance academics with social engagement and community contribution.'
    },
    'rice': {
      values: ['collaboration', 'residential college system', 'no Greek life', 'Houston location', 'innovation'],
      culture: 'collaborative not competitive; tight-knit through residential colleges; strong STEM but also humanities',
      essayTips: 'Emphasize collaborative mindset, how you\'ll contribute to residential college community, and specific academic interests. Rice values students who help others succeed.',
      acceptance: '8-10%',
      commonThemes: 'Collaborative students with strong academic interests who value community and want to help peers succeed.'
    },
    'emory': {
      values: ['service', 'global health', 'research', 'diversity', 'Atlanta engagement'],
      culture: 'strong pre-med culture, emphasis on service and global health, engaged with Atlanta community',
      essayTips: 'Show commitment to service, research interests (especially health-related), and how you\'ll engage with Atlanta. Emory values students who want to make a difference.',
      acceptance: '11-13%',
      commonThemes: 'Service-oriented students interested in health, research, and making meaningful impact.'
    },
    'notre dame': {
      values: ['Catholic tradition', 'community', 'service', 'fighting spirit', 'faith and reason'],
      culture: 'strong Catholic identity (though diverse student body), tight-knit community, school spirit',
      essayTips: 'Show how you align with Notre Dame\'s mission (not necessarily Catholic but value-driven), commitment to service, and enthusiasm for community. School spirit matters.',
      acceptance: '13-15%',
      commonThemes: 'Students with strong values, commitment to service, and appreciation for tight-knit community.'
    },
    'usc': {
      values: ['Trojan Family', 'innovation', 'entrepreneurship', 'Los Angeles', 'school spirit'],
      culture: 'strong network ("Trojan Family"), entrepreneurial spirit, LA opportunities, school spirit',
      essayTips: 'Show entrepreneurial mindset, how you\'ll take advantage of LA and USC network, and enthusiasm for school spirit. USC values innovators and networkers.',
      acceptance: '9-12%',
      commonThemes: 'Entrepreneurial, ambitious students who value networking and want to take advantage of LA opportunities.'
    },
    'nyu': {
      values: ['global perspective', 'NYC immersion', 'diversity', 'independence', 'career preparation'],
      culture: 'NYC is the campus; independent, career-focused students; global study opportunities',
      essayTips: 'Show you\'re independent, excited about NYC opportunities, and have clear career goals. NYU wants students who will actively engage with the city.',
      acceptance: '12-16%',
      commonThemes: 'Independent, career-focused students who want to immerse themselves in NYC and global opportunities.'
    },
    'boston college': {
      values: ['Jesuit education', 'service', 'intellectual inquiry', 'Boston', 'community'],
      culture: 'Jesuit values, strong sense of community, balance of academics and service',
      essayTips: 'Show commitment to service, intellectual curiosity, and how you\'ll contribute to BC\'s community-oriented culture.',
      acceptance: '16-19%',
      commonThemes: 'Students who value Jesuit education, are committed to service, and want a balanced college experience.'
    },
    'tufts': {
      values: ['active citizenship', 'global perspective', 'interdisciplinary thinking', 'civic engagement', 'diversity'],
      culture: 'emphasis on global citizenship and civic engagement; strong international relations program',
      essayTips: 'Show interest in making a difference in the world, civic engagement, and interdisciplinary thinking. Tufts values active citizens.',
      acceptance: '10-14%',
      commonThemes: 'Globally-minded, civically engaged students who want to use their education to address real-world challenges.'
    },
    'carnegie mellon': {
      values: ['interdisciplinary collaboration', 'innovation', 'making things', 'technical excellence', 'creativity'],
      culture: 'STEM powerhouse that also values arts; "My heart is in the work"; maker culture',
      essayTips: 'Show technical skills combined with creativity, projects you\'ve built, and interdisciplinary interests. CMU wants makers and innovators.',
      acceptance: '11-14%',
      commonThemes: 'Technically skilled students who are also creative, love building things, and value interdisciplinary work.'
    },
    'unc': {
      values: ['public service', 'Carolina community', 'light and liberty', 'excellence', 'access'],
      culture: 'strong school spirit, public service mission, balanced college experience',
      essayTips: 'Show commitment to service, how you\'ll contribute to Carolina community, and appreciation for public education mission.',
      acceptance: '20-23%',
      commonThemes: 'Well-rounded students committed to public service and contributing to their community.'
    },
    'university of washington': {
      values: ['innovation', 'public service', 'diversity', 'Seattle tech scene', 'research'],
      culture: 'strong STEM programs, Seattle location important, research opportunities, public mission',
      essayTips: 'Highlight research interests, how you\'ll contribute to diverse community, and excitement about Seattle/Pacific Northwest.',
      acceptance: '48-52%',
      commonThemes: 'Students interested in STEM, research, and making impact through innovation.'
    },
    'ut austin': {
      values: ['Texas spirit', 'diversity', 'innovation', 'public service', 'Hook \'em'],
      culture: 'huge school with incredible resources, strong school spirit, Austin culture important',
      essayTips: 'Show specific academic interests (UT is program-specific), how you\'ll find your community in large school, and excitement about Austin.',
      acceptance: '31-35%',
      commonThemes: 'Self-directed students who will take advantage of vast resources and contribute to specific programs.'
    },
    'georgia tech': {
      values: ['innovation', 'technical excellence', 'entrepreneurship', 'Atlanta', 'progress and service'],
      culture: 'intense STEM focus, collaborative culture, innovation and entrepreneurship emphasized',
      essayTips: 'Show passion for STEM, innovative projects, and entrepreneurial mindset. GT wants problem-solvers and builders.',
      acceptance: '16-21%',
      commonThemes: 'STEM-focused students who love building, innovating, and solving real-world problems.'
    },
    'uiuc': {
      values: ['innovation', 'public service', 'research excellence', 'practical application', 'diversity'],
      culture: 'especially strong in engineering and CS; research powerhouse; practical focus',
      essayTips: 'Emphasize specific program interest (especially STEM), research goals, and how you\'ll apply knowledge practically.',
      acceptance: '45-60%',
      commonThemes: 'Students with clear STEM interests who want strong technical education and research opportunities.'
    },
    'university of florida': {
      values: ['gator nation', 'public service', 'innovation', 'school spirit', 'opportunity'],
      culture: 'large public university with strong community, school spirit, warm climate',
      essayTips: 'Show school spirit, specific academic interests, and how you\'ll find community. UF values engaged students.',
      acceptance: '23-31%',
      commonThemes: 'Well-rounded students who will actively engage in campus life and take advantage of opportunities.'
    },
    'university of wisconsin': {
      values: ['Wisconsin Idea (public service)', 'research', 'diversity', 'Badger spirit', 'sifting and winnowing'],
      culture: 'strong academics and school spirit, Wisconsin Idea (university serving state), research focus',
      essayTips: 'Show commitment to using education for public good, research interests, and how you\'ll contribute to community.',
      acceptance: '49-60%',
      commonThemes: 'Students committed to public service, research, and making meaningful contributions to society.'
    }
  };

  let guidance = 'COLLEGE-SPECIFIC ESSAY GUIDANCE:\n\n';

  colleges.forEach(college => {
    const collegeLower = college.toLowerCase().trim();
    const collegeData = collegeKnowledgeBase[collegeLower];

    if (collegeData) {
      guidance += `📚 ${college.toUpperCase()}:\n`;
      guidance += `   Values: ${collegeData.values.join(', ')}\n`;
      guidance += `   Culture: ${collegeData.culture}\n`;
      guidance += `   Essay Tips: ${collegeData.essayTips}\n`;
      guidance += `   Acceptance Rate: ${collegeData.acceptance}\n`;
      guidance += `   What they typically look for: ${collegeData.commonThemes}\n\n`;
    } else {
      // Fallback for colleges not in knowledge base
      guidance += `📚 ${college.toUpperCase()}:\n`;
      guidance += `   Research this school's specific values and culture. General advice:\n`;
      guidance += `   - Show genuine interest in specific programs, professors, or opportunities\n`;
      guidance += `   - Demonstrate how you align with the school's mission and culture\n`;
      guidance += `   - Be authentic about why THIS school is a good fit for you\n`;
      guidance += `   - Highlight how you'll contribute to their community\n\n`;
    }
  });

  guidance += `\nIMPORTANT: Tailor ALL feedback to help the student align with the values and culture of these specific institutions. Reference these colleges in your collegeSpecificAdvice section.\n`;

  return guidance;
}

module.exports = async function handler(req, res) {
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

    // Add college context with detailed institutional knowledge
    if (colleges && colleges.length > 0) {
      systemPrompt += `\n\nTARGET COLLEGES: ${colleges.join(', ')}\n\n`;
      systemPrompt += getCollegeSpecificGuidance(colleges);
    } else {
      // Provide excellent general advice when no colleges specified
      systemPrompt += `\n\nNO TARGET COLLEGES SPECIFIED: Provide universally excellent essay advice that works for top-tier, mid-tier, and selective colleges. Focus on authenticity, specificity, storytelling, and unique voice.`;
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

