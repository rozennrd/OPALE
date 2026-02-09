// api/routes/matiereRoutes.ts
import { Router } from "express";
import authJwt from "../../middleware/authJwt";
import { matiereController } from "../controllers/matiereController";

const router = Router();

router.get("/getMatieres", authJwt.verifyToken, matiereController.getMatieres);
router.get("/getMatiereByID", authJwt.verifyToken, matiereController.getMatiereByID);

router.post("/addMatiere", authJwt.verifyToken, matiereController.addMatiere);
router.put("/updateMatiere", authJwt.verifyToken, matiereController.updateMatiere);
router.delete("/deleteMatiere", authJwt.verifyToken, matiereController.deleteMatiere);

export default router;
