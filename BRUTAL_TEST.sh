#!/bin/bash
echo "💀 BRUTAL HONESTY TEST - NO BULLSHIT"
echo "========================================"

# Check if .env exists with OpenAI key
if [ -f .env ] && grep -q "sk-proj-" .env; then
    echo "✅ OpenAI API key exists"
else
    echo "❌ FATAL: No OpenAI API key"
    exit 1
fi

# Check if package.json is correct
if grep -q '"type": "module"' package.json; then
    echo "❌ FATAL: package.json has type:module (breaks Vercel)"
    exit 1
else
    echo "✅ package.json is CommonJS"
fi

# Check if handlers export correctly
for handler in api/handlers/chat.js api/handlers/essay-analyze.js api/handlers/testprep-generate.js; do
    if grep -q "module.exports" "$handler"; then
        echo "✅ $handler exports correctly"
    else
        echo "❌ FATAL: $handler missing module.exports"
        exit 1
    fi
done

# Check if vercel.json exists
if [ -f vercel.json ]; then
    echo "✅ vercel.json exists"
else
    echo "❌ WARNING: No vercel.json"
fi

# Check if dashboard loads
if [ -f public/dashboard.html ] || [ -f dashboard.html ]; then
    echo "✅ Dashboard HTML exists"
else
    echo "❌ FATAL: No dashboard.html"
    exit 1
fi

# Check if essay coach loads
if [ -f public/essaycoach.html ] || [ -f essaycoach.html ]; then
    echo "✅ Essay coach HTML exists"
else
    echo "❌ FATAL: No essaycoach.html"
    exit 1
fi

echo ""
echo "========================================"
echo "STRUCTURE CHECK COMPLETE"
echo "========================================"
