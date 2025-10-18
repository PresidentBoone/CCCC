#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING COLLEGE CLIMB TO PRODUCTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo ""
echo "Step 1: Building for production..."
# Clean up test files
rm -f test-*.js test-*.sh quick-*.sh demo-*.sh run-*.sh

echo ""
echo "Step 2: Deploying to Vercel..."
vercel --prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Add these environment variables in Vercel Dashboard:"
echo ""
echo "OPENAI_API_KEY=<your-openai-api-key-here>"
echo ""
echo "NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>"
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com"
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>"
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.firebasestorage.app"
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=187139654658"
echo "NEXT_PUBLIC_FIREBASE_APP_ID=1:187139654658:web:4a6cf4c43095f03212931b"
echo "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-E0B2RQM9XS"
echo ""
echo "Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
echo "AFTER adding env vars, redeploy with: vercel --prod"
echo ""
