import { pool } from '../../database/pool';
import { ProfDAO } from '../dao/profDao';

export const profRepository = {

  // Récupère tous les profs
    async getAll(): Promise<ProfDAO[]> {
        const sql = `
            SELECT id, nom, prenom, email, type, distanciel 
            FROM professeur 
            ORDER BY nom ASC, prenom ASC
        `;
        const result = await pool.query(sql);
        return result.rows as ProfDAO[];
    },

  // Récupère un prof avec son ID
  async getById(id: string): Promise<ProfDAO | null> {
    const sql = `
            SELECT id, nom, prenom, email, type, distanciel 
            FROM professeur 
            WHERE id = $1
        `;
    const result = await pool.query(sql, [id]);
    return result.rows.length > 0 ? (result.rows[0] as ProfDAO) : null;
  },

  // Met à jour les informations d'un professeur existant
  async update(
      id: string,
      nom: string,
      prenom: string,
      email: string | null,
      type: string,
      distanciel: boolean
  ): Promise<void> {
    const sql = `
            UPDATE professeur 
            SET nom = $1, prenom = $2, email = $3, type = $4, distanciel = $5 
            WHERE id = $6
        `;
    await pool.query(sql, [nom, prenom, email, type, distanciel, id]);
  },


  // Ajoute un professeur
  async insert(
      nom: string,
      prenom: string,
      email: string | null,
      type: string,
      distanciel: boolean
  ): Promise<string> {
    const sql = `
            INSERT INTO professeur (nom, prenom, email, type, distanciel) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id
        `;
    const result = await pool.query(sql, [nom, prenom, email, type, distanciel]);
    return result.rows[0].id;
  },


  // Suppression d'un professeur existant
  async delete(id: string): Promise<number> {
    const sql = 'DELETE FROM professeur WHERE id = $1';
    const result = await pool.query(sql, [id]);
    return result.rowCount || 0;
  },
};
