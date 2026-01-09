/**
 * Configurazione Firebase per RecapShow Admin
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCQEOkJlQCzGwrtbhuV397gedlxhBLNoe8",
  authDomain: "recap-show.firebaseapp.com",
  projectId: "recap-show",
  storageBucket: "recap-show.firebasestorage.app",
  messagingSenderId: "14765834202",
  appId: "1:14765834202:web:b51dec30d901266a2acae3",
  measurementId: "G-TCJFMMCY5J"
};

// Inizializza Firebase solo se non è già inizializzato
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Inizializza Analytics solo in produzione
  if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
}

// Esporta le istanze
export { app, auth, db, storage, analytics };

/**
 * Helper per verificare se Firebase è configurato
 */
export const isFirebaseConfigured = (): boolean => {
  return !!firebaseConfig.apiKey && typeof window !== 'undefined';
};

/**
 * Helper per ottenere l'utente corrente
 */
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

