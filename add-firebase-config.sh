#!/bin/bash
echo "🔧 Adding centralized Firebase configuration to HTML files..."

HTML_FILES=(
  "public/about.html"
  "public/dashboard.html"
  "public/discovery.html"
  "public/document.html"
  "public/essaycoach.html"
  "public/login.html"
  "public/navbar.html"
  "public/pricing.html"
  "public/questions.html"
  "public/scholarship.html"
  "public/signup.html"
  "public/testprep-enhanced.html"
  "public/testprep-practice.html"
  "public/testprep.html"
)

SUCCESS_COUNT=0

for file in "${HTML_FILES[@]}"; do
  if [ -f "$file" ]; then
    if grep -q "firebase-config.js" "$file"; then
      echo "⏭️  Skipping $file (already has firebase-config)"
      continue
    fi
    
    # Add firebase-config.js after Firebase SDK imports but before other scripts
    if grep -q "firebase-app.js" "$file"; then
      # Add after firebase SDK
      perl -i -pe 's|(.*firebase-auth\.js.*\n)|$1    <script src="/js/firebase-config.js"></script>\n|' "$file"
      echo "✅ Added firebase-config to $file"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif grep -q "</head>" "$file"; then
      # Add before </head> if no firebase SDK found
      perl -i -pe 's|</head>|    <script src="/js/firebase-config.js"></script>\n</head>|' "$file"
      echo "✅ Added firebase-config to $file"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully updated: $SUCCESS_COUNT files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
