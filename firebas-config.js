
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