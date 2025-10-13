/**
 * Application Requirements Database
 * Contains essay requirements for major colleges
 */

class ApplicationRequirements {
    constructor() {
        this.requirements = this.initializeRequirements();
    }

    initializeRequirements() {
        return {
            // Common App Requirements
            'common-app': {
                name: 'Common Application',
                essays: [
                    {
                        id: 'common-app-main',
                        name: 'Common App Personal Essay',
                        required: true,
                        wordLimit: 650,
                        prompts: [
                            'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
                            'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
                            'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
                            'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?',
                            'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
                            'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
                            'Share an essay on any topic of your choice.'
                        ]
                    }
                ]
            },

            // Top Universities
            'stanford': {
                name: 'Stanford University',
                useCommonApp: true,
                essays: [
                    {
                        id: 'stanford-roommate',
                        name: 'Roommate Essay',
                        required: true,
                        wordLimit: 250,
                        prompt: 'Virtually all of Stanford\'s undergraduates live on campus. Write a note to your future roommate that reveals something about you or that will help your roommate—and us—know you better.'
                    },
                    {
                        id: 'stanford-why',
                        name: 'Why Stanford',
                        required: true,
                        wordLimit: 250,
                        prompt: 'Tell us about something that is meaningful to you and why.'
                    },
                    {
                        id: 'stanford-short-1',
                        name: 'Short Essay 1',
                        required: true,
                        wordLimit: 50,
                        prompt: 'What is the most significant challenge that society faces today?'
                    },
                    {
                        id: 'stanford-short-2',
                        name: 'Short Essay 2',
                        required: true,
                        wordLimit: 50,
                        prompt: 'How did you spend your last two summers?'
                    },
                    {
                        id: 'stanford-short-3',
                        name: 'Short Essay 3',
                        required: true,
                        wordLimit: 50,
                        prompt: 'What historical moment or event do you wish you could have witnessed?'
                    }
                ],
                deadline: '2025-01-05',
                earlyDeadline: '2024-11-01'
            },

            'harvard': {
                name: 'Harvard University',
                useCommonApp: true,
                essays: [
                    {
                        id: 'harvard-supplement',
                        name: 'Harvard Supplemental Essay',
                        required: false,
                        wordLimit: 150,
                        prompt: 'You may wish to include an additional essay if you feel that the college application forms do not provide sufficient opportunity to convey important information about yourself or your accomplishments.'
                    }
                ],
                deadline: '2025-01-01',
                earlyDeadline: '2024-11-01'
            },

            'mit': {
                name: 'Massachusetts Institute of Technology',
                useCommonApp: false,
                essays: [
                    {
                        id: 'mit-main',
                        name: 'MIT Main Essay',
                        required: true,
                        wordLimit: 250,
                        prompt: 'Tell us about something you do simply for the pleasure of it.'
                    },
                    {
                        id: 'mit-community',
                        name: 'Community Essay',
                        required: true,
                        wordLimit: 250,
                        prompt: 'Describe the world you come from; for example, your family, clubs, school, community, city, or town. How has that world shaped your dreams and aspirations?'
                    },
                    {
                        id: 'mit-challenge',
                        name: 'Challenge Essay',
                        required: true,
                        wordLimit: 250,
                        prompt: 'At MIT, we bring people together to better the lives of others. MIT students work to improve their communities in different ways, from tackling the world\'s biggest challenges to being a good friend. Describe one way you have collaborated with others to effect positive change.'
                    }
                ],
                deadline: '2025-01-01',
                earlyDeadline: '2024-11-01'
            },

            'princeton': {
                name: 'Princeton University',
                useCommonApp: true,
                essays: [
                    {
                        id: 'princeton-interests',
                        name: 'Academic Interests',
                        required: true,
                        wordLimit: 250,
                        prompt: 'As a research institution that also prides itself on its liberal arts curriculum, Princeton allows students to explore areas across the humanities and the arts, the natural sciences, and the social sciences. What academic areas most pique your curiosity, and how do the programs offered at Princeton suit your particular interests?'
                    },
                    {
                        id: 'princeton-extracurricular',
                        name: 'Extracurricular Essay',
                        required: true,
                        wordLimit: 250,
                        prompt: 'Princeton values community and encourages students, faculty, staff and leadership to engage in respectful conversations that can expand their perspectives and challenge their ideas and beliefs. As a prospective member of this community, reflect on how your lived experiences will impact the conversations you will have in the classroom, the dining hall or other campus spaces.'
                    }
                ],
                deadline: '2025-01-01',
                earlyDeadline: '2024-11-01'
            },

            'yale': {
                name: 'Yale University',
                useCommonApp: true,
                essays: [
                    {
                        id: 'yale-short-1',
                        name: 'Short Answer 1',
                        required: true,
                        wordLimit: 200,
                        prompt: 'Students at Yale have time to explore their academic interests before committing to one or more major fields of study. Many students either modify their original academic direction or change their minds entirely. As of this moment, what academic areas seem to fit your interests or goals most comfortably?'
                    },
                    {
                        id: 'yale-short-2',
                        name: 'Short Answer 2',
                        required: true,
                        wordLimit: 200,
                        prompt: 'Tell us about a topic or idea that excites you and is related to one or more academic areas you selected above. Why are you drawn to it?'
                    },
                    {
                        id: 'yale-short-3',
                        name: 'Short Answer 3',
                        required: true,
                        wordLimit: 200,
                        prompt: 'What is it about Yale that has led you to apply?'
                    }
                ],
                deadline: '2025-01-02',
                earlyDeadline: '2024-11-01'
            },

            'columbia': {
                name: 'Columbia University',
                useCommonApp: true,
                essays: [
                    {
                        id: 'columbia-why',
                        name: 'Why Columbia',
                        required: true,
                        wordLimit: 200,
                        prompt: 'Why are you interested in attending Columbia University?'
                    },
                    {
                        id: 'columbia-list-1',
                        name: 'List Question 1',
                        required: true,
                        wordLimit: 150,
                        prompt: 'List the titles of the books, essays, poetry, short stories or plays you read outside of academic courses that you enjoyed most during secondary/high school.'
                    },
                    {
                        id: 'columbia-list-2',
                        name: 'List Question 2',
                        required: true,
                        wordLimit: 150,
                        prompt: 'List the titles of the films, concerts, shows, exhibits, lectures and other entertainments you enjoyed most during secondary/high school.'
                    }
                ],
                deadline: '2025-01-01',
                earlyDeadline: '2024-11-01'
            },

            'uc-system': {
                name: 'University of California System',
                useCommonApp: false,
                essays: [
                    {
                        id: 'uc-piq-1',
                        name: 'Personal Insight Question (Choose 4 of 8)',
                        required: true,
                        wordLimit: 350,
                        count: 4,
                        prompts: [
                            'Describe an example of your leadership experience in which you have positively influenced others, helped resolve disputes or contributed to group efforts over time.',
                            'Every person has a creative side, and it can be expressed in many ways: problem solving, original and innovative thinking, and artistically, to name a few. Describe how you express your creative side.',
                            'What would you say is your greatest talent or skill? How have you developed and demonstrated that talent over time?',
                            'Describe how you have taken advantage of a significant educational opportunity or worked to overcome an educational barrier you have faced.',
                            'Describe the most significant challenge you have faced and the steps you have taken to overcome this challenge. How has this challenge affected your academic achievement?',
                            'Think about an academic subject that inspires you. Describe how you have furthered this interest inside and/or outside of the classroom.',
                            'What have you done to make your school or your community a better place?',
                            'Beyond what has already been shared in your application, what do you believe makes you a strong candidate for admissions to the University of California?'
                        ]
                    }
                ],
                deadline: '2024-11-30'
            }
        };
    }

    getRequirements(schoolKey) {
        return this.requirements[schoolKey] || null;
    }

    getAllSchools() {
        return Object.keys(this.requirements).map(key => ({
            key,
            name: this.requirements[key].name
        }));
    }

    calculateTotalEssays(schoolKeys) {
        let total = 0;
        let hasCommonApp = false;

        schoolKeys.forEach(key => {
            const req = this.requirements[key];
            if (req) {
                if (req.useCommonApp) {
                    hasCommonApp = true;
                }
                total += req.essays?.length || 0;
            }
        });

        if (hasCommonApp) {
            total += 1; // Add Common App essay
        }

        return total;
    }

    /**
     * Find which schools can use a specific essay
     */
    findReusableSchools(essayPromptType, userSchools) {
        const reusableSchools = [];

        userSchools.forEach(schoolKey => {
            const req = this.requirements[schoolKey];
            if (!req) return;

            req.essays?.forEach(essay => {
                // Check if essay prompt matches or is similar
                if (this.isPromptSimilar(essayPromptType, essay.prompt)) {
                    reusableSchools.push({
                        school: req.name,
                        essay: essay.name
                    });
                }
            });
        });

        return reusableSchools;
    }

    isPromptSimilar(type, prompt) {
        const promptLower = prompt.toLowerCase();

        const patterns = {
            'personal-story': ['background', 'identity', 'story', 'who you are'],
            'challenge': ['challenge', 'obstacle', 'failure', 'setback', 'overcome'],
            'why-school': ['why', 'interested in', 'drawn to', 'attracted'],
            'community': ['community', 'background', 'world you come from'],
            'intellectual': ['academic', 'subject', 'topic', 'intellectual', 'curiosity'],
            'extracurricular': ['activity', 'extracurricular', 'outside class']
        };

        const typePatterns = patterns[type] || [];
        return typePatterns.some(pattern => promptLower.includes(pattern));
    }
}

window.ApplicationRequirements = ApplicationRequirements;
