import { pool } from '../../database/pool'
import { DisponibiliteDAO } from '../dao/disponibiliteDao'

export const disponibiliteRepository = {
    async getAll(): Promise<DisponibiliteDAO[]> {
        const sql = `
            SELECT id, id_prof, num_semaine, dispo_micro
            FROM disponibilite
            ORDER BY id_prof, num_semaine
        `
        const result = await pool.query(sql)
        return result.rows as DisponibiliteDAO[]
    },

    async getById(id: string): Promise<DisponibiliteDAO | null> {
        const sql = `
            SELECT id, id_prof, num_semaine, dispo_micro
            FROM disponibilite
            WHERE id = $1
        `
        const result = await pool.query(sql, [id])
        return (result.rows[0] as DisponibiliteDAO) ?? null
    },

    async existsByProfAndWeek(id_prof: string, num_semaine: number): Promise<boolean> {
        const sql = `
            SELECT id
            FROM disponibilite
            WHERE id_prof = $1 AND num_semaine = $2
        `
        const result = await pool.query(sql, [id_prof, num_semaine])
        return result.rows.length > 0
    },

    async existsByProfAndWeekExcludingId(
        id: string,
        id_prof: string,
        num_semaine: number,
    ): Promise<boolean> {
        const sql = `
            SELECT id
            FROM disponibilite
            WHERE id_prof = $1 AND num_semaine = $2 AND id <> $3
        `
        const result = await pool.query(sql, [id_prof, num_semaine, id])
        return result.rows.length > 0
    },

    async insert(dto: Omit<DisponibiliteDAO, 'id'>): Promise<string> {
        const sql = `
            INSERT INTO disponibilite (id_prof, num_semaine, dispo_micro)
            VALUES ($1, $2, $3)
            RETURNING id
        `
        const result = await pool.query(sql, [
            dto.id_prof,
            dto.num_semaine,
            dto.dispo_micro,
        ])
        return result.rows[0].id as string
    },

    async update(dto: DisponibiliteDAO): Promise<boolean> {
        const sql = `
            UPDATE disponibilite
            SET id_prof = $2,
                num_semaine = $3,
                dispo_micro = $4
            WHERE id = $1
        `
        const result = await pool.query(sql, [
            dto.id,
            dto.id_prof,
            dto.num_semaine,
            dto.dispo_micro,
        ])
        return (result.rowCount ?? 0) > 0
    },

    async deleteById(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM disponibilite WHERE id = $1', [
            id,
        ])
        return (result.rowCount ?? 0) > 0
    },
}
