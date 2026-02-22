// data/repositories/promotionRepository.ts
import { pool } from "../../database/pool";
import { PromotionDAO } from "../dao/promotionDao";

export const promotionRepository = {
  async getAll(): Promise<PromotionDAO[]> {
    const sql = `
      SELECT p.id, p.nom, p.effectifs, p.id_cycle, p.date_start, p.date_end, c.type
      FROM promotion p
      JOIN cycle c ON p.id_cycle = c.id
    `;
    const result = await pool.query(sql);
    return result.rows;
  },

  async getById(id: string): Promise<PromotionDAO | null> {
    const sql = `
      SELECT p.id, p.nom, p.effectifs, p.id_cycle, p.date_start, p.date_end, c.type
      FROM promotion p
      JOIN cycle c ON p.id_cycle = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0] ?? null;
  },

  async insert(dto: any): Promise<string> {
    const sql = `
      INSERT INTO promotion (nom, effectifs, id_cycle, date_start, date_end)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await pool.query(sql, [
      dto.nom,
      dto.effectifs,
      dto.id_cycle,
      dto.date_start,
      dto.date_end,
    ]);
    return result.rows[0].id;
  },

  async update(dto: any): Promise<boolean> {
    const sql = `
      UPDATE promotion
      SET nom = $2, effectifs = $3, date_start = $4, date_end = $5
      WHERE id = $1
    `;
    const result = await pool.query(sql, [
      dto.id,
      dto.nom,
      dto.effectifs,
      dto.date_start,
      dto.date_end,
    ]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM promotion WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  },

  // Legacy
  async getLegacy(): Promise<any[]> {
    const sql = "SELECT nom, effectifs, date_start, date_end FROM promotion";
    const result = await pool.query(sql);
    return result.rows;
  },
};