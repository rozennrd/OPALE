// data/repositories/matiereRepository.ts
import { pool } from "../../database/pool";
import { MatiereDAO } from "../dao/matiereDao";

export const matiereRepository = {
  async getAll(): Promise<MatiereDAO[]> {
    const sql = `
      SELECT id, nom, volume_horaire, id_promo, id_specialite,
             semestre, nb_partiels, nb_eval_intermediaire, heures_td, heures_tp
      FROM matiere
      ORDER BY nom ASC
    `;
    const result = await pool.query(sql);
    return result.rows as MatiereDAO[];
  },

  async getById(id: string): Promise<MatiereDAO | null> {
    const sql = `
      SELECT id, nom, volume_horaire, id_promo, id_specialite,
             semestre, nb_partiels, nb_eval_intermediaire, heures_td, heures_tp
      FROM matiere
      WHERE id = $1
    `;
    const result = await pool.query(sql, [id]);
    return (result.rows[0] as MatiereDAO) ?? null;
  },

  async insert(dto: Omit<MatiereDAO, "id">): Promise<string> {
    const sql = `
      INSERT INTO matiere
        (nom, volume_horaire, id_promo, id_specialite, semestre,
         nb_partiels, nb_eval_intermediaire, heures_td, heures_tp)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
    `;
    const result = await pool.query(sql, [
      dto.nom,
      dto.volume_horaire,
      dto.id_promo,
      dto.id_specialite,
      dto.semestre,
      dto.nb_partiels,
      dto.nb_eval_intermediaire,
      dto.heures_td,
      dto.heures_tp,
    ]);
    return result.rows[0].id as string;
  },

  async update(dto: MatiereDAO): Promise<boolean> {
    const sql = `
      UPDATE matiere
      SET nom = $2,
          volume_horaire = $3,
          id_promo = $4,
          id_specialite = $5,
          semestre = $6,
          nb_partiels = $7,
          nb_eval_intermediaire = $8,
          heures_td = $9,
          heures_tp = $10
      WHERE id = $1
    `;
    const result = await pool.query(sql, [
      dto.id,
      dto.nom,
      dto.volume_horaire,
      dto.id_promo,
      dto.id_specialite,
      dto.semestre,
      dto.nb_partiels,
      dto.nb_eval_intermediaire,
      dto.heures_td,
      dto.heures_tp,
    ]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM matiere WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
