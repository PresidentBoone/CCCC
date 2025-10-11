// Essay Storage API for College Climb
// Handles saving, retrieving, and managing essay versions

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
  authDomain: "collegeclimb-ai.firebaseapp.com",
  projectId: "collegeclimb-ai",
  storageBucket: "collegeclimb-ai.firebasestorage.app",
  messagingSenderId: "187139654658",
  appId: "1:187139654658:web:4a6cf4c43095f03212931b",
  measurementId: "G-E0B2RQM9XS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { userId, essayId, action } = req.query;
    const { essay, title, prompt, colleges, analysis } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    switch (method) {
      case 'POST':
        // Save new essay or create new version
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
            // Update existing essay
            docId = essayId;
            await updateDoc(doc(db, 'essays', essayId), {
              ...essayData,
              updatedAt: serverTimestamp()
            });
          } else {
            // Create new essay
            docId = doc(collection(db, 'essays')).id;
            await setDoc(doc(db, 'essays', docId), essayData);
          }

          res.status(200).json({ 
            success: true, 
            essayId: docId,
            message: essayId ? 'Essay updated successfully' : 'Essay saved successfully'
          });
        } else if (action === 'version') {
          // Create a new version of existing essay
          if (!essayId) {
            return res.status(400).json({ error: 'Essay ID required for versioning' });
          }

          // Get current essay to determine next version number
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

          res.status(200).json({ 
            success: true, 
            versionId: versionId,
            version: newVersion,
            message: 'New version created successfully'
          });
        }
        break;

      case 'GET':
        if (action === 'list') {
          // Get all essays for user (main essays only, not versions)
          const essaysQuery = query(
            collection(db, 'essays'),
            where('userId', '==', userId)
          );

          const essaysSnapshot = await getDocs(essaysQuery);
          const essays = [];

          for (const docSnapshot of essaysSnapshot.docs) {
            const essayData = { id: docSnapshot.id, ...docSnapshot.data() };
            
            // Only include essays that don't have a parentEssayId (main essays)
            if (!essayData.parentEssayId) {
              // Get version count for each essay
              const versionsQuery = query(
                collection(db, 'essays'),
                where('parentEssayId', '==', docSnapshot.id)
              );
              const versionsSnapshot = await getDocs(versionsQuery);
              essayData.versionCount = versionsSnapshot.size;

              essays.push(essayData);
            }
          }

          // Sort by updatedAt manually
          essays.sort((a, b) => {
            const aTime = a.updatedAt?.seconds || 0;
            const bTime = b.updatedAt?.seconds || 0;
            return bTime - aTime;
          });

          res.status(200).json({ essays });
        } else if (action === 'versions' && essayId) {
          // Get all versions of a specific essay
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

          res.status(200).json({ versions });
        } else if (essayId) {
          // Get specific essay
          const essayDoc = await getDoc(doc(db, 'essays', essayId));
          
          if (!essayDoc.exists()) {
            return res.status(404).json({ error: 'Essay not found' });
          }

          const essayData = { id: essayDoc.id, ...essayDoc.data() };
          res.status(200).json({ essay: essayData });
        }
        break;

      case 'DELETE':
        if (essayId) {
          // Delete essay and all its versions
          await deleteDoc(doc(db, 'essays', essayId));

          // Delete all versions
          const versionsQuery = query(
            collection(db, 'essays'),
            where('parentEssayId', '==', essayId)
          );
          const versionsSnapshot = await getDocs(versionsQuery);
          
          const deletePromises = versionsSnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);

          res.status(200).json({ 
            success: true, 
            message: 'Essay and all versions deleted successfully' 
          });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error in essay storage API:', error);
    res.status(500).json({ 
      error: 'Failed to process essay storage request',
      details: error.message
    });
  }
}
