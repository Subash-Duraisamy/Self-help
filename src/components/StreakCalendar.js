import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function StreakCalendar({ user, refreshKey }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const snapshot = await getDocs(
        collection(db, 'users', user.uid, 'dailySubmissions')
      );

      const formatted = [];

      snapshot.forEach(docSnap => {
        const { date, yesCount, totalCount } = docSnap.data();
        const ratio = totalCount ? yesCount / totalCount : 0;

        if (date && date.match(/\d{4}-\d{2}-\d{2}/)) {
          formatted.push({
            date,
            count: ratio,
          });
        }
      });

      console.log('🔥 Calendar Data:', formatted); // Debug log

      setData(formatted);
    };

    fetchSubmissions();
  }, [user.uid, refreshKey]);

  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1); // last 1 month

  return (
    <div style={{ marginTop: '40px' }}>
      <h3>📅 Streak Calendar</h3>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={data}
        classForValue={(value) => {
          if (!value || value.count === undefined) return 'color-empty';
          if (value.count === 0) return 'color-scale-1';       // All "No"
          if (value.count < 0.75) return 'color-scale-2';       // Some "Yes"
          return 'color-scale-3';                               // All or most "Yes"
        }}
        showWeekdayLabels
        tooltipDataAttrs={value => {
          if (!value || value.count === undefined) return { 'data-tip': 'No data' };
          return {
            'data-tip': `Date: ${value.date}, Completed: ${(value.count * 100).toFixed(0)}%`,
          };
        }}
      />
    </div>
  );
}

export default StreakCalendar;
