import { useEffect, useState } from 'react';
import { Box, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent, TextField, Divider } from '@mui/material';
import './PeriodesAP.css';

interface PeriodesAPProps {
    nbPeriodesDefaultValue: number;
    dates: string[];
    weeks: number[];
    onChange: (nombrePeriode: number, dates: string[], weeks: number[]) => void;
}

export default function PeriodesAP({ nbPeriodesDefaultValue, dates, weeks, onChange }: PeriodesAPProps) {
    const [numPeriods, setNumPeriods] = useState<number>(nbPeriodesDefaultValue); // Default to 5 periods if not provided
    const [localDates, setLocalDates] = useState<string[]>(dates);
    const [localWeeks, setLocalWeeks] = useState<number[]>(weeks); // Default to 3 weeks per period

    useEffect(() => {
        onChange(numPeriods, localDates, localWeeks);
    }   , [numPeriods, localDates, localWeeks, onChange]);

    
    const handleNumPeriodsChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setNumPeriods(value);
        setLocalDates(Array(value).fill(''));
        setLocalWeeks(Array(value).fill(3)); // Reset weeks array when the number of periods changes
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...dates];
        newDates[index] = value;
        setLocalDates(newDates);
    };

    const handleWeeksChange = (index: number, value: number) => {
        const newWeeks = [...weeks];
        newWeeks[index] = value;
        setLocalWeeks(newWeeks);
    };

    return (
        <>
            <Box className='periodes-ap'>
                <h2>Périodes</h2>
                {/* Select for the number of periods */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="num-periods-label">Nombre de périodes</InputLabel>
                    <Select
                        labelId="num-periods-label"
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

                {/* Date and weeks per period */}
                {dates.map((date, index) => (
                    <>
                        <div className='periode'>
                            <FormControl fullWidth margin="normal">
                                <InputLabel shrink>Date de début période {index + 1}</InputLabel>
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(index, e.target.value)}
                                    fullWidth
                                />
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel id={`weeks-label-${index}`}>
                                    Nombre de semaines période {index + 1}
                                </InputLabel>
                                <Select
                                    labelId={`weeks-label-${index}`}
                                    value={weeks[index]}
                                    label={`Nombre de semaines période ${index + 1}`}
                                    onChange={(e) => handleWeeksChange(index, e.target.value as number)}
                                    fullWidth
                                >
                                    {[3, 4, 5, 6].map(week => (
                                        <MenuItem key={week} value={week}>{week}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </>

                ))}
            </Box>
        </>
    );
}
