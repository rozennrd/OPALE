import React, { useState } from "react";
import './DebCoursDate.css'; 

interface FinCoursDateProps {
  endDate: string;
  setEndDate: (date: string) => void;
}

const FinCoursDate: React.FC<FinCoursDateProps> = ({ endDate, setEndDate }) => {
  const [localEndDate, setLocalEndDate] = useState<string>(endDate);

  // Gère la modification locale de la date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEndDate(e.target.value);
  };

  // Valide la date lorsque l'input perd le focus
  const handleBlur = () => {
    if (localEndDate !== endDate) {
      setEndDate(localEndDate); // Met à jour la date globale uniquement après validation
    }
  };

  return (
    <div className="date-debut-cours-container">
      <label htmlFor="end-date" className="label">Date de fin des cours</label>
      <input
        type="date"
        id="end-date"
        name="end-date"
        value={localEndDate}
        onChange={handleDateChange}  // Change la date localement
        onBlur={handleBlur} // Met à jour la date globale lors de la perte de focus
        className="input"
      />
    </div>
  );
};

export default FinCoursDate;
