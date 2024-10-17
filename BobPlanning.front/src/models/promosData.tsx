export interface Period {
    dateDebutP: string;
    dateFinP: string;
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