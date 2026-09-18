// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuShNf8D7Fs9knm7jVgXJWChMJwQBDEeg",
  authDomain: "web-udgam-2k26.firebaseapp.com",
  projectId: "web-udgam-2k26",
  storageBucket: "web-udgam-2k26.firebasestorage.app",
  messagingSenderId: "180840479093",
  appId: "1:180840479093:web:b99fd3900a136cc7583b3c",
  measurementId: "G-H8PKCBC87E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
