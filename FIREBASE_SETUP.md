# Firebase Security Rules Setup

## 📋 Overview

This guide will help you deploy Firebase Security Rules to protect your Firestore database.

---

## 🔒 Why Security Rules Matter

Without security rules, **anyone** can read/write your database. Security rules ensure:
- ✅ Users can only access their own data
- ✅ Proper authentication is required
- ✅ Data validation on writes
- ✅ Protection against malicious actors

---

## 🚀 Deploying Security Rules

### Option 1: Firebase Console (Easiest)

1. **Go to Firebase Console:**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project: `collegeclimb-ai`

2. **Navigate to Firestore Database:**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy & Paste Rules:**
   - Open `firestore.rules` in this project
   - Copy all the content
   - Paste into the Firebase Console editor
   - Click "Publish"

4. **Verify:**
   - You should see "Rules published successfully"
   - Test your app to ensure it still works

---

### Option 2: Firebase CLI (Advanced)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not already done):**
   ```bash
   firebase init firestore
   ```

   - Select "Firestore: Configure security rules"
   - Choose your project: `collegeclimb-ai`
   - Accept default file `firestore.rules`

4. **Deploy Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Verify:**
   ```bash
   firebase firestore:rules get
   ```

---

## 📖 Understanding the Rules

### Users Collection

```javascript
match /users/{userId} {
  // Users can only read/write their own data
  allow read: if isOwner(userId);
  allow write: if isOwner(userId);
}
```

**What this does:**
- User `abc123` can only access `/users/abc123`
- User `abc123` CANNOT access `/users/xyz789`

---

### Applications Collection

```javascript
match /applications/{applicationId} {
  // Users can only see applications they created
  allow read: if resource.data.userId == request.auth.uid;
  allow create: if request.resource.data.userId == request.auth.uid;
}
```

**What this does:**
- Users can create applications for themselves
- Users can only see their own applications
- Status must be one of: 'not-started', 'in-progress', 'submitted', 'completed'

---

### Chat Sessions

```javascript
match /chatSessions/{sessionId} {
  allow read, write: if resource.data.userId == request.auth.uid;
}
```

**What this does:**
- Users can only access their own chat history
- Chat messages are protected in subcollection

---

### Read-Only Collections

```javascript
match /schools/{schoolId} {
  allow read: if isAuthenticated();
  allow write: if false; // Admin only
}
```

**Collections with this pattern:**
- `schools` - College database (read-only for users)
- `scholarships` - Scholarship database (read-only for users)

**To update these:** Use Firebase Console with admin privileges

---

## 🧪 Testing Security Rules

### Test in Firebase Console

1. **Go to Firestore Database → Rules**
2. Click "Rules Playground" tab
3. Test scenarios:

**Example Test 1: User Reading Own Data**
```
Operation: get
Path: /users/USER_ID_HERE
Auth: Authenticated (uid: USER_ID_HERE)
Expected: ✅ Allow
```

**Example Test 2: User Reading Someone Else's Data**
```
Operation: get
Path: /users/DIFFERENT_USER_ID
Auth: Authenticated (uid: USER_ID_HERE)
Expected: ❌ Deny
```

---

### Test in Your App

1. **Create a new user account**
2. **Try to access dashboard** - Should work ✅
3. **Check browser console** - No permission errors
4. **Open Firestore in console** - Verify data is being saved

---

## ⚠️ Common Issues

### Issue: "Missing or insufficient permissions"

**Cause:** User is trying to access data they don't own

**Fix:**
- Check that `userId` field matches `request.auth.uid`
- Verify user is logged in
- Check Firebase Auth is initialized

---

### Issue: Rules not updating

**Cause:** Browser cache or deployment delay

**Fix:**
```bash
# Force redeploy
firebase deploy --only firestore:rules

# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

### Issue: Can't create new documents

**Cause:** Rule requires field that's missing

**Fix:**
- Check that required fields are included in the write
- For example, `applications` requires `userId`, `schoolName`, and `status`

---

## 🔐 Best Practices

### 1. Always Validate Data Types

```javascript
allow create: if request.resource.data.email is string
               && request.resource.data.email.matches('.*@.*');
```

### 2. Use Helper Functions

```javascript
function isOwner(userId) {
  return request.auth.uid == userId;
}
```

### 3. Don't Trust Client Data

```javascript
// ❌ BAD - Client can set any userId
allow create: if true;

// ✅ GOOD - Verify userId matches auth
allow create: if request.resource.data.userId == request.auth.uid;
```

### 4. Use Subcollections for Related Data

```javascript
match /users/{userId}/essays/{essayId} {
  allow read, write: if request.auth.uid == userId;
}
```

---

## 📊 Monitoring Rules

### Check Rule Usage

1. Go to Firebase Console
2. Click "Firestore Database"
3. Click "Usage" tab
4. Check "Document Reads" and "Document Writes"

### Set Up Alerts

1. Go to "Firestore Database" → "Usage"
2. Click "Set Budget Alert"
3. Set limits:
   - Reads: 50,000/day (free tier limit)
   - Writes: 20,000/day (free tier limit)

---

## 🎯 Current Rules Summary

| Collection | Read | Write | Notes |
|------------|------|-------|-------|
| `users/{userId}` | Owner only | Owner only | User profiles |
| `applications/{id}` | Owner only | Owner only | College applications |
| `chatSessions/{id}` | Owner only | Owner only | AI chat history |
| `tasks/{id}` | Owner only | Owner only | User tasks |
| `schools/{id}` | All authenticated | Admin only | College database |
| `scholarships/{id}` | All authenticated | Admin only | Scholarship database |
| `feedback/{id}` | Admin only | Authenticated (create only) | User feedback |

---

## 🚀 Next Steps

1. ✅ Deploy rules to Firebase
2. ✅ Test in your app
3. ✅ Monitor usage in Firebase Console
4. ✅ Set up budget alerts
5. ✅ Review rules monthly for updates

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Use Rules Playground to test
3. Check browser console for specific errors
4. Review Firebase documentation: [firebase.google.com/docs/firestore/security](https://firebase.google.com/docs/firestore/security)

---

**Last Updated:** January 2025
