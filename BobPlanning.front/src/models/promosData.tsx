export interface Period {
    dateDebutP: string;
    dateFinP: string;
}

interface Promo {
    Name: string;
    Nombre: number;
    Periodes: Period[];
}

interface PromosData {
    DateDeb: string;
    DateFin: string;
    Promos: Promo[];
}

export default PromosData;