import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqL5ZoTKp36sk8J5TxuHn_y6ji4i9h20s",
  authDomain: "collegeclimb-ai.firebaseapp.com",
  projectId: "collegeclimb-ai",
  storageBucket: "collegeclimb-ai.firebasestorage.app",
  messagingSenderId: "187139654658",
  appId: "1:187139654658:web:4a6cf4c43095f03212931b",
  measurementId: "G-E0B2RQM9XS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export the services
export { auth, db, analytics };

// API handler for Vercel
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment-based config (if you want to use env variables)
  res.status(200).json({
    apiKey: process.env.FIREBASE_API_KEY || firebaseConfig.apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || firebaseConfig.appId,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId
  });
}