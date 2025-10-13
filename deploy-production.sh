#!/bin/bash

# 🚀 College Climb - One-Click Production Deployment
# This script handles the complete deployment to Vercel

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║    🎓 COLLEGE CLIMB - PRODUCTION DEPLOYMENT 🚀           ║"
echo "║                                                          ║"
echo "║    Billion-Dollar Platform - Ready for Launch           ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Step 1: Pre-flight checks
echo -e "${YELLOW}📋 Step 1: Pre-flight Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    echo "Would you like to commit them? (y/n)"
    read -r commit_choice
    
    if [[ $commit_choice == "y" ]]; then
        echo "Enter commit message:"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${RED}❌ Please commit or stash changes before deploying${NC}"
        exit 1
    fi
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Check Node version
node_version=$(node -v)
echo -e "${GREEN}✅ Node.js version: $node_version${NC}"

# Check if vercel.json exists
if [[ ! -f "vercel.json" ]]; then
    echo -e "${RED}❌ vercel.json not found!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ vercel.json found${NC}"
fi

# Verify critical files exist
critical_files=("api/index.js" "public/index.html" "public/dashboard.html")
for file in "${critical_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ Critical file missing: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All critical files present${NC}"

echo ""

# Step 2: Environment Variables Check
echo -e "${YELLOW}🔐 Step 2: Environment Variables Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Have you set up environment variables in Vercel? (y/n)"
echo "  - OPENAI_API_KEY"
echo "  - FIREBASE_PROJECT_ID (optional)"
echo "  - FIREBASE_CLIENT_EMAIL (optional)"
echo "  - FIREBASE_PRIVATE_KEY (optional)"
read -r env_setup

if [[ $env_setup != "y" ]]; then
    echo -e "${YELLOW}⚠️  Please set up environment variables first:${NC}"
    echo "   1. Go to https://vercel.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to Settings > Environment Variables"
    echo "   4. Add required variables"
    echo ""
    echo "Or use: vercel env add OPENAI_API_KEY"
    echo ""
    echo "Continue anyway? (y/n)"
    read -r continue_anyway
    if [[ $continue_anyway != "y" ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment variables confirmed${NC}"
echo ""

# Step 3: Choose deployment type
echo -e "${YELLOW}🎯 Step 3: Deployment Type${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Select deployment type:"
echo "  1) Preview (test deployment)"
echo "  2) Production (live deployment)"
echo ""
read -r -p "Enter choice (1 or 2): " deploy_choice

if [[ $deploy_choice == "1" ]]; then
    DEPLOY_CMD="vercel"
    DEPLOY_TYPE="PREVIEW"
elif [[ $deploy_choice == "2" ]]; then
    DEPLOY_CMD="vercel --prod"
    DEPLOY_TYPE="PRODUCTION"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment type: $DEPLOY_TYPE${NC}"
echo ""

# Step 4: Final confirmation
echo -e "${YELLOW}⚡ Step 4: Final Confirmation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Ready to deploy:${NC}"
echo "  • Type: $DEPLOY_TYPE"
echo "  • Branch: $(git branch --show-current)"
echo "  • Commit: $(git log -1 --pretty=format:'%h - %s')"
echo ""
echo -e "${YELLOW}⚠️  This will deploy to Vercel. Continue? (y/n)${NC}"
read -r final_confirm

if [[ $final_confirm != "y" ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""

# Step 5: Deploy
echo -e "${YELLOW}🚀 Step 5: Deploying to Vercel...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run deployment
$DEPLOY_CMD

deployment_status=$?

echo ""

# Step 6: Post-deployment
if [[ $deployment_status -eq 0 ]]; then
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║    🎉 DEPLOYMENT SUCCESSFUL! 🎉                          ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}📋 Post-Deployment Checklist:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ☐ Test homepage loads"
    echo "  ☐ Test user sign-up"
    echo "  ☐ Test login"
    echo "  ☐ Test dashboard"
    echo "  ☐ Test essay coach AI"
    echo "  ☐ Test college discovery"
    echo "  ☐ Test test prep"
    echo "  ☐ Check Firebase connection"
    echo "  ☐ Monitor error logs"
    echo ""
    echo -e "${GREEN}🔗 Useful Commands:${NC}"
    echo "  • View logs:        ${BLUE}vercel logs --follow${NC}"
    echo "  • Check domains:    ${BLUE}vercel domains${NC}"
    echo "  • Open dashboard:   ${BLUE}vercel${NC}"
    echo ""
    echo -e "${YELLOW}📊 Monitor your deployment:${NC}"
    echo "  • Vercel Dashboard: https://vercel.com/dashboard"
    echo "  • Firebase Console: https://console.firebase.google.com"
    echo ""
    echo -e "${GREEN}✨ Your billion-dollar platform is LIVE! ✨${NC}"
else
    echo -e "${RED}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║    ❌ DEPLOYMENT FAILED ❌                               ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}🔍 Troubleshooting Steps:${NC}"
    echo "  1. Check vercel.json syntax"
    echo "  2. Verify all environment variables are set"
    echo "  3. Check for build errors in logs"
    echo "  4. Ensure all dependencies are installed"
    echo "  5. Review Vercel dashboard for details"
    echo ""
    echo -e "${BLUE}Need help? Check:${NC}"
    echo "  • Vercel docs: https://vercel.com/docs"
    echo "  • Deployment logs: ${BLUE}vercel logs${NC}"
    exit 1
fi
