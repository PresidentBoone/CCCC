#!/bin/bash

# Production Cleanup Script
# Removes backup, test, and development files before deployment

echo "🧹 Starting Production Cleanup..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Count files before cleanup
BEFORE=$(find public -type f | wc -l | xargs)
echo "📊 Files before cleanup: $BEFORE"
echo ""

# Backup files to remove (optional - comment out to keep)
echo "🗑️  Removing backup files..."
rm -f public/dashboard-corrupted.html
rm -f public/dashbackup.html
rm -f public/essaycoach-backup.html
echo "   ✅ Backup files removed"
echo ""

# Remove any .DS_Store files (macOS)
echo "🗑️  Removing macOS system files..."
find . -name ".DS_Store" -delete
echo "   ✅ System files cleaned"
echo ""

# Remove any temporary files
echo "🗑️  Removing temporary files..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name "*~" -delete
echo "   ✅ Temporary files removed"
echo ""

# Count files after cleanup
AFTER=$(find public -type f | wc -l | xargs)
REMOVED=$((BEFORE - AFTER))

echo ""
echo "📊 Cleanup Summary:"
echo "   Files before: $BEFORE"
echo "   Files after: $AFTER"
echo "   Files removed: $REMOVED"
echo ""

# Verify critical files exist
echo "✅ Verifying critical files..."
CRITICAL_FILES=(
    "public/index.html"
    "public/dashboard.html"
    "public/essaycoach.html"
    "public/adaptive-timeline.html"
    "public/testprep-enhanced.html"
    "public/discovery.html"
    "public/scholarship.html"
    "api/essay-chat.js"
    "api/essay-analyze.js"
    "api/timeline-data.js"
    "vercel.json"
)

ALL_EXIST=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - MISSING!"
        ALL_EXIST=false
    fi
done

echo ""

if [ "$ALL_EXIST" = true ]; then
    echo "🎉 Production cleanup complete! Ready to deploy."
    echo ""
    echo "🚀 Deploy with:"
    echo "   vercel --prod"
    echo ""
else
    echo "⚠️  Warning: Some critical files are missing!"
    echo "   Please verify before deploying."
    echo ""
fi
