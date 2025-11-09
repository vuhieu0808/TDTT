// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSuVXTMLVoDd3Wr9l875tLdYbQbjQEt44",
  authDomain: "tdtt-c020c.firebaseapp.com",
  projectId: "tdtt-c020c",
  storageBucket: "tdtt-c020c.firebasestorage.app",
  messagingSenderId: "238363014769",
  appId: "1:238363014769:web:08470e14f51cf13c2b0dd0",
  measurementId: "G-YRS66WTF8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, analytics, auth, provider };