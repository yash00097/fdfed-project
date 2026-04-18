// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "prime-wheels-c3089.firebaseapp.com",
  projectId: "prime-wheels-c3089",
  storageBucket: "prime-wheels-c3089.firebasestorage.app",
  messagingSenderId: "89979254153",
  appId: "1:89979254153:web:c4d870a8d9019116721d58",
  measurementId: "G-NY2MRHMHW7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);