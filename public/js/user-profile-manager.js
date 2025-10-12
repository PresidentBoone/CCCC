/**
 * User Profile Manager
 * Manages comprehensive user data for personalization
 */

class UserProfileManager {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.profile = null;
    }

    async loadProfile() {
        const userDoc = await getDoc(doc(this.db, 'users', this.userId));
        if (userDoc.exists()) {
            this.profile = userDoc.data();
            return this.profile;
        }
        return null;
    }

    async updateProfile(updates) {
        await updateDoc(doc(this.db, 'users', this.userId), {
            ...updates,
            lastUpdated: serverTimestamp()
        });
        this.profile = { ...this.profile, ...updates };
    }

    async saveQuestionnaireData(answers) {
        const profileData = this.processQuestionnaireAnswers(answers);
        await this.updateProfile({
            questionnaireCompleted: true,
            questionnaireData: answers,
            ...profileData
        });
    }

    processQuestionnaireAnswers(answers) {
        // Process answers into structured profile data
        return {
            academicInterests: answers.academicInterests || [],
            extracurriculars: answers.extracurriculars || [],
            careerGoals: answers.careerGoals || [],
            intendedMajor: answers.intendedMajor || '',
            gpa: answers.gpa || null,
            satScore: answers.satScore || null,
            actScore: answers.actScore || null,
            preferredLocations: answers.preferredLocations || [],
            collegeSize: answers.collegeSize || '',
            collegeType: answers.collegeType || ''
        };
    }

    getProfile() {
        return this.profile;
    }
}

window.UserProfileManager = UserProfileManager;
