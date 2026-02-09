import { Router } from "express";
import authJwt from "../../middleware/authJwt";
import { groupeController } from "../controllers/groupeController";

const router = Router();

router.get("/getGroups", authJwt.verifyToken, groupeController.getGroups);
router.get("/getGroupById", authJwt.verifyToken, groupeController.getGroupById);

router.post("/addGroup", authJwt.verifyToken, groupeController.addGroup);
router.put("/updateGroup", authJwt.verifyToken, groupeController.updateGroup);
router.delete("/deleteGroup", authJwt.verifyToken, groupeController.deleteGroup);

export default router;
