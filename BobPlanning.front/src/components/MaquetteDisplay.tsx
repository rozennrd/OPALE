import { Accordion, AccordionDetails, AccordionSummary, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Course {
    name: string;
    UE: string;
    semestre: number[];
    heure: {
        total: number;
        totalAvecProf: number;
        coursInteractif: number;
        projet: number;
    };
}

interface UE {
    name: string;
}

interface Data {
    UE: UE[];
    cours: Course[];
}

export default function MaquetteDisplay({ data }: { data: Data }) {
    return (
        <div style={{ padding: '20px' }}>
            <Accordion 
                sx={{
                    backgroundColor: 'transparent', // Arrière-plan transparent

                    boxShadow: 'none', // Supprime les ombres
                    border: '1px solid rgba(255, 255, 255, 0.2)', // Bordure fine et transparente
                    transition: 'background-color 0.3s ease', // Transition pour l'effet hover
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Arrière-plan semi-transparent au survol
                    },
                    '& .MuiAccordionSummary-root': {
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.53)', // Fond au survol du résumé
                        },
                    },
                    '& .MuiAccordionDetails-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Fond pour la section détails
                    },
                }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Afficher les données chargées</Typography>
                </AccordionSummary>
                <AccordionDetails>


                    {data.UE.map((ue) => (
                        <Accordion key={ue.name}
                            sx={{
                                backgroundColor: 'transparent', // Arrière-plan transparent

                                boxShadow: 'none', // Supprime les ombres
                                border: '1px solid rgba(255, 255, 255, 0.2)', // Bordure fine et transparente
                                transition: 'background-color 0.3s ease', // Transition pour l'effet hover
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Arrière-plan semi-transparent au survol
                                },
                                '& .MuiAccordionSummary-root': {
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond au survol du résumé
                                    },
                                },
                                '& .MuiAccordionDetails-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Fond pour la section détails
                                },
                            }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{ue.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul style={{ listStyle: 'none' }}>
                                    {data.cours
                                        .filter((course) => course.UE === ue.name)
                                        .map((course) => (
                                            <li key={course.name} style={{ marginBottom: '20px' }}>
                                                <Typography style={{ fontWeight: 'bold' }}>
                                                    {course.name}
                                                </Typography>
                                                <Typography variant="body2">Semestre : {course.semestre.join(', ')}</Typography>
                                                <Table size="small" style={{ marginTop: '10px', border: '1px solid #ddd' }}>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell>Total heures :</TableCell>
                                                            <TableCell>{course.heure.total || 'N/A'}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>Total avec prof :</TableCell>
                                                            <TableCell>{course.heure.totalAvecProf || 'N/A'}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>Cours interactifs :</TableCell>
                                                            <TableCell>{course.heure.coursInteractif || 'N/A'}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>Projets :</TableCell>
                                                            <TableCell>{course.heure.projet || 'N/A'}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </li>
                                        ))}
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </AccordionDetails>
            </Accordion>
        </div>

    );


}
