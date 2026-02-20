import { pool } from '../../database/pool';
import { SalleDAO } from '../dao/salleDao';

export const salleRepository = {
  // Récupère toutes les salles
  async getAll(): Promise<SalleDAO[]> {
    const sql = 'SELECT * FROM salle ORDER BY nom ASC';
    const result = await pool.query(sql);

    return result.rows as SalleDAO[];
  },

  // Insère une nouvelle salle
  async insert(
    nom: string,
    type: string,
    capacite: number,
    etage: number,
    description: string,
    utilisable: string
  ): Promise<string> {
    const sql = `
            INSERT INTO salle (nom, type, capacite, etage, description, utilisable)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `;

    const result = await pool.query(sql, [
      nom,
      type,
      capacite,
      etage,
      description,
      utilisable
    ]);

    return result.rows[0].id;
  },

  // Met à jour une salle existante
  async update(dto: {
    id: string;
    nom: string;
    type: string;
    capacite: number;
    etage: number;
    description: string;
    utilisable: boolean;
  }): Promise<boolean> {
    const sql = `
            UPDATE salle
            SET nom         = $1,
                capacite    = $2,
                type        = $3,
                etage       = $4,
                description = $5,
                utilisable = $6
            WHERE id = $7
        `;

    const result = await pool.query(sql, [
      dto.nom,
      dto.capacite,
      dto.type,
      dto.etage,
      dto.description,
      dto.utilisable,
      dto.id,
    ]);


    return (result.rowCount ?? 0) > 0; // true si une ligne a été modifiée
  },

  // Supprime une salle par son ID
  async deleteById(id: string): Promise<boolean> {
    const sql = `DELETE
                     FROM salle
                     WHERE id = $1`;

    const result = await pool.query(sql, [id]);

    return (result.rowCount ?? 0) > 0;
  },
};
