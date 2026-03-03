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
    nom_complet: string | null,
    type_principal: string,
    types_secondaires: string[] | null,
    etage: number,
    capacite: number,
    utilisable: boolean,
    description: string | null,
  ): Promise<string> {
    const sql = `
            INSERT INTO salle (nom, nom_complet, type_principal, types_secondaires, etage, capacite, utilisable, description)
            VALUES ($1, $2, $3, $4::type_salle[], $5, $6, $7, $8) RETURNING id
        `;

    const result = await pool.query(sql, [
      nom,
      nom_complet,
      type_principal,
      types_secondaires,
      etage,
      capacite,
      utilisable,
      description,
    ]);

    return result.rows[0].id;
  },

  // Met à jour une salle existante
  async update(dto: {
    id: string;
    nom: string;
    nom_complet?: string | null;
    type_principal: string;
    types_secondaires?: string[] | null;
    etage: number;
    capacite: number;
    utilisable: boolean;
    description?: string | null;
  }): Promise<boolean> {
    const sql = `
            UPDATE salle
            SET nom         = $1,
                nom_complet = $2,
                type_principal = $3,
                types_secondaires = $4::type_salle[],
                etage       = $5,
                capacite    = $6,
                utilisable  = $7,
                description = $8
            WHERE id = $9
        `;

    const result = await pool.query(sql, [
      dto.nom,
      dto.nom_complet ?? null,
      dto.type_principal,
      dto.types_secondaires ?? null,
      dto.etage,
      dto.capacite,
      dto.utilisable,
      dto.description ?? null,
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
