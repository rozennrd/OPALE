// data/repositories/groupRepository.ts
import { pool } from "../../database/pool";
import { GroupeDAO } from "../dao/groupeDao";

export const groupeRepository = {
  async getAll(): Promise<GroupeDAO[]> {
    const sql = "SELECT id, id_promo, nom, effectifs FROM groupe ORDER BY id;";
    const result = await pool.query(sql);
    return result.rows as GroupeDAO[];
  },

  async getById(id: string): Promise<GroupeDAO | null> {
    const sql = "SELECT id, id_promo, nom, effectifs FROM groupe WHERE id = $1;";
    const result = await pool.query(sql, [id]);
    return result.rows[0] ?? null;
  },

  async insert(dto: { id_promo: string; nom: string; effectifs: number }): Promise<string> {
    const sql = `
      INSERT INTO groupe (id_promo, nom, effectifs)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await pool.query(sql, [dto.id_promo, dto.nom, dto.effectifs]);
    return result.rows[0].id as string;
  },

  async update(dto: { id: string; id_promo: string; nom: string; effectifs: number }): Promise<boolean> {
    const sql = `
      UPDATE groupe
      SET id_promo = $2, nom = $3, effectifs = $4
      WHERE id = $1
    `;
    const result = await pool.query(sql, [dto.id, dto.id_promo, dto.nom, dto.effectifs]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const sql = "DELETE FROM groupe WHERE id = $1";
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
