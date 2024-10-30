import { FormControl, TextField, Select, MenuItem, Box, Typography } from '@mui/material';
import './PeriodeBox.css';

interface PeriodeCardProps {
    index: number;                             // Index of the period
    date: Date;                                // The current date for the period
    RecupWeeks: number;                             // Number of weeks for this period
    handleDateChange: (index: number, date: Date) => void; // Function to handle date changes
    handleWeeksChange: (index: number, week: number) => void; // Function to handle weeks changes
    dateDebutPeriode: string;
}

export default function PeriodeBox({
    index,
    RecupWeeks,  
    handleDateChange,
    handleWeeksChange,
    dateDebutPeriode
}: PeriodeCardProps) {

    return (
        <Box className="periode-card">
            <Typography variant="h6" className="periode-title" gutterBottom>
                Période {index + 1}
            </Typography>
            
            {/* Horizontal Layout for Date and Weeks */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                {/* Date input with custom label */}
                <FormControl margin="normal" className="periode-input">
                    <label htmlFor={`start-date-${index}`} className="label-nombre-periodes">
                        Date de début période {index + 1}
                    </label>
                    <TextField
                        id={`start-date-${index}`}
                        type="date"
                        value={dateDebutPeriode ? new Date(dateDebutPeriode).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleDateChange(index, new Date(e.target.value))}
                    />
                </FormControl>

                {/* Weeks input with custom label */}
                <FormControl margin="normal" className="periode-input">
                    <label htmlFor={`weeks-${index}`} className="label-nombre-periodes">
                        Nombre de semaines période {index + 1}
                    </label>
                    <Select
                        id={`weeks-${index}`}
                        value={RecupWeeks} // Single week value
                        onChange={(e) => handleWeeksChange(index, e.target.value as number)}
                    >
                        {[...Array(15).keys()].map(week => (
                            <MenuItem key={week} value={week}>
                                {week}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
}
