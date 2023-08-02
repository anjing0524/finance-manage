// components/Calendar.js
import { useState } from 'react';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function Calendar() {
  const [date, setDate] = useState(new Date());

  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() - 1))
          }
        >
          Prev
        </button>
        <h2>
          {months[date.getMonth()]} {date.getFullYear()}
        </h2>
        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() + 1))
          }
        >
          Next
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
        {calendarDays.map((day) => (
          <div key={day} className="border p-2">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
