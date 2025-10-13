#!/bin/bash

# Week 2 Protection Phase - Deployment Script
# Verifies all protected pages have auth guards and loading states

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Week 2 Protection Phase - Deployment Verification            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to check if a file contains a string
check_file_contains() {
    local file=$1
    local search_string=$2
    local description=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if grep -q "$search_string" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

echo "📋 Verifying Authentication Guards..."
echo "────────────────────────────────────────────────────────────────"

# Check all protected pages have auth guard
check_file_contains "public/dashboard.html" "/js/auth-guard.js" "dashboard.html has auth guard"
check_file_contains "public/essaycoach.html" "/js/auth-guard.js" "essaycoach.html has auth guard"
check_file_contains "public/adaptive-timeline.html" "/js/auth-guard.js" "adaptive-timeline.html has auth guard"
check_file_contains "public/testprep-enhanced.html" "/js/auth-guard.js" "testprep-enhanced.html has auth guard"
check_file_contains "public/scholarship.html" "/js/auth-guard.js" "scholarship.html has auth guard"
check_file_contains "public/my-scholarships.html" "/js/auth-guard.js" "my-scholarships.html has auth guard"
check_file_contains "public/document.html" "/js/auth-guard.js" "document.html has auth guard"
check_file_contains "public/profile.html" "/js/auth-guard.js" "profile.html has auth guard"

echo ""
echo "⏳ Verifying Loading State Managers..."
echo "────────────────────────────────────────────────────────────────"

# Check all protected pages have loading states
check_file_contains "public/dashboard.html" "/js/loading-state.js" "dashboard.html has loading states"
check_file_contains "public/essaycoach.html" "/js/loading-state.js" "essaycoach.html has loading states"
check_file_contains "public/adaptive-timeline.html" "/js/loading-state.js" "adaptive-timeline.html has loading states"
check_file_contains "public/testprep-enhanced.html" "/js/loading-state.js" "testprep-enhanced.html has loading states"
check_file_contains "public/scholarship.html" "/js/loading-state.js" "scholarship.html has loading states"
check_file_contains "public/my-scholarships.html" "/js/loading-state.js" "my-scholarships.html has loading states"
check_file_contains "public/document.html" "/js/loading-state.js" "document.html has loading states"
check_file_contains "public/profile.html" "/js/loading-state.js" "profile.html has loading states"

echo ""
echo "🔧 Verifying Core Infrastructure Files..."
echo "────────────────────────────────────────────────────────────────"

# Check that infrastructure files exist
if [ -f "public/js/auth-guard.js" ]; then
    echo -e "${GREEN}✅${NC} auth-guard.js exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} auth-guard.js missing"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

if [ -f "public/js/loading-state.js" ]; then
    echo -e "${GREEN}✅${NC} loading-state.js exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} loading-state.js missing"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

if [ -f "public/js/auto-save.js" ]; then
    echo -e "${GREEN}✅${NC} auto-save.js exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} auto-save.js missing"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "📄 Verifying Documentation..."
echo "────────────────────────────────────────────────────────────────"

if [ -f "WEEK_2_PROTECTION_COMPLETE.md" ]; then
    echo -e "${GREEN}✅${NC} WEEK_2_PROTECTION_COMPLETE.md exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} WEEK_2_PROTECTION_COMPLETE.md missing"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

if [ -f "WEEK_2_VISUAL_SUMMARY.txt" ]; then
    echo -e "${GREEN}✅${NC} WEEK_2_VISUAL_SUMMARY.txt exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    echo -e "${RED}❌${NC} WEEK_2_VISUAL_SUMMARY.txt missing"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION RESULTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Total Checks:  $TOTAL_CHECKS"
echo -e "Passed:        ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:        ${RED}$FAILED_CHECKS${NC}"
echo ""

# Calculate percentage
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT!                 ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Commit changes: git add . && git commit -m 'Week 2: Protect all pages'"
    echo "   2. Deploy to Vercel: vercel --prod"
    echo "   3. Test authentication on all protected pages"
    echo "   4. Verify loading states work correctly"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  SOME CHECKS FAILED - REVIEW BEFORE DEPLOYMENT            ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "⚠️  Please fix the failed checks above before deploying."
    echo ""
    exit 1
fi
