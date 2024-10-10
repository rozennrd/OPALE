import { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Divider, SelectChangeEvent } from '@mui/material';
import './Periodes.css';
import PeriodeCard from './PeriodeBox';

interface PeriodesAPProps {
    nbPeriodesDefaultValue: number;
    dates: string[];
    weeks: number[];
    onChange: (nombrePeriode: number, dates: string[], weeks: number[]) => void;
}

export default function Periodes({ nbPeriodesDefaultValue, dates, weeks, onChange }: PeriodesAPProps) {
    const [numPeriods, setNumPeriods] = useState<number>(nbPeriodesDefaultValue); // Default to 5 periods if not provided
    const [localDates, setLocalDates] = useState<string[]>(dates);
    const [localWeeks, setLocalWeeks] = useState<number[]>(weeks); // Default to 3 weeks per period

    useEffect(() => {
        onChange(numPeriods, localDates, localWeeks);
    }, [numPeriods, localDates, localWeeks, onChange]);

    const handleNumPeriodsChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setNumPeriods(value);
        setLocalDates(Array(value).fill(''));
        setLocalWeeks(Array(value).fill(3)); // Reset weeks array when the number of periods changes
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...localDates];
        newDates[index] = value;
        setLocalDates(newDates);
    };

    const handleWeeksChange = (index: number, value: number) => {
        const newWeeks = [...localWeeks];
        newWeeks[index] = value;
        setLocalWeeks(newWeeks);
    };

    return (
        <>
            <h2>Périodes</h2>
            <div className='nombre-periodes'>
                <label htmlFor="art-date" className="label-nombre-periodes">Nombre de périodes </label>
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="nb-periodes">Nombre de periodes : </InputLabel>
                    <Select
                        labelId="nb-classes"
                        id="simple-select"
                        value={numPeriods}
                        onChange={handleNumPeriodsChange}
                        label="Nombre de périodes"
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {[...Array(6).keys()].map(i => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Cards container div */}
            <div className="periode-cards-container">
                {/* Map through the number of periods and render PeriodeCard components */}
                {Array.from({ length: numPeriods }).map((_, index) => (
                    <PeriodeCard 
                        key={index} 
                        index={index} 
                        date={localDates[index] || ''} 
                        weeks={localWeeks[index] || 3} 
                        handleDateChange={handleDateChange} 
                        handleWeeksChange={handleWeeksChange} 
                    />
                ))}
            </div>
        </>
    );
}
    