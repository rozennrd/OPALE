import { CycleDAO } from "../data/dao/cycleDao";
import { CycleDTO } from "../domain/dto/cycleDto";

export const cycleMapper = {
  toDTO(dao: CycleDAO): CycleDTO {
    return {
      id: dao.id,
      nom: dao.nom,
      type: dao.type,
    };
  },
};
