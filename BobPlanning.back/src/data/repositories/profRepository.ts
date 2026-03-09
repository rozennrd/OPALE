import { pool } from '../../database/pool';
import { ProfDAO } from '../dao/profDao';

export const profRepository = {

  // Récupère tous les profs
    async getAll(): Promise<ProfDAO[]> {
        const sql = `
            SELECT id, nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin
            FROM professeur 
            ORDER BY nom ASC, prenom ASC
        `;
        const result = await pool.query(sql);
        return result.rows as ProfDAO[];
    },

  // Récupère un prof avec son ID
  async getById(id: string): Promise<ProfDAO | null> {
    const sql = `
            SELECT id, nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin
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
        email_perso: string | null,
        telephone: string | null,
        type: string,
        modalite_enseignement: string | null,
        campus_origin: string | null
    ): Promise<void> {
        const sql = `
            UPDATE professeur
            SET nom = $1, prenom = $2, email = $3, email_perso = $4, telephone = $5, type = $6, modalite_enseignement = $7, campus_origin = $8
            WHERE id = $9
        `;
    await pool.query(sql, [nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin, id]);
  },

    // Ajoute un professeur
  async insert(
      nom: string,
      prenom: string,
      email: string | null,
      email_perso: string | null,
      telephone: string | null,
      type: string,
      modalite_enseignement: string | null,
      campus_origin: string | null
  ): Promise<string> {
    const sql = `
            INSERT INTO professeur ( nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id
        `;
    const result = await pool.query(sql, [nom, prenom, email, email_perso, telephone, type, modalite_enseignement, campus_origin]);
    return result.rows[0].id;
  },


  // Suppression d'un professeur existant
  async delete(id: string): Promise<number> {
    const sql = 'DELETE FROM professeur WHERE id = $1';
    const result = await pool.query(sql, [id]);
    return result.rowCount || 0;
  },
};
