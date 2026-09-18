const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
require('dotenv').config();

// For production, you can set the FIREBASE_SERVICE_ACCOUNT_PATH in .env
// We will only initialize if the service account file exists to avoid crashing in dev without it.

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

let db = null;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('.' + serviceAccountPath);
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore(app);
  console.log("Firebase Admin Initialized Successfully!");
} else {
  console.warn("WARNING: Firebase serviceAccountKey.json not found. Firebase features will be disabled.");
}

module.exports = { db };
