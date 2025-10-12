#!/bin/bash

# 🚀 College Climb - Quick Launch Script
# This script will help you launch your platform in under 5 minutes

set -e  # Exit on error

echo "🎓 College Climb - Quick Launch Guide"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "🔑 IMPORTANT: You need to add your API keys to the .env file"
    echo ""
    echo "📝 Edit the .env file and add:"
    echo "   1. OpenAI API Key (get from: https://platform.openai.com/api-keys)"
    echo "   2. College Scorecard API Key (get from: https://collegescorecard.ed.gov)"
    echo ""
    echo "   For now, the platform will use MOCK AI responses (still fully functional!)"
    echo ""
    read -p "Press Enter to continue..."
else
    echo "✅ .env file exists"
fi

echo ""
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔥 Starting local server..."
echo "   Server will run on: http://localhost:3003"
echo ""
echo "📱 You can now access:"
echo "   - Dashboard: http://localhost:3003/dashboard.html"
echo "   - Essay Coach: http://localhost:3003/essaycoach.html"
echo "   - Timeline: http://localhost:3003/adaptive-timeline.html"
echo "   - Test Prep: http://localhost:3003/testprep-enhanced.html"
echo ""
echo "🛑 To stop the server, press Ctrl+C"
echo ""
echo "======================================"
echo ""

# Start the server
node test-server.js
