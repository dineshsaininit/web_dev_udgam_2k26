const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Resolve an absolute path so require() always finds the key file correctly
// regardless of where Node is started from.
const serviceAccountPath = path.resolve(
  __dirname,
  '..',
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
);

let db = null;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore(app);
    console.log("Firebase Admin Initialized Successfully!");
  } catch (err) {
    console.error("Firebase initialization error:", err.message);
  }
} else {
  console.warn(`WARNING: Firebase serviceAccountKey.json not found at: ${serviceAccountPath}. Firebase writes will be skipped.`);
}

module.exports = { db };
