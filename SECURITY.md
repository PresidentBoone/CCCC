# Security Guidelines for College Climb

## 🔒 API Key Management

### ✅ What's Protected

All sensitive API keys are properly secured:

1. **OpenAI API Key** - Never committed to git
2. **College Scorecard API Key** - Never committed to git
3. **Firebase Config** - Client keys (safe to expose per Firebase docs)

---

## 📋 Setup Instructions

### Step 1: Create Local .env File

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual keys
nano .env
```

Your `.env` file should contain:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
COLLEGE_SCORECARD_API_KEY=YOUR_ACTUAL_KEY_HERE
```

### Step 2: Verify .env is Ignored

```bash
# This should show .env is ignored
git status

# This should return nothing (file is ignored)
git check-ignore .env
```

---

## 🚫 What NOT to Do

### ❌ Never commit API keys

```bash
# BAD - Don't do this
git add .env
git commit -m "Add API keys"  # ❌ Will be blocked by GitHub
```

### ❌ Never hardcode keys in source files

```javascript
// BAD - Don't do this
const apiKey = "sk-proj-abc123...";  // ❌ Exposed in code
```

### ❌ Never put keys in documentation

```markdown
<!-- BAD - Don't do this -->
Set your API key to: sk-proj-abc123  ❌ Exposed in docs
```

---

## ✅ What TO Do

### ✅ Use environment variables

```javascript
// GOOD - Use environment variables
const apiKey = process.env.OPENAI_API_KEY;  // ✅ Secure
```

### ✅ Use .env.example for reference

```bash
# GOOD - Provide example without actual keys
cp .env.example .env
# Then add your real keys to .env
```

### ✅ Add keys to Vercel Dashboard

```
Vercel Dashboard → Settings → Environment Variables
✅ Secure - Not in git
```

---

## 🔍 If You Accidentally Commit a Key

### Step 1: Remove from Files

```bash
# Edit all files that contain the key
nano SETUP.md
# Replace actual key with: your_api_key_here
```

### Step 2: Amend the Commit

```bash
git add .
git commit --amend --no-edit
```

### Step 3: Force Push

```bash
git push --force-with-lease
```

### Step 4: Rotate the Key

**Important:** Even after removing from git, the key is in git history.

1. Go to OpenAI Dashboard
2. Revoke the exposed key
3. Create a new key
4. Update your `.env` file
5. Update Vercel environment variables

---

## 🛡️ Security Best Practices

### 1. Environment Variables

- ✅ Use `.env` for local development
- ✅ Use Vercel Dashboard for production
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` for documentation

### 2. Git Protection

- ✅ `.env*` is in `.gitignore`
- ✅ GitHub secret scanning enabled (blocked our push)
- ✅ Use `git check-ignore` to verify

### 3. Firebase Security

- ✅ Client config keys are safe (per Firebase docs)
- ✅ Security Rules deployed (see firestore.rules)
- ✅ Users can only access own data

### 4. API Security

- ✅ Rate limiting enabled (10 req/min)
- ✅ Input validation (max 1000 chars)
- ✅ CORS configured properly
- ✅ Server-side API calls only

---

## 📊 Security Checklist

Before deploying:

- [ ] `.env` file exists locally (not committed)
- [ ] `.env` is in `.gitignore`
- [ ] No API keys in source code
- [ ] No API keys in documentation
- [ ] Environment variables added to Vercel
- [ ] Firebase Security Rules deployed
- [ ] Tested API endpoints work
- [ ] Verified git history is clean

---

## 🔑 Where to Get API Keys

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create account or login
3. Click "Create new secret key"
4. Copy immediately (won't show again)
5. Add billing info (required)

### College Scorecard API Key
1. Go to: https://collegescorecard.ed.gov/data/documentation/
2. Click "Get API Key"
3. Enter your email
4. Check email for key
5. Free - no billing required

---

## 🚨 If You Suspect a Key is Exposed

1. **Immediately revoke the key** in the provider dashboard
2. Create a new key
3. Update `.env` locally
4. Update Vercel environment variables
5. Redeploy application
6. Monitor API usage for suspicious activity

---

## 📞 Support

If you have security concerns:

1. Check this document first
2. Review `.gitignore` to ensure `.env` is listed
3. Run `git check-ignore .env` to verify
4. Check GitHub's secret scanning alerts
5. Review Vercel environment variables

---

## ✅ Current Status

As of last check:
- ✅ No API keys in git repository
- ✅ `.env` properly ignored
- ✅ `.env.example` provided as template
- ✅ Documentation uses placeholders only
- ✅ GitHub push protection working
- ✅ Security rules deployed

---

**Last Updated:** January 2025
**Version:** 2.0.0

**Remember:** When in doubt, don't commit it. Environment variables belong in `.env` and Vercel Dashboard only!
