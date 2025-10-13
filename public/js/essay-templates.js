/**
 * Essay Templates Library
 * Provides templates, examples, and prompts to help students get started
 */

class EssayTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
        this.examples = this.initializeExamples();
        this.prompts = this.initializePrompts();
    }

    initialize() {
        console.log('📚 Initializing Essay Templates...');
        this.createTemplatesUI();
        console.log('✅ Essay Templates initialized');
    }

    initializeTemplates() {
        return [
            {
                id: 'personal-growth',
                name: 'Personal Growth Story',
                description: 'Show how a challenge or failure led to personal growth',
                structure: `[Opening Scene: Drop into a specific moment]

[Background: Briefly explain what led to this moment]

[The Challenge: What went wrong or what you struggled with]

[Your Response: Specific actions you took]

[What Changed: How this experience shaped you]

[Forward Motion: How you apply this lesson today]`,
                tips: [
                    'Start with a vivid moment, not background',
                    'Be specific about actions you took',
                    'Show growth through changed behavior',
                    'Avoid clichés like "this taught me to never give up"'
                ]
            },
            {
                id: 'identity-exploration',
                name: 'Identity & Background',
                description: 'Explore an aspect of your identity or background',
                structure: `[Hook: A moment that captures your identity/background]

[Context: Explain this aspect of who you are]

[Tension/Complexity: Show it's not simple or one-dimensional]

[Your Understanding: How your perspective evolved]

[Impact: How this shapes your goals or values]

[Connection: Why this matters for college/future]`,
                tips: [
                    'Avoid stereotypes—show complexity',
                    'Use specific anecdotes, not generalizations',
                    'Show evolution in your thinking',
                    'Connect to your future goals authentically'
                ]
            },
            {
                id: 'intellectual-curiosity',
                name: 'Intellectual Curiosity',
                description: 'Share a topic, idea, or concept that excites you',
                structure: `[The Spark: When/how you discovered this interest]

[Deep Dive: Show your engagement (reading, projects, experiments)]

[Questions: What puzzles or fascinates you]

[Connections: How you see this everywhere]

[Growth: How your thinking has evolved]

[Future: Where you want to take this]`,
                tips: [
                    'Show genuine enthusiasm through specific details',
                    'Demonstrate depth, not just breadth',
                    'Include what you don\'t know yet',
                    'Connect to actual activities or projects'
                ]
            },
            {
                id: 'meaningful-place',
                name: 'Meaningful Place or Environment',
                description: 'Describe a place that has special meaning to you',
                structure: `[Sensory Opening: Describe the place vividly]

[Your Connection: Why you go there/what you do there]

[What It Represents: Deeper meaning]

[Stories From This Place: Specific moments]

[How It Shaped You: What you've learned or discovered]

[Why It Matters: Connection to your identity]`,
                tips: [
                    'Use all five senses in description',
                    'Show, don\'t tell about the place\'s meaning',
                    'Connect place to personal growth',
                    'Avoid overly sentimental language'
                ]
            },
            {
                id: 'solving-problem',
                name: 'Problem Solving',
                description: 'Show how you identified and solved a problem',
                structure: `[Discovery: How you noticed the problem]

[Analysis: Why it mattered and what made it complex]

[Your Process: Steps you took to address it]

[Obstacles: What didn't work at first]

[Solution: Your innovative approach]

[Impact: Measurable results or changes]`,
                tips: [
                    'Choose a problem that reveals your values',
                    'Show your thinking process',
                    'Include failures or pivots',
                    'Quantify impact when possible'
                ]
            },
            {
                id: 'gratitude-influence',
                name: 'Gratitude/Who Influenced You',
                description: 'Write about someone who has impacted your life',
                structure: `[Memorable Moment: A scene with this person]

[Who They Are: Brief, vivid introduction]

[What They Taught You: Through actions, not words]

[Your Growth: How you've changed because of them]

[Carrying It Forward: How you embody their lessons]

[Deeper Insight: What this relationship reveals about you]`,
                tips: [
                    'Make sure the essay is still about YOU',
                    'Show lessons through specific scenes',
                    'Explain what you have done with their influence',
                    'Reflect on what this says about your values'
                ]
            }
        ];
    }

    initializeExamples() {
        return [
            {
                prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
                goodExample: {
                    opening: '"You speak Spanish like you\'re from Mars," my abuela says, laughing. She\'s not wrong. I cobble together verb tenses learned from Duolingo, vocabulary stolen from telenovelas, and grammar rules that exist only in my head.',
                    why: 'Strong because: Uses dialogue, specific details, humor, and immediately shows complexity in the student\'s identity'
                },
                poorExample: {
                    opening: 'I have always been proud of my Hispanic heritage. Being bilingual has taught me many valuable lessons about culture and diversity.',
                    why: 'Weak because: Tells instead of shows, uses clichés ("always been proud"), vague ("many valuable lessons")'
                }
            },
            {
                prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
                goodExample: {
                    opening: 'The robotics competition ended with our robot frozen mid-task, its arm extended like it was waving goodbye to our chances. I wanted to disappear into the floor.',
                    why: 'Strong because: Starts with a vivid scene, uses unexpected imagery ("waving goodbye"), shows vulnerability'
                },
                poorExample: {
                    opening: 'Failure is an important part of life. Last year, I faced a significant challenge that taught me the value of perseverance and hard work.',
                    why: 'Weak because: Opens with generic statement, promises to tell a story instead of showing it, uses platitudes'
                }
            }
        ];
    }

    initializePrompts() {
        return {
            commonApp: [
                {
                    number: 1,
                    prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
                    goodFor: ['Identity essays', 'Passion projects', 'Unique perspectives'],
                    avoid: ['Generic statements about diversity', 'Surface-level descriptions', 'Trying to cover too much']
                },
                {
                    number: 2,
                    prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
                    goodFor: ['Growth stories', 'Overcoming challenges', 'Demonstrating resilience'],
                    avoid: ['Trauma dumping', 'Obvious lessons ("I learned to never give up")', 'Blaming others']
                },
                {
                    number: 3,
                    prompt: 'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
                    goodFor: ['Intellectual curiosity', 'Moral courage', 'Independent thinking'],
                    avoid: ['Political rants', 'Disrespectful challenges', 'Unresolved conflicts without reflection']
                },
                {
                    number: 4,
                    prompt: 'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?',
                    goodFor: ['Showing appreciation', 'Demonstrating emotional maturity', 'Humble reflection'],
                    avoid: ['Making it all about the other person', 'Failing to show YOUR growth', 'Overly sentimental writing']
                },
                {
                    number: 5,
                    prompt: 'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
                    goodFor: ['Turning points', 'Self-discovery', 'Changed perspectives'],
                    avoid: ['Obvious achievements without reflection', 'Failing to show "before and after"', 'Generic growth statements']
                },
                {
                    number: 6,
                    prompt: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
                    goodFor: ['Academic passion', 'Intellectual curiosity', 'Deep interests'],
                    avoid: ['Superficial interests', 'Trying to sound impressive', 'Forgetting to show WHY it matters']
                },
                {
                    number: 7,
                    prompt: 'Share an essay on any topic of your choice. It can be one you\'ve already written, one that responds to a different prompt, or one of your own design.',
                    goodFor: ['Creative approaches', 'Unique stories', 'When other prompts don\'t fit'],
                    avoid: ['Choosing this because you can\'t pick another', 'Being too experimental without purpose', 'Forgetting it still needs structure']
                }
            ]
        };
    }

    createTemplatesUI() {
        // Add Templates button to essay controls
        const controlsDiv = document.querySelector('.essay-controls');
        if (!controlsDiv) return;

        const templatesBtn = document.createElement('button');
        templatesBtn.className = 'btn btn-secondary';
        templatesBtn.innerHTML = '<i class="fas fa-book-open"></i> Templates & Examples';
        templatesBtn.onclick = () => this.openTemplatesModal();

        const lastControlGroup = controlsDiv.querySelector('.control-group:last-child');
        if (lastControlGroup) {
            lastControlGroup.appendChild(templatesBtn);
        }
    }

    openTemplatesModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'templates-modal';
        modal.id = 'templatesModal';
        modal.innerHTML = `
            <div class="templates-modal-overlay" onclick="window.essayTemplates.closeTemplatesModal()"></div>
            <div class="templates-modal-content">
                <div class="templates-modal-header">
                    <h3><i class="fas fa-book-open"></i> Essay Templates & Examples</h3>
                    <button class="templates-close-btn" onclick="window.essayTemplates.closeTemplatesModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="templates-modal-body">
                    <div class="templates-tabs">
                        <button class="template-tab active" data-tab="templates">Essay Templates</button>
                        <button class="template-tab" data-tab="examples">Good vs Bad Examples</button>
                        <button class="template-tab" data-tab="prompts">Common Prompts</button>
                    </div>
                    <div class="templates-content" id="templatesContent">
                        ${this.renderTemplates()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addTemplatesStyles();

        // Set up tab switching
        modal.querySelectorAll('.template-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                modal.querySelectorAll('.template-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const tabName = e.target.dataset.tab;
                const content = document.getElementById('templatesContent');

                if (tabName === 'templates') {
                    content.innerHTML = this.renderTemplates();
                } else if (tabName === 'examples') {
                    content.innerHTML = this.renderExamples();
                } else if (tabName === 'prompts') {
                    content.innerHTML = this.renderPrompts();
                }
            });
        });

        // Animate in
        setTimeout(() => modal.classList.add('open'), 10);
    }

    closeTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => modal.remove(), 300);
        }
    }

    renderTemplates() {
        return `
            <div class="templates-list">
                ${this.templates.map(template => `
                    <div class="template-card">
                        <div class="template-card-header">
                            <h4>${template.name}</h4>
                            <button class="btn-use-template" onclick="window.essayTemplates.useTemplate('${template.id}')">
                                <i class="fas fa-plus"></i> Use Template
                            </button>
                        </div>
                        <p class="template-description">${template.description}</p>
                        <div class="template-structure">
                            <strong>Structure:</strong>
                            <pre>${template.structure}</pre>
                        </div>
                        <div class="template-tips">
                            <strong>Tips:</strong>
                            <ul>
                                ${template.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderExamples() {
        return `
            <div class="examples-list">
                ${this.examples.map((example, idx) => `
                    <div class="example-card">
                        <div class="example-prompt">
                            <strong>Prompt:</strong> ${example.prompt}
                        </div>
                        <div class="example-comparison">
                            <div class="example-good">
                                <div class="example-label good">✓ Strong Opening</div>
                                <div class="example-text">${example.goodExample.opening}</div>
                                <div class="example-why">${example.goodExample.why}</div>
                            </div>
                            <div class="example-bad">
                                <div class="example-label bad">✗ Weak Opening</div>
                                <div class="example-text">${example.poorExample.opening}</div>
                                <div class="example-why">${example.poorExample.why}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderPrompts() {
        return `
            <div class="prompts-section">
                <h4>Common App Essay Prompts (2024-2025)</h4>
                <p class="prompts-intro">Choose the prompt that best helps you tell YOUR story. There's no "best" prompt—only the one that works for you.</p>
                <div class="prompts-list">
                    ${this.prompts.commonApp.map(p => `
                        <div class="prompt-card">
                            <div class="prompt-number">Prompt ${p.number}</div>
                            <div class="prompt-text">${p.prompt}</div>
                            <div class="prompt-meta">
                                <div class="prompt-goodfor">
                                    <strong>Good for:</strong> ${p.goodFor.join(', ')}
                                </div>
                                <div class="prompt-avoid">
                                    <strong>Avoid:</strong> ${p.avoid.join(' • ')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const textarea = document.getElementById('essayTextarea');
        if (!textarea) return;

        // Ask for confirmation if there's existing content
        if (textarea.value.trim() && !confirm('This will replace your current essay. Continue?')) {
            return;
        }

        // Insert template
        textarea.value = `[${template.name}]\n\n${template.structure}\n\n---\nTips:\n${template.tips.map(t => `• ${t}`).join('\n')}`;

        // Update word count
        if (window.essayManager) {
            window.essayManager.updateWordCount();
        }

        // Close modal
        this.closeTemplatesModal();

        // Show message
        if (window.essayManager) {
            window.essayManager.showMessage('success', 'Template loaded! Replace the brackets with your own content.');
        }
    }

    addTemplatesStyles() {
        if (document.getElementById('templates-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'templates-modal-styles';
        style.textContent = `
            .templates-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 20000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .templates-modal.open {
                opacity: 1;
            }

            .templates-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }

            .templates-modal-content {
                position: relative;
                background: var(--primary-bg);
                border-radius: 20px;
                max-width: 900px;
                width: 90%;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                }
                to {
                    transform: translateY(0);
                }
            }

            .templates-modal-header {
                padding: 25px;
                border-bottom: 2px solid rgba(160, 123, 204, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .templates-modal-header h3 {
                margin: 0;
                font-size: 1.5rem;
                color: var(--text-primary);
            }

            .templates-close-btn {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                transition: color 0.2s;
            }

            .templates-close-btn:hover {
                color: var(--text-primary);
            }

            .templates-modal-body {
                padding: 25px;
                overflow-y: auto;
                flex: 1;
            }

            .templates-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 25px;
                border-bottom: 2px solid rgba(160, 123, 204, 0.1);
            }

            .template-tab {
                padding: 12px 24px;
                background: none;
                border: none;
                border-bottom: 3px solid transparent;
                color: var(--text-secondary);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .template-tab:hover {
                color: var(--text-primary);
            }

            .template-tab.active {
                color: var(--accent-color);
                border-bottom-color: var(--accent-color);
            }

            .template-card {
                background: var(--secondary-bg);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid rgba(160, 123, 204, 0.1);
            }

            .template-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .template-card-header h4 {
                margin: 0;
                color: var(--text-primary);
            }

            .btn-use-template {
                background: var(--gradient);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-use-template:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow);
            }

            .template-description {
                color: var(--text-secondary);
                margin-bottom: 15px;
            }

            .template-structure pre {
                background: var(--primary-bg);
                padding: 15px;
                border-radius: 8px;
                color: var(--text-primary);
                white-space: pre-wrap;
                line-height: 1.6;
                margin: 10px 0;
            }

            .template-tips ul {
                margin: 10px 0 0 20px;
                color: var(--text-secondary);
            }

            .template-tips li {
                margin-bottom: 8px;
                line-height: 1.5;
            }

            .example-card {
                background: var(--secondary-bg);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .example-prompt {
                background: var(--primary-bg);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                color: var(--text-primary);
                font-size: 0.95rem;
                line-height: 1.6;
            }

            .example-comparison {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .example-good, .example-bad {
                background: var(--primary-bg);
                padding: 15px;
                border-radius: 8px;
            }

            .example-label {
                font-weight: 700;
                margin-bottom: 10px;
                padding: 6px 12px;
                border-radius: 6px;
                display: inline-block;
            }

            .example-label.good {
                background: rgba(16, 185, 129, 0.15);
                color: #10b981;
            }

            .example-label.bad {
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
            }

            .example-text {
                font-style: italic;
                color: var(--text-primary);
                margin: 15px 0;
                line-height: 1.6;
            }

            .example-why {
                font-size: 0.85rem;
                color: var(--text-secondary);
                padding-top: 10px;
                border-top: 1px solid rgba(160, 123, 204, 0.1);
            }

            .prompt-card {
                background: var(--secondary-bg);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid rgba(160, 123, 204, 0.1);
            }

            .prompt-number {
                display: inline-block;
                background: var(--gradient);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 0.85rem;
                margin-bottom: 15px;
            }

            .prompt-text {
                color: var(--text-primary);
                font-size: 1.05rem;
                line-height: 1.7;
                margin-bottom: 15px;
            }

            .prompt-meta {
                padding-top: 15px;
                border-top: 1px solid rgba(160, 123, 204, 0.1);
            }

            .prompt-goodfor, .prompt-avoid {
                margin-bottom: 10px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .prompts-intro {
                background: var(--secondary-bg);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                color: var(--text-secondary);
            }

            @media (max-width: 768px) {
                .example-comparison {
                    grid-template-columns: 1fr;
                }

                .templates-modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

window.EssayTemplates = EssayTemplates;
