/**
 * Share Success Feature
 * Allow users to share their college acceptance stories
 */

class ShareSuccess {
    constructor(db, userId, userData) {
        this.db = db;
        this.userId = userId;
        this.userData = userData;
        this.shareModal = null;
    }

    initialize() {
        console.log('📤 Initializing Share Success Feature...');

        // Create share modal
        this.createShareModal();

        // Add share buttons to accepted applications
        this.addShareButtons();

        // Add styles
        this.addStyles();

        console.log('✅ Share Success initialized');
    }

    createShareModal() {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.id = 'shareSuccessModal';
        modal.innerHTML = `
            <div class="share-modal-overlay" onclick="window.shareSuccess.closeModal()"></div>
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>🎉 Share Your Success!</h3>
                    <button class="share-modal-close" onclick="window.shareSuccess.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="share-modal-body" id="shareModalBody">
                    <!-- Content will be populated dynamically -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.shareModal = modal;
    }

    async openShareModal(applicationId) {
        try {
            // Get application details
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const appRef = doc(this.db, 'users', this.userId, 'applications', applicationId);
            const appDoc = await getDoc(appRef);

            if (!appDoc.exists()) {
                if (window.showToast) {
                    window.showToast('Application not found', 'error');
                }
                return;
            }

            const appData = appDoc.data();

            // Populate modal
            const modalBody = document.getElementById('shareModalBody');
            modalBody.innerHTML = this.renderShareForm(appData, applicationId);

            // Show modal
            this.shareModal.classList.add('open');

        } catch (error) {
            console.error('Error opening share modal:', error);
            if (window.showToast) {
                window.showToast('Failed to load application', 'error');
            }
        }
    }

    renderShareForm(appData, applicationId) {
        const userName = this.userData.displayName || this.userData.name || 'Anonymous';
        const userGPA = this.userData.gpa || 'N/A';
        const userSAT = this.userData.satScore || this.userData.actScore || 'N/A';

        return `
            <div class="share-form">
                <div class="share-preview">
                    <div class="share-preview-header">Preview</div>
                    <div class="share-preview-content">
                        <div class="success-card">
                            <div class="success-card-header">
                                <span class="success-emoji">🎓</span>
                                <h4>${appData.schoolName}</h4>
                            </div>
                            <div class="success-card-body">
                                <div class="success-stats">
                                    <div class="stat">
                                        <span class="stat-label">GPA</span>
                                        <span class="stat-value">${userGPA}</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Test Score</span>
                                        <span class="stat-value">${userSAT}</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Major</span>
                                        <span class="stat-value">${this.userData.intendedMajor || 'Undecided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="share-options">
                    <h4>Share your acceptance to inspire others!</h4>
                    <p class="share-description">
                        Help future students by sharing your success story. Your stats will be anonymized unless you choose to include your name.
                    </p>

                    <div class="share-option-group">
                        <label class="share-checkbox">
                            <input type="checkbox" id="shareIncludeName" checked>
                            <span>Include my first name (${userName.split(' ')[0]})</span>
                        </label>
                        <label class="share-checkbox">
                            <input type="checkbox" id="shareIncludeStats" checked>
                            <span>Include my stats (GPA, test scores)</span>
                        </label>
                        <label class="share-checkbox">
                            <input type="checkbox" id="shareIncludeMajor" checked>
                            <span>Include my intended major</span>
                        </label>
                    </div>

                    <div class="share-message-group">
                        <label for="shareMessage">Add a message (optional)</label>
                        <textarea
                            id="shareMessage"
                            placeholder="Share your tips, advice, or words of encouragement..."
                            rows="4"
                            maxlength="500"
                        ></textarea>
                        <div class="character-count">
                            <span id="messageCharCount">0</span>/500
                        </div>
                    </div>

                    <div class="share-buttons">
                        <button class="btn btn-secondary" onclick="window.shareSuccess.closeModal()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="window.shareSuccess.submitShare('${applicationId}')">
                            <i class="fas fa-share"></i>
                            Share My Success
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async submitShare(applicationId) {
        try {
            // Get form values
            const includeName = document.getElementById('shareIncludeName')?.checked || false;
            const includeStats = document.getElementById('shareIncludeStats')?.checked || false;
            const includeMajor = document.getElementById('shareIncludeMajor')?.checked || false;
            const message = document.getElementById('shareMessage')?.value || '';

            // Get application data
            const { doc, getDoc, collection, addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

            const appRef = doc(this.db, 'users', this.userId, 'applications', applicationId);
            const appDoc = await getDoc(appRef);

            if (!appDoc.exists()) {
                throw new Error('Application not found');
            }

            const appData = appDoc.data();

            // Create success story object
            const successStory = {
                schoolName: appData.schoolName,
                acceptanceType: appData.type || 'Regular Decision',
                status: 'accepted',
                createdAt: Timestamp.now(),
                userId: this.userId,
                verified: false // Will be verified by admin
            };

            // Add optional fields
            if (includeName) {
                const userName = this.userData.displayName || this.userData.name || 'Anonymous';
                successStory.studentName = userName.split(' ')[0]; // First name only
            }

            if (includeStats) {
                if (this.userData.gpa) successStory.gpa = this.userData.gpa;
                if (this.userData.satScore) successStory.satScore = this.userData.satScore;
                if (this.userData.actScore) successStory.actScore = this.userData.actScore;
            }

            if (includeMajor && this.userData.intendedMajor) {
                successStory.major = this.userData.intendedMajor;
            }

            if (message.trim()) {
                successStory.message = message.trim();
            }

            // Save to public success stories collection
            const successStoriesRef = collection(this.db, 'successStories');
            await addDoc(successStoriesRef, successStory);

            // Update application to mark as shared
            const { updateDoc } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
            await updateDoc(appRef, {
                shared: true,
                sharedAt: Timestamp.now()
            });

            // Close modal
            this.closeModal();

            // Show success message
            if (window.showToast) {
                window.showToast('🎉 Success story shared! Thank you for inspiring others!', 'success');
            }

            // Check if this unlocks an achievement
            if (window.gamification) {
                await window.gamification.loadUserStats();
                await window.gamification.checkAchievements();
            }

        } catch (error) {
            console.error('Error sharing success:', error);
            if (window.showToast) {
                window.showToast('Failed to share success story. Please try again.', 'error');
            }
        }
    }

    closeModal() {
        if (this.shareModal) {
            this.shareModal.classList.remove('open');
        }
    }

    addShareButtons() {
        // This will add share buttons to accepted applications
        // Called after applications are loaded
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-success-btn')) {
                const btn = e.target.closest('.share-success-btn');
                const appId = btn.dataset.appId;
                if (appId) {
                    this.openShareModal(appId);
                }
            }
        });
    }

    // Helper method to add share button to application cards
    static getShareButton(applicationId, applicationStatus) {
        if (applicationStatus !== 'accepted') return '';

        return `
            <button class="share-success-btn" data-app-id="${applicationId}" title="Share your success">
                <i class="fas fa-share-alt"></i>
                Share Success
            </button>
        `;
    }

    addStyles() {
        if (document.getElementById('share-success-styles')) return;

        const style = document.createElement('style');
        style.id = 'share-success-styles';
        style.textContent = `
            .share-success-btn {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            }

            .share-success-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }

            .share-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 15000;
                display: none;
                align-items: center;
                justify-content: center;
            }

            .share-modal.open {
                display: flex;
            }

            .share-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }

            .share-modal-content {
                position: relative;
                background: var(--surface-primary);
                border-radius: 16px;
                max-width: 700px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideUp 0.3s ease;
            }

            @keyframes modalSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .share-modal-header {
                padding: 20px 25px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--surface-secondary);
            }

            .share-modal-header h3 {
                margin: 0;
                font-size: 1.3rem;
                color: var(--text-primary);
            }

            .share-modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                transition: color 0.2s;
            }

            .share-modal-close:hover {
                color: var(--text-primary);
            }

            .share-modal-body {
                padding: 25px;
                overflow-y: auto;
                flex: 1;
            }

            .share-form {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }

            .share-preview {
                background: var(--surface-secondary);
                border-radius: 12px;
                padding: 15px;
            }

            .share-preview-header {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .success-card {
                background: var(--surface-primary);
                border-radius: 12px;
                padding: 15px;
                border: 2px solid #10b981;
            }

            .success-card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }

            .success-emoji {
                font-size: 2rem;
            }

            .success-card h4 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.1rem;
            }

            .success-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }

            .stat {
                text-align: center;
            }

            .stat-label {
                display: block;
                font-size: 0.75rem;
                color: var(--text-secondary);
                margin-bottom: 4px;
            }

            .stat-value {
                display: block;
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            .share-options h4 {
                color: var(--text-primary);
                margin-bottom: 10px;
            }

            .share-description {
                color: var(--text-secondary);
                font-size: 0.9rem;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .share-option-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }

            .share-checkbox {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                color: var(--text-primary);
                font-size: 0.95rem;
            }

            .share-checkbox input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            .share-message-group {
                margin-bottom: 20px;
            }

            .share-message-group label {
                display: block;
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 8px;
            }

            .share-message-group textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--surface-secondary);
                color: var(--text-primary);
                font-family: inherit;
                font-size: 0.95rem;
                resize: vertical;
                transition: border-color 0.2s;
            }

            .share-message-group textarea:focus {
                outline: none;
                border-color: var(--accent-color);
            }

            .character-count {
                text-align: right;
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-top: 5px;
            }

            .share-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            .share-buttons .btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .share-buttons .btn-primary {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
            }

            .share-buttons .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            }

            .share-buttons .btn-secondary {
                background: var(--surface-secondary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }

            .share-buttons .btn-secondary:hover {
                background: var(--surface-primary);
            }

            @media (max-width: 768px) {
                .share-modal-content {
                    width: 95%;
                    max-height: 95vh;
                }

                .success-stats {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }

                .share-buttons {
                    flex-direction: column;
                }

                .share-buttons .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;

        document.head.appendChild(style);

        // Add character counter listener
        document.addEventListener('input', (e) => {
            if (e.target.id === 'shareMessage') {
                const charCount = document.getElementById('messageCharCount');
                if (charCount) {
                    charCount.textContent = e.target.value.length;
                }
            }
        });
    }
}

window.ShareSuccess = ShareSuccess;
