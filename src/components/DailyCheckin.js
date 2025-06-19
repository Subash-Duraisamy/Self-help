import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

function DailyCheckin({ user, onSubmit }) {
  const [activities, setActivities] = useState([]);
  const [responses, setResponses] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const today = new Date().toLocaleDateString('en-CA'); // ✅ local YYYY-MM-DD

  useEffect(() => {
    const fetchData = async () => {
      const actSnap = await getDocs(collection(db, 'users', user.uid, 'activities'));
      const actList = actSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(actList);

      // Check if already submitted
      const docRef = doc(db, 'users', user.uid, 'dailySubmissions', today);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setHasSubmitted(true);
        const data = docSnap.data();
        const loaded = {};
        actList.forEach(a => {
          if (data.hasOwnProperty(a.name)) {
            loaded[a.name] = data[a.name];
          }
        });
        setResponses(loaded);
      }
    };

    fetchData();
  }, [user.uid, today]);

  const handleChange = (activityName, value) => {
    setResponses(prev => ({ ...prev, [activityName]: value }));
  };

  const handleSubmit = async () => {
    const yesCount = Object.values(responses).filter(v => v === 'yes').length;
    const totalCount = activities.length;

    await setDoc(doc(db, 'users', user.uid, 'dailySubmissions', today), {
      ...responses,
      date: today,
      yesCount,
      totalCount,
    });

    setHasSubmitted(true); // ✅ prevent double submit
    alert('✅ Check-in submitted!');
    if (onSubmit) onSubmit(); // optional refresh
  };

  return (
    <div className="checkin-box">
      <h3>✅ Daily Check-in</h3>

      {activities.length === 0 ? (
        <p>No activities found. Please add some first.</p>
      ) : hasSubmitted ? (
        <p className="success-msg">🎉 You've already submitted today's check-in!</p>
      ) : (
        <>
          <ul>
            {activities.map(activity => (
              <li key={activity.id}>
                {activity.name}:
                <button
                  className={responses[activity.name] === 'yes' ? 'yes' : ''}
                  onClick={() => handleChange(activity.name, 'yes')}
                >
                  Yes
                </button>
                <button
                  className={responses[activity.name] === 'no' ? 'no' : ''}
                  onClick={() => handleChange(activity.name, 'no')}
                >
                  No
                </button>
              </li>
            ))}
          </ul>

          <button onClick={handleSubmit}>✅ Submit Check-in</button>
        </>
      )}
    </div>
  );
}

export default DailyCheckin;
