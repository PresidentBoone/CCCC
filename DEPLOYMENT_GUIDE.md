# 🚀 Deployment Guide - CollegeClimb v2.0.0

**Complete guide for deploying CollegeClimb to production**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build Process](#build-process)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedure](#rollback-procedure)
7. [Performance Monitoring](#performance-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console errors in development
- [ ] All features tested locally
- [ ] Security audit passed
- [ ] Accessibility tested (WCAG 2.1 AA)

### Environment
- [ ] `.env` file configured (not committed)
- [ ] Firebase configuration correct
- [ ] API keys validated
- [ ] Vercel project linked

### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md current
- [ ] API documentation complete

---

## 📦 Build Process

### Development Build (Testing)

```bash
npm run build
```

**Output**: `/dist` directory with unoptimized files
**Use**: Local testing and preview

### Production Build (Deployment)

```bash
npm run build:production
```

**Features**:
- JavaScript minification (40.9% size reduction)
- Source file copying
- Performance metrics reporting

**Output**:
```
✅ Production Build Complete
- Total Files: 129
- JavaScript: 90 files (1.40 MB → 0.83 MB)
- Total Size: ~14.77 MB
- Build Time: ~3-4 seconds
```

### Build Verification

```bash
# Preview production build locally
npm run preview
```

Opens server at `http://localhost:4173`

**Verify**:
- [ ] All pages load correctly
- [ ] JavaScript executes properly
- [ ] No console errors
- [ ] Features functional
- [ ] Styles applied correctly

---

## 🌐 Vercel Deployment

### Automatic Deployment (Recommended)

**When you push to GitHub**:
1. Vercel automatically detects changes
2. Runs `npm run build:production`
3. Deploys `/dist` directory
4. Provides deployment URL

**Commands**:
```bash
# Push Phase 3 changes
git push origin main

# Vercel auto-deploys
# Check dashboard: https://vercel.com/dashboard
```

### Manual Deployment

```bash
# Build and deploy manually
npm run vercel:deploy
```

**Process**:
1. Runs production build
2. Deploys to Vercel
3. Returns deployment URL

### Deployment Configuration

**File**: `vercel.json`
```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": "dist"
}
```

---

## ⚙️ Environment Configuration

### Environment Variables

#### Development (`.env.development`)
```bash
NODE_ENV=development
VITE_DEV_SERVER_PORT=3000
```

#### Production (Vercel Dashboard)
Configure in Vercel project settings:

**Required**:
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `FIREBASE_APP_ID` - Firebase app ID

**Optional**:
- `OPENAI_API_KEY` - For AI features
- `ANALYTICS_ID` - Google Analytics ID

### Setting Vercel Environment Variables

1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Add each variable
5. Redeploy if needed

---

## ✅ Post-Deployment Verification

### 1. Smoke Tests

```bash
# Test production URL
curl -I https://your-domain.vercel.app
```

**Expected**: `HTTP/2 200`

### 2. Feature Testing

- [ ] Homepage loads
- [ ] Authentication works
- [ ] Dashboard displays
- [ ] Test Prep functional
- [ ] Casino gamification works
- [ ] Essay coach accessible
- [ ] Forms submit correctly
- [ ] Navigation works

### 3. Performance Testing

**Run Lighthouse Audit**:
1. Open Chrome DevTools
2. Lighthouse tab
3. Generate report

**Expected Scores** (Phase 3 Target):
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 4. Security Testing

- [ ] HTTPS enabled
- [ ] CSP headers active
- [ ] No console warnings
- [ ] Firebase rules enforced
- [ ] API keys secure

### 5. Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Skip links functional
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA labels present

---

## ⏪ Rollback Procedure

### Quick Rollback (Vercel Dashboard)

1. Go to Vercel dashboard
2. Select deployment
3. Click "..." menu
4. Select "Promote to Production"
5. Choose previous successful deployment

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

**⚠️ Warning**: Force push overwrites history

### Emergency Rollback

```bash
# Immediately redeploy last known good version
vercel --prod --force
```

---

## 📊 Performance Monitoring

### Real-Time Monitoring

**Vercel Analytics** (included):
- Page views
- Load times
- Error rates
- Geographic distribution

**Access**: Vercel Dashboard → Analytics

### Client-Side Monitoring

**Performance Monitor** (included in Phase 3):
```javascript
// Check performance in console
window.perfMonitor.getReport()

// Export metrics
window.perfMonitor.exportMetrics()
```

**Metrics Tracked**:
- Page load time
- Time to First Byte (TTFB)
- DOM Content Loaded
- Resource loading times

### Setting Up Alerts

**Vercel Integrations**:
1. Dashboard → Integrations
2. Add monitoring service (e.g., Datadog, Sentry)
3. Configure alert thresholds
4. Set notification channels

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `npm run build:production` fails

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try development build first
npm run build

# Check for syntax errors
npm test
```

### Deployment Fails

**Error**: Vercel deployment fails

**Check**:
1. Vercel build logs
2. Environment variables set
3. `vercel.json` configuration
4. Node.js version (should be 22.x)

**Fix**:
```bash
# Verify Vercel CLI
vercel --version

# Re-link project
vercel link

# Manual deploy
vercel --prod
```

### 404 Errors

**Error**: Pages return 404

**Check**:
- [ ] `vercel.json` rewrites configured
- [ ] HTML files present in `/dist`
- [ ] Build completed successfully

**Fix**: Ensure `vercel.json` has correct rewrites:
```json
{
  "rewrites": [
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/testprep", "destination": "/testprep.html" }
  ]
}
```

### Slow Performance

**Symptoms**: Pages load slowly

**Debug**:
```javascript
// Check performance metrics
window.perfMonitor.logPerformanceSummary()
```

**Optimize**:
1. Check network tab in DevTools
2. Identify large resources
3. Enable lazy loading
4. Compress images
5. Review Lighthouse report

### JavaScript Errors

**Error**: Console shows JS errors

**Debug**:
```bash
# Test locally first
npm run dev

# Check browser console
# Check error logs in Vercel
```

**Fix**:
1. Verify all dependencies installed
2. Check for broken imports
3. Test in production build locally
4. Review error stack traces

### Firebase Errors

**Error**: Firebase connection fails

**Check**:
- [ ] Environment variables set in Vercel
- [ ] Firebase project active
- [ ] API keys valid
- [ ] Firestore rules deployed

**Fix**:
```bash
# Deploy Firebase rules
firebase deploy --only firestore:rules

# Check Firebase console for errors
```

---

## 📈 Performance Optimization

### Phase 3 Optimizations (✅ Implemented)

1. **JavaScript Minification** (40.9% savings)
   - All JS files minified with Terser
   - 1.40 MB → 0.83 MB

2. **Build System**
   - Custom production build script
   - Automated optimization pipeline

3. **Accessibility Layer**
   - WCAG 2.1 AA compliant
   - 100% keyboard accessible

4. **Security Hardening**
   - Input sanitization
   - CSP headers
   - Firebase anti-cheat rules

### Additional Optimizations (Optional)

1. **Image Optimization**
   ```bash
   # Install sharp for image optimization
   npm install --save-dev sharp

   # Compress images
   # Add to build-production.js
   ```

2. **CSS Minification**
   ```bash
   # Install cssnano
   npm install --save-dev cssnano postcss

   # Minify CSS in build script
   ```

3. **Lazy Loading**
   ```html
   <!-- Add to images -->
   <img src="..." loading="lazy">

   <!-- Add to scripts -->
   <script src="..." defer>
   ```

4. **Service Worker** (PWA)
   ```javascript
   // Already present: public/service-worker.js
   // Register in HTML pages
   ```

---

## 📚 Additional Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

### Internal Docs
- [CHANGELOG.md](./CHANGELOG.md) - All changes
- [BUILD_GUIDE.md](./BUILD_GUIDE.md) - Build system details
- [QUICK_START.md](./QUICK_START.md) - Quick commands
- [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md) - Phase 3 summary

### Support
- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support

---

## ✅ Deployment Checklist

**Pre-Deployment**:
- [ ] Code tested locally
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Documentation updated

**Deployment**:
- [ ] Push to GitHub
- [ ] Verify Vercel build successful
- [ ] Check deployment URL

**Post-Deployment**:
- [ ] Run smoke tests
- [ ] Test key features
- [ ] Run Lighthouse audit
- [ ] Monitor for errors
- [ ] Verify accessibility
- [ ] Check performance metrics

**Sign-Off**:
- [ ] Product team approved
- [ ] Engineering team approved
- [ ] QA passed
- [ ] Ready for production traffic

---

**Version**: 2.0.0 (Phase 3)
**Last Updated**: October 28, 2025
**Status**: Production Ready ✅
