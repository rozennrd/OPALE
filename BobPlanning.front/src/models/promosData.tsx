export interface Period {
    DateDebutP: string;
    DateFinP: string;
}

export interface Promo {
    Name: string;
    Nombre: number;
    Periode: Period[];
}

interface PromosData {
    Name: string;
    DateDeb: string;
    DateFin: string;
    Promos: Promo[];
}

export default PromosData;