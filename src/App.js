import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TaskPlanner from './components/TaskPlanner';
import DailyCheckin from './components/DailyCheckin';
import StreakCalendar from './components/StreakCalendar';
import Timer from './components/Timer';
import ActivityManager from './components/ActivityManager';
import './App.css';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import FocusProgressChart from './components/FocusProgressChart';
import './logo.svg';


function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showActivityManager, setShowActivityManager] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleNameSubmit = async (e) => {
    if (e.key === 'Enter') {
      setEditingName(false);
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { displayName });
        console.log('✅ Name updated in Firestore');
        setDisplayName(displayName); // ensure UI updates
      } catch (error) {
        console.error('❌ Failed to update name:', error);
      }
    }
  };

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || user.name);
        } else {
          await setDoc(userRef, { displayName: user.name });
          setDisplayName(user.name);
        }
      } catch (err) {
        console.error("Failed to load display name", err);
        setDisplayName(user.name);
      }
    };

    fetchDisplayName();
  }, [user]);

  return (
    <div className={`app-container ${theme}`}>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <>
          <div className="user-card">
            <h2>
              Hello,&nbsp;
              {editingName ? (
                <input
                  type="text"
                  className="name-input"
                  value={displayName}
                  onChange={handleNameChange}
                  onKeyDown={handleNameSubmit}
                  onBlur={() => setEditingName(false)}
                  autoFocus
                />
              ) : (
                <span className="editable-name" onClick={() => setEditingName(true)}>
                  {displayName || user.name}
                </span>
              )} 👋
            </h2>
            <img src={user.photoURL} alt="profile" className="profile-pic" />
            <p>Email: {user.email}</p>
            <p className="success-msg">✅ Login successful! Time to build your task manager ✨</p>

            <div style={{ marginTop: '10px' }}>
              <button className="toggle-theme" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark Mode' : '🌞 Light Mode'}
              </button>
              <button className="toggle-activity" onClick={() => setShowActivityManager(!showActivityManager)}>
                {showActivityManager ? 'Close Activity Manager' : '➕ Add Activities'}
              </button>
            </div>
          </div>

          {showActivityManager && (
            <div className="activity-section">
              <ActivityManager user={user} />
            </div>
          )}

          <div className="checkin-section">
            <DailyCheckin user={user} onSubmit={() => setRefreshKey(Date.now())} />
          </div>

          <TaskPlanner user={user} />
          <Timer user={user} />
          <StreakCalendar user={user} refreshKey={refreshKey} />
          <FocusProgressChart user={user} />
        </>
      )}
    </div>
  );
}

export default App;
