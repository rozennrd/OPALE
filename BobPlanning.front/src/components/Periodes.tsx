import { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Divider, SelectChangeEvent } from '@mui/material';
import './Periodes.css';
import PeriodeCard from './PeriodeBox';
import PromosData from '../models/promosData';
import Period from '../models/promosData';

interface PeriodesAPProps {
    promosData: PromosData;
    promoName: string;
    setPromosData: React.Dispatch<React.SetStateAction<any>>;
}

export default function Periodes({ promosData, promoName, setPromosData }: PeriodesAPProps) {
    const [nbrPeriodes, setNbrPeriodes] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periodes.length || 0);
    const [periodes, setPeriodes] = useState(promosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName)?.Periodes || []);

    useEffect(() => {
        console.log("Periodes : ", periodes);
    }, [periodes]);

    const handleDateChange = (index: number, value: string) => {
        setPromosData((prevData: any) => {
            const newPromosData = { ...prevData };
            const promo = newPromosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName);
            if (promo && promo.Periodes[index]) {
                promo.Periodes[index].dateDebutP = new Date(value).toISOString().split('T')[0];
            }
            setPeriodes(promo.Periodes); // Met à jour les périodes dans l'état local
            return newPromosData;
        });
    };

    const handleWeeksChange = (index: number, value: number) => {
        setPromosData((prevData: any) => {
            const newPromosData = { ...prevData };
            const promo = newPromosData.Promos?.find((promo: { Name: string; }) => promo.Name === promoName);
            if (promo && promo.Periodes[index]) {
                promo.Periodes[index].nbSemaineP = value;
            }
            setPeriodes(promo.Periodes); // Met à jour les périodes dans l'état local
            return newPromosData;
        });
    };

    const nbSemaineBetween = (index: number) => {
        const periode = periodes[index];
        const dateDebutP = periode?.dateDebutP;
        const dateFinP = periode?.dateFinP;

        if (dateDebutP && dateFinP) {
            const dateDebut = new Date(dateDebutP).getTime();
            const dateFin = new Date(dateFinP).getTime();
            return Math.abs((dateFin - dateDebut) / (1000 * 60 * 60 * 24 * 7)); // Prend la différence absolue
        }
        return 0;
    };

    const dateDebutPeriode = (index: number) => {
        const dateDebut = periodes[index]?.dateDebutP;
        return dateDebut ? new Date(dateDebut) : new Date();
    };

    const handleNbrPeriodesChange = (event: SelectChangeEvent<number>) => {
        const newNbrPeriodes = event.target.value as number;
        setNbrPeriodes(newNbrPeriodes);

        // Ajuster les périodes si le nombre change
        setPeriodes((prevPeriodes) => {
            if (newNbrPeriodes > prevPeriodes.length) {
                // Ajouter des périodes si le nombre augmente
                const newPeriodes = [
                    ...prevPeriodes,
                    ...Array(newNbrPeriodes - prevPeriodes.length).fill({ dateDebutP: '', dateFinP: '', nbSemaineP: 4 }),
                ];
                return newPeriodes;
            } else {
                // Réduire le nombre de périodes si le nombre diminue
                return prevPeriodes.slice(0, newNbrPeriodes);
            }
        });
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
                        nbSemainePeriode={nbSemaineBetween(index)}
                        date={new Date(periodes[index].dateDebutP)}
                        weeks={nbSemaineBetween(index)}
                        handleDateChange={handleDateChange}
                        handleWeeksChange={handleWeeksChange}
                    />
                ))}
            </div>
        </>
    );
}
