export interface Cours {
  matiere: string;
  heureDebut: string;
  heureFin: string;
  professeur: string;
  salleDeCours: string;
}

export interface Semaine {
  jour: string;
  enCours: boolean;
  message: string;
  cours: Cours[];
}

export interface Promo {
  name: string;
  semaine: Semaine[];
}

export interface EdtMicro {
  dateDebut: string;
  promos: Promo[];
}