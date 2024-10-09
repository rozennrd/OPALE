import  { useState } from 'react';
import { Grid, Box, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent, TextField } from '@mui/material';
import './PeriodesAP.css';

interface PeriodesAPProps {
  nbPeriodesDefaultValue?: number;
}

export default function PeriodesAP({ nbPeriodesDefaultValue = 5 }: PeriodesAPProps) {
    const [numPeriods, setNumPeriods] = useState<number>(nbPeriodesDefaultValue); // Default to 5 periods if not provided
    const [dates, setDates] = useState<string[]>(Array(nbPeriodesDefaultValue).fill(''));
    const [weeks, setWeeks] = useState<number[]>(Array(nbPeriodesDefaultValue).fill(3)); // Default to 3 weeks per period

    const handleNumPeriodsChange = (e: SelectChangeEvent<number>) => {
        const value = e.target.value as number;
        setNumPeriods(value);
        setDates(Array(value).fill(''));
        setWeeks(Array(value).fill(3)); // Reset weeks array when the number of periods changes
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...dates];
        newDates[index] = value;
        setDates(newDates);
    };

    const handleWeeksChange = (index: number, value: number) => {
        const newWeeks = [...weeks];
        newWeeks[index] = value;
        setWeeks(newWeeks);
    };

    return (
        <Box className='periodes-ap'>
            <h2>Périodes</h2>
            {/* Select for the number of periods */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="num-periods-label">Nombre de périodes</InputLabel>
                <Select
                    labelId="num-periods-label"
                    value={numPeriods}
                    onChange={handleNumPeriodsChange}
                >
                    {[...Array(6).keys()].map(i => (
                        <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Date and weeks per period */}
            <Grid container spacing={2}>
                {dates.map((date, index) => (
                    <Grid container spacing={2} key={index}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel shrink>Date de début période {index + 1}</InputLabel>
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(index, e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id={`weeks-label-${index}`}>
                                    Nombre de semaines période {index + 1}
                                </InputLabel>
                                <Select
                                    labelId={`weeks-label-${index}`}
                                    value={weeks[index]}
                                    onChange={(e) => handleWeeksChange(index, e.target.value as number)}
                                >
                                    {[3, 4, 5, 6].map(week => (
                                        <MenuItem key={week} value={week}>{week}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
