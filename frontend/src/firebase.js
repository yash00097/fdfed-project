// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fdfed-project-a65b6.firebaseapp.com",
  projectId: "fdfed-project-a65b6",
  storageBucket: "fdfed-project-a65b6.firebasestorage.app",
  messagingSenderId: "542160872421",
  appId: "1:542160872421:web:b560d62be166e35c5e450c",
  measurementId: "G-T4BKTHWLTR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);