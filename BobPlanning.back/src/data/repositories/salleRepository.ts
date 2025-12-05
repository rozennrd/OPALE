import { pool } from "../../database/pool";
import { SalleDAO } from "../dao/salleDao";

export const salleRepository = {
  // Récupère toutes les salles
  async getAll(): Promise<SalleDAO[]> {
    const sql = "SELECT * FROM salle ORDER BY nom ASC";
    const result = await pool.query(sql);

    return result.rows as SalleDAO[];
  },

  // Insère une nouvelle salle
  async insert(
    nom: string,
    type: string,
    capacite: number,
    etage: number
  ): Promise<string> {
    const sql = `
      INSERT INTO salle (nom, type, capacite, etage)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await pool.query(sql, [
      nom,
      type,
      capacite,
      etage
    ]);

    return result.rows[0].id;
  }
};