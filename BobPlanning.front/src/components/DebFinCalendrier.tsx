import React, { useState } from "react";
import './DebFinCalendrier.css';
import ErrorIcon from '@mui/icons-material/Error';


const DebFinCalendrier: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      const message = 'La date de fin doit être postérieure à la date de début';
      setErrorMessage(message);

    } else if (startDate == '') {
      const message = 'Veuillez d\'abord renseigner la date de début';
      setErrorMessage(message);

    } else {

      setEndDate(newEndDate);
      setErrorMessage('');
    }
  }
  const getYear = (date: string) => date ? new Date(date).getFullYear() : '20XX';



  return (
    <div className="deb-fin-calendrier">

      <div className="saisie-date">
        <div className="saisie-date-title">
          <h2>Calendrier {getYear(startDate)}-{getYear(endDate)}</h2>
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
        {errorMessage && (
          <div className="error-message">
            <ErrorIcon  />
           <span>{errorMessage} </span>
          </div>)}
      </div>
    </div>
  );
};

export default DebFinCalendrier;
