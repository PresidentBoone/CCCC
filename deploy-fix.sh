#!/bin/bash
# Quick deployment fix for Vercel Hobby plan function limit

echo "🚀 College Climb - Vercel Deployment Fix"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run from project root."
    exit 1
fi

echo "✅ Step 1: Verifying file structure..."
if [ ! -f "api/index.js" ]; then
    echo "❌ Error: api/index.js not found"
    exit 1
fi

if [ ! -d "api/handlers" ]; then
    echo "❌ Error: api/handlers directory not found"
    exit 1
fi

echo "✅ Step 2: Checking handler files..."
for handler in chat essay-analyze essay-storage college-search testprep-generate timeline scrape-scholarships; do
    if [ ! -f "api/handlers/$handler.js" ]; then
        echo "❌ Warning: api/handlers/$handler.js not found"
    else
        echo "   ✓ $handler.js found"
    fi
done

echo ""
echo "✅ Step 3: Staging changes..."
git add api/index.js
git add api/handlers/
git add vercel.json
git add .vercelignore
git add VERCEL_DEPLOYMENT_FIX.md

echo ""
echo "✅ Step 4: Committing changes..."
git commit -m "Fix: Consolidate API to single serverless function for Vercel Hobby plan

- Created unified api/index.js handler (1 function instead of 15+)
- Moved API logic to api/handlers/ directory
- Updated vercel.json to deploy only index.js
- Added .vercelignore to prevent duplicate deployments
- All functionality maintained, no features lost

This fixes the 'No more than 12 Serverless Functions' deployment error"

echo ""
echo "✅ Step 5: Pushing to GitHub..."
git push origin main

echo ""
echo "========================================="
echo "✅ DEPLOYMENT FIX COMPLETE!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Vercel will automatically redeploy from GitHub"
echo "2. Or run: vercel --prod"
echo "3. Check deployment status at: https://vercel.com/dashboard"
echo ""
echo "Expected result: Deployment succeeds with 1 serverless function ✅"
echo ""
