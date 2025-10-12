# 🚀 College Climb - Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Start the Server
```bash
cd /Users/dylonboone/CCCC-1/CCCC-1
node test-server.js
```

You should see:
```
🚀 College Climb Enhanced Test Server
📍 Server running at http://localhost:3000
✅ All API endpoints active
✅ Firebase configuration loaded
✅ Static files serving from ./public
```

### Step 2: Open in Browser
Visit: **http://localhost:3000**

### Step 3: Create an Account
1. Click "Get Started" or go to `/signup.html`
2. Enter email and password
3. Click "Sign Up"
4. You'll be redirected to the questionnaire

### Step 4: Complete Questionnaire
Fill out the onboarding form with:
- Name, grade level, graduation year
- GPA, test scores (SAT/ACT)
- Intended major, interests
- Career goals, extracurriculars
- Target schools

This data powers all personalization!

### Step 5: Try Each Feature

#### 📝 Essay Coach (`/essaycoach.html`)
1. Write or paste an essay
2. Add target colleges (optional)
3. Click "Analyze Essay"
4. Get AI feedback with highlights
5. See analysis saved to Firebase

#### 🎓 College Discovery (`/discovery.html`)
1. View recommended colleges
2. Each match shows personalized reason
3. Click colleges to view details
4. Add to Safety/Match/Reach lists
5. AI learns your preferences

#### 📊 Dashboard (`/dashboard.html`)
1. See your application stats
2. View upcoming deadlines
3. Check test prep progress
4. Get AI insights
5. Track overall progress

#### 📅 Timeline (`/adaptive-timeline.html`)
1. View deadlines by month
2. See tasks prioritized by urgency
3. Mark tasks complete
4. Watch timeline adapt

#### 📚 Test Prep (`/testprep-enhanced.html`)
1. Select test type (SAT/ACT/PSAT)
2. Choose subject and difficulty
3. Get personalized practice questions
4. Submit answers
5. See performance analysis
6. Get study recommendations

### Step 6: Watch the AI Learn

**After a few interactions, notice:**
- Essay feedback becomes more personalized
- College matches improve in relevance
- Test questions target your weak areas
- Dashboard shows trending insights
- Timeline adapts to your pace

### Check Firebase Data

Visit [Firebase Console](https://console.firebase.google.com/)
- Project: `collegeclimb-ai`
- Check `/users/{yourId}` - Your profile
- Check `/aiLearning/{yourId}` - AI learning data
- Check `/essays/{essayId}` - Saved essays
- Watch data populate in real-time!

---

## 🎯 Key Features to Test

### Personalization
- [ ] Profile data used in all features
- [ ] Recommendations improve over time
- [ ] AI learns preferences
- [ ] Data persists across sessions

### AI Features
- [ ] Essay analysis with highlighting
- [ ] College matching with reasons
- [ ] Test question generation
- [ ] Performance analytics
- [ ] Study recommendations

### Firebase Integration
- [ ] User authentication works
- [ ] Profile saves correctly
- [ ] Essays save to database
- [ ] Applications tracked
- [ ] Test results stored

### User Experience
- [ ] Universal navbar on all pages
- [ ] Theme toggle (light/dark)
- [ ] Mobile responsive
- [ ] Fast loading
- [ ] Smooth navigation

---

## 🐛 Troubleshooting

**Server won't start?**
```bash
# Install dependencies
npm install

# Try again
node test-server.js
```

**API errors?**
```bash
# Add OpenAI key
export OPENAI_API_KEY=sk-your-key-here

# Restart server
node test-server.js
```

**Firebase errors?**
- Check internet connection
- Firebase config in code matches console
- Authentication enabled in Firebase

**Browser console errors?**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache
- Check browser console for details

---

## 📱 Test on Mobile

1. Get your local IP:
   ```bash
   ipconfig getifaddr en0  # Mac
   ```

2. Update server to listen on all interfaces:
   ```javascript
   // In test-server.js
   server.listen(3000, '0.0.0.0', () => { ... });
   ```

3. Visit on phone: `http://YOUR_IP:3000`

---

## 🎉 You're All Set!

**College Climb is now running locally with:**
- ✅ Full AI integration
- ✅ Real Firebase data
- ✅ Personalized experiences
- ✅ All features functional

**Ready to deploy?** See `VERCEL_DEPLOYMENT_GUIDE.md`

**Questions?** Check `FINAL_INTEGRATION_REPORT.md` for complete documentation.

---

**Enjoy building the future of college admissions! 🎓**
