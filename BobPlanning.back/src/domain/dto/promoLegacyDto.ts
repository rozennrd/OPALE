export interface PromoLegacyDTO {
  nom: string;
  effectifs: number;
  date_start: Date | null;
  date_end: Date | null;
  Periode: any[];
}

export interface PromosLegacyResponseDTO {
  date_start: string;
  date_end: string;
  Promos: PromoLegacyDTO[];
}
