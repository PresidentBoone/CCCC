/**
 * Essay Manager - Complete Essay Management System
 * Handles all essay operations with Firestore integration
 */

class EssayManager {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.currentEssay = null;
        this.currentEssayId = null;
        this.analysisResult = null;
        this.chatHistory = [];
        this.autoSaveInterval = null;
    }

    async initialize() {
        console.log('📝 Initializing Essay Manager...');

        // Load user's essays
        await this.loadEssays();

        // Load draft from localStorage
        this.loadDraft();

        // Set up auto-save
        this.setupAutoSave();

        console.log('✅ Essay Manager initialized');
    }

    /**
     * Load all user essays from Firestore
     */
    async loadEssays() {
        try {
            const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const essaysRef = collection(this.db, 'users', this.userId, 'essays');
            const q = query(essaysRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);

            const essays = [];
            snapshot.forEach(doc => {
                essays.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displayEssayList(essays);
            return essays;

        } catch (error) {
            console.error('Error loading essays:', error);
            return [];
        }
    }

    /**
     * Display essay list in sidebar - ENHANCED VERSION
     */
    displayEssayList(essays) {
        const listContainer = document.getElementById('essayList');
        if (!listContainer) return;

        // Store all essays for filtering
        this.allEssays = essays;

        if (essays.length === 0) {
            listContainer.innerHTML = `
                <div class="essay-list-empty">
                    <i class="fas fa-pen-fancy"></i>
                    <p><strong>No essays yet</strong></p>
                    <p>Start writing to create your first essay!</p>
                </div>
            `;
            return;
        }

        // Group by sort selection
        const sortBy = document.getElementById('essaySortSelect')?.value || 'updated';
        let groupedEssays = {};

        if (sortBy === 'college') {
            // Group by college
            essays.forEach(essay => {
                const colleges = essay.targetColleges || ['Uncategorized'];
                colleges.forEach(college => {
                    if (!groupedEssays[college]) groupedEssays[college] = [];
                    groupedEssays[college].push(essay);
                });
            });
        } else {
            // Single group
            groupedEssays['All'] = essays;
        }

        let html = '';
        Object.keys(groupedEssays).forEach(groupName => {
            if (sortBy === 'college' && groupName !== 'All') {
                html += `<div class="college-group-header">
                    <i class="fas fa-university"></i> ${groupName}
                </div>`;
            }

            groupedEssays[groupName].forEach(essay => {
                html += this.renderEssayItem(essay);
            });
        });

        listContainer.innerHTML = html;
    }

    /**
     * Render individual essay item with all features
     */
    renderEssayItem(essay) {
        const updatedDate = essay.updatedAt?.toDate ? essay.updatedAt.toDate() : new Date(essay.updatedAt);
        const status = essay.status || 'draft';
        const colleges = essay.targetColleges || [];
        const wordCount = essay.wordCount || 0;

        return `
            <div class="essay-item" data-essay-id="${essay.id}">
                <div class="essay-item-header">
                    <div class="essay-info">
                        <div class="essay-title" onclick="window.essayManager.loadEssay('${essay.id}')">${this.escapeHtml(essay.title || 'Untitled Essay')}</div>
                        ${colleges.length > 0 ? `
                            <div class="essay-colleges">
                                ${colleges.slice(0, 2).map(c => `<span class="essay-college-tag">${this.escapeHtml(c)}</span>`).join('')}
                                ${colleges.length > 2 ? `<span class="essay-college-tag">+${colleges.length - 2}</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <span class="essay-status ${status}">${status}</span>
                </div>

                <div class="essay-meta">
                    <div class="essay-meta-left">
                        <span class="essay-meta-item">
                            <i class="fas fa-file-word"></i> ${wordCount} words
                        </span>
                        <span class="essay-meta-item">
                            <i class="fas fa-clock"></i> ${this.formatRelativeTime(updatedDate)}
                        </span>
                    </div>
                </div>

                <div class="essay-actions">
                    <button class="essay-action-btn" onclick="event.stopPropagation(); window.essayManager.duplicateEssay('${essay.id}')" title="Duplicate">
                        <i class="fas fa-copy"></i> Duplicate
                    </button>
                    <button class="essay-action-btn" onclick="event.stopPropagation(); window.essayManager.exportEssay('${essay.id}')" title="Export">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="essay-action-btn delete" onclick="event.stopPropagation(); window.essayManager.deleteEssay('${essay.id}')" title="Delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Filter and sort essays based on search/filter controls
     */
    filterEssays() {
        if (!this.allEssays) return;

        const searchTerm = document.getElementById('essaySearchInput')?.value.toLowerCase() || '';
        const filterStatus = document.getElementById('essayFilterSelect')?.value || 'all';
        const sortBy = document.getElementById('essaySortSelect')?.value || 'updated';

        let filtered = this.allEssays.filter(essay => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                (essay.title || '').toLowerCase().includes(searchTerm) ||
                (essay.prompt || '').toLowerCase().includes(searchTerm) ||
                (essay.targetColleges || []).some(c => c.toLowerCase().includes(searchTerm));

            // Status filter
            const matchesStatus = filterStatus === 'all' || (essay.status || 'draft') === filterStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'created':
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'college':
                    const aCollege = (a.targetColleges || [''])[0];
                    const bCollege = (b.targetColleges || [''])[0];
                    return aCollege.localeCompare(bCollege);
                case 'updated':
                default:
                    return (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0);
            }
        });

        this.displayEssayList(filtered);
    }

    /**
     * HTML escape helper
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 7) return date.toLocaleDateString();
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    /**
     * Load specific essay
     */
    async loadEssay(essayId) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const essayRef = doc(this.db, 'users', this.userId, 'essays', essayId);
            const essayDoc = await getDoc(essayRef);

            if (!essayDoc.exists()) {
                this.showMessage('error', 'Essay not found');
                return;
            }

            const essay = essayDoc.data();
            this.currentEssay = essay;
            this.currentEssayId = essayId;

            // Populate form
            document.getElementById('essayTitle').value = essay.title || '';
            document.getElementById('essayTextarea').value = essay.content || '';
            document.getElementById('essayPrompt').value = essay.prompt || '';
            document.getElementById('targetColleges').value = (essay.targetColleges || []).join(', ');

            // Update word count
            this.updateWordCount();

            // Show analysis if exists
            if (essay.analysis) {
                this.analysisResult = essay.analysis;
                this.displayAnalysisResults(essay.analysis);
            }

            this.showMessage('success', 'Essay loaded successfully!');

        } catch (error) {
            console.error('Error loading essay:', error);
            this.showMessage('error', 'Failed to load essay');
        }
    }

    /**
     * Save essay to Firestore
     */
    async saveEssay() {
        try {
            const { doc, setDoc, serverTimestamp, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const title = document.getElementById('essayTitle').value.trim() || 'Untitled Essay';
            const content = document.getElementById('essayTextarea').value.trim();
            const prompt = document.getElementById('essayPrompt').value.trim();
            const colleges = document.getElementById('targetColleges').value.trim().split(',').map(c => c.trim()).filter(c => c);

            if (!content) {
                this.showMessage('error', 'Essay cannot be empty');
                return;
            }

            const wordCount = content.split(/\s+/).length;
            const charCount = content.length;

            const essayData = {
                title,
                content,
                prompt,
                targetColleges: colleges,
                wordCount,
                charCount,
                userId: this.userId,
                updatedAt: serverTimestamp(),
                analysis: this.analysisResult || null
            };

            let essayId;

            if (this.currentEssayId) {
                // Update existing essay
                const essayRef = doc(this.db, 'users', this.userId, 'essays', this.currentEssayId);
                await setDoc(essayRef, essayData, { merge: true });
                essayId = this.currentEssayId;
            } else {
                // Create new essay
                essayData.createdAt = serverTimestamp();
                essayData.versionCount = 0;

                const essaysRef = collection(this.db, 'users', this.userId, 'essays');
                const docRef = await addDoc(essaysRef, essayData);
                essayId = docRef.id;
                this.currentEssayId = essayId;
            }

            // Update last saved indicator
            document.getElementById('lastSaved').textContent = new Date().toLocaleTimeString();

            // Clear localStorage draft
            localStorage.removeItem(`essay-draft-${this.userId}`);

            // Reload essay list
            await this.loadEssays();

            this.showMessage('success', 'Essay saved successfully!');

            return essayId;

        } catch (error) {
            console.error('Error saving essay:', error);
            this.showMessage('error', 'Failed to save essay');
            return null;
        }
    }

    /**
     * Create new version of essay
     */
    async createVersion() {
        if (!this.currentEssayId) {
            this.showMessage('error', 'Please save the essay first');
            return;
        }

        try {
            const { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const content = document.getElementById('essayTextarea').value.trim();
            if (!content) {
                this.showMessage('error', 'Essay cannot be empty');
                return;
            }

            // Get parent essay
            const parentRef = doc(this.db, 'users', this.userId, 'essays', this.currentEssayId);
            const parentDoc = await getDoc(parentRef);

            if (!parentDoc.exists()) {
                this.showMessage('error', 'Parent essay not found');
                return;
            }

            const parentData = parentDoc.data();
            const versionNumber = (parentData.versionCount || 0) + 1;

            // Create version document
            const versionData = {
                parentEssayId: this.currentEssayId,
                version: versionNumber,
                title: document.getElementById('essayTitle').value.trim() || parentData.title,
                content,
                prompt: document.getElementById('essayPrompt').value.trim(),
                targetColleges: document.getElementById('targetColleges').value.trim().split(',').map(c => c.trim()).filter(c => c),
                wordCount: content.split(/\s+/).length,
                charCount: content.length,
                userId: this.userId,
                createdAt: serverTimestamp(),
                analysis: this.analysisResult || null
            };

            const versionsRef = collection(this.db, 'users', this.userId, 'essays', this.currentEssayId, 'versions');
            await addDoc(versionsRef, versionData);

            // Update parent version count
            await updateDoc(parentRef, {
                versionCount: versionNumber
            });

            this.showMessage('success', `Version ${versionNumber} created successfully!`);
            await this.loadEssays();

        } catch (error) {
            console.error('Error creating version:', error);
            this.showMessage('error', 'Failed to create version');
        }
    }

    /**
     * Create new essay (clear form)
     */
    createNewEssay() {
        this.currentEssayId = null;
        this.currentEssay = null;
        this.analysisResult = null;

        document.getElementById('essayTitle').value = '';
        document.getElementById('essayTextarea').value = '';
        document.getElementById('essayPrompt').value = '';
        document.getElementById('targetColleges').value = '';

        // Hide analysis results
        const analysisResults = document.getElementById('analysisResults');
        if (analysisResults) {
            analysisResults.style.display = 'none';
        }

        // Clear highlights
        if (window.clearHighlights) {
            window.clearHighlights();
        }

        this.updateWordCount();
        this.showMessage('info', 'Ready to write a new essay!');
    }

    /**
     * Duplicate essay
     */
    async duplicateEssay(essayId) {
        try {
            const { doc, getDoc, addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const essayRef = doc(this.db, 'users', this.userId, 'essays', essayId);
            const essayDoc = await getDoc(essayRef);

            if (!essayDoc.exists()) {
                this.showMessage('error', 'Essay not found');
                return;
            }

            const originalEssay = essayDoc.data();
            const duplicatedEssay = {
                ...originalEssay,
                title: `${originalEssay.title || 'Untitled'} (Copy)`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'draft' // Reset status to draft
            };

            const essaysRef = collection(this.db, 'users', this.userId, 'essays');
            await addDoc(essaysRef, duplicatedEssay);

            this.showMessage('success', 'Essay duplicated successfully!');
            await this.loadEssays();

        } catch (error) {
            console.error('Error duplicating essay:', error);
            this.showMessage('error', 'Failed to duplicate essay');
        }
    }

    /**
     * Export essay to PDF or Word
     */
    async exportEssay(essayId) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const essayRef = doc(this.db, 'users', this.userId, 'essays', essayId);
            const essayDoc = await getDoc(essayRef);

            if (!essayDoc.exists()) {
                this.showMessage('error', 'Essay not found');
                return;
            }

            const essay = essayDoc.data();

            // Create formatted text content
            let content = '';
            content += `${essay.title || 'Untitled Essay'}\n`;
            content += `${'='.repeat(50)}\n\n`;

            if (essay.prompt) {
                content += `Prompt: ${essay.prompt}\n\n`;
            }

            if (essay.targetColleges && essay.targetColleges.length > 0) {
                content += `Target Colleges: ${essay.targetColleges.join(', ')}\n\n`;
            }

            content += `${'='.repeat(50)}\n\n`;
            content += essay.content || '';
            content += `\n\n${'='.repeat(50)}\n`;
            content += `Word Count: ${essay.wordCount || 0}\n`;
            content += `Last Updated: ${new Date().toLocaleDateString()}\n`;

            // Create downloadable text file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${essay.title || 'essay'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('success', 'Essay exported successfully!');

        } catch (error) {
            console.error('Error exporting essay:', error);
            this.showMessage('error', 'Failed to export essay');
        }
    }

    /**
     * Delete essay
     */
    async deleteEssay(essayId) {
        if (!confirm('Are you sure you want to delete this essay? This action cannot be undone.')) {
            return;
        }

        try {
            const { doc, deleteDoc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            // Delete all versions first
            const versionsRef = collection(this.db, 'users', this.userId, 'essays', essayId, 'versions');
            const versionsSnapshot = await getDocs(versionsRef);

            const deletePromises = [];
            versionsSnapshot.forEach(versionDoc => {
                deletePromises.push(deleteDoc(versionDoc.ref));
            });

            await Promise.all(deletePromises);

            // Delete main essay
            const essayRef = doc(this.db, 'users', this.userId, 'essays', essayId);
            await deleteDoc(essayRef);

            // Clear if it was current essay
            if (this.currentEssayId === essayId) {
                this.currentEssayId = null;
                this.currentEssay = null;
                document.getElementById('essayTitle').value = '';
                document.getElementById('essayTextarea').value = '';
                document.getElementById('essayPrompt').value = '';
                document.getElementById('targetColleges').value = '';
            }

            this.showMessage('success', 'Essay deleted successfully');
            await this.loadEssays();

        } catch (error) {
            console.error('Error deleting essay:', error);
            this.showMessage('error', 'Failed to delete essay');
        }
    }

    /**
     * Analyze essay with AI
     */
    async analyzeEssay() {
        const content = document.getElementById('essayTextarea').value.trim();
        const prompt = document.getElementById('essayPrompt').value.trim();
        const colleges = document.getElementById('targetColleges').value.trim().split(',').map(c => c.trim()).filter(c => c);

        if (!content) {
            this.showMessage('error', 'Please write your essay before analyzing');
            return;
        }

        const analyzeBtn = document.querySelector('button[onclick*="analyzeEssay"]');
        if (!analyzeBtn) return;

        try {
            // Show loading
            const originalHTML = analyzeBtn.innerHTML;
            analyzeBtn.innerHTML = '<div class="spinner"></div> Analyzing...';
            analyzeBtn.disabled = true;

            // Call API
            const response = await fetch('/api/essay-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    essay: content,
                    colleges,
                    userProfile: this.userData,
                    prompt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze essay');
            }

            const result = await response.json();

            // Store analysis
            this.analysisResult = result;

            // Display results
            this.displayAnalysisResults(result);

            // Apply highlights (non-destructive)
            this.applyHighlightsOverlay(result.highlights || []);

            this.showMessage('success', 'Essay analysis complete!');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage('error', 'Failed to analyze essay: ' + error.message);
        } finally {
            // Restore button
            const analyzeBtn = document.querySelector('button[onclick*="analyzeEssay"]');
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Essay';
                analyzeBtn.disabled = false;
            }
        }
    }

    /**
     * Display analysis results
     */
    displayAnalysisResults(result) {
        const resultsDiv = document.getElementById('analysisResults');
        if (!resultsDiv) return;

        // Display highlights feedback
        const highlightsFeedback = document.getElementById('highlightsFeedback');
        if (highlightsFeedback) {
            highlightsFeedback.innerHTML = '';

            if (result.highlights && result.highlights.length > 0) {
                result.highlights.forEach((highlight, index) => {
                    const feedbackCard = this.createFeedbackCard(highlight, index);
                    highlightsFeedback.appendChild(feedbackCard);
                });
            } else {
                highlightsFeedback.innerHTML = '<p class="no-highlights">No specific highlights found. See overall feedback below.</p>';
            }
        }

        // Display overall feedback
        document.getElementById('overallFeedback').textContent = result.overallFeedback || 'No overall feedback available.';
        document.getElementById('collegeAdvice').textContent = result.collegeSpecificAdvice || 'Add target colleges for specific advice.';

        // Display strengths
        const strengthsList = document.getElementById('strengthsList');
        if (strengthsList) {
            strengthsList.innerHTML = '';
            (result.strengthsToLeanInto || []).forEach(strength => {
                const li = document.createElement('li');
                li.textContent = strength;
                strengthsList.appendChild(li);
            });
        }

        // Display improvements
        const improvementsList = document.getElementById('improvementsList');
        if (improvementsList) {
            improvementsList.innerHTML = '';
            (result.areasToImprove || []).forEach(area => {
                const li = document.createElement('li');
                li.textContent = area;
                improvementsList.appendChild(li);
            });
        }

        // Display next steps
        const nextStepsList = document.getElementById('nextStepsList');
        if (nextStepsList) {
            nextStepsList.innerHTML = '';
            (result.nextSteps || []).forEach(step => {
                const li = document.createElement('li');
                li.textContent = step;
                nextStepsList.appendChild(li);
            });
        }

        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Create feedback card for highlight
     */
    createFeedbackCard(highlight, index) {
        const card = document.createElement('div');
        card.className = `highlight-feedback-card highlight-${highlight.type}`;
        card.dataset.highlightIndex = index;

        const categoryNames = {
            'cliche': 'Cliché',
            'weak_verb': 'Weak Verb',
            'vague': 'Vague Statement',
            'show_dont_tell': 'Show, Don\'t Tell',
            'grammar': 'Grammar',
            'unclear': 'Unclear',
            'strength': 'Strength'
        };
        const categoryDisplay = categoryNames[highlight.category] || highlight.category || 'Feedback';

        const icons = {
            'red': 'fas fa-exclamation-triangle',
            'yellow': 'fas fa-exclamation-circle',
            'green': 'fas fa-check-circle'
        };
        const icon = icons[highlight.type] || 'fas fa-info-circle';

        card.innerHTML = `
            <div class="feedback-card-header">
                <div class="feedback-card-title">
                    <i class="${icon}"></i>
                    <span class="feedback-number">#${index + 1}</span>
                    <span class="feedback-category">${categoryDisplay}</span>
                </div>
                <span class="feedback-type-badge ${highlight.type}">${highlight.type.toUpperCase()}</span>
            </div>
            <div class="feedback-card-text">
                <strong>Highlighted text:</strong> "${highlight.text}"
            </div>
            <div class="feedback-card-section">
                <div class="feedback-label"><i class="fas fa-question-circle"></i> Why this is highlighted:</div>
                <div class="feedback-text">${highlight.why || highlight.feedback || 'See overall feedback for details.'}</div>
            </div>
            <div class="feedback-card-section">
                <div class="feedback-label"><i class="fas fa-wrench"></i> How to improve:</div>
                <div class="feedback-text">${highlight.how || 'Consider revising this section based on the why explanation above.'}</div>
            </div>
            ${highlight.suggestion ? `
            <div class="feedback-card-section suggestion">
                <div class="feedback-label"><i class="fas fa-lightbulb"></i> Suggestion:</div>
                <div class="feedback-text">${highlight.suggestion}</div>
            </div>
            ` : ''}
        `;

        return card;
    }

    /**
     * Apply highlights overlay (non-destructive)
     */
    applyHighlightsOverlay(highlights) {
        // Remove existing overlay if any
        const existingOverlay = document.querySelector('.highlights-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const textarea = document.getElementById('essayTextarea');
        if (!textarea || highlights.length === 0) return;

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.className = 'highlights-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: transparent;
            overflow: hidden;
        `;

        // Create highlighted version
        let text = textarea.value;
        let htmlText = '';
        let lastIndex = 0;

        // Sort highlights by start index
        highlights.sort((a, b) => a.startIndex - b.startIndex);

        highlights.forEach((highlight, idx) => {
            // Add text before highlight
            htmlText += this.escapeHtml(text.substring(lastIndex, highlight.startIndex));

            // Add highlighted text
            htmlText += `<span class="highlight-${highlight.type}" data-highlight-index="${idx}" style="background-color: ${this.getHighlightColor(highlight.type)}; color: var(--text-primary); cursor: help;" title="Click for details">${this.escapeHtml(highlight.text)}</span>`;

            lastIndex = highlight.endIndex;
        });

        // Add remaining text
        htmlText += this.escapeHtml(text.substring(lastIndex));

        overlay.innerHTML = htmlText;

        // Position overlay relative to textarea
        const editorContainer = textarea.parentElement;
        editorContainer.style.position = 'relative';
        editorContainer.appendChild(overlay);

        // Add click handlers to highlights
        overlay.querySelectorAll('[data-highlight-index]').forEach(highlightEl => {
            highlightEl.style.pointerEvents = 'auto';
            highlightEl.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.highlightIndex);
                this.scrollToFeedbackCard(index);
            });
        });
    }

    /**
     * Get highlight color
     */
    getHighlightColor(type) {
        const colors = {
            'red': 'rgba(239, 68, 68, 0.25)',
            'yellow': 'rgba(245, 158, 11, 0.25)',
            'green': 'rgba(16, 185, 129, 0.25)'
        };
        return colors[type] || 'rgba(160, 123, 204, 0.25)';
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Scroll to feedback card
     */
    scrollToFeedbackCard(index) {
        const feedbackCards = document.querySelectorAll('.highlight-feedback-card');
        if (feedbackCards[index]) {
            feedbackCards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add flash animation
            feedbackCards[index].style.animation = 'flash 1s ease-in-out';
            setTimeout(() => {
                feedbackCards[index].style.animation = '';
            }, 1000);
        }
    }

    /**
     * Update word count
     */
    updateWordCount() {
        const textarea = document.getElementById('essayTextarea');
        if (!textarea) return;

        const text = textarea.value;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const charCount = text.length;

        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');

        if (wordCountEl) wordCountEl.textContent = wordCount;
        if (charCountEl) charCountEl.textContent = charCount;
    }

    /**
     * Setup auto-save
     */
    setupAutoSave() {
        const textarea = document.getElementById('essayTextarea');
        if (!textarea) return;

        textarea.addEventListener('input', () => {
            this.updateWordCount();
            this.saveDraft();
        });
    }

    /**
     * Save draft to localStorage
     */
    saveDraft() {
        const title = document.getElementById('essayTitle').value;
        const content = document.getElementById('essayTextarea').value;
        const prompt = document.getElementById('essayPrompt').value;
        const colleges = document.getElementById('targetColleges').value;

        const draft = {
            title,
            content,
            prompt,
            colleges,
            timestamp: Date.now()
        };

        localStorage.setItem(`essay-draft-${this.userId}`, JSON.stringify(draft));
    }

    /**
     * Load draft from localStorage
     */
    loadDraft() {
        const draftKey = `essay-draft-${this.userId}`;
        const draftStr = localStorage.getItem(draftKey);

        if (draftStr) {
            try {
                const draft = JSON.parse(draftStr);

                // Only load if fields are empty
                if (!document.getElementById('essayTextarea').value) {
                    document.getElementById('essayTitle').value = draft.title || '';
                    document.getElementById('essayTextarea').value = draft.content || '';
                    document.getElementById('essayPrompt').value = draft.prompt || '';
                    document.getElementById('targetColleges').value = draft.colleges || '';

                    this.updateWordCount();

                    if (draft.content) {
                        this.showMessage('info', 'Draft restored from auto-save');
                    }
                }
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    /**
     * Show message
     */
    showMessage(type, text) {
        const messageEl = document.getElementById(type + 'Message');
        const textEl = document.getElementById(type + 'Text');

        if (messageEl && textEl) {
            textEl.textContent = text;
            messageEl.classList.add('show');

            setTimeout(() => {
                messageEl.classList.remove('show');
            }, 5000);
        }
    }
}

window.EssayManager = EssayManager;
