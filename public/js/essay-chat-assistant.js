/**
 * Essay Chat Assistant
 * Intelligent chat system with fallback responses
 */

class EssayChatAssistant {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.chatHistory = [];
    }

    initialize() {
        console.log('💬 Initializing Essay Chat Assistant...');

        // Set up event listeners
        this.setupChatListeners();

        console.log('✅ Essay Chat Assistant initialized');
    }

    setupChatListeners() {
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.querySelector('.chat-send');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (chatSend) {
            chatSend.addEventListener('click', () => this.sendMessage());
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get current essay context
            const essay = document.getElementById('essayTextarea')?.value || '';
            const prompt = document.getElementById('essayPrompt')?.value || '';
            const colleges = document.getElementById('targetColleges')?.value.split(',').map(c => c.trim()).filter(c => c) || [];

            // Try API first
            let response;
            try {
                const apiResponse = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        essay,
                        userProfile: this.userData,
                        colleges,
                        prompt,
                        chatHistory: this.chatHistory.slice(-10)
                    }),
                    timeout: 10000
                });

                if (apiResponse.ok) {
                    const data = await apiResponse.json();
                    response = data.response;
                } else {
                    throw new Error('API failed');
                }
            } catch (apiError) {
                console.warn('API unavailable, using fallback:', apiError);
                response = await this.getFallbackResponse(message, essay, prompt, colleges);
            }

            // Remove typing indicator
            this.removeTypingIndicator();

            // Add AI response
            this.addMessage(response, 'ai');

        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble responding right now. Please try again in a moment.', 'ai');
        }
    }

    /**
     * Intelligent fallback responses when API is unavailable
     */
    async getFallbackResponse(message, essay, prompt, colleges) {
        const msg = message.toLowerCase();

        // Brainstorming help
        if (msg.includes('brainstorm') || msg.includes('idea') || msg.includes('topic') || msg.includes('what should i write')) {
            return `Great question! Let me help you brainstorm. Here are some proven approaches for strong college essays:

**Moment of Growth:** Think of a specific challenge or failure that taught you something important. How did you change?

**Unique Perspective:** What experiences have shaped how you see the world? What's your unique lens?

**Passion Project:** What do you care deeply about? When you talk about it, do people see your eyes light up?

**Quiet Moments:** Sometimes the best essays are about small, meaningful moments rather than grand achievements.

**Curiosity:** What questions drive you? What do you want to learn more about?

${this.userData?.intendedMajor ? `Since you're interested in ${this.userData.intendedMajor}, you could explore how your experiences led you to this field.` : ''}

What resonates with you? Tell me more about your experiences!`;
        }

        // Opening lines
        if (msg.includes('start') || msg.includes('beginning') || msg.includes('opening') || msg.includes('first sentence')) {
            return `Strong opening lines are crucial! Here are some techniques:

**In Media Res (In the Middle):** Start in the middle of a scene or action
❌ "I've always been interested in science."
✅ "The beaker shattered, and my hypothesis with it."

**Surprising Statement:** Challenge expectations
❌ "Failure taught me lessons."
✅ "My greatest achievement? Losing the championship."

**Specific Detail:** Paint a vivid picture
❌ "I was nervous."
✅ "My hands trembled as I adjusted the microscope for the third time."

**Question (use sparingly):** Make them curious
✅ "What does a 2AM fire alarm have to do with leadership?"

The key: Drop readers into a moment that makes them want to keep reading. What's your essay about?`;
        }

        // Show don't tell
        if (msg.includes('show don') || msg.includes('showing') || msg.includes('telling')) {
            return `"Show, don't tell" is THE most important principle! Let me explain:

**Telling:** "I am passionate about helping others."
**Showing:** "Every Tuesday, I teach Mr. Rodriguez English while he teaches me how to make tamales. Last week, when he passed his citizenship test, we both cried."

**Telling:** "I'm a hard worker."
**Showing:** "I wake at 5 AM to practice piano before school, my fingers still stiff from yesterday's three-hour session."

**Telling:** "The moment changed me."
**Showing:** "I used to walk past homeless people. Now I stop, crouch down to eye level, and ask their names."

**The formula:** Replace abstract claims with:
• Specific actions you took
• Concrete details (sights, sounds, feelings)
• Dialogue when relevant
• What changed in your behavior

Look at your essay—where are you TELLING readers about yourself? Can you SHOW them instead?`;
        }

        // Clichés
        if (msg.includes('clich') || msg.includes('common') || msg.includes('overused')) {
            return `Great awareness! Here are clichés to avoid and better alternatives:

**Common Clichés:**
❌ "I've always wanted to..." → ✅ Show a SPECIFIC moment when you realized
❌ "Changed my perspective" → ✅ Describe HOW your actions/thinking changed
❌ "Making a difference" → ✅ Name one specific person you impacted
❌ "Passion for helping others" → ✅ One detailed story of helping someone
❌ "Step outside my comfort zone" → ✅ What specifically scared you? What happened?

**Sports Essay Clichés:**
❌ "Learned teamwork" → ✅ Show a specific moment of teamwork
❌ "Perseverance through injury" → ✅ One vivid day of recovery
❌ "Leadership as captain" → ✅ One decision you made that mattered

**The Fix:** Replace every cliché with a SPECIFIC example from YOUR life. If 100 other students could write the same sentence, it's too generic.

Want me to help you revise a specific phrase?`;
        }

        // Word count
        if (msg.includes('word') || msg.includes('length') || msg.includes('long')) {
            const wordCount = essay.split(/\s+/).length;

            if (wordCount === 0) {
                return `Most college essays should be 500-650 words. The Common App has a 650-word limit.

**Why this length?**
• Long enough to tell a meaningful story
• Short enough to hold attention
• Forces you to be selective and specific

Start writing and I'll help you refine!`;
            } else if (wordCount < 250) {
                return `Your essay is currently ${wordCount} words. You have room to:

• Add more specific details and sensory information
• Develop your reflection—what did you learn?
• Show MORE instead of telling
• Include meaningful dialogue
• Describe the setting more vividly

Aim for 500-650 words total!`;
            } else if (wordCount > 650) {
                return `Your essay is ${wordCount} words (${wordCount - 650} over limit). Time to trim!

**Cutting Strategy:**
1. Remove generic statements ("I learned a lot")
2. Cut repetitive ideas—say it once, memorably
3. Trim weak adjectives and adverbs
4. Remove entire paragraphs that don't advance your story
5. Combine sentences for conciseness

Every word should earn its place. Which parts feel less essential?`;
            } else {
                return `Your essay is ${wordCount} words—great length! This gives you enough space to tell your story with specific details while staying focused.

Now focus on making every word count:
• Replace weak verbs with strong ones
• Add sensory details where relevant
• Ensure smooth transitions
• Make sure your conclusion reflects growth

What aspect would you like to improve?`;
            }
        }

        // Conclusion
        if (msg.includes('conclusion') || msg.includes('ending') || msg.includes('finish')) {
            return `Strong conclusions connect back to your opening and show growth!

**What DOESN'T work:**
❌ Repeating what you already said
❌ "And that's how I learned..."
❌ Generic statements about the future
❌ Overly grand claims ("I will change the world")

**What WORKS:**
✅ **Echo the Opening:** Return to your opening scene/image, but show how you've changed
✅ **Forward Motion:** One specific action you'll take based on what you learned
✅ **New Insight:** A realization that shifts your perspective
✅ **Quiet Confidence:** Show maturity without being grandiose

**Example:**
Opening: "The beaker shattered, and my hypothesis with it."
Conclusion: "Now when experiments fail, I don't see broken glass—I see the beginning of a better question."

How does your essay open? Let's create an ending that resonates!`;
        }

        // Specific colleges
        if (msg.includes('college') || msg.includes('school') || (colleges.length > 0 && msg.includes('for'))) {
            const collegeList = colleges.length > 0 ? colleges.join(', ') : 'your target schools';

            return `${colleges.length > 0 ? `Great! You're targeting ${collegeList}.` : 'Let me help with college-specific advice!'}

**Tailoring Your Essay:**

1. **Research Each School:**
   • What values do they emphasize?
   • What makes their community unique?
   • Read student blogs and course catalogs

2. **Be Specific:**
   ❌ "Your strong science program attracts me"
   ✅ "Professor Chen's research on microplastics aligns with my work testing local water quality"

3. **Show Fit:**
   • Connect YOUR experiences to THEIR opportunities
   • Name specific programs, professors, clubs
   • Show you've done your homework

4. **Authentic Interest:**
   Don't force it—write about genuine connections

${colleges.length > 0 ? `\nWould you like specific advice for any of these schools?` : '\nWhich colleges are you applying to?'}`;
        }

        // Revision
        if (msg.includes('revis') || msg.includes('improve') || msg.includes('better') || msg.includes('fix')) {
            return `Revision is where good essays become great! Here's my process:

**Read Aloud:** Read your essay out loud. Where do you stumble? Where does it feel awkward? Those spots need work.

**The Highlighter Test:**
• Highlight your BEST sentences in green
• Highlight weak/generic sentences in yellow
• Can you make yellow sentences more like green ones?

**Check Each Paragraph:**
• Does it advance your story?
• Could you delete it without losing meaning?
• If yes → cut it or strengthen it

**Specific Details Check:**
• Count your adjectives—are they specific? (not "beautiful" → "crimson" or "weathered")
• Replace weak verbs (walked → trudged, ran → sprinted)
• Add sensory details (what did you see, hear, smell?)

**Get Feedback:**
• Ask: "What do you remember?" (Not "What did you think?")
• Their answer tells you what's memorable

Want me to look at a specific paragraph?`;
        }

        // General encouragement
        if (msg.includes('help') || msg.includes('stuck') || msg.includes('don\'t know')) {
            return `I'm here to help! I can assist with:

**Essay Writing:**
• Brainstorming topics and angles
• Crafting strong openings and endings
• "Show, don't tell" techniques
• Avoiding clichés
• Word count and length

**Content Advice:**
• Developing your unique voice
• Adding specific details
• Creating memorable moments
• Revising and improving drafts

**Strategy:**
• Tailoring essays for specific colleges
• Understanding what admissions officers want
• Balancing achievements with growth

What specific aspect would you like help with?`;
        }

        // Default response
        return `That's a great question! While I'd love to give you detailed feedback, I can help you think through it:

**Questions to ask yourself:**
• What's the SPECIFIC moment or story you're trying to tell?
• What did you learn or how did you grow?
• Are you SHOWING through details, or TELLING with generic statements?
• Would this sentence feel true for 100 other students, or is it uniquely YOURS?

${essay ? `\nI can see you've written ${essay.split(/\s+/).length} words. Want help improving a specific part?` : '\nStart writing and I\'ll give you more specific feedback!'}

What aspect of your essay are you working on right now?`;
    }

    /**
     * Add message to chat
     */
    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message message-${sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = message;

        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to chat history
        this.chatHistory.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: message
        });
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message message-ai';
        typingDiv.id = 'typingIndicator';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

        typingDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

window.EssayChatAssistant = EssayChatAssistant;
