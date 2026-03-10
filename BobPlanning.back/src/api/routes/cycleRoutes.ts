// api/routes/cycleRoutes.ts
import { Router } from "express";
import authJwt from "../../middleware/authJwt";
import { cycleController } from "../controllers/cycleController";

const router = Router();

router.get("/getCycles", authJwt.verifyToken, cycleController.getCycles);
router.get("/getCycleTypes", authJwt.verifyToken, cycleController.getCycleTypes);
router.get("/getCycleById", authJwt.verifyToken, cycleController.getCycleById);

router.post("/addCycle", authJwt.verifyToken, cycleController.addCycle);
router.put("/updateCycle", authJwt.verifyToken, cycleController.updateCycle);
router.delete("/deleteCycle", authJwt.verifyToken, cycleController.deleteCycle);

export default router;
