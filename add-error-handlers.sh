#!/bin/bash
# Script to add error boundary and error handler scripts to all HTML files

echo "🔧 Adding Error Boundary and Error Handler to all HTML files..."

# List of HTML files to update (excluding backup and corrupted files)
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
FAIL_COUNT=0

for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if error-boundary.js is already included
    if grep -q "error-boundary.js" "$file"; then
      echo "⏭️  Skipping $file (already has error boundary)"
      continue
    fi
    
    # Check if file has a </head> tag
    if grep -q "</head>" "$file"; then
      # Add error boundary and error handler scripts before </head>
      sed -i '' '/<\/head>/i\
\    <!-- Error Handling System -->\
\    <script src="/js/error-boundary.js"></script>\
\    <script src="/js/error-handler.js"></script>
' "$file"
      
      echo "✅ Added error handlers to $file"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      echo "❌ Could not find </head> tag in $file"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    echo "⚠️  File not found: $file"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully updated: $SUCCESS_COUNT files"
echo "❌ Failed: $FAIL_COUNT files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
