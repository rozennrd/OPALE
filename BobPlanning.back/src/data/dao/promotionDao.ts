export interface PromotionDAO {
  id: string;
  nom: string;
  effectifs: number;
  id_cycle: string;
  date_start: Date | null;
  date_end: Date | null;
  type?: string; // jointure cycle
}
