import { Request, Response } from "express";
import { groupeService } from "../../domain/services/groupeService";

export const groupeController = {
  async getGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await groupeService.getGroups();
      res.status(200).json(groups);
      return;
    } catch (err: any) {
      console.error("Error getGroups:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  },

  async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.query.id);

      if (!id) {
        res.status(400).json({ message: "Veuillez passer un id en paramètre." });
        return;
      }

      const group = await groupeService.getGroupById(id);
      res.status(200).json(group);
      return;
    } catch (err: any) {
      console.error("Error getGroupById:", err);
      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async addGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id_promo, nom, effectifs } = req.body;

      if (!id_promo || !nom || effectifs === undefined) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      const result = await groupeService.addGroup({
        id_promo: String(id_promo),
        nom: String(nom),
        effectifs: Number(effectifs),
      });

      res.status(201).json({ message: "Groupe ajouté avec succès !" });
      return;
    } catch (err: any) {
      console.error("Error addGroup:", err);
      const status = err.statusCode === 409 ? 409 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id, id_promo, nom, effectifs } = req.body;

      if (!id || !id_promo || !nom || effectifs === undefined) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      await groupeService.updateGroup({
        id: String(id),
        id_promo: String(id_promo),
        nom: String(nom),
        effectifs: Number(effectifs),
      });

      res.status(200).json({ message: "Groupe mis à jour avec succès" });
      return;
    } catch (err: any) {
      console.error("Error updateGroup:", err);
      const status = err.statusCode === 404 ? 404 : err.statusCode === 409 ? 409 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      // support query ou body (comme tu as eu le piège "undefined")
      const idRaw = req.body?.id ?? req.query?.id;

      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "Veuillez passer un id (query.id ou body.id)." });
        return;
      }

      await groupeService.deleteGroup(idRaw);

      res.status(200).json({ message: "Groupe supprimé avec succès" });
      return;
    } catch (err: any) {
      console.error("Error deleteGroup:", err);
      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },
};
