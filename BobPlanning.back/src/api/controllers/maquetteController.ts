/**
 * Controleur HTTP de la fonctionnalite maquette.
 *
 * Responsabilites:
 * - verifier la presence du fichier televerse;
 * - lire les hints optionnels (cycle/promotion, dryRun);
 * - deleguer la logique metier aux services maquette;
 * - normaliser les codes de retour HTTP et les messages d'erreur.
 */
import { Request, Response } from 'express';
import { maquetteAnalyzeService } from '../../maquette/services/maquetteAnalyzeService';
import { maquetteImportService } from '../../maquette/services/maquetteImportService';

/**
 * Convertit les valeurs de formulaire multipart vers un booleen.
 * Utile car multer/body-parser peuvent transmettre des chaines.
 */
const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
};

export const maquetteController = {
  /**
   * Endpoint d'analyse:
   * - parse le classeur;
   * - renvoie les metadonnees + lignes normalisees;
   * - n'ecrit rien en base.
   */
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Aucun fichier n'a ete telecharge." });
        return;
      }

      const result = await maquetteAnalyzeService.analyze(req.file.buffer, {
        cycleHint: req.body?.cycleHint,
        promotionHint: req.body?.promotionHint,
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error maquette analyze:', error);
      res.status(500).json({
        message: "Erreur lors de l'analyse de la maquette.",
        error: error?.message ?? error,
      });
    }
  },

  /**
   * Endpoint d'import:
   * - parse le classeur;
   * - insere/met a jour les matieres;
   * - cree les evenements d'examen (hors dryRun).
   */
  async import(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Aucun fichier n'a ete telecharge." });
        return;
      }

      const result = await maquetteImportService.import(req.file.buffer, {
        cycleHint: req.body?.cycleHint,
        promotionHint: req.body?.promotionHint,
        dryRun: parseBoolean(req.body?.dryRun),
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error maquette import:', error);
      res.status(500).json({
        message: "Erreur lors de l'import de la maquette.",
        error: error?.message ?? error,
      });
    }
  },
};
