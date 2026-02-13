export interface CreatePromotionDTO {
  nom: string;
  effectifs: number;
  id_cycle: string;
  date_start?: Date | null;
  date_end?: Date | null;
}
