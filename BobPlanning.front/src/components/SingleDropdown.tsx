import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

const SingleDropdown: React.FC = () => {
    const [selectedValue, setSelectedValue] = useState<string>('');

    const handleChange = (e: SelectChangeEvent<string>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="nb-classes">Nombre de classes : </InputLabel>
            <Select
                labelId="nb-classes"
                id="simple-select"
                value={selectedValue}
                onChange={handleChange}
                label="Nombre de classes"
            >
                <MenuItem value="">
                    <em>promo</em>
                </MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="2">4</MenuItem>
                <MenuItem value="3">5</MenuItem>
            </Select>
        </FormControl>
    );
};

export default SingleDropdown;
