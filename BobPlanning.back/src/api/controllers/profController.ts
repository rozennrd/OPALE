import { Request, Response } from "express";
import { profService } from "../../domain/services/profService";

function validateProfDto(req: Request, res: Response) {
    const {
        nom,
        prenom,
        email,
        email_perso,
        type,
        modalite_enseignement,
        campus_origin
    } = req.body;

    if (!nom || !prenom || !type) {
        res.status(400).json({
            error: 'Les champs nom, prenom et type sont obligatoires.'
        });
        return null;
    }

    const validTypes = ['Permanent', 'Intervenant', 'Invite'];
    if (!validTypes.includes(type)) {
        res.status(400).json({
            error: `Le type doit être parmi: ${validTypes.join(', ')}`
        });
        return null;
    }

    return {
        nom,
        prenom,
        email: email || null,
        email_perso: email_perso || null,
        type,
        modalite_enseignement: modalite_enseignement || 'Présentiel',
        campus_origin: campus_origin || null,
    };
}

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
            const dto = validateProfDto(req, res);
            if (!dto) return;

            const result = await profService.createProf(dto);

            res.status(201).json({
                success: true,
                message: 'Professeur ajouté avec succès',
                insertedId: result.id
            });

        } catch (err: any) {
            console.error("Error createProf:", err);

            if (err.message.includes('uq_professeur_email')) {
                res.status(409).json({ error: 'Un professeur avec cet email existe déjà.' });
            } else if (err.message.includes('uq_professeur_email_perso')) {
                res.status(409).json({ error: 'Un professeur avec cet email personnel existe déjà.' });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async updateProf(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const dto = validateProfDto(req, res);
            if (!dto) return;

            await profService.updateProf({
                id,
                nom: dto.nom,
                prenom: dto.prenom,
                email: dto.email,
                email_perso: dto.email_perso,
                type: dto.type,
                modalite_enseignement: dto.modalite_enseignement,
                campus_origin: dto.campus_origin,
            });

            res.status(200).json({
                success: true,
                message: "Professeur modifié avec succès"
            });

        } catch (err: any) {
            console.error("Error updateProf:", err);

            if (err.message.includes('non trouvé')) {
                res.status(404).json({ error: err.message });
            } else if (err.message.includes('uq_professeur_email')) {
                res.status(409).json({ error: 'Un professeur avec cet email existe déjà.' });
            } else if (err.message.includes('uq_professeur_email_perso')) {
                res.status(409).json({ error: 'Un professeur avec cet email personnel existe déjà.' });
            } else {
                res.status(500).json({ error: err.message });
            }
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
