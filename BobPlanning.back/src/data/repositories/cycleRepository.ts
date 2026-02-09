import { pool } from "../../database/pool";
import { CycleDAO } from "../dao/cycleDao";

export const cycleRepository = {
  async getAll(): Promise<CycleDAO[]> {
    const sql = "SELECT id, nom, type FROM cycle ORDER BY nom ASC";
    const result = await pool.query(sql);
    return result.rows as CycleDAO[];
  },

  async getById(id: string): Promise<CycleDAO | null> {
    const sql = "SELECT id, nom, type FROM cycle WHERE id = $1";
    const result = await pool.query(sql, [id]);
    return result.rows[0] ?? null;
  },

  async getTypes(): Promise<{ type: string }[]> {
    const sql = "SELECT unnest(enum_range(NULL::type_cycle)) AS type";
    const result = await pool.query(sql);
    return result.rows as { type: string }[];
  },

  async insert(nom: string, type: string): Promise<string> {
    const sql = "INSERT INTO cycle (nom, type) VALUES ($1, $2) RETURNING id";
    const result = await pool.query(sql, [nom, type]);
    return result.rows[0].id as string;
  },

  async update(id: string, nom: string, type: string): Promise<boolean> {
    const sql = "UPDATE cycle SET nom = $2, type = $3 WHERE id = $1";
    const result = await pool.query(sql, [id, nom, type]);
    return (result.rowCount ?? 0) > 0;
  },

  async deleteById(id: string): Promise<boolean> {
    const sql = "DELETE FROM cycle WHERE id = $1";
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
