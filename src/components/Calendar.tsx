import React from 'react';
import './Calendar.css';
const Calendar = () => {
    return (
      <div className="calendar">
        <div className="calendar-header">
          <button>Today</button>
          <h2>May 21 – 26, 2045</h2>
          <div className="view-options">
            <button>Year</button>
            <button>Week</button>
            <button>Month</button>
            <button>Day</button>
          </div>
        </div>
        <div className="calendar-days">
          <div>Monday 12</div>
          <div>Tuesday 13</div>
          <div>Wednesday 14</div>
          <div>Thursday 15</div>
          <div>Friday 16</div>
          <div>Saturday 17</div>
          <div>Sunday 18</div>
        </div>
        <div className="calendar-body">
          {/* Example rows for each day and event details */}
          <div className="event">Shooting Stars</div>
          <div className="event">The Amazing Hubble</div>
          {/* ... (Other events) */}
        </div>
        <div className="event-details">
          <input type="text" placeholder="Event Title" />
          <button>Add Place</button>
          <button>Add Date</button>
          <button>Add Time</button>
          <button>Add Members</button>
          <button>Add Notes</button>
        </div>
      </div>
    );
  }
  
export default Calendar;