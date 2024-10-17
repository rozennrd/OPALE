import { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Divider, SelectChangeEvent } from '@mui/material';
import './Periodes.css';
import PeriodeCard from './PeriodeBox';
import PromosData from '../models/promosData';
import Promo from '../models/promosData';

interface PeriodesAPProps {
    promosData: PromosData;
    promoName: string;
    setPromosData: React.Dispatch<React.SetStateAction<any>>;
}

export default function Periodes({ promosData, promoName, setPromosData }: PeriodesAPProps) {
    const promo = promosData.Promos?.find((promo) => promo.Name === promoName);
    const [nbrPeriodes, setNbrPeriodes] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periodes.length || 0);
    const [periodes, setPeriodes] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periodes || []);

    useEffect(() => {
        if (promo) {
            setPeriodes(promo.Periodes);
            setNbrPeriodes(promo.Periodes.length);
        }
        console.log("Periodes : ", periodes);
    }, [periodes]);

    const handleDateChange = (index: number, value: Date) => {
        setPromosData((prevData: any) => {
            const newPromosData = { ...prevData };
            const promo = newPromosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName);
            if (promo && promo.Periodes[index]) {
                // Garde le format de date string
                promo.Periodes[index].dateDebutP = value.toISOString().split('T')[0]; 
                // Calculer dateFinP en ajoutant le nombre de semaines
                const weeks = promo.Periodes[index].nbSemaineP; // Assurez-vous que nbSemaineP est défini
                const endDate = new Date(value);
                endDate.setDate(endDate.getDate() + weeks * 7); // Ajoute les semaines en jours
                console.log("endDate : ", endDate," weeks : ", weeks);
                promo.Periodes[index].dateFinP = endDate.toISOString().split('T')[0]; // Met à jour dateFinP
            }
            return newPromosData; // Renvoie les données mises à jour
        });
    };

    const handleWeeksChange = (index: number, value: number) => {
        setPromosData((prevData: any) => {
            const newPromosData = { ...prevData };
            const promo = newPromosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName);
            if (promo && promo.Periodes[index]&& promo.Periodes[index].dateFinP!='') {
                // Met à jour le nombre de semaines
                promo.Periodes[index].nbSemaineP = value; 
                // Calculer la dateFinP en ajoutant le nombre de semaines à dateDebutP
                const startDate = new Date(promo.Periodes[index].dateDebutP);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + value * 7); // Ajoute le nombre de semaines en jours
                console.log("endDate : ", endDate);
                promo.Periodes[index].dateFinP = endDate.toISOString().split('T')[0]; // Enregistrer dateFinP
            }
            return newPromosData; // Renvoie les données mises à jour
        });
    };

    const dateDebutPeriode = (index: number) => {
        const dateDebut = periodes[index]?.dateDebutP;
        return dateDebut ? dateDebut : '';
    };

    const handleNbrPeriodesChange = (event: SelectChangeEvent<number>) => {
        const newNbrPeriodes = event.target.value as number;
        setNbrPeriodes(newNbrPeriodes);

        // Ajuster les périodes si le nombre change
        setPromosData((prevData: any) => {
            const updatedData = { ...prevData };
            const promo = updatedData.Promos.find((p: Promo) => p.Name === promoName);
            if (promo) {
                // Ajouter ou supprimer des périodes en fonction du nouveau nombre
                if (newNbrPeriodes > promo.Periodes.length) {
                    const newPeriods = Array.from({ length: newNbrPeriodes }, (_, i) => ({
                        dateDebutP: i < promo.Periodes.length ? promo.Periodes[i].dateDebutP : '',
                        nbSemaineP: 4 // valeur par défaut ou autre
                    }));
                    promo.Periodes = newPeriods;
                } else {
                    promo.Periodes = promo.Periodes.slice(0, newNbrPeriodes);
                }
            }
            return updatedData;
        });
    };

    const nbSemainesBetween = (index: number) => {
        const startDate = periodes[index]?.dateDebutP;
        const endDate = periodes[index]?.dateFinP;
        return startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24 * 7)) : 0;
    };

    return (
        <>
            <Divider className="divider" />
            <h2>Périodes</h2>

            <div className="nombre-periodes">
                <label htmlFor="art-date" className="label-nombre-periodes">Nombre de périodes </label>
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="nb-periodes">Nombre de periodes : </InputLabel>
                    <Select
                        labelId="nb-classes"
                        id="simple-select"
                        value={nbrPeriodes}
                        onChange={handleNbrPeriodesChange}
                        label="Nombre de périodes"
                    >
                        {[...Array(6).keys()].map(i => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className="periode-cards-container">
                {periodes.map((_, index) => (
                    <PeriodeCard
                        key={index}
                        index={index}
                        dateDebutPeriode={dateDebutPeriode(index)}
                        date={new Date(periodes[index].dateDebutP)}
                        RecupWeeks={nbSemainesBetween(index)}
                        handleDateChange={handleDateChange}
                        handleWeeksChange={handleWeeksChange}
                    />
                ))}
            </div>
        </>
    );
}
