// data/repositories/enseignementRepository.ts
import { pool } from "../../database/pool";
import { EnseignementDAO } from "../dao/enseignementDao";

export const enseignementRepository = {
  async getAll(): Promise<EnseignementDAO[]> {
    const sql = `
      SELECT id, id_matiere, id_prof, heures_td, heures_tp, heures_projet, heures_elearning, heures_autre
      FROM enseignement
      ORDER BY id
    `;
    const result = await pool.query(sql);
    return result.rows as EnseignementDAO[];
  },

  async getById(id: string): Promise<EnseignementDAO | null> {
    const sql = `
      SELECT id, id_matiere, id_prof, heures_td, heures_tp, heures_projet, heures_elearning, heures_autre
      FROM enseignement
      WHERE id = $1
    `;
    const result = await pool.query(sql, [id]);
    return (result.rows[0] as EnseignementDAO) ?? null;
  },

  async insert(dto: Omit<EnseignementDAO, "id">): Promise<string> {
    const sql = `
      INSERT INTO enseignement (id_matiere, id_prof, heures_td, heures_tp, heures_projet, heures_elearning, heures_autre)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const result = await pool.query(sql, [dto.id_matiere, dto.id_prof, dto.heures_td, dto.heures_tp, dto.heures_projet, dto.heures_elearning, dto.heures_autre]);
    return result.rows[0].id as string;
  },

  async update(dto: EnseignementDAO): Promise<boolean> {
    const sql = `
      UPDATE enseignement
      SET id_matiere = $2,
          id_prof = $3,
          heures_td = $4,
          heures_tp = $5,
          heures_projet = $6,
          heures_elearning = $7,
          heures_autre = $8
      WHERE id = $1
    `;
    const result = await pool.query(sql, [dto.id, dto.id_matiere, dto.id_prof, dto.heures_td, dto.heures_tp, dto.heures_projet, dto.heures_elearning, dto.heures_autre]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM enseignement WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
