export interface Heure {
  total: number;
  totalAvecProf: number;
  coursMagistral: number;
  coursInteractif: number;
  td: number;
  tp: number;
  projet: number;
  elearning: number;
}

export interface Cours {
  name: string;
  UE: string;
  semestre: number[];
  periode: number[];
  heure: Heure;
}

export interface UE {
  name: string;
}

export interface MaquetteData {
  UE: UE[];
  cours: Cours[];
}
