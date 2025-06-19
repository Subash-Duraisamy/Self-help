import React, { useState, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import '../App.css';

function Timer({ user }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (!running) {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(0);
  };

  const addToProgress = async () => {
    const durationMinutes = Math.floor(seconds / 60);
    if (durationMinutes === 0) return alert('⏱️ Please focus for at least 1 minute.');

    const now = new Date();
    // const today = now.toISOString().split('T')[0];
    const today = now.toLocaleDateString('en-CA'); // ✅ local date in YYYY-MM-DD format

   const session = {
  start: new Date(now.getTime() - seconds * 1000).toLocaleTimeString(),  // 👈 this is the actual start
  end: now.toLocaleTimeString(),  // 👈 current time is the actual end
  duration: durationMinutes,
};


    const sessionRef = doc(db, 'users', user.uid, 'focusSessions', today);
    const snap = await getDoc(sessionRef);

    if (snap.exists()) {
      await updateDoc(sessionRef, {
        totalMinutes: (snap.data().totalMinutes || 0) + durationMinutes,
        sessions: arrayUnion(session)
      });
    } else {
      await setDoc(sessionRef, {
        totalMinutes: durationMinutes,
        sessions: [session]
      });
    }

    alert('✅ Focus session saved to progress chart!');
    resetTimer();
  };

  const formatTime = (totalSeconds) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="timer-card">
      <h3>⏱️ Focus Timer</h3>
      <div className="timer-display">{formatTime(seconds)}</div>
      <div className="timer-buttons">
        <button onClick={startTimer}>▶ Start</button>
        <button onClick={pauseTimer}>⏸ Pause</button>
        <button onClick={resetTimer}>🔄 Reset</button>
        <button onClick={addToProgress}>📊 Add to Progress</button>
      </div>
    </div>
  );
}

export default Timer;
