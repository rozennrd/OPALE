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
  type: string;
  i: number;
  periode: Periode[];
}

export interface EventMacro {
  id: string;
  type: string;
  nom: string;
  datetime_start: Date;
  datetime_end: Date;
  is_external?: boolean;
  promotions?: string[];   // ids des promos concernées. Si vide => event global
}

export interface EdtMacroData {
  DateDeb: Date;
  DateFin: Date;
  Promos: Promos[];
  EventsMacro?: EventMacro[];   // optionnel => pas de crash si absent
}