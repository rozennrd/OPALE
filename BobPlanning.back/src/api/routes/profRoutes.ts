import { Router } from "express";
import { profController } from "../controllers/profController";
import authJwt from "../../middleware/authJwt";

const router = Router();

router.get("/getProfsData", authJwt.verifyToken, profController.getProfsData);
router.get("/getProfById/:id", authJwt.verifyToken, profController.getProfById);
router.put("/updateProf/:id", authJwt.verifyToken, profController.updateProf);
router.post("/addProf", authJwt.verifyToken, profController.createProf);
router.delete("/deleteProf/:id", authJwt.verifyToken, profController.deleteProf);

export default router;
