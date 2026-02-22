// api/routes/enseignementRoutes.ts
import { Router } from "express";
import authJwt from "../../middleware/authJwt";
import { enseignementController } from "../controllers/enseignementController";

const router = Router();

router.get("/getEnseignements", authJwt.verifyToken, enseignementController.getEnseignements);
router.get("/getEnseignementByID", authJwt.verifyToken, enseignementController.getEnseignementByID);

router.post("/addEnseignement", authJwt.verifyToken, enseignementController.addEnseignement);
router.put("/updateEnseignement", authJwt.verifyToken, enseignementController.updateEnseignement);
router.delete("/deleteEnseignement", authJwt.verifyToken, enseignementController.deleteEnseignement);

export default router;
