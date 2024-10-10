import { useEffect, useState } from 'react';
import { Box, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent, TextField, Divider } from '@mui/material';
import './PeriodesAP.css';

interface PeriodesAPProps {
    nbPeriodesDefaultValue: number;
    dates: Date[];
    weeks: number[];
    onChange: (nombrePeriode: number, dates: Date[], weeks: number[]) => void;
}

export default function PeriodesAP({ nbPeriodesDefaultValue, dates, weeks, onChange }: PeriodesAPProps) {
    const [numPeriods, setNumPeriods] = useState<number>(nbPeriodesDefaultValue);
    const [localDates, setLocalDates] = useState<Date[]>(dates);
    const [localWeeks, setLocalWeeks] = useState<number[]>(weeks);

    useEffect(() => {
        onChange(numPeriods, localDates, localWeeks);
    }, [numPeriods, localDates, localWeeks, onChange]);

    const handleNumPeriodsChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setNumPeriods(value);
        setLocalDates(Array(value).fill(''));
        setLocalWeeks(Array(value).fill(3));
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...localDates];
        newDates[index] = new Date(value);
        setLocalDates(newDates);
    };

    const handleWeeksChange = (index: number, value: number) => {
        const newWeeks = [...localWeeks];
        newWeeks[index] = value;
        setLocalWeeks(newWeeks);
    };

    return (
        <Box className='periodes-ap'>
            <h2>Périodes</h2>
            <label htmlFor="art-date" className="label-nombre-periodes">Nombre de périodes</label>
            <FormControl variant="outlined" margin="normal">
                <InputLabel id="nb-periodes">Nombre de périodes</InputLabel>
                <Select
                    labelId="nb-periodes"
                    value={numPeriods}
                    label="Nombre de périodes"
                    onChange={handleNumPeriodsChange}
                >
                    {[...Array(6).keys()].map(i => (
                        <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Divider className='divider' />

            {localDates.map((date, index) => (
                <div className='periode' key={index}>
                    <FormControl margin="normal">
                        <InputLabel shrink>Date de début période {index + 1}</InputLabel>
                        <TextField
                            type="date"
                            value={date ? date.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(index, e.currentTarget.value)}
                        />
                    </FormControl>

                    <FormControl margin="normal">
                        <InputLabel id={`weeks-label-${index}`}>
                            Nombre de semaines période {index + 1}
                        </InputLabel>
                        <Select
                            labelId={`weeks-label-${index}`}
                            value={localWeeks[index]}
                            label={`Nombre de semaines période ${index + 1}`}
                            onChange={(e) => handleWeeksChange(index, e.target.value as number)}
                        >
                            {[3, 4, 5, 6].map(week => (
                                <MenuItem key={week} value={week}>{week}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            ))}
        </Box>
    );
}
