import React, { useEffect, useState } from 'react';
import { getTokenFromLocalStorage } from '../auth/Token';
import './Profs2.css';
import { Button, styled, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ProfItem from '../components/ProfItem';

interface ProfData {
    id: number;
    name: string;
    type: 'EXT' | 'INT';
    dispo: Record<string, boolean>;
}
const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
const periodes = ['Matin', 'Aprem'];

const Profs2 = () => {
    const [profs, setProfs] = useState<ProfData[]>([]);
    const [newProf, setNewProf] = useState<{ name: string; type: 'EXT' | 'INT'; dispo: Record<string, boolean> }>(
        { name: '', type: 'INT', dispo: {} }
    );

    useEffect(() => {
        const fetchProfs = async () => {
            const token = getTokenFromLocalStorage();
            if (!token) return;
            try {
                const response = await fetch(`${RACINE_FETCHER_URL}/getProfsData`, {
                    headers: {
                        'x-access-token': token,
                    },
                });
                if (!response.ok) throw new Error('Erreur lors de la récupération des professeurs');
                const data = await response.json();

                const formattedData = data.map((prof: any) => ({
                    ...prof,
                    dispo: (typeof prof.dispo === 'string' && prof.dispo.trim().startsWith('{')) ? JSON.parse(prof.dispo) : {}
                }));
                

                console.log("Données transformées :", formattedData);
                setProfs(formattedData);
            } catch (error) {
                console.error('Erreur lors de la récupération des professeurs:', error);
            }
        };
        fetchProfs();
    }, []);


    const addProf = async () => {
        if (!newProf.name.trim()) {
            alert('Veuillez saisir un nom pour le professeur');
            return;
        }
        try {
            const token = getTokenFromLocalStorage();
            if (!token) return;
            const response = await fetch(`${RACINE_FETCHER_URL}/addProf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token,
                },
                body: JSON.stringify({
                    ...newProf,
                    dispo: newProf.dispo // S'assurer que dispo est bien un string JSON
                }),
            });
            if (!response.ok) throw new Error('Erreur lors de l\'ajout du professeur');
            const data = await response.json();
            setProfs((prev) => [...prev, { ...newProf, id: data.insertId }]);
            setNewProf({ name: '', type: 'INT', dispo: {} });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du professeur:', error);
        }
    };

    const toggleDispo = (jour: string, periode: string) => {
        setNewProf((prev) => {
            const updatedDispo = { ...prev.dispo };
    
            // Assurer que toutes les périodes existent
            jours.forEach(j => {
                periodes.forEach(p => {
                    if (!(j + p in updatedDispo)) {
                        updatedDispo[j + p] = false;
                    }
                });
            });
    
            // Basculer l'état de la période cliquée
            updatedDispo[`${jour}${periode}`] = !prev.dispo[`${jour}${periode}`];
    
            return { ...prev, dispo: updatedDispo };
        });
    };
    

    const deleteProf = async (id: number) => {
        const token = getTokenFromLocalStorage();
        if (!token) return;
        try {
            const response = await fetch(`${RACINE_FETCHER_URL}/deleteProf/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-access-token': token,
                },
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression du professeur');
            setProfs((prev) => prev.filter((prof) => prof.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression du professeur:', error);
        }
    }


    
    return (
        <div>
            <h1>Gestion des professeurs</h1>
            <div className='container-global'>
                <div className="container-add">
                    <h3>Ajouter un nouveau professeur</h3>
                    <div className='form-group'>
                        <label>Nom et prénom </label>
                        <TextField
                            type="text"
                            placeholder="Nom du professeur"
                            value={newProf.name}
                            onChange={(event) => setNewProf({ ...newProf, name: event.target.value })}
                            fullWidth
                        />
                    </div>
                    <div className='form-group'>
                        <label>Type </label>
                        <ToggleButtonGroup
                            value={newProf.type}
                            exclusive
                            onChange={(event, newType) => {
                                if (newType !== null) {
                                    setNewProf({ ...newProf, type: newType });
                                }
                            }}

                        >
                            <ToggleButton value="INT" sx={{
                                border: "1px solid var(--secondary-color)",
                                color: "var(--text-color)",
                                "&.Mui-selected": {
                                    backgroundColor: "var(--secondary-color)",
                                    color: "#fff",
                                },
                                "&:hover": {
                                    backgroundColor: "var(--secondary-color)",
                                    color: "#fff",
                                },
                            }}>Interne</ToggleButton>
                            <ToggleButton value="EXT" sx={{
                                border: "1px solid var(--secondary-color)",
                                color: "var(--text-color)",
                                "&.Mui-selected": {
                                    backgroundColor: "var(--secondary-color)",
                                    color: "#fff",
                                },
                                "&:hover": {
                                    backgroundColor: "var(--secondary-color)",
                                    color: "#fff",
                                },
                            }}>Externe</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <div className='form-group-dispo'>
                        <label>Disponibilités :</label>
                        <table className='dispo-table'>
                            <thead>
                                <tr>
                                    <th></th>
                                    {periodes.map((periode) => (
                                        <th key={periode}>{periode}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {jours.map((jour) => (
                                    <tr key={jour}>
                                        <td >{jour}</td>
                                        {periodes.map((periode) => (
                                             <td
                                             key={`${jour}${periode}`}
                                             style={{
                                                 padding: '8px',
                                                 border: '1px solid #ddd',
                                                 textAlign: 'center',
                                                 minWidth: '50px',
                                                 height: '30px',
                                                 backgroundColor: newProf.dispo[`${jour}${periode}`] ? 'var(--primary-color)' : 'var(--secondary-color)',
                                                 transition: 'background-color 0.3s ease-in-out',
                                                 cursor: 'pointer',
                                                 filter: newProf.dispo[`${jour}${periode}`] ? 'brightness(1)' : 'brightness(0.9)', // Effet subtil
                                             }}
                                             onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'} // Effet hover lumineux
                                             onMouseLeave={(e) => e.currentTarget.style.filter = newProf.dispo[`${jour}${periode}`] ? 'brightness(1)' : 'brightness(0.9)'}
                                             onClick={() => toggleDispo(jour, periode)}
                                         />
                                         
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                    <div className='button-add'>
                        <button onClick={addProf}>Ajouter</button>
                    </div>

                </div>

                <div className="container-list">

                    <h3>Liste des professeurs</h3>
                    <ul>
                        {profs.map((prof) => (
                            <ProfItem key={prof.id} prof={prof} onDelete={deleteProf} />
                        ))}
                    </ul>



                </div>
            </div>
        </div>
    );
}

export default Profs2;