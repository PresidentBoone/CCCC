# Pre-Deployment Checklist - College Climb

**Status:** Ready for deployment testing
**Date:** October 18, 2025
**Critical:** All items must be ✅ before going live

---

## ✅ Infrastructure Verification (COMPLETE)

### Serverless Function Architecture
- [x] vercel.json uses modern `functions` syntax (not `builds`)
- [x] Only 1 serverless function defined: `api/index.js`
- [x] API rewrite rule: `/api/:path*` → `/api/index.js`
- [x] No deprecated `routes` or `builds` properties
- [x] Max duration: 60 seconds
- [x] Memory: 1024 MB

### API Handler Routing
- [x] api/index.js routes ALL endpoints
- [x] All 9 handlers properly imported
- [x] Path routing logic verified:
  - `/api/chat` → chat.js
  - `/api/essay-analyze` → essay-analyze.js
  - `/api/essay-storage` → essay-storage.js
  - `/api/college-search` → college-search.js
  - `/api/testprep-generate` → testprep-generate.js
  - `/api/timeline` → timeline.js
  - `/api/scrape-scholarships` → scrape-scholarships.js
  - `/api/intelligence` → intelligence.js
  - `/api/config` → config.js

### Module Exports
- [x] All handlers use `module.exports = async function handler(req, res)`
- [x] No ESM `export default` mixing (would break)
- [x] CommonJS format consistent

---

## ⚠️ Environment Variables Setup (TODO - YOU MUST DO)

### Firebase Configuration (REQUIRED)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### API Keys (REQUIRED)
```bash
OPENAI_API_KEY=
COLLEGE_SCORECARD_API_KEY=
```

### Optional
```bash
NODE_ENV=production
ENABLE_DEBUG_LOGS=false
SENTRY_DSN=
```

**Where to set:** Vercel Dashboard → Your Project → Settings → Environment Variables

---

## 🔥 Firebase Setup (TODO - YOU MUST DO)

### 1. Create Firebase Project
- [ ] Go to console.firebase.google.com
- [ ] Create new project: "college-climb-production"
- [ ] Disable Google Analytics (not needed)

### 2. Enable Authentication
- [ ] Enable Email/Password provider
- [ ] Configure settings

### 3. Create Firestore Database
- [ ] Create database in production mode
- [ ] Choose region (us-central1 recommended)

### 4. Enable Storage
- [ ] Enable Firebase Storage
- [ ] Use default rules for now

### 5. Update Security Rules
**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /essays/{essayId} {
      allow read, write: if request.auth != null &&
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔑 API Keys Setup (TODO - YOU MUST DO)

### OpenAI API Key
- [ ] Go to platform.openai.com
- [ ] Sign up or login
- [ ] Add $5-10 credit to account
- [ ] Create API key
- [ ] Save key (starts with `sk-`)

### College Scorecard API
- [ ] Go to api.data.gov/signup/
- [ ] Enter email
- [ ] Get instant API key
- [ ] Save key

---

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Production ready - single serverless function"
git push origin main
```

### 2. Connect to Vercel
- [ ] Go to vercel.com/dashboard
- [ ] Click "New Project"
- [ ] Import from GitHub
- [ ] Select this repository

### 3. Configure Project
- [ ] Framework: Other
- [ ] Root Directory: ./
- [ ] Build Command: (leave empty)
- [ ] Output Directory: public

### 4. Add Environment Variables
- [ ] Add all Firebase config variables
- [ ] Add OPENAI_API_KEY
- [ ] Add COLLEGE_SCORECARD_API_KEY
- [ ] Set NODE_ENV=production

### 5. Deploy
- [ ] Click "Deploy"
- [ ] Wait 1-2 minutes
- [ ] Get deployment URL

---

## ✅ Post-Deployment Testing

### Critical Path Testing (MUST DO)

#### Test 1: Homepage Loads
- [ ] Visit your-app.vercel.app
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] Firebase config loaded message appears

#### Test 2: Authentication Works
- [ ] Click "Sign Up"
- [ ] Enter email/password
- [ ] Successfully create account
- [ ] Verify user appears in Firebase Console
- [ ] Log out
- [ ] Log back in
- [ ] Session persists

#### Test 3: Essay Analysis Works (CRITICAL)
- [ ] Log in
- [ ] Navigate to /essay-coach
- [ ] Write test essay (100+ words)
- [ ] Click "Analyze Essay"
- [ ] Verify AI feedback appears
- [ ] Check Network tab shows /api/essay-analyze call
- [ ] Verify no 500 errors

#### Test 4: Firebase Data Persistence
- [ ] Create an essay
- [ ] Refresh page
- [ ] Verify essay still there
- [ ] Check Firebase Console shows document

#### Test 5: College Search Works
- [ ] Go to /discovery
- [ ] Search for "Stanford"
- [ ] Verify results appear
- [ ] Check /api/college-search endpoint works

### Optional Testing (Nice to Have)

- [ ] Test timeline feature
- [ ] Test test prep questions
- [ ] Test scholarship search
- [ ] Test on mobile device
- [ ] Test in different browsers

---

## 🐛 Common Issues & Fixes

### Issue: "Firebase configuration not found"
**Cause:** Environment variables not set
**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Verify all NEXT_PUBLIC_FIREBASE_* variables are set
3. Redeploy the project

### Issue: "OpenAI API error"
**Cause:** No API key or no credit
**Fix:**
1. Verify OPENAI_API_KEY is set in Vercel
2. Check OpenAI account has credit ($5 minimum)
3. Verify key starts with `sk-`

### Issue: "CORS errors"
**Cause:** API requests blocked
**Fix:**
- Already configured in vercel.json
- Should not occur with current setup

### Issue: "Function timeout"
**Cause:** API call takes >60 seconds
**Fix:**
- Already set maxDuration: 60
- If still issues, optimize handler code

---

## 📊 Deployment Verification

After deployment, verify these URLs work:

### API Endpoints
```
https://your-app.vercel.app/api
https://your-app.vercel.app/api/config
```

### Pages
```
https://your-app.vercel.app/
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/essay-coach
https://your-app.vercel.app/discovery
```

### Vercel Function Count
- [ ] Vercel Dashboard → Functions tab
- [ ] Verify ONLY 1 function deployed
- [ ] Name should be: api/index.js

---

## 📝 Demo Account Creation

After successful deployment:

1. **Create Demo Account**
   - Email: demo@collegeclimb.com
   - Password: DemoPass123!

2. **Add Sample Data**
   - Write 2-3 test essays
   - Analyze them with AI
   - Add 3-5 colleges to favorites
   - Complete questionnaire

3. **Document Credentials**
   ```
   Demo URL: https://your-app.vercel.app
   Email: demo@collegeclimb.com
   Password: DemoPass123!
   ```

---

## ✅ Ready to Sell Checklist

Before listing for sale:

- [ ] App deployed and accessible
- [ ] All critical tests passing
- [ ] Demo account created with data
- [ ] Screenshots taken of working app
- [ ] No errors in browser console
- [ ] Firebase shows user data
- [ ] AI features working
- [ ] Mobile responsive verified

---

## 🎯 Success Criteria

**The app is ready when:**
- ✅ URL loads without errors
- ✅ User can sign up/login
- ✅ Essay analysis returns AI feedback
- ✅ Data persists in Firebase
- ✅ No console errors
- ✅ Demo account works

**Then you can:**
- List on Flippa/MicroAcquire for $40K-75K
- Show live demo to buyers
- Provide demo credentials
- Transfer after sale

---

**Current Status:** Code ready, infrastructure verified
**Next Step:** YOU deploy and test
**Estimated Time:** 2-3 hours
**Expected Outcome:** Working, sellable SaaS product

---

*This checklist is your step-by-step guide. Follow it exactly.*
*Do not skip steps. Test thoroughly. Then sell confidently.*
