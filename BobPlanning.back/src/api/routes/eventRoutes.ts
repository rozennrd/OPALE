import { Router } from "express";
import { eventController } from "../controllers/eventController";
import authJwt from "../../middleware/authJwt";

const router = Router();

router.get('/getAllEvents', authJwt.verifyToken, eventController.getAllEvents);
router.get('/getEventById/:id', authJwt.verifyToken, eventController.getEventById);
router.post('/addEvent', authJwt.verifyToken, eventController.addEvent);
router.put('/updateEvent/:id', authJwt.verifyToken, eventController.updateEvent);
router.delete('/deleteEvent/:id', authJwt.verifyToken, eventController.deleteEvent);
router.get('/getExceptionalEvents', authJwt.verifyToken, eventController.getExceptionalEvents);
router.post('/getEventByPromo', authJwt.verifyToken, eventController.getEventsByPromoAndTypes);
router.get('/getEventsMacro', authJwt.verifyToken, eventController.getEventsMacro);

export default router;
