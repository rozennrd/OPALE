// api/controllers/salleController.ts
import { Request, Response } from "express";
import { salleService } from "../../domain/services/salleService";

export const salleController = {
  /**
   * @swagger
   * /getSallesData:
   *   get:
   *     summary: Récupérer les données des salles
   *     tags:
   *       - Salles
   *     description: Retourne toutes les données des salles disponibles.
   *     responses:
   *       200:
   *         description: Une liste d'objets contenant les informations des salles
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: integer
   *                     example: 1
   *                   name:
   *                     type: string
   *                     example: "Salle 101"
   *                   capacity:
   *                     type: integer
   *                     example: 30
   *       500:
   *         description: Une erreur est survenue
   */
  async getSallesData(req: Request, res: Response) {
    try {
      const salles = await salleService.getSalles();
      res.json(salles);
    } catch (err: any) {
      console.error("Error in getSallesData:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * @swagger
   * /setSallesData:
   *   post:
   *     summary: Ajouter une nouvelle salle
   *     tags:
   *       - Salles
   *     description: Ajoute une nouvelle salle à la base de données.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Le nom de la salle.
   *                 example: "Salle 102"
   *               capacity:
   *                 type: integer
   *                 description: La capacité maximale de la salle.
   *                 example: 25
   *     responses:
   *       201:
   *         description: Salle ajoutée avec succès.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Salle ajoutée avec succès"
   *       500:
   *         description: Erreur interne du serveur.
   */
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


  /**
   * @swagger
   * /updateSalle:
   *   put:
   *     summary: Mettre à jour une salle existante
   *     tags:
   *       - Salles
   *     description: Met à jour les informations d'une salle spécifique.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: integer
   *                 description: L'ID de la salle à mettre à jour.
   *                 example: 1
   *               name:
   *                 type: string
   *                 description: Le nouveau nom de la salle.
   *                 example: "Salle Informatique"
   *               capacity:
   *                 type: integer
   *                 description: La nouvelle capacité de la salle.
   *                 example: 40
   *     responses:
   *       200:
   *         description: Salle mise à jour avec succès.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Salle mise à jour avec succès"
   *       404:
   *         description: Salle non trouvée.
   *       500:
   *         description: Erreur interne du serveur.
   */
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
