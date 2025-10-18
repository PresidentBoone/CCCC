// CONSOLIDATED Essay Storage API for College Climb
// Handles saving, retrieving, and managing essay versions
// Supports both Firebase (production) and in-memory (testing) modes
// CONSOLIDATES: essay-storage.js + essay-storage-firebase.js + essay-storage-simple.js

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Rate limiting helper
const rateLimitMap = new Map();
function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000) };
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return { allowed: true };
}

// Initialize Firebase (only if not already initialized)
let db = null;
let useFirebase = false;

try {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "collegeclimb-ai.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "collegeclimb-ai",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "collegeclimb-ai.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "187139654658",
    appId: process.env.FIREBASE_APP_ID || "1:187139654658:web:4a6cf4c43095f03212931b",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-E0B2RQM9XS"
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  useFirebase = true;
  console.log('✅ Essay Storage: Using Firebase mode');
} catch (error) {
  console.warn('⚠️ Essay Storage: Firebase init failed, using in-memory mode', error.message);
  useFirebase = false;
}

// In-memory storage for testing/fallback
let essayStorage = new Map();

// ============================================
// FIREBASE MODE HANDLERS
// ============================================

async function handleFirebaseRequest(req, res) {
  const { method } = req;
  const { userId, essayId, action } = req.query;
  const { essay, title, prompt, colleges, analysis } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  switch (method) {
    case 'POST':
      if (action === 'save') {
        const essayData = {
          title: title || `Essay ${new Date().toLocaleDateString()}`,
          content: essay,
          prompt: prompt || '',
          targetColleges: colleges || [],
          analysis: analysis || null,
          userId: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          wordCount: essay ? essay.split(/\s+/).length : 0,
          version: 1
        };

        let docId;
        if (essayId) {
          docId = essayId;
          await updateDoc(doc(db, 'essays', essayId), {
            ...essayData,
            updatedAt: serverTimestamp()
          });
        } else {
          docId = doc(collection(db, 'essays')).id;
          await setDoc(doc(db, 'essays', docId), essayData);
        }

        return res.status(200).json({ 
          success: true, 
          essayId: docId,
          message: essayId ? 'Essay updated successfully' : 'Essay saved successfully'
        });
      } else if (action === 'version') {
        if (!essayId) {
          return res.status(400).json({ error: 'Essay ID required for versioning' });
        }

        const currentEssayDoc = await getDoc(doc(db, 'essays', essayId));
        if (!currentEssayDoc.exists()) {
          return res.status(404).json({ error: 'Essay not found' });
        }

        const currentData = currentEssayDoc.data();
        const newVersion = (currentData.version || 1) + 1;

        const versionData = {
          title: title || currentData.title,
          content: essay,
          prompt: prompt || currentData.prompt,
          targetColleges: colleges || currentData.targetColleges,
          analysis: analysis || null,
          userId: userId,
          parentEssayId: essayId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          wordCount: essay ? essay.split(/\s+/).length : 0,
          version: newVersion
        };

        const versionId = doc(collection(db, 'essays')).id;
        await setDoc(doc(db, 'essays', versionId), versionData);

        return res.status(200).json({ 
          success: true, 
          versionId: versionId,
          version: newVersion,
          message: 'New version created successfully'
        });
      }
      break;

    case 'GET':
      if (action === 'list') {
        const essaysQuery = query(
          collection(db, 'essays'),
          where('userId', '==', userId)
        );

        const essaysSnapshot = await getDocs(essaysQuery);
        const essays = [];

        for (const docSnapshot of essaysSnapshot.docs) {
          const essayData = { id: docSnapshot.id, ...docSnapshot.data() };
          
          if (!essayData.parentEssayId) {
            const versionsQuery = query(
              collection(db, 'essays'),
              where('parentEssayId', '==', docSnapshot.id)
            );
            const versionsSnapshot = await getDocs(versionsQuery);
            essayData.versionCount = versionsSnapshot.size;
            essays.push(essayData);
          }
        }

        essays.sort((a, b) => {
          const aTime = a.updatedAt?.seconds || 0;
          const bTime = b.updatedAt?.seconds || 0;
          return bTime - aTime;
        });

        return res.status(200).json({ essays });
      } else if (action === 'versions' && essayId) {
        const versionsQuery = query(
          collection(db, 'essays'),
          where('parentEssayId', '==', essayId),
          orderBy('version', 'desc')
        );

        const versionsSnapshot = await getDocs(versionsQuery);
        const versions = versionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return res.status(200).json({ versions });
      } else if (essayId) {
        const essayDoc = await getDoc(doc(db, 'essays', essayId));
        
        if (!essayDoc.exists()) {
          return res.status(404).json({ error: 'Essay not found' });
        }

        const essayData = { id: essayDoc.id, ...essayDoc.data() };
        return res.status(200).json({ essay: essayData });
      }
      break;

    case 'DELETE':
      if (essayId) {
        await deleteDoc(doc(db, 'essays', essayId));

        const versionsQuery = query(
          collection(db, 'essays'),
          where('parentEssayId', '==', essayId)
        );
        const versionsSnapshot = await getDocs(versionsQuery);
        
        const deletePromises = versionsSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        return res.status(200).json({ 
          success: true, 
          message: 'Essay and all versions deleted successfully' 
        });
      }
      break;

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// ============================================
// IN-MEMORY MODE HANDLERS
// ============================================

async function handleInMemoryRequest(req, res) {
  const { method } = req;
  const { userId, essayId, action } = req.query;
  const { essay, title, prompt, colleges, analysis } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const userKey = `user_${userId}`;
  if (!essayStorage.has(userKey)) {
    essayStorage.set(userKey, new Map());
  }
  const userEssays = essayStorage.get(userKey);

  switch (method) {
    case 'POST':
      if (action === 'save') {
        const essayData = {
          title: title || `Essay ${new Date().toLocaleDateString()}`,
          content: essay,
          prompt: prompt || '',
          targetColleges: colleges || [],
          analysis: analysis || null,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: essay ? essay.split(/\s+/).length : 0,
          version: 1
        };

        let docId;
        if (essayId && userEssays.has(essayId)) {
          docId = essayId;
          const existingEssay = userEssays.get(essayId);
          essayData.createdAt = existingEssay.createdAt;
          userEssays.set(essayId, essayData);
        } else {
          docId = `essay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          userEssays.set(docId, essayData);
        }

        return res.status(200).json({ 
          success: true, 
          essayId: docId,
          message: essayId ? 'Essay updated successfully' : 'Essay saved successfully'
        });
      } else if (action === 'version') {
        if (!essayId || !userEssays.has(essayId)) {
          return res.status(400).json({ error: 'Essay ID required for versioning' });
        }

        const originalEssay = userEssays.get(essayId);
        const versionData = {
          title: title || originalEssay.title,
          content: essay,
          prompt: prompt || originalEssay.prompt,
          targetColleges: colleges || originalEssay.targetColleges,
          analysis: analysis || null,
          userId: userId,
          parentEssayId: essayId,
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: essay ? essay.split(/\s+/).length : 0,
          version: (originalEssay.version || 1) + 1
        };

        const versionId = `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        userEssays.set(versionId, versionData);

        return res.status(200).json({ 
          success: true, 
          versionId: versionId,
          version: versionData.version,
          message: 'New version created successfully'
        });
      }
      break;

    case 'GET':
      if (action === 'list') {
        const essays = Array.from(userEssays.entries())
          .map(([id, data]) => ({ id, ...data }))
          .filter(essay => !essay.parentEssayId)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        essays.forEach(essay => {
          const versions = Array.from(userEssays.values())
            .filter(e => e.parentEssayId === essay.id);
          essay.versionCount = versions.length;
        });

        return res.status(200).json({ essays });
      } else if (action === 'versions' && essayId) {
        const versions = Array.from(userEssays.entries())
          .map(([id, data]) => ({ id, ...data }))
          .filter(essay => essay.parentEssayId === essayId)
          .sort((a, b) => b.version - a.version);

        return res.status(200).json({ versions });
      } else if (essayId) {
        if (!userEssays.has(essayId)) {
          return res.status(404).json({ error: 'Essay not found' });
        }

        const essayData = { id: essayId, ...userEssays.get(essayId) };
        return res.status(200).json({ essay: essayData });
      }
      break;

    case 'DELETE':
      if (essayId) {
        if (!userEssays.has(essayId)) {
          return res.status(404).json({ error: 'Essay not found' });
        }

        userEssays.delete(essayId);

        const versionsToDelete = Array.from(userEssays.entries())
          .filter(([id, data]) => data.parentEssayId === essayId)
          .map(([id]) => id);

        versionsToDelete.forEach(id => userEssays.delete(id));

        return res.status(200).json({ 
          success: true, 
          message: 'Essay and all versions deleted successfully' 
        });
      }
      break;

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// ============================================
// MAIN HANDLER (Routes to appropriate mode)
// ============================================

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const identifier = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(identifier, 100, 60000);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: rateCheck.retryAfter 
    });
  }

  try {
    // Route to appropriate handler based on mode
    if (useFirebase && db) {
      return await handleFirebaseRequest(req, res);
    } else {
      return await handleInMemoryRequest(req, res);
    }
  } catch (error) {
    console.error('Error in essay storage API:', error);
    return res.status(500).json({ 
      error: 'Failed to process essay storage request',
      details: error.message
    });
  }
}

