import { FormControl, TextField, Select, MenuItem, Box, Typography } from '@mui/material';
import './PeriodeBox.css';

interface PeriodeCardProps {
    index: number;                             // Index of the period
    date: Date;                                // The current date for the period
    weeks: number;                             // Number of weeks for this period
    handleDateChange: (index: number, date: string) => void; // Function to handle date changes
    handleWeeksChange: (index: number, week: number) => void; // Function to handle weeks changes
    dateDebutPeriode: Date;
    nbSemainePeriode: number;
}

export default function PeriodeCard({
    index,
    date,
    weeks,  
    handleDateChange,
    handleWeeksChange,
    dateDebutPeriode
}: PeriodeCardProps) {

    return (
        <Box className="periode-card">
            <div className="periode-content">

                {/* Card Title */}
                <Typography variant="h5" className="periode-title" gutterBottom>
                    Période {index + 1}
                </Typography>

                {/* Date input with custom label */}
                <label htmlFor={`start-date-${index}`} className="label-nombre-periodes">
                    Date de début période {index + 1}
                </label>
                <FormControl margin="normal">
                    <TextField
                        id={`start-date-${index}`}
                        type="date"
                        value={date ? date : dateDebutPeriode.toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                    />
                </FormControl>

                {/* Weeks input with custom label */}
                <label htmlFor={`weeks-${index}`} className="label-nombre-periodes">
                    Nombre de semaines période {index + 1}
                </label>
                <FormControl margin="normal">
                    <Select
                        id={`weeks-${index}`}
                        value={weeks} // Single week value
                        onChange={(e) => handleWeeksChange(index, e.target.value as number)}
                    >
                        {[0,1,2,3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(week => (
                            <MenuItem key={week} value={week}>
                                {week}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        </Box>
    );
}
