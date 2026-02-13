import React, { useState } from "react";
import './DebFinCalendrier.css';
import ErrorIcon from '@mui/icons-material/Error';

interface DebFinCalendrierProps {
  setPromosData: (data: any) => void;
  promosData: { DateDeb: string; DateFin: string };
}

const DebFinCalendrier: React.FC<DebFinCalendrierProps> = ({ setPromosData, promosData }) => {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    if (promosData.DateDeb && new Date(newEndDate) < new Date(promosData.DateDeb)) {
      setErrorMessage('La date de fin doit être postérieure à la date de début');
    } else if (!promosData.DateDeb) {
      setErrorMessage('Veuillez d\'abord renseigner la date de début');
    } else {
      setPromosData({ ...promosData, DateFin: newEndDate });
      setErrorMessage('');
    }
  };

  const getYear = (date: string) => (date ? new Date(date).getFullYear() : '20XX');

  return (
    <div className="deb-fin-calendrier">
      <div className="header">
        <h2>Calendrier {getYear(promosData.DateDeb)}-{getYear(promosData.DateFin)}</h2>
        <div className="date-input-container">
          <label htmlFor="start-date" className="label">Début</label>
          <input
            type="date"
            id="start-date"
            value={promosData.DateDeb}
            onChange={(e) => setPromosData({ ...promosData, DateDeb: e.target.value })}
            className="input"
          />
          <label htmlFor="end-date" className="label">Fin</label>
          <input
            type="date"
            id="end-date"
            value={promosData.DateFin}
            onChange={handleEndDateChange}
            className="input"
          />
        </div>

      </div>
      {errorMessage && (
        <div className="error-message">
          <ErrorIcon className="error-icon" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DebFinCalendrier;
