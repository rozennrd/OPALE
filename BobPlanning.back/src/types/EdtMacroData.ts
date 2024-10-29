export interface Periode {
  DateDebutP: Date;
  DateFinP: Date;
}

export interface Promos {
  Name: string;
  i : number;
  Nombre: number;
  Periode: Periode[];
}

export interface EdtMacroData {
  DateDeb: Date;
  DateFin: Date;
  Promos: Promos[];
}