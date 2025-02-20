import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Select, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import axios from "axios";

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;
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

interface Prof {
    id: number;
    name: string;
    type: string;
    dispo: string;
}

export default function MaquetteDisplay({ data }: { data: Data }) {
    const [selectedProfessors, setSelectedProfessors] = useState<{ [key: string]: string }>({});
    const [professors, setProfessors] = useState<Prof[]>([]);

    useEffect(() => {
        const fetchProfsData = async () => {
            try {
                const token = localStorage.getItem("accessToken"); // Récupérer le token
                const response = await fetch(`${RACINE_FETCHER_URL}/getProfsData`, {
                    method: 'GET',
                    headers: {
                        "x-access-token": token ?? "", // Ajouter le token dans l'en-tête
                    },
                });
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des professeurs");
                }


                const dataProf = await response.json();
                console.log('dataProf:', dataProf);
                setProfessors(dataProf);
            } catch (error) {
                console.error('Error fetching profs data:', error);
            }
        };

        fetchProfsData();
    }, []);

    const handleSelectChange = async (courseName: string, professorId: number) => {
        setSelectedProfessors((prev) => ({
            ...prev,
            [courseName]: professorId.toString(),
        }));

      
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${RACINE_FETCHER_URL}/updateCourseProfessor`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token ?? "",
                },
                body: JSON.stringify({
                    courses: [{ Prof: professorId, name: courseName }] // Envoi de l'ID du prof
                }),
            });
    
            if (!response.ok) {
                throw new Error("Échec de la mise à jour du professeur");
            }
    
            console.log(`Professeur (ID: ${professorId}) mis à jour pour le cours ${courseName}`);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du professeur :", error);
        }
    };


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
                                                        <TableRow>
                                                            <TableCell>Professeur :</TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={selectedProfessors[course.name] || ""}
                                                                    onChange={(e) => handleSelectChange(course.name, Number(e.target.value))}
                                                                    displayEmpty
                                                                    fullWidth
                                                                >
                                                                    <MenuItem value="" disabled>Sélectionner un professeur</MenuItem>
                                                                    {professors.map((prof) => (
                                                                        <MenuItem key={prof.id} value={prof.id}>{prof.name}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </TableCell>
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
