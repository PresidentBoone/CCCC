#!/bin/bash

# Simple development server script
# Serves the public folder on port 3000

echo "🚀 Starting College Climb Development Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 HTTP server"
    echo "📂 Serving: /public"
    echo "🌐 URL: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cd public && python3 -m http.server 3000
else
    echo "❌ Python 3 not found"
    echo "Please install Python 3 or use: npx http-server public -p 3000"
fi
