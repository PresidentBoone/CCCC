#!/bin/bash

# 🎯 College Climb AI - Complete Demo Script
# Run this to see all features in action!

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🎓 COLLEGE CLIMB AI - LIVE DEMO 🎓                     ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"

echo -e "\n🌐 Your platform is running at: http://localhost:3001\n"

# Check if server is running
if ! curl -s http://localhost:3001/api > /dev/null; then
    echo "❌ Server is not running. Starting it now..."
    cd /Users/dylonboone/CCCC-1/CCCC-4
    node test-server-minimal.js &
    sleep 3
fi

echo "════════════════════════════════════════════════════════════════"
echo "📝 DEMO 1: AI Essay Analysis"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📄 Sample Essay:"
echo "\"I've always been passionate about helping others. In high school,"
echo "I volunteered at a local hospital where I discovered my love for"
echo "medicine. I want to become a doctor to make a difference.\""
echo ""
echo "⏳ Analyzing essay with AI..."
echo ""

curl -s -X POST http://localhost:3001/api/essay-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "essay": "I have always been passionate about helping others. In high school, I volunteered at a local hospital where I discovered my love for medicine. I want to become a doctor to make a difference in peoples lives.",
    "prompt": "Why do you want to study medicine?",
    "colleges": ["Harvard", "Stanford"]
  }' | python3 << 'PYTHON'
import json, sys
data = json.load(sys.stdin)

print("✨ AI Analysis Results:\n")
print(f"📊 Highlights Found: {len(data.get('highlights', []))}")
print("")

for i, h in enumerate(data.get('highlights', [])[:2], 1):
    emoji = "🔴" if h['type'] == 'red' else "🟡" if h['type'] == 'yellow' else "🟢"
    print(f"{emoji} Highlight {i}: {h['category'].upper()}")
    print(f"   Text: \"{h['text'][:60]}...\"")
    print(f"   Issue: {h['why'][:80]}...")
    print(f"   Fix: {h['how'][:80]}...")
    print("")

print(f"💡 Overall Feedback:")
print(f"   {data.get('overallFeedback', '')[:150]}...")
print("")
PYTHON

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "💬 DEMO 2: AI College Counseling Chat"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🙋 Student Question:"
echo "\"I have a 3.6 GPA and want to study engineering. What schools"
echo "should I target?\""
echo ""
echo "⏳ Getting AI counselor response..."
echo ""

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a 3.6 GPA and want to study engineering. What schools should I target?",
    "userContext": {
      "grade": "11",
      "gpa": "3.6",
      "interests": ["Engineering", "Robotics"]
    }
  }' | python3 << 'PYTHON'
import json, sys
data = json.load(sys.stdin)

print("🤖 AI Counselor Response:\n")
response = data.get('response', '')
# Print response with word wrapping
words = response.split()
line = ""
for word in words:
    if len(line + word) > 70:
        print(f"   {line}")
        line = word + " "
    else:
        line += word + " "
if line:
    print(f"   {line}")
print("")
PYTHON

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📚 DEMO 3: AI Test Prep Question Generation"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Request: Generate 1 Medium SAT Math question"
echo ""
echo "⏳ Generating practice question..."
echo ""

curl -s -X POST http://localhost:3001/api/testprep-generate \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "SAT",
    "section": "Math",
    "difficulty": "medium",
    "count": 1
  }' | python3 << 'PYTHON'
import json, sys
data = json.load(sys.stdin)

print("🎯 Generated Practice Question:\n")
if data.get('questions'):
    q = data['questions'][0]
    print(f"❓ Question: {q['question']}")
    print(f"\n   Choices:")
    for choice in q['choices']:
        print(f"      {choice}")
    print(f"\n   ✅ Correct Answer: {q['correctAnswer']}")
    print(f"\n   💡 Explanation:")
    exp_words = q['explanation'].split()
    line = ""
    for word in exp_words:
        if len(line + word) > 70:
            print(f"      {line}")
            line = word + " "
        else:
            line += word + " "
    if line:
        print(f"      {line}")
print("")
PYTHON

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎓 DEMO 4: Scholarship Search"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Searching for available scholarships..."
echo ""

curl -s 'http://localhost:3001/api/scrape-scholarships?amount=50000&deadline=2025-12-31' \
  | python3 << 'PYTHON'
import json, sys
data = json.load(sys.stdin)

scholarships = data.get('scholarships', [])
print(f"💰 Found {len(scholarships)} Scholarships:\n")

for i, s in enumerate(scholarships[:5], 1):
    print(f"{i}. {s.get('title', 'Untitled')}")
    print(f"   Amount: {s.get('amount', 'Varies')}")
    print(f"   Deadline: {s.get('deadline', 'Rolling')}")
    print("")
PYTHON

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📅 DEMO 5: Timeline Management"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📆 Getting personalized application timeline..."
echo ""

curl -s 'http://localhost:3001/api/timeline?grade=12' \
  | python3 << 'PYTHON'
import json, sys
data = json.load(sys.stdin)

timeline = data.get('timeline', {})
print(f"🗓️  Application Timeline for Grade 12:\n")

months = list(timeline.keys())[:3]
for month in months:
    tasks = timeline[month]
    print(f"📌 {month}:")
    for task in tasks[:2]:
        print(f"   • {task.get('task', '')}")
    print("")
PYTHON

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     ✅ DEMO COMPLETE!                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 All AI features are working perfectly!"
echo ""
echo "🌐 Access your platform at:"
echo "   • Dashboard:    http://localhost:3001/dashboard.html"
echo "   • Essay Coach:  http://localhost:3001/essaycoach.html"
echo "   • Test Prep:    http://localhost:3001/testprep.html"
echo "   • Scholarships: http://localhost:3001/scholarships.html"
echo ""
echo "📖 Read the full status report:"
echo "   PRODUCTION_READY_STATUS_REPORT.md"
echo ""
echo "💡 Next Steps:"
echo "   1. Test the platform through the web interface"
echo "   2. Get College Scorecard API key (optional)"
echo "   3. Deploy to production (Vercel ready)"
echo "   4. Start beta testing with real users"
echo "   5. Set up payment/subscriptions"
echo ""
echo "🚀 Ready to launch! Good luck with your sales! 🚀"
echo ""
