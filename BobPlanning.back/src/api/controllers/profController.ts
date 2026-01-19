import { Request, Response } from "express";
import { profService } from "../../domain/services/profService";

export const profController = {
    async getProfsData(req: Request, res: Response): Promise<void> {
        try {
            const profs = await profService.getProfsData();
            res.json(profs);
        } catch (err: any) {
            console.error("Error in getProfsData:", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getProfById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const prof = await profService.getProfById(id);
            res.json(prof);
        } catch (err: any) {
            console.error("Error in getProfById:", err);
            if (err.message.includes('non trouvé')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async createProf(req: Request, res: Response): Promise<void> {
        try {
            const { nom, prenom, email, type, distanciel } = req.body;

            // Validation des champs obligatoires
            if (!nom || !prenom || !type) {
                res.status(400).json({
                    error: 'Les champs nom, prenom et type sont obligatoires.'
                });
                return;
            }

            // Validation du type
            const validTypes = ['permanent', 'intervenant', 'invite'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    error: `Le type doit être parmi: ${validTypes.join(', ')}`
                });
                return;
            }

            const dto = {
                nom,
                prenom,
                email: email || null,
                type,
                distanciel: distanciel ?? false,
            };

            const result = await profService.createProf(dto);
            res.status(201).json({
                success: true,
                message: 'Professeur ajouté avec succès',
                insertedId: result.id
            });

        } catch (err: any) {
            console.error("Error createProf:", err);

            // Gestion des erreurs de contrainte d'unicité d'email
            if (err.message.includes('uq_professeur_email')) {
                res.status(409).json({
                    error: 'Un professeur avec cet email existe déjà.'
                });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async updateProf(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nom, prenom, email, type, distanciel } = req.body;

            // Validation des champs obligatoires
            if (!nom || !prenom || !type) {
                res.status(400).json({
                    error: 'Les champs nom, prenom et type sont obligatoires.'
                });
                return;
            }

            // Validation du type
            const validTypes = ['permanent', 'intervenant', 'invite'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    error: `Le type doit être parmi: ${validTypes.join(', ')}`
                });
                return;
            }

            const dto = {
                id,
                nom,
                prenom,
                email: email || null,
                type,
                distanciel: distanciel ?? false,
            };

            await profService.updateProf(dto);
            res.status(200).json({
                success: true,
                message: "Professeur modifié avec succès"
            });

        } catch (err: any) {
            console.error("Error updateProf:", err);

            if (err.message.includes('non trouvé')) {
                res.status(404).json({ error: err.message });
            } else if (err.message.includes('uq_professeur_email')) {
                res.status(409).json({
                    error: 'Un professeur avec cet email existe déjà.'
                });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    // Endpoint legacy pour compatibilité avec l'ancien code
    async setProfsData(req: Request, res: Response): Promise<void> {
        try {
            const profs = req.body;

            if (!Array.isArray(profs)) {
                res.status(400).json({ error: 'Le corps de la requête doit être un tableau.' });
                return;
            }

            const insertedIds: string[] = [];

            for (const prof of profs) {
                if (prof.id) {
                    // Mise à jour d'un prof existant
                    await profService.updateProf({
                        id: prof.id,
                        nom: prof.name || prof.nom,
                        prenom: prof.prenom || '',
                        email: prof.email || null,
                        type: prof.type,
                        distanciel: prof.distanciel ?? false,
                    });
                } else {
                    // Insertion d'un nouveau prof
                    const result = await profService.createProf({
                        nom: prof.name || prof.nom,
                        prenom: prof.prenom || '',
                        email: prof.email || null,
                        type: prof.type,
                        distanciel: prof.distanciel ?? false,
                    });
                    insertedIds.push(result.id!);
                }
            }

            res.json({
                success: true,
                message: 'Informations des professeurs mises à jour avec succès.',
                insertedIds,
            });

        } catch (err: any) {
            console.error("Error setProfsData:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    async deleteProf(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ error: 'ID du professeur est requis.' });
                return;
            }

            await profService.deleteProf(id);
            res.status(200).json({
                success: true,
                message: "Professeur supprimé avec succès."
            });

        } catch (err: any) {
            console.error("Error deleteProf:", err);

            if (err.message.includes('non trouvé')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },
};
