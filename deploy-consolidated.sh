#!/bin/bash
# Quick Deployment Script for Consolidated APIs
# Run this to deploy College Climb with consolidated endpoints

echo "🚀 College Climb - Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "api" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Count API endpoints
MAIN_COUNT=$(ls -1 api/ | wc -l | tr -d ' ')
CCCC_COUNT=$(ls -1 collegeclimb/CCCC-18/api/ | wc -l | tr -d ' ')
TOTAL=$((MAIN_COUNT + CCCC_COUNT))

echo "📊 API Endpoint Count:"
echo "   Main API:    $MAIN_COUNT"
echo "   CCCC-18 API: $CCCC_COUNT"
echo "   TOTAL:       $TOTAL/12"
echo ""

if [ $TOTAL -gt 12 ]; then
    echo "❌ ERROR: Still over Vercel limit ($TOTAL > 12)"
    echo "   Please review API_CONSOLIDATION_COMPLETE.md"
    exit 1
fi

echo "✅ Under Vercel limit!"
echo ""

# List API files
echo "📁 API Files:"
echo "   Main API folder:"
ls -1 api/ | sed 's/^/      /'
echo ""
echo "   CCCC-18 API folder:"
ls -1 collegeclimb/CCCC-18/api/ | sed 's/^/      /'
echo ""

# Confirm deployment
read -p "🤔 Deploy to Vercel? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check Vercel dashboard for function count"
echo "   2. Test essay storage: /essaycoach.html"
echo "   3. Test chat: /dashboard.html"
echo "   4. Test timeline: /adaptive-timeline.html"
echo "   5. Monitor for errors in Vercel logs"
echo ""
echo "📖 Documentation: API_CONSOLIDATION_COMPLETE.md"
