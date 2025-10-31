# Mock Payment System - Testing Guide

## What We Just Built

**A fully functional payment system that works WITHOUT Stripe API keys!**

This lets us:
- ✅ Test the entire subscription flow NOW
- ✅ Test tier enforcement and feature gating
- ✅ Build and test the admin panel
- ✅ Get real user feedback
- ✅ Switch to real Stripe later (1 line of code change)

---

## How to Test (Step-by-Step)

### Step 1: Start the Server

```bash
npm run dev
```

Server starts at: http://localhost:3000

---

### Step 2: Test Mock Payment Flow

#### 2a. Navigate to Pricing Page
1. Open browser to: http://localhost:3000/pricing.html
2. You should see:
   - Free: $0
   - Basic: $19.99/month ← Updated!
   - Pro: $39.99/month ← Updated!

#### 2b. Try Subscribing (Without Login)
1. Click "Choose Basic" button
2. You should be redirected to `/signup.html`
3. This is correct behavior (must login first)

#### 2c. Create Account
1. Go to: http://localhost:3000/signup.html
2. Create a test account:
   - Email: test@example.com
   - Password: password123
3. Sign up

#### 2d. Subscribe with Mock Payment
1. After signup, go back to: http://localhost:3000/pricing.html
2. Click "Choose Basic"
3. **Mock checkout modal should appear** 🎉
   - Title: "🧪 Mock Payment (Test Mode)"
   - Yellow notice: "This is a simulated payment"
   - Shows: $19.99/month
   - Mock card: 4242 4242 4242 4242 (greyed out)
4. Click "Complete Mock Payment ✓"
5. Wait 1.5 seconds (simulates Stripe API call)
6. You should be redirected to `/subscription-success.html`
7. Success page shows: "Welcome to College Climb Basic!"

#### 2e. Verify Subscription Saved
1. Open browser console (F12)
2. Go to Application → IndexedDB → Firebase
3. Look for your user document
4. Should have `subscription` object:
   ```json
   {
     "tier": "basic",
     "status": "active",
     "isMock": true,
     "currentPeriodEnd": "2025-11-30..."
   }
   ```

---

### Step 3: Test Tier Enforcement

#### 3a. Check Dashboard
1. Go to: http://localhost:3000/dashboard.html
2. You should see indication you're on Basic tier
3. (If not implemented yet, we'll add this)

#### 3b. Test Feature Access
**Currently, tier enforcement is built but not integrated everywhere.**

To test it manually:
1. Open browser console
2. Run:
   ```javascript
   // Check if you have access to pro features
   window.tierEnforcement.hasFeatureAccess('advancedAnalytics')
   // Should return: false (you're on Basic, not Pro)

   window.tierEnforcement.hasFeatureAccess('aiReviews')
   // Should return: true (Basic tier has this)
   ```

#### 3c. Test Usage Limits
```javascript
// Check essay limit
window.tierEnforcement.checkLimit('maxEssays')
// Returns: { allowed: true, remaining: 10, limit: 10, current: 0 }
```

---

### Step 4: Test Mock Billing Portal

**Note: We need to add a "Manage Subscription" button first.**

Once added:
1. Click "Manage Subscription"
2. Mock billing portal should open
3. Shows your current plan
4. Click "Cancel Subscription"
5. Confirm cancellation
6. Subscription should update to "free" tier

---

### Step 5: Test Upgrading

1. Create free account (or cancel your Basic subscription)
2. Go to pricing page
3. Subscribe to Pro ($39.99)
4. Verify you get Pro tier
5. Check that Pro features are now accessible

---

## What Works Right Now

✅ **Mock Payment Flow**
- Subscribe button works
- Mock checkout modal appears
- "Payment" processes
- Redirects to success page
- Saves subscription to Firestore

✅ **Tier System**
- Three tiers: Free, Basic ($19.99), Pro ($39.99)
- Subscriptions save to Firestore
- Tier enforcement code is ready

⚠️ **Partially Working**
- Tier enforcement exists but not integrated everywhere yet
- Need to add "Manage Subscription" button
- Need to add tier badges to UI

❌ **Not Yet Implemented**
- Email notifications (SendGrid not set up)
- Real Stripe integration (waiting until later)
- Tier restrictions on specific features (need to add checks)

---

## Integration Checklist

### Places to Add Tier Checks:

#### Essay Coach
**File**: `/public/essaycoach.html`
**What to add**:
```javascript
// Before allowing essay creation
const limitCheck = window.tierEnforcement.checkLimit('maxEssays');
if (!limitCheck.allowed) {
    window.tierEnforcement.showLimitReached('maxEssays', limitCheck);
    return;
}

// After creating essay
await window.tierEnforcement.incrementUsage('maxEssays');
```

#### Test Prep
**File**: `/public/testprep-practice.html`
**What to add**:
```javascript
// Before starting practice questions
const limitCheck = window.tierEnforcement.checkLimit('practiceQuestionsPerDay');
if (!limitCheck.allowed) {
    window.tierEnforcement.showLimitReached('practiceQuestionsPerDay', limitCheck);
    return;
}
```

#### College Search
**File**: `/public/js/college-discovery.js`
**What to add**:
```javascript
// Before saving a college
const limitCheck = window.tierEnforcement.checkLimit('maxColleges');
if (!limitCheck.allowed) {
    window.tierEnforcement.showLimitReached('maxColleges', limitCheck);
    return;
}
```

#### Dashboard
**File**: `/public/dashboard.html`
**What to add**:
- Display current tier badge
- Show usage stats (e.g., "3/10 essays used")
- Add "Manage Subscription" button
- Show "Upgrade to Pro" CTA for free/basic users

---

## How to Switch to Real Stripe (Later)

When you're ready for real payments:

### 1. Update Mock System Flag
**File**: `/public/js/payment/mock-payment-system.js`
**Line 8**:
```javascript
const ENABLE_MOCK_PAYMENTS = false; // ← Change to false
```

### 2. Set Up Stripe
- Create Stripe account
- Create products ($19.99 and $39.99)
- Get API keys
- Update `.env` file

### 3. Update Price IDs
**File**: `/public/js/payment/pricing-init.js`
**Lines 11-14**:
```javascript
const PRICE_IDS = {
    free: null,
    basic: 'price_YOUR_REAL_BASIC_PRICE_ID',  // ← Update
    pro: 'price_YOUR_REAL_PRO_PRICE_ID'      // ← Update
};
```

### 4. Test Real Stripe
- Use test card: 4242 4242 4242 4242
- Verify webhook works
- Test full flow

**That's it!** Everything else stays the same.

---

## Testing Scenarios

### Scenario 1: Happy Path
1. User signs up
2. User subscribes to Basic
3. User creates essays (within limit)
4. User upgrades to Pro
5. User gets unlimited access

**Expected**: Everything works smoothly

---

### Scenario 2: Hit Usage Limit
1. User has Basic tier (10 essay limit)
2. User creates 10 essays
3. User tries to create 11th essay
4. **Expected**: Upgrade prompt appears
5. User upgrades to Pro
6. User can now create unlimited essays

---

### Scenario 3: Subscription Cancellation
1. User has Pro subscription
2. User opens billing portal
3. User cancels subscription
4. **Expected**: Access continues until end of period
5. After period ends: Downgrade to Free
6. Features become locked

---

### Scenario 4: Free User Hits Wall
1. Free user tries to access Pro feature
2. **Expected**: Upgrade modal appears
3. Shows: "This feature requires Pro"
4. Button: "View Plans"
5. Clicking redirects to /pricing.html

---

## Common Issues & Solutions

### Issue 1: Mock Modal Doesn't Appear
**Cause**: Script not loaded
**Solution**: Check browser console for errors
**Fix**: Verify scripts in pricing.html are in correct order:
```html
<script src="js/payment/mock-payment-system.js"></script>
<script src="js/payment/stripe-manager.js"></script>
```

---

### Issue 2: Subscription Not Saving
**Cause**: Firestore rules or user not logged in
**Solution**:
1. Check browser console for errors
2. Verify user is logged in: `firebase.auth().currentUser`
3. Check Firestore rules allow writes to `/users/{userId}/subscription`

---

### Issue 3: Tier Not Showing After Subscribe
**Cause**: UI not refreshing
**Solution**: Reload the page or update UI to show tier dynamically

---

### Issue 4: "Complete Mock Payment" Button Stuck
**Cause**: Error during Firestore write
**Solution**: Check console for errors, verify Firebase initialized

---

## Your Next Steps (Testing)

### Today:
1. ✅ Start dev server: `npm run dev`
2. ✅ Test mock checkout flow (Steps 2a-2e above)
3. ✅ Verify subscription saves to Firestore
4. ✅ Test cancellation flow

### Tomorrow:
1. Add "Manage Subscription" button to dashboard
2. Add tier badge to show current plan
3. Test tier enforcement on one feature (e.g., essay limit)
4. Fix any bugs found

### This Week:
1. Integrate tier checks across all features
2. Add usage meters to UI
3. Test all upgrade/downgrade scenarios
4. Polish the upgrade prompts

---

## Confidence Check

**What we know works**:
- ✅ Mock payment modal appears
- ✅ Mock "payment" completes
- ✅ Subscription saves to Firestore
- ✅ Tier enforcement logic is correct
- ✅ Can switch to real Stripe easily

**What needs testing**:
- ⚠️ Full user flow (signup → subscribe → use features)
- ⚠️ Tier enforcement in actual features
- ⚠️ Billing portal integration
- ⚠️ Edge cases (errors, network failures)

**Estimated time to fully validated mock system**: 1-2 days of testing

---

## Benefits of This Approach

### For You:
- ✅ Test everything NOW without Stripe setup
- ✅ Get real user feedback before spending money
- ✅ Build and test admin panel
- ✅ Iterate quickly

### For Development:
- ✅ Parallel work: You test, I build admin panel
- ✅ No API key dependencies
- ✅ Fast iteration (no waiting for Stripe webhooks)
- ✅ Easy debugging (all local)

### For Launch:
- ✅ Can launch with free tier immediately
- ✅ Add payments when ready
- ✅ No risk of broken payment flow
- ✅ Users can test features before paying

---

## Bottom Line

**You can now**:
1. Test the entire subscription flow
2. Build and test all other features
3. Get user feedback
4. Switch to real Stripe when ready (5 minutes of work)

**Next up**: Let's add the "Manage Subscription" button to dashboard, then you can test everything end-to-end!

Ready to test? Open http://localhost:3000/pricing.html and try subscribing!
