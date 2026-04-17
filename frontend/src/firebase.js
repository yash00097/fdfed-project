// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-1a1ba.firebaseapp.com",
  projectId: "mern-estate-1a1ba",
  storageBucket: "mern-estate-1a1ba.firebasestorage.app",
  messagingSenderId: "158505809139",
  appId: "1:158505809139:web:29312d88b4ae0b83eef386"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);