#!/bin/bash
# Script to add error boundary and error handler scripts to all HTML files

echo "🔧 Adding Error Boundary and Error Handler to all HTML files..."

# List of HTML files to update
HTML_FILES=(
  "public/index.html"
  "public/about.html"
  "public/signup.html"
  "public/login.html"
  "public/dashboard.html"
  "public/discovery.html"
  "public/essaycoach.html"
  "public/testprep.html"
  "public/testprep-enhanced.html"
  "public/testprep-practice.html"
  "public/adaptive-timeline.html"
  "public/scholarship.html"
  "public/pricing.html"
  "public/document.html"
  "public/questions.html"
)

SUCCESS_COUNT=0

for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if error-boundary.js is already included
    if grep -q "error-boundary.js" "$file"; then
      echo "⏭️  Skipping $file (already has error boundary)"
      continue
    fi
    
    # Add error handlers before </head> tag
    if grep -q "</head>" "$file"; then
      perl -i -pe 's|</head>|    <!-- Error Handling System -->\n    <script src="/js/error-boundary.js"></script>\n    <script src="/js/error-handler.js"></script>\n</head>|' "$file"
      echo "✅ Added error handlers to $file"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully updated: $SUCCESS_COUNT files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
