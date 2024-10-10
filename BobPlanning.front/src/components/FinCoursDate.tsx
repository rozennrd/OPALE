import React from "react";
import './DebCoursDate.css'; 


interface FinCoursDateProps {
  endDate: string;
  setEndDate: (date: string) => void;
}

const FinCoursDate: React.FC<FinCoursDateProps> = ({endDate,setEndDate }) => {

  return (
    <div className="date-debut-cours-container">
      <label htmlFor="end-date" className="label">Date de début des cours</label>
      <input
        type="date"
        id="end-date"
        name="end-date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="input"
      />
    </div>
  );
};

export default FinCoursDate;
