// api/controllers/promotionController.ts
import { Request, Response } from "express";
import { promotionService } from "../../domain/services/promotionService";

export const promotionController = {
  async getPromotions(req: Request, res: Response): Promise<void> {
    try {
      res.json(await promotionService.getPromotions());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPromotionById(req: Request, res: Response): Promise<void> {
    try {
      res.json(await promotionService.getPromotionById(String(req.body?.id)));
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async createPromotion(req: Request, res: Response): Promise<void> {
    try {
      const { nom, effectifs, id_cycle, date_start, date_end } = req.body;

      if (!nom || typeof nom !== "string" || nom.trim() === "") {
        res.status(400).json({ message: "Le nom de la promotion est obligatoire." });
        return;
      }

      const result = await promotionService.createPromotion({
        nom: nom.trim(),
        effectifs: Number(effectifs),
        id_cycle,
        date_start,
        date_end,
      });

      res.status(201).json({
        message: "Promotion ajoutée avec succès",
        insertedId: result.id,
      });
      return;

    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async updatePromotion(req: Request, res: Response): Promise<void> {
    try {
      await promotionService.updatePromotion(req.body);
      res.json({ message: "Promotion mise à jour avec succès" });
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async deletePromotion(req: Request, res: Response): Promise<void> {
    try {
      await promotionService.deletePromotion(String(req.body?.id));
      res.json({ message: "Promotion supprimée avec succès" });
    } catch (err: any) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  },

  async getLegacyPromos(req: Request, res: Response): Promise<void> {
    res.json(await promotionService.getLegacyPromos());
  },
};
