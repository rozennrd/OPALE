import { Request, Response } from 'express';
import { localisationService } from '../../domain/services/localisationService';

export const localisationController = {

    async getAllLocalisations(req: Request, res: Response): Promise<void> {
        try {
            const localisations = await localisationService.getAllLocalisations();
            res.json(localisations);
        } catch (err: any) {
            console.error('Error in getAllLocalisations:', err);
            res.status(500).json({ error: err.message });
        }
    },

    async getLocalisationsByEvent(req: Request, res: Response): Promise<void> {
        try {
            const { id_event } = req.params;
            const localisations = await localisationService.getLocalisationsByEvent(id_event);
            res.json(localisations);
        } catch (err: any) {
            console.error('Error in getLocalisationsByEvent:', err);
            res.status(500).json({ error: err.message });
        }
    },

    async getLocalisationsBySalle(req: Request, res: Response): Promise<void> {
        try {
            const { id_salle } = req.params;
            const localisations = await localisationService.getLocalisationsBySalle(id_salle);
            res.json(localisations);
        } catch (err: any) {
            console.error('Error in getLocalisationsBySalle:', err);
            res.status(500).json({ error: err.message });
        }
    },

    async getLocalisationById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const localisation = await localisationService.getLocalisationById(id);
            res.json(localisation);
        } catch (err: any) {
            console.error('Error in getLocalisationById:', err);
            if (err.message.includes('non trouvée')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async addLocalisation(req: Request, res: Response): Promise<void> {
        try {
            const { id_salle, id_event } = req.body;

            if (!id_salle || !id_event) {
                res.status(400).json({
                    error: 'Les champs id_salle et id_event sont obligatoires',
                });
                return;
            }

            const result = await localisationService.addLocalisation({
                id_salle,
                id_event,
            });

            res.status(201).json({
                message: 'Localisation créée avec succès',
                data: result,
            });
        } catch (err: any) {
            console.error('Error addLocalisation:', err);
            if (err.message.includes('déjà associée')) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async updateLocalisation(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { id_salle, id_event } = req.body;

            if (!id_salle || !id_event) {
                res.status(400).json({
                    error: 'Les champs id_salle et id_event sont obligatoires',
                });
                return;
            }

            await localisationService.updateLocalisation({
                id,
                id_salle,
                id_event,
            });

            res.status(200).json({
                message: 'Localisation mise à jour avec succès',
            });
        } catch (err: any) {
            console.error('Error updateLocalisation:', err);
            const status = err.statusCode || 500;
            res.status(status).json({ error: err.message });
        }
    },

    async deleteLocalisation(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ error: "L'ID de la localisation est requis" });
                return;
            }

            await localisationService.deleteLocalisation(id);

            res.status(200).json({
                message: 'Localisation supprimée avec succès',
            });
        } catch (err: any) {
            console.error('Error deleteLocalisation:', err);
            const status = err.statusCode === 404 ? 404 : 500;
            res.status(status).json({ error: err.message });
        }
    },

    async deleteLocalisationsByEvent(req: Request, res: Response): Promise<void> {
        try {
            const { id_event } = req.params;
            const count = await localisationService.deleteLocalisationsByEvent(id_event);

            res.status(200).json({
                message: `${count} localisation(s) supprimée(s) avec succès`,
            });
        } catch (err: any) {
            console.error('Error deleteLocalisationsByEvent:', err);
            res.status(500).json({ error: err.message });
        }
    },

    async deleteLocalisationsBySalle(req: Request, res: Response): Promise<void> {
        try {
            const { id_salle } = req.params;
            const count = await localisationService.deleteLocalisationsBySalle(id_salle);

            res.status(200).json({
                message: `${count} localisation(s) supprimée(s) avec succès`,
            });
        } catch (err: any) {
            console.error('Error deleteLocalisationsBySalle:', err);
            res.status(500).json({ error: err.message });
        }
    },
};