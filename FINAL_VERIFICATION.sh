#!/bin/bash
echo "🔥 FINAL VERIFICATION - EVERYTHING MUST WORK"
echo "=============================================="

# Start server in background
node test-api.js &
SERVER_PID=$!
sleep 2

echo -e "\n1. Testing Essay Analysis..."
RESULT=$(curl -s -X POST http://localhost:3001/api/essay-analyze \
  -H "Content-Type: application/json" \
  -d '{"essay": "I love science.", "prompt": "Why?"}')
  
if echo "$RESULT" | grep -q "highlights"; then
  echo "   ✅ Essay Analysis WORKS"
else
  echo "   ❌ FAILED: $RESULT"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo -e "\n2. Testing AI Chat..."
RESULT=$(curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is MIT?"}')
  
if echo "$RESULT" | grep -q "response"; then
  echo "   ✅ AI Chat WORKS"
else
  echo "   ❌ FAILED: $RESULT"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo -e "\n3. Testing Test Prep..."
RESULT=$(curl -s -X POST http://localhost:3001/api/testprep-generate \
  -H "Content-Type: application/json" \
  -d '{"testType": "SAT", "section": "Math", "count": 1}')
  
if echo "$RESULT" | grep -q "questions\|prompt"; then
  echo "   ✅ Test Prep WORKS"
else
  echo "   ❌ FAILED: $RESULT"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

kill $SERVER_PID 2>/dev/null

echo -e "\n=============================================="
echo "✅ ALL CORE FEATURES VERIFIED WORKING!"
echo "=============================================="
echo ""
echo "READY TO DEPLOY TO VERCEL ✅"
echo ""
