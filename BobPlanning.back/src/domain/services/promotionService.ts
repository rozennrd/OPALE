// domain/services/promotionService.ts
import { promotionRepository } from "../../data/repositories/promotionRepository";
import { groupeRepository } from "../../data/repositories/groupeRepository";
import { specialiteRepository } from "../../data/repositories/specialiteRepository";
import { promotionMapper } from "../../mapper/promotionMapper";
import { groupeMapper } from "../../mapper/groupeMapper";
import { specialiteMapper } from "../../mapper/specialiteMapper";
import { CreatePromotionDTO } from "../dto/createPromotionDto";
import { UpdatePromotionDTO } from "../dto/updatePromotionDto";
import { PromosLegacyResponseDTO } from "../dto/promoLegacyDto";

export const promotionService = {
  async getPromotions() {
    const daos = await promotionRepository.getAll();
    
    // Fetch groups and specialties for each promotion
    const promotionsWithDetails = await Promise.all(
      daos.map(async (dao) => {
        const [groupDaos, specialtyDaos] = await Promise.all([
          groupeRepository.getByPromotionId(dao.id),
          specialiteRepository.getByPromotionId(dao.id),
        ]);
        
        const groups = groupDaos.map(groupeMapper.toDTO);
        const specialties = specialtyDaos.map(specialiteMapper.toDTO);
        
        return promotionMapper.toDTO(dao, groups, specialties);
      })
    );
    
    return promotionsWithDetails;
  },

  async getPromotionById(id: string) {
    const promo = await promotionRepository.getById(id);
    if (!promo) {
      const e: any = new Error("Promotion non trouvée");
      e.statusCode = 404;
      throw e;
    }
    
    // Fetch groups and specialties for this promotion
    const [groupDaos, specialtyDaos] = await Promise.all([
      groupeRepository.getByPromotionId(id),
      specialiteRepository.getByPromotionId(id),
    ]);
    
    const groups = groupDaos.map(groupeMapper.toDTO);
    const specialties = specialtyDaos.map(specialiteMapper.toDTO);
    
    return promotionMapper.toDTO(promo, groups, specialties);
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
