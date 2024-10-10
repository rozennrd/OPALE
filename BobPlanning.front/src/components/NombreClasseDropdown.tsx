import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import './NombreClasseDropdown.css';

interface NombreClasseDropdownProps {
    promoName: string;
    selectedValue: string;
    onChange: (promo: string, value: string) => void;
}

const NombreClasseDropdown: React.FC<NombreClasseDropdownProps> = ({ promoName, selectedValue, onChange }) => {

    const handleChange = (e: SelectChangeEvent<string>) => {
        onChange(promoName, e.target.value);
    };

    return (
        <div className="nombre-classes">
            <label htmlFor="art-date" className="label-nombre-classe">Nombre de classes </label>


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
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="2">4</MenuItem>
                    <MenuItem value="3">5</MenuItem>
                </Select>
            </FormControl>
        </div>
    );
};

export default NombreClasseDropdown;
