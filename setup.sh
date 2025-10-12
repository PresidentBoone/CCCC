#!/bin/bash

# College Climb - Quick Setup Script
# This script helps you configure the platform for first use

echo "🎓 College Climb Platform Setup"
echo "================================"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
    echo ""
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
    else
        cp .env.example .env
        echo "✅ Created new .env from template"
    fi
else
    cp .env.example .env
    echo "✅ Created .env from template"
fi

echo ""
echo "📝 Configuration needed:"
echo "========================"
echo ""

# Check if OpenAI key is set
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  OPENAI_API_KEY not configured"
    echo ""
    echo "To get your OpenAI API key:"
    echo "1. Go to https://platform.openai.com/api-keys"
    echo "2. Sign up or log in"
    echo "3. Click 'Create new secret key'"
    echo "4. Copy the key (starts with sk-)"
    echo ""
    read -p "Enter your OpenAI API key (or press Enter to skip): " openai_key
    if [ ! -z "$openai_key" ]; then
        # Escape special characters for sed
        escaped_key=$(echo "$openai_key" | sed 's/[&/\]/\\&/g')
        sed -i.bak "s/OPENAI_API_KEY=your_openai_api_key_here/OPENAI_API_KEY=$escaped_key/" .env
        rm .env.bak
        echo "✅ OpenAI API key configured"
    else
        echo "⏭️  Skipped OpenAI key setup (you can add it later in .env)"
    fi
else
    echo "✅ OPENAI_API_KEY already configured"
fi

echo ""

# Check if College Scorecard key is set
if grep -q "your_college_scorecard_api_key_here" .env; then
    echo "⚠️  COLLEGE_SCORECARD_API_KEY not configured (optional)"
    echo ""
    echo "To get College Scorecard API key (optional but recommended):"
    echo "1. Go to https://collegescorecard.ed.gov/data/documentation/"
    echo "2. Request an API key (free)"
    echo ""
    read -p "Enter your College Scorecard API key (or press Enter to skip): " scorecard_key
    if [ ! -z "$scorecard_key" ]; then
        escaped_key=$(echo "$scorecard_key" | sed 's/[&/\]/\\&/g')
        sed -i.bak "s/COLLEGE_SCORECARD_API_KEY=your_college_scorecard_api_key_here/COLLEGE_SCORECARD_API_KEY=$escaped_key/" .env
        rm .env.bak
        echo "✅ College Scorecard API key configured"
    else
        echo "⏭️  Skipped College Scorecard key (you can add it later in .env)"
    fi
else
    echo "✅ COLLEGE_SCORECARD_API_KEY already configured"
fi

echo ""
echo "================================"
echo "📋 Setup Summary"
echo "================================"
echo ""

# Check what's configured
openai_status="❌ Not configured"
scorecard_status="❌ Not configured"

if ! grep -q "your_openai_api_key_here" .env; then
    openai_status="✅ Configured"
fi

if ! grep -q "your_college_scorecard_api_key_here" .env; then
    scorecard_status="✅ Configured"
fi

echo "OpenAI API Key: $openai_status"
echo "College Scorecard API Key: $scorecard_status"
echo ""

# Next steps
echo "================================"
echo "🚀 Next Steps"
echo "================================"
echo ""
echo "1. ⚠️  Deploy Firestore Rules (CRITICAL):"
echo "   - Go to https://console.firebase.google.com"
echo "   - Select 'collegeclimb-ai' project"
echo "   - Go to Firestore Database → Rules"
echo "   - Copy all contents from firestore.rules"
echo "   - Paste and click Publish"
echo ""
echo "2. 🧪 Test the platform:"
echo "   npm run dev"
echo "   # Open http://localhost:3000"
echo ""
echo "3. 📖 Read the full audit report:"
echo "   cat COMPREHENSIVE_PLATFORM_AUDIT.md"
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Node modules not installed"
    echo ""
    read -p "Install dependencies now? (Y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "Installing dependencies..."
        npm install
        echo "✅ Dependencies installed"
    fi
fi

echo ""
echo "✨ Setup complete! Run 'npm run dev' to start developing."
echo ""
