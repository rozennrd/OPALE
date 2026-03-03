import { pool } from '../../database/pool';
import { EventDAO } from '../dao/eventDao';

export const eventRepository = {

    // Récupère tous les événements
    async getAll(): Promise<EventDAO[]> {
        const sql = `
            SELECT e.id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external,
                   COALESCE(array_remove(array_agg(c.id_promo), NULL), '{}') AS promotions
            FROM event e
            LEFT JOIN concerner c ON c.id_event = e.id
            GROUP BY e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                     e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
            ORDER BY datetime_start DESC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère un événement par son ID
    async getById(id: string): Promise<EventDAO | null> {
        const sql = `
            SELECT e.id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external,
                   COALESCE(array_remove(array_agg(c.id_promo), NULL), '{}') AS promotions
            FROM event e
            LEFT JOIN concerner c ON c.id_event = e.id
            WHERE e.id = $1
            GROUP BY e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                     e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
        `;
        const result = await pool.query(sql, [id]);
        return result.rows.length > 0 ? (result.rows[0] as EventDAO) : null;
    },

    // Récupère les événements exceptionnels
    async getExceptional(): Promise<EventDAO[]> {
        const sql = `
            SELECT e.id, type, nom, description, num_semaine, datetime_start, datetime_end,
                   show_macro, show_micro, is_blocking, is_exceptional, is_external,
                   COALESCE(array_remove(array_agg(c.id_promo), NULL), '{}') AS promotions
            FROM event e
            LEFT JOIN concerner c ON c.id_event = e.id
            WHERE e.is_exceptional = TRUE
            GROUP BY e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                     e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
            ORDER BY datetime_start DESC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère les événements macro
    async getMacro(): Promise<EventDAO[]> {
        const sql = `
            SELECT e.id,
                   e.type,
                   e.nom,
                   e.description,
                   e.num_semaine,
                   e.datetime_start,
                   e.datetime_end,
                   e.show_macro,
                   e.show_micro,
                   e.is_blocking,
                   e.is_exceptional,
                   e.is_external,
                   COALESCE(array_remove(array_agg(c.id_promo), NULL), '{}') AS promotions
            FROM event e
            LEFT JOIN concerner c ON c.id_event = e.id
            WHERE e.show_macro = TRUE
              AND e.type IN
                  ('Cours', 'Entreprise', 'Examen', 'Reunion', 'Fermeture', 'Soutenance', 'JPO', 'Stage', 'Mobilite',
                   'PFE', 'Rattrapage', 'Conference', 'Rentrée', 'Réunion parents', 'Journée Immersion', 'Concours',
                   'Salon', 'Fin des cours', 'Autre')
            GROUP BY e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                     e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
            ORDER BY e.nom ASC
        `;
        const result = await pool.query(sql);
        return result.rows as EventDAO[];
    },

    // Récupère les événements par promotion et types
    async getByPromoAndTypes(promoId: string, types: string[]): Promise<EventDAO[]> {
        const sql = `
            SELECT e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                   e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external,
                   COALESCE(array_remove(array_agg(c2.id_promo), NULL), '{}') AS promotions
            FROM event e
            JOIN concerner c ON c.id_event = e.id
            LEFT JOIN concerner c2 ON c2.id_event = e.id
            JOIN promotion p ON p.id = c.id_promo
            WHERE p.id = $1
              AND e.type = ANY($2)
            GROUP BY e.id, e.type, e.nom, e.description, e.num_semaine, e.datetime_start, e.datetime_end,
                     e.show_macro, e.show_micro, e.is_blocking, e.is_exceptional, e.is_external
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
        is_external: boolean,
        concerne?: { promotions: string[], groups: string[], specialties: string[] },
    ): Promise<void> {
        const client = await pool.connect();

        const sql = `
            UPDATE event
            SET type = $1, nom = $2, description = $3, num_semaine = $4, datetime_start = $5, datetime_end = $6,
                show_macro = $7, show_micro = $8, is_blocking = $9, is_exceptional = $10, is_external = $11
            WHERE id = $12
        `;

        try {
            await client.query('BEGIN');

            await client.query(sql, [
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
                id,
            ]);

            if (concerne) {
                await client.query('DELETE FROM concerner WHERE id_event = $1', [id]);

                if (concerne.promotions.length > 0) {
                    for (const promoId of concerne.promotions) {
                        await client.query(
                            'INSERT INTO concerner (id_event, id_promo) VALUES ($1, $2)',
                            [id, promoId],
                        );
                    }
                }

                if (concerne.specialties.length > 0) {
                    for (const specId of concerne.specialties) {
                        await client.query(
                            'INSERT INTO concerner (id_event, id_specialite) VALUES ($1, $2)',
                            [id, specId],
                        );
                    }
                }

                if (concerne.groups.length > 0) {
                    for (const groupId of concerne.groups) {
                        await client.query(
                            'INSERT INTO concerner (id_event, id_groupe) VALUES ($1, $2)',
                            [id, groupId],
                        );
                    }
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Supprime un événement
    async delete(id: string): Promise<number> {
        const sql = 'DELETE FROM event WHERE id = $1';
        const result = await pool.query(sql, [id]);
        return result.rowCount || 0;
    },
};