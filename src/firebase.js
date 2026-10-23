import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_f7QQJS-KMCPpmeBj_50wT3vxGdy1mdk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "velemeny-9a847.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "velemeny-9a847",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "velemeny-9a847.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "265890856209",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:265890856209:web:56340e10de8415973ea0b0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "nadorig@gmail.com";
