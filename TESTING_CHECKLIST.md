# Mock Payment System - Testing Checklist

**Status**: Ready to test ✅
**Server**: Running at http://localhost:3000
**Date**: October 31, 2025

---

## 🎯 What We're Testing

The mock payment system that lets you test subscriptions WITHOUT real Stripe:
- Subscribe to Basic ($19.99/mo) or Pro ($39.99/mo)
- Mock checkout modal (simulates Stripe)
- Subscription saves to Firestore
- Manage subscription from dashboard
- Mock billing portal for cancellations

---

## ✅ Pre-Flight Check

Before starting, verify:
- [ ] Dev server is running: `npm run dev`
- [ ] Browser open to: http://localhost:3000
- [ ] You have a test account OR ready to create one

---

## 🧪 Test 1: Subscribe to Basic Plan (5 minutes)

### Step 1: Create/Login to Account
1. Go to: http://localhost:3000/signup.html
2. Create account with:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign Up"
4. **Expected**: Redirected to dashboard

### Step 2: Go to Pricing Page
1. Navigate to: http://localhost:3000/pricing.html
2. **Expected**: See three tiers:
   - Free: $0
   - Basic: $19.99/month
   - Pro: $39.99/month

### Step 3: Subscribe to Basic
1. Click "Choose Basic" button
2. **Expected**: Mock checkout modal appears with:
   - Title: "🧪 Mock Payment (Test Mode)"
   - Yellow notice: "This is a simulated payment"
   - Plan: "College Climb Basic"
   - Amount: "$19.99/month"
   - Mock card: 4242 4242 4242 4242 (greyed out)

### Step 4: Complete Mock Payment
1. Click "Complete Mock Payment ✓" button
2. **Expected**:
   - Button changes to "Processing..."
   - Wait ~1.5 seconds (simulates API)
   - Redirect to `/subscription-success.html`

### Step 5: Verify Success Page
1. **Expected** on success page:
   - Heading: "Welcome to College Climb Basic!"
   - Confirmation message
   - "Go to Dashboard" button

### Step 6: Check Firestore
1. Open browser DevTools (F12)
2. Go to: Application → IndexedDB → Firebase
3. Find your user document
4. **Expected** to see:
   ```json
   {
     "subscription": {
       "tier": "basic",
       "status": "active",
       "isMock": true,
       "customerId": "cus_mock_...",
       "subscriptionId": "sub_mock_...",
       "currentPeriodEnd": "2025-11-30T..."
     }
   }
   ```

### ✅ Test 1 Result:
- [ ] Pass - Everything worked
- [ ] Fail - Note issue: _______________

---

## 🧪 Test 2: Manage Subscription from Dashboard (3 minutes)

### Step 1: Go to Dashboard
1. Navigate to: http://localhost:3000/dashboard.html
2. **Expected**: Dashboard loads

### Step 2: Check Tier Badge
1. Click your profile picture (top right)
2. **Expected**: Dropdown menu shows:
   - "💳 Manage Subscription" link
   - Purple badge saying "Basic"

### Step 3: Open Manage Subscription
1. Click "Manage Subscription"
2. **Expected**: Mock billing portal modal appears with:
   - Title: "🧪 Mock Billing Portal"
   - Current plan: "Basic"
   - Status: "active" (green)
   - Amount: "$19.99/month"
   - Next billing date
   - "Cancel Subscription" button (red)

### ✅ Test 2 Result:
- [ ] Pass - Badge shows, portal opens
- [ ] Fail - Note issue: _______________

---

## 🧪 Test 3: Cancel Subscription (2 minutes)

### Step 1: Open Billing Portal
1. Dashboard → Profile → Manage Subscription
2. Mock portal opens

### Step 2: Cancel Subscription
1. Click "Cancel Subscription" button
2. **Expected**: Confirmation dialog: "Cancel your subscription? (Mock - no real charges)"
3. Click "OK"

### Step 3: Verify Cancellation
1. **Expected**:
   - Alert: "✅ Subscription canceled (mock)"
   - Page reloads
   - Tier badge changes to "Free"

### Step 4: Verify Firestore Updated
1. Check browser DevTools → IndexedDB
2. **Expected**:
   ```json
   {
     "subscription": {
       "tier": "free",
       "status": "canceled",
       "canceledAt": "2025-10-31T...",
       "isMock": true
     }
   }
   ```

### ✅ Test 3 Result:
- [ ] Pass - Canceled successfully
- [ ] Fail - Note issue: _______________

---

## 🧪 Test 4: Subscribe to Pro Plan (3 minutes)

### Step 1: Go to Pricing
1. Navigate to: http://localhost:3000/pricing.html
2. Click "Choose Pro" button

### Step 2: Complete Pro Payment
1. **Expected**: Mock checkout modal shows:
   - Plan: "College Climb Pro"
   - Amount: "$39.99/month"
2. Click "Complete Mock Payment ✓"
3. **Expected**: Redirect to success page

### Step 3: Verify Pro Tier
1. Go to dashboard
2. Profile → Check tier badge
3. **Expected**: Gold badge saying "Pro"

### ✅ Test 4 Result:
- [ ] Pass - Pro subscription works
- [ ] Fail - Note issue: _______________

---

## 🧪 Test 5: Free User Experience (2 minutes)

### Step 1: Test as Free User
1. Make sure you're on free tier (cancel if needed)
2. Dashboard → Profile → "Manage Subscription"
3. **Expected**: Redirects to `/pricing.html` (not billing portal)

### ✅ Test 5 Result:
- [ ] Pass - Free users go to pricing
- [ ] Fail - Note issue: _______________

---

## 🎯 Summary Checklist

After all tests, verify:
- [ ] Mock checkout modal appears correctly
- [ ] "Payment" processes with 1.5s delay
- [ ] Success page shows after payment
- [ ] Subscription saves to Firestore
- [ ] Tier badge shows correct tier (Free/Basic/Pro)
- [ ] "Manage Subscription" button works
- [ ] Mock billing portal opens
- [ ] Cancellation works
- [ ] Free users redirect to pricing
- [ ] All tier changes reflect in UI

---

## 🐛 Common Issues

### Issue: Mock modal doesn't appear
- **Fix**: Check browser console for script errors
- **Fix**: Verify scripts loaded in correct order (open DevTools → Network)

### Issue: Tier badge doesn't update
- **Fix**: Reload the page
- **Fix**: Check Firestore has subscription data

### Issue: "Manage Subscription" button not visible
- **Fix**: Clear browser cache
- **Fix**: Hard reload (Cmd+Shift+R / Ctrl+Shift+F5)

### Issue: Button stuck on "Processing..."
- **Fix**: Check browser console for Firestore errors
- **Fix**: Verify Firebase is initialized

---

## 📊 Test Results

**Date Tested**: _______________

**Total Tests**: 5
**Passed**: _____ / 5
**Failed**: _____ / 5

**Overall Status**:
- [ ] ✅ All tests pass - Ready to integrate tier enforcement
- [ ] ⚠️ Some issues found - Fix before proceeding
- [ ] ❌ Major issues - Need debugging

---

## 🚀 What's Next?

### If All Tests Pass:
✅ **Step 2: Integrate Tier Enforcement**
- Add tier checks to Essay Coach
- Add tier checks to Test Prep
- Add usage meters to dashboard
- Test upgrade prompts

### If Tests Fail:
❌ **Fix Issues First**
- Note specific errors
- Check browser console
- Verify Firestore rules
- Debug together

---

## 💬 Report Results

After testing, report back:
1. Which tests passed/failed
2. Any errors in browser console
3. Screenshots of issues (if any)
4. Ready to move to Step 2?

---

**Remember**: This is a MOCK system. No real charges. Safe to test freely!
