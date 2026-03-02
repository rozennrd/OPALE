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
   *                     type: string
   *                     format: uuid
   *                     example: "550e8400-e29b-41d4-a716-446655440000"
   *                   nom:
   *                     type: string
   *                     example: "Salle 101"
   *                   nom_complet:
   *                     type: string
   *                     nullable: true
   *                     example: "Salle 101 - Bâtiment A"
   *                   type_principal:
   *                     type: string
   *                     example: "Informatique"
   *                   types_secondaires:
   *                     type: array
   *                     nullable: true
   *                     items:
   *                       type: string
   *                     example: ["Projet", "Reunion"]
   *                   etage:
   *                     type: integer
   *                     example: 2
   *                   capacite:
   *                     type: integer
   *                     example: 30
   *                   utilisable:
   *                     type: boolean
   *                     example: true
   *                   description:
   *                     type: string
   *                     nullable: true
   *                     example: "Salle équipée de postes informatiques"
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
   *               nom:
   *                 type: string
   *                 description: Le nom de la salle.
   *                 example: "Salle 102"
   *               nom_complet:
   *                 type: string
   *                 nullable: true
   *                 description: Le nom complet de la salle.
   *                 example: "Salle 102 - Bâtiment B"
   *               type_principal:
   *                 type: string
   *                 description: Le type principal de la salle.
   *                 example: "Cours"
   *               types_secondaires:
   *                 type: array
   *                 nullable: true
   *                 description: Les types secondaires de la salle.
   *                 items:
   *                   type: string
   *                 example: ["Projet"]
   *               etage:
   *                 type: integer
   *                 description: L'étage de la salle.
   *                 example: 1
   *               capacite:
   *                 type: integer
   *                 description: La capacité maximale de la salle.
   *                 example: 25
   *               utilisable:
   *                 type: boolean
   *                 description: Indique si la salle est utilisable.
   *                 example: true
   *               description:
   *                 type: string
   *                 nullable: true
   *                 description: Description de la salle.
   *                 example: "Salle polyvalente"
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
        nom_complet: req.body.nom_complet ?? null,
        type_principal: req.body.type_principal,
        types_secondaires: req.body.types_secondaires ?? null,
        etage: Number(req.body.etage),
        capacite: Number(req.body.capacite),
        utilisable: typeof req.body.utilisable === 'boolean' ? req.body.utilisable : req.body.isAvailable,
        description: req.body.description ?? null,
      };

      if (!dto.nom || !dto.type_principal || Number.isNaN(dto.capacite) || Number.isNaN(dto.etage)) {
        res.status(400).json({ message: "Champs invalides pour la création de salle." });
        return;
      }

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
   *                 type: string
   *                 format: uuid
   *                 description: L'ID de la salle à mettre à jour.
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               nom:
   *                 type: string
   *                 description: Le nouveau nom de la salle.
   *                 example: "Salle Informatique"
   *               nom_complet:
   *                 type: string
   *                 nullable: true
   *                 description: Le nouveau nom complet de la salle.
   *                 example: "Salle Informatique - Bâtiment C"
   *               type_principal:
   *                 type: string
   *                 description: Le type principal de la salle.
   *                 example: "Informatique"
   *               types_secondaires:
   *                 type: array
   *                 nullable: true
   *                 description: Les nouveaux types secondaires de la salle.
   *                 items:
   *                   type: string
   *                 example: ["Projet", "Reseau"]
   *               etage:
   *                 type: integer
   *                 description: Le nouvel étage de la salle.
   *                 example: 2
   *               capacite:
   *                 type: integer
   *                 description: La nouvelle capacité de la salle.
   *                 example: 40
   *               utilisable:
   *                 type: boolean
   *                 description: Indique si la salle est utilisable.
   *                 example: true
   *               description:
   *                 type: string
   *                 nullable: true
   *                 description: La nouvelle description de la salle.
   *                 example: "Salle mise à niveau en 2026"
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
        nom_complet: req.body.nom_complet ?? null,
        type_principal: req.body.type_principal,
        types_secondaires: req.body.types_secondaires ?? null,
        etage: Number(req.body.etage ?? req.body.floor),
        capacite: Number(req.body.capacite ?? req.body.capacity),
        utilisable: typeof req.body.utilisable === 'boolean' ? req.body.utilisable : req.body.isAvailable,
        description: req.body.description ?? null,
      };

      if (!dto.id || !dto.nom || !dto.type_principal || Number.isNaN(dto.capacite) || Number.isNaN(dto.etage) || typeof dto.utilisable !== 'boolean') {
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

  /**
   * @swagger
   * /deleteSalle:
   *   delete:
   *     summary: Supprimer une salle
   *     tags:
   *       - Salles
   *     description: Supprime une salle spécifique de la base de données.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: string
   *                 format: uuid
   *                 description: L'ID de la salle à supprimer.
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *     responses:
   *       200:
   *         description: Salle supprimée avec succès.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Salle supprimée avec succès"
   *       404:
   *         description: Salle non trouvée.
   *       500:
   *         description: Erreur interne du serveur.
   */
  async deleteSalle(req: Request, res: Response): Promise<void> {
    try {
      const id = req.body?.id ?? req.query?.id;

      if (!id) {
        res.status(400).json({ message: "L'id est requis." });
        return;
      }

      await salleService.deleteSalle(id);

      res.status(200).json({ message: "Salle supprimée avec succès" });
      return;

    } catch (err: any) {
      console.error("Error deleteSalle:", err);

      const status = err.statusCode === 404 ? 404 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
  },
};
