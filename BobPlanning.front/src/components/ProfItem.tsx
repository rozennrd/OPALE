import { Accordion, AccordionSummary, AccordionDetails, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useState } from "react";

interface ProfData {
    id: number;
    name: string;
    type: 'EXT' | 'INT';
    dispo: Record<string, boolean>;
}

interface ProfItemProps {
    prof: ProfData;
    onDelete: (id: number) => void;
}

const ProfItem: React.FC<ProfItemProps> = ({ prof, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    const periodes = ['Matin', 'Aprem'];
    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{prof.name}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex', flexDirection: 'column' , alignItems: 'flex-start' }}>
                <Typography variant="subtitle1">Type: {prof.type === 'INT' ? 'Interne' : 'Externe'}</Typography>
                <Typography variant="subtitle1">Disponibilités:</Typography>
                <table className='dispo-table' style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}></th>
                            {periodes.map((periode) => (
                                <th key={periode} style={{ padding: '8px', border: '1px solid #ddd' }}>{periode}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jours.map((jour) => (
                            <tr key={jour}>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{jour}</td>
                                {periodes.map((periode) => (
                                    <td key={`${jour}${periode}`} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        {prof.dispo[`${jour}${periode}`] ? '✔️' : '❌'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent:'flex-end', gap: '10px', marginTop: '10px' , width: '100%' }}>
                    
                    <IconButton color="error" onClick={() => onDelete(prof.id)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            </AccordionDetails>
        </Accordion>
    );
};

export default ProfItem;
