import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  !!firebaseConfig.authDomain && 
  !!firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your-firebase-api-key';

let app;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('Firebase credentials not found or set to default template. Running in DEV STUB mode.');
  }
}

export { auth, isFirebaseConfigured };
export default auth;
