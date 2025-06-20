// src/components/Login.js
import React, { useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function Login({ setUser }) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // ✅ Save user to Firestore and update state
  const processUser = async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          joinedAt: new Date(),
        });
      }

      setUser({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error("Failed to process user:", error);
    }
  };

  // ✅ Start login
  const handleGoogleLogin = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        await processUser(result.user);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Failed to log in. Please try again.");
    }
  };

  // ✅ Handle redirect result (for mobile)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          processUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect Login Error:", error);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Welcome to Self-Help Tracker</h2>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
