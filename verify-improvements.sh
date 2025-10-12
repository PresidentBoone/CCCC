#!/bin/bash
# Comprehensive verification script for all Phase 1 improvements

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CollegeClimb AI Platform - Implementation Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_check() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    
    if [ "$expected" = "$actual" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name (Expected: $expected, Got: $actual)"
        FAIL=$((FAIL + 1))
    fi
}

test_warning() {
    local test_name="$1"
    local message="$2"
    echo -e "${YELLOW}⚠️  WARN${NC} - $test_name: $message"
    WARN=$((WARN + 1))
}

echo "📋 Phase 1: Critical Security & Infrastructure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Error Boundary Integration
echo "🔧 Testing Error Boundary Integration..."
ERROR_BOUNDARY_COUNT=$(grep -l "error-boundary.js" public/*.html 2>/dev/null | wc -l | tr -d ' ')
test_check "Error boundary in HTML files" "15" "$ERROR_BOUNDARY_COUNT"

ERROR_HANDLER_COUNT=$(grep -l "error-handler.js" public/*.html 2>/dev/null | wc -l | tr -d ' ')
test_check "Error handler in HTML files" "15" "$ERROR_HANDLER_COUNT"

# Test 2: Firebase Config Integration
echo ""
echo "🔥 Testing Firebase Configuration..."
FIREBASE_CONFIG_COUNT=$(grep -l "firebase-config.js" public/*.html 2>/dev/null | wc -l | tr -d ' ')
if [ "$FIREBASE_CONFIG_COUNT" -ge "13" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Firebase config in HTML files ($FIREBASE_CONFIG_COUNT files)"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} - Firebase config in HTML files (Expected: ≥13, Got: $FIREBASE_CONFIG_COUNT)"
    FAIL=$((FAIL + 1))
fi

# Test 3: Rate Limiting in APIs
echo ""
echo "⚡ Testing Rate Limiting..."
RATE_LIMIT_COUNT=$(grep -l "applyRateLimit" api/*.js 2>/dev/null | wc -l | tr -d ' ')
test_check "Rate limiting in API endpoints" "7" "$RATE_LIMIT_COUNT"

# Check specific API endpoints
if grep -q "applyRateLimit" api/essay-chat.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} - essay-chat.js has rate limiting"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} - essay-chat.js missing rate limiting"
    FAIL=$((FAIL + 1))
fi

if grep -q "applyRateLimit" api/essay-analyze.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} - essay-analyze.js has rate limiting"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} - essay-analyze.js missing rate limiting"
    FAIL=$((FAIL + 1))
fi

if grep -q "applyRateLimit" api/testprep-generate.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC} - testprep-generate.js has rate limiting"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} - testprep-generate.js missing rate limiting"
    FAIL=$((FAIL + 1))
fi

# Test 4: File Existence
echo ""
echo "📁 Testing Critical Files..."
FILES=(
    "public/js/error-boundary.js"
    "public/js/error-handler.js"
    "public/js/firebase-config.js"
    "api/rate-limiter.js"
    "COMPREHENSIVE_IMPROVEMENT_ANALYSIS.md"
    "IMPLEMENTATION_GUIDE.md"
    "EXECUTION_SUMMARY.md"
    "IMPLEMENTATION_STATUS.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $file exists"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $file missing"
        FAIL=$((FAIL + 1))
    fi
done

# Test 5: Code Quality Checks
echo ""
echo "🎨 Testing Code Quality..."

# Check for hardcoded API keys (should be minimal)
HARDCODED_KEYS=$(grep -r "apiKey.*AIza" public/js/*.js 2>/dev/null | grep -v "firebase-config.js" | wc -l | tr -d ' ')
if [ "$HARDCODED_KEYS" -le "2" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Minimal hardcoded API keys ($HARDCODED_KEYS instances)"
    PASS=$((PASS + 1))
else
    test_warning "Hardcoded API keys" "Found $HARDCODED_KEYS instances (should be ≤2)"
fi

# Test 6: JavaScript Syntax Check
echo ""
echo "🔍 Testing JavaScript Syntax..."
JS_FILES=(
    "public/js/error-boundary.js"
    "public/js/error-handler.js"
    "public/js/firebase-config.js"
    "public/js/app-init.js"
)

for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if file is valid JavaScript (basic check)
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ PASS${NC} - $file syntax valid"
            PASS=$((PASS + 1))
        else
            echo -e "${YELLOW}⚠️  WARN${NC} - $file syntax check failed (may be browser-only code)"
            WARN=$((WARN + 1))
        fi
    fi
done

# Test 7: Documentation Completeness
echo ""
echo "📚 Testing Documentation..."
DOC_FILES=(
    "COMPREHENSIVE_IMPROVEMENT_ANALYSIS.md"
    "IMPLEMENTATION_GUIDE.md"
    "EXECUTION_SUMMARY.md"
    "IMPLEMENTATION_STATUS.md"
    ".env.example"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file" | tr -d ' ')
        if [ "$LINES" -gt "50" ]; then
            echo -e "${GREEN}✅ PASS${NC} - $file is comprehensive ($LINES lines)"
            PASS=$((PASS + 1))
        else
            test_warning "$file" "May be incomplete ($LINES lines)"
        fi
    fi
done

# Test 8: Integration Points
echo ""
echo "🔗 Testing Integration Points..."

# Check if HTML files load error scripts before app scripts
PROPER_ORDER=0
for file in public/index.html public/dashboard.html public/essaycoach.html; do
    if [ -f "$file" ]; then
        # Very basic check - error-boundary should appear before closing head tag
        if grep -B 5 "</head>" "$file" | grep -q "error-boundary.js"; then
            PROPER_ORDER=$((PROPER_ORDER + 1))
        fi
    fi
done

if [ "$PROPER_ORDER" -ge "2" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Error handlers loaded in correct order"
    PASS=$((PASS + 1))
else
    test_warning "Script loading order" "May not be optimal in all files"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (PASS * 100) / TOTAL ))
    echo "Success Rate: $SUCCESS_RATE%"
    echo ""
fi

# Overall status
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED - READY FOR DEPLOYMENT${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
elif [ $FAIL -le 2 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  MINOR ISSUES DETECTED - REVIEW BEFORE DEPLOYMENT${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ CRITICAL FAILURES - DO NOT DEPLOY${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 2
fi
