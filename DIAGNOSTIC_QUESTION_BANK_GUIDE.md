# 🎯 Diagnostic Test Question Bank - Implementation Guide

## Overview

Comprehensive diagnostic test system for SAT/ACT/PSAT prep with **160 total questions**:
- **80 baseline questions** (difficulty 2-4) - For all students
- **80 advanced questions** (difficulty 5) - For high performers

## Features

### 1. **Adaptive Difficulty**
- Students scoring >70% get mixed baseline + advanced questions
- Students scoring ≤70% get only baseline questions
- Real-time difficulty adjustment based on performance

### 2. **Comprehensive Coverage**

**English (50 questions total)**
- Grammar (15)
- Punctuation (10)
- Rhetorical Skills (10)
- Sentence Structure (8)
- Word Choice (7)

**Reading (30 questions total)**
- Inference (12)
- Main Idea (6)
- Detail (6)
- Vocabulary (6)

**Math (60 questions total)**
- No Calculator (20)
- Calculator (40)
- Topics: Algebra, Geometry, Functions, Word Problems, Data Analysis

**Science (20 questions total - ACT only)**
- Data Interpretation (8)
- Experimental Design (6)
- Graph Interpretation (6)

### 3. **Score Estimation**

The system provides estimated scores for:
- **SAT:** 400-1600 scale
- **ACT:** 1-36 scale  
- **PSAT:** 320-1520 scale

**Calculation Formula:**
```javascript
SAT = 400 + (percentage/100) * 1200
ACT = 1 + (percentage/100) * 35
PSAT = 320 + (percentage/100) * 1200
```

## Implementation

### Step 1: Include the Question Bank

Add to your HTML:
```html
<script src="js/diagnostic-questions.js"></script>
```

### Step 2: Generate Diagnostic Test

```javascript
// Start a diagnostic test
const diagnosticQuestions = window.DiagnosticQuestions.baselineQuestions;

// Or use adaptive selection based on previous performance
const adaptiveQuestions = window.DiagnosticQuestions.getAdaptiveQuestions(75, 40);
// 75 = student's previous percentage score
// 40 = number of questions to generate
```

### Step 3: Calculate Scores

```javascript
const results = {
    totalQuestions: 40,
    correctAnswers: 32,
    sectionScores: {
        english: { correct: 18, total: 20 },
        math: { correct: 10, total: 15 },
        reading: { correct: 4, total: 5 }
    }
};

const scores = window.DiagnosticQuestions.calculateEstimatedScores(results);

console.log(scores);
// Output:
// {
//     sat: 1360,
//     act: 29,
//     psat: 1280,
//     percentage: 80,
//     breakdown: { ... }
// }
```

## Question Format

Each question follows this structure:

```javascript
{
    "id": "E01",                    // Unique identifier
    "section": "English",           // Section name
    "category": "Grammar",          // Subcategory
    "difficulty": 2,                // 1-5 scale
    "question": "...",              // Question text
    "options": {                    // Answer choices
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
    },
    "correct": "B",                 // Correct answer
    "explanation": "..."            // Detailed explanation
}
```

## Adaptive Logic

```javascript
function getAdaptiveQuestions(performanceScore, count = 40) {
    const questions = [];
    
    if (performanceScore > 70) {
        // High performer: 50/50 split
        const baselineCount = Math.floor(count / 2);
        const advancedCount = count - baselineCount;
        
        questions.push(...shuffleArray(baselineQuestions).slice(0, baselineCount));
        questions.push(...shuffleArray(advancedQuestions).slice(0, advancedCount));
    } else {
        // Regular: Baseline only
        questions.push(...shuffleArray(baselineQuestions).slice(0, count));
    }
    
    return shuffleArray(questions);
}
```

## Usage Examples

### Example 1: Full Diagnostic (40 questions)

```javascript
// Generate a balanced diagnostic test
const diagnosticTest = window.DiagnosticQuestions.getAdaptiveQuestions(0, 40);

// Questions breakdown:
// - 10 English
// - 8 Reading
// - 15 Math
// - 7 Science (ACT only)
```

### Example 2: Section-Specific Practice

```javascript
// Get only English questions
const englishQuestions = window.DiagnosticQuestions.baselineQuestions
    .filter(q => q.section === 'English')
    .slice(0, 20);
```

### Example 3: Difficulty-Specific

```javascript
// Get only difficulty 4-5 questions (challenging)
const hardQuestions = [...baselineQuestions, ...advancedQuestions]
    .filter(q => q.difficulty >= 4);
```

## Integration with Firebase

Save diagnostic results:

```javascript
import { doc, setDoc } from 'firebase/firestore';

async function saveDiagnosticResults(userId, results) {
    const scores = calculateEstimatedScores(results);
    
    await setDoc(doc(db, 'diagnosticResults', userId), {
        timestamp: new Date(),
        scores: scores,
        questionCount: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        sectionBreakdown: results.sectionScores,
        difficulty: results.averageDifficulty
    });
}
```

## Performance Tracking

Track student progress over time:

```javascript
const progress = {
    diagnostic1: { sat: 1100, act: 23, date: '2025-01-15' },
    diagnostic2: { sat: 1200, act: 26, date: '2025-02-15' },
    diagnostic3: { sat: 1360, act: 29, date: '2025-03-15' }
};

// Calculate improvement
const improvement = {
    sat: progress.diagnostic3.sat - progress.diagnostic1.sat, // +260
    act: progress.diagnostic3.act - progress.diagnostic1.act  // +6
};
```

## Recommended Test Structure

### Diagnostic Test (40 questions, ~60 minutes)
- English: 10 questions (10 min)
- Math: 15 questions (25 min)
- Reading: 8 questions (15 min)
- Science: 7 questions (10 min)

### Practice Test (20 questions, ~30 minutes)
- Focus on 1-2 sections
- Mix baseline and advanced based on performance

### Full-Length Simulation (100+ questions)
- Mirrors actual SAT/ACT format
- All advanced questions for students scoring >80%

## Tips for Best Results

1. **Randomize questions** to prevent pattern recognition
2. **Time students** to simulate test conditions
3. **Show explanations** after completion, not during
4. **Track trends** across multiple diagnostics
5. **Adjust difficulty** based on section-specific performance

## Score Interpretation

| SAT Range | ACT Range | Percentile | Level |
|-----------|-----------|------------|-------|
| 1400-1600 | 31-36 | 95th+ | Advanced |
| 1200-1390 | 25-30 | 75th-95th | Proficient |
| 1000-1190 | 19-24 | 50th-75th | Developing |
| 800-990 | 13-18 | 25th-50th | Beginning |
| <800 | <13 | <25th | Foundational |

## Future Enhancements

- [ ] Add 80 more advanced questions (total 240)
- [ ] Subject-specific diagnostics
- [ ] Timed section simulations
- [ ] AI-powered question generation
- [ ] Personalized weak-area targeting
- [ ] Video explanations for each question
- [ ] Mobile app version

## Support

For questions or issues:
- Check console for errors
- Verify Firebase connection
- Ensure questions are loading correctly
- Test score calculation accuracy

---

**Status:** ✅ Ready for Production  
**Last Updated:** October 12, 2025  
**Version:** 1.0.0
