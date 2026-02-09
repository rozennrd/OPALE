import { pool } from '../../database/pool';
import { SpecialiteDAO } from '../dao/specialiteDao';

export const specialiteRepository = {

    // Récupère toutes les spécialités
    async getAll(): Promise<SpecialiteDAO[]> {
        const sql = `
            SELECT id, id_groupe, id_promo, nom, effectifs
            FROM specialite
            ORDER BY nom ASC
        `;
        const result = await pool.query(sql);
        return result.rows as SpecialiteDAO[];
    },

    // Récupère une spécialité par son ID
    async getById(id: string): Promise<SpecialiteDAO | null> {
        const sql = `
            SELECT id, id_groupe, id_promo, nom, effectifs
            FROM specialite
            WHERE id = $1
        `;
        const result = await pool.query(sql, [id]);
        return result.rows.length > 0 ? (result.rows[0] as SpecialiteDAO) : null;
    },

    // Ajoute une spécialité
    async insert(
        id_groupe: string | null,
        id_promo: string | null,
        nom: string,
        effectifs: number
    ): Promise<string> {
        const sql = `
            INSERT INTO specialite (id_groupe, id_promo, nom, effectifs)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const result = await pool.query(sql, [id_groupe, id_promo, nom, effectifs]);
        return result.rows[0].id;
    },

    // Met à jour une spécialité existante
    async update(
        id: string,
        id_groupe: string | null,
        id_promo: string | null,
        nom: string,
        effectifs: number
    ): Promise<void> {
        const sql = `
            UPDATE specialite
            SET id_groupe = $1, id_promo = $2, nom = $3, effectifs = $4
            WHERE id = $5
        `;
        await pool.query(sql, [id_groupe, id_promo, nom, effectifs, id]);
    },

    // Supprime une spécialité
    async delete(id: string): Promise<number> {
        const sql = 'DELETE FROM specialite WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return result.rowCount || 0;
    },
};