import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaTFFLs_9THrDCLfDLrbpESFTsDXVYvzw",
  authDomain: "donaciones-sinaloa.firebaseapp.com",
  projectId: "donaciones-sinaloa",
  storageBucket: "donaciones-sinaloa.firebasestorage.app",
  messagingSenderId: "768902913223",
  appId: "1:768902913223:web:64c1c99c68510949abf2e2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);