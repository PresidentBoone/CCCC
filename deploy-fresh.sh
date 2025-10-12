#!/bin/bash

# 🚀 Deploy to Vercel with Cache Cleared
# Use this script after making changes to ensure fresh deployment

echo "🚀 Deploying College Climb to Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel || sudo npm install -g vercel
fi

echo "📦 Deploying with force flag to bypass cache..."
echo ""

# Deploy with force flag
vercel --prod --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo ""
echo "🔄 Next steps:"
echo "1. Wait 2-5 minutes for CDN propagation"
echo "2. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo "3. Or open in incognito/private window"
echo ""
echo "🧪 To verify deployment worked:"
echo "- Dashboard should have working profile dropdown"
echo "- Dashboard should load test prep data"
echo "- Essay Coach should use emoji theme toggle (☀️/🌙)"
echo "- Essay Coach analysis should work without JSON errors"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
