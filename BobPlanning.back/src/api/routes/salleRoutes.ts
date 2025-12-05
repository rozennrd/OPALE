import { Router } from "express";
import { salleController } from "../controllers/salleController";
import authJwt from "../../middleware/authJwt";

const router = Router();

router.get("/getSallesData", authJwt.verifyToken, salleController.getSallesData);
router.post("/setSallesData", authJwt.verifyToken, salleController.createSalle);

export default router;
