#!/bin/bash

# Quick Improvement Script for CollegeClimb AI Platform
# Automates applying critical improvements to all pages

echo "🚀 CollegeClimb AI - Quick Improvement Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to add error boundary to HTML file
add_error_boundary_to_file() {
    local file=$1
    echo -n "  Adding error boundary to $(basename $file)... "
    
    # Check if already added
    if grep -q "error-boundary.js" "$file"; then
        echo -e "${YELLOW}Already added${NC}"
        return
    fi
    
    # Add scripts after <head> tag
    sed -i.backup '/<head>/a\
    <!-- Error Handling & Security -->\
    <script src="/js/error-boundary.js"></script>\
    <script src="/js/error-handler.js"></script>\
    <script src="/js/logger.js"></script>
' "$file"
    
    echo -e "${GREEN}✓ Done${NC}"
}

# Function to add Firebase config import
add_firebase_config_to_file() {
    local file=$1
    echo -n "  Adding Firebase config to $(basename $file)... "
    
    # Check if already using centralized config
    if grep -q 'firebase-config.js' "$file"; then
        echo -e "${YELLOW}Already updated${NC}"
        return
    fi
    
    # This is complex - just notify user
    echo -e "${YELLOW}Manual update required${NC}"
}

echo "📋 Step 1: Adding Error Boundaries to HTML Pages"
echo "================================================="
echo ""

# Find all HTML files except backups
html_files=$(find public -name "*.html" ! -name "*backup*" ! -name "*corrupted*" -type f)

for file in $html_files; do
    add_error_boundary_to_file "$file"
done

echo ""
echo "✅ Error boundaries added to all HTML files!"
echo ""

echo "📋 Step 2: Creating Global CSS Files"
echo "===================================="
echo ""

# Create css directory if it doesn't exist
mkdir -p public/css

echo -n "  Creating global.css... "
if [ -f "public/css/global.css" ]; then
    echo -e "${YELLOW}Already exists${NC}"
else
    cat > public/css/global.css << 'EOF'
/* Global Styles for CollegeClimb AI Platform */
/* This file should be included in all pages */

/* CSS Variables */
:root {
    --primary-bg: #ffffff;
    --secondary-bg: #f8f9ff;
    --accent-bg: #2a357a;
    --text-primary: #333333;
    --text-secondary: #666666;
    --accent-color: #a07bcc;
    --gradient: linear-gradient(135deg, #2a357a 0%, #a07bcc 100%);
    --shadow: 0 8px 32px rgba(42, 53, 122, 0.12);
    --border-radius: 16px;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --info-color: #3b82f6;
}

[data-theme="dark"] {
    --primary-bg: #0d1117;
    --secondary-bg: #161b22;
    --accent-bg: #21262d;
    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --accent-color: #bb86fc;
    --gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: var(--primary-bg);
    transition: all 0.3s ease;
    overflow-x: hidden;
}

/* Utility Classes */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--gradient);
    color: white;
}

.btn-secondary {
    background: var(--secondary-bg);
    color: var(--text-primary);
    border: 1px solid rgba(160, 123, 204, 0.2);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-secondary);
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(160, 123, 204, 0.3);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Toast notifications */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 999998;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from { transform: translateX(120%); }
    to { transform: translateX(0); }
}

/* Responsive */
@media (max-width: 768px) {
    .btn {
        padding: 0.65rem 1.25rem;
        font-size: 0.85rem;
    }
    
    .toast {
        left: 20px;
        right: 20px;
        width: auto;
    }
}
EOF
    echo -e "${GREEN}✓ Created${NC}"
fi

echo ""
echo "✅ Global CSS files created!"
echo ""

echo "📋 Step 3: Updating package.json Scripts"
echo "========================================"
echo ""

# Add useful npm scripts
echo -n "  Adding npm scripts... "
if grep -q "test:watch" package.json; then
    echo -e "${YELLOW}Already configured${NC}"
else
    # Backup package.json
    cp package.json package.json.backup
    
    # Add scripts (this is simplified - manual edit recommended)
    echo -e "${YELLOW}Manual update recommended${NC}"
    echo ""
    echo "  Add these scripts to package.json:"
    echo "    \"test\": \"jest\","
    echo "    \"test:watch\": \"jest --watch\","
    echo "    \"test:coverage\": \"jest --coverage\","
    echo "    \"lint\": \"eslint public/js api\","
    echo "    \"format\": \"prettier --write 'public/**/*.{js,html,css}'\""
fi

echo ""

echo "📋 Step 4: Creating .env.example"
echo "================================"
echo ""

echo -n "  Creating .env.example... "
if [ -f ".env.example" ]; then
    echo -e "${YELLOW}Already exists${NC}"
else
    cat > .env.example << 'EOF'
# Environment Variables for CollegeClimb AI Platform
# Copy this file to .env.local and fill in your actual values

# Firebase Configuration (Client-side - Safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# OpenAI API Key (Server-side only - Keep secret!)
OPENAI_API_KEY=sk-your-openai-key-here

# Environment
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Sentry Error Tracking (optional)
SENTRY_DSN=your-sentry-dsn-here

# Analytics (optional)
GA_MEASUREMENT_ID=your-ga-id-here
EOF
    echo -e "${GREEN}✓ Created${NC}"
fi

echo ""
echo "=============================================="
echo "🎉 Quick Improvements Applied!"
echo "=============================================="
echo ""
echo "✅ Completed:"
echo "  - Added error boundaries to all HTML pages"
echo "  - Created global CSS file"
echo "  - Created .env.example"
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Update API endpoints with rate limiting:"
echo "   - Open each file in api/ folder"
echo "   - Add: const { applyRateLimit } = require('./rate-limiter');"
echo "   - Add rate limit check before processing"
echo ""
echo "2. Replace Firebase initialization in HTML files:"
echo "   - Search for: const firebaseConfig = {"
echo "   - Replace with centralized import"
echo ""
echo "3. Test your changes:"
echo "   npm run dev"
echo "   - Open browser and check console for errors"
echo "   - Test error boundary by causing an error"
echo "   - Verify all pages still work"
echo ""
echo "4. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'Add error boundaries and security improvements'"
echo ""
echo "📖 For detailed instructions, see IMPLEMENTATION_GUIDE.md"
echo ""
echo "🚀 Next steps:"
echo "   - Review COMPREHENSIVE_IMPROVEMENT_ANALYSIS.md"
echo "   - Follow IMPLEMENTATION_GUIDE.md step by step"
echo "   - Deploy incrementally and test each phase"
echo ""

# Create backup indicator
echo "💾 Backup files created with .backup extension"
echo "   You can restore if needed: mv file.backup file"
echo ""
