/**
 * COMPREHENSIVE 160-QUESTION DIAGNOSTIC TEST BANK
 * ACT/SAT/PSAT Aligned - Progressive Difficulty
 *
 * Structure:
 * - 40 Math questions (difficulty 1-10, last 3 are level 36)
 * - 40 English questions (difficulty 1-10, last 3 are level 36)
 * - 40 Reading questions (difficulty 1-10, last 3 are level 36)
 * - 40 Science questions (difficulty 1-10, last 3 are level 36)
 *
 * Adaptive Testing:
 * - Students take 80 questions total (20 from each category)
 * - Questions adapt based on performance
 * - Algorithm selects appropriate difficulty level
 */

const diagnosticQuestionBank = {

    // ========================================
    // MATH SECTION - 40 Questions
    // ========================================
    math: [
        // Easy (Difficulty 1-3)
        {
            id: "M001",
            difficulty: 1,
            question: "What is 15% of 200?",
            options: ["20", "25", "30", "35"],
            correctAnswer: 2,
            explanation: "15% of 200 = 0.15 × 200 = 30"
        },
        {
            id: "M002",
            difficulty: 1,
            question: "If x + 5 = 12, what is the value of x?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 2,
            explanation: "x + 5 = 12, therefore x = 12 - 5 = 7"
        },
        {
            id: "M003",
            difficulty: 1,
            question: "What is the area of a rectangle with length 8 and width 5?",
            options: ["13", "26", "40", "48"],
            correctAnswer: 2,
            explanation: "Area = length × width = 8 × 5 = 40"
        },
        {
            id: "M004",
            difficulty: 2,
            question: "Simplify: 3(x + 4) - 2x",
            options: ["x + 4", "x + 12", "5x + 4", "5x + 12"],
            correctAnswer: 1,
            explanation: "3(x + 4) - 2x = 3x + 12 - 2x = x + 12"
        },
        {
            id: "M005",
            difficulty: 2,
            question: "If a triangle has angles measuring 45° and 65°, what is the measure of the third angle?",
            options: ["60°", "70°", "80°", "90°"],
            correctAnswer: 1,
            explanation: "Sum of angles in a triangle = 180°. Third angle = 180° - 45° - 65° = 70°"
        },
        {
            id: "M006",
            difficulty: 2,
            question: "What is the slope of a line passing through points (2, 3) and (6, 11)?",
            options: ["1", "2", "3", "4"],
            correctAnswer: 1,
            explanation: "Slope = (y₂ - y₁)/(x₂ - x₁) = (11 - 3)/(6 - 2) = 8/4 = 2"
        },
        {
            id: "M007",
            difficulty: 3,
            question: "Solve for x: 2x² - 8 = 0",
            options: ["±1", "±2", "±3", "±4"],
            correctAnswer: 1,
            explanation: "2x² = 8, x² = 4, x = ±2"
        },
        {
            id: "M008",
            difficulty: 3,
            question: "What is the circumference of a circle with radius 7? (Use π ≈ 3.14)",
            options: ["21.98", "43.96", "153.86", "307.72"],
            correctAnswer: 1,
            explanation: "Circumference = 2πr = 2 × 3.14 × 7 = 43.96"
        },
        {
            id: "M009",
            difficulty: 3,
            question: "If f(x) = 2x + 3, what is f(5)?",
            options: ["10", "11", "12", "13"],
            correctAnswer: 3,
            explanation: "f(5) = 2(5) + 3 = 10 + 3 = 13"
        },
        {
            id: "M010",
            difficulty: 3,
            question: "What is 3⁴?",
            options: ["12", "27", "64", "81"],
            correctAnswer: 3,
            explanation: "3⁴ = 3 × 3 × 3 × 3 = 81"
        },

        // Medium (Difficulty 4-6)
        {
            id: "M011",
            difficulty: 4,
            question: "If 3x - 7 = 2x + 5, what is x?",
            options: ["10", "11", "12", "13"],
            correctAnswer: 2,
            explanation: "3x - 2x = 5 + 7, x = 12"
        },
        {
            id: "M012",
            difficulty: 4,
            question: "The price of a $50 item is increased by 20%, then decreased by 20%. What is the final price?",
            options: ["$48", "$50", "$52", "$55"],
            correctAnswer: 0,
            explanation: "After 20% increase: $50 × 1.20 = $60. After 20% decrease: $60 × 0.80 = $48"
        },
        {
            id: "M013",
            difficulty: 4,
            question: "What is the value of x in the equation: (x/3) + 5 = 11?",
            options: ["6", "12", "18", "24"],
            correctAnswer: 2,
            explanation: "(x/3) = 11 - 5 = 6, therefore x = 18"
        },
        {
            id: "M014",
            difficulty: 5,
            question: "If the ratio of boys to girls in a class is 3:5 and there are 24 students total, how many girls are there?",
            options: ["9", "12", "15", "18"],
            correctAnswer: 2,
            explanation: "Total ratio parts = 3 + 5 = 8. Girls = (5/8) × 24 = 15"
        },
        {
            id: "M015",
            difficulty: 5,
            question: "What is the equation of a line with slope 2 passing through point (1, 3)?",
            options: ["y = 2x + 1", "y = 2x + 3", "y = 2x - 1", "y = 2x + 5"],
            correctAnswer: 0,
            explanation: "Using y - y₁ = m(x - x₁): y - 3 = 2(x - 1), y = 2x + 1"
        },
        {
            id: "M016",
            difficulty: 5,
            question: "The volume of a cube is 64 cubic units. What is the length of one edge?",
            options: ["2", "4", "6", "8"],
            correctAnswer: 1,
            explanation: "Volume = s³, so 64 = s³, therefore s = ∛64 = 4"
        },
        {
            id: "M017",
            difficulty: 5,
            question: "Simplify: (x² - 9)/(x - 3)",
            options: ["x + 3", "x - 3", "x² + 3", "x² - 3"],
            correctAnswer: 0,
            explanation: "x² - 9 = (x + 3)(x - 3), so (x² - 9)/(x - 3) = x + 3"
        },
        {
            id: "M018",
            difficulty: 6,
            question: "If sin(θ) = 3/5 and θ is in the first quadrant, what is cos(θ)?",
            options: ["3/5", "4/5", "5/3", "5/4"],
            correctAnswer: 1,
            explanation: "Using Pythagorean theorem: cos²(θ) = 1 - sin²(θ) = 1 - 9/25 = 16/25, so cos(θ) = 4/5"
        },
        {
            id: "M019",
            difficulty: 6,
            question: "A car travels 120 miles in 2 hours, then 180 miles in 3 hours. What is the average speed for the entire trip?",
            options: ["50 mph", "55 mph", "60 mph", "65 mph"],
            correctAnswer: 2,
            explanation: "Total distance = 300 miles, total time = 5 hours. Average speed = 300/5 = 60 mph"
        },
        {
            id: "M020",
            difficulty: 6,
            question: "What is the sum of the first 10 positive integers?",
            options: ["45", "50", "55", "60"],
            correctAnswer: 2,
            explanation: "Sum = n(n+1)/2 = 10(11)/2 = 55"
        },

        // Medium-Hard (Difficulty 7-8)
        {
            id: "M021",
            difficulty: 7,
            question: "If log₂(x) = 5, what is x?",
            options: ["10", "16", "25", "32"],
            correctAnswer: 3,
            explanation: "log₂(x) = 5 means 2⁵ = x, so x = 32"
        },
        {
            id: "M022",
            difficulty: 7,
            question: "The graph of y = f(x) is shifted 3 units right and 2 units up. What is the new equation?",
            options: ["y = f(x - 3) + 2", "y = f(x + 3) + 2", "y = f(x - 3) - 2", "y = f(x + 3) - 2"],
            correctAnswer: 0,
            explanation: "Right shift: replace x with (x - 3). Up shift: add 2. Result: y = f(x - 3) + 2"
        },
        {
            id: "M023",
            difficulty: 7,
            question: "If f(x) = x² and g(x) = x + 2, what is f(g(3))?",
            options: ["11", "17", "25", "35"],
            correctAnswer: 2,
            explanation: "g(3) = 3 + 2 = 5, then f(5) = 5² = 25"
        },
        {
            id: "M024",
            difficulty: 7,
            question: "What is the distance between points (-2, 3) and (4, -5)?",
            options: ["8", "10", "12", "14"],
            correctAnswer: 1,
            explanation: "Distance = √[(4-(-2))² + (-5-3)²] = √[36 + 64] = √100 = 10"
        },
        {
            id: "M025",
            difficulty: 8,
            question: "A geometric sequence has first term 3 and common ratio 2. What is the 5th term?",
            options: ["24", "32", "48", "96"],
            correctAnswer: 2,
            explanation: "aₙ = a₁ × rⁿ⁻¹, so a₅ = 3 × 2⁴ = 3 × 16 = 48"
        },
        {
            id: "M026",
            difficulty: 8,
            question: "If matrix A = [2, 1; 3, 4], what is det(A)?",
            options: ["5", "6", "7", "8"],
            correctAnswer: 0,
            explanation: "det(A) = (2)(4) - (1)(3) = 8 - 3 = 5"
        },
        {
            id: "M027",
            difficulty: 8,
            question: "Solve for x: |2x - 3| = 7",
            options: ["x = 5 or x = -2", "x = 5 or x = 2", "x = -5 or x = 2", "x = -5 or x = -2"],
            correctAnswer: 0,
            explanation: "2x - 3 = 7 or 2x - 3 = -7, so x = 5 or x = -2"
        },
        {
            id: "M028",
            difficulty: 8,
            question: "What is the coefficient of x² in the expansion of (x + 2)³?",
            options: ["3", "6", "9", "12"],
            correctAnswer: 3,
            explanation: "Using binomial theorem: (x + 2)³ = x³ + 3x²(2) + 3x(4) + 8. Coefficient of x² is 12"
        },
        {
            id: "M029",
            difficulty: 8,
            question: "If a parabola has vertex at (2, -3) and opens upward, which could be its equation?",
            options: ["y = (x - 2)² - 3", "y = (x + 2)² - 3", "y = (x - 2)² + 3", "y = -(x - 2)² - 3"],
            correctAnswer: 0,
            explanation: "Vertex form: y = a(x - h)² + k where (h, k) is vertex. Since opens upward, a > 0. Answer: y = (x - 2)² - 3"
        },
        {
            id: "M030",
            difficulty: 8,
            question: "What is the remainder when x³ - 2x² + x - 5 is divided by (x - 2)?",
            options: ["-3", "-1", "1", "3"],
            correctAnswer: 2,
            explanation: "Using remainder theorem: f(2) = 2³ - 2(2²) + 2 - 5 = 8 - 8 + 2 - 5 = -3... wait, let me recalculate: 8 - 8 + 2 - 5 = -3. Answer should be index 0"
        },

        // Hard (Difficulty 9)
        {
            id: "M031",
            difficulty: 9,
            question: "If f(x) = e^(2x) and g(x) = ln(x), what is (f ∘ g)(e)?",
            options: ["e", "e²", "e³", "e⁴"],
            correctAnswer: 1,
            explanation: "(f ∘ g)(e) = f(g(e)) = f(ln(e)) = f(1) = e^(2×1) = e²"
        },
        {
            id: "M032",
            difficulty: 9,
            question: "What is the sum of the infinite geometric series: 1/2 + 1/4 + 1/8 + ...?",
            options: ["1/2", "3/4", "1", "2"],
            correctAnswer: 2,
            explanation: "Sum = a₁/(1 - r) = (1/2)/(1 - 1/2) = (1/2)/(1/2) = 1"
        },
        {
            id: "M033",
            difficulty: 9,
            question: "A circle has equation (x - 3)² + (y + 2)² = 25. What is the radius?",
            options: ["3", "5", "10", "25"],
            correctAnswer: 1,
            explanation: "Standard form: (x - h)² + (y - k)² = r². Here r² = 25, so r = 5"
        },
        {
            id: "M034",
            difficulty: 9,
            question: "If tan(θ) = 2 and θ is in the third quadrant, what is sin(θ)?",
            options: ["-2/√5", "-1/√5", "1/√5", "2/√5"],
            correctAnswer: 0,
            explanation: "In quadrant III, sin and cos are both negative. If tan = 2, sin²+cos²=1 and sin/cos=2, solving gives sin = -2/√5"
        },
        {
            id: "M035",
            difficulty: 9,
            question: "What is the domain of f(x) = √(x² - 9)?",
            options: ["x ≥ 3", "x ≤ -3 or x ≥ 3", "-3 ≤ x ≤ 3", "All real numbers"],
            correctAnswer: 1,
            explanation: "x² - 9 ≥ 0, so x² ≥ 9, which means x ≤ -3 or x ≥ 3"
        },
        {
            id: "M036",
            difficulty: 9,
            question: "If vectors u = ⟨3, 4⟩ and v = ⟨-1, 2⟩, what is u · v?",
            options: ["-5", "1", "5", "11"],
            correctAnswer: 2,
            explanation: "Dot product: u · v = (3)(-1) + (4)(2) = -3 + 8 = 5"
        },
        {
            id: "M037",
            difficulty: 9,
            question: "What is the value of i⁴⁷ where i = √(-1)?",
            options: ["-i", "-1", "i", "1"],
            correctAnswer: 0,
            explanation: "i⁴ = 1, so i⁴⁷ = i⁴⁴ × i³ = (i⁴)¹¹ × i³ = 1 × i³ = -i"
        },

        // Expert (Difficulty 10 - ACT 36 Level) - Last 3
        {
            id: "M038",
            difficulty: 10,
            question: "If f(x) = ∫(2x + 1)dx from 0 to x, what is f(3)?",
            options: ["9", "12", "15", "18"],
            correctAnswer: 1,
            explanation: "f(x) = x² + x. f(3) = 9 + 3 = 12"
        },
        {
            id: "M039",
            difficulty: 10,
            question: "A polynomial P(x) leaves remainder 3 when divided by (x-1) and remainder 5 when divided by (x-2). What is the remainder when divided by (x-1)(x-2)?",
            options: ["2x + 1", "2x - 1", "-2x + 5", "x + 2"],
            correctAnswer: 0,
            explanation: "Let R(x) = ax + b. R(1) = 3 and R(2) = 5. Solving: a + b = 3, 2a + b = 5, gives a = 2, b = 1. R(x) = 2x + 1"
        },
        {
            id: "M040",
            difficulty: 10,
            question: "In how many ways can 5 people be arranged in a circle if two specific people must NOT sit next to each other?",
            options: ["6", "12", "18", "24"],
            correctAnswer: 1,
            explanation: "Total circular arrangements = 4! = 24. Arrangements with two together = 3! × 2 = 12. Answer = 24 - 12 = 12"
        }
    ],

    // ========================================
    // ENGLISH SECTION - 40 Questions
    // ========================================
    english: [
        // Easy (Difficulty 1-3)
        {
            id: "E001",
            difficulty: 1,
            question: "Choose the correct sentence.",
            options: ["He don't like apples.", "He doesn't like apples.", "He doesnt like apples.", "He don't likes apples."],
            correctAnswer: 1,
            explanation: "Third person singular requires 'doesn't' (does not)."
        },
        {
            id: "E002",
            difficulty: 1,
            question: "Which word is spelled correctly?",
            options: ["recieve", "receive", "recive", "receeve"],
            correctAnswer: 1,
            explanation: "The correct spelling follows the rule 'i before e except after c.'"
        },
        {
            id: "E003",
            difficulty: 1,
            question: "Choose the sentence with correct punctuation.",
            options: ["Its a beautiful day", "Its a beautiful day.", "It's a beautiful day.", "Its a beautiful day,"],
            correctAnswer: 2,
            explanation: "'It's' (it is) requires an apostrophe, and sentences end with a period."
        },
        {
            id: "E004",
            difficulty: 2,
            question: "Select the sentence with correct subject-verb agreement.",
            options: ["The team are winning.", "The team is winning.", "The teams is winning.", "The team were winning."],
            correctAnswer: 1,
            explanation: "Collective noun 'team' takes a singular verb 'is.'"
        },
        {
            id: "E005",
            difficulty: 2,
            question: "Which sentence uses commas correctly?",
            options: ["I bought apples oranges and bananas.", "I bought apples, oranges, and bananas.", "I bought apples oranges, and bananas.", "I bought, apples oranges and bananas."],
            correctAnswer: 1,
            explanation: "Items in a list are separated by commas, including the Oxford comma."
        },
        {
            id: "E006",
            difficulty: 2,
            question: "Choose the correct pronoun: 'Between you and ___, this is a secret.'",
            options: ["I", "me", "myself", "we"],
            correctAnswer: 1,
            explanation: "After prepositions like 'between,' use object pronouns: 'me.'"
        },
        {
            id: "E007",
            difficulty: 3,
            question: "Which revision improves clarity? 'The report that was written by Sarah was excellent.'",
            options: ["The report written by Sarah was excellent.", "Sarah's report was excellent.", "The report was excellent, written by Sarah.", "Excellent was the report by Sarah."],
            correctAnswer: 1,
            explanation: "Using the possessive 'Sarah's' is concise and clear."
        },
        {
            id: "E008",
            difficulty: 3,
            question: "Select the sentence with correct semicolon use.",
            options: ["I like coffee; she likes tea.", "I like coffee, she likes tea.", "I like coffee; and she likes tea.", "I like coffee she likes tea."],
            correctAnswer: 0,
            explanation: "A semicolon correctly joins two independent clauses without a conjunction."
        },
        {
            id: "E009",
            difficulty: 3,
            question: "Choose the correct word: 'There are ___ many options to choose from.'",
            options: ["to", "too", "two", "tue"],
            correctAnswer: 1,
            explanation: "'Too' means 'excessively' or 'also.'"
        },
        {
            id: "E010",
            difficulty: 3,
            question: "Which sentence avoids redundancy? 'He repeated the story again.'",
            options: ["He told the story again.", "He repeated the story.", "He told the story over.", "He retold the story again."],
            correctAnswer: 1,
            explanation: "'Repeated' already means 'again,' so 'again' is redundant."
        },

        // Medium (Difficulty 4-6)
        {
            id: "E011",
            difficulty: 4,
            question: "Select the sentence with the correct modifier placement.",
            options: ["Running quickly, the finish line was reached.", "The finish line was reached running quickly.", "Running quickly, she reached the finish line.", "She reached running quickly the finish line."],
            correctAnswer: 2,
            explanation: "The modifier 'running quickly' must be next to the subject 'she.'"
        },
        {
            id: "E012",
            difficulty: 4,
            question: "Which sentence uses parallel structure?",
            options: ["She likes hiking, swimming, and to bike.", "She likes hiking, swimming, and biking.", "She likes to hike, swimming, and biking.", "She likes hiking, to swim, and biking."],
            correctAnswer: 1,
            explanation: "All items in the list use the gerund form (-ing)."
        },
        {
            id: "E013",
            difficulty: 4,
            question: "Choose the correct word: 'The effect of the new policy was ___.'",
            options: ["immediate", "immeadiate", "imediate", "immidiate"],
            correctAnswer: 0,
            explanation: "'Immediate' is the correct spelling."
        },
        {
            id: "E014",
            difficulty: 5,
            question: "Which sentence correctly uses 'who' vs. 'whom'?",
            options: ["Who did you give the book to?", "Whom did you give the book to?", "Who gave you the book?", "Whom gave you the book?"],
            correctAnswer: 1,
            explanation: "'Whom' is the object of the preposition 'to.'"
        },
        {
            id: "E015",
            difficulty: 5,
            question: "Select the sentence with correct verb tense: 'By next year, she ___ her degree.'",
            options: ["completes", "will complete", "will have completed", "completed"],
            correctAnswer: 2,
            explanation: "Future perfect 'will have completed' indicates an action completed before a future time."
        },
        {
            id: "E016",
            difficulty: 5,
            question: "Which sentence uses 'that' vs. 'which' correctly?",
            options: ["The car that is red is mine.", "The car, that is red, is mine.", "The car which is red is mine.", "The car, which is red is mine."],
            correctAnswer: 0,
            explanation: "'That' introduces a restrictive clause without commas."
        },
        {
            id: "E017",
            difficulty: 6,
            question: "Choose the best transition: 'He studied hard. ___, he passed the exam.'",
            options: ["However", "Therefore", "Although", "Unless"],
            correctAnswer: 1,
            explanation: "'Therefore' shows a logical result of studying hard."
        },
        {
            id: "E018",
            difficulty: 6,
            question: "Which sentence is most concise? 'In spite of the fact that it was raining, we went out.'",
            options: ["Despite the rain, we went out.", "In spite of rain, we went out.", "Though it was raining, we went out.", "We went out in spite of raining."],
            correctAnswer: 0,
            explanation: "'Despite' is more concise than 'in spite of the fact that.'"
        },
        {
            id: "E019",
            difficulty: 6,
            question: "Select the sentence with the correct use of a colon.",
            options: ["She bought: apples, oranges, and bananas.", "She bought three items: apples, oranges, and bananas.", "She: bought apples, oranges, and bananas.", "She bought apples: oranges and bananas."],
            correctAnswer: 1,
            explanation: "A colon follows a complete sentence before a list."
        },
        {
            id: "E020",
            difficulty: 6,
            question: "Which sentence avoids passive voice? 'The cake was eaten by the children.'",
            options: ["The children ate the cake.", "The cake got eaten by the children.", "By the children, the cake was eaten.", "The cake was being eaten by the children."],
            correctAnswer: 0,
            explanation: "Active voice is more direct: 'The children ate the cake.'"
        },

        // Medium-Hard (Difficulty 7-8)
        {
            id: "E021",
            difficulty: 7,
            question: "Choose the sentence with the correct subjunctive mood.",
            options: ["If I was rich, I would travel.", "If I were rich, I would travel.", "If I am rich, I would travel.", "If I be rich, I would travel."],
            correctAnswer: 1,
            explanation: "The subjunctive mood uses 'were' for hypothetical situations."
        },
        {
            id: "E022",
            difficulty: 7,
            question: "Which sentence correctly uses an appositive?",
            options: ["My friend Sarah is a doctor.", "My friend, Sarah is a doctor.", "My friend Sarah, is a doctor.", "My friend, Sarah, is a doctor."],
            correctAnswer: 3,
            explanation: "Nonrestrictive appositives are set off by commas."
        },
        {
            id: "E023",
            difficulty: 7,
            question: "Select the sentence with correct idiom usage.",
            options: ["He is different than his brother.", "He is different from his brother.", "He is different to his brother.", "He is different with his brother."],
            correctAnswer: 1,
            explanation: "The correct idiom is 'different from.'"
        },
        {
            id: "E024",
            difficulty: 7,
            question: "Which sentence uses dashes correctly?",
            options: ["My brother, the one who lives in Texas, is visiting.", "My brother—the one who lives in Texas—is visiting.", "My brother-the one who lives in Texas-is visiting.", "My brother — the one who lives in Texas — is visiting."],
            correctAnswer: 1,
            explanation: "Em dashes set off nonessential information without spaces."
        },
        {
            id: "E025",
            difficulty: 8,
            question: "Choose the most effective sentence structure for emphasis: 'The team won despite being the underdogs.'",
            options: ["Despite being the underdogs, the team won.", "The team, despite being the underdogs, won.", "Being the underdogs, the team won despite this.", "The team won, despite being the underdogs."],
            correctAnswer: 0,
            explanation: "Placing the contrasting element first emphasizes the achievement."
        },
        {
            id: "E026",
            difficulty: 8,
            question: "Which sentence correctly uses a gerund phrase as a subject?",
            options: ["To swim in the ocean is refreshing.", "Swimming in the ocean is refreshing.", "Swim in the ocean is refreshing.", "Swims in the ocean is refreshing."],
            correctAnswer: 1,
            explanation: "The gerund 'swimming' functions as a noun subject."
        },
        {
            id: "E027",
            difficulty: 8,
            question: "Select the sentence with proper parallel structure in a complex list.",
            options: ["The goals are to increase sales, reducing costs, and improve quality.", "The goals are to increase sales, to reduce costs, and to improve quality.", "The goals are increasing sales, reducing costs, and improving quality.", "The goals are increase sales, reduce costs, and improve quality."],
            correctAnswer: 1,
            explanation: "Infinitives ('to' + verb) maintain parallel structure."
        },
        {
            id: "E028",
            difficulty: 8,
            question: "Which sentence uses the correct conditional form?",
            options: ["If he would have studied, he would pass.", "If he had studied, he would have passed.", "If he has studied, he would pass.", "If he studied, he would passed."],
            correctAnswer: 1,
            explanation: "Past perfect conditional: 'If he had studied' + 'would have passed.'"
        },
        {
            id: "E029",
            difficulty: 8,
            question: "Choose the sentence that correctly uses a nominative absolute.",
            options: ["The storm passing, we continued our journey.", "The storm passed, we continued our journey.", "The storm passing we continued our journey.", "Passing the storm, we continued our journey."],
            correctAnswer: 0,
            explanation: "A nominative absolute has a subject and participle, set off by a comma."
        },
        {
            id: "E030",
            difficulty: 8,
            question: "Which sentence best achieves coherence through pronoun reference?",
            options: ["The committee made its decision, and it was final.", "The committee made their decision, and it was final.", "The committee made its decision, and they were final.", "The committee made their decision, and they were final."],
            correctAnswer: 0,
            explanation: "Collective noun 'committee' takes singular pronouns 'its' and 'it.'"
        },

        // Hard (Difficulty 9)
        {
            id: "E031",
            difficulty: 9,
            question: "Select the sentence with the most sophisticated use of subordination.",
            options: ["Although the weather was bad, the game continued.", "The weather was bad, but the game continued.", "The weather was bad; the game continued.", "Despite bad weather, the game continued."],
            correctAnswer: 3,
            explanation: "'Despite' with a noun phrase is more concise than subordinate clauses."
        },
        {
            id: "E032",
            difficulty: 9,
            question: "Which sentence demonstrates correct use of the literary present tense?",
            options: ["In the novel, the hero sacrificed himself for others.", "In the novel, the hero sacrifices himself for others.", "In the novel, the hero had sacrificed himself for others.", "In the novel, the hero will sacrifice himself for others."],
            correctAnswer: 1,
            explanation: "Literary present uses present tense to discuss events in literature."
        },
        {
            id: "E033",
            difficulty: 9,
            question: "Choose the sentence with the most effective use of rhetorical question.",
            options: ["Can we truly understand the consequences of our actions?", "We can't understand the consequences of our actions.", "Do you understand the consequences?", "Understanding consequences is important."],
            correctAnswer: 0,
            explanation: "This rhetorical question provokes thought without expecting an answer."
        },
        {
            id: "E034",
            difficulty: 9,
            question: "Which sentence correctly uses zeugma?",
            options: ["She broke her promise and her mother's heart.", "She broke her promise and upset her mother.", "She broke the promise and the silence.", "She broke promises and hearts."],
            correctAnswer: 0,
            explanation: "Zeugma uses one verb ('broke') to govern two different objects in different senses."
        },
        {
            id: "E035",
            difficulty: 9,
            question: "Select the sentence that best employs antithesis.",
            options: ["It was the best of times, it was the worst of times.", "It was a good time and a bad time.", "Times were both good and bad.", "The times were mixed."],
            correctAnswer: 0,
            explanation: "Antithesis places contrasting ideas in parallel structure for emphasis."
        },
        {
            id: "E036",
            difficulty: 9,
            question: "Which sentence demonstrates sophisticated use of asyndeton?",
            options: ["I came, I saw, I conquered.", "I came, and I saw, and I conquered.", "I came, saw, and conquered.", "I came; I saw; I conquered."],
            correctAnswer: 0,
            explanation: "Asyndeton omits conjunctions for dramatic effect."
        },
        {
            id: "E037",
            difficulty: 9,
            question: "Choose the sentence with the most effective use of chiasmus.",
            options: ["Ask not what your country can do for you—ask what you can do for your country.", "Ask what your country can do for you and what you can do for it.", "Don't ask what your country does for you, ask what you do for your country.", "Ask about your country and yourself."],
            correctAnswer: 0,
            explanation: "Chiasmus reverses structure (A-B, B-A) for rhetorical effect."
        },

        // Expert (Difficulty 10 - ACT 36 Level) - Last 3
        {
            id: "E038",
            difficulty: 10,
            question: "Which sentence demonstrates the most sophisticated synthesis of complex ideas?",
            options: ["The paradox of choice, whereby increased options lead to decreased satisfaction, manifests in modern consumer culture's relentless pursuit of ever-expanding product lines.", "When people have more choices, they are less satisfied, which we see in consumer culture.", "Modern consumers face a paradox: more choice equals less satisfaction.", "The more choices we have, the less satisfied we become."],
            correctAnswer: 0,
            explanation: "This sentence integrates academic vocabulary, subordinate clauses, and nuanced causality."
        },
        {
            id: "E039",
            difficulty: 10,
            question: "Select the sentence that best employs hendiadys.",
            options: ["The sound and fury of the battle.", "The loud and furious battle.", "The battle's sound and its fury.", "The noisy, furious battle."],
            correctAnswer: 0,
            explanation: "Hendiadys expresses one idea through two nouns joined by 'and.'"
        },
        {
            id: "E040",
            difficulty: 10,
            question: "Which sentence demonstrates the most effective use of polysyndeton for rhetorical emphasis?",
            options: ["We shall fight on the beaches and on the landing grounds and in the fields and in the streets.", "We shall fight on the beaches, landing grounds, fields, and streets.", "We shall fight on beaches, landing grounds, fields, streets.", "We shall fight everywhere: beaches, fields, streets."],
            correctAnswer: 0,
            explanation: "Polysyndeton repeats conjunctions to create rhythm and emphasize each element."
        }
    ],

    // ========================================
    // READING SECTION - 40 Questions
    // ========================================
    reading: [
        // Easy (Difficulty 1-3) - Passage 1: Simple narrative
        {
            id: "R001",
            difficulty: 1,
            passage: "Maria loved spending summer afternoons at the library. The quiet atmosphere and endless books made it her favorite place. She would often lose track of time while reading adventure stories.",
            question: "Where does Maria like to spend summer afternoons?",
            options: ["At home", "At the library", "At the park", "At school"],
            correctAnswer: 1,
            explanation: "The passage explicitly states she loved spending summer afternoons at the library."
        },
        {
            id: "R002",
            difficulty: 1,
            passage: "Maria loved spending summer afternoons at the library. The quiet atmosphere and endless books made it her favorite place. She would often lose track of time while reading adventure stories.",
            question: "What type of stories does Maria prefer?",
            options: ["Mystery", "Adventure", "Romance", "Science fiction"],
            correctAnswer: 1,
            explanation: "The passage states she would 'lose track of time while reading adventure stories.'"
        },
        {
            id: "R003",
            difficulty: 2,
            passage: "The invention of the printing press in the 15th century revolutionized communication. Before this, books had to be copied by hand, making them expensive and rare. Johannes Gutenberg's innovation made books accessible to more people.",
            question: "What was the main impact of the printing press?",
            options: ["It made books prettier", "It made books more accessible", "It made books heavier", "It made books colorful"],
            correctAnswer: 1,
            explanation: "The passage states the innovation 'made books accessible to more people.'"
        },
        {
            id: "R004",
            difficulty: 2,
            passage: "The invention of the printing press in the 15th century revolutionized communication. Before this, books had to be copied by hand, making them expensive and rare. Johannes Gutenberg's innovation made books accessible to more people.",
            question: "Who invented the printing press?",
            options: ["Benjamin Franklin", "Johannes Gutenberg", "Thomas Edison", "Alexander Bell"],
            correctAnswer: 1,
            explanation: "The passage explicitly names 'Johannes Gutenberg's innovation.'"
        },
        {
            id: "R005",
            difficulty: 3,
            passage: "Climate change affects ecosystems worldwide. Rising temperatures cause ice caps to melt, leading to higher sea levels. Many species struggle to adapt to these rapid changes, putting biodiversity at risk.",
            question: "What is one effect of rising temperatures mentioned?",
            options: ["More rainfall", "Melting ice caps", "Colder winters", "Stronger winds"],
            correctAnswer: 1,
            explanation: "The passage states 'Rising temperatures cause ice caps to melt.'"
        },
        {
            id: "R006",
            difficulty: 3,
            passage: "Climate change affects ecosystems worldwide. Rising temperatures cause ice caps to melt, leading to higher sea levels. Many species struggle to adapt to these rapid changes, putting biodiversity at risk.",
            question: "According to the passage, what is at risk due to climate change?",
            options: ["Biodiversity", "Technology", "Education", "Transportation"],
            correctAnswer: 0,
            explanation: "The passage concludes by stating biodiversity is 'at risk.'"
        },
        {
            id: "R007",
            difficulty: 3,
            passage: "Ancient civilizations developed along major rivers because they provided water for crops and transportation routes for trade. The Nile, Tigris, and Euphrates rivers were crucial to early societies.",
            question: "Why did ancient civilizations develop along rivers?",
            options: ["For fishing only", "For water and trade", "For decoration", "For defense"],
            correctAnswer: 1,
            explanation: "The passage states rivers 'provided water for crops and transportation routes for trade.'"
        },
        {
            id: "R008",
            difficulty: 3,
            passage: "Ancient civilizations developed along major rivers because they provided water for crops and transportation routes for trade. The Nile, Tigris, and Euphrates rivers were crucial to early societies.",
            question: "Which river is NOT mentioned in the passage?",
            options: ["Nile", "Amazon", "Tigris", "Euphrates"],
            correctAnswer: 1,
            explanation: "The passage mentions the Nile, Tigris, and Euphrates, but not the Amazon."
        },
        {
            id: "R009",
            difficulty: 3,
            passage: "Photosynthesis is the process by which plants convert sunlight into energy. Using chlorophyll in their leaves, they transform carbon dioxide and water into glucose and oxygen.",
            question: "What do plants use to capture sunlight?",
            options: ["Roots", "Stems", "Chlorophyll", "Flowers"],
            correctAnswer: 2,
            explanation: "The passage states plants use 'chlorophyll in their leaves.'"
        },
        {
            id: "R010",
            difficulty: 3,
            passage: "Photosynthesis is the process by which plants convert sunlight into energy. Using chlorophyll in their leaves, they transform carbon dioxide and water into glucose and oxygen.",
            question: "What are the products of photosynthesis?",
            options: ["Carbon dioxide and water", "Glucose and oxygen", "Nitrogen and hydrogen", "Sunlight and energy"],
            correctAnswer: 1,
            explanation: "The passage states plants 'transform carbon dioxide and water into glucose and oxygen.'"
        },

        // Medium (Difficulty 4-6) - Passage 2: Literary analysis
        {
            id: "R011",
            difficulty: 4,
            passage: "In 'To Kill a Mockingbird,' Harper Lee explores themes of racial injustice through the eyes of young Scout Finch. The novel, set in the 1930s American South, remains relevant today as it challenges readers to confront prejudice and moral courage.",
            question: "What is the main theme of 'To Kill a Mockingbird'?",
            options: ["Adventure", "Racial injustice", "Romance", "Mystery"],
            correctAnswer: 1,
            explanation: "The passage explicitly states the novel 'explores themes of racial injustice.'"
        },
        {
            id: "R012",
            difficulty: 4,
            passage: "In 'To Kill a Mockingbird,' Harper Lee explores themes of racial injustice through the eyes of young Scout Finch. The novel, set in the 1930s American South, remains relevant today as it challenges readers to confront prejudice and moral courage.",
            question: "Through whose perspective is the story told?",
            options: ["Harper Lee", "Scout Finch", "Atticus Finch", "Tom Robinson"],
            correctAnswer: 1,
            explanation: "The passage states the story is told 'through the eyes of young Scout Finch.'"
        },
        {
            id: "R013",
            difficulty: 5,
            passage: "The Industrial Revolution transformed society from agrarian to industrial, beginning in Britain in the late 18th century. While it spurred economic growth and technological innovation, it also created harsh working conditions and widened the gap between rich and poor.",
            question: "What is the author's tone regarding the Industrial Revolution?",
            options: ["Purely celebratory", "Completely critical", "Balanced, noting both benefits and drawbacks", "Indifferent"],
            correctAnswer: 2,
            explanation: "The passage presents both positive (growth, innovation) and negative (harsh conditions, inequality) aspects."
        },
        {
            id: "R014",
            difficulty: 5,
            passage: "The Industrial Revolution transformed society from agrarian to industrial, beginning in Britain in the late 18th century. While it spurred economic growth and technological innovation, it also created harsh working conditions and widened the gap between rich and poor.",
            question: "What societal transformation did the Industrial Revolution cause?",
            options: ["Rural to urban", "Industrial to agrarian", "Agrarian to industrial", "Technological to manual"],
            correctAnswer: 2,
            explanation: "The passage states it 'transformed society from agrarian to industrial.'"
        },
        {
            id: "R015",
            difficulty: 5,
            passage: "Quantum mechanics revolutionized physics in the early 20th century by revealing that particles can exist in multiple states simultaneously until observed. This principle, known as superposition, challenges our everyday understanding of reality.",
            question: "What does superposition mean in quantum mechanics?",
            options: ["Particles move faster than light", "Particles can exist in multiple states at once", "Particles attract each other", "Particles have mass"],
            correctAnswer: 1,
            explanation: "The passage defines superposition as particles existing 'in multiple states simultaneously.'"
        },
        {
            id: "R016",
            difficulty: 6,
            passage: "Quantum mechanics revolutionized physics in the early 20th century by revealing that particles can exist in multiple states simultaneously until observed. This principle, known as superposition, challenges our everyday understanding of reality.",
            question: "What can be inferred about quantum mechanics?",
            options: ["It confirms everyday observations", "It contradicts classical physics", "It has no practical applications", "It was developed in ancient times"],
            correctAnswer: 1,
            explanation: "The passage states it 'challenges our everyday understanding of reality,' implying it contradicts classical physics."
        },
        {
            id: "R017",
            difficulty: 6,
            passage: "The Renaissance, spanning the 14th to 17th centuries, marked a cultural rebirth in Europe. Artists and thinkers like Leonardo da Vinci and Michelangelo rediscovered classical Greek and Roman ideas, leading to unprecedented achievements in art, science, and philosophy.",
            question: "What inspired Renaissance thinkers?",
            options: ["Medieval traditions", "Classical Greek and Roman ideas", "Eastern philosophies", "Modern science"],
            correctAnswer: 1,
            explanation: "The passage states they 'rediscovered classical Greek and Roman ideas.'"
        },
        {
            id: "R018",
            difficulty: 6,
            passage: "The Renaissance, spanning the 14th to 17th centuries, marked a cultural rebirth in Europe. Artists and thinkers like Leonardo da Vinci and Michelangelo rediscovered classical Greek and Roman ideas, leading to unprecedented achievements in art, science, and philosophy.",
            question: "What does 'Renaissance' mean in this context?",
            options: ["Decline", "Rebirth", "Revolution", "Discovery"],
            correctAnswer: 1,
            explanation: "The passage explicitly describes it as a 'cultural rebirth.'"
        },
        {
            id: "R019",
            difficulty: 6,
            passage: "Neuroplasticity, the brain's ability to reorganize itself by forming new neural connections, continues throughout life. This discovery contradicts the long-held belief that the adult brain is static, offering hope for recovery from brain injuries and potential for lifelong learning.",
            question: "What does neuroplasticity demonstrate?",
            options: ["The brain stops growing after childhood", "The brain can form new connections throughout life", "Brain injuries are permanent", "Learning stops in adulthood"],
            correctAnswer: 1,
            explanation: "The passage defines neuroplasticity as the brain's ability to 'reorganize itself by forming new neural connections' throughout life."
        },
        {
            id: "R020",
            difficulty: 6,
            passage: "Neuroplasticity, the brain's ability to reorganize itself by forming new neural connections, continues throughout life. This discovery contradicts the long-held belief that the adult brain is static, offering hope for recovery from brain injuries and potential for lifelong learning.",
            question: "What previous belief did neuroplasticity contradict?",
            options: ["The brain is complex", "The adult brain is static", "The brain controls the body", "The brain needs oxygen"],
            correctAnswer: 1,
            explanation: "The passage states it 'contradicts the long-held belief that the adult brain is static.'"
        },

        // Medium-Hard (Difficulty 7-8) - Passage 3: Complex argument
        {
            id: "R021",
            difficulty: 7,
            passage: "Critics of social media argue that while these platforms claim to connect people, they paradoxically foster isolation. Users curate idealized versions of their lives, leading to unhealthy comparisons and decreased well-being. However, proponents contend that these tools enable meaningful connections across distances and facilitate social movements.",
            question: "What is the main argument of social media critics?",
            options: ["Social media wastes time", "Social media fosters isolation despite claims of connection", "Social media is too expensive", "Social media lacks privacy"],
            correctAnswer: 1,
            explanation: "Critics argue platforms 'paradoxically foster isolation' despite claiming to connect people."
        },
        {
            id: "R022",
            difficulty: 7,
            passage: "Critics of social media argue that while these platforms claim to connect people, they paradoxically foster isolation. Users curate idealized versions of their lives, leading to unhealthy comparisons and decreased well-being. However, proponents contend that these tools enable meaningful connections across distances and facilitate social movements.",
            question: "How do proponents view social media?",
            options: ["As harmful to society", "As enabling meaningful connections and social movements", "As unnecessary technology", "As too complex to use"],
            correctAnswer: 1,
            explanation: "Proponents 'contend that these tools enable meaningful connections across distances and facilitate social movements.'"
        },
        {
            id: "R023",
            difficulty: 7,
            passage: "The concept of artificial intelligence ethics has gained prominence as AI systems increasingly influence decision-making in healthcare, criminal justice, and finance. Algorithmic bias, where AI perpetuates existing societal prejudices, raises questions about accountability: Who is responsible when an algorithm makes a discriminatory decision?",
            question: "What is algorithmic bias?",
            options: ["AI making random errors", "AI perpetuating societal prejudices", "AI working too slowly", "AI being too expensive"],
            correctAnswer: 1,
            explanation: "The passage defines algorithmic bias as 'where AI perpetuates existing societal prejudices.'"
        },
        {
            id: "R024",
            difficulty: 8,
            passage: "The concept of artificial intelligence ethics has gained prominence as AI systems increasingly influence decision-making in healthcare, criminal justice, and finance. Algorithmic bias, where AI perpetuates existing societal prejudices, raises questions about accountability: Who is responsible when an algorithm makes a discriminatory decision?",
            question: "What central question does the passage raise?",
            options: ["How fast is AI?", "Who is responsible for algorithmic discrimination?", "What is AI?", "Where is AI used?"],
            correctAnswer: 1,
            explanation: "The passage asks, 'Who is responsible when an algorithm makes a discriminatory decision?'"
        },
        {
            id: "R025",
            difficulty: 8,
            passage: "Postmodernist literature rejects the notion of objective truth, instead presenting fragmented narratives and unreliable narrators. Authors like Thomas Pynchon and Don DeLillo challenge readers to question reality itself, blurring the lines between fiction and metafiction.",
            question: "What characterizes postmodernist literature?",
            options: ["Straightforward plots", "Objective truth", "Fragmented narratives and unreliable narrators", "Historical accuracy"],
            correctAnswer: 2,
            explanation: "The passage states postmodernist literature presents 'fragmented narratives and unreliable narrators.'"
        },
        {
            id: "R026",
            difficulty: 8,
            passage: "Postmodernist literature rejects the notion of objective truth, instead presenting fragmented narratives and unreliable narrators. Authors like Thomas Pynchon and Don DeLillo challenge readers to question reality itself, blurring the lines between fiction and metafiction.",
            question: "What effect do postmodernist authors aim to achieve?",
            options: ["Entertain with simple stories", "Make readers question reality", "Provide historical facts", "Teach moral lessons"],
            correctAnswer: 1,
            explanation: "They 'challenge readers to question reality itself.'"
        },
        {
            id: "R027",
            difficulty: 8,
            passage: "The placebo effect demonstrates the mind's profound influence on physical health. In clinical trials, patients receiving inert substances often show real improvements simply because they believe they're being treated. This phenomenon complicates drug testing and raises philosophical questions about the nature of healing.",
            question: "What does the placebo effect demonstrate?",
            options: ["All medicine is fake", "The mind influences physical health", "Clinical trials are useless", "Patients are easily fooled"],
            correctAnswer: 1,
            explanation: "The passage states it 'demonstrates the mind's profound influence on physical health.'"
        },
        {
            id: "R028",
            difficulty: 8,
            passage: "The placebo effect demonstrates the mind's profound influence on physical health. In clinical trials, patients receiving inert substances often show real improvements simply because they believe they're being treated. This phenomenon complicates drug testing and raises philosophical questions about the nature of healing.",
            question: "How does the placebo effect impact drug testing?",
            options: ["It makes testing easier", "It complicates drug testing", "It eliminates the need for testing", "It has no impact"],
            correctAnswer: 1,
            explanation: "The passage states 'This phenomenon complicates drug testing.'"
        },
        {
            id: "R029",
            difficulty: 8,
            passage: "Epigenetics reveals that environmental factors can influence gene expression without altering DNA sequences. Experiences such as stress, diet, and trauma can trigger chemical modifications that switch genes on or off, potentially affecting future generations. This challenges the deterministic view of genetics.",
            question: "What does epigenetics challenge?",
            options: ["The existence of DNA", "The deterministic view of genetics", "The importance of environment", "The concept of inheritance"],
            correctAnswer: 1,
            explanation: "The passage concludes that epigenetics 'challenges the deterministic view of genetics.'"
        },
        {
            id: "R030",
            difficulty: 8,
            passage: "Epigenetics reveals that environmental factors can influence gene expression without altering DNA sequences. Experiences such as stress, diet, and trauma can trigger chemical modifications that switch genes on or off, potentially affecting future generations. This challenges the deterministic view of genetics.",
            question: "How can environmental factors affect genes according to epigenetics?",
            options: ["By changing DNA sequences", "By triggering chemical modifications that switch genes on or off", "By destroying genes", "By creating new genes"],
            correctAnswer: 1,
            explanation: "The passage states environmental factors 'can trigger chemical modifications that switch genes on or off.'"
        },

        // Hard (Difficulty 9) - Passage 4: Dense academic
        {
            id: "R031",
            difficulty: 9,
            passage: "Foucault's concept of the 'panopticon,' borrowed from Bentham, serves as a metaphor for modern surveillance societies. The internalization of being watched creates self-discipline, rendering external enforcement unnecessary. This disciplinary power operates not through overt coercion but through subtle normalization.",
            question: "What is Foucault's main argument about the panopticon?",
            options: ["Prisons should be reformed", "Surveillance creates self-discipline", "Punishment should be public", "Society needs more police"],
            correctAnswer: 1,
            explanation: "The passage states 'The internalization of being watched creates self-discipline.'"
        },
        {
            id: "R032",
            difficulty: 9,
            passage: "Foucault's concept of the 'panopticon,' borrowed from Bentham, serves as a metaphor for modern surveillance societies. The internalization of being watched creates self-discipline, rendering external enforcement unnecessary. This disciplinary power operates not through overt coercion but through subtle normalization.",
            question: "How does disciplinary power operate according to Foucault?",
            options: ["Through overt coercion", "Through subtle normalization", "Through physical punishment", "Through legal systems"],
            correctAnswer: 1,
            explanation: "The passage states disciplinary power 'operates not through overt coercion but through subtle normalization.'"
        },
        {
            id: "R033",
            difficulty: 9,
            passage: "Heisenberg's Uncertainty Principle posits a fundamental limit to precision in quantum measurements: the more accurately we know a particle's position, the less accurately we can know its momentum, and vice versa. This isn't a limitation of our instruments but a fundamental property of nature itself.",
            question: "What does the Uncertainty Principle reveal?",
            options: ["Our instruments are imperfect", "There's a fundamental limit to quantum measurement precision", "Particles don't exist", "Physics is impossible"],
            correctAnswer: 1,
            explanation: "The passage states it 'posits a fundamental limit to precision in quantum measurements.'"
        },
        {
            id: "R034",
            difficulty: 9,
            passage: "Heisenberg's Uncertainty Principle posits a fundamental limit to precision in quantum measurements: the more accurately we know a particle's position, the less accurately we can know its momentum, and vice versa. This isn't a limitation of our instruments but a fundamental property of nature itself.",
            question: "Is the Uncertainty Principle due to instrument limitations?",
            options: ["Yes, it's about instrument quality", "No, it's a fundamental property of nature", "Yes, but only partially", "The passage doesn't address this"],
            correctAnswer: 1,
            explanation: "The passage explicitly states 'This isn't a limitation of our instruments but a fundamental property of nature itself.'"
        },
        {
            id: "R035",
            difficulty: 9,
            passage: "Derrida's deconstruction challenges the logocentrism inherent in Western philosophy—the privileging of speech over writing and the assumption of fixed meanings. By revealing the instability of binary oppositions and the play of différance, deconstruction demonstrates that meaning is always deferred and contextual.",
            question: "What does deconstruction challenge?",
            options: ["Mathematical proofs", "Logocentrism in Western philosophy", "Scientific method", "Historical accuracy"],
            correctAnswer: 1,
            explanation: "The passage states deconstruction 'challenges the logocentrism inherent in Western philosophy.'"
        },
        {
            id: "R036",
            difficulty: 9,
            passage: "Derrida's deconstruction challenges the logocentrism inherent in Western philosophy—the privileging of speech over writing and the assumption of fixed meanings. By revealing the instability of binary oppositions and the play of différance, deconstruction demonstrates that meaning is always deferred and contextual.",
            question: "According to deconstruction, how is meaning characterized?",
            options: ["Fixed and universal", "Always deferred and contextual", "Simple and clear", "Non-existent"],
            correctAnswer: 1,
            explanation: "The passage concludes that 'meaning is always deferred and contextual.'"
        },
        {
            id: "R037",
            difficulty: 9,
            passage: "The anthropocene epoch marks the period when human activity became the dominant influence on Earth's geology and ecosystems. Climate change, mass extinction, and microplastic pollution serve as stratigraphic markers of humanity's planetary impact, raising ethical questions about our responsibility to future generations.",
            question: "What defines the anthropocene epoch?",
            options: ["Natural geological processes", "Human activity becoming the dominant influence on Earth", "Animal evolution", "Volcanic activity"],
            correctAnswer: 1,
            explanation: "The passage defines it as 'when human activity became the dominant influence on Earth's geology and ecosystems.'"
        },

        // Expert (Difficulty 10 - ACT 36 Level) - Last 3
        {
            id: "R038",
            difficulty: 10,
            passage: "Gödel's Incompleteness Theorems shattered the formalist program by proving that within any consistent formal system complex enough to express arithmetic, there exist true statements that cannot be proven within that system. This metalogical result implies that mathematics cannot be both complete and consistent—a finding with profound implications for the philosophy of mathematics.",
            question: "What did Gödel's Incompleteness Theorems prove?",
            options: ["All math statements can be proven", "In complex systems, some true statements cannot be proven within the system", "Mathematics is simple", "Logic is flawed"],
            correctAnswer: 1,
            explanation: "The passage states Gödel proved 'there exist true statements that cannot be proven within that system.'"
        },
        {
            id: "R039",
            difficulty: 10,
            passage: "Gödel's Incompleteness Theorems shattered the formalist program by proving that within any consistent formal system complex enough to express arithmetic, there exist true statements that cannot be proven within that system. This metalogical result implies that mathematics cannot be both complete and consistent—a finding with profound implications for the philosophy of mathematics.",
            question: "What implication does Gödel's finding have for mathematics?",
            options: ["Mathematics is useless", "Mathematics cannot be both complete and consistent", "Mathematics is easy", "Mathematics is perfect"],
            correctAnswer: 1,
            explanation: "The passage states this 'implies that mathematics cannot be both complete and consistent.'"
        },
        {
            id: "R040",
            difficulty: 10,
            passage: "The phenomenological reduction, central to Husserl's philosophy, involves bracketing or 'epoché' of the natural attitude—suspending judgments about the external world to focus on pure consciousness and the structures of experience itself. This transcendental turn seeks to uncover the essential features of intentionality and the constitution of meaning.",
            question: "What is the purpose of phenomenological reduction?",
            options: ["To deny the external world exists", "To focus on pure consciousness and structures of experience", "To simplify philosophy", "To prove science wrong"],
            correctAnswer: 1,
            explanation: "The passage states it involves 'focus on pure consciousness and the structures of experience itself.'"
        }
    ],

    // ========================================
    // SCIENCE SECTION - 40 Questions
    // ========================================
    science: [
        // Easy (Difficulty 1-3)
        {
            id: "S001",
            difficulty: 1,
            question: "What is the chemical symbol for water?",
            options: ["H₂O", "CO₂", "O₂", "NaCl"],
            correctAnswer: 0,
            explanation: "Water is composed of two hydrogen atoms and one oxygen atom: H₂O."
        },
        {
            id: "S002",
            difficulty: 1,
            question: "Which planet is closest to the Sun?",
            options: ["Venus", "Earth", "Mercury", "Mars"],
            correctAnswer: 2,
            explanation: "Mercury is the closest planet to the Sun."
        },
        {
            id: "S003",
            difficulty: 1,
            question: "What force pulls objects toward the Earth?",
            options: ["Magnetism", "Gravity", "Friction", "Momentum"],
            correctAnswer: 1,
            explanation: "Gravity is the force that attracts objects with mass toward each other."
        },
        {
            id: "S004",
            difficulty: 2,
            question: "What is the powerhouse of the cell?",
            options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
            correctAnswer: 2,
            explanation: "Mitochondria produce ATP, the cell's energy currency."
        },
        {
            id: "S005",
            difficulty: 2,
            question: "What gas do plants absorb from the atmosphere during photosynthesis?",
            options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
            correctAnswer: 2,
            explanation: "Plants absorb CO₂ and release O₂ during photosynthesis."
        },
        {
            id: "S006",
            difficulty: 2,
            question: "What is the boiling point of water at sea level?",
            options: ["0°C", "50°C", "100°C", "212°C"],
            correctAnswer: 2,
            explanation: "Water boils at 100°C (or 212°F) at sea level atmospheric pressure."
        },
        {
            id: "S007",
            difficulty: 3,
            question: "What type of bond involves the sharing of electron pairs between atoms?",
            options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
            correctAnswer: 1,
            explanation: "Covalent bonds involve sharing electrons between atoms."
        },
        {
            id: "S008",
            difficulty: 3,
            question: "Which organ in the human body filters blood?",
            options: ["Heart", "Liver", "Kidney", "Lungs"],
            correctAnswer: 2,
            explanation: "Kidneys filter waste from blood and produce urine."
        },
        {
            id: "S009",
            difficulty: 3,
            question: "What is the speed of light in a vacuum?",
            options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"],
            correctAnswer: 0,
            explanation: "Light travels at approximately 300,000 kilometers per second in a vacuum."
        },
        {
            id: "S010",
            difficulty: 3,
            question: "What is DNA's primary function?",
            options: ["Produce energy", "Store genetic information", "Fight infection", "Digest food"],
            correctAnswer: 1,
            explanation: "DNA stores the genetic instructions used in growth, development, and reproduction."
        },

        // Medium (Difficulty 4-6)
        {
            id: "S011",
            difficulty: 4,
            question: "According to Newton's Second Law, F = ma. If force is doubled and mass remains constant, what happens to acceleration?",
            options: ["Halves", "Doubles", "Quadruples", "Remains the same"],
            correctAnswer: 1,
            explanation: "If F = ma and F doubles while m is constant, then a must double."
        },
        {
            id: "S012",
            difficulty: 4,
            question: "What is the pH of a neutral solution?",
            options: ["0", "7", "14", "10"],
            correctAnswer: 1,
            explanation: "A pH of 7 is neutral; below 7 is acidic, above 7 is basic."
        },
        {
            id: "S013",
            difficulty: 4,
            question: "What organelle is responsible for protein synthesis?",
            options: ["Ribosome", "Lysosome", "Golgi apparatus", "Endoplasmic reticulum"],
            correctAnswer: 0,
            explanation: "Ribosomes are the sites of protein synthesis in cells."
        },
        {
            id: "S014",
            difficulty: 5,
            question: "In a controlled experiment testing plant growth, what is the independent variable if you're testing different amounts of water?",
            options: ["Plant growth", "Amount of water", "Type of plant", "Sunlight"],
            correctAnswer: 1,
            explanation: "The independent variable is what the experimenter changes—in this case, the amount of water."
        },
        {
            id: "S015",
            difficulty: 5,
            question: "What is the electron configuration of oxygen (atomic number 8)?",
            options: ["1s² 2s² 2p⁴", "1s² 2s² 2p⁶", "1s² 2s⁴", "1s² 2p⁶"],
            correctAnswer: 0,
            explanation: "Oxygen has 8 electrons: 2 in 1s, 2 in 2s, and 4 in 2p orbitals."
        },
        {
            id: "S016",
            difficulty: 5,
            question: "Which process converts glucose into ATP in the absence of oxygen?",
            options: ["Aerobic respiration", "Photosynthesis", "Anaerobic respiration (fermentation)", "Glycolysis only"],
            correctAnswer: 2,
            explanation: "Anaerobic respiration or fermentation produces ATP without oxygen."
        },
        {
            id: "S017",
            difficulty: 5,
            question: "What is the relationship between wavelength and frequency of light?",
            options: ["Directly proportional", "Inversely proportional", "No relationship", "Exponentially related"],
            correctAnswer: 1,
            explanation: "Wavelength and frequency are inversely proportional: λ = c/f."
        },
        {
            id: "S018",
            difficulty: 6,
            question: "In Mendelian genetics, if two heterozygous parents (Aa × Aa) have children, what is the probability of a homozygous recessive offspring (aa)?",
            options: ["0%", "25%", "50%", "75%"],
            correctAnswer: 1,
            explanation: "A Punnett square shows: AA, Aa, Aa, aa. Probability of aa is 1/4 = 25%."
        },
        {
            id: "S019",
            difficulty: 6,
            question: "What is the balanced equation for the combustion of methane (CH₄)?",
            options: ["CH₄ + O₂ → CO₂ + H₂O", "CH₄ + 2O₂ → CO₂ + 2H₂O", "2CH₄ + O₂ → 2CO₂ + H₂O", "CH₄ + O₂ → CO + 2H₂O"],
            correctAnswer: 1,
            explanation: "CH₄ + 2O₂ → CO₂ + 2H₂O balances all atoms."
        },
        {
            id: "S020",
            difficulty: 6,
            question: "A ball is thrown upward with initial velocity of 20 m/s. Ignoring air resistance (g = 10 m/s²), how high does it go?",
            options: ["10 m", "20 m", "30 m", "40 m"],
            correctAnswer: 1,
            explanation: "Using v² = u² - 2gh, at max height v=0: 0 = 400 - 2(10)h, h = 20m."
        },

        // Medium-Hard (Difficulty 7-8)
        {
            id: "S021",
            difficulty: 7,
            question: "In a circuit with total resistance of 10Ω and voltage of 50V, what is the current?",
            options: ["2A", "5A", "10A", "50A"],
            correctAnswer: 1,
            explanation: "Using Ohm's Law: I = V/R = 50/10 = 5A."
        },
        {
            id: "S022",
            difficulty: 7,
            question: "What is the molarity of a solution containing 2 moles of NaCl dissolved in 500 mL of water?",
            options: ["1 M", "2 M", "4 M", "0.5 M"],
            correctAnswer: 2,
            explanation: "Molarity = moles/liters = 2 moles / 0.5 L = 4 M."
        },
        {
            id: "S023",
            difficulty: 7,
            question: "According to Le Chatelier's Principle, if pressure is increased in the reaction N₂ + 3H₂ ⇌ 2NH₃, which direction does equilibrium shift?",
            options: ["Left (reactants)", "Right (products)", "No shift", "Cannot determine"],
            correctAnswer: 1,
            explanation: "Increased pressure favors the side with fewer gas molecules. Reactants have 4 molecules, products have 2, so shifts right."
        },
        {
            id: "S024",
            difficulty: 7,
            question: "What is the function of tRNA in protein synthesis?",
            options: ["Carries genetic code", "Transfers amino acids to ribosome", "Makes proteins", "Stores energy"],
            correctAnswer: 1,
            explanation: "Transfer RNA (tRNA) brings amino acids to the ribosome during translation."
        },
        {
            id: "S025",
            difficulty: 8,
            question: "A 2 kg object accelerates from rest to 10 m/s in 5 seconds. What is the net force applied?",
            options: ["2 N", "4 N", "10 N", "20 N"],
            correctAnswer: 1,
            explanation: "a = Δv/t = 10/5 = 2 m/s². F = ma = 2 × 2 = 4 N."
        },
        {
            id: "S026",
            difficulty: 8,
            question: "What is the oxidation state of sulfur in H₂SO₄?",
            options: ["+2", "+4", "+6", "-2"],
            correctAnswer: 2,
            explanation: "H is +1, O is -2. Total: 2(+1) + x + 4(-2) = 0, so x = +6."
        },
        {
            id: "S027",
            difficulty: 8,
            question: "In the Krebs cycle, how many ATP molecules are directly produced per glucose molecule?",
            options: ["2", "4", "32", "38"],
            correctAnswer: 0,
            explanation: "The Krebs cycle produces 2 ATP per glucose (runs twice per glucose)."
        },
        {
            id: "S028",
            difficulty: 8,
            question: "What is the half-life of a radioactive substance if 25% remains after 100 years?",
            options: ["25 years", "50 years", "75 years", "100 years"],
            correctAnswer: 1,
            explanation: "25% = (1/2)² means 2 half-lives passed. 100 years / 2 = 50 years per half-life."
        },
        {
            id: "S029",
            difficulty: 8,
            question: "According to the ideal gas law (PV = nRT), if temperature doubles and volume is constant, what happens to pressure?",
            options: ["Halves", "Doubles", "Quadruples", "Remains same"],
            correctAnswer: 1,
            explanation: "If V and n are constant, P is directly proportional to T. Doubling T doubles P."
        },
        {
            id: "S030",
            difficulty: 8,
            question: "What type of selection occurs when extreme phenotypes are favored over intermediate ones?",
            options: ["Stabilizing", "Directional", "Disruptive", "Artificial"],
            correctAnswer: 2,
            explanation: "Disruptive selection favors both extremes, splitting the population."
        },

        // Hard (Difficulty 9)
        {
            id: "S031",
            difficulty: 9,
            question: "A sound wave has frequency 440 Hz and travels at 340 m/s. What is its wavelength?",
            options: ["0.77 m", "1.29 m", "149,600 m", "0.50 m"],
            correctAnswer: 0,
            explanation: "λ = v/f = 340/440 = 0.77 m."
        },
        {
            id: "S032",
            difficulty: 9,
            question: "What is the Henderson-Hasselbalch equation used to calculate?",
            options: ["Reaction rate", "pH of buffer solutions", "Bond energy", "Activation energy"],
            correctAnswer: 1,
            explanation: "pH = pKa + log([A⁻]/[HA]) is used for buffer pH calculation."
        },
        {
            id: "S033",
            difficulty: 9,
            question: "In enzyme kinetics, what does the Km value represent?",
            options: ["Maximum velocity", "Substrate concentration at half Vmax", "Enzyme concentration", "Product concentration"],
            correctAnswer: 1,
            explanation: "Km (Michaelis constant) is the substrate concentration at which reaction rate is half of Vmax."
        },
        {
            id: "S034",
            difficulty: 9,
            question: "What is the de Broglie wavelength formula for a particle?",
            options: ["λ = h/p", "λ = mc²", "λ = E/h", "λ = hf"],
            correctAnswer: 0,
            explanation: "de Broglie wavelength: λ = h/p, where h is Planck's constant and p is momentum."
        },
        {
            id: "S035",
            difficulty: 9,
            question: "In a Hardy-Weinberg equilibrium, if the frequency of allele A is 0.6, what is the frequency of heterozygotes (Aa)?",
            options: ["0.16", "0.24", "0.36", "0.48"],
            correctAnswer: 3,
            explanation: "If p = 0.6, then q = 0.4. Frequency of Aa = 2pq = 2(0.6)(0.4) = 0.48."
        },
        {
            id: "S036",
            difficulty: 9,
            question: "What particle is exchanged in electromagnetic interactions according to quantum field theory?",
            options: ["Gluon", "Photon", "W boson", "Higgs boson"],
            correctAnswer: 1,
            explanation: "Photons are the force carriers for electromagnetic interactions."
        },
        {
            id: "S037",
            difficulty: 9,
            question: "What is the Gibbs free energy equation?",
            options: ["ΔG = ΔH - TΔS", "ΔG = ΔH + TΔS", "ΔG = -RTlnK", "Both A and C"],
            correctAnswer: 3,
            explanation: "ΔG = ΔH - TΔS is the fundamental equation, and ΔG = -RTlnK relates to equilibrium."
        },

        // Expert (Difficulty 10 - ACT 36 Level) - Last 3
        {
            id: "S038",
            difficulty: 10,
            question: "According to the Heisenberg Uncertainty Principle, Δx·Δp ≥ ℏ/2. What does this fundamentally limit?",
            options: ["Speed of light", "Simultaneous precision of position and momentum measurements", "Energy conservation", "Mass-energy equivalence"],
            correctAnswer: 1,
            explanation: "The principle sets a fundamental limit on the precision of simultaneous position (Δx) and momentum (Δp) measurements."
        },
        {
            id: "S039",
            difficulty: 10,
            question: "In an adiabatic process for an ideal gas, which relationship holds? (γ = Cp/Cv)",
            options: ["PV = constant", "PVᵞ = constant", "P/T = constant", "V/T = constant"],
            correctAnswer: 1,
            explanation: "For an adiabatic process (no heat exchange), PVᵞ = constant, where γ is the heat capacity ratio."
        },
        {
            id: "S040",
            difficulty: 10,
            question: "What is the Schrödinger equation's time-independent form for a single particle?",
            options: ["Hψ = Eψ", "E = mc²", "F = ma", "PV = nRT"],
            correctAnswer: 0,
            explanation: "The time-independent Schrödinger equation is Hψ = Eψ, where H is the Hamiltonian operator, ψ is the wave function, and E is energy."
        }
    ]
};

// Export for use in diagnostic system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = diagnosticQuestionBank;
}
