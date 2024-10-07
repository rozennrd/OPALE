import React from 'react';
import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import './NbGroupesPromo.css';

const NbGroupesPromo: React.FC = () => {
    const [formData, setFormData] = useState<Record<string, string>>({
        ADI1: '',
        ADI2: '',
        CIR1: '',
        CIR2: '',
        AP3: '',
        AP4: '',
        AP5: '',
        ISEN3: '',
        ISEN4: '',
        ISEN5: ''
    });

   
    
    const handleChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value as string
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className='nb-groupes-promo'>
            <h2>Nombre de groupes par promotion</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(formData).map((key, index) => (
                    <FormControl fullWidth variant="outlined" key={index} margin="normal">
                        <InputLabel id={`${key}-label`}>{key}</InputLabel>
                        <Select
                            labelId={`${key}-label`}
                            id={key}
                            name={key}
                            value={formData[key as string]}
                            onChange={handleChange}
                            label={key}
                        >
                            <MenuItem value="">
                                <em>Selectionner le nombre de classes</em>
                            </MenuItem>
                            <MenuItem value="0">0</MenuItem>
                            <MenuItem value="1">1</MenuItem>
                            <MenuItem value="2">2</MenuItem>
                            <MenuItem value="3">3</MenuItem>
                            <MenuItem value="4">4</MenuItem>
                            <MenuItem value="5">5</MenuItem>
                        </Select>
                    </FormControl>
                ))}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default NbGroupesPromo;
