// components/ActivitySummary.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function ActivitySummary({ user, onAddClick }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'activities'));
      const items = snapshot.docs.map(doc => doc.data().name);
      setActivities(items);
    };
    fetchActivities();
  }, [user]);

  return (
    <div>
      <h4>🧩 Activities</h4>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {activities.map((name, idx) => (
          <li key={idx} style={{ marginBottom: '6px' }}>• {name}</li>
        ))}
      </ul>
      <button onClick={onAddClick} style={{ marginTop: '10px' }}>➕ Add New</button>
    </div>
  );
}

export default ActivitySummary;
