export interface Heure {
  total: number;
  coursMagistral: number;
  coursInteractif: number;
  td: number;
  tp: number;
  autre: number;
}

export interface Cours {
  name: string;
  UE: string;
  heure: Heure;
}

export interface UE {
  name: string;
}

export interface MaquetteData {
  UE: UE[];
  cours: Cours[];
}
