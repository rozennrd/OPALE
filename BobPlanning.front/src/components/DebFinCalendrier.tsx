import React, { useState } from "react";
import './DebFinCalendrier.css';

const DebFinCalendrier: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      setErrorMessage('La date de fin doit être postérieure à la date de début');
    } else if (startDate == '') {
      setErrorMessage('Veuillez d\'abord renseigner la date de début');
     } else {

      setEndDate(newEndDate);
      setErrorMessage('');
    }
  }



return (
  <div className="deb-fin-calendrier">

    <div className="saisie-date">
      <div className="saisie-date-title">
        <h2>Calendrier 20XX-20XX</h2>
      </div>
      <div className="date-input-container">
        <label htmlFor="start-date" className="label">Date de début </label>
        <input
          type="date"
          id="start-date"
          name="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input"
        />
      </div>
      <div className="date-input-container">
        <label htmlFor="end-date" className="label">Date de fin </label>
        <input
          type="date"
          id="end-date"
          name="end-date"
          value={endDate}
          onChange={handleEndDateChange}
          className="input"
        />
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  </div>
);
};

export default DebFinCalendrier;
