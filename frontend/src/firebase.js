import { initializeApp, getApps } from "firebase/app";

// Warn about missing env vars but don't crash
const missingEnv = !import.meta.env.VITE_FIREBASE_API_KEY;
if (missingEnv) {
  console.warn(
    "⚠️  Firebase env vars are missing. Create a .env file from .env.example and restart the dev server."
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "MISSING_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Lazy auth/db exports — only these will throw if creds are bad, and only on use
let _auth = null;
let _db = null;

export const getFirebaseAuth = () => {
  if (!_auth) {
    const { getAuth } = require("firebase/auth");
    _auth = getAuth(app);
  }
  return _auth;
};

export const getFirebaseDb = () => {
  if (!_db) {
    const { getFirestore } = require("firebase/firestore");
    _db = getFirestore(app);
  }
  return _db;
};

// Standard exports for backward compatibility
// These will only throw at call time, not during module init
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let authInstance;
let dbInstance;

try {
  authInstance = getAuth(app);
} catch (e) {
  console.error("Firebase Auth init failed:", e.message);
  authInstance = null;
}

try {
  dbInstance = getFirestore(app);
} catch (e) {
  console.error("Firebase Firestore init failed:", e.message);
  dbInstance = null;
}

export const isOfflineMode = missingEnv;
export const auth = authInstance;
export const db = dbInstance;
export { app };