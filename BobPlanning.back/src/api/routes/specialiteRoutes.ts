import { Router } from "express";
import { specialiteController } from "../controllers/specialiteController";
import authJwt from "../../middleware/authJwt";

const router = Router();

router.get("/getSpecialites", authJwt.verifyToken, specialiteController.getSpecialites);
router.get("/getSpecialiteByID/:id", authJwt.verifyToken, specialiteController.getSpecialiteById);
router.post("/addSpecialite", authJwt.verifyToken, specialiteController.createSpecialite);
router.put("/updateSpecialite/:id", authJwt.verifyToken, specialiteController.updateSpecialite);
router.delete("/deleteSpecialite/:id", authJwt.verifyToken, specialiteController.deleteSpecialite);

export default router;