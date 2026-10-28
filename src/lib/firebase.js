/**
 * firebase.js
 * Modular Firebase Web SDK v10 setup for Firestore.
 * Operates with strict zero-auth.
 * Gracefully falls back to offline localStorage if Firebase credentials are missing or unconfigured.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

let app = null;
let db = null;

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization skipped, running in local-only mode.', err.message);
    db = null;
  }
}

/**
 * Fetch a plan document from Firestore by planId
 * @param {string} planId
 * @returns {Promise<object|null>}
 */
export async function fetchPlanFromFirestore(planId) {
  if (!db || !planId) return null;
  try {
    const planRef = doc(db, 'plans', planId);
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn(`Firestore read failed for plan ${planId}, falling back to local mirror.`, error.message);
    return null;
  }
}

/**
 * Save or update a plan document in Firestore
 * @param {string} planId
 * @param {object} planData
 * @returns {Promise<boolean>}
 */
export async function savePlanToFirestore(planId, planData) {
  if (!db || !planId || !planData) return false;
  try {
    const planRef = doc(db, 'plans', planId);
    await setDoc(planRef, {
      ...planData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Firestore write failed for plan ${planId}, plan remains saved in localStorage.`, error.message);
    return false;
  }
}

export { db, isConfigured };
