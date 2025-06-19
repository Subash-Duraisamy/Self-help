import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function ActivityManager({ user }) {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');

  useEffect(() => {
    const activitiesRef = collection(db, 'users', user.uid, 'activities');

    const unsubscribe = onSnapshot(activitiesRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(items);
    });

    return () => unsubscribe();
  }, [user.uid]); // ✅ Clean dependency list

  const handleAddActivity = async () => {
    if (newActivity.trim()) {
      const activitiesRef = collection(db, 'users', user.uid, 'activities');
      await addDoc(activitiesRef, { name: newActivity.trim() });
      setNewActivity('');
    }
  };

  const handleDeleteActivity = async (id) => {
    const docRef = doc(db, 'users', user.uid, 'activities', id);
    await deleteDoc(docRef);
  };

  return (
    <div className="activity-manager">
      <h3>🛠️ Manage Your Activities</h3>
      <input
        type="text"
        placeholder="Add new activity"
        value={newActivity}
        onChange={(e) => setNewActivity(e.target.value)}
      />
      <button onClick={handleAddActivity}>Add</button>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            {activity.name}
            <button onClick={() => handleDeleteActivity(activity.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityManager;
