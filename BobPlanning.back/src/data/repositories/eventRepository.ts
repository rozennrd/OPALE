import { pool } from '../../database/pool';
import { EventDAO } from '../dao/eventDao';

export const eventRepository = {

    // Récupère tous les événements
    async getAll(): Promise<EventDAO[]> {
        const sql = `
            SELECT id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external
            FROM event
            ORDER BY datetime_start DESC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère un événement par son ID
    async getById(id: string): Promise<EventDAO | null> {
        const sql = `
            SELECT id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external
            FROM event
            WHERE id = $1
        `;
        const result = await pool.query(sql, [id]);
        return result.rows.length > 0 ? (result.rows[0] as EventDAO) : null;
    },

    // Récupère les événements exceptionnels
    async getExceptional(): Promise<EventDAO[]> {
        const sql = `
            SELECT id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external
            FROM event
            WHERE is_exceptional = TRUE
            ORDER BY datetime_start DESC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère les événements macro
    async getMacro(): Promise<EventDAO[]> {
        const sql = `
            SELECT id,
                   type,
                   nom,
                   description, 
                   num_semaine,
                   datetime_start,
                   datetime_end,
                   show_macro,
                   show_micro,
                   is_blocking,
                   is_exceptional,
                   is_external
            FROM event
            WHERE show_macro = TRUE
              AND type IN
                  ('Cours', 'Entreprise', 'Examen', 'Reunion', 'Fermeture', 'Soutenance', 'JPO', 'Stage', 'Mobilite',
                   'PFE', 'Rattrapage', 'Conference', 'Rentrée', 'Réunion parents', 'Journée Immersion', 'Concours',
                   'Salon', 'Fin des cours', 'Autre')
            ORDER BY nom ASC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère les événements par promotion et types
    async getByPromoAndTypes(promoId: string, types: string[]): Promise<EventDAO[]> {
        const sql = `
            SELECT e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                   e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
            FROM event e
            JOIN concerner c ON c.id_event = e.id
            JOIN promotion p ON p.id = c.id_promo
            WHERE p.id = $1
              AND e.type = ANY($2)
            ORDER BY e.datetime_start ASC
        `;
        const result = await pool.query(sql, [promoId, types]);
        return result.rows as EventDAO[];
    },

    // Insère un nouvel événement
    async insert(
        type: string,
        nom: string,
        description: string,
        num_semaine: number | null,
        datetime_start: Date,
        datetime_end: Date,
        show_macro: boolean,
        show_micro: boolean,
        is_blocking: boolean,
        is_exceptional: boolean,
        is_external: boolean,
        concerne?: { promotions: string[], groups: string[], specialties: string[] },
    ): Promise<string> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insert event
            const eventSql = `
            INSERT INTO event (type, nom, description, num_semaine, datetime_start, datetime_end,
                               show_macro, show_micro, is_blocking, is_exceptional, is_external)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;
            const eventResult = await client.query(eventSql, [
                type, nom, description, num_semaine, datetime_start, datetime_end,
                show_macro, show_micro, is_blocking, is_exceptional, is_external
            ]);
            const eventId = eventResult.rows[0].id;

            // Insert into concerner table
            if (concerne && concerne.promotions.length > 0) {
                for (const promoId of concerne.promotions) {
                    await client.query(
                        'INSERT INTO concerner (id_event, id_promo) VALUES ($1, $2)',
                        [eventId, promoId]
                    );
                }
            }
            if (concerne && concerne.specialties && concerne.specialties.length > 0) {
                for (const specId of concerne.specialties) {
                    await client.query(
                        'INSERT INTO concerner (id_event, id_specialite) VALUES ($1, $2)',
                        [eventId, specId]
                    );
                }
            }
            if (concerne && concerne.groups.length > 0) {
                for (const groupId of concerne.groups) {
                    await client.query(
                        'INSERT INTO concerner (id_event, id_groupe) VALUES ($1, $2)',
                        [eventId, groupId]
                    );
                }
            }

            await client.query('COMMIT');
            return eventId;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Met à jour un événement existant
    async update(
        id: string,
        type: string,
        nom: string,
        description: string,
        num_semaine: number | null,
        datetime_start: Date,
        datetime_end: Date,
        show_macro: boolean,
        show_micro: boolean,
        is_blocking: boolean,
        is_exceptional: boolean,
        is_external: boolean
    ): Promise<void> {
        const sql = `
            UPDATE event
            SET type = $1, nom = $2, description = $3, num_semaine = $4, datetime_start = $5, datetime_end = $6,
                show_macro = $7, show_micro = $8, is_blocking = $9, is_exceptional = $10, is_external = $11
            WHERE id = $12
        `;
        await pool.query(sql, [
            type,
            nom,
            description,
            num_semaine,
            datetime_start,
            datetime_end,
            show_macro,
            show_micro,
            is_blocking,
            is_exceptional,
            is_external,
            id
        ]);
    },

    // Supprime un événement
    async delete(id: string): Promise<number> {
        const sql = 'DELETE FROM event WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return result.rowCount || 0;
    },
};