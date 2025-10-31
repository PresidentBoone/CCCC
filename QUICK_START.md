# 🚀 Quick Start - Test Mock Payment System

**Time**: 10 minutes
**Goal**: Verify mock payment system works end-to-end

---

## 🎬 3-Step Quick Test

### 1️⃣ Subscribe to Basic ($19.99)
```
1. Open: http://localhost:3000/pricing.html
2. Click: "Choose Basic" button
3. See: Mock checkout modal appear
4. Click: "Complete Mock Payment ✓"
5. See: Redirect to success page
```

**What you should see**:
- 🧪 Yellow notice: "This is a simulated payment"
- ✓ Mock card: 4242 4242 4242 4242 (greyed out)
- ✓ Amount: $19.99/month
- ✓ Button: "Complete Mock Payment ✓"

---

### 2️⃣ Check Dashboard
```
1. Open: http://localhost:3000/dashboard.html
2. Click: Profile picture (top right)
3. See: Purple badge "Basic"
4. See: "💳 Manage Subscription" link
```

**What you should see**:
- ✓ Tier badge: "Basic" (purple background)
- ✓ "Manage Subscription" link visible
- ✓ Your account dropdown

---

### 3️⃣ Open Billing Portal
```
1. Click: "Manage Subscription"
2. See: Mock billing portal modal
3. See: Your plan details
4. See: "Cancel Subscription" button
```

**What you should see**:
- ✓ Title: "🧪 Mock Billing Portal"
- ✓ Plan: "Basic"
- ✓ Status: "active" (green)
- ✓ Amount: "$19.99/month"
- ✓ Red cancel button

---

## ✅ Success Checklist

If you see all of the above:
- [x] Mock payment system works
- [x] Subscription saves to database
- [x] Dashboard shows tier badge
- [x] Billing portal accessible

**Result**: Ready to move to Step 2 (Tier Enforcement)

---

## ❌ If Something's Wrong

**Check browser console** (F12):
- Look for red errors
- Look for "🧪 MOCK PAYMENT" logs
- Look for "✅ MOCK: Saved subscription" message

**Common fixes**:
- Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
- Clear cache and reload
- Check that dev server is running

---

## 🎯 What This Proves

✅ **You can now**:
- Test subscriptions without Stripe
- See how the payment flow works
- Verify tier changes
- Test the full user experience
- Make changes and iterate quickly

✅ **Next up**:
- Integrate tier checks into features
- Add usage limits (e.g., "3/10 essays used")
- Test upgrade prompts
- Build out the admin panel

---

## 📸 Visual Reference

### Mock Checkout Modal
```
┌─────────────────────────────────────┐
│  🧪 Mock Payment (Test Mode)       │
│  ⚠️ This is a simulated payment    │
├─────────────────────────────────────┤
│  Plan: College Climb Basic          │
│  Amount: $19.99/month               │
│  Email: test@example.com            │
├─────────────────────────────────────┤
│  Mock Card Information              │
│  [4242 4242 4242 4242] (disabled)   │
│  [12/34] [123]                      │
├─────────────────────────────────────┤
│  [ Complete Mock Payment ✓ ]       │
│  [ Cancel ]                         │
└─────────────────────────────────────┘
```

### Dashboard Tier Badge
```
┌─────────────────────────┐
│ 👤 Your Profile         │
├─────────────────────────┤
│ 💳 Manage Subscription  │
│                 [Basic] │ ← Purple badge
├─────────────────────────┤
│ 🎨 Theme: Light         │
│ 🔊 Sound: On            │
│ 🚪 Logout               │
└─────────────────────────┘
```

---

**Ready to test?** → Open http://localhost:3000/pricing.html and start!
