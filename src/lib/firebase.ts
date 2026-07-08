// Client-side Firebase initialization.
// Config comes from PUBLIC_* env vars (safe to expose — Firebase web config is
// designed to ship in client code; real security is enforced by Firestore /
// Storage rules). Set these in `.env` locally and in the Netlify dashboard for
// production. See `.env.example`.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

/** True only when real config has been provided (not placeholders/empty). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !String(firebaseConfig.apiKey).startsWith("REPLACE_")
);

export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// `getAuth` throws synchronously on a missing/invalid apiKey, which would crash
// the whole admin bundle at import time and leave the "Checking access…" gate
// spinning forever. When config is absent (e.g. env vars not set in the build)
// we skip it — callers already gate on `isFirebaseConfigured` and show a clear
// message. `getFirestore`/`getStorage` don't validate the key, so they're safe.
export const auth: Auth = isFirebaseConfigured
  ? getAuth(app)
  : (undefined as unknown as Auth);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
