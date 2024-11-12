import React from "react";
import moment from "moment";

export function Calendar({ date, setDate }) {
  const getDaysInMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = moment([year, month, 1]);
    const lastDay = moment(firstDay).endOf("month");

    const days = [];
    let currentDay = firstDay;

    while (currentDay <= lastDay) {
      days.push(moment(currentDay));
      currentDay = moment(currentDay).add(1, "days");
    }

    return days;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button
          onClick={() => setDate(moment(date).subtract(1, "month").toDate())}
          className="calendar-nav-btn"
        >
          &lt;
        </button>
        <h3>{moment(date).format("MMMM YYYY")}</h3>
        <button
          onClick={() => setDate(moment(date).add(1, "month").toDate())}
          className="calendar-nav-btn"
        >
          &gt;
        </button>
      </div>

      <div className="calendar-days-header">
        {moment.weekdaysShort(true).map((day) => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {getDaysInMonth().map((day, index) => {
          const isToday = day.isSame(moment(), "day");
          const dayClass = `calendar-day ${isToday ? "today" : ""}`;

          return (
            <div key={index} className={dayClass}>
              <span className="day-number">{day.format("D")}</span>
              <span className="day-name">{day.format("ddd")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
