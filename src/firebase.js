// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ✅ Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnLHuQOdRElG5AanqrFdvERdgUINibwYc",
  authDomain: "self-help-35253.firebaseapp.com",
  projectId: "self-help-35253",
  storageBucket: "self-help-35253.firebasestorage.app",
  messagingSenderId: "933289897600",
  appId: "1:933289897600:web:3b6969da000fb0989e4065",
  measurementId: "G-EKZSWLWYDK"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 📊 Analytics (optional)
const analytics = getAnalytics(app);

// 🔐 Auth & Google Login
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 Firestore DB
const db = getFirestore(app);

// 🌟 Export so we can use in components
export { app, analytics, auth, provider, db };
