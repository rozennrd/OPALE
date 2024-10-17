export interface Heure {
  total: number;
  coursMagistral: number;
  coursInteractif: number;
  td: number;
  tp: number;
  projet: number;
}

export interface Cours {
  name: string;
  UE: string;
  semestrePeriode: string;
  heure: Heure;
}

export interface UE {
  name: string;
}

export interface MaquetteData {
  UE: UE[];
  cours: Cours[];
}
