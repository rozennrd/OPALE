import { pool } from '../../database/pool';
import { LocalisationDAO } from '../dao/localisationDao';

export const localisationRepository = {
    // Récupère toutes les localisations
    async getAll(): Promise<LocalisationDAO[]> {
        const sql = 'SELECT * FROM localisation ORDER BY id_event';
        const result = await pool.query(sql);
        return result.rows as LocalisationDAO[];
    },

    // Récupère les localisations d'un événement
    async getByEventId(id_event: string): Promise<LocalisationDAO[]> {
        const sql = 'SELECT * FROM localisation WHERE id_event = $1';
        const result = await pool.query(sql, [id_event]);
        return result.rows as LocalisationDAO[];
    },

    // Récupère les localisations d'une salle
    async getBySalleId(id_salle: string): Promise<LocalisationDAO[]> {
        const sql = 'SELECT * FROM localisation WHERE id_salle = $1';
        const result = await pool.query(sql, [id_salle]);
        return result.rows as LocalisationDAO[];
    },

    // Récupère une localisation spécifique par ID
    async getById(id: string): Promise<LocalisationDAO | null> {
        const sql = 'SELECT * FROM localisation WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    },

    // Vérifie si une localisation existe déjà (même salle + même event)
    async exists(id_salle: string, id_event: string): Promise<boolean> {
        const sql = 'SELECT id FROM localisation WHERE id_salle = $1 AND id_event = $2';
        const result = await pool.query(sql, [id_salle, id_event]);
        return result.rows.length > 0;
    },

    // Insère une nouvelle localisation
    async insert(id_salle: string, id_event: string): Promise<string> {
        const sql = `
      INSERT INTO localisation (id_salle, id_event)
      VALUES ($1, $2)
      RETURNING id
    `;
        const result = await pool.query(sql, [id_salle, id_event]);
        return result.rows[0].id;
    },

    // Met à jour une localisation existante
    async update(id: string, id_salle: string, id_event: string): Promise<boolean> {
        const sql = `
      UPDATE localisation
      SET id_salle = $1,
          id_event = $2
      WHERE id = $3
    `;
        const result = await pool.query(sql, [id_salle, id_event, id]);
        return (result.rowCount ?? 0) > 0;
    },

    // Supprime une localisation par son ID
    async deleteById(id: string): Promise<boolean> {
        const sql = 'DELETE FROM localisation WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    },

    // Supprime toutes les localisations d'un événement
    async deleteByEventId(id_event: string): Promise<number> {
        const sql = 'DELETE FROM localisation WHERE id_event = $1';
        const result = await pool.query(sql, [id_event]);
        return result.rowCount ?? 0;
    },

    // Supprime toutes les localisations d'une salle
    async deleteBySalleId(id_salle: string): Promise<number> {
        const sql = 'DELETE FROM localisation WHERE id_salle = $1';
        const result = await pool.query(sql, [id_salle]);
        return result.rowCount ?? 0;
    },
};