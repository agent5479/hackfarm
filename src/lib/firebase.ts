import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Database;
};

function readConfig() {
  const disabled = (import.meta.env.VITE_CMS_DISABLED || '').trim().toLowerCase();
  if (disabled === '1' || disabled === 'true' || disabled === 'yes') {
    return null;
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  if (!apiKey || !authDomain || !projectId || !appId || !databaseURL) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || undefined,
    messagingSenderId: messagingSenderId || undefined,
    appId,
    databaseURL,
  };
}

let services: FirebaseServices | null | undefined;

/** Returns Firebase services, or null when env config is missing. */
export function getFirebase(): FirebaseServices | null {
  if (services !== undefined) return services;

  const config = readConfig();
  if (!config) {
    services = null;
    return services;
  }

  const app = initializeApp(config);
  services = {
    app,
    auth: getAuth(app),
    db: getDatabase(app),
  };
  return services;
}

export function isFirebaseConfigured(): boolean {
  return getFirebase() !== null;
}

/** Realtime Database paths for CMS copy. */
export const HOME_CONTENT_PATH = 'content/home';
export const RIDES_CONTENT_PATH = 'content/rides';
