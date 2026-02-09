import { PromotionDAO } from "../data/dao/promotionDao";
import { PromotionDTO } from "../domain/dto/promotionDto";

export const promotionMapper = {
  toDTO(dao: PromotionDAO): PromotionDTO {
    return {
      id: dao.id,
      nom: dao.nom,
      effectifs: dao.effectifs,
      id_cycle: dao.id_cycle,
      date_start: dao.date_start,
      date_end: dao.date_end,
      cycle_type: dao.type,
    };
  },
};
