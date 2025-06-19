// src/components/TaskPlanner.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

function TaskPlanner({ user }) {
  const [taskText, setTaskText] = useState('');
  const [taskList, setTaskList] = useState([]);

  // 📆 Format tomorrow's date as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toISOString().split('T')[0];

  // ✅ Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'tasks'),
          where('date', '==', formattedDate)
        );
        const querySnapshot = await getDocs(q);
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        setTaskList(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user.uid, formattedDate]);

  const handleAddTask = async () => {
    if (!taskText.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        content: taskText.trim(),
        date: formattedDate,
        status: null,
        createdAt: Timestamp.now()
      });

      setTaskList([...taskList, { id: docRef.id, content: taskText.trim() }]);
      setTaskText('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Plan Tasks for {formattedDate}</h2>
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Enter a task"
        style={{ padding: "10px", width: "300px" }}
      />
      <button onClick={handleAddTask} style={{ marginLeft: "10px", padding: "10px 20px" }}>
        Add Task
      </button>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {taskList.map((task) => (
          <li key={task.id} style={{ marginBottom: "10px" }}>✅ {task.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default TaskPlanner;
