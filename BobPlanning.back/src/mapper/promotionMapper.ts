import { PromotionDAO } from "../data/dao/promotionDao";
import { PromotionDTO } from "../domain/dto/promotionDto";
import { GroupeDTO } from "../domain/dto/groupeDto";
import { SpecialiteDTO } from "../domain/dto/specialiteDto";

export const promotionMapper = {
  toDTO(dao: PromotionDAO, groups?: GroupeDTO[], specialties?: SpecialiteDTO[]): PromotionDTO {
    return {
      id: dao.id,
      nom: dao.nom,
      effectifs: dao.effectifs,
      id_cycle: dao.id_cycle,
      date_start: dao.date_start,
      date_end: dao.date_end,
      cycle_type: dao.type,
      groups: groups ?? [],
      specialties: specialties ?? [],
    };
  },
};
