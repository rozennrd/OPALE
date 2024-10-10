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
      const message = 'La date de fin doit être postérieure à la date de début';
      setErrorMessage(message);

    } else if (promosData.DateDeb == '') {
      const message = 'Veuillez d\'abord renseigner la date de début';
      setErrorMessage(message);

    } else {

      setPromosData({ ...promosData, DateFin: e.target.value })
      setErrorMessage('');
    }
  }
  const getYear = (date: string) => date ? new Date(date).getFullYear() : '20XX';



  return (
    <div className="deb-fin-calendrier">

      <div className="saisie-date">
        <div className="saisie-date-title">
          <h2>Calendrier {getYear(promosData.DateDeb)}-{getYear(promosData.DateFin)}</h2>
        </div>
        <div className="date-input-container">
          <label htmlFor="start-date" className="label">Date de début </label>
          <input
            type="date"
            id="start-date"
            name="start-date"
            value={promosData.DateDeb}
            onChange={(e) => setPromosData({ ...promosData, DateDeb: e.target.value })}
            className="input"
          />
        </div>
        <div className="date-input-container">
          <label htmlFor="end-date" className="label">Date de fin </label>
          <input
            type="date"
            id="end-date"
            name="end-date"
            value={promosData.DateFin}
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
