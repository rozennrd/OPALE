import { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Divider, SelectChangeEvent } from '@mui/material';
import PeriodeCard from './PeriodeBox';
import PromosData from '../models/promosData';
import Promo from '../models/promosData';
import './Periodes.css';

interface PeriodeAPProps {
    promosData: PromosData;
    promoName: string;
    setPromosData: React.Dispatch<React.SetStateAction<any>>;
}

export default function Periode({ promosData, promoName, setPromosData }: PeriodeAPProps) {
    const promo = promosData.Promos?.find((promo) => promo.Name === promoName);
    const [nbrPeriode, setNbrPeriode] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periode.length || 0);
    const [Periode, setPeriode] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periode || []);

    useEffect(() => {
        if (promo) {
            setPeriode(promo.Periode);
            setNbrPeriode(promo.Periode.length);
        }
    }, [Periode,promosData]);

const handleDateChange = (index: number, value: Date) => {
    setPromosData((prevData: any) => {
        const newPromosData = { ...prevData };
        const promo = newPromosData.Promos?.find((promo: { Name: string }) => promo.Name === promoName);
        if (promo && promo.Periode[index]) {
            // Garde le format de date string
            promo.Periode[index].DateDebutP = value.toISOString().split('T')[0]; 

            // Calculer DateFinP en ajoutant le nombre de semaines
            const weeks = promo.Periode[index].nbSemaineP || 0; // Assurez-vous que nbSemaineP est défini
            const endDate = new Date(value);
            endDate.setDate(endDate.getDate() + weeks * 7); // Ajoute les semaines en jours
            promo.Periode[index].DateFinP = endDate.toISOString().split('T')[0]; // Met à jour DateFinP

        }
        return newPromosData; // Renvoie les données mises à jour
    });
};


    const handleWeeksChange = (index: number, value: number) => {
        setPromosData((prevData: any) => {
            const newPromosData = { ...prevData };
            const promo = newPromosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName);
            if (promo && promo.Periode[index]&& promo.Periode[index].DateFinP!='') {
                // Met à jour le nombre de semaines
                promo.Periode[index].nbSemaineP = value; 
                // Calculer la DateFinP en ajoutant le nombre de semaines à DateDebutP
                const startDate = new Date(promo.Periode[index].DateDebutP);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + value * 7); // Ajoute le nombre de semaines en jours
                promo.Periode[index].DateFinP = endDate.toISOString().split('T')[0]; // Enregistrer DateFinP
            }
            return newPromosData; // Renvoie les données mises à jour
        });
    };

    const dateDebutPeriode = (index: number) => {
        const dateDebut = Periode[index]?.DateDebutP;
        return dateDebut ? dateDebut : '';
    };

    const handleNbrPeriodeChange = (event: SelectChangeEvent<number>) => {
        const newNbrPeriode = event.target.value as number;
        setNbrPeriode(newNbrPeriode);
    
        // Adjust periods if the number changes
        setPromosData((prevData: any) => {
            const updatedData = { ...prevData };
            const promo = updatedData.Promos.find((p: Promo) => p.Name === promoName);
            if (promo) {
                // Create new periods array based on the new number
                const newPeriods = Array.from({ length: newNbrPeriode }, (_, i) => ({
                    DateDebutP: i < promo.Periode.length ? promo.Periode[i].DateDebutP : '', // Keep it empty for new periods
                    nbSemaineP: 4 // Default value
                }));
                promo.Periode = newPeriods; // Update the promo.Periode with newPeriods
            }
            return updatedData; // Return the updated data to trigger a re-render
        });
    };
    

    const nbSemainesBetween = (index: number) => {
        const startDate = Periode[index]?.DateDebutP;
        const endDate = Periode[index]?.DateFinP;
        return startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24 * 7)) : 0;
    };
    

    return (
        <>
            <Divider className="divider" />
            <h2>Périodes</h2>

            <div className="nombre-Periode">
                <label htmlFor="art-date" className="label-nombre-Periode">Nombre de périodes </label>
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="nb-Periode">Nombre de Periode : </InputLabel>
                    <Select
                        labelId="nb-classes"
                        id="simple-select"
                        value={nbrPeriode}
                        onChange={handleNbrPeriodeChange}
                        label="Nombre de périodes"
                    >
                        {[...Array(6).keys()].map(i => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className="periode-cards-container">
                {Periode.map((_, index) => (
                    <PeriodeCard
                        key={index}
                        index={index}
                        dateDebutPeriode={dateDebutPeriode(index)}
                        date={new Date(Periode[index].DateDebutP)}
                        RecupWeeks={nbSemainesBetween(index)}
                        handleDateChange={handleDateChange}
                        handleWeeksChange={handleWeeksChange}
                    />
                ))}
            </div>
        </>
    );
}
