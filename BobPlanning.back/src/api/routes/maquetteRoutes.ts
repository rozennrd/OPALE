/**
 * Routes dediees a la maquette.
 *
 * Choix techniques:
 * - auth obligatoire via JWT;
 * - upload en memoire (buffer) via multer;
 * - meme nom de champ multipart pour les deux endpoints: "file".
 */
import { Router } from 'express';
import multer from 'multer';
import authJwt from '../../middleware/authJwt';
import { maquetteController } from '../controllers/maquetteController';

const router = Router();
// Les fichiers xlsx/xlsm sont traites directement en Buffer par le parser.
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/maquette/analyze',
  authJwt.verifyToken,
  upload.single('file'),
  maquetteController.analyze,
);

router.post(
  '/maquette/import',
  authJwt.verifyToken,
  upload.single('file'),
  maquetteController.import,
);

export default router;
