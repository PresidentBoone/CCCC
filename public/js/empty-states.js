/**
 * Empty States Component Library
 * Week 3: Easy-to-use empty state components
 * 
 * Usage:
 * const emptyState = EmptyStates.create('no-applications', container);
 * or
 * EmptyStates.render('no-essays', '#essay-list');
 */

const EmptyStates = {
    /**
     * Empty state configurations
     */
    templates: {
        'no-applications': {
            icon: 'fa-graduation-cap',
            title: 'No Applications Yet',
            description: 'Start your college journey by adding your first college application. Track deadlines, requirements, and progress all in one place.',
            action: {
                text: 'Add First Application',
                icon: 'fa-plus',
                href: '#add-application'
            },
            className: 'empty-state-no-applications'
        },
        
        'no-schools': {
            icon: 'fa-university',
            title: 'No Schools Added',
            description: 'Discover your perfect college matches using our AI-powered search. Get personalized recommendations based on your profile.',
            action: {
                text: 'Discover Schools',
                icon: 'fa-search',
                href: '/discovery.html'
            },
            className: 'empty-state-no-schools'
        },
        
        'no-essays': {
            icon: 'fa-pen-fancy',
            title: 'No Essays Yet',
            description: 'Get started with your college essays. Our AI coach will help you brainstorm, write, and refine compelling personal statements.',
            action: {
                text: 'Write First Essay',
                icon: 'fa-magic',
                onclick: 'createNewEssay()'
            },
            className: 'empty-state-no-essays'
        },
        
        'no-scholarships': {
            icon: 'fa-trophy',
            title: 'No Scholarships Found',
            description: 'We couldn\'t find any scholarships matching your criteria. Try adjusting your filters or updating your profile for better matches.',
            action: {
                text: 'Update Profile',
                icon: 'fa-user-edit',
                href: '/profile.html'
            },
            className: 'empty-state-no-scholarships'
        },
        
        'no-saved-scholarships': {
            icon: 'fa-bookmark',
            title: 'No Saved Scholarships',
            description: 'You haven\'t saved any scholarships yet. Browse our database of opportunities to find scholarships that match your profile.',
            action: {
                text: 'Browse Scholarships',
                icon: 'fa-search',
                href: '/scholarship.html'
            },
            className: 'empty-state-no-scholarships'
        },
        
        'no-timeline': {
            icon: 'fa-calendar-alt',
            title: 'Timeline Not Generated',
            description: 'Create your personalized college application timeline. Get AI-powered recommendations for when to complete each step.',
            action: {
                text: 'Generate Timeline',
                icon: 'fa-magic',
                onclick: 'generateTimeline()'
            },
            className: 'empty-state-no-timeline'
        },
        
        'no-tests': {
            icon: 'fa-calculator',
            title: 'No Test Prep Started',
            description: 'Start preparing for your standardized tests with our AI-powered practice questions and adaptive learning system.',
            action: {
                text: 'Start Test Prep',
                icon: 'fa-play',
                href: '/testprep-enhanced.html'
            },
            className: 'empty-state-no-tests'
        },
        
        'no-documents': {
            icon: 'fa-file-alt',
            title: 'No Documents Uploaded',
            description: 'Keep all your important documents organized in one place. Upload transcripts, recommendation letters, and more.',
            action: {
                text: 'Upload Document',
                icon: 'fa-upload',
                onclick: 'openUploadDialog()'
            },
            className: 'empty-state-no-documents'
        },
        
        'no-results': {
            icon: 'fa-search',
            title: 'No Results Found',
            description: 'We couldn\'t find anything matching your search. Try different keywords or filters.',
            action: {
                text: 'Clear Filters',
                icon: 'fa-times-circle',
                onclick: 'clearFilters()'
            }
        },
        
        'loading': {
            icon: 'fa-spinner fa-spin',
            title: 'Loading...',
            description: 'Please wait while we fetch your data.',
            className: 'empty-state-loading',
            hideAction: true
        },
        
        'error': {
            icon: 'fa-exclamation-triangle',
            title: 'Something Went Wrong',
            description: 'We encountered an error loading your data. Please try again.',
            action: {
                text: 'Retry',
                icon: 'fa-redo',
                onclick: 'location.reload()'
            },
            className: 'empty-state-error'
        }
    },

    /**
     * Create empty state element
     * @param {string} type - Type of empty state from templates
     * @param {HTMLElement|null} container - Optional container to append to
     * @returns {HTMLElement} - The created empty state element
     */
    create(type, container = null) {
        const config = this.templates[type];
        if (!config) {
            console.error(`Empty state type "${type}" not found`);
            return null;
        }

        const emptyState = document.createElement('div');
        emptyState.className = `empty-state empty-state-transition ${config.className || ''}`;
        emptyState.setAttribute('role', 'status');
        emptyState.setAttribute('aria-live', 'polite');

        // Icon
        const icon = document.createElement('i');
        icon.className = `fas ${config.icon} empty-state-icon`;
        icon.setAttribute('aria-hidden', 'true');
        emptyState.appendChild(icon);

        // Title
        const title = document.createElement('h3');
        title.className = 'empty-state-title';
        title.textContent = config.title;
        emptyState.appendChild(title);

        // Description
        const description = document.createElement('p');
        description.className = 'empty-state-description';
        description.textContent = config.description;
        emptyState.appendChild(description);

        // Action button (if not hidden)
        if (config.action && !config.hideAction) {
            const button = document.createElement('button');
            button.className = 'empty-state-action';
            button.setAttribute('type', 'button');

            if (config.action.icon) {
                const buttonIcon = document.createElement('i');
                buttonIcon.className = `fas ${config.action.icon}`;
                buttonIcon.setAttribute('aria-hidden', 'true');
                button.appendChild(buttonIcon);
            }

            const buttonText = document.createElement('span');
            buttonText.textContent = config.action.text;
            button.appendChild(buttonText);

            // Handle action
            if (config.action.href) {
                button.addEventListener('click', () => {
                    window.location.href = config.action.href;
                });
            } else if (config.action.onclick) {
                button.setAttribute('onclick', config.action.onclick);
            }

            emptyState.appendChild(button);
        }

        // Append to container if provided
        if (container) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (container) {
                container.innerHTML = '';
                container.appendChild(emptyState);
            }
        }

        return emptyState;
    },

    /**
     * Render empty state directly to container
     * @param {string} type - Type of empty state
     * @param {string|HTMLElement} selector - Container selector or element
     */
    render(type, selector) {
        const container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (!container) {
            console.error(`Container "${selector}" not found`);
            return;
        }

        return this.create(type, container);
    },

    /**
     * Create empty state with custom steps
     * @param {Object} config - Custom configuration
     * @param {Array} steps - Array of step objects {title, description}
     * @param {HTMLElement} container - Container element
     */
    createWithSteps(config, steps, container) {
        const emptyState = document.createElement('div');
        emptyState.className = `empty-state empty-state-with-steps empty-state-transition ${config.className || ''}`;
        emptyState.setAttribute('role', 'status');

        // Icon
        const icon = document.createElement('i');
        icon.className = `fas ${config.icon} empty-state-icon`;
        icon.setAttribute('aria-hidden', 'true');
        emptyState.appendChild(icon);

        // Title
        const title = document.createElement('h3');
        title.className = 'empty-state-title';
        title.textContent = config.title;
        emptyState.appendChild(title);

        // Description
        const description = document.createElement('p');
        description.className = 'empty-state-description';
        description.textContent = config.description;
        emptyState.appendChild(description);

        // Steps container
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'empty-state-steps';

        steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'empty-state-step';

            const stepNumber = document.createElement('div');
            stepNumber.className = 'empty-state-step-number';
            stepNumber.textContent = index + 1;
            stepEl.appendChild(stepNumber);

            const stepContent = document.createElement('div');
            stepContent.className = 'empty-state-step-content';

            const stepTitle = document.createElement('h4');
            stepTitle.textContent = step.title;
            stepContent.appendChild(stepTitle);

            const stepDesc = document.createElement('p');
            stepDesc.textContent = step.description;
            stepContent.appendChild(stepDesc);

            stepEl.appendChild(stepContent);
            stepsContainer.appendChild(stepEl);
        });

        emptyState.appendChild(stepsContainer);

        // Append to container
        if (container) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (container) {
                container.innerHTML = '';
                container.appendChild(emptyState);
            }
        }

        return emptyState;
    },

    /**
     * Create inline empty state (smaller variant)
     * @param {string} icon - FontAwesome icon class
     * @param {string} text - Display text
     * @param {HTMLElement} container - Container element
     */
    createInline(icon, text, container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-inline empty-state-transition';

        const iconEl = document.createElement('i');
        iconEl.className = `fas ${icon} empty-state-inline-icon`;
        iconEl.setAttribute('aria-hidden', 'true');
        emptyState.appendChild(iconEl);

        const textEl = document.createElement('p');
        textEl.className = 'empty-state-inline-text';
        textEl.textContent = text;
        emptyState.appendChild(textEl);

        if (container) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (container) {
                container.innerHTML = '';
                container.appendChild(emptyState);
            }
        }

        return emptyState;
    },

    /**
     * Create stat card empty state
     * @param {string} icon - FontAwesome icon class
     * @param {string} text - Display text
     * @param {HTMLElement} container - Container element
     */
    createStat(icon, text, container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-stat';

        const iconEl = document.createElement('i');
        iconEl.className = `fas ${icon} empty-state-stat-icon`;
        iconEl.setAttribute('aria-hidden', 'true');
        emptyState.appendChild(iconEl);

        const textEl = document.createElement('p');
        textEl.className = 'empty-state-stat-text';
        textEl.textContent = text;
        emptyState.appendChild(textEl);

        const value = document.createElement('div');
        value.className = 'empty-state-stat-value';
        value.textContent = '0';
        emptyState.appendChild(value);

        if (container) {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (container) {
                container.innerHTML = '';
                container.appendChild(emptyState);
            }
        }

        return emptyState;
    },

    /**
     * Remove empty state from container
     * @param {string|HTMLElement} selector - Container selector or element
     */
    remove(selector) {
        const container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        
        if (container) {
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmptyStates;
}

// Make available globally
window.EmptyStates = EmptyStates;
