import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function FocusProgressChart({ user }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'focusSessions'));
      let result = [];

      snap.forEach(doc => {
        const { totalMinutes } = doc.data();
        result.push({
          date: doc.id,
          minutes: totalMinutes || 0
        });
      });

      // Sort by date and keep only last 5 records
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      result = result.slice(-5);

      // If no data found, add placeholder points for a flat line
      if (result.length === 0) {
        const today = new Date();
        for (let i = 4; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          result.push({
            date: d.toISOString().split('T')[0],
            minutes: 0
          });
        }
      }

      setData(result);
    };

    fetchProgress();
  }, [user]);

  // Determine color for each segment based on increase or decrease
  const getColoredLines = () => {
    if (data.length <= 1) {
      return (
        <Line
          type="monotone"
          dataKey="minutes"
          data={data}
          stroke="#8884d8"
          strokeWidth={3}
          dot={{ r: 5 }}
          isAnimationActive={false}
        />
      );
    }

    const lines = [];
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];
      const segment = [prev, curr];
      lines.push(
        <Line
          key={i}
          type="monotone"
          dataKey="minutes"
          data={segment}
          stroke={curr.minutes >= prev.minutes ? '#4caf50' : '#f44336'}
          strokeWidth={3}
          dot={false}
          isAnimationActive={false}
        />
      );
    }
    return lines;
  };

  return (
    <div style={{ width: '100%', marginTop: '40px' }}>
      <h3>📉 Last 5 Days Focus Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" label={{ value: 'Days', position: 'bottom', offset: 10 }} />
          <YAxis label={{ value: 'Time (Minutes)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          {getColoredLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FocusProgressChart;