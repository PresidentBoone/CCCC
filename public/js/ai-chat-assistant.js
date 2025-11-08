/**
 * AI Chat Assistant
 * Always-available help with context-aware suggestions
 */

class AIChatAssistant {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.isOpen = false;
        this.messages = [];
        this.widget = null;
    }

    /**
     * Initialize chat widget
     */
    initialize() {
        this.createWidget();
        this.loadChatHistory();
        this.addContextualSuggestions();
    }

    /**
     * Create chat widget DOM
     */
    createWidget() {
        this.widget = document.createElement('div');
        this.widget.id = 'aiChatWidget';
        this.widget.className = 'ai-chat-widget';
        this.widget.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-title">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <div class="ai-chat-name">College Climb AI</div>
                        <div class="ai-chat-status">
                            <span class="online-dot"></span>
                            Online
                        </div>
                    </div>
                </div>
                <button class="ai-chat-minimize" onclick="window.aiChat.toggle()">
                    <i class="fas fa-minus"></i>
                </button>
            </div>

            <div class="ai-chat-messages" id="aiChatMessages">
                <div class="ai-message ai-welcome">
                    <div class="ai-message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-message-content">
                        <p>Hi! I'm your College Climb AI assistant. I can help you with:</p>
                        <ul>
                            <li>Application deadlines & planning</li>
                            <li>Essay writing tips</li>
                            <li>College recommendations</li>
                            <li>Test prep strategies</li>
                            <li>Scholarship opportunities</li>
                        </ul>
                        <p>What would you like help with?</p>
                    </div>
                </div>
            </div>

            <div class="ai-quick-actions" id="aiQuickActions">
                ${this.renderQuickActions()}
            </div>

            <div class="ai-chat-input-container">
                <textarea
                    id="aiChatInput"
                    class="ai-chat-input"
                    placeholder="Ask me anything..."
                    rows="1"
                    onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); window.aiChat.sendMessage();}"
                ></textarea>
                <button class="ai-chat-send" onclick="window.aiChat.sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(this.widget);
        this.addStyles();

        // Auto-expand textarea
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }
    }

    /**
     * Render quick action buttons based on context
     */
    renderQuickActions() {
        const actions = this.getContextualActions();

        return actions.map(action => `
            <button class="quick-action-btn" onclick="window.aiChat.handleQuickAction('${action.id}')">
                <i class="${action.icon}"></i>
                ${action.label}
            </button>
        `).join('');
    }

    /**
     * Get contextual quick actions
     */
    getContextualActions() {
        const actions = [];

        // Always available
        actions.push(
            { id: 'deadlines', icon: 'fas fa-clock', label: 'What are my deadlines?' },
            { id: 'essay-help', icon: 'fas fa-pen', label: 'Essay tips' }
        );

        // Context-based actions
        if (this.userData?.testScore && this.userData.testScore < 1400) {
            actions.push({ id: 'improve-score', icon: 'fas fa-chart-line', label: 'How to improve my SAT' });
        }

        if (!this.userData?.intendedMajor) {
            actions.push({ id: 'find-major', icon: 'fas fa-compass', label: 'Help me find a major' });
        }

        return actions.slice(0, 3); // Max 3 quick actions
    }

    /**
     * Handle quick action click
     */
    async handleQuickAction(actionId) {
        const responses = {
            'deadlines': await this.getDeadlinesResponse(),
            'essay-help': 'Great question! For essay writing, focus on showing (not telling) your story. Use specific examples and be authentic. Want me to analyze a specific essay?',
            'improve-score': `Based on your current score, I recommend:\n\n1. Focus on Math fundamentals - this is where most students gain points quickly\n2. Take 2-3 full practice tests\n3. Review wrong answers thoroughly\n\nWant to start a practice test now?`,
            'find-major': 'Let\'s explore your interests! What subjects do you enjoy most in school? What problems do you want to solve in the world?'
        };

        const response = responses[actionId] || 'I can help you with that! Please tell me more.';
        this.addAIMessage(response);

        // Hide quick actions after first use
        const quickActions = document.getElementById('aiQuickActions');
        if (quickActions) {
            quickActions.style.display = 'none';
        }
    }

    /**
     * Get personalized deadlines response
     */
    async getDeadlinesResponse() {
        try {
            const { collection, query, where, getDocs, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const appsQuery = query(
                collection(this.db, 'applications'),
                where('userId', '==', this.userId),
                where('status', '!=', 'submitted'),
                orderBy('status'),
                orderBy('deadline', 'asc'),
                limit(3)
            );

            const snapshot = await getDocs(appsQuery);

            if (snapshot.empty) {
                return 'You haven\'t added any applications yet. Would you like help creating your college list?';
            }

            let response = 'Here are your upcoming deadlines:\n\n';
            snapshot.docs.forEach((doc, index) => {
                const app = doc.data();
                const deadline = new Date(app.deadline);
                const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

                response += `${index + 1}. **${app.collegeName}** - ${deadline.toLocaleDateString()}\n`;
                response += `   ${daysLeft > 0 ? `${daysLeft} days left` : 'OVERDUE!'}\n\n`;
            });

            response += 'Need help planning your application timeline?';
            return response;
        } catch (error) {
            console.error('Error getting deadlines:', error);
            return 'I had trouble loading your deadlines. You can check them in your Application Tracker.';
        }
    }

    /**
     * Send user message
     */
    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        input.value = '';
        input.style.height = 'auto';

        // Add user message
        this.addUserMessage(message);

        // Show typing indicator
        this.showTypingIndicator();

        // Get AI response (simulated for now - you'd call your API here)
        setTimeout(async () => {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addAIMessage(response);
        }, 1000);
    }

    /**
     * Get AI response (integrate with your AI backend)
     */
    async getAIResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Simple keyword-based responses (replace with real AI)
        if (lowerMessage.includes('deadline')) {
            return await this.getDeadlinesResponse();
        }

        if (lowerMessage.includes('essay') || lowerMessage.includes('write')) {
            return 'I can help with essays! Visit the Essay Coach to get detailed AI feedback on your writing. Would you like tips on:\n\n1. Personal statements\n2. Supplemental essays\n3. Brainstorming ideas';
        }

        if (lowerMessage.includes('college') || lowerMessage.includes('school')) {
            return `Great question! Based on your profile, I can recommend colleges that match your stats. Check out the College Discovery page for AI-powered recommendations.\n\nWant me to suggest some schools now?`;
        }

        if (lowerMessage.includes('test') || lowerMessage.includes('sat') || lowerMessage.includes('act')) {
            return 'Test prep is crucial! Our AI-powered practice tests identify your weak spots and create personalized study plans. Head to Test Prep to get started.\n\nWhat score are you aiming for?';
        }

        if (lowerMessage.includes('scholarship')) {
            return `Scholarships can make a huge difference! Based on your profile, you might be eligible for:\n\n• Merit-based scholarships (${this.userData?.gpa >= 3.5 ? 'strong candidate!' : 'check requirements'})\n• Need-based aid\n• Local scholarships (often less competitive)\n\nVisit the Scholarship page to see personalized matches.`;
        }

        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return 'I\'m here to help! You can ask me about:\n\n• Application deadlines\n• Essay writing\n• College recommendations\n• Test prep strategies\n• Scholarships\n• Timeline planning\n\nWhat specifically would you like to know?';
        }

        // Default response
        return `That's a great question! While I'm still learning, I recommend:\n\n1. Check the relevant section of your dashboard\n2. Ask me more specific questions\n3. Use the product tour (click the ? button)\n\nCan you tell me more about what you need?`;
    }

    /**
     * Add user message to chat
     */
    addUserMessage(message) {
        this.messages.push({ type: 'user', content: message, timestamp: new Date() });

        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <div class="user-message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Save to history
        this.saveChatHistory();
    }

    /**
     * Add AI message to chat
     */
    addAIMessage(message) {
        this.messages.push({ type: 'ai', content: message, timestamp: new Date() });

        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                ${this.formatMessage(message)}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Save to history
        this.saveChatHistory();
    }

    /**
     * Format message with markdown-like syntax
     */
    formatMessage(message) {
        // Bold text
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Line breaks
        message = message.replace(/\n/g, '<br>');

        // Numbered lists
        message = message.replace(/(\d+)\.\s/g, '<br>$1. ');

        // Bullet lists
        message = message.replace(/•\s/g, '<br>• ');

        return `<p>${message}</p>`;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;

        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * Toggle chat open/closed
     */
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.widget) {
            this.widget.classList.toggle('open', this.isOpen);
        }

        // Update icon
        const minimizeBtn = this.widget?.querySelector('.ai-chat-minimize i');
        if (minimizeBtn) {
            minimizeBtn.className = this.isOpen ? 'fas fa-minus' : 'fas fa-comment';
        }
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            const history = this.messages.slice(-20); // Keep last 20 messages
            localStorage.setItem(`chatHistory_${this.userId}`, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const history = localStorage.getItem(`chatHistory_${this.userId}`);
            if (history) {
                this.messages = JSON.parse(history);

                // Render previous messages (skip welcome message)
                const messagesContainer = document.getElementById('aiChatMessages');
                if (messagesContainer && this.messages.length > 0) {
                    this.messages.forEach(msg => {
                        if (msg.type === 'user') {
                            this.addUserMessage(msg.content);
                        } else {
                            this.addAIMessage(msg.content);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    /**
     * Add contextual suggestions based on page
     */
    addContextualSuggestions() {
        // You can add page-specific suggestions here
        // For example, on essay page: "Need help with this essay?"
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add widget styles
     */
    addStyles() {
        if (document.getElementById('aiChatStyles')) return;

        const style = document.createElement('style');
        style.id = 'aiChatStyles';
        style.textContent = `
            .ai-chat-widget {
                position: fixed;
                bottom: 180px;
                right: 30px;
                width: 400px;
                height: 600px;
                background: var(--primary-bg);
                border-radius: 20px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                transform: translateY(calc(100% + 180px));
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(160, 123, 204, 0.2);
            }

            .ai-chat-widget.open {
                transform: translateY(0);
            }

            [data-theme="dark"] .ai-chat-widget {
                background: var(--secondary-bg);
                border-color: rgba(187, 134, 252, 0.3);
            }

            .ai-chat-header {
                background: var(--gradient);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-chat-title {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .ai-avatar {
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.3rem;
            }

            .ai-chat-name {
                font-weight: 700;
                font-size: 1.1rem;
            }

            .ai-chat-status {
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                opacity: 0.9;
            }

            .online-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .ai-chat-minimize {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }

            .ai-chat-minimize:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .ai-message {
                display: flex;
                gap: 0.75rem;
                align-items: flex-start;
            }

            .ai-message-avatar {
                width: 35px;
                height: 35px;
                background: var(--gradient);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
                font-size: 1rem;
            }

            .ai-message-content {
                background: var(--secondary-bg);
                padding: 1rem;
                border-radius: 12px;
                max-width: 80%;
                line-height: 1.6;
            }

            .ai-message-content p {
                margin: 0 0 0.75rem 0;
            }

            .ai-message-content p:last-child {
                margin-bottom: 0;
            }

            .ai-message-content ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }

            .ai-message-content li {
                margin: 0.5rem 0;
            }

            .ai-welcome {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                border-radius: 12px;
                padding: 1rem;
            }

            .ai-welcome .ai-message-content {
                background: transparent;
                padding: 0;
                max-width: 100%;
            }

            .user-message {
                display: flex;
                justify-content: flex-end;
            }

            .user-message-content {
                background: var(--accent-color);
                color: white;
                padding: 1rem;
                border-radius: 12px;
                max-width: 80%;
                line-height: 1.6;
            }

            .user-message-content p {
                margin: 0;
            }

            .typing-indicator .typing-dots {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                background: var(--secondary-bg);
                border-radius: 12px;
            }

            .typing-dots span {
                width: 8px;
                height: 8px;
                background: var(--accent-color);
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .ai-quick-actions {
                padding: 0 1.5rem 1rem;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .quick-action-btn {
                background: var(--secondary-bg);
                border: 2px solid rgba(160, 123, 204, 0.2);
                color: var(--text-primary);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .quick-action-btn:hover {
                background: var(--accent-color);
                color: white;
                border-color: var(--accent-color);
                transform: translateY(-2px);
            }

            .ai-chat-input-container {
                padding: 1rem 1.5rem;
                border-top: 1px solid rgba(160, 123, 204, 0.1);
                display: flex;
                gap: 0.75rem;
                align-items: flex-end;
            }

            .ai-chat-input {
                flex: 1;
                padding: 0.75rem;
                border: 2px solid rgba(160, 123, 204, 0.2);
                border-radius: 12px;
                background: var(--secondary-bg);
                color: var(--text-primary);
                font-size: 0.95rem;
                font-family: inherit;
                resize: none;
                max-height: 120px;
                transition: border-color 0.3s ease;
            }

            .ai-chat-input:focus {
                outline: none;
                border-color: var(--accent-color);
            }

            .ai-chat-send {
                width: 44px;
                height: 44px;
                background: var(--gradient);
                border: none;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }

            .ai-chat-send:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(160, 123, 204, 0.4);
            }

            .ai-chat-send:active {
                transform: translateY(0);
            }

            @media (max-width: 768px) {
                .ai-chat-widget {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 200px);
                    right: 20px;
                    bottom: 150px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export to global scope
window.AIChatAssistant = AIChatAssistant;

console.log('📦 AI Chat Assistant loaded');
