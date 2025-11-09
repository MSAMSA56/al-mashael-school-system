import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKey',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'al-mashael-school.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'al-mashael-school',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'al-mashael-school.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Enable emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (e) {
    // Emulator already connected
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    // Emulator already connected
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (e) {
    // Emulator already connected
  }
}

export default app;
