/**
 * College Climb - Application Initialization
 * This file initializes all AI systems and manages global state
 */

// Global application state
window.CollegeClimb = {
    initialized: false,
    aiEngine: null,
    userProfile: null,
    testPrepManager: null,
    collegeDiscovery: null,
    timelineGenerator: null,
    currentUser: null,
    db: null
};

/**
 * Initialize the College Climb platform with user data
 */
async function initializeCollegeClimb(auth, db, user) {
    if (window.CollegeClimb.initialized) {
        console.log('✅ College Climb already initialized');
        return window.CollegeClimb;
    }

    console.log('🚀 Initializing College Climb Platform...');

    try {
        window.CollegeClimb.db = db;
        window.CollegeClimb.currentUser = user;

        // Initialize AI Engine
        console.log('📊 Initializing AI Engine...');
        const aiEngine = new window.AIEngine(db, user.uid);
        await aiEngine.initialize();
        window.CollegeClimb.aiEngine = aiEngine;
        console.log('✅ AI Engine ready');

        // Initialize User Profile Manager
        console.log('👤 Loading user profile...');
        const profileManager = new window.UserProfileManager(db, user.uid);
        await profileManager.loadProfile();
        window.CollegeClimb.userProfile = profileManager;
        console.log('✅ User profile loaded');

        // Initialize Test Prep Manager
        console.log('📝 Initializing Test Prep...');
        window.CollegeClimb.testPrepManager = new window.TestPrepManager(aiEngine);
        console.log('✅ Test Prep ready');

        // Initialize College Discovery
        console.log('🎓 Initializing College Discovery...');
        window.CollegeClimb.collegeDiscovery = new window.CollegeDiscovery(aiEngine, profileManager);
        console.log('✅ College Discovery ready');

        // Initialize Timeline Generator
        console.log('📅 Initializing Timeline...');
        const applications = await aiEngine.getUserApplications();
        window.CollegeClimb.timelineGenerator = new window.TimelineGenerator(aiEngine, applications);
        console.log('✅ Timeline ready');

        window.CollegeClimb.initialized = true;
        console.log('🎉 College Climb Platform initialized successfully!');

        // Emit ready event
        window.dispatchEvent(new CustomEvent('collegeclimb:ready', {
            detail: window.CollegeClimb
        }));

        return window.CollegeClimb;
    } catch (error) {
        console.error('❌ Failed to initialize College Climb:', error);
        throw error;
    }
}

/**
 * Get personalized dashboard data
 */
async function getDashboardData() {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    const { aiEngine, userProfile, timelineGenerator } = window.CollegeClimb;

    try {
        // Fetch all dashboard data in parallel
        const [insights, timeline, applications, essays] = await Promise.all([
            aiEngine.getPersonalizedInsights(),
            timelineGenerator.getUpcomingTasks(7),
            aiEngine.getUserApplications(),
            getEssayCount()
        ]);

        return {
            insights,
            timeline,
            stats: {
                applications: applications.length,
                essays: essays,
                upcomingDeadlines: timeline.length,
                profile: userProfile.getProfile()
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

/**
 * Get essay count from Firestore
 */
async function getEssayCount() {
    const { db, currentUser } = window.CollegeClimb;
    const essaysQuery = query(
        collection(db, 'essays'),
        where('userId', '==', currentUser.uid)
    );
    const snapshot = await getDocs(essaysQuery);
    return snapshot.size;
}

/**
 * Update user profile data
 */
async function updateUserProfile(updates) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    await window.CollegeClimb.userProfile.updateProfile(updates);
    console.log('✅ Profile updated');
}

/**
 * Analyze essay with AI
 */
async function analyzeEssay(essayText, essayType, colleges = [], prompt = '') {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    const { aiEngine, userProfile } = window.CollegeClimb;
    
    // Include user profile in analysis
    const profile = userProfile.getProfile();
    
    try {
        const response = await fetch('/api/essay-analyze.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                essay: essayText,
                type: essayType,
                colleges,
                prompt,
                userProfile: profile,
                userId: window.CollegeClimb.currentUser.uid
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze essay');
        }

        const analysis = await response.json();
        
        // Update learning data
        await aiEngine.updateEssayLearning(essayText, analysis);
        
        return analysis;
    } catch (error) {
        console.error('Essay analysis error:', error);
        throw error;
    }
}

/**
 * Get essay chat response
 */
async function getEssayChat(message, essayContext) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.aiEngine.getEssayChat(message, essayContext);
}

/**
 * Find college matches
 */
async function findCollegeMatches() {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.collegeDiscovery.findMatches();
}

/**
 * Generate diagnostic test
 */
async function generateDiagnosticTest(testType) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.testPrepManager.generateDiagnosticTest(testType);
}

/**
 * Generate practice questions
 */
async function generatePracticeQuestions(testType, subject, difficulty, count) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.testPrepManager.generatePracticeQuestions(
        testType,
        subject,
        difficulty,
        count
    );
}

/**
 * Submit test results
 */
async function submitTestResults(testResults) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.testPrepManager.submitTest(testResults);
}

/**
 * Get personalized timeline
 */
async function getPersonalizedTimeline() {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    return await window.CollegeClimb.timelineGenerator.generateTimeline();
}

/**
 * Save questionnaire data
 */
async function saveQuestionnaireData(answers) {
    if (!window.CollegeClimb.initialized) {
        throw new Error('College Climb not initialized');
    }

    await window.CollegeClimb.userProfile.saveQuestionnaireData(answers);
    console.log('✅ Questionnaire data saved');
}

// Export functions to global scope
window.initializeCollegeClimb = initializeCollegeClimb;
window.getDashboardData = getDashboardData;
window.updateUserProfile = updateUserProfile;
window.analyzeEssay = analyzeEssay;
window.getEssayChat = getEssayChat;
window.findCollegeMatches = findCollegeMatches;
window.generateDiagnosticTest = generateDiagnosticTest;
window.generatePracticeQuestions = generatePracticeQuestions;
window.submitTestResults = submitTestResults;
window.getPersonalizedTimeline = getPersonalizedTimeline;
window.saveQuestionnaireData = saveQuestionnaireData;

console.log('📦 College Climb initialization module loaded');
