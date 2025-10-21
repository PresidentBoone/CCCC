# Firebase Security Rules - CRITICAL SETUP REQUIRED

## ⚠️ ACTION REQUIRED BEFORE PRODUCTION

You MUST configure these security rules in your Firebase Console to prevent unauthorized access.

### How to Apply These Rules:

1. Go to https://console.firebase.google.com
2. Select your project: `college-climb-cc`
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the rules below
5. Click **Publish**

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function: Check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Test Prep Data - users can only read/write their own data
    match /testprep/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    // Diagnostic Results - users can only read/write their own results
    match /diagnosticResults/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    // Leaderboard - read-only for all authenticated users, write only by owners
    match /leaderboard/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // User Profiles - users can only read/write their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Firebase Storage Rules (if using file uploads)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars - users can only upload their own
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true; // Public read for avatars
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*'); // Images only
    }

    // Deny all other storage access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Authentication Configuration

### Required Setup in Firebase Console:

1. **Enable Authentication Methods**:
   - Go to **Authentication** → **Sign-in method**
   - Enable: Google, Email/Password
   - Configure OAuth consent screen

2. **Authorized Domains**:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add your production domain(s):
     - `your-domain.com`
     - `www.your-domain.com`
     - `localhost` (for development)

3. **API Key Restrictions** (Optional but Recommended):
   - Go to **Google Cloud Console**
   - APIs & Services → Credentials
   - Find your Web API Key
   - Add HTTP referrer restrictions to your domains

---

## Security Checklist

Before going to production, verify:

- [ ] Firestore security rules are published (not in test mode)
- [ ] Storage security rules are configured (if using storage)
- [ ] Authentication is enabled for Google and Email
- [ ] Authorized domains include your production domain
- [ ] Test that unauthenticated users CANNOT read/write data
- [ ] Test that users can ONLY access their own data
- [ ] Leaderboard is read-only for all users
- [ ] API key restrictions are configured (optional)

---

## Testing Your Security Rules

### Test in Firebase Console:

1. Go to **Firestore Database** → **Rules** → **Rules Playground**
2. Test these scenarios:

```javascript
// Should FAIL - unauthenticated user reading data
get /databases/(default)/documents/testprep/user123
Auth: null
❌ Expected: Permission denied

// Should FAIL - user reading another user's data
get /databases/(default)/documents/testprep/user456
Auth: UID user123
❌ Expected: Permission denied

// Should SUCCEED - user reading their own data
get /databases/(default)/documents/testprep/user123
Auth: UID user123
✅ Expected: Allowed

// Should SUCCEED - user writing their own data
create /databases/(default)/documents/testprep/user123
Auth: UID user123
Data: { score: 1200, level: 5 }
✅ Expected: Allowed
```

---

## Current Risk Level: 🔴 HIGH

**Why?** Because Firebase is in **test mode** by default, which allows ANYONE to read/write ALL data.

**Fix:** Apply the security rules above IMMEDIATELY.

---

## Emergency: If Your Database Is Compromised

If someone has already accessed your database:

1. **Immediately change to production rules** (rules above)
2. **Review Firestore logs** in Firebase Console
3. **Check for suspicious data** in collections
4. **Rotate Firebase credentials** if needed
5. **Enable Firebase App Check** for additional security

---

## Additional Security Measures

### 1. Enable Firebase App Check (Recommended)

Prevents abuse by verifying requests come from your app:

```javascript
// In your Firebase initialization:
const appCheck = firebase.appCheck();
appCheck.activate('your-recaptcha-site-key', true);
```

### 2. Rate Limiting

Implement rate limiting in Firestore or use Cloud Functions:

```javascript
// Example: Limit diagnostic tests to 1 per hour per user
match /diagnosticResults/{userId} {
  allow create: if isOwner(userId)
                && !exists(/databases/$(database)/documents/diagnosticResults/$(userId))
                || get(/databases/$(database)/documents/diagnosticResults/$(userId)).data.timestamp < request.time - duration.value(1, 'h');
}
```

### 3. Data Validation

Add validation to prevent malicious data:

```javascript
match /testprep/{userId} {
  allow write: if isOwner(userId)
               && request.resource.data.keys().hasOnly(['score', 'level', 'xp', 'hearts'])
               && request.resource.data.score is number
               && request.resource.data.score >= 0
               && request.resource.data.score <= 1600;
}
```

---

## Questions?

- Firebase Security Rules Docs: https://firebase.google.com/docs/rules
- Firebase App Check: https://firebase.google.com/docs/app-check

**REMEMBER: Your Firebase API key being public is NORMAL. Security comes from rules, not key secrecy.**
