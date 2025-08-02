import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();
const auth = getAuth();

const rateLimitMap = new Map();

function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

export default async function handler(req, res) {
  console.log('=== CHAT API CALLED ===');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found');
    return res.status(500).json({
      error: 'Server configuration error - API key missing'
    });
  }

  try {
    const { message, userId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user data and chat history from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const chatHistoryCollection = await db.collection('users').doc(userId).collection('chats').orderBy('timestamp').get();
    const chatHistory = chatHistoryCollection.docs.map(doc => doc.data());

    const sanitizedMessage = message.trim().substring(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let systemPrompt = `You are a college admissions counselor for College Climb. Your role is to provide personalized, encouraging, and insightful guidance to students. You have access to the student's profile and questionnaire answers, which you must use to tailor your advice. When a student asks what you know about them, you must confidently state that you have access to their profile and questionnaire information and offer to summarize it for them.`;

    if (userData.name) {
      systemPrompt += ` The student's name is ${userData.name}.`;
    }

    if (userData.questionnaire) {
      systemPrompt += ` Here is some information about the student from their questionnaire: ${JSON.stringify(userData.questionnaire)}. Use this information to personalize your advice and guidance.`;
    }

    // Add chat history to the prompt
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(chat => ({ role: chat.role, content: chat.content })),
      { role: 'user', content: sanitizedMessage }
    ];

    console.log('Making request to Gemini...');

    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }))
      })
    });

    console.log('Gemini response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return res.status(500).json({
        error: 'External service temporarily unavailable.',
        details: `Gemini API error: ${geminiResponse.status}`
      });
    }

    const data = await geminiResponse.json();
    const botResponse = data.candidates[0].content.parts[0].text;

    // Save the user's message and the bot's response to Firestore
    const userMessageRef = db.collection('users').doc(userId).collection('chats').doc();
    await userMessageRef.set({
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date()
    });

    const botMessageRef = db.collection('users').doc(userId).collection('chats').doc();
    await botMessageRef.set({
      role: 'model',
      content: botResponse,
      timestamp: new Date()
    });

    res.status(200).json({
      response: botResponse
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({
      error: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
      details: error.message
    });
  }
}