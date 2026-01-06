// api/controllers/salleController.ts
import { Request, Response } from "express";
import { salleService } from "../../domain/services/salleService";

export const salleController = {
  async getSallesData(req: Request, res: Response) {
    try {
      const salles = await salleService.getSalles();
      res.json(salles);
    } catch (err: any) {
      console.error("Error in getSallesData:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async createSalle(req: Request, res: Response) {
    try {
      const dto = {
        nom: req.body.nom,
        type: req.body.type,
        capacite: Number(req.body.capacite),
        etage: Number(req.body.etage)
      };

      const result = await salleService.createSalle(dto);
      res.status(201).json({
        message: "Salle ajoutée avec succès",
        insertedId: result.id
      });

    } catch (err: any) {
      console.error("Error createSalle:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async updateSalle(req: Request, res: Response): Promise<void> {
    try {
      const dto = {
        id: String(req.body.id),
        nom: req.body.nom,
        type: req.body.type,
        capacite: Number(req.body.capacite),
        etage: Number(req.body.etage),
      };

      if (!dto.id || !dto.nom || !dto.type || Number.isNaN(dto.capacite) || Number.isNaN(dto.etage)) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      await salleService.updateSalle(dto);

      res.status(200).json({ message: "Salle modifiée avec succès" });
      return;

    } catch (err: any) {
      console.error("Error updateSalle:", err);

      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },
};
