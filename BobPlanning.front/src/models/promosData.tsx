export interface Period {
    DateDebutP: string;
    DateFinP: string;
}

/*export interface Promo {
    nom: string;
    effectifs: number;
    Periode: Period[];
}*/

interface PromosData {
    nom: string;
    effectifs: number;
    date_start: string;
    date_end: string;
}

export default PromosData;