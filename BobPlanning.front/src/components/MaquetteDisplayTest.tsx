import { 
    Accordion, AccordionDetails, AccordionSummary, 
    MenuItem, Select, Table, TableBody, TableCell, TableRow, Typography 
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;


interface Course {
    promo: string;
    name: string;
    UE: string;
    semestre: number[];
    Periode: string;
    Prof: string;
    typeSalle: string;
    heure: {
        total: number;
        totalAvecProf: number;
        coursInteractif: number;
        projet: number;
    }; // JSON sous forme de string
  }

interface UE {
    name: string;
}

interface Data {
    UE: UE[];
    cours: Course[];
    reloadData: boolean;
}

interface Prof {
    id: number;
    name: string;
}

export default function MaquetteDisplayTest({ data }: { data: Data }) {
    const [selectedProfessors, setSelectedProfessors] = useState<{ [key: string]: string }>({});
    const [professors, setProfessors] = useState<Prof[]>([]);

    useEffect(() => {
        console.log("Données mises à jour :", data);
      }, [data.reloadData]);
      
    useEffect(() => {
        const fetchProfsData = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${RACINE_FETCHER_URL}/getProfsData`, {
                    method: 'GET',
                    headers: { "x-access-token": token ?? "" },
                });

                if (!response.ok) throw new Error("Erreur lors de la récupération des professeurs");

                const dataProf = await response.json();
                console.log('Professeurs récupérés:', dataProf);
                setProfessors(dataProf);
            } catch (error) {
                console.error('Erreur de récupération des professeurs:', error);
            }
        };

        fetchProfsData();
    }, []);

    useEffect(() => {
        if (professors.length > 0) {
            const initialSelectedProfessors: { [key: string]: string } = {};
            data.cours.forEach((course) => {
                const foundProf = professors.find(prof => prof.id === Number(course.Prof));
                if (foundProf) {
                    initialSelectedProfessors[course.name] = foundProf.id.toString();
                }
            });
            setSelectedProfessors(initialSelectedProfessors);
        }
    }, [data.cours, professors]); // Exécute cette mise à jour quand `data.cours` ou `professors` changent

    
    const handleSelectChange = async (courseName: string, professorId: number) => {
        setSelectedProfessors((prev) => ({ ...prev, [courseName]: professorId.toString() }));

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${RACINE_FETCHER_URL}/updateCourseProfessor`, {
                method: 'POST',
                headers: { "Content-Type": "application/json", "x-access-token": token ?? "" },
                body: JSON.stringify({ courses: [{ Prof: professorId, name: courseName }] })
            });

            if (!response.ok) throw new Error("Échec de la mise à jour du professeur");

            console.log(`✅ Professeur (ID: ${professorId}) mis à jour pour le cours: ${courseName}`);
        } catch (error) {
            console.error("Erreur mise à jour du professeur:", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Accordion sx={accordionStyle}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Voir les matières</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {data.UE.map((ue) => (
                        <Accordion key={ue.name} sx={accordionStyle}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">📖 {ue.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {data.cours
                                        .filter((course) => course.UE === ue.name)
                                        .map((course) => (
                                            <li key={course.name} style={{ marginBottom: '15px' }}>
                                                <Typography sx={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                    {course.name}
                                                </Typography>
                                                <Typography variant="body2">📅 Semestres : {course.semestre.join(', ')}</Typography>
                                                <Table size="small" sx={{ marginTop: '10px', border: '1px solid #ddd' }}>
                                                    <TableBody>
                                                        {Object.entries(course.heure).map(([key, value]) => (
                                                            <TableRow key={key}>
                                                                <TableCell>{formatLabel(key)} :</TableCell>
                                                                <TableCell>{value || 'N/A'}</TableCell>
                                                            </TableRow>
                                                        ))}
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

// 🎨 Styles des Accordeons
const accordionStyle = {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'background-color 0.3s ease',
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    '& .MuiAccordionSummary-root:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    '& .MuiAccordionDetails-root': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
};

// 🔍 Fonction pour formater les labels des heures
const formatLabel = (key: string) => {
    const labels: { [key: string]: string } = {
        total: "Total heures",
        totalAvecProf: "Total avec prof",
        coursInteractif: "Cours interactifs",
        projet: "Projets"
    };
    return labels[key] || key;
};
