import { Request, Response } from "express";
import { matiereService } from "../../domain/services/matiereService";

export const matiereController = {
  async getMatieres(req: Request, res: Response): Promise<void> {
    try {
      const matieres = await matiereService.getMatieres();
      res.status(200).json(matieres);
      return;
    } catch (err: any) {
      console.error("Error getMatieres:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  },

  async getMatiereByID(req: Request, res: Response): Promise<void> {
    try {
      // support query ou body si besoin (mais GET = query généralement)
      const idRaw = req.query?.id ?? req.body?.id;
      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "Veuillez passer un id (query.id)." });
        return;
      }

      const matiere = await matiereService.getMatiereById(idRaw);
      res.status(200).json(matiere);
      return;
    } catch (err: any) {
      console.error("Error getMatiereByID:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async addMatiere(req: Request, res: Response): Promise<void> {
    try {
      const result = await matiereService.addMatiere(req.body);
      res.status(201).json({ message: "Matière ajoutée avec succès", insertedId: result.id });
      return;
    } catch (err: any) {
      console.error("Error addMatiere:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async updateMatiere(req: Request, res: Response): Promise<void> {
    try {
      await matiereService.updateMatiere(req.body);
      res.status(200).json({ message: "Matière mise à jour avec succès" });
      return;
    } catch (err: any) {
      console.error("Error updateMatiere:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },

  async deleteMatiere(req: Request, res: Response): Promise<void> {
    try {
      // IMPORTANT: DELETE via Postman est souvent body JSON -> support body + query
      const idRaw = req.body?.id ?? req.query?.id;
      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "L'id est requis (body.id ou query.id)." });
        return;
      }

      await matiereService.deleteMatiere(idRaw);
      res.status(200).json({ message: "Matière supprimée avec succès" });
      return;
    } catch (err: any) {
      console.error("Error deleteMatiere:", err);
      res.status(err.statusCode ?? 500).json({ error: err.message });
      return;
    }
  },
};
