// data/dao/enseignementDao.ts
export interface EnseignementDAO {
  id: string;
  id_matiere: string;
  id_prof: string;
  heures_td: number;
  heures_tp: number;
  heures_projet: number;
  heures_elearning: number;
  heures_autre: number;
}
