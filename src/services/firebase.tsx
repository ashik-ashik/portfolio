// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_AUTH_KEYS_APIKEY,
  authDomain: import.meta.env.VITE_AUTH_KEYS_AUTHDOMAIN,
  projectId: import.meta.env.VITE_AUTH_KEYS_PROJECTID,
  storageBucket: import.meta.env.VITE_AUTH_KEYS_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_AUTH_KEYS_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_AUTH_KEYS_APPID,
  measurementId: import.meta.env.VITE_AUTH_KEYS_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();