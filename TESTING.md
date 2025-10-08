# College Climb - Testing Checklist

## 🧪 Comprehensive Testing Guide

Use this checklist to verify all features work correctly before deployment.

---

## ✅ Pre-Deployment Testing (Local)

### 1. Environment Setup

- [ ] `.env` file exists in project root
- [ ] `OPENAI_API_KEY` is set correctly
- [ ] `COLLEGE_SCORECARD_API_KEY` is set correctly
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts successfully

---

### 2. Authentication & User Flow

#### Signup
- [ ] Navigate to `/signup.html`
- [ ] Create new account with email/password
- [ ] Verify redirect to dashboard after signup
- [ ] Check Firebase console shows new user

#### Login
- [ ] Navigate to `/login.html`
- [ ] Login with existing credentials
- [ ] Verify redirect to dashboard
- [ ] Logout works correctly
- [ ] Re-login works

#### Password Reset
- [ ] Click "Forgot Password"
- [ ] Receive password reset email
- [ ] Reset password successfully

---

### 3. Dashboard Features

#### Loading Experience
- [ ] Loading overlay appears on page load
- [ ] Status messages update ("Loading your data...", "Calculating...", etc.)
- [ ] Smooth fade-in when data loads
- [ ] No flash of unstyled content (FOUC)

#### Questionnaire Prompt
- [ ] Modal appears for users without questionnaire data
- [ ] "Complete Profile Now" redirects to `/questions.html`
- [ ] "Maybe Later" dismisses modal
- [ ] Modal doesn't reappear in same session after dismissal

#### Offline Detection
- [ ] Turn off WiFi
- [ ] Offline banner appears at top
- [ ] "You're offline" message shows
- [ ] Turn WiFi back on
- [ ] Banner disappears
- [ ] "You're back online!" notification shows

#### AI Chat
- [ ] Click chat toggle button
- [ ] Chat widget opens smoothly
- [ ] Type message and press Enter
- [ ] Typing indicator appears
- [ ] AI responds with relevant answer
- [ ] **Test college-specific query**: "What's the acceptance rate at Stanford?"
- [ ] Verify response includes real data from College Scorecard
- [ ] Test error handling: disconnect internet, send message
- [ ] Verify friendly error message appears
- [ ] Chat history persists on page refresh

#### College Data
- [ ] AI provides accurate admission rates
- [ ] AI provides accurate tuition costs
- [ ] AI provides accurate SAT/ACT scores
- [ ] Try asking about different colleges (MIT, Harvard, UCLA, etc.)

#### Stats Overview
- [ ] Application count displays
- [ ] Essays count displays
- [ ] Scholarship amount displays
- [ ] Deadlines count displays
- [ ] Stats update when data changes

#### School Recommendations
- [ ] Recommended schools display
- [ ] Click on a school card
- [ ] School details appear
- [ ] "Add to My List" button works

#### Timeline
- [ ] Timeline displays with events
- [ ] Events are in chronological order
- [ ] Deadlines are accurate

#### Tasks
- [ ] Task list displays
- [ ] Can check/uncheck tasks
- [ ] Tasks persist on refresh
- [ ] Can add new tasks
- [ ] Can delete tasks

---

### 4. Navigation & Pages

#### Navbar
- [ ] Logo redirects to home
- [ ] Dashboard link works
- [ ] My Applications link works
- [ ] Profile dropdown opens
- [ ] Profile link works
- [ ] Logout works
- [ ] Theme toggle switches dark/light mode
- [ ] Theme preference persists

#### All Pages Load
- [ ] `/index.html` - Landing page
- [ ] `/dashboard.html` - Main dashboard
- [ ] `/login.html` - Login page
- [ ] `/signup.html` - Signup page
- [ ] `/profile.html` - User profile
- [ ] `/questions.html` - Questionnaire
- [ ] `/discovery.html` - College search
- [ ] `/essaycoach.html` - Essay coach
- [ ] `/scholarship.html` - Scholarships
- [ ] `/myapp.html` - My applications
- [ ] `/testprep.html` - Test prep

---

### 5. API Endpoints

#### Chat API (`/api/chat`)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the acceptance rate at MIT?",
    "userProfile": {"name": "Test User"},
    "questionnaireData": {"targetSchools": ["MIT"]}
  }'
```
- [ ] Returns 200 status
- [ ] Response includes college data
- [ ] Response is personalized

#### College Search API (`/api/college-search`)
```bash
curl "http://localhost:3000/api/college-search?name=Stanford"
```
- [ ] Returns 200 status
- [ ] Results array contains colleges
- [ ] Data includes admission rate, tuition, SAT/ACT scores
- [ ] Can search by state: `?state=CA`
- [ ] Pagination works: `?page=2&per_page=10`

---

### 6. Performance

#### Load Time
- [ ] Dashboard loads in < 3 seconds
- [ ] No console errors
- [ ] No console warnings (except development logs)
- [ ] Images load quickly
- [ ] No layout shift (CLS)

#### Responsiveness
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)
- [ ] All elements visible and clickable
- [ ] Text is readable
- [ ] Buttons are touch-friendly (44x44px minimum)

---

### 7. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

### 8. PWA Features (Production Only)

#### Service Worker
- [ ] Service Worker registers successfully
- [ ] Check console: "✅ Service Worker registered"
- [ ] Offline caching works
- [ ] Go offline, refresh page
- [ ] Page loads from cache

#### Install Prompt
- [ ] After 30 seconds, install prompt appears
- [ ] "Install" button works
- [ ] "Not Now" dismisses prompt
- [ ] Prompt doesn't reappear in same session
- [ ] Check home screen for installed app

#### Update Notification
- [ ] Deploy new version
- [ ] Update notification appears
- [ ] "Update Now" button refreshes to new version

---

### 9. Firebase Integration

#### Firestore
- [ ] User data saves to Firestore
- [ ] Application data saves
- [ ] Chat sessions save
- [ ] Tasks save
- [ ] Data is read-only for other users

#### Security Rules
- [ ] Users can read their own data
- [ ] Users CANNOT read other users' data
- [ ] Users can write to their own collections
- [ ] Users CANNOT write to admin collections
- [ ] Test in Firebase Rules Playground

---

### 10. Error Handling

#### Chat Errors
- [ ] 400 error: Shows "trouble understanding" message
- [ ] 401 error: Shows "authentication issue" message
- [ ] 403 error: Shows "API key needs billing" message
- [ ] 429 error: Shows "too many requests, wait 60 seconds" message
- [ ] 500 error: Shows "server error" message
- [ ] Network error: Shows "check connection" message

#### General Errors
- [ ] Invalid email: Shows error
- [ ] Weak password: Shows error
- [ ] Network timeout: Shows error
- [ ] Firebase quota exceeded: Shows error

---

### 11. Data Validation

#### User Input
- [ ] Empty chat message: Prevented from sending
- [ ] Very long message (>1000 chars): Truncated
- [ ] Special characters in email: Validated
- [ ] SQL injection attempts: Sanitized
- [ ] XSS attempts: Escaped

---

### 12. Analytics

#### Event Tracking
- [ ] Page view tracked on load
- [ ] Check localStorage for 'analytics' key
- [ ] Events logged correctly
- [ ] Only tracks in production (not localhost)

---

### 13. Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader friendly (test with NVDA/JAWS)
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Images have alt text
- [ ] Forms have labels

---

### 14. Security

- [ ] `.env` file not committed to git
- [ ] API keys not in client-side code
- [ ] HTTPS used in production
- [ ] CORS configured correctly
- [ ] Firebase rules protect data
- [ ] No sensitive data in console logs (production)

---

## 🚀 Production Testing (Vercel)

### 1. Deployment

- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Environment variables added in Vercel:
  - [ ] `OPENAI_API_KEY`
  - [ ] `COLLEGE_SCORECARD_API_KEY`
- [ ] Production URL accessible

---

### 2. Production Features

#### Service Worker
- [ ] Service Worker registers in production
- [ ] Check DevTools → Application → Service Workers
- [ ] Status: "activated and running"

#### Caching
- [ ] Static assets cached
- [ ] Check DevTools → Application → Cache Storage
- [ ] See `college-climb-v2.0.0` cache
- [ ] Assets load from cache on repeat visit

#### PWA
- [ ] Install prompt appears (wait 30 seconds)
- [ ] Can install to home screen
- [ ] App opens in standalone mode
- [ ] Splash screen shows

#### Offline Mode
- [ ] Turn off WiFi
- [ ] App still loads
- [ ] Cached pages accessible
- [ ] Offline banner shows
- [ ] API calls show friendly errors

---

### 3. Production Performance

#### Lighthouse Scores (Target)
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 95
- [ ] SEO: > 90
- [ ] PWA: ✓ (all checks pass)

#### Metrics
- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Total Blocking Time (TBT): < 200ms
- [ ] Cumulative Layout Shift (CLS): < 0.1
- [ ] Speed Index: < 3.4s

---

### 4. Production Monitoring

#### Error Tracking
- [ ] Check Vercel logs for errors
- [ ] Check Firebase console for auth errors
- [ ] Check OpenAI dashboard for API errors
- [ ] No 500 errors in last 24 hours

#### Usage Monitoring
- [ ] Firebase usage within free tier limits:
  - [ ] Reads: < 50,000/day
  - [ ] Writes: < 20,000/day
  - [ ] Deletes: < 20,000/day
- [ ] OpenAI API within budget
- [ ] College Scorecard API working

---

## ✅ Sign-Off Checklist

Before declaring production-ready:

- [ ] All local tests pass
- [ ] All production tests pass
- [ ] Lighthouse scores meet targets
- [ ] No critical console errors
- [ ] Firebase Security Rules deployed
- [ ] Environment variables configured
- [ ] Documentation complete:
  - [ ] SETUP.md
  - [ ] FIREBASE_SETUP.md
  - [ ] TESTING.md (this file)
- [ ] Code committed and pushed
- [ ] Production deployment successful
- [ ] Smoke tested by 2+ people
- [ ] Known issues documented

---

## 🐛 Known Issues / Limitations

Document any known issues here:

1. **PWA Icons**: Placeholder icons referenced in manifest (need actual icons created)
2. **Screenshots**: PWA screenshots not yet created
3. **Analytics**: Currently logs to localStorage, not sent to analytics service
4. **Offline Page**: No dedicated `/offline.html` page (shows generic message)

---

## 📊 Testing Results

| Test Category | Status | Notes |
|---------------|--------|-------|
| Authentication | ⏳ Pending | |
| Dashboard | ⏳ Pending | |
| Chat AI | ⏳ Pending | |
| College Search | ⏳ Pending | |
| PWA | ⏳ Pending | |
| Performance | ⏳ Pending | |
| Security | ⏳ Pending | |

**Legend:**
- ✅ Passed
- ❌ Failed
- ⏳ Pending
- ⚠️ Partial

---

## 🎯 Success Criteria

The dashboard is considered production-ready when:

- ✅ All critical features work
- ✅ No blocking bugs
- ✅ Performance meets targets
- ✅ Security measures in place
- ✅ PWA installable
- ✅ Works offline (cached pages)
- ✅ Mobile responsive
- ✅ Accessible

---

**Last Updated:** January 2025
**Version:** 2.0.0
