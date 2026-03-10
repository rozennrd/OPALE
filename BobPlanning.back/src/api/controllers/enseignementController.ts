// api/controllers/enseignementController.ts
import { Request, Response } from "express";
import { enseignementService } from "../../domain/services/enseignementService";

export const enseignementController = {
  async getEnseignements(req: Request, res: Response): Promise<void> {
    try {
      const list = await enseignementService.getEnseignements();
      res.status(200).json(list);
      return;
    } catch (err: any) {
      console.error("Error getEnseignements:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  },

  async getEnseignementByID(req: Request, res: Response): Promise<void> {
    try {
      const idRaw = req.query?.id ?? req.body?.id;
      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "Veuillez passer un id (query.id)." });
        return;
      }

      const item = await enseignementService.getEnseignementById(idRaw);
      res.status(200).json(item);
      return;
    } catch (err: any) {
      console.error("Error getEnseignementByID:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async addEnseignement(req: Request, res: Response): Promise<void> {
    try {
      const result = await enseignementService.addEnseignement(req.body);
      res.status(201).json({ message: "Enseignement ajouté avec succès", insertedId: result.id });
      return;
    } catch (err: any) {
      console.error("Error addEnseignement:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async updateEnseignement(req: Request, res: Response): Promise<void> {
    try {
      await enseignementService.updateEnseignement(req.body);
      res.status(200).json({ message: "Enseignement mis à jour avec succès" });
      return;
    } catch (err: any) {
      console.error("Error updateEnseignement:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async deleteEnseignement(req: Request, res: Response): Promise<void> {
    try {
      const idRaw = req.body?.id ?? req.query?.id;
      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "L'id est requis (body.id ou query.id)." });
        return;
      }

      await enseignementService.deleteEnseignement(idRaw);
      res.status(200).json({ message: "Enseignement supprimé avec succès" });
      return;
    } catch (err: any) {
      console.error("Error deleteEnseignement:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },
};
