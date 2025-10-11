// Timeline task templates for different college application components
class TimelineTemplates {
    static getTaskTemplates() {
        return {
            application: {
                id: 'app-submission',
                title: 'Submit Application',
                description: 'Complete and submit your college application',
                category: 'Application',
                estimatedHours: 4,
                priority: 'high',
                dependencies: ['essays', 'recommendations', 'transcripts'],
                tips: [
                    'Review all sections carefully before submitting',
                    'Save a copy of your completed application',
                    'Submit early to avoid technical issues'
                ]
            },
            
            commonApp: {
                id: 'common-app',
                title: 'Complete Common Application',
                description: 'Fill out the Common Application with your personal information, activities, and essays',
                category: 'Application',
                estimatedHours: 8,
                priority: 'high',
                subtasks: [
                    'Personal information and demographics',
                    'Family and education history',
                    'Testing and grades',
                    'Activities and honors',
                    'Common App essay (650 words)',
                    'Additional information section'
                ],
                tips: [
                    'Start early - this takes longer than expected',
                    'Have your transcript and test scores ready',
                    'Ask for help with the activities section'
                ]
            },

            supplements: {
                id: 'supplemental-essays',
                title: 'Write Supplemental Essays',
                description: 'Complete all school-specific supplemental essays',
                category: 'Essays',
                estimatedHours: 12,
                priority: 'high',
                tips: [
                    'Research each school thoroughly',
                    'Show genuine interest and fit',
                    'Connect your experiences to their programs'
                ]
            },

            recommendations: {
                id: 'recommendation-letters',
                title: 'Request Recommendation Letters',
                description: 'Ask teachers and counselors for recommendation letters',
                category: 'Recommendations',
                estimatedHours: 2,
                priority: 'high',
                subtasks: [
                    'Choose recommenders (2-3 teachers, 1 counselor)',
                    'Ask recommenders in person or via email',
                    'Provide resume and personal statement draft',
                    'Send thank you notes after submission'
                ],
                tips: [
                    'Ask teachers who know you well academically',
                    'Give recommenders at least 4-6 weeks notice',
                    'Provide a brag sheet or resume to help them write'
                ]
            },

            transcripts: {
                id: 'official-transcripts',
                title: 'Request Official Transcripts',
                description: 'Order official transcripts from your school',
                category: 'Documents',
                estimatedHours: 1,
                priority: 'medium',
                subtasks: [
                    'Contact school registrar or guidance office',
                    'Complete transcript request form',
                    'Pay any required fees',
                    'Verify transcripts were sent'
                ],
                tips: [
                    'Request transcripts early - processing takes time',
                    'Include all high schools attended',
                    'Check if your school sends electronically'
                ]
            },

            testing: {
                id: 'standardized-testing',
                title: 'Complete Standardized Testing',
                description: 'Take and submit SAT/ACT scores',
                category: 'Testing',
                estimatedHours: 20,
                priority: 'high',
                subtasks: [
                    'Register for SAT/ACT',
                    'Take practice tests',
                    'Take official test',
                    'Send scores to colleges',
                    'Retake if necessary'
                ],
                tips: [
                    'Take tests multiple times if needed',
                    'Use free practice resources',
                    'Register early for preferred test dates'
                ]
            },

            fafsa: {
                id: 'fafsa-submission',
                title: 'Complete FAFSA',
                description: 'Submit Free Application for Federal Student Aid',
                category: 'Financial Aid',
                estimatedHours: 3,
                priority: 'high',
                subtasks: [
                    'Gather tax documents and financial records',
                    'Create FSA ID (student and parent)',
                    'Complete FAFSA online',
                    'Submit to all schools on your list',
                    'Check for verification requirements'
                ],
                tips: [
                    'File as soon as possible after October 1st',
                    'Use tax transcripts for accuracy',
                    'Apply even if you think you won\'t qualify'
                ]
            },

            cssProfile: {
                id: 'css-profile',
                title: 'Complete CSS Profile',
                description: 'Submit CSS Profile for institutional aid',
                category: 'Financial Aid',
                estimatedHours: 4,
                priority: 'medium',
                subtasks: [
                    'Check which schools require CSS Profile',
                    'Gather detailed financial documents',
                    'Complete CSS Profile online',
                    'Pay required fees',
                    'Submit by school deadlines'
                ],
                tips: [
                    'More detailed than FAFSA - allow extra time',
                    'Have parent tax returns and assets ready',
                    'Each school may have different requirements'
                ]
            },

            interviews: {
                id: 'college-interviews',
                title: 'Schedule and Complete Interviews',
                description: 'Participate in alumni or admissions interviews',
                category: 'Interviews',
                estimatedHours: 6,
                priority: 'medium',
                subtasks: [
                    'Check if interviews are offered/required',
                    'Schedule interview appointments',
                    'Prepare common interview questions',
                    'Research interviewer background if possible',
                    'Send thank you note after interview'
                ],
                tips: [
                    'Practice with family or friends first',
                    'Prepare specific examples and stories',
                    'Ask thoughtful questions about the school'
                ]
            },

            scholarships: {
                id: 'scholarship-applications',
                title: 'Apply for Scholarships',
                description: 'Research and apply for merit and need-based scholarships',
                category: 'Scholarships',
                estimatedHours: 15,
                priority: 'medium',
                subtasks: [
                    'Research school-specific scholarships',
                    'Find external scholarship opportunities',
                    'Complete scholarship applications',
                    'Write scholarship essays',
                    'Submit by deadlines'
                ],
                tips: [
                    'Start early - many have early deadlines',
                    'Apply for multiple scholarships',
                    'Use your college essays as starting points'
                ]
            },

            housing: {
                id: 'housing-application',
                title: 'Submit Housing Application',
                description: 'Apply for on-campus housing',
                category: 'Post-Admission',
                estimatedHours: 2,
                priority: 'low',
                subtasks: [
                    'Research housing options',
                    'Complete housing application',
                    'Pay housing deposit',
                    'Submit roommate preferences'
                ],
                tips: [
                    'Apply early for better options',
                    'Consider living-learning communities',
                    'Read housing policies carefully'
                ]
            },

            orientation: {
                id: 'orientation-registration',
                title: 'Register for Orientation',
                description: 'Sign up for new student orientation',
                category: 'Post-Admission',
                estimatedHours: 1,
                priority: 'low',
                tips: [
                    'Register as soon as possible',
                    'Attend if at all possible',
                    'Bring required documents'
                ]
            }
        };
    }

    static getTimelineTemplate(applicationType = 'RD', applicationDeadline) {
        const tasks = this.getTaskTemplates();
        const deadlines = window.DateHelpers?.generateDeadlines(applicationDeadline, applicationType) || {};
        
        const timeline = [
            {
                ...tasks.testing,
                deadline: deadlines.testing,
                status: 'todo'
            },
            {
                ...tasks.commonApp,
                deadline: new Date(applicationDeadline.getTime() - (7 * 24 * 60 * 60 * 1000)), // 1 week before
                status: 'todo'
            },
            {
                ...tasks.supplements,
                deadline: applicationDeadline,
                status: 'todo'
            },
            {
                ...tasks.recommendations,
                deadline: deadlines.recommendations,
                status: 'todo'
            },
            {
                ...tasks.transcripts,
                deadline: deadlines.transcripts,
                status: 'todo'
            },
            {
                ...tasks.application,
                deadline: applicationDeadline,
                status: 'todo'
            },
            {
                ...tasks.fafsa,
                deadline: deadlines.fafsa,
                status: 'todo'
            }
        ];

        // Add CSS Profile for schools that require it
        if (applicationType === 'ED' || applicationType === 'EA') {
            timeline.push({
                ...tasks.cssProfile,
                deadline: deadlines.cssProfile,
                status: 'todo'
            });
        }

        // Sort by deadline
        return timeline.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    static getSchoolSpecificTasks(schoolName, schoolData = {}) {
        const tasks = this.getTaskTemplates();
        const schoolTasks = [];

        // Add school-specific supplements if they exist
        if (schoolData.hasSupplements) {
            schoolTasks.push({
                ...tasks.supplements,
                title: `${schoolName} Supplemental Essays`,
                description: `Complete ${schoolName}-specific supplemental essays`,
                schoolSpecific: true
            });
        }

        // Add interview if school offers them
        if (schoolData.offersInterviews) {
            schoolTasks.push({
                ...tasks.interviews,
                title: `${schoolName} Interview`,
                description: `Complete ${schoolName} alumni or admissions interview`,
                schoolSpecific: true
            });
        }

        // Add scholarship applications if available
        if (schoolData.hasScholarships) {
            schoolTasks.push({
                ...tasks.scholarships,
                title: `${schoolName} Scholarships`,
                description: `Apply for ${schoolName}-specific scholarships`,
                schoolSpecific: true
            });
        }

        return schoolTasks;
    }

    static getPostAdmissionTasks(schoolName) {
        const tasks = this.getTaskTemplates();
        
        return [
            {
                ...tasks.housing,
                title: `${schoolName} Housing Application`,
                description: `Apply for ${schoolName} on-campus housing`,
                deadline: new Date(new Date().getFullYear(), 4, 1), // May 1st
                status: 'todo'
            },
            {
                ...tasks.orientation,
                title: `${schoolName} Orientation`,
                description: `Register for ${schoolName} new student orientation`,
                deadline: new Date(new Date().getFullYear(), 5, 15), // June 15th
                status: 'todo'
            }
        ];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineTemplates;
} else {
    window.TimelineTemplates = TimelineTemplates;
}
