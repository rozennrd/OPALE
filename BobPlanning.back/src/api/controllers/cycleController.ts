// api/controllers/cycleController.ts
import { Request, Response } from "express";
import { cycleService } from "../../domain/services/cycleService";

export const cycleController = {
  async getCycles(req: Request, res: Response): Promise<void> {
    try {
      const cycles = await cycleService.getCycles();
      res.status(200).json(cycles);
      return;
    } catch (err: any) {
      console.error("Error getCycles:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  },

  async getCycleTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await cycleService.getCycleTypes();
      res.status(200).json(types);
      return;
    } catch (err: any) {
      console.error("Error getCycleTypes:", err);
      res.status(500).json({ error: err.message });
      return;
    }
  },

  async getCycleById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.query.id);
      if (!id) {
        res.status(400).json({ message: "Veuillez passer un id en paramètre." });
        return;
      }

      const cycle = await cycleService.getCycleById(id);
      res.status(200).json(cycle);
      return;
    } catch (err: any) {
      console.error("Error getCycleById:", err);
      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async addCycle(req: Request, res: Response): Promise<void> {
    try {
      const { nom, type } = req.body;

      if (!nom || !type) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      const result = await cycleService.addCycle({ nom, type });
      res.status(201).json({ message: "Cycle ajouté avec succès", insertedId: result.id });
      return;
    } catch (err: any) {
      console.error("Error addCycle:", err);
      const status = err.statusCode ?? 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async updateCycle(req: Request, res: Response): Promise<void> {
    try {
      const { id, nom, type } = req.body;

      if (!id || !nom || !type) {
        res.status(400).json({ message: "Tous les champs sont requis." });
        return;
      }

      await cycleService.updateCycle({ id: String(id), nom, type });
      res.status(200).json({ message: "Cycle mis à jour avec succès" });
      return;
    } catch (err: any) {
      console.error("Error updateCycle:", err);
      const status = err.statusCode ?? 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },

  async deleteCycle(req: Request, res: Response): Promise<void> {
    try {
      // (comme ton cas deleteSalle) : support body OU query pour éviter "undefined"
      const idRaw = req.body?.id ?? req.query?.id;

      if (!idRaw || typeof idRaw !== "string") {
        res.status(400).json({ message: "L'id est requis (body.id ou query.id)." });
        return;
      }

      await cycleService.deleteCycle(idRaw);
      res.status(200).json({ message: "Cycle supprimé avec succès" });
      return;
    } catch (err: any) {
      console.error("Error deleteCycle:", err);
      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },
};
