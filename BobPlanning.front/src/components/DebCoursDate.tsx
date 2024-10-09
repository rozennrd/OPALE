import React, { useState } from "react";
import './DebCoursDate.css'; 


interface DebCoursDateProps {
  startDate: string;
  setStartDate: (date: string) => void;
}

const DebCoursDate: React.FC<DebCoursDateProps> = ({startDate,setStartDate }) => {

  return (
    <div className="date-debut-cours-container">
      <label htmlFor="start-date" className="label">Date de début des cours</label>
      <input
        type="date"
        id="start-date"
        name="start-date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="input"
      />
    </div>
  );
};

export default DebCoursDate;
