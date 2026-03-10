import { Router } from "express";
import authJwt from "../../middleware/authJwt";
import { promotionController } from "../controllers/promotionController";

const router = Router();

router.get("/getPromotions", authJwt.verifyToken, promotionController.getPromotions);
router.get("/getPromoById", authJwt.verifyToken, promotionController.getPromotionById);

router.post("/addPromotion", authJwt.verifyToken, promotionController.createPromotion);
router.put("/updatePromotion", authJwt.verifyToken, promotionController.updatePromotion);
router.delete("/deletePromotion", authJwt.verifyToken, promotionController.deletePromotion);

// legacy (temporaire)
router.get("/getPromosData", authJwt.verifyToken, promotionController.getLegacyPromos);

export default router;