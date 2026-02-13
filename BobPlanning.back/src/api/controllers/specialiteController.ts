import { Request, Response } from "express";
import { specialiteService } from "../../domain/services/specialiteService";

function validateSpecialiteDto(req: Request, res: Response) {
    const { id_groupe, id_promo, nom, effectifs } = req.body;

    if (!nom || !effectifs) {
        res.status(400).json({
            error: 'Les champs nom et effectifs sont obligatoires.'
        });
        return null;
    }

    if (effectifs < 0) {
        res.status(400).json({
            error: 'Le champ effectifs doit être un nombre positif.'
        });
        return null;
    }

    return {
        id_groupe: id_groupe || null,
        id_promo: id_promo || null,
        nom,
        effectifs,
    };
}

export const specialiteController = {
    async getSpecialites(req: Request, res: Response): Promise<void> {
        try {
            const specialites = await specialiteService.getSpecialites();
            res.json(specialites);
        } catch (err: any) {
            console.error("Error in getSpecialites:", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getSpecialiteById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const specialite = await specialiteService.getSpecialiteById(id);
            res.json(specialite);
        } catch (err: any) {
            console.error("Error in getSpecialiteById:", err);
            if (err.message.includes('non trouvée')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async createSpecialite(req: Request, res: Response): Promise<void> {
        try {
            const dto = validateSpecialiteDto(req, res);
            if (!dto) return;

            const result = await specialiteService.createSpecialite(dto);

            res.status(201).json({
                success: true,
                message: 'Spécialité ajoutée avec succès.',
                insertedId: result.id
            });

        } catch (err: any) {
            console.error("Error createSpecialite:", err);

            if (err.message.includes('uq_specialite_nom_groupe')) {
                res.status(409).json({ error: 'Une spécialité avec ce nom existe déjà dans ce groupe.' });
            } else if (err.message.includes('fk_specialite_groupe')) {
                res.status(400).json({ error: 'Le groupe spécifié n\'existe pas.' });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async updateSpecialite(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
           const dto = validateSpecialiteDto(req, res);
           if (!dto) return;

            await specialiteService.updateSpecialite({
                id,
                id_groupe: dto.id_groupe,
                id_promo: dto.id_promo,
                nom: dto.nom,
                effectifs: dto.effectifs,
            });

            res.status(200).json({
                success: true,
                message: "Spécialité modifiée avec succès."
            });

        } catch (err: any) {
            console.error("Error updateSpecialite:", err);

            if (err.message.includes('non trouvée')) {
                res.status(404).json({ error: err.message });
            } else if (err.message.includes('uq_specialite_nom_groupe')) {
                res.status(409).json({ error: 'Une spécialité avec ce nom existe déjà dans ce groupe.' });
            } else if (err.message.includes('fk_specialite_groupe')) {
                res.status(400).json({ error: 'Le groupe spécifié n\'existe pas.' });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },

    async deleteSpecialite(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ error: 'ID de la spécialité est requis.' });
                return;
            }

            await specialiteService.deleteSpecialite(id);
            res.status(200).json({
                success: true,
                message: "Spécialité supprimée avec succès."
            });

        } catch (err: any) {
            console.error("Error deleteSpecialite:", err);

            if (err.message.includes('non trouvée')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    },
};