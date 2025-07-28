import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// firebase-config.js
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
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, db };

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
}