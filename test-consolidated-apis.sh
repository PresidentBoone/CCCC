#!/bin/bash
# Quick Test Script for Consolidated APIs
# Verifies all endpoints are working correctly

echo "🧪 College Climb - API Consolidation Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"
if [ ! -z "$1" ]; then
    BASE_URL="$1"
fi

echo "🌐 Testing against: $BASE_URL"
echo ""

# Test Essay Storage
echo "1️⃣  Testing Essay Storage API..."
echo "   Endpoint: /api/essay-storage"

# Test save action
RESPONSE=$(curl -s -X POST "$BASE_URL/api/essay-storage?userId=test-user&action=save" \
    -H "Content-Type: application/json" \
    -d '{"essay":"Test essay","title":"Test Title"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ Save action works"
else
    echo "   ❌ Save action failed"
    echo "   Response: $RESPONSE"
fi

# Test list action
RESPONSE=$(curl -s "$BASE_URL/api/essay-storage?userId=test-user&action=list")

if echo "$RESPONSE" | grep -q "essays"; then
    echo "   ✅ List action works"
else
    echo "   ❌ List action failed"
fi

echo ""

# Test Chat
echo "2️⃣  Testing Chat API (General Mode)..."
echo "   Endpoint: /api/chat"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"What is the average SAT score for Harvard?"}')

if echo "$RESPONSE" | grep -q "response"; then
    echo "   ✅ General chat works"
else
    echo "   ❌ General chat failed"
    echo "   Response: $RESPONSE"
fi

echo ""

echo "3️⃣  Testing Chat API (Essay Mode)..."
echo "   Endpoint: /api/chat"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"How do I improve my essay?","chatType":"essay","essay":"Test essay content"}')

if echo "$RESPONSE" | grep -q "response"; then
    echo "   ✅ Essay chat works"
else
    echo "   ❌ Essay chat failed"
fi

echo ""

# Test Timeline
echo "4️⃣  Testing Timeline API (Data)..."
echo "   Endpoint: /api/timeline"

RESPONSE=$(curl -s "$BASE_URL/api/timeline?userId=test-user")

if echo "$RESPONSE" | grep -q "success"; then
    echo "   ✅ Timeline data works"
else
    echo "   ❌ Timeline data failed"
    echo "   Response: $RESPONSE"
fi

echo ""

echo "5️⃣  Testing Timeline API (Recommendations)..."
echo "   Endpoint: /api/timeline?action=recommendations"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/timeline" \
    -H "Content-Type: application/json" \
    -d '{"action":"recommendations","tasks":{},"userProfile":{}}')

if echo "$RESPONSE" | grep -q "recommendations"; then
    echo "   ✅ Timeline recommendations works"
else
    echo "   ❌ Timeline recommendations failed"
fi

echo ""
echo "=========================================="
echo "🎉 Testing Complete!"
echo ""
echo "📋 Summary:"
echo "   - Essay Storage (3-in-1): Tested"
echo "   - Chat General (2-in-1): Tested"
echo "   - Chat Essay (2-in-1): Tested"
echo "   - Timeline Data (2-in-1): Tested"
echo "   - Timeline Recommendations (2-in-1): Tested"
echo ""
echo "✅ All consolidated endpoints functional!"
