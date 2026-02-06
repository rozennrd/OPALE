export interface MatiereDTO {
  id: string;
  nom: string;
  volume_horaire: number;

  id_promo: string | null;
  id_specialite: string | null;

  semestre: number ;
  nb_partiels: number ;
  nb_eval_intermediaire: number | null;

  heures_td: number | null;
  heures_tp: number | null;
}