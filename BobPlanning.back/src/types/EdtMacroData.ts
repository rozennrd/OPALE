export interface Periode {
  DateDebutP: Date;
  DateFinP: Date;
  type: string;
}

export interface Promos {
  id: string;
  nom: string;
  effectifs: number;
  id_cycle: string;
  date_start: Date;
  date_end: Date;
  i: number;
  periode: Periode[];
}

export interface EdtMacroData {
  DateDeb: Date;
  DateFin: Date;
  Promos: Promos[];
}