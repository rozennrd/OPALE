import React, { useState } from "react";
import './DebCoursDate.css'; 

interface DebCoursDateProps {
  startDate: string;
  setStartDate: (date: string) => void;
}

const DebCoursDate: React.FC<DebCoursDateProps> = ({ startDate, setStartDate }) => {
  const [localStartDate, setLocalStartDate] = useState<string>(startDate);

  // Gère la modification locale de la date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStartDate(e.target.value);
  };

  // Valide la date lorsque l'input perd le focus
  const handleBlur = () => {
    if (localStartDate !== startDate) {
      setStartDate(localStartDate); // Met à jour la date globale uniquement après validation
    }
  };

  return (
    <div className="date-debut-cours-container">
      <label htmlFor="start-date" className="label">Date de début des cours</label>
      <input
        type="date"
        id="start-date"
        name="start-date"
        value={localStartDate}
        onChange={handleDateChange}  // Change la date localement
        onBlur={handleBlur} // Met à jour la date globale lors de la perte de focus
        className="input"
      />
    </div>
  );
};

export default DebCoursDate;
