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

        // Load essay deadlines
        await this.loadEssayDeadlines();

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
            const { doc, setDoc, serverTimestamp, collection, addDoc, getDocs, query } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const title = document.getElementById('essayTitle').value.trim() || 'Untitled Essay';
            const content = document.getElementById('essayTextarea').value.trim();
            const prompt = document.getElementById('essayPrompt').value.trim();
            const colleges = document.getElementById('targetColleges').value.trim().split(',').map(c => c.trim()).filter(c => c);

            if (!content) {
                this.showMessage('error', 'Essay cannot be empty');
                return;
            }

            // TIER ENFORCEMENT: Check if creating a new essay (not editing existing)
            if (!this.currentEssayId && window.tierEnforcement) {
                // Count existing essays
                const essaysRef = collection(this.db, 'users', this.userId, 'essays');
                const q = query(essaysRef);
                const snapshot = await getDocs(q);
                const currentEssayCount = snapshot.size;

                // Check limit before creating new essay
                const limitCheck = await window.tierEnforcement.checkLimit('maxEssays', currentEssayCount);

                if (!limitCheck.allowed) {
                    // Show upgrade prompt
                    window.tierEnforcement.showLimitReached('maxEssays', limitCheck);
                    return; // Block essay creation
                }

                console.log(`✅ Essay limit check passed: ${currentEssayCount + 1}/${limitCheck.limit}`);
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

            // Refresh deadlines (in case target colleges changed)
            await this.refreshDeadlines();

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
     * Export essay to PDF with professional formatting
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

            // Load jsPDF library dynamically
            if (!window.jspdf) {
                this.showMessage('info', 'Loading PDF generator...');
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    this.generatePDF(essay);
                };
                script.onerror = () => {
                    console.warn('PDF library failed to load, using text export');
                    this.exportAsText(essay);
                };
                document.head.appendChild(script);
            } else {
                this.generatePDF(essay);
            }

        } catch (error) {
            console.error('Error exporting essay:', error);
            this.showMessage('error', 'Failed to export essay');
        }
    }

    /**
     * Generate PDF with professional formatting
     */
    generatePDF(essay) {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            let y = margin;

            const checkPage = (space) => {
                if (y + space > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                    return true;
                }
                return false;
            };

            // Title
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(essay.title || 'Untitled Essay', pageWidth / 2, y, { align: 'center' });
            y += 12;

            // Metadata
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100);

            if (essay.targetColleges && essay.targetColleges.length > 0) {
                pdf.text(`Colleges: ${essay.targetColleges.join(', ')}`, margin, y);
                y += 5;
            }

            if (essay.prompt) {
                pdf.text('Prompt:', margin, y);
                y += 4;
                const promptLines = pdf.splitTextToSize(essay.prompt, maxWidth);
                pdf.text(promptLines, margin, y);
                y += (promptLines.length * 4) + 2;
            }

            pdf.text(`Words: ${essay.wordCount || 0} | ${new Date().toLocaleDateString()}`, margin, y);
            y += 8;

            // Line
            pdf.setDrawColor(160, 123, 204);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 6;

            // Content
            pdf.setFontSize(10);
            pdf.setTextColor(0);
            const lines = pdf.splitTextToSize(essay.content || '', maxWidth);
            lines.forEach(line => {
                checkPage(5);
                pdf.text(line, margin, y);
                y += 5;
            });

            // Feedback
            if (essay.analysis) {
                checkPage(15);
                y += 4;
                pdf.line(margin, y, pageWidth - margin, y);
                y += 6;

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(160, 123, 204);
                pdf.text('AI Feedback', margin, y);
                y += 7;

                pdf.setFontSize(9);
                pdf.setTextColor(0);

                if (essay.analysis.overallFeedback) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Overall:', margin, y);
                    y += 4;
                    pdf.setFont('helvetica', 'normal');
                    const fbLines = pdf.splitTextToSize(essay.analysis.overallFeedback, maxWidth);
                    fbLines.forEach(line => {
                        checkPage(4);
                        pdf.text(line, margin, y);
                        y += 4;
                    });
                    y += 2;
                }

                if (essay.analysis.strengthsToLeanInto?.length > 0) {
                    checkPage(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setTextColor(16, 185, 129);
                    pdf.text('Strengths:', margin, y);
                    y += 4;
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(0);
                    essay.analysis.strengthsToLeanInto.forEach(s => {
                        checkPage(4);
                        pdf.text(`• ${s}`, margin + 2, y);
                        y += 4;
                    });
                }
            }

            // Footer
            pdf.setFontSize(7);
            pdf.setTextColor(150);
            pdf.text('College Climb AI', pageWidth / 2, pageHeight - 8, { align: 'center' });

            pdf.save(`${essay.title || 'essay'}.pdf`);
            this.showMessage('success', 'PDF exported successfully!');

        } catch (error) {
            console.error('PDF generation error:', error);
            this.exportAsText(essay);
        }
    }

    /**
     * Fallback text export
     */
    exportAsText(essay) {
        let content = `${essay.title || 'Untitled'}\n${'='.repeat(50)}\n\n`;
        if (essay.prompt) content += `Prompt: ${essay.prompt}\n\n`;
        if (essay.targetColleges?.length) content += `Colleges: ${essay.targetColleges.join(', ')}\n\n`;
        content += `${'='.repeat(50)}\n\n${essay.content || ''}\n\n`;
        content += `Words: ${essay.wordCount || 0}\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${essay.title || 'essay'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage('success', 'Text file exported');
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

            // Show skeleton screens while loading
            this.showSkeletonLoading();

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

            // Display results (replaces skeleton)
            this.displayAnalysisResults(result);

            // Apply highlights (non-destructive)
            this.applyHighlightsOverlay(result.highlights || []);

            this.showMessage('success', 'Essay analysis complete!');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage('error', 'Failed to analyze essay: ' + error.message);
            // Hide skeleton on error
            this.hideSkeletonLoading();
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
                <button class="copy-suggestion-btn" onclick="window.essayManager.copySuggestion('${highlight.suggestion.replace(/'/g, "\\'")}', ${index})" title="Copy suggestion to clipboard">
                    <i class="fas fa-copy"></i> Copy Suggestion
                </button>
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
     * Get highlight color with improved contrast
     */
    getHighlightColor(type) {
        const colors = {
            'red': 'rgba(239, 68, 68, 0.3)',
            'yellow': 'rgba(245, 158, 11, 0.3)',
            'green': 'rgba(16, 185, 129, 0.3)'
        };
        return colors[type] || 'rgba(160, 123, 204, 0.3)';
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

    /**
     * Load essay deadlines from essays with target colleges
     */
    async loadEssayDeadlines() {
        const deadlinesContainer = document.getElementById('essayDeadlines');
        if (!deadlinesContainer) return;

        try {
            // Get all essays with target colleges
            if (!this.allEssays || this.allEssays.length === 0) {
                this.displayDeadlinesEmpty();
                return;
            }

            // Generate deadlines from essays with target colleges
            const deadlines = this.generateDeadlinesFromEssays(this.allEssays);

            if (deadlines.length === 0) {
                this.displayDeadlinesEmpty();
                return;
            }

            // Sort by date (soonest first)
            deadlines.sort((a, b) => a.date - b.date);

            // Display deadlines
            this.displayDeadlines(deadlines);

        } catch (error) {
            console.error('Error loading deadlines:', error);
            deadlinesContainer.innerHTML = `
                <div class="deadlines-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load deadlines</p>
                </div>
            `;
        }
    }

    /**
     * Generate deadlines from essays with target colleges
     */
    generateDeadlinesFromEssays(essays) {
        const deadlines = [];
        const now = new Date();

        // Common college application deadlines
        const deadlineTemplates = {
            'ED': { month: 10, day: 15, name: 'Early Decision' },     // Nov 1
            'EA': { month: 10, day: 15, name: 'Early Action' },       // Nov 1
            'RD': { month: 0, day: 1, name: 'Regular Decision' },     // Jan 1
            'Priority': { month: 11, day: 1, name: 'Priority' },      // Dec 1
            'Rolling': { month: 2, day: 1, name: 'Rolling' }          // Mar 1
        };

        essays.forEach(essay => {
            if (!essay.targetColleges || essay.targetColleges.length === 0) return;

            essay.targetColleges.forEach(college => {
                // Determine deadline type (default to RD)
                const deadlineType = essay.applicationType || 'RD';
                const template = deadlineTemplates[deadlineType] || deadlineTemplates['RD'];

                // Create deadline date (assume next occurrence of the deadline)
                const currentYear = now.getFullYear();
                const nextYear = now.getMonth() > template.month ? currentYear + 1 : currentYear;
                const deadlineDate = new Date(nextYear, template.month, template.day);

                // Calculate progress based on essay status and content
                const progress = this.calculateEssayProgress(essay);

                deadlines.push({
                    id: `${essay.id}-${college}`,
                    essayId: essay.id,
                    title: essay.title || 'Untitled Essay',
                    college: college,
                    date: deadlineDate,
                    type: deadlineType,
                    typeName: template.name,
                    progress: progress,
                    status: essay.status || 'draft'
                });
            });
        });

        return deadlines;
    }

    /**
     * Calculate essay progress (0-100%)
     */
    calculateEssayProgress(essay) {
        let progress = 0;

        // Has content
        if (essay.content && essay.content.trim().length > 0) {
            progress += 25;
        }

        // Has title
        if (essay.title && essay.title.trim().length > 0) {
            progress += 10;
        }

        // Has been analyzed
        if (essay.analysis) {
            progress += 25;
        }

        // Word count reasonable
        const wordCount = essay.wordCount || 0;
        if (wordCount >= 250) progress += 20;
        if (wordCount >= 500) progress += 10;

        // Status based
        if (essay.status === 'reviewed') progress = Math.max(progress, 60);
        if (essay.status === 'final') progress = Math.max(progress, 85);
        if (essay.status === 'submitted') progress = 100;

        return Math.min(progress, 100);
    }

    /**
     * Display deadlines in sidebar
     */
    displayDeadlines(deadlines) {
        const container = document.getElementById('essayDeadlines');
        if (!container) return;

        const now = new Date();

        const html = deadlines.slice(0, 5).map(deadline => {
            const daysUntil = Math.ceil((deadline.date - now) / (1000 * 60 * 60 * 24));
            let urgency = 'upcoming';
            let dateText = '';

            if (daysUntil < 0) {
                urgency = 'urgent';
                dateText = `${Math.abs(daysUntil)}d overdue`;
            } else if (daysUntil === 0) {
                urgency = 'urgent';
                dateText = 'Today!';
            } else if (daysUntil <= 7) {
                urgency = 'urgent';
                dateText = `${daysUntil}d left`;
            } else if (daysUntil <= 30) {
                urgency = 'soon';
                dateText = `${daysUntil}d left`;
            } else {
                dateText = deadline.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            const progressClass = deadline.progress < 30 ? 'low' : deadline.progress < 70 ? 'medium' : 'high';

            return `
                <div class="deadline-item ${urgency}" onclick="window.essayManager.loadEssay('${deadline.essayId}')">
                    <div class="deadline-header">
                        <div class="deadline-title">${this.escapeHtml(deadline.title)}</div>
                        <div class="deadline-date ${urgency}">${dateText}</div>
                    </div>
                    <div class="deadline-college">
                        <i class="fas fa-university"></i> ${this.escapeHtml(deadline.college)} (${deadline.typeName})
                    </div>
                    <div class="deadline-progress">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${deadline.progress}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar ${progressClass}" style="width: ${deadline.progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || this.getDeadlinesEmptyHTML();
    }

    /**
     * Display empty state for deadlines
     */
    displayDeadlinesEmpty() {
        const container = document.getElementById('essayDeadlines');
        if (!container) return;
        container.innerHTML = this.getDeadlinesEmptyHTML();
    }

    /**
     * Get empty deadlines HTML
     */
    getDeadlinesEmptyHTML() {
        return `
            <div class="deadlines-empty">
                <i class="fas fa-calendar-check"></i>
                <p><strong>No deadlines yet</strong></p>
                <p>Add target colleges to your essays to see deadlines here!</p>
            </div>
        `;
    }

    /**
     * Update deadlines when essays change
     */
    async refreshDeadlines() {
        await this.loadEssayDeadlines();
    }

    /**
     * Copy suggestion to clipboard
     * @param {string} suggestion - The suggestion text to copy
     * @param {number} index - Index of the highlight for visual feedback
     */
    async copySuggestion(suggestion, index) {
        try {
            // Use modern clipboard API
            await navigator.clipboard.writeText(suggestion);

            // Show success toast
            this.showToast(`✅ Copied! Paste into your essay.`, 'success');

            // Add visual feedback to the button
            const buttons = document.querySelectorAll(`.feedback-card-header [data-highlight-index="${index}"] .copy-suggestion-btn, .highlight-feedback-card[data-highlight-index="${index}"] .copy-suggestion-btn`);
            buttons.forEach(btn => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.style.background = '#10b981';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            });

        } catch (error) {
            console.error('Failed to copy suggestion:', error);

            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = suggestion;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
                this.showToast(`✅ Copied! Paste into your essay.`, 'success');
            } catch (err) {
                this.showToast('❌ Failed to copy. Please copy manually.', 'error');
            }

            document.body.removeChild(textArea);
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info)
     */
    showToast(message, type = 'info') {
        // Check if toast container exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            min-width: 250px;
        `;
        toast.textContent = message;

        // Add animation keyframes if not already added
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Show skeleton loading cards while analysis is in progress
     */
    showSkeletonLoading() {
        const highlightsFeedback = document.getElementById('highlightsFeedback');
        const resultsDiv = document.getElementById('analysisResults');

        if (!highlightsFeedback || !resultsDiv) return;

        // Make results section visible
        resultsDiv.style.display = 'block';

        // Clear existing content
        highlightsFeedback.innerHTML = '';

        // Create 3 skeleton cards (typical analysis returns 3-5 highlights)
        for (let i = 0; i < 3; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'highlight-feedback-card skeleton-card';
            skeletonCard.innerHTML = `
                <div class="skeleton-header">
                    <div class="skeleton-badge"></div>
                    <div class="skeleton-line skeleton-line-title"></div>
                </div>
                <div class="skeleton-body">
                    <div class="skeleton-line skeleton-line-short"></div>
                    <div class="skeleton-line skeleton-line-medium"></div>
                    <div class="skeleton-line skeleton-line-long"></div>
                    <div class="skeleton-line skeleton-line-medium"></div>
                </div>
                <div class="skeleton-footer">
                    <div class="skeleton-button"></div>
                </div>
            `;
            highlightsFeedback.appendChild(skeletonCard);
        }

        // Add skeleton to other sections (with safety checks)
        const overallFeedback = document.getElementById('overallFeedback');
        if (overallFeedback) {
            overallFeedback.innerHTML = `
                <div class="skeleton-line skeleton-line-long"></div>
                <div class="skeleton-line skeleton-line-medium"></div>
                <div class="skeleton-line skeleton-line-long"></div>
            `;
        }

        const collegeAdvice = document.getElementById('collegeAdvice');
        if (collegeAdvice) {
            collegeAdvice.innerHTML = `
                <div class="skeleton-line skeleton-line-medium"></div>
                <div class="skeleton-line skeleton-line-short"></div>
            `;
        }
    }

    /**
     * Hide skeleton loading (called on error)
     */
    hideSkeletonLoading() {
        const highlightsFeedback = document.getElementById('highlightsFeedback');
        if (highlightsFeedback) {
            highlightsFeedback.innerHTML = '';
        }
    }
}

window.EssayManager = EssayManager;
