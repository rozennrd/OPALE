import { Router } from "express";
import { salleController } from "../controllers/salleController";
import authJwt from "../../middleware/authJwt";

const router = Router();

router.get("/getSallesData", authJwt.verifyToken, salleController.getSallesData);
router.post("/setSallesData", authJwt.verifyToken, salleController.createSalle);
router.post("/updateSalle", authJwt.verifyToken, salleController.updateSalle);
router.delete("/deleteSalle", authJwt.verifyToken, salleController.deleteSalle);

export default router;
