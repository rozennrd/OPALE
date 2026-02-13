// domain/services/promotionService.ts
import { promotionRepository } from "../../data/repositories/promotionRepository";
import { promotionMapper } from "../../mapper/promotionMapper";
import { CreatePromotionDTO } from "../dto/createPromotionDto";
import { UpdatePromotionDTO } from "../dto/updatePromotionDto";
import { PromosLegacyResponseDTO } from "../dto/promoLegacyDto";

export const promotionService = {
  async getPromotions() {
    const daos = await promotionRepository.getAll();
    return daos.map(promotionMapper.toDTO);
  },

  async getPromotionById(id: string) {
    const promo = await promotionRepository.getById(id);
    if (!promo) {
      const e: any = new Error("Promotion non trouvée");
      e.statusCode = 404;
      throw e;
    }
    return promotionMapper.toDTO(promo);
  },

  async createPromotion(dto: CreatePromotionDTO) {
    try {
      const id = await promotionRepository.insert(dto);
      return { id };
    } catch (err: any) {
      if (err.message?.includes("foreign key")) {
        const e: any = new Error("Cycle invalide pour la promotion.");
        e.statusCode = 400;
        throw e;
      }
      throw err;
    }
  },

  async updatePromotion(dto: UpdatePromotionDTO) {
    const updated = await promotionRepository.update(dto);
    if (!updated) {
      const e: any = new Error("Promotion non trouvée");
      e.statusCode = 404;
      throw e;
    }
  },

  async deletePromotion(id: string) {
    const deleted = await promotionRepository.deleteById(id);
    if (!deleted) {
      const e: any = new Error("Promotion non trouvée");
      e.statusCode = 404;
      throw e;
    }
  },

  // Legacy isolé
  async getLegacyPromos(): Promise<PromosLegacyResponseDTO> {
    const promos = await promotionRepository.getLegacy();
    return {
      date_start: "2024-08-01",
      date_end: "2025-08-01",
      Promos: promos.map((p) => ({
        ...p,
        Periode: [],
      })),
    };
  },
};
