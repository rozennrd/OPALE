import React from 'react';
import TextField from '@mui/material/TextField';

const NbGroupesPromo: React.FC = () => {
    return (
        <TextField
            label="Nombre de groupes"
            type="number"
            variant="outlined"
        />
    );
};

export default NbGroupesPromo;