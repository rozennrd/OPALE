import { Router } from 'express';
import { localisationController } from '../controllers/localisationController';
import authJwt from '../../middleware/authJwt';

const router = Router();

router.get('/getAllLocalisations', authJwt.verifyToken, localisationController.getAllLocalisations);
router.get('/getLocalisationById/:id', authJwt.verifyToken, localisationController.getLocalisationById);
// Récupérer les salles d'un événement
router.get('/getLocalisationSallesByEventId/:id_event', authJwt.verifyToken, localisationController.getLocalisationsByEvent);
// Récupérer les événements d'une salle
router.get('/getLocalisationEventsBySalleId/:id_salle', authJwt.verifyToken, localisationController.getLocalisationsBySalle);
router.post('/addLocalisation', authJwt.verifyToken, localisationController.addLocalisation);
router.put('/updateLocalisation/:id', authJwt.verifyToken, localisationController.updateLocalisation);
router.delete('/deleteLocalisation/:id', authJwt.verifyToken, localisationController.deleteLocalisation);
// Supprimer toutes les localisations d'un événement
router.delete('/deleteLocalisationsByEvent/:id_event', authJwt.verifyToken, localisationController.deleteLocalisationsByEvent);
// Supprimer toutes les localisations d'une salle
router.delete('/deleteLocalisationsBySalle/:id_salle', authJwt.verifyToken, localisationController.deleteLocalisationsBySalle);

export default router;