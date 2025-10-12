#!/bin/bash
# Master deployment script for CollegeClimb AI Platform
# Run this after Phase 1 improvements are complete

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 CollegeClimb AI Platform - Pre-Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verify environment setup
echo -e "${BLUE}📋 Step 1: Environment Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.local" ] || [ -f ".env" ]; then
    check_pass "Environment file exists"
else
    check_fail "Missing .env or .env.local file"
    echo "  → Run: cp .env.example .env.local"
    echo "  → Then add your Firebase credentials"
fi

# 2. Verify critical files
echo ""
echo -e "${BLUE}📁 Step 2: Critical Files Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CRITICAL_FILES=(
    "public/js/error-boundary.js"
    "public/js/error-handler.js"
    "public/js/firebase-config.js"
    "api/rate-limiter.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

# 3. Check dependencies
echo ""
echo -e "${BLUE}📦 Step 3: Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "package.json" ]; then
    check_pass "package.json exists"
    
    if [ -d "node_modules" ]; then
        check_pass "Dependencies installed"
    else
        check_warn "Dependencies not installed - run: npm install"
    fi
else
    check_fail "package.json missing"
fi

# 4. Verify improvements integration
echo ""
echo -e "${BLUE}🔧 Step 4: Phase 1 Improvements${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERROR_BOUNDARY_COUNT=$(grep -l "error-boundary.js" public/*.html 2>/dev/null | wc -l | tr -d ' ')
if [ "$ERROR_BOUNDARY_COUNT" -ge "15" ]; then
    check_pass "Error boundary integrated ($ERROR_BOUNDARY_COUNT pages)"
else
    check_fail "Error boundary not fully integrated (found: $ERROR_BOUNDARY_COUNT, expected: 15+)"
fi

RATE_LIMIT_COUNT=$(grep -l "applyRateLimit" api/*.js 2>/dev/null | wc -l | tr -d ' ')
if [ "$RATE_LIMIT_COUNT" -ge "7" ]; then
    check_pass "Rate limiting implemented ($RATE_LIMIT_COUNT endpoints)"
else
    check_fail "Rate limiting incomplete (found: $RATE_LIMIT_COUNT, expected: 7+)"
fi

FIREBASE_CONFIG_COUNT=$(grep -l "firebase-config.js" public/*.html 2>/dev/null | wc -l | tr -d ' ')
if [ "$FIREBASE_CONFIG_COUNT" -ge "13" ]; then
    check_pass "Firebase config centralized ($FIREBASE_CONFIG_COUNT pages)"
else
    check_warn "Firebase config partially implemented ($FIREBASE_CONFIG_COUNT pages)"
fi

# 5. Security checks
echo ""
echo -e "${BLUE}🔒 Step 5: Security Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HARDCODED_KEYS=$(grep -r "apiKey.*AIza" public/js/*.js 2>/dev/null | grep -v "firebase-config.js" | wc -l | tr -d ' ')
if [ "$HARDCODED_KEYS" -eq "0" ]; then
    check_pass "No hardcoded API keys found"
else
    check_warn "Found $HARDCODED_KEYS hardcoded API key(s)"
fi

# 6. Run comprehensive tests
echo ""
echo -e "${BLUE}🧪 Step 6: Running Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "verify-improvements.sh" ]; then
    echo "Running comprehensive verification..."
    if bash verify-improvements.sh > /dev/null 2>&1; then
        check_pass "All verification tests passed"
    else
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 1 ]; then
            check_warn "Minor issues detected (see verify-improvements.sh output)"
        else
            check_fail "Critical test failures detected"
        fi
    fi
else
    check_warn "Verification script not found"
fi

# 7. Final checklist
echo ""
echo -e "${BLUE}📝 Step 7: Manual Deployment Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Please confirm the following manually:"
echo ""
echo "  [ ] Created .env.local with actual Firebase credentials"
echo "  [ ] Tested locally with: npm start"
echo "  [ ] Verified signup/login works"
echo "  [ ] Verified error boundary catches errors"
echo "  [ ] Verified rate limiting works"
echo "  [ ] Updated Vercel environment variables (if using Vercel)"
echo "  [ ] Backed up current production database"
echo "  [ ] Notified team about deployment"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Deployment Readiness Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Automated Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Automated Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 READY FOR DEPLOYMENT!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Complete manual checklist above"
    echo "  2. Deploy with: vercel --prod"
    echo "     Or: git push origin main"
    echo ""
    echo "  3. Monitor first 24 hours:"
    echo "     - Check error rates"
    echo "     - Verify rate limiting works"
    echo "     - Monitor user feedback"
    echo ""
    exit 0
elif [ $CHECKS_FAILED -le 2 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  MINOR ISSUES - REVIEW BEFORE DEPLOYMENT${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Review the failures above and fix before deploying."
    echo ""
    exit 1
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ NOT READY - CRITICAL ISSUES DETECTED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Fix critical issues before deploying:"
    echo ""
    echo "  1. Review failures above"
    echo "  2. Run: ./verify-improvements.sh"
    echo "  3. Fix issues"
    echo "  4. Run this script again"
    echo ""
    exit 2
fi
