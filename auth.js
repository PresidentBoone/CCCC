// auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Save login status to localStorage or sessionStorage
    sessionStorage.setItem('user', JSON.stringify(user));
    console.log("Logged in as", user.email);
  } else {
    // Remove user data
    sessionStorage.removeItem('user');
    console.log("User is signed out");
  }
});
